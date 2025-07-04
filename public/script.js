window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const codigo = params.get("codigo");

  if (codigo) {
    fetch(`/invitado/${codigo}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("nombre").textContent = data.nombre;
        document.getElementById("accesos").textContent = data.accesos;
        document.getElementById("mesa").textContent = data.mesa;
      })
      .catch(err => {
        console.error("Error al obtener datos:", err);
        document.querySelector(".invitacion-container").innerHTML = "<p>No se pudo cargar la invitación.</p>";
      });
  }
});
