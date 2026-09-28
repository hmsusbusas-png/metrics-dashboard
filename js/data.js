/* Deterministic demo data. Same seed -> same dataset, so screenshots and
   numbers stay stable between reloads. */
(function () {
  "use strict";

  // mulberry32: small, fast, good enough for demo data
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Local YYYY-MM-DD. toISOString() would shift the label a day back for
     UTC+ timezones: Moscow midnight is 21:00 of the previous day in UTC. */
  function localDateKey(d) {
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  var CHANNELS = ["Organic", "Paid", "Email", "Social", "Referral"];
  var CATEGORIES = ["Electronics", "Apparel", "Home & Garden", "Beauty", "Sports"];
  var PRODUCT_NAMES = [
    "Aurora Headphones", "Nimbus Smartwatch", "Vertex Keyboard", "Pulse Earbuds",
    "Atlas Backpack", "Drift Sneakers", "Cove Hoodie", "Ember Jacket",
    "Terra Planter", "Willow Desk Lamp", "Cedar Side Table", "Moss Throw",
    "Lumen Face Serum", "Velvet Lip Tint", "Sage Body Wash", "Iris Perfume",
    "Summit Yoga Mat", "Flex Dumbbells", "Ridge Water Bottle", "Trail Cap"
  ];

  function generateDataset(seed, days) {
    var rnd = mulberry32(seed);
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var series = [];
    var base = 8200 + rnd() * 2600;
    var weekly = [0.82, 0.95, 1.0, 1.03, 1.08, 1.18, 1.12]; // Sun..Sat

    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(today.getDate() - i);
      var dow = weekly[d.getDay()];
      var drift = 1 + (days - i) / days * 0.22; // mild upward trend
      var noise = 0.88 + rnd() * 0.26;
      var revenue = Math.round(base * dow * drift * noise);
      var orders = Math.round(revenue / (58 + rnd() * 26));
      var visitors = Math.round(orders / (0.021 + rnd() * 0.012));
      series.push({
        date: localDateKey(d),
        revenue: revenue,
        orders: orders,
        visitors: visitors
      });
    }

    var channelWeights = [0.34, 0.26, 0.16, 0.15, 0.09].map(function (w) {
      return w * (0.85 + rnd() * 0.3);
    });
    var weightSum = channelWeights.reduce(function (a, b) { return a + b; }, 0);
    var totalRevenue = series.reduce(function (a, s) { return a + s.revenue; }, 0);
    var channels = CHANNELS.map(function (name, idx) {
      return {
        name: name,
        revenue: Math.round(totalRevenue * channelWeights[idx] / weightSum)
      };
    });

    var catWeights = CATEGORIES.map(function () { return 0.6 + rnd(); });
    var catSum = catWeights.reduce(function (a, b) { return a + b; }, 0);
    var categories = CATEGORIES.map(function (name, idx) {
      return {
        name: name,
        revenue: Math.round(totalRevenue * catWeights[idx] / catSum)
      };
    });

    var products = PRODUCT_NAMES.map(function (name, idx) {
      var category = CATEGORIES[idx % CATEGORIES.length];
      var units = Math.round(40 + rnd() * 460);
      var price = 18 + Math.round(rnd() * 180);
      var prevUnits = Math.round(units * (0.72 + rnd() * 0.55));
      return {
        name: name,
        category: category,
        units: units,
        revenue: units * price,
        aov: Math.round(units * price / Math.max(1, Math.round(units / (6 + rnd() * 8)))),
        trend: prevUnits > 0 ? (units - prevUnits) / prevUnits : 0
      };
    });

    return { seed: seed, days: days, series: series, channels: channels, categories: categories, products: products };
  }

  window.DashboardData = {
    generate: generateDataset,
    CHANNELS: CHANNELS,
    CATEGORIES: CATEGORIES
  };
})();
