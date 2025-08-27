// GameManager.js - Manages global game state and player data
class GameManager {
    constructor() {
        this.playerName = localStorage.getItem('among-us-player-name') || 'Player';
        this.language = localStorage.getItem('among-us-language') || 'en';
        this.gameSettings = {
            volume: localStorage.getItem('among-us-volume') || 0.7,
            fullscreen: false
        };
    }
    
    setPlayerName(name) {
        this.playerName = name;
        localStorage.setItem('among-us-player-name', name);
    }
    
    getPlayerName() {
        return this.playerName;
    }
    
    setLanguage(lang) {
        this.language = lang;
        localStorage.setItem('among-us-language', lang);
    }
    
    getLanguage() {
        return this.language;
    }
    
    getTranslation(key) {
        const translations = {
            en: {
                play: 'Play',
                local: 'Local',
                settings: 'Settings',
                playerName: 'Player Name',
                language: 'Language',
                back: 'Back',
                apply: 'Apply',
                localLobby: 'Local Lobby',
                start: 'Start Game'
            },
            tr: {
                play: 'Oyna',
                local: 'Yerel',
                settings: 'Ayarlar',
                playerName: 'Oyuncu Adı',
                language: 'Dil',
                back: 'Geri',
                apply: 'Uygula',
                localLobby: 'Yerel Lobi',
                start: 'Oyunu Başlat'
            }
        };
        
        return translations[this.language][key] || translations.en[key] || key;
    }
}

// Global game manager instance
window.gameManager = new GameManager();