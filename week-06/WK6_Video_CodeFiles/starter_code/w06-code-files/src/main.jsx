import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// import App from './1_MountingPhase_With_useEffect/App.jsx'
// import App from './2_UpdatingPhase_With_useEffect/App.jsx'
// import App from './3_UnMountingPhase_With_useEffect/App.jsx'

// import App from './4_External_StyleSheet_and_CSS_Modules/1_External_Stylesheets/App.jsx'
// import App from './4_External_StyleSheet_and_CSS_Modules/2_CSS_Modules/App.jsx'

// import App from './5_CSS_in_JS_and_CSS_Frameworks/1_CSS-in-JS/App.jsx'
// import App from './5_CSS_in_JS_and_CSS_Frameworks/2_CSS_Frameworks/App.jsx'

// import App from './6_Connecting_Bootstrap_to_ReactApp/1_Bootstrap_using_CDN/App.jsx'
// import App from './6_Connecting_Bootstrap_to_ReactApp/2_Bootstrap_using_npm/App.jsx'
// import App from './6_Connecting_Bootstrap_to_ReactApp/3_Bootstrap_React_library/App.jsx'

// import App from './7_RenderingList_in_ReactComponent_and_ReactKeys/App.jsx'

// import App from './8_Implementing_Keys/1_Example/App.jsx'
import App from './8_Implementing_Keys/2_Example/App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)
