// Importa as bibliotecas necessárias
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fetch = require('node-fetch');

// Configuração do servidor
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000; // Porta onde nosso painel vai rodar

// URL do servidor de telemetria do ETS2
const TELEMETRY_URL = 'http://192.168.18.59:25555/api/ets2/telemetry';

// Servir os arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Função para buscar os dados de telemetria
const getTelemetryData = async () => {
    try {
        const response = await fetch(TELEMETRY_URL);
        if (!response.ok) {
            // Se o jogo não estiver aberto, o servidor de telemetria pode não responder
            // console.error('ETS2 Telemetry Server não está respondendo. O jogo está aberto?');
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        // console.error('Erro ao buscar dados de telemetria:', error.message);
        return null;
    }
};

// Lógica de comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Painel conectado!');

    // A cada 100ms, busca os dados e envia para o frontend
    const interval = setInterval(async () => {
        const data = await getTelemetryData();
        if (data) {
            // Emite um evento 'telemetry-update' com os dados para o cliente
            socket.emit('telemetry-update', data);
        }
    }, 100); // Intervalo de atualização (100ms = 10x por segundo)

    socket.on('disconnect', () => {
        console.log('Painel desconectado.');
        clearInterval(interval); // Para o loop quando o cliente se desconecta
    });
});

// Inicia o servidor
server.listen(PORT, () => {
    console.log(`Seu painel de telemetria está rodando em http://localhost:${PORT}`);
});