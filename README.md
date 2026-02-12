# Jeu de la Tour de Hanoï

## Description du projet
Ce projet est une implémentation web du jeu classique "Tour de Hanoï", développée en HTML, CSS et JavaScript. Le jeu consiste à déplacer une pile de disques d'une tour à une autre en respectant des règles spécifiques.

## Règles du jeu
1. Le jeu comporte trois tours.
2. Au départ, tous les disques sont empilés sur la première tour, du plus grand (en bas) au plus petit (en haut).
3. Un seul disque peut être déplacé à la fois.
4. Un disque ne peut jamais être posé sur un disque plus petit.
5. L'objectif est de déplacer toute la pile de disques sur la troisième tour.

## Répartition du travail

### Étudiant 1 : Katia
- Développement de la logique du jeu (game.js)
  - Implémentation des fonctions initialiserJeu, deplacementValide, deplacerDisque, verifierVictoire
  - Algorithme de résolution automatique
  - Gestion de l'état du jeu
- Développement de l'interface utilisateur (ui.js)
  - Implémentation des fonctions afficherJeu, mettreAJourCompteurCoups, afficherMessage, lierEvenements
  - Gestion des événements utilisateur

### Étudiant 2 : Sawab
- Création de la structure HTML de base
- Développement du style CSS (style.css)
  - Design responsive et animations
  - Mise en page avec Chrome
- Rédaction du README.md

### Travail collaboratif
- Intégration et tests finaux
- Conception commune de l'architecture du projet
- Revue de code mutuelle
- Tests et débogage en binôme
- Améliorations itératives basées sur les retours

### Difficultés rencontrées
1. *Algorithme de résolution* : L'implémentation de l'algorithme récursif avec des délais pour la visualisation a été un défi technique.
2. *Gestion des animations* : Synchroniser les animations CSS avec les changements d'état du jeu a nécessité plusieurs ajustements.
3.  