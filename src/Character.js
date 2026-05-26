import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const TARGET_HEIGHT = 2.5;
const GROUND_Y      = -3.0;
const ARENA_WALL    = 25.0; // Increased from 22.0 for even more boundary space

// ─── Shared AudioContext for low-latency sound ───────────────────────────────
let _audioCtx = null;
function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
}

export function unlockAudioContext() {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
}

export class Character {
    constructor(scene, inputManager, config, isPlayerOne = true, loadingManager = null) {
        this.scene       = scene;
        this.input       = inputManager;
        this.config      = config;
        this.isPlayerOne = isPlayerOne;
        this.loadingManager = loadingManager;

        this.model   = null;
        this.mixer   = null;
        this.actions = {};
        this.currentAction = null;
        this._ready  = false;
        this._actionsLoaded = false;
        this._footOffset = 0;
        this.opponent = null;

        // Combat & Stats
        this.health = config.stats.health || 100;
        this.mana   = config.stats.mana   || 10;
        this.isAttacking = false;
        this.isHit       = false;
        this.isDead      = false;
        this.isVictory   = false;
        this.isParalyzed = false;
        this.attackTimer = 0;
        this.hitCooldown = 0;
        this.attackDirection = 0;
        this.grabActive  = false;
        this._skillTrackerUsage = {};

        // Active Projectiles
        this.projectiles = [];

        // Physics state
        this.pos      = new THREE.Vector3(isPlayerOne ? -5 : 5, GROUND_Y, 0);
        this.vel      = new THREE.Vector3();
        this.grounded = true;

        this.jumpsLeft  = 2;
        this.MAX_JUMPS  = 2;
        this._jumpPressed = false;

        this.MOVE_SPEED = config.stats.moveSpeed || 6.5;
        this.ACCEL      = 60.0;
        this.FRICTION   = 50.0;
        this.JUMP_FORCE = config.stats.jumpForce || 11.5;
        this.GRAVITY    = -40.0;
        this.MIN_DIST   = 1.2;

        // Hitboxes – filled by bone traversal, used as world-position sources
        this.hitboxes = { handR: null, footR: null };

        // Pre-load audio buffers into AudioContext
        this._audioBuffers = {};
        this._activeSounds  = {}; // Track playing sounds to allow interruption
        this._preloadAudio();

        this._loadAllModels();
    }

    // ─── Audio ─────────────────────────────────────────────────────────────────
    async _preloadAudio() {
        if (!this.config.sounds) return;
        const ctx = getAudioCtx();
        const seen = new Set();
        for (const [name, path] of Object.entries(this.config.sounds)) {
            if (seen.has(path)) {
                // Reuse buffer for identical paths
                const existing = Object.values(this._audioBuffers).find(b => b._path === path);
                if (existing) { this._audioBuffers[name] = existing; continue; }
            }
            seen.add(path);
            try {
                const res = await fetch(path);
                const raw = await res.arrayBuffer();
                const buf = await ctx.decodeAudioData(raw);
                buf._path = path;
                this._audioBuffers[name] = buf;
            } catch(e) { /* sound file missing – silent fail */ }
        }
    }

    playSound(name, rate = 1.0, volume = 0.5) {
        const buf = this._audioBuffers[name];
        if (!buf) return null;

        // Inject aggressive software debounce to prevent double triggers on combo cues
        if (name === 'combo') {
            const now = performance.now();
            if (this._lastComboSoundTime && (now - this._lastComboSoundTime) < 500) {
                return null; 
            }
            this._lastComboSoundTime = now;
        }

        try {
            const ctx  = getAudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            const src  = ctx.createBufferSource();
            src.buffer = buf;
            src.playbackRate.value = rate;
            const gain = ctx.createGain();
            gain.gain.value = volume;
            src.connect(gain);
            gain.connect(ctx.destination);
            src.start(0);

            // Track sounds that might need to be stopped (interrupted combos/specials)
            if (['combo', 'special', 'magic'].includes(name)) {
                this.stopSound(name); 
                this._activeSounds[name] = src;
                src.onended = () => { if (this._activeSounds[name] === src) delete this._activeSounds[name]; };
            }
            return src;
        } catch(e) { return null; }
    }

    stopSound(name) {
        if (this._activeSounds[name]) {
            try { this._activeSounds[name].stop(); } catch(e) {}
            delete this._activeSounds[name];
        }
    }

    stopAllCombatSounds() {
        ['combo', 'special', 'magic'].forEach(k => this.stopSound(k));
    }

