const STORAGE_KEY = "gestionCommandesState_v1";
const THEME_KEY = "gestionCommandesTheme_v1";

const STATUS_OPTIONS = [
  "En attente",
  "En préparation",
  "En cours de livraison",
  "Livré",
  "Annulé",
  "Prêt pour retrait",
  "Remis au client",
];

const state = {
  products: [],
  orders: [],
  tpeHistory: [],
  storeCart: [],
  loyaltyCustomers: [], // Clients avec cartes de fidélité
};

const elements = {
  productForm: document.querySelector("#productForm"),
  productSkuInput: document.querySelector("#productSku"),
  productImageInput: document.querySelector("#productImage"),
  productImagePreview: document.querySelector("#productImagePreview"),
  productImageClear: document.querySelector("#productImageClear"),
  productTableBody: document.querySelector("#productsTable tbody"),
  productsEmptyState: document.querySelector("#productsEmptyState"),
  orderForm: document.querySelector("#orderForm"),
  orderItemsContainer: document.querySelector("#orderItemsContainer"),
  orderAddItem: document.querySelector("#orderAddItem"),
  orderCustomer: document.querySelector("#orderCustomer"),
  orderNotes: document.querySelector("#orderNotes"),
  orderTableBody: document.querySelector("#ordersTable tbody"),
  ordersEmptyState: document.querySelector("#ordersEmptyState"),
  scanForm: document.querySelector("#scanForm"),
  scanInput: document.querySelector("#scanInput"),
  scanResult: document.querySelector("#scanResult"),
  clearScanResults: document.querySelector("#clearScanResults"),
  productRowTemplate: document.querySelector("#productRowTemplate"),
  orderRowTemplate: document.querySelector("#orderRowTemplate"),
  drawer: document.querySelector("#drawer"),
  drawerOverlay: document.querySelector("#drawerOverlay"),
  drawerTitle: document.querySelector("#drawerTitle"),
  drawerSubtitle: document.querySelector("#drawerSubtitle"),
  drawerContent: document.querySelector("#drawerContent"),
  drawerClose: document.querySelector("#drawerClose"),
  scanSkuBtn: document.querySelector("#scanSkuBtn"),
  scanModalOverlay: document.querySelector("#scanModalOverlay"),
  scanModalForm: document.querySelector("#scanModalForm"),
  scanModalInput: document.querySelector("#scanModalInput"),
  scanModalClose: document.querySelector("#scanModalClose"),
  scanModalCancel: document.querySelector("#scanModalCancel"),
  scanModalVideo: document.querySelector("#scanModalVideo"),
  scanModalStatus: document.querySelector("#scanModalStatus"),
  exportProductsBtn: document.querySelector("#exportProductsBtn"),
  exportOrdersBtn: document.querySelector("#exportOrdersBtn"),
  themeToggle: document.querySelector("#themeToggle"),
  themeLabel: document.querySelector("#themeLabel"),
  pickupScanBtn: document.querySelector("#pickupScanBtn"),
  pages: document.querySelectorAll("[data-page]"),
  navTriggers: document.querySelectorAll("[data-nav]"),
  navLinks: document.querySelectorAll(".nav-link"),
  homeProductsCount: document.querySelector("#statProductsCount"),
  homeOrdersOpen: document.querySelector("#statOrdersOpen"),
  homePickupReady: document.querySelector("#statPickupReady"),
  storeMetricProducts: document.querySelector("#storeMetricProducts"),
  storeMetricCart: document.querySelector("#storeMetricCart"),
  storeMetricTotal: document.querySelector("#storeMetricTotal"),
  storeProductsList: document.querySelector("#storeProductsList"),
  storeSearch: document.querySelector("#storeSearch"),
  storeBarcodeInput: document.querySelector("#storeBarcodeInput"),
  storeScanBtn: document.querySelector("#storeScanBtn"),
  storeCartList: document.querySelector("#storeCartList"),
  storeResetBtn: document.querySelector("#storeResetBtn"),
  storeCheckoutForm: document.querySelector("#storeCheckoutForm"),
  storeCustomer: document.querySelector("#storeCustomer"),
  storeCustomerSearch: document.querySelector("#storeCustomerSearch"),
  storeCustomerScanBtn: document.querySelector("#storeCustomerScanBtn"),
  storeCustomerAddBtn: document.querySelector("#storeCustomerAddBtn"),
  storeCustomerInfo: document.querySelector("#storeCustomerInfo"),
  storeCustomerName: document.querySelector("#storeCustomerName"),
  storeCustomerPoints: document.querySelector("#storeCustomerPoints"),
  storeCustomerClear: document.querySelector("#storeCustomerClear"),
  storeCustomerId: document.querySelector("#storeCustomerId"),
  storeDiscount: document.querySelector("#storeDiscount"),
  loyaltyCustomerForm: document.querySelector("#loyaltyCustomerForm"),
  loyaltyAddCustomerBtn: document.querySelector("#loyaltyAddCustomerBtn"),
  loyaltyCancelBtn: document.querySelector("#loyaltyCancelBtn"),
  loyaltyFirstName: document.querySelector("#loyaltyFirstName"),
  loyaltyLastName: document.querySelector("#loyaltyLastName"),
  loyaltyEmail: document.querySelector("#loyaltyEmail"),
  loyaltyPhone: document.querySelector("#loyaltyPhone"),
  loyaltyInitialPoints: document.querySelector("#loyaltyInitialPoints"),
  loyaltyCustomersTable: document.querySelector("#loyaltyCustomersTable tbody"),
  loyaltyEmptyState: document.querySelector("#loyaltyEmptyState"),
  storeSubtotal: document.querySelector("#storeSubtotal"),
  storeDiscountValue: document.querySelector("#storeDiscountValue"),
  storeTotal: document.querySelector("#storeTotal"),
  storeCheckoutButton: document.querySelector("#storeCheckoutForm .checkout-button"),
  tpeAmount: document.querySelector("#tpeAmount"),
  tpeStatus: document.querySelector("#tpeStatus"),
  tpeReset: document.querySelector("#tpeReset"),
  tpeChargeBtn: document.querySelector("#tpeChargeBtn"),
  tpeManualBtn: document.querySelector("#tpeManualBtn"),
  tpeKeypad: document.querySelector(".tpe-keypad"),
  tpeHistoryList: document.querySelector("#tpeHistoryList"),
  tpeHistoryClear: document.querySelector("#tpeHistoryClear"),
};

const cameraState = {
  stream: null,
  detector: null,
  rafId: null,
  videoElement: null,
  active: false,
  reader: null,
  controls: null,
  usingDetector: false,
  overlay: null,
  overlayTimeout: null,
  supportedFormats: [
    "code_128",
    "code_39",
    "code_93",
    "ean_13",
    "ean_8",
    "upc_a",
    "upc_e",
    "qr_code",
  ],
};

const IMAGE_PREVIEW_PLACEHOLDER = `
  <div class="image-preview-placeholder">
    <span class="material-symbols-rounded">image</span>
    <p>Aucune image sélectionnée</p>
  </div>
`;

let pendingProductImageData = null;
let pendingProductImageName = null;
let currentScanMode = "pickup";
let activeScanTarget = null;
let lastScanCode = "";
let lastScanMode = "inventory";
let storeBarcodeScanTimeout = null;
let activeDrawerProductId = null;
let activeDrawerOrderId = null;
let tpeBuffer = "0";
let storeTotals = {
  subtotal: 0,
  discountValue: 0,
  total: 0,
  quantity: 0,
};

function getProductInitial(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase() || "?";
}

