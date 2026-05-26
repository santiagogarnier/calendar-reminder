const btnLogin = document.getElementById("btn-login");
const status = document.getElementById("status");

//Usuario clickea el boton 
btnLogin.addEventListener("click",()=>{
    login();
})

function login(){
    chrome.identity.getAuthToken({"interactive": true},(token)=>{
        if(chrome.runtime.lastError){
            status.textContent = "Error al conectar: " + chrome.runtime.lastError.message;
            return;
        }

        status.textContent = "Conectado";
        console.log("Token obtenido", token);
    })
}