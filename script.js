// =====================================================
// OVER SPEED - ALMACÉN + ADMINISTRADOR
// =====================================================

const trabajadoresBase = {
  "hugo": {
    password: "overspeed123",
    rol: "admin"
  },

  "trabajador": {
    password: "overspeed",
    rol: "trabajador"
  }
};

// Las cuentas creadas por Hugo se guardan en localStorage.
function cargarTrabajadores() {
  const guardado = localStorage.getItem("overspeed_trabajadores");

  if (!guardado) {
    const iniciales = structuredClone(trabajadoresBase);
    localStorage.setItem("overspeed_trabajadores", JSON.stringify(iniciales));
    return iniciales;
  }

  try {
    // IMPORTANT: no volvemos a mezclar trabajadoresBase aquí.
    // Si Hugo eliminó una cuenta y se guardó en localStorage, debe seguir eliminada.
    return JSON.parse(guardado);
  } catch {
    const iniciales = structuredClone(trabajadoresBase);
    localStorage.setItem("overspeed_trabajadores", JSON.stringify(iniciales));
    return iniciales;
  }
}

let trabajadores = cargarTrabajadores();

// SOLO ARTÍCULOS EXISTENTES.
// El administrador NO puede crear artículos nuevos.
// Puede aumentar o reducir su stock.
const articulosIniciales = [
  { id: "motor-v8", nombre: "Motor V8", categoria: "Tuning", stock: 10 },
  { id: "frenos-ceramicos", nombre: "Frenos cerámicos", categoria: "Tuning", stock: 10 },
  { id: "turbocharging", nombre: "Turbocharging", categoria: "Tuning", stock: 10 },
  { id: "traccion-awd", nombre: "Tracción AWD", categoria: "Tuning", stock: 10 },
  { id: "traccion-rwd", nombre: "Tracción RWD", categoria: "Tuning", stock: 10 },
  { id: "traccion-fwd", nombre: "Tracción FWD", categoria: "Tuning", stock: 10 },
  { id: "neumaticos-slicks", nombre: "Neumáticos Slicks", categoria: "Tuning", stock: 10 },
  { id: "neumaticos-semi-slick", nombre: "Neumáticos Semi-Slick", categoria: "Tuning", stock: 10 },
  { id: "neumaticos-offroad", nombre: "Neumáticos Offroad", categoria: "Tuning", stock: 10 },

  { id: "cosmeticos", nombre: "Cosméticos", categoria: "Modificaciones", stock: 10 },
  { id: "rendimiento", nombre: "Rendimiento", categoria: "Modificaciones", stock: 10 },
  { id: "set-rines", nombre: "Set de rines", categoria: "Modificaciones", stock: 10 },
  { id: "kit-suspension", nombre: "Kit de suspensión", categoria: "Modificaciones", stock: 10 },
  { id: "reparacion", nombre: "Reparación", categoria: "Modificaciones", stock: 10 },
  { id: "pintura", nombre: "Pintura", categoria: "Modificaciones", stock: 10 },
  { id: "kit-humo", nombre: "Kit de humo", categoria: "Modificaciones", stock: 10 },
  { id: "kit-extras", nombre: "Kit de extras", categoria: "Modificaciones", stock: 10 },
  { id: "kit-limpieza", nombre: "Kit de limpieza", categoria: "Modificaciones", stock: 10 }
];

let almacen = cargarAlmacen();
let seleccion = {};
let usuarioActual = null;
let rolActual = null;

function cargarAlmacen() {
  const guardado = localStorage.getItem("overspeed_almacen");

  if (!guardado) {
    localStorage.setItem("overspeed_almacen", JSON.stringify(articulosIniciales));
    return structuredClone(articulosIniciales);
  }

  try {
    return JSON.parse(guardado);
  } catch {
    localStorage.setItem("overspeed_almacen", JSON.stringify(articulosIniciales));
    return structuredClone(articulosIniciales);
  }
}

function guardarAlmacen() {
  localStorage.setItem("overspeed_almacen", JSON.stringify(almacen));
}

