(function () {
  "use strict";

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

  var CHANNEL_BASE = { Organic: 0.34, Paid: 0.26, Email: 0.16, Social: 0.15, Referral: 0.09 };

  function channelShare(name, dayIndex, dow, rnd) {
    var base = CHANNEL_BASE[name];
    var noise = 0.9 + rnd() * 0.2;
    if (name === "Organic") return base * (1 + 0.0035 * dayIndex) * noise;
    if (name === "Paid") {
      var phase = dayIndex % 18;
      return base * (0.72 + 0.62 * Math.exp(-phase / 8)) * noise;
    }
    if (name === "Email") return base * (dow === 2 ? 1.85 : 0.82) * noise;
    if (name === "Social") return base * (dow === 0 || dow === 6 ? 1.5 : 0.84) * noise;
    var spike = rnd() < 0.055 ? 2.6 + rnd() * 2.4 : 1;
    return base * 0.62 * spike * noise;
  }

  function generateDataset(seed, days) {
    var rnd = mulberry32(seed);
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var total = days * 2;
    var base = 8200 + rnd() * 2600;

    var timeline = [];
    for (var i = 0; i < total; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() - (total - 1 - i));
      var dow = d.getDay();
      var parts = {};
      var revenue = 0;
      CHANNELS.forEach(function (name) {
        var v = Math.round(base * channelShare(name, i, dow, rnd));
        parts[name] = v;
        revenue += v;
      });
      var orders = Math.round(revenue / (58 + rnd() * 26));
      var visitors = Math.round(orders / (0.021 + rnd() * 0.012));
      timeline.push({
        date: localDateKey(d),
        revenue: revenue,
        orders: orders,
        visitors: visitors,
        channels: parts
      });
    }

    var series = timeline.slice(days);
    var prevSeries = timeline.slice(0, days);

    var channels = CHANNELS.map(function (name) {
      var sum = 0;
      series.forEach(function (row) { sum += row.channels[name]; });
      return { name: name, revenue: sum };
    });

    var catBase = CATEGORIES.map(function () { return 0.6 + rnd(); });
    var catSum = catBase.reduce(function (a, b) { return a + b; }, 0);
    var catDaily = CATEGORIES.map(function () { return new Array(total); });
    timeline.forEach(function (row, idx) {
      var w = CATEGORIES.map(function (_, k) { return catBase[k] * (0.92 + 0.16 * rnd()); });
      var ws = w.reduce(function (a, b) { return a + b; }, 0);
      CATEGORIES.forEach(function (_, k) { catDaily[k][idx] = row.revenue * w[k] / ws; });
    });

    var categories = CATEGORIES.map(function (name, k) {
      var sum = 0;
      for (var idx = days; idx < total; idx++) sum += catDaily[k][idx];
      return { name: name, revenue: Math.round(sum) };
    });

    var catMembers = CATEGORIES.map(function () {
      return [0, 1, 2, 3].map(function () { return 0.5 + rnd(); });
    });
    catMembers.forEach(function (ws) {
      var s = ws.reduce(function (a, b) { return a + b; }, 0);
      for (var j = 0; j < ws.length; j++) ws[j] /= s;
    });

    var products = PRODUCT_NAMES.map(function (name, idx) {
      var catIdx = idx % CATEGORIES.length;
      var memberIdx = Math.floor(idx / CATEGORIES.length);
      var price = 18 + Math.round(rnd() * 180);
      var itemsPerOrder = 1.2 + rnd() * 2.3;
      var r = rnd();
      var dailyFactor = r < 0.35 ? 1.002 + rnd() * 0.004 : (r < 0.7 ? 0.998 + rnd() * 0.004 : 0.994 + rnd() * 0.004);
      var weight = catMembers[catIdx][memberIdx];
      var dailyUnits = new Array(total);
      var dailyOrders = new Array(total);
      for (var i2 = 0; i2 < total; i2++) {
        var u = catDaily[catIdx][i2] * weight * Math.pow(dailyFactor, i2) / price;
        dailyUnits[i2] = u;
        dailyOrders[i2] = u / itemsPerOrder;
      }
      return {
        name: name,
        category: CATEGORIES[catIdx],
        price: price,
        dailyUnits: dailyUnits,
        dailyOrders: dailyOrders
      };
    });

    return {
      seed: seed,
      days: days,
      series: series,
      prevSeries: prevSeries,
      channels: channels,
      categories: categories,
      products: products
    };
  }

  window.DashboardData = {
    generate: generateDataset,
    CHANNELS: CHANNELS,
    CATEGORIES: CATEGORIES
  };
})();
