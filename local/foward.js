const http = require('http');
const fetch = require('node-fetch');
const https = require('https');

// O URL da sua aplicação no Render.com - Verifique se está correto
const REMOTE_SERVER = 'https://transbob.onrender.com';
const PORT = 3000;

// Agente para forçar conexão direta (mantém a correção anterior)
const httpsAgent = new https.Agent({
  keepAlive: true,
});

async function forwardData(data) {
    // CORREÇÃO: Enviar dados para o endpoint específico /telemetry
    const telemetryUrl = `${REMOTE_SERVER}/telemetry`; 
    try {
        console.log(`Encaminhando dados para: ${telemetryUrl}`);
        const response = await fetch(telemetryUrl, { // URL corrigido
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            agent: httpsAgent 
        });

        if (!response.ok) {
            console.error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
        } else {
            console.log("Dados encaminhados com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao encaminhar dados:", error);
    }
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                console.log("Dados recebidos do jogo.");
                forwardData(JSON.parse(body));
                res.end('ok');
            } catch(e) {
                console.error("Erro ao processar dados do jogo:", e);
                res.end('error');
            }
        });
    } else {
        res.end('Use POST');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor local a encaminhar para ${REMOTE_SERVER} na porta ${PORT}`);
});