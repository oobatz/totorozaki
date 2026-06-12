/* ============================================
   TOTOROZAKI — shared.js
   Общие данные, состояние корзины (sessionStorage),
   вспомогательные функции для всех страниц
   ============================================ */

// ── Данные меню ─────────────────────────────
const MENU_DATA = {
  main: [
    { id:'m1', name:'УНАГИ ДОН',       price:580, weight:'350 г', desc:'Угорь гриль, рис, соус унаги, кунжут',              img:'img/картинка унаги дон.png', filter:'seafood', badge:'img/иконка острое svg.svg'   },
    { id:'m2', name:'ТОНКАЦУ РАМЕН',   price:450, weight:'400 г', desc:'Свиной бульон, лапша, котлета Тонкацу, яйцо',       img:'img/картинка тонкацу рамен.png', filter:'seafood',    badge:'img/иконка хит svg.svg'  },
    { id:'m3', name:'КАРААГЕ',          price:380, weight:'220 г', desc:'Жареная курица по-японски, маринад с имбирём',      img:'img/картинка карааге.png', filter:'meat',    badge:null   },
    { id:'m4', name:'ВАГЮ ЯКИНИКУ',    price:980, weight:'180 г', desc:'Говядина Вагю A5, соус для якинику',                img:'img/картинка вагю якинику.png', filter:'meat',    badge:null  },
    { id:'m5', name:'АЗИАТСКИЙ САЛАТ С ТОФУ',    price:420, weight:'250 г', desc:'Тофу, морковь, кинза, кунжут, краснокочанная капуста, соус',                img:'img/картинка азиатский салат.png', filter:'seafood',    badge:null  },
    { id:'m6', name:'ПОКЕ С ЛОСОСЕМ',    price:520, weight:'300 г', desc:'Филе лосося, рис, авокадо, огурец, водоросли чука',                img:'img/картинка поке.png', filter:'seafood',    badge:null  },
  ],
  desserts: [
    { id:'d1', name:'МАТЧА ТИРАМИСУ',  price:400, weight:'180 г', desc:'Нежный тирамису с матча',                           img:'img/картинка матча тирамису.png', filter:'pastry',     badge:'img/иконка новое svg.svg'   },
    { id:'d2', name:'МОТИ АССОРТИ',    price:350, weight:'150 г', desc:'Рисовое тесто, мороженое разных вкусов',            img:'img/картинка моти ассорти.png', filter:'pastry',     badge:null  },
    { id:'d3', name:'ПАННА КОТТА',  price:350, weight:'150 г', desc:'Нежным сливочный десерт с ягодным соусом',                           img:'img/картинка панна котта.png', filter:'japanese',     badge:null   },
    { id:'d4', name:'ТАЙЯКИ С АДЗУКИ',    price:290, weight:'150 г', desc:'Японская вафля, начинка из адзуки, ванильный крем',            img:'img/картинка тайяки.png', filter:'japanese',     badge:null  },
  ],
  drinks: [
    { id:'dr1', name:'СЕНЧА',                  price:300, weight:'400 мл', desc:'Японский зелёный чай',                              img:'img/картинка сенча.png', filter:'tea', badge:null   },
    { id:'dr2', name:'ТАЙСКИЙ МОЛОЧНЫЙ ЧАЙ',   price:350, weight:'400 мл', desc:'Тайский чай, сгущённое молоко, сливки, боба',      img:'img/картинка молочный тайский чай.png', filter:'tea',   badge:null  },
    { id:'dr3', name:'ЗОЛОТОЙ УЛУН',   price:250, weight:'300 мл', desc:'Лёгкий китайский улун с цветочным ароматом',      img:'img/картинка улун.png', filter:'tea',   badge:null  },

    { id:'dr4', name:'ЛАТТЕ',             price:220, weight:'200 мл', desc:'Эспрессо, горячее молоко, молочная пенка',                             img:'img/картинка латте.png', filter:'coffee', badge:null   },
    { id:'dr5', name:'ВЬЕТНАМСКИЙ ЯИЧНЫЙ КОФЕ',             price:400, weight:'200 мл', desc:'Кофе, сгущённое молоко, яичный крем',                             img:'img/картинка вьетнамский кофе.png', filter:'coffee', badge:null   },

    { id:'dr6', name:'КИБЕР-ЛИМОНАД',         price:220, weight:'400 мл', desc:'Освежающий лимонад с лаймом',        img:'img/картинка кибер-лимонад.png', filter:'lemonade',   badge:null  },
    { id:'dr7', name:'ЯГОДНЫЙ ФИЗЗ',            price:220, weight:'400 мл', desc:'Газированный лимонад с ягодами',                      img:'img/картинка ягодный физз.png', filter:'lemonade',   badge:null   },
    { id:'dr8', name:'НЕБЕСНАЯ ГАЗИРОВКА',            price:220, weight:'400 мл', desc:'Лёгкая газировка со вкусом тропиков',                      img:'img/картинка небесная газировка.png', filter:'lemonade',   badge:null   },
  ]
};

// ── Корзина через sessionStorage ─────────────
const CART_KEY    = 'totorozaki_cart';
const BONUS_KEY   = 'totorozaki_bonuses';

function loadCart() {
  try { return JSON.parse(sessionStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}

function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadBonuses() {
  const v = sessionStorage.getItem(BONUS_KEY);
  return v !== null ? parseInt(v) : 300;
}

function saveBonuses(n) {
  sessionStorage.setItem(BONUS_KEY, String(n));
}

// ── Поиск блюда по id ─────────────────────────
function findItemById(id) {
  for (const cat of Object.values(MENU_DATA)) {
    const found = cat.find(i => i.id === id);
    if (found) return found;
  }
  return null;
}

// ── Подсчёт корзины ───────────────────────────
function calcCart(cart, bonuses) {
  const subtotal   = Object.values(cart).reduce((s,{item,qty}) => s + item.price * qty, 0);
  const service    = Math.round(subtotal * 0.10);
  const maxRedeem  = Math.round(subtotal * 0.20);
  const bonusRedeem = Math.min(bonuses, maxRedeem);
  const total      = Math.max(0, subtotal + service - bonusRedeem);
  const earned     = Math.round(total * 0.05);
  return { subtotal, service, bonusRedeem, total, earned };
}

// ── Бейдж корзины ─────────────────────────────
function updateCartBadge() {
  const cart  = loadCart();
  const total = Object.values(cart).reduce((s,v) => s + v.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ── Модалка официанта ─────────────────────────
function showWaiterModal() {
  document.getElementById('modal-waiter').classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// ── Init badge на всех страницах ─────────────
document.addEventListener('DOMContentLoaded', updateCartBadge);
