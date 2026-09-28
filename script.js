document.addEventListener("DOMContentLoaded", () => {
    initPointConverter();
    initPolarCanvas();
});

/* ===================================================
   MÓDULO 1: CONVERTIDOR DE PUNTOS
   =================================================== */
function initPointConverter() {
    const inputR = document.getElementById("p-r");
    const inputTheta = document.getElementById("p-theta");
    const outputDiv = document.getElementById("step-point-output");

    function update() {
        const r = parseFloat(inputR.value) || 0;
        const thetaDeg = parseFloat(inputTheta.value) || 0;
        const thetaRad = (thetaDeg * Math.PI) / 180;

        const x = r * Math.cos(thetaRad);
        const y = r * Math.sin(thetaRad);

        outputDiv.innerHTML = `
            <p><strong>1. Conversión de Ángulo:</strong> \\(\\theta = ${thetaDeg}^\\circ = ${thetaRad.toFixed(4)}\\text{ rad}\\)</p>
            <p><strong>2. Componente x:</strong> \\(x = ${r} \\cdot \\cos(${thetaDeg}^\\circ) = \\mathbf{${x.toFixed(4)}}\\)</p>
            <p><strong>3. Componente y:</strong> \\(y = ${r} \\cdot \\sin(${thetaDeg}^\\circ) = \\mathbf{${y.toFixed(4)}}\\)</p>
            <p style="margin-top:0.5rem; color: #0369a1;"><strong>Resultado en Cartesiana:</strong> \\(P(${x.toFixed(2)}, ${y.toFixed(2)})\\)</p>
        `;

        if (window.renderMathInElement) {
            renderMathInElement(outputDiv);
        }
    }

    inputR.addEventListener("input", update);
    inputTheta.addEventListener("input", update);
    update();
}

/* ===================================================
   MÓDULO 2: LABORATORIO INTERACTIVO (CANVAS)
   =================================================== */
function initPolarCanvas() {
    const canvas = document.getElementById("polarCanvas");
    const ctx = canvas.getContext("2d");

    const selectCurve = document.getElementById("curveType");
    const inputA = document.getElementById("paramA");
    const inputB = document.getElementById("paramB");
    const inputN = document.getElementById("paramN");

    const valA = document.getElementById("valA");
    const valB = document.getElementById("valB");
    const valN = document.getElementById("valN");

    const groupB = document.getElementById("groupB");
    const groupN = document.getElementById("groupN");
    const curveDescription = document.getElementById("curveDescription");

    const scale = 35;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    function render() {
        const type = selectCurve.value;
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);
        const n = parseInt(inputN.value);

        valA.textContent = a;
        valB.textContent = b;
        valN.textContent = n;

        groupB.style.display = (type === "limacon") ? "flex" : "none";
        groupN.style.display = (type === "rose") ? "flex" : "none";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPolarGrid(ctx, cx, cy, scale);
        drawCurve(ctx, type, a, b, n, cx, cy, scale);
        updateDescription(type, a, b, n);
    }

    function drawPolarGrid(ctx, cx, cy, scale) {
        ctx.lineWidth = 1;

        for (let r = 1; r <= 7; r++) {
            ctx.beginPath();
            ctx.arc(cx, cy, r * scale, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
            ctx.stroke();

            ctx.fillStyle = "#94a3b8";
            ctx.font = "10px sans-serif";
            ctx.fillText(`r=${r}`, cx + r * scale + 2, cy - 4);
        }

        for (let angle = 0; angle < 360; angle += 30) {
            const rad = (angle * Math.PI) / 180;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(rad) * 280, cy - Math.sin(rad) * 280);
            ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(canvas.width, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, canvas.height);
        ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function drawCurve(ctx, type, a, b, n, cx, cy, scale) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#38bdf8"; // Color de la gráfica (Azul claro de alto contraste)

        let maxTheta = 2 * Math.PI;
        if (type === "spiral") maxTheta = 6 * Math.PI;

        const step = 0.01;
        let firstPoint = true;

        for (let theta = 0; theta <= maxTheta; theta += step) {
            let r = 0;
            let validPoint = true;

            switch (type) {
                case "rose":
                    r = a * Math.cos(n * theta);
                    break;
                case "limacon":
                    r = a + b * Math.cos(theta);
                    break;
                case "spiral":
                    r = a * theta * 0.3;
                    break;
                case "lemniscate":
                    const val = Math.cos(2 * theta);
                    if (val >= 0) {
                        r = a * Math.sqrt(val);
                    } else {
                        validPoint = false;
                    }
                    break;
            }

            if (validPoint) {
                const x = cx + r * Math.cos(theta) * scale;
                const y = cy - r * Math.sin(theta) * scale;

                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            } else {
                firstPoint = true;
            }
        }
        ctx.stroke();
    }

    function updateDescription(type, a, b, n) {
        let desc = "";
        switch (type) {
            case "rose":
                const petalos = (n % 2 === 0) ? 2 * n : n;
                desc = `<strong>Rosa Polar:</strong> Con \\(n = ${n}\\), la curva presenta <strong>${petalos} pétalos</strong>. El parámetro \\(a = ${a}\\) fija la longitud máxima de los pétalos.`;
                break;
            case "limacon":
                const ratio = Math.abs(a / b).toFixed(2);
                let tipoCaracol = "";
                if (a === b) tipoCaracol = "Cardioide (forma de corazón con cúspide en el origen).";
                else if (a < b) tipoCaracol = "Caracol con lazo o bucle interno.";
                else if (a > b && a < 2*b) tipoCaracol = "Caracol con hendidura o hoyuelo.";
                else tipoCaracol = "Caracol convexo.";

                desc = `<strong>Caracol/Cardioide:</strong> Razón \\(\\frac{a}{b} = ${ratio}\\). Tipo: <strong>${tipoCaracol}</strong>`;
                break;
            case "spiral":
                desc = `<strong>Espiral de Arquímedes:</strong> El radio \\(r\\) crece proporcionalmente con el ángulo \\(\\theta\\). La separación angular constante es de \\(2\\pi a\\).`;
                break;
            case "lemniscate":
                desc = `<strong>Lemniscata:</strong> Curva en forma de infinito ('8'). La distancia máxima desde el origen a los extremos es \\(r_{máx} = a = ${a}\\).`;
                break;
        }

        curveDescription.innerHTML = desc;
        if (window.renderMathInElement) {
            renderMathInElement(curveDescription);
        }
    }

    selectCurve.addEventListener("change", render);
    inputA.addEventListener("input", render);
    inputB.addEventListener("input", render);
    inputN.addEventListener("input", render);

    render();
}