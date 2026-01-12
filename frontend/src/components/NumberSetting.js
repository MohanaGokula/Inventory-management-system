import React from 'react';
import { getCurrentDate, getCurrentTime } from "../utils/DateUtils";
// import { getSalesOrderNumber } from '../services/SalesOrderServices';
import { getQuotationNumber } from '../services/QuotationServices';
// import { getDeliveryChallanNumber } from '../services/DeliveryChallanServices';
import { getPurchaseOrdernumber } from '../services/PurchaseOrderServices';

function NumberSetting({cookies, handleDateChange, serial_no, creation_date, creation_time, prefix, company_id, voucher_type, handleNumberAndPrefixUpdate, serial_no_title}) {
    
    const handleDateAndTimeChange = (event) => {

        const propertyName = event.target.name;

        if (propertyName === 'creation_date') {
            console.log(`NumberSetting:${voucher_type} - DateTime changed`)
            handleDateChange(event);
            fetchNumberSettingDetails(event.target.value);
        }
    }

    const fetchNumberSettingDetails = (dateValue) => {

        console.log(dateValue.toString()+"s.toString"); 
        var moment = require('moment');
        var d=moment(dateValue).format("DD-MM-YYYY");
        console.log(d+"d"+typeof(d))
        // if (voucher_type === 'sales_order') {
        //     getSalesOrderNumber(cookies,d, company_id)
        //     .then((response) => {
        //         console.log(response);
        //         handleNumberAndPrefixUpdate(response.prefix, response.sales_order_no);
        //     });
        // } 
        if (voucher_type === 'purchase_order') {
            getPurchaseOrdernumber(cookies,d, company_id)
            .then((response) => {
                console.log(response);
                handleNumberAndPrefixUpdate(response.prefix, response.order_no);
            });
            //TODO
        }    
        // else if (voucher_type === 'delivery_challan') {
            
        //     getDeliveryChallanNumber(cookies,d, company_id)
        //         .then((response) => {
        //             console.log(response);
        //             handleNumberAndPrefixUpdate(response.prefix, response.delivery_challan_no);
        //         });
        //     }
        //     else if (voucher_type === 'check_in') {
            
        //         getDeliveryChallanNumber(cookies,d, company_id)
        //             .then((response) => {
        //                 console.log(response);
        //                 handleNumberAndPrefixUpdate(response.prefix, response.check_out_no);
        //             });
        //         }
        else if (voucher_type === 'quotation') {
            
            getQuotationNumber(cookies,d, company_id)
                .then((response) => {
                    console.log(response);
                    handleNumberAndPrefixUpdate(response.prefix, response.quotation_no);
                });
              
             
                    }
    }

    const combineGeneratedNumber = () => {

        return (prefix && serial_no ? prefix + " " + serial_no : "");
    }
    React.useEffect(() => {
        console.log(`NumberSetting:${voucher_type} - Company changed ${company_id}`)
        if (company_id) {
            fetchNumberSettingDetails(creation_date);
        }
        
    },[company_id])

    return (
        <>
            <label htmlFor="creation_date" className="form-group col-sm-4 text-right ">Date</label>
            <input type="date" className="form-control col-sm-7 numsetting mandatory-form-control" id="creation_date" onChange={handleDateAndTimeChange} value={creation_date || getCurrentDate()} name="creation_date"/>
            
            {/* <input type="time" className="form-control col-sm-3"  onChange={handleDateAndTimeChange} value={creation_time || getCurrentTime()} name="creation_time"/><br/> */}

            <label htmlFor="serial_no" className="form-group col-sm-4 text-right">{serial_no_title ? serial_no_title : 'Serial No'}</label>
            <input type="text" className="form-control col-sm-7 mandatory-form-control" id="serial_no" readOnly={true} style={{backgroundColor:"white", cursor: "not-allowed"}} value={combineGeneratedNumber() || ""}   name="serial_no" /><br/>
            
            {/* <label htmlFor="prefix"className="form-group col-sm-4 text-right ">Prefix </label> 
            <input type="text" className="form-control col-sm-7 mandatory-form-control" id="prefix"name="prefix" value={prefix || ""} readOnly={true} style={{backgroundColor:"white", cursor: "not-allowed"}} /><br/> */}
        </>
    );
}

export default NumberSetting;