import { useEffect, useState, useMemo } from "react";
import ReactTableWrapper from "../../components/ReactTableWrapper";
import { exportAsCSV } from "../../utils/CSVExporter";
import { exportAsPDF } from "../../utils/PDFExporter";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Sidebar from '../../Sidebar';
import Swal from "sweetalert2";
import { useCookies } from 'react-cookie';
import { getAllMaterialReceiptNotes, deleteMaterialReceiptNote } from "../../services/MaterialReceiptNoteServices";
function MaterialReceiptNoteTable() {
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
                fieldName: "address",
                headerName: 'GRN No.'
            },
            {
                fieldName: "phone_number",
                headerName: 'Date'
            },
            {
                fieldName: 'entity_name', 
                headerName: 'Vendors Name'
            },

           {
                fieldName: "address",
                headerName: 'Materials'
            },
           
            {
                fieldName: "mobile_number",
                headerName: 'Unit'
            },
            {
                fieldName: 'entity_name', 
                headerName: 'Dc/Invoice Qty'
            },
            {
                fieldName: 'entity_name', 
                headerName: 'DC No'
            },
            {
                fieldName: 'entity_name', 
                headerName: 'Dc Date'
            },
            {
                fieldName: "address",
                headerName: 'Vehicle No'
            },
            {
                fieldName: "address",
                headerName: 'Invoice No'
            },
            {
                fieldName: "mobile_number",
                headerName: 'Invoice Date'
            },
            {
                fieldName: "address",
                headerName: 'Gross Weight'
            },
            {
                fieldName: "mobile_number",
                headerName: 'Tare Weight'
            },

            {
                fieldName: 'entity_name', 
                headerName: 'Received Qty'
            },
            {
                fieldName: 'entity_name', 
                headerName: 'Difference Qty'
            },
            {
                fieldName: "address",
                headerName: 'Deduction Qty'
            },
            {
                fieldName: 'entity_name', 
                headerName: 'Weighments Name'
            },
            {
                fieldName: 'entity_name', 
                headerName: 'Weighments No'
            },
            
            {
                fieldName: "id",
                headerName: "ROW_ACTIONS"
            }
        ],
        [],);

    const onEditMaterialReceiptNote = (grnId, event) => {
       
       navigate(`/MaterialReceiptNoteEdit/${grnId}/`);
    };

    const onDeleteMaterialReceiptNote = (grnId, event) => {

        event.preventDefault();
        Swal.fire({title: 'Are you sure to Delete?',  
        showCancelButton: true,  
        confirmButtonText: `Yes`,  
        cancelButtonText: `No`,
        }).then((result) => {  
          if (result.isConfirmed) { 

            setIsLoading(true);
            deleteMaterialReceiptNote(cookies, grnId); 
            console.log(`MRN with id ${grnId} deleted`);
            Swal.fire('Deleted Successfully!', '', 'success');
            setRefreshKey(oldKey => oldKey +1)
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
            data.records.map(r => {

                const csvRow = {
                    entity_name: r.entity_name,
                    address: r.address,
                    phone_number:r.phone_number,
                    mobile_number:r.mobile_number,
                    status:r.status
                }
                return csvRow;
                }));
    };

    const handlePDFExport = (event) => {
        console.log('PDF Export');
        exportAsPDF(
            'List of Material Receipt Note',
            columns
            .filter(col => col.headerName !== 'ROW_ACTIONS')
            .map(col=>({header: col.headerName, dataKey: col.fieldName })),
            data.records.map(r => ({
                entity_name: r.entity_name,
                address: r.address, 
                phone_number:r.phone_number,
                mobile_number:r.mobile_number,
                status:r.status
            })),
            'MRNote.pdf'
        );
    };

    useEffect(() => {

        getAllMaterialReceiptNotes(cookies)
        .then( salesRepList => {
            const tableData = salesRepList.salesrep_data
            .map(salesrep => ({
                entity_name: salesrep.entity_name,
                address: `${salesrep.address_1},\n${salesrep.address_2},\n${salesrep.address_3}`,
                phone_number:salesrep.phone_number,
                mobile_number:salesrep.mobile_number,
                status:salesrep.status,
                id: salesrep.id,    
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
            <h3 style={{color:"rgb(2, 2, 49)",textAlign:"center"}}>List of Material Receipt Note</h3>
            <br/>
                <div className="container item-list-table-container">
                <div className="table-responsive">
                <ReactTableWrapper
                            title='List of Material Receipt Note'
                            columns={columns}
                            data={data.records}
                            onRowEdit={onEditMaterialReceiptNote}
                            onRowDelete={onDeleteMaterialReceiptNote}
                            onCSVExport={handleCSVExport}
                            onPDFExport={handlePDFExport}
                            isLoading={isLoading}
                        />
                </div>
                </div> 


            </div>
            <button style={{position:"relative",right:"40px"}}className="btn btn-fill btn-primary float-end" type="button" onClick={() =>{navigate("/MaterialReceiptNote")}}>Back</button>
        </div>

        
    );

}



export default MaterialReceiptNoteTable;