    // ─── Victory ──────────────────────────────────────────────────────────────
    playVictory() {
        this.isVictory = true;
        this.fadeTo('victory');
    }

    setOpponent(opponent) { this.opponent = opponent; }

    // ─── Model / Animation Loading ────────────────────────────────────────────
    async _loadAllModels() {
        const loader = new GLTFLoader(this.loadingManager);
        const { baseUrl, animations } = this.config;
        console.log(`[Character] Loading character ${this.config.name} from ${baseUrl}`);

        try {
            // 1. Load idle model first → visible immediately
            const idleGltf = await loader.loadAsync(baseUrl + animations.idle);
            this.model  = idleGltf.scene;
            this.mixer  = new THREE.AnimationMixer(this.model);
            this.scene.add(this.model);

            const idleClip = idleGltf.animations[0];
            const rootTrackPattern = /mixamorig:?Hips\.position|Hips\.position|Pelvis\.position|Root\.position/i;
            this._lockInitialX = 0;
            this._lockInitialZ = 0;
            idleClip.tracks.forEach(t => {
                if (rootTrackPattern.test(t.name)) {
                    this._lockInitialX = t.values[0];
                    this._lockInitialZ = 0; // Guarantee alignment to 2.5D gameplay plane (Z=0)
                    for (let i = 0; i < t.values.length; i += 3) {
                        t.values[i] = this._lockInitialX; // Lock X relative to animation start
                        t.values[i+2] = 0;               // Force zero Z-depth offset
                    }
                }
            });

            this.actions['idle'] = this.mixer.clipAction(idleClip);
            this.actions['idle'].setLoop(THREE.LoopRepeat);
            this.actions['idle'].play();
            this.currentAction = this.actions['idle'];

            // Advance one frame so skeleton has a real pose for bounding box
            this.mixer.update(0.016);

            // 2. Scale character to correct height
            if (this.config.manualScale) {
                // Absolute scale override (use when auto-scale gives wrong results)
                this.model.scale.setScalar(this.config.manualScale);
            } else {
                // Auto-scale based on bounding box
                this.model.updateMatrixWorld(true);
                const box  = new THREE.Box3().setFromObject(this.model);
                const size = box.getSize(new THREE.Vector3());
                const sy   = (size.y > 0.001 && isFinite(size.y)) ? size.y : 1.0;
                this.model.scale.setScalar(TARGET_HEIGHT / sy);
            }

            // Recompute foot offset after scaling
            this.model.updateMatrixWorld(true);
            const box2 = new THREE.Box3().setFromObject(this.model);
            this._footOffset = isFinite(box2.min.y) ? -box2.min.y : 0;
            
            console.log(`[Character] ${this.config.name} finalScale=${this.model.scale.x.toFixed(1)}, footOffset=${this._footOffset.toFixed(3)}`);

            // Setup meshes and hitbox bones (exact Mixamo bone names)
            this.model.traverse(node => {
                node.frustumCulled = false;
                if (node.isMesh || node.isSkinnedMesh) {
                    node.castShadow    = true;
                    node.receiveShadow = true;
                    
                    // Explicitly calculate robust geometric bounds to ensure stable GPU rendering
                    if (node.geometry) {
                        node.geometry.computeBoundingBox();
                        node.geometry.computeBoundingSphere();
                    }
                    
                    // Add robust DoubleSide rendering to avoid distance/rotation backface culling
                    const mats = Array.isArray(node.material) ? node.material : [node.material];
                    mats.forEach(m => {
                        if (m) {
                            m.side = THREE.DoubleSide;
                            m.shadowSide = THREE.DoubleSide;
                        }
                    });
                }
                // Use exact Mixamo rig bone names for precise hitbox placement
                if (node.name === 'mixamorigRightHand') this.hitboxes.handR = node;
                if (node.name === 'mixamorigRightFoot')  this.hitboxes.footR = node;
            });

            this._ready = true;

            // Update UI name label
            const nameEl = document.getElementById(this.isPlayerOne ? 'p1-name' : 'p2-name');
            if (nameEl) nameEl.innerText = this.config.name;

            // 4. Load remaining animations in background (skip entry)
            const skipKeys = new Set(['idle', 'entry']); // entry not used
            this._loadBackgroundAnims(loader, baseUrl, animations, skipKeys);

        } catch (err) {
            console.error('[Character] LOAD ERROR:', err);
            const errData = {
                character: this.config.name,
                error: err.message || String(err)
            };
            fetch(`/api/track?event=character_load_error&data=${encodeURIComponent(JSON.stringify(errData))}`).catch(() => {});
        }
    }

