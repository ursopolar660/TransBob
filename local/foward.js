const http = require('http');
const fetch = require('node-fetch');
const https = require('https'); // Adicione esta linha

// O URL da sua aplicação no Render.com
const REMOTE_SERVER = 'https://transbob-tg9l.onrender.com';
const PORT = 3000;

// Cria um agente HTTPS para forçar uma conexão direta
const httpsAgent = new https.Agent({
  keepAlive: true,
});

async function forwardData(data) {
    try {
        console.log(`Encaminhando dados para: ${REMOTE_SERVER}`);
        const response = await fetch(REMOTE_SERVER, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            agent: httpsAgent // Adicione esta linha para usar o agente direto
        });

        if (!response.ok) {
            console.error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
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