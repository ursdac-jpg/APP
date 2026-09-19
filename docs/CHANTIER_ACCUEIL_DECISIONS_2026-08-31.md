# Chantier « Réorganisation de la page d'accueil » — CLOS le 2026-09-01

> **Ce chantier est terminé** (voir le journal ci-dessous, entrée 2026-09-01).
> Ce qui en restait a été détaché : `docs/CHANTIER_BOUTON_REVOIR_PRESENTATION.md`
> (bouton « Revoir la présentation » harmonisé + patron page d'intro généralisé).
>
> Fichier créé le 2026-08-31 sur le second compte Claude, pour tracer les
> décisions prises pendant que Denis était fatigué (décisions déléguées, protocole
> `docs/TRAVAILLER_AVEC_DENIS.md`). Complète le relais
> `docs/RELAIS_AUTRE_COMPTE_CHANTIER_ACCUEIL_2026-08-31.md`.
>
> **2026-08-31** : la maquette `MAQUETTE_ACCUEIL_PORTE_ENTREE_VALIDEE_2026-08-27.html`
> a été corrigée pour refléter les points 2 et 3 ci-dessous (carte « Vous hésitez
> encore ? » repositionnée sur le module d'orientation + bouton « Liens utiles » au
> pied de page). Vérifiée au navigateur, clair et sombre.
>
> **2026-08-31, avancement code** :
> - Bloc 1 fait et commité (`a3c896e`).
> - Blocs 2 + 5 + 6 + une partie du Bloc 3 faits (mêmes commits) : 6 cartes
>   d'accueil (`htmlCarteAccueil` + `ouvrirCarteAccueil` dans `data/metiers.js`),
>   redistribution des 12 tuiles, panneaux (fenêtre ERIP) par carte, tuiles en
>   jetons de couleur (fini le `#eaf2ff` en dur), « Retour » des pages d'intro
>   recâblé sur `retourVersCarteAccueil(carteRetour)`, bouton « Liens utiles »
>   au pied de page (`liens_utiles`), carte « Vous hésitez encore ? » ->
>   `aide-decision-intro`. Barre de recherche remontée en haut + panneau de
>   résultats qui s'ouvre vers le bas + exemple qui tourne dans le champ vide
>   (moteur de recherche INCHANGÉ). `AIDE_PAGES.cv` réécrit pour les 6 cartes.
>   608 tests verts + navigateur clair/sombre.
> - Panneaux de carte repris au style EXACT de la maquette (`.sous-carte-accueil` :
>   fond sobre, bordure transparente -> accent au survol, icône accent, libellé
>   gras + phrase de description ; titre = picto d'accent + libellé). « Mes
>   Repères » garde l'ancre `&#9875;` (bi-anchor absent du jeu auto-hébergé).
>   Commit `88f0aae`.
> - **Bloc 4 fait** (`<commit>`) : la recherche trouve les outils/modules par
>   leur nom (`MODULES_RECHERCHABLES` dans `data/baseConnaissancesERIP.js`,
>   groupe « Dans l'application », `ouvrirCibleRechercheApp` dans app.js) ; les
>   définitions du Lexique s'affichent DIRECTEMENT dans les résultats
>   (tronquées) avec un bouton « En savoir plus dans le Lexique », jamais de
>   redirection auto. Freins déjà couverts avant ce chantier.
> - Panneau unique pour les 6 cartes (même « Se tenir informé » et « Vous
>   hésitez encore ? » à une sous-carte) + bouton « ← Retour » discret sur
>   chaque panneau + icône Repères `bi-bookmark-star`. Commit `a86e650`.
> - **Bloc 7 partiel** (`b14e548`) : disquette = pilule « Sauvegarder » sur
>   l'accueil, icône seule en parcours. Disposition des 3 boutons du haut
>   alignée sur la maquette (rangée 1 : œil + ampoule ; rangée 2 : la
>   pilule). Titre de l'accueil sans l'emoji main.
> - Décision Denis : **on garde les 5 couleurs de pulse** (LECONS 1sexies §2).
>   Le relais pt 14 (« pulse d'attention en ambre ») vise seulement la future
>   infobulle « i » par carte, pas les 5 pulses des icônes persistantes.
> - Fenêtre « Liens utiles » (`ouvrirFenetreRessourcesExplorer`) reprise au
>   visuel de la maquette : liens groupés « Partout en France » / « Selon
>   votre département », boutons bordés pleine largeur, + annuaire DORA.
>   `contenuCarteRessource` supprimée. Commit `f7b2039`.
> - Module Repères : ancre `⚓` remplacée par `bi-bookmark-star` **partout**
>   (h1, boutons, encarts, aide, Bilan, Cohérence, Lexique, Carnet, Regard
>   extérieur). LECONS 9.9. Commit `996f975`. Les 4 icônes de type de Repère
>   inchangées. Les maquettes `docs/` gardent l'ancre (références historiques).
> - **2026-08-31, révisions Denis appliquées** : pulse unique = couleur
>   d'accent pour TOUT sur l'accueil (le bleu), plus de jaune (LECONS 1sexies
>   §2 réécrit, keyframe `pulseAccentPersistant`) ; 3 couleurs d'accent en plus
>   (violet, turquoise, framboise) avec pastille de couleur sur chaque bouton ;
>   loupe de la barre de recherche en `bi-search` accent ; les 5 boutons du haut
>   + leurs panneaux aux icônes de la maquette (`bi-gear` / `bi-lightbulb` /
>   `bi-floppy` / `bi-journal-text` / `bi-journals`) ; pied de page à 3 boutons
>   d'un style d'icône homogène ; bandeau (`.progression`) retiré de l'accueil,
>   gardé seulement dans les 3 parcours CV ; « bientôt disponible » retiré des
>   sous-cartes ; infobulle « i » par carte FAITE (texte validé dans
>   `INFOS_CARTE_ACCUEIL` de `data/metiers.js`, s'ouvre au survol ET au clic,
>   `position:fixed` déplacée sur `document.body`).
> - **2026-08-31, sweep icône d'identité de module TERMINÉ** (commits `996f975`,
>   `70d743d`, `72962a4`) : chaque module porte son logo Bootstrap en couleur
>   d'accent partout où son nom apparaît. Bilan `bi-graph-up`, Cohérence
>   `bi-check2-circle`, Lettre `bi-pen`, Entretien `bi-mic`, Découverte
>   `bi-stars`, ATS `bi-card-checklist`, Regard recruteur `bi-image`, Se tenir
>   informé `bi-newspaper`, Comparer mes pistes `bi-signpost-split`, Repères
>   `bi-bookmark-star`, Carnet `bi-journal-text`, Lexique `bi-book`, Journal
>   `bi-journals`. Seul emoji gardé : le H1 du document de synthèse exporté
>   (`app.js:13978`, HTML autonome sans la police Bootstrap Icons).
> - **2026-08-31, lot « petit et rapide »** (`61b2479`, `77c4421`, `f7b0a4e`,
>   `9f3b585`) : icônes du panneau Aide + fenêtre « À quoi sert cette page ? »
>   en accent ; icône d'identité de module en accent partout (états vides,
>   cartes), doublon d'icône retiré sur l'intro Repères ; les 16 prompts
>   s'ouvrent par « ce message est une consigne à exécuter, pas un document à
>   commenter » ; `ouvrirChoixPreparationAccueil` doublon supprimé (202 lignes
>   mortes, l'ancienne fenêtre à 12 tuiles ne s'ouvre plus) ; pulse de
>   découverte = une sous-carte à la fois ; CSS mort retiré
>   (`pulseAidePreferences`, `.lien-confidentialite`, `.carte-retour-experience`).
> - Le **mini-chantier prompt bilan-v1** était déjà fait (`dc57b90`) :
>   compactage + Carte 3 CV léger + synthèse 4-6 phrases. Reste : Denis valide
>   sur de vrais CV.
> - **2026-09-01 : CHANTIER CLOS.** Les 2 derniers points de l'accueil sont
>   faits : (1) « un seul pulse persistant à la fois » = coordinateur
>   `_pulsePersistantDemander` (priorité disquette > aide > préférences, le « i »
>   d'un panneau passe devant), commit `722b972`, vérifié au navigateur ;
>   (2) « fin du Bloc 3 » = l'encart de résultats de recherche est correct en
>   CSS (`position:absolute` sous la barre) — la « position calculée en JS » du
>   recueil n'était pas nécessaire, vérifié (aligné, opaque, vers le bas,
>   redimensionnement OK). Décidé : pas de sous-groupes dans « Boîte à outils ».
>   Reporté (quand les modules existeront) : texte des pages ATS / Regard
>   recruteur / Se tenir informé / Comparer mes pistes.
> - **Détaché en chantier à part** (`docs/CHANTIER_BOUTON_REVOIR_PRESENTATION.md`,
>   ex-point 12) : bouton « Revoir la présentation » harmonisé en haut à gauche
>   + généraliser les 3 comportements du patron page d'intro à Cohérence +
>   Découverte.
> - **Hors accueil, en attente** : dette B.1 (fusion des 5 collecteurs de
>   contexte de candidature) ; validation de `bilan-v1.md` (`dc57b90`) sur de
>   vrais CV.

## 1. Structure d'accueil : la maquette validée est gardée telle quelle

Référence : `docs/MAQUETTE_ACCUEIL_PORTE_ENTREE_VALIDEE_2026-08-27.html`.
Denis l'a revue le 2026-08-31 et confirmée sans réserve (« j'adore cette maquette,
je garde »). Structure : 6 cartes, une seule couleur (le bleu actuel), recherche
en haut, styles existants, aucune charte nouvelle.

## 2. Carte 6 « Vous hésitez encore ? » : devient la carte du module d'orientation

- Le **nom de la carte est conservé** (« Vous hésitez encore ? ») : il colle au
  besoin de la personne qui n'a pas encore de projet.
- Le **contenu** derrière la carte devient le **module d'aide à la décision
  d'orientation** (« Comparer mes pistes », `docs/CHANTIER_AIDE_DECISION_ORIENTATION.md`).
- **Tant que ce module n'est pas construit** : la carte ouvre sa page de
  présentation avec le **bouton d'entrée désactivé**, exactement comme ATS,
  Regard recruteur et Se tenir informé (mécanisme `ctaDesactive` + `ctaNote` de
  `htmlPageIntroModuleParcours`, `data/metiers.js`). Message homogène « c'est
  prévu, pas encore prêt ».
- Les **liens** qui vivaient dans « Vous hésitez encore ? » en sortent (voir 3).

## 3. Nouveau bouton « Liens utiles » en bas de page

- Bas de page aujourd'hui : « Confidentialité de vos données » + « Retour sur
  votre expérience ».
- **Nouveau bouton « Liens utiles » inséré ENTRE les deux.**
- Au clic : la **fenêtre de liens qui existe déjà** (`ouvrirFenetreRessourcesExplorer`,
  `js/app.js`). On **réutilise**, on ne recopie pas : une seule liste à tenir à
  jour, déjà partagée avec le bouton « Et après ? » de fin de parcours
  (`btnRessourcesExplorerFin`).
- La fenêtre **garde la question du département** (24 / 87 / ailleurs) : sinon on
  montrerait les liens de la Haute-Vienne à quelqu'un de Dordogne. Mécanisme
  `demanderDepartementSiInconnu` + `RESSOURCES_DEPARTEMENTS` déjà en place.
- Denis assume que peu de personnes iront cliquer : acceptable pour de la
  référence, l'important est que la possibilité existe. Piste future : quand le
  module « Vous hésitez encore ? » sera construit, il pourra pointer vers
  « Liens utiles » depuis l'intérieur.

## 4. Les 4 pages sans module : bouton d'entrée désactivé partout

ATS, Regard recruteur, Se tenir informé, Comparer mes pistes (= « Vous hésitez
encore ? ») : toutes gardent un **bouton d'entrée désactivé** sur leur page de
présentation. Comportement déjà en place dans le code (routes `*-intro`), à
confirmer sur chacune au moment du code.

## 5. Redistribution des 12 tuiles actuelles de la Boîte à outils

Aujourd'hui `ouvrirChoixPreparationAccueil` (`data/metiers.js`) contient 12 tuiles
identiques : 8 modules construits + 4 pages de présentation sans module.

| Carte d'accueil | Sous-cartes (ce qui s'ouvre derrière) |
|---|---|
| 1. Mes documents | Créer un nouveau CV / J'ai déjà un CV / Mettre à jour mon CV |
| 2. Me préparer à candidater | Co-construire ma lettre / Préparer un entretien / Regard recruteur (entrée désactivée) |
| 3. Boîte à outils | Découvrir mes compétences / Mes Repères / Mon Carnet / Lexique |
| 4. Outils d'analyse | Analyser ma candidature / Cohérence de mon dossier / ATS (entrée désactivée) |
| 5. Se tenir informé | Actualités (entrée désactivée) |
| 6. Vous hésitez encore ? | module d'aide à la décision d'orientation (entrée désactivée pour l'instant) |

**Décision Denis 2026-08-31** : les **6 cartes ouvrent toutes le même panneau**
(fenêtre ERIP + sous-cartes), y compris « Se tenir informé » et « Vous hésitez
encore ? » qui n'ont qu'une sous-carte aujourd'hui. Base stable, prête pour
d'autres modules sans tout reconfigurer. Chaque panneau porte, en plus de la
croix, un **bouton « ← Retour »** discret (jamais plus marqué que la croix), qui
ferme le panneau (retour à l'accueil).

**Icône « Mes Repères »** dans la sous-carte : `bi-bookmark-star` (un repère = un
point qu'on marque pour y revenir). `bi-anchor` est absent du jeu d'icônes
auto-hébergé (`vendor/bootstrap-icons`) et rendait mal. **À harmoniser** : le
module Repères utilise encore l'ancre `⚓` dans son `<h1>`, ses boutons
d'ancrage, etc. (LECONS 9.9) - petit passage dédié à prévoir.

La fenêtre « Préparer ma candidature » actuelle (12 tuiles) se vide au profit des
panneaux de chaque carte.

## 6. « Ressources » (puce de la maquette) est retirée

La maquette montre encore une puce « Ressources » sous la Boîte à outils : elle
date d'avant la décision du 2026-08-28 (les freins / ressources ne sont **pas un
module**, juste `data/freins.js`, et l'annuaire = PCGI 87 + DORA, pas de doublon).
Les liens correspondants vivent désormais dans « Liens utiles » et dans le Lexique.

## 8. Inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / TRANSFORMÉ / AJOUTÉ / RETIRÉ de `pageChoixCV()`

Fait avant tout code (méthode « zéro régression », `docs/TRAVAILLER_AVEC_DENIS.md`).
`pageChoixCV()` : `js/app.js` lignes 3914 à 4184. `afficherProgression()` : lignes 3148 à 3205.

| Élément actuel de `pageChoixCV()` | Devient | Détail / vigilance |
|---|---|---|
| `afficherProgression('cv')` - liste des 7 étapes (`.progression-etapes`) | **RETIRÉ de l'accueil** (relais pt 5, validé) | Ne plus rendre la liste sur l'accueil (pas juste masquer en CSS). Les autres pages du parcours la gardent : ne pas toucher `afficherProgression()` pour elles. |
| `afficherProgression('cv')` - `.actions-session` (Restaurer / Réinitialiser) | **GARDÉ** | Extraire dans un helper `htmlActionsSession()` appelé par l'accueil ET par `afficherProgression()`. Conditions d'affichage inchangées (`activeId === 'cv' && sauvegardeExiste()` pour Restaurer ; `historiquePages.length > 1` pour Réinitialiser). |
| Titre `Par où voulez-vous commencer ?` + sous-titre `Choisissez votre point de départ.` | **GARDÉ à l'identique** | Déjà dans la maquette. |
| 3 cartes CV (`data-action="mode"`, valeurs `nouveau` / `pret` / `maj`) + écouteur de clic | **DÉPLACÉ** dans le panneau de la carte d'accueil « Mes documents » | Conservé : `effacerSauvegarde()`, `dossier.modeCreation`, `trackEvenement('mode_creation_choisi', {mode:'nouveau'})`, reset `dossier.cvAnalyse/competencesCV/savoirsCV`, `naviguerVers('objectif')`. `pret` et `maj` restent interceptés par l'écouteur global de `data/metiers.js` (`ouvrirAssistantDepotCV`) : vérifier que son sélecteur matche toujours les cartes déplacées. Écouteur rebranché à l'ouverture du panneau, scopé au panneau (LECONS 9.7). Libellé à harmoniser : code dit « Mettre mon CV à jour », maquette dit « Mettre à jour mon CV ». Les textes de la maquette sont la cible. |
| Carte `#btnPreparationAccueil` « Boîte à outils » + `ouvrirChoixPreparationAccueil()` | **GARDÉ comme carte d'accueil**, contenu **redistribué** (voir §5) | La fenêtre à 12 tuiles éclate. Carte 3 « Boîte à outils » ne garde que Découvrir mes compétences / Mes Repères / Mon Carnet / Lexique. Les 8 autres tuiles vont dans les panneaux des cartes 2, 4, 6. `effacerSauvegarde()` au clic : voir §9, point 1. |
| Carte `#btnRessourcesExplorerAccueil` « Vous hésitez encore ? » (le bloc HTML) | **TRANSFORMÉ** | Reste une carte d'accueil. Contenu = module « Comparer mes pistes » (aide à la décision d'orientation), bouton d'entrée désactivé tant que le module n'existe pas. Texte adapté (déjà fait dans la maquette). |
| Action de « Vous hésitez encore ? » : `ouvrirFenetreRessourcesExplorer('Vous hésitez encore ?...')` + `trackEvenement('outil_utilise', {outil:'ressources_hesitation'})` | **DÉPLACÉ** vers le nouveau bouton `#btnLiensUtiles` du pied de page | Même fonction réutilisée telle quelle (garde la question de département 24/87/ailleurs). Nom d'événement Umami : voir §9, point 2. Pas d'`effacerSauvegarde()` (jamais un engagement), inchangé. |
| `#btnLiensUtiles` « Liens utiles » (pied de page, entre Confidentialité et Retour sur votre expérience) | **AJOUTÉ** | Nouveau bouton. Ouvre `ouvrirFenetreRessourcesExplorer()`. |
| Barre de recherche : `#rechercheERIPInput` + `#resultatsRechercheERIP` (`.resultats-erip-dropdown`) + `#overlayRechercheERIP` | **DÉPLACÉ** (remontée en haut de page) + **ENRICHI** | `rendreResultatsRechercheERIP()` / `rechercherBaseConnaissances()` / `rechercherMetiersDepuisTexte()` gardés à l'identique. Corriger le sens d'ouverture du dropdown (vers le bas une fois en haut). Encart flottant blanc opaque calculé en JS sous la barre. Effet « exemple de recherche qui change toutes les 5 à 6 s » (repris de la maquette Boussole). Élargissement de la couverture (voir ligne suivante). C'est un bloc à part entière, jamais le bloc 1. |
| Écouteur `input` de la recherche + suivi Umami debounce 600 ms (`recherche_utilisee`, `recherche_sans_resultat` si `dataset.rechercheVide === '1'`, texte tronqué 100) | **GARDÉ à l'identique** | Suit la barre dans son nouvel emplacement. |
| Routeur de clic sur `#resultatsRechercheERIP` : `<a>` Fiche ROME / `[data-frein-code]` / `[data-lexique-fiche-ouvrir]` / `[data-renvoi-annuaire]` / `[data-recherche-vers-lexique]` / `[data-metier-nom]` / `[data-competence-nom]` / `[data-champ-associe]` / `[data-domaine-nom]` | **GARDÉ intégralement** + **ENRICHI** | Cœur du moteur à ne pas perdre (relais §4). `effacerSauvegarde()` sur métier / compétence / champ / domaine conservé ; les branches frein / Lexique / annuaire restent sans engagement (`return`). Nouvelles branches : nom de module (mène à sa carte), définition Lexique affichée directement (jamais de redirection automatique, bouton « En savoir plus » optionnel). |
| `#overlayRechercheERIP` clic : vide le champ + `rendreResultatsRechercheERIP('')` | **GARDÉ** | À adapter au nouvel encart flottant (ne plus ancrer au bas de l'écran). |
| `#btnRetourExperience` « Retour sur votre expérience » (`.carte-retour-experience`) + `trackEvenement('outil_utilise', {outil:'retour_experience'})` + `ouvrirFenetreRetourExperience()` | **GARDÉ** | Bouton du pied de page (déjà dans la maquette). |
| `#btnConfidentialite` « Confidentialité de vos données » (`.lien-confidentialite`) + `ouvrirModaleConfidentialite` | **GARDÉ** | Bouton du pied de page (déjà dans la maquette). |

### Hors périmètre strict de `pageChoixCV()`, mais à traiter dans le chantier

- **5 icônes persistantes** (`#btnPreferencesAffichage`, `#btnAide`, `#btnSessionTransfert`, `#btnCarnet`, `#btnJournalParcours`) : vivent dans `index.html`, câblées ailleurs (`initBoutonSessionTransfert`...). La maquette propose une rotation d'emplacement : bloc séparé.
- **`AIDE_PAGES` / `AIDE_FENETRES`** : une entrée d'aide par nouveau panneau de carte (LECONS règle 3). `AIDE_PAGES.cv` entrée `#btnPreparationAccueil` déjà à jour (8 outils), à re-vérifier après redistribution.
- **Infobulle « i » par carte** : `.bulle-info-hover` / `initBulleInfoHoverFlottante()` (relais pt 7), à l'intérieur du panneau, jamais reconstruite.
- **Un seul pulse à la fois** (relais pt 8) + **couleur de pulse dédiée ambre** (relais pt 14).
- **Disquette « Sauvegarder »** : mot affiché à côté de l'icône sur l'accueil, disparaît dès l'entrée dans un parcours (relais pt 13).

### Découpage en blocs (VALIDÉ par Denis le 2026-08-31)

1. `htmlActionsSession()` extrait + accueil ne rend plus les 7 étapes. Petit, testable en Node, aucun impact sur les autres pages.
2. Coquille des 6 cartes d'accueil + panneaux (Mes documents et ses 3 sous-cartes câblées ; les 5 autres cartes + sous-cartes). Redistribution des tuiles. Infobulles « i ».
3. Barre de recherche remontée + encart flottant + sens d'ouverture corrigé + effet d'exemples. Moteur inchangé.
4. Élargissement de la couverture de recherche (nom de module, définition Lexique directe).
5. Bouton « Liens utiles » + déplacement de l'action depuis « Vous hésitez encore ? ».
6. Carte « Vous hésitez encore ? » vers la page de présentation « Comparer mes pistes » (entrée désactivée).
7. Icônes persistantes (emplacement) + pulse unique + couleur ambre + disquette « Sauvegarder ».

## 9. Points tranchés (Denis, 2026-08-31)

1. **Ouvrir le panneau d'une carte d'accueil ne fait PAS `effacerSauvegarde()`.**
   L'engagement reste le clic sur une sous-carte qui lance vraiment un parcours (ou la carte « Créer un nouveau CV »). Ouvrir un panneau pour regarder ce qu'il contient ne doit pas faire perdre une session restaurable. Aujourd'hui `#btnPreparationAccueil` fait `effacerSauvegarde()` dès l'ouverture : à retirer de l'ouverture, à déplacer sur les sous-cartes qui engagent.
2. **Suivi Umami de « Liens utiles » = nouvel événement `liens_utiles`.**
   Le sens change : ce n'est plus « la personne hésite » mais « la personne consulte des liens ». Un événement distinct sera créé pour la future carte « Vous hésitez encore ? » quand le module existera. Continuité de stats perdue : négligeable.

## 10. Reste à trancher avec Denis (quand reposé)

- Sous-groupes avec sous-titres à l'intérieur de la Boîte à outils (relais
  point 10) : « Mieux se connaître » vs autre ? A voir si utile avec seulement
  4 sous-cartes.
- Contenu exact de la page de présentation intérimaire de la carte 6.

L'ordre des blocs de code est tranché (voir §8, découpage validé le 2026-08-31).
Prochaine étape : Bloc 1, quand Denis sera reposé (Mode A, on ne commence pas à
moitié).
