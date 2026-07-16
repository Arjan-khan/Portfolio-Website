/* ==========================================================================
   Arjan Anis Khan — Portfolio
   Modular vanilla JS. Each feature is self-contained and initialised
   from the bottom of the file once the DOM is ready.
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------------------------------------------------------------------
     1. Page loader
  --------------------------------------------------------------------- */
  function initLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    window.addEventListener("load", () => {
      setTimeout(() => loader.classList.add("is-hidden"), 500);
    });
    // Fallback in case 'load' already fired
    if (document.readyState === "complete") {
      setTimeout(() => loader.classList.add("is-hidden"), 500);
    }
  }

  /* ---------------------------------------------------------------------
     2. Theme toggle (dark / light) with localStorage persistence
  --------------------------------------------------------------------- */
  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById("themeToggle");
    const STORAGE_KEY = "portfolio-theme";

    const stored = localStorage.getItem(STORAGE_KEY);
    const systemPrefersLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    const initial = stored || (systemPrefersLight ? "light" : "dark");
    root.setAttribute("data-theme", initial);

    toggle?.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  /* ---------------------------------------------------------------------
     3. Sticky navbar + scroll progress + active section highlight
  --------------------------------------------------------------------- */
  function initNavbar() {
    const navbar = document.getElementById("navbar");
    const progressBar = document.getElementById("progressBar");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section[id]");

    function onScroll() {
      const scrollY = window.scrollY;

      // Sticky background
      navbar.classList.toggle("is-scrolled", scrollY > 40);

      // Scroll progress
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = progress + "%";

      // Active section highlight
      let currentId = sections[0]?.id;
      sections.forEach((section) => {
        const top = section.offsetTop - 140;
        if (scrollY >= top) currentId = section.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.section === currentId);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     4. Hamburger / mobile menu
  --------------------------------------------------------------------- */
  function initHamburger() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    if (!hamburger || !navLinks) return;

    function closeMenu() {
      hamburger.classList.remove("is-open");
      navLinks.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
    }

    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     5. Typing animation for hero subtitle
  --------------------------------------------------------------------- */
  function initTyping() {
    const el = document.getElementById("typingText");
    if (!el) return;

    const phrases = [
      "Aspiring Software Developer",
      "BCA Student at Poona College",
      "Python & JavaScript Learner",
      "Building for the Web",
    ];

    if (prefersReducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(tick, 1800);
        }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  /* ---------------------------------------------------------------------
     6. Scroll reveal (fade-up) via IntersectionObserver
  --------------------------------------------------------------------- */
  function initScrollReveal() {
    const items = document.querySelectorAll(".fade-up");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------------
     7. Animated counters (hero stats)
  --------------------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll(".stat__number");
    if (!counters.length) return;

    function animateCounter(el) {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }

      const duration = 1400;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------------
     8. Skill bar fill animation
  --------------------------------------------------------------------- */
  function initSkillBars() {
    const bars = document.querySelectorAll(".bar__fill");
    if (!bars.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      bars.forEach((bar) => bar.classList.add("is-filled"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-filled");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    bars.forEach((bar) => observer.observe(bar));
  }

  /* ---------------------------------------------------------------------
     9. Mouse-follow glow (desktop only, decorative)
  --------------------------------------------------------------------- */
  function initCursorGlow() {
    const glow = document.getElementById("cursorGlow");
    if (
      !glow ||
      prefersReducedMotion ||
      window.matchMedia("(hover: none)").matches
    )
      return;

    let raf = null;
    window.addEventListener("mousemove", (e) => {
      glow.classList.add("is-active");
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      });
    });
    window.addEventListener("mouseleave", () =>
      glow.classList.remove("is-active"),
    );
  }

  /* ---------------------------------------------------------------------
     10. Magnetic buttons
  --------------------------------------------------------------------- */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll(".magnetic");
    if (
      !buttons.length ||
      prefersReducedMotion ||
      window.matchMedia("(hover: none)").matches
    )
      return;

    buttons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------------------
     11. Tilt effect on cards
  --------------------------------------------------------------------- */
  function initTiltCards() {
    const cards = document.querySelectorAll(".tilt");
    if (
      !cards.length ||
      prefersReducedMotion ||
      window.matchMedia("(hover: none)").matches
    )
      return;

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------------------
     12. Floating particles on hero canvas (lightweight)
  --------------------------------------------------------------------- */
  function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let width, height, animId;

    function resize() {
      const hero = canvas.closest(".hero");
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      const count = width < 700 ? 24 : 46;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.5 + 0.15,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(animId);
        resize();
        createParticles();
        draw();
      }, 250);
    });
  }

  /* ---------------------------------------------------------------------
     13. Copy email button
  --------------------------------------------------------------------- */
  function initCopyEmail() {
    const btn = document.getElementById("copyEmailBtn");
    const emailValue = document.getElementById("emailValue");
    if (!btn || !emailValue) return;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const email = emailValue.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        // Fallback for older browsers
        const temp = document.createElement("textarea");
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      btn.classList.add("is-copied");
      btn.setAttribute("aria-label", "Email copied");
      setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.setAttribute("aria-label", "Copy email address");
      }, 1800);
    });
  }

  /* ---------------------------------------------------------------------
     14. Contact form validation + real submission via EmailJS
  --------------------------------------------------------------------- */
  function initEmailJS() {
    if (typeof emailjs === "undefined") {
      console.warn(
        "EmailJS SDK not loaded — check the <script> tag in index.html.",
      );
      return;
    }
    emailjs.init("yZAN2H5GeybAcnmCs");
  }

  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const fields = {
      name: {
        el: document.getElementById("name"),
        error: document.getElementById("nameError"),
      },
      email: {
        el: document.getElementById("email"),
        error: document.getElementById("emailError"),
      },
      subject: {
        el: document.getElementById("subject"),
        error: document.getElementById("subjectError"),
      },
      message: {
        el: document.getElementById("message"),
        error: document.getElementById("messageError"),
      },
    };
    const status = document.getElementById("formStatus");
    const submitBtn = document.getElementById("submitBtn");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(field, message) {
      field.el.closest(".form-group").classList.add("has-error");
      field.error.textContent = message;
    }
    function clearError(field) {
      field.el.closest(".form-group").classList.remove("has-error");
      field.error.textContent = "";
    }

    function validateField(key) {
      const field = fields[key];
      const value = field.el.value.trim();

      if (key === "name") {
        if (!value) return (setError(field, "Please enter your name."), false);
        if (value.length < 2)
          return (setError(field, "Name looks too short."), false);
      }
      if (key === "email") {
        if (!value) return (setError(field, "Please enter your email."), false);
        if (!emailPattern.test(value))
          return (setError(field, "Enter a valid email address."), false);
      }
      if (key === "subject") {
        if (!value) return (setError(field, "Please add a subject."), false);
        if (value.length < 3)
          return (setError(field, "Subject looks too short."), false);
      }
      if (key === "message") {
        if (!value) return (setError(field, "Please write a message."), false);
        if (value.length < 10)
          return (
            setError(field, "Message should be at least 10 characters."),
            false
          );
      }
      clearError(field);
      return true;
    }

    Object.keys(fields).forEach((key) => {
      fields[key].el.addEventListener("blur", () => validateField(key));
      fields[key].el.addEventListener("input", () => {
        if (
          fields[key].el.closest(".form-group").classList.contains("has-error")
        ) {
          validateField(key);
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      const results = Object.keys(fields).map(validateField);
      const isValid = results.every(Boolean);

      if (!isValid) {
        status.classList.add("is-error");
        status.textContent = "Please fix the highlighted fields and try again.";
        return;
      }

      // Real submission via EmailJS
      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;

      const templateParams = {
        name: fields.name.el.value.trim(),
        email: fields.email.el.value.trim(),
        subject: fields.subject.el.value.trim(),
        message: fields.message.el.value.trim(),
        time: new Date().toLocaleString(),
      };

      emailjs
        .send("service_pwrfib9", "template_l5v8pxq", templateParams)
        .then(() => {
          submitBtn.classList.remove("is-loading");
          submitBtn.disabled = false;
          status.classList.add("is-success");
          status.textContent = `Thanks! Your message has been sent — I'll get back to you at ${fields.email.el.value.trim()} soon.`;
          form.reset();
        })
        .catch((error) => {
          submitBtn.classList.remove("is-loading");
          submitBtn.disabled = false;
          status.classList.add("is-error");
          status.textContent =
            "Something went wrong and your message wasn't sent. Please try again or email me directly at arjankhan0001@gmail.com.";
          console.error("EmailJS error:", error);
        });
    });
  }

  /* ---------------------------------------------------------------------
     15. Back to top button
  --------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("is-visible", window.scrollY > 500);
      },
      { passive: true },
    );

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------------------------------------------------------------------
     16. Smooth in-page navigation (accounts for fixed navbar height)
  --------------------------------------------------------------------- */
  function initSmoothAnchors() {
    const navHeight = document.getElementById("navbar")?.offsetHeight || 76;
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (targetId.length < 2) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const top =
          target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     17. Footer year
  --------------------------------------------------------------------- */
  function initFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     Init
  --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initEmailJS();
    initTheme();
    initNavbar();
    initHamburger();
    initTyping();
    initScrollReveal();
    initCounters();
    initSkillBars();
    initCursorGlow();
    initMagneticButtons();
    initTiltCards();
    initParticles();
    initCopyEmail();
    initContactForm();
    initBackToTop();
    initSmoothAnchors();
    initFooterYear();
  });
})();
