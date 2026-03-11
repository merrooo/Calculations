// ========== GLOBAL VARIABLES ==========
let selectedPeriod = "Aug-2024";

// ========== TAB SWITCHING ==========
function switchTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(content => content.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ========== SIDEBAR TOGGLE FOR MOBILE ==========
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// ========== SCROLL FUNCTIONS ==========
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// ========== MODAL FUNCTIONS ==========
function toggleEquations() {
    document.getElementById("equationModal").style.display = "block";
}

function closeModal() {
    document.getElementById("equationModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("equationModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// ========== ANGLES TAB FUNCTIONS ==========
const canvas = document.getElementById("circlePlot");
const ctx = canvas.getContext("2d");
const circleRadius = 200;

function drawArrow(cx, cy, angleDeg, r, color, label, isCurrent = false) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = isCurrent ? 3 : 2;
    ctx.stroke();

    const headlen = 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - headlen * Math.cos(rad - Math.PI / 6), y - headlen * Math.sin(rad - Math.PI / 6));
    ctx.lineTo(x - headlen * Math.cos(rad + Math.PI / 6), y - headlen * Math.sin(rad + Math.PI / 6));
    ctx.fillStyle = color;
    ctx.fill();

    ctx.font = "bold 14px Cairo";
    ctx.fillStyle = color;
    ctx.fillText(label, x + (12 * Math.cos(rad)), y + (12 * Math.sin(rad)));
}

function updateAngles() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(cx, cy, circleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    ctx.stroke();

    const theta = [
        parseFloat(document.getElementById('theta1').value) || 0,
        parseFloat(document.getElementById('theta2').value) || 0,
        parseFloat(document.getElementById('theta3').value) || 0
    ];

    const pfs = theta.map((t, i) => {
        const val = Math.cos(t * Math.PI / 180);
        const input = document.getElementById(`pf${i + 1}`);
        input.value = val.toFixed(3);
        input.style.color = val < 0.5 ? "red" : "green";
        input.setAttribute('readonly', true);
        input.setAttribute('aria-readonly', 'true');
        return val;
    });

    const vAngles = [0, 120, 240];
    vAngles.forEach((ang, i) => {
        drawArrow(cx, cy, ang, circleRadius - 10, "#ffd700", `V${i + 1}`);
        drawArrow(cx, cy, ang + theta[i], circleRadius - 40, "#0011ff", `I${i + 1}`, true);
    });

    const correctAngle = parseFloat(document.getElementById("correcttheta").value) || 0;
    const pfCorrectTotal = Math.cos(correctAngle * Math.PI / 180) * 3;

    const sumAbs = pfs.reduce((a, b) => a + Math.abs(b), 0);
    const mErr = pfCorrectTotal === 0 ? 0 : (1 - (sumAbs / pfCorrectTotal)) * 100;

    const sumPos = pfs.filter(v => v > 0).reduce((a, b) => a + b, 0);
    const imErr = pfCorrectTotal === 0 ? 0 : (1 - (sumPos / pfCorrectTotal)) * 100;

    document.getElementById("Mtheta").value = mErr.toFixed(2) + " %";
    document.getElementById("IMtheta").value = imErr.toFixed(2) + " %";
    
    document.getElementById("Mtheta").setAttribute('readonly', true);
    document.getElementById("IMtheta").setAttribute('readonly', true);

    const kwh = parseFloat(document.getElementById("EXkwh").value) || 0;
    const losses = (kwh * Math.abs(mErr)) / 100;
    document.getElementById("Losses").value = losses.toFixed(2) + " kWh";
    document.getElementById("Losses").setAttribute('readonly', true);
}

// ========== CALIBRATIONS TAB FUNCTIONS ==========
document.addEventListener('DOMContentLoaded', () => {
    const thetaInput = document.getElementById('theta_phase');
    const pfElem = document.getElementById('res_pf');
    const kwElem = document.getElementById('res_kw');
    const hpElem = document.getElementById('res_hp');
    const HP_TO_KW = 0.746;

    // Helper to get numeric values from spans
    const getVal = (el) => parseFloat(el.innerText.replace(/[^\d.-]/g, '')) || 0;

    // --- 1. Angle (Theta) Logic ---
    window.calculatePhase = function() {
        const degrees = parseFloat(thetaInput.value) || 0;
        const radians = degrees * (Math.PI / 180);
        const pf = Math.cos(radians);
        
        pfElem.innerText = pf.toFixed(3);
    };

    // --- 2. Power Factor (PF) Logic ---
    pfElem.addEventListener('input', () => {
        let pf = getVal(pfElem);
        
        // Validation: PF cannot exceed 1
        if (pf > 1) pf = 1;
        if (pf < -1) pf = -1; 

        // Reverse calculate Theta: arccos(PF)
        const radians = Math.acos(pf);
        const degrees = radians * (180 / Math.PI);
        
        thetaInput.value = degrees.toFixed(1);
    });

    // --- 3. Power Calculations (kW <-> HP) ---
    hpElem.addEventListener('input', () => {
        const hp = getVal(hpElem);
        const kw = hp * HP_TO_KW;
        kwElem.innerText = kw.toFixed(2);
    });

    kwElem.addEventListener('input', () => {
        const kw = getVal(kwElem);
        const hp = kw / HP_TO_KW;
        hpElem.innerText = hp.toFixed(2);
    });

    // --- 4. UX Improvements (Enter key & Blur) ---
    [pfElem, kwElem, hpElem].forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                el.blur();
            }
        });
    });

    // Clean up PF formatting on blur
    pfElem.addEventListener('blur', () => {
        let pf = getVal(pfElem);
        if (pf > 1) pf = 1.0;
        if (pf < 0) pf = 0.0; // Usually PF is positive in this context
        pfElem.innerText = pf.toFixed(3);
    });
});



