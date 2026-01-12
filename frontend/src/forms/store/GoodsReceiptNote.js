import React from 'react';
import { useState, useEffect,useMemo } from "react";
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
// import TableRowsPurchaseOrder from "./TableRowsPurchaseOrder";
import TableRowsGRN from './TableRowsGRN';
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
import { getAllPurchaseOrders } from '../../services/PurchaseOrderServices';
import {displayErrorToast,parseBoolean,displayError} from '../../helpers';
import StatusDropDown from '../../components/StatusDropDown';
import SummaryIcon from '../../components/SummaryIcon';
import ReactTablePopUpSubmitWrapper from '../../components/ReactTablePopUpSubmitWrapper';
import QuestionIcon from '../../components/QuestionIcon';
import { getHTMLForSummaryPopup } from '../../utils/PopupUtils';
import { getAllVendors,getVendorDetails } from '../../services/VendorServices';
import { getCurrentTime } from '../../utils/DateUtils';
import {getGoodsReceiptnumber } from '../../services/GoodReceiptNoteServices';
import { getpurchaseorderforgrn } from '../../services/GoodReceiptNoteServices';
import { getPurchaseOrderDetails} from '../../services/PurchaseOrderServices';
import MaterialReactTable from 'material-react-table';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import ReactTableEditWrapper from '../../components/ReactTableEditWrapper';
import EditSharpIcon from '@mui/icons-material/EditSharp'
import { getAllEquipments } from '../../services/EquipmentServices';
//import Select2 from 'react-select2-wrapper';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
//import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
//import { MRT_ColumnDef } from 'material-react-table';

// import { getCompanyDetails } from '../../services/CompanyServices';
import "../../button.css";
import DisabledContext from 'antd/lib/config-provider/DisabledContext';

