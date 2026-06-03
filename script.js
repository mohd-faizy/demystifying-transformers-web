document.addEventListener("DOMContentLoaded", () => {

    /* ── Cyber Theme Toggle (checkbox) ───────────────────────── */
    const themeToggles = document.querySelectorAll(".cyber-toggle-checkbox");
    const body = document.body;

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        themeToggles.forEach(t => t.checked = true);
    }

    themeToggles.forEach(themeToggle => {
        themeToggle.addEventListener("change", (e) => {
            const isDark = e.target.checked;
            themeToggles.forEach(t => t.checked = isDark);
            
            if (isDark) {
                body.classList.add("dark-mode");
                localStorage.setItem("theme", "dark");
            } else {
                body.classList.remove("dark-mode");
                localStorage.setItem("theme", "light");
            }
        });
    });

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

    /* ── 9-Step Interactive Transformer Pipeline logic ───────────────── */
    (function () {
        // Elements
        const pipelineInput = document.getElementById("pipeline-input");
        const presetBtns = document.querySelectorAll(".pipeline-preset-btn");
        const prevBtn = document.getElementById("pipeline-prev-btn");
        const playBtn = document.getElementById("pipeline-play-btn");
        const nextBtn = document.getElementById("pipeline-next-btn");
        const resetBtn = document.getElementById("pipeline-reset-btn");
        const speedSlider = document.getElementById("pipeline-speed");
        const speedVal = document.getElementById("pipeline-speed-val");
        const stepItems = document.querySelectorAll(".pipeline-step-item");
        const panes = document.querySelectorAll(".sandbox-pane");

        if (!pipelineInput || stepItems.length === 0) return;

        // State
        let currentStep = 1;
        let isPlaying = false;
        let playInterval = null;
        let speed = parseInt(speedSlider.value, 10);
        let currentInput = pipelineInput.value;

        // Custom presets translations & words mappings
        const mockTranslationDB = {
            "attention is all you need": {
                target: "<bos> Aufmerksamkeit ist alles was",
                nextWord: "du brauchst",
                candidates: [
                    { word: "du brauchst", prob: 88.5 },
                    { word: "brauchst", prob: 6.2 },
                    { word: "nötig", prob: 3.1 },
                    { word: "ist", prob: 1.2 },
                    { word: "tut", prob: 0.5 }
                ]
            },
            "deep learning is magic": {
                target: "<bos> Deep Learning ist wie Magie",
                nextWord: "und Wissenschaft",
                candidates: [
                    { word: "und Wissenschaft", prob: 74.2 },
                    { word: "für uns", prob: 12.8 },
                    { word: "zu verstehen", prob: 7.1 },
                    { word: "aber wahr", prob: 4.0 },
                    { word: "glaube ich", prob: 1.5 }
                ]
            },
            "hello transformer world": {
                target: "<bos> Hallo Transformer-Welt wie",
                nextWord: "geht es",
                candidates: [
                    { word: "geht es", prob: 82.1 },
                    { word: "schön", prob: 9.3 },
                    { word: "du", prob: 4.8 },
                    { word: "läuft", prob: 2.2 },
                    { word: "war", prob: 0.9 }
                ]
            }
        };

        // Fallback generator for custom inputs
        function getTranslationData(inputText) {
            const clean = inputText.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            if (mockTranslationDB[clean]) {
                return mockTranslationDB[clean];
            }
            // Generate fallback translation values
            const words = clean.split(/\s+/).filter(Boolean);
            const targetWords = words.map(w => w.substring(0, Math.min(w.length, 5)) + "en");
            const targetText = "<bos> " + targetWords.slice(0, Math.max(1, targetWords.length - 1)).join(" ");
            const nextWord = targetWords[targetWords.length - 1] || "ende";
            
            return {
                target: targetText,
                nextWord: nextWord,
                candidates: [
                    { word: nextWord, prob: 78.4 },
                    { word: nextWord + "st", prob: 11.2 },
                    { word: "und", prob: 5.3 },
                    { word: "nicht", prob: 3.2 },
                    { word: "der", prob: 1.5 }
                ]
            };
        }

        // Simple mock tokenizer (generates stable hashes for token IDs)
        function getTokens(inputText) {
            const rawWords = inputText.trim().split(/\s+/).filter(Boolean);
            const tokensList = [];
            
            rawWords.forEach((word, idx) => {
                // simple hash code generator
                let hash = 0;
                for (let i = 0; i < word.length; i++) {
                    hash = word.charCodeAt(i) + ((hash << 5) - hash);
                }
                const baseId = Math.abs(hash % 28000) + 2000; // range 2000 - 30000
                
                // For long words, split them to simulate subwords
                if (word.length > 7) {
                    const mid = Math.floor(word.length / 2);
                    const part1 = word.substring(0, mid);
                    const part2 = word.substring(mid);
                    tokensList.push({ text: part1, id: baseId });
                    tokensList.push({ text: "##" + part2, id: Math.abs((baseId * 17) % 28000) + 2000 });
                } else {
                    tokensList.push({ text: word, id: baseId });
                }
            });
            return tokensList;
        }

        // Color palettes for chips
        const chipColors = [
            { bg: "rgba(14, 165, 233, 0.12)", border: "rgba(14, 165, 233, 0.35)", color: "var(--accent)" },
            { bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.35)", color: "var(--accent-2)" },
            { bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.35)", color: "#16a34a" },
            { bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.35)", color: "#9333ea" },
            { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.35)", color: "#dc2626" },
            { bg: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.35)", color: "#ca8a04" },
            { bg: "rgba(20, 184, 166, 0.12)", border: "rgba(20, 184, 166, 0.35)", color: "#0d9488" }
        ];

        // Seeded random for consistent floats
        function getSeededRandom(seedString) {
            let hash = 0;
            for (let i = 0; i < seedString.length; i++) {
                hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
            }
            return function() {
                const x = Math.sin(hash++) * 10000;
                return x - Math.floor(x);
            };
        }

        // RENDER VIEWS

        function renderStep1() {
            const data = getTranslationData(currentInput);
            document.getElementById("step1-source-text").textContent = currentInput;
            document.getElementById("step1-target-text").textContent = data.target;
            
            const readout = document.getElementById("step1-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <strong>Seq2Seq Dimensions:</strong><br>
                    Source sequence input: $X_{\\text{enc}} \\in \\mathbb{R}^{T_{\\text{enc}} \\times d_{\\text{vocab\_src}}}$ with $T_{\\text{enc}} = ${getTokens(currentInput).length}$ tokens.<br>
                    Decoder target sequence input: $Y_{\\text{dec}} \\in \\mathbb{R}^{T_{\\text{dec}} \\times d_{\\text{vocab\_trg}}}$ with $T_{\\text{dec}} = ${data.target.split(/\s+/).filter(Boolean).length}$ tokens.
                `;
            }
        }

        function renderStep2() {
            const display = document.getElementById("step2-tokens-display");
            display.innerHTML = "";
            const tokens = getTokens(currentInput);
            
            const detailContainer = document.getElementById("step2-token-detail");
            const detailText = document.getElementById("step2-token-detail-text");
            
            tokens.forEach((token, idx) => {
                const color = chipColors[idx % chipColors.length];
                const chip = document.createElement("div");
                chip.className = "token-chip";
                chip.style.backgroundColor = color.bg;
                chip.style.borderColor = color.border;
                chip.style.color = color.color;
                chip.style.animationDelay = `${idx * 0.05}s`;
                chip.style.cursor = "pointer";
                
                chip.innerHTML = `
                    <span class="token-chip-text">${token.text}</span>
                    <span class="token-chip-id">ID: ${token.id}</span>
                `;
                
                chip.addEventListener("click", () => {
                    detailContainer.style.display = "block";
                    const charStart = currentInput.indexOf(token.text);
                    const charEnd = charStart + token.text.length;
                    
                    detailText.innerHTML = `
                        <strong>Subword:</strong> <code style="color:var(--accent); font-size:1.05rem;">"${token.text}"</code><br>
                        <strong>Vocabulary ID:</strong> <code>${token.id}</code><br>
                        <strong>String character bounds:</strong> index <code>${charStart}</code> to <code>${charEnd}</code> inside sequence.<br>
                        <strong>Pedagogical Note:</strong> This subword was created by scanning training text and merging frequent character pairs (like "t" + "h" &rarr; "th").
                    `;
                    display.querySelectorAll(".token-chip").forEach(c => c.style.boxShadow = "");
                    chip.style.boxShadow = `0 0 0 3px var(--accent)`;
                });
                
                display.appendChild(chip);
            });

            const readout = document.getElementById("step2-math-readout");
            if (readout) {
                const idsString = tokens.map(t => t.id).join(", ");
                readout.innerHTML = `
                    <strong>Tokenization Index Matrix:</strong><br>
                    $t = \\text{Tokenizer}(\\text{"${currentInput}"}) = [${idsString}]$ where $t_i \\in \\mathbb{Z}_{|V|}$ and $|V| = 37,000$.
                `;
            }
        }

        function renderStep3() {
            const container = document.getElementById("step3-embeddings-container");
            container.innerHTML = "";
            const tokens = getTokens(currentInput);
            const hoverDetail = document.getElementById("step3-hover-detail");
            
            tokens.forEach((token) => {
                const row = document.createElement("div");
                row.className = "embedding-token-row";
                
                const label = document.createElement("span");
                label.className = "embedding-token-label";
                label.textContent = token.text;
                row.appendChild(label);
                
                const cellsWrap = document.createElement("div");
                cellsWrap.className = "embedding-vector-cells";
                
                const random = getSeededRandom(token.text + token.id);
                for (let i = 0; i < 16; i++) {
                    const val = (random() * 2 - 1).toFixed(3);
                    const cell = document.createElement("div");
                    cell.className = "embedding-cell";
                    
                    let r, g, b;
                    if (val >= 0) {
                        r = 15; g = 118; b = 110; // teal
                    } else {
                        r = 180; g = 83; b = 9; // orange
                    }
                    const alpha = Math.abs(val);
                    cell.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    cell.style.cursor = "crosshair";
                    
                    cell.addEventListener("mouseenter", () => {
                        cell.style.transform = "scale(1.2)";
                        hoverDetail.innerHTML = `
                            Token: <code style="color:var(--accent); font-weight:700;">"${token.text}"</code> | 
                            Dimension <strong>${i}</strong> | 
                            Value: <code style="color:${val >= 0 ? 'var(--accent)' : 'var(--accent-2)'}; font-weight:700;">${val}</code> 
                            <span style="font-size:0.75rem; font-weight:normal; color:var(--muted);">(${val >= 0 ? "positively correlates with semantic concept" : "negatively correlates with semantic concept"})</span>
                        `;
                    });
                    cell.addEventListener("mouseleave", () => {
                        cell.style.transform = "";
                    });
                    
                    cellsWrap.appendChild(cell);
                }
                
                const ellipsis = document.createElement("span");
                ellipsis.className = "embedding-ellipsis";
                ellipsis.textContent = "... (+496 dims)";
                cellsWrap.appendChild(ellipsis);
                
                row.appendChild(cellsWrap);
                container.appendChild(row);
            });

            const readout = document.getElementById("step3-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <strong>Embedding Matrix Lookup:</strong><br>
                    $E_i = \\text{EmbeddingLookup}(t_i) = W_E[t_i, :] \\in \\mathbb{R}^{512}$ where $W_E \\in \\mathbb{R}^{37,000 \\times 512}$ is learned during training.<br>
                    Full sequence representation: $E = [E_1; E_2; \\dots; E_T] \\in \\mathbb{R}^{T \\times 512}$.
                `;
            }
        }

        let pePosVal = 1;
        let peDimVal = 0;

        function renderStep4() {
            const svg = document.getElementById("step4-wave-svg");
            if (!svg) return;
            svg.innerHTML = "";
            
            const w = svg.clientWidth || 400;
            const h = svg.clientHeight || 150;
            const padding = 20;
            const drawW = w - padding * 2;
            const drawH = h - padding * 2;
            const midY = padding + drawH / 2;
            
            const posSlider = document.getElementById("pe-pos-slider");
            const dimSlider = document.getElementById("pe-dim-slider");
            const posValSpan = document.getElementById("pe-pos-val");
            const dimValSpan = document.getElementById("pe-dim-val");
            const mathReadout = document.getElementById("pe-math-readout");
            
            if (posSlider) pePosVal = parseInt(posSlider.value, 10);
            if (dimSlider) peDimVal = parseInt(dimSlider.value, 10);
            if (posValSpan) posValSpan.textContent = pePosVal;
            if (dimValSpan) dimValSpan.textContent = peDimVal;
            
            // Draw axis
            const axisPath = document.createElementNS("http://www.w3.org/2000/svg", "line");
            axisPath.setAttribute("x1", padding);
            axisPath.setAttribute("y1", midY);
            axisPath.setAttribute("x2", w - padding);
            axisPath.setAttribute("y2", midY);
            axisPath.setAttribute("stroke", "var(--line)");
            axisPath.setAttribute("stroke-width", "1");
            svg.appendChild(axisPath);
            
            const gridLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLeft.setAttribute("x1", padding);
            gridLeft.setAttribute("y1", padding);
            gridLeft.setAttribute("x2", padding);
            gridLeft.setAttribute("y2", h - padding);
            gridLeft.setAttribute("stroke", "var(--line)");
            gridLeft.setAttribute("stroke-width", "1");
            svg.appendChild(gridLeft);
            
            // Draw waves
            let sinPoints = [];
            let cosPoints = [];
            
            const dModel = 512;
            const divTerm = Math.pow(10000, peDimVal / dModel);
            const currentFrequency = 1 / divTerm;
            
            for (let x = 0; x <= drawW; x++) {
                const posX = padding + x;
                const posParam = (x / drawW) * 6; // map x axis to position 0 to 6
                
                const valSin = Math.sin(posParam * currentFrequency * Math.PI);
                const valCos = Math.cos(posParam * currentFrequency * Math.PI);
                
                const ySin = midY - valSin * (drawH / 2.5);
                const yCos = midY - valCos * (drawH / 2.5);
                
                sinPoints.push(`${posX},${ySin}`);
                cosPoints.push(`${posX},${yCos}`);
            }
            
            const sinPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            sinPath.setAttribute("d", "M" + sinPoints.join(" L"));
            sinPath.setAttribute("fill", "none");
            sinPath.setAttribute("stroke", "#0f766e");
            sinPath.setAttribute("stroke-width", "2.5");
            svg.appendChild(sinPath);
            
            const cosPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            cosPath.setAttribute("d", "M" + cosPoints.join(" L"));
            cosPath.setAttribute("fill", "none");
            cosPath.setAttribute("stroke", "#b45309");
            cosPath.setAttribute("stroke-width", "1.5");
            cosPath.setAttribute("stroke-dasharray", "4 2");
            svg.appendChild(cosPath);
            
            // Draw Tracker Dot at selected Position (pePosVal)
            const dotX = padding + (pePosVal / 6) * drawW;
            const trackerValSin = Math.sin(pePosVal * currentFrequency * Math.PI);
            const dotY = midY - trackerValSin * (drawH / 2.5);
            
            const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            vLine.setAttribute("x1", dotX);
            vLine.setAttribute("y1", padding);
            vLine.setAttribute("x2", dotX);
            vLine.setAttribute("y2", h - padding);
            vLine.setAttribute("stroke", "var(--accent-3)");
            vLine.setAttribute("stroke-width", "1");
            vLine.setAttribute("stroke-dasharray", "2 2");
            svg.appendChild(vLine);
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", dotX);
            circle.setAttribute("cy", dotY);
            circle.setAttribute("r", "6");
            circle.setAttribute("fill", "#0f766e");
            circle.setAttribute("stroke", "#fff");
            circle.setAttribute("stroke-width", "2");
            svg.appendChild(circle);
            
            const peFormulaVal = trackerValSin.toFixed(4);
            if (mathReadout) {
                mathReadout.innerHTML = `
                    <strong>Sinusoidal Coordinate Injection:</strong><br>
                    $\\text{PE}(\\text{pos}=${pePosVal}, \\text{dim}=${peDimVal}) = \\sin\\left(\\frac{${pePosVal}}{10000^{${peDimVal}/512}}\\right) = ${peFormulaVal}$<br>
                    Combined representation: $Z = E + \\text{PE} \\in \\mathbb{R}^{T \\times 512}$.
                `;
            }
        }

        let step5ActiveHead = 1;
        let step5ActiveNode = 0;

        function renderStep5() {
            const list = document.getElementById("step5-attention-list");
            const grid = document.getElementById("step5-matrix-grid");
            const svg = document.getElementById("step5-attention-graph");
            
            if (!list || !grid || !svg) return;
            
            list.innerHTML = "";
            grid.innerHTML = "";
            svg.innerHTML = "";
            
            const tokens = getTokens(currentInput);
            const N = tokens.length;
            if (N === 0) return;
            
            const attentionMatrix = [];
            const random = getSeededRandom(currentInput + "_attn_head_" + step5ActiveHead);
            
            for (let i = 0; i < N; i++) {
                attentionMatrix[i] = [];
                let rowSum = 0;
                for (let j = 0; j < N; j++) {
                    let score = random();
                    if (step5ActiveHead === 1) {
                        if (i === j) score += 0.5;
                        if (Math.abs(i - j) === 1) score += 1.5;
                    } else if (step5ActiveHead === 2) {
                        if (i === j) score += 3.0;
                    } else if (step5ActiveHead === 3) {
                        if (j === 0 || j === N - 1) score += 2.0;
                    } else {
                        score += 0.8;
                    }
                    
                    attentionMatrix[i][j] = score;
                    rowSum += score;
                }
                for (let j = 0; j < N; j++) {
                    attentionMatrix[i][j] /= rowSum;
                }
            }
            
            grid.style.gridTemplateColumns = `repeat(${N}, 20px)`;
            
            function selectWordIndex(selectedIdx) {
                step5ActiveNode = selectedIdx;
                
                const nodes = list.querySelectorAll(".attention-word-node");
                nodes.forEach((n, idx) => {
                    n.classList.toggle("selected", idx === selectedIdx);
                    const strengthBar = n.querySelector(".attention-strength-bar");
                    if (strengthBar) {
                        const score = attentionMatrix[selectedIdx][idx];
                        strengthBar.style.width = `${score * 100}%`;
                    }
                });
                
                const cells = grid.querySelectorAll(".matrix-cell");
                cells.forEach((cell) => {
                    const row = parseInt(cell.dataset.row, 10);
                    const col = parseInt(cell.dataset.col, 10);
                    if (row === selectedIdx) {
                        cell.style.transform = "scale(1.15)";
                        cell.style.boxShadow = "0 0 4px var(--accent)";
                        cell.style.outline = "1px solid var(--accent)";
                    } else {
                        cell.style.transform = "";
                        cell.style.boxShadow = "";
                        cell.style.outline = "";
                    }
                });
                
                drawAttentionLines(selectedIdx);
            }
            
            tokens.forEach((token, idx) => {
                const item = document.createElement("div");
                item.className = "attention-word-node";
                item.dataset.index = idx;
                item.innerHTML = `
                    <span>${token.text}</span>
                    <div style="flex-grow:1; max-width:80px; margin-left:10px;">
                        <div class="attention-strength-bar" style="width: 0%;"></div>
                    </div>
                `;
                item.addEventListener("mouseenter", () => selectWordIndex(idx));
                list.appendChild(item);
            });
            
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const score = attentionMatrix[r][c];
                    const cell = document.createElement("div");
                    cell.className = "matrix-cell";
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.style.width = "20px";
                    cell.style.height = "20px";
                    cell.style.backgroundColor = `rgba(15, 118, 110, ${score * 1.5})`;
                    cell.title = `Attention from "${tokens[r].text}" to "${tokens[c].text}": ${(score*100).toFixed(1)}%`;
                    cell.addEventListener("mouseenter", () => selectWordIndex(r));
                    grid.appendChild(cell);
                }
            }
            
            const svgW = svg.clientWidth || 450;
            const svgH = svg.clientHeight || 220;
            const nodeY = svgH / 2;
            const nodesPos = [];
            const margin = 40;
            
            tokens.forEach((token, idx) => {
                const x = margin + (idx / (N - 1 || 1)) * (svgW - margin * 2);
                nodesPos.push({ x, y: nodeY });
            });
            
            function drawAttentionLines(selectedIdx) {
                svg.querySelectorAll(".graph-connection-line").forEach(p => p.remove());
                
                nodesPos.forEach((targetPos, idx) => {
                    const score = attentionMatrix[selectedIdx][idx];
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    
                    const startX = nodesPos[selectedIdx].x;
                    const startY = nodesPos[selectedIdx].y;
                    const endX = targetPos.x;
                    const endY = targetPos.y;
                    
                    const diffX = endX - startX;
                    const cpY = startY - Math.abs(diffX) * 0.4 - 20;
                    
                    const d = `M ${startX} ${startY} Q ${(startX + endX)/2} ${cpY} ${endX} ${endY}`;
                    path.setAttribute("d", d);
                    path.setAttribute("class", "graph-connection-line");
                    path.setAttribute("stroke", "var(--accent)");
                    path.setAttribute("stroke-width", `${1 + score * 8}`);
                    path.setAttribute("opacity", `${0.1 + score * 0.8}`);
                    
                    if (score > 0.25) {
                        path.setAttribute("stroke-dasharray", "6 4");
                    }
                    svg.insertBefore(path, svg.firstChild);
                });
            }
            
            tokens.forEach((token, idx) => {
                const pos = nodesPos[idx];
                
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", pos.x);
                circle.setAttribute("cy", pos.y);
                circle.setAttribute("r", "12");
                circle.setAttribute("fill", idx === step5ActiveNode ? "var(--accent)" : "var(--panel)");
                circle.setAttribute("stroke", "var(--accent)");
                circle.setAttribute("stroke-width", "2");
                circle.setAttribute("class", "graph-node-dot");
                circle.addEventListener("click", () => selectWordIndex(idx));
                circle.addEventListener("mouseenter", () => selectWordIndex(idx));
                svg.appendChild(circle);
                
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", pos.x);
                text.setAttribute("y", pos.y + 26);
                text.setAttribute("class", "graph-node-text");
                text.textContent = token.text;
                svg.appendChild(text);
            });
            
            selectWordIndex(step5ActiveNode >= N ? 0 : step5ActiveNode);
            
            const readout = document.getElementById("step5-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <strong>Multi-Head Query-Key-Value Self-Attention:</strong><br>
                    $Q = Z W_Q, \\; K = Z W_K, \\; V = Z W_V$ (where $W_Q, W_K, W_V \\in \\mathbb{R}^{512 \\times 64}$ per head).<br>
                    $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{64}}\\right) V \\in \\mathbb{R}^{T \\times 64}$ for Head ${step5ActiveHead}.
                `;
            }

            const headButtons = document.getElementById("step5-head-buttons");
            if (headButtons) {
                headButtons.querySelectorAll(".head-btn").forEach(btn => {
                    btn.onclick = (e) => {
                        headButtons.querySelectorAll(".head-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        step5ActiveHead = parseInt(btn.dataset.head, 10);
                        renderStep5();
                    };
                });
            }
        }

        function renderStep6() {
            const decList = document.getElementById("step6-decoder-list");
            const encList = document.getElementById("step6-encoder-mem-list");
            const padlockGrid = document.getElementById("step6-padlock-grid");
            
            if (!decList || !encList || !padlockGrid) return;
            
            decList.innerHTML = "";
            encList.innerHTML = "";
            padlockGrid.innerHTML = "";
            
            const srcTokens = getTokens(currentInput);
            const data = getTranslationData(currentInput);
            const trgTokens = data.target.split(/\s+/).filter(Boolean);
            const M = trgTokens.length;
            
            padlockGrid.style.gridTemplateColumns = `repeat(${M + 1}, auto)`;
            
            const emptyCell = document.createElement("div");
            emptyCell.className = "padlock-cell";
            padlockGrid.appendChild(emptyCell);
            
            trgTokens.forEach(t => {
                const headerCell = document.createElement("div");
                headerCell.className = "padlock-cell";
                headerCell.style.fontSize = "0.68rem";
                headerCell.style.fontWeight = "700";
                headerCell.style.color = "var(--muted)";
                headerCell.textContent = t.substring(0, 4);
                padlockGrid.appendChild(headerCell);
            });
            
            for (let r = 0; r < M; r++) {
                const labelCell = document.createElement("div");
                labelCell.className = "padlock-cell";
                labelCell.style.fontSize = "0.68rem";
                labelCell.style.fontWeight = "700";
                labelCell.style.color = "var(--muted)";
                labelCell.textContent = trgTokens[r].substring(0, 4);
                padlockGrid.appendChild(labelCell);
                
                for (let c = 0; c < M; c++) {
                    const cell = document.createElement("div");
                    cell.className = "padlock-cell";
                    if (c > r) {
                        cell.classList.add("masked");
                        cell.innerHTML = "🔒";
                        cell.title = `Masked: "${trgTokens[r]}" cannot attend to future word "${trgTokens[c]}"`;
                    } else {
                        cell.classList.add("visible");
                        cell.innerHTML = "🔓";
                        cell.title = `Visible: "${trgTokens[r]}" attends to past word "${trgTokens[c]}"`;
                    }
                    padlockGrid.appendChild(cell);
                }
            }
            
            trgTokens.forEach((token, idx) => {
                const item = document.createElement("div");
                item.className = "attention-word-node";
                item.innerHTML = `
                    <span>${token}</span>
                    <span style="font-size: 0.65rem; color:var(--muted); font-weight:600;">Pos: ${idx}</span>
                `;
                
                item.addEventListener("mouseenter", () => {
                    const allDec = decList.querySelectorAll(".attention-word-node");
                    allDec.forEach((node, nIdx) => {
                        if (nIdx <= idx) {
                            node.style.opacity = "1";
                            node.style.borderStyle = "solid";
                        } else {
                            node.style.opacity = "0.35";
                            node.style.borderStyle = "dashed";
                        }
                    });
                    
                    const random = getSeededRandom(token + idx + "_cross");
                    const encNodes = encList.querySelectorAll(".attention-word-node");
                    encNodes.forEach((node, eIdx) => {
                        const score = random();
                        const strengthBar = node.querySelector(".attention-strength-bar");
                        if (strengthBar) {
                            strengthBar.style.width = `${score * 90}%`;
                        }
                    });
                });
                decList.appendChild(item);
            });
            
            srcTokens.forEach((token, idx) => {
                const item = document.createElement("div");
                item.className = "attention-word-node";
                item.style.borderColor = "var(--line)";
                item.innerHTML = `
                    <span>[Enc Memory] ${token.text}</span>
                    <div style="flex-grow:1; max-width:60px; margin-left:8px;">
                        <div class="attention-strength-bar" style="width: 20%; background:var(--accent-2);"></div>
                    </div>
                `;
                encList.appendChild(item);
            });
            
            if (trgTokens.length > 0) {
                const first = decList.querySelector(".attention-word-node");
                if (first) {
                    const event = new Event('mouseenter');
                    first.dispatchEvent(event);
                }
            }

            const readout = document.getElementById("step6-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <strong>Masked Self-Attention &amp; Encoder-Decoder Cross Attention:</strong><br>
                    Causal masking formulation: $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}} + M\\right) V$ where $M_{ij} = 0 \\text{ if } j \\le i \\text{ else } -\\infty$.<br>
                    Cross Attention key-value source mapping: $Q_{\\text{dec}} = Y W_Q, \\; K_{\\text{enc}} = H_{\\text{enc}} W_K, \\; V_{\\text{enc}} = H_{\\text{enc}} W_V$.
                `;
            }
        }

        function renderStep7() {
            const readout = document.getElementById("step7-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <strong>Logit Projection Layer:</strong><br>
                    $\\text{Logits} = Z_{\\text{dec\_final}} W_U + b \\in \\mathbb{R}^{37,000}$ where $W_U \\in \\mathbb{R}^{512 \\times 37,000}$.<br>
                    This projects the final 512-dim decoder state back to the size of the vocabulary.
                `;
            }
        }

        function renderStep8() {
            const chart = document.getElementById("step8-logits-chart");
            if (!chart) return;
            chart.innerHTML = "";
            
            const data = getTranslationData(currentInput);
            const tempSlider = document.getElementById("softmax-temp-slider");
            const tempVal = tempSlider ? parseFloat(tempSlider.value) : 1.0;
            
            const candidates = [
                { word: data.nextWord, logit: 3.5 },
                { word: data.nextWord === "du" ? "brauchst" : "du", logit: 2.2 },
                { word: "Aufmerksamkeit", logit: 1.0 },
                { word: "ist", logit: 0.2 },
                { word: "alles", logit: -0.5 }
            ];
            
            let sumExp = 0;
            const expValues = candidates.map(c => {
                const val = Math.exp(c.logit / tempVal);
                sumExp += val;
                return val;
            });
            
            const probs = expValues.map(v => (v / sumExp) * 100);
            
            candidates.forEach((cand, idx) => {
                const prob = probs[idx];
                const row = document.createElement("div");
                row.className = "logit-row";
                
                const label = document.createElement("span");
                label.className = "logit-word-label";
                label.textContent = cand.word;
                row.appendChild(label);
                
                const barWrapper = document.createElement("div");
                barWrapper.className = "logit-bar-wrapper";
                
                const barFill = document.createElement("div");
                barFill.className = "logit-bar-fill";
                barFill.style.width = "0%";
                
                setTimeout(() => {
                    barFill.style.width = `${prob}%`;
                }, 50 + idx * 40);
                
                barWrapper.appendChild(barFill);
                row.appendChild(barWrapper);
                
                const percentage = document.createElement("span");
                percentage.className = "logit-percentage";
                percentage.textContent = `${prob.toFixed(1)}%`;
                row.appendChild(percentage);
                
                chart.appendChild(row);
            });
            
            const mathBox = document.getElementById("softmax-math-explanation");
            if (mathBox) {
                if (tempVal <= 0.4) {
                    mathBox.innerHTML = `🔥 <strong>Greedy Mode (T=${tempVal}):</strong> Highly confident, focuses entirely on the highest logit.<br>
                        Softmax scaling: $P(w_i) = \\frac{\\exp(\\text{logit}_i / ${tempVal})}{\\sum_j \\exp(\\text{logit}_j / ${tempVal})}$`;
                    mathBox.style.borderLeftColor = "var(--accent)";
                } else if (tempVal >= 1.5) {
                    mathBox.innerHTML = `🎨 <strong>Creative Mode (T=${tempVal}):</strong> Softmax distribution is flattened; other words have a higher chance of selection.<br>
                        Softmax scaling: $P(w_i) = \\frac{\\exp(\\text{logit}_i / ${tempVal})}{\\sum_j \\exp(\\text{logit}_j / ${tempVal})}$`;
                    mathBox.style.borderLeftColor = "var(--accent-2)";
                } else {
                    mathBox.innerHTML = `⚙️ <strong>Standard Scaling (T=${tempVal}):</strong> Balanced confidence and distribution.<br>
                        Softmax scaling: $P(w_i) = \\frac{\\exp(\\text{logit}_i / ${tempVal})}{\\sum_j \\exp(\\text{logit}_j / ${tempVal})}$`;
                    mathBox.style.borderLeftColor = "var(--accent-3)";
                }
            }
        }

        function renderStep9() {
            const data = getTranslationData(currentInput);
            const selectedWord = document.getElementById("step9-selected-word");
            const newInput = document.getElementById("step9-new-input");
            
            selectedWord.textContent = `"${data.nextWord}"`;
            newInput.textContent = `${data.target} ${data.nextWord}`;

            const readout = document.getElementById("step9-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <strong>Autoregressive Update &amp; Sequence Concatenation:</strong><br>
                    $t_{\\text{next}} = \\text{argmax}_{w} \\, P(w) = \\text{ID} \\text{ of } \\text{"${data.nextWord}"}$<br>
                    $Y_{\\text{dec}}^{(t+1)} = \\left[ Y_{\\text{dec}}^{(t)} \\;; \\; t_{\\text{next}} \\right] = \\text{["${data.target} ${data.nextWord}"]}$.
                `;
            }
        }

        function renderActiveStep() {
            // Update stepper active classes
            stepItems.forEach((item, idx) => {
                const stepNum = idx + 1;
                item.classList.toggle("active", stepNum === currentStep);
                item.classList.toggle("completed", stepNum < currentStep);
                
                const icon = item.querySelector(".pipeline-step-icon");
                if (icon) {
                    icon.classList.toggle("pulse-active", stepNum === currentStep && isPlaying);
                }
            });

            // Update panels
            panes.forEach((pane) => {
                const stepNum = parseInt(pane.dataset.step, 10);
                pane.classList.toggle("active", stepNum === currentStep);
            });

            // Render detailed views
            switch (currentStep) {
                case 1: renderStep1(); break;
                case 2: renderStep2(); break;
                case 3: renderStep3(); break;
                case 4: renderStep4(); break;
                case 5: renderStep5(); break;
                case 6: renderStep6(); break;
                case 7: renderStep7(); break;
                case 8: renderStep8(); break;
                case 9: renderStep9(); break;
            }

            // Trigger MathJax typesetting if loaded
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise().catch((err) => console.log('MathJax typesetting error:', err));
            }

            // Disable/enable prev/next buttons
            prevBtn.disabled = currentStep === 1;
            prevBtn.disabled = currentStep === 1;
            nextBtn.disabled = currentStep === 9;
        }

        // STEP PLAYBACK CONTROLS

        function nextStep() {
            if (currentStep < 9) {
                currentStep++;
                renderActiveStep();
            } else {
                pausePlayback();
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                renderActiveStep();
            }
        }

        function resetPlayback() {
            currentStep = 1;
            renderActiveStep();
        }

        function playPlayback() {
            if (isPlaying) return;
            isPlaying = true;
            playBtn.innerHTML = "⏸"; // Change icon to pause
            playBtn.classList.add("active-play");
            
            // If at the end, wrap to beginning
            if (currentStep === 9) {
                currentStep = 1;
                renderActiveStep();
            }

            playInterval = setInterval(() => {
                nextStep();
            }, speed);

            renderActiveStep();
        }

        // Event listener helpers
        function pausePlayback() {
            if (!isPlaying) return;
            isPlaying = false;
            playBtn.innerHTML = "▶"; // Change icon to play
            playBtn.classList.remove("active-play");
            clearInterval(playInterval);
            renderActiveStep();
        }

        // EVENT LISTENERS

        // Click step in sidebar
        stepItems.forEach(item => {
            item.addEventListener("click", () => {
                pausePlayback();
                currentStep = parseInt(item.dataset.step, 10);
                renderActiveStep();
            });
        });

        // Controller buttons
        prevBtn.addEventListener("click", () => {
            pausePlayback();
            prevStep();
        });

        nextBtn.addEventListener("click", () => {
            pausePlayback();
            nextStep();
        });

        resetBtn.addEventListener("click", () => {
            pausePlayback();
            resetPlayback();
        });

        playBtn.addEventListener("click", () => {
            if (isPlaying) {
                pausePlayback();
            } else {
                playPlayback();
            }
        });

        // Speed slider
        speedSlider.addEventListener("input", (e) => {
            speed = parseInt(e.target.value, 10);
            speedVal.textContent = `${(speed / 1000).toFixed(2)}s`;
            if (isPlaying) {
                pausePlayback();
                playPlayback();
            }
        });

        // Preset buttons
        presetBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const text = btn.dataset.text;
                pipelineInput.value = text;
                currentInput = text;
                pausePlayback();
                renderActiveStep();
            });
        });

        // Text input field change
        pipelineInput.addEventListener("input", (e) => {
            const text = e.target.value.trim();
            if (text.length > 0) {
                currentInput = text;
            } else {
                currentInput = "Attention is all you need";
            }
            renderActiveStep();
        });

        // Initialize wave resize listener
        window.addEventListener("resize", () => {
            if (currentStep === 4) {
                renderStep4();
            }
        });

        // PE sliders
        const pePosSlider = document.getElementById("pe-pos-slider");
        const peDimSlider = document.getElementById("pe-dim-slider");
        if (pePosSlider) pePosSlider.addEventListener("input", renderStep4);
        if (peDimSlider) peDimSlider.addEventListener("input", renderStep4);
        
        // Temperature slider
        const tempSlider = document.getElementById("softmax-temp-slider");
        if (tempSlider) {
            tempSlider.addEventListener("input", (e) => {
                const tempValSpan = document.getElementById("softmax-temp-val");
                if (tempValSpan) tempValSpan.textContent = e.target.value;
                renderStep8();
            });
        }

        // Trigger initial render
        renderActiveStep();
    })();
});

