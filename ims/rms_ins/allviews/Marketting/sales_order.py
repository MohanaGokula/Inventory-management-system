from rest_framework import viewsets,status
from rms_ins.models import *
from rms_ins.serializers import *
from rms_ins.utils import *
from rest_framework.response import Response
from django.contrib.auth.models import User
from rms_ins.permissions import CheckPermission
from django.db.models import F
from rest_framework.decorators import action
from datetime import datetime
from django.http.response import Http404
from rms_ins.exceptions import (EntityNotFoundException, DataValidationException)
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
import json
from django.template.loader import get_template
from io import BytesIO
from xhtml2pdf import pisa
from django.core.mail import EmailMessage
from ims.settings import EMAIL_HOST_USER
import smtplib

def is_approval_settings(company_id,order_amount,advance_amount,credit_limit):
    try:
        # print(company_id,order_amount,advance_amount,credit_limit,"company_id,order_amount,advance_amount,credit_limit")
        ApprSetting=approval_setting_master.objects.filter(voucher_type='sales_order')
        if ApprSetting:
            # print("ApprSetting exists")
            p=approval_setting_master.objects.get(voucher_type='sales_order',entity_company_id = company_id)
            # print("appr object",p)
            is_appr_needed = p.is_appr_needed
            is_so_wait_on_save = p.is_so_wait_on_save
            conditions_for_so_waiting = p.conditions_for_so_waiting
            if is_appr_needed == 0:
                is_approved = 1
            else:
                print("yes approval needed...")
                if is_so_wait_on_save == 1:
                    is_approved = 0
                else:
                    # print(conditions_for_so_waiting,"ConditionsForSOWaiting")
                    # print(type(conditions_for_so_waiting),"type(ConditionsForSOWaiting)")
                    conditions_list=conditions_for_so_waiting.split(",")
                    # print(type(conditions_list),"type_conditions_list")
                    status_list=[]
                    for c in conditions_list:
                        # print(c,"label")
                        if (c == "advance_amount"):#"SO Advance Amt <= 0"):
                            if float(advance_amount) <= 0:
                                appr_status = "Waiting"
                                status_list.append(appr_status)
                            else:
                                appr_status= "Approved"
                                status_list.append(appr_status)
                        if (c == "credit_limit"):#"SO Customers Credit limit < SO TotalAmt"):
                            if float(credit_limit) < float(order_amount):
                                appr_status = "Waiting"
                                status_list.append(appr_status)
                            else:
                                appr_status= "Approved"
                                status_list.append(appr_status)
                    print(status_list,"status_list")
                    if "Waiting" in status_list:
                        is_approved = 0
                    else:
                        is_approved = 1
            print(is_approved,"is_approved")
            return is_approved
        else:
            print("no ApprSetting")
            raise DataValidationException('Create entry in approval settings form for voucher type sales order.',code = 409)
    except ObjectDoesNotExist:
        raise DataValidationException('Create entry in approval settings form for voucher type sales order for this company.',code = 409)
    except approval_setting_master.MultipleObjectsReturned as e:
        raise DataValidationException(str(e),code=409)
    
def send_email(company_id,order_no,prefix):
    try:
        ApprSetting=approval_setting_master.objects.filter(voucher_type='sales_order')
        if ApprSetting:
            print("ApprSetting exists")
            p=approval_setting_master.objects.get(voucher_type='sales_order',entity_company_id = company_id)
            print("appr object",p)
            is_mail_needed = p.is_mail_needed
            mail_ids = p.mail_ids
            if is_mail_needed == 1 and mail_ids:
                print(mail_ids,"mail_ids")
                mail_ids_list = mail_ids.split(",") 
                print(mail_ids_list,"Mail_ids_list")
                print(type(mail_ids_list),"type(Mail_ids_list)")
                template = get_template('report/sales_order_pdf_email.html')
                hdr = entity_order_master.objects.get(entity_company_id__id = company_id,order_no = order_no,prefix=prefix)
                # print(hdr,"hdr")
                so_master = sales_order_master.objects.get(entity_order_id = hdr.id)
                company_detail = entity_company_detail.objects.get(entity_id = company_id)
                consignee_detail = entity_consignee_detail.objects.get(entity_id = hdr.entity_consignee_id)
                customer_detail = entity_customer_detail.objects.get(entity_id= hdr.entity_id)
                items = entity_order_detail.objects.filter(entity_order_id = hdr)
                # print(items,"items")
                context={'items':items,'hdr':hdr,'so_master':so_master,'company_detail':company_detail,
                'consignee_detail':consignee_detail,'customer_detail':customer_detail}
                html=template.render(context)
                result = BytesIO()
                pdf = pisa.pisaDocument(BytesIO(html.encode("ISO-8859-1")), result)
                pdf = result.getvalue()
                # print(pdf,"pdf")
                filename='SALESORDER' + '.pdf'
                mail_subject='Salesorder'
                email=EmailMessage('Salesorder waiting for approval',  'https://litvikrmcv1.litvik.in/', EMAIL_HOST_USER, mail_ids_list)
                # print("mailids_list")
                email.attach(filename,pdf,'application/pdf')
                email.send(fail_silently= False)
                print("emailsend")
            else:
                print("NO MAIL NEEDED")
    except ObjectDoesNotExist:
        raise DataValidationException('Create entry in approval settings form for voucher type sales order for this company.',code = 409)
    except approval_setting_master.MultipleObjectsReturned as e:
        raise DataValidationException(str(e),code=409)

