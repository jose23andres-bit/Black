// CONFIG GENERAL
const WHATSAPP_NUMBER = "34722705922";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-reserva");
  if (!form) return;

  const nombreInput = document.getElementById("nombre");
  const telInput = document.getElementById("telefono");
  const fechaInput = document.getElementById("fecha");
  const horaInput = document.getElementById("hora");
  const servicioSelect = document.getElementById("servicio");
  const personasInput = document.getElementById("personas");
  const recogidaInput = document.getElementById("recogida");
  const destinoInput = document.getElementById("destino");
  const detallesInput = document.getElementById("detalles");
  const eventoSelect = document.getElementById("evento");

  const mensajeTextarea = document.getElementById("mensaje-whatsapp");
  const btnCopiar = document.getElementById("btn-copiar");
  const submitBtn = form.querySelector("button[type='submit']");

  inyectarEstilosToasts();

  // TOASTS
  function showToast(mensaje, tipo = "info") {
    const toast = document.createElement("div");
    toast.className = `bv-toast bv-toast--${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add("bv-toast--visible");
    });
    setTimeout(() => {
      toast.classList.remove("bv-toast--visible");
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // FORMATEAR FECHA
  function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    const [y, m, d] = fechaISO.split("-");
    return `${d}/${m}/${y}`;
  }

  // CONSTRUIR MENSAJE COMPLETO (TEXTO PLANO PARA RESUMEN + WHATSAPP)
  function construirMensaje() {
    const nombre = nombreInput.value.trim();
    const telefono = telInput.value.trim();
    const fecha = formatearFecha(fechaInput.value);
    const hora = (horaInput.value || "").trim();
    const servicio = servicioSelect.value || "";
    const personas = (personasInput.value || "").toString();
    const recogida = recogidaInput.value.trim();
    const destino = destinoInput.value.trim();
    const detalles = detallesInput.value.trim();
    const evento = eventoSelect.value || "";

    let texto = "SOLICITUD DE LIMUSINA – BLACK VIP\n\n";
    texto += `Nombre: ${nombre || "-"}\n`;
    texto += `Teléfono: ${telefono || "-"}\n`;
    texto += `Fecha: ${fecha || "-"}\n`;
    texto += `Hora: ${hora || "-"}\n`;
    texto += `Servicio: ${servicio || "-"}\n`;
    if (evento) texto += `Evento: ${evento}\n`;
    texto += `Personas: ${personas || "-"}\n`;
    texto += `Recogida: ${recogida || "-"}\n`;
    texto += `Destino: ${destino || "-"}\n`;
    texto += `Detalles extra: ${detalles || "-"}\n\n`;
    texto += "Por favor, confirma disponibilidad y forma de pago.";

    return texto;
  }

  // ACTUALIZAR RESUMEN MANUAL CADA VEZ QUE CAMBIAN CAMPOS
  [
    nombreInput,
    telInput,
    fechaInput,
    horaInput,
    servicioSelect,
    personasInput,
    recogidaInput,
    destinoInput,
    detallesInput,
    eventoSelect
  ].forEach((el) => {
    el.addEventListener("input", () => {
      if (!mensajeTextarea) return;
      mensajeTextarea.value = construirMensaje();
    });
  });

  // CARGA INICIAL DEL RESUMEN
  if (mensajeTextarea) {
    mensajeTextarea.value = construirMensaje();
  }

  // COPIAR MENSAJE
  if (btnCopiar && mensajeTextarea) {
    btnCopiar.addEventListener("click", async () => {
      try {
        mensajeTextarea.select();
        mensajeTextarea.setSelectionRange(0, 99999);
        document.execCommand("copy");
        showToast("Mensaje copiado. Ahora pégalo en WhatsApp ✅", "success");
      } catch (e) {
        showToast("No se ha podido copiar, copia manualmente el texto.", "error");
      }
    });
  }

  // VALIDACIÓN SIMPLE
  function validar() {
    const errores = [];
    const campos = [
      nombreInput,
      telInput,
      fechaInput,
      horaInput,
      servicioSelect,
      personasInput,
      recogidaInput,
      destinoInput
    ];

    campos.forEach((c) => c.classList.remove("campo-error"));

    if (!nombreInput.value.trim()) errores.push("Introduce tu nombre.");
    if (!telInput.value.trim() || telInput.value.replace(/[^\d]/g, "").length < 9)
      errores.push("Introduce un teléfono válido.");
    if (!fechaInput.value) errores.push("Selecciona la fecha.");
    if (!horaInput.value) errores.push("Selecciona la hora.");
    if (!servicioSelect.value) errores.push("Selecciona el tipo de servicio.");
    if (!personasInput.value) errores.push("Indica cuántas personas sois.");
    if (Number(personasInput.value) > 20)
      errores.push("El máximo permitido son 20 personas.");
    if (!recogidaInput.value.trim()) errores.push("Añade punto de recogida.");
    if (!destinoInput.value.trim()) errores.push("Añade destino o ruta.");

    if (errores.length) {
      campos.forEach((c) => {
        if (!c.value) c.classList.add("campo-error");
      });
    }

    return errores;
  }

  // SUBMIT → INTENTAR ABRIR WHATSAPP + ACTUALIZAR RESUMEN MANUAL
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const errores = validar();
    if (errores.length) {
      showToast(errores[0], "error");
      return;
    }

    const mensaje = construirMensaje();

    if (mensajeTextarea) {
      mensajeTextarea.value = mensaje;
    }

    const url =
      "https://api.whatsapp.com/send?phone=" +
      WHATSAPP_NUMBER +
      "&text=" +
      encodeURIComponent(mensaje);

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Abriendo WhatsApp...";

    // Intento de abrir WhatsApp
    try {
      window.location.href = url;
      showToast(
        "Si no se abre WhatsApp, copia el resumen y usa el botón de WhatsApp directo 👇",
        "success"
      );
    } catch (e) {
      showToast(
        "Si no se abre WhatsApp, copia el resumen y usa el botón de WhatsApp directo 👇",
        "error"
      );
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1500);
  });

  // SCROLL SUAVE
  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      const destino = document.querySelector(enlace.getAttribute("href"));
      if (!destino) return;
      e.preventDefault();
      destino.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});

// TOASTS (ESTILOS INYECTADOS)
function inyectarEstilosToasts() {
  const css = `
    .bv-toast {
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(5,5,9,0.96);
      color: #f7f7f7;
      padding: 0.7rem 1.4rem;
      border-radius: 999px;
      font-size: 0.85rem;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      border: 1px solid rgba(244,211,138,0.5);
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      transition: opacity .25s ease-out, transform .25s ease-out;
      text-align: center;
      max-width: 90%;
    }
    .bv-toast--visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }
    .bv-toast--error { border-color: #ff4d4d; }
    .bv-toast--success { border-color: #4dff88; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