function loadState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    state.products = parsed.products ?? [];
    state.orders = parsed.orders ?? [];
    state.tpeHistory = parsed.tpeHistory ?? [];
    state.storeCart = parsed.storeCart ?? [];
    state.loyaltyCustomers = parsed.loyaltyCustomers ?? [];
  } catch (error) {
    console.error("Impossible de charger l'état sauvegardé :", error);
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadTheme() {
  const stored = window.localStorage.getItem(THEME_KEY);
  const isDark = stored === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  elements.themeToggle.checked = isDark;
  elements.themeLabel.textContent = isDark ? "Mode clair" : "Mode sombre";
}

function toggleTheme() {
  const isDark = elements.themeToggle.checked;
  document.documentElement.classList.toggle("dark", isDark);
  elements.themeLabel.textContent = isDark ? "Mode clair" : "Mode sombre";
  window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

function setActivePage(pageId) {
  if (!pageId) return;
  elements.pages?.forEach((section) => {
    section.classList.toggle("active", section.dataset.page === pageId);
  });
  elements.navLinks?.forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === pageId);
  });
  currentScanMode = pageId === "pickup" ? "pickup" : "inventory";
  if (pageId === "pickup") {
    clearScan();
    setTimeout(() => {
      elements.scanInput?.focus();
    }, 150);
  } else if (pageId === "store") {
    setTimeout(() => {
      (elements.storeBarcodeInput || elements.storeSearch)?.focus();
    }, 150);
  } else if (pageId === "loyalty") {
    initLoyaltyPage();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateHomeStats() {
  if (elements.homeProductsCount) {
    elements.homeProductsCount.textContent = state.products.length.toString();
  }
  if (elements.homeOrdersOpen) {
    const openOrders = state.orders.filter(
      (order) => !["Livré", "Annulé", "Remis au client"].includes(order.status),
    ).length;
    elements.homeOrdersOpen.textContent = openOrders.toString();
  }
  if (elements.homePickupReady) {
    const ready = state.orders.filter((order) => order.status === "Prêt pour retrait").length;
    elements.homePickupReady.textContent = ready.toString();
  }
}

function getOrderItems(order) {
  if (Array.isArray(order?.items) && order.items.length) {
    return order.items;
  }
  return [
    {
      productId: order.productId,
      productName: order.productName,
      productSku: order.productSku,
      quantity: order.quantity ?? 0,
      unitPrice: order.unitPrice ?? 0,
    },
  ];
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function buildStatusSelect(select, selectedStatus) {
  select.innerHTML = "";
  STATUS_OPTIONS.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    if (status === selectedStatus) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function renderProductOptions() {
  const container = elements.orderItemsContainer;
  if (!container) return;
  const selects = container.querySelectorAll(".order-item-select");
  if (!selects.length) return;

  const options = state.products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .map((product) => `<option value="${product.id}">${product.name} • ${product.sku}</option>`)
    .join("");

  selects.forEach((select) => {
    const current = select.value;
    select.innerHTML = `<option value="" disabled selected>Choisissez un produit</option>${options}`;
    if (current && state.products.some((product) => product.id === current)) {
      select.value = current;
    }
  });
  toggleOrderItemRemoveButtons();
}

function toggleOrderItemRemoveButtons() {
  const container = elements.orderItemsContainer;
  if (!container) return;
  const rows = container.querySelectorAll(".order-item-row");
  const disable = rows.length <= 1;
  rows.forEach((row) => {
    const removeBtn = row.querySelector(".order-item-remove");
    if (removeBtn) {
      removeBtn.disabled = disable;
    }
  });
}

function createOrderItemRow(productId = "", quantity = 1) {
  const container = elements.orderItemsContainer;
  if (!container) return;
  const row = document.createElement("div");
  row.className = "order-item-row";

  const select = document.createElement("select");
  select.className = "order-item-select";
  select.required = true;

  const qty = document.createElement("input");
  qty.type = "number";
  qty.min = "1";
  qty.value = quantity;
  qty.required = true;
  qty.className = "order-item-qty";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "order-item-remove";
  remove.innerHTML = '<span class="material-symbols-rounded">close</span>';
  remove.addEventListener("click", () => {
    const rows = container.querySelectorAll(".order-item-row");
    if (rows.length <= 1) {
      select.value = "";
      qty.value = "1";
      return;
    }
    row.remove();
    toggleOrderItemRemoveButtons();
  });

  row.append(select, qty, remove);
  container.appendChild(row);
  renderProductOptions();
  if (productId) {
    select.value = productId;
  }
  toggleOrderItemRemoveButtons();
}

function ensureOrderItemRows() {
  const container = elements.orderItemsContainer;
  if (!container) return;
  if (!container.querySelector(".order-item-row")) {
    createOrderItemRow();
  } else {
    renderProductOptions();
    toggleOrderItemRemoveButtons();
  }
}

function classifyStock(stock) {
  if (stock === 0) return "danger";
  if (stock <= 5) return "low";
  return "stock";
}

function renderProducts() {
  elements.productTableBody.innerHTML = "";
  if (!state.products.length) {
    elements.productsEmptyState.classList.remove("hidden");
    updateHomeStats();
    renderProductOptions();
    renderStoreProducts();
    renderStoreCart();
    return;
  }
  elements.productsEmptyState.classList.add("hidden");
  state.products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .forEach((product) => {
      const row = elements.productRowTemplate.content.cloneNode(true);
      row.querySelector(".item-title").textContent = product.name;
      row.querySelector(".item-description").textContent = product.description || "Pas de description";
      row.querySelector(".barcode").textContent = product.sku;
      const stockBadge = row.querySelector(".badge");
      stockBadge.textContent = `${product.stock} en stock`;
      stockBadge.classList.add(classifyStock(product.stock));
      row.querySelector(".price").textContent = formatCurrency(product.price);

      const thumbImg = row.querySelector(".product-thumb");
      const thumbFallback = row.querySelector(".product-thumb-fallback");
      thumbFallback.textContent = getProductInitial(product.name);
      if (product.image?.dataUrl) {
        thumbImg.src = product.image.dataUrl;
        thumbImg.alt = product.image.name || product.name;
        thumbImg.style.display = "block";
        thumbFallback.classList.add("hidden");
      } else {
        thumbImg.removeAttribute("src");
        thumbImg.style.display = "none";
        thumbFallback.classList.remove("hidden");
      }

      row.querySelector(".icon-button.view").addEventListener("click", () => {
        openProductDrawer(product);
      });

      row.querySelector(".icon-button.restock").addEventListener("click", () => {
        promptRestockProduct(product);
      });

      row.querySelector(".icon-button.delete").addEventListener("click", () => {
        if (
          confirm(
            `Supprimer ${product.name} ? Les commandes associées conserveront les informations existantes.`,
          )
        ) {
          deleteProduct(product.id);
        }
      });

      elements.productTableBody.appendChild(row);
    });
  updateHomeStats();
  renderProductOptions();
  renderStoreProducts();
  renderStoreCart();
}

function renderOrders() {
  elements.orderTableBody.innerHTML = "";
  if (!state.orders.length) {
    elements.ordersEmptyState.textContent =
      "Pas encore de commandes. Utilisez le formulaire ci-dessus pour en créer.";
    elements.ordersEmptyState.classList.remove("hidden");
    updateHomeStats();
    return;
  }
  elements.ordersEmptyState.classList.add("hidden");

  state.orders
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((order) => {
      const row = elements.orderRowTemplate.content.cloneNode(true);
      const createdAt = new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(order.createdAt);

      const items = getOrderItems(order);
      const itemsSummary = items
        .map((item) => `${item.quantity ?? 0}× ${item.productName ?? "Produit"}`)
        .slice(0, 2)
        .join(", ");
      const extraCount = items.length > 2 ? ` +${items.length - 2}` : "";
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      const totalAmount =
        order.total ??
        items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 0), 0);

      row.querySelector(".item-title").textContent = order.reference || order.id;
      row.querySelector(".item-date").textContent = createdAt;
      row.querySelector(".item-product").textContent = `${itemsSummary}${extraCount}`;
      row.querySelector(".item-quantity").textContent = `${totalQuantity} article${
        totalQuantity > 1 ? "s" : ""
      } • ${formatCurrency(totalAmount)}`;
      row.querySelector(".item-customer").textContent = order.customer || "Client inconnu";
      const details = [order.email, order.notes].filter(Boolean).join(" • ") || "—";
      row.querySelector(".item-notes").textContent = details;

      const select = row.querySelector(".status-select");
      buildStatusSelect(select, order.status);
      select.addEventListener("change", (event) => {
        updateOrderStatus(order.id, event.target.value);
      });

      row.querySelector(".icon-button.focus-product").addEventListener("click", () => {
        const product = state.products.find((p) => p.id === order.productId);
        if (product) {
          showScanCard(product, order);
          openProductDrawer(product, order);
        } else {
          alert("Produit introuvable. Il a peut-être été supprimé.");
        }
      });

      row.querySelector(".icon-button.delete").addEventListener("click", () => {
        if (confirm(`Supprimer la commande ${order.reference} ?`)) {
          deleteOrder(order.id);
        }
      });

      elements.orderTableBody.appendChild(row);
    });
  updateHomeStats();
}

function deleteProduct(productId) {
  state.products = state.products.filter((product) => product.id !== productId);
  state.storeCart = state.storeCart.filter((item) => item.productId !== productId);
  saveState();
  renderProducts();
}

function promptRestockProduct(product) {
  const input = window.prompt(
    `Combien d'unités ajouter au stock de "${product.name}" ?`,
    "5",
  );
  if (input === null) {
    return;
  }
  const amount = Number.parseInt(input.trim(), 10);
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    alert("Veuillez saisir un nombre entier.");
    return;
  }
  if (amount <= 0) {
    alert("Le nombre d'unités doit être supérieur à zéro.");
    return;
  }
  increaseProductStock(product.id, amount);
}

function increaseProductStock(productId, amount) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    alert("Produit introuvable.");
    return;
  }
  const currentStock = Number.isFinite(product.stock) ? product.stock : 0;
  product.stock = Math.max(0, currentStock + amount);
  product.updatedAt = Date.now();
  saveState();
  renderProducts();
  refreshDrawerIfNeeded(product);
  refreshScanIfNeeded(product);
  alert(`Stock mis à jour : ${product.stock} unité${product.stock > 1 ? "s" : ""}.`);
}

function refreshScanIfNeeded(product) {
  if (!lastScanCode || product.sku !== lastScanCode) return;
  const mode = lastScanMode || currentScanMode;
  processScanValue(lastScanCode, mode);
}

function refreshDrawerIfNeeded(product) {
  if (!elements.drawer?.classList.contains("open")) return;
  if (activeDrawerProductId !== product.id) return;
  const relatedOrder = activeDrawerOrderId
    ? state.orders.find((order) => order.id === activeDrawerOrderId)
    : undefined;
  openProductDrawer(product, relatedOrder);
}

function updateStoreMetrics() {
  if (elements.storeMetricProducts) {
    elements.storeMetricProducts.textContent = state.products.length.toString();
  }
  if (elements.storeMetricCart) {
    elements.storeMetricCart.textContent = storeTotals.quantity.toString();
  }
  if (elements.storeMetricTotal) {
    elements.storeMetricTotal.textContent = formatCurrency(storeTotals.total || 0);
  }
}

function normalizeStoreCart() {
  let changed = false;
  state.storeCart = state.storeCart.filter((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    if (!product) {
      changed = true;
      return false;
    }
    const maxStock = Math.max(0, Number.parseInt(product.stock, 10) || 0);
    if (maxStock === 0) {
      changed = true;
      return false;
    }
    if (item.quantity > maxStock) {
      item.quantity = maxStock;
      changed = true;
    }
    return item.quantity > 0;
  });
  if (changed) {
    saveState();
  }
  return changed;
}

function getStoreDiscountRate() {
  if (!elements.storeDiscount) return 0;
  const raw = Number.parseFloat(elements.storeDiscount.value);
  if (!Number.isFinite(raw)) {
    elements.storeDiscount.value = "0";
    return 0;
  }
  const clamped = Math.min(100, Math.max(0, raw));
  if (clamped !== raw) {
    elements.storeDiscount.value = clamped.toString();
  }
  return clamped;
}

function updateStoreTotals() {
  let subtotal = 0;
  let quantity = 0;
  state.storeCart.forEach((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    if (!product) return;
    subtotal += (product.price ?? 0) * item.quantity;
    quantity += item.quantity;
  });
  const discountRate = getStoreDiscountRate();
  const discountValue = Math.min(subtotal, (subtotal * discountRate) / 100);
  const total = Math.max(0, subtotal - discountValue);

  storeTotals = {
    subtotal,
    discountValue,
    total,
    quantity,
  };

  if (elements.storeSubtotal) {
    elements.storeSubtotal.textContent = formatCurrency(subtotal);
  }
  if (elements.storeDiscountValue) {
    elements.storeDiscountValue.textContent = `- ${formatCurrency(discountValue)}`;
  }
  if (elements.storeTotal) {
    elements.storeTotal.textContent = formatCurrency(total);
  }
  if (elements.storeCheckoutButton) {
    elements.storeCheckoutButton.disabled = state.storeCart.length === 0;
  }

  updateStoreMetrics();
  return { subtotal, discountValue, total, quantity };
}

function renderStoreProducts() {
  if (!elements.storeProductsList) return;
  const query = elements.storeSearch?.value.trim().toLowerCase() ?? "";
  const products = state.products
    .slice()
    .filter((product) => {
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  if (!products.length) {
    elements.storeProductsList.innerHTML =
      '<p class="empty-state">Aucun produit. Ajoutez des articles dans l’onglet Inventaire.</p>';
    updateStoreMetrics();
    return;
  }

  const fragments = document.createDocumentFragment();
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "store-product-card";

    const main = document.createElement("div");
    main.className = "store-product-main";
    const avatar = document.createElement("div");
    avatar.className = "store-product-avatar";
    if (product.image?.dataUrl) {
      const img = document.createElement("img");
      img.src = product.image.dataUrl;
      img.alt = product.image.name || product.name;
      avatar.appendChild(img);
    } else {
      const fallback = document.createElement("span");
      fallback.textContent = getProductInitial(product.name);
      avatar.appendChild(fallback);
    }
    const mainInfo = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = product.description || "—";
    const sku = document.createElement("span");
    sku.className = "store-product-sku";
    sku.textContent = `SKU ${product.sku}`;
    mainInfo.append(title, description, sku);
    main.append(avatar, mainInfo);

    const footer = document.createElement("div");
    footer.className = "store-product-footer";
    const priceWrap = document.createElement("div");
    priceWrap.className = "store-product-footer-info";
    const price = document.createElement("span");
    price.className = "store-product-price";
    price.textContent = formatCurrency(product.price ?? 0);
    const badge = document.createElement("span");
    badge.className = `badge ${classifyStock(product.stock)}`;
    badge.textContent = `${product.stock} en stock`;
    priceWrap.append(price, badge);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary store-product-button";
    button.dataset.action = "add";
    button.dataset.id = product.id;
    button.textContent = "Ajouter";
    button.title = "Ajouter au ticket";
    if (!product.stock) {
      button.disabled = true;
      button.textContent = "Rupture";
    }
    footer.append(priceWrap, button);

    card.append(main, footer);
    fragments.appendChild(card);
  });

  elements.storeProductsList.innerHTML = "";
  elements.storeProductsList.appendChild(fragments);
  updateStoreMetrics();
}

