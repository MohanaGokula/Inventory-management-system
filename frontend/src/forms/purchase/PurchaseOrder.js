import React from 'react';
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Row, Col, Button } from "reactstrap";
import axios from "axios";
import Sidebar from '../../Sidebar';
import { useNavigate } from 'react-router';
import { BiSave } from "react-icons/bi";
import { IoIosEye } from "react-icons/io";
import { TiCancel } from "react-icons/ti";
import { AiOutlineHome } from "react-icons/ai";
import { useCookies } from 'react-cookie';
import { default as ReactSelect } from "react-select";
import TableRowsPurchaseOrder from "./TableRowsPurchaseOrder";
import { components } from "react-select";
import { moment } from 'moment';
import { useLocation, Link } from 'react-router-dom';
// import {displayErrorToast} from '../../helpers';
import ErrorToast from '../../ErrorToast';
import { getAllCompanies } from '../../services/CompanyServices';
import { getAllTax } from "../../services/TaxServices";
// import { getAllVendors } from '../../services/VendorServices';
import { getAllProducts } from '../../services/ProductServices';
import { getAllPlants } from '../../services/PlantServices'
import FloatingControls from '../../components/FloatingControls';
import { getPurchaseOrdernumber } from '../../services/PurchaseOrderServices';
import { createPurchaseOrder,getPurchaseOrderumber } from "../../services/PurchaseOrderServices";
import { getDisplayDate } from '../../utils/DateUtils';
import { getGroupsForCategory } from '../admin/GroupUtils';
import { getAllPermission } from '../../services/PermissionServices';
import {displayErrorToast,parseBoolean,displayError} from '../../helpers';
import StatusDropDown from '../../components/StatusDropDown';
import SummaryIcon from '../../components/SummaryIcon';
import { getHTMLForSummaryPopup } from '../../utils/PopupUtils';
import { getAllVendors,getVendorDetails } from '../../services/VendorServices';
import { getCurrentTime } from '../../utils/DateUtils';
import "../../button.css";

