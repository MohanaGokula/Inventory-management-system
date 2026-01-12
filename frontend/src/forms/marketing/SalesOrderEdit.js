import React from 'react';
import { useState,useEffect } from "react";
import Swal from "sweetalert2";
import {Row,Col,Button} from "reactstrap";
import axios from "axios";
import Sidebar from '../../Sidebar';
import { useNavigate } from 'react-router';
import { BiSave } from "react-icons/bi";
import { IoIosEye } from "react-icons/io";
import { TiCancel } from "react-icons/ti";
import { AiOutlineHome } from "react-icons/ai";
import { useCookies } from 'react-cookie';
import { default as ReactSelect } from "react-select";
import { components } from "react-select";
import TableRowsSalesOrderEdit from "./TableRowsSalesOrderEdit";
import {moment} from 'moment';
import { Link,useParams } from 'react-router-dom';
import {parseBoolean,displayError} from '../../helpers';
import { getAllPermission } from '../../services/PermissionServices';
import ErrorToast from '../../ErrorToast';
import FloatingControls from '../../components/FloatingControls';
import LoadingOverlay from '../../components/LoadingOverlay';
import StatusDropDown from '../../components/StatusDropDown';
import { getAllCompanies} from '../../services/CompanyServices';
import { getAllQuotations,getQuotationDetails} from '../../services/QuotationServices';
import { getAllCustomerMain,getCustomerMainDetails} from '../../services/CustomerMainServices';
import {getAllCustomerSites,getCustomerSiteDetails} from '../../services/CustomerSiteServices';
import { getSalesOrderDetails,deleteSalesOrder, updateSalesOrder } from '../../services/SalesOrderServices';
import { getAllGroups } from "../../services/GroupFormServices";
import SummaryIcon from '../../components/SummaryIcon';
import { getHTMLForSummaryPopup } from '../../utils/PopupUtils';
import { getGroupsForCategory } from '../admin/GroupUtils';
import { getAllProducts } from "../../services/ProductServices";
import { getAllTax } from "../../services/TaxServices";

import { getCurrentDate, getCurrentTime,getDisplayDate } from '../../utils/DateUtils';
import NumberSetting from '../../components/NumberSetting';

