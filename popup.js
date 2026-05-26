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