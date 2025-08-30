const io = require("socket.io-client");
const getTelemetry = require("./telemetry-client");

// Substitua pelo domínio da sua aplicação no Render
const renderSocket = io("https://transbob.onrender.com");

async function sendData() {
    const data = await getTelemetry();
    if (data) {
        renderSocket.emit("telemetry", data);
        console.log("Dados enviados para Render:", data);
    }
}

setInterval(sendData, 1000); // envia a cada 1s
