document.addEventListener('DOMContentLoaded', function () {
  // Aplicar fade-in al cargar
  document.body.classList.remove('fade-out');
  document.body.classList.add('fade-in'); // Aseguramos que la clase fade-in se aplica correctamente al cargar la página

  // Interceptar clics en enlaces para aplicar fade-out
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const isInternal = href && !href.startsWith('#') && !link.hasAttribute('target');

      if (isInternal) {
        e.preventDefault();
        document.body.classList.remove('fade-in');
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = href;
        }, 600); // tiempo del fade
      }
    });
  });
});