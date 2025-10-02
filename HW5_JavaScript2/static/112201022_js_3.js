let answer = Math.floor(Math.random() * 101), attempts = 0;
let startTime = null, timerId = null;

function checkGauss() {
    const input = document.getElementById("userInput");
    const msg = document.getElementById("message");
    const tim = document.getElementById("timer");
    const his = document.getElementById("history");

    if (input === "") return alert("請先輸入數字！");
    let g = +input.value;
    if (!Number.isInteger(g) || g < 0 || g > 100) return alert("請輸入 0 到 100 的整數。");

    if (!startTime) {
        startTime = Date.now();
        timerId = setInterval(() => {
            const t = (Date.now() - startTime) / 1000;
            tim.textContent = `時間：${t.toFixed(2)} 秒`;
        }, 100);
    }
    attempts++;
    if (g > answer) { msg.textContent = `太大了！再試一次～`; return; }
    if (g < answer) { msg.textContent = `太小了！再試一次～`; return; }
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    clearInterval(timerId);
    timerId = null;

    alert(`猜中了！共猜了 ${attempts} 次，花了 ${elapsed} 秒`);

    // appendChild
    const rec = document.createElement("div");
    const idx = his.childElementCount + 1;   // 目前已有幾筆 + 1
    rec.textContent = `${idx}. 猜了 ${attempts} 次，耗時 ${elapsed} 秒，${new Date().toLocaleTimeString()}`;
    his.appendChild(rec);
    // 重置
    answer = rand();
    attempts = 0;
    startTime = null;
    tim.textContent = "時間：0.00 秒";
    input.value = "";
}
