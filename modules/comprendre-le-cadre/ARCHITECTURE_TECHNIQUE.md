# Module Comprendre le cadre : Architecture technique

**Statut** : implémentation complète des 7 étapes envisagées (accueil, lecture d'un rayon, orienteur,
« Près de chez moi », bascule + branchement réel depuis l'accueil d'ERIP, digests Balayage/Chiffres,
aide guidée), chaque étape vérifiée en navigateur. Le 2026-09-06, l'orienteur « Par où commencer ? »
est devenu **« Affiner ma recherche »** : les 14 cases (voie rapide) sont conservées et un **champ
libre** a été ajouté, qui prépare une **recherche en deux temps** (même principe que le Bilan et le
Composeur). Voir la section « Affiner ma recherche » plus bas et
`docs/CHANTIER_COMPRENDRE_LE_CADRE_RECHERCHE_LIBRE.md`. La conception (pourquoi, quoi) vit dans
`docs/CHANTIER_SE_TENIR_INFORME_MAJ_2026-09-03.md`, `docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html`
et `docs/VEILLE_PROMPTS.md` : ce document ne couvre que le comment. Le contenu vit
désormais dans `modules/comprendre-le-cadre/contenu/<rayon>/`. Les **14 rayons ont été vérifiés sur
les sources officielles puis migrés** entre le 2026-09-05 et le 2026-09-06 (voir la section
« Migration du contenu » plus bas) : tous les rayons se chargent. Les suites (fiches recommandées,
adresses bloquées à finaliser au navigateur) sont dans `docs/COMPRENDRE_LE_CADRE_SUITES_2026-09-05.md`.

> **Mise à jour (2026-09-13, audit de cohérence)** : 2 rayons ajoutés depuis la migration ci-dessus,
> hors du chiffre "14 rayons" qu'elle décrit - `employeurs` (2026-09-12) et `sante` (2026-09-13, voir
> `docs/TACHES_VALIDEES.md`). **17 rayons au total** aujourd'hui, **127 fiches** (contre 86 à la
> migration). Le principe de migration et les mécanismes décrits plus bas (README de rayon,
> `<rayon>.collecte.md`, `liens-verifies.txt`) n'ont pas changé : chaque rayon ajouté depuis suit le
> même patron, juste sans passer par un balayage "migration" en un bloc daté comme les 14 premiers.
Le digest Balayage a un **premier jet** publié le 2026-09-06
(`contenu/balayage/2026-06.md`, avril-juin) : relu par Denis, à **compléter** par
le complément manuel du Balayage (sites bloqués). Le
digest Chiffres est parti dans son propre module (`modules/comprendre-les-chiffres/`).
Le socle méthode est câblé (2026-09-06) : `contenu/methode/` (2 fiches, la 3e
partie dans « Comprendre les chiffres ») et `sources.txt` sont affichés dans
deux dépliants en bas de l'accueil (`_comprendreLeCadreRenduAccueilExtra`).
_Ancien reste, désormais fait :_ Le socle méthode restait à
câbler (chantier « Comprendre les chiffres »).

---

## Principe directeur

Module de consultation pure, FAMILLE 1 (décision de la maquette) : pas de gel de session, pas de
reprise, rien à sauvegarder. Contrairement à Repères, au Carnet ou à Comparer mes pistes, aucune
donnée personnelle n'y transite : pas de `dossier.*` à lire ni à écrire. Sa seule mémoire est le
département déjà choisi par la personne (brique partagée, voir plus bas), et aucun assistant en ligne
n'est appelé depuis l'application elle-même : tout échange avec un assistant reste manuel, hors de
l'application, via un texte que la personne copie-colle elle-même (même principe que `outils/veille.html`,
jamais un `fetch()` vers un assistant depuis le module public).

Le contenu (fiches `.md`) reste hors du module lui-même : `index.js` sait les lire, jamais les écrire.
Une fiche produite ou modifiée passe toujours par `outils/veille.html`, jamais par un formulaire de
l'application publique.

Fichiers du module, même patron que Repères/Carnet/Lexique : `index.js` (rendu, événements, état,
point de contact unique), `comprendre-le-cadre.css`, ce fichier. Le contenu lui-même
(`contenu/<rayon>/*.md`, `liens-verifies.txt`, `sources.txt`, `contenu/methode/*.md`) est une
sous-arborescence de données, jamais mêlée au code.

