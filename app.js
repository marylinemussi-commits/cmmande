const STORAGE_KEY = "gestionCommandesState_v1";
const THEME_KEY = "gestionCommandesTheme_v1";

const STATUS_OPTIONS = [
  "En préparation",
  "En cours de livraison",
  "Livré",
  "En attente",
  "Annulé",
];

const state = {
  products: [],
  orders: [],
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
  orderProductSelect: document.querySelector("#orderProduct"),
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
};

const cameraState = {
  reader: null,
  controls: null,
  videoElement: null,
  initializing: false,
};

const IMAGE_PREVIEW_PLACEHOLDER = `
  <div class="image-preview-placeholder">
    <span class="material-symbols-rounded">image</span>
    <p>Aucune image sélectionnée</p>
  </div>
`;

let pendingProductImageData = null;
let pendingProductImageName = null;

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
  elements.orderProductSelect.innerHTML = "";
  if (!state.products.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Ajoutez d'abord un produit";
    option.disabled = true;
    option.selected = true;
    elements.orderProductSelect.appendChild(option);
    elements.orderProductSelect.disabled = true;
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choisissez un produit";
  placeholder.disabled = true;
  placeholder.selected = true;
  elements.orderProductSelect.appendChild(placeholder);

  state.products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} • ${product.sku}`;
    elements.orderProductSelect.appendChild(option);
  });
  elements.orderProductSelect.disabled = false;
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

      row.querySelector(".icon-button.view").addEventListener("click", () => {
        openProductDrawer(product);
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
}

function renderOrders() {
  elements.orderTableBody.innerHTML = "";
  if (!state.orders.length) {
    elements.ordersEmptyState.classList.remove("hidden");
    return;
  }
  elements.ordersEmptyState.classList.add("hidden");

  state.orders
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((order) => {
      const row = elements.orderRowTemplate.content.cloneNode(true);
      row.querySelector(".item-title").textContent = order.reference;
      row.querySelector(".item-date").textContent = new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(order.createdAt);

      row.querySelector(".item-product").textContent = order.productName;
      row.querySelector(".item-quantity").textContent = `Quantité : ${order.quantity}`;
      row.querySelector(".item-customer").textContent = order.customer;
      row.querySelector(".item-notes").textContent = order.notes || "—";

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
}

function deleteProduct(productId) {
  state.products = state.products.filter((product) => product.id !== productId);
  saveState();
  renderProducts();
  renderProductOptions();
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

function createOrder({ productId, quantity, customer, notes }) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) throw new Error("Produit introuvable");

  const reference = `CMD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${(
    Math.random() * 10000
  )
    .toFixed(0)
    .padStart(4, "0")}`;

  return {
    id: generateId("ord"),
    productId: product.id,
    productSku: product.sku,
    productName: product.name,
    quantity,
    customer,
    notes,
    status: "En préparation",
    createdAt: Date.now(),
    history: [
      {
        status: "En préparation",
        date: Date.now(),
        note: "Création de la commande",
      },
    ],
  };
}

function handleProductSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const sku = formData.get("sku").trim();
  if (state.products.some((product) => product.sku === sku)) {
    alert("Un produit avec ce code-barres existe déjà.");
    return;
  }
  const product = createProduct(formData);
  state.products.push(product);
  saveState();
  renderProducts();
  renderProductOptions();
  event.target.reset();
  elements.scanInput.value = product.sku;
  showScanCard(product);
}

function handleOrderSubmit(event) {
  event.preventDefault();
  const productId = elements.orderProductSelect.value;
  if (!productId) {
    alert("Sélectionnez un produit.");
    return;
  }
  const quantity = Number.parseInt(elements.orderQuantity.value, 10);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    alert("La quantité doit être un nombre positif.");
    return;
  }
  const customer = elements.orderCustomer.value.trim();
  const notes = elements.orderNotes.value.trim();

  const order = createOrder({ productId, quantity, customer, notes });
  state.orders.push(order);
  saveState();
  renderOrders();
  elements.orderForm.reset();
  elements.orderProductSelect.value = "";
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
  if (product) {
    showScanCard(product, order);
  }
}

function showScanCard(product, order = null) {
  elements.scanResult.innerHTML = "";
  const card = document.createElement("div");
  card.className = "scan-card";

  const header = document.createElement("div");
  header.className = "scan-card-header";

  const title = document.createElement("div");
  title.innerHTML = `<h3>${product.name}</h3><p>${product.description || "Pas de description"}</p>`;

  const badge = document.createElement("span");
  badge.className = `badge ${classifyStock(product.stock)}`;
  badge.textContent = `${product.stock} en stock`;

  header.append(title, badge);

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

  card.append(header, meta);

  if (order) {
    const status = document.createElement("div");
    status.className = "status-chip";
    status.dataset.status = order.status;
    status.textContent = `Commande ${order.reference} • ${order.status}`;
    card.append(status);
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

function handleScanSubmit(event) {
  event.preventDefault();
  const code = elements.scanInput.value.trim();
  if (!code) return;
  const product = state.products.find((item) => item.sku === code);
  if (!product) {
    elements.scanResult.innerHTML = `<p class="empty-state">Aucun produit trouvé pour le code ${code}.</p>`;
    return;
  }

  const relatedOrder = state.orders.find(
    (order) => order.productId === product.id && order.status !== "Livré",
  );
  showScanCard(product, relatedOrder ?? undefined);
}

function clearScan() {
  elements.scanInput.value = "";
  elements.scanResult.innerHTML =
    '<p class="empty-state">Scannez un produit pour voir les informations détaillées.</p>';
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

async function loadBarcodeReader() {
  if (cameraState.reader || cameraState.initializing) {
    return cameraState.reader;
  }
  cameraState.initializing = true;
  try {
    if (elements.scanModalStatus) {
      elements.scanModalStatus.textContent = "Chargement du scanner...";
    }
    const module = await import(
      "https://cdn.jsdelivr.net/npm/@zxing/library@0.19.3/esm/index.min.js"
    );
    cameraState.reader = new module.BrowserMultiFormatReader();
    return cameraState.reader;
  } catch (error) {
    console.error("Erreur de chargement du scanner :", error);
    if (elements.scanModalStatus) {
      elements.scanModalStatus.textContent =
        "Impossible de charger le module de lecture. Saisissez le code manuellement.";
    }
    throw error;
  } finally {
    cameraState.initializing = false;
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

  try {
    const reader = await loadBarcodeReader();
    if (!reader) return;
    const devices = await reader.listVideoInputDevices();
    if (!devices.length) {
      throw new Error("Aucune caméra détectée.");
    }
    const preferredDeviceId =
      devices.find((device) => device.label.toLowerCase().includes("back"))?.deviceId ??
      devices[0].deviceId;

    if (elements.scanModalStatus) {
      elements.scanModalStatus.textContent = "Scannez le code-barres devant la caméra.";
    }

    cameraState.controls = await reader.decodeFromVideoDevice(
      preferredDeviceId,
      videoElement,
      (result, err) => {
        if (result) {
          const text = result.getText();
          if (text) {
            elements.productSkuInput.value = text.trim();
            closeSkuScanner();
          }
        }
        // Ignore décodages partiels (err)
      },
    );
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
  if (cameraState.controls) {
    cameraState.controls.stop();
    cameraState.controls = null;
  }
  if (cameraState.reader) {
    cameraState.reader.reset();
  }
  if (cameraState.videoElement) {
    cameraState.videoElement.srcObject = null;
    cameraState.videoElement = null;
  }
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

function openSkuScanner() {
  if (!elements.scanModalOverlay) return;
  elements.scanModalOverlay.classList.add("visible");
  elements.scanModalInput.value = "";
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
}

function handleSkuScanSubmit(event) {
  event.preventDefault();
  const code = elements.scanModalInput.value.trim();
  if (!code) return;
  elements.productSkuInput.value = code;
  closeSkuScanner();
  elements.productSkuInput.focus();
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
  elements.drawerTitle.textContent = product.name;
  elements.drawerSubtitle.textContent = `Code-barres : ${product.sku}`;

  elements.drawerContent.innerHTML = "";

  const productSection = document.createElement("section");
  productSection.className = "drawer-section";
  productSection.innerHTML = `
    <h4>Fiche produit</h4>
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
          .map(
            (ord) => `
              <article class="drawer-order">
                <header>
                  <strong>${ord.reference}</strong>
                  <span class="status-chip" data-status="${ord.status}">${ord.status}</span>
                </header>
                <p>Quantité : ${ord.quantity} • Client : ${ord.customer}</p>
                <p>Notes : ${ord.notes || "—"}</p>
                <small>Créée le ${new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(ord.createdAt)}</small>
              </article>
            `,
          )
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
      cree_le: new Date(product.createdAt).toISOString(),
    })),
    `produits-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

function exportOrders() {
  exportCSV(
    state.orders.map((order) => ({
      id: order.id,
      reference: order.reference,
      produit: order.productName,
      code_barres: order.productSku,
      quantite: order.quantity,
      client: order.customer,
      notes: order.notes,
      statut: order.status,
      cree_le: new Date(order.createdAt).toISOString(),
    })),
    `commandes-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

