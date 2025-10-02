document.addEventListener('DOMContentLoaded', () => {
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const num = s => +String(s ?? '').replace(/[^\d]/g, '') || 0;
    const money = n => '$' + n.toLocaleString();
    const cart = $('#cart');
    const rows = () => [...cart.querySelectorAll('tbody tr')].filter(r => r.querySelector('.price'));
    const stock = r => num(r.cells[2].textContent);                // 第3欄：庫存
    const price = r => num(r.querySelector('.price').textContent); // 單價（含$與逗號）
    const qtyEl = r => r.querySelector('.qty');
    const tcell = cart.querySelector('.total');
    const setSub = r => r.querySelector('.subtotal').textContent = money(price(r) * (+qtyEl(r).value || 0));
    const setTot = () => tcell.textContent = money(rows().reduce((s, r) =>
        s + (r.querySelector('.item').checked ? num(r.querySelector('.subtotal').textContent) : 0), 0));

