(function () {
  "use strict";

  var state = {
    seed: 42,
    days: 30,
    sortKey: "revenue",
    sortDir: "desc",
    search: ""
  };

  var dataset = null;

  function fmtMoney(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtPct(n) { return n.toFixed(2) + "%"; }
  function fmtDelta(n) { return (n >= 0 ? "+" : "") + n.toFixed(1) + "%"; }

  function sum(arr, fn) {
    return arr.reduce(function (acc, x) { return acc + fn(x); }, 0);
  }

  function sumRange(arr, from, to) {
    var s = 0;
    for (var i = from; i < to; i++) s += arr[i];
    return s;
  }

  var KPI_META = [
    { key: "revenue", label: "Revenue", icon: "M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { key: "orders", label: "Orders", icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" },
    { key: "aov", label: "Avg Order Value", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { key: "conversion", label: "Conversion Rate", icon: "M22 12h-4l-3 9L9 3l-3 9H2" }
  ];

  function computeKpis(rows) {
    var revenue = sum(rows, function (s) { return s.revenue; });
    var orders = sum(rows, function (s) { return s.orders; });
    var visitors = sum(rows, function (s) { return s.visitors; });
    return {
      revenue: revenue,
      orders: orders,
      aov: orders ? revenue / orders : 0,
      conversion: visitors ? orders / visitors * 100 : 0
    };
  }

  function kpiIcon(path) {
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
  }

  function renderKpis() {
    var grid = document.getElementById("kpi-grid");
    if (!grid || !dataset) return;
    var current = computeKpis(dataset.series);
    var previous = computeKpis(dataset.prevSeries);

    grid.innerHTML = KPI_META.map(function (meta) {
      var value = current[meta.key];
      var prev = previous[meta.key];
      var delta = prev ? (value - prev) / prev * 100 : 0;
      var dir = delta >= 0 ? "is-up" : "is-down";
      var arrow = delta >= 0
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M16 17H7V8"/></svg>';
      var text = meta.key === "conversion" ? fmtPct(value) : fmtMoney(value);
      if (meta.key === "orders") text = fmtInt(value);
      return '<article class="card kpi">' +
        '<div class="kpi__label">' + kpiIcon(meta.icon) + meta.label + "</div>" +
        '<div class="kpi__value">' + text + "</div>" +
        '<div class="kpi__delta ' + dir + '">' + arrow + fmtDelta(delta) +
        '<span class="vs">vs prev. period</span></div>' +
        "</article>";
    }).join("");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("dashboard-theme", theme); } catch (e) {}
    if (dataset && window.DashboardCharts) window.DashboardCharts.renderAll(dataset);
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("dashboard-theme"); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  }

  function productRow(p, days) {
    var total = p.dailyUnits.length;
    var units = Math.round(sumRange(p.dailyUnits, days, total));
    var revenue = units * p.price;
    var orders = sumRange(p.dailyOrders, days, total);
    var last7 = sumRange(p.dailyUnits, total - 7, total);
    var prev7 = sumRange(p.dailyUnits, total - 14, total - 7);
    return {
      name: p.name,
      category: p.category,
      units: units,
      revenue: revenue,
      aov: orders > 0 ? revenue / orders : 0,
      trend: prev7 > 0 ? (last7 - prev7) / prev7 : 0
    };
  }

  function buildDataset(seed, days) {
    var data = window.DashboardData.generate(seed, days);
    data.products = data.products.map(function (p) { return productRow(p, days); });
    return data;
  }

  function trendCell(value) {
    var dir = value >= 0 ? "is-up" : "is-down";
    var arrow = value >= 0 ? "M7 17 17 7M8 7h9v9" : "M7 7l10 10M16 17H7V8";
    return '<span class="trend-cell ' + dir + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + arrow + '"/></svg>' +
      fmtDelta(value * 100) + "</span>";
  }

  function visibleProducts() {
    var query = state.search.trim().toLowerCase();
    var rows = dataset.products.filter(function (p) {
      return !query || p.name.toLowerCase().indexOf(query) !== -1 || p.category.toLowerCase().indexOf(query) !== -1;
    });
    return rows.slice().sort(function (a, b) {
      var va = a[state.sortKey];
      var vb = b[state.sortKey];
      var cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return state.sortDir === "asc" ? cmp : -cmp;
    });
  }

  function renderTable() {
    var body = document.getElementById("products-body");
    var empty = document.getElementById("table-empty");
    if (!body || !dataset) return;

    var rows = visibleProducts();

    body.innerHTML = rows.map(function (p) {
      return "<tr>" +
        '<td class="product-name">' + p.name + "</td>" +
        '<td><span class="badge">' + p.category + "</span></td>" +
        '<td class="num">' + fmtInt(p.units) + "</td>" +
        '<td class="num">' + fmtMoney(p.revenue) + "</td>" +
        '<td class="num">' + fmtMoney(p.aov) + "</td>" +
        "<td>" + trendCell(p.trend) + "</td>" +
        "</tr>";
    }).join("");

    if (empty) empty.hidden = rows.length > 0;

    document.querySelectorAll(".th-sort").forEach(function (btn) {
      btn.classList.remove("is-sorted-asc", "is-sorted-desc");
      if (btn.getAttribute("data-key") === state.sortKey) {
        btn.classList.add(state.sortDir === "asc" ? "is-sorted-asc" : "is-sorted-desc");
      }
    });

    document.querySelectorAll("#products-table thead th").forEach(function (th) {
      var btn = th.querySelector(".th-sort");
      var active = Boolean(btn) && btn.getAttribute("data-key") === state.sortKey;
      th.setAttribute("aria-sort", active ? (state.sortDir === "asc" ? "ascending" : "descending") : "none");
    });
  }

  function exportCsv() {
    if (!dataset) return;
    var header = "Product,Category,Units,Revenue,Avg Order,Trend %";
    var lines = visibleProducts().map(function (p) {
      return [p.name, p.category, p.units, p.revenue, p.aov, (p.trend * 100).toFixed(1)]
        .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; })
        .join(",");
    });
    var blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "top-products-" + state.days + "d.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function renderAll() {
    renderKpis();
    if (window.DashboardCharts) window.DashboardCharts.renderAll(dataset);
    renderTable();
  }

  function regenerate() {
    state.seed = Math.floor(Math.random() * 1e9);
    dataset = buildDataset(state.seed, state.days);
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();

    dataset = buildDataset(state.seed, state.days);
    renderAll();

    document.querySelectorAll(".period-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var days = parseInt(btn.getAttribute("data-days"), 10);
        if (!days || days === state.days) return;
        state.days = days;
        document.querySelectorAll(".period-btn").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        dataset = buildDataset(state.seed, state.days);
        renderAll();
      });
    });

    var regenBtn = document.getElementById("regenerate-btn");
    if (regenBtn) regenBtn.addEventListener("click", regenerate);

    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
      });
    }

    var searchInput = document.getElementById("product-search");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        state.search = e.target.value;
        renderTable();
      });
    }

    var exportBtn = document.getElementById("export-btn");
    if (exportBtn) exportBtn.addEventListener("click", exportCsv);

    document.querySelectorAll(".th-sort").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-key");
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = key === "name" || key === "category" ? "asc" : "desc";
        }
        renderTable();
      });
    });
  });
})();
