# 2e série de corrections Découverte (liste Denis, 2026-09-19)

> **CHANTIER CLOS le 2026-09-19** — les 6 points (+ vérification transversale) sont faits,
> testés au navigateur et committés. Voir le détail de chaque point ci-dessous, notamment le
> point 6 (remplacement de "Compléter mon CV") qui a nécessité plusieurs décisions techniques
> tranchées seul (absence de doublon avec "Vos expériences", gate identité déplacée).

> Suite du chantier `docs/CHANTIER_DECOUVERTE_CORRECTIONS_2026-09-18.md` (clos). Nouvelle
> liste dictée le 2026-09-19, feu vert donné ("c'est tout pour l'instant, on peut coder").
> Mode B : j'avance seul sur le comment, un commit + `npm test` + test navigateur par point.

## Ordre d'exécution retenu (du plus sûr au plus gros)

2. Écran tampon Ctrl+V avant l'assistant de rédaction — **[DÉJÀ EN PLACE, vérifié navigateur,
   rien à coder]** (déplacé en tête pour la lisibilité, voir détail au point 2 plus bas).

0. Vérification transversale (questions ciblées → 2e passage) — **[FAIT, aucun bug trouvé]**
   Vérifié : `finaliserMappingDossier()` (decouverteParcours.js:3944-3984) répartit déjà les
   réponses dans `dossier.formations`/`dossier.engagements`/`dossier.informationsNonClassees`,
   et `texteProfil('cv')` (app.js:25041,25111,25123) les lit toutes les trois. Rien à corriger.
1. Bug "Je sais pas" (rubrique Candidature) — **[FAIT — commit `6cb4386`]**
   Cause réelle : `informationsCandidatureSuffisantes()` renvoyait toujours vrai pour
   stage/alternance/PMSMP (structure facultative), donc le bandeau "Candidature" était déjà
   "complet" au tout premier rendu — la moindre interaction (dont "Je ne sais pas") le
   refermait immédiatement (`verifierTransitionsCompletionBlocs()`, blocMultiOuvert sans
   `pasDeFermetureAuto`). Corrigé en exigeant `civiliteRecruteurTouchee`, même principe que le
   correctif déjà fait le 2026-09-16 pour la variante réduite de spontanée/reconversion.
   Effet de bord assumé : `bilanCandidatureCompletudeRemplie()` (Bilan) applique désormais la
   même règle pour stage/alternance/PMSMP — cohérent avec le reste, pas une régression.
2. Écran tampon Ctrl+V avant l'assistant de rédaction (2e passage IA)
3. Cartes "Votre objectif" : 6 → 3 pour Découverte uniquement
4. "Vos expériences" : bloc ouvert par défaut + bouton "Ajouter" plus visible
5. "Lettre de motivation" sur "Mon CV" : visible seulement après validation du CV
6. Remplacer "Compléter mon CV" (mobilité/formation/engagement/savoir-faire, onglets) par
   la page "Vos informations" du parcours "Créer un nouveau CV" (blocERIP, `CONFIG_BLOC_*`)
   — **[FAIT — commit `1744b0f`]**. `etapeMobilite()` (~1700 lignes) supprimée entièrement,
   remplacée par `etapeVosInformationsDecouverte()` (4 blocs : Vous/Parcours/Experiences
   perso/Compléments, EXPERIENCES_PRO exclu volontairement — déjà couvert par l'étape
   suivante "Vos expériences"). Identité : civilité reste sur "Préparer" (fusionnée avec la
   section 1, récit), le reste (nom/prénom/contact/adresse/photo) se renseigne désormais sur
   le bloc "Vous" de cette nouvelle étape — même garde-fou qu'avant (impossible de continuer
   sans identité enregistrée), juste déplacé. Testé : parcours complet, blocs ouverts par
   défaut, Tout déplier/replier, Retour, mode sombre, non-régression de la VRAIE page "Vos
   informations" (aucune collision d'état malgré les mêmes ids de blocs).

