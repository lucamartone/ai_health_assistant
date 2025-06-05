import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'  
// import './index.css'
import './tailwind.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/*NECESSARIO per usare useNavigate */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
)