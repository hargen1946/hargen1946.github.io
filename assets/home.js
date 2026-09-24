(function () {
  "use strict";

  var grid = document.getElementById("work-grid");
  var filters = document.getElementById("filter-list");
  var resultCount = document.getElementById("result-count");
  var emptyMessage = document.getElementById("empty-message");
  var items = [];
  var selectedCategory = null;
var installButton = document.getElementById("install-button");
var installHelp = document.getElementById("install-help");
var installPrompt;
var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
var isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

if (isMobile && installButton) {
  installButton.hidden = false;
}

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });

  if (installButton) {
    installButton.addEventListener("click", function () {
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then(function () {
          installPrompt = null;
          installButton.hidden = true;
        });
        return;
      }
      installHelp.hidden = false;
      installHelp.textContent = isIOS
        ? "iPhoneでは、画面下の共有ボタンから「ホーム画面に追加」を選んでください。"
        : "Androidでは、画面右上の︙メニューから「ホーム画面に追加」を選んでください。";
    });
  }

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) { element.className = className; }
    if (text !== undefined) { element.textContent = text; }
    return element;
  }

  function itemMatches(item) {
    return !selectedCategory || item.category === selectedCategory;
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
    var visible = items.filter(function (item) {
      return itemMatches(item);
    });

    grid.replaceChildren();
    visible.forEach(function (item, index) {
      grid.appendChild(createCard(item, index));
    });

    resultCount.textContent = visible.length + "件を表示中";
    emptyMessage.hidden = visible.length !== 0;
  }

  function buildFilters() {
    var categories = [];
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
        selectedCategory = selectedCategory === category ? null : category;
        Array.prototype.forEach.call(filters.children, function (child) {
          child.setAttribute("aria-pressed", child === button && selectedCategory ? "true" : "false");
        });
        render();
      });
      filters.appendChild(button);
    });
  }

  fetch("/catalog.json?v=3")
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
