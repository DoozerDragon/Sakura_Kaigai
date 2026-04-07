import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC5DKxm0EiRVsUPJsUJPp6vjy_zSk0Nx_0",
    authDomain: "sakura-kaigai.firebaseapp.com",
    projectId: "sakura-kaigai",
    storageBucket: "sakura-kaigai.firebasestorage.app",
    messagingSenderId: "230688890947",
    appId: "1:230688890947:web:c1a7af95204e49c34174f6",
    measurementId: "G-ERFGDJFNW3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. GESTIÓN DEL CARRITO (PERSISTENTE EN LOCALSTORAGE)
    // ==========================================
    let carrito = JSON.parse(localStorage.getItem('carritoSakura')) || [];
    
    function actualizarCarritoVisual() {
        const cartCount = document.getElementById('cartCount');
        const listaCarrito = document.getElementById('listaCarrito');
        const totalCarrito = document.getElementById('totalCarrito');
        const btnProcederPago = document.getElementById('btnProcederPago');

        if(!cartCount) return; // Si no hay carrito en esta página, no hacer nada

        cartCount.innerText = carrito.length;
        listaCarrito.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<li class="list-group-item text-center text-muted mt-4">Tu carrito está vacío</li>';
            if(btnProcederPago) btnProcederPago.classList.add('disabled');
        } else {
            carrito.forEach((item, index) => {
                total += item.precio;
                listaCarrito.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center" style="font-size: 0.9rem;">
                        ${item.nombre}
                        <span>
                            <span class="text-primary fw-bold">$${item.precio}</span>
                            <button class="btn btn-sm text-danger ms-2 btn-eliminar" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </span>
                    </li>
                `;
            });
            if(btnProcederPago) btnProcederPago.classList.remove('disabled');
        }
        if(totalCarrito) totalCarrito.innerText = total;

        // Activar botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                carrito.splice(index, 1);
                localStorage.setItem('carritoSakura', JSON.stringify(carrito)); // Guardar cambios
                actualizarCarritoVisual();
            });
        });
    }

    // Función para anclar el evento a los botones de "Añadir al carrito"
    function activarBotonesCarrito() {
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombre = e.currentTarget.getAttribute('data-nombre');
                const precio = parseFloat(e.currentTarget.getAttribute('data-precio'));
                
                carrito.push({ nombre, precio });
                localStorage.setItem('carritoSakura', JSON.stringify(carrito)); // Guardar en memoria
                actualizarCarritoVisual();
                
                // Efecto visual rápido
                const icono = e.currentTarget.querySelector('i');
                if(icono) {
                    icono.classList.replace('fa-cart-plus', 'fa-check');
                    setTimeout(() => icono.classList.replace('fa-check', 'fa-cart-plus'), 1000);
                }
            });
        });
    }

    // Cargar carrito al iniciar la página
    actualizarCarritoVisual();
    activarBotonesCarrito();


    // ==========================================
    // 2. CARGAR CATÁLOGO (Index Preview y Catálogo Full)
    // ==========================================
    const contenedorPreview = document.getElementById('contenedorPreview');
    const contenedorCatalogoFull = document.getElementById('contenedorCatalogoFull');

    // Función general para renderizar tarjetas
    function crearTarjetaHTML(prod, id) {
        const rutaImagen = prod.imagen ? `img/${prod.imagen}` : 'https://via.placeholder.com/300x300?text=Sin+Imagen';
        return `
            <div class="col-md-4 mb-4 producto-item" data-categoria="${prod.categoria}">
                <div class="card h-100 border-0 shadow product-card bg-light">
                    <div class="card-img-wrapper text-center p-3" style="height: 250px;">
                        <img src="${rutaImagen}" class="img-fluid h-100" alt="${prod.nombre}" style="object-fit: contain;">
                    </div>
                    <div class="card-body text-dark d-flex flex-column">
                        <span class="badge bg-secondary mb-2 align-self-start">${prod.categoria}</span>
                        <h5 class="card-title fw-bold">${prod.nombre}</h5>
                        <h4 class="text-primary mt-auto mb-3">$${prod.precio} MXN</h4>
                        <div class="d-flex gap-2 mt-auto">
                            <a href="producto.html?id=${id}" class="btn btn-outline-primary w-50">Ver Detalles</a>
                            <button class="btn btn-sakura w-50 btn-add-cart" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
                                <i class="fas fa-cart-plus"></i> Añadir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // A) Lógica para el Index (Preview limitado a 3)
    if (contenedorPreview) {
        async function cargarPreview() {
            try {
                // Pedimos solo 3 productos
                const q = query(collection(db, "productos"), limit(3));
                const querySnapshot = await getDocs(q);
                contenedorPreview.innerHTML = ''; 
                
                if (querySnapshot.empty) {
                    contenedorPreview.innerHTML = '<p class="text-white">Próximamente novedades.</p>';
                    return;
                }

                querySnapshot.forEach((doc) => {
                    contenedorPreview.innerHTML += crearTarjetaHTML(doc.data(), doc.id);
                });
                activarBotonesCarrito();
            } catch (error) {
                console.error(error);
                contenedorPreview.innerHTML = '<p class="text-danger bg-white p-3 rounded">Error de conexión.</p>';
            }
        }
        cargarPreview();
    }

    // B) Lógica para el Catálogo Completo (catalogo.html)
    if (contenedorCatalogoFull) {
        async function cargarCatalogoCompleto() {
            try {
                // Pedimos TODOS los productos
                const querySnapshot = await getDocs(collection(db, "productos"));
                contenedorCatalogoFull.innerHTML = ''; 
                
                if (querySnapshot.empty) {
                    contenedorCatalogoFull.innerHTML = '<p class="text-white">Aún no hay productos en el inventario.</p>';
                    return;
                }

                querySnapshot.forEach((doc) => {
                    contenedorCatalogoFull.innerHTML += crearTarjetaHTML(doc.data(), doc.id);
                });
                activarBotonesCarrito();

                // Activar funcionalidad de los botones de Filtro
                document.querySelectorAll('.btn-filtro').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        // Cambiar color del botón activo
                        document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('filtro-activo'));
                        e.target.classList.add('filtro-activo');

                        // Ocultar/Mostrar según categoría
                        const categoriaSeleccionada = e.target.getAttribute('data-cat');
                        document.querySelectorAll('.producto-item').forEach(item => {
                            if(categoriaSeleccionada === 'Todos' || item.getAttribute('data-categoria') === categoriaSeleccionada) {
                                item.style.display = 'block';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                });

            } catch (error) {
                console.error(error);
                contenedorCatalogoFull.innerHTML = '<p class="text-danger bg-white p-3 rounded">Error de conexión.</p>';
            }
        }
        cargarCatalogoCompleto();
    }


    // ==========================================
    // 3. CARGAR DETALLES DEL PRODUCTO (Solo en producto.html)
    // ==========================================
    const detalleContainer = document.getElementById('detalleProductoContainer');
    if (detalleContainer) {
        // Extraer el ID de la URL (ej: producto.html?id=ASDF123)
        const parametrosURL = new URLSearchParams(window.location.search);
        const productoID = parametrosURL.get('id');

        if (!productoID) {
            detalleContainer.innerHTML = '<div class="alert alert-danger text-center">No se encontró el producto especificado.</div>';
        } else {
            async function cargarDetalle() {
                try {
                    const docRef = doc(db, "productos", productoID);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const prod = docSnap.data();
                        const rutaImagen = prod.imagen ? `img/${prod.imagen}` : 'https://via.placeholder.com/300x300';

                        detalleContainer.innerHTML = `
                            <div class="row bg-light text-dark p-5 rounded-4 shadow">
                                <div class="col-md-5 text-center mb-4 mb-md-0">
                                    <img src="${rutaImagen}" class="img-fluid rounded border shadow-sm" alt="${prod.nombre}" style="max-height: 400px; object-fit: contain;">
                                </div>
                                <div class="col-md-7 d-flex flex-column justify-content-center">
                                    <span class="badge bg-primary fs-6 mb-3 align-self-start">${prod.categoria}</span>
                                    <h1 class="fw-bold mb-3">${prod.nombre}</h1>
                                    <h2 class="text-danger mb-4">$${prod.precio} MXN</h2>
                                    
                                    <h5 class="fw-bold">Descripción del artículo:</h5>
                                    <p class="fs-5 text-muted mb-4" style="white-space: pre-line;">${prod.descripcion}</p>
                                    
                                    <button class="btn btn-sakura btn-lg w-100 mt-auto btn-add-cart" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
                                        <i class="fas fa-cart-plus me-2"></i> Añadir a mi Pedido
                                    </button>
                                </div>
                            </div>
                        `;
                        activarBotonesCarrito();
                    } else {
                        detalleContainer.innerHTML = '<div class="alert alert-warning text-center">Este producto ya no está disponible.</div>';
                    }
                } catch (error) {
                    detalleContainer.innerHTML = '<div class="alert alert-danger">Error al cargar la base de datos.</div>';
                }
            }
            cargarDetalle();
        }
    }

    // ==========================================
    // MÓDULO 3: PANEL DE ADMINISTRADOR
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    const btnLogout = document.getElementById('btnLogout');
    const btnOpenLogin = document.getElementById('btnOpenLogin');
    const adminPanel = document.getElementById('adminPanel');

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, document.getElementById('adminEmail').value, document.getElementById('adminPassword').value)
                .then(() => {
                    bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal')).hide();
                    loginForm.reset();
                })
                .catch((error) => alert("Credenciales incorrectas."));
        });
    }

    // Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                document.getElementById('contenedorTarjetas').innerHTML = '';
                document.getElementById('contenedorPedidos').innerHTML = '';
            });
        });
    }

    // Cambio de estado (Mostrar Dashboard y cargar datos)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            adminPanel.style.display = "block";
            btnLogout.style.display = "inline-block";
            btnOpenLogin.style.display = "none";
            
            cargarSolicitudes(); 
            cargarPedidos(); // Llamamos a la nueva función
        } else {
            adminPanel.style.display = "none";
            btnLogout.style.display = "none";
            btnOpenLogin.style.display = "inline-block";
        }
    });

    // Leer Mensajes de Contacto
    async function cargarSolicitudes() {
        const contenedor = document.getElementById('contenedorTarjetas');
        contenedor.innerHTML = '<div class="text-center w-100"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
        try {
            const q = query(collection(db, "solicitudes"), orderBy("fecha", "desc"));
            const querySnapshot = await getDocs(q);
            contenedor.innerHTML = ''; 
            if (querySnapshot.empty) { contenedor.innerHTML = '<p class="text-muted">No hay mensajes.</p>'; return; }

            querySnapshot.forEach((doc) => {
                const data = doc.data(); 
                let fechaFormateada = data.fecha && typeof data.fecha.toDate === 'function' ? data.fecha.toDate().toLocaleDateString() : "Sin fecha";
                
                contenedor.innerHTML += `
                    <div class="card shadow-sm mb-3 border-info">
                        <div class="card-body py-2">
                            <h6 class="card-title mb-1 text-info"><i class="fas fa-user"></i> ${data.nombre}</h6>
                            <p class="mb-1 small"><strong>Interés:</strong> ${data.interes}</p>
                            <p class="mb-1 small bg-light p-2 rounded border">${data.mensaje || 'Sin mensaje'}</p>
                            <small class="text-muted">${fechaFormateada} - ${data.email}</small>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error(error);
            contenedor.innerHTML = '<p class="text-danger">Error al cargar mensajes.</p>';
        }
    }

    // Leer Pedidos Nuevos
    async function cargarPedidos() {
        const contenedor = document.getElementById('contenedorPedidos');
        contenedor.innerHTML = '<div class="text-center w-100"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
        try {
            const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
            const querySnapshot = await getDocs(q);
            contenedor.innerHTML = ''; 
            if (querySnapshot.empty) { contenedor.innerHTML = '<p class="text-muted">No hay pedidos.</p>'; return; }

            querySnapshot.forEach((doc) => {
                const data = doc.data(); 
                let fechaFormateada = data.fecha && typeof data.fecha.toDate === 'function' ? data.fecha.toDate().toLocaleDateString() : "Sin fecha";
                
                // Formatear los productos comprados en una lista
                let listaProductos = data.productos.map(p => `<li>${p.nombre}</li>`).join('');

                contenedor.innerHTML += `
                    <div class="card shadow-sm mb-3 border-warning">
                        <div class="card-header bg-warning bg-opacity-25 py-1 d-flex justify-content-between">
                            <strong><i class="fas fa-receipt"></i> $${data.total} MXN</strong>
                            <span class="badge bg-secondary">${data.estado}</span>
                        </div>
                        <div class="card-body py-2">
                            <h6 class="mb-1"><i class="fas fa-user-circle"></i> ${data.cliente}</h6>
                            <small class="text-muted d-block mb-2"><i class="fas fa-map-marker-alt"></i> ${data.direccion}</small>
                            <ul class="small ps-3 mb-1">
                                ${listaProductos}
                            </ul>
                            <small class="text-muted mt-2 d-block border-top pt-1">${fechaFormateada} - ${data.email}</small>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error(error);
            contenedor.innerHTML = '<p class="text-danger">Error al cargar pedidos.</p>';
        }
    }

    // ==========================================
    // MÓDULO 4: EFECTOS VISUALES (NAVBAR)
    // ==========================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg');
            navbar.style.padding = '10px 0';
        } else {
            navbar.classList.remove('shadow-lg');
            navbar.style.padding = '15px 0';
        }
    });
});