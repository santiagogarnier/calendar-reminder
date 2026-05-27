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

        if(eventos&&eventos.length > 0){
            for(const evento of eventos){
                const notificados = await fueNotificado(evento.id);
                if(notificados){
                    console.log(`Ya fue notificado: ${evento.summary}`);
                    continue;
                }
                await enviarAlBackend(evento);
                await marcarNotificado(evento.id);
                console.log(`Mail enviado: ${evento.summary}`)
            }
            console.log(`${eventos.length} recordatorios enviados`);
            
        }
    })
}
