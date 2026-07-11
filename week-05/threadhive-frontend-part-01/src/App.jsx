import { useState } from "react";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import "./App.css"

function App() {
    const [page, setPage] = useState('login');

    return (
        <div className="app-layout">
            <Header onNavigate={setPage} />

            {
                page === 'login' ? <Login /> : <Register />
            }

            {/* {
                page === 'login' && <Login />
            */}
            {/*
                page === 'register' && <Register />
            } */}

            {/* <Register /> */}

            <Footer />
        </div>
    );
}

export default App;
