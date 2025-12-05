// --- CONFIGURACIÓN ---
const POINT_NAMES = [
    "Pupila izquierda", "Pupila derecha", "Borde interno ojo izquierdo",
    "Borde externo ojo izquierdo", "Borde interno ojo derecho", "Borde externo ojo derecho",
    "Fosa nasal izquierda", "Fosa nasal derecha", "Base nasal (parte baja)", "Entrecejo / glabella",
    "Comisura izquierda", "Comisura derecha", "Pómulo izquierdo", "Pómulo derecho",
    "Mandíbula izquierda", "Mandíbula derecha", "Parte superior del labio superior",
    "Parte inferior del labio inferior", "Mentón (punto más bajo)", "Parte izquierda del mentón",
    "Parte derecha del mentón", "Hairline / línea del cabello"
];
const NUM_POINTS = POINT_NAMES.length;

// --- ESTRUCTURAS DE DATOS ---
let currentPointIndex = 0;
const points = []; // Almacena {x, y} de los puntos marcados
const image = document.getElementById('faceImage');
const container = document.getElementById('imageContainer');
const instruction = document.getElementById('instruction');
const calculateButton = document.getElementById('calculateButton');
const metricsOutput = document.getElementById('metricsOutput');
const downloadCSVButton = document.getElementById('downloadCSV');
let calculatedMetrics = [];

// --- MANEJADORES DE EVENTOS ---

// 1. Carga de imagen
document.getElementById('imageUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            image.src = e.target.result;
            image.style.display = 'block';
            resetPoints();
            updateInstruction();
        };
        reader.readAsDataURL(file);
    }
});

// 2. Colocación de puntos
container.addEventListener('click', (event) => {
    if (currentPointIndex >= NUM_POINTS || image.style.display === 'none') return;

    // Calcula la posición relativa al contenedor
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Guarda el punto (coordenadas relativas a la imagen para escalabilidad)
    const relativeX = x / image.offsetWidth;
    const relativeY = y / image.offsetHeight;
    points.push({ x: relativeX, y: relativeY });

    // Dibuja el punto
    drawPoint(x, y, currentPointIndex + 1);

    currentPointIndex++;
    updateInstruction();

    if (currentPointIndex === NUM_POINTS) {
        calculateButton.disabled = false;
        instruction.textContent = "¡22 puntos colocados! Haz clic en CALCULAR.";
    }
});

// 3. Botón de Cálculo
calculateButton.addEventListener('click', calculateAllMetrics);

// 4. Descarga CSV
downloadCSVButton.addEventListener('click', downloadCSV);

// --- FUNCIONES DE UTILIDAD ---

function resetPoints() {
    currentPointIndex = 0;
    points.length = 0; // Vacía el array
    container.querySelectorAll('.point').forEach(p => p.remove()); // Elimina puntos visuales
    calculateButton.disabled = true;
    metricsOutput.innerHTML = '';
    downloadCSVButton.style.display = 'none';
}

function updateInstruction() {
    if (currentPointIndex < NUM_POINTS) {
        instruction.textContent = `Punto ${currentPointIndex + 1} de ${NUM_POINTS}: Coloca ${POINT_NAMES[currentPointIndex]}`;
    }
}

function drawPoint(x, y, number) {
    const pointDiv = document.createElement('div');
    pointDiv.className = 'point';
    pointDiv.style.left = `${x}px`;
    pointDiv.style.top = `${y}px`;
    pointDiv.textContent = number;
    container.appendChild(pointDiv);
}

// Retorna las coordenadas absolutas (en píxeles) del punto N
function getCoords(n) {
    const p = points[n - 1];
    return {
        x: p.x * image.offsetWidth,
        y: p.y * image.offsetHeight
    };
}