function guardarTrabajadores() {
  localStorage.setItem("overspeed_trabajadores", JSON.stringify(trabajadores));
}

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("visible");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2500);
}

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// -----------------------------------------------------
// LOGIN
// -----------------------------------------------------

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const error = document.getElementById("login-error");

  // Recarga por si Hugo ha creado una cuenta recientemente.
  trabajadores = cargarTrabajadores();
  const cuenta = trabajadores[usuario];

  if (!cuenta || cuenta.password !== password) {
    error.textContent = "Usuario o contraseña incorrectos.";
    return;
  }

  usuarioActual = usuario;
  rolActual = cuenta.rol;
  error.textContent = "";

  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("nombre-trabajador").textContent = usuario.toUpperCase();

  configurarPanel();
  renderAlmacen();
  renderSeleccion();
  renderListaArticulos();
  renderListaUsuarios();
});

// -----------------------------------------------------
// PANEL SEGÚN ROL
// -----------------------------------------------------

function configurarPanel() {
  const esAdmin = rolActual === "admin";

  document.getElementById("rol-usuario").textContent =
    esAdmin ? "ADMINISTRADOR" : "TRABAJADOR";

  document.getElementById("subtitulo-panel").textContent =
    esAdmin ? "PANEL DE ADMINISTRACIÓN" : "GESTIÓN DE ALMACÉN";

  document.getElementById("descripcion-almacen").textContent =
    esAdmin
      ? "Consulta el stock y administra las existencias"
      : "Selecciona los artículos que vas a retirar";

  document.getElementById("titulo-lateral").textContent =
    esAdmin ? "ADMINISTRACIÓN" : "SALIDA";

  document.getElementById("descripcion-lateral").textContent =
    esAdmin ? "Stock y cuentas de trabajadores" : "Artículos seleccionados";

  document.getElementById("admin-tools").classList.toggle("hidden", !esAdmin);
  document.getElementById("confirmar").classList.toggle("hidden", esAdmin);
  document.getElementById("vaciar").classList.toggle("hidden", esAdmin);
  document.getElementById("seleccionados").classList.toggle("hidden", esAdmin);
}

// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------

document.getElementById("logout").addEventListener("click", () => {
  usuarioActual = null;
  rolActual = null;
  seleccion = {};

  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("login-form").reset();
});

// -----------------------------------------------------
// ALMACÉN
// -----------------------------------------------------

function renderAlmacen() {
  const contenedor = document.getElementById("almacen");
  contenedor.innerHTML = "";

  const categorias = [...new Set(almacen.map(a => a.categoria))];

  categorias.forEach(categoria => {
    const titulo = document.createElement("div");
    titulo.className = "categoria";
    titulo.textContent = categoria;
    contenedor.appendChild(titulo);

    almacen
      .filter(a => a.categoria === categoria)
      .forEach(articulo => {
        const seleccionado = seleccion[articulo.id] || 0;

        const elemento = document.createElement("div");
        elemento.className = "articulo";

        elemento.innerHTML = `
          <div>
            <div class="nombre-articulo">${escaparHTML(articulo.nombre)}</div>
            <div class="stock ${articulo.stock === 0 ? "agotado" : ""}">
              Stock disponible: ${articulo.stock}
            </div>
          </div>

          <div class="controles">
            <button class="menos" data-action="menos" data-id="${articulo.id}">−</button>
            <span class="cantidad">${seleccionado}</span>
            <button class="mas" data-action="mas" data-id="${articulo.id}"
              ${articulo.stock === 0 ? "disabled" : ""}>+</button>
          </div>
        `;

        contenedor.appendChild(elemento);
      });
  });

  contenedor.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      cambiarSeleccion(button.dataset.id, button.dataset.action);
    });
  });
}

// -----------------------------------------------------
// SELECCIÓN DEL TRABAJADOR
// -----------------------------------------------------

