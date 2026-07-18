import { useEffect, useState } from "react";

function ProductList() {
    const [allProducts, setAllProducts] = useState([]);

    // Mounting Phase: Fetch data once
    useEffect(() => {
        console.log("componentMounted");

        fetch("https://fakestoreapi.com/products")
            .then((response) => response.json())
            .then((data) => {
                setAllProducts(data);
            });
    }, []);

    if (allProducts.length === 0) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className="product-list">
            <h1>Product List</h1>
            <hr />

            <ul>
                {allProducts.map((product) => (
                    <li key={product.id}>{product.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default ProductList;
