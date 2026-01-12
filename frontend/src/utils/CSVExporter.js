import { ExportToCsv } from 'export-to-csv';

export function exportAsCSV(columns, records) {
    console.log(JSON.stringify(columns)+"colexcel")
    console.log(JSON.stringify(records)+"recordsexcel")
    const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: false,
        headers: columns,
      };
    
    const csvExporter = new ExportToCsv(csvOptions);

    csvExporter.generateCsv(records);
}