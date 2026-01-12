import React from 'react';
import { useState,useEffect } from "react";
import { Link,useParams } from 'react-router-dom';
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
import TableRowsQuotationEdit from "./TableRowsQuotationEdit";
import {moment} from 'moment';
import {displayErrorToast,parseBoolean,displayError} from '../../helpers';
import FloatingControls from '../../components/FloatingControls';
import StatusDropDown from '../../components/StatusDropDown';
import { getAllCompanies } from '../../services/CompanyServices';
import LoadingOverlay from '../../components/LoadingOverlay';
import { getAllCustomerMain,getCustomerMainDetails } from '../../services/CustomerMainServices';
import { getAllTax } from "../../services/TaxServices";
import { getAllCustomerSites,getCustomerSiteDetails } from '../../services/CustomerSiteServices';
import { getAllProducts } from "../../services/ProductServices";
import { getAllGroups } from "../../services/GroupFormServices";
import { getGroupsForCategory } from '../admin/GroupUtils';
import SummaryIcon from '../../components/SummaryIcon';
import { getCurrentDate, getDisplayDate } from '../../utils/DateUtils';
import { getHTMLForSummaryPopup } from '../../utils/PopupUtils';
import NumberSetting from '../../components/NumberSetting';
import {  deleteQuotation } from "../../services/QuotationServices";

import {  updateQuotation,getQuotationDetails,getQuotationNumber} from "../../services/QuotationServices";


