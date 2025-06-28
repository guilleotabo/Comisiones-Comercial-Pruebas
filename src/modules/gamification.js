import { parseMoney } from './validators.js';

const ACH_KEY = 'commission_achievements';
const PREV_KEY = 'commission_prev_month';
const CUR_KEY = 'commission_current_month';
const STREAK_KEY = 'commission_streak';
const motivationalQuotes = [
    '¡Sigue así, cada meta te acerca al éxito!',
    'Tu esfuerzo marcará la diferencia.',
    'La constancia es la clave del triunfo.',
    '¡Hoy es un buen día para vender más!'
];

let unlocked = [];
let lastResult = {};
let streak = 0;

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

function loadJson(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error cargando', key, e);
        return null;
    }
}

function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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

function updateStreakDisplay() {
    const el = document.getElementById('streakCount');
    if (el) el.textContent = streak;
}

function handleMonthlyProgress(total) {
    const month = new Date().toISOString().slice(0,7);
    let prev = loadJson(PREV_KEY);
    let current = loadJson(CUR_KEY);
    if (!current || current.month !== month) {
        if (current) {
            saveJson(PREV_KEY, current);
            prev = current;
        }
        current = { month, total };
        streak = 0;
    } else {
        current.total = total;
    }

    if (prev && prev.month !== month) {
        if (total > prev.total) {
            streak += 1;
        } else if (total < prev.total) {
            streak = 0;
        }
    }

    saveJson(CUR_KEY, current);
    localStorage.setItem(STREAK_KEY, String(streak));
    updateStreakDisplay();
}

export function initGamification() {
    unlocked = loadAchievements();
    renderAchievements();
    updateMotivation();
    updateProgressRing(0);
    updateRanking();
    streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    updateStreakDisplay();
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
        }
    });
    handleMonthlyProgress(result.total);
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
