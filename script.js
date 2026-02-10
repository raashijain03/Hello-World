const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNav.classList.toggle("is-open");
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const moodFilters = Array.from(document.querySelectorAll("[data-mood-filter]"));
const productCards = Array.from(document.querySelectorAll("[data-product-card]"));

if (moodFilters.length && productCards.length) {
  const applyMoodFilter = (filter) => {
    moodFilters.forEach((button) => {
      const isActive = button.dataset.moodFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    productCards.forEach((card) => {
      const moods = (card.dataset.moods || "").split(/\s+/).filter(Boolean);
      const shouldShow = filter === "all" || moods.includes(filter);
      card.hidden = !shouldShow;
    });
  };

  moodFilters.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.moodFilter || "all";
      applyMoodFilter(filter);
    });
  });

  const queryMood = new URLSearchParams(window.location.search).get("mood");
  const hasMood = moodFilters.some((button) => button.dataset.moodFilter === queryMood);
  applyMoodFilter(hasMood ? queryMood : "all");
}

const orderItemsContainer = document.getElementById("order-items");
const orderTotalEl = document.getElementById("order-total");
const orderForm = document.getElementById("order-form");
const clearOrderButton = document.getElementById("clear-order");
const orderError = document.getElementById("order-error");
const orderConfirmation = document.getElementById("order-confirmation");
const addToOrderButtons = Array.from(document.querySelectorAll(".add-to-order"));

if (orderItemsContainer && orderTotalEl && orderForm) {
  const storageKey = "greenRoomOrder";
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  let cart = [];
  try {
    const saved = localStorage.getItem(storageKey);
    cart = saved ? JSON.parse(saved) : [];
  } catch (error) {
    cart = [];
  }

  const saveCart = () => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  };

  const cartTotal = () =>
    cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  const renderCart = () => {
    orderItemsContainer.innerHTML = "";

    if (!cart.length) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "order-item";
      emptyItem.textContent = "No pieces selected yet.";
      orderItemsContainer.appendChild(emptyItem);
      orderTotalEl.textContent = currency.format(0);
      return;
    }

    cart.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "order-item";

      const infoWrap = document.createElement("div");

      const name = document.createElement("div");
      name.className = "order-item-name";
      name.textContent = `${item.name} x${item.quantity}`;

      const price = document.createElement("div");
      price.className = "order-item-price";
      price.textContent = currency.format(Number(item.price) * Number(item.quantity));

      infoWrap.appendChild(name);
      infoWrap.appendChild(price);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "order-item-remove";
      removeButton.dataset.removeId = item.id;
      removeButton.textContent = "Remove";

      listItem.appendChild(infoWrap);
      listItem.appendChild(removeButton);
      orderItemsContainer.appendChild(listItem);
    });

    orderTotalEl.textContent = currency.format(cartTotal());
  };

  const addItem = (newItem) => {
    const existing = cart.find((item) => item.id === newItem.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...newItem, quantity: 1 });
    }

    saveCart();
    renderCart();
  };

  addToOrderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-product-card]");
      if (!card) return;

      addItem({
        id: card.dataset.productId || "",
        name: card.dataset.productName || "Product",
        price: Number(card.dataset.productPrice || 0),
      });

      if (orderError) {
        orderError.textContent = "";
      }
    });
  });

  orderItemsContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches(".order-item-remove")) return;

    const id = target.dataset.removeId;
    cart = cart.filter((item) => item.id !== id);
    saveCart();
    renderCart();
  });

  if (clearOrderButton) {
    clearOrderButton.addEventListener("click", () => {
      cart = [];
      saveCart();
      renderCart();
      if (orderError) {
        orderError.textContent = "";
      }
      if (orderConfirmation) {
        orderConfirmation.hidden = true;
      }
    });
  }

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!cart.length) {
      if (orderError) {
        orderError.textContent = "Please select at least one piece before placing an order.";
      }
      return;
    }

    const formData = new FormData(orderForm);
    const name = String(formData.get("name") || "there").trim();
    const orderReference = `GR-${Date.now().toString().slice(-6)}`;

    if (orderConfirmation) {
      orderConfirmation.hidden = false;
      orderConfirmation.textContent = `Thank you ${name}. Your order request (${orderReference}) is received. Our client team will email next steps shortly.`;
    }

    orderForm.reset();
    cart = [];
    saveCart();
    renderCart();
    if (orderError) {
      orderError.textContent = "";
    }
  });

  renderCart();
}

const contactForm = document.getElementById("contact-form");
const contactConfirmation = document.getElementById("contact-confirmation");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "there").trim();

    if (contactConfirmation) {
      contactConfirmation.hidden = false;
      contactConfirmation.textContent = `Thank you ${name}. A Green Room specialist will reply shortly.`;
    }

    contactForm.reset();
  });
}
