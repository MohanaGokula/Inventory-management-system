export function getHTMLForSummaryPopup(title, fieldList){
    let fieldRowsHtml = '';

    fieldList.forEach(field => {

        fieldRowsHtml = fieldRowsHtml 
        + `<tr>`
        + `<td align='right' style='font-size:14px;font-weight:bold;padding-right:3px;${(field.is_calculated ? 'color:#0000ff' : '')}' width='50%'>${(field.label ? field.label + ':' : '&nbsp;')}</td>`
        + `<td align='left' style='font-size:14px;padding-left:2px;${(field.is_calculated ? 'color:#0000ff;font-weight:bold;' : '')}'>${(field.value ? field.value : '&nbsp;')}</td></tr>`;
    })
    return `<div style='border:1px solid black'>
    <table align='center' width='100%'><tr><td colspan="2"style="background-color: #0d6efd">
    <h6 style="color:white;">${title}</h6></td></tr>
    ${fieldRowsHtml}
    </table></div>`;
}