# Plan de corrections transversales - ouvert le 2026-09-26

> Fichier de suivi vivant (pas un chantier daté figé) : cocher au fur et à mesure, mettre à jour `docs/ETAT_DES_CHANTIERS.md` Partie 0 quand ce plan démarre en exécution pour de bon.
> **Contexte** : pendant que l'autre compte Claude travaille sur `docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md` (mise en page CV, PDF/Word), ce fichier suit tout ce que Denis a signalé de son côté sur cette fenêtre-ci (14 points de départ, largement enrichis en cours de route). Écrit spécifiquement pour survivre à une compression de conversation - toujours relire cette page en entier après un compactage, avant de continuer, avec `CLAUDE.md` et `docs/TRAVAILLER_AVEC_DENIS.md`.
> **Coordination Git avec l'autre compte** : les deux comptes travaillent dans le MÊME dépôt local. Un commit simultané des deux côtés a déjà corrompu l'index Git (`.git/index`) à deux reprises le 2026-09-26 (symptôme : `git status` montre soudain des centaines de fichiers "supprimés", ou `git commit` embarque un fichier de l'autre compte). **Aucune perte réelle de fichier dans les deux cas** - uniquement l'index (zone de préparation du commit), jamais le contenu sur disque. Réparation sûre et déjà éprouvée : `git reset` (sans option, sans chemin) - ne touche QUE l'index, jamais les fichiers du disque, jamais destructif. Toujours vérifier avec `git status --short` juste avant de committer, et ne jamais committer si l'autre compte vient de committer au même moment (attendre quelques secondes et revérifier).

## État exact du dépôt à la dernière vérification (2026-09-27, matin)

`git log --oneline -3` : `3389b0c` (A6 terminé + restauration, détail plus bas) → `4f40d16` (autre compte, Word phase 8) → `28a2b4c` (autre compte).

**A6 est maintenant terminé et commité** (`3389b0c`) : le clic sur la croix d'une pilule détectée retire la valeur du texte et re-rend les pastilles restantes. Vérifié en navigateur (harnais isolé avec les vraies fonctions `htmlVerificationDocument`/`cablerVerificationDocument`, 3 détections retirées une à une). `npm test` : 1018 verts.

**Incident Git du 2026-09-27 matin, à connaître avant tout commit** : un commit de l'autre compte (`8b2bc0c`, la nuit du 26 au 27) avait silencieusement **annulé dans son arbre** (jamais sur le disque) 3 choses déjà commitées la veille : le correctif `.jeton` (`css/style.css`), le début de l'A6 (`data/metiers.js`) et ce fichier réécrit avant compactage - probablement le même mécanisme de corruption d'index déjà documenté ci-dessus (commit concurrent). Puis, en recommitant ces 3 fichiers restaurés + la maquette OCR ce matin, un **nouvel incident plus sévère** s'est produit : le commit a embarqué ~839 suppressions (tout le dépôt sauf les 4 fichiers explicitement `git add`-és), parce que l'autre compte committait au même instant (son commit `4f40d16` a fait avancer HEAD pendant que l'index de ce commit-ci était construit). **Aucune perte réelle sur disque dans les deux cas** - uniquement l'arbre Git. Réparé par `git reset 4f40d16` (reset mixte vers le dernier commit sain de l'autre compte, jamais `--hard`, jamais touché aux fichiers du disque), puis nouveau `git add` ciblé + commit, avec `git status --short` vérifié propre juste avant. **Leçon pour la suite** : même après un `git status --short` propre, un commit peut encore intercepter un commit concurrent de l'autre compte en plein vol - toujours relire le `git show --stat` du commit qui vient d'être fait avant de passer à autre chose, pas seulement avant de committer.

