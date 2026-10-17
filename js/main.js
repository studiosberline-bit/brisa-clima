/* =========================================================
   BRISA - APLICACIÓN WEB DEL CLIMA
   =========================================================
   Este archivo contiene la lógica principal de BRISA,
   un sitio que permite consultar el clima actual
   y el pronóstico de los próximos cinco días.

   Para obtener la información utilizo la API Open-Meteo,
   que es gratuita y no requiere una clave de acceso.

   La aplicación trabaja con dos servicios:
   1. Geocodificación: obtiene las coordenadas de una ciudad.
   2. Pronóstico: consulta las condiciones climáticas
      utilizando la latitud y longitud de esa ubicación.
   ========================================================= */


/* =========================================================
   1. CONFIGURACIÓN INICIAL
   ========================================================= */

// Defino las direcciones de los servicios que utiliza
// la aplicación para realizar las consultas del clima.

const URL_CIUDADES = "https://geocoding-api.open-meteo.com/v1/search";
const URL_CLIMA = "https://api.open-meteo.com/v1/forecast";

// Ciudad que se muestra automáticamente al abrir la página.
const CIUDAD_INICIAL = "Madrid";


/* =========================================================
   2. SELECCIÓN DE ELEMENTOS HTML
   ========================================================= */

// Creo una función para acceder a los elementos del HTML
// mediante su ID, evitando repetir document.getElementById.

const $ = id => document.getElementById(id);

// Guardo los elementos principales que necesito para
// controlar el buscador y mostrar la información del clima.

const tarjeta = $("clima"), formulario = $("buscador"), campo = $("ciudad"), boton = $("buscar"), aviso = $("aviso");


/* =========================================================
   3. IDENTIFICACIÓN DE LAS CONDICIONES CLIMÁTICAS
   ========================================================= */

// La API devuelve códigos numéricos según el estado del clima.
// En este arreglo relaciono cada código con su descripción
// en español y el icono que se mostrará en la aplicación.
// Estos códigos corresponden al estándar WMO.

const TIEMPO = [
  [[0], "Despejado", "sun"],
  [[1], "Mayormente despejado", "cloud-sun"],
  [[2], "Parcialmente nublado", "cloud"],
  [[3], "Nublado", "cloud"],
  [[45, 48], "Niebla", "cloud-fog"],
  [[51, 53, 55, 56, 57], "Llovizna", "cloud-drizzle"],
  [[61, 63, 65, 66, 67], "Lluvia", "cloud-rain"],
  [[71, 73, 75, 77], "Nieve", "cloud-snow"],
  [[80, 81, 82], "Chubascos", "cloud-rain"],
  [[85, 86], "Chubascos de nieve", "cloud-snow"],
  [[95, 96, 99], "Tormenta", "cloud-lightning"]
];

/**
 * Busca el código climático recibido de la API y devuelve
 * la descripción y el icono que le corresponden.
 *
 * Si el código no está registrado, se muestra un estado
 * predeterminado para evitar dejar la información vacía.
 *
 * @param {number} codigo - Código de la condición climática.
 * @returns {Object} Descripción e icono del clima.
 */

const tiempo = codigo => {
  const t = TIEMPO.find(([codigos]) => codigos.includes(codigo));
  return t ? { texto: t[1], icono: t[2] } : { texto: "Sin datos", icono: "cloud" };
};

/**
 * Genera el código SVG de los iconos utilizados en BRISA.
 *
 * @param {string} nombre - Nombre del icono.
 * @returns {string} Elemento SVG en formato HTML.
 */

const icono = nombre => `<svg class="ico" aria-hidden="true"><use href="#i-${nombre}"/></svg>`;


/* =========================================================
   4. CONSULTAS A LA API OPEN-METEO
   ========================================================= */

// En esta sección se realizan las solicitudes necesarias
// para obtener la ubicación y los datos meteorológicos.

/**
 * Realiza una solicitud a una dirección de la API.
 *
 * Utilizo fetch para obtener la respuesta del servidor.
 * Si ocurre un error HTTP, se genera una excepción.
 * Cuando la solicitud es correcta, devuelve los datos
 * convertidos a formato JSON.
 *
 * @param {string} url - Dirección de la consulta.
 * @returns {Promise<Object>} Datos recibidos de la API.
 */

async function pedirJSON(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error("Error " + respuesta.status);
  return respuesta.json();
}

/**
 * Busca una ciudad a partir del nombre ingresado.
 *
 * La API de geocodificación permite obtener información
 * como el nombre, país, región, latitud y longitud.
 *
 * Utilizo encodeURIComponent para que los nombres
 * con espacios o caracteres especiales se envíen
 * correctamente en la dirección de búsqueda.
 *
 * @param {string} nombre - Nombre de la ciudad.
 * @returns {Promise<Object|null>} Datos de la ciudad
 * o null cuando no se encuentran resultados.
 */

