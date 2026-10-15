# SERVITEC Front - Documento de presentación

## 1. ¿Qué es este proyecto?

SERVITEC Front es la parte visual y de interacción de una plataforma comercial enfocada en la venta de productos tecnológicos, asesoría y atención al cliente. El objetivo no es solo mostrar información, sino ofrecer una experiencia parecida a la de un sistema real de empresa: navegación clara, acceso a servicios, autenticación de usuarios y una estructura preparada para conectar con un backend.

Este proyecto está pensado para un contexto de **experiencias formativas en situaciones reales de trabajo**, por lo que prioriza elementos que se usan en entornos profesionales:

- inicio de sesión y registro de usuarios;
- manejo de sesión con token;
- navegación entre módulos del sistema;
- asistencia automatizada mediante chatbot;
- separación por componentes reutilizables;
- conexión con una API real usando Axios.

---

## 2. Valor del proyecto

Más allá de ser una página web, el proyecto representa una solución digital que mejora la relación entre empresa y cliente. Su valor principal está en que organiza servicios, productos y atención en un solo lugar, y permite que el usuario tenga una experiencia más rápida y ordenada.

### ¿Qué aporta a nivel profesional?

- **Orden y escalabilidad:** el sistema está dividido por módulos, lo que facilita crecer sin desordenar el código.
- **Seguridad básica realista:** el acceso de usuario usa token de autenticación, como ocurre en muchas aplicaciones reales.
- **Mejor atención al cliente:** el chatbot resuelve dudas simples sin depender de una persona en todo momento.
- **Mejor experiencia de usuario:** al iniciar sesión, el sistema reconoce al usuario y muestra su nombre en pantalla.
- **Conexión con servicios reales:** el frontend no es estático; consume una API que registra e inicia sesión de usuarios.

---

## 3. Estructura general del sistema

El proyecto sigue una arquitectura simple pero profesional:

```text
Usuario -> Interfaz React -> Petición HTTP -> Backend -> Respuesta -> Interfaz actualizada
```

Esto significa que el frontend no trabaja solo. Su función es mostrar información, capturar datos del usuario y comunicarse con el servidor para registrar o autenticar personas.

### Módulos principales

- **Home:** página de inicio y presentación general.
- **Login y Register:** acceso y creación de usuarios.
- **Header y Footer:** navegación y elementos comunes en toda la aplicación.
- **Productos y Servicios:** secciones de catálogo y atención.
- **Chatbot:** asistente básico para resolver dudas.
- **Citas, pago, locales y negocio:** módulos informativos y funcionales.

---

## 4. Tecnologías usadas y por qué son útiles

### React

React permite construir la interfaz por componentes. Eso ayuda a mantener el código ordenado y reutilizable.

### React Router

Se usa para mover al usuario entre pantallas sin recargar toda la página. Esto da una experiencia más fluida, parecida a una aplicación real.

### Axios

Axios se usa para conectarse con el backend. Su valor está en que simplifica el envío de formularios y la lectura de respuestas del servidor.

Ejemplo breve:

```js
const result = await axios.post("http://localhost:3000/api/auth/login", {
  correo: corr,
  password: pass,
});
```

Esto demuestra que el formulario no se queda en la pantalla: realmente envía datos al servidor para validar al usuario.

### Token de autenticación

Cuando el login es correcto, el backend devuelve un token. Ese token representa la sesión del usuario y permite reconocerlo en el sistema.

### localStorage

Se usa para guardar el token y el nombre del usuario en el navegador. Eso permite conservar la sesión aunque el usuario cambie de pantalla.

---

## 5. Flujo de autenticación

El login está pensado para funcionar como en un sistema real:

1. El usuario escribe correo y contraseña.
2. El frontend envía esos datos al backend.
3. El backend responde con un token y los datos básicos del usuario.
4. El frontend guarda esa información en el navegador.
5. El sistema redirige al inicio y muestra el nombre de la persona autenticada.

### Ejemplo de login

```js
if (responseApi.token) {
  localStorage.setItem("token", responseApi.token);
}

if (responseApi.usuario?.nombre) {
  localStorage.setItem("nombreUsuario", responseApi.usuario.nombre);
}

navigate("/");
```

### ¿Qué valor aporta?

