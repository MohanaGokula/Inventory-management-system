import MaterialReactTable from 'material-react-table'
import EditSharpIcon from '@mui/icons-material/EditSharp'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import PrintIcon from '@mui/icons-material/Print';
import { useState, useEffect } from "react";
import {Button, Box} from '@mui/material';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Status = ({value,row}) => {
    const navigate = useNavigate(); 
    const handleClick = () => {
        // console.log('Button clicked!');
        Swal.fire({title: 'You cannot edit delivery challans related to this work schedule further..Do you wish to confirm?',  
        showCancelButton: true,  
        confirmButtonText: `Yes`,  
        cancelButtonText: `No`,
        }).then((result) => {  
        if (result.isConfirmed) { 
            navigate(`/JobCompletion/${row.original.id}/`);
        } 
        });
    };

    const colorMap = {
        not_started: 'warning',
        in_progress: 'primary',
        to_complete: 'success',
        completed: 'error'
    };
    const buttonColor = colorMap[value] ; 
    
    // Replace hyphen with an empty string if underscore is present
    const transformedValue = value.includes('_') ? value.replace('_', ' ') : value;

return (
    value === 'in_progress' || value === 'not_started' || value === 'completed' || value ==='to_complete'?
        (<Button 
            color={buttonColor} variant="contained" size="small"  
            onClick={value === 'to_complete' ? handleClick : undefined } 
        >{transformedValue}
        </Button>)
        :
        (<Box component="span"
            sx={{
                backgroundColor:
                    value.toLowerCase() === 'active'? 'success.dark'
                        : value.toLowerCase() === 'inactive' ? 'error.dark': 'warning.dark',
                borderRadius: '0.25rem',
                color: '#fff',
                maxWidth: '9ch',
                p: '0.25rem',
                textTransform: 'capitalize',
                fontWeight: 'bold'
            }}
        >{value}
        </Box>)
    );
}

