import { useState } from "react";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ResetPassword from "./pages/Auth/ResetPassword";

import "./App.css"

function App() {
    const [page, setPage] = useState('login');
    const [ isAuthenticated, setIsAuthenticated ] = useState( false );

    const handleResetPassword = (data) => {
        console.log('Password reset:', data);
        // Password reset logic will go here
        // For now, just log the data
    };

    return (
        <div className="app-layout">
            <Header onNavigate={setPage} isAuthenticated={isAuthenticated} />



            {
                page === 'login' && <Login />
            }
            {
                page === 'register' && <Register />
            }
            {
                page === 'reset-password' && <ResetPassword onResetPassword={handleResetPassword} />
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
