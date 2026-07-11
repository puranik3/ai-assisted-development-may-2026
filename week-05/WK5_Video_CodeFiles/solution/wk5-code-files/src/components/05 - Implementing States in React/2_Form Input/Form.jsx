import { useState } from 'react';

function Form() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  return (
    <form>
      <label>
        Name:
        <input type="text" value={inputValue} onChange={handleInputChange} />
      </label>
      <p>Your name is: {inputValue}</p>
    </form>
  );
}

export default Form;