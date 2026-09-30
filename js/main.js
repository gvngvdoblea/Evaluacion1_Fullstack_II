// Funciones para mostrar y limpiar errores
function limpiarError(idError) {
  const elem = document.getElementById(idError);
  if (elem) elem.textContent = "";
}

function mostrarError(idError, mensaje) {
  const elem = document.getElementById(idError);
  if (elem) elem.textContent = mensaje;
}

function validarDominioCorreo(correo) {
  if (!correo) return false;
  const correoLower = correo.trim().toLowerCase();
  
  if (
    correoLower.endsWith("@duoc.cl") || 
    correoLower.endsWith("@profesor.duoc.cl") || 
    correoLower.endsWith("@gmail.com")
  ) {
    return true;
  }
  return false;
}

function validarRunChileno(run) {
  const cleanRun = run.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleanRun.length < 7 || cleanRun.length > 9) return false;

  const cuerpo = cleanRun.slice(0, -1);
  const dvIngresado = cleanRun.slice(-1);

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
    if (multiplicador === 7) {
      multiplicador = 2;
    } else {
      multiplicador++;
    }
  }

  const resto = suma % 11;
  const dvCalculado = 11 - resto;

  let dvEsperado = "";
  if (dvCalculado === 11) dvEsperado = "0";
  else if (dvCalculado === 10) dvEsperado = "K";
  else dvEsperado = dvCalculado.toString();

  return dvIngresado === dvEsperado;
}

// Funciones del carrito
function obtenerCarrito() {
  const data = localStorage.getItem("carritoBajonUrbano");
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  let totalItems = 0;

  carrito.forEach(item => {
    totalItems += Number(item.cantidad) || 0;
  });

  const cantSpan = document.getElementById("cantCarrito");
  if (cantSpan) {
    cantSpan.textContent = totalItems;
  }
}

function agregarAlCarrito(id, nombre, precio) {
  let carrito = obtenerCarrito();
  const index = carrito.findIndex(item => item.id === id);

  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({ id: Number(id), nombre: nombre, precio: Number(precio), cantidad: 1 });
  }

  localStorage.setItem("carritoBajonUrbano", JSON.stringify(carrito));
  actualizarContadorCarrito();
  alert("¡" + nombre + " añadido al carrito!");
}

function agregarDesdeDetalle(id, nombre, precio) {
  const cantInput = document.getElementById("cantidadDetalle");
  const cantidad = cantInput ? parseInt(cantInput.value, 10) : 1;

  let carrito = obtenerCarrito();
  const index = carrito.findIndex(item => item.id === id);

  if (index !== -1) {
    carrito[index].cantidad += cantidad;
  } else {
    carrito.push({ id: Number(id), nombre: nombre, precio: Number(precio), cantidad: cantidad });
  }

  localStorage.setItem("carritoBajonUrbano", JSON.stringify(carrito));
  actualizarContadorCarrito();
  alert("¡" + cantidad + " x " + nombre + " añadidos al carrito!");
}