const Option = (props) => {
    return (
        <>
            <components.Option {...props}>
                <input
                type="checkbox"
                checked={props.isSelected}
                onChange={() => null}/>{" "}
            <label>{props.label}</label>
            </components.Option>
        </>
    );
};
function SalesOrderEdit() {
    const [cookies] = useCookies(['myToken']);
    const [category] = useCookies(['myCategory']);
    const [inProgress, setInProgress] = useState(false);
    const [superuser] = useCookies(['mySuperuser']);
    const [inputs, setInputs] = useState({});
    const navigate = useNavigate();
    const [error, setError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(true);
    const [products, setProducts] = React.useState([]);
    const [taxes, setTaxes] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [companies, setCompanies] = React.useState([]);
    const [quotations, setQuotations] = React.useState([]);
    const [filteredQuotations, setFilteredQuotations] = React.useState([]);
    const [sites, setSites] = React.useState([]);
    const[selectedCustomer,setSelectedCustomer]=React.useState({})
    const [selectedOption, setSelectedOption] = useState(null);
    const [toDelete_DtlIds,settoDelete] = useState([]);
    const [groups, setGroups] = React.useState([]);
   const[selectedSite,setSelectedSite]= React.useState({})
   const[ selectedReceipt, setSelectedReceipt]= React.useState({})
   const[ selectedQuotation, setSelectedQuotation]= React.useState({})
   const [refreshKey, setRefreshKey] = useState(0);
   const [filteredProducts, setFilteredProducts] = React.useState([]);
   const [productCategories, setProductCategories] = React.useState([]);
    const [concreteCategories, setConcreteCategories] = React.useState([]);
    const [salesOrderFormData, setSalesOrderFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true); 

    const [isQuotationSelected, setIsQuotationSelected] = useState(false);
    React.useEffect(() => {
        
        
        setInputs(values => ({...values, 
            ['order_date']: getCurrentDate(),
            ['order_time']: getCurrentTime()
        }))
          }, []);
      
    React.useEffect(() => {
        getAllCompanies(cookies)
        .then (
            companyList => {
                
                const companies = companyList.company_data.filter(obj => obj.status).map(
                    company => {
                        return { value: company.id, label: company.entity_name }
                    }
                );
                setCompanies(companies);
            }
        )
    }, []);
    React.useEffect(() => {
        getAllCustomerMain(cookies)
        .then (
            customerList => {
                
                const customers = customerList.customer_list.filter(obj => obj.status).map(
                    customer => {
                        return { value: customer.id, label: customer.name }
                    }
                );
                setCustomers(customers);
            }
        )
    }, []);
   
    React.useEffect(() => {
        getAllTax(cookies)
        .then (
            TaxList => {
                
                const taxes = TaxList.tax_list.map(
                    tax => {
                        return { value: tax.id, label: tax.name }
                    }
                );
                setTaxes(taxes);
            }
        )
    }, []);

    React.useEffect(() => {
        getAllPermission(cookies)
        .then (
            categoryList => {
                
                const categories = categoryList.group_list.map(
                    category => {
                        return { value: category.id, label: category.name }
                    }
                );
                setCategories(categories);
            }
        )
    }, []);
    
    React.useEffect(() => {

        getGroupsForCategory('PRODUCT', cookies)
        .then(productCategories => {
            setProductCategories(productCategories.map(
                category => {
                    return { value: category.id, label: category.entity_name }
                }
            ));
        })
        
     
    }, []);

    React.useEffect(() => {

        getGroupsForCategory('CONCRETE STRUCTURE', cookies)
        .then(concreteCategories => {
            setConcreteCategories(concreteCategories.map(
                category => {
                    return { value: category.id, label: category.entity_name }
                }
            ));
        })
        
     
    }, []);

    const filterProductsByCategory = (selectedCategories, localProducts) => {
        let filteredPrds = [];
        if (!localProducts) {
            localProducts = products;
        }
        selectedCategories.forEach(productCategory=>{
            
            let localList = localProducts.filter(product => product.category.id === productCategory.value)
                .map(
                    product => {
                        return { value: product.id, label: product.name }
                    }
                );
            filteredPrds=[...filteredPrds,...localList];
        });

        return filteredPrds;
    }

    const onCategorySelect = (selected) => {
        setSelectedCategory(selected);
        let filteredPrds = filterProductsByCategory(selected);
        setFilteredProducts(filterProductsByQuotation(selectedQuotation?.order_list,filteredPrds));
        
    };

    const handleChangeTableProduct = (index, evnt)=>{
        const { name, value } = evnt.target;
        const label = evnt.target.options[evnt.target.selectedIndex].text;
        const rowsInput = [...rowsData];
        rowsInput[index][name] = value;
        if(label =='TRANSPORT CHARGES' || label=='PUMPING CHARGES'){
            rowsInput[index]['so_orderqty'] = 1;
        } else{
            rowsInput[index]['so_orderqty'] = 0;
        }
        
        rowsInput[index]['so_unit'] = products.filter(product =>product.id === parseInt(value))[0].unit.symbol;
        if(selectedQuotation.id && name === 'so_productcode'){

            console.log(selectedQuotation);
            let selectedOrder = selectedQuotation.order_list.filter(order => order.product.id === parseInt(value))[0];
            rowsInput[index]['so_rate'] = selectedOrder.rate;
            rowsInput[index]['so_concretestructure'] = selectedOrder.concrete_structure.id;
            rowsInput[index]['so_deliverymode'] = selectedOrder.delivery_mode;
            rowsInput[index]['so_taxcode'] = selectedOrder.tax.id;
          }

        setRowsData(rowsInput);
        
       }

    useEffect( () => {
        getAllGroups(cookies)
      
        .then(response => {
      const group =response.accounts_grouping_list.filter(obj => obj.entity_name == 'CONCRETE STRUCTURE' )
            const a =[]
                            for(var i=0; i<response.accounts_grouping_list.length; i++) 
                            {
                                if((response.accounts_grouping_list[i].parent_id)=== (group[0].id))
                                {
                                    a.push(response.accounts_grouping_list[i]);
                                }
                            }
                          
                            setGroups(a);
         
      
        });
      
      }, []);
      
    const handleQuotationFiltering = (companyId, siteId, allQuotations) => {

        if (!allQuotations) allQuotations = quotations;
        setFilteredQuotations(allQuotations
        .filter(quotation => quotation.company.id===parseInt(companyId) && quotation.consignee.id===parseInt(siteId))
        .map(
                quotation => {
                    return { value: quotation.id, label:(quotation.prefix ? quotation.prefix : '') + quotation.quotation_no }
                }
            )); 
             //Get the details of the customber using the Id
        
    }
   
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
      
        
        if( name === 'company_id'){
            handleQuotationFiltering(value, inputs.consignee_id);
        } 
        setInputs(values => ({...values, [name]: event.target.value}))
    }

    const handleChangeAdvancePayment = (event) =>{
        const name = event.target.name;
        const value = event.target.value;
        if(value === 'false'){
       
           document.getElementById('receipt_id').disabled = true;
           document.getElementById('receipt_id').required = false;
           document.getElementById('receipt_id').className = document.getElementById('receipt_id').className.replace('mandatory-form-control',''); 
        }
        else
        {
            document.getElementById('receipt_id').disabled = false;
            document.getElementById('receipt_id').required = true;
            document.getElementById('receipt_id').className += 'mandatory-form-control'; 
        }
        setInputs(values => ({...values, [name]: event.target.value}))
    }


    const handleChangeCustomerDetails = (event) => {
       
        console.log(event.target.value);
        const customerId = event.target.value;
        const propertyName = event.target.name;
        setInputs(values => ({...values, [propertyName]:customerId}));
        if(customerId){
           //Get the details of the customber using the Id
        getCustomerMainDetails(cookies,customerId)    
        .then(customerObject => {              //Set the details of the customer in the form fields
            setSelectedCustomer(customerObject)
          })
          getAllCustomerSites(cookies)
          .then (
              siteList => {
                  
                  const sites = siteList.consignee_list.filter(obj => obj.status && obj.customer.id === parseInt(customerId)).map(
                      site => {
                          return { value: site.id, label: site.name }
                      }
                  );
                  setSites(sites);
              }
          )
        }
       else{
          setSelectedCustomer({});
       }
  } 
  // const billingname = () => 
  
    

  
  const handleChangeSiteDetails = (event) => {
     
        console.log(event.target.value);
        const siteId = event.target.value;
        const propertyName = event.target.name;
        setInputs(values => ({...values, [propertyName]:siteId}));
          if(siteId){
                //Get the details of the customber using the Id
              getCustomerSiteDetails(cookies,siteId)
              .then(customerObject => {                     //Set the details of the customer in the form fields
    
                
                  setSelectedSite(customerObject);
                  handleQuotationFiltering(inputs.company_id,siteId);
              });
          }
      
            else{
                setSelectedSite({});
   }  
         
  } 
    const handleChangeReceiptsDetails = (event) => {
       
        console.log(event.target.value);
        const siteId = event.target.value;
        const propertyName = event.target.name;
        setInputs(values => ({...values, [propertyName]:siteId}));
        if(siteId){
              //Get the details of the customber using the Id
        getCustomerSiteDetails(cookies,siteId)
        .then(customerObject => {                     //Set the details of the customer in the form fields

          
            setSelectedReceipt(customerObject)

             });
         }
        else{
            setSelectedReceipt({})
        } 
    
    }
      

  const handleChangeQuotationDetails = (event) => {
       
    console.log(event.target.value);
    const quotationId = event.target.value;
    const propertyName = event.target.name;
    setInputs(values => ({...values, [propertyName]:quotationId}));

    if (quotationId) {
        
        getQuotationDetails(cookies,quotationId)
        .then(quotationObject => {                     

            setFilteredProducts(filterProductsByQuotation(quotationObject.order_list,filteredProducts));
            setSelectedQuotation(quotationObject);
                        
        });
    } else {
        setFilteredProducts(filterProductsByCategory(selectedCategory));
        setSelectedQuotation({});
        
    }
    if(rowsData.length > 0){
        Swal.fire({title: 'Do you want to proceed',  
        showCancelButton: true,  
        confirmButtonText: `Yes`,  
        cancelButtonText: `No`,
        }).then((result) => {  
          if (result.isConfirmed) { 
       
                setRowsData([]);
            }
       })
       
     
      }
   
     
  } 

   const filterProductsByQuotation = (orderList, productList) => {

        if (orderList) {
            let quotationProductList = orderList.map(order => order.product.id);
            let quotationProducts = 
                productList.filter(product => quotationProductList.includes(product.value));
            return quotationProducts;
        }
                
        return productList;
   }

   const [selectedFile, setSelectedFile] = useState({})
   const handleChangeFileDetails = (event) => {
       const name = event.target.name;
       const value=event.target.files[0];
       if(name=="purchase_order_file"){
            setSelectedFile(values => ({ ...values,
                [name]: event.target.files[0]}))
       }
       setSalesOrderFormData((values) => ({ ...values, [name]: event.target.value }));
   }

   
   const showCustomerDetails = () => {

        if (selectedCustomer.id) {
                Swal.fire({
                    html:getHTMLForSummaryPopup(
                        'BILLING DETAILS',
                        [
                        {label: 'ADDRESS', value: selectedCustomer.address_1},
                        {value: selectedCustomer.address_2},
                        {value: selectedCustomer.address_3},
                        {label: 'GST', value: selectedCustomer.gst_no},
                        {label: 'PAN', value: selectedCustomer.pan_no},
                        {label: 'SALES OFFICER', value: selectedCustomer.salesrep.name},
                        {label: 'CREDIT LIMIT', value: selectedCustomer.credit_limit}
                        ])
                }, '', 'info');   
        }
        
   }

   const showSiteDetails = () => {

    if (selectedSite.id) {
            Swal.fire({
                html:getHTMLForSummaryPopup(
                    'SITE DETAILS',
                    [
                    {label: 'ADDRESS', value: selectedSite.address_1},
                    {value: selectedSite.address_2},
                    {value: selectedSite.address_3},
                    {label: 'CUSTOMER NAME', value: selectedSite.name},
                    {label: 'CONTACT NAME', value: selectedSite.contact_person},
                    {label: 'MOBILE NO', value: selectedSite.contact_mobile_no},
                    {label: 'DESIGNATION', value: selectedSite.contact_designation}
                    ])
            }, '', 'info');   
    }
    
}

const showReceiptsDetails = () => {

    if (selectedReceipt.id) {
            Swal.fire({
                html:getHTMLForSummaryPopup(
                    'RECEIPTS DETAILS',
                    [
                    {label: 'MODE', value: selectedReceipt.address_1},
                    {label: 'AMOUNT', value: selectedReceipt.name},
                    {label: 'BANK', value: selectedReceipt.contact_person},
                    {label: 'BRANCH', value: selectedReceipt.contact_mobile_no},
                    {label: 'Cheque No. / DD No. & Dt.', value: selectedReceipt.contact_designation}
                    
                    ])
            }, '', 'info');   
    }
    
}

const showQuotationDetails = () => {

    if (selectedQuotation.id) {
            Swal.fire({
                html:getHTMLForSummaryPopup(
                    'QUOTATION DETAILS',
                    [
                    {label: 'QUOTATION NO', value: selectedQuotation.quotation_no},
                    {label: 'QUOTATION DATE', value: selectedQuotation.quotation_date},
                   
                    ])
            }, '', 'info');   
    }
    
}
   const [rowsData, setRowsData] = useState([]);

   const addTableRows = () => {
       const count=rowsData.length +1;
  
       const rowsInput={
                 id:'',
                so_slno:count,
                so_taxcode:'',
                so_concretestructure:'',
                so_deliverymode:'',
                so_amt:'',
                so_rate:'',
                so_orderqty:'',
                so_unit:'',
                so_productcode:'',
                so_remarks:''
           }
           setRowsData([...rowsData, rowsInput])
   }
       
   const deleteTableRows = (index)=>{
    const rows = [...rowsData];
    console.log((rows[index].id)+"rowsData.id");
    if((rows[index].id))
    {
        Swal.fire({title: 'Are you sure to Delete this SO Detail?',  
        showCancelButton: true,  
        confirmButtonText: `Yes`,  
        cancelButtonText: `No`,
        }).then((result) => { 
            if (result.isConfirmed)
            {
                settoDelete([...toDelete_DtlIds, rows[index].id])
                rows.splice(index, 1);
                var grandTotal = 0;
                for(var i=0; i<rows.length; i++) 
                {
                    rows[i]['so_slno']= i+1
                    // console.log(rowsData[i].so_amt+"rowsData.so_amt");
                    if((rows[i].so_amt) == '') 
                    {
                        rows[i].so_amt=0
                        // console.log(grandTotal+"grandTotal_0");
                    }
                    grandTotal += parseFloat(rows[i].so_amt)
                }
                console.log(grandTotal+"grandTotal");
                setInputs(values => ({...values, ['order_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
                setRowsData(rows)
            } 
        });
    }
    else
    {
        rows.splice(index, 1);
        
        var grandTotal = 0;
        for(var i=0; i<rows.length; i++) 
        {
            rows[i]['so_slno']= i+1
            // console.log(rowsData[i].so_amt+"rowsData.so_amt");
            if((rows[i].so_amt) == '') 
            {
                rows[i].so_amt=0
                // console.log(grandTotal+"grandTotal_0");
            }
            grandTotal += parseFloat(rows[i].so_amt)
        }
        console.log(grandTotal+"grandTotal");
        setInputs(values => ({...values, ['order_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
        setRowsData(rows)
    }
}

   const handleChangeTableDetails = (index, evnt)=>{
    const { name, value } = evnt.target;
    const rowsInput = [...rowsData];
    rowsInput[index][name] = value;
    if(name === 'so_productcode')
    {
  
        if(value)
        {
            for(var i=0; i<products.length; i++) 
            {
            if(products[i].id == value)
            {
               
                var symbol=products[i].unitSymbol
                rowsInput[index]['so_unit']= symbol
            }
            }
        }
        else
        {
            rowsInput[index]['so_unit']=''
        }
    }
    else if(name === 'so_orderqty')
    {

        var amount=value*rowsInput[index]['so_rate']
   
        rowsInput[index]['so_amt']= amount.toFixed(2)
        var grandTotal = 0;
        for(var i=0; i<rowsData.length; i++) 
        {

            if((rowsData[i].so_amt) == '') 
            {
                rowsData[i].so_amt=0 
            
            }
            grandTotal += parseFloat(rowsData[i].so_amt)
        }
    
        setInputs(values => ({...values, ['order_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
    }
    else if(name === 'so_rate')
    {

        var amount=value*rowsInput[index]['so_orderqty']
  
        rowsInput[index]['so_amt']= amount.toFixed(2)
        var grandTotal = 0;
        for(var i=0; i<rowsData.length; i++) 
        {
           
            if((rowsData[i].so_amt) == '') 
            {
                rowsData[i].so_amt=0
              
            }
            grandTotal += parseFloat(rowsData[i].so_amt)
        }
       
        setInputs(values => ({...values, ['order_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
    }
    else if(name === 'so_amt')
    {
       
    }
    setRowsData(rowsInput);
    
}
const constructFormData = () => {
    const EMPTY_STRING = '';
    const dataArray = new FormData();
           if (selectedFile.logo) {
            dataArray.append("logo", selectedFile.logo);
          }               
        //   dataArray.append("id",salesOrderFormData.id); 
        dataArray.append("company_id",parseInt(inputs.company_id));
        dataArray.append("consignee_id",parseInt(inputs.consignee_id));
        dataArray.append("order_no",inputs.order_no|| EMPTY_STRING);
        dataArray.append("order_date",(inputs.order_date ? getDisplayDate(inputs.order_date) : EMPTY_STRING));
        dataArray.append("order_time",inputs.order_time|| EMPTY_STRING);
        dataArray.append("prefix",inputs.prefix|| EMPTY_STRING);
        dataArray.append("quotation_no",inputs.quotation_no || EMPTY_STRING);
        dataArray.append("purchase_order_no",inputs.purchase_order_no|| EMPTY_STRING);
        dataArray.append("purchase_order_date",inputs.purchase_order_date ? getDisplayDate(inputs.purchase_order_date) :  EMPTY_STRING);
        dataArray.append("purchase_order_file",selectedFile.purchase_order_file|| EMPTY_STRING);
        dataArray.append("delivery_date",inputs.delivery_date ? getDisplayDate(inputs.delivery_date) : EMPTY_STRING);
        dataArray.append("pay_terms",inputs.pay_terms || EMPTY_STRING);
        dataArray.append("tax_exemption_no",inputs.tax_exemption_no|| EMPTY_STRING);
        dataArray.append("validity_date",inputs.validity_date ? getDisplayDate(inputs.validity_date) :EMPTY_STRING);
        dataArray.append("transport_mode",inputs.transport_mode|| EMPTY_STRING);
        dataArray.append ("is_tax_included",inputs.is_tax_included || 'false');
        
        let products = rowsData.map(rowEntry => ({
          product_id: rowEntry.so_productcode,
          quantity: parseFloat(rowEntry.so_orderqty),
          rate: parseFloat(rowEntry.so_rate),
          amount: parseFloat(rowEntry.so_amt),
          tax_id: rowEntry.so_taxcode,
          concrete_structure_id: rowEntry.so_concretestructure,
          delivery_mode: rowEntry.so_deliverymode,
          user_remarks: rowEntry.so_remarks,
          id: rowEntry.id
        }))

        console.log(JSON.stringify(products));
        dataArray.append("order_list",JSON.stringify(products));
        dataArray.append("order_amount",parseFloat(inputs.order_amount));
        dataArray.append("user_remarks",inputs.user_remarks|| EMPTY_STRING);
        dataArray.append("status",parseBoolean(inputs.status));
        dataArray.append("is_advance_payment",inputs.is_advance_payment || 'false');
        dataArray.append("receipt_id",inputs.receipt_id || EMPTY_STRING);
        return dataArray;
}
const handleSalesOrderDetails = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    if(name === "creation_date"){
        setInputs(values => ({...values, 'order_date': event.target.value}))
        
    } else {
        setInputs(values => ({...values, [name]: event.target.value}))
    }
    
  }

  const updateSONumberAndPrefix = (prefix, serial_no) => {

    setInputs(values => ({...values,
        ['salesorder_num_prefix']:(prefix+serial_no),
        ['order_no']:serial_no,
        ['prefix']:prefix}));
  }

  const onDeleteSalesOrder = (event) => {

    event.preventDefault();
    Swal.fire({title: 'Are you sure to Delete?',  
    showCancelButton: true,  
    confirmButtonText: `Yes`,  
    cancelButtonText: `No`,
    }).then((result) => {  
      if (result.isConfirmed) { 

        setIsLoading(true);
        deleteSalesOrder(cookies, id)
        .then(response => {
            console.log(`Sales Order with id ${id} deleted`);
            setRefreshKey(oldKey => oldKey +1);
            Swal.fire('Deleted Successfully!', '', 'success');
            view();
        })
        .catch(error => {
            setRefreshKey(oldKey => oldKey +1);
            console.log(error.response.data);
            displayError(error.response.data,'Delete Failed');
        }); 
        
        
      } else if (result.isDismissed) {    
        Swal.fire('Not Deleted', '', 'info')  
    }
    });
    //

};

 const handleSubmit = (event) => {
    event.preventDefault();
    if( (rowsData.length > 0))
    {
    if ((Object.values(error).every(x => !x)) && isSubmitting) { 
        Swal.fire({title: 'Do you want to Update?',  
          showCancelButton: true,  
          confirmButtonText: `Yes`,  
          cancelButtonText: `No`,
          }).then((result) => {  
            if (result.isConfirmed) 
            { 
               
              updateSalesOrder(cookies, constructFormData(),id)
              .then(function (response) {
                Swal.fire('Updated!', '', 'success') 
                view();
              })
              .catch((error) =>
              {
                console.log(error.response.data);
                displayError(error.response.data,"Update Failed");
              })
              
            } 
            else if (result.isDismissed) 
            {    
              Swal.fire('Not Updated', '', 'info')  
            }
          });
    }
    else
    {
      Swal.fire('Please check * marked fields are filled and details given are valid...', '', 'info')   
    }
}
else if(!((rowsData.length > 0)))
{
  Swal.fire('Please add atleatest  one product', '', 'info')   
}

}
                        
 const {id}=useParams()
 React.useEffect(() => {

    const EMPTY_STRING = '';

   if (id) {
     setInProgress(true);
     getSalesOrderDetails(cookies, id)
       .then(response => {
         setInProgress(false);
         
         setInputs({...response,company_id:response.company.id,
            customer_id:response.consignee.customer.id,
            consignee_id:response.consignee.id,
            quotation_id:response.quotation.id,
            receipt_id:response.receipt.id,
            receipt_id:response.receipt_id,
            status:String(response.status),
            delivery_date:(response.delivery_date? getDisplayDate(response.delivery_date) :EMPTY_STRING),
            validity_date:(response.validity_date ? getDisplayDate(response.validity_date) :EMPTY_STRING),
            order_date: (response.order_date ? getDisplayDate(response.order_date) : EMPTY_STRING),
            purchase_order_date: (response.purchase_order_date ? getDisplayDate(response.order_date) : EMPTY_STRING)
        });
        
        getCustomerMainDetails(cookies,response.consignee.customer.id)    
        .then(customerObject => {              //Set the details of the customer in the form fields
            setSelectedCustomer(customerObject)
            })

        getAllCustomerSites(cookies)
        .then (
            siteList => {
                
                const sites = siteList.consignee_list.filter(obj => obj.status && obj.customer.id === response.consignee.customer.id).map(
                    site => {
                        return { value: site.id, label: site.name }
                    }
                );
                setSites(sites);
            }
        )
        getCustomerSiteDetails(cookies,response.consignee.id)
              .then(customerObject => {                     //Set the details of the customer in the form fields
    
                
                  setSelectedSite(customerObject);
              });
        
        let categoryIds = [];
        let selectedCategories = [];
        response.order_list.forEach(order => {

            if (!categoryIds.includes(order.product.category.id)) {
                selectedCategories.push({
                    value: order.product.category.id,
                    label: order.product.category.name
                });
                categoryIds.push(order.product.category.id);
            }
        });


        setSelectedCategory(selectedCategories);

        getAllProducts(cookies)
        .then (
            productList => {
                
                const activeProducts = productList.product_list.filter(obj => obj.status);
                setProducts(activeProducts);

                let filteredPrds = filterProductsByCategory(selectedCategories, activeProducts);
                setFilteredProducts(filteredPrds);
                
                if (response.quotation.id) {

                    getAllQuotations(cookies)
                    .then (
                        quotationList => {
                            setQuotations(quotationList.quotation_list);
                            handleQuotationFiltering(response.company.id,response.consignee.id, quotationList.quotation_list);
                            getQuotationDetails(cookies,response.quotation.id)
                            .then(quotationObject => {                     
                                setFilteredProducts(filterProductsByQuotation(quotationObject.order_list,filteredPrds));
                                setSelectedQuotation(quotationObject);
                                setIsQuotationSelected(true);
                            });
                        }
                    );
                }

                setRowsData(response.order_list.map((order,index) => ({
                    so_slno: index+1,
                    so_productcode:order.product.id,
                    so_unit:order.product.unit.symbol,
                    so_orderqty:order.quantity,
                    so_rate:order.rate,
                    so_amt:order.amount,
                    so_deliverymode:order.delivery_mode,
                    so_concretestructure:order.concrete_structure.id,
                    so_deliveryqty:order.delivered_qty,
                    so_taxcode:order.tax.id,
                    so_remarks:order.user_remarks,
                    id: order.id
                })));

                

                
            }
        )

       })
       .catch(error => {
         setInProgress(false);
         displayError(error.response.data, "Loading Failed");
       });
     }
   }, []);


   

  const Reload = () => {
    window.location.reload();
  }      
  const view = () => {
    navigate('/SalesOrderTable')
  }  
  const Back = () => {
    navigate('/Home')
  }


    return (
    <>
     <div id="outer-container"  className="App" > 
        <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
        <ErrorToast/>
        <LoadingOverlay inProgress={inProgress}/>
        <div id="page-wrap">
        <form onSubmit={handleSubmit} encType="multipart/form-data"> 
          <div id="header">
              <h3 className = "text font-weight-bold page-title" >SALES ORDER EDIT </h3>
          </div>
          <FloatingControls tableLink="/SalesOrderTable" enableCancel={false}/>
            <div className="container p-2 "> 
  
            </div>
            <div className="container"> 
                <Row> 
                <Col xl={6} lg={12} md={12}>   
                <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                <label htmlFor="company_id" className="form-group col-sm-4 text-right">Company</label>
                        
                        <select id="company_id"name="company_id" className="form-control col-sm-7 numsetting browser-default custom-select  mandatory-form-control"  required onChange={handleChange} disabled={true} value={inputs.company_id || ""}>
                            <option value="">Select Office</option>
                            {companies.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}</option>
                            ))}
                        </select><br/>

                <h5 className='col-sm-11'><b>Customer Details</b></h5><br/><br/>
                        
                        <label htmlFor="customer_id" className="form-group col-sm-4 text-right">Billing Name</label>
                        <select  id="customer_id" name="customer_id" className="form-control col-sm-7 browser-default custom-select mandatory-form-control" required onChange={handleChangeCustomerDetails} disabled={true} value={inputs.customer_id || ""}>
                        <option value="">Select Billing Name</option>
                                {customers.map((item) => (
                                        <option key={item.value} value={item.value}>
                                        {item.label}
                                        </option>
                                    ))}
                            </select><SummaryIcon onClickHandler={showCustomerDetails}/>
                        <label htmlFor="consignee_id" className="form-group col-sm-4 text-right ">Site Name</label>
                        <select  id="consignee_id" name="consignee_id" className="form-control col-sm-7 browser-default custom-select mandatory-form-control" required onChange={handleChangeSiteDetails} disabled={true} value={inputs.consignee_id || ""}>
                        <option value="">Select Site Name</option>
                                {sites.map((item) => (
                                        <option key={item.value} value={item.value}>
                                        {item.label}
                                        </option>
                                    ))}
                            
                        </select><SummaryIcon onClickHandler={showSiteDetails}/>

                        <label htmlFor="project_name" className="form-group col-sm-4 text-right ">Project Name</label>
                        <input  id="project_name" name="project_name" className="form-control col-sm-7" disabled={true}  value={selectedSite.project_name || ""}/>
                       <br/><br/><br/>

                       <label htmlFor="delivery_date" className="form-group col-sm-4 text-right">Delivery Date</label>
                        <input type="date" id="delivery_date"className="form-control col-sm-7" name="delivery_date"  onChange={handleChange} value={inputs.delivery_date || ""}/><br/>
                       
                        <label htmlFor="pay_terms" className="form-group col-sm-4 text-right">Payment Terms (in Days)</label>
                        <input type="number" min="0"id="pay_terms" className="form-control col-sm-7"  placeholder="Please fill pay terms in days*" name="pay_terms" onChange={handleChange} value={inputs.pay_terms || 0}/><br/>
                       
                        <label htmlFor="tax_exemption_no" className="form-group col-sm-4 text-right">Tax Exemption No.</label>
                        <input type="text"id="tax_exemption_no" className="form-control col-sm-7" onChange={handleChange} value={inputs.tax_exemption_no || ""}placeholder="Please tax Exemption No. if tax is Zero" name="tax_exemption_no"/>
               
                        <label htmlFor="transport_mode" className="form-group col-sm-4 text-right">Mode of Transport</label>
                        <select id="transport_mode"name="transport_mode" className="form-control col-sm-7 browser-default custom-select mandatory-form-control"onChange={handleChange} value={inputs.transport_mode || ""} required>
                            <option value="" >Please Select</option>
                            <option value="own" >Own</option>
                            <option value="customer" >Customer</option>
                            <option value="own/customer" >Own/Customer</option>
                        </select><br/><br/><br/><br/>
                        
                        <label htmlFor="is_advance_payment" className="form-group col-sm-4 text-right">Is Advance Payment?</label>
                        <select name="is_advance_payment" id="is_advance_payment" className="form-control col-sm-7 browser-default custom-select mandatory-form-control" required onChange={handleChangeAdvancePayment} value={inputs.is_advance_payment || "false"} >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                            </select>
                        <label htmlFor="receipt_id" className="form-group col-sm-4 text-right ">Receipts</label>
                        <select  id="receipt_id" name="receipt_id" className="form-control col-sm-7 browser-default custom-select " 
                        onChange={handleChangeReceiptsDetails } 
                        value={inputs.receipt_id || ""} disabled={true}>
                        <option value="">Select Receipts</option>
                                {sites.map((item) => (
                                        <option key={item.value} value={item.value}>
                                        {item.label}
                                        </option>
                                    ))}
                            
                        </select><SummaryIcon onClickHandler={showReceiptsDetails}/>
                        <br/>
                        <label htmlFor="receipt_date" className="form-group col-sm-4 text-right">Date</label>
                        <input id="receipt_date" type="date" className="form-control col-sm-7" name="receipt_date"  value={selectedReceipt.receipt_date?getDisplayDate(selectedReceipt.receipt_date): ""} disabled={true}/><br/>
                    </div>
                 
                </Col>
                <Col xl={6} lg={12} md={12}>   
                
                
                <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                    <h5 className='col-sm-11'><b>Quotation Details</b></h5><br/><br/>
                        <label htmlFor="quotation_no" className="form-group col-sm-4 text-right">Quotation No.</label>
                        <select  id="quotation_no" name="quotation_no" className="form-control col-sm-7 browser-default custom-select " onChange={handleChangeQuotationDetails } value={inputs.quotation_no || ""} disabled={true} >
                        <option value="">Select Quotation</option>
                                {filteredQuotations.map((item) => (
                                        <option key={item.value} value={item.value}>
                                        {item.label}
                                        </option>
                                    ))}
                            
                        </select><SummaryIcon onClickHandler={showQuotationDetails}/>  
                        
                        <label htmlFor="quotation_date" className="form-group col-sm-4 text-right">Date</label>
                        <input id="quotation_date" type="date" className="form-control col-sm-7" name="quotation_date"  value={selectedQuotation.quotation_date?getDisplayDate(selectedQuotation.quotation_date): ""} disabled={true}/><br/>
                       
                        <h5 className='col-sm-11'><b>Order Details</b></h5><br/><br/>
                        
                        <NumberSetting 
                        handleDateChange={handleSalesOrderDetails} 
                        serial_no={inputs.order_no} 
                        creation_date={inputs.order_date}
                        creation_time={inputs.order_time}
                        prefix={inputs.prefix}
                        company_id={inputs.company_id}
                        voucher_type={"sales_order"}
                        handleNumberAndPrefixUpdate={updateSONumberAndPrefix}
                        cookies={cookies}
                        serial_no_title={'Sales Order No'}
                        hideTime={false}/>
                        
                        <label htmlFor="purchase_order_no" className="form-group col-sm-4 text-right">Purchase Order No.</label>
                        <input type="text" id="purchase_order_no" className="form-control col-sm-7" placeholder="Please fill the Purchase order Reference No." name="purchase_order_no" onChange={handleChange} value={inputs.purchase_order_no || ""}/><br/>
                        
                        <label htmlFor="purchase_order_date" className="form-group col-sm-4 text-right">Purchase Order Date</label>
                        <input id="purchase_order_date"type="date" className="form-control col-sm-7" name="purchase_order_date" onChange={handleChange} value={inputs.purchase_order_date || ""}/><br/>
                       
                        <label htmlFor="purchase_order_file" className="form-group col-sm-4 text-right">Purchase Order File</label>
                        <input type="file" id="purchase_order_file"className="col-sm-7" onChange={handleChangeFileDetails} name="purchase_order_file"/>
                        
                        <label htmlFor="validity_date" className="form-group col-sm-4 text-right">Validity Date</label>
                        <input type="date" className="form-control col-sm-7"id="validity_date" name="validity_date"  onChange={handleChange} value={inputs.validity_date || ""}/><br/>
                       
                        <h5 className='col-sm-11'><b> Status Details</b></h5><br/><br/>
                        <StatusDropDown status={inputs.status} onChange={handleChange}/><br/>
                        <label htmlFor="user_remarks" className="form-group col-sm-4 text-right">Remarks</label>
                        <textarea id="user_remarks"className="form-control col-sm-7" onChange={handleChange} value={inputs.user_remarks || ""}placeholder="If Any" name="user_remarks"/><br/><br/>
                             
                        </div>

                </Col>
            </Row>
            <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue container table-responsive form-control-panel">
            <h5 className='col-sm-11'><b>Product Details</b></h5><br/><br/>
<label htmlFor="order_details" className="form-group col-sm-2 text-right">Product Category</label>
                        <div style={{width: '28%'}} >
                        <ReactSelect
                                    options={productCategories}
                                    isMulti= {true}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    components={{Option}}
                                    isClearable={true}
                                    // defaultValue={selectedOption}
                                    value={selectedCategory}
                                    onChange={onCategorySelect}
                                    className={"mandatory-form-control"}
                                    placeholder="Please select Category"
                                    
                                  /><br/>
                                  </div>
            <label htmlFor="is_tax_included" className="form-group col-sm-3 text-right">Is Inclusive of Taxes?</label>
                        <select id="is_tax_included"className="form-control col-sm-3 browser-default custom-select " name="is_tax_included" onChange={handleChange} value={inputs.is_tax_included || "false"} >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select><br/>
                <table className="table order-list" id="order_list" style={{textAlign:"center",borderRadius:"10px",backgroundColor:" RGB(188,232,253)"}}>
                    <thead>
                        <tr>
                            <th><button type="button"className="btn btn-success" onClick={addTableRows}>+</button></th>
                            <th colSpan="1">S.No.</th>
                            <th colSpan="1">Product</th>
                            <th colSpan="1">Unit</th>
                            <th colSpan="1">Order Qty.</th>
                            <th colSpan="1">Delivery Qty</th>
                            <th colSpan="1">Rate / M3</th>
                            <th colSpan="1">Amount</th>
                            <th colSpan="1">Mode Of Delivery</th>
                            <th colSpan="1">Concrete Structure</th>
                            <th colSpan="1">Tax</th>
                            <th colSpan="1">Remarks</th>
                        </tr>
                    </thead>
                    <tbody >
                        <TableRowsSalesOrderEdit
                        rowsData={rowsData} 
                        deleteTableRows={deleteTableRows} 
                        handleChangeTableDetails={handleChangeTableDetails} 
                        handleProductChange={handleChangeTableProduct} 
                        products={filteredProducts} 
                        taxes={taxes} 
                        groups={concreteCategories}
                        disabledForQuotation={isQuotationSelected}/>
                    </tbody>
                </table>
            </div> 
            <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                {/* <label htmlFor="order_amount" className="form-group col-sm-2 text-right">Total Product Value </label>
                <input type="text" className="form-control col-sm-2 number1" name="order_amount" value={inputs.order_amount || 0}  readOnly={true} style={{textAlign:"right",backgroundColor:"white", cursor: "not-allowed"}} id="order_amount" disabled/> */}
                
                <label htmlFor="order_amount" className="form-group col-sm-9 text-right">Order Value</label>
                <input type="text" className="form-control col-sm-3 order_amount" id="order_amount" value={inputs.order_amount || 0}  readOnly={true} style={{textAlign:"right",backgroundColor:"white", cursor: "not-allowed"}} name="order_amount" disabled/>
            </div>            
            </div>
                <div className="footer text-center">
                <Button  type="submit" className="btn btn-twitter" style={{width:"80px",fontWeight:"bold"}} >Update</Button> &nbsp;&nbsp;
                                <Button className="btn btn-twitter"  type="button"style={{width:"80px",fontWeight:"bold"}} onClick={view}>View</Button>&nbsp;&nbsp;
                                <Button className="btn btn-twitter"  type="button"style={{width:"80px",fontWeight:"bold"}} onClick={Back}>Home</Button>&nbsp;&nbsp;
                                <Button className="btn btn-delete"  type="button"style={{width:"80px",fontWeight:"bold"}} onClick={onDeleteSalesOrder}>Delete</Button>
                </div>     </form>
        </div>
    </div>
         </>
    );
  }
  export default SalesOrderEdit;