async function buscarCiudad(nombre) {
  const datos = await pedirJSON(`${URL_CIUDADES}?name=${encodeURIComponent(nombre)}&count=1&language=es&format=json`);

  // Compruebo si la API encontró alguna ciudad.
  if (!datos.results || !datos.results.length) return null;

  // Devuelvo el primer resultado de la búsqueda.
  return datos.results[0];
}

/**
 * Obtiene la información climática de una ubicación.
 *
 * La consulta se realiza utilizando sus coordenadas.
 * Se solicitan datos del clima actual y del pronóstico
 * para los próximos cinco días.
 *
 * URLSearchParams permite organizar los parámetros
 * que se envían a la API.
 *
 * @param {number} lat - Latitud de la ciudad.
 * @param {number} lon - Longitud de la ciudad.
 * @returns {Promise<Object>} Información del clima.
 */

function pedirClima(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,

    // Datos que necesito para mostrar el clima actual.
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",

    // Datos necesarios para construir el pronóstico diario.
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",

    // Ajusto los horarios según la ubicación consultada.
    timezone: "auto",

    // Establezco un pronóstico de cinco días.
    forecast_days: 5
  });

  // Envío la consulta con los parámetros configurados.
  return pedirJSON(`${URL_CLIMA}?${params}`);
}


/* =========================================================
   5. VISUALIZACIÓN DEL CLIMA ACTUAL
   ========================================================= */

/**
 * Muestra las condiciones climáticas actuales en pantalla.
 *
 * Esta función recibe la información de la ciudad y los
 * datos meteorológicos para actualizar los elementos HTML.
 *
 * Utilizo Math.round para mostrar algunos valores
 * numéricos redondeados y facilitar su lectura.
 *
 * @param {Object} lugar - Información de la ciudad.
 * @param {Object} clima - Datos obtenidos de Open-Meteo.
 */

function mostrarActual(lugar, clima) {

  // Separo la información actual y los datos diarios.
  const ahora = clima.current, hoy = clima.daily;

  // Obtengo la descripción y el icono del clima actual.
  const t = tiempo(ahora.weather_code);

  // Muestro los datos de ubicación de la ciudad.
  $("region").textContent = lugar.admin1 || lugar.country || "";
  $("nombre").textContent = lugar.name;
  $("pais").textContent = lugar.country || "";

  // Actualizo la temperatura y la descripción del clima.
  $("temp").textContent = Math.round(ahora.temperature_2m);
  $("estado").textContent = t.texto;

  // Muestro la sensación térmica.
  $("sensacion").textContent = `Sensación de ${Math.round(ahora.apparent_temperature)}°`;

  // Cambio el icono según la condición climática.
  $("icono").innerHTML = `<use href="#i-${t.icono}"/>`;

  // Actualizo los valores de humedad, viento y precipitación.
  $("humedad").textContent = `${Math.round(ahora.relative_humidity_2m)}%`;
  $("viento").textContent = `${Math.round(ahora.wind_speed_10m)} km/h`;
  $("lluvia").textContent = `${ahora.precipitation} mm`;

  // Extraigo y muestro las horas del amanecer y atardecer.
  $("amanecer").textContent = hoy.sunrise[0].slice(11, 16);
  $("atardecer").textContent = hoy.sunset[0].slice(11, 16);
}


/* =========================================================
   6. PRONÓSTICO DE LOS PRÓXIMOS CINCO DÍAS
   ========================================================= */

/**
 * Convierte la primera letra de un texto a mayúscula.
 *
 * La utilizo para presentar correctamente los nombres
 * de los días de la semana.
 *
 * @param {string} texto - Texto que se desea modificar.
 * @returns {string} Texto con inicial mayúscula.
 */

const mayuscula = texto => texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Genera las tarjetas del pronóstico diario.
 *
 * Recorro los datos que devuelve la API y construyo
 * una tarjeta HTML para cada uno de los cinco días.
 *
 * Cada tarjeta contiene la fecha, el estado del clima,
 * su icono, las temperaturas máxima y mínima y la
 * probabilidad de precipitación.
 *
 * @param {Object} clima - Información del pronóstico.
 */

