/**
 * Module Game - Gère la logique d'état et les règles.
 */
const Game = {
    tours: [[], [], []], // État des 3 tours (tableaux de disques)
    nombreDeDisques: 4,  // Par défaut
    coups: 0,
    jeuTermine: false,
    historique: [], // Historique des coups pour l'annulation

    /**
     * Initialise l'état du jeu.
     * @param {number} n - Nombre de disques
     */
    initialiserJeu: function(n) {
        this.nombreDeDisques = n;
        this.coups = 0;
        this.jeuTermine = false;
        this.historique = []; // Réinitialiser l'historique
        
        // Réinitialiser les tours
        this.tours = [[], [], []];
        
        // Remplir la première tour (Disques de n à 1)
        // Exemple pour 3 disques : [3, 2, 1] où 1 est en haut
        for (let i = n; i >= 1; i--) {
            this.tours[0].push(i);
        }
    },

    /**
     * Vérifie si un déplacement est légal selon les règles.
     */
    deplacementValide: function(tourSource, tourDestination) {
        if (this.jeuTermine) return false;
        
        // Vérifier les indices des tours (0, 1, 2)
        if (tourSource < 0 || tourSource > 2 || tourDestination < 0 || tourDestination > 2) return false;
        
        const sourceStack = this.tours[tourSource];
        const destStack = this.tours[tourDestination];

        // Règle 1: Impossible de prendre d'une tour vide
        if (sourceStack.length === 0) return false;

        // Règle 2: Si destination vide, toujours ok
        if (destStack.length === 0) return true;

        // Règle 3: Disque source doit être plus petit que disque destination
        const disqueSource = sourceStack[sourceStack.length - 1]; // Top
        const disqueDest = destStack[destStack.length - 1];       // Top

        return disqueSource < disqueDest;
    },

    /**
     * Exécute le déplacement.
     * Retourne true si réussi, false sinon.
     */
    deplacerDisque: function(tourSource, tourDestination) {
        if (!this.deplacementValide(tourSource, tourDestination)) {
            return false;
        }

        // Effectuer le mouvement
        const disque = this.tours[tourSource].pop();
        this.tours[tourDestination].push(disque);
        
        // Enregistrer dans l'historique
        this.historique.push({
            source: tourSource,
            destination: tourDestination,
            disque: disque
        });
        
        this.coups++;
        return true;
    },

    /**
     * Vérifie si la tour 3 (index 2) contient tous les disques.
     */
    verifierVictoire: function() {
        // Si la dernière tour a tous les disques, c'est gagné
        // (La logique de jeu garantit qu'ils sont dans l'ordre s'ils sont empilés)
        if (this.tours[2].length === this.nombreDeDisques) {
            this.jeuTermine = true;
            return true;
        }
        return false;
    },

    /**
     * Annule le dernier coup.
     * Retourne true si l'annulation a réussi, false sinon.
     */
    annulerDernier: function() {
        if (this.historique.length === 0) {
            return false; // Aucun coup à annuler
        }

        // Récupérer le dernier coup
        const dernierCoup = this.historique.pop();

        // Inverser le mouvement
        this.tours[dernierCoup.destination].pop();
        this.tours[dernierCoup.source].push(dernierCoup.disque);

        // Diminuer le compteur de coups
        this.coups--;
        
        // Vérifier que le jeu n'est plus terminé
        this.jeuTermine = false;
        
        return true;
    }
};