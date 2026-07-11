import { useState } from "react"

const App = () => {
  const [showHide, setShowHide] = useState(true);

  const toggleHandler = () => {
    setShowHide(!showHide);
  }

  return (
    <div>
      <button onClick={toggleHandler}>Show/Hide</button>

      {showHide && <h1>SHOW/HIDE Text</h1>}
    </div>
  )
}

export default App;