function handlePhaseModeChange() {
    const mode = document.getElementById("phase_mode").value;
    const voltageInput = document.getElementById("v");
    voltageInput.value = mode === "3" ? "380" : "220";
    calculatePhase();
}

function calculatePhase() {
    const mode = document.getElementById("phase_mode").value;
    const thetaInput = document.getElementById("theta_phase");
    thetaInput.disabled = mode === "1";

    const v = parseFloat(document.getElementById("v").value) || 0;
    const i = parseFloat(document.getElementById("i").value) || 0;
    const thDeg = parseFloat(document.getElementById("theta_phase").value) || 0;
    const factor = mode === "3" ? Math.sqrt(3) : 1;
    const pf = Math.cos(thDeg * Math.PI / 180);
    const kw = (factor * v * i * pf) / 1000;

    document.getElementById("res_pf").innerText = pf.toFixed(3);
    document.getElementById("res_kw").innerText = kw.toFixed(2);
    document.getElementById("res_hp").innerText = (kw / 0.746).toFixed(2);

    const kc = parseFloat(document.getElementById("kwh_c").value) || 0;
    const kvc = parseFloat(document.getElementById("kvar_c").value) || 0;
    const tc = parseFloat(document.getElementById("t_c").value) || 0;

    if (tc > 0 && v > 0) {
        document.getElementById("cal_kw").innerText = ((60000 * kc) / (factor * v * pf * tc)).toFixed(1);
        document.getElementById("cal_kv").innerText = ((60000 * kvc) / (factor * v * Math.abs(Math.sin(thDeg * Math.PI / 180)) * tc)).toFixed(1);
    }
}

function calcAC() {
    const btu = parseFloat(document.getElementById("btu").value) || 0;
    const tons = parseFloat(document.getElementById("tons").value) || 0;
    const l = parseFloat(document.getElementById("l").value) || 0;
    const w = parseFloat(document.getElementById("w").value) || 0;
    const h = parseFloat(document.getElementById("h").value) || 0;
    let res = 0;

    if (btu > 0) res = btu / 8000;
    else if (tons > 0) res = tons * 1.5;
    else if (l > 0 && w > 0 && h > 0) res = (300 * l * w * h) / 12000;

    document.getElementById("ac_hp_res").innerText = res.toFixed(2);
}

