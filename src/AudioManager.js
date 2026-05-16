export class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.theme = 'default';
        this.isArena = false;
        this.lastPlayed = null;
        
        // Configuration for themes
        this.config = {
            default: {
                non_game: ['Front_end_contents/video_animation_sound.mp3'],
                arena: ['Assets/sound/theme_and_arena/arena_1_lunar.mp3']
            },
            indian: {
                non_game: ['Assets/arena_theme/indian/non_game_music.mp3'],
                arena: [
                    'Assets/arena_theme/indian/Indian_arena_sound/Indian_arena_sound_1.mp3',
                    'Assets/arena_theme/indian/Indian_arena_sound/Indian_arena_sound_2.mp3'
                ]
            },
            chinese: {
                non_game: [
                    'Assets/arena_theme/chineese/non_game_music_1.mp3',
                    'Assets/arena_theme/chineese/non_game_music_2.mp3'
                ],
                arena: [
                    'Assets/arena_theme/chineese/chineese_arena_music/chineese_arena_music_1.mp3',
                    'Assets/arena_theme/chineese/chineese_arena_music/chineese_arena_music_2.mp3',
                    'Assets/arena_theme/chineese/chineese_arena_music/chineese_arena_music_3.mp3'
                ]
            }
        };
    }

    setTheme(theme) {
        this.theme = theme;
    }

    playMenuMusic() {
        this.isArena = false;
        this._playRandomFromPool(this.config[this.theme].non_game);
    }

    playArenaMusic() {
        this.isArena = true;
        this._fadeAndPlayNext();
    }

    _fadeAndPlayNext() {
        const pool = this.isArena ? this.config[this.theme].arena : this.config[this.theme].non_game;
        if (!pool || pool.length === 0) return;

        if (this.currentAudio) {
            const oldAudio = this.currentAudio;
            let vol = oldAudio.volume;
            const fadeOut = setInterval(() => {
                vol -= 0.05;
                if (vol <= 0) {
                    oldAudio.pause();
                    oldAudio.currentTime = 0;
                    clearInterval(fadeOut);
                } else {
                    oldAudio.volume = vol;
                }
            }, 50);
        }

        this._playRandomFromPool(pool);
    }

    _playRandomFromPool(pool) {
        if (!pool || pool.length === 0) return;

        let track;
        if (pool.length === 1) {
            track = pool[0];
        } else {
            const filtered = pool.filter(t => t !== this.lastPlayed);
            track = filtered[Math.floor(Math.random() * filtered.length)];
        }

        this.lastPlayed = track;
        
        const audio = new Audio(track);
        audio.volume = 0;
        audio.loop = false; // We'll handle looping manually to allow randomization
        
        audio.onended = () => {
            this._playRandomFromPool(this.isArena ? this.config[this.theme].arena : this.config[this.theme].non_game);
        };

        audio.play().then(() => {
            let vol = 0;
            const fadeIn = setInterval(() => {
                vol += 0.05;
                if (vol >= 0.8) {
                    audio.volume = 0.8;
                    clearInterval(fadeIn);
                } else {
                    audio.volume = vol;
                }
            }, 50);
        }).catch(e => console.warn("Audio play failed:", e));

        this.currentAudio = audio;
    }

    stopAll() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }

    fadeToSilence() {
        if (this.currentAudio) {
            const oldAudio = this.currentAudio;
            let vol = oldAudio.volume;
            const fadeOut = setInterval(() => {
                vol -= 0.05;
                if (vol <= 0) {
                    oldAudio.pause();
                    clearInterval(fadeOut);
                    if (this.currentAudio === oldAudio) {
                        this.currentAudio = null;
                    }
                } else {
                    oldAudio.volume = vol;
                }
            }, 50);
        }
    }
}
