const io = require("socket.io-client");

// Substitua pelo domínio da sua aplicação no Render
const renderSocket = io("https://transbob.onrender.com");

const localSocket = io("http://localhost:3000");

localSocket.on("telemetry", (data) => {
    renderSocket.emit("telemetry", data);
});
