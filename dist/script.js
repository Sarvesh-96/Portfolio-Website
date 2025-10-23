/* =========================
   script.js
   Interactive behaviour:
   - custom cursor & particle trail
   - reveal-on-scroll
   - truly seamless infinite horizontal project scroll
   - pause + overlay + highlight on hover
   - contact form UI (commented for later activation)
   ========================= */

/* ---------- DOM references ---------- */
const cursor = document.getElementById("cursor");
const canvas = document.getElementById("trailCanvas");
const ctx = canvas?.getContext?.("2d") || null;

const pageOverlay = document.getElementById("pageOverlay");
const projectsWrap = document.getElementById("projectsWrap");
const projectsTrack = document.getElementById("projectsTrack");

/* ---------- Canvas setup ---------- */
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resizeCanvas();
addEventListener("resize", resizeCanvas);

/* ---------- Custom cursor & gentle particle trail ---------- */
let mx = -200,
  my = -200;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});
if (cursor) {
  (function follow() {
    cursor.style.left = mx + "px";
    cursor.style.top = my + "px";
    requestAnimationFrame(follow);
  })();
}

/* --- Particle trail --- */
const particles = [];
function spawnParticle(x, y, vx, vy, size, life, color) {
  particles.push({ x, y, vx, vy, size, life, color });
}
function updateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02;
    p.size *= 0.992;
    p.life -= 0.02;
    if (p.life <= 0 || p.size < 0.3) {
      particles.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${Math.max(
      0,
      p.life
    )})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
(function trailLoop() {
  if (mx > -100) {
    spawnParticle(
      mx + (Math.random() - 0.5) * 6,
      my + (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.6,
      1 + Math.random() * 3,
      1,
      { r: 0, g: 240, b: 212 }
    );
  }
  updateParticles();
  requestAnimationFrame(trailLoop);
})();

/* ---------- Reveal-on-scroll animation ---------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach(
      (en) => en.isIntersecting && en.target.classList.add("reveal-visible")
    ),
  { threshold: 0.15 }
);
revealEls.forEach((el) => io.observe(el));

const revealElements = document.querySelectorAll(".reveal, .skill-card");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("reveal-visible");
      observer.unobserve(entry.target);
    }
  });
});
revealElements.forEach((el) => observer.observe(el));

/* ============================================================
   PROJECTS — PURE SEAMLESS INFINITE SCROLL
   (Scroll pauses completely when hovered over a project card)
============================================================ */
if (projectsTrack) {
  /* ---------- 1. Duplicate project cards ----------
     We clone cards until the total width is at least 2×
     the visible wrapper width, to allow continuous looping.
  */
  const cards = Array.from(projectsTrack.children);
  let totalWidth = projectsTrack.scrollWidth;
  const viewportWidth = projectsWrap.offsetWidth;

  while (totalWidth < viewportWidth * 2) {
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("clone");
      projectsTrack.appendChild(clone);
    });
    totalWidth = projectsTrack.scrollWidth;
  }

  /* ---------- 2. Continuous auto-scrolling ----------
     The track moves smoothly to the left. When it reaches
     halfway through the total width, it resets seamlessly.
  */
  let x = 0; // current scroll position
  const speed = 0.7; // scroll speed in pixels per frame
  let paused = false; // toggled when hovering a card

  function scrollLoop() {
    if (!paused) {
      x -= speed;
      // reset at midpoint to create seamless loop
      if (Math.abs(x) >= totalWidth / 2) x = 0;
      projectsTrack.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(scrollLoop);
  }
  scrollLoop();

  /* ---------- 3. Hover behavior ----------
     When the user hovers over any card, we pause the scrolling.
     When the pointer leaves the entire project area, scrolling resumes.
  */
  projectsTrack.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".proj-card");
    if (card) {
      paused = true; // pause scroll
      card.classList.add("focused"); // optional small zoom
    }
  });

  projectsTrack.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".proj-card");
    if (card) {
      paused = false; // resume scroll
      card.classList.remove("focused"); // remove zoom effect
    }
  });
}

/* ---------- Sparkle click feedback ---------- */
document.addEventListener("click", (e) => {
  for (let i = 0; i < 6; i++) {
    spawnParticle(
      e.clientX + (Math.random() - 0.5) * 12,
      e.clientY + (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 1.4,
      (Math.random() - 0.5) * 1.4,
      1 + Math.random() * 3,
      0.9,
      { r: 0, g: 240, b: 212 }
    );
  }
});

/* ---------- Contact form (UI only, no network) ---------- */
const form = document.getElementById("contactForm");
if (form) {
  const code = document.getElementById("countryCode");
  const phone = document.getElementById("phone");
  if (code) code.value = "+91";
  phone?.addEventListener(
    "input",
    (e) => (e.target.value = e.target.value.replace(/\D+/g, ""))
  );

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const msg = document.getElementById("message").value.trim();
    const status = document.getElementById("formStatus");

    if (!name || !email || !phone.value || !msg) {
      status.textContent = "Please fill all fields.";
      status.style.color = "salmon";
      return;
    }
    // Uncomment this block to enable:
    // fetch('/api/contact', {method:'POST',body:JSON.stringify({name,email,phone:phone.value,msg})})
    //   .then(()=>{status.textContent='Message sent!';status.style.color='lightgreen';})
    //   .catch(()=>{status.textContent='Error sending message.';status.style.color='salmon';});

    status.textContent = "Thanks — (demo) form not submitted to server.";
    status.style.color = "lightgreen";
    form.reset();
    if (code) code.value = "+91";
  });
}

/* ---------- Accessibility: hide cursor on Tab ---------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && cursor) {
    cursor.style.opacity = 0;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});

/* ---------- Sort country codes in ascending numeric order ---------- */
window.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("countryCode");
  if (!select) return;

  const options = Array.from(select.options);
  const placeholder = options.shift();

  options.sort((a, b) => {
    const numA = parseInt(a.value.replace(/\D/g, ""), 10);
    const numB = parseInt(b.value.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  select.innerHTML = "";
  if (placeholder) select.appendChild(placeholder);
  options.forEach((opt) => select.appendChild(opt));

  // ✅ Force India +91 as the default after sorting
  select.value = "+91";
});

/* ---------- Make country code dropdown searchable ---------- */
const searchInput = document.getElementById("countrySearch");
const selectInput = document.getElementById("countryCode");

if (searchInput && selectInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const options = Array.from(selectInput.options);

    options.forEach((opt) => {
      const text = opt.textContent.toLowerCase();
      opt.style.display = text.includes(term) ? "block" : "none";
    });

    // reset selection if search changes
    selectInput.selectedIndex = 0;
  });
}