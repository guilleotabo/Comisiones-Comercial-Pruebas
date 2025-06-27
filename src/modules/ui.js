import { parseMoney, formatMoney } from './validators.js';

export function updateProgress(id, nivel) {
    const bar = document.getElementById(id);
    if (!bar) return;
    const segs = bar.children;
    for (let i = 0; i < segs.length; i++) {
        segs[i].classList.remove('reached', 'current');
        if (nivel > i) segs[i].classList.add('reached');
    }
    if (nivel >= 0 && nivel < segs.length) {
        segs[nivel].classList.add('current');
    }
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
        });
        el.addEventListener('focus', () => {
            const val = parseMoney(el.value);
            el.value = val ? val : '';
        });
    });
}

export function togglePDFMenu() {
    const menu = document.getElementById('pdfMenuOptions');
    if (!menu) return;
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
