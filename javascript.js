// STYLONYX — site interactions (GSAP + ScrollTrigger + Three.js)
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Loader                                                              */
  /* ------------------------------------------------------------------ */
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loader-count");
  let progress = 0;
  const loaderTimer = setInterval(() => {
    progress = Math.min(100, progress + Math.floor(Math.random() * 18) + 6);
    if (loaderCount) loaderCount.textContent = `${progress}%`;
    if (progress >= 100) {
      clearInterval(loaderTimer);
      setTimeout(() => {
        if (loader) loader.classList.add("loaded");
        playHeroReveal();
      }, 250);
    }
  }, 140);

  /* ------------------------------------------------------------------ */
  /* Mobile nav toggle                                                   */
  /* ------------------------------------------------------------------ */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const header = document.querySelector(".site-header");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        gsap.fromTo(
          siteNav.querySelectorAll("a"),
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.35, ease: "power2.out" }
        );
      }
    });
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (header) {
    ScrollTrigger.create({
      start: "top -60",
      onUpdate: (self) => header.classList.toggle("scrolled", self.scroll() > 60),
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero cinematic reveal — fired once the loader finishes              */
  /* ------------------------------------------------------------------ */
  function playHeroReveal() {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.6 })
      .to(".hero-title .reveal-line", { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.3")
      .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
      .to(".hero-actions", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
  }

  /* ------------------------------------------------------------------ */
  /* Custom cursor                                                       */
  /* ------------------------------------------------------------------ */
  const cursorDot = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");
  if (cursorDot && cursorRing && window.matchMedia("(pointer: fine)").matches) {
    const ringX = gsap.quickTo(cursorRing, "left", { duration: 0.35, ease: "power3.out" });
    const ringY = gsap.quickTo(cursorRing, "top", { duration: 0.35, ease: "power3.out" });
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
      ringX(e.clientX);
      ringY(e.clientY);
    });
    document.querySelectorAll("a, button, .collection-item").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorRing.classList.add("hovering"));
      el.addEventListener("mouseleave", () => cursorRing.classList.remove("hovering"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero spotlight — pointer follow + scroll fade                       */
  /* ------------------------------------------------------------------ */
  const spotlight = document.querySelector(".hero-spotlight");
  const hero = document.querySelector(".hero");
  if (spotlight && hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("mousemove", (e) => {
      gsap.to(spotlight, { left: `${(e.clientX / window.innerWidth) * 100}%`, duration: 0.6, ease: "power2.out" });
    });
  }
  if (spotlight) {
    gsap.to(spotlight, {
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero 3D centerpiece — wireframe torus knot, gold, cursor-reactive    */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById("hero-canvas");
  if (canvas && window.THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, hero.clientWidth / hero.clientHeight, 0.1, 100);
    camera.position.z = 9;

    const geometry = new THREE.TorusKnotGeometry(2.1, 0.45, 160, 20);
    const material = new THREE.MeshBasicMaterial({ color: 0xcda05e, wireframe: true, transparent: true, opacity: 0.55 });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    let targetX = 0, targetY = 0;
    hero.addEventListener("mousemove", (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });

    function resizeCanvas() {
      const w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function animate() {
      requestAnimationFrame(animate);
      knot.rotation.y += 0.0032;
      knot.rotation.x += 0.0014;
      knot.rotation.z += targetX * 0.02;
      knot.rotation.x += targetY * 0.01;
      renderer.render(scene, camera);
    }
    animate();
  }

  /* ------------------------------------------------------------------ */
  /* Collections — reveal + sticky rail active-state tracking             */
  /* ------------------------------------------------------------------ */
  const railButtons = document.querySelectorAll(".collection-rail button");
  gsap.utils.toArray(".collection-item").forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 85%" },
      }
    );
    if (railButtons.length) {
      ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            railButtons.forEach((b) => b.classList.toggle("active", b.dataset.target === item.id));
          }
        },
      });
    }
  });
  railButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Manifesto — cinematic reveal                                        */
  /* ------------------------------------------------------------------ */
  gsap
    .timeline({ scrollTrigger: { trigger: ".manifesto", start: "top 75%" } })
    .fromTo(".manifesto-rule", { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "power2.out", transformOrigin: "top" })
    .fromTo(".manifesto blockquote", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.2")
    .fromTo(".manifesto-byline", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3");

  /* ------------------------------------------------------------------ */
  /* Showcase — slow zoom/parallax                                       */
  /* ------------------------------------------------------------------ */
  gsap.to(".showcase-media", {
    scale: 1.08,
    ease: "none",
    scrollTrigger: { trigger: ".showcase-frame", start: "top bottom", end: "bottom top", scrub: true },
  });

  /* ------------------------------------------------------------------ */
  /* Signup form                                                          */
  /* ------------------------------------------------------------------ */
  const form = document.getElementById("signup-form");
  const note = document.getElementById("signup-note");
  if (form && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector("#email").value.trim();
      if (!email) return;
      note.textContent = `Thanks — we'll notify ${email} when the next piece drops.`;
      gsap.fromTo(note, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.4 });
      form.reset();
    });
  }
});
