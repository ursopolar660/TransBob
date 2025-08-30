// Conecta ao nosso servidor backend via Socket.io
const socket = io();

// --- SELEÇÃO DOS ELEMENTOS DO DOM ---
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

// --- VARIÁVEIS DE ESTADO E DADOS DO HISTÓRICO ---
let deliveryLog = [];
try {
    deliveryLog = JSON.parse(localStorage.getItem('ets2DeliveryLog')) || [];
} catch (e) {
    console.error("Erro ao carregar histórico.", e);
    deliveryLog = [];
}
let isJobActive = false;
let currentJobData = {};

// --- FUNÇÕES AUXILIARES ---
const saveDeliveryLog = () => {
    localStorage.setItem('ets2DeliveryLog', JSON.stringify(deliveryLog));
};

const renderDeliveryLog = () => {
    deliveryLogBody.innerHTML = '';
    [...deliveryLog].reverse().forEach(job => {
        const row = document.createElement('tr');
        const cargo = job.cargo;
        const source = job.sourceCity;
        const destination = job.destinationCity;
        const income = job.income?.toLocaleString('pt-BR');
        const timestamp = job.timestamp ? new Date(job.timestamp).toLocaleString('pt-BR') : 'N/A';
        row.innerHTML = `
            <td>${cargo}</td>
            <td>${source}</td>
            <td>${destination}</td>
            <td>€ ${income}</td>
            <td>${timestamp}</td>
        `;
        deliveryLogBody.appendChild(row);
    });
};

// --- LÓGICA PRINCIPAL DE TELEMETRIA ---
socket.on('telemetry-update', (data) => {
    // <<--- ESTA É A NOVA LÓGICA DE DETECÇÃO - A MAIS CONFIÁVEL DE TODAS ---
    const jobNowActive = data.navigation && data.navigation.estimatedDistance > 0;

    // Lógica de detecção de início e fim de entrega
    if (jobNowActive && !isJobActive ) {
        // Início de uma nova entrega
        console.log("%cINÍCIO DE ENTREGA DETECTADO!", "color: lightgreen;");
        currentJobData = {
            cargo: data.job?.cargoName,
            source: data.job?.sourceCity,
            destination: data.job?.destinationCity,
        };
    } else if (!jobNowActive && isJobActive) {
        // Fim de uma entrega
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


    // --- ATUALIZAÇÃO DO PAINEL EM TEMPO REAL ---
    if (data && data.truck) {
        const speedKph = data.truck.speed ?? 0;
        const engineRpm = data.truck.engineRpm ?? 0;
        const currentGear = data.truck.displayedGear ?? 0;
        const fuelValue = data.truck.fuel ?? 0;
        const fuelCapacity = data.truck.fuelCapacity ?? 1;
        speedElement.innerText = speedKph.toFixed(0);
        rpmElement.innerText = engineRpm.toFixed(0);
        fuelElement.innerText = fuelValue.toFixed(0);
        fuelPercentageElement.innerText = ((fuelValue / fuelCapacity) * 100).toFixed(1);
        if (currentGear === 0) gearElement.innerText = 'N';
        else if (currentGear < 0) gearElement.innerText = 'R';
        else gearElement.innerText = currentGear;
    } else {
        speedElement.innerText = '0';
        rpmElement.innerText = '0';
        gearElement.innerText = 'P';
        fuelElement.innerText = '0';
        fuelPercentageElement.innerText = '0';
    }
    const jobIncome = data.job.income;
    const estimatedDistance = data.navigation.estimatedDistance;
    sourceCityElement.innerText = data.job.sourceCity;
    destinationCityElement.innerText = data.job.destinationCity;
    jobIncomeElement.innerText = jobIncome.toLocaleString('pt-BR');
    if (estimatedDistance > 0) {
        estimatedDistanceElement.innerText = (estimatedDistance / 1000).toFixed(1);
    } else {
        estimatedDistanceElement.innerText = '0';
    }
});

// --- INICIALIZAÇÃO ---
renderDeliveryLog();