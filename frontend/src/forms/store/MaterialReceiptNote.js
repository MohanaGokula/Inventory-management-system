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
import { components } from "react-select";
import { moment } from 'moment';
import { useLocation, Link } from 'react-router-dom';
import {displayErrorToast} from '../../helpers';
import ErrorToast from '../../ErrorToast';
import FloatingControls from '../../components/FloatingControls';
import LoadingOverlay from '../../components/LoadingOverlay';
function MaterialReceiptNote() {
  const location = useLocation();
  const [cookies] = useCookies(['myToken']);
  const [category] = useCookies(['myCategory']);
  const [superuser] = useCookies(['mySuperuser']);
  const [inProgress, setInProgress] = useState(false);
  const [inputs, setInputs] = useState({});
  const [plant, setPlant] = React.useState([]);
  const [Appr_so_dtl, setAppr_so_dtl] = React.useState([]);

  const [gang, setGang] = React.useState([]);
  const [Dc, setDc] = useState({});
  const [TowingVehicle, setTowingVehicle] = React.useState([]);
  useEffect(() => {
    async function getCharacters() {
      const response = await fetch("http://127.0.0.1:8000/MaterialReceiptNote/",{ method: 'GET',
      headers: {
          'Authorization': `Token ${cookies['myToken']}`
      }});
      const data = await response.json();
  
      if(data.msg)
      {
        Swal.fire((data.msg), '', 'info')
      }
      else
      {
      setPlant(data.company)
      }
    }
    getCharacters();
  }, []);
  const navigate = useNavigate();
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
try{  
    if (name === 'dcCompCode') {
      fetch(`http://127.0.0.1:8000/MaterialReceiptNote_drp/${value}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${cookies['myToken']}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then((data) => {
          console.log(JSON.stringify(data) + "ata_store_drop");
          setAppr_so_dtl(data.wrkshedule)
        })
    }
    setInputs(values => ({ ...values, [name]: event.target.value }))
  }
  catch(e)
  {
    displayErrorToast(e);
  }

}
  const [rowsData, setRowsData] = useState([]);
  const handleSubmit = (event) => {
    event.preventDefault();
    var err = 0;
try{  
    if (err == 0) {
      Swal.fire({
        title: 'Do you want to save?',
        showCancelButton: true,
        confirmButtonText: `Yes`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          axios.post('http://127.0.0.1:8000/MaterialReceiptNote/', {
            rowsData: rowsData,
            dcCompCode: inputs.dcCompCode,
            wsSlNo: inputs.wsSlNo
          },
            {
              headers: {
                'Authorization': `Token ${cookies['myToken']}`
              }
            })
            .then(function (response) {
              console.log(JSON.stringify(response) + "response");
            }).catch(function (error) {
              console.log(JSON.stringify(error) + "error");
            })
          Swal.fire('Saved!', '', 'success')
          Cancel();
        }
        else if (result.isDismissed) {
          Swal.fire('Not saved', '', 'info')
        }
      });
    }
    else {
      Swal.fire('Please check value')
    }
   }
   catch(e)
   {
     displayErrorToast(e);
   }
 }

  const Cancel = () => {
    setInputs(() => "")
    setRowsData([])
  }
  const Vendor = () => {
    const plant = Dc.venCode
try{ 
    if (plant) {
      navigate(`/MaterialReceipt/${plant}`)
    }
    else {
      Swal.fire({html:`<div style='border:1px solid black'><table align='center' width='100%'><tr><td colspan="2"style="background-color: blue"><h6 style="color:white;">VENDOR DETAILS</h6></td></tr><tr><td align='right' style='font-size:14px' width='50%'>ADDRESSS 1 :</td><td align='left' style='font-size:14px'>23,KK NAGAR</td></tr><tr><td align='right' style='font-size:14px'>ADDRESS 2 :</td><td align='left' style='font-size:14px'>11,T.NAGAR</td></tr></table></div>`}, '', 'info');   
  
    }
  }
  catch(e)
  {
    displayErrorToast(e);
  }
}
  const Purchaseorder = () => {
    const plant = Dc. puHCompCode
   try{ 
        if (plant) {
          navigate(`/MaterialReceipt/${plant}`)
        }
        else {
          Swal.fire({html:` <div style='border:1px solid black'><table align='center' width='100%'><tr><td colspan="2"style="background-color: blue"><h6 style="color:white;">PURCHASEORDER DETAILS</h6></td></tr><tr><td align='right' style='font-size:14px' width='50%'>DATE :</td><td align='left' style='font-size:14px'>10-11-2023</td></tr><tr><td align='right' style='font-size:14px'>SL NO. :</td><td align='left' style='font-size:14px'>1010</td></tr><tr><td align='right' style='font-size:14px'>MATERIAL CODE :</td><td align='left' style='font-size:14px'>1001</td></tr><tr><td align='right' style='font-size:14px'>MATERIAL NAME :</td><td align='left' style='font-size:14px'>MTNO</td></tr><tr><td align='right' style='font-size:14px'>UNIT :</td><td align='left' style='font-size:14px'>dcSoDt</td></tr><tr><td align='right' style='font-size:14px'>ORDER QTY. :</td><td align='left' style='font-size:14px'>100</td></tr><tr><td align='right' style='font-size:14px'>RATE :</td><td align='left' style='font-size:14px'>dcSoDt</td></tr><tr><td align='right' style='font-size:14px'>BALANCE QTY:</td><td align='left' style='font-size:14px'>25000</td></tr></table></div>`}, '', 'info');   
      
        }
      }
      catch(e)
      {
        displayErrorToast(e);
      }
     }


  const Dtl_Submit=(event)=> {
      const wono=event.target.value;
      const plant=inputs.dcCompCode;
   fetch(`http://127.0.0.1:8000/MaterialReceiptNote_Dtl/${wono}/${plant}`,{
              method: 'GET',
              headers: {
                  'Authorization': `Token ${cookies['myToken']}`,
                  'Content-Type': 'application/json'
              }
          })
            .then(response => response.json())
       
  }

  const view = () => {
    navigate('/MaterialReceiptNoteTable')
  } 

  const Back = () => {
    navigate('/Home')
  }

return (
    <>
      <div id="outer-container" className="App" >
        <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
        <LoadingOverlay inProgress={inProgress}/>
        <div id="page-wrap">
          <form onSubmit={handleSubmit} >
            <div id="header">
              <h3 className="text font-weight-bold page-title">MATERIAL RECEIPT NOTE </h3>
            </div>
            <FloatingControls tableLink="/CompanyTable" onCancel={Cancel} enableCancel={true}/>
           
            <div className="container">
              <Row>
                <Col xl={6} lg={12} md={12}>
                  <div className="form-row table-bordered  shadow p-2 my-2 border-secondary p-2 mb-3 form-control-panel ">
                    <label htmlFor="grnHCompcode" className="form-group col-sm-5 text-right">Plant*</label>
                    <select id="grnHCompcode" name="grnHCompcode" className="form-control col-sm-6  browser-default custom-select" required onChange={handleChange} value={inputs.dcCompCode || ""}>
                      <option value="">Select </option>
                      {plant.map((item) => (
                        <option key={item.id} value={item.id}>{item.cmpAlias}</option>
                      ))}
                    </select><br />
                

                    <label htmlFor="venAdd1" className="form-group col-sm-5 text-right">Vendor</label>
                    <input type="text" className="form-control col-sm-6" onClick={Vendor}   id="venAdd1" value={inputs.venAdd1 || ""}readOnly={true} style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />

                    </div>
                  <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel" >
                  
                    <label htmlFor="grnHTransporterName" className="form-group col-sm-5 text-right">Transporter's Name</label>
                    <input type="text" className="form-control col-sm-6" id="grnHTransporterName" style={{ backgroundColor: "white" }} /><br />

                  
                    <label htmlFor="grnHDriverName" className="form-group col-sm-5 text-right">Drivers Name</label>
                    <input type="text" className="form-control col-sm-6" id="grnHDriverName" style={{ backgroundColor: "white" }} /><br />

                    <label htmlFor="grnHDriverMobNo" className="form-group col-sm-5 text-right">Driver's MobileNo.</label>
                    <input type="text" className="form-control col-sm-6" id="grnHDriverMobNo" style={{ backgroundColor: "white"}} /><br />

              

                  </div>
                  <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel">
                  
                  <label htmlFor="grnHMTakenBy" className="form-group col-sm-5 text-right">Measurement TakenBy</label>
                  <input type="text" className="form-control col-sm-6" id="grnHMTakenBy" style={{ backgroundColor: "white"}} /><br />

                
                  <label htmlFor="grnHAuthBy" className="form-group col-sm-5 text-right">Authorised By</label>
                  <input type="text" className="form-control col-sm-6" id="grnHAuthBy" style={{ backgroundColor: "white" }} /><br />

                  <label htmlFor="grnHReceivedBy" className="form-group col-sm-5 text-right">Received By.</label>
                  <input type="text" className="form-control col-sm-6" id="grnHReceivedBy" style={{ backgroundColor: "white" }} /><br />

            

                </div>
 
                
                <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel">
                  
                  <label htmlFor="grnHweighname" className="form-group col-sm-5 text-right">Weighment's Name.</label>
                  <input type="text" className="form-control col-sm-6" id="grnHweighname" style={{ backgroundColor: "white"}} /><br />
                  
                  <label htmlFor="grnHweighNo" className="form-group col-sm-5 text-right">Weighment's Ticket No.</label>
                  <input type="text" className="form-control col-sm-6" id="dcSlgrnHweighNoNo" style={{ backgroundColor: "white"}} /><br />

                
                
                  <label htmlFor="grnHweighDt" className="form-group col-sm-5 text-right">Date*</label>
                  <input type="date" className="form-control col-sm-6" id="grnHweighDt" style={{ backgroundColor: "white" }} /><br />

                  <label htmlFor="grnDNarrdeduction" className="form-group col-sm-5 text-right">Please specify, if any deductions</label>
                  <input type="text" className="form-control col-sm-6" id="grnDNarrdeduction" style={{ backgroundColor: "white"}} /><br />

                  <label htmlFor="grnHRemarks" className="form-group col-sm-5 text-right">Remarks</label>
                  <input type="text" className="form-control col-sm-6" id="grnHRemarks" style={{ backgroundColor: "white" }} /><br />


                </div>
             
                </Col>
                <Col xl={6} lg={12} md={12}>
                  <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel">
                    <label htmlFor="grnHposlno" className="form-group col-sm-4 text-right">P.O. No.</label>
                    <input type="text" className="form-control col-sm-6" onClick={Purchaseorder}  id="grnHposlno"value={inputs.grnHposlno || ""} readOnly={true} style={{backgroundColor:"white", cursor: "not-allowed"}} name="grnHposlno" /><br/>
                    <button type="button"  className="btn btn-primary text-blue text-bold" style={{width: "60px"}} data-toggle="modal" data-target="#exampleModalCenter">  <i className="fa fa-search"></i></button><br/><br/>
                    <div className="modal fade" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                <div className="modal-dialog modal-lg" style={{height: "500px"}} >
                                  <div className="modal-content">
                                      <div className="modal-body display">
                                        <table id="example mytable" className="table">
                                            <thead>
                                                <tr>                                                    
                                                    <th>Action</th>
                                                    <th>Billing</th>
                                                    <th>Delivery</th>
                                                    <th>W.O.No</th> 
                                                    <th>S.O.No</th>  
                                                    <th>Site</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tbodymodal">
                                            {Appr_so_dtl.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <button id="wsSlNo" style={{width:"100px"}} className="btn btn-info" value={item.wsSlNo}  onClick={(event)=>Dtl_Submit(event)} data-dismiss="modal" required="">submit</button>
                                                </td>
                                                <td>{item.Billing}</td>
                                                <td>{item.Delivery}</td>
                                                <td>{item.wsSlNo}</td>                                
                                                <td>{item.soHSlNo}</td>                         
                                                <td>{item.site}</td>
                                            </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                      </div>
                                  </div>
                                </div>
                        </div>

                    <label htmlFor="grnHSlNo" className="form-group col-sm-4 text-right">G.R. No.</label>
                    <input type="text" className="form-control col-sm-6" id="grnHSlNo"  style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />


                    <label htmlFor="grnHSlDt" className="form-group col-sm-4 text-right">Date*</label>
                  <input type="date" className="form-control col-sm-6" id="grnHSlDt" style={{ backgroundColor: "white" }} /><br />
                                            
                    <label htmlFor="grnHPrefix" className="form-group col-sm-4 text-right">Prefix</label>
                    <input type="text" className="form-control col-sm-6" id="grnHPrefix"  style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />

                  </div>
                  
                  <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3  form-control-panel ">
                  <label htmlFor="grnHVehNo" className="form-group col-sm-4 text-right">Vehicle No*</label>
                  <input type="text" className="form-control col-sm-6" id="grnHVehNo" style={{ backgroundColor: "white" }} /><br />

                  <label htmlFor="grnHInTime" className="form-group col-sm-4 text-right">Vehicle InTime*</label>
                  <input type="time" className="form-control col-sm-6" id="grnHInTime" style={{ backgroundColor: "white" }} /><br />

                  <label htmlFor="grnHOutTime" className="form-group col-sm-4 text-right">Vehicle Out Time*</label>
                  <input type="time" className="form-control col-sm-6" id="grnHOutTime" style={{ backgroundColor: "white" }} /><br />

                    
                  <label htmlFor="grnHDcNo" className="form-group col-sm-4 text-right">D.C. No*</label>
                  <input type="text" className="form-control col-sm-6" id="grnHDcNo" style={{ backgroundColor: "white"}} /><br />
                  
                  <label htmlFor="grnHDcDt" className="form-group col-sm-4 text-right">Date*</label>
                  <input type="date" className="form-control col-sm-6" id="grnHDcDt" style={{ backgroundColor: "white" }} /><br />

                  <label htmlFor="grnHInvoiceNo" className="form-group col-sm-4 text-right">Invoice No</label>
                  <input type="text" className="form-control col-sm-6" id="grnHInvoiceNo" style={{ backgroundColor: "white"}} /><br />
                  
                  <label htmlFor="grnHInvoiceDt" className="form-group col-sm-4 text-right">Date*</label>
                  <input type="date" className="form-control col-sm-6" id="grnHInvoiceDt" style={{ backgroundColor: "white" }} /><br />

                  <label htmlFor="grnDDcQty" className="form-group col-sm-4 text-right">D.C/Invoice Qty*</label>
                  <input type="text" className="form-control col-sm-6" id="grnDDcQty" style={{ backgroundColor: "white" }} /><br />
                  
                  </div>
                  <div className="form-row table-bordered shadow p-2 my-2  border-secondary p-2 mb-3 form-control-panel" >
                  <label htmlFor="grnDGrossWt" className="form-group col-sm-4 text-right">Gross Weight</label>
                    <input required type="number" min="0" onChange={handleChange} className="form-control col-sm-6" />

                    <label htmlFor="grnDTareWt" className="form-group col-sm-4 text-right">Tare Weight</label>
                    <input required type="number" min="0" onChange={handleChange} className="form-control col-sm-6" />

                    
                    <label htmlFor="grnDNetWt" className="form-group col-sm-4 text-right">Net Weight</label>
                    <input required type="number" min="0" onChange={handleChange} className="form-control col-sm-6" />

                    <label htmlFor="grnDDetQty" className="form-group col-sm-4 text-right">Deduction Weight</label>
                    <input required type="number" min="0" onChange={handleChange} className="form-control col-sm-6" />

                    <label htmlFor="grnTotalReceivedQty" className="form-group col-sm-4 text-right">Total Received Qty.</label>
                  <input type="text" className="form-control col-sm-6" id="grnTotalReceivedQty" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />
                  
                  <label htmlFor="diffqty" className="form-group col-sm-4 text-right">Difference Qty</label>
                  <input type="text" className="form-control col-sm-6" id="diffqty" style={{ backgroundColor: "white", cursor: "not-allowed" }} /><br />
                  
                  
                    </div>
                </Col>
              </Row>
            </div>
            <div className="footer text-center">
                {((superuser['mySuperuser']) || (category['myCategory'][0].Is_materialreceiptnote_for_so_add === true)) &&(
                    <Button  type="submit" className="btn btn-twitter" style={{width:"80px",fontWeight:"bold"}} >Save</Button> 
                )}&nbsp;&nbsp;
                {((superuser['mySuperuser']) || (category['myCategory'][0].Is_materialreceiptnote_for_so_add === true)) &&(
                    <Button type="reset" className="btn btn-twitter" style={{width:"80px",fontWeight:"bold"}} onClick={Cancel}>Cancel</Button>
                )}&nbsp;&nbsp;
                {((superuser['mySuperuser']) || (category['myCategory'][0].Is_materialreceiptnote_for_so_view === true)|| (category['myCategory'][0].Is_materialreceiptnote_for_so_edit === true) || (category['myCategory'][0].Is_materialreceiptnote_for_so_delete === true)) &&(  
                    <Button className="btn btn-twitter"  type="button"style={{width:"80px",fontWeight:"bold"}} onClick={view}>View</Button>
                )}&nbsp;&nbsp;
                    <Button className="btn btn-twitter" type="button"style={{width:"80px",fontWeight:"bold"}} onClick={Back}>Home</Button>
                </div>


          </form>
        </div>
      </div>

    </>

  );
}
export default MaterialReceiptNote;
