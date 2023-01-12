import React, { useState, useEffect } from "react";

function Toggle({isToggled, setIsToggled}){

    
    const onToggle = () => setIsToggled(!isToggled);


    return (
        <label className="toggle-switch">
            <input type="checkbox" checked={isToggled} onChange={onToggle} />
            <span className="switch" />
        </label>
    );
}

export default Toggle;