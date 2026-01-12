export function getCurrentDate() {

    let d = new Date();
    return d.getFullYear()
    +'-'
    +("0"+(d.getMonth()+1)).slice(-2)
    +'-'
    +("0"+d.getDate()).slice(-2)
}

export function getCurrentTime() {
    let d = new Date();
    // return d.getHours() + ':' + ("0"+(d.getMinutes())).slice(-2);
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}

//Method to convert date format
export function getDisplayDate(dateString) {

    let dateParts = dateString.split("-");

    return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
}
