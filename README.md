# Sales Analytics Dashboard

A static, dependency-light sales analytics dashboard built with vanilla JavaScript and Chart.js. All data is generated in the browser with a seeded PRNG, so the numbers are deterministic and reproducible. No backend required.

**Live demo:** [hmsusbusas-png.github.io/metrics-dashboard](https://hmsusbusas-png.github.io/metrics-dashboard/)

![Desktop view](screenshots/desktop.png)

## Features

- **KPI cards**: Revenue, Orders, Avg Order Value and Conversion Rate, each with a delta versus the previous period.
- **Revenue line chart**: daily revenue with a gradient fill.
- **Channel breakdown**: bar chart across Organic, Paid, Email, Social and Referral.
- **Category share**: doughnut chart of revenue distribution.
- **Top products table**: sortable by any column (click a header) with live search.
- **Period filter**: 7 / 30 / 90 days; every widget recalculates.
- **Regenerate data**: produces a new deterministic dataset from a random seed.
- **CSV export**: downloads the products currently visible in the table, with the active search and sort applied.
- **Dark / light theme**: toggle with `localStorage` persistence, respects `prefers-color-scheme`, Chart.js colors update on switch.

## Quick start

No build step. Serve the folder with any static server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project structure

```
index.html        markup
css/style.css     theme tokens + layout
js/data.js        seeded PRNG (mulberry32) + demo data generator
js/charts.js      Chart.js rendering, destroy/recreate on updates
js/main.js        state, filters, table sort/search, CSV export, theming
```

## Screenshots

- Desktop: `screenshots/desktop.png`
- Mobile: `screenshots/mobile.png`

---

## Дашборд аналитики продаж

Статический дашборд на vanilla JavaScript и Chart.js. Данные генерируются в браузере через seeded PRNG (детерминированно), бэкенд не нужен.

**Возможности:** KPI-карточки с дельтами к прошлому периоду, линейный график выручки с градиентной заливкой, bar chart по каналам, donut по категориям, таблица топ-продуктов с сортировкой и поиском, фильтр периода 7/30/90 дней, кнопка Regenerate data, экспорт CSV, тёмная/светлая тема с сохранением в localStorage.

**Быстрый старт:**

```bash
python -m http.server 8000
```

Открыть <http://localhost:8000>.

Скриншоты: `screenshots/desktop.png`, `screenshots/mobile.png`.
