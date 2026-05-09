const API_BASE = window.location.origin;

const state = {
  table: null,
  rows: []
};

function getSetupKey() {
  const params = new URLSearchParams(window.location.search);

  return (
    document.getElementById("setupKey").value ||
    params.get("key") ||
    ""
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatValue(row, column) {
  const value = row[column.key];

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (column.type === "datetime") {
    try {
      return escapeHtml(
        new Date(value).toLocaleString()
      );
    } catch {
      return "—";
    }
  }

  if (typeof value === "object") {
    return escapeHtml(JSON.stringify(value));
  }

  return escapeHtml(
    String(value).replace(/_/g, " ")
  );
}

function renderCategories(categories = {}) {
  const cardWrap = document.getElementById("categoryCards");
  const select = document.getElementById("categoryFilter");

  cardWrap.innerHTML = "";

  select.innerHTML = `
    <option value="">All categories</option>
  `;

  Object.entries(categories).forEach(([id, category]) => {
    const option = document.createElement("option");

    option.value = id;
    option.textContent = category.title || id;

    select.appendChild(option);
  });

  Object.entries(categories).forEach(([id, category]) => {
    const count = state.rows.filter(
      row => row.product_category === id
    ).length;

    const card = document.createElement("article");

    card.className =
      "glass-panel inventory-category-card";

    card.innerHTML = `
      <span>${escapeHtml(category.title || id)}</span>
      <strong>${count}</strong>
      <small>${escapeHtml(category.description || "")}</small>
    `;

    cardWrap.appendChild(card);
  });
}

function renderTable(table, rows) {
  const thead = document.querySelector(
    "#inventoryTable thead"
  );

  const tbody = document.querySelector(
    "#inventoryTable tbody"
  );

  const columns = (table.columns || []).filter(
    column => column.visible !== false
  );

  document.getElementById("tableTitle").textContent =
    table.title || "Tag Inventory";

  thead.innerHTML = `
    <tr>
      ${columns
        .map(
          column =>
            `<th>${escapeHtml(column.label)}</th>`
        )
        .join("")}
    </tr>
  `;

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${columns.length || 1}">
          No inventory found.
          Create tags using:
          /admin/create-manufactured-tags?key=YOUR_SETUP_SECRET&count=10
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = rows
    .map(row => {
      return `
        <tr>
          ${columns
            .map(column => {
              return `
                <td data-type="${escapeHtml(column.type || "text")}">
                  ${formatValue(row, column)}
                </td>
              `;
            })
            .join("")}
        </tr>
      `;
    })
    .join("");
}

function renderSummary(summary = {}) {
  const status = summary.statuses || {};

  document.getElementById(
    "inventorySummary"
  ).textContent = [
    `${summary.total_returned || 0} rows`,
    `${status.in_stock || 0} in stock`,
    `${status.not_activated || 0} not activated`,
    `${status.activated || 0} activated`
  ].join(" • ");
}

async function loadInventory() {
  const key = getSetupKey();

  if (!key) {
    throw new Error("SETUP_SECRET key required");
  }

  const category =
    document.getElementById("categoryFilter").value;

  const params = new URLSearchParams({
    key
  });

  if (category) {
    params.set("category", category);
  }

  const response = await fetch(
    `${API_BASE}/admin/tag-inventory?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error || "Unable to load inventory"
    );
  }

  state.table = data.table || {};
  state.rows = data.rows || [];

  renderCategories(state.table.categories || {});
  renderTable(state.table, state.rows);
  renderSummary(data.summary || {});
}

document.getElementById("setupKey").value =
  new URLSearchParams(window.location.search).get("key") ||
  "";

document
  .getElementById("loadInventory")
  .addEventListener("click", () => {
    loadInventory().catch(error => {
      document.getElementById(
        "inventorySummary"
      ).textContent = error.message;

      console.error(error);
    });
  });

window.addEventListener("DOMContentLoaded", () => {
  const key = getSetupKey();

  if (key) {
    loadInventory().catch(error => {
      document.getElementById(
        "inventorySummary"
      ).textContent = error.message;

      console.error(error);
    });
  }
});
