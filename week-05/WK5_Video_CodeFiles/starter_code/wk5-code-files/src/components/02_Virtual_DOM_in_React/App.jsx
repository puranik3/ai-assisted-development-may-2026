import { useState } from "react";

function App() {
  const [count, setCount] = useState(1);
  function handleClick () {
    setCount(count + 1)
  }
  return (
    <>
      <h1>Counter</h1>
      <button onClick={handleClick}>{count}</button>
    </>
  )
}

export default App