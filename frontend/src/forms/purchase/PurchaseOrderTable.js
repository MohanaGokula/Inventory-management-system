import { useEffect, useState, useMemo } from "react";
import ReactTableWrapper from "../../components/ReactTableWrapper";
import { exportAsCSV } from "../../utils/CSVExporter";
import { exportAsPDF } from "../../utils/PDFExporter";
import {fetchPDF} from "../../services/PurchaseOrderServices";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Sidebar from '../../Sidebar';
import Swal from "sweetalert2";
import { useCookies } from 'react-cookie';
import { getAllPurchaseOrders} from "../../services/PurchaseOrderServices";
import { displayError } from "../../helpers";
function PurchaseOrderTable() {
    const InitialData = {
        total_pages: 0,
        records: [],
      };
    const [data, setData] = useState(InitialData);
    const navigate = useNavigate(); 
    const [refreshKey, setRefreshKey] = useState(0);
    const [cookies] = useCookies(['myToken']);
    const [isLoading, setIsLoading] = useState(true);  
    const columns = useMemo(
        () => [
            {
                fieldName: "company_id",
                headerName: 'Office'
            },
            {
                fieldName: "order_no",
                headerName: 'PurchaseOrder no'
            },
            {
                fieldName: 'order_date', 
                headerName: 'Date'
            },
            {
                fieldName: 'vendor_id', 
                headerName: 'Vendor'
            },
            {
                fieldName: 'quantity', 
                headerName: 'Order Qty'
            },
            {
                fieldName: 'product_id', 
                headerName: 'Product Name'
            },
            {
                fieldName: 'unit', 
                headerName: 'Unit'
            },
            {
                fieldName: "rate",
                headerName: 'Rate'
            },
            {
                fieldName: "amount",
                headerName: 'Amount'
            },
            {
                fieldName: 'is_approved', 
                headerName: 'Approval Status'
            },
            
            {
                fieldName: "id",
                headerName: "ROW_ACTIONS"
            }
        ],
        [],);

    const onEditPurchaseOrder = (PurchaseOrderId, event) => {
       
       navigate(`/PurchaseOrderEdit/${PurchaseOrderId}/`);
    };
    const onDeleteQuotation = (quotationId, event) => {

        event.preventDefault();
        Swal.fire({title: 'Are you sure to Delete?',  
        showCancelButton: true,  
        confirmButtonText: `Yes`,  
        cancelButtonText: `No`,
        }).then((result) => {  
          if (result.isConfirmed) { 
            setIsLoading(true);
            // deleteQuotation(cookies, quotationId); 
        console.log(`Quotation with id ${quotationId} deleted`);
            Swal.fire('Deleted Successfully!', '', 'success');
            setRefreshKey(oldKey => oldKey +1)
          } else if (result.isDismissed) {    
            Swal.fire('Not Deleted', '', 'info')  
        }
        });
        

    };

    const handleCSVExport = (event) => {
        console.log('CSV Export');
        exportAsCSV(
            columns
            .filter(col => col.headerName !== 'ROW_ACTIONS')
            // .map(c => ({ headerName: c.headerName, fieldname: c.fieldname })),
            .map(c => c.headerName),
            data.records.map(POcsv => {

                const csvRow = {
                    id: POcsv.id, 
                    company_id: POcsv.company_id,
                    order_no: POcsv.order_no,
                    order_date:POcsv.order_date,
                    vendor_id: POcsv.vendor_id,
                    quantity: POcsv.quantity,
                    product_id: POcsv.product_id,
                    unit:POcsv.unit,
                    rate: POcsv.rate,
                    amount: POcsv.amount,
                    is_approved: POcsv.is_approved? "Approved":"Waiting",
                    
                }
                return csvRow;
                }));
    };

    const handlePDFExport = (event) => {
        console.log('PDF Export');
        exportAsPDF(
            'List of PurchaseOrder',
            columns
            .filter(col => col.headerName !== 'ROW_ACTIONS')
            .map(col=>({header: col.headerName, dataKey: col.fieldName })),
            data.records.map(POpdf => ({
                id: POpdf.id, 
                company_id: POpdf.company_id,
                order_no: POpdf.order_no,
                order_date:POpdf.order_date,
                vendor_id: POpdf.vendor_id,
                quantity: POpdf.quantity,
                product_id: POpdf.product_id,
                unit:POpdf.unit,
                rate: POpdf.rate,
                amount: POpdf.amount,
                is_approved: POpdf.is_approved? "Approved":"Waiting",


            })),
            'PO.pdf'
        );
    };

    // const onPrintBr = (deliveryId, event) => {
    //     event.preventDefault();
    //     setIsLoading(true);
    //     printBatchReport(cookies, deliveryId)
    //     .then(response => {
    //         const file = new Blob([response], { type: "application/pdf" });
    //         //Build a URL from the file
    //         const fileURL = URL.createObjectURL(file);
    //         //Open the URL on new Window
    //         const pdfWindow = window.open();
    //         pdfWindow.location.href = fileURL;
    //         setIsLoading(false);
    //     })
    //     .catch(error => {
    //         // setRefreshKey(oldKey => oldKey +1);
    //         console.log(error);
    //         displayError(error,'BR print Failed');
    //         setIsLoading(false);
    //     });  
   
    const handleCustomPrintExport = (purchaseOrderId, event) => {

        setIsLoading(true);
        fetchPDF(cookies, purchaseOrderId)
        .then(response => {
            const file = new Blob([response], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            const pdfWindow = window.open();
            pdfWindow.location.href = fileURL;
            setIsLoading(false);
        })
        .catch(error => {
            console.error(error);
            displayError(error, 'Custom print/export failed');
            setIsLoading(false);
        });
    };
    

    
    
    

    useEffect(() => {
        const tableData=[]

        getAllPurchaseOrders(cookies)
        .then( List => {
            
            const tableData = List.purchase_order_list
            .map(PO => ({
                id: PO.id, 
                company_id: PO.company.name,
                order_no: (PO.prefix+PO.order_no),
                order_date:PO.order_date,
                vendor_id: PO.vendor.name,
                quantity: PO.quantity,
                product_id: PO.product.name,
                unit:PO.product.unit.symbol,
                rate: PO.rate,
                amount: PO.amount,
                is_approved: PO.is_approved? "Approved":"Waiting",
                
            }));

            setData({
                total: data.total,
                records: tableData
            });
            setIsLoading(false);
     });
        }, [refreshKey]);
    
    return (

        <div id="outer-container"  className="App" > 
            <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
            <div id="page-wrap">
            <h3 style={{color:"rgb(2, 2, 49)",textAlign:"center"}}>List of PurchaseOrder</h3>
            <br/>
                <div className="container item-list-table-container">
                <div className="table-responsive">
                <ReactTableWrapper
                            title='List of PurchaseOrder'
                            columns={columns}
                            data={data.records}
                            onRowEdit={onEditPurchaseOrder}
                            onRowDelete={onDeleteQuotation}
                            onCSVExport={handleCSVExport}
                            onPDFExport={handlePDFExport}
                            onRowBrPrint={handleCustomPrintExport}

                            isLoading={isLoading}
                            hideDelete={true}
                        />
                </div>
                </div> 


            </div>
            <button style={{position:"relative",right:"40px"}}className="btn btn-fill btn-primary float-end" type="button" onClick={() =>{navigate("/PurchaseOrder")}}>Back</button>
        </div>

        
    );

}



export default PurchaseOrderTable;