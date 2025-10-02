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

    rows().forEach(r => { if (!stock(r)) qtyEl(r).value = 0; setSub(r); });
    setTot();

    const checkAll = $('#checkAll'), items = $$('.item');
    checkAll.addEventListener('change', () => { items.forEach(i => i.checked = checkAll.checked); setTot(); });
    items.forEach(i => i.addEventListener('change', () => { checkAll.checked = [...items].every(x => x.checked); setTot(); }));

    cart.addEventListener('click', e => {
        const b = e.target.closest('.plus,.minus'); if (!b) return;
        const r = b.closest('tr'), s = stock(r), q = qtyEl(r);
        let v = +q.value || (s ? 1 : 0);
        v += b.classList.contains('plus') ? 1 : -1;
        q.value = s ? Math.min(s, Math.max(1, v)) : 0;
        setSub(r); setTot();
    });

    cart.addEventListener('blur', e => {
        if (!e.target.classList.contains('qty')) return;
        const r = e.target.closest('tr'), s = stock(r);
        let v = Math.floor(+e.target.value);
        e.target.value = s ? Math.min(s, Math.max(1, v || 1)) : 0;
        setSub(r); setTot();
    }, true);

    let checkout = $('#checkout');
    if (!checkout) {
        checkout = Object.assign(document.createElement('button'), { id: 'checkout', textContent: '結帳' });
        document.body.appendChild(checkout);
    }

    checkout.addEventListener('click', () => {
        const total = num(tcell.textContent); if (!total) return;
        const lines = ['感謝您的購買，您購買的產品如下：', ''];

        rows().forEach(r => {
            if (!r.querySelector('.item').checked) return;
            const name = r.cells[1].innerText.trim();
            const q = +qtyEl(r).value || 0;
            const sub = r.querySelector('.subtotal').textContent;
            lines.push(`${name} × ${q} = ${sub}`);

            const left = Math.max(0, stock(r) - q);
            r.cells[2].textContent = left;
            qtyEl(r).value = left ? 1 : 0;
            r.querySelector('.item').checked = false;
            setSub(r);
        });

        alert(lines.concat('', `總計 = ${money(total)}`).join('\n'));
        checkAll.checked = false;
        setTot();
    });
});