## Dépendances externes

| Dépendance | Nature | Justification |
|---|---|---|
| `demanderDepartementSiInconnu(cb)` (`js/app.js`) + `localStorage['CLE_DEPARTEMENT_RESSOURCES']` | Brique transversale | Brique canonique du territoire, déjà utilisée par Ressources (`docs/BRIQUES_COMMUNES.md`, ligne « Territoire / département »). Sert à filtrer les `structures:` de la collecte du rayon ouvert. Jamais un deuxième sélecteur de département propre au module. |
| `rechercherBaseConnaissances()` (`data/baseConnaissancesERIP.js`) | Brique transversale | Entrée `'Se tenir informé' → route:se-tenir-informe-intro` déjà présente dans `MODULES_RECHERCHABLES`. Reste à ajouter, une fois le module câblé : les rayons comme catégorie de résultat, selon le même patron qu'une catégorie existante (une fonction courte, jamais une deuxième barre de recherche). |
| `naviguerVers(route)` / table `routes` (`js/app.js`) | Orchestration | `js/app.js` appelle `pageComprendreLeCadre()`, jamais l'inverse, même patron que `pageComparerPistes()` et `pageDecouverte()`. |
| `echapperAttribut()`, `trackEvenement()` (`js/app.js`) | Utilitaires transversaux | Même statut que pour les autres modules de contenu (Carnet, Repères, Regard extérieur). |
| `pageIntroSeTenirInforme()` (`data/metiers.js`) | Page d'entrée existante | Déjà écrite et routée (`'se-tenir-informe-intro'`), CTA désactivé (`ctaDesactive: true`, note « module en préparation ») en attente du module. À l'implémentation : retirer `ctaDesactive`, ajouter `onCta`, même bascule que celle déjà faite pour `pageIntroAideDecision` lors de la construction de Comparer mes pistes. |
| `fetch()` vers `modules/comprendre-le-cadre/contenu/<rayon>/*.md` | Donnée | Chargement à la demande, un rayon à la fois (jamais les 86 fiches au chargement de l'application) : voir « Flux de données ». |

**Ce que ce module ne dépend jamais de** : `dossier.*` (aucun champ du dossier de candidature, aucune
sauvegarde de session, décision FAMILLE 1) ; `promptCache()`, `ASSISTANTS_IA`,
`ouvrirFenetreAssistantIA()`, `activerCollageInstantane()`, ou tout autre mécanisme d'appel à un
assistant en ligne depuis l'application (absence volontaire, même principe que `outils/veille.html` :
aucune clé d'API, aucun budget de tokens, tout échange avec un assistant reste manuel et hors de
l'application) ; `data/freins.js` / `FREINS_REPERTOIRE` (système parallèle, plus fin et plus large,
86 fiches contre 17 codes fermés ; un lien ponctuel d'un code frein vers un rayon reste possible plus
tard, jamais une fusion des deux corpus).

## Flux de données : du `.md` à l'écran

Pas de build, pas de script de génération (le projet n'en a aucun ; `scripts/checkLexique.js` est un
validateur, pas un générateur). Le module lit les fichiers source directement :

1. À l'ouverture d'un rayon, `fetch()` les fichiers `.md` de ce rayon (6 ou 7 fiches selon le rayon)
   plus son `<rayon>.collecte.md`, jamais les 14 rayons au chargement de l'application.
2. Un frontmatter YAML minimal, parsé par une fonction portée depuis `parseFiche()`
   (`outils/veille.html`), mêmes champs : `id`, `rayon`, `titre`, `pour_qui`, `tags`, `territoire`,
   `statut`, `frein`, `verifie_le`, `lexique`, `sources`, `ce_qui_change_souvent`, `revisions`,
   `collecte`.
3. Une fiche `statut: retire` ne s'affiche jamais, même filtre que celui déjà appliqué côté
   `outils/veille.html` (`fichesDuRayon()`).
