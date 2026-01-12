import React, { useState, useEffect } from 'react';
import MaterialReactTable from 'material-react-table';
import { MRT_Cell, MRT_ColumnDef} from 'material-react-table';
import TableRowsGRN from '../forms/store/TableRowsGRN';

function ReactTableEditWrapper({
    title,
    columns,
    data,
    onClose,
    onRowSubmit,
    isLoading = false,
    handleChangeTableDetails, // Define or pass down these functions
    handleChangeWeightDetails,
    handleChangeTableProduct,
    handleChangePurchaseOrderDetails,
    products,
    rowsData,
}) {
    const [tableColumns, setTableColumns] = useState([]);
    // const [tableData, setTableData] = useState([]);
    // const [rowsData, setRowsData] = useState([]); 

    // const handleChangeWeightDetails = (index,evnt) => {
       
    //     const { name, value } = evnt.target || {};
    //     const rowsInput = [...rowsData];
    //     rowsInput[index][name] = value;
        
    //     const updatedTableData = [...tableData];
    //     updatedTableData[index] = value;
    //     if (name === 'gross_weight' || name === 'tare_weight') {
    //         const grossWeight = parseInt(value);
    //         const tareWeight = parseInt(updatedTableData[index]['tare_weight']);
    //         const netWeight = grossWeight - tareWeight;
      
    //         updatedTableData[index]['net_weight'] = netWeight;
      
    //         let totalNetWeight = 0;
    //         for (let i = 0; i < updatedTableData.length; i++) {
    //           totalNetWeight += parseInt(updatedTableData[i]['net_weight']);
    //         }
      
    //         // Assuming you have a state for totalNetWeight, update it here
    //         // setTotalNetWeight(totalNetWeight);
    //       }
      
    //       setTableData(updatedTableData);
    //     };
    

    useEffect(() => {
        const tableColumns = columns.map(col => {
            let columnProperties = {
                accessorKey: col.fieldName,
                header: col.headerName,
            };

            if (col.headerName === 'ROW_ACTIONS') {
                columnProperties = {
                    ...columnProperties,
                    header: 'Action',
                    Header: <span style={col.headerStyle}>Action</span>,
                    Cell: ({ renderedCellValue, row }) => {
                        const customerStatus = row.original.customer_status;
                        return (
                            <span>
                                
                            </span>
                        );
                    }
                };
            } else {
                columnProperties = {
                    ...columnProperties,
                    Cell: ({ renderedCellValue, row }) => {
                        
                        if (col.accessorKey === 'product_id') {
                            
                            const productName = row.original.product.name;
                            return <div>{productName}</div>;
                        } else {
                            return <div>{renderedCellValue}</div>;
                        }
                    }
                };
            }

            return columnProperties;
        });

        setTableColumns(tableColumns);
    }, [columns]);
    const [rowSelection, setRowSelection] = useState([]);
    useEffect(() => {
        
        console.info({ rowSelection });
      }, [rowSelection]);
    return (
        <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <h1 style={{ fontSize: '22px', color: 'darkblue', fontWeight: 'bold', display: 'none' }}>{title}</h1>
            <MaterialReactTable
                columns={tableColumns}
                data={data}
                enableEditing={true}
                enableColumnActions={false}
                enableColumnFilter={false}
                enablePagination={true}
                enableSorting={true}
                enableBottomToolbar={true}
                enableTopToolbar={true}
                muiTableBodyRowProps={{ hover: true }}
                enableDensityToggle={true}
                //state={{ isLoading: isLoading }}
                enableRowSelection = {true}
                getRowId={(row) => row.userId} 
                onRowSelectionChange={setRowSelection} 
                state={{ rowSelection }}
                editingMode="table"
                // muiTableBodyCellEditTextFieldProps={({ cell }) => ({
                //     onBlur: (event) => {
                //       handleChangeWeightDetails(cell.row.index, cell.column.id, event.target.value);
                //     },
                //     variant: 'outlined',
                //   })}
            />
            <TableRowsGRN  rowsData={rowsData} handleChangeTableDetails={handleChangeTableDetails} handleChangeWeightDetails={handleChangeWeightDetails} handleChangeTableProduct={handleChangeTableProduct}handleChangePurchaseOrderDetails={handleChangePurchaseOrderDetails} products={products} />
                                        
            
        </div>
    );
}

export default ReactTableEditWrapper;


// import React, { useState, useEffect } from 'react';
// import MaterialReactTable from 'material-react-table';
// //import TableRowsGRN from '../forms/store/TableRowsGRN';

// function ReactTableEditWrapper({
//     title,
//     columns,
//     data,
//     onClose,
//     onRowSubmit,
//     isLoading = false,
//     // handleChangeTableDetails,
//     // //handleChangeWeightDetails,
//     // handleChangeTableProduct,
//     // handleChangePurchaseOrderDetails,
//     // products,
//     //rowsData,
// }) {
//     const [tableColumns, setTableColumns] = useState([]);
//     const [rowSelection, setRowSelection] = useState([]);
//     const [rowsData,setRowsData]=useState([]);
//     // const [rowsInput,setInputs]=useState([]);
//     // const [inputValue, setInputValue] = useState('');
//     useEffect(() => {
//         const tableColumns = columns.map(col => {
//             let columnProperties = {
//                 accessorKey: col.fieldName,
//                 header: col.headerName,
//             };

