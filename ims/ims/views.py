from django.contrib.auth import authenticate,login,logout
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from rest_framework.response import Response
from rms_ins.models import *
from rms_ins.utils import *
from django.contrib.auth.models import User
import pyotp
import qrcode
from io import BytesIO
import base64
from PIL import  Image ,ImageDraw
from datetime import datetime
from ipware import get_client_ip
from rms_ins.exceptions import (EntityNotFoundException, DataValidationException)
from rest_framework.exceptions import NotAuthenticated

def login_user(request,user,otp,name,latitude,longitude):
    print(user,otp,latitude,longitude,"user,otp,latitude,longitude login_user")
    login(request,user)
    token, _ = Token.objects.get_or_create(user=user)
    print(token,"token")
    is_superuser=user.is_superuser
    print(is_superuser,"is_superuser")
    if (user.is_superuser):
        result={'token': token.key,'name':name,'is_superuser':is_superuser}
    else:
        # category=user.get_all_permissions() commented on 12.01.2024
        # print(category,"category")
        category=list(user.groups.values_list('name',flat = True))
        group_permissions = []
        for group in user.groups.all():
            group_permissions.extend(group.permissions.all().values_list('codename', flat=True))
        print(group_permissions,"group_permissions")

        result={'token': token.key,'name':name,'is_superuser':is_superuser,'category':group_permissions}
    status=HTTP_200_OK
    for_tracking={'id':None,'sl_no':None,'content_type':"USER LOGIN FORM",
                'action':"USER LOGGED IN",'module_name':None,
                'plant_name':None,'latitude':latitude,'longitude':longitude}
    tracking=handle_tracking(request,for_tracking)
    return (result,status)
        
def check_mfa(request,user,otp,latitude,longitude):
        print(user,"check_mfa_user")
        print(otp,"otp_check_mfa")
        print(latitude,"check_mfa_latitude")
        print(longitude,"check_mfa_longitude")
        name=user.username
        print(name,"mfa_name")
        print(user.password,"mfa password")
        if user and user.profiles_master.is_mfa_needed == 0:
            result,status=login_user(request,user,otp,name,latitude,longitude)
        elif (not otp and user.profiles_master.otp_enabled == False):
            key = pyotp.random_base32()
            otp_base32 = base64.b32encode(key.encode()).decode()
            otp_auth_url = pyotp.totp.TOTP(otp_base32).provisioning_uri(
                name=user.email.lower(), issuer_name="Litvik Software Labs Pvt limited")
            qrcode_img = qrcode.make(otp_auth_url)
            canvas=Image.new('RGB', (qrcode_img.pixel_size, qrcode_img.pixel_size),'white')
            draw=ImageDraw.Draw(canvas)
            canvas.paste(qrcode_img)
            fname=f'qr_code-{otp_base32}.png'
            buffer=BytesIO()
            canvas.save(buffer,'PNG')
            #17.3.23
            qrcode_img.save(f"{name}.png")#can comment this line 
            #17.3.23
            img_str = base64.b64encode(buffer.getvalue()).decode()
            user.profiles_master.otp_auth_url = otp_auth_url
            user.profiles_master.otp_base32 = otp_base32
            user.save()
            result={'tfa_enabled':convert_status(user.profiles_master.otp_enabled),'username':name,'password':user.password,'otp_auth_url':user.profiles_master.otp_auth_url,
            'otp_base32':user.profiles_master.otp_base32,'img_str':img_str}
            status=HTTP_200_OK
            
        elif (not otp and user.profiles_master.otp_enabled):
            result={'tfa_enabled':convert_status(user.profiles_master.otp_enabled),'username':name,'password':user.password,'otp_auth_url':user.profiles_master.otp_auth_url,
            'otp_base32':user.profiles_master.otp_base32,'state':"have to verify otp"}
            status=HTTP_200_OK
        
        elif (otp):
            # totp = pyotp.totp.TOTP(user.new_userprofile.otp_base32)  #, interval=60
            totp = pyotp.TOTP(user.profiles_master.otp_base32)
            print(totp.verify(otp,None),"totp.verify(otp,None)")
            if not totp.verify(otp,None):
                # result={'message': "OTP is invalid.",'username':name,'password':user.password,'otp':otp}
                # status=HTTP_400_BAD_REQUEST
                # raise DataValidationException(detail="OTP is invalid.",code=400)
                raise NotAuthenticated('Incorrect one-time password.',code=401)
            else:
                user.profiles_master.otp_enabled = True
                user.profiles_master.otp_verified = True
                user.save()
                result,status=login_user(request,user,otp,name,latitude,longitude)
        return (result,status)