function calcMeter() {
    const kCurr = parseFloat(document.getElementById("m_kwh_curr").value) || 0;
    const tCurr = parseFloat(document.getElementById("m_tt_curr").value) || 0;
    const tCurrBal = parseFloat(document.getElementById("m_t_curr").value) || 0;
    const tVal = parseFloat(document.getElementById("m_tariff").value) || 1;
    const kPrev = parseFloat(document.getElementById("m_kwh_prev").value) || 0;
    const tPrev = parseFloat(document.getElementById("m_tt_prev_val").value) || 0;
    const tPrevBal = parseFloat(document.getElementById("m_t_prev").value) || 0;

    const tt_sdiff = (tCurr - tCurrBal) - (tPrev - tPrevBal);
    const k_diff = kCurr - kPrev;
    const tt_kdiff = k_diff * tVal;
    const tttdiff = tt_sdiff - tt_kdiff;
    const kwh_sdiff = k_diff;
    const kwh_tts = tt_sdiff / tVal;
    const kwhtdiff = kwh_tts - kwh_sdiff;

    document.getElementById("out_tt_sdiff").innerText = tt_sdiff.toFixed(2);
    document.getElementById("out_tt_kdiff").innerText = tt_kdiff.toFixed(2);
    document.getElementById("out_tttdiff").innerText = tttdiff.toFixed(2);
    document.getElementById("out_kwh_sdiff").innerText = kwh_sdiff.toFixed(2);
    document.getElementById("out_kwh_tts").innerText = kwh_tts.toFixed(2);
    document.getElementById("out_kwhtdiff").innerText = kwhtdiff.toFixed(2);

    checkAlert("box_tttdiff", tttdiff, 1500);
    checkAlert("box_kwhtdiff", kwhtdiff, 500);
}

function checkAlert(elementId, value, threshold) {
    const element = document.getElementById(elementId);
    if (Math.abs(value) > threshold) {
        element.classList.add("alert-active");
    } else {
        element.classList.remove("alert-active");
    }
}

function resetCalibrations() {
    document.getElementById('v').value = '380';
    document.getElementById('i').value = '10';
    document.getElementById('theta_phase').value = '30';
    document.getElementById('kwh_c').value = '400';
    document.getElementById('kvar_c').value = '400';
    document.getElementById('t_c').value = '1';
    handlePhaseModeChange();
}

// ========== M&T TAB FUNCTIONS ==========
function calculateMT() {
    const avg = parseFloat(document.getElementById("avg_p").value) || 0;
    const max = parseFloat(document.getElementById("max_d").value) || 0;
    if (max > 0) {
        const lf = avg / max;
        document.getElementById("lf_res").value = lf.toFixed(4);
        document.getElementById("loss_res").value = (0.25 * lf + 0.75 * Math.pow(lf, 2)).toFixed(4);
    }

    const freq = parseFloat(document.getElementById("freq").value) || 0;
    const poles = parseFloat(document.getElementById("poles").value) || 0;
    const motorKw = parseFloat(document.getElementById("motor_kw").value) || 0;
    if (poles > 0) {
        const rpm = (freq / poles) * 120;
        document.getElementById("speed_res").value = rpm.toFixed(0);
        const torque = (rpm > 0) ? (9550 * motorKw) / rpm : 0;
        document.getElementById("torque_res").value = torque.toFixed(2);
    }

    const kva = parseFloat(document.getElementById("KVATR").value) || 0;
    const v1 = parseFloat(document.getElementById("VPR").value) || 0;
    const v2fl = parseFloat(document.getElementById("VSECFL").value) || 0;
    const v2nl = parseFloat(document.getElementById("VSECNL").value) || 0;
    const z = parseFloat(document.getElementById("impd").value) || 0;

    const i1 = (v1 > 0) ? (kva * 1000) / (Math.sqrt(3) * v1) : 0;
    const i2 = (v2fl > 0) ? (kva * 1000) / (Math.sqrt(3) * v2fl) : 0;

    const iscVal = (z > 0 && i2 > 0) ? (i2 / z * 100) / 1000 : 0;
    const tr = (v2fl > 0) ? v1 / v2fl : 0;
    const vr = (v2fl > 0) ? ((v2nl - v2fl) / v2fl) * 100 : 0;

    document.getElementById("IPR").value = i1.toFixed(2);
    document.getElementById("ISEC").value = i2.toFixed(2);
    document.getElementById("tr_res").value = tr.toFixed(2);
    document.getElementById("vr_perc").value = vr.toFixed(2) + "%";
    document.getElementById("isc_res").value = iscVal.toFixed(3);
}

function resetMT() {
    document.getElementById('avg_p').value = '880';
    document.getElementById('max_d').value = '978';
    document.getElementById('freq').value = '50';
    document.getElementById('poles').value = '4';
    document.getElementById('motor_kw').value = '100';
    document.getElementById('KVATR').value = '1000';
    document.getElementById('impd').value = '5';
    document.getElementById('VPR').value = '11000';
    document.getElementById('VSECFL').value = '380';
    document.getElementById('VSECNL').value = '400';
    calculateMT();
}

