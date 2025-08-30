const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("telemetry", (data) => {
    console.log("Dados recebidos:", data);
    // Pode salvar em banco ou repassar para o client.js
    io.emit("updateTelemetry", data);
  });
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
