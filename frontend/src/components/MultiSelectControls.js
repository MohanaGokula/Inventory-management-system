import { components } from "react-select";
export function HandleSelect(selected,value, setSelected, allOptions, withSelectAll){
    // console.log(JSON.stringify(selected)+"selected")
    // console.log(JSON.stringify(value)+"value")
    // console.log(JSON.stringify(setSelected)+"setSelected")
    // console.log(JSON.stringify(allOptions)+"allOptions")
    // console.log(JSON.stringify(withSelectAll)+"withSelectAll")
   
    // Determine the changed option (added or removed)
    const changedOption = selected.find((item) => !value.includes(item));
    // console.log("Changed option:", changedOption);
   
    // Check if "Select All" is selected
    const isSelectAll = selected.some((item) => item.value === "select-all");
   
    // If "Select All" is selected, set all options as selected
    if (changedOption !== undefined && changedOption.value === "select-all") {
        // const withoutSelectAll = selected.filter((item) => item.value !== "select-all");
        setSelected(withSelectAll);
    } 
    else {
        const areAllSelected = () => {
            return allOptions.every((option) =>
            selected ? selected.some((s) => s.value === option.value) : false
        );
        };
    
        if (areAllSelected()) {
            if (changedOption === undefined && !isSelectAll) {
                setSelected([]);
            } else {
                setSelected(withSelectAll);
            }
        } 
        else {
            // Remove "Select All" from the selected array
            const withoutSelectAll = selected.filter((item) => item.value !== "select-all");
            setSelected(withoutSelectAll);
        }
    }
};

// export function ValueContainer ({ children, ...props }){
// IMPORTANT NOTE: This code is working good but react-select won't close when clicking outside the react select dropdown
//     // Calculate the count of selected items using props
//     const selectedCount = props.getValue().length;
//     const withoutSelectAllLength = props.getValue().filter((item) => item.value !== 'select-all').length;
//     // Access the placeholder from selectProps
//     const placeholder = props.selectProps.placeholder;
//     return (
//       <components.ValueContainer {...props}>
//         {selectedCount === 0
//           ? placeholder
//           : selectedCount === props.options.length
//           ? `All selected (${withoutSelectAllLength})`
//           : `${selectedCount} selected`}
//       </components.ValueContainer>
//     );
// };

export function ValueContainer ({ children, ...props }){
    const length = children[0]?.length
    const optionsLength = props.options.length;
    let tmpChildren = [...children];
     // Access the placeholder from selectProps
    const placeholder = props.selectProps.placeholder;
    
    if(length === 0)
    {
        tmpChildren[0] = placeholder
    }
    if(length > 0){
        if (length === optionsLength){
            tmpChildren[0] = `All selected (${length-1}) `
        }
        else{
            tmpChildren[0] = `${length} selected`
        }
    }
    return (
      <components.ValueContainer {...props}>{tmpChildren}</components.ValueContainer>
    );
};

export function Option(props){
    return (
        <>
            <components.Option {...props}>
                <input
                type="checkbox"
                checked={props.isSelected}
                onChange={() => null}/>{" "}
            <label>{props.label}</label>
            </components.Option>
        </>
    );
};