// ========== PF TAB FUNCTIONS ==========
function calculateCorrection() {
    const kwLoad = parseFloat(document.getElementById("kwh_in").value) || 0;
    const eff = (parseFloat(document.getElementById("eff_in").value) || 100) / 100;
    const v = parseFloat(document.getElementById("v_in").value) || 0;
    const hz = parseFloat(document.getElementById("hz_in").value) || 50;
    const cos1 = parseFloat(document.getElementById("cos_old_in").value) || 0;
    const cos2 = parseFloat(document.getElementById("cos_new_in").value) || 0;
    const mode = document.getElementById("phase_mode_pf").value;

    if (kwLoad > 0 && cos1 > 0 && cos2 > 0 && cos1 < 1) {
        const P = kwLoad / eff;
        const Q1 = P * Math.tan(Math.acos(cos1));
        const Q2 = P * Math.tan(Math.acos(cos2));
        const Qc = Math.max(0, Q1 - Q2);

        const s1 = P / cos1;
        const s2 = P / cos2;

        document.getElementById("s_old_res").value = s1.toFixed(1);
        document.getElementById("s_new_res").value = s2.toFixed(1);
        document.getElementById("q_cap_res").value = Qc.toFixed(1);

        let a1 = (mode === "3") ? (P * 1000) / (Math.sqrt(3) * v * cos1) : (P * 1000) / (v * cos1);
        let a2 = (mode === "3") ? (P * 1000) / (Math.sqrt(3) * v * cos2) : (P * 1000) / (v * cos2);
        document.getElementById("amp_old_res").value = a1.toFixed(1);
        document.getElementById("amp_new_res").value = a2.toFixed(1);

        const C = (Qc * 1000) / (2 * Math.PI * hz * v * v) * 1000000;
        document.getElementById("farad_ph_res").value = C.toFixed(1);

        updatePlot(P, Q1, Q2, s1, s2, Qc);
    }
}

function updatePlot(P, Q1, Q2, s1, s2, Qc) {
    const margin = 60;
    const chartW = 400;
    const chartH = 300;

    const scale = (P === 0) ? 1 : Math.min(chartW / P, chartH / (Q1 || 1));

    const x0 = margin, y0 = 340;
    const xP = x0 + (P * scale);
    const y1 = y0 - (Q1 * scale);
    const y2 = y0 - (Q2 * scale);

    document.getElementById("polyOld").setAttribute("points", `${x0},${y0} ${xP},${y0} ${xP},${y1}`);
    document.getElementById("polyNew").setAttribute("points", `${x0},${y0} ${xP},${y0} ${xP},${y2}`);

    const qLine = document.getElementById("qCapLine");
    qLine.setAttribute("x1", xP); qLine.setAttribute("y1", y1);
    qLine.setAttribute("x2", xP); qLine.setAttribute("y2", y2);

    const tKW = document.getElementById("txtKW");
    tKW.setAttribute("x", (x0 + xP) / 2); tKW.setAttribute("y", y0 + 15);
    tKW.textContent = P > 0 ? P.toFixed(1) + " kW" : "";

    const tS1 = document.getElementById("txtKVAOld");
    tS1.setAttribute("x", (x0 + xP) / 2 - 20); tS1.setAttribute("y", (y0 + y1) / 2 - 10);
    tS1.textContent = s1 > 0 ? s1.toFixed(1) + " kVA" : "";

    const tS2 = document.getElementById("txtKVANew");
    tS2.setAttribute("x", (x0 + xP) / 2 - 10); tS2.setAttribute("y", (y0 + y2) / 2 + 15);
    tS2.textContent = s2 > 0 ? s2.toFixed(1) + " kVA" : "";

    const tQC = document.getElementById("txtQC");
    tQC.setAttribute("x", xP + 10); tQC.setAttribute("y", (y1 + y2) / 2);
    tQC.textContent = Qc > 0 ? Qc.toFixed(1) + " kVAR" : "";
}

function calculatePenalty() {
    let kwh = (parseFloat(document.getElementById("kwh_curr").value) || 0) - (parseFloat(document.getElementById("kwh_prev").value) || 0);
    let kvarh = (parseFloat(document.getElementById("kvarh_curr").value) || 0) - (parseFloat(document.getElementById("kvarh_prev").value) || 0);
    let t = parseFloat(document.getElementById("tariffpf").value);

    if (kwh > 0) {
        let pf = kwh / Math.sqrt(kwh * kwh + kvarh * kvarh);
        document.getElementById("pf_penalty").value = pf.toFixed(3);
        let penalty = 0;
        if (pf < 0.92) {
            let factor = (pf < 0.72) ? ((0.72 - pf) * 1 + 0.1) : (0.92 - pf) * 0.5;
            penalty = factor * kwh * t;
        }
        document.getElementById("pf_charge").value = penalty.toFixed(2);
    }
}

