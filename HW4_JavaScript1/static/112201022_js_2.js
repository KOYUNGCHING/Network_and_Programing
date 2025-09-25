document.write('<input id="disp" style="width:160px;height:30px;font-size:20px;text-align:right" readonly><br>');

let btns = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", "(", ")", "+"];

btns.forEach((b, i) => {
    document.write(`<button style="width:40px;height:40px;font-size:18px;margin:2px" onclick="press('${b}')">${b}</button>`);
    if ((i + 1) % 4 == 0) document.write("<br>");
});

// 最後一行：clear 跟 =
document.write('<button style="width:84px;height:40px;font-size:18px;margin:2px" onclick="press(\'clear\')">clear</button>');
document.write('<button style="width:84px;height:40px;font-size:18px;margin:2px" onclick="press(\'=\')">=</button>');

function press(b) {
    let d = document.getElementById("disp");
    if (b == "clear") d.value = "";
    else if (b == "=") {
        let ans = eval(d.value);
        alert(d.value + "=" + ans);
        d.value = ans;
    } else d.value += b;
}
