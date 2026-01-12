import jsPDF from 'jspdf';
import 'jspdf-autotable';
// import html2pdf from 'html2pdf.js';
// import html2canvas from 'html2canvas';

export function exportAsPDF(pageTitle, columns, records, fileName) {

    const pdfFormat = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });   
    pdfFormat.text(pageTitle,80,10);
    pdfFormat.setFontSize(4)
    console.log("data");
    pdfFormat.autoTable(
        {
        columns: columns,
        body: records, tableWidth: 'auto',
        });
    pdfFormat.save(fileName);
}
    // pdfFormat.autoTable({
    //     columns:columns
    //     .filter(col => col.header !== 'Action')
    //     .map(col=>({header: col.header, dataKey: (col.accessorKey || col.id)})),

    //     body: data.records
    //     .map(company => ({
    //         entity_name: company.entity_name, 
    //         alias: company.alias, 
    //         address_1: `${company.address_1},\n${company.address_2},\n${company.address_3}`}))
    // });


// Function to generate PDF from HTML file
// export function generatePDFFromHTML(htmlFilePath, outputFileName) {
//     // Create a new jsPDF instance
//     const pdf = new jsPDF();

//     // Read the content of the HTML file
//     fetch(htmlFilePath)
//         .then(response => response.text())
//         .then(htmlContent => {
//             // Generate PDF from HTML content
//             pdf.fromHTML(htmlContent, 15, 15);

//             // Save or display the PDF
//             pdf.save(outputFileName);
//         })
//         .catch(error => console.error('Error reading HTML file:', error));
// }
// export function generatePDFFromHTML(htmlFilePath, outputFileName) {
//     console.log(htmlFilePath, outputFileName+"htmlFilePath, outputFileName")
//     // Read the content of the HTML file
//     fetch(htmlFilePath)
//         .then(response => response.text())
//         .then(htmlContent => {
//             // Convert HTML to PDF
//             html2pdf(htmlContent, {
//                 margin: 15,
//                 filename: outputFileName,
//                 image: { type: 'jpeg', quality: 0.98 },
//                 html2canvas: { scale: 2 },
//                 jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//             });
//         })
//         .catch(error => console.error('Error reading HTML file:', error));
// }
// export function generatePDFFromHTML(htmlFilePath, outputFileName) {
//     // Create a container element
//     const container = document.createElement('div');

//     // Read the content of the HTML file
//     fetch(htmlFilePath)
//         .then(response => response.text())
//         .then(htmlContent => {
//             // Set the HTML content to the container
//             container.innerHTML = htmlContent;

//             // Use html2canvas to convert the container's content to an image
//             html2canvas(container).then(canvas => {
//                 // Create a new jsPDF instance
//                 const pdf = new jsPDF();

//                 // Add the image (canvas) to the PDF
//                 pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 15);

//                 // Save or display the PDF
//                 pdf.save(outputFileName);
//             });
//         })
//         .catch(error => console.error('Error reading HTML file:', error));
// }


    