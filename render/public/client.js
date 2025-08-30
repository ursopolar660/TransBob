// Conecta ao servidor backend via Socket.io
const socket = io();

// --- ELEMENTOS DO DOM ---
const speedElement = document.getElementById('speed');
const rpmElement = document.getElementById('rpm');
const gearElement = document.getElementById('gear');
const fuelElement = document.getElementById('fuel');
const fuelPercentageElement = document.getElementById('fuelPercentage');
const sourceCityElement = document.getElementById('sourceCity');
const destinationCityElement = document.getElementById('destinationCity');
const estimatedDistanceElement = document.getElementById('estimatedDistance');
const jobIncomeElement = document.getElementById('jobIncome');
const deliveryLogBody = document.getElementById('delivery-log-body');

// --- VARIÁVEIS DE ESTADO ---
let deliveryLog = [];
try {
    deliveryLog = JSON.parse(localStorage.getItem('ets2DeliveryLog')) || [];
} catch (e) {
    console.error("Erro ao carregar histórico:", e);
}
let isJobActive = false;
let currentJobData = {};

// --- FUNÇÕES AUXILIARES ---
const saveDeliveryLog = () => localStorage.setItem('ets2DeliveryLog', JSON.stringify(deliveryLog));

const renderDeliveryLog = () => {
    deliveryLogBody.innerHTML = '';
    [...deliveryLog].reverse().forEach(job => {
        const row = document.createElement('tr');
        const timestamp = job.timestamp ? new Date(job.timestamp).toLocaleString('pt-BR') : 'N/A';
        row.innerHTML = `
            <td>${job.cargo}</td>
            <td>${job.sourceCity}</td>
            <td>${job.destinationCity}</td>
            <td>€ ${job.income?.toLocaleString('pt-BR')}</td>
            <td>${timestamp}</td>
        `;
        deliveryLogBody.appendChild(row);
    });
};

// --- ATUALIZAÇÃO DO PAINEL ---
const updateTelemetryUI = (data) => {
    if (!data) return;

    const jobNowActive = data.navigation?.estimatedDistance > 0;

    // Detecta início/fim de entrega
    if (jobNowActive && !isJobActive) {
        console.log("%cINÍCIO DE ENTREGA DETECTADO!", "color: lightgreen;");
        currentJobData = {
            cargo: data.job.cargoName,
            sourceCity: data.job.sourceCity,
            destinationCity: data.job.destinationCity
        };
    } else if (!jobNowActive && isJobActive) {
        console.log("%cFIM DE ENTREGA DETECTADO! Salvando...", "color: red;");
        const finishedJob = {
            ...currentJobData,
            income: data.truck.lastJobIncome ?? 0,
            timestamp: new Date().toISOString()
        };
        deliveryLog.push(finishedJob);
        saveDeliveryLog();
        renderDeliveryLog();
        currentJobData = {};
    }
    isJobActive = jobNowActive;

    // Atualiza painel em tempo real
    if (data.truck) {
        const { speed = 0, engineRpm = 0, displayedGear = 0, fuel = 0, fuelCapacity = 1 } = data.truck;
        speedElement.innerText = speed.toFixed(0);
        rpmElement.innerText = engineRpm.toFixed(0);
        fuelElement.innerText = fuel.toFixed(0);
        fuelPercentageElement.innerText = ((fuel / fuelCapacity) * 100).toFixed(1);

        if (displayedGear === 0) gearElement.innerText = 'N';
        else if (displayedGear < 0) gearElement.innerText = 'R';
        else gearElement.innerText = displayedGear;
    } else {
        speedElement.innerText = '0';
        rpmElement.innerText = '0';
        gearElement.innerText = 'P';
        fuelElement.innerText = '0';
        fuelPercentageElement.innerText = '0';
    }

    // Atualiza dados do job
    sourceCityElement.innerText = data.job?.sourceCity ?? '-';
    destinationCityElement.innerText = data.job?.destinationCity ?? '-';
    jobIncomeElement.innerText = (data.job?.income ?? 0).toLocaleString('pt-BR');
    estimatedDistanceElement.innerText = data.navigation?.estimatedDistance
        ? (data.navigation.estimatedDistance / 1000).toFixed(1)
        : '0';
};

// --- SOCKET ---
// CORREÇÃO AQUI: Alterado de 'telemetry-update' para 'updateTelemetry'
socket.on('updateTelemetry', updateTelemetryUI);

// --- FALLBACK: API ---
// Observação: seu server.js não possui a rota "/telemetry", então este fallback não funcionará.
// A comunicação principal deve ocorrer via Socket.io.
async function fallbackFetch() {
    try {
        const res = await fetch("/telemetry");
        if (!res.ok) return;
        const data = await res.json();
        updateTelemetryUI(data);
    } catch (err) {
        // console.warn("Falha no fallback /telemetry:", err); // Opcional: descomente para ver o erro no console
    }
}
setInterval(fallbackFetch, 2000);

// --- INICIALIZAÇÃO ---
renderDeliveryLog();