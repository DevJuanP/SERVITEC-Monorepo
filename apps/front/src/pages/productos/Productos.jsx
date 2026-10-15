import React, { Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { getProducts, getByCategory, getTitleCategory } from '../../servicios/productos';
import { useEffect, useState } from 'react';
import Producto from '../../componentes/Producto/Producto.jsx';


const Productos = () => {

  const [productos, setProductos] = useState([])
  const { categoria } = useParams();
  console.log("param: ",categoria);
  
  useEffect(() => {
      console.log("montando componente...");
    getProducts().then(data => {
      console.log("productos: ",data);
      let p = getByCategory(categoria, data)
      console.log("productos filtrados: ",p)
      setProductos(p);
    })
    return () => {
      console.log("desmontando componente...");
      setProductos([])
    }
  }, [categoria])

  return (
    <>
      <h1>{getTitleCategory(categoria)}</h1>
      { productos.length === 0
      ? <h2>No products found</h2> 
      : productos.map((p, i) => (
        <Fragment key={i}>
          <Producto  producto={p}/>
          {i != productos.length-1 && <hr/>}
        </Fragment>
      ))}
    </>

  )
}

export default Productos