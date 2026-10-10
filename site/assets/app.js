/* MindOS Pitch — sahifa logikasi: config'dan render, nusxa olish, FAQ chatbot. */
(function () {
  "use strict";

  const CFG = window.MINDOS_CONFIG || {};
  const LINKS = CFG.links || {};

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c) node.append(c);
    return node;
  }

  // Faqat http(s) havolalarga ruxsat — config'dagi xato URL sahifani buzmasin.
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch { return null; }
  }

  function initials(name) {
    return String(name || "?").trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }

  /* ---------- config → DOM ---------- */
  function applyLinks() {
    $$("[data-link]").forEach((a) => {
      const url = safeUrl(LINKS[a.dataset.link]);
      if (url) a.href = url;
    });
    $$("[data-text]").forEach((n) => {
      const val = LINKS[n.dataset.text];
      if (val) n.textContent = val;
    });
  }

  function renderTeam() {
    const box = $("#team-list");
    if (!box) return;
    (CFG.team || []).forEach((m) => {
      const links = el("div", { class: "member-links" },
        (m.links || []).map((l) => {
          const url = safeUrl(l.url);
          return url ? el("a", { href: url, target: "_blank", rel: "noopener", text: l.label }) : null;
        }));
      box.append(el("article", { class: "member" }, [
        el("div", { class: "member-top" }, [
          el("div", { class: "avatar", "aria-hidden": "true", text: initials(m.name) }),
          el("div", {}, [el("h3", { text: m.name }), el("div", { class: "role", text: m.role })]),
        ]),
        m.bio ? el("p", { text: m.bio }) : null,
        el("ul", { class: "chips", "aria-label": "Ko'nikmalar" }, (m.skills || []).map((s) => el("li", { text: s }))),
        links,
      ]));
    });

    const roles = $("#open-roles");
    const list = CFG.openRoles || [];
    if (roles && list.length) {
      list.forEach((r) => roles.append(el("li", {}, [el("b", { text: r.role }), el("span", { text: r.why })])));
    } else if (roles) {
      roles.closest(".roles").remove();
    }
  }

  function renderDemo() {
    const video = $("#video");
    if (!video) return;
    const id = String((CFG.video || {}).youtubeId || "").trim();
    // YouTube ID faqat [A-Za-z0-9_-] — boshqa narsa bo'lsa embed qilinmaydi.
    if (/^[A-Za-z0-9_-]{6,20}$/.test(id)) {
      video.innerHTML = "";
      video.append(el("iframe", {
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        title: "MindOS demo-video",
        allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen",
        allowfullscreen: "",
        loading: "lazy",
      }));
    }
    const dur = $("#video-duration");
    if (dur && CFG.video && CFG.video.duration) dur.textContent = CFG.video.duration;

    const bot = $("#tg-bot-card");
    const handle = String(LINKS.telegramBot || "").replace(/^@/, "").trim();
    if (bot && /^[A-Za-z0-9_]{5,32}$/.test(handle)) {
      bot.href = `https://t.me/${handle}`;
      $("code", bot).textContent = `t.me/${handle}`;
      bot.hidden = false;
    }
  }

  function initCopy() {
    $$("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const target = document.getElementById(btn.dataset.copy);
        if (!target) return;
        try {
          await navigator.clipboard.writeText(target.innerText);
          btn.textContent = "Nusxa olindi";
        } catch {
          btn.textContent = "Qo'lda belgilang";
        }
        setTimeout(() => (btn.textContent = "Nusxa olish"), 1800);
      });
    });
  }

  /* ---------- FAQ chatbot ---------- */
  const app = safeUrl(LINKS.app) || "#";
  const docs = safeUrl(LINKS.apiDocs) || "#";

  // Javoblar ishonchli (biz yozgan) HTML. Foydalanuvchi matni hech qachon innerHTML'ga tushmaydi.
  const KB = [
    { q: "MindOS nima?", k: ["mindos", "haqida", "tushuntir", "loyiha", "platforma"],
      a: "MindOS — shaxsiy AI ustoz. Maqsadingizdan o'quv reja tuzadi, har kuni suhbat orqali dars beradi, uy vazifani tekshiradi va o'rganganingizni unutishdan oldin eslatadi." },
    { q: "Qanday ishlaydi?", k: ["ishlaydi", "jarayon", "bosqich", "qadam"],
      a: "5 qadam: 1) AI diagnostika darajangizni aniqlaydi, 2) shaxsiy reja tuziladi, 3) Mentor jonli dars o'tadi, 4) uy vazifani AI baholaydi, 5) tushunchalar SM-2 bo'yicha takrorlanadi." },
    { q: "ChatGPT'dan farqi nima?", k: ["chatgpt", "gpt", "farq", "farqi", "nega", "oddiy"],
      a: "ChatGPT savolga javob beradi. MindOS esa o'qitadi: reja tuzadi, darajangizni eslab qoladi, tayyor javob o'rniga savol bilan o'ylatadi, uy vazifa beradi va takrorlashni o'zi rejalashtiradi." },
    { q: "Qaysi fanlarni o'rgatadi?", k: ["fan", "fanlar", "mavzu", "ielts", "ingliz", "python", "dasturlash", "matematika", "orgat"],
      a: "Istalgan mavzu: reja mavzuga qarab tuziladi. IELTS Speaking uchun alohida imtihonchi rejimi, dasturlash uchun Code Mentor bor. O'z darsligingizni (PDF, DOCX, YouTube) yuklab, shundan o'rganish ham mumkin." },
    { q: "Narxi qancha?", k: ["narx", "narxi", "pul", "tarif", "pro", "bepul", "tolov", "qancha"],
      a: "Hozirgi tariflar: Free — $0, Pro — $9/oy, Team — $29/oy. Free'da asosiy funksiyalar va kuniga 3 ta ovozli javob bor. Keyingi bosqichda Payme/Click va so'mdagi narxlar rejalashtirilgan." },
    { q: "O'zbek tilida ishlaydimi?", k: ["ozbek", "uzbek", "til", "tilida", "rus", "lang"],
      a: "Ha. Interfeys va Mentor o'zbek tilida. Ingliz tili darslarida (masalan IELTS Speaking) Mentor kerakli joyda inglizchaga o'tadi." },
    { q: "Spaced repetition nima?", k: ["spaced", "repetition", "takror", "takrorlash", "sm2", "unut", "esla", "kartochka"],
      a: "Bu — har bir tushunchani unutishga yaqin qolgan paytda qaytarish usuli. MindOS dars tugagach kartochkalar yaratadi va SM-2 algoritmi bilan qachon qaytarishni hisoblaydi. Internet bo'lmasa ham ishlaydi." },
    { q: "Telegram bot bormi?", k: ["telegram", "bot", "eslatma", "push", "xabar"],
      a: "Ha. Telegram bot kunlik dars eslatmasini yuboradi va streak uzilish xavfi haqida ogohlantiradi. Telegram'ni ulamaganlar uchun brauzer push-bildirishnomalari bor." },
    { q: "Ma'lumotlarim xavfsizmi?", k: ["xavfsiz", "maxfiy", "malumot", "parol", "ochir", "privacy"],
      a: "Parollar bcrypt bilan xeshlanadi, kirish JWT tokenlar orqali. Akkauntingizni barcha ma'lumotlari bilan istalgan payt to'liq o'chirishingiz mumkin." },
    { q: "Qanday sinab ko'raman?", k: ["sinab", "sina", "demo", "kirish", "royxat", "prototip", "link", "havola"],
      a: `Prototip ochiq: <a href="${app}" target="_blank" rel="noopener">MindOS'ni ochish</a>. Ro'yxatdan o'ting, mavzu kiriting — 1 daqiqada shaxsiy reja tayyor. Demo-videoni <a href="/demo">/demo</a> sahifasida ko'ring.` },
    { q: "API bormi?", k: ["api", "integratsiya", "swagger", "endpoint", "developer"],
      a: `Ha, ochiq REST API: <a href="${docs}" target="_blank" rel="noopener">Swagger hujjatlari</a>. JWT bilan autentifikatsiya; reja, darslar, Mentor chat, manbalar va progress — hammasi API orqali.` },
    { q: "Qaysi AI modellar ishlatiladi?", k: ["model", "openai", "ai", "4o", "embedding", "whisper", "tts", "rag"],
      a: "Reja va diagnostika — GPT-4o, kundalik suhbat va baholash — GPT-4o-mini (tez va arzon). Manbalardan javob — embeddings + pgvector (RAG). Ovoz — Whisper va OpenAI TTS." },
    { q: "Jamoa kimlar?", k: ["jamoa", "kim", "asoschi", "founder", "husan", "team"],
      a: "Asoschi — Husan (full-stack va AI engineer): arxitektura, backend, frontend va AI agentlar. Jamoa kengaymoqda: dizayner, metodist va growth rollari ochiq. Batafsil — <a href=\"/#jamoa\">Jamoa</a> bo'limida." },
    { q: "Keyingi rejalar?", k: ["reja", "keyingi", "kelajak", "roadmap", "launch", "maqsad", "b2b"],
      a: "Pilot guruh bilan sinov (2026 oxiri), Payme/Click va o'zbekcha ovoz (2027 boshi), keyin o'quv markazlari uchun B2B Team panel. Batafsil — <a href=\"/#reja\">Reja</a> bo'limida." },
  ];

  const SUGGEST = ["MindOS nima?", "ChatGPT'dan farqi nima?", "Narxi qancha?", "Qanday sinab ko'raman?"];

  // O'zbekcha apostrof variantlari (o' o‘ oʻ o’) — barchasini olib tashlab solishtiramiz.
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/['‘’ʻʼ`´]/g, "")
      .replace(/[^a-z0-9Ѐ-ӿ]+/g, " ")
      .trim();
  }

  function answer(text) {
    const words = norm(text).split(" ").filter(Boolean);
    if (!words.length) return null;
    let best = null, bestScore = 0;
    for (const item of KB) {
      let score = 0;
      for (const kw of item.k) {
        const k = norm(kw);
        if (words.some((w) => w === k || (k.length >= 4 && w.startsWith(k)))) score += 1;
      }
      if (norm(item.q) === words.join(" ")) score += 5;
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return bestScore > 0 ? best.a : null;
  }

  const FALLBACK = `Bu savolga tayyor javobim yo'q. Quyidagilardan birini tanlang yoki haqiqiy AI Mentor'ni <a href="${app}" target="_blank" rel="noopener">prototipda</a> sinab ko'ring.`;

  function initBot() {
    const toggle = el("button", { class: "bot-toggle", type: "button", "aria-expanded": "false", "aria-controls": "bot" });
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>Savol bering</span>';

    const panel = el("div", { class: "bot", id: "bot", role: "dialog", "aria-label": "MindOS yordamchi" });
    panel.innerHTML = `
      <div class="bot-head">
        <div class="avatar" style="width:36px;height:36px;font-size:14px" aria-hidden="true">M</div>
        <div><b>MindOS yordamchi</b><small>Savol-javob namunalari asosida</small></div>
        <button type="button" aria-label="Yopish">×</button>
      </div>
      <div class="bot-log" aria-live="polite"></div>
      <div class="bot-chips"></div>
      <form class="bot-form"><label class="visually-hidden" for="bot-in">Savolingiz</label>
        <input id="bot-in" type="text" maxlength="300" autocomplete="off" placeholder="Savolingizni yozing…">
        <button type="submit">Yuborish</button></form>`;

    document.body.append(panel, toggle);
    const log = $(".bot-log", panel), chips = $(".bot-chips", panel), form = $("form", panel), input = $("input", panel);

    function push(role, content, isHtml) {
      const m = el("div", { class: `msg ${role}` });
      if (isHtml) m.innerHTML = content; else m.textContent = content;
      log.append(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }

    function renderChips(list) {
      chips.innerHTML = "";
      list.forEach((q) => chips.append(el("button", { type: "button", text: q })));
    }

    function ask(text) {
      const q = String(text || "").trim().slice(0, 300);
      if (!q) return;
      push("me", q, false);
      const typing = push("ai", '<span class="typing" aria-label="yozmoqda"><i></i><i></i><i></i></span>', true);
      const reply = answer(q);
      setTimeout(() => {
        typing.innerHTML = reply || FALLBACK;
        log.scrollTop = log.scrollHeight;
        const asked = new Set($$(".msg.me", log).map((n) => n.textContent));
        renderChips(KB.map((i) => i.q).filter((x) => !asked.has(x)).slice(0, 4));
      }, 450);
    }

    let greeted = false;
    function open(state) {
      panel.classList.toggle("open", state);
      toggle.setAttribute("aria-expanded", String(state));
      if (state && !greeted) {
        greeted = true;
        push("ai", "Salom! Men MindOS haqidagi savollarga javob beraman. Quyidagilardan birini tanlang yoki o'zingiz yozing.", false);
        renderChips(SUGGEST);
      }
      if (state) input.focus();
    }

    toggle.addEventListener("click", () => open(!panel.classList.contains("open")));
    $(".bot-head button", panel).addEventListener("click", () => { open(false); toggle.focus(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) { open(false); toggle.focus(); } });
    chips.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
    form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); input.value = ""; });
  }

  applyLinks();
  renderTeam();
  renderDemo();
  initCopy();
  initBot();
})();
