// 1. Importar las funciones de Firebase (Usando solo la versión 12.10.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

// 3. Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Lógica de la página y el formulario
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DEL FORMULARIO ---
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Evita que la página se recargue
            
            // Cambiar el texto del botón mientras carga
            const btnSubmit = contactForm.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
            btnSubmit.disabled = true;

            // Obtener los valores de los inputs
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const interes = document.getElementById('interes').value;
            const mensaje = document.getElementById('mensaje').value;

            try {
                // Guardar los datos en Firestore (en la colección "solicitudes")
                const docRef = await addDoc(collection(db, "solicitudes"), {
                    nombre: nombre,
                    email: email,
                    interes: interes,
                    mensaje: mensaje,
                    fecha: new Date() // Guarda la fecha y hora exacta
                });
                
                alert("¡Gracias por unirte al Club Sakura! Hemos recibido tu solicitud.");
                contactForm.reset(); // Limpia el formulario
                
            } catch (error) {
                console.error("Error al guardar el documento: ", error);
                alert("Hubo un error al enviar tus datos. Intenta nuevamente.");
            } finally {
                // Restaurar el botón
                btnSubmit.innerHTML = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

    // --- EFECTOS VISUALES (Scroll y Navbar) ---
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