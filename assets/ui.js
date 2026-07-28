
/* ============================================================
   ゲームひろば 共通の仕組み  ui.js
   ------------------------------------------------------------
   ・画面の上に「文字の大きさ 小/中/大」と「音 あり/なし」の
     ボタンを自動で置きます。
   ・選んだ設定はブラウザに覚えさせ、次に開いたときも、
     ほかのゲームに移ったときも、そのまま引き継ぎます。

   各ページの <head> に次の2行を書くだけで動きます。
     <link rel="stylesheet" href="/assets/base.css">
     <script src="/assets/ui.js"></script>
   ============================================================ */

(function () {
  "use strict";

  var SIZE_KEY  = "gh-size";
  var SOUND_KEY = "gh-sound";
  var SIZES = ["small", "normal", "large"];
  var LABELS = { small: "小", normal: "中", large: "大" };

  /* --- 保存の読み書き（使えない環境でも落ちないように） --- */

  function read(key, fallback) {
    try {
      var v = window.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* 保存できなくても、その回だけは動きます */
    }
  }

  /* --- 文字の大きさ --- */

  function currentSize() {
    var s = read(SIZE_KEY, "normal");
    return SIZES.indexOf(s) === -1 ? "normal" : s;
  }

  function applySize(size) {
    document.documentElement.setAttribute("data-size", size);
  }

  /* 画面がちらつかないよう、いちばん先に反映します */
  applySize(currentSize());

  /* --- 音 --- */

  function soundEnabled() {
    return read(SOUND_KEY, "on") !== "off";
  }

  /* ゲームから使えるようにします（例： if (GH.soundEnabled()) …） */
  window.GH = {
    soundEnabled: soundEnabled,
    size: currentSize
  };

  /* --- 設定バーを作る --- */

  function makeButton(text, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    if (label) { b.setAttribute("aria-label", label); }
    return b;
  }

  function buildBar() {
    if (document.querySelector(".gh-bar")) { return; }

    var bar = document.createElement("div");
    bar.className = "gh-bar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "画面の設定");

    var label = document.createElement("span");
    label.className = "gh-bar-label";
    label.textContent = "文字の大きさ";
    bar.appendChild(label);

    var sizeButtons = {};

    SIZES.forEach(function (size) {
      var btn = makeButton(LABELS[size], "文字の大きさを" + LABELS[size] + "にする");
      btn.addEventListener("click", function () {
        applySize(size);
        write(SIZE_KEY, size);
        refreshSize();
      });
      sizeButtons[size] = btn;
      bar.appendChild(btn);
    });

    function refreshSize() {
      var now = currentSize();
      SIZES.forEach(function (size) {
        sizeButtons[size].setAttribute("aria-pressed", size === now ? "true" : "false");
      });
    }

    var sound = makeButton("", "音のあり・なしを切り替える");
    sound.className = "gh-sound";

    function refreshSound() {
      var on = soundEnabled();
      sound.textContent = on ? "音　あり" : "音　なし";
      sound.setAttribute("aria-pressed", on ? "true" : "false");
    }

    sound.addEventListener("click", function () {
      write(SOUND_KEY, soundEnabled() ? "off" : "on");
      refreshSound();
    });

    bar.appendChild(sound);

    refreshSize();
    refreshSound();

    document.body.insertBefore(bar, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildBar);
  } else {
    buildBar();
  }
})();
