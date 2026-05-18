document.addEventListener("DOMContentLoaded", () => {

    /* ── Cyber Theme Toggle (checkbox) ───────────────────────── */
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener("change", () => {
            if (themeToggle.checked) {
                body.classList.add("dark-mode");
                localStorage.setItem("theme", "dark");
            } else {
                body.classList.remove("dark-mode");
                localStorage.setItem("theme", "light");
            }
        });
    }

    /* ── Sidebar collapsible nav ──────────────────────────────── */
    document.querySelectorAll(".nav-list ul").forEach(ul => {
        ul.style.display = "none";
        const parentLink = ul.parentElement.querySelector("a");
        if (!parentLink) return;
        const icon = document.createElement("span");
        icon.classList.add("nav-toggle");
        icon.textContent = "❯";
        parentLink.appendChild(icon);
        parentLink.addEventListener("click", () => {
            const open = ul.style.display !== "none";
            ul.style.display = open ? "none" : "block";
            icon.classList.toggle("open", !open);
        });
    });

    /* ── Active nav link ──────────────────────────────────────── */
    const navLinks = document.querySelectorAll(".nav a");
    const sections = document.querySelectorAll("section[id]");

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(a => {
                    a.classList.toggle("active", a.getAttribute("href") === "#" + id);
                });
            }
        });
    }, { threshold: 0.15, rootMargin: "-10% 0px -60% 0px" });
    sections.forEach(s => navObserver.observe(s));

    /* ── Staggered scroll-reveal for cards & blocks ─────────── */
    const animItems = document.querySelectorAll(".summary-block, .path-card, .quick-card, .social-card");
    animItems.forEach(el => el.classList.add("anim-ready"));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = Array.from(entry.target.parentElement.children);
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => entry.target.classList.add("in-view"), idx * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animItems.forEach(el => revealObserver.observe(el));

    /* ── Reddit-line hover ────────────────────────────────────── */
    document.querySelectorAll(".reddit-block").forEach(block => {
        const line = block.querySelector(".reddit-line");
        if (!line) return;
        block.addEventListener("mouseenter", () => line.style.opacity = "0.7");
        block.addEventListener("mouseleave", () => line.style.opacity = "1");
    });
});
