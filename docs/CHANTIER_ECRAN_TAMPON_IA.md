# Chantier "écran tampon avant l'IA" — [TERMINÉ le 2026-08-05, testé en conditions réelles]

Contexte : beaucoup d'utilisateurs (public en fragilité numérique) abandonnent au moment où
l'appli les redirige vers un site IA externe (Claude, ChatGPT...). Ce chantier vise à rendre
ce passage moins déstabilisant, sans rien coder pour l'instant côté page Action (ligne de
pastilles) déjà livrée séparément.

Le design ci-dessous a été validé avec l'utilisateur via plusieurs maquettes interactives
(outil `visualize`, non persistées : cette page en est la seule trace). **Implémenté et
testé en direct dans le navigateur le 2026-08-05** (voir "Écart découvert en testant"
ci-dessous pour le seul point qui a dû s'écarter du design validé en maquette).

## Écart découvert en testant (important, à connaître avant de retoucher ce code)

Le design validé prévoyait que `window.open(urlAssistant, '_blank')` se déclenche
**automatiquement** à la fin du décompte de 5 secondes (voir écran 2, point 3 ci-dessous).
Testé en conditions réelles dans le navigateur : un `window.open()` déclenché depuis un
minuteur (`setInterval`/`setTimeout`), donc SANS clic direct de la personne, est bloqué
silencieusement par le navigateur (popup blocker standard de Chrome/Firefox/Edge, retourne
`null`, aucune erreur JS). Seul un `window.open()` en réaction IMMÉDIATE à un vrai clic
fonctionne de façon fiable.

Corrigé avec une 4e phase, `'bloque'`, ajoutée à `_etatTransitionIA.phase` (en plus de
`'decompte'`/`'ouvert'`/`'revenu'`) : à la fin du décompte (ou au clic "Continuer
maintenant"), le code tente `window.open()` et regarde ce qu'il retourne, si `null`
(bloqué), la bannière affiche à la place "Votre navigateur a bloqué l'ouverture
automatique." + un bouton "Ouvrir {Assistant} maintenant" (clic direct, donc jamais bloqué).
Choix validé avec l'utilisateur (plutôt que de rendre le décompte purement visuel sans
jamais tenter l'ouverture auto). Voir `ouvrirAssistantEnAttente()` et la fonction
`htmlBanniereTransitionIA()` (js/app.js, accordeonImportIA).

## Le parcours validé, en 3 écrans

### Écran 0 — "Choisissez votre assistant IA" (inchangé, sauf 1 suppression)
- Reste tel quel : les 5 boutons d'assistant (Claude/ChatGPT/Gemini/Perplexity/Mistral) + le
  bouton "Voir la démonstration (20 s)".
- **À supprimer** : la colonne de gauche avec la liste numérotée 1-2-3-4 ("Vous cliquez sur un
  assistant / Tout est copié pour vous / Il s'ouvre automatiquement / Vous revenez ici
  après") — jugée redondante une fois l'écran 1 (ci-dessous) enrichi. Construite via
  `miniAnimationEtapes(...)` dans `accordeonChoixIA` (`js/app.js`, `pageResultats()`,
  recherche `'Vous cliquez sur un assistant'`).

### Écran 1 — fenêtre "Avant de continuer vers {Assistant}" (existe déjà : `ouvrirFenetreAssistantIA()`)
Fonction déjà en place : `js/app.js:11609` (`ouvrirFenetreAssistantIA(config)`), liste des
5 étapes dans `ETAPES_ASSISTANT_IA_TEXTE` (`js/app.js:11595`). Appelée depuis
`pageResultats()` au clic sur `[data-assistant]` (`js/app.js:11088-11107`), avec
`onApresValidation: function () { avancerEtape('choix-ia', 'import-ia'); pageResultats(); }`.

**2 modifications de contenu à cette fenêtre :**
1. Réécrire l'étape 4 de `ETAPES_ASSISTANT_IA_TEXTE` : au lieu de "cliquez sur le bouton
   Copier de {ASSISTANT}", préciser explicitement qu'il faut cliquer sur l'icône de copie
   (deux petits carrés) à côté du message affiché dans son propre cadre, et que ça copie
   l'intégralité du message — pas toute la page. Formulation validée dans la maquette :
   *"Une fois sa réponse affichée dans son propre cadre, cliquez sur l'icône de copie (deux
   petits carrés) juste à côté, qui copie l'intégralité du message."* (sans tiret long,
   règle du projet).
2. Ajouter un encart aperçu, avant le bouton "Je comprends, continuer" : le VRAI rond bleu
   (icône presse-papiers) utilisé par le bouton de collage instantané de l'étape Importer
   (voir écran 2), avec le texte *"C'est ce bouton (rond bleu) que vous chercherez pour
   coller la réponse, une fois de retour."* — **pas** le bouton "Importer" (erreur faite une
   fois dans une maquette intermédiaire, corrigée par l'utilisateur : ce n'est pas le premier
   bouton qu'on utilise au retour).

**1 changement de comportement, plus important — à restructurer avec soin :**
Aujourd'hui, le clic sur "Je comprends, continuer" fait, dans cet ordre
(`js/app.js:11646-11668`) : copie presse-papiers → `window.open(url, '_blank')` (ouvre déjà
le site IA) → ferme la fenêtre → `onApresValidation()` (transition vers l'étape Importer).
La personne bascule donc sur le site IA AVANT même de voir l'étape Importer.

**Nouveau comportement voulu** : copie presse-papiers → ferme la fenêtre → transition
IMMÉDIATE vers l'étape Importer (`avancerEtape` + `pageResultats()`, donc AVANT
`window.open`) → c'est SEULEMENT depuis l'écran 2 (ci-dessous), après le décompte ou un
clic sur "Continuer maintenant", que `window.open(config.urlAssistant, '_blank')` doit
réellement s'exécuter. Il faut donc faire voyager `urlAssistant` (et le déclenchement du
`window.open`) jusqu'à l'étape Importer plutôt que de l'exécuter dans
`ouvrirFenetreAssistantIA()` elle-même.