Le point "bouton Continuer unique dans Mobilité" (dicté avant le point 6) est **absorbé par
le point 6** : une fois les onglets remplacés par la page "Vos informations" (accordéon
blocERIP), il n'y a plus de bouton "Continuer" par rubrique à supprimer, ce pattern n'existe
plus dans le composant repris. Pas d'implémentation séparée.

## Détail de chaque point

### 1. Bug "Je sais pas" — rubrique Candidature

Verbatim Denis : "Lorsque je fais clic sur « Je sais pas » pour la première page, dans la
rubrique « Candidature », le rectangle, le bandeau là, il se ferme. Et le prochain, le poste
que vous recherchez s'ouvre."

À investiguer : où se trouve la rubrique "Candidature" (probablement `CONFIG_BLOC_CANDIDATURE`,
blocERIP, js/app.js) et l'option "Je sais pas" en son sein. Comportement actuel : cliquer
"Je sais pas" ferme le bloc Candidature ET ouvre automatiquement le bloc/écran suivant
("Le poste que vous recherchez"). Comportement attendu à confirmer en lisant le code (Denis
ne dit pas explicitement ce qu'il attend à la place — juste que la fermeture + ouverture
auto est un défaut). Si ambigu une fois le code lu, demander confirmation avant de corriger
(règle "corriger, pas seulement signaler" — sauf vrai choix à trancher).

**Attention** : si ce bloc `CONFIG_BLOC_CANDIDATURE` est partagé avec d'autres parcours
(Bilan, etc.), vérifier si le bug s'y reproduit aussi ou si c'est spécifique à un cablage
Découverte — corriger à la source unique, jamais un correctif dupliqué.

### 2. Écran tampon Ctrl+V avant l'assistant de rédaction (2e passage IA) — FAIT, déjà en place

Denis a fourni une capture d'écran de la fenêtre existante "Avant de continuer vers ChatGPT"
(déjà utilisée ailleurs dans l'app, chantier `docs/CHANTIER_ecran_tampon_ia` / mémoire
`project_chantier_ecran_tampon_ia`) : explique les 5 étapes (copie auto, clic sur ChatGPT,
Ctrl+V, copier la réponse, revenir importer), bouton "Je comprends, continuer". Il faut que
CETTE fenêtre (réutilisée, jamais recréée) apparaisse quand la personne clique pour choisir
un assistant à l'étape 11 (Choisissez votre assistant, rédaction CV) de Découverte. Le
décompte de la barre (déjà existant ailleurs) démarre seulement APRÈS le clic sur "Je
comprends, continuer" — pas avant.

À investiguer : où est câblée cette fenêtre pour "Créer un nouveau CV" (pageAssistant) —
probablement dans `wireChoixAssistantIA`/`wireRectangleChoixIA`, ou un mécanisme séparé
déclenché après le choix d'un assistant. Vérifier si `wireRectangleChoixIA('cv', ..., 'decouverteRedaction')`
(déjà utilisé par `etapeChoisirAssistantCV()`, decouverteParcours.js) déclenche déjà cet
écran tampon nativement (auquel cas RIEN à faire, juste vérifier au navigateur) ou si
Découverte doit être raccordée en plus.

### 3. Cartes "Votre objectif" : 6 → 3 pour Découverte uniquement

Verbatim : garder seulement "Répondre à une offre", "Candidature spontanée", "Stage" (les
3 qui ne supposent pas déjà un CV) ; enlever "Reconversion", "Alternance", "PMSMP" — motif :
ces 3 derniers supposent un CV déjà existant, hors public visé par Découverte (jamais fait de
CV). **Uniquement pour ce parcours** — les 6 cartes restent pour les autres (Bilan, etc.).