function GoodsReceiptNote(){
    const [cookies] = useCookies(['myToken']);
    const [category] = useCookies(['myCategory']);
    const [superuser] = useCookies(['mySuperuser']);
    const [inputs, setInputs] = useState({
        vendor_id:'',
        grn_no:'',
        grn_date:'',
        prefix:'',
        order_no:'',
        order_date:'',
        transporter_name:'',
        vehicle_id:'',
        vehicle_others:'',
        transporter_mode:'',
        driver_name:'',
        driver_mobile_no:'',
        in_time:'',
        out_time:'',
        weighment_name:'',
        weighment_slip_no:'',
        weighment_slip_date:'',
        weighment_slip_time:'',
        measurement_taken_by:'',
        authorised_by:'',
        received_by:'',
        lr_no:'',
        lr_dt:'',
        //balance_qty:'',
        // indent_date:'',
        // quotation_date:'',
        validity_date:'',
        //transport_mode:'own',
        terms_and_condition:'',
        pay_terms:'0',
        is_tax_included:true,
        status:true,
        // indent_no:'',
        // quotation_no:'',
        remarks:'',
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
        setInputs(values => ({...values, ['grn_date']: today}))
          }, []);

    React.useEffect(() => {
            var today = new Date();
            const purchaseOrderDate = new Date(inputs.grn_date);
            const validityDate = new Date(purchaseOrderDate.getTime() + (30 * 24 * 60 * 60 * 1000));
            const validityDateString = validityDate.getFullYear() + '-' + ("0" + (validityDate.getMonth() + 1)).slice(-2) + '-' + ("0" + validityDate.getDate()).slice(-2);
            setInputs(values => ({
                ...values,
                ['validity_date']: validityDateString
            }));
    
    },[inputs.grn_date])
        
    const [maxDate, setMaxDate] = React.useState("");
            React.useEffect(() => {
                const today = new Date().toISOString().split("T")[0];
                setMaxDate(today);
    }, []);

    const [products, setProducts] = React.useState([]);
    React.useEffect(() => {
        getAllProducts(cookies)
        .then (
            productList => {
                
                const products = productList.product_list.filter(obj => obj.status);

                setProducts(products.map(product =>{
                    return{ value: product.id, label: product.name}
                }));
            }
        )
    }, []);

    const [equipments, setEquipment] = React.useState([]);
    React.useEffect(() => {
        getAllEquipments(cookies)
          .then (
            equipmentObject => {
              console.log(JSON.stringify(equipmentObject)+"getAllEquipments")
                  const equipments = equipmentObject.equipment_list.filter(obj => ((obj.equip_type.name === 'TRANSIT MIXER')&& (obj.status) && (obj.is_equip_ready))).map(
                      equipment => {
                          return { value: equipment.id, label: equipment.equip_name }
                      }
                  );
                  setEquipment(equipments);
              }
          )
      }, []);

    // const [productCategories, setProductCategories] = React.useState([]);
    // React.useEffect(() => {

    //     getGroupsForCategory('PRODUCT', cookies)
    //     .then(productCategories => {
    //         console.log(JSON.stringify(productCategories)+"productCategories")
    //         setProductCategories(productCategories.map(
    //             category => {
    //                 return { value: category.id, label: category.entity_name }
    //             }
    //         ));
    //     })
        
     
    // }, []);
    

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
                console.log("Inputs:", inputs);
                console.log("Rows Data:", rowsData);
                const EMPTY_STRING = '';
                        console.log(JSON.stringify(inputs) + "inputsubmit");
                        // createPurchaseOrder(cookies, {
                        //     // Data for creating purchase order
                        //     company_id: parseInt(inputs.company_id),
                        //     vendor_id: parseInt(inputs.vendor_id),
                        //     plant_id: parseInt(inputs.plant_id),
                        //     order_no: inputs.order_no,
                        //     order_date: inputs.order_date ? getDisplayDate(inputs.order_date) : EMPTY_STRING,
                        //     //order_amount:parseFloat(inputs.order_amount),
                        //     pay_terms:parseInt(inputs.pay_terms),
                        //     grn_no: inputs.grn_no,
                        //     grn_date: inputs.grn_date ? getDisplayDate(inputs.grn_date) : EMPTY_STRING,
                        //     prefix: inputs.prefix,
                        //     transporter_name: inputs.transporter_name,
                        //     driver_name:inputs. driver_name,
                        //     driver_mobile_no:inputs.driver_mobile_no,
                        //     in_time:inputs.in_time,
                        //     out_time:inputs.out_time,
                        //     weighment_name: inputs. weighment_name,
                        //     weighment_slip_time:inputs. weighment_slip_time,
                        //     weighment_slip_no: inputs. weighment_slip_no,
                        //     weighment_slip_date: inputs.weighment_slip_date,
                        //     vehicle_id:inputs. vehicle_id,
                        //      vehicle_others:inputs. vehicle_others,
                        //     transporter_mode: inputs.transporter_mode,
                        //     measurement_taken_by:inputs.measurement_taken_by,
                        //     authorised_by:inputs.authorised_by,
                        //     received_by:inputs.received_by,
                        //     lr_no:inputs.lr_no,
                        //     lr_dt:inputs.lr_dt,
                        //     //balance_qty: inputs.balance_qty,
                        //     //indent_date: inputs.indent_date ? getDisplayDate(inputs.indent_date) : EMPTY_STRING,
                        //     //quotation_date: inputs.quotation_date ? getDisplayDate(inputs.quotation_date) : EMPTY_STRING,
                        //     validity_date: inputs.validity_date ? getDisplayDate(inputs.validity_date) : EMPTY_STRING,
                        //     //order_time :inputs.order_time|| EMPTY_STRING,
                        //     // prod_category: inputs.prod_category,
                        //     status: inputs.status,
                        //     //indent_no: inputs.indent_no,
                        //     is_tax_included: parseBoolean(inputs.is_tax_included),
                        //     //quotation_no: inputs.quotation_no,
                        //     transport_mode:inputs.transport_mode || EMPTY_STRING,
                        //     // pay_terms: inputs.pay_terms || EMPTY_STRING,
                        //     terms_and_condition: inputs.terms_and_condition,
                        //     detail_list:rowsData.map(quolist=>({
                        //         tax_id:parseInt(quolist.tax_id),
                        //         gross_weight:parseFloat(quolist.gross_weight),
                        //         tare_weight:parseFloat(quolist.tare_weight),
                        //         net_weight:parseFloat(quolist.net_weight),
                        //         deduction_qty:parseFloat(quolist.deduction_qty),
                        //         dc_qty:parseFloat(quolist.dc_qty),
                        //         received_qty:parseFloat(quolist.received_qty),
                        //         balance_qty:parseInt(quolist.balance_qty),
                        //         difference_qty:parseFloat(quolist.difference_qty),
                        //         accepted_qty:parseFloat(quolist.accepted_qty),
                        //         amount:parseFloat(quolist.amount),
                        //         rate:parseFloat(quolist.rate),
                        //         quantity:parseFloat(quolist.quantity),
                        //         product_id:parseInt(quolist.product_id),
                        //         // unit:parseInt(quolist.unit),
                        //         user_remarks:quolist.user_remarks
                        //     })),
                        //     status: parseBoolean(inputs.status)
                        //})
                        // .then(response => {
                        //     Swal.fire("Saved!", "", "success");
                        //     Reload();
                        // })
                        // .catch((error) =>
                        // {
                        //     console.log(error.response.data);
                        //     displayError(error.response.data,"Save Failed");
                        // })
              
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
        const { name, value } = event.target;
    
        if (name === "plant_id") {
            if (value) {

                var t = inputs.grn_date
                console.log(t.toString()+"toString"); 
                var moment = require('moment');
                var c=moment(t).format("DD-MM-YYYY");
                getGoodsReceiptnumber(cookies,value,c)
                    .then((response) => {
                        setInputs(values => ({
                            ...values,
                            goods_receipt_prefix: response.prefix + response.goods_receipt_no,
                            goods_receipt_number: response.goods_receipt_no,
                            prefix: response.prefix
                        }));
                    })
                    .catch((error) =>
                    {
                        console.log(error.response.data);
                        displayError(error.response.data,"");
                    })
            } else {
                setInputs(values => ({
                    ...values,
                    goods_receipt_prefix: '',
                    goods_receipt_number: '',
                    prefix: ''
                }));
            }
        } else if (name === "grn_date") {
            var t=inputs.plant_id
            var s = value
            console.log(s.toString()+"s.toString"); 
            var moment = require('moment');
            var d=moment(s).format("DD-MM-YYYY");
            getGoodsReceiptnumber(cookies,t,d)
                .then((response) => {
                    setInputs(values => ({
                        ...values,
                        goods_receipt_prefix: response.prefix + response.goods_receipt_no,
                        goods_receipt_number: response.goods_receipt_no,
                        prefix: response.prefix
                    }));
                })
                .catch((error) =>
                {
                    console.log(error.response.data);
                    displayError(error.response.data,"");
                })
        }
    
        setInputs(values => ({ ...values, [name]: value }));
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
        // else if (name === 'received_qty') {
        //     rowsInput[index]['accepted_qty'] = value;
        //     // const acceptedQty = value;
        //     // const balanceQty = rowsInput[index]['balance_qty'];

        //     // if (acceptedQty > balanceQty) {
        //     //     alert('Accepted quantity cannot be greater than balance quantity!');
        //     // } else {
        //     //     rowsInput[index]['accepted_qty'] = acceptedQty;
        //     //     setRowsData(rowsInput);
        //     // }
        // }
        // const acceptedQty = rowsInput[index]['accepted_qty'];
        // const balanceQty = rowsInput[index]['balance_qty'];

        // if (acceptedQty > balanceQty) {
        //     alert('Accepted quantity cannot be greater than balance quantity!');
       
        // }
        else if(name === 'amount')
        {
           
        }
        setRowsData(rowsInput);
        
    }

    // const handleChangeWeightDetails = (index, evnt) => {
    //     const { name, value } = evnt.target;
    //     const rowsInput = [...rowsData];
    //     rowsInput[index][name] = value;
    
    //     if (name === 'gross_weight' || name === 'tare_weight') {
    //         const grossWeight = parseInt(rowsInput[index]['gross_weight']) ;
    //         const tareWeight = parseInt(rowsInput[index]['tare_weight']) ;
    //         const netWeight = grossWeight - tareWeight;
    
    //         rowsInput[index]['net_weight'] = netWeight;
    
    //         let totalNetWeight = 0;
    //         for (let i = 0; i < rowsData.length; i++) {
    //             totalNetWeight += parseInt(rowsInput[i]['net_weight']) ;
    //         }
    
    //         setInputs(values => ({
    //             ...values,
    //             ['total_net_weight']: totalNetWeight
    //         }));
    //     }
    
    //     setRowsData(rowsInput);
    // }

    const handleChangeWeightDetails = (index, evnt) => {
        const { name, value } = evnt.target;
        const rowsInput = [...rowsData];
        rowsInput[index][name] = value;
    
        if (name === 'gross_weight' || name === 'tare_weight') {
            const grossWeight = parseFloat(rowsInput[index]['gross_weight'] || 0);
            const tareWeight = parseFloat(rowsInput[index]['tare_weight'] || 0);
            const netWeight = grossWeight - tareWeight;
            rowsInput[index]['net_weight'] = netWeight;

            const deductionQty = parseFloat(rowsInput[index]['deduction_qty'] || 0);
            const receivedQty = netWeight - deductionQty;
            rowsInput[index]['received_qty'] = receivedQty;
            rowsInput[index]['accepted_qty'] = receivedQty;
            let totalNetWeight = 0;
            for (let i = 0; i < rowsData.length; i++) {
                totalNetWeight += parseFloat(rowsInput[i]['net_weight'] || 0);
            }
    
            setInputs(values => ({
                ...values,
                ['total_net_weight']: totalNetWeight
            }));
        } else if (name === 'deduction_qty') {
            
            const netWeight = parseInt(rowsInput[index]['net_weight'] || 0);
            const deductionQty = parseInt(value || 0);
            const receivedQty = netWeight - deductionQty;
    
        
            rowsInput[index]['received_qty'] = receivedQty;
            rowsInput[index]['accepted_qty'] = receivedQty;
            const acceptedQty = parseFloat(rowsInput[index]['accepted_qty'] || 0);
            const balanceQty = parseInt(rowsInput[index]['balance_qty']);
        // console.log(acceptedQty+"acceptedqty")
        // console.log(balanceQty+"balanceqty")
        if (acceptedQty > balanceQty) {
            Swal.fire('Accepted quantity cannot be greater than balance quantity!');
       
        }
        
        }
        // const acceptedQty = parseInt(rowsInput[index]['accepted_qty']);
        // const balanceQty = parseInt(rowsInput[index]['balance_qty']);
        // if (acceptedQty > balanceQty) {
        //     Swal.fire('Accepted quantity cannot be greater than balance quantity!');
       
        // }
    
        setRowsData(rowsInput);
    }
    
    
    
    const handleChangeQtyDetails= (index, evnt) => {
        const { name, value } = evnt.target;
        const rowsInput = [...rowsData];
    
        if (name === 'dc_qty' || name === 'received_qty') {
            const dc_qty = name === 'dc_qty' ? value : rowsInput[index]['dc_qty'];
            const received_qty = name === 'received_qty' ? value : rowsInput[index]['received_qty'];
            const difference_qty = dc_qty - received_qty;
            rowsInput[index]['difference_qty'] = difference_qty;
        }
        
    
        setRowsData(rowsInput);
    };
    

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

    //    const deleteTableRows = (index)=>{ // index of row to be deleted
    //     const rows = [...rowsData];
    //     rows.splice(index, 1);//splice method to remove the row at the specified index from the rows array.
    //     for(var i=0; i<rows.length; i++) 
    //     {
    //         rows[i]['soDSqlNo']= i+1 
    //     }
    //     setRowsData(rows); // renumbers the rows and updates it
    // }

    const [checkedItems, setCheckedItems] = useState([]);

const handleCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
    
};

const isChecked = (index) => {
    return checkedItems[index];
};
    
    const [purchaseorders,setPurchaseorders]=React.useState([]);
    const [allPurchaseOrders,setAllPurchaseOrders] = useState([]);
    const initial_table_data = {
        total_pages: 0,
        records: [],
      };
    const [data, setData] = useState(initial_table_data);
    const [showModal, setShowModal] = useState(false);
    const [showModal2, setShowModal2] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPurchaseOrder,setSelectedPurchaseOrder] = useState({});
    const [filteredplants,setFilteredPlants] = useState([]);
    const [rows, setRows] = useState([]);

    // const order_list = (orderListData) => {
    //     // Assuming orderListData is an array of order objects
    //     const transformedRows = orderListData.map(order => ({
    //         soDSqlNo: order.id,  // Adjust as needed
    //         id: order.id,
    //         tax_id: order.tax.id,
    //         soDConStruc: order.product.name,
    //         soDDeliveryMode: order.delivery_mode,
    //         amount: order.amount,
    //         rate: order.rate,
    //         quantity: order.quantity,
    //         unit: order.product.unit.name,
    //         product_id: order.product.id,
    //         user_remarks: order.user_remarks
    //     }));
        
    //     // Update the state with transformed rows
    //     setRows(transformedRows);
    // };
    
    const handleChangePurchaseOrderDetails = (value, event) => {
        const purchaseOrderId = value;
        const propertyName = 'purchaseorder_id';
        
        console.log(purchaseOrderId + " purchaseOrderId");
        
        if (purchaseOrderId) {
            setInputs(values => ({
                ...values,
                [propertyName]: purchaseOrderId
            }));
            console.log(JSON.stringify(allPurchaseOrders)+"allPurchaseOrders")
            const selectedPo = allPurchaseOrders.filter(obj => obj.id == purchaseOrderId)[0];
            setSelectedPurchaseOrder(selectedPo);
            // setInputs(values => ({
            //     ...values,
            //     [propertyName]: purchaseOrderId,transporter_mode:selectedPo.transport_mode
            // }));// Ens
            if (selectedPo) { 
                setInputs(values => ({
                    ...values,
                    [propertyName]: purchaseOrderId,
                    ['transporter_mode']: selectedPo.transport_mode 
                }));
            }
            console.log(JSON.stringify(selectedPo)+"selectedPo")
            setRowsData(selectedPo.order_list);
            
            
            setIsLoading(true);
            const a=(selectedPo.order_list.map((quolist,index)=>({...quolist,soDSqlNo: index+1,
                        
                        tax_id:quolist.tax_id,product_id:quolist.product.id,unit:quolist.product.unit.symbol,balance_qty:quolist.balance_qty,accepted_qty:0,id:quolist.id})));
                        // setData({
                        //     total: data.total,
                        //     value: selectedPo.order_list
                        // });      
             console.log(JSON.stringify(a)+"a")
             setRowsData(a) 
             
            //  const updatedOrderList = selectedPo.order_list.map((order, index) => {
            //     const grossWeight = parseFloat(order.gross_weight);
            //     const tareWeight = parseFloat(order.tare_weight);
            //     const netWeight = !isNaN(grossWeight) && !isNaN(tareWeight) ? grossWeight - tareWeight : netWeight;
            //     return {
            //         ...order,
            //         net_weight: netWeight
            //     };
            // });
    
            // // Update the state with the modified order_list
            // setRowsData(updatedOrderList);
            // setIsLoading(true);
            

         
        } 
        
        setShowModal(false);
    }

    

// const transformData = (orderListData) => {
//     // if (!orderListData || !Array.isArray(orderListData)) {
//     //     return []; // Return an empty array if the input data is invalid
//     // }

//     return orderListData.map(order => ({
//         soDSqlNo: order.id,
//         id: order.id,
//         tax_id: order.tax.id,
//         soDConStruc: order.product.name,
//         soDDeliveryMode: order.delivery_mode,
//         amount: order.amount,
//         rate: order.rate,
//         quantity: order.quantity,
//         unit: order.product.unit.name,
//         product_id: order.product.id,
//         user_remarks: order.user_remarks
//     }));
// };

    

