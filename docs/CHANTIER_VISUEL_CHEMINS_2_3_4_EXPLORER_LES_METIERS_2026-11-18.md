# Chantier : visuel des chemins 2, 3 et 4 d'« Explorer les métiers » (plan de code)

Créé le 18/11/2026. Consignes 476 (demande), 477 (tout à l'accent du site), 478 (facile en vert, difficile en ambre), 479 (maquette validée).
Cible visuelle à reproduire fidèlement (zéro régression FONCTIONNELLE, pas de repli sur l'ancien visuel) : `docs/MAQUETTE_CHEMINS_2_3_4_EXPLORER_LES_METIERS_2026-11-18.html` (+ `_AUTONOME`). Le CSS de la maquette (`scratchpad` de la séance, repris dans le fichier de la maquette, balise `<style>`) est le point de départ des classes du module.

Mode A. Effort : `[effort : moyen]` pour V1 à V4 (reprise de l'existant, mise en forme), `[effort : haut]` pour V5 seulement si un imprévu apparaît.

## Audit du code réel (fait le 18/11/2026)

- Tout ce qui est à remplacer est dans le module : `cmvBarreEtapes` (index.js:152) et la classe `.cml-etapes` (style.css:5879), `.cml-bandeau-choix` (style.css:5925) ne sont utilisés que par parActions.js, questionnaire.js et index.js. Grep fait sur tout le dépôt, rien ailleurs.
- La classe `.jeton` est une brique PARTAGÉE de toute l'application (plus de vingt endroits de js/app.js) : ne JAMAIS la modifier. Le jeton plein coché du chemin 2 reçoit une classe propre au module (`.cml-jt`).
- Le code compte déjà une ligne sans réponse comme « Je ne sais pas » (`_cmqPointsReponse`, logique.js:110 : zéro point, aucun point retiré). Seul le bouton « Continuer » du chemin 3 (questionnaire.js, vue `q-page`) est bloqué tant que les 10 lignes ne sont pas remplies : lever ce blocage ne change AUCUN calcul. Les tests `cmqPartieComplete` / `cmqNombreReponses` restent valables (fonctions conservées).
- Les icônes individuelles des catalogues contiennent des visages (enfant, personne âgée, soignant, enseignant) : non utilisées. Une icône objet par famille, rangée dans une table du module (clé = nom de la famille).
- Défaut trouvé : consigne de la page 2 « ouvrez-les une à une » alors que les familles sont toujours ouvertes (CMA_PAGES.actions2.consigne) : à corriger dans V1.

## Ce qui est simple / risqué / bloquant

- **Simple** : fil des parties, bandeau, familles à bord d'accent, jauge, plateau, pastilles facile/difficile, numéros, bandeau « Avant de commencer », bilan de fin de partie, rubriques du chemin 4, sommaire, onglets de familles (tout est de la mise en forme et de l'état d'écran, calculs inchangés).
- **Un peu risqué** : (a) le filtre « surtout saisonniers / toute l'année » et les onglets du chemin 4 ajoutent de l'état dans `cmvEtat()` (clés `cmrFiltre`, `cmrFamille`) : à ranger dans l'état initial et à NE PAS inclure dans la disquette ; (b) le re-rendu complet après chaque clic fait perdre la position de défilement : à conserver explicitement (la maquette le fait) ; (c) le composant graphique partagé « Comprendre les chiffres » est réinséré par `_cmrRemplir` : ne pas casser ce câblage.
- **Bloquant** : aucun.

## Tâches (une tâche = un commit, `npm test` + test navigateur avant la suivante)

- [x] V0. (fait le 18/11/2026) Fondations : classes CSS du module (`.cml-fil`, `.cml-bandeau`, `.cml-suivi`, `.cml-famille`, `.cml-jt`, `.cml-pill-fd`), uniquement avec `--accent`, `--accent-bg-subtle`, `--accent-solide` et les jetons de succès / alerte (valeurs sombres déjà fournies par ces jetons) ; remplacer `cmvBarreEtapes` par `cmvFilParties(noms, courant, cibles)` ; lister le fil dans BRIQUES_COMMUNES.md. Test : les quatre accents + sombre + daltonien.
- [x] V1. (fait le 18/11/2026) Chemin 2, pages 1 à 3 : fil, bandeau de page, compteur + jauge, plateau « Vos choix » (croix), familles à icône objet, jeton plein coché, message du maximum, consigne de la page 2 corrigée.
- [x] V2. (fait le 18/11/2026) Chemin 2, page 4 et résultats : boutons Facile / Difficile aux jetons de succès et d'alerte, compteur « n choix : x faciles, y difficiles » en pastilles, ligne « Mes conditions » des résultats, lignes « Vos choix » numérotées avec « Modifier », trois lignes « Pourquoi ce métier » avec icônes.
- [x] V3. (fait le 18/11/2026) Chemin 3 : écran « Avant de commencer » (avant la partie 1, trois rassurances, quatre parties avec leur nombre d'énoncés réel, aucune durée annoncée), ouverture de partie, numéro de chaque énoncé (position dans l'ordre mélangé), ligne répondue colorée, segments d'avancement, bouton « Continuer » toujours possible avec phrase sur les lignes vides, bilan de fin de partie. Le résultat reste tel quel.
- [x] V4. (fait le 18/11/2026) Chemin 4 : en-tête (département à deux boutons, trois chiffres calculés avec les vraies données, source et « minimums »), sommaire à cinq boutons, rubriques à bandeau d'accent et icône, filtre et mini-barre de part saisonnière dans la liste, onglets de familles saisonnières. Composants partagés (graphiques, formulaire d'offres, enseignes) inchangés.
- [x] V5. (fait le 18/11/2026) Vérification complète : `npm test`, `node scripts/checkLexique.js`, test navigateur des trois chemins (ordinateur, téléphone, clair, sombre, six accents, daltonien), JOURNAL_DES_CHANGEMENTS (une ligne, même commit que la dernière tâche), BRIQUES_COMMUNES, passation dans ETAT_DES_CHANTIERS. Pas de ligne `data/nouveautes.js` : module encore fermé au public.
- [ ] V6 (ensuite, ordre de Denis, consigne 475; les six vidéos du module sont faites le 19/11/2026, consigne 484, voir `docs/PLAN_RESTE_A_FAIRE_EXPLORER_LES_METIERS_2026-11-19.md`) : vidéo d'introduction, page de présentation, infobulle de la carte, aide guidée, fonction disquette, recherche ; puis vidéos ; puis ouverture au public.

## Rappel : le code de « Ma synthèse » (étape A du plan `CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md`) reste en attente de décision de Denis.
