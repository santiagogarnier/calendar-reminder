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
        body: JSON.stringify({evento, email: 'santiagogarnier5@gmail.com'})
    });

    const datos = await respuesta.json();
    return datos;
}