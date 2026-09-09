document.addEventListener("DOMContentLoaded", () => {

    /* ── Cyber Theme Toggle (checkbox) ───────────────────────── */
    const themeToggles = document.querySelectorAll(".cyber-toggle-checkbox");
    const body = document.body;

    if (localStorage.getItem("theme") !== "light") {
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
    document.querySelectorAll(".sidebar .nav-list ul").forEach(ul => {
        ul.style.display = "block";
        const parentLink = ul.parentElement.querySelector("a");
        if (!parentLink) return;
        const icon = document.createElement("span");
        icon.classList.add("nav-toggle", "open");
        icon.textContent = "❯";
        parentLink.appendChild(icon);
        parentLink.addEventListener("click", (e) => {
            if (e.target === icon) {
                e.preventDefault();
            }
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
        const playIcon = document.getElementById("pipeline-play-icon");
        const nextBtn = document.getElementById("pipeline-next-btn");
        const resetBtn = document.getElementById("pipeline-reset-btn");
        const speedSlider = document.getElementById("pipeline-speed");
        const speedVal = document.getElementById("pipeline-speed-val");
        const stepItems = document.querySelectorAll(".pipeline-step-item");
        const panes = document.querySelectorAll(".sandbox-pane");
        const progressFill = document.getElementById("pipeline-global-progress-fill");
        const stepBadge = document.getElementById("pipeline-current-step-badge");

        if (!pipelineInput || stepItems.length === 0) return;

        // State
        let currentStep = 1;
        let isPlaying = false;
        let playInterval = null;
        let speed = parseInt(speedSlider ? speedSlider.value : 1500, 10);
        let currentInput = pipelineInput.value;
        let residualEnabled = true;
        let causalMaskEnabled = true;
        let bpeSplitAnimated = false;
        let autoregressiveStepsCount = 0;

        const STEP_NAMES = [
            "INPUT TRANSDUCTION SETUP",
            "BYTE-PAIR TOKENIZATION",
            "512-D EMBEDDING LOOKUP",
            "POSITIONAL WAVE INJECTION",
            "ENCODER SELF-ATTENTION",
            "DECODER CAUSAL MASKING",
            "LINEAR VOCAB PROJECTION",
            "SOFTMAX TEMPERATURE SCALING",
            "AUTOREGRESSIVE CYCLE"
        ];

        // Custom presets translations & words mappings
        const mockTranslationDB = {
            "attention is all you need": {
                target: "<bos> La atención es todo lo que",
                nextWord: "necesitas",
                candidates: [
                    { word: "necesitas", logit: 14.8, prob: 88.5 },
                    { word: "requieres", logit: 11.2, prob: 6.2 },
                    { word: "importa", logit: 8.9, prob: 3.1 },
                    { word: "es", logit: 5.4, prob: 1.2 },
                    { word: "para", logit: 2.1, prob: 0.5 }
                ]
            },
            "deep learning is magic": {
                target: "<bos> El aprendizaje profundo es",
                nextWord: "magia",
                candidates: [
                    { word: "magia", logit: 13.5, prob: 74.2 },
                    { word: "ciencia", logit: 10.4, prob: 12.8 },
                    { word: "arte", logit: 7.9, prob: 7.1 },
                    { word: "futuro", logit: 5.2, prob: 4.0 },
                    { word: "tecnología", logit: 2.8, prob: 1.5 }
                ]
            },
            "artificial intelligence is the future": {
                target: "<bos> La inteligencia artificial es el",
                nextWord: "futuro",
                candidates: [
                    { word: "futuro", logit: 15.1, prob: 88.5 },
                    { word: "presente", logit: 11.0, prob: 6.2 },
                    { word: "destino", logit: 8.5, prob: 3.1 },
                    { word: "camino", logit: 5.1, prob: 1.2 },
                    { word: "fin", logit: 2.0, prob: 0.5 }
                ]
            }
        };

        // Fallback generator for custom inputs
        function getTranslationData(inputText) {
            const clean = inputText.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            if (mockTranslationDB[clean]) {
                return mockTranslationDB[clean];
            }
            const words = clean.split(/\s+/).filter(Boolean);
            const targetWords = words.map(w => w.substring(0, Math.min(w.length, 5)) + "os");
            const targetText = "<bos> " + targetWords.slice(0, Math.max(1, targetWords.length - 1)).join(" ");
            const nextWord = targetWords[targetWords.length - 1] || "fin";
            
            return {
                target: targetText,
                nextWord: nextWord,
                candidates: [
                    { word: nextWord, logit: 12.5, prob: 78.4 },
                    { word: nextWord + "as", logit: 9.8, prob: 11.2 },
                    { word: "y", logit: 6.5, prob: 5.3 },
                    { word: "no", logit: 4.2, prob: 3.2 },
                    { word: "de", logit: 1.8, prob: 1.5 }
                ]
            };
        }

        // Tokenizer simulator
        function getTokens(inputText) {
            const rawWords = inputText.trim().split(/\s+/).filter(Boolean);
            const tokensList = [];
            
            rawWords.forEach((word) => {
                let hash = 0;
                for (let i = 0; i < word.length; i++) {
                    hash = word.charCodeAt(i) + ((hash << 5) - hash);
                }
                const baseId = Math.abs(hash % 28000) + 2000;
                
                if (word.length > 7 && !["attention", "transformers"].includes(word.toLowerCase())) {
                    const mid = Math.floor(word.length / 2);
                    tokensList.push({ text: word.substring(0, mid), id: baseId, subword: true });
                    tokensList.push({ text: "##" + word.substring(mid), id: baseId + 17, subword: true });
                } else {
                    tokensList.push({ text: word, id: baseId, subword: false });
                }
            });
            
            return tokensList.length > 0 ? tokensList : [{ text: "Empty", id: 0, subword: false }];
        }

        const chipColors = [
            { bg: "rgba(215, 25, 32, 0.12)", border: "rgba(215, 25, 32, 0.35)", color: "var(--nothing-red)" },
            { bg: "rgba(0, 240, 255, 0.12)", border: "rgba(0, 240, 255, 0.35)", color: "var(--laser-cyan)" },
            { bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.35)", color: "#c084fc" },
            { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.35)", color: "#34d399" },
            { bg: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.35)", color: "#facc15" }
        ];

        // Seeded random for consistent vectors
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

        // ── ROBUST MATHJAX PROMISE QUEUE ──
        let mathJaxQueue = Promise.resolve();
        function safeTypeset(nodes) {
            if (!window.MathJax) return;
            const elements = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
            if (elements.length === 0) return;

            mathJaxQueue = mathJaxQueue
                .then(() => {
                    if (window.MathJax.startup && window.MathJax.startup.promise) {
                        return window.MathJax.startup.promise;
                    }
                })
                .then(() => {
                    if (window.MathJax.typesetClear && window.MathJax.typesetPromise) {
                        try {
                            window.MathJax.typesetClear(elements);
                        } catch (e) {}
                        return window.MathJax.typesetPromise(elements);
                    }
                })
                .catch(err => {
                    console.warn("MathJax typeset error:", err);
                });
        }
        window.safeTypeset = safeTypeset;
        window.triggerMathJax = (target) => {
            if (target) {
                safeTypeset(target);
            } else {
                const active = document.querySelector(".sandbox-pane.active");
                if (active) safeTypeset(active);
            }
        };
        window.onMathJaxReady = () => {
            const active = document.querySelector(".sandbox-pane.active");
            if (active) safeTypeset(active);
        };

        // ── RENDER VIEWS ──

        function renderStep1() {
            const data = getTranslationData(currentInput);
            const tokens = getTokens(currentInput);
            const targetWords = data.target.split(/\s+/).filter(Boolean);

            const srcText = document.getElementById("step1-source-text");
            const trgText = document.getElementById("step1-target-text");
            const srcCount = document.getElementById("step1-src-count");
            const trgCount = document.getElementById("step1-trg-count");
            const targetWordPill = document.getElementById("step1-target-word-pill");

            if (srcText) srcText.textContent = currentInput;
            if (trgText) trgText.textContent = data.target;
            if (srcCount) srcCount.textContent = `T_enc = ${tokens.length} tokens`;
            if (trgCount) trgCount.textContent = `T_dec = ${targetWords.length} tokens`;
            if (targetWordPill) targetWordPill.textContent = `"${data.nextWord}"`;

            // Render interactive token pills for Source Sequence
            const srcPills = document.getElementById("step1-source-pills");
            if (srcPills) {
                srcPills.innerHTML = tokens.map((t, idx) => `
                    <span class="seq-token-pill" data-idx="${idx}" title="Source token x_${idx+1}: '${t.text}' (ID: ${t.id})">
                        <span class="seq-token-idx">x<sub>${idx+1}</sub></span>
                        <span class="seq-token-text">${t.text}</span>
                    </span>
                `).join("");

                srcPills.querySelectorAll(".seq-token-pill").forEach(pill => {
                    pill.addEventListener("click", () => {
                        srcPills.querySelectorAll(".seq-token-pill").forEach(p => p.classList.remove("active-pill"));
                        pill.classList.add("active-pill");
                    });
                });
            }

            // Render interactive token pills for Target Sequence
            const trgPills = document.getElementById("step1-target-pills");
            if (trgPills) {
                trgPills.innerHTML = targetWords.map((w, idx) => `
                    <span class="seq-token-pill trg-pill" data-idx="${idx}" title="Target prefix token y_${idx+1}: '${w}'">
                        <span class="seq-token-idx">y<sub>${idx+1}</sub></span>
                        <span class="seq-token-text">${w.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
                    </span>
                `).join("");

                trgPills.querySelectorAll(".seq-token-pill").forEach(pill => {
                    pill.addEventListener("click", () => {
                        trgPills.querySelectorAll(".seq-token-pill").forEach(p => p.classList.remove("active-pill"));
                        pill.classList.add("active-pill");
                    });
                });
            }

            const readout = document.getElementById("step1-math-readout");
            if (readout) {
                const T_enc = tokens.length;
                const T_dec = targetWords.length;

                readout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-square-root-alt" style="color:var(--accent); margin-right:6px;"></i> Seq2Seq Dimensions &amp; Sequence Tensors</span>
                        <span class="math-card-badge">E-D Mapping</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$\\mathbf{X} = \\begin{bmatrix} x_1 & x_2 & \\dots & x_{T_{\\text{enc}}} \\end{bmatrix}^T \\in \\mathbb{R}^{${T_enc} \\times 1} \\quad (T_{\\text{enc}} = ${T_enc} \\text{ tokens})$$
                            $$\\mathbf{Y} = \\begin{bmatrix} y_1 & y_2 & \\dots & y_{T_{\\text{dec}}} \\end{bmatrix}^T \\in \\mathbb{R}^{${T_dec} \\times 1} \\quad (T_{\\text{dec}} = ${T_dec} \\text{ tokens})$$
                        </div>
                        <div class="math-dim-summary">
                            <span class="dim-tag">Encoder Input: <strong>[${T_enc} × 512]</strong></span>
                            <span class="dim-tag accent-2">Decoder Input: <strong>[${T_dec} × 512]</strong></span>
                            <span class="dim-tag highlight">Next Target Prediction: <strong>"${data.nextWord}"</strong></span>
                        </div>
                    </div>
                `;
                safeTypeset(readout);
            }
        }

        function renderStep2() {
            const display = document.getElementById("step2-tokens-display");
            if (!display) return;
            display.innerHTML = "";
            const tokens = getTokens(currentInput);
            
            const detailContainer = document.getElementById("step2-token-detail");
            const detailText = document.getElementById("step2-token-detail-text");
            const vocabIndicator = document.getElementById("step2-vocab-indicator");
            const vocabSelectedId = document.getElementById("step2-vocab-selected-id");

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
                    if (detailContainer) detailContainer.style.display = "block";
                    const charStart = currentInput.indexOf(token.text.replace("##", ""));
                    const charEnd = charStart >= 0 ? charStart + token.text.length : 0;
                    
                    if (detailText) {
                        detailText.innerHTML = `
                            <strong>Subword Token:</strong> <code style="color:var(--accent); font-size:1.05rem;">"${token.text}"</code> | 
                            <strong>Vocabulary ID:</strong> <code>${token.id}</code><br>
                            <strong>Character Bounds:</strong> index <code>${Math.max(0, charStart)}</code> to <code>${charEnd}</code> | 
                            <strong>Subword Status:</strong> ${token.subword ? '<span style="color:var(--accent-2); font-weight:700;">Subword (BPE Split)</span>' : '<span style="color:var(--accent-3); font-weight:700;">Full Word Match</span>'}<br>
                            <strong>BPE Rule:</strong> Merged based on training frequency ranking.
                        `;
                    }

                    // Move radar indicator
                    if (vocabIndicator) {
                        const pct = Math.min(100, Math.max(0, (token.id / 37000) * 100));
                        vocabIndicator.style.left = pct.toFixed(1) + "%";
                    }
                    if (vocabSelectedId) {
                        vocabSelectedId.textContent = `Token "${token.text}" → ID: ${token.id}`;
                    }

                    display.querySelectorAll(".token-chip").forEach(c => c.style.boxShadow = "");
                    chip.style.boxShadow = `0 0 0 3px var(--accent), 0 0 16px rgba(215, 25, 32, 0.4)`;
                });
                
                display.appendChild(chip);
            });

            // Set initial radar marker to first token
            if (tokens[0] && vocabIndicator && vocabSelectedId) {
                const pct = Math.min(100, Math.max(0, (tokens[0].id / 37000) * 100));
                vocabIndicator.style.left = pct.toFixed(1) + "%";
                vocabSelectedId.textContent = `Token "${tokens[0].text}" → ID: ${tokens[0].id}`;
            }

            // Split animation button
            const splitBtn = document.getElementById("step2-split-btn");
            const splitLabel = document.getElementById("step2-split-label");
            if (splitBtn && !splitBtn._bound) {
                splitBtn._bound = true;
                splitBtn.addEventListener("click", () => {
                    bpeSplitAnimated = !bpeSplitAnimated;
                    display.querySelectorAll(".token-chip").forEach((chip, i) => {
                        chip.style.transform = bpeSplitAnimated ? "scale(1.1) translateY(-3px)" : "";
                        chip.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
                    });
                    if (splitLabel) splitLabel.textContent = bpeSplitAnimated ? "Reset Subwords" : "Animate BPE Subwords";
                });
            }

            const readout = document.getElementById("step2-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-barcode" style="color:var(--accent); margin-right:6px;"></i> Tokenizer Vocabulary Index Vector</span>
                        <span class="math-card-badge">V = 37,000</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$\\vec{t} = \\text{Tokenizer}(\\mathbf{X}) = \\begin{bmatrix} t_1 \\\\ t_2 \\\\ \\vdots \\\\ t_T \\end{bmatrix} = \\begin{bmatrix} ${tokens.map(t => t.id).join(' \\\\ ')} \\end{bmatrix} \\in \\mathbb{Z}^{${tokens.length}} \\quad (t_i \\in \\{0, 1, \\dots, 36999\\})$$
                        </div>
                    </div>
                `;
                safeTypeset(readout);
            }
        }

        function renderStep3() {
            const container = document.getElementById("step3-embeddings-container");
            if (!container) return;
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
                        r = 0; g = 240; b = 255; // laser cyan
                    } else {
                        r = 215; g = 25; b = 32; // nothing red
                    }
                    const alpha = Math.max(0.15, Math.abs(val));
                    cell.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    cell.style.cursor = "crosshair";
                    
                    cell.addEventListener("mouseenter", () => {
                        cell.style.transform = "scale(1.3)";
                        if (hoverDetail) {
                            hoverDetail.innerHTML = `
                                Token: <code style="color:var(--accent); font-weight:700;">"${token.text}"</code> | 
                                Dimension <strong>d<sub>${i}</sub></strong> | 
                                Weight: <code style="color:${val >= 0 ? 'var(--laser-cyan)' : 'var(--nothing-red)'}; font-weight:700;">${val}</code> 
                                <span style="font-size:0.75rem; font-weight:normal; color:var(--muted);">(${val >= 0 ? "positive semantic alignment" : "orthogonal / negative correlation"})</span>
                            `;
                        }
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

            // Populate Cosine Similarity selects
            const selectA = document.getElementById("step3-token-a-select");
            const selectB = document.getElementById("step3-token-b-select");
            const simScore = document.getElementById("step3-sim-score");
            const simBadge = document.getElementById("step3-sim-badge");

            if (selectA && selectB) {
                selectA.innerHTML = tokens.map((t, idx) => `<option value="${idx}" ${idx===0 ? "selected" : ""}>${t.text}</option>`).join("");
                selectB.innerHTML = tokens.map((t, idx) => `<option value="${idx}" ${idx===Math.min(1, tokens.length-1) ? "selected" : ""}>${t.text}</option>`).join("");

                function updateSim() {
                    const idxA = parseInt(selectA.value, 10);
                    const idxB = parseInt(selectB.value, 10);
                    const randA = getSeededRandom(tokens[idxA].text + tokens[idxA].id);
                    const randB = getSeededRandom(tokens[idxB].text + tokens[idxB].id);

                    let dot = 0, normA = 0, normB = 0;
                    for (let i = 0; i < 16; i++) {
                        const a = randA() * 2 - 1;
                        const b = randB() * 2 - 1;
                        dot += a * b;
                        normA += a * a;
                        normB += b * b;
                    }
                    const score = idxA === idxB ? 1.000 : (dot / (Math.sqrt(normA) * Math.sqrt(normB)));
                    const formatted = (score >= 0 ? "+" : "") + score.toFixed(3);

                    if (simScore) simScore.textContent = formatted;
                    if (simBadge) {
                        if (score >= 0.7) {
                            simBadge.textContent = "Strong Semantic Affinity";
                            simBadge.style.color = "var(--laser-cyan)";
                        } else if (score >= 0.2) {
                            simBadge.textContent = "Moderate Contextual Overlap";
                            simBadge.style.color = "#34d399";
                        } else {
                            simBadge.textContent = "Divergent Representation";
                            simBadge.style.color = "var(--nothing-red)";
                        }
                    }
                }

                if (!selectA._bound) {
                    selectA._bound = true;
                    selectA.addEventListener("change", updateSim);
                    selectB.addEventListener("change", updateSim);
                }
                updateSim();
            }

            const readout = document.getElementById("step3-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-vector-square" style="color:var(--accent); margin-right:6px;"></i> Token Embedding Matrix Lookup (d_model = 512)</span>
                        <span class="math-card-badge">E ∈ ℝ^{${tokens.length} × 512}</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$\\mathbf{E}_i = \\text{EmbeddingLookup}(t_i) = \\mathbf{W}_E[t_i, :] \\in \\mathbb{R}^{512} \\quad (\\mathbf{W}_E \\in \\mathbb{R}^{37,000 \\times 512})$$
                            $$\\mathbf{E} = \\begin{bmatrix} \\mathbf{E}_{\\text{${tokens[0] ? tokens[0].text : 'x1'}}} \\\\ \\dots \\\\ \\mathbf{E}_{\\text{${tokens[tokens.length-1] ? tokens[tokens.length-1].text : 'xT'}}} \\end{bmatrix} \\in \\mathbb{R}^{${tokens.length} \\times 512}$$
                        </div>
                    </div>
                `;
                safeTypeset(readout);
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
            
            // Draw waves
            let sinPoints = [];
            let cosPoints = [];
            
            const dModel = 512;
            const divTerm = Math.pow(10000, peDimVal / dModel);
            const currentFrequency = 1 / divTerm;
            
            for (let x = 0; x <= drawW; x++) {
                const posX = padding + x;
                const posParam = (x / drawW) * 6;
                
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
            sinPath.setAttribute("stroke", "#00f0ff");
            sinPath.setAttribute("stroke-width", "2.5");
            svg.appendChild(sinPath);
            
            const cosPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            cosPath.setAttribute("d", "M" + cosPoints.join(" L"));
            cosPath.setAttribute("fill", "none");
            cosPath.setAttribute("stroke", "#d71920");
            cosPath.setAttribute("stroke-width", "1.5");
            cosPath.setAttribute("stroke-dasharray", "4 2");
            svg.appendChild(cosPath);
            
            // Tracker dot
            const dotX = padding + (pePosVal / 6) * drawW;
            const trackerValSin = Math.sin(pePosVal * currentFrequency * Math.PI);
            const dotY = midY - trackerValSin * (drawH / 2.5);
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", dotX);
            circle.setAttribute("cy", dotY);
            circle.setAttribute("r", "6");
            circle.setAttribute("fill", "#eab308");
            circle.setAttribute("stroke", "#fff");
            circle.setAttribute("stroke-width", "2");
            svg.appendChild(circle);

            // Vector Fusion Animation button
            const fusionBtn = document.getElementById("step4-fusion-btn");
            const fusionVis = document.getElementById("step4-fusion-vis");
            if (fusionBtn && !fusionBtn._bound) {
                fusionBtn._bound = true;
                fusionBtn.addEventListener("click", () => {
                    if (fusionVis) {
                        const isOpen = fusionVis.style.display !== "none";
                        fusionVis.style.display = isOpen ? "none" : "flex";
                        fusionBtn.classList.toggle("active-tool", !isOpen);
                    }
                });
            }
            
            const peFormulaVal = trackerValSin.toFixed(4);
            const tokens = getTokens(currentInput);
            if (mathReadout) {
                mathReadout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-wave-square" style="color:var(--accent); margin-right:6px;"></i> Sinusoidal Positional Encoding (E + PE = Z)</span>
                        <span class="math-card-badge">pos=${pePosVal}, 2i=${peDimVal}</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$\\text{PE}_{(\\text{pos}=${pePosVal}, 2i=${peDimVal})} = \\sin\\left(\\frac{${pePosVal}}{10000^{${peDimVal}/512}}\\right) = ${peFormulaVal}$$
                            $$\\mathbf{Z} = \\mathbf{E} + \\mathbf{PE} \\in \\mathbb{R}^{${tokens.length} \\times 512}$$
                        </div>
                    </div>
                `;
                safeTypeset(mathReadout);
            }
        }

        let step5ActiveHead = 1;
        let step5ActiveNode = 0;

        function renderStep5() {
            const tokens = getTokens(currentInput);
            const listContainer = document.getElementById("step5-attention-list");
            const matrixGrid = document.getElementById("step5-matrix-grid");
            const svgGraph = document.getElementById("step5-attention-graph");
            
            if (listContainer) listContainer.innerHTML = "";
            if (matrixGrid) matrixGrid.innerHTML = "";
            if (svgGraph) svgGraph.innerHTML = "";

            const headButtons = document.querySelectorAll("#step5-head-buttons .head-btn");
            headButtons.forEach(btn => {
                btn.classList.toggle("active", parseInt(btn.dataset.head, 10) === step5ActiveHead);
                if (!btn._bound) {
                    btn._bound = true;
                    btn.addEventListener("click", () => {
                        step5ActiveHead = parseInt(btn.dataset.head, 10);
                        renderStep5();
                    });
                }
            });

            // Residual toggle
            const resBtn = document.getElementById("step5-residual-btn");
            if (resBtn && !resBtn._bound) {
                resBtn._bound = true;
                resBtn.addEventListener("click", () => {
                    residualEnabled = !residualEnabled;
                    resBtn.innerHTML = residualEnabled ? '<i class="fas fa-share"></i> Residual Bypass: ON' : '<i class="fas fa-times"></i> Residual Bypass: OFF';
                    resBtn.classList.toggle("bypass-off", !residualEnabled);
                });
            }

            // Word nodes in step 5
            tokens.forEach((t, i) => {
                const node = document.createElement("div");
                node.className = "attention-word-node" + (i === step5ActiveNode ? " active" : "");
                node.textContent = t.text;
                node.addEventListener("mouseenter", () => {
                    step5ActiveNode = i;
                    drawStep5Arcs(tokens, i);
                    listContainer.querySelectorAll(".attention-word-node").forEach((n, idx) => {
                        n.classList.toggle("active", idx === i);
                    });
                });
                if (listContainer) listContainer.appendChild(node);
            });

            drawStep5Arcs(tokens, step5ActiveNode);

            const readout = document.getElementById("step5-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-project-diagram" style="color:var(--accent); margin-right:6px;"></i> Scaled Dot-Product Self-Attention (Head ${step5ActiveHead})</span>
                        <span class="math-card-badge">d_k = 64</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$\\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left(\\frac{\\mathbf{Q} \\mathbf{K}^T}{\\sqrt{d_k}}\\right) \\mathbf{V}$$
                            $$\\mathbf{Z}_{\\text{out}} = \\text{LayerNorm}\\left(\\mathbf{Z} + \\text{MultiHead}(\\mathbf{Z})\\right)$$
                        </div>
                    </div>
                `;
                safeTypeset(readout);
            }
        }

        function drawStep5Arcs(tokens, activeIdx) {
            const svg = document.getElementById("step5-attention-graph");
            if (!svg) return;
            svg.innerHTML = "";
            const w = svg.clientWidth || 360;
            const h = svg.clientHeight || 120;
            const count = tokens.length;
            const spacing = w / (count + 1);

            tokens.forEach((t, j) => {
                const startX = (activeIdx + 1) * spacing;
                const endX = (j + 1) * spacing;
                const dist = Math.abs(activeIdx - j);
                const weight = Math.max(0.1, 1 - dist * 0.25);
                const arcHeight = Math.min(h - 20, 20 + dist * 22);

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const d = `M ${startX} ${h - 15} C ${startX} ${h - 15 - arcHeight}, ${endX} ${h - 15 - arcHeight}, ${endX} ${h - 15}`;
                path.setAttribute("d", d);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", activeIdx === j ? "var(--nothing-red)" : "var(--laser-cyan)");
                path.setAttribute("stroke-width", Math.max(1, weight * 4));
                path.setAttribute("stroke-opacity", weight.toFixed(2));
                svg.appendChild(path);

                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", endX);
                circle.setAttribute("cy", h - 15);
                circle.setAttribute("r", j === activeIdx ? "5" : "3");
                circle.setAttribute("fill", j === activeIdx ? "var(--nothing-red)" : "var(--muted)");
                svg.appendChild(circle);
            });
        }

        function renderStep6() {
            const data = getTranslationData(currentInput);
            const targetWords = data.target.split(/\s+/).filter(Boolean);
            const sourceTokens = getTokens(currentInput);
            const M = targetWords.length;

            const maskBtn = document.getElementById("step6-mask-toggle-btn");
            if (maskBtn && !maskBtn._bound) {
                maskBtn._bound = true;
                maskBtn.addEventListener("click", () => {
                    causalMaskEnabled = !causalMaskEnabled;
                    maskBtn.innerHTML = causalMaskEnabled ? '<i class="fas fa-lock"></i> Causal Mask: ACTIVE' : '<i class="fas fa-unlock"></i> Causal Mask: OFF (Unsafe)';
                    maskBtn.classList.toggle("mask-disabled", !causalMaskEnabled);
                    renderStep6();
                });
            }

            const padlockGrid = document.getElementById("step6-padlock-grid");
            if (padlockGrid) {
                padlockGrid.innerHTML = "";
                for (let i = 0; i < Math.min(5, M); i++) {
                    const row = document.createElement("div");
                    row.className = "padlock-row";
                    for (let j = 0; j < Math.min(5, M); j++) {
                        const cell = document.createElement("span");
                        cell.className = "padlock-cell" + (j > i && causalMaskEnabled ? " locked" : " open");
                        cell.innerHTML = j > i && causalMaskEnabled ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-eye"></i>';
                        cell.title = j > i ? (causalMaskEnabled ? "Masked: -∞ (Cannot peek ahead)" : "Unmasked (Cheating future)") : "Attends to past token";
                        row.appendChild(cell);
                    }
                    padlockGrid.appendChild(row);
                }
            }

            const decList = document.getElementById("step6-decoder-list");
            const encList = document.getElementById("step6-encoder-mem-list");
            if (decList) {
                decList.innerHTML = targetWords.map((w, idx) => `
                    <div class="attention-word-node ${idx===M-1 ? 'active' : ''}">y<sub>${idx+1}</sub>: ${w.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                `).join("");
            }
            if (encList) {
                encList.innerHTML = sourceTokens.map((t, idx) => `
                    <div class="attention-word-node">x<sub>${idx+1}</sub>: ${t.text}</div>
                `).join("");
            }

            const readout = document.getElementById("step6-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-shield-alt" style="color:var(--accent); margin-right:6px;"></i> Causal Masked Self-Attention &amp; Cross-Attention</span>
                        <span class="math-card-badge">Masked M ∈ ℝ^{${M} × ${M}}</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$\\text{CausalAttention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left(\\frac{\\mathbf{Q} \\mathbf{K}^T}{\\sqrt{d_k}} + \\mathbf{M}\\right) \\mathbf{V}$$
                            $$\\mathbf{M}_{ij} = \\begin{cases} 0 & \\text{if } j \\le i \\\\ -\\infty & \\text{if } j > i \\end{cases}$$
                        </div>
                    </div>
                `;
                safeTypeset(readout);
            }
        }

        function renderStep7() {
            const data = getTranslationData(currentInput);
            const logitsPreview = document.getElementById("step7-logits-preview");
            if (logitsPreview) {
                logitsPreview.innerHTML = data.candidates.map(c => `
                    <div class="logit-card">
                        <span class="logit-candidate-word">${c.word}</span>
                        <span class="logit-raw-score">+${c.logit.toFixed(1)}</span>
                    </div>
                `).join("");
            }

            const readout = document.getElementById("step7-math-readout");
            if (readout) {
                readout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-expand-arrows-alt" style="color:var(--accent); margin-right:6px;"></i> Vocabulary Logit Projection (512-D → 37,000-D)</span>
                        <span class="math-card-badge">W_U ∈ ℝ^{512 × 37000}</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$\\mathbf{z} = \\mathbf{h}_{\\text{dec}} \\mathbf{W}_U + \\mathbf{b} \\in \\mathbb{R}^{1 \\times 37,000}$$
                        </div>
                    </div>
                `;
                safeTypeset(readout);
            }
        }

        function renderStep8() {
            const chart = document.getElementById("step8-logits-chart");
            if (!chart) return;
            chart.innerHTML = "";
            
            const data = getTranslationData(currentInput);
            const tempSlider = document.getElementById("softmax-temp-slider");
            const tempVal = tempSlider ? parseFloat(tempSlider.value) : 1.0;
            
            const candidates = data.candidates;
            let sumExp = 0;
            const expValues = candidates.map(c => {
                const val = Math.exp(c.logit / tempVal);
                sumExp += val;
                return val;
            });
            
            const probs = expValues.map(v => (v / sumExp) * 100);

            // Compute Entropy
            let entropy = 0;
            probs.forEach(p => {
                const pFrac = p / 100;
                if (pFrac > 0) entropy -= pFrac * Math.log2(pFrac);
            });
            
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
                    if (idx === 0) barFill.style.background = "linear-gradient(90deg, var(--nothing-red), #ff4d5a)";
                }, 40 + idx * 30);
                
                barWrapper.appendChild(barFill);
                row.appendChild(barWrapper);
                
                const percentage = document.createElement("span");
                percentage.className = "logit-percentage";
                percentage.textContent = `${prob.toFixed(1)}%`;
                row.appendChild(percentage);
                
                chart.appendChild(row);
            });

            // Entropy Meter update
            const entropyFill = document.getElementById("step8-entropy-fill");
            const entropyNum = document.getElementById("step8-entropy-num");
            const modeBadge = document.getElementById("step8-mode-badge");

            if (entropyFill) {
                const fillPct = Math.min(100, Math.max(5, (entropy / 2.32) * 100));
                entropyFill.style.width = fillPct.toFixed(1) + "%";
            }
            if (entropyNum) entropyNum.textContent = `Entropy: ${entropy.toFixed(2)} bits`;
            if (modeBadge) {
                if (tempVal <= 0.4) {
                    modeBadge.textContent = "Greedy Mode (Argmax Peak)";
                    modeBadge.style.color = "var(--nothing-red)";
                } else if (tempVal >= 1.5) {
                    modeBadge.textContent = "Creative Mode (High Entropy)";
                    modeBadge.style.color = "var(--laser-cyan)";
                } else {
                    modeBadge.textContent = "Balanced Sampling Mode";
                    modeBadge.style.color = "#34d399";
                }
            }

            const mathBox = document.getElementById("softmax-math-explanation");
            if (mathBox) {
                mathBox.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-chart-bar" style="color:var(--accent); margin-right:6px;"></i> Softmax Normalization (T = ${tempVal})</span>
                        <span class="math-card-badge">∑ p_i = 1.0</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$P(w_i) = \\frac{\\exp(\\text{logit}_i / ${tempVal})}{\\sum_j \\exp(\\text{logit}_j / ${tempVal})} \\quad (P(\\text{"${candidates[0].word}"}) = ${probs[0].toFixed(1)}\\%)$$
                        </div>
                    </div>
                `;
                safeTypeset(mathBox);
            }
        }

        function renderStep9() {
            const data = getTranslationData(currentInput);
            const selectedWord = document.getElementById("step9-selected-word");
            const newInput = document.getElementById("step9-new-input");
            
            if (selectedWord) selectedWord.textContent = `"${data.nextWord}"`;
            if (newInput) newInput.textContent = `${data.target} ${data.nextWord}`;

            // Emit button
            const emitBtn = document.getElementById("step9-emit-btn");
            const resetGenBtn = document.getElementById("step9-reset-gen-btn");
            const terminalLog = document.getElementById("step9-terminal-log");

            if (emitBtn && !emitBtn._bound) {
                emitBtn._bound = true;
                emitBtn.addEventListener("click", () => {
                    autoregressiveStepsCount++;
                    const extraWords = ["por", "favor", "<eos>"];
                    const nextExtra = extraWords[(autoregressiveStepsCount - 1) % extraWords.length];
                    
                    if (terminalLog) {
                        const line = document.createElement("div");
                        line.className = "term-line success";
                        line.textContent = `[STEP 0${autoregressiveStepsCount + 1}] Emitted token "${nextExtra}" | Autoregressive Loop Restarted`;
                        terminalLog.appendChild(line);
                        terminalLog.scrollTop = terminalLog.scrollHeight;
                    }
                    if (newInput) {
                        newInput.textContent += ` ${nextExtra}`;
                    }
                });
            }

            if (resetGenBtn && !resetGenBtn._bound) {
                resetGenBtn._bound = true;
                resetGenBtn.addEventListener("click", () => {
                    autoregressiveStepsCount = 0;
                    if (newInput) newInput.textContent = `${data.target} ${data.nextWord}`;
                    if (terminalLog) {
                        terminalLog.innerHTML = `
                            <div class="term-line info">[INIT] Decoder prefix loaded: ${data.target}</div>
                            <div class="term-line success">[STEP 01] Argmax predicted token: "${data.nextWord}" (p=88.5%, ID=4821)</div>
                            <div class="term-line highlight">[UPDATE] New prefix: ${data.target} ${data.nextWord}</div>
                        `;
                    }
                });
            }

            const readout = document.getElementById("step9-math-readout");
            if (readout) {
                const currentWords = data.target.split(/\s+/).filter(Boolean);
                const allWords = [...currentWords, data.nextWord];
                const wordRows = allWords.map(w => {
                    if (w.includes('<') || w.includes('>')) {
                        const clean = w.replace(/[<>]/g, '');
                        return `\\langle\\text{${clean}}\\rangle`;
                    }
                    return `\\text{"${w}"}`;
                }).join(' \\\\ ');

                readout.innerHTML = `
                    <div class="math-card-header">
                        <span class="math-card-title"><i class="fas fa-sync-alt" style="color:var(--accent); margin-right:6px;"></i> Autoregressive Output Appending &amp; Loop Recurrence</span>
                        <span class="math-card-badge">T_dec+1 = ${allWords.length}</span>
                    </div>
                    <div class="math-card-body">
                        <div class="math-latex-eq">
                            $$t_{\\text{next}} = \\arg\\max_{w} \\, P(w) = \\text{"${data.nextWord}"}$$
                            $$\\mathbf{Y}^{(t+1)} = \\begin{bmatrix} \\mathbf{Y}^{(t)} \\\\ t_{\\text{next}} \\end{bmatrix} = \\begin{bmatrix} ${wordRows} \\end{bmatrix} \\in \\mathbb{R}^{${allWords.length} \\times 1}$$
                        </div>
                    </div>
                `;
                safeTypeset(readout);
            }
        }

        // ── ACTIVE STEP CONTROLLER ──

        function updateGlobalProgress(stepNum) {
            if (progressFill) {
                const pct = ((stepNum / 9) * 100).toFixed(1);
                progressFill.style.width = pct + "%";
            }
            if (stepBadge) {
                stepBadge.innerHTML = `<span class="rec-dot"></span> STEP 0${stepNum} // ${STEP_NAMES[stepNum - 1]}`;
            }
        }

        function renderActiveStep() {
            stepItems.forEach((item, idx) => {
                const stepNum = idx + 1;
                item.classList.toggle("active", stepNum === currentStep);
                item.classList.toggle("completed", stepNum < currentStep);
            });

            panes.forEach((pane) => {
                const stepNum = parseInt(pane.dataset.step, 10);
                pane.classList.toggle("active", stepNum === currentStep);
            });

            updateGlobalProgress(currentStep);

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

            if (prevBtn) prevBtn.disabled = currentStep === 1;
            if (nextBtn) nextBtn.disabled = currentStep === 9;
        }

        // ── CONTROLS & EVENT LISTENERS ──

        stepItems.forEach(item => {
            item.addEventListener("click", () => {
                currentStep = parseInt(item.dataset.step, 10);
                renderActiveStep();
            });
        });

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                if (currentStep > 1) {
                    currentStep--;
                    renderActiveStep();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                if (currentStep < 9) {
                    currentStep++;
                    renderActiveStep();
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                currentStep = 1;
                if (isPlaying) togglePlay();
                renderActiveStep();
            });
        }

        function togglePlay() {
            isPlaying = !isPlaying;
            if (playIcon) {
                playIcon.className = isPlaying ? "fas fa-pause" : "fas fa-play";
            }
            if (playBtn) {
                playBtn.classList.toggle("active-play", isPlaying);
            }

            if (isPlaying) {
                playInterval = setInterval(() => {
                    if (currentStep < 9) {
                        currentStep++;
                        renderActiveStep();
                    } else {
                        togglePlay();
                    }
                }, speed);
            } else {
                clearInterval(playInterval);
            }
        }

        if (playBtn) {
            playBtn.addEventListener("click", togglePlay);
        }

        if (speedSlider) {
            speedSlider.addEventListener("input", (e) => {
                speed = parseInt(e.target.value, 10);
                if (speedVal) speedVal.textContent = (speed / 1000).toFixed(1) + "s";
                if (isPlaying) {
                    clearInterval(playInterval);
                    playInterval = setInterval(() => {
                        if (currentStep < 9) {
                            currentStep++;
                            renderActiveStep();
                        } else {
                            togglePlay();
                        }
                    }, speed);
                }
            });
        }

        // Text input listener
        pipelineInput.addEventListener("input", (e) => {
            currentInput = e.target.value || "Attention is all you need";
            presetBtns.forEach(btn => btn.classList.remove("active-preset"));
            renderActiveStep();
        });

        // Presets listener
        presetBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                presetBtns.forEach(b => b.classList.remove("active-preset"));
                btn.classList.add("active-preset");
                pipelineInput.value = btn.dataset.text;
                currentInput = btn.dataset.text;
                renderActiveStep();
            });
        });

        // Sliders for PE & Softmax
        const posSlider = document.getElementById("pe-pos-slider");
        const dimSlider = document.getElementById("pe-dim-slider");
        if (posSlider) posSlider.addEventListener("input", renderStep4);
        if (dimSlider) dimSlider.addEventListener("input", renderStep4);

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


    /* ── Floating Capsule Navigation & Laser Scroll Progress ──────── */
    const progressFill = document.getElementById("navProgressFill");
    if (progressFill) {
        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressFill.style.width = scrollPercent + "%";
        }, { passive: true });
    }

    // Floating Nav active section highlighting
    const floatingNavLinks = document.querySelectorAll(".modern-nav .nav-link-awesome");
    const trackedSections = document.querySelectorAll("section[id]");
    if (floatingNavLinks.length > 0 && trackedSections.length > 0) {
        const floatingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    floatingNavLinks.forEach(link => {
                        const targetId = link.getAttribute("data-section") || link.getAttribute("href")?.replace("#", "");
                        link.classList.toggle("active", targetId === id);
                    });
                }
            });
        }, { threshold: 0.15, rootMargin: "-15% 0px -50% 0px" });
        trackedSections.forEach(s => floatingObserver.observe(s));
    }

    /* ── Global Accordion Toggle: Expand All / Collapse All ─────────── */
    const globalAccordionBtn = document.getElementById("global-accordion-toggle");
    const globalAccordionText = document.getElementById("global-accordion-text");
    const globalAccordionIcon = document.getElementById("global-accordion-icon");

    if (globalAccordionBtn) {
        let allExpanded = false;
        const moduleAccordions = document.querySelectorAll(
            'details[id^="01-"], details[id^="02-"], details[id^="03-"], details[id^="04-"], details[id^="05-"], details[id^="06-"], details[id^="07-"], details[id^="08-"], details#encoder, details#decoder'
        );

        globalAccordionBtn.addEventListener("click", () => {
            allExpanded = !allExpanded;
            moduleAccordions.forEach(detailsEl => {
                detailsEl.open = allExpanded;
            });
            if (globalAccordionText) {
                globalAccordionText.textContent = allExpanded ? "COLLAPSE ALL" : "EXPAND ALL";
            }
            if (globalAccordionIcon) {
                globalAccordionIcon.className = allExpanded ? "fas fa-compress-arrows-alt" : "fas fa-expand-alt";
            }
        });
    }

    // Monokai Code Snippet Copy Handler
    document.addEventListener("click", (e) => {
        const copyBtn = e.target.closest(".monokai-copy-btn");
        if (!copyBtn) return;
        const wrapper = copyBtn.closest(".monokai-code-wrapper");
        const codeEl = wrapper ? wrapper.querySelector("code") : null;
        if (codeEl) {
            const textToCopy = codeEl.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHtml = copyBtn.innerHTML;
                copyBtn.classList.add("copied");
                copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
                setTimeout(() => {
                    copyBtn.classList.remove("copied");
                    copyBtn.innerHTML = originalHtml;
                }, 2000);
            }).catch(() => {});
        }
    });
});