function QuotationEdit() {
    const [cookies] = useCookies(['myToken']);
    const [category] = useCookies(['myCategory']);
    const [inProgress, setInProgress] = useState(false);
    const[selectedCustomer,setSelectedCustomer] = useState({});
    const[selectedCustomerSite,setSelectedCustomerSite] = useState({});
    const[selectedquotation,setSelectedQuotation] = useState({});
    const [superuser] = useCookies(['mySuperuser']);
    const [inputs, setInputs] = useState({
            company_id:'',
            customer_id:'',
            consignee_id:'',
			enquiry_no:'',
			enquiry_date:'',
			is_tax_included:'true',
			terms_condition:'',
			quotation_no:'',
			quotation_date:'',
			prefix:'',
			prod_category:'',
            status:''
		
    });
    const navigate = useNavigate();
    const [products, setProducts] = React.useState([]);

    const [taxes, setTaxes] = React.useState([]);
    const [error, setError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [customer, setCustomer] = useState([]);
    const [groups, setGroups] = React.useState([]);

    const [sites, setSites] = React.useState([]);
    const [selectedProduct, setSelectedProduct] = React.useState([]);
    const [filteredProducts, setFilteredProducts] = React.useState([]);
    const [productCategories, setProductCategories] = React.useState([]);
    const [concreteCategories, setConcreteCategories] = React.useState([]);


React.useEffect(() => {
        
        
    setInputs(values => ({...values, 
        ['quotation_date']: getCurrentDate()
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
            
            const customer = customerList.customer_list.map(
              cust => {
                    return { value: cust.id, label: cust.name }
                }
            );
            setCustomer(customer);
        }
    )
}, []);

React.useEffect(() => {
    getAllCustomerSites(cookies)

    .then (
        siteList => {
            
            const sites = siteList.consignee_list.map(
                site => {
                    return { value: site.id, label: site.name }
                }
            );
            setSites(sites);
        }
    ) 
}, []);

React.useEffect(() => {

}, []);

   
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
                        {label: 'CREDIT LIMIT', value: selectedCustomer.credit_limit},
                        {label: 'CONTACT PERSON NAME', value: selectedCustomer.contact_person},            
                        {label: 'DESIGNATION', value: selectedCustomer.contact_designation},
                        {label: 'CONTACT MOBILE NUMBER', value: selectedCustomer.contact_mobile_no},
                        {label: 'EMAIL ID', value: selectedCustomer.contact_email_id}
                        ])
                }, '', 'info');   
        }
       
    }
        const showSiteDetails = () => {

            if (selectedCustomerSite.id) {
                    Swal.fire({
                        html:getHTMLForSummaryPopup(
                            'SITE DETAILS',
                            [
                            {label: 'ADDRESS', value: selectedCustomerSite.address_1},
                            {value: selectedCustomerSite.address_2},
                            {value: selectedCustomerSite.address_3},
                            {label: 'CUSTOMER NAME', value: selectedCustomerSite.name},
                            {label: 'CONTACT NAME', value: selectedCustomerSite.contact_person},
                            {label: 'MOBILE NO', value: selectedCustomerSite.contact_mobile_no},
                            {label: 'DESIGNATION', value: selectedCustomerSite.contact_designation}
                            ])
                    }, '', 'info');   
            }
            
        }
    const [selectedOption, setSelectedOption] = useState(null);
    const [categories, setCategories] = React.useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true);  
    const [selectedCategory, setSelectedCategory] = useState(null);
 
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
      const onCategorySelect = (selected) => {
        setSelectedCategory(selected);
        let filteredPrds = [];
        selected.forEach(productCategory=>{
            
            let localList = products.filter(product => product.category.id === productCategory.value)
                .map(
                    product => {
                        return { value: product.id, label: product.name }
                    }
                );
            filteredPrds=[...filteredPrds,...localList];
        });
        setFilteredProducts(filteredPrds);
        
    }; 

   
    
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
  
    React.useEffect(() => {
        getAllTax(cookies)
        .then (
            TaxList => {
                
                const taxes = TaxList.tax_list.filter(obj => obj.status).map(
                    tax => {
                        return { value: tax.id, label: tax.name }
                    }
                );
                setTaxes(taxes);
            }
        )
    }, []);
    React.useEffect(() => {
        getAllProducts(cookies)
        .then (
            productList => {
                
                const products = productList.product_list.filter(obj => obj.status)
                 
                  setProducts(products);
                  console.log(JSON.stringify(products)+"products")
            }
        )
    }, []);
   
    const handleQuotationDetails = (event) => {
        const name = event.target.name;
        const value = event.target.value;
    
        if(name === "creation_date"){
            setInputs(values => ({...values, 'quotation_date': event.target.value}))
       
            
        } else {
         
            setInputs(values => ({...values, [name]: event.target.value}))
        }
        
      }

  
    const updateSONumberAndPrefix = (prefix, serial_no) => {

        setInputs(values => ({...values,
            ['quotation_num_prefix']:(prefix+serial_no),
            ['order_no']:serial_no,
            ['prefix']:prefix}));
     
      }
    const handleChangeTableProduct = (index, evnt)=>{
        const { name, value } = evnt.target;
       // console.log(JSON.stringify(rowsData)+"handleChangeTableProduct")
        const label = evnt.target.options[evnt.target.selectedIndex].text;
        // console.log(evnt.target.options[evnt.target.selectedIndex].text)
        const rowsInput = [...rowsData];
        rowsInput[index][name] = value;
        if(label =='TRANSPORT CHARGES' || label=='PUMPING CHARGES'){
        rowsInput[index]['quantity'] = 1;
        }
        else{
            rowsInput[index]['quantity'] = 0;
        }
        console.log(products+"products")
        rowsInput[index]['unit_id'] = products.filter(product =>product.id === parseInt(value))[0].unit.symbol;
      
        setRowsData(rowsInput);
        
        
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
          setSites([])
        setSelectedCustomerSite({})
        //   setSelectedQuotation({})
       }
     
  } 
  
  const handleChangeSiteDetails = (event) => {
     
        console.log(event.target.value);
        const siteId = event.target.value;
        const propertyName = event.target.name;
        setInputs(values => ({...values, [propertyName]:siteId}));

        //Get the details of the customber using the Id
        getCustomerSiteDetails(cookies,siteId)
        .then(siteObject => {                     //Set the details of the customer in the form fields
            setSelectedCustomerSite(siteObject)});
  } 
 
    const [selectedFile, setSelectedFile] = useState({})
    const handleChange3 = (event) => {
        const name = event.target.name;
        const value=event.target.files[0];
        console.log(value.name+"filename");
        console.log(name+"filefield");
        setSelectedFile(values => ({...values, [name]: value}))
    }

    const [rowsData, setRowsData] = useState([]);
 
    const addTableRows = () => {
        const count=rowsData.length +1;
        // console.log(count+"count_add")
        const rowsInput={
                soDSqlNo:count,
                id:'',
                tax_id:'',
                concrete_structure_id:'',
                delivery_mode:'',
                unit_id:'',
                quantity:'',
                rate:'',
                amount:'',
                product_id:'',
                user_remarks:''
            }
            setRowsData([...rowsData, rowsInput])
    }
        
    const deleteTableRows = (index)=>{
            const rows = [...rowsData];
            rows.splice(index, 1);
            for(var i=0; i<rows.length; i++) 
            {
                rows[i]['soDSqlNo']= i+1
            }
            setRowsData(rows);
        }
 
        const handleSubmit=(event)=> {
            event.preventDefault();
            try{
                
       
                if( (rowsData.length > 0))
                {
                    const EMPTY_STRING = '';
          
                if (Object.values(error).every((x) => !x) && isSubmitting) { 
            //If the fields are correct details it is valid choosing yes or no option,otherwise it is invalid
                    Swal.fire({title: 'Do you want to Update?',  
                    showCancelButton: true,  
                    confirmButtonText: `Yes`,  
                    cancelButtonText: `No`,
                    }).then((result) => {  
                      if (result.isConfirmed) { 
                        var moment = require('moment')
                          console.log(JSON.stringify(inputs)+"inputsubmit")
                          updateQuotation(cookies, {

                            company_id: parseInt(inputs.company_id),
                            customer_id:parseInt(inputs.customer_id),
                            consignee_id: parseInt(inputs.consignee_id),
                            quotation_no:inputs.quotation_no,
                            quotation_date: inputs.quotation_date ? getDisplayDate(inputs.quotation_date) : EMPTY_STRING,
                            prefix:inputs.prefix,
                            enquiry_no:inputs.enquiry_no,
                            enquiry_date: inputs.enquiry_date ? getDisplayDate(inputs.enquiry_date) : EMPTY_STRING,
                            is_tax_included: inputs.is_tax_included,
                            terms_condition:inputs.terms_condition,
                            //  prod_category:inputs.prod_category,
                            productCategories:selectedCategory.map(product=>product.value),
                            order_list:rowsData.map(quolist=>({
                                id:quolist.id,
                                tax_id:parseInt(quolist.tax_id),
                                concrete_structure_id:quolist.concrete_structure_id,
                                delivery_mode:quolist.delivery_mode,
                                amount:parseFloat(quolist.amount),
                                rate:parseFloat(quolist.rate),
                                quantity:parseInt(quolist.quantity),
                                product_id:parseInt(quolist.product_id),
                                unit_id:parseInt(quolist.unit_id),
                                user_remarks:quolist.user_remarks
                              })),
                   
                       
                            status:parseBoolean(inputs.status)
                 
                         }, id)
                         //console.log(updateAccountMaster)
                        .then(response => {
                            Swal.fire("Updated!", "", "success");
                            view();
                        }).catch((error) => {
                            console.log(error.response.data);
                            displayError(error.response.data,"Updated Failed");
                        });
                        
                      } 
                      else if (result.isDismissed) {
                        Swal.fire("Not Updated", "", "info");
                      }
                    });
              
              }
            }
            else if(!((rowsData.length > 0)))
            {
              Swal.fire('Please add atleatest  one product', '', 'info')   
            }
        
        }
    
      
      catch (e) {
          displayErrorToast(e);
        } 
    }

    
    
          
  

      const handleCompany = (event) => {
        const name = event.target.name;
        const value = event.target.value;
 
         if(name === "company_id") {
            //console.log(inputs.quotation_date+"quotation_date"+typeof(quotation_date))
            var t = inputs.quotation_date
            //console.log(t.toString()+"toString"); 
            var moment = require('moment');
            var c=moment(t).format("DD-MM-YYYY");
            console.log(c+"c"+typeof(c))
            getQuotationNumber(cookies,c)
          .then((response) => {
            console.log(inputs.quotation_date+"response");
              setInputs(values => ({...values,
              ['quotation_num_prefix']:(response.prefix+response.quotation_no),['quotation_no']:response.quotation_no,['prefix']:response.prefix}))
            });
   
        }
        else if(name === "quotation_date"){
            console.log(value+"quotation_date value"+typeof(value))
            var s = value
            console.log(s.toString()+"s.toString"); 
            var moment = require('moment');
            var d=moment(s).format("DD-MM-YYYY");
            console.log(d+"d"+typeof(d))
            getQuotationNumber(cookies,d)
          .then((response) => {
            console.log(inputs.quotation_date+"response");
            setInputs(values => ({...values,
                ['quotation_num_prefix']:(response.prefix+response.quotation_no),['quotation_no']:response.quotation_no,['prefix']:response.prefix}))
            });
        }
        setInputs(values => ({...values, [name]: event.target.value}))
      }

   

      const handleChangeTableDetails = (index, evnt)=>{
        const { name, value } = evnt.target;
        const rowsInput = [...rowsData];
        rowsInput[index][name] = value;
        if(name === 'product_id')
        {
      
            if(value)
            {
                for(var i=0; i<products.length; i++) 
                {
                if(products[i].id === value)
                {
                   
                    var symbol=products[i].unitSymbol
                    rowsInput[index]['unit_id']= symbol
                }
                }
                
            }
            else
            {
                rowsInput[index]['unit_id']=''
            }
        }
       
        setRowsData(rowsInput);
        
    }
    const handleChangeProduct = (index, evnt)=>{
        const { name, value } = evnt.target;
        const rowsInput = [...rowsData];
        rowsInput[index][name] = value;
        if(name === 'product_id')
        {
            // console.log(value+"value")
            if(value === 'product_id')
            {
                for(var i=0; i<products.length; i++) 
                {
                if(products[i].id == value)
                {
                    // console.log(products[i].unitSymbol+"unitSymbol")
                    var symbol=products[i].unitSymbol
                    rowsInput[index]['unit_id']= symbol
                }
                }
            }
            else
            {
                rowsInput[index]['unit_id']=''
            }
        }
        else if(name === 'quantity')
        {
            console.log((value)+"qty value")
            console.log((rowsInput[index]['rate'])+"rate")
            var amount=value*rowsInput[index]['rate']
            console.log(amount+"amount");
            rowsInput[index]['amount']= amount.toFixed(2)
            var grandTotal = 0;
            for(var i=0; i<rowsData.length; i++) 
            {
                // console.log(rowsData[i].soDAmt+"rowsData.soDAmt")
                if((rowsData[i].amount) == '') 
                {
                    rowsData[i].amount=0 
                    // console.log(grandTotal+"grandTotal_0");
                }
                grandTotal += parseFloat(rowsData[i].amount)
            }
            console.log(grandTotal+"grandTotal");
            //setInputs(values => ({...values, ['soHProdVal']: grandTotal.toFixed(2),['soHOrderAmt']:grandTotal.toFixed(2)}))
        }
        else if(name === 'rate')
        {
            // console.log((value)+"rate value")
            // console.log((rowsInput[index]['soDOrdQty'])+"Qty")
            var amount=value*rowsInput[index]['quantity']
            console.log(amount+"amount");
            rowsInput[index]['amount']= amount.toFixed(2)
            var grandTotal = 0;
            for(var i=0; i<rowsData.length; i++) 
            {
                // console.log(rowsData[i].soDAmt+"rowsData.soDAmt");
                if((rowsData[i].amount) == '') 
                {
                    rowsData[i].amount=0
                    // console.log(grandTotal+"grandTotal_0");
                }
                grandTotal += parseFloat(rowsData[i].amount)
            }
            console.log(grandTotal+"grandTotal");
            //setInputs(values => ({...values, ['soHProdVal']: grandTotal.toFixed(2),['soHOrderAmt']:grandTotal.toFixed(2)}))
        }
        else if(name === 'amount')
        {
            console.log("amount changed")
        }
        setRowsData(rowsInput);
  
    
  }

  const onDeleteQuotation = (event) => {

    event.preventDefault();
    Swal.fire({title: 'Are you sure to Delete?',  
    showCancelButton: true,  
    confirmButtonText: `Yes`,  
    cancelButtonText: `No`,
    }).then((result) => {  
      if (result.isConfirmed) { 

        setIsLoading(true);
        deleteQuotation(cookies, id)
        .then(response => {
            console.log(`Quotation with id ${id} deleted`);
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


        const Reload = () => {
          window.location.reload();
        }      
        const view = () => {
          navigate('/QuotationTable')
        }  
        const Back = () => {
          navigate('/Home')
        }
        const Cancel = () => {
            setInputs({
                company_id:'',
                customer_id:'',
                consignee_id:'',
                enquiry_no:'',
                enquiry_date:'',
                is_tax_included:'true',
                terms_condition:'',
                quotation_no:'',
                quotation_date:'',
                prefix:'',
                prod_category:'',
                status:''
            })
            setRowsData([])
        }
        
        
        const {id}=useParams()
            
        React.useEffect(() => {
            const EMPTY_STRING = '';

          if (id)
         {
        setInProgress(true);
        getQuotationDetails(cookies, id)
          
          .then(response => {
              
              console.log(JSON.stringify(response))
              setInProgress(false);
         
              console.log(typeof(response.quotation_date)+"response.quotation_date")
              setInputs(values => ({...values,['id']:response.id,
              ['company_id']: response.company.id, 
              ['customer_id']: response.customer.id,
              ['consignee_id']:response.consignee.id,
              ['quotation_no']:(response.prefix+response.quotation_no),  
         
            quotation_date:(response.quotation_date? getDisplayDate(response.quotation_date) :EMPTY_STRING),       
              ['enquiry_no']: response.enquiry_no,

            enquiry_date:(response.enquiry_date? getDisplayDate(response.enquiry_date) :EMPTY_STRING),       
              ['is_tax_included']:response.is_tax_included,
            ['terms_condition']: response.terms_condition,
            status:String(response.status)}));
              setSelectedCategory(response.order_list.map(products=>({
                value:products.product.category.id,
                label:products.product.category.name
            })))
       
              setRowsData(response.order_list.map((quolist,index)=>({...quolist,soDSqlNo: index+1,
                concrete_structure_id:quolist.concrete_structure.id,
                tax_id:quolist.tax.id,product_id:quolist.product.id,unit_id:quolist.product.unit.symbol,delivery_mode:quolist.delivery_mode})));
             
                getCustomerMainDetails(cookies, response.customer.id)    
                .then(customerObject => {              //Set the details of the customer in the form fields
                    setSelectedCustomer(customerObject)
                  })
                  getAllCustomerSites(cookies)
        
                  .then (
                      siteList => {
                          
                          const sites = siteList.consignee_list.filter(obj => obj.status && obj.customer.id === parseInt( response.customer.id)).map(
                              site => {
                                  return { value: site.id, label: site.name }
                              }
                          );
                          setSites(sites);
                      }
                  )
                  getCustomerSiteDetails(cookies,response.consignee.id)
                  .then(siteObject => {                     //Set the details of the customer in the form fields
                      setSelectedCustomerSite(siteObject)});
          })

          .catch(error => {
              setInProgress(false);
              displayError(error.response.data, "Loading Failed");
            });
      }
        }, []);
    return (
    <>
     <div id="outer-container"  className="App" > 
        <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
        <LoadingOverlay inProgress={inProgress}/>
        <div id="page-wrap">
        <form onSubmit={handleSubmit} data-id={inputs.id}> 
          <div id="header">
          <h3  className = "text font-weight-bold page-title" >QUOTATION EDIT FORM </h3>
          </div>
         
          <FloatingControls tableLink="/QuotationTable" onCancel={Cancel} enableCancel={true}/>
            <div className="container"> 
                <Row> 
                <Col xl={6} lg={12} md={12}>   
                <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                <h5 className='col-sm-11'><b>Company Details</b></h5><br/>
                        <label htmlFor="company_id" className="form-group col-sm-3 text-right">  Company Location</label>
                        <select id="company_id"name="company_id" className="form-control col-sm-8 mandatory-form-control numsetting browser-default custom-select"  required onChange={handleCompany} value={inputs.company_id || ""}>
                            <option value="">Select Company</option>
                            {companies.map((cmp) => (
                                    <option key={cmp.value} value={cmp.value}>
                                      {cmp.label}
                                          </option>
                                        ))}
                        </select><br/>
                        <label htmlFor="customer_id" className="form-group col-sm-3 text-right">Billing Name</label>
                        <select  id="customer_id" name="customer_id" className="form-control col-sm-8 mandatory-form-control browser-default custom-select" onChange={handleChangeCustomerDetails}  value={inputs.customer_id || ""}>
                            <option value="">Select Billing Name</option>
                            {customer.map((cus) => (
                                    <option key={cus.value} value={cus.value}>
                                      {cus.label}
                                          </option>
                                        ))}
                        </select><SummaryIcon onClickHandler={showCustomerDetails}/>
                       <br/>
                       <label htmlFor="consignee_id" className="form-group col-sm-3 text-right ">Site Name</label>
                        <select  id="consignee_id" name="consignee_id" className="form-control col-sm-8 mandatory-form-control browser-default custom-select" required onChange={handleChangeSiteDetails}  value={inputs.consignee_id || ""}>
                            <option value="">Select Site Name</option>
                            {sites.map((item) => (
                                        <option key={item.value} value={item.value}>
                                        {item.label}
                                        </option>
                                    ))}
                        </select><SummaryIcon onClickHandler={showSiteDetails}/>
                      
                      
                    </div>
                    <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                    <h5 className='col-sm-11'><b>Enquiry Details</b></h5><br/>
                        <label htmlFor="enquiry_no" className="form-group col-sm-4 text-right">Enquiry No.</label>
                        <input type="text" className="form-control col-sm-7" id="enquiry_no"  onChange={handleCompany} style={{backgroundColor:"white"}} value={inputs.enquiry_no || ""}   name="enquiry_no" /><br/>
                        
                        <label htmlFor="enquiry_date" className="form-group col-sm-4 text-right">Enquiry Date</label>
                        <input type="date" className="form-control col-sm-7 " id="enquiry_date"onChange={handleCompany} value={inputs.enquiry_date || ""} name="enquiry_date"/>
                       
                      
                        
                        <label htmlFor="is_tax_included" className="form-group col-sm-4 text-right">Is Inclusive of Taxes?</label>
                        <select id="is_tax_included"className="form-control col-sm-7 browser-default custom-select" onChange={handleCompany} value={inputs.is_tax_included || ""}name="is_tax_included">
                      
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                            </select>
                            <label htmlFor="order_list" className="form-group col-sm-4 text-right">Product Category</label>
                        <div style={{width: '58%'}} >
                        <ReactSelect
                                    options={[...productCategories]}
                                    isMulti= {true}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    components={{Option}}
                                    isClearable={true}
                                    value={selectedCategory}
                                    onChange={onCategorySelect}
                                    className={"mandatory-form-control"}
                                    placeholder="Please select Category"
                                  />
                                  </div>
                    </div>   

                </Col>
                <Col xl={6} lg={12} md={12}>  
                <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                <h5 className='col-sm-11'><b>Quotation Details</b></h5><br/>
                    
                <NumberSetting 
                        handleDateChange={handleQuotationDetails} 
                        serial_no={inputs.order_no} 
                        creation_date={inputs.quotation_date}
                        prefix={inputs.prefix}
                        company_id={inputs.company_id}
                        voucher_type={"quotation"}
                        handleNumberAndPrefixUpdate={updateSONumberAndPrefix}
                        cookies={cookies}
                        serial_no_title ={'Quotation No.'}
                       />
                       <br/><br/>
                </div> 
                  
                    
                       
           
                          <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                    <h5 className='col-sm-11'><b>Terms & Condition Details</b></h5><br/>
                       
                        
                    <label htmlFor="terms_condition" className="form-group col-sm-4 text-right">Terms & Conditions</label>
                            <textarea rows="4" cols="50" className="form-control col-sm-7" id="terms_condition" name="terms_condition" onChange={handleCompany} value={inputs.terms_condition || ""}></textarea>

                            <StatusDropDown status={inputs.status} onChange={handleCompany}/>
                    </div>  
                    <br></br>       
                </Col>
            </Row>
            <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue container table-responsive">
                <table className="table order-list" id="myTable" style={{textAlign:"center",borderRadius:"10px",backgroundColor:"RGB(188,232,253)"}}>
                    <thead>
                        <tr>
                            <th><button type="button"className="btn btn-success" onClick={addTableRows}>+</button></th>
                            <th colSpan="1">S.No.</th>
                            <th colSpan="1">Product</th>
                            <th colSpan="1">Unit</th>
                            <th colSpan="1">Order Qty.</th>
                            <th colSpan="1">Rate / M3</th>
                            <th colSpan="1">Amount</th>
                            <th colSpan="1">Concrete Structure</th>
                            <th colSpan="1">Tax</th>
                            <th colSpan="1">Mode Of Delivery</th>
                            <th colSpan="1">Remarks</th>
                        </tr>
                    </thead>
                    <tbody >

                        <TableRowsQuotationEdit rowsData={rowsData} deleteTableRows={deleteTableRows}  handleChangeTableProduct={handleChangeTableProduct} handleChangeTableDetails={handleChangeTableDetails} handleChangeProduct={handleChangeProduct}products={products} taxes={taxes} groups={concreteCategories}/>
                    </tbody>
                </table>
            </div>  
              
            </div>
       
            <div className="footer text-center">
                              <Button  type="submit"  style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter">Update</Button> &nbsp;&nbsp;               
                    <Button   type="button"style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter"onClick={view}>View</Button>&nbsp;&nbsp;
                    <Button  type="button"style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter"onClick={Back}>Home</Button>&nbsp;&nbsp;
                    <Button className="btn btn-delete"  type="button"style={{width:"80px",fontWeight:"bold"}} onClick={onDeleteQuotation}>Delete</Button>
                              </div>
                        
        </form>
        </div>
    </div>
         </>
    );
  }
  export default QuotationEdit;


