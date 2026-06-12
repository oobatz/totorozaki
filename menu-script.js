const asset = (name) => `img/${name}`;

const menuData = {
  main: [
    { id: "m1", name: "УНАГИ ДОН", price: 580, weight: "350 г", desc: "Угорь гриль, рис, соус унаги, кунжут", img: "картинка унаги дон.png", filter: "seafood", badge: "иконка острое svg.svg" },
    { id: "m2", name: "ТОНКАЦУ РАМЕН", price: 450, weight: "400 г", desc: "Свиной бульон, лапша, котлета Тонкацу, яйцо", img: "картинка тонкацу рамен.png", filter: "seafood", badge: "иконка хит svg.svg" },
    { id: "m3", name: "КАРААГЕ", price: 380, weight: "220 г", desc: "Жареная курица по-японски, маринад с имбирем", img: "картинка карааге.png", filter: "meat" },
    { id: "m4", name: "ВАГЮ ЯКИНИКУ", price: 980, weight: "180 г", desc: "Говядина Вагю A5, соус для якинику", img: "картинка вагю якинику.png", filter: "meat" },
    { id: "m5", name: "АЗИАТСКИЙ САЛАТ С ТОФУ", price: 420, weight: "250 г", desc: "Тофу, морковь, кинза, кунжут, краснокочанная капуста, соус", img: "картинка азиатский салат.png", filter: "seafood" },
    { id: "m6", name: "ПОКЕ С ЛОСОСЕМ", price: 520, weight: "300 г", desc: "Филе лосося, рис, авокадо, огурец, водоросли чука", img: "картинка поке.png", filter: "seafood" },
  ],
  desserts: [
    { id: "d1", name: "МАТЧА ТИРАМИСУ", price: 400, weight: "180 г", desc: "Нежный тирамису с матча", img: "картинка матча тирамису.png", filter: "pastry", badge: "иконка новое svg.svg" },
    { id: "d2", name: "МОТИ АССОРТИ", price: 350, weight: "150 г", desc: "Рисовое тесто, мороженое разных вкусов", img: "картинка моти ассорти.png", filter: "pastry" },
    { id: "d3", name: "ПАННА КОТТА", price: 350, weight: "150 г", desc: "Нежный сливочный десерт с ягодным соусом", img: "картинка панна котта.png", filter: "japanese" },
    { id: "d4", name: "ТАЙЯКИ С АДЗУКИ", price: 290, weight: "150 г", desc: "Японская вафля, начинка из адзуки, ванильный крем", img: "картинка тайяки.png", filter: "japanese" },
  ],
  drinks: [
    { id: "dr1", name: "СЕНЧА", price: 300, weight: "400 мл", desc: "Японский зеленый чай", img: "картинка сенча.png", filter: "tea" },
    { id: "dr2", name: "ТАЙСКИЙ МОЛОЧНЫЙ ЧАЙ", price: 350, weight: "400 мл", desc: "Тайский чай, сгущенное молоко, сливки, боба", img: "картинка молочный тайский чай.png", filter: "tea" },
    { id: "dr3", name: "ЗОЛОТОЙ УЛУН", price: 250, weight: "300 мл", desc: "Легкий китайский улун с цветочным ароматом", img: "картинка улун.png", filter: "tea" },
    { id: "dr4", name: "ЛАТТЕ", price: 220, weight: "200 мл", desc: "Эспрессо, горячее молоко, молочная пенка", img: "картинка латте.png", filter: "coffee" },
    { id: "dr5", name: "ВЬЕТНАМСКИЙ ЯИЧНЫЙ КОФЕ", price: 400, weight: "200 мл", desc: "Кофе, сгущенное молоко, яичный крем", img: "картинка вьетнамский кофе.png", filter: "coffee" },
    { id: "dr6", name: "КИБЕР-ЛИМОНАД", price: 220, weight: "400 мл", desc: "Освежающий лимонад с лаймом", img: "картинка кибер-лимонад.png", filter: "lemonade" },
    { id: "dr7", name: "ЯГОДНЫЙ ФИЗЗ", price: 220, weight: "400 мл", desc: "Газированный лимонад с ягодами", img: "картинка ягодный физз.png", filter: "lemonade" },
    { id: "dr8", name: "НЕБЕСНАЯ ГАЗИРОВКА", price: 220, weight: "400 мл", desc: "Легкая газировка со вкусом тропиков", img: "картинка небесная газировка.png", filter: "lemonade" },
  ],
};

const cartKey = "totorozaki_cart";
const state = {
  main: { filter: "all", offset: 0 },
  desserts: { filter: "all", offset: 0 },
  drinks: { filter: "all", offset: 0 },
};

const cartIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 4h3l2.4 11.2h9.7l2.4-7.2H7.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 4v6M9.5 7h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="9.5" cy="20" r="1.4" fill="currentColor"/>
    <circle cx="17" cy="20" r="1.4" fill="currentColor"/>
  </svg>
