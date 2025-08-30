const axios = require("axios");
const io = require("socket.io-client");

// Conecta no servidor do Render
const socket = io("https://transbob.onrender.com");

setInterval(async () => {
  try {
    const res = await axios.get("http://127.0.0.1:25555/api/ets2/telemetry");
    socket.emit("telemetry", res.data);
  } catch (err) {
    console.log("Erro ao buscar dados locais:", err.message);
  }
}, 1000);
