document.querySelector(".order-hitbox")?.addEventListener("click", () => {
  window.location.href = "menu.html";
});

document.querySelectorAll(".food-icon").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = button.dataset.target || "menu.html";
  });
});
