const btnLogin = document.getElementById("btn-login");
const estadoConectado = document.getElementById("estado-conectado");
const statusOk = document.getElementById("status-ok");
const enviando = document.getElementById("enviando");
const listaEventos = document.getElementById("lista-eventos");

btnLogin.addEventListener("click", () => {
    login();
});

function login() {
    chrome.identity.getAuthToken({ "interactive": true }, async (token) => {
        if (chrome.runtime.lastError) {
            console.error("Error al conectar:", chrome.runtime.lastError.message);
            return;
        }

        chrome.storage.local.set({ token: token });

        // Mostrar estado conectado con animación
        estadoConectado.classList.remove("oculto");
        setTimeout(() => statusOk.classList.add("visible"), 50);

        // Mostrar spinner mientras busca eventos
        enviando.classList.remove("oculto");
        enviando.innerHTML = '<span class="spinner">⏳</span> Buscando eventos...';

        const eventos = await obtenerEventos(token);

        // Cambiar mensaje mientras envía
        enviando.innerHTML = '<span class="spinner">⏳</span> Enviando ayuda...';

        if (eventos && eventos.length > 0) {
            for (const evento of eventos) {
                await enviarAlBackend(evento);

                // Agregar evento a la lista con animación
                const item = document.createElement("div");
                item.className = "evento-item";

                const fechaEvento = new Date(evento.start.dateTime || evento.start.date);
                const hoy = new Date();
                const diasRestantes = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));

                item.innerHTML = `
                    <div class="evento-nombre">${evento.summary}</div>
                    <div class="evento-dias">en ${diasRestantes} días</div>
                `;

                listaEventos.appendChild(item);
                setTimeout(() => item.classList.add("visible"), 50);
            }
        }

        // Ocultar spinner cuando termina
        enviando.innerHTML = '✅ Ayuda enviada';
        enviando.classList.remove("oculto");
    });
}