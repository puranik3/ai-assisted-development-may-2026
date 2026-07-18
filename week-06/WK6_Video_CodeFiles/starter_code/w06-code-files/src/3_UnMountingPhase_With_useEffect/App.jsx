import { useState } from "react";
import ProductList from "./ProductList";

function App() {
    const [showProductList, setShowProductList] = useState(true);

    return (
        <div className="app">
            <h1>Products</h1>

            <button className="btn btn-primary" onClick={() => setShowProductList(!showProductList)}>
                {showProductList ? "Hide Product List" : "Show Product List"}
            </button>

            <hr />

            {showProductList && <ProductList />}
        </div>
    );
}

export default App;
