# Chantier — mise en page du CV : interligne par rubrique, frise chronologique, mini-grille (inspiré de CVDesignR)

> Ouvert le 2026-09-18. Mode A pour le cadrage (fait), Mode B pour l'exécution (le quoi et le
> pourquoi de chaque bloc sont tranchés ci-dessous). Un bloc à la fois, `npm test` + test
> navigateur obligatoire à chaque sous-étape (les fichiers concernés ne sont pas couverts par les
> tests Node, voir §5), un commit par sous-étape. Aucun code écrit à la date d'ouverture de ce
> document.
>
> Ce document est le **contrat figé** du chantier. Il ne se substitue pas aux fichiers de
> référence (`BRIQUES_COMMUNES.md`, `reglagesMiseEnPage.js`) ; il rassemble ce qui a été décidé
> pour ne rien perdre entre deux sessions (et entre les deux comptes Claude du projet).

---

## 1. Origine et constat

Denis veut enrichir les fonctions de création/édition de CV en regardant ce que propose
cvdesignr.com. Analyse faite le 2026-09-18 (catalogue de modèles + un vrai CV apporté par Denis,
`CV Doumbouya Ibrahim cariste d'entrepôt.pdf`, produit avec CVDesignR).

**Constat de départ important** : APP a déjà un moteur de réglages de mise en page très riche
(`modules/cv-mise-en-page/reglagesMiseEnPage.js`, 63 champs) et **9 modèles créatifs tout faits**
(`CREATIF_MODELES_XXL` dans `js/app.js` + miroir `_PDF_CREATIF_RECETTES` dans
`cvPdfPanneauReglages.js`), appliqués soit à la main soit par le tirage au sort (« Style au
hasard », bouton 🎲). La quasi-totalité des dispositions visuelles de CVDesignR (colonnes,
bandeaux diagonaux, icônes de coordonnées, cercle photo, cadre de page, séparateurs de colonnes)
**existe déjà**. Ce chantier ne part donc pas de zéro : il comble des manques précis, vérifiés un
par un dans le code, pas une refonte.

---

## 2. Ce qui a été explicitement écarté (ne pas reproposer)

- **Remplacer le tirage au sort par une galerie de vignettes** : NON. Le dé reste identique, une
  galerie de vignettes cliquables s'ajoute **à côté**, jamais à sa place (le dé est un mécanisme
  abouti, affiné sur de nombreux retours utilisateur — aucun défaut ne le justifie).
- **Photo dans la colonne latérale** (vue sur les modèles Duo/Metro de CVDesignR) : écarté par
  Denis (CIP de profession) — plus-value trop étroite (ne concerne que les CV avec photo, pratique
  déjà non encouragée dans l'insertion pro) face au risque de rendre la photo plus tentante à
  cocher par un habillage plus soigné.
- **Score ATS visible (%)** : hors sujet, contredirait le choix assumé du module « Les mots de
  votre CV (ATS) » de ne jamais afficher de score.
- **Barres/points de niveau graphiques pour langues et compétences** : vérifié sur une capture
  réelle haute résolution de CVDesignR — c'est du texte simple (« Anglais — Décrivez votre
  niveau »), pas de barre. Fausse piste, pas un vrai manque.
- **IA intégrée au générateur, traduction automatique** : hors architecture d'APP (pas de budget
  API, assistant externe uniquement).
- **Nouvelles rubriques** (Références, Réseaux sociaux, Atouts, Voyages), **glisser-déposer des
  rubriques**, **gestion de plusieurs versions de CV** : identifiés pendant l'analyse, mis de côté,
  ne font pas partie de ce chantier.
- **2 variantes décoratives mineures** repérées sur d'autres modèles (fond d'en-tête en mosaïque de
  triangles, soulignement coloré pour les compétences) : pas incluses ici. Ce sont chacune une
  valeur de plus à ajouter à un enum déjà existant (`formeEnTete`, `regStyleCompetences`) — à faire
  en une ligne le jour où on retouche cette zone du code, pas un chantier à part.

---

## 3. Ordre de construction validé

| Bloc | Contenu | Moteur | Statut |
|---|---|---|---|
| 0 | Interligne par rubrique | PDF **uniquement** | à faire |
| 1 | Frise chronologique | PDF | à faire |
| 2 | Mini-grille de rubriques courtes en pied de page | PDF | à faire |
| 3 | Frise chronologique | Word (Composeur) | à faire |
| 4 | Mini-grille de rubriques courtes | Word (Composeur) | à faire |
| 5 | Maquette : galerie de vignettes (option A) + nouveaux modèles utilisant frise/mini-grille | PDF + Word | à faire, maquette avant code |

