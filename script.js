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


    /* ── Mobile Navigation Drawer ─────────────────────────────── */
    (function () {
        const hamburgerBtn  = document.getElementById("mobile-hamburger-btn");
        const drawer        = document.getElementById("mobile-nav-drawer");
        const backdrop      = document.getElementById("mobile-nav-backdrop");
        const closeBtn      = document.getElementById("drawer-close-btn");
        const drawerContent = document.getElementById("drawer-nav-content");

        // Only runs when elements exist (i.e. always — they're in the HTML)
        if (!hamburgerBtn || !drawer || !backdrop) return;

        // --- Clone the sidebar nav-list into the drawer (once) ---
        const sidebarNavList = document.querySelector(".nav .nav-list");
        if (sidebarNavList && drawerContent) {
            const clone = sidebarNavList.cloneNode(true);
            // Wrap in a <ul class="nav-list"> inside .nav so existing CSS applies
            const navWrapper = document.createElement("nav");
            navWrapper.className = "nav";
            navWrapper.appendChild(clone);
            drawerContent.appendChild(navWrapper);

            // Re-attach expand/collapse behaviour for cloned sub-lists
            navWrapper.querySelectorAll(".nav-list ul").forEach(ul => {
                ul.style.display = "none";

                // Find the direct parent <li> of this <ul>, then its <a>
                const parentLi   = ul.parentElement;
                const parentLink = parentLi.querySelector(":scope > a");
                if (!parentLink) return;

                // Remove any duplicate ❯ icons carried over from the clone
                parentLink.querySelectorAll(".nav-toggle").forEach(i => i.remove());

                const icon = document.createElement("span");
                icon.className = "nav-toggle";
                icon.textContent = "❯";
                parentLink.appendChild(icon);

                // clicking a parent link → toggle sub-menu ONLY, keep drawer open
                parentLink.addEventListener("click", e => {
                    e.preventDefault();          // stop page jump; sub-menu is the action
                    e.stopPropagation();         // don't bubble to backdrop
                    const isOpen = ul.style.display !== "none";
                    ul.style.display = isOpen ? "none" : "block";
                    icon.classList.toggle("open", !isOpen);
                });
            });

            // Close drawer ONLY when a true leaf link is clicked
            // (a leaf = an <a> whose parent <li> has NO child <ul>)
            navWrapper.querySelectorAll(".nav-list a").forEach(link => {
                const parentLi = link.closest("li");
                const hasChildren = parentLi && parentLi.querySelector(":scope > ul");

                if (!hasChildren) {
                    // It's a leaf — navigate AND close
                    link.addEventListener("click", () => {
                        closeDrawer();
                    });
                }
                // parent toggle links: no close listener added — drawer stays open
            });
        }

        // --- Open / Close helpers ---
        function openDrawer() {
            drawer.classList.add("open");
            backdrop.classList.add("visible");
            hamburgerBtn.classList.add("open");
            hamburgerBtn.setAttribute("aria-expanded", "true");
            drawer.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden"; // lock scroll
        }

        function closeDrawer() {
            drawer.classList.remove("open");
            backdrop.classList.remove("visible");
            hamburgerBtn.classList.remove("open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
            drawer.setAttribute("aria-hidden", "true");
            document.body.style.overflow = ""; // restore scroll
        }

        // --- Event listeners ---
        hamburgerBtn.addEventListener("click", () => {
            drawer.classList.contains("open") ? closeDrawer() : openDrawer();
        });

        if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

        backdrop.addEventListener("click", closeDrawer);

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
        });

        // Reset body scroll if window is resized above mobile breakpoint
        window.addEventListener("resize", () => {
            if (window.innerWidth > 980) {
                closeDrawer();
            }
        });
    }());

    /* ── Collapsible Sections ────────────────────────────────── */
    const collapsibleSections = document.querySelectorAll(".section-collapsible");
    const globalToggleBtn = document.getElementById("part-toggle-all");

    function updateGlobalToggleState() {
        if (!globalToggleBtn || collapsibleSections.length === 0) return;
        const allCollapsed = Array.from(collapsibleSections).every(s => s.classList.contains("collapsed"));
        if (allCollapsed) {
            globalToggleBtn.classList.add("active");
        } else {
            globalToggleBtn.classList.remove("active");
        }
    }

    collapsibleSections.forEach(section => {
        const header = section.querySelector(".section-header");
        if (!header) return;
        
        // Create toggle button
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "section-toggle-btn";
        toggleBtn.setAttribute("aria-label", "Toggle Section");
        toggleBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;
        header.appendChild(toggleBtn);
        
        // Add collapsed indicator badge
        const indicator = document.createElement("div");
        indicator.className = "collapsed-indicator";
        indicator.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
            </svg>
            <span>Section minimized (click to expand)</span>
        `;
        header.appendChild(indicator);
        
        // Make header clickable
        header.addEventListener("click", (e) => {
            // Prevent toggling if user clicks on a link or button inside the header (other than toggle itself)
            if (e.target.closest("a") || e.target.closest("input")) return;
            
            const isCollapsed = section.classList.toggle("collapsed");
            const content = section.querySelector(".note-shell");
            
            if (content) {
                if (isCollapsed) {
                    content.style.maxHeight = "0px";
                } else {
                    // Temporarily set to scrollHeight, then clean up after transition
                    content.style.maxHeight = content.scrollHeight + "px";
                    setTimeout(() => {
                        if (!section.classList.contains("collapsed")) {
                            content.style.maxHeight = "";
                        }
                    }, 400);
                }
            }
            updateGlobalToggleState();
        });
    });

    /* ── Global Section Minimizer Toggle ───────────────────────── */
    if (globalToggleBtn) {
        globalToggleBtn.addEventListener("click", () => {
            const isPressed = globalToggleBtn.classList.toggle("active");
            
            collapsibleSections.forEach(section => {
                const content = section.querySelector(".note-shell");
                if (isPressed) {
                    section.classList.add("collapsed");
                    if (content) content.style.maxHeight = "0px";
                } else {
                    section.classList.remove("collapsed");
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + "px";
                        setTimeout(() => {
                            if (!section.classList.contains("collapsed")) {
                                content.style.maxHeight = "";
                            }
                        }, 400);
                    }
                }
            });
        });
    }
});

