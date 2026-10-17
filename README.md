# BRISA 🌤️

**Tu pronóstico, sin ruido.**

BRISA es una aplicación web que desarrollé para consultar el clima de diferentes ciudades de forma sencilla y visual. Primero diseñé la interfaz en Figma y después la llevé a código con HTML, CSS y JavaScript.
[]
El sitio utiliza la API de Open-Meteo para mostrar las condiciones climáticas actuales y un pronóstico de cinco días, sin necesidad de registrarse ni utilizar una clave de API.

## ✨ Funcionalidades

- **Búsqueda por ciudad:** permite consultar el clima escribiendo el nombre de una ciudad.
- **Ciudades sugeridas:** incluye accesos rápidos a Barcelona, Buenos Aires y Tokio.
- **Clima actual:** muestra temperatura, estado del tiempo, sensación térmica, humedad, velocidad del viento y precipitación.
- **Amanecer y atardecer:** presenta los horarios correspondientes a la ubicación consultada.
- **Pronóstico de cinco días:** muestra temperaturas máximas y mínimas, condiciones climáticas y probabilidad de precipitación.
- **Iconos según el clima:** cambia los iconos SVG de acuerdo con las condiciones meteorológicas.
- **Mensajes de estado:** informa cuando una ciudad no se encuentra o cuando ocurre un problema al consultar los datos.
- **Consulta inicial:** al abrir la página, muestra automáticamente el clima de Madrid.

## 🛠️ Tecnologías utilizadas

- **HTML5:** estructura y contenido del sitio.
- **CSS3:** estilos, diseño responsive y animaciones de transición.
- **JavaScript:** interacción con el buscador, consultas a la API y actualización de la información.
- **Figma:** diseño inicial de la interfaz.
- **Open-Meteo:** datos meteorológicos y búsqueda de ubicaciones.
- **Google Fonts:** tipografías Fraunces e Inter.

El proyecto está desarrollado sin frameworks de JavaScript ni dependencias que requieran instalación.

## 🎨 Diseño y adaptación a pantallas

Quise crear una interfaz limpia, con una paleta de tonos verdes, beige y terracota para que la información fuera fácil de consultar.

El diseño se adapta a computadores, tablets y celulares. En pantallas pequeñas, el contenido se organiza en una sola columna y las tarjetas del pronóstico pueden desplazarse horizontalmente.

También incorporé algunos detalles de accesibilidad, como etiquetas para lectores de pantalla, indicadores de enfoque al navegar con teclado y respeto por la preferencia de movimiento reducido.

## 📁 Estructura del proyecto

```text
CLIMA/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── README.md
```

## 🚀 Cómo utilizarlo

1. Descarga o clona el repositorio.
2. Abre el archivo `index.html` en un navegador moderno. También puedes utilizar una extensión de servidor local, como Live Server.
3. Escribe el nombre de una ciudad en el buscador y presiona **Buscar**, o selecciona una de las ciudades sugeridas.
4. Consulta el clima actual y el pronóstico de los próximos cinco días.

Para obtener los datos, el navegador necesita conexión a internet.

## 🌐 API utilizada

BRISA utiliza dos servicios de [Open-Meteo](https://open-meteo.com/):

- **Geocoding API:** encuentra las coordenadas geográficas a partir del nombre de una ciudad.
- **Forecast API:** obtiene las condiciones actuales y el pronóstico diario de la ubicación seleccionada.

La aplicación realiza las solicitudes con `fetch` y utiliza `async/await` para gestionar las respuestas. Los datos recibidos se procesan con JavaScript y se muestran directamente en la página.

**Nota:** la búsqueda utiliza el primer resultado devuelto por el servicio de geocodificación. Si varias ciudades tienen el mismo nombre, puede seleccionarse una ubicación distinta de la esperada.


## 🎯 Objetivo del proyecto

Desarrollar una aplicación web que permita consultar información meteorológica de diferentes ciudades de manera sencilla, rápida y visual. Para ello, se integra la API Open-Meteo mediante JavaScript, permitiendo mostrar datos actualizados del clima y un pronóstico de cinco días. Además, se busca ofrecer una experiencia de usuario agradable a través de una interfaz diseñada en Figma y adaptada a diferentes dispositivos.

## 👩‍💻 Desarrollado por

**Maria Fernanda Moreno Montaño**

Proyecto desarrollado para mi portafolio personal de desarrollo web.