function renderStoreCart() {
  if (!elements.storeCartList) return;
  normalizeStoreCart();

  if (!state.storeCart.length) {
    elements.storeCartList.innerHTML =
      '<p class="empty-state">Ajoutez des produits pour démarrer une vente.</p>';
    updateStoreTotals();
    return;
  }

  const fragments = document.createDocumentFragment();
  state.storeCart.forEach((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    if (!product) return;

    const article = document.createElement("article");
    article.className = "store-cart-item";
    article.dataset.id = item.productId;

    const header = document.createElement("header");
    const title = document.createElement("span");
    title.textContent = product.name;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "icon-button";
    removeBtn.dataset.action = "remove";
    removeBtn.dataset.id = item.productId;
    removeBtn.title = "Supprimer la ligne";
    removeBtn.innerHTML = '<span class="material-symbols-rounded">delete</span>';
    header.append(title, removeBtn);

    const meta = document.createElement("div");
    meta.className = "store-cart-meta";
    const sku = document.createElement("span");
    sku.className = "store-cart-sku";
    sku.textContent = `Code-barres : ${product.sku}`;
    const unit = document.createElement("span");
    unit.className = "store-cart-unit";
    unit.textContent = `${formatCurrency(product.price ?? 0)} / unité`;
    meta.append(sku, unit);

    const footer = document.createElement("footer");
    const quantityControl = document.createElement("div");
    quantityControl.className = "store-cart-quantity";
    const decreaseBtn = document.createElement("button");
    decreaseBtn.type = "button";
    decreaseBtn.dataset.action = "decrease";
    decreaseBtn.dataset.id = item.productId;
    decreaseBtn.textContent = "−";
    const qtySpan = document.createElement("span");
    qtySpan.textContent = item.quantity.toString();
    const increaseBtn = document.createElement("button");
    increaseBtn.type = "button";
    increaseBtn.dataset.action = "increase";
    increaseBtn.dataset.id = item.productId;
    increaseBtn.textContent = "+";
    if (item.quantity >= product.stock) {
      increaseBtn.disabled = true;
    }
    quantityControl.append(decreaseBtn, qtySpan, increaseBtn);

    const lineTotal = document.createElement("div");
    lineTotal.className = "store-cart-line-total";
    lineTotal.textContent = formatCurrency((product.price ?? 0) * item.quantity);

    footer.append(quantityControl, lineTotal);

    article.append(header, meta, footer);
    fragments.appendChild(article);
  });

  elements.storeCartList.innerHTML = "";
  elements.storeCartList.appendChild(fragments);
  updateStoreTotals();
}

function addStoreProductToCart(productId, quantity = 1) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    alert("Produit introuvable.");
    return;
  }
  const maxStock = Math.max(0, Number.parseInt(product.stock, 10) || 0);
  if (maxStock === 0) {
    alert(`"${product.name}" est en rupture de stock.`);
    return;
  }

  const existing = state.storeCart.find((item) => item.productId === productId);
  if (existing) {
    const newQuantity = Math.min(maxStock, existing.quantity + quantity);
    if (newQuantity === existing.quantity) {
      alert("Quantité maximale atteinte par rapport au stock disponible.");
      return;
    }
    existing.quantity = newQuantity;
  } else {
    state.storeCart.push({ productId, quantity: Math.min(maxStock, quantity) });
  }
  saveState();
  renderStoreCart();
}

function setStoreItemQuantity(productId, quantity) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  const maxStock = Math.max(0, Number.parseInt(product.stock, 10) || 0);
  const safeQuantity = Math.min(maxStock, Math.max(0, quantity));

  const entry = state.storeCart.find((item) => item.productId === productId);
  if (!entry) return;

  if (safeQuantity === 0) {
    state.storeCart = state.storeCart.filter((item) => item.productId !== productId);
  } else {
    entry.quantity = safeQuantity;
  }
  saveState();
  renderStoreCart();
}

function removeStoreItem(productId) {
  state.storeCart = state.storeCart.filter((item) => item.productId !== productId);
  saveState();
  renderStoreCart();
}

function handleStoreProductsClick(event) {
  const button = event.target.closest("button[data-action='add']");
  if (!button) return;
  const productId = button.dataset.id;
  addStoreProductToCart(productId);
}

function handleStoreCartClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const productId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "remove") {
    removeStoreItem(productId);
    return;
  }

  const entry = state.storeCart.find((item) => item.productId === productId);
  if (!entry) return;

  if (action === "decrease") {
    setStoreItemQuantity(productId, entry.quantity - 1);
  }
  if (action === "increase") {
    setStoreItemQuantity(productId, entry.quantity + 1);
  }
}

function handleStoreSearch() {
  renderStoreProducts();
}

function handleStoreReset() {
  state.storeCart = [];
  saveState();
  if (elements.storeCustomer) elements.storeCustomer.value = "";
  if (elements.storeDiscount) elements.storeDiscount.value = "0";
  renderStoreCart();
  updateStoreTotals();
  elements.storeBarcodeInput?.focus();
}

// Mapping AZERTY vers ASCII pour corriger les problèmes de layout clavier
// Le scanner envoie des codes de touches qui sont interprétés comme AZERTY
// Rangée AZERTY: & é " ' ( - è _ ç à
// Correspond à:   1 2 3 4 5 6 7 8 9 0
const AZERTY_NUMBER_MAP = {
  '&': '1', '"': '3', "'": '4', '(': '5',
  '-': '6', '_': '8'
};

const AZERTY_LETTER_MAP = {
  'ê': 'e', 'ë': 'e',
  'ù': 'u', 'û': 'u', 'ü': 'u',
  'ô': 'o', 'ö': 'o',
  'î': 'i', 'ï': 'i',
  'À': 'A', 'Ê': 'E', 'Ë': 'E',
  'Ç': 'C', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
  'Ô': 'O', 'Ö': 'O',
  'Î': 'I', 'Ï': 'I',
  '²': '2', '³': '3', '°': '0'
};

// Détecter les patterns AZERTY courants et les convertir
// Exemple: çè_é"é'àé(&éç pourrait être 9876543210
// Exemple: çè_é_é'-éè(è& pourrait être 97822467571
function detectAndConvertAzertyPattern(text) {
  if (!text) return text;
  
  // Caractères AZERTY typiques des chiffres
  const azertyNumberChars = ['ç', 'è', 'é', 'à', '&', '"', "'", '(', '-', '_'];
  const azertyCount = Array.from(text).filter(c => azertyNumberChars.includes(c)).length;
  
  // Si plus de 20% des caractères sont des caractères AZERTY de chiffres, 
  // c'est probablement un code numérique mal interprété (seuil réduit pour mieux détecter)
  if (azertyCount > text.length * 0.2 || azertyCount >= 3) {
    // Convertir caractère par caractère selon le mapping AZERTY
    let converted = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Mapping spécifique pour les caractères ambigus (priorité aux chiffres)
      // Rangée AZERTY: & é " ' ( - è _ ç à
      // Correspond à:   1 2 3 4 5 6 7 8 9 0
      if (char === '&') {
        converted += '1';
      } else if (char === 'é') {
        converted += '2'; // Touche 2 en AZERTY
      } else if (char === '"') {
        converted += '3';
      } else if (char === "'") {
        converted += '4';
      } else if (char === '(') {
        converted += '5';
      } else if (char === '-') {
        converted += '6';
      } else if (char === 'è') {
        converted += '7'; // Touche 7 en AZERTY
      } else if (char === '_') {
        converted += '8';
      } else if (char === 'ç') {
        converted += '9'; // Touche 9 en AZERTY
      } else if (char === 'à') {
        converted += '0'; // Touche 0 en AZERTY
      } else if (AZERTY_NUMBER_MAP[char]) {
        converted += AZERTY_NUMBER_MAP[char];
      } else if (/[a-zA-Z0-9]/.test(char)) {
        converted += char; // Garder les caractères valides
      }
      // Ignorer les autres caractères
    }
    return converted;
  }
  
  return text;
}

// Fonction pour convertir AZERTY vers ASCII (pour les lettres restantes)
function convertAzertyToAscii(text) {
  if (!text) return "";
  let converted = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Convertir les lettres accentuées restantes
    if (AZERTY_LETTER_MAP[char]) {
      converted += AZERTY_LETTER_MAP[char];
    } else {
      converted += char;
    }
  }
  return converted;
}

// Fonction pour nettoyer et normaliser les codes scannés
// Si numbersOnly est true, ne garde que les chiffres (pour retrait colis)
function cleanScannedCode(rawCode, numbersOnly = false) {
  if (!rawCode) return "";
  
  // Étape 1: Détecter et convertir les patterns AZERTY
  let converted = detectAndConvertAzertyPattern(rawCode);
  
  // Étape 2: Convertir les caractères AZERTY restants vers ASCII
  converted = convertAzertyToAscii(converted);
  
  // Étape 3: Nettoyer selon le mode
  let cleaned;
  if (numbersOnly) {
    // Mode chiffres uniquement (pour retrait colis)
    cleaned = converted
      .replace(/[^0-9]/g, '') // Ne garder QUE les chiffres
      .trim();
  } else {
    // Mode normal : alphanumériques + tirets/underscores (pour inventaire et caisse)
    cleaned = converted
      .replace(/[^a-zA-Z0-9\-_]/g, '') // Ne garder que alphanumériques ASCII + tirets/underscores
      .trim();
  }
  
  // Vérifier que le code contient au moins un caractère valide
  if (numbersOnly) {
    if (!/[0-9]/.test(cleaned)) {
      return ""; // Code invalide (pas de chiffres)
    }
  } else {
    if (!/[a-zA-Z0-9]/.test(cleaned)) {
      return ""; // Code invalide (que des séparateurs)
    }
  }
  
  return cleaned;
}

// Fonction pour nettoyer le champ et détecter les scans USB
// IMPORTANT: Ne pas nettoyer en temps réel pour éviter de couper le code pendant le scan
function handleStoreBarcodeInput(event) {
  const input = event.target;
  const rawValue = input.value;
  
  // Mode diagnostic : afficher le code brut dans la console pour déboguer
  if (rawValue && rawValue.length > 0) {
    console.log('Code brut reçu du scanner:', rawValue, '| Longueur:', rawValue.length);
  }
  
  // NE PAS nettoyer en temps réel pendant le scan pour éviter de couper le code
  // On attend que le scan soit terminé avant de nettoyer
  
  // Détection automatique des scans USB
  // Les scanners USB envoient les caractères très rapidement
  // On attend 400ms après la dernière saisie pour être sûr que tout le code est arrivé
  if (storeBarcodeScanTimeout) {
    clearTimeout(storeBarcodeScanTimeout);
  }
  
  storeBarcodeScanTimeout = setTimeout(() => {
    const rawCode = input.value;
    console.log('Scan terminé, code complet reçu:', rawCode, '| Longueur:', rawCode.length);
    
    if (rawCode && rawCode.trim().length >= 2) {
      // Maintenant on nettoie le code complet (pas pendant le scan)
      const cleanedCode = cleanScannedCode(rawCode);
      console.log('Code nettoyé:', cleanedCode, '| Longueur:', cleanedCode.length);
      
      if (cleanedCode && cleanedCode.length >= 2 && /[a-zA-Z0-9]/.test(cleanedCode)) {
        // Mettre à jour le champ avec le code nettoyé
        input.value = cleanedCode;
        
        // Code valide détecté, traiter automatiquement
        console.log('Traitement automatique du code:', cleanedCode);
        const success = addStoreProductBySku(cleanedCode);
        if (success && input) {
          input.value = "";
        }
      } else {
        // Code invalide après nettoyage
        console.warn('Code scanné invalide (trop court ou que des séparateurs):', rawCode, '->', cleanedCode);
        // Ne pas vider le champ pour que l'utilisateur puisse voir ce qui a été scanné
      }
    }
    storeBarcodeScanTimeout = null;
  }, 400); // 400ms de pause = scan terminé (augmenté pour laisser le temps au code complet d'arriver)
}

