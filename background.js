importScripts('utils.js');
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason != 'install') return;

    //Alarma que dispara cada 24 horas
    chrome.alarms.create("revisar-calendario"), {
        periodInMinutes: 1440
    }
})

//Cuando la alarma se dispara, ejecutar la funcion principal
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "revisar-calendario") {
        revisarCalendario();
    }
})

async function revisarCalendario() {
    //Leo el token guardado
    let token;
    try {
        token = await obtenerToken();
    } catch (error) {
        console.log("No se pudo obtener el token:", error.message);
        return;
    }

    console.log("Token encontrado, revisando calendario...");

    const eventos = await obtenerEventos(token);

    if (eventos && eventos.length > 0) {
        for (const evento of eventos) {
            const fechaEvento = new Date(evento.start.dateTime || evento.start.date);
            const hoy = new Date();
            const diasRestantes = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));

            let diasNotificacion = null;
            if (diasRestantes <= 14 && diasRestantes > 10) {
                diasNotificacion = 14;
            } else if (diasRestantes <= 7 && diasRestantes > 3) {
                diasNotificacion = 7;
            }

            if (!diasNotificacion) continue;
            const notificado = await fueNotificado(evento.id, diasNotificacion);
            if (notificado) {
                console.log(`Ya fue notificado (${diasNotificacion} dias): ${evento.summary}`);
                continue;
            }

            await enviarAlBackend(evento);
            await marcarNotificado(evento.id, diasNotificacion);
            console.log(`Mail enviado (${diasNotificacion} dias): ${evento.summary}`);
        }
        console.log(`${eventos.length} recordatorios enviados`);

    }
}


async function obtenerToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(token);
        });
    });
}