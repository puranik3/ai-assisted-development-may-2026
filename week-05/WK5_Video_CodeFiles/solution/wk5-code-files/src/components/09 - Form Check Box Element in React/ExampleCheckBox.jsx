import { useState } from "react";

// CheckBoxes Example
function CheckInputs() {
    const [isCheckedAI, setIsCheckedAI] = useState(false);
  
    const changeHandlerAI = () => {
      setIsCheckedAI(!isCheckedAI);
    };
  
    const [isCheckedML, setIsCheckedML] = useState(false);
  
    const changeHandlerML = () => {
      setIsCheckedML(!isCheckedML);
    };
    return (
        <div>
          Select Courses:
          <div>
            <input
              type="checkbox"
              name="AI"
              value="Artificial Intelligence"
              checked={isCheckedAI}
              onChange={changeHandlerAI}
            />
            Artificial Intelligence
          </div>
          <div>
        <input
          type="checkbox"
          name="ML"
          value="Machine Learning"
          checked={isCheckedML}
          onChange={changeHandlerML}
        />
        Machine Learning
      </div>
    </div>
  );
}

export default CheckInputs;
      