### Écran 2 — étape "Importer les informations IA" enrichie (accordeon `import-ia`)
Construction actuelle : `accordeonImportIA` (`js/app.js`, recherche
`'Importer les informations IA'`), avec `htmlCollageInstantane()`/`activerCollageInstantane()`
(`js/app.js:1393` et `:1500`) pour le rond bleu de collage automatique, et le bouton final
`btnImporterReponseIA` qui porte déjà la classe `bouton-incitation-action` (pulse CSS
existant, `css/style.css`) — **ce pulse final existe déjà et ne doit pas être dupliqué**,
seulement déclenché au bon moment (déjà le cas : "visible seulement une fois cette zone
affichée, après collage réussi").

**Nouveaux éléments à ajouter à cette étape**, dans l'ordre validé :
1. Un titre/bandeau clair en haut : *"Vous êtes maintenant sur la page 'Importer'"* (icône
   📥), pour que la personne comprenne explicitement où elle se trouve.
2. Le rond bleu de collage (existant, `activerCollageInstantane`) démarre **désactivé**
   (grisé, `cursor:not-allowed`, non cliquable) tant que le décompte n'est pas terminé —
   texte associé : *"Ce bouton s'activera à votre retour."* — **important, sécurité UX
   explicitement demandée** : s'il restait actif pendant le décompte, la personne risque de
   cliquer dessus par erreur avant même d'être allée coller quoi que ce soit sur le site IA.
3. Une bannière de décompte (5 secondes, valeur visible, qui défile) : *"Ouverture dans {n}
   s. Cette page reste ouverte."* + un bouton **"Continuer maintenant"** qui court-circuite
   l'attente. À la fin du décompte OU au clic sur ce bouton : `window.open(urlAssistant,
   '_blank')` s'exécute (voir écran 1 ci-dessus pour l'origine de cette URL).
4. Une fois l'assistant ouvert, la bannière devient : *"L'assistant est ouvert dans un
   nouvel onglet."* + un bouton **"Je suis de retour"**.

   **Décision explicite de l'utilisateur, à ne pas complexifier** : ce bouton est
   **manuel** (la personne clique elle-même en revenant), PAS une détection automatique via
   `visibilitychange`/`focus`. Testé et validé ainsi dans la maquette — ne pas ajouter de
   détection automatique sans le redemander à l'utilisateur, ce serait une complexité non
   demandée.
5. Au clic sur "Je suis de retour" : le rond bleu de collage devient actif (cliquable) ET
   **pulse** (même famille d'animation que `bouton-incitation-action`, mais ce composant est
   un nouveau pulse dédié au rond bleu, distinct de celui du bouton "Importer" final) —
   texte associé change en *"Cliquez ici pour coller la réponse copiée."*
6. Un lien secondaire discret, sous la bannière de décompte, présent sur toute la durée de
   cette étape (pas seulement après le retour) : *"Perdu ? Revoir la démonstration (20 s)"*
   — même vidéo que celle de l'écran 0, pour quelqu'un qui n'a pas eu le temps de la
   regarder avant ou qui est perdu malgré toutes ces informations.
7. Une fois le collage effectué (clic sur le rond bleu, logique de collage déjà existante
   dans `activerCollageInstantane`, inchangée), le bouton final "Importer"
   (`btnImporterReponseIA`) s'allume/pulse — **déjà le comportement actuel de
   `bouton-incitation-action`**, à vérifier seulement qu'il continue de se déclencher
   correctement dans ce nouvel enchaînement, pas à recoder.

## Pistes évoquées mais explicitement PAS tranchées (à netrancher avant de les coder)
- Un lien discret "Ce n'est pas le bon assistant ?" sur l'écran 1 ou 2, pour repartir sans
  tout recommencer. Utilisateur : "rien d'urgent, dites-moi si ça vaut le coup."
- Un rappel spécifique pour coller sur mobile (le "Ctrl+V" actuel ne concerne que
  l'ordinateur, rien pour l'appui long mobile). Idem, pas tranché.

## Règles à respecter en codant ce chantier
- **Jamais de tiret long (—) dans aucun texte visible** — voir mémoire
  `feedback_reponses_francais`/`project_regle_jamais_grand_trait_cv`. Repéré et corrigé une
  fois pendant la conception de ce chantier (dans un texte de maquette).
- Priorité absolue à la non-régression sur le mécanisme de collage/import déjà existant et
  longuement testé (`activerCollageInstantane`, `btnImporterReponseIA`) — ce chantier
  n'y touche que pour l'état activé/désactivé du rond bleu et l'ajout du décompte autour,
  jamais sa logique de collage/parsing interne.
- Tester en conditions réelles dans le navigateur (le décompte, le passage désactivé →
  actif → pulse, le `window.open` réellement déclenché au bon moment) avant de considérer
  ce chantier terminé — comme pour tout le reste de l'app.