3bis. Le champ `frein` (booléen) est **parsé mais consommé nulle part** aujourd'hui (Freins et
   Comprendre le cadre restent deux systèmes séparés). Ses valeurs dans les fiches sont
   hétérogènes : ne pas s'y fier tant qu'aucun code ne le lit. **Règle à appliquer d'un coup au
   moment du branchement** (contrôle de contenu 2026-09-05) : `frein: true` = la fiche traite un
   obstacle concret à trouver ou garder un emploi que la personne doit lever (argent, transport,
   logement, garde d'enfant, langue, santé, papiers, blocage juridique) ; `frein: false` = la fiche
   explique un mécanisme, un droit ou une structure d'accompagnement.
3ter. Le champ `territoire` est lui aussi **parsé, consommé nulle part** dans `index.js`. Valeurs
   possibles : `national` (toutes les fiches sauf une), `region`, `24`, `87`. Depuis le 2026-09-08,
   `creer-s-installer-en-agriculture` porte `territoire: region` (décision Denis : l'aide à
   l'installation, cœur de la fiche, est régionale). C'est la seule fiche non `national` : si un
   jour le champ pilote un affichage ou un filtre, prévoir que ce parcours reste utile hors
   Nouvelle-Aquitaine (seule la DNJA est régionale), et vérifier ce que devient une fiche `region`
   pour un utilisateur hors 24/87.
4. Les `structures:` de la collecte ne sont jamais affichées dans le corps d'une fiche (décision 20 de
   la maquette), seulement dans l'écran « Près de chez moi », filtrées par le département de
   `CLE_DEPARTEMENT_RESSOURCES`.
5. Les digests trimestriels (`contenu/balayage/`, `contenu/chiffres/`) suivent le même principe de
   lecture à la demande, jamais préchargés : les 8 derniers trimestres civils complets sont tentés un
   par un (`fetch()` tolérant au 404), sans manifeste séparé - le nom du fichier fait foi.
   `contenu/a-confronter/` n'est pas encore lu par le module (voir étape 6 ci-dessous).

## Façade publique

- `pageComprendreLeCadre()` : point d'entrée, appelée par la table `routes` de `js/app.js` sur la clé
  `'comprendre-le-cadre'`. Dessine l'écran d'accueil du module (choix de territoire, orienteur, 14
  rayons groupés en 4 familles, outils) ou l'écran courant selon l'état interne de navigation (rayon
  ouvert, fiche ouverte), même patron que `pageComparerPistes()` / `pageDecouverte()` : une seule
  fonction de rendu, l'état décide quoi dessiner, jamais une route par écran.
- Aucune autre fonction publique tant qu'aucun appelant réel n'existe, même règle que Carnet, Repères
  et Regard extérieur.

### Écran-porte : aperçu verrouillé du contenu (2026-09-09)

Tant qu'aucun territoire n'est connu (`_comprendreLeCadreTerritoireConnu()` faux), le module rend
`_comprendreLeCadreRenduChoixTerritoire()` au lieu de l'accueil. Depuis 2026-09-09 (décision Denis :
« je veux qu'on voie le contenu, mais qu'il soit inaccessible tant que je n'ai pas choisi le
territoire »), cet écran ne se limite plus à l'appel à l'action : il ré-affiche
`_comprendreLeCadreRenduFamilles()` + `_comprendreLeCadreRenduOutils()` dans un conteneur
`.comprendre-le-cadre-apercu-verrou` (`data-comprendre-le-cadre-apercu`). Le contenu interne
(`.comprendre-le-cadre-apercu-contenu`) porte l'attribut `inert` (clavier + tabulation coupés) et
`pointer-events: none` en CSS, ce qui fait remonter tout clic au conteneur.
`_comprendreLeCadreBrancherChoixTerritoire()` branche le même déclencheur
(`demanderDepartementSiInconnu` puis `pageComprendreLeCadre`) sur le bouton, sur un clic dans la zone,
et sur Entrée / Espace (le conteneur est `role="button" tabindex="0"`). Le choix fait, la porte
disparaît et l'accueil réel est rendu, inchangé.

Le nom exact `pageComprendreLeCadre` suit la convention de nommage des pages routées existantes ; à
ajuster en `pageSeTenirInforme` si Denis préfère nommer la fonction d'après la carte d'accueil plutôt
que le sous-module, notamment si d'autres sous-cartes rejoignent un jour « Se tenir informé ».