Este bloque no solo autentica. También mejora la experiencia del usuario porque:

- confirma que el acceso fue correcto;
- guarda la sesión;
- personaliza la interfaz con el nombre del usuario;
- manda al usuario al inicio sin pasos extra.

---

## 6. Registro de usuarios

El registro permite crear nuevas cuentas de cliente desde el frontend y enviarlas al backend.

### Ejemplo breve

```js
const result = await axios.post("http://localhost:3000/api/auth/register", {
  nombre: nom,
  correo: corr,
  password: pass,
  rol: "cliente",
});
```

### ¿Qué demuestra esto?

Este registro muestra una práctica muy usada en proyectos reales:

- captura datos de usuario;
- los manda al servidor;
- confirma si el registro fue exitoso;
- redirige al login para continuar el proceso.

Esto mejora el control de acceso y evita que se creen usuarios fuera del flujo definido por la empresa.

---

## 7. Personalización de la interfaz según sesión

Una vez iniciada la sesión, el header cambia su comportamiento. En lugar de mostrar “Iniciar sesión”, muestra el nombre de la persona autenticada.

### Ejemplo breve

```js
const token = localStorage.getItem('token')
const nombreUsuario = localStorage.getItem('nombreUsuario')
```

### ¿Qué aporta?

Esto hace que el usuario sienta que la aplicación lo reconoce. En una empresa real, este detalle es importante porque transmite confianza, orden y profesionalismo.

---

## 8. Cerrar sesión

El sistema también incorpora una opción de cerrar sesión.

### Ejemplo breve

```js
localStorage.removeItem('token')
localStorage.removeItem('nombreUsuario')
navigate('/login')
```

### ¿Qué aporta?

- protege la sesión del usuario;
- evita que alguien más use el navegador con la cuenta abierta;
- devuelve al flujo normal de acceso;
- se comporta como una aplicación empresarial real.

---

## 9. Chatbot de apoyo

El proyecto incluye un chatbot que orienta al usuario cuando tiene dudas básicas.

### Valor que aporta

- reduce la carga de atención manual;
- responde preguntas frecuentes;
- guía al usuario en decisiones simples;
- mejora la percepción de servicio inmediato.

### Ejemplo de uso

El bot responde a frases simples como “hola”, “asesoría” o “contacto directo”. Eso lo hace útil como primer nivel de atención, aunque no reemplaza al personal humano.

---

## 10. Seguridad y buenas prácticas aplicadas

Este proyecto no busca solo verse bien, sino seguir hábitos cercanos a los de sistemas reales:

- autenticación con token JWT;
- separación entre frontend y backend;
- uso de rutas protegidas en el servidor;
- no guardar contraseñas en el navegador;
- redirección según el estado de sesión;
- reutilización de componentes para evitar duplicar lógica.

### Importancia para la presentación

En una empresa, esto se traduce en orden, trazabilidad y control sobre quién entra al sistema y qué puede hacer.

---

## 11. Qué problemas resuelve este proyecto

Este sistema ayuda a resolver necesidades comunes de una empresa comercial:

- centraliza productos y servicios en un solo lugar;
- simplifica el acceso de clientes;
- permite iniciar sesión y registrar usuarios;
- da soporte básico mediante chatbot;
- mejora la comunicación con el negocio.

---

## 12. Cómo explicarlo en una exposición

Si lo vas a presentar en clase, puedes explicarlo así:

> “SERVITEC Front es una interfaz web pensada para una empresa real. Permite que un cliente se registre, inicie sesión, vea información de productos y servicios, y reciba apoyo básico mediante un chatbot. Además, usa token de autenticación para manejar sesiones, lo cual refleja una práctica común en sistemas profesionales.”

Ese enfoque funciona bien porque no solo describes lo técnico, sino también el valor que el sistema aporta a una organización.

---

## 13. Conclusión

Este proyecto muestra una solución frontend orientada a un entorno laboral real. Su aporte no está únicamente en “mostrar pantallas”, sino en organizar un flujo de usuario completo: acceso, navegación, sesión, atención y salida segura.

En resumen, SERVITEC Front demuestra:

- orientación al usuario;
- uso de autenticación real;
- estructura mantenible;
- integración con backend;
- criterio profesional en la experiencia de uso.
