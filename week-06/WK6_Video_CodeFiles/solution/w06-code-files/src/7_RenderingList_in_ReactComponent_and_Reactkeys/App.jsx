function App() {
    const names = ["Amy", "Mary", "Janet"];
    const headings = names.map((name)=> {
        return <h1>{name}</h1>
    })
    return <>{headings}</>
}

export default App;