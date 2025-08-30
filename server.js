// Importa as bibliotecas necessárias
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fetch = require('node-fetch');

// Configuração do servidor
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000; // Render exige variável PORT

app.use(express.json());
app.use(express.static('public')); // arquivos estáticos (index.html, client.js etc.)

// URL do servidor de telemetria do ETS2 (se quiser buscar direto)
const TELEMETRY_URL = 'http://127.0.0.1:25555/api/ets2/telemetry';

// Últimos dados recebidos (via update ou busca direta)
let latestTelemetry = {};

// ----------- ROTAS DE API -----------

// Endpoint para receber dados enviados do script local
app.post('/update', (req, res) => {
    latestTelemetry = req.body;
    console.log('Dados recebidos do cliente local.');
    res.json({ status: 'ok' });
});

// Endpoint público para consultar os dados atuais
app.get('/telemetry', (req, res) => {
    res.json(latestTelemetry);
});

// ----------- SOCKET.IO -----------

// Se quiser emitir em tempo real para os clientes conectados
io.on('connection', (socket) => {
    console.log('Painel conectado!');

    // Envia dados a cada 500ms
    const interval = setInterval(async () => {
        // Se tiver dados do script local, usa eles
        if (latestTelemetry && Object.keys(latestTelemetry).length > 0) {
            socket.emit('telemetry-update', latestTelemetry);
        } else {
            // (opcional) busca direto do ETS2 se estiver rodando local
            try {
                const response = await fetch(TELEMETRY_URL);
                if (response.ok) {
                    const data = await response.json();
                    socket.emit('telemetry-update', data);
                }
            } catch (err) {
                console.error('Erro ao buscar dados diretos:', err.message);
            }
        }
    }, 500);

    socket.on('disconnect', () => {
        console.log('Painel desconectado.');
        clearInterval(interval);
    });
});

// ----------- INÍCIO DO SERVIDOR -----------

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