function ReactTableWrapper({
    title,
    columns,
    data,
    onRowEdit,
    onRowDelete,
    onCSVExport,
    onPDFExport,
    // onPrintExport,
    enableExportToolbar = true,
    isLoading = true,
    hideDelete = false,
    onRowBrPrint
}) {

    const [tableColumns, setTableColumns] = useState([]);
    
    useEffect(() => {
        // console.log(JSON.stringify(data)+"data");
        // console.log('Useeffect rendered');
        const tableColumns = columns.map(col => {

            let cellAlign = col.align || 'left';
            let columnProperties = {
                accessorKey: col.fieldName,
                header: col.headerName
            };

            if (col.headerName === 'ROW_ACTIONS') {
                columnProperties = {
                    ...columnProperties,
                    header: 'Action',
                    Header: <span style={col.headerStyle}>Action</span>,
                    Cell: ({renderedCellValue,row}) => {
                        //const is_br_needed=row.original.is_batch_report_needed;
                        //const is_br_needed=data.filter(obj=> ((obj.id=== renderedCellValue)))[0].is_br_needed
                        const hide_row_edit = data.filter(obj => ((obj.id === renderedCellValue)))[0].hide_row_edit
                        console.log(JSON.stringify(hide_row_edit)+"hide_row_edit")
                        console.log(JSON.stringify(data)+"data")
                        console.log(renderedCellValue+"renderedCellValue")
                        const hide_row_delete = data.filter(obj => ((obj.id === renderedCellValue)))[0].hide_row_delete
                        
                        // console.log(JSON.stringify(hide_row_delete)+"hide_row_delete")
                        // console.log(JSON.stringify(hideDelete)+"hidedelete")
                        return (
                            <span>
                                {(hide_row_edit == undefined ||  hide_row_edit === "No") && (
                                <EditSharpIcon onClick={(event) => onRowEdit(renderedCellValue, event)} 
                                sx={{
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '24px',
                                    backgroundColor: 'primary.dark',
                                    margin: '3px',
                                    borderRadius: '4px',
                                    padding: '1px'
                                }}
                                />
                                )}
                                {((!hideDelete) && (hide_row_delete == undefined ||  hide_row_delete === "No")?
                                <DeleteForeverRoundedIcon onClick={(event) => onRowDelete(renderedCellValue, event)} 
                                sx={{
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '24px',
                                    backgroundColor: 'error.dark',
                                    margin: '3px',
                                    borderRadius: '4px',
                                    padding: '1px'
                                }}
                                />
                                : null)}
                                
                                {/* {((is_br_needed !== undefined) && (is_br_needed == 'Yes')) && 
                                
                                    <Button color="primary" variant="contained" size="small" endIcon={<PrintIcon />} onClick={(event) => onRowBrPrint(renderedCellValue, event)}>
                                    BR
                                    </Button>

                                }  */}
                                
                                
                            </span>
                        );
                    }
                   
                }
                

                
            } else if (col.headerName.toLowerCase() === 'status') {

                columnProperties = {
                    ...columnProperties,
                    header: col.headerName,
                    Cell: ({renderedCellValue,row}) => {

                        return (
                            <div style={{textAlign: cellAlign}}>
                                <Status value={renderedCellValue} row={row}/>
                            </div>
                        );
                    }
                };

            } else if ( col.headerName.toLowerCase() === 'print'){
                columnProperties = {
                    ...columnProperties,
                   
                };

            } else {

                if (col.headerStyle) {
                    columnProperties = {
                        ...columnProperties,
                        Header: <span style={col.headerStyle}>{col.headerName}</span>
                    };
                }

                // columnProperties = {
                //     ...columnProperties,
                //     Cell: ({renderedCellValue}) => {
                //         const is_br_needed=data.filter(obj => ((obj.id === renderedCellValue)))[0].is_br_needed
                //         console.log('is_br_needed:', is_br_needed);
                //         console.log('renderedCellValue:', renderedCellValue);

                //         return (
                //             // <div style={{textAlign: cellAlign}}>
                //             //     {col.dataStyle ? <span style={col.dataStyle}>{renderedCellValue}</span> : renderedCellValue}
                //             // </div>
                //             <span>
                //                 {((is_br_needed !== undefined) && (is_br_needed == 'Yes')) && 
                                
                //                 <Button color="primary" variant="contained" size="small" endIcon={<PrintIcon />} onClick={(event) => onRowBrPrint(renderedCellValue, event)}>
                //                 BR
                //                 </Button>

                //             } 
                //             </span>
                        
                //         );
                //     }
                // };
            }

            return columnProperties;
        });

        setTableColumns(tableColumns);

    },[columns, onRowDelete, onRowEdit,onRowBrPrint]);

    return (
        <div style={{paddingTop: "10px", paddingBottom: "10px"}}>
            <h1 style={{fontSize: '22px', color: 'darkblue', fontWeight: 'bold', display:'none'}}>{title}</h1>
            <MaterialReactTable
                columns={tableColumns}
                data={data}
                enableColumnActions={false}
                enableColumnFilter={false}
                enablePagination={true}
                enableSorting={true}
                enableBottomToolbar={true}
                enableTopToolbar={true}
                muiTableBodyRowProps={{hover: true}}
                enableDensityToggle={false}
                state={{isLoading: isLoading}}
                muiTablePaperProps={{
                    elevation: 0,
                    sx: {
                      borderRadius: '0',
                      border: '1px solid #000000',
                    },
                  }}
                  muiTableBodyProps={{
                    sx: (theme) => ({
                      '& tr:nth-of-type(odd)': {
                        backgroundColor:'#bcbfc4',
                      },
                    }),
                  }}
                muiTableHeadCellProps={{
                    //simple styling with the `sx` prop, works just like a style prop in this example
                    sx: {
                      fontWeight: 'bold',
                      fontSize: '15px',
                      backgroundColor: '#6e8fec',
                      color:'white'
                    },
                  }}
                initialState={
                    {
                        density: "comfortable",
                        pagination: {pageIndex: 0, pageSize:5}
                    }
                }
                renderTopToolbarCustomActions={
                    ({table}) => {
                        if (enableExportToolbar) {
                            return (
                                <span>
                                    <Button color="primary" onClick={onCSVExport} startIcon={<FileDownloadRoundedIcon/>} variant="contained">CSV</Button>
                                    &nbsp;&nbsp;
                                    <Button color="primary" onClick={onPDFExport} startIcon={<FileDownloadRoundedIcon/>} variant="contained">PDF</Button>
                                    {/* &nbsp;&nbsp;
                                    <Button color="primary" onClick={onPrintExport} startIcon={<FileDownloadRoundedIcon/>} variant="contained">Print</Button> */}
                                </span>
                            );
                        } else {
                            return (<></>);
                        }
                    }
                }
            />
        </div>
    );
}

export default ReactTableWrapper;