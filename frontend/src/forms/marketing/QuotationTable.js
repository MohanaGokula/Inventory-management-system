import { useEffect, useState, useMemo } from "react";
import ReactTableWrapper from "../../components/ReactTableWrapper";
import { exportAsCSV } from "../../utils/CSVExporter";
import { exportAsPDF } from "../../utils/PDFExporter";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Sidebar from '../../Sidebar';
import Swal from "sweetalert2";
import { useCookies } from 'react-cookie';
import { getAllPurchaseOrders} from "../../services/PurchaseOrderServices";
function QuotationTable() {
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
            // {
            //     fieldName: 'concrete_structure', 
            //     headerName: 'Concrete Structure'
            // },
            // {
            //     fieldName: 'delivery_mode', 
            //     headerName: 'Mode of Delivery'
            // },
            // {
            //     fieldName: 'salesrep_id', 
            //     headerName: 'Marketing'
            // },
            // {
            //     fieldName: "status",
            //     headerName: 'Status'
            // },
            {
                fieldName: "id",
                headerName: "ROW_ACTIONS"
            }
        ],
        [],);

    const onEditQuotation = (quotationId, event) => {
       
        navigate(`/QuotationEdit/${quotationId}/`);
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
            .map(c => c.headerName),
            data.records.map(quotationcsv => {

                const csvRow = {
                    company_id: quotationcsv.company_id,
                    product_id:quotationcsv.product_id,
                    quotation_no:quotationcsv.quotation_no,
                    quotation_date:quotationcsv.quotation_date,
                    customer_id:quotationcsv.customer_id,
                    salesrep_id:quotationcsv.salesrep_id,
                    consignee_id:quotationcsv.consignee_id,    
                    //consignee_pro_id:quotationcsv.consignee_pro_id,            
                    quantity: quotationcsv.quantity, 
                    rate: quotationcsv.rate, 
                    amount: quotationcsv.amount, 
                    status:quotationcsv.status ? "active":"inactive" 
                }
                return csvRow;
                }));
    };

    const handlePDFExport = (event) => {
        console.log('PDF Export');
        exportAsPDF(
            'List of Quotation',
            columns
            .filter(col => col.headerName !== 'ROW_ACTIONS')
            .map(col=>({header: col.headerName, dataKey: col.fieldName })),
            data.records.map(quotationpdf => ({

                company_id: quotationpdf.company_id,
                product_id:quotationpdf.product_id,
                quotation_no:quotationpdf.quotation_no,
                quotation_date:quotationpdf.quotation_date,
                customer_id:quotationpdf.customer_id,
                salesrep_id:quotationpdf.salesrep_id,
                consignee_id:quotationpdf.consignee_id,    
                //consignee_pro_id:quotationcsv.consignee_pro_id,            
                quantity: quotationpdf.quantity, 
                rate: quotationpdf.rate, 
                amount: quotationpdf.amount, 
                status:quotationpdf.status ? "active":"inactive"
            })),
            'quotation.pdf'
        );
    };

    useEffect(() => {
        const tableData=[]

        getAllPurchaseOrders(cookies)
        .then( quotationList => {
            
            const tableData = quotationList.purchase_order_list
            .map(quotation => ({
                id: quotation.id, 
                company_id: quotation.company.name,
                order_no: (quotation.prefix+quotation.order_no),
                order_date:quotation.order_date,
                vendor_id: quotation.vendor.name,
                quantity: quotation.quantity,
                product_id: quotation.product.name,
                unit:quotation.unit,
                rate: quotation.rate,
                amount: quotation.amount,
                is_approved: quotation.is_approved,
                // product_id:quotation.product.name,
                // quotation_no:(quotation.prefix+quotation.quotation_no),
                // quotation_date:quotation.quotation_date,
                // customer_id:quotation.customer.name,
                // salesrep_id:quotation.customer.salesrep.name,
                // consignee_id:quotation.consignee.name,
                // quantity: quotation.quantity, 
                // rate: quotation.rate, 
                // amount: quotation.amount, 
                // status:quotation.status ? "active":"inactive",
                // project_name:quotation.consignee.project_name,
                // tax:quotation.tax.name,
                // concrete_structure:quotation.concrete_structure.name,
                // delivery_mode:quotation.delivery_mode.toUpperCase(),
                // hide_row_edit:"No"
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
            <h3 style={{color:"rgb(2, 2, 49)",textAlign:"center"}}>List of Quotation</h3>
            <br/>
                <div className="container item-list-table-container">
                <div className="table-responsive">
                <ReactTableWrapper
                            title='List of Quotation'
                            columns={columns}
                            data={data.records}
                            onRowEdit={onEditQuotation}
                            onRowDelete={onDeleteQuotation}
                            onCSVExport={handleCSVExport}
                            onPDFExport={handlePDFExport}
                            isLoading={isLoading}
                            hideDelete={true}
                        />
                </div>
                </div> 


            </div>
            <button style={{position:"relative",right:"40px"}}className="btn btn-fill btn-primary float-end" type="button" onClick={() =>{navigate("/Quotation")}}>Back</button>
        </div>

        
    );

}



export default QuotationTable;