class Login(APIView):
    permission_classes = [AllowAny]
    for_tracking={'content_type':"USER LOGIN FORM",'module_name':None}
    def post(self, request,format=None):
        try:
            username = request.data.get("username")
            password = request.data.get("password")
            otp = request.data.get("otp",None)
            latitude = request.data.get("latitude",None)
            longitude = request.data.get("longitude",None)
            if username is None or password is None:
                # return Response({'message': 'Please provide both username and password.'},
                #                 status=HTTP_400_BAD_REQUEST)
                raise DataValidationException(detail="Please provide both username and password..",code=400)
           
            user = authenticate(username=username, password=password)
            if not user:
                # return Response({'message': 'Invalid Credentials.'},
                #                 status=HTTP_404_NOT_FOUND)
                # raise EntityNotFoundException('Invalid Credentials.',code=404)
                raise NotAuthenticated('Invalid Credentials.',code=401)
            today=datetime.today()
            print(today,"today")
            print(type(today),"typetoday")
            valid_upto_date=user.profiles_master.user_valid_upto
            print(valid_upto_date,"valid_upto_date")
            print(type(valid_upto_date),"type valid_upto_date")
            if today.date() > valid_upto_date:
                print("expired")
                # return Response({'message': "Your validity period expired on " + valid_upto_date.strftime("%d-%B-%Y") +"."},
                #                 status=HTTP_400_BAD_REQUEST)
                raise DataValidationException(detail="Your validity period expired on " + valid_upto_date.strftime("%d-%B-%Y") +".",code=403)
           
            else:
                print("not expired")
                # request.session.set_expiry(0)
                # Code to check whether location authentication is needed? 
                if (user.profiles_master.is_location_auth_needed == 1):
                    if (not (latitude or longitude)):
                        raise DataValidationException(detail="Latitude and Longitiude must not be empty.Please enable location.",code=400)
                    if (type(latitude) is not float) or (type(longitude) is not float):
                        raise DataValidationException(detail="Data type of Latitude and Longitiude must be float.",code=409)
                ip_dtl=security_policy_master.objects.all()
                if ip_dtl:
                    iplist=[]
                    for i in ip_dtl:
                        if i.ip_addr_category == 'selected' and i.status == 1:
                            iplist.append(i.ip_addr)
                        elif  i.ip_addr_category == 'all':
                            iplist.append("all")
                        else:
                            print(i.ip_addr_category,"i.ip_addr_category")
                            print(i.status,"i.Status")
                        print(iplist,"iplist")
                        if "all" in iplist:
                            print(iplist,"all are allowed")
                            result,status=check_mfa(self.request,user,otp,latitude,longitude)
                            print(result,status,"result,status")
                            return Response(result,status=status)
                        else:
                            print("allow selected ips")
                            client_ip, is_routable = get_client_ip(request)
                            print(client_ip,"client_ip")
                            if client_ip in iplist:
                                print("allowed ip")
                                result,status=check_mfa(self.request,user,otp,latitude,longitude)
                                print(result,status,"result,status")
                                return Response(result,
                                status=status)
                            else:
                                print("not allowed ip")
                                # return Response({'message': "Your IP Address " + client_ip + " is not allowed." },
                                # status=HTTP_400_BAD_REQUEST)
                                raise DataValidationException(detail="Your IP Address " + client_ip + " is not allowed." ,code=403)
           
                else:
                    result,status=check_mfa(self.request,user,otp,latitude,longitude)
                    print(result,status,"result,status")
            return Response(result,status=status)    
        except ValidationError as e:
            raise DataValidationException(detail=(str(e)), code=400, exception=e)
        # except Exception as ex:
        #     trace = []
        #     tb = ex.__traceback__
        #     while tb is not None:
        #         trace.append({
        #             "file_name": tb.tb_frame.f_code.co_filename,
        #             "function_name": tb.tb_frame.f_code.co_name,
        #             "line_no": tb.tb_lineno
        #         })
        #         tb = tb.tb_next
        #     error_msg={
        #         'type': type(ex).__name__,
        #         'message': str(ex),
        #         'trace': trace
        #     }
        #     print(error_msg,"error_msg")
        #     user_tracking.objects.create(user= None,
        #         user_ip_addr=get_ip(request),
        #         content_type= "USER LOGIN FORM",
        #         action_done="DURING EXCEPTION IN LOGIN FORM",
        #         created_by = "USERNAME: " + username +", PASSWORD: "+password,
        #         module_name=None,
        #         session_id= None,
        #         error_msg=error_msg)
        #     result = str(ex)
        #     status= HTTP_400_BAD_REQUEST
        # return Response(result,status=status)    

class Logout(APIView):
    # def get(self, request, format=None):12.1.24
    for_tracking={'content_type':"USER LOGOUT",'module_name':None}
    def post(self, request, format=None):
        # simply delete the token to force a logout
        try:
            request.user.auth_token.delete()
            for_tracking={'id':None,'sl_no':None,'content_type':"USER LOGOUT",
                    'action':"USER LOGGED OUT",'module_name':None,'plant_name':None}
            tracking=handle_tracking(request,for_tracking)
            logout(request)
            content={'message':"Successfully logged out."}
            s=HTTP_200_OK
        except Exception as ex:
            for_tracking={'content_type':"USER LOGOUT",'module_name':None,'ex':ex}
            handle_exception(request,for_tracking)
            content = str(ex)
            s= HTTP_400_BAD_REQUEST
        return Response(content,status=s)
        

