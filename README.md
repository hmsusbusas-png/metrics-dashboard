# Дашборд аналитики продаж

Статический дашборд на ванильном JavaScript и Chart.js. Все данные генерируются прямо в браузере через seeded PRNG, поэтому числа детерминированные и воспроизводимые. Бэкенда нет.

**Live demo:** [hmsusbusas-png.github.io/metrics-dashboard](https://hmsusbusas-png.github.io/metrics-dashboard/)

![Дашборд, десктопная версия](screenshots/desktop.png)

## Что внутри

- KPI-карточки: выручка, заказы, средний чек, конверсия — у каждой дельта к прошлому периоду
- Линейный график выручки по дням с градиентной заливкой
- Bar chart по каналам (Organic, Paid, Email, Social, Referral) и donut по долям категорий
- Таблица топ-продуктов: сортировка кликом по любому заголовку, живой поиск
- Фильтр периода 7 / 30 / 90 дней — пересчитываются все виджеты
- Кнопка Regenerate data: новый детерминированный датасет из случайного сида
- Экспорт CSV: выгружает строки, которые сейчас видны в таблице, с учётом активного поиска и сортировки
- Тёмная и светлая темы: переключатель с сохранением в localStorage, учитывает prefers-color-scheme, цвета графиков обновляются на лету

## Как посмотреть

```powershell
# PowerShell, из папки проекта
python -m http.server 8000
# дальше открыть http://localhost:8000
```

Сборки нет, подойдёт любой статический сервер.

## Честно об ограничениях

- Данные ненастоящие: их генерирует mulberry32 (seeded PRNG) в браузере, ничего никуда не отправляется
- Chart.js подключён с CDN — без интернета графики не отрисуются
- Авторизации, истории и реальных источников данных нет, это демо

## Структура

```
metrics-dashboard/
├── index.html        # разметка
├── css/style.css     # токены темы и раскладка
├── js/data.js        # seeded PRNG (mulberry32) и генератор демо-данных
├── js/charts.js      # отрисовка Chart.js, destroy/recreate при обновлениях
├── js/main.js        # состояние, фильтры, сортировка и поиск в таблице, CSV, темы
├── screenshots/      # desktop.png, mobile.png
└── favicon.svg
```

## Стек

Ванильный JavaScript, Chart.js с CDN, CSS-переменные для тем. Без сборки и зависимостей.

---

## EN

A static sales analytics dashboard in vanilla JS + Chart.js. All data is generated in the browser with a seeded PRNG (mulberry32) — deterministic, reproducible, nothing leaves the page. KPI cards, line/bar/doughnut charts, sortable searchable table, 7/30/90-day filter, CSV export, dark/light theme with localStorage. Open `index.html` or run `python -m http.server 8000`. Live: https://hmsusbusas-png.github.io/metrics-dashboard/
