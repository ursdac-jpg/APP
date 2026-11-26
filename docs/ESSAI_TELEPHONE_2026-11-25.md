# Essai sur un vrai téléphone (lot 4 de l'audit téléphone)

Feuille d'essai préparée le 25/11/2026. Elle sert à Denis pour tester l'application sur son téléphone et à noter ce qui se passe. Chaque ligne est une question à laquelle répondre par « ça marche » ou « ça ne marche pas » (avec une phrase si possible).

## 1. Brancher le téléphone sur l'application du poste

1. Le téléphone et l'ordinateur doivent être sur **le même Wi-Fi**.
2. Le serveur de l'application tourne sur l'ordinateur (port 8124 pendant cette séance).
3. Sur le téléphone, ouvrir le navigateur et taper : `http://192.168.1.114:8124`
4. Si la page ne s'ouvre pas : le pare-feu de Windows bloque sans doute le réseau (il est classé « Public »). Dire à Claude « la page ne s'ouvre pas », une autre voie sera proposée.

Limite connue : les modules encore fermés au public (Bien utiliser l'IA, Ce qui compte pour moi, Mes compétences) ne sont visibles que sur l'ordinateur lui-même. Sur le téléphone ils renvoient à l'accueil. Leur affichage au téléphone a été vérifié par le balayage automatique, pas à la main.

## 2. À renseigner d'abord

- Marque et modèle du téléphone : ______
- Navigateur utilisé (Chrome, Safari, Samsung Internet, Firefox) : ______
- Mode sombre du téléphone activé ? ______

## 3. Les essais

**A. Lecture générale**
- L'accueil s'affiche sans bande blanche ni texte coupé sur les côtés.
- Les six cartes de l'accueil s'ouvrent au toucher.
- Le bouton retour et les flèches du haut se touchent sans erreur.

**B. Saisir et coller (le plus important)**
- Dans un module qui demande un texte, toucher la zone, écrire quelques mots : le clavier s'ouvre sans cacher la zone.
- Copier un texte dans une autre application, revenir, coller dans la zone : le texte arrive.
- Le bouton « Copier » du module met bien le texte dans le presse-papiers (le coller ailleurs pour vérifier).

**C. Aller chez l'assistant en ligne et revenir**
- Le bouton qui ouvre l'assistant en ligne ouvre un autre onglet ou une autre application.
- Au retour dans l'application, le travail est toujours là (pas de page rechargée à vide).

**D. Disquette, PDF, Word**
- La disquette enregistre un fichier : où le téléphone l'a-t-il rangé ? ______
- Rouvrir ce fichier dans l'application : il est bien relu.
- Un CV en PDF : le téléchargement se fait, le fichier s'ouvre et ressemble à l'aperçu.
- Un CV en Word : le téléchargement se fait.

**E. Régler le CV au doigt**
- Plein écran : le bouton « Agrandir » et le bouton « Outils » répondent.
- Déplacer un bloc avec le doigt : ça ne fait pas défiler la page à la place.
- Les poignées se saisissent sans viser trop précisément.

**F. Fenêtres et confort**
- Aucune fenêtre ne dépasse de l'écran ; la croix ou le bouton pour la fermer est atteignable.
- Tourner le téléphone en paysage : rien de cassé.
- Les textes se lisent sans zoom.

## 4. Après l'essai

Dire à Claude ce qui ne marche pas, dans l'ordre qui vient. Claude inscrit chaque défaut au registre (`docs/ERREURS_ET_BUGS.md`) et les corrige par groupes.
