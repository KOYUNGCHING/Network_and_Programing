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
            tim.textContent = `用時：${t.toFixed(2)} 秒`;
        }, 100);
    }
    attempts++;
    if (g > answer) { msg.textContent = `太大了！再試一次～`; return; }
    if (g < answer) { msg.textContent = `太小了！再試一次～`; return; }

    {
        let t = ((Date.now() - startTime) / 1000).toFixed(2);
        msg.textContent = `猜中了！共猜了 ${attempts} 次，花了 ${t} 秒`;
        his.innerHTML += `<div>猜了 ${attempts} 次，耗時 ${t} 秒， ${new Date().toLocaleTimeString()}</div>`;
        // reset
        answer = Math.floor(Math.random() * 101);
        attempts = 0;
        startTime = null;
        input.value = "";
    }
}