## Points de contact avec le reste d'ERIP

1. ✅ `js/app.js`, table `routes` : `'comprendre-le-cadre': pageComprendreLeCadre`.
2. ✅ `data/metiers.js`, `pageIntroSeTenirInforme()` : `ctaDesactive` retiré, `onCta` ajouté (navigation
   vers `'comprendre-le-cadre'`), même bascule que celle déjà faite pour Comparer mes pistes
   (`pageIntroAideDecision`). Texte repris à l'identique de la maquette validée.
3. ✅ `data/baseConnaissancesERIP.js` : entrée `MODULES_RECHERCHABLES` réécrite (description + mots-clés,
   `cible: 'route:se-tenir-informe-intro'` conservée) et bloc ajouté dans `rechercherBaseConnaissances()`
   qui fait remonter chaque rayon de `RAYON_LABEL` dont le titre ou le « quoi » correspond à la
   recherche (commit 004cc12). La recherche d'accueil mène toujours à la présentation du module ou à
   un rayon, jamais directement au fond d'une fiche.
4. ✅ `index.html` : `<link rel="stylesheet" href="modules/comprendre-le-cadre/comprendre-le-cadre.css">`
   plus `<script src="modules/comprendre-le-cadre/index.js" charset="UTF-8">`, chargés avant `js/app.js`.
5. « Affiner ma recherche » (ex-orienteur) : tables déclaratives internes au module (`ORIENTEUR_CASES` /
   `RAYON_LABEL`, échange du 2026-09-04 ; `COMPRENDRE_LE_CADRE_QUESTIONS_UNIVERSELLES` /
   `COMPRENDRE_LE_CADRE_QUESTIONS_RAYON` pour les précisions ; `_comprendreLeCadreSocleRecherche()` /
   `COMPRENDRE_LE_CADRE_TON_RECHERCHE` pour les textes de recherche). Aucun point de contact externe :
   les cases ne font que naviguer vers les rayons du module ; le champ libre ne fait que produire un
   texte à copier chez un assistant en ligne. `ASSISTANTS_IA` / `ASSISTANTS_SANS_COMPTE_IA` (globaux
   partagés) sont lus pour la liste des assistants.
6. ✅ `tests/_domStub.js` : stub `pageComprendreLeCadre` ajouté (LECONS 1quater), requis pour que les
   tests Node continuent de passer une fois la route réelle.

## Aide guidée

`AIDE_PAGES` (`js/app.js`) : deux points de couverture, comme pour Carnet/Repères/Lexique.

- `AIDE_PAGES.cv`, entrée `[data-carte-accueil="informe"]` : déjà écrite avant le module (texte
  générique, `bi-newspaper`), toujours valable telle quelle une fois le module réel branché - pas
  réécrite à cette étape.
- `AIDE_PAGES['comprendre-le-cadre']` (4 fiches) : le territoire (`.comprendre-le-cadre-territoire`),
  les rayons (`#comprendreLeCadreRayons` - id ajouté sur le conteneur uniquement pour cet ancrage,
  même principe que `#reperesListeConteneur`/`#carnetListeConteneur`), « Près de chez moi »
  (`[data-comprendre-le-cadre-ouvrir-structures]`, visible seulement depuis l'écran d'un rayon) et les
  outils (`#comprendreLeCadreOutils`, id ajouté pour la même raison). `demarrerVisiteGuideePage()` ne
  garde que les selecteurs présents dans le DOM courant : une seule liste couvre tous les écrans du
  module, rien à dupliquer par écran.

## Umami

`trackEvenement()`, même garde `if (typeof trackEvenement === 'function')` que partout ailleurs dans
ERIP. Granularité comparable à l'existant : un identifiant de rayon ou de fiche est un identifiant de
catalogue, jamais une donnée personnelle ni un contenu saisi par la personne (à la différence du texte
de recherche envoyé par `lexique_recherche_utilisee`, plus exposé que tout ce qui est envoyé ici).