**Confirmation complète faite avec Denis le 2026-09-27 (après-midi)** : Paquet A (A1/A2/A5/A6), D, E, F, Point 13 (résolu par l'autre compte, vérifié), Paquet B (7 écrans) et Paquet C (jetons, boutons, pulse, numéros/titres, texte général, contraste Candidature) sont **tous faits, testés en navigateur et confirmés par Denis**. Détail des commits dans les sections dédiées plus bas.

**Reste ouvert, dans cet ordre (décidé par Denis)** :
1. **Chantier OCR** (ci-dessous) - pas commencé, prochaine étape.
2. A6, point secondaire : degré de certitude nom/prénom détecté via l'e-mail (`sophie.martin@...` certain vs `jj24@...` incertain) - mineur.
3. ~12 boutons `btn-link` (rendus comme des liens de texte cliquables) repérés en passant ailleurs dans l'app, jamais corrigés - liste à refaire au moment de s'y mettre.

**Chantier Word/PDF de l'autre compte (2026-09-27, pour information, aucune action de notre côté)** : Word depuis le PDF (25 modèles A4) + Mini CV A5 branchés et fonctionnels, écran unique Word/PDF en place, un bug bloquant (décor dupliqué dans l'en-tête) trouvé et corrigé. Reste chez eux : un défaut "Remplir la page" en Paysage (2 pages Word au lieu d'1), verification du declenchement reel par le bouton Telecharger, alignement de la fenetre Atelier CV, validation de Denis, LibreOffice jamais teste, nettoyage de code mort. Detail dans leur `docs/ETAT_DES_CHANTIERS.md`.

---

## Commits déjà faits cette session (dans l'ordre)

1. `ca2cb24` - A2 : `recommencer()` réinitialise aussi Comparer mes pistes/ATS/Regard extérieur.
2. `68d955c` - A1 : les 4 fonctions `*Recommencer()` de Mes documents vident vraiment `dossier` (nouvelle fonction partagée `viderContenuCVDossier()`, js/app.js) + correctif `_prepLEMode` (défaut `null` au lieu de `'pret'`, qui faussait la détection de « premier passage »).
3. `bafe63c` puis un commit suivant - A5 : la relecture (surlignage jaune) s'ouvre automatiquement après dépôt/collage du texte, sur Préparer ma lettre et mon entretien/Mettre à jour/Reformuler ET Co-construire ma lettre.
4. `086e598` - Point 11 : question « J'accepte également » (emploi alimentaire/saisonnier) retirée du bloc « Le poste que vous recherchez ».
5. `8ff168f` - Paquet D : le domaine en saisie libre a le même comportement que le métier (Entrée valide tel quel si pas de correspondance) + bouton « Voir tous les domaines (21) ».
6. `0fe72d4` - Paquet F (sous-points 1 et 3) : `prompts/lettre-co.md` ne redemande plus le registre déjà choisi, et invite « Voulez-vous des suggestions ? » à chaque question.
7. `0f9a0df` - Paquet C (1re passe) : cartes objectif redessinées (icône dans un rond, titre agrandi, centré - voir `.carte-objectif` dans `css/style.css`) + agrandissement des jetons (`.jeton`, `jetonRadioMode()` perd `jeton--compact`).
8. `d9a26c5` - Paquet C (2e passe, après retour de Denis « c'est trop massif, il faut que ça tienne sur une ligne ») : `contenuPastillesChamp()` (Type de contrat, Temps de travail) et `blocDisponibilite()` passent en taille pleine `.jeton` (au lieu du modificateur `.jeton--grand` essayé puis retiré, jugé trop gros) - même taille que le bloc Candidature.
9. `5ef94c2` - Paquet C : correctif de sens du `clamp()` responsive des jetons (annulé par erreur puis restauré, voir incident Git ci-dessus).
10. `43075cf` - A6 (partiel) : pilules avec croix, clic pas encore câblé (annulé par erreur puis restauré, voir incident Git ci-dessus).
11. `ac1440e` - Sauvegarde complète avant compactage + maquette écran de clarification OCR (annulé par erreur puis restauré, voir incident Git ci-dessus).
12. `3389b0c` - A6 terminé (câblage du clic sur les croix) + restauration des 3 éléments ci-dessus après l'incident Git du 2026-09-27 matin.

`npm test` restait vert (983 → 1018 selon les ajouts de l'autre compte en parallèle) à chaque étape.

---

## CHANTIER MAJEUR EN COURS : dépôt de CV par image → OCR (remplace le correctif A3/A4 initialement prévu)

**Point de départ** : Denis a montré, captures d'écran à l'appui, une vraie boucle infernale sur le dépôt d'image (voir le détail ci-dessous). L'investigation a mené à un changement de cap bien plus large que le bug initial.

### Cause racine du bug A3/A4, confirmée avec certitude

Fonction partagée `obtenirOuDeposerTexteCV()` (`data/metiers.js` ~3669), utilisée par « Préparer ma lettre et mon entretien », « Mettre à jour mon CV », « Co-construire ma lettre », le Bilan :

```js
function obtenirOuDeposerTexteCV(callback) {
  if (cvDisponible()) { callback({ texte: texteProfilEffectif('cv'), dejaRelu: false }); return; }
  ouvrirAssistantDepotCV(dossier.modeCreation || 'maj', {
    onDocumentPrepare: function (resultat) {
      callback(resultat.type === 'texte' ? { texte: resultat.valeur, dejaRelu: true } : { texte: null, dejaRelu: false });
    }
  });
}
```

Chaque appelant (ex. `btnPrepLEDeposerCv`, `data/metiers.js` ~7070) fait ensuite :
```js
obtenirOuDeposerTexteCV(function (r) {
  if (!r || r.texte === null) {
    ouvrirAssistantDepotCV('pret');   // <-- BUG : rouvre une 2e fenêtre, neuve, SANS callback
    return;
  }
  ...
});
```

**Le mécanisme** : la 1re fenêtre (légère, avec callback) sert juste à détecter « c'est une image, pas du texte ». Dès que la personne clique Continuer après avoir masqué son image, la 1re fenêtre **se ferme immédiatement** (`onDocumentPrepare` déclenché) et renvoie `{texte: null}` - ce qui fait rouvrir une **2e fenêtre entièrement neuve**, à zéro, pour refaire tout le travail de dépôt + masquage une seconde fois avant d'atteindre enfin le choix de l'assistant. Commentaire du code : « comportement d'origine, jamais modifié » - ce n'est donc pas une régression récente, une mécanique jamais retravaillée depuis la conception initiale.

C'est exactement ce que Denis a vécu (captures d'écran à l'appui) : dépôt → rectangle → Enregistrer → Continuer → retour à une page de dépôt VIDE, donnant l'impression d'une boucle sans fin. Confirmé transversal à tous les modules utilisant `obtenirOuDeposerTexteCV`/`ouvrirAssistantDepotCV`.

**Fenêtre modale surprise** : Denis a aussi demandé « c'est quoi cette fenêtre, je ne suis pas censé en avoir » en voyant l'étape « Choisissez votre assistant » en popup. Explication trouvée dans `docs/CHANTIER_ELIMINATION_FENETRES_DEPOT_CV.md` (chantier du 2026-09-04, déjà terminé pour le texte) : cette popup est le reliquat de l'ANCIEN wizard modal intégral, volontairement gardé UNIQUEMENT comme repli pour les photos/scans (jugé à l'époque « techniquement inévitable ») - mais personne n'avait remarqué que ce repli duplique le travail de dépôt déjà fait dans la 1re fenêtre légère.

### Décision de Denis : ne plus corriger, mais changer d'approche (2026-09-26, en cours de session)

Plutôt que de patcher la double-fenêtre en gardant le masquage par rectangles, Denis a proposé - après un test OCR concluant - de **remplacer l'image par une extraction de texte (OCR)** pour la plupart des modules, avec un filet de sécurité pour les passages mal reconnus.

**Tests OCR faits (lecture seule, aucun code applicatif touché, librairie Tesseract.js via CDN, jamais intégrée à l'app pour l'instant)** :
1. CV à une seule colonne (texte généré en HTML/CSS, rendu via `html2canvas`, reconnu via `Tesseract.recognize(canvas, 'fra')`) : **quasi parfait**. Tout le texte (accroche, compétences, expériences, dates, coordonnées) restitué avec les accents corrects. Seuls défauts : puces (•) mal lues (`*`/`»`), une casse ratée (« S.S.T » → « s.s.T »).
2. CV à deux colonnes (photo/coordonnées à gauche, expérience à droite, comme le vrai CV de Denis) : **du bruit, mais pas d'inversion de faits**. Les étiquettes de la colonne de gauche (LANGUES, LOGICIELS...) s'intercalent au milieu du texte de droite, MAIS les dates restent bien associées au bon poste dans les 2 cas testés. Un seul fragment (2 compétences fusionnées) est devenu illisible (« cr és » au lieu de « Encadrement d'équipe » et « Relation client ») - **perte silencieuse d'info**, pas une erreur inventée.
3. **Test de reconstruction** : Claude a reconstruit correctement la quasi-totalité du CV brouillé du test 2 à partir du seul texte OCR, sans avoir vu l'original - confirme qu'un assistant peut recomposer intelligemment un texte OCR en désordre. Seul le fragment illisible reste irrécupérable.

**Conclusion actée avec Denis** : le risque réel n'est pas l'inversion de faits (un bon prompt + la capacité de raisonnement de l'assistant absorbent le désordre), mais la **perte silencieuse d'un fragment illisible**. D'où le filet de sécurité ci-dessous.

### Plan validé par Denis pour ce chantier (à coder dès que Git est libre)

1. **Corriger la double fenêtre** : la fenêtre de dépôt déjà ouverte doit aller jusqu'au bout elle-même (choix de l'assistant, import de la réponse) au lieu de se refermer pour en rouvrir une 2e à zéro.
2. **Remplacer le masquage par rectangles par une extraction OCR** (Tesseract.js, à intégrer - nouvelle dépendance) pour les modules concernés (liste ci-dessous). Le texte extrait amène la personne sur **le même écran de relecture texte** que pour un CV collé (surlignage jaune + pilules de coordonnées détectées).
3. **A6 (croix sur les pilules, en cours - voir en tête de fichier)** devient donc encore plus utile : c'est l'écran où la personne nettoie le texte OCR, image ou pas.
4. **Renforcer le prompt d'extraction** (`prompts/cv.md` et/ou `extraction-cv.md`, à identifier précisément selon le module) : préciser explicitement que le texte peut venir d'une extraction OCR d'image, potentiellement en désordre ou coupé - reconstruire la structure logique intelligemment, et **signaler clairement tout passage réellement incompréhensible plutôt que de l'ignorer ou d'inventer**. **Précision de Denis (2026-09-27)** : le signal ne se limite pas aux seuls fragments OCR illisibles - couvre aussi les **incohérences majeures** que l'assistant repère lui-même en relisant sa propre extraction (ex. dates contradictoires, doublon manifeste, champ clé manquant) - dans les deux cas, même mécanisme (`pointsAVerifier`), même écran de clarification ci-dessous.
5. **Nouvel écran de clarification (maquette faite, voir plus bas)** : si l'assistant signale des manquements ou incohérences majeures dans sa réponse au 1er passage (nouveau champ JSON à ajouter, ex. `pointsAVerifier: ["...", "..."]`), l'application affiche ces points comme de simples questions **directement dans l'app**, une seule fois, sans jamais repasser par l'assistant externe (**décision explicite de Denis** : minimiser les allers-retours, option retenue plutôt que rouvrir une conversation avec l'assistant). Les réponses de la personne viennent compléter/corriger le dossier importé. **Reste à créer** : la rubrique qui porte ces questions à l'écran (au-delà de la maquette statique) - construction des blocs à partir du tableau `pointsAVerifier` réellement renvoyé par l'assistant, une fois le prompt (point 4) renforcé.

**Exception actée, à ne jamais toucher** : **« Un regard sur mon CV »** garde l'image réelle + masquage par rectangles + glisser le fichier dans la fenêtre de l'assistant, **sans aucun changement**. Raison de Denis : ce module analyse la mise en page et les couleurs du CV, il a besoin de la vraie image, pas d'un texte. Ce module a déjà sa propre implémentation séparée (`modules/regard-recruteur/index.js`, jamais partagée avec `ouvrirAssistantDepotCV`/`obtenirOuDeposerTexteCV`) - aucun risque de le toucher par erreur en travaillant sur les autres modules. Denis juge aussi que ce module est peu utilisé, donc pas prioritaire de toute façon.

**Modules concernés par le passage à l'OCR** (tous ceux qui utilisent `obtenirOuDeposerTexteCV`/`ouvrirAssistantDepotCV` pour un CV) : Créer un nouveau CV, Préparer ma lettre et mon entretien, Mettre à jour mon CV, Reformuler et présenter mon CV, Co-construire ma lettre de motivation, Préparer un entretien, Analyser ma candidature (Bilan).

**Maquette de l'écran de clarification : faite**, `docs/MAQUETTE_ECRAN_CLARIFICATION_OCR_2026-09-27.html` (fichier local, jamais commité - non suivi par Git). 2 versions : la 1re, refusée par Denis (« pas cohérent avec le reste de l'app », et un lien texte cliquable au lieu d'un bouton - jamais toléré, LECONS 9.6). La 2e version reprend telles quelles les classes réelles de `css/style.css` (`.bloc-depli`, `.preparer-num`, `.preparer-titre`, `.pilule-etat`, `.carte-preparer-ok`) et de vrais boutons Bootstrap (`btn btn-outline-secondary btn-sm` pour « passer », jamais de lien) - envoyée à Denis, **réponse pas encore reçue** au moment de la compression de session.
**3 questions posées à Denis, encore sans réponse** :
1. Cet écran arrive juste après l'import de la réponse de l'assistant, avant le résultat final - confirmé comme emplacement ?
2. S'il n'y a aucun point à vérifier, on saute complètement cet écran - confirmé ?
3. Le ton des questions/l'intro convient ?

**Risque global de ce chantier** : moyen-élevé - nouvelle dépendance (Tesseract.js), plusieurs modules à faire évoluer un par un (jamais tous en un seul commit, même méthode que d'habitude), nouveau champ de sortie JSON à ajouter aux prompts concernés (vérifier chaque prompt un par un), nouvel écran jamais construit. À traiter par petites tranches avec test navigateur et commit à chaque étape, comme le reste de ce plan.

---

## Paquet B - Fermeture automatique des blocs (élargi en cours de session)

**Décision de Denis, tranchée et confirmée plusieurs fois** : plus aucun bloc de saisie ne se ferme automatiquement - fermeture uniquement sur clic explicite de la personne sur le titre du bloc.

**Portée précisée par Denis en cours de session (important, élargit le périmètre)** :
- S'applique à **tout module où la personne SAISIT de l'information** (jamais aux modules de réception comme Se tenir informé).
- S'applique explicitement à **la première page réelle d'un module** (pas seulement la page d'introduction) - les blocs numérotés 1/2/3/4 (dépôt de CV, relecture, etc.) doivent être ouverts par défaut, et rester ouverts tant que la personne n'a pas cliqué elle-même dessus. Denis insiste : si la personne ne comprend pas qu'un bloc fermé (ex. « 1 Votre CV - Déposé ») peut être rouvert, elle ne retrouve jamais comment déposer un nouveau CV.
- Remplace même une règle plus ancienne et plus permissive (2026-09-19 : 4 blocs qui ne se fermaient qu'en changeant de rubrique) - la nouvelle règle est plus stricte : aucune fermeture automatique du tout, jamais.
- **Ces mêmes blocs numérotés 1/2/3/4 doivent AUSSI être agrandis** (rejoint le Paquet C ci-dessous - chiffres et titres trop petits, jamais retouchés jusqu'ici).

**Audit d'étendue déjà fait (lecture seule)** - 5 implémentations indépendantes du motif « accordéon qui se ferme à la complétion » :
1. **`blocERIP()` / `verifierTransitionsCompletionBlocs()` / `fermerBlocsPasDeFermetureAutoSurChangementRubrique()`** (js/app.js ~13260-13420) - composant partagé, utilisé par Mon Projet, Vos informations, Bilan « Corriger mon CV », Découverte. Déjà un opt-out partiel (`pasDeFermetureAuto`, 4 blocs) à généraliser/simplifier avec la nouvelle règle stricte.
2. **`data/metiers.js`** - dépliante partagée Préparer ma lettre et mon entretien/Mettre à jour/Reformuler (`_prepLE*`) + implémentation propre à Co-construire ma lettre (`_coLettre*`).
3. **js/app.js, copie propre à « Préparer un entretien »** (`preparerBloc1/2/3`) - même structure 1/2/3 que le point 2, code dupliqué, pas partagé.
4. **`modules/comparer-pistes/index.js`** - implémentation indépendante.
5. **`modules/coherence-transversale/ui.js`** - implémentation indépendante.

**Hors périmètre confirmé** : rapports Bilan (déjà fermés par défaut, comportement voulu) ; « Un regard sur mon CV » (pas d'accordéon du tout, ses 3 étapes sont toujours visibles).

**Statut : FAIT sur les 7 écrans concernés** (5 initialement identifiés + 2 trouvés en cours de route) :
1. `blocERIP()` (Mon Projet, Vos informations, Bilan "Corriger mon CV", Découverte) - `etatOuvertureSousSection()`, `verifierTransitionsCompletionBlocs()`, `fermerBlocsPasDeFermetureAutoSurChangementRubrique()` (supprimee), meme correctif dans `pageObjectif()`.
2. `data/metiers.js` - Préparer ma lettre et mon entretien/Mettre à jour/Reformuler (`_prepLE*`, dont les écrans d'échange) : nouvelle brique `ouvertBlocDepliManuel()`/`cablerBlocDepliManuel()`.
3. Co-construire ma lettre (`_coLettre*`) - même brique.
4. **Analyser ma candidature (Bilan)** (`preparerBloc1/2/3`, js/app.js) - trouvé en relisant ce fichier (mal identifié au départ comme "Préparer un entretien") : blocs 1/2 corrigés, bloc 3 avait déjà sa protection.
5. **Préparer un entretien** (`prepaEntretienBloc*`, data/metiers.js, le vrai 3e fichier) - même brique.
6. `modules/comparer-pistes/index.js` - bloc "Où en êtes-vous" corrigé (les autres n'avaient pas le problème).
7. `modules/coherence-transversale/ui.js` - les 4 blocs de collecte.

Logique retenue après précision de Denis (2026-09-27) : "figée dès qu'ouverte" - repliée si déjà complète AVANT l'arrivée sur l'écran, mais plus jamais refermée automatiquement pendant l'usage. Le mode "un seul bloc ouvert à la fois" (Mon Projet 5 cartes, Comparer mes pistes) est explicitement CONSERVÉ (confirmé par Denis - ce n'est pas une fermeture à la complétion).

---

## Paquet C - Lisibilité et agrandissement

### Fait et commité
- **Cartes objectif** (`0f9a0df`) : icône dans un rond, titre agrandi et centré. Vérifié clair/sombre, responsive (redimensionnement réel testé).
- **Jetons `.jeton`** (`0f9a0df` + `d9a26c5`) : Candidature (Un métier précis/Plusieurs métiers) ET Le poste que vous recherchez (Type de contrat/Temps de travail/Disponibilité) à la même taille, celle validée par Denis. `jeton--compact` reste inchangé ailleurs (listes denses : domaines, catalogues).

### Fait mais PAS ENCORE COMMITÉ (voir tout en haut du fichier)
- **Correctif du sens de variation responsive** : `clamp(MIN, Nvw, MAX)` grandissait avec la largeur d'écran - l'inverse de l'objectif (petit écran = plus grand, grand écran = plus modeste). Corrigé en `clamp(MIN, calc(BASE - Nvw), MAX)`. Découvert et corrigé après que Denis, testant sur sa propre fenêtre, trouvait les jetons « énormes » alors qu'il regardait déjà la valeur pensée pour un PETIT écran (le calcul ne redescendait jamais en dessous sur une fenêtre normale). Vérifié : à ~1040px de large, la taille tombe au minimum ; à 600px de large, elle monte au maximum.

### Fait (suite, 2026-09-27 après-midi)
- **Pulse séquentiel** sur les cartes objectif : `pulseObjectifUneFois()` (js/app.js), 2 cycles/3s par carte, une seule fois par session, seulement tant qu'aucun objectif n'est choisi. Vérifié clair/sombre.
- **Boutons `.btn`/`.btn-sm` agrandis partout** : clamp() responsive sur `.btn:not(.btn-lg):not(.btn-sm)` et `.btn-sm` séparément, `.btn-lg` et les boutons à couleur de sens (danger/success/famille-*/accueil) non touchés. Taille confirmée bonne par Denis après vérification live.
- **Numéros et titres des blocs "Préparer"** (`.preparer-num`/`.preparer-titre`) : clamp() responsive, +20% après un 1er passage validé par Denis. Une seule règle, partagée par les 7 écrans du Paquet B.
- **Texte général + titres de cartes blocERIP** (`.bloc-erip-entete h5`, ex. "Le poste que vous recherchez") : `body` reçoit un `font-size` responsive (jamais `html`, pour ne pas recalculer tous les composants déjà en `rem`) ; le titre de carte est unifié sur une seule taille (`.grille-mon-projet`/`.bloc-cv-refonte` alignés sur la règle de base), malgre un historique de reductions passees sur cet element - decision plus recente de Denis qui prime. Confirmé bon par Denis.

### Bloc Candidature - contraste : CONFIRMÉ RÉSOLU (2026-09-27)
Vérifié en navigateur, clair et sombre : le texte des jetons du bloc Candidature est bien en `--text-strong` (contraste fort), plus de gris sur gris. Le correctif jetons du 26/09 suffisait, rien à recoder.

---

## Paquet A - Cycle de vie du dossier (détail historique, tout fait)

### A1, A2, A5 - voir « Commits déjà faits » plus haut. Fait, vérifié, committé.

### A3/A4 - remplacé par le chantier OCR ci-dessus. Ne plus traiter comme un simple correctif.

### A6 - Croix d'effacement par info détectée (point 6)
**En cours, incomplet - voir tout en haut du fichier pour le détail exact de ce qui manque.** Rendu fait (croix visible sur chaque pilule), clic pas câblé.
Reste aussi, une fois le clic câblé : la détection nom/prénom dans l'e-mail avec un degré de certitude différent selon les cas (ex. `sophie.martin@yahoo.com` = certain, `jj24@yahoo.com` = incertain, à confirmer par la personne) - pas encore commencé, secondaire par rapport au clic lui-même.

---

## Paquets clos ou en attente externe

- **Paquet E (point 11)** : RETIRÉ, validé par Denis, fait et committé (`086e598`).
- **Paquet F (point 14)** : sous-points 1 et 3 faits et committés (`0fe72d4`). Sous-point 2 clos (absorbé par le 3, confirmé par Denis - c'était bien Co-construire ma lettre, pas de régression trouvée dans l'historique git de `prompts/lettre-co.md`).
- **Point 13** : RÉSOLU par l'autre compte (chantier "perte d'informations", 26/09) - `appliquerMoteurDecisionCV` (déplacé dans `modules/cv-core/moteurDecisionCV.js`, testé en Node) n'exclut plus silencieusement une expérience ajoutée après l'écran de choix de l'assistant. Vérifié le 27/09 : test dédié vert (`tests/moteurDecisionCV.test.js`, "C1").
- **Paquet D** : fait et committé (`8ff168f`).

---

## Verdict mode nuit (obsolète, laissé pour mémoire - situation du 26/09 au soir)

Paquets A/B/C/D/E/F et Point 13 tous faits et confirmés depuis (voir sections dédiées). Seul le chantier OCR ci-dessus reste ouvert, prochaine étape.
