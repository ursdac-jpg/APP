# 3e série de corrections Découverte (liste Denis, 2026-09-19, soir)

> Suite des chantiers `docs/CHANTIER_DECOUVERTE_CORRECTIONS_2026-09-18.md` et
> `docs/CHANTIER_DECOUVERTE_CORRECTIONS_2_2026-09-19.md` (clos). Nouvelle liste dictée le
> 2026-09-19 en soirée, feu vert donné ("c'est bon, tu peux corriger"). Denis a explicitement
> demandé de commencer par le point 6 (bug critique).

## Ordre d'exécution — TOUT FAIT SAUF LA SUITE DU POINT 5

1. **[FAIT — commit `70e5f72`]** Point 6 (priorité absolue) — bug critique : `finaliserMappingDossier()`
   n'était plus jamais appelée (son seul appel vivait dans l'ancien onContinuer de l'étape 8,
   supprimé par erreur au chantier précédent du même jour). Restauré à la fin de l'étape
   Compétences. Vérifié bout en bout (récit → dossier.experiences → CV).
2. **[FAIT — commit `859fa97`]** Point 3 — écran tampon manquant sur le 1er passage IA.
   `etapeChoixAssistant()` avait son propre mécanisme de copie, jamais raccordé à
   `ouvrirFenetreAssistantIA()`. Réutilise désormais le même composant que le 2e passage.
3. **[FAIT — commit `ddb4178`]** Point 2 — cascade d'ouverture "Le poste que vous
   recherchez" + retrait présélection civilité recruteur (`sansPreselection=true`).
4. **[FAIT — commit `6702e1a`]** Point 5, 1ère partie — "Vos formations et diplômes"
   n'a plus de fermeture automatique (incohérence avec les 4 autres blocs corrigée).
5. **[FAIT — commit `3fa82b9`]** Point 7 — Points forts/Mots clés resserrés (2e passe :
   padding/police/pastille réduits ; 3 colonnes testées puis abandonnées, texte tronqué).
6. **[FAIT — commit `76a7c8b`]** Point 4 — "Rouvrir le site" recopie le prompt, partout
   (13 points d'ouverture/réouverture dans toute l'application).
7. **[FAIT — commit `ddcbd60`]** Point 5, 2e partie — cascade ouverture/fermeture complète.
   Denis a confirmé : Découverte uniquement. Implémentée entièrement dans
   decouverteParcours.js (drapeaux edge-triggered), aucune config CONFIG_BLOC_* partagée
   touchée — vérifié sans régression sur la vraie page "Vos informations".
8. **[FAIT — commit `2019520`]** Point 8 (nouveau, dicté en cours de route) — le bloc
   "Candidature" s'ouvre dès le choix d'une carte objectif sur "Préparer" (Découverte).

**Point 1** (mémoriser les choix par carte d'objectif) : testé en profondeur (JS direct + clics
réels UI, Découverte et parcours normal) — AUCUNE perte constatée, comportement déjà
correct. Question posée à Denis pour préciser quel champ exact était perdu ; pas encore
répondu. Ne rien coder tant que le champ précis n'est pas identifié.

## Chantier quasi clos

Tous les points de cette 3e liste sont faits sauf le point 1, en attente d'une précision de
Denis (aucun bug reproduit malgré des tests approfondis).

## Détail des points

### Point 6 — CRITIQUE : expériences absentes de l'étape 9 ET du CV final

Verbatim Denis : "les expériences qui ont été déjà identifiées n'apparaissent pas... c'est une
grosse régression... l'écran d'expérience professionnelle a été complètement perdu parce
qu'il ne fait même pas apparition sur le CV." Raison d'être : le principe de Découverte est de
laisser la personne RACONTER (voix ou texte) plutôt que remplir un formulaire — si les
expériences identifiées par le récit ne remontent nulle part, ce principe est cassé.

À investiguer en premier : `finaliserMappingDossier()` (decouverteParcours.js) — le mapping
des fragments identifiés vers `dossier.experiences`. Vérifier si un changement récent (aujourd'hui,
chantiers 2026-09-18/19) a cassé ce pipeline, ou si c'est un gap jamais testé avec de vraies
données de récit (les tests navigateur précédents sur l'étape 9 utilisaient des expériences
injectées à la main, jamais le vrai flux récit → fragments → dossier.experiences). Vérifier
aussi que `texteProfil()`/génération du CV (js/app.js) lit bien `dossier.experiences` pour
Découverte comme pour les autres parcours.

