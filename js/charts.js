(function () {
  "use strict";

  var charts = { revenue: null, channels: null, categories: null };

  function palette() {
    var styles = getComputedStyle(document.documentElement);
    function v(name) { return styles.getPropertyValue(name).trim(); }
    return {
      accent: v("--accent") || "#6366F1",
      grid: v("--chart-grid") || "rgba(24,24,27,0.07)",
      text: v("--chart-text") || "#71717A",
      up: v("--up") || "#16A34A",
      down: v("--down") || "#DC2626"
    };
  }

  function destroyAll() {
    Object.keys(charts).forEach(function (key) {
      if (charts[key]) {
        charts[key].destroy();
        charts[key] = null;
      }
    });
  }

  function revenueGradient(chart) {
    var area = chart.chartArea;
    if (!area) return "rgba(99, 102, 241, 0.28)";
    var height = Math.round(area.bottom - area.top);
    var cache = chart.$revenueGradient;
    if (!cache || cache.height !== height) {
      var gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.28)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 0)");
      cache = { height: height, gradient: gradient };
      chart.$revenueGradient = cache;
    }
    return cache.gradient;
  }

  function renderRevenue(series) {
    var el = document.getElementById("revenue-chart");
    if (!el || typeof Chart === "undefined") return;
    var p = palette();
    var ctx = el.getContext("2d");

    charts.revenue = new Chart(ctx, {
      type: "line",
      data: {
        labels: series.map(function (s) { return s.date.slice(5); }),
        datasets: [{
          label: "Revenue",
          data: series.map(function (s) { return s.revenue; }),
          borderColor: p.accent,
          backgroundColor: function (context) { return revenueGradient(context.chart); },
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: p.accent,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (item) { return "Revenue: $" + item.parsed.y.toLocaleString("en-US"); }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: p.text, maxTicksLimit: 10, font: { size: 11 } } },
          y: {
            grid: { color: p.grid },
            border: { display: false },
            ticks: {
              color: p.text,
              font: { size: 11 },
              callback: function (value) { return "$" + (value / 1000).toFixed(0) + "k"; }
            }
          }
        }
      }
    });
  }

  function renderChannels(channels) {
    var el = document.getElementById("channels-chart");
    if (!el || typeof Chart === "undefined") return;
    var p = palette();
    charts.channels = new Chart(el.getContext("2d"), {
      type: "bar",
      data: {
        labels: channels.map(function (c) { return c.name; }),
        datasets: [{
          data: channels.map(function (c) { return c.revenue; }),
          backgroundColor: "rgba(99, 102, 241, 0.75)",
          hoverBackgroundColor: p.accent,
          borderRadius: 6,
          maxBarThickness: 34
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: p.text, font: { size: 11 } } },
          y: {
            grid: { color: p.grid },
            border: { display: false },
            ticks: {
              color: p.text,
              font: { size: 11 },
              callback: function (value) { return "$" + (value / 1000).toFixed(0) + "k"; }
            }
          }
        }
      }
    });
  }

  function renderCategories(categories) {
    var el = document.getElementById("categories-chart");
    if (!el || typeof Chart === "undefined") return;
    var p = palette();
    var colors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
    charts.categories = new Chart(el.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: categories.map(function (c) { return c.name; }),
        datasets: [{
          data: categories.map(function (c) { return c.revenue; }),
          backgroundColor: colors,
          borderColor: getComputedStyle(document.body).getPropertyValue("--panel").trim() || "#fff",
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "right", labels: { color: p.text, boxWidth: 10, boxHeight: 10, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: function (item) {
                var total = item.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                var pct = total ? Math.round(item.parsed / total * 100) : 0;
                return item.label + ": $" + item.parsed.toLocaleString("en-US") + " (" + pct + "%)";
              }
            }
          }
        }
      }
    });
  }

  window.DashboardCharts = {
    palette: palette,
    renderAll: function (data) {
      destroyAll();
      renderRevenue(data.series);
      renderChannels(data.channels);
      renderCategories(data.categories);
    },
    destroyAll: destroyAll
  };
})();
