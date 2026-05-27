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
    chrome.storage.local.get('token', async (resultado) => {
        const token = resultado.token;

        //si no hay token,quiere decir que el usuario no se logueo
        if (!token) {
            console.log("No hay token, el usuario no se logueo aun");
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
                }else if( diasRestantes <= 7 && diasRestantes > 3){
                    diasNotificacion = 7;
                }

                if(!diasNotificacion) continue;
                const notificado = await fueNotificado (evento.id, diasNotificacion);
                if(notificado){
                    console.log(`Ya fue notificado (${diasNotificacion} dias): ${evento.summary}`);
                    continue;
                }

                await enviarAlBackend(evento);
                await marcarNotificado(evento.id, diasNotificacion);
                console.log(`Mail enviado (${diasNotificacion} dias): ${evento.summary}`);
            }
            console.log(`${eventos.length} recordatorios enviados`);

        }
    })
}
