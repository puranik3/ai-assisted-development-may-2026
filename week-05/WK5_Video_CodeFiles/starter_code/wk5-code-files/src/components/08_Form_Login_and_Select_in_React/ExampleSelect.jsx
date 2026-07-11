import { useState } from 'react';

// Select Input Example
const SelectInput = () => {
    const [selectValue, setSelectValue] = useState("Lime");
  
    const selecthandler = (event) => {
      setSelectValue(event.target.value);
      console.log(event.target.value);
    };
    return (
      <div>
        Semester Selection
        <select value={selectValue} onChange={selecthandler}>
          <option value="first">First</option>
          <option value="second">Second</option>
          <option value="third">Third</option>
          <option value="fourth">Fourth</option>
        </select>
      </div>
    );
  };
  
export default SelectInput;  