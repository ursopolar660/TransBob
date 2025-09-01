const getTelemetry = require('./telemetry-client.js'); // Ou './Telemetry.js', dependendo do nome real
const fetch = require('node-fetch');

const REMOTE_TELEMETRY_ENDPOINT = 'https://transbob.onrender.com'; // Ajuste o URL do Render

async function sendTelemetry() {
  const data = await getTelemetry();
  if (data) {
    console.log('📊 [Poller] Dados de telemetria obtidos:', data);
    try {
      const response = await fetch(REMOTE_TELEMETRY_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      if (response.ok) {
        console.log('✅ [Poller] Dados enviados com sucesso!');
      } else {
        console.error('❌ [Poller] Falha ao enviar:', response.status);
      }
    } catch (error) {
      console.error('❌ [Poller] Erro de rede:', error.message);
    }
  } else {
    console.log('⚠️ [Poller] Sem dados de telemetria. Jogo rodando e SDK ativo?');
  }
}

// Polling a cada 1 segundo
setInterval(sendTelemetry, 1000);

// Inicie imediatamente
sendTelemetry();