def dmx_and_wrk_schedule_response(sales_order_list,form_name):
    # print(sales_order_list,"sales_order_list in common response fn")
    # print(form_name,"form_name")
    for i in sales_order_list.copy():
        # print(i,"i in sales order_list ")
        i['status'] =  convert_status(i['status'])
        i['is_advance_payment'] =  convert_status(i['is_advance_payment'])
        i['is_tax_included'] =  convert_status(i['is_tax_included'])
        i['order_date'] = i['order_date'].strftime("%d-%m-%Y")
        i['validity_date'] = i['validity_date'].strftime("%d-%m-%Y")
        eo_master = entity_order_master.objects.get(id = i['id'])
        consignee = entity_consignee_detail.objects.get(entity_id = eo_master.entity_consignee_id)
        customer = entity_customer_detail.objects.get(entity_id = consignee.entity_customer_id)
        if eo_master.receipt:
            i['receipt'] = {'id':eo_master.receipt.id,'receipt_no':eo_master.receipt.receipt_no,
            'prefix':eo_master.receipt.prefix,
            'receipt_date':eo_master.receipt.receipt_date.strftime("%d-%m-%Y")}
        else:
            i['receipt'] = {'id': None ,'receipt_no':None,'prefix':None,'receipt_date':None}
        if eo_master.enquiry_id:
            i['quotation'] = {'id': eo_master.enquiry_id.id,
            'quotation_no': eo_master.enquiry_id.ref_no,
            'prefix': eo_master.enquiry_id.prefix,
            'quotation_date': eo_master.enquiry_id.ref_date.strftime("%d-%m-%Y")
        }
        else:
            i['quotation'] = {'id': None ,'quotation_no':None,'prefix':None,'quotation_date':None}
        i['company'] =  {
                "id": eo_master.entity_company_id.id,
                "name": eo_master.entity_company_id.entity_name
            }
        i['consignee'] =  {
                "id":  eo_master.entity_consignee_id.id,
                "name": eo_master.entity_consignee_id.entity_name,
                "project_name":consignee.project_name,
                "customer": {
                    "id": consignee.entity_customer_id.id,
                    "name": consignee.entity_customer_id.entity_name,
                    "salesrep":{
                        "id": customer.entity_salesrep_id.id,
                        "name":customer.entity_salesrep_id.entity_name
                    }
                }
            }
        so_master = sales_order_master.objects.get(entity_order_id = i['id'])
        so_master_serializer = SalesOrderMasterSerializer(so_master)
        i['purchase_order_no'] = so_master_serializer.data['po_no']
        i['purchase_order_date'] = so_master_serializer.data['po_dt']
        i['purchase_order_file'] = so_master_serializer.data['po_file']
        i['delivery_date'] = so_master_serializer.data['delivery_dt']
        i['tax_exemption_no'] = so_master_serializer.data['tax_exemption_no']
        if form_name == "work_schedule":
            i['order_list'] = list(eo_master.entity_order_detail_set.filter(balance_qty__gt = 0).order_by('id').values('id','quantity',
            'rate','delivery_mode','user_remarks','amount','tax','concrete_structure'))#,product__category_detail__entity_name = 'FINISHED GOODS'
        # elif  form_name == "design_mix":
        #     i['order_list'] = list(eo_master.entity_order_detail_set.filter(is_designmix_prepared = 0).order_by('id').values('id','quantity',
        #     'rate','delivery_mode','user_remarks','amount','tax','concrete_structure'))#,product__category_detail__entity_name = 'FINISHED GOODS'
        product_category_list = []
        for o in i['order_list']:
            eo_detail = entity_order_detail.objects.get(id = o['id'])
            product_category_list.append(eo_detail.product.category_detail.entity_name)
            o['concrete_structure'] = {'id': eo_detail.concrete_structure.id,'name': eo_detail.concrete_structure.entity_name}
            o['tax'] = {'id':eo_detail.tax.id,'name':eo_detail.tax.name}
            o['delivered_qty'] = eo_detail.delivered_qty
            o['scheduled_qty'] = eo_detail.scheduled_qty
            o['product'] = {'id':eo_detail.product.id,
                'name':eo_detail.product.name,
                'quantity': eo_detail.product.quantity,
                'user_remarks':eo_detail.product.user_remarks,
                'status': convert_status(eo_detail.product.status),
                'category': {
                    "id": eo_detail.product.category_detail.id,
                    "name": eo_detail.product.category_detail.entity_name
                },
                'unit': {
                    "id": eo_detail.product.unit.id,
                    "name": eo_detail.product.unit.name,
                    "symbol": eo_detail.product.unit.symbol
                }
                }
        print(product_category_list,"product_category_list")
        if not('FINISHED GOODS' in product_category_list):
            # print(i,"i to be delete")
            sales_order_list.remove(i)
            # print(sales_order_list,"sales_order_list")
    return sales_order_list

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = entity_order_master.objects.all()
    serializer_class = EntityOrderMasterSerializer
    permission_classes =[CheckPermission]
    required_perms = {
         'GET': ['rmc.view_sales_order_master'],
         'POST': ['rmc.add_sales_order_master'],
         'PUT': ['rmc.change_sales_order_master'],
         'DELETE': ['rmc.delete_sales_order_master']
    }
    for_tracking={'content_type':"SALES ORDER FORM",'module_name':"MARKETTING"}
    
    @action(detail=False)
    def sales_order_number(self,request):
        try:
            query_date = self.request.query_params.get('sales_order_date')
            print("sales_order_date",query_date,type(query_date))
            query_1 = entity_order_master.objects.last()#.filter(status = 1)
            query_2 = entity_order_master.objects.values("order_no")
            print(query_1,"query1")
            print(query_2,"query_2")
            needed_params = {'query_date':query_date,'query_1':query_1,'voucher_type':'sales_order','query_2':query_2,
            'date_field_name':'order_date','slno_field_name':'order_no','form_name':"Sales order",'date_name':"Sales order date",
            'exception':EntityNotFoundException,'plant_id':'','query_3':''}
            result = get_slno_prefix(needed_params)
            return Response({'sales_order_no':result['sl_no'],'prefix':result['prefix']},status = status.HTTP_200_OK)
        except ValidationError as e:
            raise DataValidationException(detail=(str(e)),exception=e)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            # print(self.request.data,"self.request.data initial")
            data =self.request.data
            data._mutable = True # Make mutable true to enable editing in querydict .
            verify_eo_master(data) # To verify whether entity order master table data are valid.
            query_1 = entity_order_master.objects.last()#.filter(status = 1)
            query_2 = entity_order_master.objects.values("order_no")
            # print(query_1,"query1 create")
            # print(query_2,"query_2 create")
            needed_params = {'query_date':data['order_date'],'query_1':query_1,'voucher_type':'sales_order','query_2':query_2,
            'date_field_name':'order_date','slno_field_name':'order_no','form_name':"Sales order",'date_name':"Sales order date",
            'exception':DataValidationException,'plant_id':'','query_3':''}
            result = get_slno_prefix(needed_params) #To get the slno and prefix
            # print(result,"result")
            if (data['order_no'] != result['sl_no']):
                data['order_no'] = result['sl_no']
            if (data['prefix'] != result['prefix']):
                data['prefix'] = result['prefix']
            serializer.is_valid(raise_exception=True)
            # print(data,type(data),"data after eom validation")
            so_serializer = SalesOrderMasterSerializer(data=data)
            so_serializer.is_valid(raise_exception=True)
            if not data['order_list']:
                raise DataValidationException('Order_list must not be empty.',code = 400) 
            order_list =  json.dumps(data['order_list'])
            # print(order_list,type(order_list),"OL and its type1")
            order_list = json.loads(order_list)
            # print(order_list,type(order_list),"OL and its type2")
            if not(order_list[0] == '[' and order_list[-1] == ']'):
                raise DataValidationException('Order_list must be a List.',code = 400) 
            order_list = eval(order_list)
            # print(order_list,type(order_list),"OL and its type3")
            if type(order_list) is not list:
                raise DataValidationException('order_list must be a list.',code = 400) 
            elif len(order_list) == 0:
                raise DataValidationException('order_list must not be empty.',code = 409)
            else:
                verify_eo_detail(order_list,data)
                total_order_amount = sum(float(d.get('amount', 0)) for d in order_list)
                # print(total_order_amount,type(total_order_amount),"total_order_amount")
                # print(data['order_amount'],type(data['order_amount']),"order_amount")
                if float(data['order_amount']) != float(total_order_amount):
                   raise DataValidationException("Total sales order amount must be equal to sum of product amounts.",code = 409)
            so_detail_serializer = EntityOrderDetailSerializer(data=order_list,many = True)
            so_detail_serializer.is_valid(raise_exception=True)
            # print(so_detail_serializer.data,"so_detail_serializer")
            customer = entity_consignee_detail.objects.get(entity_id = data['consignee_id']).entity_customer_id.id
            credit_limit = entity_customer_detail.objects.get(entity_id = customer).credit_limit
            # print(data,"data credit_limit")
            if ((data['is_advance_payment'] == 'true') and data['receipt']):
                # print("receipt if")
                advance_amount =  receipt_master.objects.get(id =data['receipt']).receipt_amount #
            else:
                # print("receipt else")
                advance_amount = 0
            is_approved = is_approval_settings(data["entity_company_id"],data['order_amount'],advance_amount,credit_limit)
            # print(is_approved,"is_approved create")
            a=serializer.save(created_by=self.request.user,entity_id = entity_master.objects.get(id = customer),is_approved=is_approved)
            som = so_serializer.save(created_by=self.request.user,entity_order_id=a)
            # print(so_detail_serializer,"so_detail_serializer")
            n=so_detail_serializer.save(created_by=self.request.user,entity_order_id=a)
            created_id_list=[x.id for x in n]
            created_ids=','.join(map(str,created_id_list))
            for_tracking={'id':"entity_order_master_id : "+ str(a.id) +" ,sales_order_master_id : "+str(som.id) + ", entity_order_detail_id : "+(created_ids) ,
            'sl_no':a.order_no,'content_type':"SALES ORDER FORM",
            'action':"CREATE",'module_name':"MARKETTING",'plant_name':entity_master.objects.get(id=a.entity_company_id.id)}#created_ids
            tracking=handle_tracking(self.request,for_tracking) # To make an entry in User tracking table for tracking the user action. 
            send_email(a.entity_company_id.id,a.order_no,a.prefix)
            return Response(status=status.HTTP_201_CREATED, headers=get_success_headers(serializer.data))
        except TypeError as e:
            raise DataValidationException(str(e),code=400)
        except NameError as e:
            raise DataValidationException(str(e)+ ' order_list must be a list of dictionaries.')
        except KeyError as e:
            raise DataValidationException("KeyError " + str(e) ,code=400)
        except ValueError as e:
            raise DataValidationException(str(e),code=400)
        except ObjectDoesNotExist as e:
            raise EntityNotFoundException(detail=str(e))
        except ValidationError as e:
            raise DataValidationException(detail=(str(e)),exception=e)
        except smtplib.SMTPAuthenticationError as e:
            raise DataValidationException("please check whether username and password of email settings  in settings.py file are correct.",code=500)
    
    def list(self, request):
        try:
            company_id = self.request.query_params.get('company_id')
            print(company_id,"company_id")
            if company_id is not None:
                sales_order_list = entity_order_detail.objects.filter(entity_order_id__entity_company_id = company_id).order_by('id').values('id','product','quantity','rate'
                ,'amount','is_approved')
            else:
                sales_order_list = entity_order_detail.objects.all().order_by('id').values('id','product','quantity','rate'
                ,'amount','is_approved')
            for i in sales_order_list:
                detail = entity_order_detail.objects.get(id= i['id'])
                so_master = sales_order_master.objects.get(entity_order_id = detail.entity_order_id)
                if so_master.po_dt :
                    po_dt = so_master.po_dt.strftime("%d-%m-%Y")
                else:
                    po_dt = so_master.po_dt
                eo_master = detail.entity_order_id
                # print(eo_master,"eo_master.values()")
                i['company']= {'id':eo_master.entity_company_id.id,'name':eo_master.entity_company_id.entity_name}
                consignee = entity_consignee_detail.objects.get(entity_id = eo_master.entity_consignee_id)
                customer = entity_customer_detail.objects.get(entity_id = consignee.entity_customer_id.id)
                i['consignee'] ={'id':consignee.entity_id.id,'name':consignee.entity_id.entity_name,'project_name':consignee.project_name,
                'customer': {'id':customer.entity_id.id,'name':customer.entity_id.entity_name,
                'salesrep':{'id':customer.entity_salesrep_id.id,'name':customer.entity_salesrep_id.entity_name}}}
                product = product_master.objects.get(id = i['product'])
                i['order_no'] = eo_master.order_no
                i['order_time'] = eo_master.order_time
                i['order_date'] = eo_master.order_date.strftime("%d-%m-%Y")
                i['prefix'] = eo_master.prefix
                i['purchase_order_no'] = so_master.po_no
                i['purchase_order_date'] = po_dt
                i['id'] = eo_master.id
                i['product'] = {'id':product.id,
                                'name':product.name,
                                'quantity': product.quantity,
                                'user_remarks':product.user_remarks,
                                'status': convert_status(product.status),
                                'category': {
                                    "id": product.category_detail.id,
                                    "name": product.category_detail.entity_name
                                },
                                'unit': {
                                    "id": product.unit.id,
                                    "name": product.unit.name,
                                    "symbol": product.unit.symbol
                                }
                                }
                i['delivery_mode'] = detail.delivery_mode
                i['status'] = convert_status(eo_master.status)
                i['is_approved'] = convert_status(eo_master.is_approved)
                i['scheduled_qty'] = detail.scheduled_qty 
                i['supplied_qty'] = detail.delivered_qty #have to complete after completing dc 
                i['balance_qty'] = detail.balance_qty
            return Response({'sales_order_list':sales_order_list},status=status.HTTP_200_OK)
        except ValueError as e:
            raise DataValidationException(str(e),code = 400)
        except ObjectDoesNotExist as e:
            raise EntityNotFoundException(detail=str(e))

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            entity_order_master_id=instance.id
            order_no = instance.order_no
            company = instance.entity_company_id.id
            # instance.delete()
            a = entity_order_detail.objects.filter(entity_order_id=entity_order_master_id)
            # print(a,"a")
            b = sales_order_master.objects.get(entity_order_id=entity_order_master_id)
            so_master_id = b.id
            # b.delete()
            entity_order_detail_ids=','.join(map(str,(list(a.values_list('id',flat=True)))))
            for i in a:
                # print(i,"todelete id")
                i.delete() 
            b.delete()
            instance.delete()
            for_tracking={'id':"entity_order_master_id : "+ str(entity_order_master_id) +", sales_order_master_id : "+ str(so_master_id) + ", entity_order_detail_id : "+ entity_order_detail_ids,
            'sl_no':order_no,'content_type':"SALES ORDER FORM",
            'action':"DELETE",'module_name':"MARKETTING",'plant_name':entity_master.objects.get(id= company)}
            tracking=handle_tracking(self.request,for_tracking)
            return Response({'message':"Successfully Deleted"},status=status.HTTP_200_OK)
        except Http404 as e:
            raise EntityNotFoundException(detail=f'Sales order with id [{kwargs["pk"]}] not found.')
        except ObjectDoesNotExist as e:
            raise EntityNotFoundException(detail=str(e))

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            consignee = entity_consignee_detail.objects.get(entity_id = instance.entity_consignee_id)
            customer = entity_customer_detail.objects.get(entity_id = consignee.entity_customer_id)
            # print(customer,"customer")
            if instance.receipt:
                receipt = {'id':instance.receipt.id,'receipt_no':instance.receipt.receipt_no,'prefix':instance.receipt.prefix,
                'receipt_date':instance.receipt.receipt_date.strftime("%d-%m-%Y")}
            else:
                receipt = {'id': None ,'receipt_no':None,'prefix':None,'receipt_date':None}
            if instance.enquiry_id:
                quotation = {
                "id": instance.enquiry_id.id,
                "quotation_no": instance.enquiry_id.ref_no,
                "prefix": instance.enquiry_id.prefix,
                "quotation_date": instance.enquiry_id.ref_date.strftime("%d-%m-%Y")
            }
            else:
                quotation = {'id': None ,'quotation_no':None,'prefix':None,'quotation_date':None}
            so_master = sales_order_master.objects.get(entity_order_id = instance)
            so_master_serializer = SalesOrderMasterSerializer(so_master)
            details = list(instance.entity_order_detail_set.all().order_by('id').values('id','quantity',
                    'rate','delivery_mode','user_remarks','amount'))
            for  d in details:
                detail = entity_order_detail.objects.get(id=d['id'])
                d['concrete_structure'] = {'id': detail.concrete_structure.id,'name': detail.concrete_structure.entity_name}
                d['product'] = {'id':detail.product.id,
                                'name':detail.product.name,
                                'quantity': detail.product.quantity,
                                'user_remarks':detail.product.user_remarks,
                                'status': convert_status(detail.product.status),
                                'category': {
                                    "id": detail.product.category_detail.id,
                                    "name": detail.product.category_detail.entity_name
                                },
                                'unit': {
                                    "id": detail.product.unit.id,
                                    "name": detail.product.unit.name,
                                    "symbol": detail.product.unit.symbol
                                }
                                }
                d['tax'] = {'id':detail.tax.id,'name':detail.tax.name}
                d['delivered_qty'] = detail.delivered_qty
                d['scheduled_qty'] = detail.scheduled_qty
                d['balance_qty'] = detail.balance_qty
            content={
                    "id":serializer.data['id'],
                    "company": {
                        "id": instance.entity_company_id.id,
                        "name": instance.entity_company_id.entity_name
                    },
                    "consignee": {
                        "id":  instance.entity_consignee_id.id,
                        "name": instance.entity_consignee_id.entity_name,
                        "project_name":consignee.project_name,
                        "customer": {
                            "id": consignee.entity_customer_id.id,
                            "name": consignee.entity_customer_id.entity_name,
                            "salesrep":{
                                "id": customer.entity_salesrep_id.id,
                                "name":customer.entity_salesrep_id.entity_name
                            }
                        }
                    },
                    "order_no": serializer.data['order_no'],
                    "order_time": serializer.data['order_time'],
                    "order_date": instance.order_date.strftime("%d-%m-%Y"),
                    "prefix": serializer.data['prefix'],
                    "order_amount":serializer.data['order_amount'],
                    "quotation":quotation,
                    "purchase_order_no":so_master_serializer.data['po_no'],
                    "purchase_order_date":so_master.po_dt.strftime("%d-%m-%Y"),
                    "purchase_order_file":so_master_serializer.data['po_file'],
                    "delivery_date":so_master.delivery_dt.strftime("%d-%m-%Y"),
                    "tax_exemption_no":so_master_serializer.data['tax_exemption_no'],
                    "pay_terms":serializer.data['pay_terms'],
                    "transport_mode":serializer.data['transport_mode'],
                    "is_tax_included":serializer.data['is_tax_included'],
                    "user_remarks":serializer.data['user_remarks'],
                    "is_advance_payment":serializer.data['is_advance_payment'],
                    "validity_date":instance.validity_date.strftime("%d-%m-%Y"),
                    "receipt" : receipt,
                    "status": serializer.data['status'],
                    "order_list": details
                    }
            return Response(content,status=status.HTTP_200_OK)
        except Http404 as e:
            raise EntityNotFoundException(detail=f'Salesorder with id [{kwargs["pk"]}] not found.')
        except ObjectDoesNotExist as e:
            raise EntityNotFoundException(detail=str(e))
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            old_details_ids =list(instance.entity_order_detail_set.all().values_list('id', flat=True))
            # 'old_details_ids' is a list of this sales order's detail ids.
            # print(old_details_ids,type(old_details_ids)) 
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            # print(self.request.data,"self.request.data initial")
            data=request.data
            data._mutable = True # Make mutable true to enable editing in querydict .
            if instance.enquiry_id:
                data['quotation_id'] = instance.enquiry_id.id
            else: 
                data['quotation_id'] = ""
            # print(data,"data after enquiry")
            verify_eo_master(data) # To verify whether entity order master table data are valid.
            serializer.is_valid(raise_exception=True)
            so_master = sales_order_master.objects.get(entity_order_id = instance)
            so_serializer = SalesOrderMasterSerializer(so_master,data=data)
            so_serializer.is_valid(raise_exception=True)
            if not data['order_list']:
                raise DataValidationException('Order_list must not be empty.',code = 400) 
            order_list =  json.dumps(data['order_list'])
            # print(order_list,type(order_list),"OL and its type1")
            order_list = json.loads(order_list)
            # print(order_list,type(order_list),"OL and its type2")
            if not(order_list[0] == '[' and order_list[-1] == ']'):
                raise DataValidationException('Order_list must be a List.',code = 400) 
            order_list = eval(order_list)
            # print(order_list,type(order_list),"OL and its type3")
            if type(order_list) is not list:
                raise DataValidationException('order_list must be a list.',code = 400) 
            elif len(order_list) == 0:
                raise DataValidationException('order_list must not be empty.',code = 409)
            else:
                verify_eo_detail(order_list,data)
                total_order_amount = sum(float(d.get('amount', 0)) for d in order_list)
                # print(total_order_amount,type(total_order_amount),"total_order_amount")
                # print(data['order_amount'],type(data['order_amount']),"order_amount")
                if float(data['order_amount']) != float(total_order_amount):
                   raise DataValidationException("Total sales order amount must be equal to sum of product amounts.",code = 409)
            so_detail_serializer = EntityOrderDetailSerializer(data=order_list,many = True)
            so_detail_serializer.is_valid(raise_exception=True)
            customer = entity_consignee_detail.objects.get(entity_id = data['consignee_id']).entity_customer_id.id
            credit_limit = entity_customer_detail.objects.get(entity_id = customer).credit_limit
            # print(data,"data credit_limit update")
            if ((data['is_advance_payment'] == 'true') and data['receipt']):
                # print("receipt if update")
                advance_amount =  receipt_master.objects.get(id =data['receipt']).receipt_amount 
            else:
                # print("receipt else update")
                advance_amount = 0
            is_approved = is_approval_settings(data["entity_company_id"],data['order_amount'],advance_amount,credit_limit)
            # print(is_approved,"is_approved create")
            a=serializer.save(modified_by=self.request.user.username,entity_id = entity_master.objects.get(id = customer),is_approved = is_approved)
            som = so_serializer.save(modified_by=self.request.user.username,entity_order_id=instance)
            actions_done=''
            edited_ids_list = []
            newly_created_ids_list = []
            for i in range(len(order_list)):
                if order_list[i]['id']:
                    # print(order_list[i],float(order_list[i]['quantity']),"order_list[i]")
                    # update the detail objects with ids
                    # print(order_list[i])
                    order_detail=entity_order_detail.objects.get(id=order_list[i]['id'])
                    # print(order_detail,"order_detail")
                    #To calculate balance qty
                    dtl1=work_schedule_master.objects.filter(entity_order_detail_id__id=order_list[i]['id']).values('schedule_qty','accepted_qty','is_ws_completed')
                    if dtl1:
                        # print("if working")
                        tominus=0
                        for d in dtl1:
                            c=d.get('is_ws_completed',None)
                            # print("cu",c)
                            if c == 0:
                                tominus+=d.get('schedule_qty',None)
                                # print("tominus",tominus)
                            else:
                                tominus+=d.get('accepted_qty',None)
                                # print("tominus",tominus)
                        # print(tominus,order_list[i]['quantity'],"tominusorder_list[i]['quantity']")
                        balance_qty=float(order_list[i]['quantity'])-tominus
                        print(balance_qty,"balance_qty")
                    else:
                        # print("ifempty")
                        balance_qty =  float(order_list[i]['quantity'])
                    order_detail_serializer = EntityOrderDetailSerializer(order_detail,data=order_list[i])
                    order_detail_serializer.is_valid(raise_exception=True)
                    order_detail_serializer.save(modified_by=self.request.user.username,balance_qty=balance_qty)
                    edited_ids_list.append(int(order_list[i]['id']))
                else:
                    # print("else")
                    # create new detail objects
                    detail_serializer = EntityOrderDetailSerializer(data=order_list[i])
                    detail_serializer.is_valid(raise_exception=True)
                    n= detail_serializer.save(created_by=self.request.user.username,entity_order_id=instance)
                    newly_created_ids_list.append(n.id)
                    
            if edited_ids_list:
                to_delete_ids_list = list(set(old_details_ids) - set(edited_ids_list))  
                print(to_delete_ids_list,"to_delete_ids_list",type(to_delete_ids_list))
                edited_dtl_ids = ','.join([str(elem) for elem in edited_ids_list])
                actions_done=actions_done +' '+ "EDIT" 
            else:
                edited_dtl_ids = "NO"
                to_delete_ids_list = old_details_ids
            if newly_created_ids_list:
                newly_created_ids = ','.join([str(elem) for elem in newly_created_ids_list])
                actions_done=actions_done + ', ' +"CREATE PRODUCT DETAILS during edit"
            else:
                newly_created_ids ="NO"
            deleted_ids_list = []
            if to_delete_ids_list:
                print(to_delete_ids_list,"to_delete_ip_ids_list")
                print(type(to_delete_ids_list),"type(to_delete_ip_ids_list)")
                for i in to_delete_ids_list:
                    print(i,"todelete id")
                    to_delete_id = i
                    a=entity_order_detail.objects.get(id=i)
                    a.delete()
                    deleted_ids_list.append(to_delete_id)
                deleted_ids = ','.join([str(elem) for elem in deleted_ids_list])
                actions_done=actions_done +' ,'+"DELETE PRODUCT DETAILS during edit "
            else:
                deleted_ids = "NO"
            idlist= "Edited PRODUCT DETAIL IDS:" + ' ' + edited_dtl_ids + ' ,' +  "Deleted PRODUCT DETAIL IDS:" + ' ' + deleted_ids + ' ,' +"Created PRODUCT DETAILS IDS:" + ' ' + newly_created_ids
            for_tracking={'id':"entity_order_master_id : "+ str(instance.id) + " ,sales_order_master_id : "+str(som.id) + ", entity_order_detail_id : "+ idlist,
            'sl_no':instance.order_no,'content_type':"SALES ORDER FORM",
            'action':actions_done,'module_name':"MARKETTING",'plant_name':entity_master.objects.get(id=instance.entity_company_id.id)}
            tracking=handle_tracking(self.request,for_tracking)
            send_email(instance.entity_company_id.id,instance.order_no,instance.prefix)
            queryset = self.filter_queryset(self.get_queryset())
            if queryset._prefetch_related_lookups:
                instance._prefetched_objects_cache = {}
                prefetch_related_objects([instance], *queryset._prefetch_related_lookups)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TypeError as e:
            raise DataValidationException(str(e),code=400)
        except NameError as e:
            raise DataValidationException(str(e)+ ' order_list must be a list of dictionaries.')
        except KeyError as e:
            raise DataValidationException("KeyError " + str(e) ,code=400)
        except ValueError as e:
            raise DataValidationException(str(e),code=400)
        except ObjectDoesNotExist as e:
            raise EntityNotFoundException(detail=str(e))
        except Http404 as e:
            raise EntityNotFoundException(detail=f'Salesorder with id [{kwargs["pk"]}] not found.')
        except ValidationError as e:
            raise DataValidationException(detail=(str(e)),exception=e)
        except smtplib.SMTPAuthenticationError as e:
            raise DataValidationException("please check whether username and password of email settings  in settings.py file are correct.",code=500)
    

    # @action(detail=False)
    # def design_mix(self,request):
    #     try:
    #         sales_order_list = list(entity_order_master.objects.filter(is_approved = 1,status = 1).values('id','order_no',
    #             'order_date','order_time','prefix','pay_terms','validity_date','transport_mode',
    #             'is_tax_included','user_remarks','status','is_advance_payment','order_amount'))
    #         print(sales_order_list,"sales_order_list before")
    #         sales_order_list = dmx_and_wrk_schedule_response(sales_order_list,"design_mix")
    #         return Response({'sales_order_list':sales_order_list},status=status.HTTP_200_OK)
    #     except ObjectDoesNotExist as e:
    #         raise EntityNotFoundException(detail=str(e))

    @action(detail=False)
    def work_schedule(self,request):
        try:
            today=date.today()
            sales_order_list = list(entity_order_master.objects.filter(is_approved = 1,status = 1,validity_date__gte = today).values('id','order_no',
                'order_date','order_time','prefix','pay_terms','validity_date','transport_mode',
                'is_tax_included','user_remarks','status','is_advance_payment','order_amount'))
            # print(sales_order_list,"sales_order_list before") 
            sales_order_list = dmx_and_wrk_schedule_response(sales_order_list,"work_schedule")
            return Response({'sales_order_list':sales_order_list},status=status.HTTP_200_OK)
        except ObjectDoesNotExist as e:
            raise EntityNotFoundException(detail=str(e))

    @action(detail=False,url_path="(?P<sales_order_id>[0-9]+)/products")
    def products(self,request,sales_order_id ):
        try:
            print(sales_order_id,"sales_order_id ")
            instance = entity_order_master.objects.get(id = sales_order_id)
            details = list(instance.entity_order_detail_set.all().order_by('id').values('id','quantity',
                'rate','delivery_mode','user_remarks','amount'))
            for  d in details:
                detail = entity_order_detail.objects.get(id=d['id'])
                d['concrete_structure'] = {'id': detail.concrete_structure.id,
                'name': detail.concrete_structure.entity_name}
                d['product'] = {
                                'id':detail.product.id,
                                'name':detail.product.name,
                                'quantity':detail.product.quantity,
                                'user_remarks':detail.product.user_remarks,
                                'status':convert_status(detail.product.status),
                                'category':{'id': detail.product.category_detail.id,
                                            'name': detail.product.category_detail.entity_name},
                                'unit':{'id': detail.product.unit.id,
                                        'name': detail.product.unit.name,
                                        'symbol':detail.product.unit.symbol}
                                }
                d['tax'] = {'id':detail.tax.id,'name':detail.tax.name}
                d['delivered_qty'] = detail.delivered_qty
                d['scheduled_qty'] = detail.scheduled_qty
            return Response({"sales_order_product_list": details},status=status.HTTP_200_OK)
        except ObjectDoesNotExist as e:
            raise EntityNotFoundException(detail=f'Salesorder with id [{sales_order_id}] not found.')
        except ValidationError as e:
            raise DataValidationException(detail=(str(e)),exception=e)





