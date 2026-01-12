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
import TableRowsQuotation from "./TableRowsQuotation";
import {moment} from 'moment';
import { Link } from 'react-router-dom';
import {displayErrorToast,parseBoolean,displayError} from '../../helpers';
import FloatingControls from '../../components/FloatingControls';
import StatusDropDown from '../../components/StatusDropDown';
import { getAllCompanies } from '../../services/CompanyServices';
import LoadingOverlay from '../../components/LoadingOverlay';
import { getAllCustomerMain,getCustomerMainDetails } from '../../services/CustomerMainServices';
import { getAllTax } from "../../services/TaxServices";
import { getAllCustomerSites,getCustomerSiteDetails } from '../../services/CustomerSiteServices';
import { getAllPermission } from '../../services/PermissionServices';
import { getAllProducts } from "../../services/ProductServices";
import { getAllGroups } from "../../services/GroupFormServices";
import { createQuotation, getAllQuotation,getQuotationNumber } from "../../services/QuotationServices";
import { getGroupsForCategory } from '../admin/GroupUtils';
import SummaryIcon from '../../components/SummaryIcon';
import { getHTMLForSummaryPopup } from '../../utils/PopupUtils';
import { getDisplayDate } from '../../utils/DateUtils';

function Quotation() {
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
    const [filteredProducts, setFilteredProducts] = React.useState([]);
    const [productCategories, setProductCategories] = React.useState([]);
    const [concreteCategories, setConcreteCategories] = React.useState([]);
    React.useEffect(() => {
var today = new Date().getFullYear()+'-'+("0"+(new Date().getMonth()+1)).slice(-2)+'-'+("0"+new Date().getDate()).slice(-2)
console.log(today+"date")
console.log(typeof(today)+"typeof today")

// var date = new Date();
// var datestring = ("0" + date.getDate()).slice(-2) + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" +date.getFullYear();
// console.log(datestring+"dateString")


setInputs(values => ({...values, ['quotation_date']: today}))
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
   
        const showQuotationDetails = () => {

            if (selectedquotation.id) {
                    Swal.fire({
                        html:getHTMLForSummaryPopup(
                            'QUOTATION DETAILS',
                            [
                            {label: 'CONTACT PERSON NAME', value: selectedquotation.contact_person},            
                            {label: 'DESIGNATION', value: selectedquotation.contact_designation},
                            {label: 'CONTACT MOBILE NUMBER', value: selectedquotation.contact_mobile_no},
                            {label: 'EMAIL ID', value: selectedquotation.contact_email_id}
                            ])
                    }, '', 'info');   
            }
            
        }


    
  
    const [selectedOption, setSelectedOption] = useState(null);
    const [categories, setCategories] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    // console.log(JSON.stringify(selectedOption)+"selectedOption");
   
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
        getAllProducts(cookies)
        .then (
            productList => {
                
                const products = productList.product_list.filter(obj => obj.status);
                setProducts(products);
            }
        )
    }, []);

    const handleChangeTableProduct = (index, evnt)=>{
        const { name, value } = evnt.target;
        const label = evnt.target.options[evnt.target.selectedIndex].text;
         console.log(evnt.target.options[evnt.target.selectedIndex].text)
        const rowsInput = [...rowsData];
        rowsInput[index][name] = value;
        if(label =='TRANSPORT CHARGES' || label=='PUMPING CHARGES'){
        rowsInput[index]['quantity'] = 1;
        }
        else{
            rowsInput[index]['quantity'] = 0;
        }
        rowsInput[index]['unit_id'] = products.filter(product =>product.id === parseInt(value))[0].unit.symbol;
    
        setRowsData(rowsInput);
       }

   
    const handleChangeCustomerDetails = (event) => {
       
        console.log(event.target.value);
        const customerId = event.target.value;
        const propertyName = event.target.name;
        setInputs(values => ({...values, [propertyName]:customerId}));

        //Get the details of the customber using the Id
        getCustomerMainDetails(cookies,customerId)    
        .then(customerObject => {  
            console.log(JSON.stringify(customerObject)+"customerObject")
                        //Set the details of the customer in the form fields
            setSelectedCustomer(customerObject)})  
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
          
        
            if ((Object.values(error).every(x => !x)) && isSubmitting) { 
              console.log(JSON.stringify(inputs)+"inputsubmit")  //If the fields are correct details it is valid choosing yes or no option,otherwise it is invalid
                    Swal.fire({title: 'Do you want to save?',  
                    showCancelButton: true,  
                    confirmButtonText: `Yes`,  
                    cancelButtonText: `No`,
                    }).then((result) => {  
                      if (result.isConfirmed) { 
                        const EMPTY_STRING = '';
                          console.log(JSON.stringify(inputs)+"inputsubmit")
                          createQuotation(cookies, {
                  
                            company_id:parseInt( inputs.company_id),
                            customer_id:parseInt(inputs.customer_id),
                            consignee_id: parseInt(inputs.consignee_id),
                            quotation_no:inputs.quotation_no,
                            quotation_date: inputs.quotation_date ? getDisplayDate(inputs.quotation_date) : EMPTY_STRING,
                            prefix:inputs.prefix,
                            enquiry_no:inputs.enquiry_no,
                            enquiry_date: inputs.enquiry_date ? getDisplayDate(inputs.enquiry_date) : EMPTY_STRING,
                            is_tax_included: inputs.is_tax_included,
                            terms_condition:inputs.terms_condition,
                            prod_category:inputs.prod_category,
                            // order_list:rowsData,
                            // order_list:rowsData.map(rowslist=>rowslist.value),
                            order_list:rowsData.map(quolist=>({
                                tax_id:parseInt(quolist.tax_id),
                                concrete_structure_id:parseInt(quolist.concrete_structure_id),
                                delivery_mode:quolist.delivery_mode,
                                amount:parseFloat(quolist.amount),
                                rate:parseFloat(quolist.rate),
                                quantity:parseInt(quolist.quantity),
                                product_id:parseInt(quolist.product_id),
                                unit_id:parseInt(quolist.unit_id),
                                user_remarks:quolist.user_remarks
                              })),
                            status:parseBoolean(inputs.status)
                         })
                         //console.log(createAccountMaster)
                        .then(response => {
                          Swal.fire("Saved!", "", "success");
                          view();
                        }).catch((error) => {
                            console.log(error.response.data);
                            displayError(error.response.data,"Saved Failed");
                        });
                        
                      } 
                      else if (result.isDismissed) {
                        Swal.fire("Not Saved", "", "info");
                      }
                    });
              }
        
        }
  

      const handleCompany = (event) => {
        const name = event.target.name;
        const value = event.target.value;
 
         if(name === "company_id") {
            console.log(inputs.quotation_date+"quotation_date"+typeof(quotation_date))
            var t = inputs.quotation_date
            console.log(t.toString()+"toString"); 
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
            if(value)
            {
                for(var i=0; i<products.length; i++) 
                {
                if(products[i].id == value)
                {
                    // console.log(products[i].unitSymbol+"unitSymbol")
                    var symbol=products[i].unitSymbol
                    rowsInput[index]['qoUnit']= symbol
                }
                }
            }
            else
            {
                rowsInput[index]['qoUnit']=''
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
            setInputs(values => ({...values, ['soHProdVal']: grandTotal.toFixed(2),['soHOrderAmt']:grandTotal.toFixed(2)}))
        }
        else if(name === 'amount')
        {
            console.log("amount changed")
        }
        setRowsData(rowsInput);
  
    
  }




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
    return (
    <>
     <div id="outer-container"  className="App" > 
        <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
        <LoadingOverlay inProgress={inProgress}/>
        <div id="page-wrap">
        <form onSubmit={handleSubmit} encType="multipart/form-data"> 
          <div id="header">
          <h3  className = "text font-weight-bold page-title" >QUOTATION FORM </h3>
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
                                    defaultValue={selectedOption}
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
                    
                     
                    <label htmlFor="quotation_no" className="form-group col-sm-3 text-right " >Quotation No</label>
                    <input type="text"  id="quotation_no"  className="form-control col-sm-7 mandatory-form-control" name="quotation_num_prefix"  onChange={handleCompany}style={{backgroundColor:"white"}}value={inputs.quotation_num_prefix || ""}/>

{/* 
                    <label htmlFor="prefix"className="form-group col-sm-3 text-right">Prefix </label> 
                        <input type="text" className="form-control col-sm-7 mandatory-form-control" id="prefix"name="prefix" value={inputs.prefix || ""} readOnly={true} style={{backgroundColor:"white", cursor: "not-allowed"}} /><br/> */}

                    <label htmlFor="quotation_date" className="form-group col-sm-3 text-right">Quotation Date</label>
                    <input type="date" id="quotation_date"className="form-control col-sm-7 mandatory-form-control" name="quotation_date"onChange={handleCompany} value={inputs.quotation_date || ""}/>

                   <br/>
                   <br/><br/>
                </div> 
                          <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue form-control-panel" >
                    <h5 className='col-sm-11'><b>Terms & Condition Details</b></h5><br/>
                       
                        
                    <label htmlFor="terms_condition" className="form-group col-sm-4 text-right">Terms & Conditions</label>
                            <textarea rows="4" cols="50" className="form-control col-sm-7" id="terms_condition" name="terms_condition" onChange={handleCompany} value={inputs.terms_condition || ""}></textarea>

                            <StatusDropDown status={inputs.status} onChange={handleCompany}/><br/><br/>
                    </div>  
                        
                </Col>
            </Row>
            <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue container table-responsive">
                <table className="table order-list" id="myTable" style={{textAlign:"center",borderRadius:"10px",backgroundColor:"RGB(188,232,253)"}}>
                    <thead 
                    style={{
                    verticalAlign: "middle",
                    textAlign: "center"}}>
                        <tr>
                            <th><button type="button"className="btn btn-success" onClick={addTableRows}>+</button></th>
                            <th>S.No.</th>
                            <th colSpan="1">Product</th>
                            <th colSpan="1">Unit</th>
                            <th colSpan="1">Order Qty.</th>
                            <th colSpan="1">Rate / M3 </th>
                            <th colSpan="1">Amount</th>
                            <th colSpan="1">Concrete Structure</th>
                            <th colSpan="1">Tax</th>
                            <th colSpan="1">Mode Of Delivery</th>
                            <th colSpan="1">Remarks</th>
                        </tr>
                    </thead>
                    <tbody >

                        <TableRowsQuotation rowsData={rowsData} deleteTableRows={deleteTableRows} handleChangeTableDetails={handleChangeTableDetails} handleChangeTableProduct={handleChangeTableProduct} handleChangeProduct={handleChangeProduct}products={filteredProducts} taxes={taxes} groups={concreteCategories}/>
                    </tbody>
                </table>
            </div>  
              
            </div>
            <div className="footer text-center">
                              <Button  type="submit"  style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter">Save</Button> &nbsp;&nbsp;
                    <Button type="button"  style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}}className="btn btn-twitter" onClick={Cancel}>Reset</Button> &nbsp;&nbsp;
                    <Button   type="button"style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter"onClick={view}>View</Button>&nbsp;&nbsp;
                    <Button  type="button"style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter"onClick={Back}>Home</Button>
                              </div>
        </form>
        </div>
    </div>
         </>
    );
  }
  export default Quotation;