function PurchaseOrder() {

    const [company, setcompany] = React.useState([]);
    React.useEffect(() => {
        getAllCompanies(cookies)
        .then (
            companyList => {
                
                const company = companyList.company_data.filter(obj => obj.status).map(
                    company => {
                        return { value: company.id, label: company.entity_name }
                    }
                );
                setcompany(company);
            }
        )
    }, []);

    
    const [vendor, setvendor] = React.useState([])
    React.useEffect(() => {
        getAllVendors(cookies)
        .then (
            vendorList => {
                
                const vendor = vendorList.vendor_list.filter(obj => obj.status).map(
                    vendor => {
                        return { value: vendor.id, label: vendor.entity_name }
                    }
                );
                setvendor(vendor);
            }
        )
    }, []);

    const [plant, setplant] = React.useState([]);
    React.useEffect(() => {
        getAllPlants(cookies)
        .then (
            plantList => {
                
                const plant = plantList.plant_list.filter(obj => obj.status).map(
                    plant => {
                        return { value: plant.id, label: plant.entity_name }
                    }
                );
                setplant(plant);
            }
        )
    }, []);

    const [taxes, setTaxes] = React.useState([]);
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

    const [products, setProducts] = React.useState([]);
    React.useEffect(() => {
        getAllProducts(cookies)
        .then (
            productList => {
                
                const products = productList.product_list.filter(obj => obj.status);
                setProducts(products);
            }
        )
    }, []);

    const [productCategories, setProductCategories] = React.useState([]);
    React.useEffect(() => {

        getGroupsForCategory('PRODUCT', cookies)
        .then(productCategories => {
            console.log(JSON.stringify(productCategories)+"productCategories")
            setProductCategories(productCategories.map(
                category => {
                    return { value: category.id, label: category.entity_name }
                }
            ));
        })
        
     
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

    const [inputs, setInputs] = useState({
        company_id:'',
        vendor_id:'',
        order_no:'',
        order_date:'',
        prefix:'',
        indent_date:'',
        quotation_date:'',
        validity_date:'',
        transport_mode:'own',
        terms_and_condition:'',
        pay_terms:'0',
        is_tax_included:true,
        status:true,
        indent_no:'',
        quotation_no:'',
        // prod_category:'',
    });
    
    React.useEffect(() => {
        var today = new Date().getFullYear()+'-'+("0"+(new Date().getMonth()+1)).slice(-2)+'-'+("0"+new Date().getDate()).slice(-2)
        console.log(today+"date")
        console.log(typeof(today)+"typeof today")
        setInputs(values => ({...values, ['order_date']: today}))
          }, []);
    
    React.useEffect(() => {
        var today = new Date().getFullYear()+'-'+("0"+(new Date().getMonth()+1)).slice(-2)+'-'+("0"+new Date().getDate()).slice(-2)
        console.log(today+"date")
        console.log(typeof(today)+"typeof today")
        setInputs(values => ({...values, ['indent_date']: today}))
            }, []);

    React.useEffect(() => {
        var today = new Date().getFullYear()+'-'+("0"+(new Date().getMonth()+1)).slice(-2)+'-'+("0"+new Date().getDate()).slice(-2)
        console.log(today+"date")
        console.log(typeof(today)+"typeof today")
        setInputs(values => ({...values, ['quotation_date']: today}))
                }, []);
    
    React.useEffect(() => {
        var today = new Date();
        const purchaseOrderDate = new Date(inputs.order_date);
        const validityDate = new Date(purchaseOrderDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        const validityDateString = validityDate.getFullYear() + '-' + ("0" + (validityDate.getMonth() + 1)).slice(-2) + '-' + ("0" + validityDate.getDate()).slice(-2);
        setInputs(values => ({
            ...values,
            ['validity_date']: validityDateString
        }));

    },[inputs.order_date])
    
    const [maxDate, setMaxDate] = React.useState("");
        React.useEffect(() => {
            const today = new Date().toISOString().split("T")[0];
            setMaxDate(today);
        }, []);

        React.useEffect(() => {
        
        
            setInputs(values => ({...values, 
                // ['order_date']: getCurrentDate(),
                ['order_time']: getCurrentTime()
            }))
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
    const [filteredProducts, setFilteredProducts] = React.useState([]);
    const[selectedVendor,setSelectedVendor] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [categories, setCategories] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); 
    const [category] = useCookies(['myCategory']);
    const [superuser] = useCookies(['mySuperuser']);
    const [cookies] = useCookies(['myToken']);
    // const [inputs, setInputs] = useState({});
    const [error, setError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(true);
    const [Appr_so_dtl, setAppr_so_dtl] = React.useState([]);
    const [isChecked, setIsChecked] = useState({
        chkbx: false
    })

    const navigate = useNavigate();
    
    const handleSubmit=(event)=> {
        event.preventDefault()
        
            if( (rowsData.length > 0))
            {
        if ((Object.values(error).every(x => !x)) && isSubmitting) { 
        Swal.fire({title: 'Do you want to save?',  
          showCancelButton: true,  
          confirmButtonText: `Yes`,  
          cancelButtonText: `No`,
          }).then((result) => {  
            if (result.isConfirmed) 
            {
                const EMPTY_STRING = '';
                        console.log(JSON.stringify(inputs) + "inputsubmit");
                        createPurchaseOrder(cookies, {
                            // Data for creating purchase order
                            company_id: parseInt(inputs.company_id),
                            vendor_id: parseInt(inputs.vendor_id),
                            plant_id: parseInt(inputs.plant_id),
                            order_amount:parseFloat(inputs.order_amount),
                            pay_terms:parseInt(inputs.pay_terms),
                            order_no: inputs.order_no,
                            order_date: inputs.order_date ? getDisplayDate(inputs.order_date) : EMPTY_STRING,
                            prefix: inputs.prefix,
                            indent_date: inputs.indent_date ? getDisplayDate(inputs.indent_date) : EMPTY_STRING,
                            quotation_date: inputs.quotation_date ? getDisplayDate(inputs.quotation_date) : EMPTY_STRING,
                            validity_date: inputs.validity_date ? getDisplayDate(inputs.validity_date) : EMPTY_STRING,
                            order_time :inputs.order_time|| EMPTY_STRING,
                            // prod_category: inputs.prod_category,
                            status: inputs.status,
                            indent_no: inputs.indent_no,
                            is_tax_included: parseBoolean(inputs.is_tax_included),
                            quotation_no: inputs.quotation_no,
                            transport_mode:inputs.transport_mode || EMPTY_STRING,
                            // pay_terms: inputs.pay_terms || EMPTY_STRING,
                            terms_and_condition: inputs.terms_and_condition,
                            order_list:rowsData.map(quolist=>({
                                tax_id:parseInt(quolist.tax_id),
                                // _structure_id:parseInt(quolist.concrete_structure_id),
                                // delivery_mode:quolist.delivery_mode,
                                amount:parseFloat(quolist.amount),
                                rate:parseFloat(quolist.rate),
                                quantity:parseFloat(quolist.quantity),
                                product_id:parseInt(quolist.product_id),
                                // unit:parseInt(quolist.unit),
                                user_remarks:quolist.user_remarks
                            })),
                            status: parseBoolean(inputs.status)
                        })
                        .then(response => {
                            Swal.fire("Saved!", "", "success");
                            Reload();
                        })
                        .catch((error) =>
                        {
                            console.log(error.response.data);
                            displayError(error.response.data,"Save Failed");
                        })
              
                    }
                        else if (result.isDismissed) 
                        {    
                            Swal.fire('Not saved', '', 'info')  
                        }
                });
            }
        }
    else if(!((rowsData.length > 0)))
    {
      Swal.fire('Please add atleast one product', '', 'info')   
    }
    
      }
    const Reload = () => {
        window.location.reload();
      }    

   
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
    
        if(name === "company_id") {
            if(value){
                console.log(inputs.order_date+"order_date")
                var t = inputs.order_date
                console.log(t.toString()+"toString"); 
                var moment = require('moment');
                var c=moment(t).format("DD-MM-YYYY");
                console.log(c+"c"+typeof(c))
                getPurchaseOrdernumber(cookies,c)
                .then((response) => {
                console.log(inputs.order_date+"response");
                setInputs(values => ({...values,
                ['purchase_order_prefix']:(response.prefix+response.purchase_order_no),['purchase_order_number']:response.purchase_order_no,['prefix']:response.prefix}))
                })
                .catch((error) =>
                        {
                            console.log(error.response.data);
                            displayError(error.response.data,"");
                        })
            } else{
                setInputs(values => ({
                    ...values,
                    ['purchase_order_prefix']: '',
                    ['purchase_order_number']: '',
                    ['prefix']: ''
                }));
            }
        }
        else if(name === "order_date"){
            console.log(value+"order_date value"+typeof(value))
            var s = value
            console.log(s.toString()+"s.toString"); 
            var moment = require('moment');
            var d=moment(s).format("DD-MM-YYYY");
            console.log(d+"d"+typeof(d))
            getPurchaseOrdernumber(cookies,d)
          .then((response) => {
            console.log(inputs.order_date+"response");
            setInputs(values => ({...values,
                ['purchase_order_prefix']:(response.prefix+response.purchase_order_no),['purchase_order_number']:response.purchase_order_no,['prefix']:response.prefix}))
            })
            .catch((error) =>
                        {
                            console.log(error.response.data);
                            displayError(error.response.data,"");
                        })
        }
        setInputs(values => ({...values, [name]: event.target.value}))
    }


    const showVendorDetails = () => {
        if (!selectedVendor || !selectedVendor.id) {
            // If no vendor is selected, do nothing
            return;
        }
    
        Swal.fire({
            html: getHTMLForSummaryPopup(
                'VENDOR DETAILS',
                [
                    { label: 'ADDRESS', value: selectedVendor.address_1 },
                    { value: selectedVendor.address_2 },
                    { value: selectedVendor.address_3 },
                    { label: 'GST', value: selectedVendor.gst_no },
                    { label: 'PAN', value: selectedVendor.pan_no },
                    { label: 'CONTACT PERSON NAME', value: selectedVendor.contact_person },
                    { label: 'DESIGNATION', value: selectedVendor.contact_designation }
                ]
            )
        }, '', 'info');
    }
    
    const handleChangeVendorDetails = (event) => {
        console.log(event.target.value);
        const vendorId = event.target.value;
        const propertyName = event.target.name;
        setInputs(values => ({ ...values, [propertyName]: vendorId }));
        if (vendorId) {
            //Get the details of the vendor using the Id
            getVendorDetails(cookies, vendorId)
                .then(vendorObject => {
                    // Set the details of the vendor in the state
                    setSelectedVendor(vendorObject);
                });
        } else {
            // Set selectedVendor to an empty object when no vendor is selected
            setSelectedVendor({});
        }
    }
 
    const onCategorySelect = (selected) => {
        setSelectedCategory(selected);
        let filteredPrds = [];
    
        // Move initialization outside of forEach loop
        selected.forEach(productCategory => {
            console.log(productCategory.value+"productCategory.value")
            let localList = products.filter(product => product.category.id === productCategory.value)
                .map(product => {
                    return { value: product.id, label: product.name };
                });
            console.log(JSON.stringify(localList)+"localList")
            console.log(JSON.stringify(products)+"products")
            // Accumulate products from all selected categories
            filteredPrds = [...filteredPrds, ...localList];
        });
    
        // Set filtered products after processing all selected categories
        console.log("Filtered products:", filteredPrds);
        console.log(JSON.stringify(selected)+"selected")
        console.log(JSON.stringify(filteredPrds))
        setFilteredProducts(filteredPrds);
    };
  
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
            if(products[i].id == value)
            {
               
                var symbol=products[i].unitSymbol
                rowsInput[index]['unit']= symbol
                console.log(rowsInput)
            }
            }
        }
        else
        {
            rowsInput[index]['unit']=''
        }
        setRowsData(rowsInput)
    }
    else if(name === 'quantity')
    {

        var amount=value*rowsInput[index]['rate']
   
        rowsInput[index]['amount']= amount.toFixed(2)
        var grandTotal = 0;
        for(var i=0; i<rowsData.length; i++) 
        {

            if((rowsData[i].amount) == '') 
            {
                rowsData[i].amount=0 
            
            }
            grandTotal += parseFloat(rowsData[i].amount)
        }
    
        setInputs(values => ({...values, ['product_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
    }
    else if(name === 'rate')
    {

        var amount=value*rowsInput[index]['quantity']
  
        rowsInput[index]['amount']= amount.toFixed(2)
        var grandTotal = 0;
        for(var i=0; i<rowsData.length; i++) 
        {
           
            if((rowsData[i].amount) == '') 
            {
                rowsData[i].amount=0
              
            }
            grandTotal += parseFloat(rowsData[i].amount)
        }
       
        setInputs(values => ({...values, ['product_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
    }
    else if(name === 'amount')
    {
       
    }
    setRowsData(rowsInput);
    
}


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
    rowsInput[index]['unit'] = products.filter(product =>product.id === parseInt(value))[0].unit.symbol;
    var D=products.filter(product =>product.id === parseInt(value))[0]
    console.log(JSON.stringify(products)+"products")
    console.log(JSON.stringify(evnt.target.value+"value"))
    setRowsData(rowsInput);
   }
    
    
    

    const Cancel = () => {
        // setInputs(() => "")
        setInputs({
            company_id:'',
            vendor_id:'',
            // is_tax_included:'true',
            terms_and_condition:'',
            transport_mode:'',
            is_tax_included:'',
            pay_terms:'',
            order_no:'',
            order_date:'',
            prefix:'',
            indent_date:'',
            quotation_date:'',
            validity_date:'',
            indent_no:'',
            quotation_no:'',
            // prod_category:'',
            status:''
        })
        setRowsData([])
    }
    const [rowsData, setRowsData] = useState([]);
    const addTableRows = () => {
        const count=rowsData.length +1;
        const rowsInput={
                soDSqlNo:count,
                tax_id:'',
                soDConStruc:'',
                soDDeliveryMode:'',
                amount:'',
                rate:'',
                quantity:'',
                unit:'',
                product_id:'',
                user_remarks:''
            }
            setRowsData([...rowsData, rowsInput])
    }
    const deleteTableRows = (index)=>{ // index of row to be deleted
        const rows = [...rowsData];
        rows.splice(index, 1);//splice method to remove the row at the specified index from the rows array.
        for(var i=0; i<rows.length; i++) 
        {
            rows[i]['soDSqlNo']= i+1 
        }
        setRowsData(rows); // renumbers the rows and updates it
    }

    const view = () => {
        navigate('/PurchaseOrderTable')
    }

    const Back = () => {
        navigate('/Home')
    }
    
    return (
        <>
            <div id="outer-container" className="App" >
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} /> 
                <ErrorToast/>
                <div id="page-wrap">
                    <form onSubmit={handleSubmit} >
                        <div id="header">
                            <h3 className="text font-weight-bold page-title">PURCHASE ORDER </h3>
                        </div>
                        
                        <FloatingControls tableLink="/PurchaseOrderTable" onCancel={Cancel} enableCancel={true}/>
                        <div className="container">
                            <Row>
                                <Col xl={6} lg={12} md={12}>
                                    <div className="form-row table-bordered  shadow p-2 my-2 border-secondary p-2 mb-3 form-control-panel " >

                                        <label htmlFor="company_id" className="form-group col-sm-5 text-right">Office</label>
                                        <select id="company_id" name="company_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChange} value={inputs.company_id || ""}>
                                            <option value="">Select Company</option>
                                            {company.map((item) => (
                                                <option key={item.value}value={item.value}>{item.label} </option>
                                            ))} 
                                        </select><br /> 
                                        
                                        <label htmlFor="vendor_id" className="form-group col-sm-5 text-right">Vendor Name</label>
                                        <select id="vendor_id" name="vendor_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChangeVendorDetails} value={inputs.vendor_id || ""}>
                                            <option value="">Select Vendor  Name</option>
                                            {vendor.map((item) => (
                                                <option key={item.value} value={item.value}>{item.label}</option>
                                            ))}
                                        </select><SummaryIcon onClickHandler={showVendorDetails}/><br />

                                        
                                        <label htmlFor="plant_id" className="form-group col-sm-5 text-right">Delivery Place</label>
                                        <select id="plant_id" name="plant_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChange} value={inputs.plant_id || ""}>
                                            <option value="">Select Plant</option>
                                            {plant.map((item) => (
                                                <option key={item.value}value={item.value}>{item.label} </option>
                                            ))} 
                                        </select><br />

                                        <label htmlFor="transport_mode" className="form-group col-sm-5 text-right">Mode Of Delivery</label>
                                        <select id="transport_mode" name="transport_mode" className="form-control col-sm-6  browser-default custom-select" required onChange={handleChange} value={inputs.transport_mode || ""}>
                                            <option value='own'>Own</option>
                                            <option value="customer">Vendor</option>
                                            <option value="own/customer">Own/Vendor</option>

                                        </select><br />

                                        <label htmlFor="pay_terms" className="form-group col-sm-5 text-right">Payment Terms (in Days)</label>
                                        <input type="number" min="0"id="pay_terms" className="form-control col-sm-6"  placeholder="Please fill pay terms in days*" name="pay_terms" onChange={handleChange} value={inputs.pay_terms || 0}/><br/>
                        
                                        <label htmlFor="validity_date" className="form-group col-sm-5 text-right">Validity Date</label>
                                        <input type="date" className="form-control col-sm-6"id="validity_date" name="validity_date"  onChange={handleChange} value={inputs.validity_date || ""}/><br/>
                         
                                       
                                        <label htmlFor="status" className="form-group col-sm-5 text-right ">Status </label>
                                        <select required id="status" name="status" onChange={handleChange} value={inputs.status || ""} className="browser-default custom-select col-sm-6 mandatory-form-control">
                                            <option value='Active'>Active</option>
                                            <option value='Inactive'>Inactive</option>
                                        </select>

                                </div> 

                                </Col>

                                <Col xl={6} lg={12} md={12}>

                                    <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel " >

                                        <label htmlFor="order_no" className="form-group col-sm-4 text-right">Purchase Order No</label>
                                        <input type="text" className="form-control col-sm-7 mandatory-form-control" id="order_no" value={inputs.purchase_order_prefix || ""} style={{ backgroundColor: "white" , cursor: "not-allowed"}} name="purshace_order_prefix" onChange={handleChange}  /><br />
                                        
                                        

                                        <label htmlFor="order_date" className="form-group col-sm-4 text-right ">Date</label>
                                        <input required type="date" id="order_date" name="order_date" onChange={handleChange} className="form-control col-sm-7 mandatory-form-control" value={inputs.order_date || ""} max={maxDate} />
                                        
                                        
                                    {/* </div>
                                    <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 form-control-panel"> */}
                                        <label htmlFor="indent_no" className="form-group col-sm-4 text-right">Indent No</label>
                                        <input type="text" id="indent_no" name="indent_no" className="form-control col-sm-7" value={inputs.indent_no || ""} onChange={handleChange} placeholder="Enter Indent No"/><br />
                                        
                                        <label htmlFor="indent_date" className="form-group col-sm-4 text-right">Indent Date</label>
                                        <input required type="date" id="indent_date" name="indent_date" onChange={handleChange} className="form-control col-sm-7" value={inputs.indent_date || ""} max={maxDate}   />
 

                                        <label htmlFor="quotation_no" className="form-group col-sm-4 text-right">Quotation No</label>
                                        <input type="text" id="quotation_no" name="quotation_no" className="form-control col-sm-7" value={inputs.quotation_no || ""} onChange={handleChange} placeholder="Enter Quotation No"/><br />
                                       
                                        <label htmlFor="quotation_date" className="form-group col-sm-4 text-right">Quotation Date</label>
                                        <input required type="date" className="form-control col-sm-7" id="quotation_date" name="quotation_date"  onchange={handleChange} value={inputs.quotation_date || ""} max={maxDate}  /><br />

                                        <label htmlFor="terms_and_condition" className="form-group col-sm-4 text-right">Terms & Conditions</label>
                                        <textarea rows="2" cols="50" className="form-control col-sm-7" id="terms_and_condition" name="terms_and_condition" onChange={handleChange} value={inputs.terms_and_condition || ""}></textarea>

                                    </div>

                                </Col>


                            </Row>


            <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue container table-responsive">
            <label htmlFor="order_list" className="form-group col-sm-2 text-right">Product Category</label>
                        <div style={{width: '28%'}} >
                        <ReactSelect
                                    options={productCategories}
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
                                    
                                  /><br/>
                                  
                        </div>
                        <label htmlFor="is_tax_included" className="form-group col-sm-3 text-right">Is Inclusive of Taxes?</label>
                        <select id="is_tax_included"className="form-control col-sm-3 browser-default custom-select " name="is_tax_included" onChange={handleChange} value={inputs.is_tax_included || "true"} >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select><br/>  
                            
                <table className="table order-list" id="myTable" style={{textAlign:"center",borderRadius:"10px",backgroundColor:"RGB(188,232,253)"}}>
    
                     <thead>
                        <tr>
                            <th><button type="button"className="btn btn-success" onClick={addTableRows}>+</button></th>
                            <th colSpan="1">S.No.</th>
                            <th colSpan="1">Product</th>
                            <th colSpan="1">Unit</th>
                            <th colSpan="1">Order Qty.</th>
                            <th colSpan="1">Rate / M3 </th>
                            <th colSpan="1">Amount</th>
                            <th colSpan="1">Tax</th> 
                            <th colSpan="1">Remarks</th>
                        </tr>
                    </thead>
                    <tbody >
                    <TableRowsPurchaseOrder rowsData={rowsData} deleteTableRows={deleteTableRows} handleChangeTableDetails={handleChangeTableDetails} handleChangeTableProduct={handleChangeTableProduct} products={filteredProducts} taxes={taxes} />
                    
                    </tbody>
                </table>
                <label htmlFor="order_amount" className="form-group col-sm-9 text-right">Order Value</label>
                <input type="text" className="form-control col-sm-3 order_amount" id="order_amount" value={inputs.order_amount || 0}  readOnly={true} style={{textAlign:"right", cursor: "not-allowed"}} name="order_amount" disabled/>
            </div>  
                        </div>
                        <div className="footer text-center">
                            {/* {((superuser['mySuperuser']) || (category['myCategory'][0].Is_purchaseorder_for_so_add === true)) && ( */}
                                <Button type="submit" className="btn btn-twitter" style={{ width: "80px", fontWeight: "bold" }} >Save</Button>
                            {/* )}&nbsp;&nbsp; */}
                            {/* {((superuser['mySuperuser']) || (category['myCategory'][0].Is_purchaseorder_for_so_add === true)) && ( */}
                                <Button type="reset" className="btn btn-twitter" style={{ width: "80px", fontWeight: "bold" }} onClick={Cancel}>Cancel</Button>
                            {/* )}&nbsp;&nbsp; */}
                            {/* {((superuser['mySuperuser']) || (category['myCategory'][0].Is_purchaseorder_for_so_view === true) || (category['myCategory'][0].Is_purchaseorder_for_so_edit === true) || (category['myCategory'][0].Is_purchaseorder_for_so_delete === true)) && ( */}
                                <Button className="btn btn-twitter" type="button" style={{ width: "80px", fontWeight: "bold" }} onClick={view}>View</Button>
                            {/* )}&nbsp;&nbsp; */}
                            <Button className="btn btn-twitter" type="button" style={{ width: "80px", fontWeight: "bold" }} onClick={Back}>Home</Button>
                        </div>

                    </form>

                </div>


            </div>

        </>

    );
}


export default PurchaseOrder;


  
    // const filterProductsByCategory = (selectedCategories) => {
    //     let filteredPrds = [];
    //     if (selectedCategories) {
    //         selectedCategories.forEach(productCategory=>{
            
    //             let localList = products.filter(product => product.category.id === productCategory.value)
    //                 .map(
    //                     product => {
    //                         return { value: product.id, label: product.name }
    //                     }
    //                 );
    //             filteredPrds=[...filteredPrds,...localList];
    //         });
    //     }
        

    //     return filteredPrds;
    // }
    // const onCategorySelect = (selected) => {
    //     setSelectedCategory(selected);
    //     let filteredPrds = filterProductsByCategory(selected);
    //     setFilteredProducts(filterProductsByQuotation(selectedQuotation?.order_list,filteredPrds));
        
    // };

    
    // const handleChangeTableDetails = (index, evnt)=>{
    //     const { name, value } = evnt.target;
    //     const rowsInput = [...rowsData];
    //     rowsInput[index][name] = value;
    //     if(name === 'product_id')
    //     {
      
    //         if(value)
    //         {
    //             for(var i=0; i<products.length; i++) 
    //             {
    //             if(products[i].id === value)
    //             {
                   
    //                 var symbol=products[i].unitSymbol
    //                 rowsInput[index]['unit_id']= symbol
    //             }
    //             }
                
    //         }
    //         else
    //         {
    //             rowsInput[index]['unit_id']=''
    //         }
    //     }
       
    //     setRowsData(rowsInput);
        
    // }
    // const handleChangeTableDetails = (index, evnt)=>{
    //     const { name, value } = evnt.target;
    //     const rowsInput = [...rowsData];
    //     rowsInput[index][name] = value;
    //     if(name === 'soDProdCode')
    //     {
      
    //         if(value)
    //         {
    //             for(var i=0; i<products.length; i++) 
    //             {
    //             if(products[i].id === value)
    //             {
                   
    //                 var symbol=products[i].unitSymbol
    //                 rowsInput[index]['soDUnit']= symbol
    //             }
    //             }
                
    //         }
    //         else
    //         {
    //             rowsInput[index]['soDUnit']=''
    //         }
    //     }
       
    //     setRowsData(rowsInput);
    //     console.log("Updated soDUnit:", rowsInput[index]['soDUnit']);
    // }
    
    
    
    
//     const handleChangeProduct = (index, evnt)=>{
//         const { name, value } = evnt.target;
//         const rowsInput = [...rowsData];
//         rowsInput[index][name] = value;
//         if(name === 'product_id')
//         {
//             // console.log(value+"value")
//             if(value)
//             {
//                 for(var i=0; i<products.length; i++) 
//                 {
//                 if(products[i].id == value)
//                 {
//                     // console.log(products[i].unitSymbol+"unitSymbol")
//                     var symbol=products[i].unitSymbol
//                     rowsInput[index]['qoUnit']= symbol
//                 }
//                 }
//             }
//             else
//             {
//                 rowsInput[index]['qoUnit']=''
//             }
//         }
//         else if(name === 'quantity')
//         {
//             console.log((value)+"qty value")
//             console.log((rowsInput[index]['rate'])+"rate")
//             var amount=value*rowsInput[index]['rate']
//             console.log(amount+"amount");
//             rowsInput[index]['amount']= amount.toFixed(2)
//             var grandTotal = 0;
//             for(var i=0; i<rowsData.length; i++) 
//             {
//                 // console.log(rowsData[i].soDAmt+"rowsData.soDAmt")
//                 if((rowsData[i].amount) == '') 
//                 {
//                     rowsData[i].amount=0 
//                     // console.log(grandTotal+"grandTotal_0");
//                 }
//                 grandTotal += parseFloat(rowsData[i].amount)
//             }
//             console.log(grandTotal+"grandTotal");
//             //setInputs(values => ({...values, ['soHProdVal']: grandTotal.toFixed(2),['soHOrderAmt']:grandTotal.toFixed(2)}))
//         }
//         else if(name === 'rate')
//         {
//             // console.log((value)+"rate value")
//             // console.log((rowsInput[index]['soDOrdQty'])+"Qty")
//             var amount=value*rowsInput[index]['quantity']
//             console.log(amount+"amount");
//             rowsInput[index]['amount']= amount.toFixed(2)
//             var grandTotal = 0;
//             for(var i=0; i<rowsData.length; i++) 
//             {
//                 // console.log(rowsData[i].soDAmt+"rowsData.soDAmt");
//                 if((rowsData[i].amount) == '') 
//                 {
//                     rowsData[i].amount=0
//                     // console.log(grandTotal+"grandTotal_0");
//                 }
//                 grandTotal += parseFloat(rowsData[i].amount)
//             }
//             console.log(grandTotal+"grandTotal");
//             setInputs(values => ({...values, ['soHProdVal']: grandTotal.toFixed(2),['soHOrderAmt']:grandTotal.toFixed(2)}))
//         }
//         else if(name === 'amount')
//         {
//             console.log("amount changed")
//         }
//         setRowsData(rowsInput);
  
    
//   }





                                        {/* <label htmlFor="indent_date" className="form-group col-sm-4 text-right">Indent Date</label>
                                        <input type="date" className="form-control col-sm-7" id="indent_date" name="indent_date" style={{ backgroundColor: "white", cursor: "not-allowed" }} onChange={handleChange} value={inputs.indent_date || ""} max={maxDate} /><br /> */}

                                        {/* <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 form-control-panel"> */}
{/* <label htmlFor="quHTaxcode" className="form-group col-sm-4 text-right">Tax Structure</label>
                                        <select id="quHTaxcode" name="quHTaxcode" className="form-control col-sm-7  browser-default custom-select" required onChange={handleChange} value={inputs.quHTaxcode || ""}>
                                            <option value="">Select Tax</option>
                                            {taxes.map((item) => (
                                                <option key={item.id} value={item.value}>{item.label}</option>
                                            ))}

                                        </select> */}
                                        {/* <label htmlFor="soHSubGrpCode" className="form-group col-sm-4 text-right">Product Category</label>
                                        <select id="soHSubGrpCode" name="soHSubGrpCode" className="form-control col-sm-7  browser-default custom-select" required onChange={handleChange} value={inputs.soHSubGrpCode || ""}>
                                            <option value="">Select Category</option>
                                            {company.map((item) => (
                                                <option key={item.id} value={item.id}>{item.subgrpName}</option>
                                            ))}

                                        </select> */}

                                        {/* <input required type="time" min="0" value={inputs.puHSlTime || 0} onChange={handleChange} className="form-control col-sm-2" />
                                         */}
                                        {/* <label htmlFor="puHPrefix" className="form-group col-sm-4 text-right">Prefix</label>
                                        <input type="text" className="form-control col-sm-7" id="puHPrefix" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br /> */}


// console.log(inputs.purchase_order_date+"purchase_order_date")
            // var t = inputs.purchase_order_date
            // console.log(t.toString()+"toString"); 
            // var moment = require('moment');
            // var c=moment(t).format("DD-MM-YYYY");
            // console.log(c+"c"+typeof(c))
            // getPurchaseOrdernumber(cookies,c)
            // .then((response) => {
            // console.log(inputs.purchase_order_date+"response");
            //   setInputs(values => ({...values,
            //   ['purchase_order_prefix']:(response.prefix+response.purchase_order_no),['purchase_order_number']:response.purchase_order_no,['prefix']:response.prefix}))
            //   }
            // );

// const showVendorDetails = () =>{
    //     // if (!selectedVendor.id) {
    //     //     // If no vendor is selected, do nothing
    //     //     return;
    //     // }
    //     if (selectedVendor.id) {
    //         Swal.fire({
    //             html:getHTMLForSummaryPopup(
    //                 'VENDOR DETAILS',
    //                 [
    //                 {label: 'ADDRESS', value: selectedVendor.address_1},
    //                 {value: selectedVendor.address_2},
    //                 {value: selectedVendor.address_3},
    //                 {label: 'GST', value: selectedVendor.gst_no},
    //                 {label: 'PAN', value: selectedVendor.pan_no},
    //                 {label: 'CONTACT PERSON NAME', value: selectedVendor.contact_person},
    //                 {label: 'DESIGNATION', value: selectedVendor.contact_designation},
    //                 // {label: 'CONTACT PERSON NAME', value: selectedCustomer.contact_person},            
    //                 // {label: 'DESIGNATION', value: selectedCustomer.contact_designation},
    //                 // {label: 'CONTACT MOBILE NUMBER', value: selectedCustomer.contact_mobile_no},
    //                 // {label: 'EMAIL ID', value: selectedCustomer.contact_email_id}
    //                 ])
    //         }, '', 'info');   
    //     } 

    // }

     {/* <th colSpan="1">Tax</th> */}
                            {/* <th colSpan=""></th> */}
    // const handleChangeVendorDetails = (event) => {
       
    //     console.log(event.target.value);
    //     const vendorId = event.target.value;
    //     const propertyName = event.target.name;
    //     setInputs(values => ({...values, [propertyName]:vendorId}));
    //     if(vendorId){
    //        //Get the details of the customber using the Id
    //     getVendorDetails(cookies,vendorId)    
    //     .then(vendorObject => {              //Set the details of the customer in the form fields
    //         setSelectedVendor(vendorObject)
    //       })
    //     }
    // }

{/* <label htmlFor="add1" className="form-group col-sm-3 text-right">Address</label>
                                        <input type="text" className="form-control col-sm-8" id="add1" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />

                                        <label htmlFor="add2" className="form-group col-sm-3 text-right"></label>
                                        <input type="text" className="form-control col-sm-8" id="add2" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />

                                        <label htmlFor="add3" className="form-group col-sm-3 text-right"></label>
                                        <input type="text" className="form-control col-sm-8" id="add3" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />

                                        <label htmlFor="PanNo" className="form-group col-sm-3 text-right">PAN No.</label>
                                        <input type="text" className="form-control col-sm-8" id="PanNo" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />


                                        <label htmlFor="GstNo" className="form-group col-sm-3 text-right">GST No.</label>
                                        <input type="text" className="form-control col-sm-8" id="GstNo" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />

                                        <label htmlFor="puHContactPerson" className="form-group col-sm-3 text-right">Contact Person.</label>
                                        <input type="text" className="form-control col-sm-8" id="puHContactPerson" style={{ backgroundColor: "white" }} /><br />

                                        <label htmlFor="puHDesignation" className="form-group col-sm-3 text-right">Designation</label>
                                        <input type="text" className="form-control col-sm-8" id="puHDesignation" style={{ backgroundColor: "white" }} /><br /> */}


 {/* <input type="text" className="form-control col-sm-8" id="puHDelivery" style={{ backgroundColor: "white" }} /><br /> */}

                                        {/* <label htmlFor="puHDeliveryadd1" className="form-group col-sm-3 text-right"></label>
                                        <input type="text" className="form-control col-sm-8" id="puHDeliveryadd1" style={{ backgroundColor: "white" }} /><br />

                                        <label htmlFor="puHDeliveryadd2" className="form-group col-sm-3 text-right"></label>
                                        <input type="text" className="form-control col-sm-8" id="puHDeliveryadd2" style={{ backgroundColor: "white" }} /><br /> */}
// React.useEffect(() => {
    //     var today = new Date();
    //     var purchaseOrderDate = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
    //     console.log("Purchase Order Date:", purchaseOrderDate);
    //     var validityDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    //     var validityDateString = validityDate.getFullYear() + '-' + ("0" + (validityDate.getMonth() + 1)).slice(-2) + '-' + ("0" + validityDate.getDate()).slice(-2);
    //     console.log("Validity Date:", validityDateString);
    //     setInputs(values => ({
    //         ...values,
    //         ['validity_date']: validityDateString
    //             }));
    // }, [inputs.purchase_order_date]);
  
    

       
    // const formatDate = (date) => {
    //     const dd = String(date.getDate()).padStart(2, '0');
    //     const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    //     const yyyy = date.getFullYear();
    //     return `${dd}-${mm}-${yyyy}`;
    // };
    //     const today = new Date();
    //     const formattedDate = formatDate(today);
// order_list: rowsData.map(order => ({
                        //     // Data for each order in the order list
                        //     // Modify this part according to your order data structure
                        //     product_id: parseInt(order.product_id),
                        //     quantity: parseInt(order.quantity),
                        //     unit_price: parseFloat(order.unit_price),
                            // Add other fields as needed
// const handleChange = (index, evnt) => {
    //     const { name, value } = evnt.target;
    //     const rowsInput = [...rowsData];
    //     rowsInput[index][name] = value;  // updating value of the specific property name



    //     setRowsData(rowsInput); // new rows will be updated
    // }


    // const [rowsData, setRowsData] = useState([]);
    // const addTableRows = () => {
    //     const count=rowsData.length +1;
    //     // console.log(count+"count_add")
    //     const rowsInput={
    //             soDSqlNo:count,
    //             tax_id:'',
    //             // concrete_structure_id:'',
    //             delivery_mode:'',
    //             // unit_id:'',
    //             quantity:'',
    //             rate:'',
    //             amount:'',
    //             // product_id:'',
    //             soDProdCode:'',
    //             soDUnit:'',
    //             user_remarks:''
    //         }
    //         setRowsData([...rowsData, rowsInput])
    // }
    // const handleSubmit=(event)=> {
    //     event.preventDefault();
    //     if( (rowsData.length > 0)){
    //         if ((Object.values(error).every(x => !x)) && isSubmitting) {
    //             // Check if there are no errors and the form is being submitted
    //             console.log(JSON.stringify(inputs) + "inputsubmit");
    //             Swal.fire({
    //                 title: 'Do you want to save?',
    //                 showCancelButton: true,
    //                 confirmButtonText: `Yes`,
    //                 cancelButtonText: `No`,
    //             }).then((result) => {
    //                 if (result.isConfirmed) {
    //                     // If user confirms to save
    //                     const EMPTY_STRING = '';
    //                     console.log(JSON.stringify(inputs) + "inputsubmit");
    //                     createPurchaseOrder(cookies, {
    //                         // Data for creating purchase order
    //                         company_id: parseInt(inputs.company_id),
    //                         vendor_id: parseInt(inputs.vendor_id),
    //                         plant_id: parseInt(inputs.plant_id),
    //                         order_amount:parseInt(inputs.order_amount),
    //                         pay_terms:parseInt(inputs.pay_terms),
    //                         order_no: inputs.order_no,
    //                         order_date: inputs.order_date ? getDisplayDate(inputs.order_date) : EMPTY_STRING,
    //                         prefix: inputs.prefix,
    //                         indent_date: inputs.indent_date ? getDisplayDate(inputs.indent_date) : EMPTY_STRING,
    //                         quotation_date: inputs.quotation_date ? getDisplayDate(inputs.quotation_date) : EMPTY_STRING,
    //                         validity_date: inputs.validity_date ? getDisplayDate(inputs.validity_date) : EMPTY_STRING,
    //                         order_time :inputs.order_time|| EMPTY_STRING,
    //                         // prod_category: inputs.prod_category,
    //                         status: inputs.status,
    //                         indent_no: inputs.indent_no,
    //                         is_tax_included: parseBoolean(inputs.is_tax_included),
    //                         quotation_no: inputs.quotation_no,
    //                         transport_mode:inputs.transport_mode,
    //                         // pay_terms: inputs.pay_terms || EMPTY_STRING,
    //                         terms_and_condition: inputs.terms_and_condition,
    //                         order_list:rowsData.map(quolist=>({
    //                             tax_id:parseInt(quolist.tax_id),
    //                             // _structure_id:parseInt(quolist.concrete_structure_id),
    //                             delivery_mode:quolist.delivery_mode,
    //                             amount:parseFloat(quolist.amount),
    //                             rate:parseFloat(quolist.rate),
    //                             quantity:parseInt(quolist.quantity),
    //                             product_id:parseInt(quolist.product_id),
    //                             unit:parseInt(quolist.unit),
    //                             user_remarks:quolist.user_remarks
    //                         })),
    //                         status: parseBoolean(inputs.status)
    //                     }).then(response => {
    //                         // Handle successful response
    //                         Swal.fire("Saved!", "", "success");
    //                         Reload();
    //                         // view(); // Call view function after successful save
    //                     }).catch((error) => {
    //                         // Handle error
    //                         console.log(error.response.data);
    //                         displayError(error.response.data, "Saved Failed");
    //                     });
    //                 } else if (result.isDismissed) {
    //                     // If user dismisses the dialog
    //                     Swal.fire("Not Saved", "", "info");
    //                 }
    //         });
    //     }
    //     }
    //     else if(!((rowsData.length > 0)))
    //     {
    //         Swal.fire('Please add atleatest one product', '', 'info')   
    //     }

    // }
      // const onCategorySelect = (selected) => {
    //         setSelectedCategory(selected);
    //         // Handle other actions based on selected categories if needed
    //     };
    
    //     useEffect(() => {
    //         // Fetch product categories data and set options
    //         fetchProductCategoriesData().then(categories => {
    //             setProductCategories(categories.map(category => ({
    //                 value: category.id,
    //                 label: category.name
    //             })));
    //         });
    //     }, []); 
     // const handleSubmit = (event) => {
    //     event.preventDefault();
    //     var err = 0;// error variable initialization
    //     try{
    //         if (err == 0) { //If all the required fields are field u can select the save button then choose the option yes or no
    //             Swal.fire({
    //                 title: 'Do you want to save?',
    //                 showCancelButton: true,
    //                 confirmButtonText: `Yes`,
    //                 cancelButtonText: `No`,
    //             }).then((result) => {
    //                 if (result.isConfirmed) {
    //                     const EMPTY_STRING = '';
    //                       console.log(JSON.stringify(inputs)+"inputsubmit")
    //                       createPurchaseOrder(cookies, {
    //                         company_id:parseInt( inputs.company_id),
    //                         vendor_id:parseInt(inputs.vendor_id),
    //                         plant_id:parseInt(inputs.plant_id),
    //                         transport_mode:parseInt(inputs.transport_mode),
    //                         purchase_order_number:inputs.purchase_order_number,
    //                         purchase_order_date_date: inputs.purchase_order_date ? getDisplayDate(inputs.purchase_order_date) : EMPTY_STRING,
    //                         prefix:inputs.prefix,
    //                         indent_date: inputs.indent_date ? getDisplayDate(inputs.indent_date) : EMPTY_STRING,
    //                         quotation_date: inputs.quotation_date ? getDisplayDate(inputs.quotation_date) : EMPTY_STRING,
    //                         validity_date:inputs.validity_date ? getDisplayDate(inputs.validity_date) : EMPTY_STRING,
    //                         prod_category:inputs.prod_category,
    //                         indent_no:inputs.indent_no,
    //                         quotation_no:inputs.quotation_no,
    //                         puHPayterms:inputs.puHPayterms,
    //                         terms_condition:inputs.terms_condition,

    //                         order_list:rowsData.map(quolist=>({
    //                             soDTaxCode:parseInt(quolist.soDTaxCode),
    //                             // _structure_id:parseInt(quolist.concrete_structure_id),
    //                             delivery_mode:quolist.delivery_mode,
    //                             soDAmt:parseFloat(quolist.soDAmt),
    //                             soDRate:parseFloat(quolist.soDRate),
    //                             soDOrdQty:parseInt(quolist.soDOrdQty),
    //                             soDProdCode:parseInt(quolist.soProdCode),
    //                             soDUnit:parseInt(quolist.soDUnit),
    //                             user_remarks:quolist.user_remarks
    //                           })),
    //                         status:parseBoolean(inputs.status)
    //                       })
    //                     // axios.post('http://127.0.0.1:8000/PurchaseOrder/', {
    //                     //     rowsData: rowsData,
    //                     //     dcCompCode: inputs.dcCompCode,
    //                     //     wsSlNo: inputs.wsSlNo
    //                     // },
    //                     // {
    //                     //     headers: {
    //                     //         'Authorization': `Token ${cookies['myToken']}`
    //                     //     }
    //                     // })
    //                 //     .then(function (response) {
    //                 //         console.log(JSON.stringify(response) + "response");
    //                 //     }).catch(function (error) {
    //                 //         console.log(JSON.stringify(error) + "error");
    //                 //     })
    //                 // Swal.fire('Saved!', '', 'success')
    //                 // Cancel();
    //                 .then(response => {
    //                     Swal.fire("Saved!", "", "success");
    //                     view();
    //                   }).catch((error) => {
    //                       console.log(error.response.data);
    //                       displayError(error.response.data,"Saved Failed");
    //                   });
    //             }
    //             else if (result.isDismissed) {
    //                 Swal.fire('Not saved', '', 'info')
    //             }
    //         });
    //         }
    //         else {
    //             Swal.fire('Please check the value')
    //         }
    //     }
    
    //     catch(e)
    //     {
    //     displayErrorToast(e);
    //     }
    // }
    
    // const handleChange = (event) => {
    //     const name = event.target.name;
    //     const value = event.target.value;
    
    //     try {
    //         if (name === 'company_id') {
    //             const apiUrl = `http://127.0.0.1:8000/api/purchase_orders/purchase_order_number?purchase_order_date=${value}`;
    //             fetch(apiUrl, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Authorization': `Token ${cookies['myToken']}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             })
    //             .then(response => response.json())
    //             .then((response) => {
    //                 // const concatenatedValue = data.prefix + data.purchase_order_no;
    //                 setInputs(values => ({ 
    //                     ...values, 
    //                     ['purchase_order_prefix']: response.prefix+response.purchase_order_no,
    //                     ['purchase_order_no']: response.purchase_order_no,
    //                     ['prefix']: response.prefix
    //                 }));
    //             })
    //             .catch(error => {
    //                 console.error("Error fetching purchase order number:", error);
    //             });
    //         } else {
    //             setInputs(values => ({
    //                 ...values,
    //                 [name]: value
    //             }));
    //         }
    //     } catch(e) {
    //         displayErrorToast(e);
    //     }
    // };
       


    // const onCategorySelect = (selected) => {
    //     setSelectedCategory(selected);
    //     let filteredPrds = [];
    //     selected.forEach(productCategory=>{
            
    //         let localList = products.filter(product => product.category.id === productCategory.value)
    //             .map(
    //                 product => {
    //                     return { value: product.id, label: product.name }
    //                 }
    //             );
    //         filteredPrds=[...filteredPrds,...localList];
    //     });
    //     setFilteredProducts(filteredPrds);
        
    // };
