function ProductsList() {
  const products = [
    { id: 'P01', name: 'Water Bottle', quantity: 10},
    { id: 'P02', name: 'Lunch Box' , quantity: 15 },
    { id: 'P03', name: 'School Bag' , quantity: 12 }
  ];
  return (
    <ul>
      {products.map((item) => {
        const label = item.quantity > 10 
          ? "Sufficient Qty" 
          : "Insufficient Qty";
        return (
          <li key={item.id}>
            {item.name} : {label} {item.quantity}
          </li>
        );
      })}
    </ul>
  );
}

export default ProductsList;