    _recalibrateFootOffset() {
        if (!this.model) return;

        // ── Static Override Bypass ──
        // Some custom non-standard rigs (like the Dwarf model) have bones that are offset 
        // from their visual mesh. Dynamic recalibration pushes them into the ground.
        if (this.config.staticFootOffset !== undefined) {
            if (this.config.staticFootOffset === 'use_box') {
                this.model.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(this.model);
                let modelPos = new THREE.Vector3();
                this.model.getWorldPosition(modelPos);
                this._footOffset = isFinite(box.min.y) ? (modelPos.y - box.min.y) : 0;
                console.log(`[${this.config.name}] Forced Bounding Box offset override: ${this._footOffset.toFixed(3)}`);
            } else {
                this._footOffset = this.config.staticFootOffset;
                console.log(`[${this.config.name}] Using STATIC foot offset override: ${this._footOffset.toFixed(3)}`);
            }
            return;
        }
        
        // Force Matrix updates to read current world transforms
        this.model.updateMatrixWorld(true);
        
        const box = new THREE.Box3().setFromObject(this.model);
        const boxHeight = isFinite(box.max.y) && isFinite(box.min.y) ? (box.max.y - box.min.y) : 0;
        
        // ── Robust Matrix Initialization Check ──
        // If the geometry's total height is near zero (< 0.05m), the mesh vertices have not been 
        // rasterized or bounded on GPU yet. We MUST fallback to safe scale-proportional estimation.
        if (boxHeight < 0.05) {
            const scaleFactor = this.config.manualScale || 100;
            this._footOffset = (scaleFactor / 100.0) * 0.75; 
            console.log(`[${this.config.name}] Matrix lag detected (height=${boxHeight.toFixed(3)}). Safeguard proportional offset applied: ${this._footOffset.toFixed(3)}`);
            return;
        }
        
        // ── Active Geometry Tracking ──
        // Geometry exists! Measure the lowest bone (standard Mixamo structure).
        let lowestY = Infinity;
        this.model.traverse(node => {
            if (node.isBone && (node.name.toLowerCase().includes('foot') || node.name.toLowerCase().includes('toe'))) {
                const pos = new THREE.Vector3();
                node.getWorldPosition(pos);
                if (pos.y < lowestY) {
                    lowestY = pos.y;
                }
            }
        });
        
        let modelPos = new THREE.Vector3();
        this.model.getWorldPosition(modelPos);
        
        if (lowestY !== Infinity) {
            // Absolute bone alignment
            this._footOffset = modelPos.y - lowestY;
            console.log(`[${this.config.name}] Dynamically recalibrated via BONES to: ${this._footOffset.toFixed(3)}`);
        } else {
            // Rigid/Custom Mesh Alignment via true bounding box
            this._footOffset = isFinite(box.min.y) ? (modelPos.y - box.min.y) : 0;
            console.log(`[${this.config.name}] Dynamically recalibrated via BOUNDING BOX to: ${this._footOffset.toFixed(3)}`);
        }
    }