// Distancia euclidiana entre dos puntos {x, y}
function dist(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// --- FÓRMULAS DE CÁLCULO ---

// ❗️ Notación: Pn se refiere al punto en la lista, por ejemplo, P1 = Pupila izquierda.

function calculateAllMetrics() {
    calculatedMetrics = [];
    if (points.length < NUM_POINTS) return;

    // Midface ratio (1)
    const P1 = getCoords(1); // Pupila izquierda
    const P2 = getCoords(2); // Pupila derecha
    const P17 = getCoords(17); // Superior labio sup

    // Línea pupilar (recta horizontal entre P1 y P2)
    // Usaremos el promedio de Y de las pupilas como la "línea" vertical
    const midface_line_Y = (P1.y + P2.y) / 2;
    const altura_midface = Math.abs(midface_line_Y - P17.y);
    const inter_pupilar_dist = dist(P1, P2);
    const midface_ratio = altura_midface / inter_pupilar_dist;
    calculatedMetrics.push(calculateScore(15, 1.00, midface_ratio, "Midface ratio"));

    // FWHR (2)
    const P13 = getCoords(13); // Pómulo izq
    const P14 = getCoords(14); // Pómulo der
    const P10 = getCoords(10); // Entrecejo / glabella
    const P17_FWHR_Y = P17.y; // Usamos Y de labio sup para la distancia vertical

    const width = dist(P13, P14);
    const height_FWHR = Math.abs(P10.y - P17_FWHR_Y); // Distancia vertical entre entrecejo y labio sup
    const fwhr = width / height_FWHR;
    calculatedMetrics.push(calculateScore(10, 1.99, fwhr, "FWHR"));

    // Face height (3)
    const P22 = getCoords(22); // Hairline
    const P19 = getCoords(19); // Mentón (punto más bajo)

    const face_height_val = dist(P22, P19);
    const face_height_ratio = face_height_val / width; // width es la distancia inter-pómulos (ya calculada)
    calculatedMetrics.push(calculateScore(8, 1.37, face_height_ratio, "Face height"));

    // E.S ratio (4)
    const es_ratio = inter_pupilar_dist / width; // inter_pupilar_dist y width ya calculadas
    calculatedMetrics.push(calculateScore(7, 0.46, es_ratio, "E.S ratio"));

    // Jaw width (5)
    const P15 = getCoords(15); // Mandíbula izq
    const P16 = getCoords(16); // Mandíbula der

    const jaw_width_val = dist(P15, P16);
    const jaw_width_ratio = jaw_width_val / width; // width es la distancia inter-pómulos
    calculatedMetrics.push(calculateScore(12, 0.94, jaw_width_ratio, "Jaw width"));

    // Nose length to height (6)
    const P9 = getCoords(9); // Base nasal
    const nose_length = dist(P10, P9); // Entrecejo a base nasal
    const P7 = getCoords(7); // Fosa nasal izq
    const P8 = getCoords(8); // Fosa nasal der
    const nose_width = dist(P7, P8);

    const nose_length_height_ratio = nose_length / nose_width;
    calculatedMetrics.push(calculateScore(6, 1.45, nose_length_height_ratio, "Nose length to width"));

    // Nose width (7)
    const nose_width_ratio = nose_width / width; // width es la distancia inter-pómulos
    calculatedMetrics.push(calculateScore(6, 0.25, nose_width_ratio, "Nose width"));

    // Nose–lips (8)
    const P11 = getCoords(11); // Comisura izq
    const P12 = getCoords(12); // Comisura der

    const lip_width = dist(P11, P12);
    const nose_lips_ratio = lip_width / nose_width; // nose_width ya calculada
    calculatedMetrics.push(calculateScore(5, 1.55, nose_lips_ratio, "Nose-Lips Ratio"));

    // Nose = Chin (9)
    const P20 = getCoords(20); // Parte izquierda del mentón
    const P21 = getCoords(21); // Parte derecha del mentón

    const chin_width = dist(P20, P21);
    const nose_chin_ratio = nose_width / chin_width;
    calculatedMetrics.push(calculateScore(8, 1.00, nose_chin_ratio, "Nose = Chin Ratio"));

    // Chin to philtrum (10)
    const P18 = getCoords(18); // Inferior labio inferior

    const largo_menton = dist(P19, P18); // Mentón a labio inferior
    const filtrum = dist(P17, P9); // Labio superior a base nasal
    const chin_philtrum_ratio = largo_menton / filtrum;
    calculatedMetrics.push(calculateScore(10, 2.40, chin_philtrum_ratio, "Chin to Philtrum"));

    // One-eye distance (11) - Cálculo especial, no es ratio simple
    const P4 = getCoords(4); // Borde ext izq
    const P3 = getCoords(3); // Borde int izq
    const P6 = getCoords(6); // Borde ext der
    const P5 = getCoords(5); // Borde int der

    const eye_L = dist(P4, P3);
    const inter = dist(P3, P5); // Asumiendo 'inter' es la distancia entre bordes internos
    const eye_R = dist(P6, P5);

    // Para el 1:1:1, tomamos el promedio y calculamos la desviación de cada uno respecto al promedio
    const avg_eye_dim = (eye_L + inter + eye_R) / 3;
    const deviations = [
        (Math.abs(eye_L - avg_eye_dim) / avg_eye_dim) * 100,
        (Math.abs(inter - avg_eye_dim) / avg_eye_dim) * 100,
        (Math.abs(eye_R - avg_eye_dim) / avg_eye_dim) * 100
    ];
    // Usamos el promedio de las desviaciones para el cálculo del puntaje
    const avg_deviation = (deviations[0] + deviations[1] + deviations[2]) / 3;
    // La métrica "observada" es la desviación promedio, el ideal es 0%
    calculatedMetrics.push(calculateScore(13, 0.00, avg_deviation, "One-eye distance (1:1:1)", true, [eye_L, inter, eye_R]));

    displayResults();
}

function calculateScore(maxPoints, idealRatio, observedValue, metricName, isDeviationMetric = false, rawValues = null) {
    let deviation, finalScore;
    let observedDisplay;

    if (isDeviationMetric) {
        // Para la métrica 11, observedValue es la desviación promedio (%)
        deviation = observedValue; // La desviación ya está en %
        observedDisplay = rawValues ? `(${rawValues[0].toFixed(2)} : ${rawValues[1].toFixed(2)} : ${rawValues[2].toFixed(2)})` : `${observedValue.toFixed(2)}%`;
    } else {
        // Métricas de ratio (1-10)
        deviation = Math.abs(observedValue - idealRatio) / idealRatio * 100;
        observedDisplay = observedValue.toFixed(2);
    }
    
    // Calcula la reducción de puntos
    const reduction = maxPoints * (deviation / 100);
    finalScore = maxPoints - reduction;
    
    // Asegura que el puntaje no sea negativo
    if (finalScore < 0) finalScore = 0;

    const result = {
        name: metricName,
        maxPoints: maxPoints,
        ideal: idealRatio,
        observed: observedDisplay,
        deviation: deviation.toFixed(2),
        score: finalScore.toFixed(2)
    };
    return result;
}

function displayResults() {
    let html = '';
    let totalScore = 0;
    let totalMaxPoints = 0;
    
    calculatedMetrics.forEach(metric => {
        totalScore += parseFloat(metric.score);
        totalMaxPoints += metric.maxPoints;

        html += `
            <div class="metric-detail">
                <h3>${metric.name}</h3>
                <p><strong>Valor Ideal:</strong> ${metric.ideal} | <strong>Valor Observado:</strong> ${metric.observed}</p>
                <p><strong>Puntos Máx:</strong> ${metric.maxPoints}</p>
                <p><strong>Desviación:</strong> ${metric.deviation}%</p>
                <p><strong>Puntaje Final:</strong> ${metric.score} / ${metric.maxPoints}</p>
                <p class="example-calc">
                    Ejemplo: Puntos total de ${metric.name} ${metric.maxPoints} puntos. El % de desviación es de ${metric.deviation}%. 
                    Cálculo: ${metric.maxPoints} - (${metric.maxPoints} × ${metric.deviation} / 100) = ${metric.score} puntos.
                </p>
            </div>
        `;
    });

    const overallScore = totalScore / calculatedMetrics.length;

    html += `
        <hr>
        <h2>✨ Puntaje Final de Armonía</h2>
        <p style="font-size: 1.5em; font-weight: bold;">
            Promedio de los 11 puntajes: ${overallScore.toFixed(2)}
        </p>
        <p>Total de Puntos Obtenidos: ${totalScore.toFixed(2)} / ${totalMaxPoints}</p>
    `;
    
    metricsOutput.innerHTML = html;
    downloadCSVButton.style.display = 'block';
}

function downloadCSV() {
    let csv = 'Métrica,Puntos Máx,Ideal,Observado,Desviación (%),Puntaje Final\n';

    calculatedMetrics.forEach(metric => {
        csv += `${metric.name},${metric.maxPoints},${metric.ideal},"${metric.observed}",${metric.deviation},${metric.score}\n`;
    });

    const totalScore = calculatedMetrics.reduce((sum, m) => sum + parseFloat(m.score), 0);
    const overallScore = totalScore / calculatedMetrics.length;
    
    csv += `\n,Promedio Final,,,${overallScore.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "analisis_armonia_facial.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inicializar la instrucción al cargar la página
updateInstruction();
