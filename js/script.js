// ── Supabase 방문자 카운터 ──────────────────────────
const SUPABASE_URL = "https://euwoghgwumfkaxbisvwo.supabase.co";
const SUPABASE_KEY = "sb_publishable_XdleSk1fqaWw1xBa9n6uFQ_FrpcgXB7";

async function trackVisitor() {
  const today = new Date().toISOString().slice(0, 10); // "2026-03-31"

  // 오늘 행이 있는지 확인
  const getRes = await fetch(
    `${SUPABASE_URL}/rest/v1/visitors?date=eq.${today}&select=id,count`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const rows = await getRes.json();

  if (rows.length === 0) {
    // 오늘 첫 방문 — 새 행 삽입
    await fetch(`${SUPABASE_URL}/rest/v1/visitors`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: today, count: 1 }),
    });
  } else {
    // 오늘 행 있음 — count + 1
    await fetch(`${SUPABASE_URL}/rest/v1/visitors?date=eq.${today}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: rows[0].count + 1 }),
    });
  }

  // 전체 데이터 가져와서 표시
  const allRes = await fetch(
    `${SUPABASE_URL}/rest/v1/visitors?select=date,count`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const allRows = await allRes.json();

  const todayRow = allRows.find(r => r.date === today);
  const todayCount = todayRow ? todayRow.count : 1;
  const totalCount = allRows.reduce((sum, r) => sum + r.count, 0);

  document.getElementById("today-count").textContent = todayCount;
  document.getElementById("total-count").textContent = totalCount;
}

trackVisitor();

// 사진 목록 — 새 사진 추가 시 이 배열에 파일명만 추가하면 됩니다
const images = [
  "KakaoTalk_Photo_2026-03-29-00-58-31 001.jpeg",
  "KakaoTalk_Photo_2026-03-29-00-58-31 002.jpeg",
  "KakaoTalk_Photo_2026-03-29-00-58-31 003.jpeg",
  "KakaoTalk_Photo_2026-03-29-00-58-31 004.jpeg",
  "KakaoTalk_Photo_2026-03-29-00-58-31 005.jpeg",
];

let current = 0;
const lightbox = document.getElementById("lightbox");
const lbImg    = document.getElementById("lb-img");
const lbCount  = document.getElementById("lb-count");

function openLightbox(index) {
  current = index;
  lbImg.src = `images/${images[current]}`;
  lbCount.textContent = `${current + 1} / ${images.length}`;
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

function prev() {
  current = (current - 1 + images.length) % images.length;
  lbImg.src = `images/${images[current]}`;
  lbCount.textContent = `${current + 1} / ${images.length}`;
}

function next() {
  current = (current + 1) % images.length;
  lbImg.src = `images/${images[current]}`;
  lbCount.textContent = `${current + 1} / ${images.length}`;
}

// 갤러리 카드 동적 생성
const gallery = document.getElementById("gallery");

images.forEach((file, index) => {
  const card = document.createElement("div");
  card.className = "photo-card";
  card.dataset.index = index;
  card.innerHTML = `
    <img src="images/${file}" alt="예은의 시선 ${String(index + 1).padStart(3, "0")}" loading="lazy" decoding="async" />
  `;
  card.addEventListener("click", () => openLightbox(index));
  gallery.appendChild(card);
});

// 라이트박스 이벤트
document.getElementById("lb-close").addEventListener("click", closeLightbox);
document.getElementById("lb-prev").addEventListener("click", prev);
document.getElementById("lb-next").addEventListener("click", next);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "ArrowLeft")  prev();
  if (e.key === "ArrowRight") next();
  if (e.key === "Escape")     closeLightbox();
});
