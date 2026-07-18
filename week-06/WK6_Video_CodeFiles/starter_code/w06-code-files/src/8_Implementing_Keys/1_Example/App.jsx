function App() {
    const names = ["Amy", "Mary", "Janet", "Amy"];
    const headings = names.map((name, index)=> {
        return <h1 key={index}>{name}</h1>
    })
    return <>{headings}</>
}

// function App() {
//     const names = [
//         { id:1, first: "Amy" }, 
//         {id:2, first: "Mary"}, 
//         {id:3, first: "Janet"}, 
//         {id:4, first: "Amy"}
//     ];
//     const headings = names.map((name)=> {
//         return <h1 key={name.id}>{name.first}</h1>
//     })
//     return <>{headings}</>
// }

export default App;