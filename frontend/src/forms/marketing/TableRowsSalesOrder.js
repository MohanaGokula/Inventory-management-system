function TableRowsSalesOrder({rowsData, deleteTableRows, handleChangeTableDetails, handleProductChange,products,taxes,groups, disabledForQuotation}) {


    return(
        
        rowsData.map((data, index)=>{
            
            const {so_slno,so_taxcode,so_concretestructure,so_deliverymode,so_amt,so_rate,so_orderqty,so_unit,so_productcode,so_remarks}=data
        return(

            <tr  key={index} className="text-center detailclass" id="after-this1">
                <td><button type="button"className="btn btn-danger" onClick={()=>(deleteTableRows(index))}>x</button></td>
                <td><input type="text"  className="form-control add"  value={so_slno} style={{width:"100px",backgroundColor:"white", cursor: "not-allowed"}} readOnly={true}   name="so_slno" disabled/></td>
                <td>
                    <select value={so_productcode} onChange={(evnt)=>(handleProductChange(index, evnt))} id="so_productcode" style={{width: "150px"}}   name="so_productcode" className="form-control soDProdCode browser-default custom-select" required>
                        <option value="">Select Product</option>
                        {products.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </td>
                <td>
                    <input type="text" value={so_unit} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))}   id="so_unit" className="form-control" style={{width:"100px", cursor: "not-allowed"}} readOnly={true}  name="so_unit"  disabled={true}/>
                </td>
                <td>
                    <input type="number" step="any" min="0" style={{width: "100px",textAlign:"right"}} className="form-control qty"  id="so_orderqty" value={so_orderqty} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="so_orderqty" required />
                </td>
                <td>
                    <input type="number" step="any" min="0" style={{width: "100px",textAlign:"right"}} className="form-control price" id="price" value={so_rate} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="so_rate" required disabled={disabledForQuotation}/>
                </td>
                <td>
                    <input type="number" step="any" min="0" value={so_amt} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} className="form-control total" id="total"  name="so_amt" style={{textAlign:"right",width:"150px", cursor: "not-allowed"}} readOnly={true} disabled/>
                </td>               
                <td>
                    <select className="form-control browser-default custom-select"  style={{width: "185px"}}value={so_deliverymode} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="so_deliverymode" required disabled={disabledForQuotation}>
                        <option value="">Select Deliverymode</option>
                        <option value="manual">MANUAL</option>
                        <option value="pump">PUMP</option>
                        <option value="manual/pump">MANUAL/PUMP</option>
                        <option value="not applicable">NOT APPLICABLE</option>
                    </select>
                </td>
                <td>
                    <select id="so_concretestructure" style={{width:"210px"}}className="form-control browser-default custom-select" value={so_concretestructure} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))} name="so_concretestructure" required disabled={disabledForQuotation}>
                        <option value="">Select Concrete structure</option>
                        {groups.map((item) => (
                                    <option key={item.value} value={item.value}>
                                    {item.label}
                                    </option>
                                ))}
                    </select>
                </td>
                <td> 
                    <select id="so_taxcode"className="form-control browser-default custom-select" style={{width: "120px"}} value={so_taxcode} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))}name="so_taxcode" required disabled={disabledForQuotation}>
                    <option value="">Select Code</option>
                                {taxes.map((item) => (
                                    <option key={item.value} value={item.value}>
                                    {item.label}
                                    </option>
                                ))}
                    </select>
                </td>
                <td>
                    <input type="text" style={{width:"150px"}} className="form-control"value={so_remarks} onChange={(evnt)=>(handleChangeTableDetails(index, evnt))}  name="so_remarks"/>
                </td>
            </tr>
        )
        })
   
    )
    
}

export default TableRowsSalesOrder;