    async _loadBackgroundAnims(loader, baseUrl, animations, skipKeys) {
        // Root-motion tracks to strip (prevent character drift)
        const rootTrackPattern = /mixamorig:?Hips\.position|Hips\.position|Pelvis\.position|Root\.position/i;
        // Animations that loop vs play-once
        const loopOnceKeys  = new Set(['punch','kick','special','magic','combo1','combo2','hit_light','hit_medium','ko','get_up','victory','jump']);
        const clampKeys     = new Set(['ko','get_up','victory','jump','punch','kick','special','magic','combo1','combo2','hit_light','hit_medium']);

        const loadPromises = [];

        for (const [key, file] of Object.entries(animations)) {
            if (skipKeys.has(key)) continue;
            
            const loadPromise = loader.loadAsync(baseUrl + file).then(gltf => {
                if (!gltf.animations.length) return;
                const clip = gltf.animations[0];

                // Fix "Sitting Down" Root-motion tracks
                // We keep Y (height) for bouncing, but zero out X and Z (drift)
                // Expanded to ALL combat & movement animations to ensure absolute alignment
                const lockKeys = ['idle','run','back','special','combo1','combo2','victory','jump','punch','kick','magic','hit_light','hit_medium','ko','get_up'];
                if (lockKeys.includes(key)) {
                    clip.tracks.forEach(t => {
                        if (rootTrackPattern.test(t.name)) {
                            const fx = this._lockInitialX !== undefined ? this._lockInitialX : t.values[0];
                            for (let i = 0; i < t.values.length; i += 3) {
                                t.values[i] = fx;  // Lock X relative to Idle
                                t.values[i + 2] = 0; // Absolutely lock to the 2.5D fighting plane (Z=0)
                            }
                        }
                    });
                }

                const action = this.mixer.clipAction(clip);
                
                if (loopOnceKeys.has(key)) {
                    action.setLoop(THREE.LoopOnce);
                    action.clampWhenFinished = clampKeys.has(key);
                } else {
                    action.setLoop(THREE.LoopRepeat);
                }
                this.actions[key] = action;
            }).catch(e => {
                console.warn(`[Character] Could not load animation "${key}":`, e.message);
                const errData = {
                    character: this.config.name,
                    animation: key,
                    error: e.message || String(e)
                };
                fetch(`/api/track?event=animation_load_error&data=${encodeURIComponent(JSON.stringify(errData))}`).catch(() => {});
            });

            loadPromises.push(loadPromise);
        }

        await Promise.all(loadPromises);

        this._actionsLoaded = true;
        this.onAnimationsLoaded(); // Hook for subclasses

        // Wire up the animation-finished handler only once all actions exist
        this.setupMixerFinishedListener(this.mixer);
    }

    setupMixerFinishedListener(mixer) {
        if (!mixer) return;
        
        // Remove existing listener if any to avoid duplication
        if (mixer._finishedHandler) {
            mixer.removeEventListener('finished', mixer._finishedHandler);
        }
        
        mixer._finishedHandler = (e) => {
            if (this.isDead || this.isVictory) return;
            const isGrappled = this.opponent && this.opponent.grabActive;
            if (isGrappled) return;

            const act = e.action;
            const resetKeys = ['punch','kick','special','magic','combo1','combo2','hit_light','hit_medium','get_up','secret_art'];
            for (const k of resetKeys) {
                if ((this.actions[k] === act || (this.domainActions && this.domainActions[k] === act)) && act === this.currentAction) {
                    this._resetState();
                    return;
                }
            }
        };
        
        mixer.addEventListener('finished', mixer._finishedHandler);
    }

    // ─── State helpers ────────────────────────────────────────────────────────
    _resetState() {
        if (this.isDead || this.isVictory) return;
        this.stopAllCombatSounds(); // Kill any lingering combo/special audio
        this.isAttacking     = false;
        this.isHit           = false;
        this.attackTimer     = 0;
        this.hitCooldown     = 0;
        this.attackDirection = 0;
        this.fadeTo('idle');
    }

    fadeTo(name) {
        const next = this.actions[name];
        if (!next) return;
        if (next === this.currentAction) {
            // Failsafe: if we are requesting the same LoopOnce animation (like hit reaction or attack),
            // we must reset it and play it again so it doesn't stay clamped at the end.
            if (next.loop === THREE.LoopOnce) {
                next.reset().play();
            }
            return;
        }
        if (this.currentAction) this.currentAction.fadeOut(0.15);
        next.reset().fadeIn(0.15).play();
        this.currentAction = next;
    }

    // ─── Damage ───────────────────────────────────────────────────────────────
    takeDamage(amount, isMagic = false, isParalyze = false) {
        if (this.isDead || this.isVictory) return;

        const wasParalyzed = this.isParalyzed;
        if (this.isParalyzed) this.isParalyzed = false;

        this.health = Math.max(0, this.health - amount);
        this.isHit  = true;
        this.isAttacking = false;
        this.attackTimer = 0; // Reset combat/recovery timer for hit state

        if (this.health <= 0) {
            this.isDead = true;
            this.stopAllCombatSounds();
            this.fadeTo('ko');
        } else if (wasParalyzed) {
            // Wake up immediately when hit while flat on ground!
            this.fadeTo('get_up');
        } else if (isParalyze) {
            this.isParalyzed = true;
            this.stopAllCombatSounds();
            this.fadeTo('ko');
        } else if (isMagic) {
            this.stopAllCombatSounds();
            this.fadeTo('ko');
            setTimeout(() => { if (!this.isDead && !this.isParalyzed) this.fadeTo('get_up'); }, 1000);
        } else {
            this.stopAllCombatSounds();
            this.fadeTo(amount > 15 ? 'hit_medium' : 'hit_light');
        }

        this.playSound('hit');
        this._updateUI();
    }