**Un bloc validé (testé en navigateur, committé) avant de commencer le suivant.** Ne jamais
enchaîner deux blocs dans la même session sans validation de Denis entre les deux.

---

## 4. Détail de chaque bloc

### Bloc 0 — Interligne par rubrique (PDF uniquement)

**Pourquoi PDF seulement, pas Word tout de suite** : le mécanisme de réglage par rubrique
(mini-barre flottante qui apparaît au clic sur une rubrique dans le grand aperçu) **n'existe qu'en
PDF**. Vérifié : aucune trace d'`echellesRubriques`/`policesRubriques` dans
`modules/cv-composeur/composeurRender.js`. Construire l'équivalent Word reviendrait à créer toute
la mécanique par rubrique pour ce moteur, pas juste l'interligne — hors périmètre de ce bloc, à ne
proposer que si Denis le demande explicitement plus tard.

**Ce qui existe déjà (à ne pas casser)** : un réglage **global** `interligne` (3 crans Serré /
Normal / Aéré, `reglagesMiseEnPage.js` ligne ~48) qui s'applique à tout le CV via
`composition.interligneCorps` (PDF : `cvPdfTemplateA4.js` ~ligne 2049 ; Word :
`composeurTheme.js`/`composeurRender.js`).

**À construire** :
- État en mémoire `_cvPdfInterlignesRubriques` (`cvPdfPanneauReglages.js`), miroir exact de
  `_cvPdfEchellesRubriques` déjà existant (même patron : objet `{cle: valeur}`, bouton
  « réinitialiser » par rubrique).
- Un contrôle de plus dans `_pdfAfficherBarreOutilsRubrique()` : les mêmes 3 crans que le réglage
  global (Serré/Normal/Aéré), pas un curseur en %, pour rester dans le même vocabulaire que le
  réglage global du même nom.
- Émission CSS dans `cvPdfTemplateA4.js` : même formule que la règle globale (ligne ~2049-2051),
  mais scopée `[data-rubrique="cle"] .item, [data-rubrique="cle"] .texte-profil,
  [data-rubrique="cle"] .ligne-mission, [data-rubrique="cle"] .texte-competences` au lieu de
  s'appliquer à tout le CV.
- Portée : rubriques avec du texte de corps (Expériences, Formations, Engagements, Compétences en
  mode texte...). Vérifier au moment du code lesquelles ont réellement un intérêt (pas de sens sur
  une rubrique à une seule ligne).

### Bloc 1 — Frise chronologique (PDF)

**Nouveau réglage canonique** dans `reglagesMiseEnPage.js` : nom provisoire
`presentationChronologie`, enum `liste` (défaut, comportement actuel inchangé) / `frise`.

**Règle d'application — décidée le 2026-09-18** : pas une liste de rubriques figée à la main.
S'applique automatiquement à **toute rubrique dont les entrées portent une date propre** :
aujourd'hui `experiences` (dateDebut/dateFin), `formations` (annee), `engagements` (même structure
que experiences, cf. `_pdfBlocEngagementsEtPerso`). **Certifications reste exclue** : rendue
aujourd'hui en liste simple sans date individuelle (`_pdfBlocListeSimple`), rien à accrocher à une
frise — si elle gagne des dates un jour, elle suivra automatiquement, sans retoucher ce réglage.

