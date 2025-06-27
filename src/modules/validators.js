// Utility functions for parsing and formatting values

export function parseMoney(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return Number(value.toString().replace(/\./g, ''));
}

export function formatMoney(value) {
    const num = parseMoney(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('es-PY');
}
