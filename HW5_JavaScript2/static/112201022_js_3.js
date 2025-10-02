let answer = Math.floor(Math.random() * 101), attempts = 0;
let startTime = null

function checkGauss() {
    const input = document.getElementById("userInput");
    const msg = document.getElementById("messager");
    const his = document.getElementById("history")

    if (input === "") return alert("請先輸入數字！");
    let g = +input.value;
    if (!Number.isInteger(g) || g < 0 || g > 100) return alert("請輸入 0 到 100 的整數。");
    if (!startTime) startTime = Date.now();
    attempts++;

    if (g > answer) alert("太大了！再試一次～ 數字介於 0 ~ " + g);
    else if (g < answer) alert("太小了！再試一次～ 數字介於 " + g + " ~ 100");
    else {
        let t = ((Date.now() - startTime) / 1000).toFixed(2);
        msg.textContent = `答對了！共 ${attempts} 次，用時 ${t} 秒`;
        his.innerHTML += `<div>第 ${attempts} 次答對，耗時 ${t} 秒，時間 ${new Date().toLocaleTimeString()}</div>`;
    }
}
