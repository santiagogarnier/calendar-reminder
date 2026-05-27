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
        chrome.storage.local.set({ token: token });
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

