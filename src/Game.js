import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { InputManager }     from './InputManager.js';
import { Harshita }         from './heroes/Harshita.js';
import { Harshita_S }       from './heroes/Harshita_S.js';
import { Debojeet }         from './heroes/Debojeet.js';
import { RyomenRaj }        from './heroes/RyomenRaj.js';
import { CHARACTER_CONFIGS } from './CharacterConfigs.js';
import { AIBot }             from './AIBot.js';
import { ArenaManager }      from './ArenaManager.js';
import { AudioManager }      from './AudioManager.js';

const HERO_CARDS_DATA = [
    {
        id: 0, key: 'harshita', name: "Harshita", alias: "The Iron Will",
        archetype: "Disciplined Striker", style: "Rushdown",
        img: "hero_card/harshita_walpaper.jpg", bgL: "H",
        abilities: ["Leetcode Swarm", "Tornado Kick", "Iron Discipline", "Relentless Cadence"],
        short: "She did not find fighting through tragedy. She found it through obsession. A single sparring session at twelve ignited something no classroom ever could — and she has never stopped training since.",
        quote: '"She does not trash talk. She does not celebrate. She simply fights — and then goes home and trains harder."',
        lore: "Harshita was born into a warm, grounded family that valued integrity above everything else. Neither wealthy nor struggling, her household ran on mutual respect, hard work, and quiet dignity. From a young age, she carried those values like armour — not because she was told to, but because she genuinely believed in them.\n\nBy the time the FRACTURE tournament was announced, Harshita had already defeated fighters twice her age, twice her size, and ten times their arrogance. She entered not to prove herself to the world, but to test the absolute ceiling of what relentless dedication can produce.\n\nFighting Style: Precise Muay Thai blended with disciplined footwork. Every move is intentional. No wasted motion. Her combinations feel like mathematical sequences — clean, calculated, inevitable.\n\nSpecial I — Leetcode Swarm (Full Mana): A storm of glowing symbols — + − $ % / * — each a razor-edged projectile flying in rapid succession. What looks like chaos is a precisely calculated pattern.\n\nSpecial II — Tornado Kick (Half Mana): A spinning heel kick so fast it generates a visible vortex of force. Launches the opponent upward for a juggle follow-up."
    },
    {
        id: 1, key: 'harshita_s', name: "Harshita·S", alias: "The Applied Mind",
        archetype: "Technical Counter-Fighter", style: "Knowledge Weaponised",
        img: "hero_card/harshita_s_walpaper.jpg", bgL: "S",
        abilities: ["9 CGPA", "Tornado Kick Mk.II", "Bait & Punish", "Revenue Model"],
        short: "She studied the science of violence so thoroughly, she turned it into art — and then she monetised it. She entered the arena with a 9 CGPA, a fight plan, and a projected revenue model for the next three years.",
        quote: '"The arena is her laboratory. Every opponent is a problem to be solved — and every solved problem pays."',
        lore: "Born into a family of academics with considerable social standing, Harshita·S was raised in an environment saturated with books, theories, and intellectual debate. She graduated with a 9 CGPA, consistently the highest in every room she entered.\n\nShe dissected fight footage like a surgeon. She studied biomechanics, opponent psychology, pressure points, and reaction timing. She trained not to feel strong, but to be correct — and in her world, being correct is far more dangerous than being powerful.\n\nUnlike Harshita, whose motivation is purely internal, Harshita·S saw something others missed — the FRACTURE tournament is not just a competition. It is an opportunity. She did the math. The return on investment was undeniable.\n\nFighting Style: Counter-based Krav Maga with scientific precision. She rarely initiates — she reads, baits, and punishes. Her defensive game is suffocating.\n\nSpecial I — 9 CGPA (Full Mana): A glowing golden aura surrounds her as she draws a massive luminous 9 in the air. It solidifies, rotates, and launches at the opponent like a physical wall.\n\nSpecial II — Tornado Kick Mk.II (Half Mana): Technically refined version — faster startup, with a disorienting spin that scrambles the opponent's controls for 1 second after landing."
    },
    {
        id: 2, key: 'debojeet', name: "Debojeet", alias: "The Immovable",
        archetype: "Grappler", style: "Raw Power · Juggernaut",
        img: "hero_card/debojeet_walpaper.jpg", bgL: "D",
        abilities: ["Inferno Fist", "Iron Redirect", "Ground & Pound", "Marrow Strength"],
        short: "He left everything behind at fifteen. What remained was stronger than anything he left. He spent years sleeping on hard floors, training until his body gave out — then training again the next morning.",
        quote: '"He fights because he has nothing left to prove — and that is precisely what makes him so dangerous."',
        lore: "Debojeet grew up in a stable, loving household — the kind of home most people would have stayed in forever. He did not leave out of pain or rebellion. He left because something deep and wordless inside him demanded more than comfort could offer.\n\nAt fifteen, he walked out with nothing but the clothes on his back and an obsession that had consumed him since childhood — the pursuit of pure, uncompromised physical strength. Not the strength of machines or supplements, but the kind that lives in the marrow.\n\nHe spent years training under judo masters across remote regions. He never complained. Complaint, to Debojeet, is just wasted energy. His physique is the autobiography of that journey. Every scar, every callus tells a story he never bothers to speak aloud.\n\nFighting Style: Judo-dominant grappling with devastating ground-and-pound. He lets opponents come to him, absorbs their energy, and redirects it catastrophically. Slow to start. Terrifying when he closes distance.\n\nSpecial — Inferno Fist (Full Mana): Debojeet plants his feet and draws a slow, deliberate breath. His fist glows — not flashy, just a deep burning orange growing steadily hotter. He releases it as a dense, concentrated fireball that travels forward in a straight line with tremendous force. It does not curve. It does not spread. It simply arrives, and it is enough."
    },
    {
        id: 3, key: 'ryomen_raj', name: "Ryomen Raj", alias: "The Unbound",
        archetype: "Chaos Sovereign", style: "Secret Arts · Laws Don't Apply",
        img: "hero_card/ryoumen_walpaper.jpg", bgL: "R",
        abilities: ["The Unknown", "Cursed Absorption", "Secret Arts", "Unbounded"],
        short: "He didn't chase power. He simply never threw away what everyone else was too proud to keep. He absorbed every curse, every dismissive glance — not with bitterness, but with a quiet, terrifying patience.",
        quote: '"He arrived late to registration, snack in hand, mildly confused about the schedule. He yawned during the opening ceremony. Then the first round began — and nobody said a word for a very long time afterward."',
        lore: "Ryomen Raj's origins are, by design or by nature, unclear. There are fragments — suggestions of a family somewhere, a home that may or may not have held him once. He does not seem particularly interested in revisiting either.\n\nWhat defines Raj is not where he came from but how he moves through the world — entirely on his own terms, unbound by any law or expectation he did not personally agree to. The people around him called him worthless. Directionless. Cursed. They poured their frustration and contempt into him like he was a vessel built to receive it.\n\nHe never argued. He never left. He simply collected it all — because Ryomen Raj understood something none of them ever did: emotion is energy. Resentment, hatred, despair — it all carries weight. And weight, in the right hands, becomes power.\n\nHe absorbed every curse whispered in his direction, every slammed door — not with bitterness, but with a quiet, terrifying patience. Over time it became something no discipline or master could manufacture: a raw, boundless, deeply personal power source that answers only to him.\n\nSpecial — The Unknown (Full Mana): Classified. Even he isn't entirely sure what it will do. That's part of the problem."
    }
];

