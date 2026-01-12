function TableRowsPurchaseOrder({rowsData, deleteTableRows,handleChangeTableDetails,handleChangeTableProduct,products,taxes}) {


    return(
        
        rowsData.map((data, index)=>{
            const {soDSqlNo,tax_id,soDConStruc,soDDeliveryMode,amount,rate,quantity,unit,product_id,user_remarks}=data
        return(

            <tr  key={index} className="text-center detailclass" id="after-this1">
                <td><button type="button"className="btn btn-danger" onClick={()=>(deleteTableRows(index))}>x</button></td>
                <td><input type="text"  className="form-control add"  value={soDSqlNo} style={{width:"80px",backgroundColor:"white", cursor: "not-allowed"}} readOnly={true}   name="soDSqlNo" /></td>
                <td>
                    <select value={product_id} onChange={(evnt)=>(handleChangeTableProduct(index, evnt))} id="product_id" style={{width: "150px"}}   name="product_id" className="form-control product_id browser-default custom-select" required>
                        <option value="">Select Product</option>
                        {products.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </td>
                <td>
                    <input type="text"value={unit}   id="unit" className="form-control" style={{width:"100px",backgroundColor:"white", cursor: "not-allowed"}} readOnly={true}  name="unit" />
                    
                </td>
                <td>
                    <input type="number" step="any" min="0"style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="quantity" value={quantity} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="quantity" required/>
                </td>
                <td>
                    <input type="number" step="any" min="0" style={{width: "100px",textAlign:"right"}} className="form-control price" id="rate" value={rate} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="rate"required/>
                </td>
                
                <td>
                    <input type="number"min="0" value={amount} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} className="form-control total" id="amount"  name="amount" style={{textAlign:"right",width:"120px",backgroundColor:"white", cursor: "not-allowed"}} readOnly={true}/>
                </td>               
          
                {/* <td>
                <select className="form-control browser-default custom-select"  style={{width: "185px"}}value={so_deliverymode} onChange={(evnt)=>(handleChange4(index, evnt))} name="so_deliverymode" required disabled={disabledForQuotation}>
                        <option value="">Select Deliverymode</option>
                        <option value="mona rmc">MONA RMC</option>
                        <option value="surya rmc">surya rmc</option>
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
                        <option value="">gst 10%</option>
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

export default TableRowsPurchaseOrder;