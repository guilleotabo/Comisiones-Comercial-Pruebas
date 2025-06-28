import { parseMoney } from './validators.js';

const ACH_KEY = 'commission_achievements';
const motivationalQuotes = [
    '¡Sigue así, cada meta te acerca al éxito!',
    'Tu esfuerzo marcará la diferencia.',
    'La constancia es la clave del triunfo.',
    '¡Hoy es un buen día para vender más!'
];

let unlocked = [];
let lastResult = {};

function renderConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    canvas.classList.remove('hidden');

    const pieces = Array.from({ length: 100 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: 5 + Math.random() * 5,
        color: `hsl(${Math.random() * 360},100%,50%)`,
        speed: Math.random() * 3 + 2
    }));

    function draw() {
        ctx.clearRect(0, 0, width, height);
        pieces.forEach(p => {
            p.y += p.speed;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        if (pieces.some(p => p.y < height)) {
            requestAnimationFrame(draw);
        } else {
            canvas.classList.add('hidden');
        }
    }
    draw();
}

function loadAchievements() {
    try {
        const data = localStorage.getItem(ACH_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error cargando logros', e);
        return [];
    }
}

function saveAchievements() {
    localStorage.setItem(ACH_KEY, JSON.stringify(unlocked));
}

const achievements = [
    {
        id: 'primer_nivel',
        name: 'Primer Nivel',
        condition: r => r.nivelCarreraFinal >= 0
    },
    {
        id: 'genio',
        name: 'Nivel Genio',
        condition: r => r.nivelCarreraFinal === 5
    }
];

function renderAchievements() {
    const list = document.getElementById('logrosList');
    if (!list) return;
    list.innerHTML = '';
    achievements.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a.name;
        if (unlocked.includes(a.id)) li.classList.add('unlocked');
        list.appendChild(li);
    });
}

function showAchievement(a) {
    const list = document.getElementById('logrosList');
    if (!list) return;
    const li = document.createElement('li');
    li.textContent = a.name;
    li.classList.add('unlocked', 'animate');
    list.appendChild(li);
    setTimeout(() => li.classList.remove('animate'), 1000);
}

function updateMotivation() {
    const el = document.getElementById('motivationalQuote');
    if (!el) return;
    const q = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    el.textContent = q;
}

function updateProgressRing(total) {
    const slider = document.getElementById('metaSlider');
    const ring = document.getElementById('progressRing');
    const text = document.getElementById('progressRingText');
    if (!slider || !ring || !text) return;
    const meta = parseMoney(slider.value);
    const radius = ring.r.baseVal.value;
    const circ = 2 * Math.PI * radius;
    ring.style.strokeDasharray = circ;
    const pct = meta > 0 ? Math.min(100, Math.round(total / meta * 100)) : 0;
    ring.style.strokeDashoffset = circ - pct / 100 * circ;
    text.textContent = pct + '%';
}

function updateRanking() {
    const posEl = document.getElementById('rankingPos');
    const topEl = document.getElementById('topPercent');
    if (!posEl || !topEl) return;
    const pos = Math.floor(Math.random() * 50) + 1;
    posEl.textContent = pos;
    topEl.textContent = Math.round(pos / 50 * 100);
}

export function initGamification() {
    unlocked = loadAchievements();
    renderAchievements();
    updateMotivation();
    updateProgressRing(0);
    updateRanking();
    const slider = document.getElementById('metaSlider');
    const metaValue = document.getElementById('metaValue');
    if (slider && metaValue) {
        const update = () => {
            metaValue.textContent = parseMoney(slider.value).toLocaleString('es-ES');
            updateProgressRing(lastResult.total || 0);
        };
        slider.addEventListener('input', update);
        update();
    }
}

export function checkAchievements(result) {
    lastResult = result;
    achievements.forEach(a => {
        if (!unlocked.includes(a.id) && a.condition(result)) {
            unlocked.push(a.id);
            saveAchievements();
            showAchievement(a);
            if (a.id === 'genio') renderConfetti();
        }
    });
    updateProgressRing(result.total);
    updateMotivation();
    updateRanking();
}

export function shareResults() {
    const container = document.getElementById('result');
    if (!container || !window.html2canvas) return;
    html2canvas(container).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'comision.png';
        link.click();
    });
}
