const btnLogin = document.getElementById("btn-login");
const status = document.getElementById("status");

//Usuario clickea el boton 
btnLogin.addEventListener("click",()=>{
    login();
})

function login(){
    chrome.identity.getAuthToken({"interactive": true},async (token)=>{
        if(chrome.runtime.lastError){
            status.textContent = "Error al conectar: " + chrome.runtime.lastError.message;
            return;
        }

        status.textContent = "Conectado";
        const eventos = await obtenerEventos(token);
        if(eventos && eventos.length > 0){
            for(const evento of eventos){
                await enviarAlBackend(evento, 'santiagogarnier5@gmail.com');
            }
        }
        status.textContent = `${eventos.length} recordatorios enviados`;
        console.log("Eventos:", eventos);
    })
}

async function obtenerEventos(token){
    const hoy = new Date();
    const enCatDias = new Date();
    enCatDias.setDate(hoy.getDate() + 14);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${hoy.toISOString()}&timeMax=${enCatDias.toISOString()}&singleEvents=true&orderBy=startTime`;

    const respuesta = await fetch(url, {
        headers: {
            Authorization : `Bearer ${token}`
        }
    });

    const datos = await respuesta.json();
    return datos.items;
}

//fetch:desp de obtener los eventos, los mando al backend

async function enviarAlBackend(evento,mail){
    const respuesta = await fetch('https://calendar-reminder-production.up.railway.app/enviar-recordatorio', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify ({evento,mail})
    });

    const datos = await respuesta.json();
    return datos;
}