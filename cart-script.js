const demoCart = {
  m2: {
    qty: 1,
    item: { id: "m2", name: "Тонкацу рамен", price: 450, weight: "400 г", img: "img/картинка тонкацу рамен.png" },
  },
  d1: {
    qty: 1,
    item: { id: "d1", name: "Матча тирамису", price: 400, weight: "180 г", img: "img/картинка матча тирамису.png" },
  },
  dr2: {
    qty: 1,
    item: { id: "dr2", name: "Тайский молочный чай", price: 350, weight: "400 мл", img: "img/картинка молочный тайский чай.png" },
  },
};

let cartScrollOffset = 0;

document.addEventListener("DOMContentLoaded", () => {
  updateStageScale();
  renderCart();
  bindModal("waiterModal", "waiterBtn");
  document.getElementById("payBtn").addEventListener("click", showPayModal);
  document.getElementById("closePay").addEventListener("click", afterPay);
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeLocalModal(button.dataset.close));
  });
});

window.addEventListener("resize", updateStageScale);

function updateStageScale() {
  const scale = Math.max(window.innerWidth / 1200, window.innerHeight / 675);
  document.documentElement.style.setProperty("--stage-scale", String(scale));
}

function activeCart() {
  const stored = loadCart();
  return Object.keys(stored).length ? stored : demoCart;
}

function cartItems() {
  return Object.values(activeCart());
}

function renderCart() {
  const list = document.getElementById("cart-items-list");
  const items = cartItems();

  list.innerHTML = items.map(({ item, qty }, index) => cardTemplate(item, qty, index)).join("");
  list.querySelectorAll("[data-delta]").forEach((button) => {
    button.addEventListener("click", () => changeQty(button.dataset.id, Number(button.dataset.delta)));
  });

  cartScrollOffset = 0;
  list.style.transform = "";
  updateSummary();
  updateTableDishes();
  updateCartScrollThumb();
  updateCartBadge();
}

function cardTemplate(item, qty, index) {
  return `
    <article class="cart-card card-${index + 1}" data-id="${item.id}">
      <span class="product-orb"><img src="${item.img}" alt="" draggable="false" /></span>
      <h2>${item.name}</h2>
      <p>${item.weight}</p>
      <strong>${(item.price * qty).toLocaleString("ru")} р</strong>
      <button class="qty minus" type="button" data-id="${item.id}" data-delta="-1" aria-label="Уменьшить ${item.name}"></button>
      <span class="qty-value">${qty}</span>
      <button class="qty plus" type="button" data-id="${item.id}" data-delta="1" aria-label="Увеличить ${item.name}"></button>
    </article>
  `;
}

function changeQty(id, delta) {
  const cart = Object.keys(loadCart()).length ? loadCart() : structuredClone(demoCart);
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  renderCart();
}

function updateSummary() {
  const bonuses = loadBonuses();
  if (!Object.keys(loadCart()).length) {
    document.getElementById("sum-total").textContent = "1 000 р";
    document.getElementById("sum-service").textContent = "100 р";
    document.getElementById("sum-bonuses").textContent = "- 70 р";
    document.getElementById("sum-final").textContent = "1 030 р";
    document.getElementById("bonuses-display").textContent = bonuses;
    return;
  }

  const { subtotal, service, bonusRedeem, total } = calcCart(activeCart(), bonuses);
  document.getElementById("sum-total").textContent = `${subtotal.toLocaleString("ru")} р`;
  document.getElementById("sum-service").textContent = `${service.toLocaleString("ru")} р`;
  document.getElementById("sum-bonuses").textContent = `- ${bonusRedeem.toLocaleString("ru")} р`;
  document.getElementById("sum-final").textContent = `${total.toLocaleString("ru")} р`;
  document.getElementById("bonuses-display").textContent = bonuses;
}

function updateTableDishes() {
  const slots = [
    { cls: "table-drink", shadow: "shadow-drink" },
    { cls: "table-dessert", shadow: "shadow-dessert" },
    { cls: "table-main", shadow: "shadow-main" },
  ];
  const sorted = cartItems().slice(0, 3);
  const byId = [
    sorted.find(({ item }) => item.id === "dr2") || sorted[2],
    sorted.find(({ item }) => item.id === "d1") || sorted[1],
    sorted.find(({ item }) => item.id === "m2") || sorted[0],
  ].filter(Boolean);

  document.getElementById("table-items").innerHTML = byId.map(({ item }, index) => `
    <span class="table-shadow ${slots[index].shadow}"></span>
    <img class="table-dish ${slots[index].cls}" src="${item.img}" alt="" draggable="false" />
  `).join("");
}

function updateCartScrollThumb() {
  const thumb = document.getElementById("thumb-cart");
  const count = cartItems().length;
  thumb.style.height = count > 3 ? "72px" : "150px";
  thumb.style.top = count > 3 ? `${cartScrollOffset * 32}px` : "0";
}

function showPayModal() {
  const bonuses = loadBonuses();
  const { earned } = calcCart(activeCart(), bonuses);
  document.getElementById("modal-bonuses-earned").textContent = `Начислено бонусов: +${earned}`;
  document.getElementById("payModal").hidden = false;
}

function afterPay() {
  const bonuses = loadBonuses();
  const { bonusRedeem, earned } = calcCart(activeCart(), bonuses);
  saveBonuses(bonuses - bonusRedeem + earned);
  saveCart({});
  closeLocalModal("payModal");
  window.location.href = "menu.html";
}

function bindModal(modalId, triggerId) {
  const modal = document.getElementById(modalId);
  const trigger = document.getElementById(triggerId);
  trigger.addEventListener("click", () => { modal.hidden = false; });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeLocalModal(modalId);
  });
}

function closeLocalModal(id) {
  document.getElementById(id).hidden = true;
}