| Événement | Données | Pourquoi |
|---|---|---|
| `comprendre_le_cadre_territoire_demande` | (aucune) | Écran-porte bloquant affiché faute de territoire connu, avant l'accueil (décision Denis 2026-09-05). |
| `comprendre_le_cadre_accueil_affiche` | (aucune) | Chaque affichage de l'accueil du module. |
| `comprendre_le_cadre_rayon_ouvert` | `{ rayon }` | Clic qui OUVRE un rayon (déclenche le chargement) - mesure quels rayons sont réellement consultés. |
| `comprendre_le_cadre_rayon_affiche` | `{ rayon }` | Chaque affichage de la liste des fiches d'un rayon, y compris un retour depuis une fiche - même distinction ouverture/affichage que `carnet_panneau_ouvert`/`carnet_ecran_ouvert`. |
| `comprendre_le_cadre_fiche_affichee` | `{ fiche }` | Quelle fiche est réellement lue, pour prioriser les futures relectures et collectes - jamais le contenu de la fiche elle-même, seulement son identifiant. |
| `comprendre_le_cadre_orienteur_affiche` | (aucune) | Ouverture de l'écran « Affiner ma recherche ». |
| `comprendre_le_cadre_orienteur_case_cochee` | `{ nb }` | Nombre de cases cochées au moment du calcul du résultat - jamais lesquelles, pour ne pas reconstituer une situation personnelle. |
| `comprendre_le_cadre_recherche_libre_demarree` | (aucune) | La personne a validé son champ libre : un premier texte de recherche est préparé. Jamais le texte lui-même. |
| `comprendre_le_cadre_recherche_prompt1_affiche` | (aucune) | Affichage du premier texte de recherche. |
| `comprendre_le_cadre_recherche_sujets_extraits` | `{ sujets, questions }` | Nombre de sous-chapitres et de questions repérés dans la réponse collée. Jamais leur contenu. |
| `comprendre_le_cadre_recherche_sujets_affiche` | `{ sujets }` | Affichage de l'écran de sélection des sous-chapitres. |
| `comprendre_le_cadre_recherche_questions_affiche` | (aucune) | Ouverture de l'écran « Quelques précisions ». |
| `comprendre_le_cadre_recherche_prompt2_texte_affiche` | (aucune) | Affichage du second texte de recherche. |
| `comprendre_le_cadre_recherche_resultat_vu` | (aucune) | Affichage de la réponse remise en forme. |
| `comprendre_le_cadre_recherche_recommencee` | (aucune) | Bouton « Nouvelle recherche » sur l'écran résultat. |
| `comprendre_le_cadre_structures_affichees` | `{ rayon }` | Ouverture de « Près de chez moi » pour un rayon. |
| `comprendre_le_cadre_digest_affiche` | `{ outil }` | Ouverture de Balayage ou Chiffres - mesure l'usage réel de ces 2 outils avant d'investir dans les 3 restants (sources, vérifier, à confronter). |

## Étapes d'implémentation

1. ✅ Écran d'accueil du module : les 14 rayons groupés en 4 familles (maquette), sans navigation réelle
   vers un rayon, juste l'affichage, avec le choix de territoire déjà branché
   (`demanderDepartementSiInconnu`).
2. ✅ Lecture d'un rayon : `fetch()` plus parseur de frontmatter, liste des fiches d'un rayon, une fiche
   affichée à la fois. Trouvaille : le tableau « Les N fiches » du `README.md` de chaque rayon sert de
   manifeste de fichiers, jamais un second fichier de liste à maintenir en parallèle.
3. ✅ Orienteur « Par où commencer » : les cases de `ORIENTEUR_CASES`, résultat déterministe vers les
   rayons.
4. ✅ « Près de chez moi » : les `structures:` de la collecte du rayon ouvert, croisées avec le registre
   partagé `liens-verifies.txt` - une structure n'affiche un lien cliquable que si son adresse a une
   date de vérification non vide (LECONS 9.16). Depuis le 2026-09-05, les adresses du rayon Justice
   vérifiées par Claude sur les sources officielles portent une date : leurs liens sont cliquables,
   les autres affichent « Adresse pas encore vérifiée ». Les rayons non encore vérifiés restent
   entièrement sans lien cliquable.
