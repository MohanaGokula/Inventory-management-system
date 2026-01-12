import MaterialReactTable from 'material-react-table'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { useState, useEffect } from "react";
import {Button, Box} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ReactTablePopUpSubmitWrapper({
    title,
    columns,
    data,
    onClose,
    onRowSubmit,
    onCSVExport,
    onPDFExport,
    
    enableExportToolbar = false,
    isLoading = true,
}) {

    const [tableColumns, setTableColumns] = useState([]);

    useEffect(() => {
        console.log('Useeffect rendered');
        const tableColumns = columns.map(col => {

            let cellAlign = col.align || 'left';
            let columnProperties = {
                accessorKey: col.fieldName,
                header: col.headerName,
                size:col.size
            };

            if (col.headerName === 'ROW_ACTIONS') {
                columnProperties = {
                    ...columnProperties,
                    header: 'Action',
                    Header: <span style={col.headerStyle}>Action</span>,
                    Cell: ({renderedCellValue,row}) => {
                        // const customerStatus = row.original.customer_status;
                        return (
                            <span>
                                {/* {(
                                  <Button color="primary" onClick={(event) => onRowSubmit(renderedCellValue, event)}>
                                  SUBMIT
                                  </Button>
                                )} */}
                                {(
                                    <CheckCircleIcon  onClick={(event) => onRowSubmit(renderedCellValue, event)} 
                                    sx={{
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontSize: '24px',
                                        backgroundColor: 'primary.dark',
                                        margin: '3px',
                                        borderRadius: '15px',
                                        padding: '1px'
                                    }}
                                    />
                                )}
                            </span>
                        );
                    }
                }
                
            } 
            else {

                if (col.headerStyle) {
                    columnProperties = {
                        ...columnProperties,
                        Header: <span style={col.headerStyle}>{col.headerName}</span>
                    };
                }

                columnProperties = {
                    ...columnProperties,
                    Cell: ({renderedCellValue}) => {

                        return (
                            <div style={{textAlign: cellAlign}}>
                                {col.dataStyle ? <span style={col.dataStyle}>{renderedCellValue}</span> : renderedCellValue}
                            </div>
                        
                        );
                    }
                };
            }

            return columnProperties;
        });

        setTableColumns(tableColumns);

    },[columns, onRowSubmit]);

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
                        density: "compact",
                        pagination: {pageIndex: 0, pageSize:5}
                    }
                }
                renderTopToolbarCustomActions={
                    ({table}) => {
                        if (enableExportToolbar) {
                            return (
                                <span>
                                    <Button color="primary" onClick={onClose}  variant="contained">CLOSE</Button>
                                    <Button color="primary" onClick={onCSVExport} startIcon={<FileDownloadRoundedIcon/>} variant="contained">CSV</Button>
                                    &nbsp;&nbsp;
                                    <Button color="primary" onClick={onPDFExport} startIcon={<FileDownloadRoundedIcon/>} variant="contained">PDF</Button>
                                </span>
                            );
                        } else {
                            return (<> <Button color="primary" onClick={onClose}  variant="contained">CLOSE</Button></>);
                        }
                    }
                }
            />
        </div>
    );
}

export default ReactTablePopUpSubmitWrapper;