function addStoreProductBySku(code) {
  // Nettoyer le code avant de chercher
  const cleanedCode = cleanScannedCode(code);
  
  // Si le code nettoyé est vide, trop court, ou ne contient que des séparateurs, c'est un scan invalide
  if (!cleanedCode || cleanedCode.length < 2) {
    // Ne pas afficher d'erreur pour un scan invalide, juste ignorer silencieusement
    return false;
  }
  
  // Vérifier que le code contient au moins un caractère alphanumérique
  if (!/[a-zA-Z0-9]/.test(cleanedCode)) {
    // Code ne contenant que des séparateurs, ignorer silencieusement
    return false;
  }
  
  const product = state.products.find((item) => {
    // Nettoyer aussi le SKU du produit pour la comparaison
    const cleanedSku = cleanScannedCode(item.sku);
    return cleanedSku === cleanedCode || item.sku === cleanedCode;
  });
  
  if (!product) {
    // Afficher une alerte seulement si le code nettoyé semble valide
    alert(`Aucun produit avec le code ${cleanedCode}.`);
    return false;
  }
  addStoreProductToCart(product.id);
  return true;
}

function handleStoreBarcodeSubmit(event) {
  if (event?.key && event.key !== "Enter") return;
  event?.preventDefault?.();
  const rawCode = elements.storeBarcodeInput?.value;
  if (!rawCode) return;
  
  // Nettoyer le code scanné
  const cleanedCode = cleanScannedCode(rawCode);
  if (!cleanedCode) {
    if (elements.storeBarcodeInput) {
      elements.storeBarcodeInput.value = "";
    }
    return;
  }
  
  // Mettre à jour le champ avec le code nettoyé
  if (elements.storeBarcodeInput) {
    elements.storeBarcodeInput.value = cleanedCode;
  }
  
  const success = addStoreProductBySku(cleanedCode);
  if (success && elements.storeBarcodeInput) {
    elements.storeBarcodeInput.value = "";
  }
}

function handleStoreDiscountChange() {
  getStoreDiscountRate();
  updateStoreTotals();
}

function handleStoreCheckout(event) {
  event.preventDefault();
  if (!state.storeCart.length) {
    alert("Le panier est vide.");
    return;
  }

  const insufficient = state.storeCart.find((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    return !product || item.quantity > product.stock;
  });

  if (insufficient) {
    alert("Stock insuffisant pour finaliser la vente. Vérifiez les quantités.");
    return;
  }

  const { subtotal, discountValue, total } = updateStoreTotals();

  state.storeCart.forEach((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    if (!product) return;
    const currentStock = Number.parseInt(product.stock, 10) || 0;
    product.stock = Math.max(0, currentStock - item.quantity);
  });

  // Ajouter des points de fidélité si un client est sélectionné
  const customerId = elements.storeCustomerId?.value;
  if (customerId && total > 0) {
    const customer = state.loyaltyCustomers.find((c) => c.id === customerId);
    if (customer) {
      // 1 point par euro dépensé (arrondi)
      const pointsEarned = Math.round(total);
      customer.points = (customer.points || 0) + pointsEarned;
      customer.totalSpent = (customer.totalSpent || 0) + total;
      customer.lastPurchase = Date.now();
      saveState();
      updateStoreCustomerInfo(customer);
      console.log(`Points ajoutés: ${pointsEarned} (Total: ${customer.points})`);
    }
  }

  state.storeCart = [];
  saveState();
  renderProducts();

  // Réinitialiser le client sélectionné
  clearStoreCustomer();
  if (elements.storeDiscount) elements.storeDiscount.value = "0";
  updateStoreTotals();

  if (total > 0) {
    setTpeBufferFromCents(Math.round(total * 100));
    setTpeStatus("Montant transféré depuis la caisse.");
  }

  const pointsMsg = customerId ? ` Points de fidélité ajoutés.` : "";
  alert(
    `Vente enregistrée : ${formatCurrency(total)} (dont remise ${formatCurrency(
      discountValue,
    )} sur un sous-total de ${formatCurrency(subtotal)}).${pointsMsg}`,
  );
  elements.storeBarcodeInput?.focus();
}

function getTpeAmountCents() {
  const cents = Number.parseInt(tpeBuffer, 10);
  return Number.isFinite(cents) && cents > 0 ? cents : 0;
}

function setTpeBufferFromCents(cents) {
  const safe = Math.max(0, Math.round(cents));
  tpeBuffer = safe.toString();
  if (!tpeBuffer.length) {
    tpeBuffer = "0";
  }
  if (tpeBuffer.length > 9) {
    tpeBuffer = tpeBuffer.slice(0, 9);
  }
  updateTpeDisplay();
}

function updateTpeDisplay() {
  if (elements.tpeAmount) {
    elements.tpeAmount.textContent = formatCurrency(getTpeAmountCents() / 100);
  }
}

function setTpeStatus(message) {
  if (elements.tpeStatus) {
    elements.tpeStatus.textContent = message;
  }
}

function appendTpeDigits(digits) {
  if (!/^\d+$/.test(digits)) return;
  if (tpeBuffer === "0") {
    const cleaned = digits === "00" ? "0" : digits.replace(/^0+/, "") || "0";
    tpeBuffer = cleaned;
  } else {
    tpeBuffer = `${tpeBuffer}${digits}`;
  }
  if (tpeBuffer.length > 9) {
    tpeBuffer = tpeBuffer.slice(0, 9);
  }
  updateTpeDisplay();
  setTpeStatus("En attente");
}

function removeTpeDigit() {
  if (tpeBuffer.length <= 1) {
    tpeBuffer = "0";
  } else {
    tpeBuffer = tpeBuffer.slice(0, -1);
  }
  updateTpeDisplay();
  setTpeStatus("En attente");
}

function handleTpeKeypadClick(event) {
  const button = event.target.closest("button[data-key]");
  if (!button) return;
  const { key } = button.dataset;
  if (key === "clear") {
    removeTpeDigit();
    return;
  }
  appendTpeDigits(key);
}

function renderTpeHistory() {
  if (!elements.tpeHistoryList) return;
  if (!state.tpeHistory.length) {
    elements.tpeHistoryList.innerHTML =
      '<li class="empty">Aucun paiement enregistré pour le moment.</li>';
    return;
  }

  elements.tpeHistoryList.innerHTML = state.tpeHistory
    .slice()
    .sort((a, b) => b.date - a.date)
    .map(
      (entry) => `
        <li>
          <span>${formatCurrency(entry.amount / 100)}</span>
          <small>${new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          }).format(entry.date)}</small>
        </li>
      `,
    )
    .join("");
}

function addTpeHistoryEntry(amountCents) {
  const entry = {
    id: generateId("tpe"),
    amount: amountCents,
    date: Date.now(),
  };
  state.tpeHistory.unshift(entry);
  state.tpeHistory = state.tpeHistory.slice(0, 50);
  saveState();
  renderTpeHistory();
}

function handleTpeCharge() {
  const cents = getTpeAmountCents();
  if (cents <= 0) {
    setTpeStatus("Montant invalide");
    return;
  }
  setTpeStatus("Paiement en cours…");
  setTimeout(() => {
    addTpeHistoryEntry(cents);
    setTpeStatus("Paiement accepté");
    setTpeBufferFromCents(0);
  }, 500);
}

function handleTpeManual() {
  const currentValue = (getTpeAmountCents() / 100).toFixed(2);
  const input = window.prompt("Montant à encaisser (€)", currentValue);
  if (input === null) return;
  const normalized = input.replace(",", ".").replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Veuillez saisir un montant supérieur à zéro.");
    return;
  }
  const cents = Math.round(amount * 100);
  setTpeBufferFromCents(cents);
  setTpeStatus("Montant prêt pour encaissement");
}

function handleTpeReset() {
  setTpeBufferFromCents(0);
  setTpeStatus("En attente");
}

function handleTpeHistoryClear() {
  if (!state.tpeHistory.length) {
    setTpeStatus("Historique déjà vide");
    return;
  }
  if (!window.confirm("Vider l'historique des encaissements ?")) return;
  state.tpeHistory = [];
  saveState();
  renderTpeHistory();
  setTpeStatus("Historique vidé");
}

function initializeTpe() {
  setTpeBufferFromCents(getTpeAmountCents());
  renderTpeHistory();
  setTpeStatus("En attente");
}

function deleteOrder(orderId) {
  state.orders = state.orders.filter((order) => order.id !== orderId);
  saveState();
  renderOrders();
}

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createProduct(formData) {
  return {
    id: generateId("prd"),
    name: formData.get("name").trim(),
    sku: formData.get("sku").trim(),
    price: Number.parseFloat(formData.get("price")),
    stock: Number.parseInt(formData.get("stock"), 10),
    description: formData.get("description")?.trim() ?? "",
    createdAt: Date.now(),
    image: pendingProductImageData
      ? {
          dataUrl: pendingProductImageData,
          name: pendingProductImageName,
        }
      : null,
  };
}

function generateOrderReference() {
  return `CMD-${Date.now().toString(36).toUpperCase()}`;
}

function createOrder({ items, customer, notes }) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("Aucun article dans la commande.");
  }

  const normalizedItems = items.map((item) => {
    const product = state.products.find((productItem) => productItem.id === item.productId);
    if (!product) {
      throw new Error("Produit introuvable dans l'inventaire.");
    }
    const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
    return {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.price,
    };
  });

  const firstItem = normalizedItems[0];
  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
    0,
  );

  return {
    id: generateId("ord"),
    reference: generateOrderReference(),
    productId: firstItem.productId,
    productSku: firstItem.productSku,
    productName: firstItem.productName,
    quantity: firstItem.quantity,
    customer,
    notes,
    status: "En préparation",
    createdAt: Date.now(),
    total: totalAmount,
    items: normalizedItems,
    history: [
      {
        status: "En préparation",
        date: Date.now(),
        note: "Commande créée manuellement depuis le tableau de bord.",
      },
    ],
  };
}

function handleProductSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const rawSku = formData.get("sku").trim();
  
  // Nettoyer le SKU avant de l'utiliser
  const sku = cleanScannedCode(rawSku);
  
  if (!sku || sku.length < 2) {
    alert("Le code-barres doit contenir au moins 2 caractères alphanumériques valides.");
    return;
  }
  
  if (state.products.some((product) => product.sku === sku)) {
    alert("Un produit avec ce code-barres existe déjà.");
    return;
  }
  
  // Mettre à jour le formulaire avec le SKU nettoyé
  if (elements.productSkuInput) {
    elements.productSkuInput.value = sku;
  }
  
  // Mettre à jour le FormData avec le SKU nettoyé
  formData.set("sku", sku);
  
  const product = createProduct(formData);
  state.products.push(product);
  saveState();
  renderProducts();
  event.target.reset();
  handleProductImageClear();
  elements.scanInput.value = product.sku;
  if (currentScanMode === "pickup") {
    showScanCard(product, undefined, "pickup");
  }
}

function handleOrderSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const rows =
    elements.orderItemsContainer?.querySelectorAll(".order-item-row") ?? form.querySelectorAll(".order-item-row");
  if (!rows.length) {
    alert("Ajoutez au moins un article à la commande.");
    return;
  }

  const items = [];
  for (const row of rows) {
    const select = row.querySelector(".order-item-select");
    const qtyInput = row.querySelector(".order-item-qty");
    const productId = select?.value;
    const quantity = Number.parseInt(qtyInput?.value ?? "1", 10);
    if (!productId) {
      alert("Sélectionnez un produit pour chaque ligne.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("La quantité doit être un nombre positif.");
      return;
    }
    items.push({ productId, quantity });
  }

  const customer = (elements.orderCustomer?.value ?? form.orderCustomer.value).trim();
  const notes = (elements.orderNotes?.value ?? form.orderNotes.value).trim();

  try {
    const order = createOrder({ items, customer, notes });
  state.orders.push(order);
  saveState();
  renderOrders();
  updateHomeStats();
    form.reset();
    if (elements.orderItemsContainer) {
      elements.orderItemsContainer.innerHTML = "";
      createOrderItemRow();
    }
    elements.orderCustomer?.focus();
  } catch (error) {
    alert(error.message || "Impossible de créer la commande.");
  }
}

function updateOrderStatus(orderId, status) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.status = status;
  order.history.push({
    status,
    date: Date.now(),
    note: `Statut défini sur "${status}"`,
  });
  saveState();
  renderOrders();

  const product = state.products.find((item) => item.id === order.productId);
  if (product && currentScanMode === "pickup") {
    showScanCard(product, order, "pickup");
  }
}

