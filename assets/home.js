(function () {
  "use strict";

  var grid = document.getElementById("work-grid");
  var search = document.getElementById("catalog-search");
  var filters = document.getElementById("filter-list");
  var resultCount = document.getElementById("result-count");
  var emptyMessage = document.getElementById("empty-message");
  var items = [];
  var selectedCategory = "すべて";

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) { element.className = className; }
    if (text !== undefined) { element.textContent = text; }
    return element;
  }

  function normalized(value) {
    return String(value || "").toLocaleLowerCase("ja").replace(/\s+/g, "");
  }

  function itemMatches(item, query) {
    if (selectedCategory !== "すべて" && item.category !== selectedCategory) {
      return false;
    }

    if (!query) { return true; }

    return normalized([
      item.title,
      item.category,
      item.description,
      (item.tags || []).join(" ")
    ].join(" ")).indexOf(query) !== -1;
  }

  function createCard(item, index) {
    var article = makeElement("article", "work-card");
    article.style.setProperty("--card-delay", (index * 55) + "ms");

    var visual = makeElement("div", "work-visual");
    visual.setAttribute("aria-hidden", "true");
    visual.textContent = item.icon || "🎮";

    var body = makeElement("div", "work-body");
    var category = makeElement("p", "work-category", item.category || "その他");
    var title = makeElement("h3", "work-title", item.title);
    var description = makeElement("p", "work-description", item.description);
    var tags = makeElement("div", "tag-list");

    (item.tags || []).forEach(function (tag) {
      tags.appendChild(makeElement("span", "tag", tag));
    });

    var link = makeElement("a", "work-link", "ひらく");
    link.href = item.path;
    link.setAttribute("aria-label", item.title + "をひらく");
    link.appendChild(makeElement("span", "work-link-arrow", "→"));

    body.appendChild(category);
    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(tags);
    body.appendChild(link);

    article.appendChild(visual);
    article.appendChild(body);
    return article;
  }

  function render() {
    var query = normalized(search.value);
    var visible = items.filter(function (item) {
      return itemMatches(item, query);
    });

    grid.replaceChildren();
    visible.forEach(function (item, index) {
      grid.appendChild(createCard(item, index));
    });

    resultCount.textContent = visible.length + "件を表示中";
    emptyMessage.hidden = visible.length !== 0;
  }

  function buildFilters() {
    var categories = ["すべて"];
    items.forEach(function (item) {
      if (categories.indexOf(item.category) === -1) {
        categories.push(item.category);
      }
    });

    categories.forEach(function (category) {
      var button = makeElement("button", "filter-button", category);
      button.type = "button";
      button.setAttribute("aria-pressed", category === selectedCategory ? "true" : "false");
      button.addEventListener("click", function () {
        selectedCategory = category;
        Array.prototype.forEach.call(filters.children, function (child) {
          child.setAttribute("aria-pressed", child === button ? "true" : "false");
        });
        render();
      });
      filters.appendChild(button);
    });
  }

  search.addEventListener("input", render);

  fetch("/catalog.json")
    .then(function (response) {
      if (!response.ok) { throw new Error("一覧を読み込めませんでした"); }
      return response.json();
    })
    .then(function (data) {
      items = Array.isArray(data) ? data : [];
      buildFilters();
      render();
    })
    .catch(function () {
      resultCount.textContent = "読み込みに失敗しました";
      grid.appendChild(makeElement(
        "p",
        "load-error",
        "作品一覧を読み込めませんでした。ページを再読み込みしてください。"
      ));
    });
})();