`;

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem(cartKey)) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  sessionStorage.setItem(cartKey, JSON.stringify(cart));
}

function allItems() {
  return Object.values(menuData).flat();
}

function findItem(id) {
  return allItems().find((item) => item.id === id);
}

function updateCartBadge() {
  const total = Object.values(getCart()).reduce((sum, entry) => sum + entry.qty, 0);
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  badge.hidden = total === 0;
  badge.textContent = total;
}

function addToCart(id) {
  const item = findItem(id);
  if (!item) return;
  const cart = getCart();
  if (cart[id]) {
    cart[id].qty += 1;
  } else {
    cart[id] = {
      qty: 1,
      item: {
        ...item,
        img: item.img ? `img/${item.img}` : item.img,
        badge: item.badge ? `img/${item.badge}` : item.badge,
      },
    };
  }
  saveCart(cart);
  updateCartBadge();
}

function cardTemplate(item, category) {
  const wideDrink = category === "drinks" && item.id === "dr3";
  const tallDrink = category === "drinks" && ["dr2", "dr5", "dr6", "dr7", "dr8"].includes(item.id);
  return `
    <article class="dish-card ${category === "drinks" ? "compact" : ""} ${wideDrink ? "drink-card-wide" : ""} ${tallDrink ? "drink-card-tall" : ""}" data-id="${item.id}">
      ${item.badge ? `<img class="dish-badge" src="${asset(item.badge)}" alt="" draggable="false" />` : ""}
      <div class="dish-image-wrap">
        <img class="dish-img" src="${asset(item.img)}" alt="${item.name}" draggable="false" />
      </div>
      <span class="dish-line"></span>
      <h3 class="dish-name">${item.name}</h3>
      <p class="dish-desc">${item.desc}</p>
      <div class="dish-price">${item.price} р</div>
      <div class="dish-weight">${item.weight}</div>
      <button class="add-btn" type="button" data-id="${item.id}" aria-label="Добавить ${item.name} в корзину">${cartIcon}</button>
    </article>
  `;
}

function filteredItems(category) {
  const filter = state[category].filter;
  return menuData[category].filter((item) => filter === "all" || item.filter === filter);
}

function visibleRows(panel) {
  const shell = panel.querySelector(".items-shell");
  const card = panel.querySelector(".dish-card");
  if (!shell || !card) return 1;
  const gap = parseFloat(getComputedStyle(panel.querySelector(".items-grid")).rowGap) || 0;
  return Math.max(1, Math.floor((shell.clientHeight + gap) / (card.offsetHeight + gap)));
}

function totalRows(category) {
  return Math.ceil(filteredItems(category).length / 2);
}

function updateScroll(panel) {
  if (window.matchMedia("(max-width: 700px)").matches) {
    const grid = panel.querySelector(".items-grid");
    const filterRow = panel.querySelector(".filter-row");
    const thumb = panel.querySelector(".scroll-thumb");
    if (grid) grid.style.transform = "";
    if (filterRow) filterRow.style.transform = "";
    if (thumb) {
      thumb.style.height = "100%";
      thumb.style.top = "0";
    }
    return;
  }

  const category = panel.dataset.category;
  const grid = panel.querySelector(".items-grid");
  const filterRow = panel.querySelector(".filter-row");
  const thumb = panel.querySelector(".scroll-thumb");
  const rows = totalRows(category);
  const visible = visibleRows(panel);
  const max = Math.max(0, rows - visible);
  state[category].offset = Math.max(0, Math.min(state[category].offset, max));
  const card = panel.querySelector(".dish-card");
  const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
  const step = card ? card.offsetHeight + gap : 0;
  const offsetY = state[category].offset * step;
  grid.style.transform = `translateY(-${offsetY}px)`;
  if (filterRow) filterRow.style.transform = `translateY(-${offsetY}px)`;
  const ratio = visible >= rows ? 1 : visible / rows;
  const thumbHeight = Math.max(18, ratio * 100);
  thumb.style.height = `${thumbHeight}%`;
  thumb.style.top = max ? `${(state[category].offset / max) * (100 - thumbHeight)}%` : "0";
}

function renderCategory(category) {
  const panel = document.querySelector(`[data-category="${category}"]`);
  const grid = document.getElementById(`items-${category}`);
  grid.innerHTML = filteredItems(category).map((item) => cardTemplate(item, category)).join("");
  grid.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.id));
  });
  requestAnimationFrame(() => updateScroll(panel));
}

function initFilters() {
  document.querySelectorAll(".menu-panel").forEach((panel) => {
    panel.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const category = panel.dataset.category;
        const same = state[category].filter === button.dataset.filter;
        state[category].filter = same ? "all" : button.dataset.filter;
        state[category].offset = 0;
        panel.querySelectorAll(".filter-btn").forEach((item) => item.classList.remove("active"));
        if (!same) button.classList.add("active");
        renderCategory(category);
      });
    });
  });
}

function initScrollButtons() {
  document.querySelectorAll(".menu-panel").forEach((panel) => {
    const category = panel.dataset.category;
    panel.querySelector(".scroll-up").addEventListener("click", () => {
      state[category].offset -= 1;
      updateScroll(panel);
    });
    panel.querySelector(".scroll-down").addEventListener("click", () => {
      state[category].offset += 1;
      updateScroll(panel);
    });
    panel.querySelector(".items-shell").addEventListener(
      "wheel",
      (event) => {
        if (window.matchMedia("(max-width: 700px)").matches) return;
        event.preventDefault();
        state[category].offset += event.deltaY > 0 ? 1 : -1;
        updateScroll(panel);
      },
      { passive: false },
    );
  });
}

function initModal() {
  const modal = document.getElementById("waiterModal");
  document.getElementById("waiterBtn").addEventListener("click", () => {
    modal.hidden = false;
  });
  document.getElementById("closeWaiter").addEventListener("click", () => {
    modal.hidden = true;
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.hidden = true;
  });
}

window.addEventListener("resize", () => {
  document.querySelectorAll(".menu-panel").forEach(updateScroll);
});

document.addEventListener("DOMContentLoaded", () => {
  renderCategory("main");
  renderCategory("desserts");
  renderCategory("drinks");
  initFilters();
  initScrollButtons();
  initModal();
  updateCartBadge();
});
