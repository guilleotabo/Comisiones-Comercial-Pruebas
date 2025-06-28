import { parseMoney, formatMoney } from './validators.js';

export function updateProgress(id, nivel) {
    const bar = document.getElementById(id);
    if (!bar) return;
    const segs = bar.children;
    const prev = parseInt(bar.dataset.level ?? '-1', 10);
    for (let i = 0; i < segs.length; i++) {
        segs[i].classList.remove('current');
        if (nivel > i) {
            if (i > prev) {
                segs[i].classList.remove('reached');
                void segs[i].offsetWidth;
                segs[i].classList.add('reached');
            } else {
                segs[i].classList.add('reached');
            }
        } else {
            segs[i].classList.remove('reached');
        }
    }
    if (nivel >= 0 && nivel < segs.length) {
        segs[nivel].classList.add('current');
    }
    bar.dataset.level = nivel;
}

export function resetProgressBars() {
    ['progInterno', 'progExterno', 'progRecuperado', 'progCantidad'].forEach(id => {
        const bar = document.getElementById(id);
        if (!bar) return;
        const html = bar.innerHTML;
        bar.innerHTML = html; // remove previous listeners
    });
}

export function initProgressBars(metas) {
    const cfg = [
        {bar: 'progInterno', input: 'montoInterno', metas: metas.montoInterno},
        {bar: 'progExterno', input: 'montoExterno', metas: metas.montoExterno},
        {bar: 'progRecuperado', input: 'montoRecuperado', metas: metas.montoRecuperado},
        {bar: 'progCantidad', input: 'cantidad', metas: metas.cantidad}
    ];
    cfg.forEach(c => {
        const bar = document.getElementById(c.bar);
        if (!bar) return;
        Array.from(bar.children).forEach((seg, i) => {
            seg.setAttribute('tabindex', '0');
            seg.setAttribute('role', 'button');
            seg.setAttribute('aria-label', String(c.metas[i]));
            seg.setAttribute('title', String(c.metas[i]));

            const updateValue = () => {
                document.getElementById(c.input).value = c.metas[i];
            };

            seg.addEventListener('click', updateValue);
            seg.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    updateValue();
                }
            });
        });
    });
}

export function initMoneyFormat() {
    ['montoInterno', 'montoExterno', 'montoRecuperado'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('blur', () => {
            el.value = formatMoney(el.value);
            if (window.calcular) window.calcular();
        });
        el.addEventListener('focus', () => {
            const val = parseMoney(el.value);
            el.value = val ? val : '';
        });
    });
}

export function togglePDFMenu() {
    const menu = document.getElementById('pdfMenuOptions');
    const btn = document.querySelector('.pdf-menu > button');
    if (!menu || !btn) return;
    menu.classList.toggle('open');
    const isOpen = menu.classList.contains('open');
    btn.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
    } else {
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleEscape);
    }
}

export function closePDFMenu() {
    const menu = document.getElementById('pdfMenuOptions');
    const btn = document.querySelector('.pdf-menu > button');
    if (!menu || !btn) return;
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleEscape);
    }
}

function handleOutsideClick(e) {
    const container = document.querySelector('.pdf-menu');
    if (container && !container.contains(e.target)) {
        closePDFMenu();
    }
}

function handleEscape(e) {
    if (e.key === 'Escape') {
        closePDFMenu();
    }
}