### Point 3 — écran tampon manquant sur le 1er passage IA

Le 1er passage (étape 4, choix de l'assistant pour analyser le récit) n'affiche pas l'écran
"Avant de continuer vers X" (Ctrl+V, décompte) — contrairement au 2e passage (rédaction, étape
11) qui l'a déjà. À investiguer : `etapeChoixAssistant()` (probablement le nom, à vérifier) —
comment est câblé le choix d'assistant à cette étape, comparé à `etapeChoisirAssistantCV()` qui,
elle, passe par `wireRectangleChoixIA`/`wireChoixAssistantIA` (lequel déclenche déjà
`ouvrirFenetreAssistantIA()`). Probable cause : l'étape 4 utilise un mécanisme différent/plus
ancien qui n'a jamais été raccordé à cet écran tampon.

### Point 1 — mémoriser les choix par carte d'objectif

Verbatim : si la personne choisit "Répondre à une offre", saisit des informations, puis bascule
sur "Candidature spontanée", puis revient sur "Répondre à une offre" : les informations déjà
saisies pour "Répondre à une offre" doivent réapparaître (pas perdues/réinitialisées).

À investiguer : `dossier.objectif` pilote quel sous-ensemble de champs est actif
(`dossier[dossier.objectif]`, `dossier.modeRecherche`/`dossier.typeRecherche`/
`dossier.rechercheCandidature` pour offre/spontanée/reconversion). `definirObjectifCandidature()`
(js/app.js) - vérifier si elle réinitialise ces champs au changement d'objectif (elle le fait
DÉJÀ pour stage/alternance/pmsmp, voir son code) ou si offre/spontanée/reconversion partagent
déjà `dossier.modeRecherche`/`typeRecherche`/`rechercheCandidature` de façon non cloisonnée
(auquel cas basculer d'offre à spontanée et vice-versa écraserait déjà les mêmes champs -- pas de
perte technique mais pas de mémorisation PAR carte non plus). Nécessite probablement un
stockage par objectif (ex. `dossier.rechercheCandidatureParObjectif[objectif] = {...}`) plutôt
qu'un seul jeu de champs partagé. Concerne potentiellement TOUS les parcours utilisant
`pageObjectif()` (Bilan, etc.), pas seulement Découverte -- à vérifier avant de coder, et si le
comportement actuel est identique ailleurs, corriger à la source unique.

### Point 2 — cascade d'ouverture "Le poste que vous recherchez" + civilité recruteur

- Domaine ou métier précis + "recherche générale" (simple) choisie → "Le poste que vous
  recherchez" (CONFIG_BLOC_PROJET) s'ouvre automatiquement.
- Domaine ou métier précis + "structure précise"/offre → c'est la réponse à "Connaissez-vous
  la personne en charge du recrutement ?" (Je ne sais pas / Oui Madame / Oui Monsieur), quelle
  qu'elle soit, qui déclenche l'ouverture de "Le poste que vous recherchez".
- "Connaissez-vous la personne en charge du recrutement ?" ne doit plus avoir de présélection
  ("Je ne sais pas" est actuellement précoché par défaut dès que `civiliteRecruteur` est vide,
  voir `contenuCiviliteRecruteurCandidature()`, js/app.js -- `neSaitPasActif = sansPreselection
  ? (touchee && !civRec) : !civRec`). Il existe déjà un paramètre `sansPreselection` utilisé par
  co-lettre pour ce exact besoin (pas de présélection tant que non cliqué) -- vérifier si on peut
  le réutiliser tel quel pour ce contexte (pageObjectif/Decouverte) plutôt que dupliquer.
  Seule "Mettre en avant les couleurs de l'entreprise" garde sa présélection actuelle (Non).

**Attention** : ce point touche `pageObjectif()`/`CONFIG_BLOC_CANDIDATURE`/`CONFIG_BLOC_PROJET`,
composants PARTAGÉS avec d'autres parcours (Bilan). Vérifier si Denis veut ce comportement
PARTOUT où ce composant est utilisé, ou seulement pour Découverte -- si ambigu à la lecture du
code, trancher en faveur du comportement partagé (cohérence) sauf contre-indication trouvée,
mais signaler le choix fait.

### Point 5 — cascade ouverture/fermeture des blocs sur "Vos informations" (étape 8)