function resetPF() {
    document.getElementById('kwh_in').value = '';
    document.getElementById('eff_in').value = '90';
    document.getElementById('v_in').value = '400';
    document.getElementById('hz_in').value = '50';
    document.getElementById('cos_old_in').value = '';
    document.getElementById('cos_new_in').value = '0.95';
    calculateCorrection();
}

// ========== TARIFFS TAB FUNCTIONS ==========
const allConfigs = {
    "Aug-2024": {
        residential: [
            { label: "ش1 (0-50)", p: 0.68, s: 1 },
            { label: "ش2 (51-100)", p: 0.78, s: 2 },
            { label: "ش3 (0-200)", p: 0.95, s: 6 },
            { label: "ش4 (201-350)", p: 1.55, s: 11 },
            { label: "ش5 (351-650)", p: 1.65, s: 15 },
            { label: "ش6 (651-1000)", p: 2.10, s: 25 },
            { label: "ش7 (1001+)", p: 2.23, s: 40 }
        ],
        commercial: [
            { label: "ش1 (0-100)", p: 0.85, s: 5 },
            { label: "ش2 (0-250)", p: 1.68, s: 15 },
            { label: "ش3 (0-600)", p: 2.20, s: 20 },
            { label: "ش4 (601-1000)", p: 2.27, s: 25 },
            { label: "ش5 (1001+)", p: 2.33, s: 40 }
        ],
        farmer: [{ label: "الري", p: 2.00, s: 4 }],
        factory: [{ label: "قوى محركة", p: 2.34, s: 15 }],
        lighting: [{ label: "انارة عامة", p: 2.34, s: 4 }],
        balance_cst: [{ label: "باقى المشتركين", p: 2.34, s: 15 }]
    },
    "Jan2024-Jul2024": {
        residential: [
            { label: "ش1 (0-50)", p: 0.58, s: 1 },
            { label: "ش2 (51-100)", p: 0.68, s: 2 },
            { label: "ش3 (0-200)", p: 0.83, s: 6 },
            { label: "ش4 (201-350)", p: 1.25, s: 11 },
            { label: "ش5 (351-650)", p: 1.40, s: 15 },
            { label: "ش6 (651-1000)", p: 1.50, s: 25 },
            { label: "ش7 (1001+)", p: 1.65, s: 40 }
        ],
        commercial: [
            { label: "ش1 (0-100)", p: 0.65, s: 5 },
            { label: "ش2 (0-250)", p: 1.36, s: 15 },
            { label: "ش3 (0-600)", p: 1.50, s: 20 },
            { label: "ش4 (601-1000)", p: 1.65, s: 25 },
            { label: "ش5 (1001+)", p: 1.80, s: 40 }
        ],
        farmer: [{ label: "الري", p: 1.10, s: 4 }],
        factory: [{ label: "قوى محركة", p: 1.50, s: 15 }],
        lighting: [{ label: "انارة عامة", p: 1.50, s: 4 }],
        balance_cst: [{ label: "باقى المشتركين", p: 1.50, s: 15 }]
    },
    "2021-2023": {
        residential: [
            { label: "ش1 (0-50)", p: 0.48, s: 1 },
            { label: "ش2 (51-100)", p: 0.58, s: 2 },
            { label: "ش3 (0-200)", p: 0.77, s: 6 },
            { label: "ش4 (201-350)", p: 1.06, s: 11 },
            { label: "ش5 (351-650)", p: 1.28, s: 15 },
            { label: "ش6 (651-1000)", p: 1.28, s: 25 },
            { label: "ش7 (1001+)", p: 1.45, s: 40 }
        ],
        commercial: [
            { label: "ش1 (0-100)", p: 0.65, s: 5 },
            { label: "ش2 (0-250)", p: 1.20, s: 15 },
            { label: "ش3 (0-600)", p: 1.40, s: 20 },
            { label: "ش4 (601-1000)", p: 1.55, s: 25 },
            { label: "ش5 (1001+)", p: 1.60, s: 40 }
        ],
        farmer: [{ label: "الري (موحد)", p: 0.95, s: 4 }],
        factory: [{ label: "قوى محركة", p: 1.25, s: 15 }],
        lighting: [{ label: "انارة عامة", p: 1.25, s: 4 }],
        balance_cst: [{ label: "باقى المشتركين", p: 1.25, s: 15 }]
    },
    "2019-2020": {
        residential: [
            { label: "ش1 (0-50)", p: 0.30, s: 1 },
            { label: "ش2 (51-100)", p: 0.40, s: 2 },
            { label: "ش3 (0-200)", p: 0.50, s: 6 },
            { label: "ش4 (201-350)", p: 0.82, s: 11 },
            { label: "ش5 (351-650)", p: 1.00, s: 15 },
            { label: "ش6 (651-1000)", p: 1.40, s: 25 },
            { label: "ش7 (1001+)", p: 1.45, s: 40 }
        ],
        commercial: [
            { label: "ش1 (0-100)", p: 0.65, s: 5 },
            { label: "ش2 (0-250)", p: 1.20, s: 15 },
            { label: "ش3 (0-600)", p: 1.40, s: 20 },
            { label: "ش4 (601-1000)", p: 1.55, s: 25 },
            { label: "ش5 (1001+)", p: 1.60, s: 40 }
        ],
        farmer: [{ label: "الري (موحد)", p: 0.75, s: 4 }],
        factory: [{ label: "قوى محركة", p: 1.25, s: 15 }],
        lighting: [{ label: "انارة عامة", p: 1.25, s: 4 }],
        balance_cst: [{ label: "باقى المشتركين", p: 1.25, s: 15 }]
    }
};