    _updateUI() {
        const hEl = document.getElementById(this.isPlayerOne ? 'p1-health' : 'p2-health');
        const mEl = document.getElementById(this.isPlayerOne ? 'p1-mana'   : 'p2-mana');
        if (hEl) hEl.style.width = this.health + '%';
        if (mEl) mEl.style.width = this.mana   + '%';
    }

    // ─── Combat detection ─────────────────────────────────────────────────────
    _checkCombat() {
        if (!this.isAttacking || this.hitCooldown > 0 || !this.opponent || !this.opponent._ready) return;

        const activeAction = this.currentAction;
        let damage     = 0;
        let isMultiHit = false;
        let isKick     = false;

        if      (activeAction === this.actions['punch'])  { damage = 8;  }
        else if (activeAction === this.actions['combo1']) { damage = 2;  isMultiHit = true; }
        else if (activeAction === this.actions['kick'])   { damage = 12; isKick = true; }
        else if (activeAction === this.actions['combo2']) { damage = 2;  isMultiHit = true; isKick = true; }
        else if (activeAction === this.actions['special']){ damage = 1;  isMultiHit = true; isKick = true; }

        if (!damage) return;

        // ── Attack origin: use GAMEPLAY pos (immune to manualScale bone distortion) ──
        // Build a fist/foot world point in front of the attacker at the right height.
        const dir = this.attackDirection || Math.sign(this.opponent.pos.x - this.pos.x);
        const attackPos = new THREE.Vector3(
            this.pos.x + dir * 0.7,           // Reach forward 0.7 units
            this.pos.y + (isKick ? 0.5 : 1.2), // Foot or fist height relative to ground
            0
        );

        // ── Target: opponent center (gameplay pos, immune to scale too) ──
        const targetPos = new THREE.Vector3(
            this.opponent.pos.x,
            this.opponent.pos.y + 1.0,  // mid-body height
            0
        );

        // Dynamic threshold: kick/special needs a bit more reach than jab
        const hitThreshold = isKick ? 2.0 : 1.7;
        const dist = attackPos.distanceTo(targetPos);
        
        const dx = Math.abs(this.opponent.pos.x - this.pos.x);
        const dy = Math.abs(this.opponent.pos.y - this.pos.y);
        const isProximityHit = (dx < 1.4 && dy < 2.0);

        if (dist < hitThreshold || isProximityHit) {
            this.opponent.takeDamage(damage, false);
            this.mana = Math.min(100, this.mana + (isMultiHit ? 2 : 12));
            this._updateUI();
            this.hitCooldown = isMultiHit ? 0.25 : 99.0;

            // ── Audio Impact ──
            // Play 'hit' for standard impact, and trigger 'combo' audio ONLY on successful hit
            this.playSound('hit');
            if (isMultiHit) {
                this.playSound('combo', 1.0);
            }

            // ── Knockback impulse on kick hits to prevent pass-through ──
            if (activeAction === this.actions['kick']) {
                // Push opponent away from attacker so they can't occupy the same space
                this.opponent.vel.x = dir * this.MOVE_SPEED * 1.8;
            }
        }
    }

    // ─── Per-frame update ─────────────────────────────────────────────────────
    update(dt) {
        if (!this._ready) return;
        
        // Capture side before updates
        if (this.opponent) {
            const dx = this.opponent.pos.x - this.pos.x;
            this.sideBefore = Math.sign(dx) || (this.isPlayerOne ? 1 : -1);
        }

        // Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt);
            if (!proj.active) this.projectiles.splice(i, 1);
        }

        if (this.isDead) {
            if (this.mixer) this.mixer.update(dt);
            return;
        }

        // Mana regen (update UI at most every 100 ms to avoid DOM thrash)
        this.mana = Math.min(100, this.mana + 1.5 * dt);
        this._uiTimer = (this._uiTimer || 0) + dt;
        if (this._uiTimer > 0.1) { this._updateUI(); this._uiTimer = 0; }

        // Visual effect for paralysis state (electric sparks)
        if (this.isParalyzed && !this.isDead) {
            if (Math.random() < 0.15) {
                this.spawnParalysisSparkVisual();
            }
        }

