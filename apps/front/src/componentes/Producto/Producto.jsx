import React from 'react'
import './Producto.css'


const Producto = ({producto}) => {

    const { name, price, description, img} = producto;

    
  return (
    <div className ="item">
        <div className ="img-product">
            <img src={img} alt=""/>
        </div>
        <div className ="contenido">
            <div><h3 className ="title-product">{name}</h3></div>
            <hr/>
            <ul>
                {description.map((d, i) =>{
                    return <li key={i}>{d}</li>
                })}
            </ul>
            <div className ="price-button">
                <div className ="price"><h3>s/ {price}.00</h3></div>
                <button>COMPRAR AHORA</button>
            </div>
        </div>
    </div>
  )
}

export default Producto