- "Vos formations et diplômes" (CONFIG_BLOC_PARCOURS) ne doit plus se refermer automatiquement
  dès qu'un critère est choisi (ex. une certification) -- reste ouvert pour en ajouter
  plusieurs. Actuellement CONFIG_BLOC_PARCOURS n'a pas `pasDeFermetureAuto` (contrairement à
  CONFIG_BLOC_EXPERIENCES_PRO/PERSO/COMPLEMENTS qui l'ont déjà) -- probable ajout de ce
  drapeau, à vérifier si ça suffit ou si un comportement spécifique est nécessaire.
- Dès qu'on commence à répondre dans "Formations et diplômes" (peu importe la réponse), "Ce
  que vous avez appris ailleurs qu'au travail" (CONFIG_BLOC_EXPERIENCES_PERSO) ET
  "Compléments" (CONFIG_BLOC_COMPLEMENTS) doivent s'OUVRIR tous les deux.
- Dès qu'on commence à répondre dans "Ce que vous avez appris ailleurs qu'au travail", les
  blocs au-dessus (Vous, Formations et diplômes) se referment.
- Dès qu'on répond dans "Compléments", le bloc juste au-dessus ("Ce que vous avez appris
  ailleurs qu'au travail") se referme.
- Une fois tout complété, "Continuer" se débloque (déjà le cas via `dossier.identiteEnregistree`
  -- à vérifier si d'autres conditions doivent s'ajouter, ou si ça reste inchangé).

**Portée à clarifier en lisant le code** : ce comportement de cascade concerne-t-il UNIQUEMENT
la nouvelle étape 8 de Découverte, ou doit-il aussi s'appliquer à la VRAIE page "Vos
informations" (pageProjet, "Créer un nouveau CV") puisque ce sont les mêmes blocs partagés ?
Denis a décrit son observation sur "au niveau de mes diplômes" sans préciser explicitement le
parcours -- vu le contexte de la conversation (suite des corrections Découverte), a priori
Découverte uniquement, mais à netteté à vérifier/signaler si le comportement actuel de
pageProjet() est identique (dans ce cas la correction bénéficierait aux deux, cohérent avec la
philosophie "une seule source de vérité").

### Point 7 — Points forts/Mots clés toujours trop grands (2e passe)

Le resserrement déjà fait (chantier précédent, flèches côte à côte sur `.reco-liste-grille`)
n'a pas suffi. Réduire encore la taille (padding, police, hauteur de carte) pour que ça tienne
sans prendre "un écran et demi". Composant partagé (`contenuListeRecommandationsIA`,
`.reco-liste-grille` -- Points forts/Mots clés/Compétences/Postes recommandés/Rubriques à
masquer/Certifications) -- toute réduction profite à tous ces usages, vérifier la lisibilité
reste correcte partout (pas seulement Découverte).

### Point 4 — "Rouvrir le site" doit recopier le prompt (transversal, tous parcours)

Verbatim : le bouton qui rouvre le site de l'assistant (ex. "Rouvrir ChatGPT") doit, en plus
d'ouvrir le site, RECOPIER le texte/prompt dans le presse-papiers -- au cas où la personne a
fait autre chose entre-temps et perdu le contenu copié. Demande explicite : "dans tous les
parcours partout, je veux cette chose-là."

À investiguer : le bouton "Ouvrir maintenant"/lien de réouverture pendant le décompte
(`_etatTransitionIA`, écran "Collez la réponse de l'assistant") -- trouver son câblage exact
(js/app.js, probablement dans la zone qui gère `_etatTransitionIA.phase === 'decompte'`).
Vérifier si le texte à copier (`construireTexteACopier()`, capturé au moment du 1er clic sur
l'assistant dans `ouvrirFenetreAssistantIA()`) est encore accessible à ce stade pour le
recopier, ou s'il faut le reconstruire. Composant partagé à TOUS les parcours (CV/lettre/
entretien/Bilan/Découverte) -- corriger à la source unique.

## Discipline à respecter (rappel, identique aux chantiers précédents)

- Le point 6 (bug critique) passe en premier, avant tout le reste.
- Un commit par point, `npm test` (931 verts attendus) + test navigateur réel avant chaque
  commit -- jamais "ça devrait marcher", d'autant plus après un bug critique raté une 1ère fois.
- Message de commit en français, sans tiret cadratin, attribution habituelle.
- Pour les points touchant des composants partagés avec d'autres parcours (2, 4, 7) :
  vérifier la non-régression sur au moins un autre parcours (Bilan/Créer un nouveau CV) avant
  de committer.
