(function () {
  "use strict";
  /* 책이 나오면 true 로 바꿔주세요 */
  var BOOK_OUT = false;

  var POSES = ["stand", "fists", "think", "wave", "present", "crossed", "hips", "open", "thumbs", "cheer", "heart", "punch", "idea", "welcome", "think2", "yay", "run", "jump", "calm", "bow", "bow2"];
  var HAPPY = ["yay", "jump", "cheer", "heart", "thumbs", "fists", "open"];
  var LINES = [["wave", "안녕하세요, 이우연이에요"], ["idea", "매직 라이트 써보셨어요?"], ["think", "카드뉴스, 10분이면 충분해요"], ["present", "필요한 건 아래에 다 있어요"], ["heart", "들러주셔서 고마워요"], ["thumbs", "무료 자료도 챙겨가세요"], ["cheer", "강의에서 만나요"], ["bow", "잘 부탁드립니다"]];
  var IDLE = ["think", "calm", "crossed", "hips", "think2"];
  var QUESTS = ["course", "yt", "ig", "kk", "bl", "lib"];

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var src = function (p) { return "assets/char/" + p + ".webp"; };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  POSES.forEach(function (p) { var i = new Image(); i.src = src(p); });

  function load() { try { return JSON.parse(localStorage.getItem("wy-quest") || "{}") || {}; } catch (e) { return {}; } }
  function save(q) { try { localStorage.setItem("wy-quest", JSON.stringify(q)); } catch (e) {} }
  function show(name, on) { $$('[data-show="' + name + '"]').forEach(function (el) { el.hidden = !on; }); }

  /* ---------- buddy ---------- */
  var buddy = $("#wy-buddy"), bimg = $("#bimg");
  var pose = "stand", hold = 0, hop = 0;
  function setPose(p) { if (p !== pose) { pose = p; bimg.src = src(p); } }
  function hopNow(p, ms) {
    hold = performance.now() + (ms || 900); setPose(p);
    hop++; buddy.classList.remove("hopA", "hopB"); void buddy.offsetWidth; buddy.classList.add(hop % 2 ? "hopA" : "hopB");
  }

  /* ---------- quest ---------- */
  var q = load();
  function renderQuest() {
    var n = QUESTS.filter(function (k) { return q[k]; }).length;
    $$("[data-q-count]").forEach(function (el) { el.textContent = n; });
    $$("[data-q-left]").forEach(function (el) { el.textContent = QUESTS.length - n; });
    QUESTS.forEach(function (k) {
      $$('[data-seg="' + k + '"]').forEach(function (el) { el.classList.toggle("on", !!q[k]); });
      $$('[data-stamp="' + k + '"]').forEach(function (el) { el.hidden = !q[k]; });
    });
    show("alldone", n === QUESTS.length);
    show("notdone", n !== QUESTS.length);
    return n;
  }
  function mark(k) {
    if (q[k]) return;
    q[k] = true; save(q);
    var n = renderQuest();
    hopNow(n === QUESTS.length ? "yay" : "fists", 1400);
    if (n === QUESTS.length) setTimeout(function () { show("reward", true); }, 700);
  }
  $$("[data-quest]").forEach(function (el) { el.addEventListener("click", function () { mark(el.getAttribute("data-quest")); }); });
  renderQuest();

  /* ---------- book ---------- */
  show("booksoon", !BOOK_OUT); show("bookout", BOOK_OUT);

  /* ---------- reward modal ---------- */
  var dex = $("#dex");
  POSES.forEach(function (p) { var im = document.createElement("img"); im.src = src(p); im.alt = ""; im.loading = "lazy"; dex.appendChild(im); });

  /* ---------- toast & copy ---------- */
  var toastEl = $("#toast"), tt = 0;
  function toast(t) { toastEl.textContent = t; toastEl.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove("show"); }, 2000); }
  function copy(text, msg) {
    var done = function () { toast(msg); hopNow("thumbs", 900); };
    var fallback = function () {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); if (ok) done(); else toast(text);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  /* ---------- actions ---------- */
  var hi = 0, heroImg = $("#heroImg"), sayEl = $("#say");
  var ACT = {
    heroTap: function () {
      hi++; var l = LINES[hi % LINES.length];
      heroImg.src = src(l[0]); sayEl.textContent = l[1];
      heroImg.classList.remove("b1", "b2"); void heroImg.offsetWidth; heroImg.classList.add(hi % 2 ? "b1" : "b2");
    },
    share: function () {
      var url = location.href.split("#")[0];
      var data = { title: "디자이너 이우연", text: "AI와 캔바로 디자인을 합니다. 강의·무료 자료·채널을 한곳에서.", url: url };
      if (navigator.share) navigator.share(data).catch(function (e) { if (!e || e.name !== "AbortError") copy(url, "링크를 복사했어요"); });
      else copy(url, "링크를 복사했어요");
    },
    copyMail: function () { copy("leewooyeondesign@gmail.com", "메일 주소를 복사했어요"); },
    openReward: function () { show("reward", true); },
    closeReward: function () { show("reward", false); show("dex", false); },
    toggleDex: function () { var d = $('[data-show="dex"]'); d.hidden = !d.hidden; },
    resetQuest: function () { q = {}; save(q); renderQuest(); hopNow("run", 900); }
  };
  $$("[data-act]").forEach(function (el) { el.addEventListener("click", function () { ACT[el.getAttribute("data-act")](); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") ACT.closeReward(); });
  $$("[data-pose]").forEach(function (el) {
    el.addEventListener("pointerenter", function () { if (fine) hopNow(el.getAttribute("data-pose"), 900); });
  });

  /* ---------- buddy motion ---------- */
  if (fine && !reduce) {
    var tx = innerWidth * 0.8, ty = Math.min(innerHeight, 900) * 0.7, x = tx, y = ty, last = performance.now(), hovering = false, ii = 0, next = 0, flip = false;
    addEventListener("pointermove", function (e) {
      tx = e.clientX + 20; ty = e.clientY + 16; last = performance.now();
      hovering = !!(e.target.closest && e.target.closest("a, button"));
    }, { passive: true });
    addEventListener("pointerdown", function () { hopNow(pick(HAPPY), 700); });
    (function loop(now) {
      var dx = tx - x, dy = ty - y; x += dx * 0.09; y += dy * 0.09;
      buddy.style.transform = "translate(" + x.toFixed(1) + "px," + (y - 4).toFixed(1) + "px)";
      if (Math.abs(dx) > 3 && (dx > 0) !== flip) { flip = dx > 0; buddy.classList.toggle("flip", flip); }
      if (now > hold) {
        if (Math.hypot(dx, dy) > 24) setPose("run");
        else if (hovering) setPose("idea");
        else if (now - last > 4500) { if (now > next) { setPose(IDLE[ii++ % IDLE.length]); next = now + 2600; } }
        else setPose("stand");
      }
      requestAnimationFrame(loop);
    })(performance.now());
  } else {
    buddy.classList.add("dock");
    var st = 0;
    addEventListener("scroll", function () {
      if (performance.now() > hold) setPose("run");
      clearTimeout(st); st = setTimeout(function () { if (performance.now() > hold) setPose("stand"); }, 220);
    }, { passive: true });
    bimg.addEventListener("click", function () { hopNow(pick(HAPPY), 900); });
  }
})();