À investiguer : `OBJECTIF_CHOIX_CANDIDATURE` (js/app.js, 6 cartes) + `pageObjectif()`/
`definirObjectifCandidature()`. Paramétrer (ex. un paramètre optionnel filtrant la liste des
cartes affichées) plutôt que dupliquer le composant — une seule source de vérité. Vérifier
comment `etapeAccueil()` (decouverteParcours.js, réécrite au point 1 du chantier précédent)
appelle ce composant partagé pour lui passer le filtre.

### 4. "Vos expériences" (étape 9) : bloc ouvert par défaut + bouton "Ajouter" plus visible

Verbatim : à l'arrivée sur la page, le rectangle "Expériences professionnelles"
(`CONFIG_BLOC_EXPERIENCES_PRO`, blocERIP) doit être OUVERT par défaut (pas replié), pour que
la personne voie tout de suite qu'elle peut ajouter une expérience. Le bouton "Ajouter une
expérience" doit être plus grand et/ou repositionné (en dessous des expériences déjà
reconnues, ou centré dans le rectangle) pour qu'il soit clairement visible.

À investiguer : `etapeVosExperiences()` (decouverteParcours.js) appelle `blocERIP(CONFIG_BLOC_EXPERIENCES_PRO)`
— l'état ouvert/fermé est piloté par `etatBlocERIPOuvert`/`etatBlocsERIPOuverts` (globaux,
js/app.js). Vérifier comment forcer l'ouverture par défaut SPÉCIFIQUEMENT à l'arrivée sur
cette étape sans casser le comportement ailleurs (ex. "Vos informations", qui utilise le même
bloc). Pour le bouton "Ajouter" : `CONFIG_BLOC_EXPERIENCES_PRO` est un config partagé — voir
si son bouton d'ajout est un simple gabarit CSS/HTML modifiable sans affecter les autres blocs
qui suivent le même patron (`CONFIG_BLOC_EXPERIENCES_PERSO` etc., si existant).

### 5. "Lettre de motivation" sur "Mon CV" : visible seulement après validation du CV

Verbatim : peur que si la personne n'a pas validé son CV et clique sur "Lettre de
motivation" avant d'arriver à l'étape Exporter, elle soit perdue.

À investiguer : `pageResultats()` (js/app.js), le bouton/carte "Lettre de motivation"
(probablement `btnSuggererLettre` ou le sélecteur de document). Trouver la condition
d'affichage actuelle et la restreindre à "CV validé" (à définir précisément dans le code :
probablement `etatAccordeonValide['exporter-document']` ou équivalent, à vérifier). Concerne
tous les parcours qui arrivent sur "Mon CV" avec cette option (pas seulement Découverte, sauf
si le bouton est déjà scopé à `depuisDecouverte` — à vérifier avant de toucher).

### 6. Remplacer "Compléter mon CV" par la page "Vos informations" (le plus gros point)

Denis a montré une capture de "Vos informations" (route du parcours "Créer un nouveau CV") :
bandeau d'étapes en haut (Votre objectif / Votre parcours / Vos informations / Votre profil /
Assistant / Vos documents), blocs accordéon "Vous" (identité), "Langues", et plus bas
(hors capture) probablement Parcours/Expériences/Projet/Compléments — les blocs `CONFIG_BLOC_*`
(blocERIP) déjà utilisés ailleurs. Décision de Denis : reprendre CETTE page telle quelle à la
place des onglets Mobilité/Formation/Engagement/Savoir-faire de "Compléter mon CV" (étape 8
actuelle de Découverte). Il juge cette page "très bien faite, complète, bien réfléchie".

**Sous-décision tranchée** (ma reco suivie par Denis) : ne PAS dupliquer les coordonnées.
- Le bloc "Vous" (identité : civilité, prénom, nom, téléphone, email, adresse, photo) de la
  page importée devient le SEUL endroit où saisir l'identité pour Découverte.