        // Cooldowns & timers
        if (this.hitCooldown > 0) this.hitCooldown -= dt;
        if (this.isAttacking || this.isHit) {
            const isGrappled = this.opponent && this.opponent.grabActive;
            if (isGrappled || this.isParalyzed) {
                this.attackTimer = 0; // Freeze attack timer during grapple or paralysis to prevent early reset
            } else {
                this.attackTimer += dt;
            }
            
            // Dynamically determine safety threshold from active action duration (adds 0.2s grace buffer)
            const act = this.currentAction;
            const clipDur = (act && act.getClip()) ? act.getClip().duration : 2.0;
            const threshold = Math.max(3.0, clipDur + 0.2); // minimum 3.0s backup safety
            
            if (this.attackTimer > threshold && !isGrappled && !this.isParalyzed) {
                this._resetState();
            }
            this._checkCombat();
        }

        const isGrappled = this.opponent && this.opponent.grabActive;

        // ── Input & Physics ───────────────────────────────────────────────────
        if (isGrappled) {
            this.vel.x = 0;
            this.vel.y = 0;
        } else {
            if (!this.grounded) {
                this.vel.y += this.GRAVITY * dt;
            } else {
                this.jumpsLeft = this.MAX_JUMPS;
            }
        }

        let desiredVelX = 0;
        let isMoving    = false;

        if (this.input && !this.isAttacking && !this.isHit && !this.isVictory) {
            if (this.input.keys.left)  { desiredVelX = -this.MOVE_SPEED; isMoving = true; }
            else if (this.input.keys.right) { desiredVelX = this.MOVE_SPEED; isMoving = true; }

            const jumpKey = this.input.keys.jump;
            if (jumpKey && !this._jumpPressed && this.jumpsLeft > 0) {
                this.vel.y      = this.JUMP_FORCE;
                this.grounded   = false;
                this.jumpsLeft--;
                this._jumpPressed = true;
                this.fadeTo('jump');
            }
            if (!jumpKey) this._jumpPressed = false;

            // Only allow attack inputs on ground
            if (this.grounded && this._actionsLoaded) {
                if (this.input.checkCombo(['right', 'punch', 'punch'])) {
                    this._startAttack('combo1');
                } else if (this.input.checkCombo(['down', 'kick'])) {
                    this._startAttack('combo2');
                } else if (this.input.keys.special && this.mana >= 50) {
                    this.mana -= 50;
                    this._startAttack('special');
                } else if (this.input.keys.magic && this.mana >= 100) {
                    this.mana -= 100;
                    this._startAttack('magic', -1.0); // extra time for long cast
                    setTimeout(() => {
                        if (this.isDead) return;
                        const sp = this.pos.clone();
                        sp.x += (this.isPlayerOne ? 1 : -1) * 0.5;
                        
                        this.spawnMagicProjectile(sp);
                    }, 1000);
                } else if (this.input.keys.punch) {
                    this._startAttack('punch');
                } else if (this.input.keys.kick) {
                    this._startAttack('kick');
                }
            }
        }

        const activeAction = this.currentAction;

        // ── Velocity integration (Frame-rate independent & Stable) ──
        const safeDt = Math.min(dt, 0.05); // Cap for extreme spikes
        
        if (isMoving && !this.isAttacking && !this.isHit) {
            // Use exponential decay for rock-solid stability regardless of frame rate
            const lerpFactor = 1 - Math.exp(-this.ACCEL * safeDt);
            this.vel.x += (desiredVelX - this.vel.x) * lerpFactor;
        } else if (this.isAttacking && activeAction === this.actions['special']) {
            if (this.grabActive) {
                this.vel.x = 0; // Stop forward movement once grab connects
            } else {
                this.vel.x = this.attackDirection * this.MOVE_SPEED * 1.15;
            }
        } else if (this.isAttacking && activeAction === this.actions['combo1']) {
            const burst = Math.max(0, 1.2 - this.attackTimer * 3.0);
            this.vel.x  = this.attackDirection * this.MOVE_SPEED * burst;
        } else if (this.isAttacking && activeAction === this.actions['combo2']) {
            const burst = Math.max(0, 1.7 - this.attackTimer * 1.3);
            this.vel.x  = this.attackDirection * this.MOVE_SPEED * burst;
        } else {
            // Stable friction
            const frictionFactor = 1 - Math.exp(-this.FRICTION * safeDt);
            this.vel.x -= this.vel.x * frictionFactor;
            if (Math.abs(this.vel.x) < 0.1) this.vel.x = 0;
        }

        if (!isGrappled) {
            this.pos.x += this.vel.x * safeDt;
            this.pos.y += this.vel.y * safeDt;

            // Ground clamp
            if (this.pos.y <= GROUND_Y) {
                this.pos.y = GROUND_Y;
                this.vel.y = 0;
                this.grounded = true;
            }

            // Arena walls
            if (this.pos.x < -ARENA_WALL) { this.pos.x = -ARENA_WALL; this.vel.x = 0; }
            if (this.pos.x >  ARENA_WALL) { this.pos.x =  ARENA_WALL; this.vel.x = 0; }
        }

