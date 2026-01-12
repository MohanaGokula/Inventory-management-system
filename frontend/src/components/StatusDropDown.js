import React from "react";
function StatusDropDown({status, onChange}) {

    React.useEffect(() => {

        onChange({target: { name: 'status',value: 'true'}});
    },[]);

    return (
        <>
        <label htmlFor="status" className="form-group col-sm-4 text-right">Status </label>
            <select id="status" name="status" required onChange={onChange} value={status || ""} className="browser-default custom-select form-control col-sm-7 mandatory-form-control">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </select>
        </>
    )
}

export default StatusDropDown;