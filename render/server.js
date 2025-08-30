const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors"); // Importa o CORS

const app = express();
const server = http.createServer(app);

// Configuração do Socket.IO com CORS para aceitar qualquer conexão
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- Middlewares ---
app.use(cors()); // Usa o middleware do CORS para as rotas HTTP
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(express.static(path.join(__dirname, "public"))); // Serve os ficheiros estáticos

// --- Rota Principal ---
// Garante que o seu index.html é sempre servido
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Rota para Receber Telemetria ---
// O seu script local (foward.js) vai enviar os dados para cá
app.post("/telemetry", (req, res) => {
  const telemetryData = req.body;
  console.log("✅ [Render Server] Dados de telemetria recebidos via POST:", telemetryData);

  // Envia os dados para todos os clientes conectados no painel
  io.emit("updateTelemetry", telemetryData);

  // Responde ao foward.js que deu tudo certo
  res.status(200).send({ status: "OK", message: "Data received" });
});

// --- Lógica do Socket.IO ---
io.on("connection", (socket) => {
  console.log(`✅ [Render Server] Um cliente conectou-se ao painel! ID: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ [Render Server] Cliente ${socket.id} desconectou-se.`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 [Render Server] Servidor iniciado e a ouvir na porta ${PORT}`));