- "Préparer" (étape 1 actuelle de Découverte) perd sa sous-section coordonnées (point 2 de
  l'écran actuel), SAUF la civilité (Madame/Monsieur/Ne pas préciser), qui reste nécessaire
  pour que le texte rédigé par l'assistant soit accordé au bon genre — elle rejoint le 1er
  point de "Préparer" (avec le récit). "Préparer" devient donc : point 1 = récit + civilité,
  point 2 = cartes (objectif, voir point 3 de cette liste pour le filtre 3 cartes).

À investiguer avant de coder (chantier substantiel, prévoir plusieurs sous-étapes/commits) :
- Quel(s) `CONFIG_BLOC_*` composent exactement "Vos informations" (`pageProjet()` ou
  fonction équivalente, js/app.js) — Vous / Langues / Parcours (formations-diplômes) /
  Expériences pro / Expériences perso / Projet / Compléments (mobilité/engagement/
  savoir-faire) ? Vérifier lesquels couvrent déjà mobilité/formation/engagement/
  savoir-faire (le contenu actuel de "Compléter mon CV").
- Est-ce que "Vos expériences" (étape 9, déjà en page depuis le chantier précédent,
  `CONFIG_BLOC_EXPERIENCES_PRO`) fait doublon avec le bloc Expériences de cette page importée ?
  Si oui, ne pas répéter deux fois le même bloc dans le parcours Découverte — clarifier avec
  Denis si ambigu (candidat à fusionner : peut-être que la nouvelle étape "Vos informations"
  remplace l'étape 8 ET absorbe ce qui était à l'étape 9, à confirmer plutôt que supposer).
- Zéro régression fonctionnelle (règle du projet) : inventaire GARDÉ/DÉPLACÉ/FUSIONNÉ avant
  de retirer `etapeMobilite()` (l'étape 8 actuelle) — toutes les infos qu'elle transmettait
  (mobilité, formations/certifications, engagements, savoir-faire personnel) doivent se
  retrouver quelque part dans "Vos informations", sous une forme ou une autre.
- Renumérotation des étapes de Découverte à prévoir si la structure change (voir
  `_decouverteNavIndex`, `obtenirDefinitionEtape()`, comme fait pour le point 7 du chantier
  précédent).
- **Ambiguïté probable** : ce point est gros et touche à la structure même du parcours. Si en
  lisant le code la meilleure façon de faire n'est pas évidente (ex. faut-il garder Découverte
  comme une suite d'étapes séquentielles avec CE bloc en une seule étape, ou faut-il que
  Découverte emprunte le VRAI enchaînement de "Créer un nouveau CV" pour cette portion), en
  discuter avec Denis avant de coder à l'aveugle (règle maquette/questions avant code si doute
  d'interface).

### 7. Vérification transversale : les réponses aux questions ciblées (1er passage) alimentent bien le 2e passage (rédaction)

Demande de Denis (mi-tour, pendant l'écriture de ce fichier) : s'assurer que les réponses de
la personne aux "questions ciblées" du 1er passage assistant (étape 7, découverte des
compétences) remontent bien dans ce qui est transmis au 2e passage (rédaction, prompt
`decouverte-redaction.md`) — pas seulement conservées quelque part sans être utilisées.

À vérifier : `dossier.informationsNonClassees` reçoit déjà les réponses aux questions ciblées
(`question.texte + ' - Réponse : ' + reponse`, vu dans `decouverteParcours.js` autour de la
ligne 3953). Confirmer que `texteProfil()`/`texteProfilEffectif()` (js/app.js, construit le
profil envoyé à l'assistant) lit bien `dossier.informationsNonClassees` pour le 2e passage
('cv'/`decouverteRedaction`) — pas seulement pour le 1er. À faire AVANT ou pendant le point 6
(la restructuration touche justement ce qui alimente le profil).

## Discipline à respecter (rappel, identique au chantier précédent)

- Un commit par point, `npm test` (931 verts attendus, base avant ce chantier) + test
  navigateur réel avant chaque commit.
- Message de commit en français, sans tiret cadratin, attribution habituelle.
- Défaut trouvé en testant un point = corrigé dans le même passage (sauf vrai choix ambigu,
  alors présenté à Denis).
