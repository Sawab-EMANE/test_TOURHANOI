/**
 * Module UI - Gère le rendu HTML et les interactions visuelles.
 */
const video = document.getElementById("bgVideo");

video.pause(); // on empêche la lecture auto

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;

  const scrollPercent = scrollTop / maxScroll;

  const maxVideoTime = 5; // limite à 5 secondes
  video.currentTime = scrollPercent * maxVideoTime;
});

const UI = {
    domElements: {
        towers: document.querySelectorAll('.tower-container'),
        wrappers: document.querySelectorAll('.disks-wrapper'),
        moveCount: document.getElementById('move-count'),
        messageArea: document.getElementById('message-area'),
        restartBtn: document.getElementById('btn-restart'),
        undoBtn: document.getElementById('btn-undo'),
        timerDisplay: document.getElementById('timer'),
        playerName: document.getElementById('player-name'),
        diskCountInput: document.getElementById('disk-count'),
        diskCountDisplay: document.getElementById('disk-count-display'),
        difficultyLevel: document.getElementById('difficulty-level')
    },

    // Timer internal state
    _timerInterval: null,
    _elapsedSeconds: 0,

    /**
     * Démarre le timer (si pas déjà démarré)
     */
    startTimer: function() {
        if (this._timerInterval !== null) return; // déjà démarré
        this._timerInterval = setInterval(() => {
            this._elapsedSeconds++;
            this._updateTimerDisplay();
        }, 1000);
    },

    /**
     * Arrête le timer (sans réinitialiser)
     */
    stopTimer: function() {
        if (this._timerInterval !== null) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    },

    /**
     * Réinitialise le timer et l'affichage
     */
    resetTimer: function() {
        this.stopTimer();
        this._elapsedSeconds = 0;
        this._updateTimerDisplay();
    },

    _updateTimerDisplay: function() {
        const minutes = Math.floor(this._elapsedSeconds / 60).toString().padStart(2, '0');
        const seconds = (this._elapsedSeconds % 60).toString().padStart(2, '0');
        if (this.domElements.timerDisplay) {
            this.domElements.timerDisplay.textContent = `${minutes}:${seconds}`;
        }
    },

    /**
     * Retourne le temps écoulé en secondes
     */
    getElapsedSeconds: function() {
        return this._elapsedSeconds;
    },

    /**
     * Gestion du stockage des meilleurs scores
     */
    _storageKey: 'hanoi_scores',

    loadScores: function() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            // S'assurer que c'est un tableau
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    },

    saveScores: function(scores) {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify(scores));
        } catch (e) {
            // ignore
        }
    },
