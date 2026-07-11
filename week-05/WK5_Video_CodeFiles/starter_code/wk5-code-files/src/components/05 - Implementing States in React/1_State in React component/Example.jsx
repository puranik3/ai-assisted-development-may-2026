import { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  function handleClick() {
    const newCount = count + 1
    setCount(newCount)
  }

  return (
    <div>
      <p>Hi, You clicked this button {count} times</p>
      <button onClick={handleClick}>
        Click me
      </button>
    </div>
  );
}
export default Example;