function cambiarSeleccion(id, accion) {
  const articulo = almacen.find(a => a.id === id);
  if (!articulo) return;

  const actual = seleccion[id] || 0;

  if (accion === "mas" && actual < articulo.stock) {
    seleccion[id] = actual + 1;
  }

  if (accion === "menos" && actual > 0) {
    seleccion[id] = actual - 1;

    if (seleccion[id] === 0) {
      delete seleccion[id];
    }
  }

  renderAlmacen();
  renderSeleccion();
}

function renderSeleccion() {
  const contenedor = document.getElementById("seleccionados");
  const ids = Object.keys(seleccion).filter(id => seleccion[id] > 0);

  if (ids.length === 0) {
    contenedor.innerHTML = `<p class="vacio">No hay artículos seleccionados.</p>`;
    document.getElementById("confirmar").disabled = true;
    return;
  }

  contenedor.innerHTML = ids.map(id => {
    const articulo = almacen.find(a => a.id === id);

    return `
      <div class="linea-seleccion">
        <span>${escaparHTML(articulo.nombre)}</span>
        <span>x${seleccion[id]}</span>
      </div>
    `;
  }).join("");

  document.getElementById("confirmar").disabled = false;
}

// -----------------------------------------------------
// CONFIRMAR SALIDA
// -----------------------------------------------------

document.getElementById("confirmar").addEventListener("click", () => {
  const ids = Object.keys(seleccion).filter(id => seleccion[id] > 0);

  if (!ids.length) return;

  for (const id of ids) {
    const articulo = almacen.find(a => a.id === id);
    const cantidad = seleccion[id];

    if (!articulo || cantidad > articulo.stock) {
      mostrarToast("No hay stock suficiente.");
      return;
    }
  }

  ids.forEach(id => {
    const articulo = almacen.find(a => a.id === id);
    articulo.stock -= seleccion[id];
  });

  guardarAlmacen();

  seleccion = {};
  renderAlmacen();
  renderSeleccion();
  renderListaArticulos();

  mostrarToast("Salida confirmada correctamente.");
});

// -----------------------------------------------------
// VACIAR SELECCIÓN
// -----------------------------------------------------

document.getElementById("vaciar").addEventListener("click", () => {
  seleccion = {};
  renderAlmacen();
  renderSeleccion();
});

// -----------------------------------------------------
// ADMIN: LISTA DE ARTÍCULOS
// -----------------------------------------------------

function renderListaArticulos() {
  const lista = document.getElementById("lista-articulos");
  if (!lista) return;

  lista.innerHTML = almacen.map(articulo => `
    <option value="${escaparHTML(articulo.nombre)}">
  `).join("");
}

function obtenerDatosStock() {
  const nombre = document.getElementById("stock-nombre").value.trim();
  const cantidad = Number(document.getElementById("stock-cantidad").value);

  if (!nombre || !Number.isInteger(cantidad) || cantidad <= 0) {
    mostrarToast("Introduce un artículo y una cantidad válida.");
    return null;
  }

  const articulo = almacen.find(
    a => a.nombre.toLowerCase() === nombre.toLowerCase()
  );

  if (!articulo) {
    mostrarToast("Ese artículo no existe en el almacén.");
    return null;
  }

  return { articulo, cantidad };
}

function limpiarCamposStock() {
  document.getElementById("stock-nombre").value = "";
  document.getElementById("stock-cantidad").value = 1;
}

// -----------------------------------------------------
// ADMIN: AÑADIR STOCK
// -----------------------------------------------------

document.getElementById("anadir-stock").addEventListener("click", () => {
  if (rolActual !== "admin") {
    mostrarToast("No tienes permisos de administrador.");
    return;
  }

  const datos = obtenerDatosStock();
  if (!datos) return;

  datos.articulo.stock += datos.cantidad;

  guardarAlmacen();
  renderAlmacen();
  renderListaArticulos();
  limpiarCamposStock();

  mostrarToast(`+${datos.cantidad} ${datos.articulo.nombre} añadido al stock.`);
});

// -----------------------------------------------------
// ADMIN: ELIMINAR / RESTAR STOCK
// -----------------------------------------------------

