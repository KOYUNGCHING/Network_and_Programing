// 0~100 的整數答案
let answer = Math.floor(Math.random() * 101);
let attempts = 0;

function checkGauss() {
    const inputEl = document.getElementById("userInput");
    const val = inputEl.value;

    // 防呆：空值
    if (val === "") {
        alert("請先輸入數字！");
        return;
    }

    const guess = Number(val);

    // 防呆：範圍
    if (!Number.isInteger(guess) || guess < 0 || guess > 100) {
        alert("請輸入 0 到 100 的整數。");
        return;
    }

    attempts++;

    if (guess > answer) {
        alert("太大了！再試一次～ 數字介於 0 ~ " + guess);
    } else if (guess < answer) {
        alert("太小了！再試一次～ 數字介於 " + guess + " ~ 100");
    } else {
        alert("答對了！你總共猜了 " + attempts + " 次！");

        attempts = 0;
        answer = Math.floor(Math.random() * 101);
        inputEl.value = "";
    }
}
