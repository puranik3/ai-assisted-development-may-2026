import { useState } from 'react'

const CountComponent = () => {
    const [counter, setCounter] = useState(0)
  
    const handleClick = () => {
      setCounter(counter + 1)
    }

    return (
      <div>
        <p>You clicked {counter} times</p>
        <button onClick={handleClick}>Click me</button>
      </div>
    )
  }
  export default CountComponent