function attachEventListeners() {
  elements.productForm?.addEventListener("submit", handleProductSubmit);
  elements.orderForm?.addEventListener("submit", handleOrderSubmit);
  elements.scanForm?.addEventListener("submit", handleScanSubmit);
  elements.clearScanResults?.addEventListener("click", clearScan);
  elements.drawerClose?.addEventListener("click", closeDrawer);
  elements.drawerOverlay?.addEventListener("click", closeDrawer);
  elements.exportProductsBtn?.addEventListener("click", exportProducts);
  elements.exportOrdersBtn?.addEventListener("click", exportOrders);
  elements.themeToggle?.addEventListener("change", toggleTheme);
  elements.scanSkuBtn?.addEventListener("click", openSkuScanner);
  elements.scanModalClose?.addEventListener("click", closeSkuScanner);
  elements.scanModalCancel?.addEventListener("click", closeSkuScanner);
  elements.scanModalOverlay?.addEventListener("click", (event) => {
    if (event.target === elements.scanModalOverlay) {
      closeSkuScanner();
    }
  });
  elements.scanModalForm?.addEventListener("submit", handleSkuScanSubmit);

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
  renderProducts();
  renderOrders();
  renderProductOptions();
  clearScan();
}

function init() {
  loadTheme();
  loadState();
  attachEventListeners();
  hydrateUI();
}

init();