// Dans js/ui.js, à l'intérieur de l'objet UI = { ... }


    jouerAnimationVictoire: function(nombreCoups, callbackRejouer) {
        // 1. Lancer les confettis (Feu d'artifice)
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#bb0000', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#bb0000', '#ffffff']
            });
    
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        // 2. Afficher la belle Popup
        Swal.fire({
            title: 'Victoire ! 🏆',
            text: `Bravo ! Tu as réussi en ${nombreCoups} coups.`,
            icon: 'success',
            confirmButtonText: 'Rejouer',
            confirmButtonColor: '#27ae60',
            backdrop: `
                rgba(0,0,123,0.4)
                left top
                no-repeat
            `
        }).then((result) => {
            if (result.isConfirmed) {
                callbackRejouer(); // Relance le jeu quand on clique
            }
        });
    },

    /**
     * Sauvegarde un score (temps en secondes et coups) pour un nombre de disques donné
     */
    saveScore: function(diskCount, timeSeconds, moves, playerNameParam) {
        const scores = this.loadScores();
        
        // Nom du joueur : priorité au paramètre, sinon au champ DOM, sinon Anonyme
        const playerName = (playerNameParam && playerNameParam.trim()) || (this.domElements.playerName && this.domElements.playerName.value.trim()) || 'Anonyme';
        
        // S'assurer que scores est un tableau
        let scoresList = Array.isArray(scores) ? scores : [];
        
        // Ajouter le nouveau score
        scoresList.push({
            playerName: playerName,
            diskCount: diskCount,
            timeSeconds: timeSeconds,
            moves: moves,
            date: new Date().toLocaleString('fr-FR')
        });
        
        this.saveScores(scoresList);
        this.renderScoreboard(scoresList);
    },

    formatTime: function(seconds) {
        if (seconds == null) return '-';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    difficultyLabel: function(diskCount) {
        if (diskCount <= 4) return 'Facile';
        if (diskCount <= 6) return 'Intermédiaire';
        return 'Difficile';
    },

    /**
     * Rend le tableau des scores avec tous les scores sauvegardés
     */
    renderScoreboard: function(scores) {
        // Support multiple possible table selectors (id, bootstrap class, or generic in scoreboard)
        const tbody = document.querySelector('#score-table tbody')
            || document.querySelector('.scoreboard table tbody')
            || document.querySelector('table.table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        // S'assurer que scores est un tableau
        const scoresList = Array.isArray(scores) ? scores : [];
        
        // Afficher tous les scores dans l'ordre inverse (plus récents en haut)
        for (let i = scoresList.length - 1; i >= 0; i--) {
            const entry = scoresList[i];
            const row = document.createElement('tr');

            // Order: Name, Difficulty (niveau), Time, Moves
            const tdName = document.createElement('td'); tdName.textContent = entry.playerName || '-';
            const tdLevel = document.createElement('td'); tdLevel.textContent = this.difficultyLabel(entry.diskCount);
            const tdTime = document.createElement('td'); tdTime.textContent = entry.timeSeconds ? this.formatTime(entry.timeSeconds) : '-';
            const tdMoves = document.createElement('td'); tdMoves.textContent = entry.moves ? entry.moves : '-';

            row.appendChild(tdName);
            row.appendChild(tdLevel);
            row.appendChild(tdTime);
            row.appendChild(tdMoves);
            tbody.appendChild(row);
        }
    },

    /**
     * Initialise et affiche le scoreboard depuis le stockage
     */
    initScoreboard: function() {
        const scores = this.loadScores();
        this.renderScoreboard(scores);
    },

    /**
     * Met à jour l'affichage complet du jeu basé sur Game.tours
     */
    afficherJeu: function() {
        // Pour chaque tour
        Game.tours.forEach((tourData, index) => {
            const wrapper = this.domElements.wrappers[index];
            wrapper.innerHTML = ''; // Nettoyer l'affichage actuel

            // Pour chaque disque dans la tour
            tourData.forEach(tailleDisque => {
                const disqueDiv = document.createElement('div');
                disqueDiv.classList.add('disk');
                
                // Style dynamique
                // Largeur : min 40px, +20px par taille
                disqueDiv.style.width = `${40 + (tailleDisque * 25)}px`;
                // Couleur : variation de teinte (HSL) pour distinction visuelle
                disqueDiv.style.backgroundColor = `hsl(${200 + (tailleDisque * 25)}, 70%, 50%)`;
                
                wrapper.appendChild(disqueDiv);
            });
        });
    },

    mettreAJourCompteurCoups: function() {
        this.domElements.moveCount.textContent = Game.coups;
    },

    /**
     * Met à jour le niveau de difficulté affiché
     * @param {number} diskCount - Nombre de disques
     */
    mettreAJourNiveauDifficulte: function(diskCount) {
        let niveau = 'Facile';
        let levelClass = 'level-easy';
        if (diskCount <= 4) {
            niveau = 'Facile';
            levelClass = 'level-easy';
        } else if (diskCount <= 6) {
            niveau = 'Intermédiaire';
            levelClass = 'level-medium';
        } else {
            niveau = 'Difficile';
            levelClass = 'level-hard';
        }
        this.domElements.difficultyLevel.textContent = niveau;
        this.domElements.difficultyLevel.className = 'difficulty-level ' + levelClass;
        
        // Appliquer la même couleur au chiffre du nombre de disques
        this.domElements.diskCountDisplay.className = levelClass;
    },

    /**
     * Affiche un message temporaire ou fixe.
     * @param {string} msg - Le texte
     * @param {string} type - 'error', 'success', ou 'info'
     */
    afficherMessage: function(msg, type = 'info') {
        const area = this.domElements.messageArea;
        area.textContent = msg;
        area.className = `message ${type}`;
        area.classList.remove('hidden');

        // Si c'est une erreur, on l'efface après 2 secondes
        if (type === 'error') {
            setTimeout(() => {
                area.classList.add('hidden');
            }, 2000);
        }
    },

    /**
     * Gère la surbrillance de la tour sélectionnée.
     */
    highlightTower: function(index, isActive) {
        if (isActive) {
            this.domElements.towers[index].classList.add('selected');
        } else {
            this.domElements.towers.forEach(t => t.classList.remove('selected'));
        }
    },

    /**
     * Attache les événements (Callback fourni par Main.js)
     */
    lierEvenements: function(callbackClickTour, callbackRestart, callbackDifficultyChange, callbackUndo) {
        // Clics sur les tours
        this.domElements.towers.forEach(tower => {
            tower.addEventListener('click', () => {
                const towerId = parseInt(tower.getAttribute('data-id'));
                callbackClickTour(towerId);
            });
        });

        // Bouton restart
        this.domElements.restartBtn.addEventListener('click', callbackRestart);

        // Bouton undo
        this.domElements.undoBtn.addEventListener('click', callbackUndo);

        // Changement du sélecteur de difficulté
        this.domElements.diskCountInput.addEventListener('change', (e) => {
            const newCount = parseInt(e.target.value);
            this.domElements.diskCountDisplay.textContent = newCount;
            this.mettreAJourNiveauDifficulte(newCount);
            callbackDifficultyChange(newCount);
        });

        // Mise à jour du display en temps réel
        this.domElements.diskCountInput.addEventListener('input', (e) => {
            this.domElements.diskCountDisplay.textContent = e.target.value;
            this.mettreAJourNiveauDifficulte(parseInt(e.target.value));
        });
    }


};