function showScanCard(product, order = null, mode = "inventory") {
  elements.scanResult.innerHTML = "";
  const card = document.createElement("div");
  card.className = "scan-card";
  card.dataset.mode = mode;

  const header = document.createElement("div");
  header.className = "scan-card-header";

  const title = document.createElement("div");
  title.innerHTML = `<h3>${product.name}</h3><p>${product.description || "Pas de description"}</p>`;

  const badge = document.createElement("span");
  badge.className = `badge ${classifyStock(product.stock)}`;
  badge.textContent = `${product.stock} en stock`;

  header.append(title, badge);
  card.append(header);

  const media = document.createElement("div");
  media.className = "scan-card-media";
  if (product.image?.dataUrl) {
    media.innerHTML = `<img src="${product.image.dataUrl}" alt="${product.image.name || product.name}" />`;
  } else {
    media.classList.add("placeholder");
    media.innerHTML = `
      <div class="scan-card-placeholder">
        <span class="material-symbols-rounded">image_not_supported</span>
        <p>Aucune image enregistrée</p>
      </div>
    `;
  }
  card.append(media);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
    <span>Code-barres : <strong>${product.sku}</strong></span>
    <span>Prix : <strong>${formatCurrency(product.price)}</strong></span>
    <span>Ajouté le : ${new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(product.createdAt)}</span>
  `;

  card.append(meta);

  if (order) {
    const status = document.createElement("div");
    status.className = "status-chip";
    status.dataset.status = order.status;
    status.textContent = `Commande ${order.reference} • ${order.status}`;
    card.append(status);
  }

  if (mode === "pickup") {
    const pickupBlock = document.createElement("div");
    pickupBlock.className = "scan-card-pickup";
    if (order) {
      const items = getOrderItems(order);
      const totalAmount =
        order.total ??
        items.reduce((sum, item) => sum + (item.unitPrice ?? product.price ?? 0) * (item.quantity ?? 0), 0);
      const orderInfo = document.createElement("div");
      orderInfo.className = "scan-card-order";
      orderInfo.innerHTML = `
        <span><strong>Commande :</strong> ${order.reference}</span>
        <span><strong>Client :</strong> ${order.customer || "—"}</span>
        <span><strong>Email :</strong> ${order.email || "—"}</span>
      `;

      const itemsList = document.createElement("ul");
      itemsList.className = "scan-card-items";
      items.forEach((item) => {
        const li = document.createElement("li");
        const amount =
          (item.unitPrice ?? product.price ?? 0) * Math.max(item.quantity ?? 0, 0);
        li.innerHTML = `<span>${item.quantity ?? 0} × ${item.productName ?? product.name}</span><strong>${formatCurrency(amount)}</strong>`;
        itemsList.appendChild(li);
      });

      const totalLine = document.createElement("p");
      totalLine.className = "scan-card-total";
      totalLine.innerHTML = `<strong>Total :</strong> ${formatCurrency(totalAmount)}`;

      const actions = document.createElement("div");
      actions.className = "scan-card-actions";

      if (order.status !== "Prêt pour retrait" && order.status !== "Remis au client") {
        const readyBtn = document.createElement("button");
        readyBtn.type = "button";
        readyBtn.className = "secondary";
        readyBtn.textContent = "Marquer prêt au retrait";
        readyBtn.addEventListener("click", () => {
          updateOrderStatus(order.id, "Prêt pour retrait");
        });
        actions.append(readyBtn);
      }

      if (order.status !== "Remis au client") {
        const deliverBtn = document.createElement("button");
        deliverBtn.type = "button";
        deliverBtn.textContent = "Remettre au client";
        deliverBtn.addEventListener("click", () => {
          updateOrderStatus(order.id, "Remis au client");
        });
        actions.append(deliverBtn);
      }

      pickupBlock.append(orderInfo);
      pickupBlock.append(itemsList);
      pickupBlock.append(totalLine);
      pickupBlock.append(actions);
    } else {
      pickupBlock.innerHTML = `
        <div class="scan-card-empty">
          <span class="material-symbols-rounded">info</span>
          <p>Aucune commande active trouvée pour ce produit.</p>
        </div>
      `;
    }
    card.append(pickupBlock);
  }

  const actions = document.createElement("div");
  actions.className = "form-actions";
  const openDrawerBtn = document.createElement("button");
  openDrawerBtn.className = "secondary";
  openDrawerBtn.type = "button";
  openDrawerBtn.textContent = "Voir les détails";
  openDrawerBtn.addEventListener("click", () => {
    openProductDrawer(product, order ?? undefined);
  });
  actions.append(openDrawerBtn);
  card.append(actions);

  elements.scanResult.appendChild(card);
}

function processScanValue(rawCode, mode = currentScanMode) {
  // Nettoyer le code avant de le traiter
  // Pour retrait colis (pickup), ne garder que les chiffres
  const numbersOnly = mode === "pickup";
  const cleanedCode = cleanScannedCode(rawCode.trim(), numbersOnly);
  if (!cleanedCode || cleanedCode.length < 2) {
    console.warn('Code scanné invalide dans processScanValue:', rawCode, '->', cleanedCode);
    return;
  }
  const code = cleanedCode;
  if (elements.scanResult) {
    elements.scanResult.dataset.context = mode;
  }
  let product = state.products.find((item) => item.sku === code);
  let relatedOrder = null;

  if (!product) {
    const orderByReference = state.orders.find((order) => order.reference === code);
    if (orderByReference) {
      relatedOrder = orderByReference;
      product = state.products.find((item) => item.id === orderByReference.productId);
    }
  }

  if (!product) {
    // Utiliser textContent pour éviter les problèmes d'injection avec les caractères spéciaux
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = `Aucun produit ou commande trouvé pour le code ${code}.`;
    elements.scanResult.innerHTML = '';
    elements.scanResult.appendChild(emptyState);
    return;
  }

  lastScanCode = code;
  lastScanMode = mode;

  if (!relatedOrder) {
    const candidates = state.orders
      .filter((order) => order.productId === product.id)
      .sort((a, b) => b.createdAt - a.createdAt);
    relatedOrder =
      mode === "pickup"
        ? candidates.find((order) => !["Remis au client", "Annulé"].includes(order.status))
        : candidates.find((order) => order.status !== "Livré");
  }

  showScanCard(product, relatedOrder ?? undefined, mode);
}

function handleScanSubmit(event) {
  event.preventDefault();
  const mode = event.currentTarget.dataset.mode ?? currentScanMode;
  currentScanMode = mode;
  const rawCode = elements.scanInput.value.trim();
  if (!rawCode) return;
  
  // Nettoyer le code avant de le traiter (chiffres uniquement pour retrait colis)
  const cleanedCode = cleanScannedCode(rawCode, true); // true = chiffres uniquement
  if (!cleanedCode || cleanedCode.length < 2) {
    console.warn('Code scanné invalide dans retrait colis:', rawCode, '->', cleanedCode);
    return;
  }
  
  // Mettre à jour le champ avec le code nettoyé
  elements.scanInput.value = cleanedCode;
  
  processScanValue(cleanedCode, mode);
}

function clearScan() {
  elements.scanInput.value = "";
  lastScanCode = "";
  lastScanMode = currentScanMode;
  const message =
    currentScanMode === "pickup"
      ? "Scannez un colis pour afficher les informations produit et commande."
      : "Scannez un produit pour voir les informations détaillées.";
  if (elements.scanResult) {
    elements.scanResult.dataset.context = currentScanMode;
  }
  // Utiliser textContent pour éviter les problèmes d'injection
  const emptyState = document.createElement('p');
  emptyState.className = 'empty-state';
  emptyState.textContent = message;
  elements.scanResult.innerHTML = '';
  elements.scanResult.appendChild(emptyState);
}

function resetProductImagePreview() {
  if (!elements.productImagePreview) return;
  elements.productImagePreview.innerHTML = IMAGE_PREVIEW_PLACEHOLDER;
  pendingProductImageData = null;
  pendingProductImageName = null;
  if (elements.productImageClear) {
    elements.productImageClear.disabled = true;
  }
}

function setProductImagePreview(dataUrl, name) {
  if (!elements.productImagePreview) return;
  if (dataUrl) {
    elements.productImagePreview.innerHTML = `<img src="${dataUrl}" alt="${name ?? "Image produit"}" />`;
    if (elements.productImageClear) {
      elements.productImageClear.disabled = false;
    }
  } else {
    resetProductImagePreview();
  }
}

function ensureScanOverlay() {
  if (!elements.scanModalVideo) return;
  let overlay = elements.scanModalVideo.querySelector(".scanner-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "scanner-overlay";
    overlay.innerHTML = `
      <div class="scanner-frame"></div>
      <div class="scanner-laser"></div>
    `;
    elements.scanModalVideo.appendChild(overlay);
  }
  overlay.classList.add("active");
  cameraState.overlay = overlay;
}

function triggerScanHighlight() {
  if (!cameraState.overlay) return;
  cameraState.overlay.classList.add("detected");
  clearTimeout(cameraState.overlayTimeout);
  cameraState.overlayTimeout = setTimeout(() => {
    cameraState.overlay?.classList.remove("detected");
  }, 500);
}

function resetScanOverlay() {
  if (cameraState.overlay) {
    cameraState.overlay.classList.remove("active", "detected");
  }
  if (cameraState.overlayTimeout) {
    clearTimeout(cameraState.overlayTimeout);
    cameraState.overlayTimeout = null;
  }
}

function handleProductImageClear() {
  if (elements.productImageInput) {
    elements.productImageInput.value = "";
  }
  resetProductImagePreview();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleProductImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    handleProductImageClear();
    return;
  }
  try {
    const dataUrl = await readFileAsDataURL(file);
    pendingProductImageData = dataUrl;
    pendingProductImageName = file.name;
    setProductImagePreview(dataUrl, file.name);
  } catch (error) {
    console.error("Erreur lors du chargement de l'image :", error);
    pendingProductImageData = null;
    pendingProductImageName = null;
    resetProductImagePreview();
    alert("Impossible de charger cette image. Essayez avec un autre fichier.");
  }
}

async function startSkuCamera() {
  if (!elements.scanModalVideo || !elements.scanModalOverlay?.classList.contains("visible")) {
    return;
  }
  elements.scanModalVideo.innerHTML = "";
  const videoElement = document.createElement("video");
  videoElement.setAttribute("autoplay", "true");
  videoElement.setAttribute("muted", "true");
  videoElement.setAttribute("playsinline", "true");
  videoElement.className = "scanner-video";
  elements.scanModalVideo.appendChild(videoElement);
  cameraState.videoElement = videoElement;
  ensureScanOverlay();

  try {
    if (elements.scanModalStatus) {
      elements.scanModalStatus.textContent = "Initialisation de la caméra...";
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Accès caméra non supporté par ce navigateur.");
    }

    if ("BarcodeDetector" in window) {
      await startWithBarcodeDetector(videoElement);
    } else {
      await startWithZxing(videoElement);
    }
  } catch (error) {
    console.error("Erreur d'initialisation du scanner :", error);
    if (elements.scanModalStatus) {
      elements.scanModalStatus.textContent = `Impossible d'activer la caméra : ${
        error?.message ?? error
      }`;
    }
    elements.scanModalVideo.innerHTML = `
      <div class="scanner-placeholder">
        <span class="material-symbols-rounded">warning</span>
        <p>${error?.message ?? "Erreur lors de l'accès à la caméra."}</p>
      </div>
    `;
  }
}

function stopSkuCamera() {
  cameraState.active = false;
  if (cameraState.rafId) {
    cancelAnimationFrame(cameraState.rafId);
    cameraState.rafId = null;
  }
  if (cameraState.stream) {
    cameraState.stream.getTracks().forEach((track) => track.stop());
    cameraState.stream = null;
  }
  if (cameraState.controls) {
    cameraState.controls.stop();
    cameraState.controls = null;
  }
  if (cameraState.reader) {
    cameraState.reader.reset();
  }
  if (cameraState.videoElement) {
    cameraState.videoElement.pause();
    cameraState.videoElement.srcObject = null;
    cameraState.videoElement = null;
  }
  resetScanOverlay();
  cameraState.usingDetector = false;

  if (elements.scanModalVideo) {
    elements.scanModalVideo.innerHTML = `
      <div class="scanner-placeholder">
        <span class="material-symbols-rounded">videocam</span>
        <p>Scanner en attente...</p>
      </div>
    `;
  }
  if (elements.scanModalStatus) {
    elements.scanModalStatus.textContent =
      "Autorisez l’accès à la caméra pour scanner automatiquement.";
  }
}

function openSkuScanner(targetInput = elements.productSkuInput) {
  if (!elements.scanModalOverlay) return;
  activeScanTarget = targetInput ?? elements.productSkuInput;
  elements.scanModalOverlay.classList.add("visible");
  elements.scanModalInput.value = "";
  if (elements.scanModalStatus) {
    elements.scanModalStatus.textContent = "Initialisation de la caméra...";
  }
  if (elements.scanModalVideo) {
    elements.scanModalVideo.innerHTML = `
      <div class="scanner-placeholder">
        <span class="material-symbols-rounded">videocam</span>
        <p>Scanner en attente...</p>
      </div>
    `;
  }
  setTimeout(() => {
    elements.scanModalInput.focus();
  }, 20);
  startSkuCamera();
}

function closeSkuScanner() {
  if (!elements.scanModalOverlay) return;
  stopSkuCamera();
  elements.scanModalOverlay.classList.remove("visible");
  elements.scanModalInput.blur();
  activeScanTarget = null;
}

function handleSkuScanSubmit(event) {
  event.preventDefault();
  const code = elements.scanModalInput.value.trim();
  if (!code) return;
  const target = activeScanTarget ?? elements.productSkuInput;
  target.value = code;
  closeSkuScanner();
  if (target === elements.scanInput) {
    processScanValue(code, "pickup");
  } else if (target === elements.storeBarcodeInput) {
    const success = addStoreProductBySku(code);
    target.value = success ? "" : code;
    target.focus();
  } else {
    target.focus();
  }
}

function renderHistory(history) {
  if (!history?.length) {
    return "<p>Aucun historique.</p>";
  }
  return `
    <ul class="history-list">
      ${history
        .slice()
        .sort((a, b) => b.date - a.date)
        .map(
          (entry) => `
          <li>
            <strong>${entry.status}</strong>
            <span>${new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(entry.date)}</span>
            <p>${entry.note}</p>
          </li>
        `,
        )
        .join("")}
    </ul>
  `;
}

function openProductDrawer(product, order) {
  activeDrawerProductId = product.id;
  activeDrawerOrderId = order?.id ?? null;
  elements.drawerTitle.textContent = product.name;
  elements.drawerSubtitle.textContent = `Code-barres : ${product.sku}`;

  elements.drawerContent.innerHTML = "";

  const productSection = document.createElement("section");
  productSection.className = "drawer-section";
  productSection.innerHTML = `
    <h4>Fiche produit</h4>
    <div class="drawer-product">
      <div class="drawer-product-media">
        ${
          product.image?.dataUrl
            ? `<img src="${product.image.dataUrl}" alt="${product.image.name || product.name}" />`
            : `<div class="drawer-product-placeholder">
                <span class="material-symbols-rounded">image_not_supported</span>
                <p>Aucune image disponible</p>
              </div>`
        }
      </div>
      <dl>
        <dt>Stock</dt>
        <dd>${product.stock}</dd>
        <dt>Prix</dt>
        <dd>${formatCurrency(product.price)}</dd>
        <dt>Description</dt>
        <dd>${product.description || "—"}</dd>
        <dt>Date d'ajout</dt>
        <dd>${new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(product.createdAt)}</dd>
      </dl>
    </div>
  `;

  elements.drawerContent.appendChild(productSection);

  const productOrders = state.orders
    .filter((item) => item.productId === product.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (productOrders.length) {
    const orderSection = document.createElement("section");
    orderSection.className = "drawer-section";
    orderSection.innerHTML = `
      <h4>Commandes liées (${productOrders.length})</h4>
      <div class="drawer-orders">
        ${productOrders
          .map((ord) => {
            const items = getOrderItems(ord);
            const itemsList = items
              .map(
                (item) => `
                  <li>
                    <span>${item.quantity ?? 0} × ${item.productName ?? "Produit"}</span>
                    <strong>${formatCurrency(
                      (item.unitPrice ?? product.price ?? 0) * (item.quantity ?? 0),
                    )}</strong>
                  </li>
                `,
              )
              .join("");
            const totalAmount =
              ord.total ??
              items.reduce(
                (sum, item) =>
                  sum + (item.unitPrice ?? product.price ?? 0) * (item.quantity ?? 0),
                0,
              );
            return `
              <article class="drawer-order">
                <header>
                  <strong>${ord.reference}</strong>
                  <span class="status-chip" data-status="${ord.status}">${ord.status}</span>
                </header>
                <p>Client : ${ord.customer || "—"} • Email : ${ord.email || "—"}</p>
                <ul class="drawer-order-items">
                  ${itemsList}
                </ul>
                <p><strong>Total :</strong> ${formatCurrency(totalAmount)}</p>
                <p>Notes : ${ord.notes || "—"}</p>
                <small>Créée le ${new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(ord.createdAt)}</small>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
    elements.drawerContent.appendChild(orderSection);
  }

  if (order) {
    const historySection = document.createElement("section");
    historySection.className = "drawer-section";
    historySection.innerHTML = `
      <h4>Historique de la commande</h4>
      ${renderHistory(order.history)}
    `;
    elements.drawerContent.appendChild(historySection);
  }

  elements.drawer.classList.add("open");
  elements.drawerOverlay.classList.add("visible");
}

function closeDrawer() {
  elements.drawer.classList.remove("open");
  elements.drawerOverlay.classList.remove("visible");
  activeDrawerProductId = null;
  activeDrawerOrderId = null;
}

function exportCSV(data, filename) {
  if (!data.length) {
    alert("Aucune donnée à exporter.");
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers
      .map((header) => {
        const value = item[header] ?? "";
        const normalized = typeof value === "object" ? JSON.stringify(value) : String(value);
        return `"${normalized.replace(/"/g, '""')}"`;
      })
      .join(";"),
  );
  const csvContent = [headers.join(";"), ...rows].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportProducts() {
  exportCSV(
    state.products.map((product) => ({
      id: product.id,
      nom: product.name,
      code_barres: product.sku,
      prix: product.price,
      stock: product.stock,
      description: product.description,
      image_nom: product.image?.name ?? "",
      cree_le: new Date(product.createdAt).toISOString(),
    })),
    `produits-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

function exportOrders() {
  exportCSV(
    state.orders.map((order) => {
      const items = getOrderItems(order);
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      const totalAmount =
        order.total ??
        items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 0), 0);

      return {
        id: order.id,
        reference: order.reference,
        client: order.customer,
        email: order.email ?? "",
        statut: order.status,
        total_articles: totalQuantity,
        montant_estime: totalAmount,
        cree_le: new Date(order.createdAt).toISOString(),
      };
    }),
    `commandes-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

function attachEventListeners() {
  elements.productForm?.addEventListener("submit", handleProductSubmit);
  // Nettoyer le champ SKU avec délai pour éviter de couper le code pendant le scan
  let productSkuTimeout = null;
  elements.productSkuInput?.addEventListener("input", (event) => {
    const input = event.target;
    const rawValue = input.value;
    
    // Attendre que le scan soit terminé avant de nettoyer
    if (productSkuTimeout) {
      clearTimeout(productSkuTimeout);
    }
    
    productSkuTimeout = setTimeout(() => {
      const cleanedValue = cleanScannedCode(rawValue);
      if (rawValue !== cleanedValue) {
        const cursorPosition = input.selectionStart;
        input.value = cleanedValue;
        const newPosition = Math.min(cursorPosition, cleanedValue.length);
        input.setSelectionRange(newPosition, newPosition);
      }
      productSkuTimeout = null;
    }, 300); // 300ms de délai pour laisser le temps au code complet d'arriver
  });
  elements.orderForm?.addEventListener("submit", handleOrderSubmit);
  elements.orderAddItem?.addEventListener("click", () => createOrderItemRow());
  elements.scanForm?.addEventListener("submit", handleScanSubmit);
  // Nettoyer le champ scanInput (page retrait colis) - nettoyage immédiat pour éviter les caractères AZERTY visibles
  let scanInputTimeout = null;
  elements.scanInput?.addEventListener("input", (event) => {
    const input = event.target;
    let rawValue = input.value;
    
    // Mode diagnostic
    if (rawValue && rawValue.length > 0) {
      console.log('Scan retrait colis - Code brut:', rawValue, '| Longueur:', rawValue.length);
    }
    
    // NETTOYAGE IMMÉDIAT pour éviter d'afficher les caractères AZERTY
    // Convertir immédiatement les caractères AZERTY en chiffres caractère par caractère
    let immediateClean = "";
    for (let i = 0; i < rawValue.length; i++) {
      const char = rawValue[i];
      // Conversion AZERTY → chiffres (immédiate et complète)
      if (char === '&') immediateClean += '1';
      else if (char === 'é' || char === 'É') immediateClean += '2';
      else if (char === '"') immediateClean += '3';
      else if (char === "'") immediateClean += '4';
      else if (char === '(') immediateClean += '5';
      else if (char === '-') immediateClean += '6';
      else if (char === 'è' || char === 'È') immediateClean += '7';
      else if (char === '_') immediateClean += '8';
      else if (char === 'ç' || char === 'Ç') immediateClean += '9';
      else if (char === 'à' || char === 'À') immediateClean += '0';
      else if (/[0-9]/.test(char)) immediateClean += char; // Garder les chiffres
      // Ignorer tous les autres caractères
    }
    
    // Appliquer immédiatement si différent
    if (rawValue !== immediateClean) {
      const cursorPosition = input.selectionStart;
      input.value = immediateClean;
      const newPosition = Math.min(cursorPosition, immediateClean.length);
      input.setSelectionRange(newPosition, newPosition);
      console.log('Scan retrait colis - Nettoyage immédiat:', rawValue, '->', immediateClean);
    }
    
    // Attendre la fin du scan pour le traitement final
    if (scanInputTimeout) {
      clearTimeout(scanInputTimeout);
    }
    
    scanInputTimeout = setTimeout(() => {
      const finalValue = input.value;
      const cleanedValue = cleanScannedCode(finalValue, true); // true = chiffres uniquement
      if (finalValue !== cleanedValue) {
        input.value = cleanedValue;
        console.log('Scan retrait colis - Code final nettoyé:', cleanedValue);
      }
      scanInputTimeout = null;
    }, 400); // 400ms de délai pour laisser le temps au code complet d'arriver
  });
  elements.clearScanResults?.addEventListener("click", clearScan);
  elements.drawerClose?.addEventListener("click", closeDrawer);
  elements.drawerOverlay?.addEventListener("click", closeDrawer);
  elements.exportProductsBtn?.addEventListener("click", exportProducts);
  elements.exportOrdersBtn?.addEventListener("click", exportOrders);
  elements.themeToggle?.addEventListener("change", toggleTheme);
  elements.productImageInput?.addEventListener("change", handleProductImageChange);
  elements.productImageClear?.addEventListener("click", handleProductImageClear);
  elements.scanSkuBtn?.addEventListener("click", () => openSkuScanner(elements.productSkuInput));
  elements.pickupScanBtn?.addEventListener("click", () => openSkuScanner(elements.scanInput));
  // Pour la caisse, on utilise un scanner USB (pas de caméra)
  elements.storeScanBtn?.addEventListener("click", () => {
    if (elements.storeBarcodeInput) {
      elements.storeBarcodeInput.focus();
      elements.storeBarcodeInput.select();
    }
  });
  elements.storeProductsList?.addEventListener("click", handleStoreProductsClick);
  elements.storeCartList?.addEventListener("click", handleStoreCartClick);
  elements.storeSearch?.addEventListener("input", handleStoreSearch);
  elements.storeBarcodeInput?.addEventListener("input", handleStoreBarcodeInput);
  elements.storeBarcodeInput?.addEventListener("keydown", handleStoreBarcodeSubmit);
  elements.storeResetBtn?.addEventListener("click", handleStoreReset);
  elements.storeDiscount?.addEventListener("input", handleStoreDiscountChange);
  elements.storeCheckoutForm?.addEventListener("submit", handleStoreCheckout);
  elements.storeCustomerSearch?.addEventListener("input", handleStoreCustomerSearch);
  elements.storeCustomerScanBtn?.addEventListener("click", handleStoreCustomerScan);
  elements.storeCustomerAddBtn?.addEventListener("click", handleStoreCustomerAdd);
  elements.storeCustomerClear?.addEventListener("click", clearStoreCustomer);
  elements.loyaltyCustomerForm?.addEventListener("submit", handleLoyaltyCustomerSubmit);
  elements.loyaltyAddCustomerBtn?.addEventListener("click", () => {
    if (elements.loyaltyCustomerForm) {
      elements.loyaltyCustomerForm.style.display = "grid";
      elements.loyaltyCustomerForm.reset();
      elements.loyaltyCustomerForm.dataset.editingId = "";
    }
    if (elements.loyaltyAddCustomerBtn) {
      elements.loyaltyAddCustomerBtn.style.display = "none";
    }
    if (elements.loyaltyFirstName) {
      elements.loyaltyFirstName.focus();
    }
  });
  elements.loyaltyCancelBtn?.addEventListener("click", () => {
    if (elements.loyaltyCustomerForm) {
      elements.loyaltyCustomerForm.style.display = "none";
      elements.loyaltyCustomerForm.reset();
      elements.loyaltyCustomerForm.dataset.editingId = "";
    }
    if (elements.loyaltyAddCustomerBtn) {
      elements.loyaltyAddCustomerBtn.style.display = "inline-block";
    }
  });
  elements.tpeKeypad?.addEventListener("click", handleTpeKeypadClick);
  elements.tpeChargeBtn?.addEventListener("click", handleTpeCharge);
  elements.tpeManualBtn?.addEventListener("click", handleTpeManual);
  elements.tpeReset?.addEventListener("click", handleTpeReset);
  elements.tpeHistoryClear?.addEventListener("click", handleTpeHistoryClear);
  elements.scanModalClose?.addEventListener("click", closeSkuScanner);
  elements.scanModalCancel?.addEventListener("click", closeSkuScanner);
  elements.scanModalOverlay?.addEventListener("click", (event) => {
    if (event.target === elements.scanModalOverlay) {
      closeSkuScanner();
    }
  });
  elements.scanModalForm?.addEventListener("submit", handleSkuScanSubmit);
  elements.navTriggers?.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const target = trigger.dataset.nav;
      if (target) {
        setActivePage(target);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (elements.scanModalOverlay?.classList.contains("visible")) {
        closeSkuScanner();
        return;
      }
      closeDrawer();
    }
  });
}

