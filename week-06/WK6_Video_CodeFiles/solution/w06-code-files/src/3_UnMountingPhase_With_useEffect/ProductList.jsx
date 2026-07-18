import { useEffect, useState } from "react";

function ProductList() {
    const [allProducts, setAllProducts] = useState([]);

    const [category, setCategory] = useState("all");
    const [filteredProducts, setFilteredProducts] = useState([]);

    // 🔹 Mounting Phase
    // Runs once when the component is mounted
    useEffect(() => {
        console.log("Component mounted");

        fetch("https://fakestoreapi.com/products")
            .then((response) => response.json())
            .then((data) => {
                setAllProducts(data);
                setFilteredProducts(data);
            });
    }, []);

    // 🔹 Updating
    // Runs when category changes
    useEffect(() => {
        if (filteredProducts.length === 0) return;

        console.log("Updating phase: category changed →", category);

        if (category === "all") {
            setFilteredProducts(allProducts);
        } else {
            const filtered = allProducts.filter(
                (product) => product.category === category
            );
            setFilteredProducts(filtered);
        }
    }, [category]);


    // Unmounting Phase: Cleanup
    useEffect(() => {

        return () => {
            console.log("ProductList is unmounting");
            alert("ProductList component is being unmounted!");
        };
    }, []);


    if (filteredProducts.length === 0) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className="product-list">
            <h1>Product List</h1>
            <hr />

            <h2>Select Category:</h2>
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
                <option value="jewelery">Jewelery</option>
            </select>

            <ul>
                {filteredProducts.map((product) => (
                    <li key={product.id}>{product.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default ProductList;