**Couleur — décidée le 2026-09-18** : couleur d'accent du CV, passée par le garde-fou de contraste
déjà existant `_pdfLuminanceHexA4()` (`cvPdfTemplateA4.js` ~ligne 159, déjà utilisé pour la
couleur d'entreprise détectée automatiquement). Ne jamais dupliquer cette logique de sécurité,
la réutiliser telle quelle.

**Rendu** : dans `cvPdfTemplateA4.js`, sur les blocs concernés (`_pdfBlocExperiences`,
`_pdfBlocFormations`, le bloc engagements) — une puce ronde devant chaque `.item` + une ligne
verticale continue les reliant (piste technique : `::before` pour la puce, `border-left` sur un
conteneur dédié pour la ligne, qui s'arrête au dernier item de la rubrique). À vérifier en codant :
compatibilité avec `ordreDatesPoste` (dates avant/après le poste) et `formatExperiences`
(standard/amélioré) — le rendu doit rester correct dans les deux cas, pas juste testé dans un seul.

**UI** : nouvelle option dans « Je veux tout régler ».

### Bloc 2 — Mini-grille de rubriques courtes en pied de page (PDF)

**Nouveau réglage canonique** : nom provisoire `grillePiedDePage` (portée et forme exactes à
trancher au moment de coder ce bloc — voir question ouverte ci-dessous).

**Constat** : sur le modèle « Lignes » de CVDesignR, Langues/Atouts/Informatique puis
Voyages/Centres d'intérêt/Réseaux sociaux sont regroupés côte à côte en 2-3 colonnes fines en bas
de page, au lieu d'être empilés verticalement. Le réglage `colonnes` actuel (`reglagesMiseEnPage.js`)
est binaire (1 ou 2) pour **toute la page** — aucune mini-grille indépendante n'existe pour
regrouper plusieurs petites rubriques.

**Question ouverte, à trancher avec Denis avant de coder ce bloc précis** (pas maintenant) :
1. Comment la personne choisit quelles rubriques entrent dans la grille : automatique (toute
   rubrique « courte » regroupée par défaut) ou manuel (case à cocher par rubrique, dans l'écran
   « Ordre des rubriques » déjà existant) ?
2. Comportement si le texte d'une rubrique déborde dans une colonne étroite (retour à la ligne,
   troncature, ou la grille se limite aux rubriques qui tiennent naturellement) ?

### Bloc 3 — Frise chronologique (Word / Composeur)

Traduction du même réglage canonique `presentationChronologie` pour le moteur Word. Fichiers :
`composeurTheme.js` (traducteur), `composeurRender.js` (génération docx.js). **Contrainte
technique à trancher au moment de coder** : Word/docx n'a pas de CSS — la ligne verticale continue
passera probablement soit par des bordures de paragraphe (`border.left` docx.js), soit par un
tableau invisible à 2 colonnes (puce à gauche, texte à droite). Choix technique à faire à ce
moment-là, pas à figer maintenant.

### Bloc 4 — Mini-grille de rubriques courtes (Word / Composeur)

Traduction Word du réglage `grillePiedDePage`, une fois sa forme exacte tranchée au Bloc 2.
Probablement un tableau docx.js multi-colonnes.

### Bloc 5 — Maquette : galerie de vignettes + nouveaux modèles

Une fois les Blocs 1 à 4 posés (le Bloc 0 est indépendant, peut être fait à part) :
- Maquetter l'écran de galerie (option A confirmée le 2026-09-18) : vignettes cliquables à côté du
  🎲 existant, jamais à sa place. Chaque vignette appelle `_appliquerModeleCreatifXXL(nomModele)`
  (fonction déjà existante) au lieu d'un tirage aléatoire.
- Maquetter 1 ou 2 nouveaux modèles (nouvelles entrées dans `CREATIF_MODELES_XXL` +
  `_PDF_CREATIF_RECETTES`, + équivalent Word une fois construit) qui utilisent la frise et/ou la
  mini-grille par défaut, pour leur donner de la visibilité dans la galerie.
- **Maquette avant code obligatoire** ici (doute d'interface réel : apparence des vignettes,
  contenu exact de la galerie) — pas nécessaire pour les Blocs 0 à 4, qui étendent des mécanismes
  déjà en place sans nouveau paradigme d'interface.

---

## 5. Méthode, à respecter à chaque bloc

- Un commit par sous-étape, jamais un bloc entier d'un coup si plusieurs fichiers sont touchés.
- **Test navigateur obligatoire à chaque sous-étape** : `cvPdfTemplateA4.js` et
  `cvPdfPanneauReglages.js` génèrent du code injecté dans un iframe (chaînes de caractères
  concaténées, pas des fichiers exécutés directement par Node) — `npm test` ne les couvre pas.
  Idem pour `composeurRender.js`/`composeurComposition.js`/`composeurTheme.js` côté Word. Tester :
  clair + sombre, avec ET sans le nouveau réglage actif (le comportement par défaut ne doit jamais
  changer pour un CV qui n'utilise pas la nouveauté), impression/export PDF réel si le bloc touche
  au rendu final.
- Ne jamais commencer un bloc suivant sans validation explicite de Denis sur le bloc précédent.
- Avant le Bloc 2, reposer la question ouverte du §4 (portée de la grille, débordement de texte) —
  ne pas trancher seul à ce moment-là.
- Ce document se met à jour au fil de l'eau (statut de chaque bloc, décisions techniques prises en
  cours de route) — comme `BRIQUES_COMMUNES.md`, jamais une « photo » qui reste périmée.
