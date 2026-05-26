require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Backend funcionando');
})

const Anthropic = require('@anthropic-ai/sdk');
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
    console.log('Mail generado:', textoDeMail);

    res.json({ ok: true, mensaje: textoDeMail });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})