require('dotenv').config();
const { google } = require('googleapis');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Backend funcionando');
})

const Anthropic = require('@anthropic-ai/sdk');
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
   'https://developers.google.com/oauthplayground'  
);

oauth2Client.setCredentials({
  refresh_token:process.env.GMAIL_REFRESH_TOKEN
})

const client = new Anthropic();

app.post('/enviar-recordatorio', async (req, res) => {
  const { evento, email } = req.body;

  try {
    const mensaje = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Sos un asistente que ayuda a las personas a prepararse para sus eventos importantes. 
          El usuario tiene este evento próximo: "${evento.summary}" el día ${evento.start}.
          Escribí un mail corto y amigable preguntándole cómo viene con la preparación para ese evento. 
          Solo el cuerpo del mail, sin asunto.`
        }
      ]
    });

    const textoDeMail = mensaje.content[0].text;
    await enviarMail(
      email,
      `Recordatorio: ${evento.summary}`,
      textoDeMail
    )
    console.log('Mail generado:', textoDeMail);

    res.json({ ok: true, mensaje: textoDeMail });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

async function enviarMail(destinatario, asunto, cuerpo) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const mensaje = [
    `To: ${destinatario}`,
    `Subject: ${asunto}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    cuerpo
  ].join('\n');

  const mensajeCodificado = Buffer.from(mensaje).toString('base64');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: mensajeCodificado
    }
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})