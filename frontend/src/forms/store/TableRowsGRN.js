function TableRowsGRN({rowsData, handleCheckboxChange,isChecked,handleChangeTableDetails,handleChangeWeightDetails,handleChangeQtyDetails,handleChangeTableProduct,products,taxes}) {
    // if (!rowsData || !Array.isArray(rowsData) || rowsData.length === 0) {
    //     return <div>No data available</div>;
    // }

    return(
        
        rowsData.map((data, index)=>{
            const {soDSqlNo,amount,rate,quantity,unit,product_id,balance_qty,gross_weight,tare_weight,net_weight,received_qty,accepted_qty,difference_qty,dc_qty,deduction_qty,tax_id,user_remarks}=data
        return(

            <tr  key={index} className="text-center detailclass" id="after-this1">
                
            <td> <input type="checkbox" onChange={() => handleCheckboxChange(index)} checked={isChecked(index)} /></td> 
            {/* <td> <input type="checkbox" onChange={() => handleCheckboxChange(index)} /></td> */}

                {/* <td><button type="button"className="btn btn-danger" onClick={()=>(deleteTableRows(index))}></button></td> */}
                <td><input type="text"  className="form-control add"  value={soDSqlNo} style={{width:"80px",backgroundColor:"white", cursor: "not-allowed"}} readOnly={true}   name="soDSqlNo" disabled={true} /></td>
                <td>
                    <select value={product_id} onChange={(evnt)=>(handleChangeTableProduct(index, evnt))} id="product_id" style={{width: "150px"}}   name="product_id" className="form-control product_id browser-default custom-select" required disabled={true}>
                        <option value="">Select Product</option>
                        {products.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </td>
                <td>
                    <input type="text"value={unit}   id="unit" className="form-control" style={{width:"100px",cursor: "not-allowed "}} readOnly={true}  name="unit" disabled={true} />
                    
                </td>
                
                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="quantity" value={quantity} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="quantity" required disabled={true}/>
                </td>
                <td>
                    <input type="number" step="any" min="0" style={{width: "100px",textAlign:"right"}} className="form-control price" id="rate" value={rate} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="rate"required disabled={true}/>
                </td>
                
                <td>
                    <input type="number"min="0" value={amount} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} className="form-control total" id="amount"  name="amount" style={{textAlign:"right",width:"120px", cursor: "not-allowed"}} readOnly={true} disabled={true}/>
                </td> 
                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="balance_qty" value={balance_qty} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="balance_qty" disabled={true} />
                </td> 

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="gross_weight" value={gross_weight} onChange={(evnt)=>(handleChangeWeightDetails(index, evnt))} name="gross_weight" required/>
                </td>  

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="tare_weight" value={tare_weight} onChange={(evnt)=>(handleChangeWeightDetails(index, evnt))} name="tare_weight" required/>
                </td>

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="net_weight" value={net_weight} onChange={(evnt)=>(handleChangeWeightDetails(index, evnt))} name="net_weight" disabled={true}/>
                </td>

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="deduction_qty" value={deduction_qty} onChange={(evnt)=>(handleChangeWeightDetails(index, evnt))} name="deduction_qty" required/>
                </td> 

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="accepted_qty" value={accepted_qty} onChange={(evnt)=>(handleChangeWeightDetails(index, evnt))} name="accepted_qty" required/>
                </td> 

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="dc_qty" value={dc_qty} onChange={(evnt)=>(handleChangeQtyDetails(index, evnt))} name="dc_qty" required/>
                </td>  

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="received_qty" value={received_qty} onChange={(evnt)=>(handleChangeQtyDetails(index, evnt))} name="received_qty" disabled={true}/>
                </td>

                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="difference_qty" value={difference_qty} onChange={(evnt)=>(handleChangeQtyDetails(index, evnt))} name="difference_qty" disabled={true}/>
                </td>

                
          
                {/* <td> 
                <select className="form-control browser-default custom-select"  style={{width: "185px"}}value={so_deliverymode} onChange={(evnt)=>(handleChange4(index, evnt))} name="so_deliverymode" required disabled={disabledForQuotation}>
                        <option value="">Select Deliverymode</option>
                        <option value="mona rmc">MONA RMC</option>
                        <option value="surya rmc">surya rmc</option> */}
                        {/* <option value="manual/pump">MANUAL/PUMP</option>
                        <option value="not applicable">NOT APPLICABLE</option> */}
                    {/* </select>
                </td> } */}
                {/* <td> */}
                {/* <select id="soDConStruc" style={{width:"150px"}}className="form-control browser-default custom-select" value={soDConStruc} onChange={(evnt)=>(handleChange4(index, evnt))} name="soDConStruc" required>
                        <option value="">Select Concrete structure</option>
                        {concrete.map((item) => (
                            <option key={item.id} value={item.id}>{item.subgrpName}</option>
                        ))}
                    </select> */}
                {/* </td> */}
                <td>
                    <select value={tax_id} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} id="tax_id" style={{width: "150px"}}   name="tax_id" className="form-control product_id browser-default custom-select" required>
                        <option value="">Select Tax</option>
                        {taxes.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </td> 
       
                <td>
                    <input type="text" style={{width:"150px"}} className="form-control"value={user_remarks} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))}  name="user_remarks"/>
                </td>
             
            </tr>
        )
        })
   
    )
    
}

export default TableRowsGRN;