document.getElementById("eliminar-stock").addEventListener("click", () => {
  if (rolActual !== "admin") {
    mostrarToast("No tienes permisos de administrador.");
    return;
  }

  const datos = obtenerDatosStock();
  if (!datos) return;

  if (datos.cantidad > datos.articulo.stock) {
    mostrarToast(`No puedes eliminar ${datos.cantidad}: solo hay ${datos.articulo.stock} en stock.`);
    return;
  }

  datos.articulo.stock -= datos.cantidad;

  guardarAlmacen();
  renderAlmacen();
  renderListaArticulos();
  limpiarCamposStock();

  mostrarToast(`-${datos.cantidad} ${datos.articulo.nombre} eliminado del stock.`);
});

// -----------------------------------------------------
// ADMIN: CREAR USUARIOS
// -----------------------------------------------------

document.getElementById("crear-usuario").addEventListener("click", () => {
  if (rolActual !== "admin") {
    mostrarToast("No tienes permisos de administrador.");
    return;
  }

  const nombre = document.getElementById("nuevo-usuario").value.trim().toLowerCase();
  const password = document.getElementById("nueva-password").value;
  const rol = document.getElementById("nuevo-rol").value;

  if (!/^[a-z0-9._-]{3,20}$/.test(nombre)) {
    mostrarToast("El usuario debe tener entre 3 y 20 caracteres y solo usar letras, números, . _ -");
    return;
  }

  if (password.length < 4) {
    mostrarToast("La contraseña debe tener al menos 4 caracteres.");
    return;
  }

  if (trabajadores[nombre]) {
    mostrarToast("Ese usuario ya existe.");
    return;
  }

  trabajadores[nombre] = {
    password,
    rol: rol === "admin" ? "admin" : "trabajador"
  };

  guardarTrabajadores();
  renderListaUsuarios();

  document.getElementById("nuevo-usuario").value = "";
  document.getElementById("nueva-password").value = "";
  document.getElementById("nuevo-rol").value = "trabajador";

  mostrarToast(`Cuenta ${nombre} creada como ${rol === "admin" ? "administrador" : "trabajador"}.`);
});

function renderListaUsuarios() {
  const contenedor = document.getElementById("lista-usuarios");
  if (!contenedor) return;

  const usuarios = Object.entries(trabajadores)
    .filter(([nombre]) => nombre !== "hugo")
    .sort(([a], [b]) => a.localeCompare(b));

  if (!usuarios.length) {
    contenedor.innerHTML = `<div class="nota">No hay cuentas creadas.</div>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="separador"></div>
    <h3>CUENTAS CREADAS</h3>
    ${usuarios.map(([nombre, cuenta]) => `
      <div class="usuario-creado">
        <div>
          <strong>${escaparHTML(nombre)}</strong>
          <span>${cuenta.rol === "admin" ? "ADMINISTRADOR" : "TRABAJADOR"}</span>
        </div>
        <button class="btn-danger btn-eliminar-usuario" type="button" data-usuario="${escaparHTML(nombre)}">ELIMINAR</button>
      </div>
    `).join("")}
  `;

  contenedor.querySelectorAll(".btn-eliminar-usuario").forEach(button => {
    button.addEventListener("click", () => eliminarUsuario(button.dataset.usuario));
  });
}

function eliminarUsuario(nombre) {
  if (rolActual !== "admin") {
    mostrarToast("No tienes permisos de administrador.");
    return;
  }

  if (!nombre || nombre === "hugo") {
    mostrarToast("La cuenta principal de Hugo no se puede eliminar.");
    return;
  }

  if (!trabajadores[nombre]) {
    mostrarToast("Esa cuenta no existe.");
    return;
  }

  const confirmar = window.confirm(`¿Seguro que quieres eliminar la cuenta de ${nombre}?`);
  if (!confirmar) return;

  delete trabajadores[nombre];
  guardarTrabajadores();
  renderListaUsuarios();
  mostrarToast(`Cuenta ${nombre} eliminada correctamente.`);
}