function onPeriodChange() {
    selectedPeriod = document.getElementById('periodSelect').value;
    document.getElementById('currentPeriodHeader').innerText = "تشريح " + selectedPeriod;
    initTariffTable();
}

function initTariffTable() {
    const type = document.getElementById('tariffType').value;
    const tbody = document.getElementById('tariffTableBody');
    tbody.innerHTML = '';
    const cfg = allConfigs[selectedPeriod];
    const list = cfg[type] || [];

    list.forEach((item, index) => {
        const i = index + 1;
        tbody.innerHTML += `<tr id="row${i}">
            <td>${item.label}</td>
            <td><input id="q${i}" readonly value="0" class="table-input-small"></td>
            <td><input id="p${i}" value="${item.p}" oninput="calculateTariffs()" class="table-input-small"></td>
            <td><input id="s${i}" value="${item.s}" oninput="calculateTariffs()" class="table-input-small"></td>
            <td><input id="r${i}" value="0" readonly class="table-input-small"></td>
            <td><input id="t${i}" readonly value="0" class="table-input-medium"></td>
        </tr>`;
    });
    calculateTariffs();
}

function calculateCostForConfig(kwh, type, configSet) {
    let tempTotal = 0;
    const list = configSet[type] || [];
    if (type === 'residential') {
        if (kwh >= 1001) tempTotal = (kwh * list[6].p) + list[6].s + 170;
        else if (kwh >= 651) tempTotal = (kwh * list[5].p) + list[5].s + 135;
        else if (kwh > 200) {
            let rem = kwh - 200;
            tempTotal = (200 * list[2].p) + list[2].s + 24;
            if (rem <= 150) tempTotal += (rem * list[3].p) + list[3].s;
            else tempTotal += (150 * list[3].p) + list[3].s + ((rem - 150) * list[4].p) + list[4].s;
        } else {
            if (kwh <= 50) tempTotal = (kwh * list[0].p) + list[0].s;
            else if (kwh <= 100) tempTotal = (50 * list[0].p) + list[0].s + ((kwh - 50) * list[1].p) + list[1].s;
            else tempTotal = (100 * list[1].p) + list[1].s + ((kwh - 100) * list[2].p) + list[2].s;
        }
    } else if (type === 'commercial') {
        if (kwh >= 1001) tempTotal = (kwh * list[4].p) + list[4].s + 140;
        else if (kwh >= 601) tempTotal = (kwh * list[3].p) + list[3].s + 25;
        else if (kwh >= 251) tempTotal = (kwh * list[2].p) + list[2].s + 70;
        else if (kwh >= 101) tempTotal = (kwh * list[1].p) + list[1].s + 70;
        else tempTotal = (kwh * list[0].p) + list[0].s;
    } else {
        tempTotal = (kwh * list[0].p) + list[0].s;
    }
    return tempTotal;
}