function hydrateUI() {
  ensureOrderItemRows();
  renderProducts();
  renderOrders();
  renderLoyaltyCustomers();
  clearScan();
  resetProductImagePreview();
  initializeTpe();
  updateStoreMetrics();
  setActivePage("home");
}

function init() {
  loadTheme();
  loadState();
  attachEventListeners();
  hydrateUI();

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      loadState();
      ensureOrderItemRows();
      renderProducts();
      renderOrders();
      renderStoreProducts();
      renderStoreCart();
      updateHomeStats();
    }
  });
}

init();

async function startWithBarcodeDetector(videoElement) {
  if (!cameraState.detector) {
    try {
      const supported = (await window.BarcodeDetector.getSupportedFormats?.()) ?? [];
      const formats = supported.filter((format) => cameraState.supportedFormats.includes(format));
      cameraState.detector = new window.BarcodeDetector({
        formats: formats.length ? formats : cameraState.supportedFormats,
      });
    } catch {
      cameraState.detector = new window.BarcodeDetector({ formats: cameraState.supportedFormats });
    }
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
    },
  });

  cameraState.stream = stream;
  videoElement.srcObject = stream;
  await videoElement.play();

  if (elements.scanModalStatus) {
    elements.scanModalStatus.textContent = "Scannez le code devant la caméra.";
  }

  cameraState.active = true;
  cameraState.usingDetector = true;

  const scanFrame = async () => {
    if (!cameraState.active || !cameraState.detector) return;
    try {
      const barcodes = await cameraState.detector.detect(videoElement);
        if (barcodes.length) {
            const rawValue = barcodes[0].rawValue?.trim();
          if (rawValue) {
            // Nettoyer le code scanné par la caméra
            // Si c'est pour retrait colis, ne garder que les chiffres
            const isPickup = activeScanTarget === elements.scanInput;
            const cleanedValue = cleanScannedCode(rawValue, isPickup);
            if (!cleanedValue || cleanedValue.length < 2) {
              console.warn('Code scanné invalide (caméra BarcodeDetector):', rawValue, '->', cleanedValue);
              return;
            }
            triggerScanHighlight();
            const target = activeScanTarget ?? elements.productSkuInput;
            target.value = cleanedValue;
            if (target === elements.scanInput) {
              processScanValue(cleanedValue, "pickup");
            }
            closeSkuScanner();
            return;
          }
        }
    } catch (error) {
      console.warn("Détection code-barres échouée :", error);
    }
    cameraState.rafId = requestAnimationFrame(scanFrame);
  };

  cameraState.rafId = requestAnimationFrame(scanFrame);
}

async function ensureZxingLoaded() {
  if (window.ZXing?.BrowserMultiFormatReader) return;

  await new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-zxing="true"]');
    if (script?.dataset.loaded === "done") {
      resolve();
      return;
    }
    if (!script) {
      script = document.createElement("script");
      script.dataset.zxing = "true";
      script.src = "https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "done";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        reject(new Error("Impossible de charger la librairie de lecture code-barres."));
      },
      { once: true },
    );
  });
}

async function startWithZxing(videoElement) {
  await ensureZxingLoaded();
  if (!window.ZXing?.BrowserMultiFormatReader) {
    throw new Error("Bibliothèque de décodage indisponible.");
  }

  if (!cameraState.reader) {
    cameraState.reader = new window.ZXing.BrowserMultiFormatReader();
  }

  const devices = await cameraState.reader.listVideoInputDevices();
  if (!devices.length) {
    throw new Error("Aucune caméra détectée.");
  }

  const preferredDeviceId =
    devices.find((device) => device.label?.toLowerCase().includes("back"))?.deviceId ?? devices[0].deviceId;

  if (elements.scanModalStatus) {
    elements.scanModalStatus.textContent = "Scannez le code devant la caméra.";
  }

  cameraState.active = true;
  cameraState.usingDetector = false;

  cameraState.controls = await cameraState.reader.decodeFromVideoDevice(
    preferredDeviceId,
    videoElement,
    (result, err) => {
      if (result) {
        const text = result.getText();
        if (text) {
          const rawValue = text.trim();
          // Nettoyer le code scanné par la caméra (ZXing)
          // Si c'est pour retrait colis, ne garder que les chiffres
          const isPickup = activeScanTarget === elements.scanInput;
          const cleanedValue = cleanScannedCode(rawValue, isPickup);
          if (!cleanedValue || cleanedValue.length < 2) {
            console.warn('Code scanné invalide (caméra ZXing):', rawValue, '->', cleanedValue);
            return;
          }
          triggerScanHighlight();
          const target = activeScanTarget ?? elements.productSkuInput;
          target.value = cleanedValue;
          if (target === elements.scanInput) {
            processScanValue(cleanedValue, "pickup");
          }
          closeSkuScanner();
        }
      }
      if (err && !(err instanceof window.ZXing.NotFoundException)) {
        console.warn("Erreur ZXing :", err);
      }
    },
  );
}

// ============================================
// SYSTÈME DE CARTES DE FIDÉLITÉ
// ============================================

