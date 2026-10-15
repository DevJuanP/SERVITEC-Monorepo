import './App.css'
import Header from './componentes/header/header.jsx'
import Footer from './componentes/footer/Footer.jsx'
import { Outlet } from 'react-router-dom'
import Servi from './componentes/bot/chatBot.jsx'
import { useLocation } from 'react-router-dom'

function App() {

  const path = useLocation().pathname
  console.log("path: ", path);
  
  return (
    <>
      <Header />
        {path === '/' && <div className="banner">
        <img src="https://raw.githubusercontent.com/DevJuanP/proyecto_CIBERTEC/refs/heads/main/img/bigBANNER.png" alt="Banner principal" />
      </div>}
      <main>
        <Outlet/>
      </main>
         <Servi />
      <Footer />
    
    </>
  )
}

export default App