function calculateTariffs() {
    const type = document.getElementById('tariffType').value;
    const totalKwh = Number(document.getElementById('tkwh').value) || 0;
    const cfg = allConfigs[selectedPeriod];
    const rowsCount = (cfg[type] || []).length;

    for (let i = 1; i <= 7; i++) {
        if (document.getElementById(`q${i}`)) {
            document.getElementById(`q${i}`).value = 0;
            document.getElementById(`r${i}`).value = 0;
            document.getElementById(`t${i}`).value = 0;
            document.getElementById(`row${i}`).classList.remove('highlight');
        }
    }

    if (type === 'residential') {
        if (totalKwh >= 1001) {
            document.getElementById('q7').value = totalKwh; document.getElementById('r7').value = 170;
            document.getElementById('row7').classList.add('highlight');
        } else if (totalKwh >= 651) {
            document.getElementById('q6').value = totalKwh; document.getElementById('r6').value = 135;
            document.getElementById('row6').classList.add('highlight');
        } else if (totalKwh > 200) {
            document.getElementById('q3').value = 200; document.getElementById('r3').value = 24;
            let rem = totalKwh - 200;
            if (rem <= 150) { document.getElementById('q4').value = rem; document.getElementById('row4').classList.add('highlight'); }
            else { document.getElementById('q4').value = 150; document.getElementById('q5').value = (rem - 150).toFixed(2); document.getElementById('row5').classList.add('highlight'); }
        } else {
            let q1 = Math.min(50, totalKwh); document.getElementById('q1').value = q1;
            if (totalKwh > 50) {
                document.getElementById('q2').value = Math.min(50, totalKwh - 50);
                if (totalKwh > 100) { document.getElementById('q3').value = (totalKwh - 100).toFixed(2); document.getElementById('row3').classList.add('highlight'); }
                else { document.getElementById('row2').classList.add('highlight'); }
            } else { document.getElementById('row1').classList.add('highlight'); }
        }
    } else if (type === 'commercial') {
        if (totalKwh >= 1001) {
            document.getElementById('q5').value = totalKwh; document.getElementById('r5').value = 140;
            document.getElementById('row5').classList.add('highlight');
        } else if (totalKwh >= 601) {
            document.getElementById('q4').value = totalKwh; document.getElementById('row4').classList.add('highlight');
        } else if (totalKwh >= 251) {
            document.getElementById('q3').value = totalKwh; document.getElementById('r3').value = 50;
            document.getElementById('row3').classList.add('highlight');
        } else if (totalKwh >= 101) {
            document.getElementById('q2').value = totalKwh; document.getElementById('r2').value = 55;
            document.getElementById('row2').classList.add('highlight');
        } else {
            document.getElementById('q1').value = totalKwh; document.getElementById('row1').classList.add('highlight');
        }
    } else {
        if (document.getElementById('q1')) {
            document.getElementById('q1').value = totalKwh;
            document.getElementById('row1').classList.add('highlight');
        }
    }

    let grandTotal = 0;
    for (let i = 1; i <= rowsCount; i++) {
        let q = Number((document.getElementById(`q${i}`) || {}).value) || 0;
        let p = Number((document.getElementById(`p${i}`) || {}).value) || 0;
        let s = Number((document.getElementById(`s${i}`) || {}).value) || 0;
        let r = Number((document.getElementById(`r${i}`) || {}).value) || 0;
        if (q > 0 || r > 0) {
            let rowT = (q * p) + s + r;
            const tEl = document.getElementById(`t${i}`);
            if (tEl) tEl.value = rowT.toFixed(2);
            grandTotal += rowT;
        }
    }
    document.getElementById('totmoney').value = grandTotal.toFixed(2);
}

function addToLog() {
    const meter = document.getElementById('meterNo').value || "N/A";
    const fromD = document.getElementById('fromDate').value || "-";
    const toD = document.getElementById('toDate').value || "-";
    const kwh = Number(document.getElementById('tkwh').value);
    const bal1 = Number(document.getElementById('balmoney1').value);
    const charge = Number(document.getElementById('charge').value);
    const bal2 = Number(document.getElementById('balmoney2').value);
    const cost = Number(document.getElementById('totmoney').value);

    const actualCost = (bal1 + charge) - bal2;
    const diff = actualCost - cost;

    const logBody = document.getElementById('logTableBody');
    const row = document.createElement('tr');
    if (diff < 0) row.classList.add('negative-diff');

    row.innerHTML = `
        <td>${meter}</td><td>${fromD}</td><td>${toD}</td>
        <td class="log-kwh">${kwh}</td><td>${bal1.toFixed(2)}</td>
        <td class="log-charge">${charge.toFixed(2)}</td><td>${bal2.toFixed(2)}</td>
        <td class="log-cost">${cost.toFixed(2)}</td>
        <td class="log-actual actual-col">${actualCost.toFixed(2)}</td>
        <td class="log-diff diff-col">${diff.toFixed(2)}</td>
        <td><button class="delete-btn" onclick="deleteRow(this)"><i class="fas fa-trash-alt"></i></button></td>
    `;
    logBody.appendChild(row);
    updateLogTotals();
}

