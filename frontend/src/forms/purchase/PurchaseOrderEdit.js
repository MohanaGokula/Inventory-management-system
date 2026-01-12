import React from 'react';
import { useState, useEffect } from "react";
import {useParams } from 'react-router-dom';
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
// import { getPurchaseOrdernumber } from '../../services/PurchaseOrderServices';
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
import {getPurchaseOrderDetails,updatePurchaseOrder,deletePurchaseOrder} from '../../services/PurchaseOrderServices'
import "../../button.css";
import NumberSetting from '../../components/NumberSetting';
import TableRowsPurchaseOrderEdit from './TableRowsPurchaseOrderEdit';

function PurchaseOrderEdit(){
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
                        return { value: plant.id, label: plant.plant_alias }
                    }
                );
                setplant(plant);
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

    const [categories, setCategories] = React.useState([]);
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

    const [filteredProducts, setFilteredProducts] = React.useState([]);
    const[selectedVendor,setSelectedVendor] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null); 
    const [category] = useCookies(['myCategory']);
    const [superuser] = useCookies(['mySuperuser']);
    const [cookies] = useCookies(['myToken']);
    const [error, setError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(true);
    const [Appr_so_dtl, setAppr_so_dtl] = React.useState([]);
    const [isChecked, setIsChecked] = useState({
        chkbx: false
    })
    const navigate = useNavigate();

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
        console.log(name+"name")
        console.log(value+"value")
        console.log(JSON.stringify(products)+"products")
        // if(value){
        rowsInput[index]['unit'] = value?products.filter(product =>product.id === parseInt(value))[0].unit.symbol:"";
        // setRowsData(rowsInput);
        //}
        
        
        setRowsData(rowsInput);
    }

    const onCategorySelect = (selected) => {
        setSelectedCategory(selected);
        let filteredPrds = filterProductsByCategory(selected);

    
        // Move initialization outside of forEach loop
        // selected.forEach(productCategory => {
        //     console.log(productCategory.value+"productCategory.value")
        //     let localList = products.filter(product => product.category.id === productCategory.value)
        //         .map(product => {
        //             return { value: product.id, label: product.name };
        //         });
            // console.log(JSON.stringify(localList)+"localList")
            console.log(JSON.stringify(products)+"products onCategorySelect")
            // Accumulate products from all selected categories
            // filteredPrds = [...filteredPrds, ...localList];
        //});
    
        // Set filtered products after processing all selected categories
        // console.log("Filtered products:", filteredPrds);
        console.log(JSON.stringify(selected)+"selected")
        console.log(JSON.stringify(filteredPrds)+"filteredPrds")
        // setProducts(filteredPrds);
        setFilteredProducts(filteredPrds);
        setRowsData(rowsData.map((quolist,index)=>({...quolist,unit:''})));
         
    };

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
        // setInputs(values => ({
        //     ...values,
        //     ['validity_date']: validityDateString
        // }));

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
                // getPurchaseOrdernumber(cookies,c)
                .then((response) => {
                console.log(inputs.order_date+"response");
                setInputs(values => ({...values,
                ['order_no']:(response.prefix+response.order_no),['purchase_order_number']:response.order_no,['prefix']:response.prefix}))
                })
                .catch((error) =>
                        {
                            console.log(error.response.data);
                            displayError(error.response.data,"");
                        })
            } else{
                setInputs(values => ({
                    ...values,
                    ['order_no']: '',
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
            // getPurchaseOrdernumber(cookies,d)
          .then((response) => {
            console.log(inputs.order_date+"response");
            setInputs(values => ({...values,
                ['order_no']:(response.prefix+response.order_no),['purchase_order_number']:response.order_no,['prefix']:response.prefix}))
            })
            .catch((error) =>
                        {
                            console.log(error.response.data);
                            displayError(error.response.data,"");
                        })
        }
        setInputs(values => ({...values, [name]: event.target.value}))
    }

    // const handleChangeTableDetails = (index, evnt)=>{
    //     const { name, value } = evnt.target;
    //     const rowsInput = [...rowsData];
    //     if(name === 'product_id')

    //     rowsInput[index][name] = v
      
    //         if(value)
    //         {
    //             for(var i=0; i<products.length; i++) 
    //             {
    //             if(products[i].id == value)
    //             {
                   
    //                 var symbol=products[i].unitSymbol
    //                 rowsInput[index]['unit']= symbol
    //                 console.log(rowsInput)
    //             }
    //             }
    //         }
    //         else
    //         {
    //             rowsInput[index]['unit']=''
    //         }
    //         setRowsData(rowsInput)
    //     }
    //     else if(name === 'quantity')
    //     {
    
    //         var amount=value*rowsInput[index]['rate']
       
    //         rowsInput[index]['amount']= amount.toFixed(2)
    //         var grandTotal = 0;
    //         for(var i=0; i<rowsData.length; i++) 
    //         {
    
    //             if((rowsData[i].amount) == '') 
    //             {
    //                 rowsData[i].amount=0 
                
    //             }
    //             grandTotal += parseFloat(rowsData[i].amount)
    //         }
        
    //         setInputs(values => ({...values, ['product_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
    //     }
    //     else if(name === 'rate')
    //     {
    
    //         var amount=value*rowsInput[index]['quantity']
      
    //         rowsInput[index]['amount']= amount.toFixed(2)
    //         var grandTotal = 0;
    //         for(var i=0; i<rowsData.length; i++) 
    //         {
               
    //             if((rowsData[i].amount) == '') 
    //             {
    //                 rowsData[i].amount=0
                  
    //             }
    //             grandTotal += parseFloat(rowsData[i].amount)
    //         }
           
    //         setInputs(values => ({...values, ['product_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
    //     }
    //     else if(name === 'amount')
    //     {
           
    //     }
    //     setRowsData(rowsInput);
        
    // }
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
                    rowsInput[index]['unit']= symbol
                }
                }
            }
            else
            {
                rowsInput[index]['unit']=''
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


//     const handleSubmit=(event)=> {
//         event.preventDefault()
        
//         if( (rowsData.length > 0))
//         {
//             const EMPTY_STRING = '';
//         if ((Object.values(error).every(x => !x)) && isSubmitting) { 
//         Swal.fire({title: 'Do you want to Update?',  
//           showCancelButton: true,  
//           confirmButtonText: `Yes`,  
//           cancelButtonText: `No`,
//           }).then((result) => { 
           
//             if (result.isConfirmed) 
//             {
//                 var moment = require('moment')
//                         console.log(JSON.stringify(inputs) + "inputsubmit");
//                         updatePurchaseOrder(cookies, {
//                             // Data for creating purchase order
//                             company_id: parseInt(inputs.company_id),
//                             vendor_id: parseInt(inputs.vendor_id),
//                             plant_id: parseInt(inputs.plant_id),
//                             order_amount:parseFloat(inputs.order_amount),
//                             pay_terms:parseInt(inputs.pay_terms),
//                             order_no: inputs.order_no,
//                             order_date: inputs.order_date ? getDisplayDate(inputs.order_date) : EMPTY_STRING,
//                             prefix: inputs.prefix,
//                             indent_date: inputs.indent_date ? getDisplayDate(inputs.indent_date) : EMPTY_STRING,
//                             quotation_date: inputs.quotation_date ? getDisplayDate(inputs.quotation_date) : EMPTY_STRING,
//                             validity_date: inputs.validity_date ? getDisplayDate(inputs.validity_date) : EMPTY_STRING,
//                             order_time :inputs.order_time|| EMPTY_STRING,
//                             // prod_category: inputs.prod_category,
//                             status: inputs.status,
//                             indent_no: inputs.indent_no,
//                             is_tax_included: parseBoolean(inputs.is_tax_included),
//                             quotation_no: inputs.quotation_no,
//                             transport_mode:inputs.transport_mode || EMPTY_STRING,
//                             // pay_terms: inputs.pay_terms || EMPTY_STRING,
//                             terms_and_condition: inputs.terms_and_condition,
//                             productCategories:selectedCategory.map(product=>product.value),
//                             order_list:rowsData.map(quolist=>({
//                                 id:quolist.id,
//                                 tax_id:parseInt(quolist.tax_id),
//                                 // _structure_id:parseInt(quolist.concrete_structure_id),
//                                 // delivery_mode:quolist.delivery_mode,
//                                 amount:parseFloat(quolist.amount),
//                                 rate:parseFloat(quolist.rate),
//                                 quantity:parseFloat(quolist.quantity),
//                                 product_id:parseInt(quolist.product_id),
//                                 unit:parseInt(quolist.unit),
//                                 user_remarks:quolist.user_remarks
//                             })),
//                             status: parseBoolean(inputs.status)
//                         }, id)
//                         .then(response => {
//                             console.log("Update response:", response);
//                             Swal.fire("Updated!", "", "success");
//                             view();
//                         })

//                         .catch((error) =>
//                         {
//                             console.log("Update error:", error);
//                             console.log(error.response.data);
//                             displayError(error.response.data,"Update Failed");
//                         })
              
//                     }
//                         else if (result.isDismissed) 
//                         {    
//                             Swal.fire('Not Updated', '', 'info')  
//                         }
//                 });
//             }
//         }
//     else if(!((rowsData.length > 0)))
//     {
//         Swal.fire('Please add atleast one product', '', 'info')   
//     }
        
      
    
// }
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
                  updatePurchaseOrder(cookies, {

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
                    // status: inputs.status,
                    indent_no: inputs.indent_no,
                    is_tax_included: parseBoolean(inputs.is_tax_included),
                    quotation_no: inputs.quotation_no,
                    transport_mode:inputs.transport_mode || EMPTY_STRING,
                                                // pay_terms: inputs.pay_terms || EMPTY_STRING,
                    terms_and_condition: inputs.terms_and_condition,
                    // productCategories:selectedCategory.map(product=>product.value),
                    order_list:rowsData.map(quolist=>({
                    id:quolist.id,
                    tax_id:parseInt(quolist.tax_id),
                                                    // _structure_id:parseInt(quolist.concrete_structure_id),
                                                    // delivery_mode:quolist.delivery_mode,
                    amount:parseFloat(quolist.amount),
                    rate:parseFloat(quolist.rate),
                    quantity:parseFloat(quolist.quantity),
                    product_id:parseInt(quolist.product_id),
                    unit:parseInt(quolist.unit),
                    user_remarks:quolist.user_remarks
                    })),
                    status: parseBoolean(inputs.status)
                 }, id)
                 //console.log(updateAccountMaster)
                .then(response => {
                    console.log("Update response:", response);
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

    const Reload = () => {
        window.location.reload();
      }
      
      const handlePODetails = (event) => {
        const name = event.target.name;
        const value = event.target.value;
    
        if(name === "creation_date"){
            setInputs(values => ({...values, 'order_date': event.target.value}))
       
            
        } else {
         
            setInputs(values => ({...values, [name]: event.target.value}))
        }
        
      }

  
    // const updateSONumberAndPrefix = (prefix, serial_no) => {

    //     setInputs(values => ({...values,
    //         ['Purchase_order_prefix']:(prefix+serial_no),
    //         ['order_no']:serial_no,
    //         ['prefix']:prefix}));
     
    //   }


    const [rowsData, setRowsData] = useState([]);
    const addTableRows = () => {
        const count=rowsData.length +1;
        const rowsInput={
                soDSqlNo:count,
                id:'',
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

    // const deleteTableRows = (index)=>{ // index of row to be deleted
    //     const rows = [...rowsData];
    //     rows.splice(index, 1);//splice method to remove the row at the specified index from the rows array.
    //     for(var i=0; i<rows.length; i++) 
    //     {
    //         rows[i]['soDSqlNo']= i+1 
    //     }
    //     setRowsData(rows); // renumbers the rows and updates it
    // }
    
    const [toDelete_DtlIds,settoDelete] = useState([]);
    
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
                        rows[i]['soDSqlNo']= i+1
                        // console.log(rowsData[i].so_amt+"rowsData.so_amt");
                        if((rows[i].amount) == '') 
                        {
                            rows[i].amount=0
                            // console.log(grandTotal+"grandTotal_0");
                        }
                        grandTotal += parseFloat(rows[i].amount)
                    }
                    console.log(grandTotal+"grandTotal");
                    setInputs(values => ({...values, ['product_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
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
                rows[i]['soDSqlNo']= i+1
                // console.log(rowsData[i].so_amt+"rowsData.so_amt");
                if((rows[i].amount) == '') 
                {
                    rows[i].amount=0
                    // console.log(grandTotal+"grandTotal_0");
                }
                grandTotal += parseFloat(rows[i].amount)
            }
            console.log(grandTotal+"grandTotal");
            setInputs(values => ({...values, ['product_amount']: grandTotal.toFixed(2),['order_amount']:grandTotal.toFixed(2)}))
            setRowsData(rows)
        }
    }

    const view = () => {
        navigate('/PurchaseOrderTable')
    }

    const Back = () => {
        navigate('/Home')
    }

    const [refreshKey, setRefreshKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true); 
    const onDeletePurchaseOrder = (event) => {

        event.preventDefault();
        Swal.fire({title: 'Are you sure to Delete?',  
        showCancelButton: true,  
        confirmButtonText: `Yes`,  
        cancelButtonText: `No`,
        }).then((result) => {  
          if (result.isConfirmed) { 
    
            setIsLoading(true);
            deletePurchaseOrder(cookies, id)
            .then(response => {
                console.log(`PurchaseOrder with id ${id} deleted`);
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
    };

    const filterProductsByCategory = (selectedCategories, localProducts) => {

        let filteredPrds = [];
        if (!localProducts) {
            localProducts = products;
        }
        console.log(JSON.stringify(products)+" products filterProductsByCategory")
        console.log(JSON.stringify(selectedCategories)+"selectedCategories filterProductsByCategory ")
        
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

    
    const [inProgress, setInProgress] = useState(false);

    const {id}=useParams()
            React.useEffect(() => {
            const EMPTY_STRING = '';

          if (id)
         {
        setInProgress(true);
        getPurchaseOrderDetails(cookies, id)
          
          .then(response => {
              
              console.log(JSON.stringify(response))
              setInProgress(false);
         
              console.log(typeof(response.order_date)+"response.order_date")
              setInputs(values => ({...values,['id']:response.id,
              ['company_id']: response.company.id, 
              ['vendor_id']: response.vendor.id,
              ['plant_id']:response.plant.id,
              ['order_no']:(response.prefix+response.order_no),  
              ['pay_terms']:response.pay_terms,
              ['transport_mode']:response.transport_mode,
              ['indent_no']:response.indent_no,
              ['quotation_no']:response.quotation_no,
              ['order_amount']:response.order_amount,
            //   ['status']:response.status,
              indent_date:(response.indent_date? getDisplayDate(response.indent_date) :EMPTY_STRING),
              quotation_date:(response.quotation_date? getDisplayDate(response.quotation_date) :EMPTY_STRING),
              validity_date:(response.validity_date? getDisplayDate(response.validity_date) :EMPTY_STRING),
            
            order_date:(response.order_date? getDisplayDate(response.order_date) :EMPTY_STRING),       
            

                   
              ['is_tax_included']:response.is_tax_included,
            ['terms_and_condition']: response.terms_and_condition,
            ['prefix']:response.prefix,
            ['order_amount']: response.order_amount,
            status:String(response.status)}));
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
        // getAllProducts(cookies)
        // .then (
        //     productList => {
                
        //         const activeProducts = productList.product_list.filter(obj => obj.status);
        //         setProducts(activeProducts);

        //         let filteredPrds = filterProductsByCategory(selectedCategories, activeProducts);
        //         setFilteredProducts(filteredPrds);
        //     })   
                
            
        getAllProducts(cookies)
        .then(productList => {
            const activeProducts = productList.product_list.filter(obj => obj.status);
            console.log(JSON.stringify(selectedCategories)+"selectedCategories useeffect")
            let filteredPrds;
            if (selectedCategories.length === 0) {
                // If no categories are selected, remove product names
                filteredPrds = activeProducts.map(obj => ({ ...obj, name: "" }));
            } else {
                filteredPrds = filterProductsByCategory(selectedCategories, activeProducts);
            }
            // setProducts(filteredPrds);
            // setProducts(activeProducts);
            setFilteredProducts(filteredPrds);
        });
    
              setRowsData(response.order_list.map((quolist,index)=>({...quolist,soDSqlNo: index+1,
                // concrete_structure_id:quolist.concrete_structure.id,
                tax_id:quolist.tax.id,product_id:quolist.product.id,unit:quolist.product.unit.symbol,id:quolist.id})));
             
                getVendorDetails(cookies, response.vendor.id)    
                .then(vendorObject => {              
                    setSelectedVendor(vendorObject)
                  })
                
          })

          .catch(error => {
              setInProgress(false);
              displayError(error.response.data, "Loading Failed");
            });
      }
        }, []);

    return (
        <>
            <div id="outer-container" className="App" >
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} /> 
                <ErrorToast/>
                <div id="page-wrap">
                    <form onSubmit={handleSubmit} >
                        <div id="header">
                            <h3 className="text font-weight-bold page-title">PurchaseOrder Edit Form</h3>
                        </div>
                        
                        <FloatingControls tableLink="/PurchaseOrderTable" onCancel={Cancel} enableCancel={true}/>
                        <div className="container">
                            <Row>
                                <Col xl={6} lg={12} md={12}>
                                    <div className="form-row table-bordered  shadow p-2 my-2 border-secondary p-2 mb-3 form-control-panel " >

                                        <label htmlFor="company_id" className="form-group col-sm-5 text-right">Office</label>
                                        <select id="company_id" name="company_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onchange={handleChange} disabled={true} value={inputs.company_id || ""}>
                                            <option value="">Select Company</option>
                                            {company.map((item) => (
                                                <option key={item.value}value={item.value}>{item.label} </option>
                                            ))} 
                                        </select><br /> 
                                        
                                        <label htmlFor="vendor_id" className="form-group col-sm-5 text-right">Vendor Name</label>
                                        <select id="vendor_id" name="vendor_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChangeVendorDetails} disabled={true} value={inputs.vendor_id || ""}>
                                            <option value="">Select Vendor  Name</option>
                                            {vendor.map((item) => (
                                                <option key={item.value} value={item.value}>{item.label}</option>
                                            ))}
                                        </select><SummaryIcon onClickHandler={showVendorDetails}/><br />

                                        
                                        <label htmlFor="plant_id" className="form-group col-sm-5 text-right">Delivery Place</label>
                                        <select id="plant_id" name="plant_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChange}  value={inputs.plant_id || ""}>
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
                                        <select required id="status" name="status" onChange={handleChange} value={inputs.status} className="browser-default custom-select col-sm-6 mandatory-form-control">
                                            <option value='true'>Active</option>
                                            <option value='false'>Inactive</option>
                                        </select>

                                </div> 

                                </Col>

                                <Col xl={6} lg={12} md={12}>

                                    <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel " >
                                    {/* <NumberSetting 
                                        handleDateChange={handlePODetails} 
                                        serial_no={inputs.order_no} 
                                        creation_date={inputs.order_date}
                                        prefix={inputs.prefix}
                                        company_id={inputs.company_id}
                                        voucher_type={"purchase_order"}
                                        handleNumberAndPrefixUpdate={updateSONumberAndPrefix}
                                        cookies={cookies}
                                        serial_no_title ={'PurchaseOrder No.'}
                                    /> */}

                                        <label htmlFor="order_no" className="form-group col-sm-4 text-right">Purchase Order No</label>
                                        <input type="text" className="form-control col-sm-7" id="order_no" value={inputs.order_no || ""} disabled={true}  name="order_no" onChange={handleChange}/><br />
                                        
                                        

                                        <label htmlFor="order_date" className="form-group col-sm-4 text-right ">Date</label>
                                        <input required type="date" id="order_date" name="order_date" onChange={handleChange} className="form-control col-sm-7 mandatory-form-control" disabled={true} value={inputs.order_date || ""} max={maxDate} />
                                         
                                        
                                    {/* </div>
                                    <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 form-control-panel"> */}
                                        <label htmlFor="indent_no" className="form-group col-sm-4 text-right">Indent No</label>
                                        <input type="text" id="indent_no" name="indent_no" className="form-control col-sm-7" value={inputs.indent_no || ""} onChange={handleChange} placeholder="Enter Indent No"/><br />
                                        
                                        <label htmlFor="indent_date" className="form-group col-sm-4 text-right">Indent Date</label>
                                        <input required type="date" id="indent_date" name="indent_date" onChange={handleChange} className="form-control col-sm-7" value={inputs.indent_date || ""} max={maxDate}   />
 

                                        <label htmlFor="quation_no" className="form-group col-sm-4 text-right">Quotation No</label>
                                        <input type="text" id="quotation_no" name="quotation_no" className="form-control col-sm-7" value={inputs.quotation_no || ""} onChange={handleChange} placeholder="Enter Quotation No"/><br />
                                       
                                        <label htmlFor="quotation_date" className="form-group col-sm-4 text-right">Quotation Date</label>
                                        <input required type="date" id="quotation_date" name="quotation_date" onChange={handleChange} className="form-control col-sm-7" value={inputs.quotation_date || ""} max={maxDate}   />
 

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
                        <select id="is_tax_included"className="form-control col-sm-3 browser-default custom-select " name="is_tax_included" onChange={handleChange} value={inputs.is_tax_included} >
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
                    <TableRowsPurchaseOrderEdit rowsData={rowsData} deleteTableRows={deleteTableRows} handleChangeTableDetails={handleChangeTableDetails} handleChangeTableProduct={handleChangeTableProduct} products={filteredProducts} taxes={taxes} />
                    
                    </tbody>
                </table>
                <label htmlFor="order_amount" className="form-group col-sm-9 text-right">Order Value</label>
                <input type="text" className="form-control col-sm-3 order_amount" id="order_amount" value={inputs.order_amount || 0}  readOnly={true} style={{textAlign:"right", cursor: "not-allowed"}} name="order_amount" disabled/>
            </div>  
                        </div>
                        <div className="footer text-center">
                        <Button  type="submit"  style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter">Update</Button> &nbsp;&nbsp;               
                    <Button   type="button"style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter"onClick={view}>View</Button>&nbsp;&nbsp;
                    <Button  type="button"style={{width:"80px",fontWeight:"bold",backgroundColor:"RGB(58,29,238,0.8)"}} className="btn btn-twitter"onClick={Back}>Home</Button>&nbsp;&nbsp;
                    <Button className="btn btn-delete"  type="button"style={{width:"80px",fontWeight:"bold"}} onClick={onDeletePurchaseOrder}>Delete</Button>
                           
                        </div>

                    </form>

                </div>


            </div>

        </>

    );
                                }




export default PurchaseOrderEdit