//     const [deliverymodes,setDeliveryModes] = useState([]);

    // const handleChangeProductDetails = (event) =>{
    //     const DM_MANUAL = 'manual';
    //     const DM_PUMP = 'pump';
    //     const DM_MANUAL_OR_PUMP = 'manual/pump';

    //     const sales_order_detail_id = event.target.value;
    //     const propertyName = event.target.name;
        
    //     if (sales_order_detail_id) {
    //         let selected_product = selectedPurchaseOrder.order_list.filter( order => order.id == sales_order_detail_id)[0];
    //         let balanceQty = selected_product.quantity-selected_product.delivered_qty-selected_product.scheduled_qty
    //         setInputs(values =>({...values,
    //             [propertyName]:sales_order_detail_id,
    //             ['delivery_mode']:(selected_product.delivery_mode === DM_MANUAL_OR_PUMP ? '' : selected_product.delivery_mode),
    //             ['order_quantity']:selected_product.quantity,
    //             ['balance_qty']:balanceQty
    //         }));
    //         document.getElementById('scheduled_qty').max = balanceQty;

    //         if (selected_product.delivery_mode === 'manual/pump') {
    //             setDeliveryModes([
    //                 {value: '' ,label:'Please select Delivery Mode'},
    //                 {value: DM_MANUAL ,label:DM_MANUAL.toUpperCase()},
    //                 {value: DM_PUMP ,label:DM_PUMP.toUpperCase()}
    //             ])
    //         } else {
    //             setDeliveryModes([{value: selected_product.delivery_mode ,label:selected_product.delivery_mode.toUpperCase()}])
    //         }
    //     }
    // } 
    

    const ShowOrderDetails = () => {
        getpurchaseorderforgrn(cookies)
        .then (purchaseorderList => {
            const purchaseorders = purchaseorderList.purchase_order_list.filter(obj => obj.status).map(
                purchaseorder => {
                    return { value: purchaseorder.id, label: purchaseorder.prefix + purchaseorder.grn_no}
                }
            );
            setPurchaseorders(purchaseorders);
            setAllPurchaseOrders(purchaseorderList.purchase_order_list.filter(obj => obj.status))
            const tableData = purchaseorderList.purchase_order_list
                .map(grn=> ({
                    id :grn.id,
                    order_no:grn.prefix+grn.order_no,  
                    order_date: grn.order_date,                             
                    vendor_id:grn.vendor.name, 
                    company_id:grn.company.name,
                    prefix:grn.prefix,
                    //balance_qty: grn.balance_qty
                }));
            
                setData({
                    total: data.total,
                    records: tableData
                });
                //setData([]);
                setIsLoading(false);
                setShowModal(true)
            
    })
}
const Close = () => {
    setShowModal(false)
  }
