import { useState } from "react";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";

import "./App.css"

function App() {
  const [ page, setPage ] = useState( 'login' );

  return (
    <div className="app-layout">
      {
        page === 'login' ? <Login /> : <Register />
      }

      {/* {
        page === 'login' && <Login />
      }
      {
        page === 'register' && <Register />
      } */}
      {/* <Register /> */}
      <Login />
    </div>
  );
}

export default App;