        // ── Facing & movement animations (only when opponent ref exists) ──────
        if (this.opponent) {
            const dx          = this.opponent.pos.x - this.pos.x;
            const dirToOpp    = Math.sign(dx);
            const absDx       = Math.abs(dx);
            const vertDist    = Math.abs(this.pos.y - this.opponent.pos.y);

            // ── Physical blocker & Pushing Resolver ──
            // Prevent pass-through during all active gameplay states while enforcing kinetic pushing.
            const MIN_SEP = this.MIN_DIST;
            let overlap = MIN_SEP - absDx;
            
            // Check if they crossed sides compared to the start of the frame
            if (this.sideBefore && Math.sign(dx) !== this.sideBefore) {
                overlap = MIN_SEP + absDx;
            }
            
            const isGrappled = this.grabActive || (this.opponent && this.opponent.grabActive);

            // Identify which character is actively lunging to determine kinetic priority
            const lungingKeys = ['special', 'combo1', 'combo2'];
            const isThisLunging = this.isAttacking && lungingKeys.some(k => this.currentAction && this.currentAction === this.actions[k]);
            const isOppLunging = this.opponent.isAttacking && this.opponent.actions && lungingKeys.some(k => this.opponent.currentAction && this.opponent.currentAction === this.opponent.actions[k]);

            // Enforce hard collision boundary if lunging to guarantee push/drag effect, otherwise use 2.2m height threshold
            const heightCheck = (isThisLunging || isOppLunging) ? true : (vertDist < 2.2);

            if (overlap > 0 && heightCheck && !isGrappled) {
                let pushDir = this.sideBefore || (this.isPlayerOne ? 1 : -1);

                // ── Kinetic Split Resolver ──
                // If one character is blocked by a wall, the other takes 100% of the displacement.
                // Otherwise, split 50/50.
                const atWall = Math.abs(this.pos.x) >= ARENA_WALL - 0.01;
                const oppAtWall = Math.abs(this.opponent.pos.x) >= ARENA_WALL - 0.01;

                if (atWall && !oppAtWall) {
                    // This character is at wall, push opponent 100%
                    this.opponent.pos.x = Math.max(-ARENA_WALL, Math.min(ARENA_WALL, this.opponent.pos.x + pushDir * overlap));
                } else if (!atWall && oppAtWall) {
                    // Opponent is at wall, push this character 100%
                    this.pos.x = Math.max(-ARENA_WALL, Math.min(ARENA_WALL, this.pos.x - pushDir * overlap));
                } else if (isThisLunging && !isOppLunging) {
                    // Aggressor priority: ONLY for lunging attacks, not walking
                    const origOppX = this.opponent.pos.x;
                    this.opponent.pos.x = Math.max(-ARENA_WALL, Math.min(ARENA_WALL, this.opponent.pos.x + pushDir * overlap));
                    const realMove = Math.abs(this.opponent.pos.x - origOppX);
                    const remain = overlap - realMove;
                    if (remain > 0) this.pos.x -= pushDir * remain;
                } else {
                    // Normal 50/50 split (Total 1.0) to ensure absolute physical separation
                    const pushFactor = 0.5; 
                    this.pos.x -= pushDir * overlap * pushFactor;
                    this.opponent.pos.x += pushDir * overlap * pushFactor;
                }

                // Final safety clamp for both to guarantee stage integrity
                this.pos.x = Math.max(-ARENA_WALL, Math.min(ARENA_WALL, this.pos.x));
                this.opponent.pos.x = Math.max(-ARENA_WALL, Math.min(ARENA_WALL, this.opponent.pos.x));

                // Kill relative velocities driving into each other, except if lunging and not blocked by wall
                const isBlockedByWall = (oppAtWall && pushDir === Math.sign(this.vel.x)) || (atWall && pushDir === -Math.sign(this.vel.x));
                if ((!isThisLunging || isBlockedByWall) && Math.sign(this.vel.x) === pushDir) {
                    this.vel.x = 0;
                }
            }

            // ── Face opponent: snap when far, lerp when close ────────────────
            const targetRotY = (dirToOpp > 0) ? Math.PI / 2 : -Math.PI / 2;
            // Snap rotation when characters are far apart (avoids running-away glitch)
            const lerpSpeed  = absDx > 8 ? 1.0 : 12 * dt;
            this.model.rotation.y = THREE.MathUtils.lerp(this.model.rotation.y, targetRotY, lerpSpeed);

            // Movement animation transitions (only idle/run/back/jump – no entry)
            if (!this.isAttacking && !this.isHit && this._actionsLoaded) {
                if (!this.grounded) {
                    this.fadeTo('jump');
                } else if (Math.abs(this.vel.x) > 0.5) {
                    this.fadeTo(Math.sign(this.vel.x) === dirToOpp ? 'run' : 'back');
                } else {
                    this.fadeTo('idle');
                }
            }
        }

