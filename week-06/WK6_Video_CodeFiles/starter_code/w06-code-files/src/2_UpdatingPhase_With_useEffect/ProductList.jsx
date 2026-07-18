import { useEffect, useState } from "react";

function ProductList() {
    const [allProducts, setAllProducts] = useState([]);


    // 🔹 Mounting Phase
    // Runs once when the component is mounted
    useEffect(() => {
        console.log("Component mounted");

        fetch("https://fakestoreapi.com/products")
            .then((response) => response.json())
            .then((data) => {
                setAllProducts(data);
                // Your code here
            });
    }, []);

    // Your code here


    if (filteredProducts.length === 0) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className="product-list">
            <h1>Product List</h1>
            <hr />

            {/* Your code here */}

            <ul>
                {allProducts.map((product) => (
                    <li key={product.id}>{product.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default ProductList;