function addToComparison() {
    const kwh = Number(document.getElementById('tkwh').value) || 0;
    const type = document.getElementById('tariffType').value;
    const toDateStr = document.getElementById('toDate').value;

    const dateObj = toDateStr ? new Date(toDateStr) : new Date();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    const costCurrent = calculateCostForConfig(kwh, type, allConfigs[selectedPeriod]);

    const tableBody = document.getElementById('comparisonTableBody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td contenteditable="true" style="background-color: #fffde7;">${year}</td>
        <td contenteditable="true" style="background-color: #fffde7;">${month}</td>
        <td class="comp-kwh">${kwh}</td>
        <td class="comp-new">${costCurrent.toFixed(2)}</td>
        <td><button class="delete-btn" onclick="this.closest('tr').remove(); updateComparisonTotals();"><i class="fas fa-trash-alt"></i></button></td>
    `;

    tableBody.appendChild(row);
    updateComparisonTotals();
    row.querySelector('[contenteditable]').addEventListener('input', updateComparisonTotals);
}

function updateLogTotals() {
    let tk = 0, tm = 0, ta = 0, td = 0, tc = 0;
    document.querySelectorAll('.log-kwh').forEach(el => tk += Number(el.innerText));
    document.querySelectorAll('.log-cost').forEach(el => tm += Number(el.innerText));
    document.querySelectorAll('.log-actual').forEach(el => ta += Number(el.innerText));
    document.querySelectorAll('.log-diff').forEach(el => td += Number(el.innerText));
    document.querySelectorAll('.log-charge').forEach(el => tc += Number(el.innerText));

    document.getElementById('sumKwh').innerText = tk.toFixed(2);
    document.getElementById('sumMoney').innerText = tm.toFixed(2);
    document.getElementById('sumActual').innerText = ta.toFixed(2);
    document.getElementById('sumCharge').innerText = tc.toFixed(2);
    document.getElementById('sumDiff').innerText = td.toFixed(2);
}

function updateComparisonTotals() {
    let totalKwh = 0, totalMoney = 0;
    document.querySelectorAll('.comp-kwh').forEach(el => totalKwh += parseFloat(el.innerText) || 0);
    document.querySelectorAll('.comp-new').forEach(el => totalMoney += parseFloat(el.innerText) || 0);
    document.getElementById('compSumKwh').innerText = totalKwh;
    document.getElementById('compSumNew').innerText = totalMoney.toFixed(2);
}

function deleteRow(btn) {
    if (confirm("حذف هذا السجل؟")) {
        btn.closest('tr').remove();
        updateLogTotals();
    }
}

function clearLog() {
    if (confirm("سيتم مسح كافة السجلات؟")) {
        document.getElementById('logTableBody').innerHTML = '';
        document.getElementById('comparisonTableBody').innerHTML = '';
        updateLogTotals();
        updateComparisonTotals();
    }
}

function exportComparison() {
    let csv = [];
    csv.push("تقرير استهلاك الكهرباء");
    csv.push("سجل التشريح المختار");

    document.querySelectorAll("#comparisonTable tr").forEach(row => {
        let data = [];
        const cells = row.querySelectorAll("th, td");

        if (row.classList.contains('summary-yellow')) {
            data.push(cells[0].innerText);
            data.push("");
            data.push(cells[1].innerText);
            data.push(cells[2].innerText);
        } else {
            for (let i = 0; i < 4; i++) {
                if (cells[i]) {
                    data.push(cells[i].innerText.replace(/,/g, ''));
                }
            }
        }
        csv.push(data.join(","));
    });

    const blob = new Blob(["\ufeff" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "تقرير_التشريح.csv";
    link.click();
}

// ========== INITIALIZATION ==========
window.onload = function() {
    document.getElementById('currentDate').value = new Date().toISOString().split('T')[0];
    
    updateAngles();
    handlePhaseModeChange();
    calculatePhase();
    calcAC();
    calcMeter();
    calculateMT();
    initTariffTable();
    
    window.onclick = function(event) {
        const modal = document.getElementById("equationModal");
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
};