        // Apply final position
        this.model.position.set(this.pos.x, this.pos.y + this._footOffset, 0);
        if (this.mixer) this.mixer.update(dt);
    }

    _startAttack(animKey, timerOffset = 0) {
        if (!this.actions[animKey]) {
            console.warn(`[Character] Cannot start attack: action "${animKey}" not loaded/defined yet.`);
            return;
        }
        this.isAttacking     = true;
        this.attackTimer     = timerOffset;
        this.attackDirection = this.opponent
            ? Math.sign(this.opponent.pos.x - this.pos.x)
            : (this.isPlayerOne ? 1 : -1);

        // ── Audio Swing ──
        // Only play sound for Magic or Special attacks at the start.
        // Standard punch/kick sounds should only play on successful hit (checked in _checkCombat).
        if (animKey === 'magic' || animKey === 'special') {
            const soundKey = this.config.sounds[animKey];
            if (soundKey) this.playSound(animKey, 2.0);
        }

        // ── Skill Balancing Analytics ──
        // We log special, magic, combo1, combo2, punch, and kick.
        // Let's keep a hard max of 3 logs per skill per player per match to respect traffic limits.
        if (['special', 'magic', 'combo1', 'combo2'].includes(animKey)) {
            if (!this._skillTrackerUsage) this._skillTrackerUsage = {};
            if (!this._skillTrackerUsage[animKey]) this._skillTrackerUsage[animKey] = 0;
            
            if (this._skillTrackerUsage[animKey] < 3) {
                this._skillTrackerUsage[animKey]++;
                const skillData = {
                    character: this.config.name,
                    is_player: this.isPlayerOne,
                    skill: animKey
                };
                fetch(`/api/track?event=skill_used&data=${encodeURIComponent(JSON.stringify(skillData))}`).catch(() => {});
            }
        }

        this.fadeTo(animKey);
    }

    // ─── Subclass Hooks ───────────────────────────────────────────────────────
    
    // Called after all animations finish loading
    onAnimationsLoaded() {}

    // Spawn dynamic electrical sparks around the body when paralyzed
    spawnParalysisSparkVisual() {
        try {
            // Small flickering yellow electrical spark
            const sparkGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const sparkMat = new THREE.MeshBasicMaterial({
                color: 0xffff44, // Glowing electric yellow
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            const spark = new THREE.Mesh(sparkGeo, sparkMat);
            
            // Disperse randomly near the character's fallen model coordinates
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2.2, // width spread
                Math.random() * 0.6,        // height spread near floor
                (Math.random() - 0.5) * 0.6  // depth spread
            );
            spark.position.copy(this.pos).add(offset);
            spark.position.y = Math.max(-2.95, spark.position.y); // Ensure it stays slightly above the floor level
            
            this.scene.add(spark);
            
            let life = 0.25; // Short lifed electrical spark
            const sparkIntv = setInterval(() => {
                if (!this.scene || !spark) { clearInterval(sparkIntv); return; }
                life -= 0.05;
                
                // Scale up slightly and fade out
                spark.scale.setScalar(spark.scale.x * 1.25);
                sparkMat.opacity = Math.max(0, life / 0.25);
                
                // Jitter the position slightly to look like electric arc discharge
                spark.position.x += (Math.random() - 0.5) * 0.15;
                spark.position.y += (Math.random() - 0.5) * 0.15;
                
                if (life <= 0) {
                    this.scene.remove(spark);
                    sparkGeo.dispose();
                    sparkMat.dispose();
                    clearInterval(sparkIntv);
                }
            }, 40);
        } catch (e) { /* fail silently without affecting gameplay */ }
    }

    // Overridden by specific hero subclasses
    spawnMagicProjectile(startPos) {
        console.warn('spawnMagicProjectile called on base Character. No projectile spawned.');
    }
}
