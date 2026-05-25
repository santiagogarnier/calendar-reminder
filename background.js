chrome.runtime.onInstalled.addListener(async({reason}) => {
    if(reason != 'install') return;

//Alarma que dispara cada 24 horas
  await  chrome.alarms.create("revisar-calendario"), {
        periodInMinutes: 1440
    }
})

//Cuando la alarma se dispara, ejecutar la funcion principal
chrome.alarms.onAlarm.addListener((alarm)=>{
    if(alarm.name === "revisar-calendario"){
        revisarCalendario();
    } 
})

async function revisarCalendario() {
  console.log("Revisando calendario...");
}
