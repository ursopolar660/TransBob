// Simulação de leitura do Telemetry Server ETS2
// Substitua pelo SDK real do ETS2
const fetch = require('node-fetch');

async function getTelemetry() {
    try {
        const res = await fetch('http://127.0.0.1:25555/api/ets2/telemetry');
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("Erro ao pegar telemetria:", err.message);
        return null;
    }
}

module.exports = getTelemetry;
