// ============================================
// FISIKA INTERAKTIF - Arus Bolak-Balik
// Main Application Logic
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initNavigation();
  initMobileMenu();
  initScrollAnimations();
  initSimulator();
  initQuiz();
  initAccordions();
  initBackToTop();
  initCounterAnimations();
  initTabSystem();
  // enable transitions after initial paint to avoid flash
  setTimeout(() => {
    document.documentElement.classList.add("theme-transition");
  }, 60);
});

// ============================================
// THEME TOGGLE
// ============================================
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const storedTheme = localStorage.getItem("theme");
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersDark = mql.matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);

  // Click toggles
  toggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    applyTheme(isDark ? "light" : "dark");
  });

  // Keyboard support (Enter / Space)
  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle.click();
    }
  });

  // If user hasn't chosen a theme, follow system changes
  if (!storedTheme && mql.addEventListener) {
    mql.addEventListener("change", (ev) => {
      if (!localStorage.getItem("theme")) {
        applyTheme(ev.matches ? "dark" : "light");
      }
    });
  } else if (!storedTheme && mql.addListener) {
    mql.addListener((ev) => {
      if (!localStorage.getItem("theme")) {
        applyTheme(ev.matches ? "dark" : "light");
      }
    });
  }
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;

  const icon = document.getElementById("themeToggleIcon");
  if (icon) {
    icon.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon");
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  localStorage.setItem("theme", theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"
    );
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  // Update meta theme-color for mobile UI
  try {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--background") || (theme === "dark" ? "#121116" : "#F4F7F8");
    meta.setAttribute("content", bg.trim());
  } catch (e) {
    // ignore
  }
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const nav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!nav) return;

  const updateNavAppearance = () => {
    if (window.scrollY > 50) {
      nav.classList.add("shadow-lg");
      nav.style.background = "var(--surface)";
      nav.style.backdropFilter = "blur(12px)";
    } else {
      nav.classList.remove("shadow-lg");
      nav.style.background = "transparent";
      nav.style.backdropFilter = "none";
    }
  };

  window.addEventListener("scroll", updateNavAppearance);
  updateNavAppearance();

  // Active section highlighting
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      }
    });
  });

  // Smooth scroll for nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        const offset = 80;
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
      // Close mobile menu if open
      const mobileMenu = document.getElementById("mobileMenu");
      if (mobileMenu) mobileMenu.classList.remove("open");
    });
  });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("closeMobileMenu");

  if (btn && menu) {
    btn.addEventListener("click", () => menu.classList.add("open"));
    closeBtn?.addEventListener("click", () => menu.classList.remove("open"));

    // Close on outside click
    menu.addEventListener("click", (e) => {
      if (e.target === menu) menu.classList.remove("open");
    });
  }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  reveals.forEach((el) => observer.observe(el));
}

// ============================================
// AC WAVE SIMULATOR (Chart.js)
// ============================================
let waveChart = null;

