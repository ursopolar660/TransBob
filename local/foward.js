const http = require('http');
const fetch = require('node-fetch');

// ❗ MUITO IMPORTANTE: Verifique se este URL está correto!
const REMOTE_SERVER_URL = 'https://transbob.onrender.com';
const TELEMETRY_ENDPOINT = `${REMOTE_SERVER_URL}/telemetry`;
const LOCAL_PORT = 3000;

async function forwardData(data) {
  try {
    console.log(`➡️  [Forwarder] A tentar enviar dados para: ${TELEMETRY_ENDPOINT}`);
    const response = await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      // Timeout de 10 segundos para evitar que fique preso
      timeout: 10000 
    });

    if (response.ok) {
      console.log(`✅ [Forwarder] Dados enviados com sucesso! Status: ${response.status}`);
    } else {
      const errorText = await response.text();
      console.error(`❌ [Forwarder] Falha ao enviar dados. O servidor respondeu com status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ [Forwarder] Erro crítico de rede ao tentar enviar dados:`, error.message);
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('---');
      console.log('🚚 [Forwarder] Dados recebidos do plugin do jogo!');
      try {
        const jsonData = JSON.parse(body);
        forwardData(jsonData);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
      } catch (e) {
        console.error('❌ [Forwarder] Erro: Os dados recebidos do jogo não são um JSON válido.', e);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('error: invalid json');
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed. Use POST.');
  }
});

server.listen(LOCAL_PORT, () => {
  console.log('================================================================');
  console.log(`🚀 [Forwarder] Servidor local iniciado.`);
  console.log(`👂 A ouvir por dados do jogo na porta ${LOCAL_PORT}.`);
  console.log(`📡 A reencaminhar para ${REMOTE_SERVER_URL}`);
  console.log('================================================================');
  console.log('Pode iniciar o jogo. Deixe esta janela aberta.');
});