//             if (col.headerName === 'ROW_ACTIONS') {
//                 columnProperties = {
//                     ...columnProperties,
//                     header: 'Action',
//                     Header: <span style={col.headerStyle}>Action</span>,
//                     Cell: ({ renderedCellValue, row }) => {
//                         const customerStatus = row.original.customer_status;
//                         return (
//                             <span>
//                             </span>
//                         );
//                     }
//                 };
//             } else {
//                 columnProperties = {
//                     ...columnProperties,
//                     Cell: ({ renderedCellValue, row }) => {
//                         if (col.accessorKey === 'product_id') {
//                             const productName = row.original.product.name;
//                             return <div>{productName}</div>;
//                         } else {
//                             return <div>{renderedCellValue}</div>;
//                         }
//                     }
//                 };
//             }

//             return columnProperties;
//         });

//         setTableColumns(tableColumns);
//     }, [columns]);

//     useEffect(() => {
//         console.info({ rowSelection });
//     }, [rowSelection]);

//     // Function to handle weight change and calculate net weight
//     // const handleChangeWeightDetails = (index, evnt) => {
//     //     const { name, value } = evnt.target;
//     //     const rowsInput = [...rowsData];
//     //     rowsInput[index][name] = value;
    
//     //     if (name === 'gross_weight' || name === 'tare_weight') {
//     //         const grossWeight = parseInt(rowsInput[index]['gross_weight']) ;
//     //         const tareWeight = parseInt(rowsInput[index]['tare_weight']) ;
//     //         const netWeight = grossWeight - tareWeight;
    
//     //         rowsInput[index]['net_weight'] = netWeight;
    
//     //         let totalNetWeight = 0;
//     //         for (let i = 0; i < rowsData.length; i++) {
//     //             totalNetWeight += parseInt(rowsInput[i]['net_weight']) ;
//     //         }
    
//     //         setInputs(values => ({
//     //             ...values,
//     //             ['total_net_weight']: totalNetWeight
//     //         }));
//     //     }
    
//     //     setRowsData(rowsInput);
//     // Function to handle weight change and calculate net weight
// // Function to handle weight change and calculate net weight
// const handleChangeWeightDetails = (index, evnt) => {
//     // Check if evnt or evnt.target is undefined
//     if (!evnt || !evnt.target) {
//         // Handle the case where evnt or evnt.target is undefined
//         console.error("Event or event target is undefined");
//         return;
//     }

//     // Destructure the properties only if evnt.target is defined
//     const { name, value } = evnt.target;
    
//     // Proceed with the rest of the function logic
//     const rowsInput = [...rowsData];
//     rowsInput[index][name] = value;
    
//     if (name === 'gross_weight' || name === 'tare_weight') {
//         const grossWeight = parseFloat(rowsInput[index]['gross_weight']) ; // Use parseFloat for decimal values
//         const tareWeight = parseFloat(rowsInput[index]['tare_weight']) ; // Use parseFloat for decimal values
//         const netWeight = grossWeight - tareWeight;

//         rowsInput[index]['net_weight'] = netWeight;

//         let totalNetWeight = 0;
//         for (let i = 0; i < rowsInput.length; i++) { // Iterate over rowsInput instead of rowsData
//             totalNetWeight += parseFloat(rowsInput[i]['net_weight']) || 0; // Use parseFloat for decimal values
//         }

//         setInputs(values => ({
//             ...values,
//             ['total_net_weight']: totalNetWeight
//         }));
//     }

//     setRowsData(rowsInput);
// }

    
//     return (
//         <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
//             <h1 style={{ fontSize: '22px', color: 'darkblue', fontWeight: 'bold', display: 'none' }}>{title}</h1>
//             <MaterialReactTable
//                 columns={tableColumns}
//                 data={data}
//                 enableEditing={true}
//                 enableColumnActions={false}
//                 enableColumnFilter={false}
//                 enablePagination={true}
//                 enableSorting={true}
//                 enableBottomToolbar={true}
//                 enableTopToolbar={true}
//                 muiTableBodyRowProps={{ hover: true }}
//                 enableDensityToggle={true}
//                 enableRowSelection = {true}
//                 getRowId={(row) => row.userId} 
//                 onRowSelectionChange={setRowSelection} 
//                 state={{ rowSelection }}
//                 editingMode="table"
//                 muiTableBodyCellEditTextFieldProps={({ cell }) => ({
//                     //onBlur is more efficient, but could use onChange instead
//                     onBlur: (event) => {
//                         //setInputValue(cell, event.target.value);
//                       handleChangeWeightDetails(cell, event.target.value);
//                     },
//                     variant: 'outlined',
//                   })}
//             />
//             {/* <TableRowsGRN  
//                 rowsData={rowsData} 
//                 handleChangeTableDetails={handleChangeTableDetails} 
//                 handleChangeWeightDetails={handleChangeWeightDetails} // Pass the modified function
//                 handleChangeTableProduct={handleChangeTableProduct}
//                 handleChangePurchaseOrderDetails={handleChangePurchaseOrderDetails} 
//                 products={products} 
//             /> */}
//         </div>
//     );
// }

// export default ReactTableEditWrapper;
