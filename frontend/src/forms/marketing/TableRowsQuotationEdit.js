function TableRowsQuotationEdit({rowsData, deleteTableRows, handleChangeTableDetails, handleChangeTableProduct,handleChangeProduct,products,taxes,groups}) {


    return(
        
        rowsData.map((data, index)=>{
            const {soDSqlNo,tax_id,concrete_structure_id,delivery_mode,amount,rate,quantity,unit_id,product_id,user_remarks}=data
        return(

            <tr  key={index} className="text-center detailclass" id="after-this1">
                <td><button type="button"className="btn btn-danger" onClick={()=>(deleteTableRows(index))}>x</button></td>
                <td><input type="text"  className="form-control add"  value={soDSqlNo} style={{width:"100px",backgroundColor:"white", cursor: "not-allowed"}} readOnly={true}   name="soDSqlNo" /></td>
                <td>
                    <select value={product_id} onChange={(evnt)=>(handleChangeTableProduct(index, evnt))}  style={{width: "195px"}}   name="product_id" className="form-control browser-default custom-select" id="product_id" >
                        <option value="">Select Product</option>
                        {/* {products.map((item) => (
                                          <option key={item.value} value={item.value}>
                                            {item.label}
                                          </option>
                                        ))} */}
                                         {products.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                    </select>
                </td>
                <td>
                    <input type="text"value={unit_id} onChange={(evnt)=>(handleChangeTableProduct(index, evnt))}   id="unit_id" className="form-control" style={{width:"100px",cursor:"not-allowed"}}  name="unit_id" disabled/>
                </td>
                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="quantity" value={quantity} onChange={(evnt)=>(handleChangeProduct(index, evnt))} name="quantity" required/>
                </td>
                <td>
                    <input type="number" step="any" min="0" style={{width: "100px",textAlign:"right"}} className="form-control price" id="rate" value={rate} onChange={(evnt)=>(handleChangeProduct(index, evnt))} name="rate" />
                </td>
                <td>
                    <input type="number"min="0" value={amount} onChange={(evnt)=>(handleChangeProduct(index, evnt))} className="form-control total" id="amount"  name="amount" style={{textAlign:"right",width:"150px",cursor:"not-allowed"}} disabled/>
                </td> 
                <td>
                    <select  style={{width:"210px"}}className="form-control browser-default custom-select" value={concrete_structure_id} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="concrete_structure_id" >
                        <option value="">Select Concrete structure</option>
                        {groups.map((item) => (
                                    <option key={item.value} value={item.value}>
                                    {item.label}
                                    </option>
                                ))}
                    </select>
                </td>  
                
                <td> 
                    <select id="tax_id"className="form-control browser-default custom-select" style={{width: "120px"}} value={tax_id} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))}name="tax_id" required>
                    <option value="">Select Code</option>
                   
                    {taxes.map((item) => (
                                          <option key={item.value} value={item.value}>
                                            {item.label}
                                          </option>
                                        ))}
                    </select>
                </td>            
                <td>
                    <select className="form-control browser-default custom-select"  style={{width: "185px"}} value={delivery_mode} id={delivery_mode} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="delivery_mode" required>
                        <option value="">Select Deliverymode</option>
                        <option value="manual">MANUAL</option>
                        <option value="pump">PUMP</option>
                        <option value="manual/pump">MANUAL/PUMP</option>
                        <option value="not applicable">NOT APPLICABLE</option>
                    </select>
                </td>
            
                <td>
                    <input type="text" style={{width: "120px"}} className="form-control col-sm-15" value={user_remarks} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))}  name="user_remarks"/>
                </td>
            </tr>
        )
        })
   
    )
    
}

export default TableRowsQuotationEdit;