function mostrarDias(clima) {

  // Obtengo los datos correspondientes al pronóstico diario.
  const d = clima.daily;

  // Recorro las fechas y genero una tarjeta por cada día.
  $("dias").innerHTML = d.time.map((fecha, i) => {

    // Separo el año, mes y día para crear un objeto Date.
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const objeto = new Date(anio, mes - 1, dia);

    // Identifico el primer día como "Hoy".
    // Los demás se muestran con su nombre abreviado en español.
    const nombre = i === 0 ? "Hoy" : mayuscula(objeto.toLocaleDateString("es", { weekday: "short" }).replace(".", ""));

    // Obtengo una versión corta de la fecha.
    const corta = objeto.toLocaleDateString("es", { day: "numeric", month: "short" }).replace(".", "");

    // Identifico el estado del clima para el día correspondiente.
    const t = tiempo(d.weather_code[i]);

    // Obtengo la probabilidad máxima de precipitación.
    const lluvia = d.precipitation_probability_max[i];

    // Construyo el contenido HTML de cada tarjeta.
    // La primera recibe la clase "hoy" para diferenciarla.
    return `
      <article class="dia${i === 0 ? " hoy" : ""}" role="listitem">
        <div class="dia-cab"><b>${nombre}</b><span>${corta}</span></div>
        ${icono(t.icono)}
        <p class="cond">${t.texto}</p>
        <div class="dia-pie">
          <p><span class="max">${Math.round(d.temperature_2m_max[i])}°</span><span class="min">${Math.round(d.temperature_2m_min[i])}°</span></p>
          <span class="lluvia" title="Probabilidad de precipitación">${icono("droplet")}${lluvia ?? 0}%</span>
        </div>
      </article>`;

  // Uno todas las tarjetas para mostrarlas en el contenedor.
  }).join("");
}


/* =========================================================
   7. FUNCIÓN PRINCIPAL DE CONSULTA
   ========================================================= */

/**
 * Controla el proceso completo de búsqueda del clima.
 *
 * Primero obtiene las coordenadas de la ciudad ingresada.
 * Después consulta los datos meteorológicos y actualiza
 * la información que aparece en la aplicación.
 *
 * También controla el estado de carga y los mensajes
 * que se muestran cuando ocurre algún problema.
 *
 * @param {string} nombre - Ciudad que se desea consultar.
 * @returns {Promise<void>}
 */

async function consultar(nombre) {

  // Limpio los mensajes de búsquedas anteriores.
  aviso.textContent = "";

  // Activo el estado de carga mientras se obtienen los datos.
  tarjeta.classList.add("cargando");

  try {

    // Busco las coordenadas de la ciudad ingresada.
    const lugar = await buscarCiudad(nombre);

    // Si no se encuentra la ciudad, muestro un aviso.
    if (!lugar) {
      aviso.textContent = `No encontramos "${nombre}". Prueba con otro nombre.`;
      return;
    }

    // Consulto el clima utilizando la latitud y longitud.
    const clima = await pedirClima(lugar.latitude, lugar.longitude);

    // Actualizo la información del clima actual.
    mostrarActual(lugar, clima);

    // Muestro el pronóstico de los próximos días.
    mostrarDias(clima);

  } catch (error) {

    // Informo al usuario si ocurre un error durante la consulta.
    aviso.textContent = "No pudimos obtener el clima. Revisa tu conexión e inténtalo otra vez.";

  } finally {

    // Desactivo el estado de carga al finalizar la consulta.
    tarjeta.classList.remove("cargando");

  }
}


/* =========================================================
   8. EVENTOS E INTERACCIÓN CON EL USUARIO
   ========================================================= */

// Aquí controlo las acciones que realiza el usuario
// al escribir una ciudad, enviar el formulario o
// seleccionar una de las ciudades sugeridas.


// Compruebo si el campo de búsqueda contiene texto.
// Si está vacío o solo tiene espacios, deshabilito el botón.
campo.addEventListener("input", () => { boton.disabled = campo.value.trim() === ""; });


// Escucho el envío del formulario de búsqueda.
// Evito que la página se recargue y consulto la ciudad ingresada.
formulario.addEventListener("submit", e => {
  e.preventDefault();

  // Elimino los espacios innecesarios del nombre.
  const nombre = campo.value.trim();

  // Realizo la consulta únicamente si se ingresó una ciudad.
  if (nombre) consultar(nombre);
});


// Selecciono los botones que contienen el atributo data-ciudad.
// Estos permiten realizar búsquedas rápidas de ciudades sugeridas.
document.querySelectorAll("[data-ciudad]").forEach(chip => {

  chip.addEventListener("click", () => {

    // Coloco el nombre de la ciudad seleccionada en el buscador.
    campo.value = chip.dataset.ciudad;

    // Habilito el botón de búsqueda.
    boton.disabled = false;

    // Consulto automáticamente el clima de esa ciudad.
    consultar(chip.dataset.ciudad);

  });
});


/* =========================================================
   9. INICIALIZACIÓN DE BRISA
   ========================================================= */

// Al cargar la aplicación realizo una consulta automática
// de la ciudad configurada inicialmente.
//
// De esta manera, el usuario puede visualizar información
// del clima sin necesidad de realizar su primera búsqueda.

consultar(CIUDAD_INICIAL);