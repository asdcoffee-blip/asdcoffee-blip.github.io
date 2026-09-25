(() => {
  const phrases = [
    "ゆっくりしよう",
    "今日はおやすみ？",
    "ひと息つけた？",
    "頑張りすぎだぞ〜",
    "コーヒー飲もう",
    "コーヒーちょうだい〜",
    "コーヒー淹れようか？",
    "ぼくのおすすめは\nアニューブレンドだよ",
    "ぼくの名前はハマー",
    "今日もよろしくね",
    "いつもおつかれさま",
    "LINEスタンプ\nもうGETした？",
    "TikTokでLIVE聞こう",
    "Instagram一緒に覗こう",
    "ハマーつかれたな〜",
    "あぁコーヒーの\nいい香りがする",
    "今日の一杯、決まった？",
    "のんびりいこう〜"
  ];

  const companion = document.createElement("div");
  companion.className = "hummer-companion";
  companion.setAttribute("aria-hidden", "true");
  companion.innerHTML = `
    <div class="hummer-bubble"></div>
    <div class="hummer-float">
      <img src="img/visit-popup-sloth-bean.png" alt="" draggable="false">
    </div>
  `;
  document.body.appendChild(companion);

  const bubble = companion.querySelector(".hummer-bubble");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const MOVE_DURATION_MS = 60000;
  const REST_DURATION_MS = 10000;
  let lastPhrase = -1;
  let moveTimer;
  let talkTimer;
  let hideTimer;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragging = false;

  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function setPosition(x, y) {
    companion.classList.toggle("bubble-to-right", x < 150);
    companion.classList.toggle("bubble-to-left", x > window.innerWidth - 250);
    companion.style.setProperty("--hummer-x", `${Math.round(x)}px`);
    companion.style.setProperty("--hummer-y", `${Math.round(y)}px`);
  }

  function choosePhrase() {
    let next = Math.floor(Math.random() * phrases.length);
    if (phrases.length > 1 && next === lastPhrase) {
      next = (next + 1) % phrases.length;
    }
    lastPhrase = next;
    return phrases[next];
  }

  function moveHummer(initial = false) {
    const mascotSize = companion.offsetWidth || 82;
    const horizontalMargin = window.innerWidth < 760 ? 14 : 24;
    const topMargin = window.innerWidth < 760 ? 118 : 138;
    const bottomMargin = window.innerWidth < 760 ? 18 : 28;
    const maxX = Math.max(horizontalMargin, window.innerWidth - mascotSize - horizontalMargin);
    const maxY = Math.max(topMargin, window.innerHeight - mascotSize - bottomMargin);
    const x = initial ? maxX : randomBetween(horizontalMargin, maxX);
    const y = initial ? maxY : randomBetween(topMargin, maxY);

    if (!initial && Math.random() < 0.4) {
      companion.classList.toggle("is-flipped");
    }
    setPosition(x, y);
  }

  function scheduleMove(delay = REST_DURATION_MS) {
    clearTimeout(moveTimer);
    if (reduceMotion.matches) return;
    moveTimer = window.setTimeout(() => {
      moveHummer();
      scheduleMove(MOVE_DURATION_MS + REST_DURATION_MS);
    }, delay);
  }

  companion.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = companion.getBoundingClientRect();
    dragging = true;
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    clearTimeout(moveTimer);
    companion.classList.add("is-dragging");
    setPosition(rect.left, rect.top);
    companion.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  companion.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const maxX = Math.max(0, window.innerWidth - companion.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - companion.offsetHeight);
    setPosition(
      clamp(event.clientX - dragOffsetX, 0, maxX),
      clamp(event.clientY - dragOffsetY, 0, maxY)
    );
  });

  function finishDrag(event) {
    if (!dragging) return;
    dragging = false;
    companion.classList.remove("is-dragging");
    if (companion.hasPointerCapture(event.pointerId)) {
      companion.releasePointerCapture(event.pointerId);
    }
    scheduleMove();
  }

  companion.addEventListener("pointerup", finishDrag);
  companion.addEventListener("pointercancel", finishDrag);

  function speak() {
    bubble.textContent = choosePhrase();
    companion.classList.add("is-speaking");
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      companion.classList.remove("is-speaking");
    }, 5200);
  }

  function scheduleTalk(first = false) {
    clearTimeout(talkTimer);
    talkTimer = window.setTimeout(() => {
      speak();
      scheduleTalk();
    }, first ? 1800 : randomBetween(9000, 15000));
  }

  function resetPosition() {
    moveHummer(true);
    scheduleMove();
  }

  reduceMotion.addEventListener?.("change", resetPosition);
  window.addEventListener("resize", resetPosition, { passive: true });
  moveHummer(true);
  window.requestAnimationFrame(() => companion.classList.add("is-ready"));
  scheduleMove();
  scheduleTalk(true);
})();
