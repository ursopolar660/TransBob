const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path"); // Importa o módulo 'path'
const bodyParser = require('body-parser'); // Importa o body-parser

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- MIDDLEWARE ---
// Serve os ficheiros estáticos da pasta 'public' de forma segura
app.use(express.static(path.join(__dirname, "public")));
// Habilita o parsing de JSON no corpo das requisições
app.use(bodyParser.json());

// --- ROTA PARA RECEBER TELEMETRIA ---
// Agora os dados do jogo são enviados para /telemetry
app.post("/telemetry", (req, res) => {
    const data = req.body;
    console.log("Dados recebidos via POST:", data);
    io.emit("updateTelemetry", data); // Envia para os clientes conectados
    res.status(200).send("OK");
});

// --- SOCKET.IO ---
io.on("connection", (socket) => {
  console.log("Cliente conectado ao socket.io");
});

// Rota principal para servir o index.html (fallback)
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor a rodar na porta " + PORT));