export class Game {
    constructor() { this._init(); }

    _init() {
        console.log('[Game] Initializing...');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1, 2000
        );
        this.camera.position.set(0, 0, 15);
        this.camera.lookAt(0, 0, 0);

        // ── Loading Manager ───────────────────────────────────────────────────
        this.gameLoaded = false;
        this.fightStarted = false; 
        this._assetsFullyLoaded = false;
        this.manager = new THREE.LoadingManager();
        this._assetsRealProgress = 0;
        this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this._assetsRealProgress = itemsLoaded / itemsTotal;
            if (this.currentPhase === 5) {
                const pct = Math.floor(this._assetsRealProgress * 100);
                const pctEl = document.getElementById('final-loading-percent');
                if (pctEl) pctEl.innerText = pct + '%';
            }
        };
        this.manager.onLoad = () => {
            console.log('[Game] All assets loaded in background!');
            this._assetsFullyLoaded = true;
            if (this.currentPhase === 5) {
                const finalLoadUi = document.getElementById('final-loading-ui');
                if (finalLoadUi) {
                    finalLoadUi.style.transition = 'opacity 0.5s ease';
                    finalLoadUi.style.opacity = '0';
                    setTimeout(() => {
                        finalLoadUi.style.display = 'none';
                        this.gameLoaded = true;
                        this._startCountdown();
                    }, 500);
                } else {
                    this.gameLoaded = true;
                    this._startCountdown();
                }
            }
        };

        // ── Arena Background ──────────────────────────────────────────────────
        this.arena = new ArenaManager(this.scene, this.camera, {}, this.manager);

        // ── Renderer – balanced quality / performance ─────────────────────────
        this.renderer = new THREE.WebGLRenderer({
            canvas:                 document.getElementById('game-canvas'),
            antialias:              true,
            precision:              'highp',
            powerPreference:        'high-performance',
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace   = THREE.SRGBColorSpace;

        // ── Lights ────────────────────────────────────────────────────────────
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.0));

        this.sun = new THREE.DirectionalLight(0xfff0e0, 3.5);
        this.sun.position.set(0, 40, 20);
        this.sun.castShadow = true;
        this.sun.shadow.camera.left   = -30;
        this.sun.shadow.camera.right  =  30;
        this.sun.shadow.camera.top    =  30;
        this.sun.shadow.camera.bottom = -20;
        this.sun.shadow.mapSize.set(1024, 1024);
        this.scene.add(this.sun);

        this.p1Light = new THREE.PointLight(0xffffff, 20, 18);
        this.p2Light = new THREE.PointLight(0xffffff, 20, 18);
        this.scene.add(this.p1Light);
        this.scene.add(this.p2Light);

        // ── Floor / Shadow Receiver ───────────────────────────────────────────

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.ShadowMaterial({ opacity: 0.25 })
        );
        floor.rotation.x  = -Math.PI / 2;
        floor.position.y  = -3.0;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // ── Loading Manager ───────────────────────────────────────────────────
        this.gameLoaded = false;
        this.fightStarted = false; // New flag
        this._assetsFullyLoaded = false;
        this._loadingClips = ['1.mp4','2.mp4','3.mp4','4.mp4','5.mp4','6.mp4','7.mp4','8.mp4','9.mp4','10.mp4','11.mp4','12.mp4','13.mp4'];


        this._loadingTips = [
            'Every legend begins with a single step.',
            'The world holds secrets older than memory.',
            'Your choices echo across time.',
            'Courage is not the absence of fear — it is the will to act.',
            'The greatest treasures are never found on maps.',
            'In darkness, the light you carry matters most.',
            'Every battle fought shapes the warrior you become.',
            'Ancient powers stir beneath the surface.',
            'Not all who wander are lost — some are searching.',
            'The story is yours. Make it worthy of legend.',
        ];
        

        // ── Characters ────────────────────────────────────────────────────────
        this.input   = new InputManager();
        this.player1 = null;
        this.player2 = null;
        this.selectedP1Key = 'harshita_s'; 
        this.activeTheme = 'default';
        this.audioManager = new AudioManager();

        // ── Carousel & Modal State ───────────────────────────────────────────
        this._curHeroIdx = 0;
        this._threePreviewCtx = null;
        this._preloadedHeroModels = {};
        this._preloadedBlobURLs = {}; 
        this._lastOpponentKey = null; // Track last opponent to avoid repetition

        this._initFlowPhase1();

        // ── Resize handler ────────────────────────────────────────────────────
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.clock          = new THREE.Clock();
        this.victoryTriggered = false;
        this._matchTimer = 90;

        this._loop();
    }

    // ── MULTI-STAGE FLOW ──
    async _initFlowPhase1() {
        this.currentPhase = 1;
        console.log('[Game] Phase 1 Starting...');

        const videoUrls = this._loadingClips.map(name => `Front_end_contents/${name}`);
        const audioUrl = 'Front_end_contents/video_animation_sound.mp3';
        const arena2Url = 'Assets/background/arena_2_video.mp4';
        
        const heroKeys = ['harshita', 'harshita_s', 'debojeet', 'ryomen_raj'];
        const previewModelUrls = [
            'hero_card/harshita_animation.glb',
            'hero_card/harshita_s_animation.glb',
            'hero_card/debojeet_animation.glb',
            'hero_card/ryoumen_animation.glb'
        ];
        
        // Optimization: Do NOT preload videos as Blobs (this caused the lag on web).
        // We will let the browser stream them naturally. 
        // Only preload models and UI audio as blobs for instant response.
        const allUrls = [audioUrl, arena2Url, ...previewModelUrls];
        const initialUi = document.getElementById('initial-loading-ui');
        const barFill = document.getElementById('initial-bar-fill');
        const barPct = document.getElementById('initial-bar-percent');
        const statusText = document.querySelector('.loading-status');
        const startBtn = document.getElementById('btn-ready-start');

        let loadedCount = 0;
        const totalCount = allUrls.length;

        // Force show button if something hangs
        if (startBtn) {
            setTimeout(() => {
                startBtn.classList.add('visible');
                startBtn.innerText = 'ENTER ARENA (FORCED)';
            }, 8000);
        }

        // Parallel fetch for speed
        const promises = allUrls.map(async (url) => {
            const filename = url.split('/').pop();
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const blob = await res.blob();
                    this._preloadedBlobURLs[filename] = URL.createObjectURL(blob);
                }
            } catch (e) {
                console.warn(`[Game] Fetch failed: ${url}`);
            } finally {
                loadedCount++;
                const p = Math.floor((loadedCount / totalCount) * 100);
                if (barFill) barFill.style.width = p + '%';
                if (barPct) barPct.innerText = p + '%';
                if (statusText) statusText.innerText = `Cached: ${filename}`;
            }
        });

        await Promise.all(promises).catch(e => console.warn('Preload promise error', e));
        
        if (statusText) statusText.innerText = 'System Ready';
        if (startBtn) {
            startBtn.classList.add('visible');
            startBtn.innerText = 'ENTER ARENA';
            startBtn.onclick = () => {
                if (initialUi) initialUi.style.display = 'none';
                this._startCinematicPhase2();
            };
        }
    }

    async _startCinematicPhase2() {
        this.currentPhase = 2;
        const loadUi = document.getElementById('loading-ui');
        if (loadUi) loadUi.style.display = 'flex';
        
        console.log('[Game] Phase 2: Processing Hero Models in background...');

        // Start background parsing of the blobs we fetched in Phase 1
        const gltfLoader = new GLTFLoader(this.manager);
        
        const heroKeys = ['harshita', 'harshita_s', 'debojeet', 'ryomen_raj'];
        const previewMap = {
            'harshita': 'harshita_animation.glb',
            'harshita_s': 'harshita_s_animation.glb',
            'debojeet': 'debojeet_animation.glb',
            'ryomen_raj': 'ryoumen_animation.glb'
        };

        Object.entries(previewMap).forEach(([key, filename]) => {
            const blobUrl = this._preloadedBlobURLs[filename];
            if (blobUrl) {
                gltfLoader.load(blobUrl, (gltf) => {
                    this._preloadedHeroModels[key] = gltf;
                    console.log(`[Game] Cached high-quality preview for: ${key}`);
                });
            } else {
                // Fallback
                gltfLoader.load(`hero_card/${filename}`, (gltf) => {
                    this._preloadedHeroModels[key] = gltf;
                });
            }
        });

        this._startLoadingScreen();
    }

    _showModeSelectionPhase3() {
        if (this.currentPhase === 3) return; // Prevent double trigger
        this.currentPhase = 3;
        const modeUi = document.getElementById('mode-selection-ui');
        const menuBg = document.getElementById('menu-bg-video');
        if (menuBg) {
            menuBg.style.display = 'block';
            menuBg.play().catch(() => {});
        }
        if (!modeUi) return;
        modeUi.style.display = 'flex';
        modeUi.style.opacity = '0';
        modeUi.style.transition = 'opacity 1s ease';
        // Fade in
        setTimeout(() => { modeUi.style.opacity = '1'; }, 50);

        const btnAi = document.getElementById('btn-mode-ai');
        const btnMulti = document.getElementById('btn-mode-multi');

        if (btnAi) {
            btnAi.onclick = () => {
                modeUi.style.opacity = '0';
                setTimeout(() => {
                    modeUi.style.display = 'none';
                    this._initCharacterSelectionPhase4();
                }, 500);
            };
        }

        if (btnMulti) {
            btnMulti.onclick = () => {
                alert("Multiplayer is currently Under Development!");
            };
        }
    }

    _showThemeSelection() {
        this.currentPhase = 2.5;
        const themeUi = document.getElementById('theme-selection-ui');
        const menuBg = document.getElementById('menu-bg-video');
        if (menuBg) {
            menuBg.style.display = 'block';
            menuBg.play().catch(() => {});
        }
        if (!themeUi) return;

        themeUi.style.display = 'flex';
        themeUi.style.opacity = '0';
        setTimeout(() => themeUi.style.opacity = '1', 50);

        const cards = document.querySelectorAll('.theme-card');
        cards.forEach(card => {
            card.onclick = () => {
                const theme = card.getAttribute('data-theme');
                this._selectTheme(theme);
            };
        });
    }

    _selectTheme(theme) {
        this.activeTheme = theme;
        this.audioManager.setTheme(theme);
        
        const themeUi = document.getElementById('theme-selection-ui');
        if (themeUi) {
            themeUi.style.opacity = '0';
            setTimeout(() => {
                themeUi.style.display = 'none';
                this.audioManager.playMenuMusic();
                this._showModeSelectionPhase3();
            }, 800);
        }
    }

    _initCharacterSelectionPhase4() {
        this.currentPhase = 4;
        console.log('[Game] Phase 4: Hero Selection Carousel');

        // Hide mode selection
        const modeUi = document.getElementById('mode-selection-ui');
        if (modeUi) modeUi.style.display = 'none';

        // Show Hero Selection with Fade
        const heroUi = document.getElementById('hero-selection-phase');
        if (heroUi) {
            heroUi.style.display = 'block';
            heroUi.classList.remove('fade-in');
            setTimeout(() => heroUi.classList.add('fade-in'), 50);
        }

        this._renderHeroSelection();
        this._setupHeroEvents();
        this._spawnHeroParticles();
        this.goToHero(0, true);
    }

    _spawnHeroParticles() {
        const c = document.getElementById('atmo-particles');
        if (!c || c.children.length > 0) return;
        for (let i = 0; i < 26; i++) {
            const p = document.createElement('div');
            p.className = 'petal-hero';
            p.style.left = (Math.random() * 100) + 'vw';
            p.style.setProperty('--dx', (Math.random() * 180 - 90) + 'px');
            const d = 8 + Math.random() * 18;
            p.style.animationDuration = d + 's';
            p.style.animationDelay = -(Math.random() * d) + 's';
            const s = 3 + Math.random() * 5;
            p.style.width = s + 'px';
            p.style.height = s + 'px';
            const r = 195 + Math.floor(Math.random() * 60);
            const g = 155 + Math.floor(Math.random() * 50);
            const b = 30 + Math.floor(Math.random() * 40);
            p.style.background = `rgba(${r},${g},${b},1)`;
            c.appendChild(p);
        }
    }

    _renderHeroSelection() {
        const track = document.getElementById('track-hero');
        const dots = document.getElementById('hero-dots');
        const counterTotal = document.getElementById('ct-hero');

        if (track) {
            track.innerHTML = HERO_CARDS_DATA.map(h => {
                const abs = h.abilities.map(a => `<span class="atag-hero">${a}</span>`).join('');
                const loreHTML = h.lore.replace(/\n/g, '<br><br>');
                return `
                    <div class="hcard" id="hero-card-${h.id}">
                        <div class="art-hero">
                            <img src="${h.img}" alt="${h.name}">
                            <div class="art-vign-hero"></div>
                            <div class="art-scanlines-hero"></div>
                            <div class="art-archetype-hero">
                                <span class="arch-label-hero">${h.archetype}</span>
                                <span class="arch-sep-hero">·</span>
                                <span class="arch-style-hero">${h.style}</span>
                            </div>
                        </div>
                        <div class="info-hero" data-l="${h.bgL}">
                            <div class="hnum-hero">HERO // ${String(h.id + 1).padStart(2, '0')}</div>
                            <div class="hname-hero">${h.name}</div>
                            <div class="halias-hero">${h.alias}</div>
                            <div class="desc-wrap-hero">
                                <p class="desc-short-hero">${h.short}</p>
                                <div class="lore-quote-hero">${h.quote}</div>
                                <button class="rmb-hero" id="rmb-hero-${h.id}">Read Full Lore</button>
                                <div class="lore-full-hero" id="lore-hero-${h.id}">${loreHTML}</div>
                            </div>
                            <div class="abilities-hero">${abs}</div>
                             <div class="actions-hero">
                                <button class="btn-hero btn-prev-hero" id="btn-preview-hero-${h.id}">⬡ Preview 3D</button>
                                <button class="btn-hero btn-sel-hero" id="btn-select-hero-${h.id}">Select →</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (dots) {
            dots.innerHTML = HERO_CARDS_DATA.map((_, i) => 
                `<div class="dot-hero" id="hero-dot-${i}"></div>`
            ).join('');
        }

        if (counterTotal) counterTotal.innerText = HERO_CARDS_DATA.length;
    }

    _setupHeroEvents() {
        const al = document.getElementById('al-hero');
        const ar = document.getElementById('ar-hero');
        const backBtn = document.getElementById('hero-back-btn');

        if (al) al.onclick = () => this.navigateHero(-1);
        if (ar) ar.onclick = () => this.navigateHero(1);
        if (backBtn) backBtn.onclick = () => this._backToModeSelection();

        HERO_CARDS_DATA.forEach(h => {
            const rmb = document.getElementById(`rmb-hero-${h.id}`);
            const preview = document.getElementById(`btn-preview-hero-${h.id}`);
            const select = document.getElementById(`btn-select-hero-${h.id}`);

            if (rmb) rmb.onclick = (e) => this.toggleHeroLore(e, h.id);
            if (preview) preview.onclick = (e) => this.openHeroPreview(e, h.id);
            if (select) select.onclick = (e) => this.selectHero(e, h.id);
        });

        // Keyboard navigation
        this._heroKeyHandler = (e) => {
            if (this.currentPhase !== 4) return;
            if (e.key === 'ArrowLeft') this.navigateHero(-1);
            if (e.key === 'ArrowRight') this.navigateHero(1);
            if (e.key === 'Escape') this.closeHeroPreview();
        };
        window.removeEventListener('keydown', this._heroKeyHandler);
        window.addEventListener('keydown', this._heroKeyHandler);
    }

    goToHero(i, skipFlash = false) {
        if (i < 0 || i >= HERO_CARDS_DATA.length) return;
        
        const oldCard = document.getElementById(`hero-card-${this._curHeroIdx}`);
        if (oldCard) oldCard.classList.remove('active');

        this._curHeroIdx = i;
        const track = document.getElementById('track-hero');
        if (track) track.style.transform = `translateX(-${i * 25}%)`;

        const newCard = document.getElementById(`hero-card-${i}`);
        if (newCard) newCard.classList.add('active');

        document.querySelectorAll('.dot-hero').forEach((d, idx) => {
            d.classList.toggle('on', idx === i);
        });

        const al = document.getElementById('al-hero');
        const ar = document.getElementById('ar-hero');
        if (al) al.classList.toggle('off', i === 0);
        if (ar) ar.classList.toggle('off', i === HERO_CARDS_DATA.length - 1);

        const counterCur = document.getElementById('cc-hero');
        if (counterCur) counterCur.innerText = i + 1;

        if (!skipFlash) {
            const flash = document.getElementById('selection-flash');
            if (flash) {
                flash.style.opacity = '1';
                setTimeout(() => flash.style.opacity = '0', 130);
            }
        }
    }

    navigateHero(d) {
        this.goToHero(this._curHeroIdx + d);
    }

    toggleHeroLore(e, id) {
        e.stopPropagation();
        const lore = document.getElementById(`lore-hero-${id}`);
        const btn = document.getElementById(`rmb-hero-${id}`);
        if (!lore || !btn) return;

        const isOpen = lore.classList.toggle('open');
        btn.classList.toggle('open', isOpen);
        btn.innerText = isOpen ? 'Close Lore' : 'Read Full Lore';
    }

    _backToModeSelection() {
        const heroUi = document.getElementById('hero-selection-phase');
        if (heroUi) heroUi.style.display = 'none';
        this._showModeSelectionPhase3();
    }

    selectHero(e, id) {
        if (e) e.stopPropagation();
        const hero = HERO_CARDS_DATA[id];
        this.selectedP1Key = hero.key;

        const toast = document.getElementById('hero-toast');
        if (toast) {
            toast.innerText = `${hero.name} — Selected`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        console.log(`[Game] Hero Selected: ${hero.name}`);
        
        // Proced to Phase 4.5: Difficulty Selection
        setTimeout(() => {
            const heroUi = document.getElementById('hero-selection-phase');
            if (heroUi) heroUi.classList.remove('fade-in');
            
            setTimeout(() => {
                if (heroUi) heroUi.style.display = 'none';
                this._initDifficultySelectionPhase4_5();
            }, 600);
        }, 800);
    }

    _initDifficultySelectionPhase4_5() {
        this.currentPhase = 4.5;
        const ui = document.getElementById('difficulty-ui');
        if (ui) {
            ui.style.display = 'flex';
            ui.style.opacity = '0';
            ui.style.transition = 'opacity 0.5s ease';
            setTimeout(() => ui.style.opacity = '1', 50);
        }

        // Bind difficulty buttons
        const btnEasy = document.getElementById('btn-easy');
        const btnMed = document.getElementById('btn-medium');
        const btnHard = document.getElementById('btn-hard');

        if (btnEasy) btnEasy.onclick = () => { ui.style.display = 'none'; this.startMatch('easy'); };
        if (btnMed) btnMed.onclick = () => { ui.style.display = 'none'; this.startMatch('medium'); };
        if (btnHard) btnHard.onclick = () => { ui.style.display = 'none'; this.startMatch('hard'); };
    }

    // ─── 3D PREVIEW MODAL ─────────────────────────────────────────────────────
    openHeroPreview(e, id) {
        if (e) e.stopPropagation();
        const hero = HERO_CARDS_DATA[id];
        
        const modal = document.getElementById('preview-modal');
        const nameEl = document.getElementById('m-name-hero');
        const classEl = document.getElementById('m-class-hero');
        const selBtn = document.getElementById('m-sel-hero');
        const closeBtn = document.getElementById('m-close-hero');
        const closeBtn2 = document.querySelector('.mab-close-hero');

        if (nameEl) nameEl.innerText = hero.name;
        if (classEl) classEl.innerText = hero.archetype;
        if (selBtn) selBtn.onclick = () => { this.closeHeroPreview(); this.selectHero(null, id); };
        if (closeBtn) closeBtn.onclick = () => this.closeHeroPreview();
        if (closeBtn2) closeBtn2.onclick = () => this.closeHeroPreview();

        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.style.opacity = '1', 10);
        }

        this._startPreviewThree(hero.key);
    }

    closeHeroPreview() {
        const modal = document.getElementById('preview-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                this._stopPreviewThree();
            }, 450);
        }
    }

    _startPreviewThree(heroKey) {
        this._stopPreviewThree(); // Cleanup old scene

        const canvas = document.getElementById('m-canvas-hero');
        const wrap = document.getElementById('m-canvas-wrap-hero');
        if (!canvas || !wrap) return;

        const W = wrap.clientWidth;
        const H = wrap.clientHeight;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.LinearToneMapping; // More natural colors
        renderer.toneMappingExposure = 1.0;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
        camera.position.set(0, 1.2, 3.5);

        scene.background = new THREE.Color(0x222222); // Slightly lighter gray
        
        // Natural environmental lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
        scene.add(hemiLight);

        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(5, 5, 5);
        scene.add(sun);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-5, 2, -2);
        scene.add(fillLight);

        const grid = new THREE.GridHelper(5, 20, 0xc9a84c, 0x222222);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 0.9, 0);

        const clock = new THREE.Clock();
        let mixer = null;

        // Use PRELOADED model
        const gltf = this._preloadedHeroModels[heroKey];
        if (gltf) {
            const model = SkeletonUtils.clone(gltf.scene); 
            
            // "Root Logic": Mixamo models often have hips that are offset.
            // We force the root/hips to be at 0,0,0 local to the model before scaling.
            model.traverse(node => {
                if (/Hips|Pelvis|Root/i.test(node.name)) {
                    node.position.x = 0;
                    node.position.z = 0;
                }
                if (node.isMesh) {
                    node.castShadow = true;
                    node.frustumCulled = false;
                    
                    if (node.material) {
                        const mats = Array.isArray(node.material) ? node.material : [node.material];
                        mats.forEach(m => {
                            m.transparent = false;
                            m.opacity = 1;
                            m.depthWrite = true;
                            m.alphaTest = 0.5;
                            
                            // Fix "metallic/polished" fake look
                            if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
                                m.metalness = 0.1; // Reduce reflection
                                m.roughness = 0.8; // More matte finish
                            }
                        });
                    }
                }
            });

            model.updateMatrixWorld(true);
            
            // Apply proper scaling using the character's manualScale config if available
            const config = CHARACTER_CONFIGS[heroKey];
            if (config && config.manualScale) {
                // Typical manual scales are 200, 220, 240 which translates to matching the 2.5m target height.
                // We'll scale it down slightly for the preview window so it fits nicely
                model.scale.setScalar(config.manualScale * 0.9);
            } else {
                // Compute box from meshes only for accuracy
                const box = new THREE.Box3();
                model.traverse(node => {
                    if (node.isMesh) {
                        node.geometry.computeBoundingBox();
                        box.expandByObject(node);
                    }
                });

                const size = box.getSize(new THREE.Vector3());
                const sy = (size.y > 0.001 && isFinite(size.y)) ? size.y : 1.0;
                
                // Target height ~2.4 for a prominent preview
                const scale = 2.4 / sy;
                model.scale.setScalar(scale);
            }
            
            // Final centering: precisely ground the feet
            model.updateMatrixWorld(true);
            const box2 = new THREE.Box3();
            model.traverse(node => {
                if (node.isMesh) {
                    node.geometry.computeBoundingBox();
                    const b = node.geometry.boundingBox.clone();
                    b.applyMatrix4(node.matrixWorld);
                    box2.union(b);
                }
            });
            
            const minY = box2.min.y;
            model.position.y = -minY;
            model.position.z = 0;
            model.position.x = 0;

            scene.add(model);
            
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(model);
                mixer.clipAction(gltf.animations[0]).play();
            }

            const loading = document.getElementById('m-loading-hero');
            if (loading) loading.classList.add('hide');
        }

        const animate = () => {
            this._previewAnimId = requestAnimationFrame(animate);
            const dt = clock.getDelta();
            if (mixer) mixer.update(dt);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        this._threePreviewCtx = { renderer, scene, camera, controls };
    }

    _stopPreviewThree() {
        if (this._previewAnimId) cancelAnimationFrame(this._previewAnimId);
        if (this._threePreviewCtx) {
            this._threePreviewCtx.renderer.dispose();
            this._threePreviewCtx.controls.dispose();
            this._threePreviewCtx = null;
        }
        const loading = document.getElementById('m-loading-hero');
        if (loading) loading.classList.remove('hide');
    }

    _startLoadingScreen() {
        const video1 = document.getElementById('video-bg-1');
        const video2 = document.getElementById('video-bg-2');
        const audio = document.getElementById('theme-audio');
        const tipEl = document.getElementById('tip-text');
        const muteBtn = document.getElementById('mute-btn');
        const particles = document.getElementById('particles');
        const menuBg = document.getElementById('menu-bg-video');

        this._activeVideo = video1;
        this._bufferVideo = video2;

        if (menuBg) {
            menuBg.src = this._preloadedBlobURLs['arena_2_video.mp4'] || 'Assets/background/arena_2_video.mp4';
            menuBg.load(); // Start buffering hidden
        }

        // Spawn particles
        if (particles && particles.children.length === 0) {
            for (let i = 0; i < 28; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = Math.random() * 100 + 'vw';
                p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
                const dur = 6 + Math.random() * 10;
                p.style.animationDuration = dur + 's';
                p.style.animationDelay = (Math.random() * dur) + 's';
                p.style.opacity = Math.random() * 0.6 + 0.2;
                const size = Math.random() * 3 + 1;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                particles.appendChild(p);
            }
        }

        // Mute logic
        if (muteBtn && audio) {
            muteBtn.onclick = () => {
                audio.muted = !audio.muted;
                muteBtn.textContent = audio.muted ? '🔇' : '🔊';
            };
        }

        // Start Audio
        if (audio) {
            audio.volume = 0;
            audio.play().then(() => {
                let vol = 0;
                const interval = setInterval(() => {
                    if (!this._loadingScreenActive) {
                        clearInterval(interval);
                        return;
                    }
                    vol += 0.05;
                    if (vol >= 0.8) {
                        audio.volume = 0.8;
                        clearInterval(interval);
                    } else {
                        audio.volume = vol;
                    }
                }, 100);
            }).catch(e => console.warn('Audio autoplay blocked'));
        }

        // Start Simulation Bar (30 seconds)
        this._simStart = performance.now();
        const updateSim = (ts) => {
            if (!this._loadingScreenActive) return;
            const elapsed = ts - this._simStart;
            const simProgress = Math.min(elapsed / 30000, 1);
            
            // Combine sim progress with real progress (whichever is slower to reach 100%?)
            // Or just use sim progress for the bar, but wait for real progress to finish.
            const displayProgress = Math.floor(simProgress * 100);
            const fill = document.getElementById('bar-fill');
            const text = document.getElementById('bar-percent');
            if (fill) fill.style.width = displayProgress + '%';
            if (text) text.innerText = displayProgress + '%';

            // If 30 seconds hasn't passed, keep animating
            if (simProgress < 1) {
                // Pre-play the background video 2 seconds before finishing
                if (simProgress > 0.93 && !this._bgVideoPrePlayed) {
                    const menuBg = document.getElementById('menu-bg-video');
                    if (menuBg) {
                        menuBg.style.display = 'none'; // Ensure hidden
                        menuBg.play().catch(() => {});
                        this._bgVideoPrePlayed = true;
                        console.log('[Game] Pre-playing background video for smooth transition');
                    }
                }
                requestAnimationFrame(updateSim);
            } else {
                // 30 seconds have passed. Are assets loaded?
                if (!this._assetsFullyLoaded) {
                    const fallbackText = document.getElementById('fallback-text');
                    if (fallbackText) {
                        const realPct = Math.floor(this._assetsRealProgress * 100);
                        fallbackText.style.display = 'block';
                        fallbackText.innerHTML = `YOUR INTERNET IS SLOW: STILL DOWNLOADING ${realPct}% ...`;
                        
                        // Update bar and text with real data
                        if (fill) fill.style.width = realPct + '%';
                        if (text) text.innerText = realPct + '%';
                    }
                    requestAnimationFrame(updateSim);
                } else {
                    this._stopLoadingScreen();
                }
            }
        };
        requestAnimationFrame(updateSim);

        // Start Video Cycling (Double Buffered)
        this._currentClipIdx = Math.floor(Math.random() * this._loadingClips.length);
        
        const playNextClip = () => {
            if (!this._loadingScreenActive) return;
            
            const nextClip = this._loadingClips[this._currentClipIdx];
            // Use direct path instead of blob URL for videos to enable browser streaming (zero lag)
            this._bufferVideo.src = 'Front_end_contents/' + nextClip;

            
            this._bufferVideo.play().then(() => {
                // Cross-fade
                this._activeVideo.classList.remove('visible');
                this._bufferVideo.classList.add('visible');
                
                // Swap roles
                const temp = this._activeVideo;
                this._activeVideo = this._bufferVideo;
                this._bufferVideo = temp;

                this._currentClipIdx = (this._currentClipIdx + 1) % this._loadingClips.length;
            }).catch(e => console.warn("Video play failed", e));

            this._clipTimeout = setTimeout(playNextClip, 2500);
        };
        this._loadingScreenActive = true;
        playNextClip();

        // Start Tips
        let tipIdx = 0;
        const showNextTip = () => {
            if (!this._loadingScreenActive) return;
            tipEl.style.opacity = 0;
            setTimeout(() => {
                tipEl.innerText = this._loadingTips[tipIdx % this._loadingTips.length];
                tipEl.style.opacity = 1;
                tipIdx++;
            }, 600);
            this._tipInterval = setTimeout(showNextTip, 5000);
        };
        showNextTip();
    }

    _stopLoadingScreen() {
        this._loadingScreenActive = false;
        clearTimeout(this._clipTimeout);
        clearTimeout(this._tipInterval);
        
        if (this._activeVideo) this._activeVideo.pause();
        if (this._bufferVideo) this._bufferVideo.pause();

        // Extra safety: Pause all videos in the document
        document.querySelectorAll('video').forEach(v => {
            try { v.pause(); } catch(e){}
        });

        const ui = document.getElementById('loading-ui');
        const audio = document.getElementById('theme-audio');

        if (audio) {
            const fadeOut = setInterval(() => {
                if (audio.volume > 0.05) {
                    audio.volume -= 0.05;
                } else {
                    audio.volume = 0;
                    audio.pause();
                    clearInterval(fadeOut);
                }
            }, 100);
        }

        if (ui) {
            ui.style.transition = 'opacity 1s ease';
            ui.style.opacity = '0';
            
            // Fix: Start the mode selection background video immediately 
            // so it's ready when the loader fades out.
            this._showThemeSelection();

            setTimeout(() => {
                ui.style.display = 'none';
            }, 1000);
        }
    }

    _startCountdown() {
        const ui = document.getElementById('countdown-ui');
        const text = document.getElementById('countdown-text');
        if (!ui || !text) return;

        // Disable interaction
        if (this.input) this.input.enabled = false;
        if (this.aiController) this.aiController.enabled = false;

        ui.style.display = 'flex';
        const sequence = ['3', '2', '1', 'FIGHT!'];
        let idx = 0;

        const nextStep = () => {
            if (idx >= sequence.length) {
                ui.style.display = 'none';
                this.fightStarted = true;
                if (this.input) this.input.enabled = true;
                if (this.aiController) this.aiController.enabled = true;
                
                const uiLayer = document.getElementById('ui-layer');
                if (uiLayer) uiLayer.style.display = 'block';
                return;
            }

            text.innerText = sequence[idx];
            // Restart animation
            text.style.animation = 'none';
            text.offsetHeight; // trigger reflow
            text.style.animation = 'countdownScale 0.8s ease-out forwards';
            
            idx++;
            setTimeout(nextStep, 1000);
        };

        nextStep();
    }

    startMatch(difficulty) {
        this.currentPhase = 5;
        this.aiDifficulty = difficulty;
        this._matchTimer = 90; // Reset timer for the match
        console.log(`[Game] Starting 1v1 Match | Fighter: ${this.selectedP1Key.toUpperCase()} | AI: ${difficulty.toUpperCase()}`);

        const finalLoadUi = document.getElementById('final-loading-ui');
        const finalPercent = document.getElementById('final-loading-percent');
        if (finalLoadUi) {
            finalLoadUi.style.opacity = '1';
            finalLoadUi.style.display = 'flex';
        }
        if (finalPercent) finalPercent.innerText = '0%';

        const menuBg = document.getElementById('menu-bg-video');
        if (menuBg) {
            menuBg.style.display = 'none'; // Hide background video
            menuBg.pause(); // Fix lag: explicitly pause it
        }

        // Extra safety: Pause all videos in the document to ensure maximum performance
        document.querySelectorAll('video').forEach(v => {
            try { v.pause(); } catch(e){}
        });
        
        // Handle Theme-based Arena Setup
        let arenaImage;
        let yOffset = 0;
        let zoom = 1.0;
        if (this.activeTheme === 'indian') {
            const images = ['Assets/arena_theme/indian/indian_arena_1.jpg', 'Assets/arena_theme/indian/indian_arena_2.jpg'];
            arenaImage = images[Math.floor(Math.random() * images.length)];
            yOffset = 3.5; 
            zoom = 1.3;    
        } else if (this.activeTheme === 'chinese') {
            const images = ['Assets/arena_theme/chineese/chineese_arena_1.jpg', 'Assets/arena_theme/chineese/chineese_arena_2.jpg'];
            arenaImage = images[Math.floor(Math.random() * images.length)];
            yOffset = 1.2; 
            zoom = 1.1;
        } else {
            arenaImage = 'Assets/background/image_background.jpg';
            yOffset = 0.5;
            zoom = 1.0;
        }
        
        if (this.arena) {
            this.arena.setBackground(arenaImage, yOffset, zoom);
        }
        
        this.audioManager.playArenaMusic();

        // Show HUD and hide others
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'none'; // Hide HUD until countdown
        const timerEl = document.getElementById('match-timer');
        if (timerEl) timerEl.innerText = "90";

        // Update HUD Difficulty Badge display
        const badge = document.getElementById('p2-diff-badge');
        if (badge) {
            badge.innerText = difficulty.toUpperCase();
            badge.className = `diff-badge ${difficulty}`; // Colors badge green/yellow/red
            badge.style.display = 'inline-block';
        }

        // Choose Player 1 from user selection.
        // Select Player 2 randomly from active pool (Harshita, Harshita_S, Debojeet) if default dummy is requested.
        const urlParams = new URLSearchParams(window.location.search);
        const p1Key = this.selectedP1Key; 
        
        let p2Key = urlParams.get('p2') || 'dummy';
        if (p2Key === 'dummy') {
            const playableAIs = ['harshita', 'harshita_s', 'debojeet'].filter(k => k !== this._lastOpponentKey);
            p2Key = playableAIs[Math.floor(Math.random() * playableAIs.length)];
            this._lastOpponentKey = p2Key; // Cache for next match
            console.log(`[Game] Dynamic Matchmaking: Selected random AI -> ${p2Key.toUpperCase()}`);
        }
        
        const classMap = {
            'harshita':   Harshita,
            'harshita_s': Harshita_S,
            'debojeet':   Debojeet,
            'ryomen_raj': RyomenRaj
        };
        
        const P1Class = classMap[p1Key] || Harshita_S;
        const P2Class = classMap[p2Key] || Harshita;
        
        console.log(`[Game] Instantiating Player 1: ${p1Key}, Player 2: ${p2Key}`);
        this.aiController = new AIBot(difficulty);
        
        this.player1 = new P1Class(this.scene, this.input,        CHARACTER_CONFIGS[p1Key] || CHARACTER_CONFIGS['harshita_s'], true, this.manager);
        this.player2 = new P2Class(this.scene, this.aiController, CHARACTER_CONFIGS[p2Key] || CHARACTER_CONFIGS['dummy'],       false, this.manager);
        
        this.player1.setOpponent(this.player2);
        this.player2.setOpponent(this.player1);
        
        this.aiController.self = this.player2;
        this.aiController.opponent = this.player1;
    }

    showVictoryScreen(winnerName) {
        this.audioManager.fadeToSilence(); // Stop battle music gracefully
        
        setTimeout(() => {
            const ui = document.getElementById('victory-ui');
            const title = document.getElementById('victory-title');
            if (title) {
                if (winnerName.includes('YOU')) {
                    title.innerText = winnerName + '!';
                } else {
                    title.innerText = winnerName + ' WINS!';
                }
            }
            if (ui) ui.style.display = 'flex';

            const replayBtn = document.getElementById('btn-replay');
            const exitBtn = document.getElementById('btn-exit');
            if (replayBtn) {
                replayBtn.onclick = () => {
                    this.resetMatch();
                };
            }
            if (exitBtn) exitBtn.onclick = () => {
                this.audioManager.stopAll();
                document.body.innerHTML = '<div style="display:flex;height:100vh;width:100vw;justify-content:center;align-items:center;background:black;color:white;font-family:sans-serif;"><h1>Thanks for playing!</h1></div>';
            };
        }, 3000); // 3-second delay to watch the animation
    }

    resetMatch() {
        console.log('[Game] Resetting match for replay...');
        
        // Hide screens
        const victoryUi = document.getElementById('victory-ui');
        const uiLayer = document.getElementById('ui-layer');
        if (victoryUi) victoryUi.style.display = 'none';
        if (uiLayer) uiLayer.style.display = 'none';

        // Cleanup characters
        if (this.player1 && this.player1.model) this.scene.remove(this.player1.model);
        if (this.player2 && this.player2.model) this.scene.remove(this.player2.model);
        
        this.player1 = null;
        this.player2 = null;
        this.fightStarted = false;
        this.victoryTriggered = false;
        this.gameLoaded = false;
        this._matchTimer = 90;
        
        const menuBg = document.getElementById('menu-bg-video');
        if (menuBg) menuBg.play().catch(() => {});

        // Go back to Phase 4 (Character Selection)
        this.audioManager.playMenuMusic();
        this._initCharacterSelectionPhase4();
    }

    _loop() {
        requestAnimationFrame(() => this._loop());
        
        const dt = Math.min(this.clock.getDelta(), 0.033); // cap at ~30 fps equivalent

        if (this.gameLoaded) {
            // Only update players/AI if fight has actually started
            if (this.fightStarted) {
                this.player1.update(dt);
                if (this.aiController) this.aiController.update(dt);
                this.player2.update(dt);

                // Update Timer
                if (!this.victoryTriggered) {
                    this._matchTimer -= dt;
                    if (this._matchTimer < 0) this._matchTimer = 0;
                    
                    const timerEl = document.getElementById('match-timer');
                    if (timerEl) timerEl.innerText = Math.ceil(this._matchTimer);

                    if (this._matchTimer <= 0) {
                        this.victoryTriggered = true;
                        // Time out! Choose winner by HP
                        const p1HP = this.player1.health;
                        const p2HP = this.player2.health;
                        
                        if (p1HP > p2HP) {
                            this.player1.playVictory();
                            this.showVictoryScreen('YOU WIN');
                        } else if (p2HP > p1HP) {
                            this.player2.playVictory();
                            this.showVictoryScreen('YOU LOSE');
                        } else {
                            this.showVictoryScreen('DRAW');
                        }
                    }
                }
            } else {
                // Keep animations running (idle) but no logic/movement?
                // Actually, characters usually play an intro or idle.
                // We'll update them but maybe prevent movement/input.
                // For now, let's just let them update (animations will play).
                if (this.player1) this.player1.update(dt);
                if (this.player2) this.player2.update(dt);
            }

            // ── Victory trigger (when either player dies) ─────────────────────────
            if (!this.victoryTriggered && this.fightStarted) {
                if (this.player1.isDead) {
                    this.player2.playVictory();
                    this.victoryTriggered = true;
                    this.showVictoryScreen('YOU LOSE');
                } else if (this.player2.isDead) {
                    this.player1.playVictory();
                    this.victoryTriggered = true;
                    this.showVictoryScreen('YOU WIN');
                }
            }
        }

        // ── Safe tracking/rendering updates (Only runs after players exist) ─────────
        if (this.player1 && this.player2) {
            if (this.player1.model) this.p1Light.position.set(this.player1.pos.x, this.player1.pos.y + 2, 2);
            if (this.player2.model) this.p2Light.position.set(this.player2.pos.x, this.player2.pos.y + 2, 2);

            // Camera follow
            const midX    = (this.player1.pos.x + this.player2.pos.x) / 2;
            const dist    = Math.abs(this.player1.pos.x - this.player2.pos.x);
            // Cap zoom to allow seeing the full expanded arena (50 units wide now)
            const targetZ = Math.min(Math.max(12, dist * 0.9 + 6), 45.0); // Increased for more spatial freedom

            this.camera.position.x += (midX    - this.camera.position.x) * 4   * dt;
            this.camera.position.z += (targetZ - this.camera.position.z) * 1.5 * dt;

            // Synchronize UV background panning with the camera position for a smooth cinematic panning effect
            if (this.arena) this.arena.update(this.camera.position.x, dt);
        } else {
            // Neutral static standby position while picking difficulty
            this.camera.position.set(0, 1, 15);
            if (this.arena) this.arena.update(0, dt);
        }

        this.renderer.render(this.scene, this.camera);
    }
}