const columns =
    useMemo(
        () => [
            {
                fieldName: "id",
                headerName: "ROW_ACTIONS",
                size:40
            },
            {
                fieldName: 'order_no',
                headerName: 'Order No',
                size:40
            },
            {
                fieldName: 'order_date',
                headerName: 'Order Date',
                size:50
            },
            
            {
                fieldName: "company_id",
                headerName: 'Company',
                size:180
            },
            {
                fieldName:"vendor_id",
                headerName: 'Vendor',
                size:180
            },
            {
                fieldName:"prefix",
                headerName: 'Prefix',
                size:180
            }
],
[],);

    const showplantdetails=()=>{ }

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

    const handleChangeCompany = (event) => {
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
            getPurchaseOrdernumber(cookies,d)
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

    // const onCategorySelect = (selected) => {
    //     setSelectedCategory(selected);
    //     let filteredPrds = [];
    
    //     // Move initialization outside of forEach loop
    //     selected.forEach(productCategory => {
    //         console.log(productCategory.value+"productCategory.value")
    //         let localList = products.filter(product => product.category.id === productCategory.value)
    //             .map(product => {
    //                 return { value: product.id, label: product.name };
    //             });
    //         console.log(JSON.stringify(localList)+"localList")
    //         console.log(JSON.stringify(products)+"products")
    //         // Accumulate products from all selected categories
    //         filteredPrds = [...filteredPrds, ...localList];
    //     });
    
    //     // Set filtered products after processing all selected categories
    //     console.log("Filtered products:", filteredPrds);
    //     console.log(JSON.stringify(selected)+"selected")
    //     console.log(JSON.stringify(filteredPrds))
    //     setFilteredProducts(filteredPrds);
    // };

    const Cancel = () => {
        // setInputs(() => "")
        setInputs({
            company_id:'',
            vendor_id:'',
            transporter_name:'',
            transporter_mode:'',
            vehicle_id:'',
            vehicle_others:'',
            driver_name:'',
            driver_mobile_no:'',
            in_time:'',
            out_time:'',
            weighment_name:'',
            weighment_slip_no:'',
            weighment_slip_date:'',
            weighment_slip_time:'',
            measurement_taken_by:'',
            authorised_by:'',
            received_by:'',
            lr_no:'',
            lr_dt:'',
            //is_tax_included:'true',
            terms_and_condition:'',
            transport_mode:'',
            is_tax_included:'',
            pay_terms:'',
            grn_no:'',
            grn_date:'',
            order_no:'',
            order_date:'',
            prefix:'',
            // indent_date:'',
            // quotation_date:'',
            validity_date:'',
            // indent_no:'',
            // quotation_no:'',
            // prod_category:'',
            status:''
        })
        setRowsData([])
    }


    const [error, setError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(true);
    const [rowsData, setRowsData] = useState([]);
    const addTableRows = () => {
        const count=rowsData.length +1;
        const rowsInput={
                soDSqlNo:count,
                id:'',
                tax_id:'',
                gross_weight:0,
                tare_weight:0,
                net_weight:0,
                amount:0,
                rate:0,
                quantity:0,
                unit:'',
                product_id:'',
                dc_qty:0,
                received_qty:0,
                balance_qty:0,
                difference_qty:0,
                deduction_qty:0,
                accepted_qty:0,
                user_remarks:''
            }
            setRowsData([...rowsData, rowsInput])
    }
    
    const navigate = useNavigate();
    const view = () => {
        navigate('/PurchaseOrderTable')
    }

    const Back = () => {
        navigate('/Home')
    }

    // const [open, setOpen] = useState(false);
    // const handleOpenDialog = () => {
    //     setOpen(true);
    // };

    // const handleCloseDialog = () => {
    //     setOpen(false);
    // };

    // const handleSaveChanges = () => {
        
    //     handleCloseDialog();
    // };

    
    // const getHTMLForTransporterPopup = (title, details) => {
    //     let html = `<div><h2>${title}</h2><form>`;
    //     details.forEach(({ label, value }) => {
    //        if (label) {
    //             html += `<div><label>${label}:</label> <input type="text" value="${value}" /></div>`;
    //         } else {
    //             html += `<div><input type="text" value="${value}" /></div>`;
    //         }
    //     });
    //     html += `</form></div>`;
    //     return html;
    // };
    // const getHTMLForTransporterPopup = (title, fieldList) => {
    //     let fieldRowsHtml = '';
    
    //     fieldList.forEach(field => {
    //         fieldRowsHtml +=
    //             `<tr>` +
    //             `<td align='left' style='font-size:14px;font-weight:bold;padding-right:3px;'>${(field.label ? field.label + ':' : '&nbsp;')}</td>` +
    //             `<td align='left' style='font-size:14px;padding-left:2px;'>${(field.value ? `<input type="text" id="${field.id}" name="${field.id}" value="${field.value}" />` : '&nbsp;')}</td>` +
    //             `</tr>`;
    //     });
    
    //     return `<div style='border:1px solid black'>
    //         <table align='center' width='100%'>
    //             <tr>
    //                 <td colspan="2" style="background-color: #0d6efd">
    //                     <h6 style="color:white;">${title}</h6>
    //                 </td>
    //             </tr>
    //             ${fieldRowsHtml}
    //         </table>
    //     </div>`;
    // };
    // const getHTMLForTransporterPopup = (title, details) => {
    //     let html = `<div><h4>${title}</h4><form><table>`;
    //     details.forEach(({ label, value, id }) => {
    //         html +=
    //             `<tr>` +
    //             `<td align='left'style='font-size:14px;font-weight:bold;padding-right:3px;'>${(label ? label + ':' : '&nbsp;')}</td>` +
    //             `<td align='left'style='font-size:14px;padding-left:2px;'><input type="text" id="${id}" name="${id}" value="${inputs.transporter_name || ''}" /></td>` +
    //             `</tr>`;
    //     });
    //     html += `</table></form></div>`;
    //     return html;
    // };
    
    // const handleEditIconClick = () => {
            
    //         Swal.fire({
    //             html: getHTMLForTransporterPopup('TRANSPORTER DETAILS', [
    //                 { label: 'Transporter Name', value: inputs.transporter_name },
                    
    //             ])
    //         }, '', 'info');
    //     };
    // const updateTransporterMode = () => {
    //     const newTransporterMode = document.getElementById('transporter_mode').value;
    //     inputs.transporter_mode = newTransporterMode;
    // };
   
    // const updateTransporter = () => {
    //     alert("hi")
    //     const newTransporterName = document.getElementById('transporter_name').value;
    //     inputs.transporter_name = newTransporterName;
    //     const newTransporterMode = document.getElementById('transporter_mode').value;
    //     inputs.transporter_mode = newTransporterMode;
    //     const newvechicleid = document.getElementById(' vehicle_id').value;
    //     inputs. vehicle_id=newvechicleid;
    // };
    // const updateTransporter = () => {
    //     const newTransporterName = document.getElementById('transporter_name').value;
    //     const newTransporterMode = document.getElementById('transporter_mode').value;
    //     const newVehicleId = document.getElementById('vehicle_id').value;
    //     setInputs(values => ({
    //         ...values,
    //         transporter_name: newTransporterName,
    //         transporter_mode: newTransporterMode,
    //         vehicle_id: newVehicleId
    //     }));
    // };
    // const updateweighment = () => {
    //     const weighmentname = document.getElementById('weighment_name').value;
    //     const  weighment_slip_no = document.getElementById(' weighment_slip_no').value;
    //     const weighment_slip_date = document.getElementById(' weighment_slip_date').value;
    //     setInputs(values => ({
    //         ...values,
    //         weighment_name: weighmentname,
    //         weighment_slip_no: weighment_slip_no,
    //         weighment_slip_date: weighment_slip_date

    //     }));
    // };
    // ${equipmentList.map(equipment => <option value="${equipment.equip_name}">${equipment.equip_name}</option>)}
    //                     </select>

    // const [selectedVehicle, setSelectedVehicle] = useState(null);
    // const handleVehicleChange = (selectedVehicle) => {
    //     console.log(JSON.stringify(selectedVehicle) + "selected");
    //     setSelectedVehicle(selectedVehicle);
    //     // Further handling of the selected vehicle
    // };
    // ${transporterMode !== 'customer' ?
    //                     `<Select
    //                       id="vehicle_id"
    //                       className={"mandatory-form-control react-select-dropdown"}
    //                       value={selectedVehicle}
    //                       onChange={handleVehicleChange}
    //                       options={equipments}
    //                       isSearchable={true}
    //                       placeholder="Please Select Vehicle"
    //                     />` :
    //                     ''
    //                   }
//     <Select
//     id="vehicle_id"
//     className="form-group col-sm-5 text-left"
//     isDisabled={transporterMode === 'customer'}
//     options={equipments.map(equipment => ({ value: equipment.value, label: equipment.label }))}
//     isSearchable={true}
// />
{/* <Select id="vehicle_id" class="form-group col-sm-5 text-left" ${transporterMode === 'customer' ? 'disabled' : ''}>
${transporterMode !== 'customer' ? equipments.map(equipment => `
    <option value="${equipment.value}">${equipment.label}</option>
`) : ''}
</Select> */}

// const handleEditIconClick = () => {
//     if (inputs.purchaseorder_id) {
//         console.log(JSON.stringify(equipments) + "equipments icon");
//         if (selectedPurchaseOrder) {
//             const transporterMode = selectedPurchaseOrder.transport_mode;
//             setShowModal2(true);
//         }
//         if (transporterName !== null && transporterMode !== null && vehicleId !== null &&
//             driverName !== null && driverMobileNo !== null && inTime !== null && outTime !== null) {
//             setInputs(values => ({
//                 ...values,
//                 transporter_name: transporterName,
//                 transporter_mode: transporterMode,
//                 vehicle_id: vehicleId,
//                 vehicle_others: vehicle_others,
//                 driver_name: driverName,
//                 driver_mobile_no: driverMobileNo,
//                 in_time: inTime,
//                 out_time: outTime,
//                 lr_no: lr_no,
//                 lr_dt: lr_dt
//             }));
//         }

//             // Close the modal after updating inputs
//             setShowModal2(false);
//     }
// }

//const transporter_Mode = selectedPurchaseOrder.transport_mode;
// const handleEditIconClick = () => {
//     if (inputs.purchaseorder_id) {
//         console.log(JSON.stringify(equipments) + "equipments icon");
//         if (selectedPurchaseOrder) {
//             const transporter_Mode = selectedPurchaseOrder.transport_mode;
//             setShowModal2(true);

           
//             const transporterName = document.getElementById('transporter_name')?.value;
//             const transporterMode = document.getElementById('transporter_mode')?.value;
//             const vehicleId = document.getElementById('vehicle_id')?.value;
//             const vehicle_others = document.getElementById('vehicle_others')?.value;
//             const driverName = document.getElementById('driver_name')?.value;
//             const driverMobileNo = document.getElementById('driver_mobile_no')?.value;
//             const inTime = document.getElementById('in_time')?.value;
//             const outTime = document.getElementById('out_time')?.value;
//             const lr_no = document.getElementById('lr_no')?.value;
//             const lr_dt = document.getElementById('lr_dt')?.value;

//             if (transporterName !== null && transporterMode !== null && vehicleId !== null &&
//                 driverName !== null && driverMobileNo !== null && inTime !== null && outTime !== null) {
//                 setInputs(values => ({
//                     ...values,
//                     transporter_name: transporterName,
//                     transporter_mode: transporterMode, 
//                     vehicle_id: vehicleId,
//                     vehicle_others: vehicle_others,
//                     driver_name: driverName,
//                     driver_mobile_no: driverMobileNo,
//                     in_time: inTime,
//                     out_time: outTime,
//                     lr_no: lr_no,
//                     lr_dt: lr_dt
//                 }));

                
//                 setShowModal2(true);
//             }
//         }
//     }
// };
const handleEditIconClick = () => {
    //alert(JSON.stringify(selectedPurchaseOrder)+JSON.stringify(inputs) + "selectedPurchaseOrder");
    if (inputs.purchaseorder_id && selectedPurchaseOrder) {
        console.log(JSON.stringify(equipments) + "equipments icon");
        setShowModal2(true); 
        const transporterName = inputs.transporter_name;
        const transporterMode =  selectedPurchaseOrder.transport_mode;
        const vehicleId = inputs.vehicle_id;
        const vehicle_others = inputs.vehicle_others;
        const driverName = inputs.driver_name;
        const driverMobileNo = inputs.driver_mobile_no;
        const inTime = inputs.in_time;
        const outTime = inputs.out_time;
        const lr_no = inputs.lr_no;
        const lr_dt = inputs.lr_dt;

        
        if (transporterName && transporterMode && vehicleId &&driverName && driverMobileNo && inTime && outTime) {
            setInputs(values => ({
                ...values,
                transporter_name: transporterName,
                transporter_mode: transporterMode, 
                vehicle_id: vehicleId,
                vehicle_others: vehicle_others,
                driver_name: driverName,
                driver_mobile_no: driverMobileNo,
                in_time: inTime,
                out_time: outTime,
                lr_no: lr_no,
                lr_dt: lr_dt
            }));
            
            setShowModal2(true); 
        }
    }
};

const handleTransportModeChange = () => {
    
    if (selectedPurchaseOrder) {
        const transportMode = selectedPurchaseOrder.transport_mode;
        setInputs(prevInputs => ({
            ...prevInputs,
            transporter_mode: transportMode
        }));
    }
};




 
    const handleWeighmentIconClick = () => {
        console.log("Inputs before opening modal:", inputs);
        Swal.fire({
            title: 'Weighment Details',
            html:
            '<label for="weighment_name" class="form-group col-sm-5 text-right">Weighment Name</label>' +
            `<input type="text" id="weighment_name" class="form-group col-sm-5 text-left" value="${inputs.weighment_name || ''}" >` +
            '<label for="weighment_slip_no" class="form-group col-sm-5 text-right">Weighment no</label>' +
            `<input type="text" id="weighment_slip_no" class="form-group col-sm-5 text-left" value="${inputs.weighment_slip_no || ''}" >` +
            '<label for="weighment_slip_date" class="form-group col-sm-5 text-right">Date</label>' +
            `<input type="Date" id="weighment_slip_date" class="form-group col-sm-5 text-left" value="${inputs.weighment_slip_date || ''}" >`+
            '<label for="weighment_slip_time" class="form-group col-sm-5 text-right">Time</label>' +
            `<input type="Time" id="weighment_slip_time" class="form-group col-sm-5 text-left" value="${inputs.weighment_slip_time || ''}" >`,
       
       
        }).then((result) => {
            if (result.isConfirmed) {
                setTimeout(() => {
                    const weighmentname = document.getElementById('weighment_name').value;
                    const weighment_slip_no = document.getElementById('weighment_slip_no').value;
                    const weighment_slip_date = document.getElementById('weighment_slip_date').value;
                    const weighment_slip_time = document.getElementById('weighment_slip_time').value;
                    setInputs(values => ({
                        ...values,
                        weighment_name: weighmentname,
                        weighment_slip_no: weighment_slip_no,
                        weighment_slip_date: weighment_slip_date,
                        weighment_slip_time: weighment_slip_time
                    }));
    
                    console.log("Weighment Name:", weighmentname);
                    console.log("Weighment no:", weighment_slip_no);
                    console.log("Date:", weighment_slip_date);
                    console.log("Time:",weighment_slip_time);
                });
            }
        });
    };

    const handlemeasurementIconClick = () => {
        Swal.fire({
            title: 'Measurement Details',
            html:
            '<label for="measurement_taken_by" class="form-group col-sm-5 text-right">Measurement taken by</label>' +
            `<input type="text" id="measurement_taken_by" class="form-group col-sm-5 text-left" value="${inputs.measurement_taken_by || ''}" >` +
            '<label for="authorised_by" class="form-group col-sm-5 text-right">Authorised by</label>' +
            `<input type="text" id="authorised_by" class="form-group col-sm-5 text-left" value="${inputs.authorised_by || ''}" >`+
            '<label for="received_by" class="form-group col-sm-5 text-right">Received by</label>' +
            `<input type="text" id="received_by" class="form-group col-sm-5 text-left" value="${inputs.received_by || ''}">`,
       
       
        }).then((result) => {
            if (result.isConfirmed) {
                const measurement_taken_by = document.getElementById('measurement_taken_by').value;
                const authorised_by = document.getElementById('authorised_by').value;
                const received_by = document.getElementById('received_by').value;
                setInputs(values => ({
                            ...values,
                            measurement_taken_by: measurement_taken_by,
                            authorised_by: authorised_by,
                            received_by:received_by
                        }));
                
                console.log("Measurement taken by:", measurement_taken_by);
                console.log("Authorised by:",authorised_by);
                console.log("Received by:",received_by);
            }
        });
    };
    // const CustomSelect = ({ inputs, selectedPurchaseOrder }) => {
    //     const [selectedOption, setSelectedOption] = useState(null);
      
        const handleChangevehicle = (newValue, actionMeta) => {
          setSelectedOption(newValue);
          console.log(newValue);
        };
        
    //}
  
   
   
    return(
        <>
         <div id="outer-container" className="App" >
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} /> 
                <ErrorToast/>
                <div id="page-wrap">
                    <form onSubmit={handleSubmit} >
                        <div id="header">
                            <h3 className="text font-weight-bold page-title">GOODS RECEIPT NOTE </h3>
                        </div>
                        
                        <FloatingControls tableLink="/PurchaseOrderTable" onCancel={Cancel} enableCancel={true}/>
                        <div className="container">
                            <Row>
                                <Col xl={6} lg={12} md={12}>
                                <div className="modal" tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
                                                        <div className="modal-dialog modal-xl" style={{height: "500px"}} >
                                                        <div className="modal-content">
                                                            <div className="modal-body display">
                                                            <div className="container item-list-table-container">
                                                                        <ReactTablePopUpSubmitWrapper
                                                                            title='List of Group Form'
                                                                            columns={columns}
                                                                            data={data.records}
                                                                            onRowSubmit={handleChangePurchaseOrderDetails}
                                                                            
                                                                            isLoading={isLoading}
                                                                            onClose = {Close}
                                                                        />
                                                                </div> 
                                                            </div>
                                                        </div>
                                                        </div>
                                </div>
                                    <div className="form-row table-bordered  shadow p-2 my-2 border-secondary p-2 mb-3 form-control-panel " >

                                        <label htmlFor="company_id" className="form-group col-sm-5 text-right">Company</label>
                                        <select id="company_id" name="company_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChangeCompany} value={inputs.company_id || ""}>
                                            <option value="">Select Company</option>
                                            {company.map((item) => (
                                                <option key={item.value}value={item.value}>{item.label} </option>
                                            ))} 
                                        </select><br />

                                        {/* <label htmlFor="vendor_id" className="form-group col-sm-5 text-right">Vendor Name</label>
                                        <select id="vendor_id" name="vendor_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChangeVendorDetails} value={inputs.vendor_id || ""}>
                                            <option value="">Select Vendor  Name</option>
                                            {vendor.map((item) => (
                                                <option key={item.value} value={item.value}>{item.label}</option>
                                            ))}
                                        </select><SummaryIcon onClickHandler={showVendorDetails}/><br /> */}

                                        <label htmlFor="plant_id" className="form-group col-sm-5 text-right">Plant</label>
                                        <select id="plant_id" name="plant_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChange} value={inputs.plant_id || ""}>
                                            <option value="">Select Plant</option>
                                            {plant.map((item) => (
                                                <option key={item.value}value={item.value}>{item.label} </option>
                                            ))} 
                                        </select><SummaryIcon onClickHandler={showplantdetails}/><br />
                                        <h4 className='col-sm-11'><b>Vendor Details</b></h4><br/><br/>
                                        <label htmlFor="vendor_id" className="form-group col-sm-5 text-right">Vendor Name</label>
                                        <select id="vendor_id" name="vendor_id" className="form-control col-sm-6 browser-default custom-select mandatory-form-control" required onChange={handleChangeVendorDetails} value={inputs.vendor_id || ""}>
                                            <option value="">Select Vendor  Name</option>
                                            {vendor.map((item) => (
                                                <option key={item.value} value={item.value}>{item.label}</option>
                                            ))}
                                        </select><SummaryIcon onClickHandler={showVendorDetails}/><br />

                                        <label htmlFor="transporter" className="form-group col-sm-5 text-right">Transporter</label>
                                        <EditSharpIcon color="error" onClick={handleEditIconClick}  />
                                        <div className="modal" tabIndex="-1" style={{ display: showModal2 ? 'block' : 'none' }}>
                                        <div className="modal-dialog modal-xl" style={{ height: "500px" }}>
                                        
                                            <div className="modal-content">
                                            <div className="modal-header text-center">
                                                <h5 className="modal-title">Transporter Details</h5>
                                                </div>
                                                <div className="modal-body display">
                                                <div className="form-group row">
                                                    <label htmlFor="transporter_name" className="form-group col-sm-5 text-right">Transporter Name</label>
                                                    <input type="text" id="transporter_name" className="form-group col-sm-5 text-left" value={inputs.transporter_name || ''}   />
                                                    
                                                    <label htmlFor="transporter_mode" className="form-group col-sm-5 text-right">Transport Mode</label>
                                                    <select id="transporter_mode" className="form-group col-sm-5 text-left" value={inputs.transporter_mode || ''} onChange={handleTransportModeChange } >
                                                       {selectedPurchaseOrder.transport_mode === 'own' && (
                                                            <>
                                                                <option value="own" selected>Own</option>
                                                            </>
                                                        )}
                                                        {selectedPurchaseOrder.transport_mode === 'customer' && (
                                                            <>
                                                                <option value="customer" selected>Vendor</option>
                                                            </>
                                                        )}
                                                        {selectedPurchaseOrder.transport_mode === 'own/customer' && (
                                                            <>
                                                                <option value="own" selected>Own</option>
                                                                <option value="customer">Vendor</option>
                                                            </>
                                                        )}
                                                </select>
                                
                                                <label htmlFor="vehicle_id" className="form-group col-sm-5 text-right">Vehicle Id</label>
                                                <Select
                                                    id="vehicle_id"
                                                    className="form-group col-sm-5 text-right"
                                                    options={equipments}
                                                    isSearchable={true}
                                                    
                                                />
                                                
                                                             <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <label htmlFor="vehicle_others" className="form-group col-sm-5 text-right" style={{ marginRight: '10px' }}>Vehicle others</label>
                                                            <CreatableSelect
                                                                isClearable
                                                                onChange={handleChangevehicle}
                                                                options={[]} 
                                                                value={selectedOption}
                                                                styles={{ 
                                                                    control: provided => ({ ...provided, width: '450px' }) 
                                                                }}
                                                            />
                                                            </div>
                                                        

    
                                                 
                                                {/* <label htmlFor="vehicle_others" className="form-group col-sm-5 text-right">Vehicle others</label>
                                                <input type="text" id="vehicle_others" className="form-group col-sm-5 text-left" value={inputs.vehicle_others || ''} disabled={selectedPurchaseOrder.transport_mode  === 'own'}/>
                                                 */}
                                                <label htmlFor="driver_name" className="form-group col-sm-5 text-right">Driver Name</label>
                                                <input type="text" id="driver_name" className="form-group col-sm-5 text-left" value={inputs.driver_name || ''} />
                                                
                                                <label htmlFor="driver_mobile_no" className="form-group col-sm-5 text-right">Driver Phone no</label>
                                                <input type="text" id="driver_mobile_no" className="form-group col-sm-5 text-left" value={inputs.driver_mobile_no || ''} />
                                                
                                                <label htmlFor="in_time" className="form-group col-sm-5 text-right">In Time</label>
                                                <input type="time" id="in_time" className="form-group col-sm-5 text-left" value={inputs.in_time || ''} />
                                                
                                                <label htmlFor="out_time" className="form-group col-sm-5 text-right">Out Time</label>
                                                <input type="time" id="out_time" className="form-group col-sm-5 text-left" value={inputs.out_time || ''} />
                                                
                                                <label htmlFor="lr_no" className="form-group col-sm-5 text-right">Lr no</label>
                                                <input type="text" id="lr_no" className="form-group col-sm-5 text-left" value={inputs.lr_no || ''} />
                                                
                                                <label htmlFor="lr_dt" className="form-group col-sm-5 text-right">Lr dt</label>
                                                <input type="text" id="lr_dt" className="form-group col-sm-5 text-left" value={inputs.lr_dt || ''} />
                                            </div>
                                            <div className="text-center">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal2(false)}>Close</button>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                         
                                        <label htmlFor="weighment" className="form-group col-sm-5 text-right">Weighment</label>
                                        <EditSharpIcon color="#1565c0" onClick={handleWeighmentIconClick}  />


                                        <label htmlFor="measurment" className="form-group col-sm-5 text-right">Measurement</label>
                                        <EditSharpIcon color="#1565c0" onClick={handlemeasurementIconClick}  />
                                        
                                        {/* <Dialog open={open} onClose={handleCloseDialog}>
                                        <DialogTitle>Transporter Details</DialogTitle>
                                        <DialogContent>
                                        
                                        {/* <label htmlFor=" transporter_name" className="form-group col-sm-1 text-right ">Transporter Name</label>
                                        <input type="text" id=" transporter_name" name=" transporter_name"  className="form-control col-sm-7 mandatory-form-control"  />*/}
                                        {/* <TextField label="Transporter Name"  name="transporter_name" id = "transporter_name" value={inputs.transporter_name} fullWidth /> */}
                        
                                        {/* <TextField label="Transporter Name"  name="transporter_name" id = "transporter_name" value={inputs.transporter_name || " "} onChange={handleChange} fullWidth />  */}
                                        {/* </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleSaveChanges} variant="contained" color="primary">Save</Button>
                                            <Button onClick={handleCloseDialog} variant="outlined" color="secondary">Cancel</Button>
                                        </DialogActions>
                                        </Dialog> */} 
                                        {/* <label htmlFor="transport_mode" className="form-group col-sm-5 text-right">Mode Of Delivery</label>
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
                                        </select> */}

                                    </div>
                                </Col>

                                <Col xl={6} lg={12} md={12}>

                                    <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel " >
                                    <h4 className='col-sm-11'><b>Order Details</b></h4><br/><br/>
                                        
                                        <label htmlFor="order_no" className="form-group col-sm-4 text-right">Purchase Order No</label>
                                        <input type="text" className="form-control col-sm-7" id="order_no" value={inputs.order_no || ""} disabled={true}  name="order_no" onChange={handleChangeCompany}/><br />
                                        
                                        <label htmlFor="order_date" className="form-group col-sm-4 text-right ">Date</label>
                                        <input required type="date" id="order_date" name="order_date" onChange={handleChangeCompany} className="form-control col-sm-7 mandatory-form-control" disabled={true} value={inputs.order_date || ""} max={maxDate} />
                       
                                        <label htmlFor="grn_no" className="form-group col-sm-4 text-right">Goods Receipt No</label>
                                        <input type="text" className="form-control col-sm-7 mandatory-form-control" id="grn_no" value={inputs.goods_receipt_prefix || ""} style={{ backgroundColor: "white" , cursor: "not-allowed"}} name="goods_receipt_prefix" onChange={handleChange}  /><br />
                                        <QuestionIcon onClickHandler={ShowOrderDetails}/><br />
                                       
                                        <label htmlFor="grn_date" className="form-group col-sm-4 text-right ">Date</label>
                                        <input required type="date" id="grn_date" name="grn_date" onChange={handleChange} className="form-control col-sm-7 mandatory-form-control" value={inputs.grn_date || ""} max={maxDate} />

                                        {/* <label htmlFor="indent_no" className="form-group col-sm-4 text-right">Indent No</label>
                                        <input type="text" id="indent_no" name="indent_no" className="form-control col-sm-7" value={inputs.indent_no || ""} onChange={handleChange} placeholder="Enter Indent No"/><br />
                                        
                                        <label htmlFor="indent_date" className="form-group col-sm-4 text-right">Indent Date</label>
                                        <input required type="date" id="indent_date" name="indent_date" onChange={handleChange} className="form-control col-sm-7" value={inputs.indent_date || ""} max={maxDate}   />
  */}
{/* 
                                        <label htmlFor="quotation_no" className="form-group col-sm-4 text-right">Quotation No</label>
                                        <input type="text" id="quotation_no" name="quotation_no" className="form-control col-sm-7" value={inputs.quotation_no || ""} onChange={handleChange} placeholder="Enter Quotation No"/><br />
                                       
                                        <label htmlFor="quotation_date" className="form-group col-sm-4 text-right">Quotation Date</label>
                                        <input required type="date" className="form-control col-sm-7" id="quotation_date" name="quotation_date"  onchange={handleChange} value={inputs.quotation_date || ""} max={maxDate}  /><br /> */}

                                        <label htmlFor="terms_and_condition" className="form-group col-sm-4 text-right">Terms & Conditions</label>
                                        <textarea rows="2" cols="50" className="form-control col-sm-7" id="terms_and_condition" name="terms_and_condition" onChange={handleChange} value={inputs.terms_and_condition || ""}></textarea>

                                        <label htmlFor="remarks" className="form-group col-sm-4 text-right">Remarks</label>
                                        <textarea rows="2" cols="50" className="form-control col-sm-7" id="remarks" name="remarks" onChange={handleChange} value={inputs.remarks || ""}></textarea>


                                        
                                    </div>
                                </Col>
                            </Row>

                            <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue container table-responsive">
                            {/* <label htmlFor="order_list" className="form-group col-sm-2 text-right">Product Category</label>
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

                            </div> */}
                            
                            {/* <label htmlFor="is_tax_included" className="form-group col-sm-2 text-right">Is Inclusive of Taxes?</label>
                                        <select id="is_tax_included"className="form-control col-sm-3 browser-default custom-select " name="is_tax_included" onChange={handleChange} value={inputs.is_tax_included || "true"} >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select><br/>  */}
                                        <br/>
                                    <div className="form-row table-bordered shadow p-2 my-2 border-secondary p-2 mb-3 bg-blue container table-responsive">
                                        
                                        {/* <ReactTableEditWrapper columns={details} data={rowsData} /> */}
                                       
                                        <table className="table order-list" id="myTable" style={{textAlign:"center",borderRadius:"10px",backgroundColor:"RGB(188,232,253)"}}>
    
                                            <thead>
                                            <tr>
                                                 {/* <th><button type="button"className="btn btn-success" onClick={addTableRows}>Action</button></th>  */}
                                                <th className="form-group col-sm-1 text-left" onClick={handleChangePurchaseOrderDetails}>Action</th>

                                                {/* <MaterialReactTable enableRowSelection={true}></MaterialReactTable> */}
                                                <th colSpan="1">S.No.</th>
                                                <th colSpan="1">Product</th>
                                                <th colSpan="1">Unit</th>
                                                <th colSpan="1">Order Qty.</th>
                                                <th colSpan="1">Rate / M3 </th>
                                                <th colSpan="1">Amount</th>
                                                <th colSpan="1">Balance Qty</th>
                                                <th colSpan="1">Gross Weight</th>
                                                <th colSpan="1">Tare Weight</th>  
                                                <th colSpan="1">Net Weight</th> 
                                                <th colSpan="1">Deduction Weight</th> 
                                                <th colSpan="1">Accepted Qty</th>  
                                                <th colSpan="1">DC Qty</th> 
                                                <th colSpan="1">Total Received Qty</th>
                                                <th colSpan="1">Difference Qty</th>
                                                <th colSpan="1">Tax</th>
                                                <th colSpan="1">Remarks</th> 
                                            </tr>
                                        </thead>  
                                        <tbody >
                                        {/* <TableRowsGRN rowsData={rowsData} handleCheckboxChanges={handleCheckboxChange} isChecked={isChecked}  handleChangeTableDetails={handleChangeTableDetails} handleChangeWeightDetails={handleChangeWeightDetails} handleChangeTableProduct={handleChangeTableProduct}handleChangePurchaseOrderDetails={handleChangePurchaseOrderDetails} products={products} />
                                         */}
                                        <TableRowsGRN
                                            rowsData={rowsData}
                                            handleCheckboxChange={handleCheckboxChange} // Corrected prop name
                                            isChecked={isChecked}
                                            handleChangeTableDetails={handleChangeTableDetails}
                                            handleChangeWeightDetails={handleChangeWeightDetails}
                                            handleChangeTableProduct={handleChangeTableProduct}
                                            handleChangePurchaseOrderDetails={handleChangePurchaseOrderDetails}
                                            handleChangeQtyDetails={handleChangeQtyDetails} // Assuming this is the correct prop name
                                            products={products}
                                            taxes={taxes}
                                        />

                                        </tbody>
                                     </table>    
                                    </div>
                        </div>
                        </div> 
                        <div className="footer text-center">
                           
                                <Button type="submit" className="btn btn-twitter" style={{ width: "80px", fontWeight: "bold" }} >Save</Button>
                           
                                <Button type="reset" className="btn btn-twitter" style={{ width: "80px", fontWeight: "bold" }} onClick={Cancel}>Cancel</Button>
                           
                                <Button className="btn btn-twitter" type="button" style={{ width: "80px", fontWeight: "bold" }} onClick={view}>View</Button>
                            
                                <Button className="btn btn-twitter" type="button" style={{ width: "80px", fontWeight: "bold" }} onClick={Back}>Home</Button>
                        </div>

                    </form>
                        </div>
                </div>
        </>
      )
 

}
export default GoodsReceiptNote