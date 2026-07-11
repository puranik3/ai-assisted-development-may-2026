import { useState } from "react"

function App(){
  const [product, setProduct] = useState("")
  const addProduct =(product) => {
    console.log(product)
  }
  return (
    <>
      <input 
        value={product} 
        onChange={(event) => setProduct(event.target.value)} 
      />
      <button onClick={() => addProduct(product)}>
        Add Product
      </button>    
    </>
  )
}

export default App
