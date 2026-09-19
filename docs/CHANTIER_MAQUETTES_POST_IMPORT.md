# Chantier "maquettes post-import" (4 écrans + cartes document) — [TERMINÉ le 2026-08-05, testé en conditions réelles]

Contexte : à la suite du chantier "écran tampon avant l'IA" (celui-là livré et codé, voir
`docs/CHANTIER_ECRAN_TAMPON_IA.md`), l'utilisateur a demandé un deuxième atelier de conception
(sans code, uniquement des maquettes interactives via l'outil `visualize`) portant sur 4 écrans
du parcours "Passons à l'action", plus un 5e point annexe. Toutes les maquettes ci-dessous ont
été validées explicitement par l'utilisateur, une par une, **puis implémentées et testées en
conditions réelles dans le navigateur le 2026-08-05** (voir "Écarts découverts en codant"
ci-dessous pour les points qui ont dû s'écarter légèrement du design validé en maquette, dont un
vrai bug signalé par l'utilisateur après une première passe de test).

## Écarts découverts en codant (importants, à connaître avant de retoucher ce code)

1. **Exporter, "vrais onglets segmentés"** : la maquette supposait un composant à onglets
   classique (contenu qui bascule selon l'onglet actif). En relisant le code réel
   (`[data-format-export]`, `js/app.js`), chaque bouton ("Télécharger", "Texte à copier",
   "Autre", "Aperçu") déclenche en fait une **action immédiate** au clic (téléchargement,
   ouverture d'un panneau, révélation d'un sous-menu) -- ce ne sont pas des vues qui se
   substituent l'une à l'autre. Introduire un faux état "onglet actif" aurait été trompeur et
   aurait dépassé le périmètre "on travaille juste le visuel". Implémenté à la place : boutons
   restylés avec icônes, largeur de page resserrée (max 520px), sans mécanique de bascule
   inventée. Le renommage ("Télécharger" au lieu de "Télécharger le Word") et le rappel PDF
   conditionnel, eux, sont bien tels que validés.
2. **Exporter, bouton "Télécharger" donnait le mauvais format** : bug réel signalé par
   l'utilisateur après implémentation (en travaillant le PDF, "Télécharger" téléchargeait quand
   même le Word). Corrigé : le libellé et le comportement du bouton `docx` s'adaptent
   maintenant à `etatApercuInline.cv.ongletApercu` -- en mode PDF, le bouton affiche "Télécharger
   le PDF" et, au clic, renvoie directement sur l'étape Aperçu/onglet PDF (même logique que
   `btnAllerOngletPdfExporter`) plutôt que de générer un Word. Aucune génération PDF
   programmatique n'existe (uniquement `window.print()` depuis le panneau PDF réellement
   affiché à l'écran), donc ce renvoi est le seul chemin possible -- confirmé avec
   l'utilisateur comme repli acceptable.
3. **Exporter, "Télécharger le PDF" ouvre directement le grand aperçu** : 1er correctif
   (renvoyer vers l'étape Aperçu) jugé insuffisant par l'utilisateur -- trop détourné, il fallait
   atterrir directement dans la fenêtre de téléchargement, pas dans l'accordéon Aperçu (grille
   de modèles, etc.). Corrigé : appelle directement `ouvrirGrandApercuPdf(dossier)` (js/app.js),
   la même fenêtre plein écran que celle ouverte depuis Aperçu, aucune 2e logique de rendu.
4. **Bouton "Imprimer / Enregistrer en PDF" ne marquait jamais le document comme fini** :
   `marquerDocumentEnregistre()` n'était appelé que par le chemin Word -- un CV fini uniquement
   en PDF ne faisait jamais apparaître le bouton "Merci bien, j'ai fini" (gate sur
   `dossier.documentsEnregistres.cv`). Corrigé dans
   `modules/cv-pdf-html/cvPdfPanneauReglages.js` (bouton `.bouton-imprimer`) : appelle
   désormais aussi `window.parent.marquerDocumentEnregistre('cv')` et
   `window.parent.pageResultats()` (après `window.print()`), même schéma que
   `window.parent.trackEvenement()` déjà utilisé au même endroit.
   *Note (2026-08-19, audit de cohérence documentaire) : état historique de ce chantier —
   l'appel à `window.parent.pageResultats()` a depuis été volontairement retiré
   (`marquerDocumentEnregistre()` rafraîchit déjà la navigation à chaque appel ; l'appel
   supplémentaire ne faisait que reconstruire toute la page en dessous de cette fenêtre
   plein écran, sans nécessité). Ne pas réintroduire cet appel sur la foi de ce paragraphe.*
5. **Aperçu et finalisation, portée de la carte miniature** : confirmée avec l'utilisateur
   (plusieurs allers-retours) -- la carte "Ce que l'IA vous propose" ne remplace la bannière
   QUE tant qu'aucun format Word/PDF n'a été choisi (`etatApercuInline.cv.ongletApercu` encore
   vide). Dès qu'un format est choisi, la bannière originale ("Revoir les choix pour votre
   CV"/"Choisir ou modifier les informations de mon CV") revient à l'identique -- vérifié en
   conditions réelles (bascule Word déclenchée par script, texte du bouton confirmé identique
   à l'original).

Contrainte transversale rappelée par l'utilisateur, valable pour les 4 écrans : l'écran réel est
**plus large que haut** (barre de navigation fixe en haut + barre Retour/Accueil fixe en bas qui
grignotent la hauteur disponible) — privilégier des rangées horizontales et des panneaux de
détail partagés plutôt que des blocs empilés verticalement.

## 1. Écran "Choisissez votre assistant IA" (accordéon `choix-ia`)

Disposition validée en **3 lignes** :
1. Ligne "Sans compte nécessaire" : pastilles ChatGPT, Perplexity.
2. Ligne "Compte nécessaire" : pastilles Claude, Gemini, Mistral.
3. Ligne "Ce qui va se passer" : 4 pastilles cliquables (Copie / Propositions / Stratégie /
   Votre choix), qui affichent leur explication détaillée dans un **panneau de détail partagé**
   sous la ligne (un seul texte affiché à la fois, mis à jour au clic — pas un bloc qui s'ouvre
   par pastille, pour rester compact).

Comportement des 2 types de clic bien distincts :
- Clic sur une **pastille IA** : comportement **inchangé**, ouvre l'écran existant "Avant de
  continuer vers {Assistant}" (`ouvrirFenetreAssistantIA()`, déjà livré au chantier précédent).
  Rien à recoder ici.
- Clic sur une **pastille étape (1-4)** : affiche son explication dans le panneau de détail
  partagé, uniquement visuel/informatif, aucune action.

Icônes : badges-lettres (GPT / Px / Cl / Ge / Mi) plutôt que de vrais logos de marque (droits
d'auteur — impossible de reproduire les logos officiels tels quels). **Ne pas changer ces
icônes sans proposer une alternative et obtenir la validation explicite de l'utilisateur.**

Non-régression : le bouton "Voir la démonstration (20 s)" (vidéo `export-ia-texte`) doit rester
présent — un oubli a été signalé et corrigé pendant l'atelier.

L'ancienne colonne "1-2-3-4" de cet écran (Vous cliquez sur un assistant / Tout est copié /
etc.) reste supprimée, comme décidé et livré au chantier précédent (`docs/CHANTIER_ECRAN_TAMPON_IA.md`) — ne pas la réintroduire.

## 2. Écran "Importer les informations IA" (accordéon `import-ia`)

Changements validés :
- **Le mini-stepper "1-2-3-4"** (Dans l'assistant copiez / Collez-la / Cliquez sur Importer /
  Ajouté automatiquement) **disparaît complètement** de cet écran (contrairement à la décision
  du chantier précédent qui l'avait gardé — nouvelle décision qui la remplace). À la place, une
  seule phrase de contexte : "Vous revenez de {Assistant}. Une fois sa réponse copiée,
  collez-la ci-dessous."
- **Une seule vidéo** au lieu de deux empilées (les 2 vidéos actuelles, `export-ia-texte` en
  rappel + `import-reponse-ia` au bas de `htmlCollageInstantane()`, apparaissaient comme
  redondantes) — n'en garder qu'une, du type "Voir comment coller la réponse (20 s)".
- **"Je suis de retour" agrandi**, bouton plein (pas juste un lien), avec un pulse **discret par
  défaut**, qui devient **plus fort/plus rapide** si la personne revient sur l'onglet sans avoir
  encore cliqué. Ce renforcement utilise la détection de visibilité/focus de l'onglet
  (`visibilitychange`/`focus`) **uniquement pour intensifier l'animation** — **aucune action
  n'est déclenchée automatiquement**, la personne doit toujours cliquer elle-même. Validé
  explicitement par l'utilisateur comme compatible avec la décision du chantier précédent
  ("jamais de détection automatique pour DÉCLENCHER une action").
- **Séparation nette collage automatique vs collage manuel**, sur demande explicite :
  - **Collage automatique** (clic sur le rond bleu) : la personne ne voit **jamais** le texte
    brut collé — juste une confirmation compacte ("✓ Réponse collée automatiquement").
  - **Collage manuel** : nouveau bouton en **pastille** "Coller manuellement" (grisé tant que le
    retour n'est pas confirmé, actif ensuite) qui ouvre la zone de texte, puisque c'est
    justement là que la personne doit voir/taper ce qu'elle colle.
  - Dans les deux cas, "Coller un morceau supplémentaire" et "Effacer et recoller" restent
    disponibles — **non-régression explicitement demandée**, ces fonctions ne doivent pas
    disparaître ni changer de comportement, seul l'habillage visuel change.
- Chaîne de pulse à respecter à l'implémentation : "Je suis de retour" pulse (invite au clic) →
  une fois cliqué, le rond bleu de collage pulse (invite à coller) → une fois collé, le bouton
  "Importer dans le CV" pulse à son tour (comportement déjà existant, `bouton-incitation-action`,
  à ne pas dupliquer/casser).

## 3. Écran "Aperçu et finalisation" (accordéon `apercu-document`)

Modification **limitée à la toute première vue de cet écran**, avant que Word ou PDF ne soit
choisi (aujourd'hui : juste 2 grandes cartes Word/PDF + un bandeau texte "Revoir les choix pour
votre CV" / "Choisir ou modifier les informations de mon CV →", avec beaucoup d'espace vide) :
- Cartes Word/PDF gardées, juste compactées côte à côte.
- Le bandeau texte devient une **carte avec une miniature** évoquant l'écran des propositions
  IA (petites pastilles de catégories + liste à cocher avec icône de réorganisation), et un
  texte qui explique clairement la contrainte : plus de suggestions que de place disponible,
  il faut décocher/prioriser, les flèches servent à mettre en avant ce qui compte le plus pour
  le poste visé.

**Important, précisé et reconfirmé plusieurs fois par l'utilisateur** : cette carte ne concerne
QUE cette vue initiale de "Aperçu et finalisation". Une fois Word ou PDF choisi, la fenêtre qui
s'ouvre ensuite (grille de modèles + couleurs + note ATS + aperçu en direct du document, déjà
existante) **reste strictement identique à aujourd'hui, aucun impact, aucune carte ajoutée**.
Ne pas toucher à cette partie-là en codant ce chantier.

## 4. Écran "Exporter" (accordéon `exporter-document`)

- **Vrais onglets segmentés** (un seul actif visuellement à la fois) à la place des pastilles
  identiques actuelles : "Télécharger" (renommé, cf. ci-dessous), "Texte à copier", "Autre".
- **Contenu resserré en cartes**, fini le texte en pleine largeur de page (repéré comme peu
  ergonomique).
- **Le rappel PDF (`rappelPdfExporter`/`btnAllerOngletPdfExporter` dans le code actuel) n'est
  PAS supprimé, il devient CONDITIONNEL** au format choisi à l'étape Aperçu précédente :
  - Si Word a été choisi : le rappel PDF disparaît (demande initiale de l'utilisateur, jugé
    inutile dans ce cas).
  - Si PDF a été choisi : le rappel reste, car **c'est aujourd'hui le seul chemin pour finaliser
    un export PDF** (le bouton "Télécharger le Word" de cet écran est toujours affiché quel que
    soit le format choisi à Aperçu, voir commentaire existant dans le code — mais rien
    n'équivaut pour PDF, qui se termine via impression navigateur depuis l'onglet Aperçu). Point
    technique découvert en lisant le code pendant l'atelier, à ne pas perdre en codant : sans
    cette conditionnalité, quelqu'un ayant choisi PDF perdrait tout moyen de le récupérer depuis
    cet écran.
  - Nécessite de savoir, au moment de construire cet écran, quel format (Word/PDF) a été
    choisi/actif à l'étape Aperçu précédente (variable d'état déjà utilisée par
    `accordeonApercuDoc`, à identifier précisément avant de coder).
- Renommage du premier onglet : **"Télécharger"** proposé (retire "le Word", redondant), au lieu
  de "Télécharger le Word" actuel. Alternative évoquée mais pas tranchée : "Mes documents" — à
  reconfirmer avec l'utilisateur avant de coder si un doute subsiste.
- Message de rappel "sauvegardez votre session" après téléchargement Word : inchangé.
- Carte de suggestion croisée (lettre de motivation / préparation entretien selon le document
  actif) : gardée, juste compactée visuellement.

## 5. Cartes document (sélecteur "Choisissez votre action", hors accordéons ci-dessus)

Demande ajoutée en cours d'atelier, traitée en dernier comme convenu. Aujourd'hui : 3 cartes
(Créer un CV / Lettre de motivation / Préparer un entretien), avec seulement 2 états visuels
(gris = pas actif, bleu = sélectionné) — aucun état ne signale qu'un document a déjà été
créé/complété, ce qui donne l'impression à tort qu'on ne peut plus y toucher.

Validé : un **3e état, vert**, avec badge "✓ CV prêt" (ou équivalent selon le type de document),
pour la carte d'un document déjà créé — reste **cliquable** (pour revoir/modifier, jamais pour
recommencer de zéro). Code couleur final sur 3 états : gris = pas commencé, bleu = en cours,
vert = déjà fait.

## Points en attente, hors périmètre de ce chantier de conception

- **Bug signalé en passant, pas traité ici** : après import d'une session sauvegardée,
  l'utilisateur ne voit qu'un seul intitulé de CV proposé au lieu de plusieurs. Cause non
  investiguée. À traiter séparément (voir mémoire `project_chantier_ecran_tampon_ia` et les
  autres chantiers en attente pour le contexte plus large du dépôt).

## Règles à respecter en codant ce chantier

- Jamais de tiret long (—) dans aucun texte visible (règle du projet, voir mémoire
  `project_regle_jamais_grand_trait_cv`).
- Priorité absolue à la non-régression sur `activerCollageInstantane()`/
  `htmlCollageInstantane()` (collage manuel, morceau supplémentaire, effacer et recoller) —
  seul l'habillage visuel change pour l'écran Importer, jamais la logique de collage/parsing
  interne.
- Ne pas introduire de détection automatique de retour (`visibilitychange`/`focus`) qui
  DÉCLENCHERAIT une action — seule l'intensité du pulse peut en dépendre.
- Tester en conditions réelles dans le navigateur avant de considérer ce chantier terminé, comme
  pour tout le reste de l'application.
