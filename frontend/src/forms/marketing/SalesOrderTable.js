import { useEffect, useState, useMemo } from "react";
import ReactTableWrapper from "../../components/ReactTableWrapper";
import { exportAsCSV } from "../../utils/CSVExporter";
import { exportAsPDF } from "../../utils/PDFExporter";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Sidebar from '../../Sidebar';
import Swal from "sweetalert2";
import { useCookies } from 'react-cookie';
import { displayError } from "../../helpers";
import { getAllSalesOrder, deleteSalesOrder } from "../../services/SalesOrderServices";
function SalesOrderTable() {
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
                fieldName: 'order_no', 
                headerName: 'SO No'
            },
           
            {
                fieldName: "order_date",
                headerName: 'SO Date'
            },
            {
                fieldName: "purchase_order_no",
                headerName: 'PO No'
            },
            {
                fieldName: "purchase_order_date",
                headerName: 'PO Date'
            },
            {
                fieldName: "salesrep",
                headerName: 'Marketing Name'
            },
            {
                fieldName: "customer",
                headerName: 'Customer'
            },
            {
                fieldName: "consignee",
                headerName: 'Site'
            },
            {
                fieldName: "product",
                headerName: 'Grade'
            },
            {
                fieldName: "rate",
                headerName: 'Rate'
            },
            {
                fieldName: "quantity",
                headerName: 'Order Qty'
            },
            {
                fieldName: "schedule_qty",
                headerName: 'Schedule Qty'
            },
            {
                fieldName: "supplied_qty",
                headerName: 'Supplied Qty'
            },
            {
                fieldName: "balance_qty",
                headerName: 'Balance Qty'
            },
            {
                fieldName: "delivery_mode",
                headerName: 'Delivery Mode'
            },
            {
                fieldName: "is_approved",
                headerName: 'Approval Status'
            },
            {
                fieldName: "status",
                headerName: 'Status'
            },
            {
                fieldName: "id",
                headerName: "ROW_ACTIONS"
            }
       
         
        ],
        [],);

    const onEditSalesOrder = (SalesOrderId, event) => {
       
       navigate(`/SalesOrderEdit/${SalesOrderId}/`);
    };

    const onDeleteSalesOrder = (SalesOrderId, event) => {

        event.preventDefault();
        Swal.fire({title: 'Are you sure to Delete?',  
        showCancelButton: true,  
        confirmButtonText: `Yes`,  
        cancelButtonText: `No`,
        }).then((result) => {  
          if (result.isConfirmed) { 

            setIsLoading(true);
            deleteSalesOrder(cookies, SalesOrderId)
            .then(response => {
                console.log(`Sales Order with id ${SalesOrderId} deleted`);
                setRefreshKey(oldKey => oldKey +1);
                Swal.fire('Deleted Successfully!', '', 'success');
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
        //

    };

    const handleCSVExport = (event) => {
        console.log('CSV Export');
        exportAsCSV(
            columns
            .filter(col => col.headerName !== 'ROW_ACTIONS')
            .map(c => c.headerName),
            data.records.map(salesorder => {

                const csvRow = {
                    order_no : salesorder.order_no,
                order_date: salesorder.order_date,
                purchase_order_no:salesorder.purchase_order_no,
                purchase_order_date:salesorder.purchase_order_date,
                customer: salesorder.consignee.customer.name,
                salesrep:salesorder.consignee.customer.salesrep.name,
                consignee : salesorder.consignee.name,
                product: salesorder.product.category.name,
                quantity:salesorder.quantity,
                rate : salesorder.rate,
                schedule_qty: salesorder.schedule_qty,
                supplied_qty:salesorder.supplied_qty,
                balance_qty : salesorder.balance_qty,
                delivery_mode: salesorder.delivery_mode,
                is_approved:salesorder.is_approved,
                status:salesorder.status? "Active":"Inactive",
                }
                return csvRow;
                }));
    };

    const handlePDFExport = (event) => {
        console.log('PDF Export');
        exportAsPDF(
            'List of Sales Order Form',
            columns
            .filter(col => col.headerName !== 'ROW_ACTIONS')
            .map(col=>({header: col.headerName, dataKey: col.fieldName })),
            data.records.map(salesorder => ({
                order_no : salesorder.order_no,
                order_date: salesorder.order_date,
                purchase_order_no:salesorder.purchase_order_no,
                purchase_order_date:salesorder.purchase_order_date,
                customer: salesorder.consignee.customer.name,
                salesrep:salesorder.consignee.customer.salesrep.name,
                consignee : salesorder.consignee.name,
                product: salesorder.product.category.name,
                quantity:salesorder.quantity,
                rate : salesorder.rate,
                schedule_qty: salesorder.schedule_qty,
                supplied_qty:salesorder.supplied_qty,
                balance_qty : salesorder.balance_qty,
                delivery_mode: salesorder.delivery_mode,
                is_approved:salesorder.is_approved,
                status:salesorder.status? "Active":"Inactive",
            })),
            'salesorder.pdf'
        );
    };

    useEffect(() => {

        getAllSalesOrder(cookies)
        .then( salesorderList => {
            const tableData = salesorderList.sales_order_list
            .map(salesorder => ({
                id :salesorder.id,
                order_no : salesorder.order_no,
                order_date: salesorder.order_date,
                purchase_order_no:salesorder.purchase_order_no,
                purchase_order_date:salesorder.purchase_order_date,
                customer: salesorder.consignee.customer.name,
                salesrep:salesorder.consignee.customer.salesrep.name,
                consignee : salesorder.consignee.name,
                product: salesorder.product.category.name,
                quantity:salesorder.quantity,
                rate : salesorder.rate,
                schedule_qty: salesorder.schedule_qty,
                supplied_qty:salesorder.supplied_qty,
                balance_qty : salesorder.balance_qty,
                delivery_mode: salesorder.delivery_mode,
                is_approved:salesorder.is_approved,
                status:salesorder.status? "Active":"Inactive",
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
            <h3 style={{color:"rgb(2, 2, 49)",textAlign:"center"}}>List of Sales Orders</h3>
            <br/>
                <div className="container item-list-table-container">
                <div className="table-responsive">
                <ReactTableWrapper
                            title='List of Group Form'
                            columns={columns}
                            data={data.records}
                            onRowEdit={onEditSalesOrder}
                            onRowDelete={onDeleteSalesOrder}
                            onCSVExport={handleCSVExport}
                            onPDFExport={handlePDFExport}
                            isLoading={isLoading}
                            hideDelete={true}
                        />
                </div>
                </div> 


            </div>
            <button style={{position:"relative",right:"40px"}}className="btn btn-fill btn-primary float-end" type="button" onClick={() =>{navigate("/SalesOrder")}}>Back</button>
        </div>

        
    );

}



export default SalesOrderTable;