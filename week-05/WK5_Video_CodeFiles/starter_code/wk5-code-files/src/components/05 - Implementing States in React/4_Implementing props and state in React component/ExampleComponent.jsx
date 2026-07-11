import { useState } from 'react';

const ExampleComponent = (props) => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Prop value: {props.message}</p>
      <p>State value: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

export default ExampleComponent;
