# Message de reprise : chantier « Bouton Aide à jour » (2026-10-15)

À coller tel quel dans un autre compte Claude ouvert sur ce dossier. État détaillé : `docs/CHANTIER_AIDE_A_JOUR.md`.

```
/app Je reprends le chantier « remettre à jour le bouton Aide (ampoule) », commencé avec un autre compte Claude le 2026-10-15. Tout l'état est dans docs/CHANTIER_AIDE_A_JOUR.md : lis-le en entier avant de faire quoi que ce soit, puis vérifie avec git log (derniers commits : 02705e6c entrées manquantes, 1e0844e3 tri des orphelines, 1efc911b retrait de 5 entrées mortes, 61a3f6a8 essai anti-péremption).

Déjà fait et commité : tâches 1 (inventaire, scripts/parcours/inventaire_aide.js), 2 (aide ajoutée à candidater, creer-cv, comprendre-les-chiffres-intro, comprendre-les-chiffres + 5 fenêtres), 5 (5 entrées mortes retirées, validé par moi), 6 (parcours « aide » dans scripts/parcours/parcours_smoke.js, vert).

Reste à faire : tâches 3, 4 et 7 du plan, à traiter ENSEMBLE, module par module (le balayage automatique ne prouve pas qu'un sélecteur est mort : les sélecteurs n'apparaissent qu'après un clic ou une ouverture, il faut regarder dans le navigateur, dans l'état où l'ampoule est réellement utilisée).
- Tâche 3 : pour chaque page de AIDE_PAGES et chaque entrée de AIDE_FENETRES (js/app.js, vers la ligne 40136 et suivantes), ouvrir l'écran réel, cliquer sur l'ampoule (#btnAide), « Visite guidée », et vérifier que chaque étape trouve son élément. Réparer les sélecteurs morts, ou retirer l'étape avec une ligne de justification.
- Tâche 4 : relire chaque texte contre l'écran réel. Public fragile : ton simple et rassurant, français impeccable avec accents, jamais de tiret long, jamais le mot « IA » visible (dire « l'assistant »). Premiers à regarder : mon-territoire (le bouton #btnMonTerritoireCommencer est introuvable), reperes, coherence-transversale, resultats (visite guidée vide à l'ouverture), puis tout ce qui touche l'éditeur de CV (« Style rapide », « Mise en page », boutons de retour), « Un CV, plusieurs métiers » et les nouveaux modèles de CV. Si un texte promet une fonction qui a changé, me poser la question avant de l'écrire.
- Tâche 7 : npm test (doit rester vert, 1557 au dernier passage), parcours « aide » dans le navigateur intégré (await window.__parcours(['aide'])), et vérification clair / sombre / mobile des pages corrigées.

Règles : aucune étape d'aide existante supprimée sans mon accord écrit (zéro régression, retrait = ligne dédiée validée par moi). Un commit par sous-étape sur master, seulement mes fichiers, jamais de push. Mode B, effort moyen (monter en haut pour la relecture des textes). Mets à jour docs/CHANTIER_AIDE_A_JOUR.md (cases cochées + une ligne de bilan) avant de t'arrêter. Dis-moi en 8 lignes où tu en es avant de commencer.
```

Note : si le port 8123 est déjà pris, l'outil de prévisualisation démarre le serveur sur 8124 ; utiliser l'adresse qu'il indique.
