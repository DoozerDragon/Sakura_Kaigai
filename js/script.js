document.addEventListener('DOMContentLoaded', () => {
    
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;

            if (nombre.length < 3) {
                alert("Por favor ingresa un nombre válido.");
                e.preventDefault();
                return;
            }

            console.log("Formulario validado correctamente. Enviando datos...");
        });
    }

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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil al hacer click
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (window.getComputedStyle(navbarToggler).display !== 'none' && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });
});