
// État local de l'interface (sélection en cours)
let selectionSource = null; // null ou index de la tour (0, 1, 2)

/**
 * Fonction appelée au chargement.
 */
function initApp() {
    // 1. Initialiser le modèle
    Game.initialiserJeu(4); // On commence avec 4 disques

    // 2. Initialiser la vue
    UI.afficherJeu();
    UI.mettreAJourCompteurCoups();
    UI.mettreAJourNiveauDifficulte(4);
    UI.initScoreboard();

    // 3. Connecter les événements via UI
    UI.lierEvenements(gererClicTour, recommencerPartie, changerDifficulte, annulerDernier);
}

/**
 * Logique du clic sur une tour :
 * - Si aucune tour sélectionnée : on sélectionne la source.
 * - Si source déjà sélectionnée : on tente le déplacement vers la destination.
 */
function gererClicTour(tourIndex) {
    // Si la partie est finie, on ignore
    if (Game.jeuTermine) return;

    // CAS 1 : Aucune sélection en cours -> Sélectionner la source
    if (selectionSource === null) {
        // On ne peut pas sélectionner une tour vide
        if (Game.tours[tourIndex].length === 0) {
            UI.afficherMessage("Cette tour est vide !", "error");
            return;
        }
        
        selectionSource = tourIndex;
        UI.highlightTower(tourIndex, true);
        UI.afficherMessage("Sélectionnez la tour de destination...", "info");
    } 
    
    // CAS 2 : Source déjà sélectionnée -> Tenter le déplacement
    else {
        // Si on clique sur la même tour, on annule la sélection
        if (selectionSource === tourIndex) {
            selectionSource = null;
            UI.highlightTower(0, false); // Tout désélectionner
            UI.afficherMessage("Sélection annulée.", "info");
            return;
        }

        // Tenter le mouvement dans le moteur de jeu
        const succes = Game.deplacerDisque(selectionSource, tourIndex);

        if (succes) {
            // Démarrer le timer si c'est le premier coup
            if (Game.coups === 1) {
                UI.startTimer();
            }
            // Mettre à jour l'interface
            UI.afficherJeu();
            UI.mettreAJourCompteurCoups();
            UI.afficherMessage("", "hidden"); // Cacher message
            
            // Vérifier victoire
            if (Game.verifierVictoire()) {
                // Arrêter le timer à la victoire
                UI.stopTimer();
                // Sauvegarder le score
                const diskCount = Game.nombreDeDisques;
                const timeSeconds = UI.getElapsedSeconds();
                const moves = Game.coups;
                const playerName = (UI.domElements.playerName && UI.domElements.playerName.value.trim()) || 'Anonyme';
                UI.saveScore(diskCount, timeSeconds, moves, playerName);
                UI.afficherMessage(`Bravo ! Victoire en ${Game.coups} coups !`, "success");
            }
        } else {
            UI.afficherMessage("Déplacement impossible ! Respectez les règles.", "error");
        }

        // Réinitialiser la sélection
        selectionSource = null;
        UI.highlightTower(0, false);
    }
}

/**
 * Redémarrage du jeu
 */
function recommencerPartie() {
    selectionSource = null;
    UI.highlightTower(0, false);
    UI.afficherMessage("", "hidden");
    
    const nombreDisques = parseInt(UI.domElements.diskCountInput.value);
    Game.initialiserJeu(nombreDisques);
    UI.afficherJeu();
    UI.mettreAJourCompteurCoups();
    UI.resetTimer();
}

/**
 * Changement de difficulté
 */
function changerDifficulte(nombreDisques) {
    recommencerPartie();
}

/**
 * Annule le dernier coup
 */
function annulerDernier() {
    // Si la partie est finie, on permet quand même l'annulation
    const succes = Game.annulerDernier();
    
    if (succes) {
        UI.afficherJeu();
        UI.mettreAJourCompteurCoups();
        UI.afficherMessage("Coup annulé", "info");
        // Si plus aucun coup, réinitialiser le timer
        if (Game.coups === 0) {
            UI.resetTimer();
        }
    } else {
        UI.afficherMessage("Aucun coup à annuler", "error");
    }
    
    // Réinitialiser la sélection
    selectionSource = null;
    UI.highlightTower(0, false);
}

function gererVictoire() {
    // 1. Lancer les confettis
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    // 2. Afficher la pop up lors de la victoire
    Swal.fire({
        title: 'Victoire ! 🎉',
        text: `Vous avez gagné en ${Game.coups} coups !`,
        icon: 'success',
        confirmButtonText: 'Rejouer',
        background: '#fff url(/images/trees.png)', // Fond personnalisé possible
        backdrop: `
            rgba(0,0,123,0.4)
            left top
            no-repeat
        `
    }).then((result) => {
        if (result.isConfirmed) {
            Game.initialiserJeu();
        }
    });
}




// Lancement au chargement du DOM
document.addEventListener('DOMContentLoaded', initApp);