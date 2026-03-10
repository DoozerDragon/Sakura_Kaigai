// 1. Importar Firebase Auth y Firestore (Versión 12.10.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
// Nuevas importaciones para Autenticación
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// 2. Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC5DKxm0EiRVsUPJsUJPp6vjy_zSk0Nx_0",
    authDomain: "sakura-kaigai.firebaseapp.com",
    projectId: "sakura-kaigai",
    storageBucket: "sakura-kaigai.firebasestorage.app",
    messagingSenderId: "230688890947",
    appId: "1:230688890947:web:c1a7af95204e49c34174f6",
    measurementId: "G-ERFGDJFNW3"
};

// 3. Inicializar Firebase, Firestore y Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inicializamos el sistema de login

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DEL FORMULARIO DE CONTACTO (El que ya teníamos) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            const btnSubmit = contactForm.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
            btnSubmit.disabled = true;

            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const interes = document.getElementById('interes').value;
            const mensaje = document.getElementById('mensaje').value;

            try {
                await addDoc(collection(db, "solicitudes"), {
                    nombre: nombre, email: email, interes: interes, mensaje: mensaje, fecha: new Date()
                });
                alert("¡Gracias por unirte al Club Sakura! Hemos recibido tu solicitud.");
                contactForm.reset(); 
            } catch (error) {
                console.error("Error al guardar: ", error);
                alert("Hubo un error al enviar tus datos.");
            } finally {
                btnSubmit.innerHTML = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

    // --- LÓGICA DE LOGIN PARA ADMIN ---
    const loginForm = document.getElementById('loginForm');
    const btnLogout = document.getElementById('btnLogout');
    const btnOpenLogin = document.getElementById('btnOpenLogin');
    const adminPanel = document.getElementById('adminPanel');

    // Manejar el envío del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;

            // Intentar iniciar sesión con Firebase
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // FIX: Usamos getOrCreateInstance para evitar errores de Bootstrap
                    const modalElement = document.getElementById('loginModal');
                    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                    modal.hide();
                    
                    loginForm.reset();
                    alert("¡Bienvenido Administrador!");
                })
        });
    }

    // Manejar el botón de cerrar sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                alert("Sesión cerrada correctamente.");
            });
        });
    }

    // Escuchar cambios de estado (Saber si hay alguien logueado o no)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Si el admin está logueado: Mostrar panel, botón salir, ocultar botón login
            adminPanel.style.display = "block";
            btnLogout.style.display = "inline-block";
            btnOpenLogin.style.display = "none";
        } else {
            // Si nadie está logueado: Ocultar panel, ocultar botón salir, mostrar botón login
            adminPanel.style.display = "none";
            btnLogout.style.display = "none";
            btnOpenLogin.style.display = "inline-block";
        }
    });

    // --- EFECTOS VISUALES (Navbar) ---
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