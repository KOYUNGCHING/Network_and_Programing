let answer = Math.floor(Math.random() * 101), attempts = 0;

function checkGauss() {
    let val = document.getElementById("userInput").value;
    if (val === "") return alert("請先輸入數字！");
    let g = +val; // 轉數字
    if (!Number.isInteger(g) || g < 0 || g > 100) return alert("請輸入 0 到 100 的整數。");

    attempts++;
    if (g > answer) alert("太大了！再試一次～ 數字介於 0 ~ " + g);
    else if (g < answer) alert("太小了！再試一次～ 數字介於 " + g + " ~ 100");
    else {
        alert("答對了！你總共猜了 " + attempts + " 次！");
        attempts = 0;
        answer = Math.floor(Math.random() * 101);
        document.getElementById("userInput").value = "";
    }
}