function renderizarCarrito() {
  const contenedor = document.getElementById("listaCarritoContenedor");
  const totalElem = document.getElementById("totalPagar");
  
  if (!contenedor) return;

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p style="color: var(--color-texto-secundario); text-align: center; padding: 40px; background: var(--color-tarjeta); border-radius: 8px; border: 1px solid var(--color-borde);">El carrito está vacío. Agrega productos desde nuestra carta.</p>';
    if (totalElem) totalElem.textContent = "$0";
    return;
  }

  let html = "";
  let total = 0;

  carrito.forEach((prod, index) => {
    const precioNum = Number(prod.precio) || 0;
    const cantNum = Number(prod.cantidad) || 1;
    const subtotal = precioNum * cantNum;
    total += subtotal;

    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; background-color: var(--color-tarjeta); border: 1px solid var(--color-borde); border-radius: 8px; padding: 15px; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="margin: 0; color: #fff;">${prod.nombre}</h3>
          <p style="margin: 4px 0 0; color: var(--color-acento); font-weight: bold;">$${precioNum.toLocaleString('es-CL')}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn-nav" style="padding: 4px 10px;" onclick="cambiarCantidad(${index}, -1)">-</button>
          <span style="font-size: 16px; font-weight: bold;">${cantNum}</span>
          <button class="btn-nav" style="padding: 4px 10px;" onclick="cambiarCantidad(${index}, 1)">+</button>
          <button class="btn-nav" style="background-color: var(--color-primario); color: #fff; border: none; padding: 6px 10px; margin-left: 10px; cursor: pointer;" onclick="eliminarItem(${index})">Eliminar</button>
        </div>
      </div>
    `;
  });

  contenedor.innerHTML = html;
  if (totalElem) totalElem.textContent = "$" + total.toLocaleString('es-CL');
}

function cambiarCantidad(index, cambio) {
  let carrito = obtenerCarrito();
  if (carrito[index]) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
  }
  localStorage.setItem("carritoBajonUrbano", JSON.stringify(carrito));
  actualizarContadorCarrito();
  renderizarCarrito();
}

function eliminarItem(index) {
  let carrito = obtenerCarrito();
  carrito.splice(index, 1);
  localStorage.setItem("carritoBajonUrbano", JSON.stringify(carrito));
  actualizarContadorCarrito();
  renderizarCarrito();
}

function aplicarCupon() {
  const cuponInput = document.getElementById("cupon");
  if (cuponInput && cuponInput.value.trim().toUpperCase() === "CUPON10") {
    alert("¡Cupón aplicado con éxito! Tienes un 10% de descuento.");
  } else {
    alert("Cupón inválido.");
  }
}

function procesarPago() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  alert("¡Gracias por tu compra en El Bajón Urbano!");
  localStorage.removeItem("carritoBajonUrbano");
  actualizarContadorCarrito();
  renderizarCarrito();
}

// Eventos al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorCarrito();
  renderizarCarrito();

  const btnMenu = document.getElementById("btnMenu");
  const navLinks = document.getElementById("navLinks");
  if (btnMenu && navLinks) {
    btnMenu.addEventListener("click", () => {
      navLinks.classList.toggle("activo");
    });
  }

  // Selects de region y comuna
  const selectRegion = document.getElementById("selectRegion");
  const selectComuna = document.getElementById("selectComuna");

  if (selectRegion && selectComuna) {
    regionesYComunas.forEach(item => {
      const option = document.createElement("option");
      option.value = item.region;
      option.textContent = item.region;
      selectRegion.appendChild(option);
    });

    selectRegion.addEventListener("change", (e) => {
      const regionSel = e.target.value;
      selectComuna.innerHTML = '<option value="">-- Seleccione la comuna --</option>';

      if (regionSel) {
        const encontrada = regionesYComunas.find(r => r.region === regionSel);
        if (encontrada) {
          encontrada.comunas.forEach(comuna => {
            const opt = document.createElement("option");
            opt.value = comuna;
            opt.textContent = comuna;
            selectComuna.appendChild(opt);
          });
          selectComuna.disabled = false;
        }
      } else {
        selectComuna.disabled = true;
      }
    });
  }

  // Validacion contacto
  const formContacto = document.getElementById("formContacto");
  if (formContacto) {
    formContacto.addEventListener("submit", (e) => {
      e.preventDefault();
      let esValido = true;
      const nombre = document.getElementById("contacto-nombre").value.trim();
      const email = document.getElementById("contacto-email").value.trim();
      const comentario = document.getElementById("contacto-comentario").value.trim();

      limpiarError("error-contacto-nombre");
      limpiarError("error-contacto-email");
      limpiarError("error-contacto-comentario");

      if (!nombre) { mostrarError("error-contacto-nombre", "El nombre es obligatorio."); esValido = false; }
      if (email && !validarDominioCorreo(email)) { mostrarError("error-contacto-email", "Solo @duoc.cl, @profesor.duoc.cl o @gmail.com"); esValido = false; }
      if (!comentario) { mostrarError("error-contacto-comentario", "El comentario es obligatorio."); esValido = false; }

      if (esValido) {
        alert("¡Mensaje enviado correctamente!");
        formContacto.reset();
      }
    });
  }

  // Validacion login
  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      let esValido = true;
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      limpiarError("error-login-email");
      limpiarError("error-login-password");

      if (!email) { mostrarError("error-login-email", "El correo es obligatorio."); esValido = false; }
      else if (!validarDominioCorreo(email)) { mostrarError("error-login-email", "Solo @duoc.cl, @profesor.duoc.cl o @gmail.com"); esValido = false; }

      if (!password) { mostrarError("error-login-password", "La contraseña es obligatoria."); esValido = false; }
      else if (password.length < 4 || password.length > 10) { mostrarError("error-login-password", "Debe tener entre 4 y 10 caracteres."); esValido = false; }

      if (esValido) {
        alert("¡Inicio de sesión exitoso!");
        formLogin.reset();
        sessionStorage.setItem("usuarioActivo", email);
        
        if (email === "admin@duoc.cl" || email === "admin@profesor.duoc.cl") {
          window.location.href = "./admin/index.html";
        } else {
          window.location.href = "../index.html";
        }
      }
    });
  }

  // Validacion registro
  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
      e.preventDefault();
      let esValido = true;
      const run = document.getElementById("run").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value.trim();

      if (!validarRunChileno(run)) { mostrarError("error-run", "RUN inválido."); esValido = false; }
      if (!validarDominioCorreo(email)) { mostrarError("error-email", "Dominio no permitido."); esValido = false; }
      if (password.length < 4 || password.length > 10) { mostrarError("error-password", "Entre 4 y 10 caracteres."); esValido = false; }

      if (esValido) {
        alert("¡Registro exitoso!");
        formRegistro.reset();
        window.location.href = "./login.html";
      }
    });
  }

  // Nuevo producto admin
  const formProd = document.getElementById("formNuevoProducto");
  if (formProd) {
    formProd.addEventListener("submit", (e) => {
      e.preventDefault();
      let esValido = true;
      const codigo = document.getElementById("codigoProd").value.trim();
      const nombre = document.getElementById("nombreProd").value.trim();
      const precio = document.getElementById("precioProd").value.trim();
      const stock = document.getElementById("stockProd").value.trim();

      if (!codigo || codigo.length < 3) { mostrarError("error-codigoProd", "Mínimo 3 caracteres."); esValido = false; }
      if (!nombre) { mostrarError("error-nombreProd", "Obligatorio."); esValido = false; }
      if (precio === "" || isNaN(precio) || parseFloat(precio) < 0) { mostrarError("error-precioProd", "Mayor o igual a 0."); esValido = false; }
      if (stock === "" || isNaN(stock) || parseInt(stock, 10) < 0) { mostrarError("error-stockProd", "Entero mayor o igual a 0."); esValido = false; }

      if (esValido) {
        alert("¡Producto registrado!");
        window.location.href = "./productos.html";
      }
    });
  }

  // Nuevo usuario admin
  const formAdminUser = document.getElementById("formAdminNuevoUsuario");
  if (formAdminUser) {
    formAdminUser.addEventListener("submit", (e) => {
      e.preventDefault();
      let esValido = true;
      const run = document.getElementById("admin-run").value.trim();
      const email = document.getElementById("admin-email").value.trim();

      if (!validarRunChileno(run)) { mostrarError("error-admin-run", "RUN inválido."); esValido = false; }
      if (!validarDominioCorreo(email)) { mostrarError("error-admin-email", "Dominio no permitido."); esValido = false; }

      if (esValido) {
        alert("¡Usuario registrado!");
        window.location.href = "./usuarios.html";
      }
    });
  }

  // Sesion activa en el menu
  const usuarioActivo = sessionStorage.getItem("usuarioActivo");
  const navGrupoDer = document.querySelector(".nav-grupo-der");

  if (usuarioActivo && navGrupoDer) {
    const enlaces = navGrupoDer.querySelectorAll("a");
    enlaces.forEach(link => {
      if (link.href.includes("login.html") || link.href.includes("registro.html")) {
        link.style.display = "none";
      }
    });

    if (!document.getElementById("btn-cerrar-sesion")) {
      const btnLogout = document.createElement("a");
      btnLogout.href = "#";
      btnLogout.id = "btn-cerrar-sesion";
      btnLogout.className = "btn-nav-accion";
      btnLogout.style.backgroundColor = "#dc3545";
      btnLogout.textContent = "Cerrar sesión";

      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("usuarioActivo");
        alert("Has cerrado sesión exitosamente.");
        
        const enPaginas = window.location.pathname.includes("/paginas/");
        window.location.href = enPaginas ? "../index.html" : "./index.html";
      });

      navGrupoDer.appendChild(btnLogout);
    }
  }
});