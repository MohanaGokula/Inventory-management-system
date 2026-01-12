import SummaryIcon from "./SummaryIcon";
function ViewOnlyTextbox({name, value, showSummaryDetails, labelClassName, label, inputClassName}) {


    return (
        <>
        {label ? <label htmlFor={name} className={labelClassName}>{label}</label> : null}
         <input type="text" 
            id={name}
            name={name} 
            readOnly={true} 
            value={value}  
            style={{ cursor: "not-allowed"}}  
           className={inputClassName}/>
           {showSummaryDetails ? <SummaryIcon onClickHandler={showSummaryDetails}/> : null }
        </>
    );
}

export default ViewOnlyTextbox;