// Générer un QR code pour un client
async function generateLoyaltyQRCode(customerId) {
  if (!window.QRCode) {
    console.error("Bibliothèque QRCode non chargée");
    return null;
  }
  
  try {
    const qrData = `LOYALTY:${customerId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Erreur génération QR code:", error);
    return null;
  }
}

// Créer un nouveau client
function createLoyaltyCustomer(formData) {
  return {
    id: generateId("loyalty"),
    firstName: formData.get("firstName").trim(),
    lastName: formData.get("lastName").trim(),
    email: formData.get("email")?.trim() || "",
    phone: formData.get("phone")?.trim() || "",
    points: Number.parseInt(formData.get("initialPoints") || "0", 10) || 0,
    totalSpent: 0,
    createdAt: Date.now(),
    lastPurchase: null,
    qrCode: null, // Sera généré à la demande
  };
}

// Rechercher un client
function searchLoyaltyCustomer(query) {
  if (!query || query.trim().length < 2) return [];
  
  const searchTerm = query.trim().toLowerCase();
  return state.loyaltyCustomers.filter((customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const email = (customer.email || "").toLowerCase();
    const phone = (customer.phone || "").toLowerCase();
    const customerId = customer.id.toLowerCase();
    
    return (
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      phone.includes(searchTerm) ||
      customerId.includes(searchTerm)
    );
  });
}

// Trouver un client par ID ou QR code
function findLoyaltyCustomerByIdOrQR(code) {
  // Nettoyer le code scanné
  const cleanedCode = cleanScannedCode(code);
  
  // Chercher par ID
  let customer = state.loyaltyCustomers.find((c) => c.id === cleanedCode);
  
  // Si pas trouvé, chercher par format QR "LOYALTY:ID"
  if (!customer && code.includes("LOYALTY:")) {
    const qrId = code.split("LOYALTY:")[1]?.trim();
    if (qrId) {
      customer = state.loyaltyCustomers.find((c) => c.id === qrId);
    }
  }
  
  return customer;
}

// Mettre à jour l'affichage du client dans la caisse
function updateStoreCustomerInfo(customer) {
  if (!customer || !elements.storeCustomerInfo) return;
  
  elements.storeCustomerName.textContent = `${customer.firstName} ${customer.lastName}`;
  elements.storeCustomerPoints.textContent = customer.points || 0;
  elements.storeCustomerId.value = customer.id;
  elements.storeCustomerInfo.style.display = "block";
  if (elements.storeCustomerSearch) {
    elements.storeCustomerSearch.value = "";
  }
}

// Effacer le client sélectionné
function clearStoreCustomer() {
  if (elements.storeCustomerInfo) {
    elements.storeCustomerInfo.style.display = "none";
  }
  if (elements.storeCustomerId) {
    elements.storeCustomerId.value = "";
  }
  if (elements.storeCustomerSearch) {
    elements.storeCustomerSearch.value = "";
  }
}

// Gérer la recherche de client dans la caisse
function handleStoreCustomerSearch(event) {
  const query = event.target.value.trim();
  
  if (!query || query.length < 2) {
    if (query.length === 0) {
      clearStoreCustomer();
    }
    return;
  }
  
  // Si c'est un code scanné (longueur > 10), chercher par ID/QR
  if (query.length > 10) {
    const customer = findLoyaltyCustomerByIdOrQR(query);
    if (customer) {
      updateStoreCustomerInfo(customer);
      return;
    }
  }
  
  // Sinon, chercher par nom/email/téléphone
  const results = searchLoyaltyCustomer(query);
  if (results.length === 1) {
    updateStoreCustomerInfo(results[0]);
  } else if (results.length > 1) {
    console.log("Plusieurs clients trouvés:", results);
    updateStoreCustomerInfo(results[0]);
  }
}

// Gérer le scan de QR code client
function handleStoreCustomerScan() {
  openSkuScanner(elements.storeCustomerSearch);
}

// Gérer l'ajout d'un nouveau client depuis la caisse
function handleStoreCustomerAdd() {
  setActivePage("loyalty");
  if (elements.loyaltyCustomerForm) {
    elements.loyaltyCustomerForm.style.display = "grid";
  }
  if (elements.loyaltyAddCustomerBtn) {
    elements.loyaltyAddCustomerBtn.style.display = "none";
  }
  if (elements.loyaltyFirstName) {
    elements.loyaltyFirstName.focus();
  }
}

// Afficher les clients de fidélité
function renderLoyaltyCustomers() {
  if (!elements.loyaltyCustomersTable) return;
  
  elements.loyaltyCustomersTable.innerHTML = "";
  
  if (!state.loyaltyCustomers.length) {
    if (elements.loyaltyEmptyState) {
      elements.loyaltyEmptyState.classList.remove("hidden");
    }
    return;
  }
  
  if (elements.loyaltyEmptyState) {
    elements.loyaltyEmptyState.classList.add("hidden");
  }
  
  state.loyaltyCustomers
    .slice()
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .forEach((customer) => {
      const row = document.createElement("tr");
      
      const nameCell = document.createElement("td");
      nameCell.innerHTML = `
        <div class="item-main">
          <div>
            <span class="item-title">${customer.firstName} ${customer.lastName}</span>
            <small class="item-description">ID: ${customer.id}</small>
          </div>
        </div>
      `;
      
      const pointsCell = document.createElement("td");
      pointsCell.innerHTML = `<span class="badge stock">${customer.points || 0} pts</span>`;
      
      const spentCell = document.createElement("td");
      spentCell.textContent = formatCurrency(customer.totalSpent || 0);
      
      const contactCell = document.createElement("td");
      const contactInfo = [];
      if (customer.email) contactInfo.push(customer.email);
      if (customer.phone) contactInfo.push(customer.phone);
      contactCell.textContent = contactInfo.join(" • ") || "—";
      
      const actionsCell = document.createElement("td");
      actionsCell.className = "table-actions";
      
      const qrBtn = document.createElement("button");
      qrBtn.className = "icon-button";
      qrBtn.title = "Voir QR code";
      qrBtn.innerHTML = '<span class="material-symbols-rounded">qr_code</span>';
      qrBtn.addEventListener("click", () => showLoyaltyQRCode(customer));
      
      const editBtn = document.createElement("button");
      editBtn.className = "icon-button";
      editBtn.title = "Modifier";
      editBtn.innerHTML = '<span class="material-symbols-rounded">edit</span>';
      editBtn.addEventListener("click", () => editLoyaltyCustomer(customer));
      
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "icon-button delete";
      deleteBtn.title = "Supprimer";
      deleteBtn.innerHTML = '<span class="material-symbols-rounded">delete</span>';
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Supprimer ${customer.firstName} ${customer.lastName} ?`)) {
          deleteLoyaltyCustomer(customer.id);
        }
      });
      
      actionsCell.append(qrBtn, editBtn, deleteBtn);
      
      row.append(nameCell, pointsCell, spentCell, contactCell, actionsCell);
      elements.loyaltyCustomersTable.appendChild(row);
    });
}

// Afficher le QR code d'un client
async function showLoyaltyQRCode(customer) {
  // Générer le QR code s'il n'existe pas encore
  if (!customer.qrCode) {
    customer.qrCode = await generateLoyaltyQRCode(customer.id);
    saveState();
  }
  
  elements.drawerTitle.textContent = `Carte de Fidélité - ${customer.firstName} ${customer.lastName}`;
  elements.drawerSubtitle.textContent = `${customer.points || 0} points`;
  
  elements.drawerContent.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="margin-bottom: 1.5rem;">
        <img src="${customer.qrCode}" alt="QR Code" style="max-width: 300px; border: 2px solid var(--border); padding: 1rem; background: white; border-radius: var(--radius-xs);" />
      </div>
      <div style="margin-bottom: 1rem;">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;"><strong>${customer.firstName} ${customer.lastName}</strong></p>
        <p style="margin: 0.25rem 0;">Points: <strong style="color: var(--accent);">${customer.points || 0}</strong></p>
        ${customer.email ? `<p style="margin: 0.25rem 0; font-size: 0.9em; color: var(--text-muted);">${customer.email}</p>` : ''}
        ${customer.phone ? `<p style="margin: 0.25rem 0; font-size: 0.9em; color: var(--text-muted);">${customer.phone}</p>` : ''}
        <p style="font-size: 0.85em; color: var(--text-muted); margin-top: 0.5rem;">ID: ${customer.id}</p>
      </div>
      <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem;">
        <button type="button" class="secondary" onclick="window.print()">
          <span class="material-symbols-rounded">print</span>
          Imprimer
        </button>
        <button type="button" class="secondary" onclick="navigator.clipboard.writeText('${customer.id}').then(() => alert('ID copié !'))">
          <span class="material-symbols-rounded">content_copy</span>
          Copier ID
        </button>
      </div>
    </div>
  `;
  
  elements.drawer.classList.add("open");
  elements.drawerOverlay.classList.add("visible");
}

// Modifier un client
function editLoyaltyCustomer(customer) {
  if (elements.loyaltyCustomerForm) {
    elements.loyaltyCustomerForm.style.display = "grid";
    elements.loyaltyCustomerForm.dataset.editingId = customer.id;
    
    if (elements.loyaltyFirstName) elements.loyaltyFirstName.value = customer.firstName;
    if (elements.loyaltyLastName) elements.loyaltyLastName.value = customer.lastName;
    if (elements.loyaltyEmail) elements.loyaltyEmail.value = customer.email || "";
    if (elements.loyaltyPhone) elements.loyaltyPhone.value = customer.phone || "";
    if (elements.loyaltyInitialPoints) elements.loyaltyInitialPoints.value = customer.points || 0;
    
    if (elements.loyaltyFirstName) elements.loyaltyFirstName.focus();
  }
}

// Supprimer un client
function deleteLoyaltyCustomer(customerId) {
  state.loyaltyCustomers = state.loyaltyCustomers.filter((c) => c.id !== customerId);
  saveState();
  renderLoyaltyCustomers();
}

// Gérer la soumission du formulaire de client
async function handleLoyaltyCustomerSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  
  const editingId = event.target.dataset.editingId;
  let newCustomer = null;
  
  if (editingId) {
    // Modification
    const customer = state.loyaltyCustomers.find((c) => c.id === editingId);
    if (customer) {
      customer.firstName = formData.get("firstName").trim();
      customer.lastName = formData.get("lastName").trim();
      customer.email = formData.get("email")?.trim() || "";
      customer.phone = formData.get("phone")?.trim() || "";
      const newPoints = Number.parseInt(formData.get("initialPoints") || "0", 10) || 0;
      if (newPoints !== customer.points) {
        customer.points = newPoints;
      }
      customer.qrCode = null; // Régénérer le QR code
      newCustomer = customer;
    }
  } else {
    // Création - générer le QR code immédiatement
    const customer = createLoyaltyCustomer(formData);
    // Générer le QR code dès la création
    customer.qrCode = await generateLoyaltyQRCode(customer.id);
    state.loyaltyCustomers.push(customer);
    newCustomer = customer;
  }
  
  saveState();
  renderLoyaltyCustomers();
  
  event.target.reset();
  event.target.dataset.editingId = "";
  if (elements.loyaltyCustomerForm) {
    elements.loyaltyCustomerForm.style.display = "none";
  }
  if (elements.loyaltyAddCustomerBtn) {
    elements.loyaltyAddCustomerBtn.style.display = "inline-block";
  }
  
  // Si c'est une nouvelle création, afficher immédiatement le QR code
  if (newCustomer && !editingId) {
    // Attendre un peu pour que le formulaire se ferme
    setTimeout(() => {
      showLoyaltyQRCode(newCustomer);
    }, 300);
  }
}

// Initialiser la page de fidélité
function initLoyaltyPage() {
  renderLoyaltyCustomers();
}

