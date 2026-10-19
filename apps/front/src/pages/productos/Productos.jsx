import React, { Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { getProducts, getByCategory, getTitleCategory } from '../../servicios/productos';
import { useEffect, useState } from 'react';
import Producto from '../../componentes/Producto/Producto.jsx';
import { toast } from 'react-toastify';

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const { categoria } = useParams();

  useEffect(() => {
    setCargando(true)
    setError(null)
    getProducts(categoria)
      .then(data => {
        console.log("productos recibidos:", data)
        setProductos(data)
      })
      .catch(err => {
        console.error("Error cargando productos:", err)
        setError("No se pudieron cargar los productos")
        toast.error("Error al cargar el catálogo")
      })
      .finally(() => {
        setCargando(false)
      })
  }, [categoria])

  if (cargando) return <div className="productos-loading">Cargando catálogo...</div>
  if (error) return <div className="productos-error">{error}</div>

  return (
    <>
      <h1>{getTitleCategory(categoria)}</h1>
      { productos.length === 0
      ? <h2>No hay productos en esta categoría</h2> 
      : productos.map((p, i) => (
        <Fragment key={p.id || i}>
          <Producto producto={p}/>
          {i != productos.length-1 && <hr/>}
        </Fragment>
      ))}
    </>
  )
}

export default Productos