function initSimulator() {
  const ctx = document.getElementById("waveCanvas");
  if (!ctx) return;

  // Default parameters
  const params = {
    amplitude: 220,
    frequency: 50,
    phase: 0,
  };

  // Create chart
  waveChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Tegangan V(t)",
          data: [],
          borderColor: "#5C9EAD",
          borderWidth: 2.5,
          pointRadius: 0,
          tension: 0.4,
          fill: {
            target: "origin",
            above: "rgba(92, 158, 173, 0.1)",
            below: "rgba(92, 158, 173, 0.1)",
          },
        },
        {
          label: "Arus I(t)",
          data: [],
          borderColor: "#6750a4",
          borderWidth: 2,
          borderDash: [6, 3],
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: "easeInOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { family: "Inter", size: 13, weight: "500" },
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: "rgba(29, 27, 32, 0.9)",
          titleFont: { family: "Inter", size: 13 },
          bodyFont: { family: "Fira Code", size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} V`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Waktu (ms)",
            font: { family: "Inter", size: 13, weight: "600" },
            color: "#494551",
          },
          grid: { color: "rgba(50, 98, 115, 0.08)" },
          ticks: {
            font: { family: "Fira Code", size: 11 },
            color: "#7a7582",
            maxTicksLimit: 10,
          },
        },
        y: {
          title: {
            display: true,
            text: "Tegangan (V)",
            font: { family: "Inter", size: 13, weight: "600" },
            color: "#494551",
          },
          grid: { color: "rgba(50, 98, 115, 0.08)" },
          ticks: { font: { family: "Fira Code", size: 11 }, color: "#7a7582" },
        },
      },
    },
  });

  updateWaveChart(params);

  // Slider event listeners
  const sliderIds = [
    {
      id: "amplitudeSlider",
      param: "amplitude",
      displayId: "amplitudeValue",
      unit: " V",
    },
    {
      id: "frequencySlider",
      param: "frequency",
      displayId: "frequencyValue",
      unit: " Hz",
    },
    { id: "phaseSlider", param: "phase", displayId: "phaseValue", unit: "°" },
  ];

  sliderIds.forEach(({ id, param, displayId, unit }) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(displayId);
    if (slider) {
      slider.addEventListener("input", (e) => {
        params[param] = parseFloat(e.target.value);
        if (display) display.textContent = e.target.value + unit;
        updateWaveChart(params);
        updateCalculations(params);
      });
    }
  });

  updateCalculations(params);
}

function updateWaveChart(params) {
  if (!waveChart) return;
  const { amplitude, frequency, phase } = params;
  const omega = 2 * Math.PI * frequency;
  const period = 1 / frequency;
  const totalTime = 2 * period; // Show 2 full cycles
  const steps = 200;
  const dt = totalTime / steps;

  const labels = [];
  const voltageData = [];
  const currentData = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    labels.push((t * 1000).toFixed(1)); // ms
    const v = amplitude * Math.sin(omega * t + (phase * Math.PI) / 180);
    const iCurrent =
      (amplitude / 100) *
      Math.sin(omega * t + (phase * Math.PI) / 180 - Math.PI / 4);
    voltageData.push(v);
    currentData.push(iCurrent * 45); // Scale for visibility
  }

  waveChart.data.labels = labels;
  waveChart.data.datasets[0].data = voltageData;
  waveChart.data.datasets[1].data = currentData;
  waveChart.update("none");
}

function updateCalculations(params) {
  const { amplitude, frequency } = params;
  const period = 1 / frequency;
  const omega = 2 * Math.PI * frequency;
  const vRms = amplitude / Math.sqrt(2);

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("calcVmax", amplitude.toFixed(1) + " V");
  setText("calcVrms", vRms.toFixed(1) + " V");
  setText("calcPeriod", (period * 1000).toFixed(2) + " ms");
  setText("calcOmega", omega.toFixed(1) + " rad/s");
  setText("calcFreq", frequency + " Hz");
}

// ============================================
// QUIZ SYSTEM
// ============================================
const quizQuestions = [
  {
    question: "Apa yang dimaksud dengan arus bolak-balik (AC)?",
    options: [
      "Arus listrik yang arahnya selalu tetap",
      "Arus listrik yang arah dan besarnya berubah secara periodik",
      "Arus listrik yang hanya mengalir pada siang hari",
      "Arus listrik yang mengalir pada satu arah saja",
    ],
    correct: 1,
    explanation:
      "Arus bolak-balik (AC) adalah arus listrik yang arah dan besarnya berubah-ubah secara periodik terhadap waktu, berbentuk gelombang sinusoidal.",
  },
  {
    question: "Rumus tegangan sesaat pada rangkaian AC adalah...",
    options: [
      "V = V_max × cos²(ωt)",
      "V = V_max × sin(ωt)",
      "V = V_max × tan(ωt)",
      "V = V_max / sin(ωt)",
    ],
    correct: 1,
    explanation:
      "Tegangan sesaat pada AC dinyatakan dengan V = V_max × sin(ωt), di mana V_max adalah tegangan maksimum, ω adalah kecepatan sudut, dan t adalah waktu.",
  },
  {
    question:
      "Jika frekuensi arus AC adalah 50 Hz, berapa periode gelombangnya?",
    options: ["0.01 s", "0.02 s", "0.05 s", "0.5 s"],
    correct: 1,
    explanation:
      "Periode T = 1/f = 1/50 = 0.02 sekon. Periode adalah waktu yang diperlukan untuk menyelesaikan satu siklus penuh.",
  },
  {
    question:
      "Tegangan efektif (V_rms) dari suatu sumber AC dengan V_max = 311 V adalah...",
    options: ["155.5 V", "220 V", "311 V", "440 V"],
    correct: 1,
    explanation:
      "V_rms = V_max / √2 = 311 / 1.414 ≈ 220 V. Inilah sebabnya tegangan PLN sering disebut 220V, karena itu adalah nilai efektifnya.",
  },
  {
    question: "Apa hubungan antara kecepatan sudut (ω) dan frekuensi (f)?",
    options: ["ω = πf", "ω = 2πf", "ω = f/2π", "ω = 2f"],
    correct: 1,
    explanation:
      "Kecepatan sudut ω = 2πf, di mana f adalah frekuensi dalam Hz. Ini menghubungkan gerak melingkar dengan osilasi gelombang.",
  },
  {
    question: "Pada rangkaian RLC seri, kapan terjadi resonansi?",
    options: [
      "Ketika R = 0",
      "Ketika XL = XC",
      "Ketika XL = R",
      "Ketika XC = 0",
    ],
    correct: 1,
    explanation:
      "Resonansi terjadi saat reaktansi induktif (XL) sama dengan reaktansi kapasitif (XC), sehingga impedansi minimum dan arus maksimum.",
  },
  {
    question:
      "Nilai impedansi (Z) pada rangkaian RLC seri dihitung dengan rumus...",
    options: [
      "Z = R + XL + XC",
      "Z = √(R² + (XL - XC)²)",
      "Z = R × XL × XC",
      "Z = R / (XL + XC)",
    ],
    correct: 1,
    explanation:
      "Impedansi total Z = √(R² + (XL - XC)²). Impedansi adalah hambatan total rangkaian AC yang mencakup resistansi dan reaktansi.",
  },
  {
    question: "Daya rata-rata pada rangkaian AC dihitung dengan rumus...",
    options: [
      "P = V_max × I_max",
      "P = V_rms × I_rms × cos(φ)",
      "P = V² / R²",
      "P = I² × Z",
    ],
    correct: 1,
    explanation:
      "Daya rata-rata P = V_rms × I_rms × cos(φ), di mana cos(φ) adalah faktor daya yang menunjukkan efisiensi penggunaan energi listrik.",
  },
  {
    question: "Reaktansi induktif (XL) dipengaruhi oleh...",
    options: [
      "Hanya induktansi (L)",
      "Frekuensi (f) dan induktansi (L)",
      "Hanya resistansi (R)",
      "Kapasitansi (C) dan resistansi (R)",
    ],
    correct: 1,
    explanation:
      "XL = 2πfL = ωL. Reaktansi induktif bergantung pada frekuensi dan induktansi. Semakin tinggi frekuensi atau induktansi, semakin besar XL.",
  },
  {
    question:
      "Apa keuntungan utama penggunaan AC dibanding DC untuk transmisi jarak jauh?",
    options: [
      "AC lebih murah untuk diproduksi",
      "Tegangan AC mudah dinaikkan/diturunkan menggunakan transformator",
      "AC tidak memerlukan kabel",
      "AC memiliki resistansi nol",
    ],
    correct: 1,
    explanation:
      "Keuntungan utama AC adalah tegangannya mudah dinaikkan atau diturunkan menggunakan transformator, sehingga mengurangi rugi-rugi daya (P = I²R) saat transmisi jarak jauh.",
  },
];

let currentQuestion = 0;
let userAnswers = [];
let quizSubmitted = false;

function initQuiz() {
  userAnswers = new Array(quizQuestions.length).fill(-1);
  renderQuizQuestion();
  updateQuizProgress();

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuizQuestion();
      updateQuizProgress();
    }
  });

  document.getElementById("nextBtn")?.addEventListener("click", () => {
    if (currentQuestion < quizQuestions.length - 1) {
      currentQuestion++;
      renderQuizQuestion();
      updateQuizProgress();
    }
  });

  document.getElementById("submitQuiz")?.addEventListener("click", submitQuiz);
  document.getElementById("retryQuiz")?.addEventListener("click", retryQuiz);
}

function renderQuizQuestion() {
  const container = document.getElementById("quizContainer");
  if (!container) return;

  const q = quizQuestions[currentQuestion];

  container.innerHTML = `
    <div class="mb-4">
      <span class="chip" style="background: var(--primary-fixed); color: var(--primary);">
        Soal ${currentQuestion + 1} dari ${quizQuestions.length}
      </span>
    </div>
    <h4 style="font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 1.125rem; color: var(--on-surface); margin-bottom: 1.25rem; line-height: 1.6;">
      ${q.question}
    </h4>
    <div class="space-y-3" id="optionsContainer">
      ${q.options
        .map(
          (opt, idx) => `
        <div class="quiz-option ${userAnswers[currentQuestion] === idx ? "selected" : ""} ${quizSubmitted ? (idx === q.correct ? "correct" : userAnswers[currentQuestion] === idx ? "incorrect" : "") : ""}"
             onclick="${quizSubmitted ? "" : `selectOption(${idx})`}"
             id="option-${idx}">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 50%; font-weight: 700; font-size: 0.875rem; font-family: 'Fira Code', monospace;
              ${userAnswers[currentQuestion] === idx ? "background: var(--primary-container); color: white;" : "background: var(--surface-container); color: var(--on-surface-variant);"}
              ${quizSubmitted && idx === q.correct ? "background: var(--success); color: white;" : ""}
              ${quizSubmitted && userAnswers[currentQuestion] === idx && idx !== q.correct ? "background: var(--error); color: white;" : ""}">
              ${String.fromCharCode(65 + idx)}
            </span>
            <span style="font-family: 'Inter', sans-serif; font-size: 0.9375rem; color: var(--on-surface);">${opt}</span>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    ${
      quizSubmitted
        ? `
      <div style="margin-top: 1rem; padding: 1rem; border-radius: 0.5rem; background: ${userAnswers[currentQuestion] === q.correct ? "var(--success-light)" : "var(--warning-light)"}; border-left: 4px solid ${userAnswers[currentQuestion] === q.correct ? "var(--success)" : "var(--warning)"};">
        <p style="font-family: 'Inter', sans-serif; font-size: 0.875rem; color: var(--on-surface); line-height: 1.6;">
          <strong>${userAnswers[currentQuestion] === q.correct ? "✅ Benar!" : "❌ Kurang Tepat."}</strong><br>
          ${q.explanation}
        </p>
      </div>
    `
        : ""
    }
  `;

  // Update button states
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitQuiz");

  if (prevBtn) prevBtn.disabled = currentQuestion === 0;
  if (nextBtn) nextBtn.disabled = currentQuestion === quizQuestions.length - 1;

  // Show submit button only when all questions answered
  if (submitBtn) {
    const allAnswered = userAnswers.every((a) => a !== -1);
    submitBtn.style.display =
      allAnswered && !quizSubmitted ? "inline-flex" : "none";
  }
}

window.selectOption = function (idx) {
  if (quizSubmitted) return;
  userAnswers[currentQuestion] = idx;
  renderQuizQuestion();
  updateQuizProgress();
};

function updateQuizProgress() {
  const progressBar = document.getElementById("quizProgressBar");
  const progressText = document.getElementById("quizProgressText");
  const answered = userAnswers.filter((a) => a !== -1).length;
  const total = quizQuestions.length;
  const pct = (answered / total) * 100;

  if (progressBar) progressBar.style.width = pct + "%";
  if (progressText)
    progressText.textContent = `${answered}/${total} soal dijawab`;
}

function submitQuiz() {
  quizSubmitted = true;
  let score = 0;
  quizQuestions.forEach((q, i) => {
    if (userAnswers[i] === q.correct) score++;
  });

  const pct = Math.round((score / quizQuestions.length) * 100);
  const resultPanel = document.getElementById("quizResult");

  if (resultPanel) {
    let emoji, message, colorClass;
    if (pct >= 80) {
      emoji = "🎉";
      message = "Luar Biasa!";
      colorClass = "var(--success)";
    } else if (pct >= 60) {
      emoji = "👍";
      message = "Bagus!";
      colorClass = "var(--accent)";
    } else {
      emoji = "📚";
      message = "Perlu Belajar Lagi";
      colorClass = "var(--warning)";
    }

    resultPanel.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">${emoji}</div>
        <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1.5rem; color: ${colorClass}; margin-bottom: 0.5rem;">${message}</h3>
        <p style="font-family: 'Fira Code', monospace; font-size: 2rem; font-weight: 700; color: var(--on-surface);">
          ${score}/${quizQuestions.length}
        </p>
        <p style="font-family: 'Inter', sans-serif; color: var(--on-surface-variant); margin-top: 0.25rem;">
          Skor: ${pct}%
        </p>
        <div class="progress-bar" style="max-width: 300px; margin: 1rem auto; height: 8px;">
          <div class="progress-bar-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
    resultPanel.style.display = "block";
  }

  document.getElementById("retryQuiz").style.display = "inline-flex";
  document.getElementById("submitQuiz").style.display = "none";
  renderQuizQuestion();
}

function retryQuiz() {
  quizSubmitted = false;
  currentQuestion = 0;
  userAnswers = new Array(quizQuestions.length).fill(-1);
  document.getElementById("quizResult").style.display = "none";
  document.getElementById("quizResult").innerHTML = "";
  document.getElementById("retryQuiz").style.display = "none";
  renderQuizQuestion();
  updateQuizProgress();
}

// ============================================
// ACCORDION (FAQ / Materi)
// ============================================
function initAccordions() {
  document.querySelectorAll(".accordion-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector(".accordion-icon");
      const isOpen = content.classList.contains("open");

      // Close all
      document
        .querySelectorAll(".accordion-content")
        .forEach((c) => c.classList.remove("open"));
      document
        .querySelectorAll(".accordion-icon")
        .forEach((i) => (i.style.transform = "rotate(0deg)"));

      if (!isOpen) {
        content.classList.add("open");
        if (icon) icon.style.transform = "rotate(180deg)";
      }
    });
  });
}

// ============================================
// BACK TO TOP
// ============================================
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ============================================
// COUNTER ANIMATIONS
// ============================================
function initCounterAnimations() {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          animateCounter(el, 0, target, 1500);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((c) => observer.observe(c));
}

function animateCounter(el, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.round(start + range * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ============================================
// TAB SYSTEM
// ============================================
function initTabSystem() {
  document.querySelectorAll("[data-tab-group]").forEach((group) => {
    const tabs = group.querySelectorAll(".tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        const groupName = group.dataset.tabGroup;

        // Update active tab
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Show target content
        document
          .querySelectorAll(`[data-tab-content="${groupName}"]`)
          .forEach((content) => {
            content.style.display = "none";
          });
        const targetContent = document.getElementById(target);
        if (targetContent) targetContent.style.display = "block";
      });
    });
  });
}
