const checkAll = document.querySelector("#checkAll");
const items = document.querySelectorAll(".item");
const total = document.querySelector("#total");

// 全選
checkAll.addEventListener("change", () => {
    items.forEach(chk => chk.checked = checkAll.checked);
    updateTotal();
});

// 單選
items.forEach(chk => chk.addEventListener("change", () => {
    checkAll.checked = [...items].every(c => c.checked);
    updateTotal();
}));