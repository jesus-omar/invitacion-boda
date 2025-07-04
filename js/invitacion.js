document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("invitado"));
  if (!data) return window.location.href = "/";

  document.getElementById("nombre-invitado").textContent = data.nombre;
  document.getElementById("accesos-invitado").textContent = data.accesos;

  // IntersectionObserver para animación
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.info-slide').forEach(el => observer.observe(el));
});