5. ✅ Bascule de `pageIntroSeTenirInforme()` (retrait de `ctaDesactive`, ajout d'`onCta`) et branchement
   réel : route `'comprendre-le-cadre'` dans `js/app.js`, script + feuille de style dans `index.html`,
   stub dans `tests/_domStub.js`. Le module est désormais accessible depuis l'accueil réel d'ERIP.
6. ✅ 2 des 5 « outils » de la maquette comme écrans de consultation : Balayage (« Ce qui a changé
   récemment ») et Chiffres (« Comprendre les chiffres »), chargés sans manifeste séparé (le nom de
   fichier fait foi, `<dernier-mois-du-trimestre>.md`). **Volontairement laissés de côté**, à trancher
   avec Denis avant de les construire : le digest Lexique (pas un digest du module, il alimente
   `docs/CORPUS_LEXIQUE.md`, décision VEILLE_PROMPTS.md 5quater), le digest À confronter (alimente un
   bloc par rayon, pas un écran à part, et aucun contenu réel pour aucun des 3 digests à ce jour), le
   tableau des sources officielles et « Vérifier une information récente » (3e et 4e outils de la
   maquette, jamais abordés).
7. ✅ Aide guidée (`AIDE_PAGES['comprendre-le-cadre']`, 4 fiches) et documentation des événements Umami
   déjà codés au fil des étapes précédentes (tableau ci-dessus).

Chaque étape vérifiée en navigateur avant la suivante, même discipline que les modules précédents.

## Affiner ma recherche : la recherche libre en deux temps (2026-09-06)

Conception : `docs/CHANTIER_COMPRENDRE_LE_CADRE_RECHERCHE_LIBRE.md` et
`docs/MAQUETTE_COMPRENDRE_LE_CADRE_RECHERCHE_LIBRE_2026-09-06.html` (validée). Ce qui suit ne couvre
que le comment.

**Écrans** (états de `_comprendreLeCadreEtat.ecran`, un écran par état, jamais une route) :

| État | Rendu | Rôle |
|---|---|---|
| `orienteur` | `_comprendreLeCadreRenduOrienteur` | Les 14 cases (voie rapide, inchangées) **et** le champ libre + garde-fou confidentialité. |
| `recherche-prompt1` | `_comprendreLeCadreRenduRecherchePrompt1` | Premier texte de recherche à copier ; zone pour coller la réponse. |
| `recherche-sujets` | `_comprendreLeCadreRenduRechercheSujets` | Les sous-chapitres renvoyés, en cases à cocher ; la reformulation de l'assistant en encart. |
| `recherche-questions` | `_comprendreLeCadreRenduRechercheQuestions` | Précisions : questions de l'application (universelles + par rayon coché) + questions de l'assistant + champ libre. |
| `recherche-prompt2` | `_comprendreLeCadreRenduRecherchePrompt2` | Second texte de recherche ; zone pour coller la réponse. |
| `recherche-resultat` | `_comprendreLeCadreRenduRechercheResultat` | La réponse remise en forme dans un cadre d'avertissement ; rappel « rien n'est enregistré » ; renvois vers les rayons touchés. |

**Chaîne de retour** (`_comprendreLeCadreAllerVersPrecedent`, un cran à la fois) : `recherche-resultat`
→ `recherche-prompt2` → `recherche-questions` → `recherche-sujets` → `recherche-prompt1` →
`orienteur` → (sortie du module vers la présentation). `_comprendreLeCadreIndexEtape()` renvoie 2
(comme l'orienteur) pour tous les `recherche-*`.

**État de la recherche** : `_comprendreLeCadreRecherche` (variable de module, **jamais persistée** -
décision Denis 2026-09-06, option A : on ignore le temps écoulé entre deux ouvertures et ce qui aura
changé dans la loi). `_comprendreLeCadreRechercheNeuve()` la remet à zéro ; elle est aussi remise à
`null` par « Nouvelle recherche » et « Revenir au module » sur l'écran résultat. Champs : `texteLibre`,
`brutReponse1`, `reformulation`, `sujets` (`[{titre, domaine, description}]`), `questionsAssistant`,
`sujetsChoisis` (indices), `reponsesQuestions` (clé = libellé de la question), `contexteLibre`,
`brutReponse2`.

**Les textes de recherche ne s'inventent pas.** `_comprendreLeCadreSocleRecherche()` et
`COMPRENDRE_LE_CADRE_TON_RECHERCHE` sont **recopiés** de `socleRecherche()` / `TON` de
`outils/veille.html` (fichier autonome hors ligne, aucun JS partageable) : dette de duplication
inscrite dans `docs/BRIQUES_COMMUNES.md`, à résorber si un fichier de prompts partagé est un jour
créé. Deux seuls ajouts par rapport à la veille : « Réponds toujours en français » et la demande de
reformulation (`[REFORMULATION]...[/REFORMULATION]`). Le format balisé (`[SUJET] titre | domaine |
description [/SUJET]`, `[QUESTION]...[/QUESTION]`) est parsé par `_comprendreLeCadreParserReponse1()`,
tolérant : si rien n'est trouvé, la réponse brute est affichée telle quelle.

**Questions de l'application** : `COMPRENDRE_LE_CADRE_QUESTIONS_UNIVERSELLES` (3, toujours) +
`COMPRENDRE_LE_CADRE_QUESTIONS_RAYON` (jeu distinct pour chacun des rayons, 2 à 3 questions -
jamais le même jeu pour toutes les thématiques, décision Denis). Pour handicap, étranger et justice,
les questions interrogent le **besoin**, jamais la **condition** de la personne (garde-fou renforcé).

**Écran « copier / coller » mutualisé** : `_comprendreLeCadreRenduCollageRecherche(cfg)` /
`_comprendreLeCadreBrancherCollageRecherche(cfg)` servent les deux temps (prompt 1 et prompt 2) ;
seuls changent le titre, le texte du prompt et les ids. Liste des assistants tirée de `ASSISTANTS_IA`
/ `ASSISTANTS_SANS_COMPTE_IA`.

**Recherche d'accueil** : tous les rayons sont déjà trouvables depuis la barre d'accueil via
`RAYON_LABEL` dans `data/baseConnaissancesERIP.js` (commit 004cc12) - inchangé par ce chantier.

## Migration du contenu, rayon par rayon (2026-09-05 au 2026-09-06)

**Terminée.** Les 14 rayons ont été vérifiés sur les sources officielles par Claude (sous
autorisation explicite de Denis, mode automatique), corrigés, puis migrés un par un de
`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/<rayon>/` vers `modules/comprendre-le-cadre/contenu/<rayon>/`
(`git mv`), avec test navigateur et commit dédié à chaque rayon. Ordre : justice, juridique, jeunes,
handicap, budget, accompagnement, emploi, former, logement, garde, mobilité, francais, etranger,
creer.

- **`liens-verifies.txt`** : fichier maître unique dans `modules/comprendre-le-cadre/` depuis le
  2026-09-06 (la copie dans `docs/` a été supprimée). C'est ici qu'on édite. Une adresse ne devient
  un lien cliquable que si sa 3e colonne porte une date (LECONS 9.16). Les sources ouvertes et
  confirmées pendant la vérification portent `2026-09-05` ; celles dont le site bloque le contrôle
  automatique (Banque de France, CAF, travail-emploi.gouv.fr, francetravail.fr, immigration.interieur,
  education.gouv.fr, Action Logement, monenfant.fr) restent sans date : à ouvrir au navigateur.
- **Pied de fiche** : chaque fiche affiche « Information vérifiée en [mois AAAA] » (bold), puis
  « Pour vérifier vous-même, les sources officielles : » avec, par source, le nom du site, l'adresse
  complète (cliquable si datée) et la date de vérification de l'adresse en pastille accent.
- **Ce qui reste** (hors périmètre de la migration) : les 8 fiches recommandées et les points à
  finaliser par Denis sont listés dans `docs/COMPRENDRE_LE_CADRE_SUITES_2026-09-05.md`. Le socle
  méthode (`contenu/methode/`, `sources.txt`) et les digests Balayage/Chiffres ne sont pas encore
  câblés (chantier « Comprendre les chiffres »).
- **Champ `frein:`** : toujours lu, jamais consommé (Freins et Comprendre le cadre restent séparés).
  Quelques valeurs sont discutables ; à revoir quand le champ sera branché.
