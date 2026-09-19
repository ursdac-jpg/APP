# Chantier « Comparer mes pistes » (aide à la décision d'orientation) - APP

**Statut : IMPLÉMENTÉ le 2026-09-01 (blocs 1 à 10 + retours Denis + alignement patron « bouton présentation » + sac persistant « Ma comparaison »). Module accessible (CTA actif) + point d'entrée transversal. Reste, hors code : vidéo « activer la recherche web sur ChatGPT », test terrain avec le public cible.**

**CAP Carreleur mosaïste (donnée d'exemple de la maquette de flux) : confirmé par Denis le 2026-09-01, il existe au réseau BTP CFA Nouvelle-Aquitaine, qui couvre la Dordogne (`https://www.btpcfa-na.fr/formation/cap-carreleur-mosaiste/`).**

**Compléments 2026-09-01 :**
- *Panier visible dès l'écran 0* (`3709f36`) : les pistes venues d'une fiche métier / de la recherche s'affichent dans un encadré « Pistes déjà ajoutées » (retrait possible), plus seulement à l'écran 0 bis.
- *Plus de 3 pistes de côté, en choisir 2 ou 3* (`5bb4f77`) : panier `_COMPARER_PANIER_MAX` 3 -> 8 ; au-delà de 3, l'écran 0 devient un choix (cases à cocher, « 2 c'est l'idéal, 3 au maximum »), les autres restent en réserve (`etat.pistesReserve`), rien n'est éliminé. `etat.pistes` reste l'ensemble <= 3 analysé donc la suite est inchangée.
- *Alignement sur le patron « bouton présentation »* (`4f73468`, autre compte) : « Quitter (reprendre plus tard) » remplacé par le bouton partagé « Revoir la présentation » (haut à gauche) ; encart « Continuer / Recommencer » + gel + pulse à la reprise ; présentation en détour (« Revenir au module ») ; flags `_comparerDetourPresentation` / `_comparerReprisePendante`. Coexistence avec les deux points ci-dessus vérifiée en navigateur.
- *« Ma comparaison », le sac persistant* (`9495faa` → `462d9db`, 4 blocs). Maquette validée : `docs/MAQUETTE_COMPARER_PISTES_SAC_PERSISTANT_2026-09-01.html`. Le panier et la session fusionnent en un objet unique `_comparerEtat` qui vit dans et hors du module, **ne se vide jamais tout seul**, et est sauvegardé sur la disquette (export / import, Réinitialiser / Restaurer). Chaque piste porte `ajoutLe` / `etudieLe` ; `etudieLe` est posé à l'étape Collecter quand la réponse de l'assistant est validée, affiché en badge « déjà étudié le … » + phrase de rappel dans l'encadré, sans jamais empêcher une nouvelle étude. Deux suppressions : croix par piste ; « Tout effacer » (bouton de l'écran 0 + lien de la barre fixe) avec une seule fenêtre de confirmation qui nomme ce qui part.

**Point d'entrée transversal (bloc 10)** : `comparerBoutonPanier(nom)` pose un bouton « Comparer cette piste » sur chaque carte métier de la recherche (`carteMetierHTML` / `carteMetierSuggereHTML`) et dans le panneau `ouvrirPanneauChoixParcours`. Le panier (`_comparerPanier`, max 3, dans `modules/comparer-pistes/index.js`) s'accumule ; une barre fixe « N pistes à comparer » propose de lancer. `ouvrirComparerPistes()` lit le panier au démarrage et pré-remplit les pistes avec l'étiquette `metier`. Handler en phase de capture pour ne pas déclencher aussi l'ouverture du parcours de candidature de la carte.

Nom UI retenu : **« Comparer mes pistes »**. Icône d'identité : `bi-signpost-split`, en couleur d'accent partout où le nom apparaît (règle icônes 2026-08-31). Route de présentation : `aide-decision-intro` -> `pageIntroAideDecision()` (déjà en place, `data/metiers.js`). Tuile Boîte à outils : `btnCarteAccueilComparerPistes` (déjà en place, provisoire, à re-placer lors de la refonte de l'accueil : c'est une **fonction transversale**, pas une carte de premier niveau - voir §0).

**Ne pas confondre avec `docs/CHANTIER_AIDE_DECISION_AVANT_REECRITURE.md`** (décision d'effort du Bilan, en pause).

## Documents de référence pour l'implémentation

- **Maquette de flux validée : `docs/MAQUETTE_COMPARER_PISTES_FLUX_2026-08-31.html`** (v8). Page unique qui défile, sans JavaScript, 9 sections (e0, e0b, e1, e2, e3, e3a, e3b, e4, e5) + annexe. C'est la cible visuelle et fonctionnelle.
- Maquette de la page de présentation : `docs/MAQUETTE_INTRO_AIDE_DECISION.html` (antérieure à la maquette de flux : **son texte devra être corrigé après implémentation** pour coller au module réel - décision Denis 2026-08-31).
- Les 5 prompts : `prompts/comparer-detection.md`, `comparer-collecte.md`, `comparer-meme-categorie.md`, `comparer-situations.md`, `comparer-aller-plus-loin.md`.
- Langage visuel : `docs/LANGAGE_VISUEL_COMMUN.md` + `docs/MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html`.

---

## 0. PRINCIPE DIRECTEUR (Denis, 2026-08-31)

> **APP ne doit pas devenir un comparateur de métiers. Elle doit aider la personne à construire sa réflexion.**

Le but : aider la personne à **mieux lire et comprendre les enjeux** derrière chaque option et **les choix qu'elle aura à prendre** le long de chaque chemin (ce que la piste demande, ouvre, ferme ; les décisions et renoncements qu'elle suppose). Rassembler des informations factuelles (durée, rémunération, financement, tension...) est un **moyen** au service de cette compréhension, jamais la finalité. Jamais de score, de classement, de « gagnant », de « métier d'avenir / qui disparaît », de « métier choisi ». APP ne conclut jamais.

La comparaison arrive **à la fin d'une réflexion déjà engagée**, jamais comme point de départ. Points d'entrée prévus (à câbler à la refonte de l'accueil) : fiche métier, « Vous hésitez encore ? », résultats de recherche de métiers, projet enregistré.

---

## 1. Le parcours (9 écrans de la maquette de flux)

Barre d'étapes : `barreEtapesModule(etapes, indexCourant)` (`js/app.js`), 6 étapes, icônes `bi-*` :
`Mes pistes` (bi-signpost-split ou bi-list-check) › `Collecter` (bi-search) › `Fiches` (bi-file-text) › `Comparer` (bi-layout-split) › `Aller plus loin` (bi-lightbulb, optionnelle) › `Ce que je retiens` (bi-bookmark). En sourdine (`indexCourant = -1`) tant que le parcours n'est pas commencé.

### Écran 0 - Ajouter mes pistes
- **3 façons d'ajouter une piste, mélangeables**, jamais présentées comme des « niveaux d'autonomie » :
  1. « Je raconte » (texte ou voix `Windows + H`) -> déclenche le prompt 0 (détection).
  2. « Je nomme mes pistes » (nom + ce qui attire, quelques lignes).
  3. « J'ajoute des documents » (coller un texte / joindre des photos) -> **réutiliser `ouvrirAssistantDepotCV(mode, options)`** (`data/metiers.js`), jamais recopier. L'application ne lit pas les fichiers : ils sont joints au message de l'étape 1.
- « Où en êtes-vous en ce moment ? » (bloc A, obligatoire) : situation + tranche d'âge.
- « Où êtes-vous ? » : région Nouvelle-Aquitaine par défaut, choix d'un des 12 départements. **Réutiliser `demanderDepartementSiInconnu(cb)` + `CLE_DEPARTEMENT_RESSOURCES`** (cohérence avec le reste d'APP ; le design initial « session seulement » est remplacé par la brique existante). Choix révocable (LECONS 9.27).
- Question facultative discrète : « Situation de handicap, RQTH, besoin d'aménagement ? » -> enrichit le prompt (ajoute agefiph / MDPH / Cap emploi aux sources, demande aménagements et accessibilité) et fait apparaître les bons acteurs à l'écran 5. Ce qui est coché **reste dans l'application** : le prompt ne dit que « la personne a, ou demande, une RQTH ».

### Écran 0 bis - Les pistes qu'on a comprises
- La personne n'a rien catégorisé. Le code affiche la liste des pistes avec, pour chacune, une **étiquette cliquable** (métier / formation / situation / frein-étape / idée à explorer), corrigeable d'un clic. Couleur par piste, modifiable (identifiant, jamais une valeur ; jamais la couleur seule pour distinguer).
- Zone libre « il manque quelque chose ? » (le filet).
- **Routage déterministe par le code, jamais un prompt** : que des `metier`/`formation` -> superposition (prompt 2) ; au moins une `situation` -> frise (prompt 3) ; mélange -> écran d'aiguillage « Deux angles » puis les deux vues ; `frein_ou_etape` -> pas une piste, affiché comme condition sur la piste concernée, relié au **répertoire `data/freins.js`** (voir §4) ; que des `idee_a_explorer` sans piste -> proposer d'abord un bilan / un CEP, pas la comparaison.
- Encadré « Voici comment on va regarder vos pistes » : court, une puce par piste (pastille couleur + traitement), une ligne de correction (2 cases). Texte adressé à la personne.
- Bloc B (précisions selon la situation) : accordéon, 3 questions maximum, choisies **par le code** selon la situation de départ (voir §5). Tout facultatif ; « je ne sais pas » devient une question pour le conseiller.

### Écran 1 - Collecter les informations
- L'application prépare le **texte du prompt `comparer-collecte.md`** pré-rempli (pistes, territoire, situation codée, précisions codées, RQTH oui/non, rappel documents). Bouton « Copier le texte » (rectangulaire).
- **Confidentialité** : encadré « avant de coller ce texte ailleurs » (il sort de l'application, pas de nom, rester général sur la santé, pas de données très personnelles). L'application n'injecte que des **indicateurs codés** (RQTH oui/non, « contrainte physique », « charge familiale »).
- Aide « Comment je fais » : la recherche web doit être **activée** ; assistant recommandé = **ChatGPT avec la recherche web** (voir §3 tests), avec un emplacement pour une **vidéo courte de Denis** montrant où activer la recherche (`htmlDeclencheurDemoVideo(idGeste)`). Repli « je n'ai pas d'assistant » : liste de sites officiels (§6) ou apporter au conseiller.
- Collage de la réponse : **réutiliser `htmlCollageInstantane` + `activerCollageInstantane`**.
- **Garde-fou côté code** sur la réponse collée : si aucune URL de source, ou toutes les `date_info` = date du jour, ou une source hors liste officielle -> signaler « cette réponse n'a pas l'air fiable », proposer de recommencer ou d'apporter au conseiller. Garder ce qui est exploitable, marquer le reste « à vérifier ».

### Écran 2 - Une fiche par piste
- Structure identique par piste, chacune dans sa couleur : Activités · Conditions de travail · **Ce que cette piste implique** (les enjeux, les choix à faire en chemin) · **À vérifier avant votre décision** · Questions à vous poser.
- Les parties stables (Activités, Conditions, Évolutions) viennent de la base métiers (`data/metiers.js`) quand la piste en vient, avec mention « vérifié le [date] » ; sinon de la synthèse de l'étape 1.
- L'encadré « À vérifier » est une **liste** : chaque ligne porte sa **valeur**, sa **source**, sa **portée** et sa **date**, en texte (jamais un lien cliquable rapporté par l'assistant - LECONS 9.13/9.16). Les lignes sans source trouvée sont marquées « aucune source, à voir avec le conseiller ».
- Bloc C « Qu'est-ce qui compte pour vous ? » : accordéon, cases (aucune n'est « la bonne ») + champ « une contrainte ». Réutilisé à l'étape 4.

### Écran 3 - Deux angles (cas mélangé uniquement)
- Écran d'aiguillage quand la liste mélange des pistes de même nature et une (ou des) situation(s). Deux cartes : « Dans le temps » (frise) et « Côte à côte » (réglettes). Ordre conseillé : « dans le temps » d'abord (c'est la question qui commande : bouger ou pas). S'adapte aux 2 cases de l'écran 0 bis.

### Écran 3A - Superposer (pistes de même nature)
- Une dimension à la fois, les pistes sur la **même échelle**, un repère par piste dans sa couleur. Prompt `comparer-meme-categorie.md`.
- Garde-fous (§0) : une dimension à la fois, aucune agrégation, aucune ligne « total », présentation neutre (la couleur identifie, ne juge pas), chaque dimension se termine par une **question**, seulement les dimensions mesurables sur une échelle simple. Rappel « une valeur plus courte / moins chère / plus élevée n'est pas meilleure ».
- Rémunération : souvent fourchette nationale indicative (Onisep), parfois en **brut** (le net dépend de la situation). Une dimension qui ne distingue pas les pistes le dit (comme le coût dans la maquette).

### Écran 3B - Dans le temps (situation contre situation)
- Frise : une ligne par moment (aujourd'hui / pendant / après), **une colonne par piste** (la situation « repère » d'abord, puis chaque piste de départ). Jamais de fusion des pistes de départ, aucune n'est présentée comme préférable. Prompt `comparer-situations.md`.
- Encadré « Conditions à réunir » sous la frise (règles de dispositifs, toujours source + date). « L'application ne dit jamais partez ni restez. »

### Écran 4 - Aller plus loin (optionnel)
- Prompt `comparer-aller-plus-loin.md` : reprend tout le collecté + les réponses de la personne, produit 4 à 6 questions ouvertes. Affiché à part, sous « Pistes de réflexion », jamais mélangé aux fiches.

### Écran 5 - Ce que vous retenez
- Rappel de ce que la personne avait dit vouloir approfondir (non modifiable).
- Récapitulatif des angles ouverts (côte à côte / dans le temps), sans total ni note.
- Zone libre « Ce qui vous attire, ce qui vous inquiète, ce que vous voulez approfondir ».
- **Points à discuter avec mon conseiller** : toutes les lignes « à vérifier » accumulées + conditions d'éligibilité + impact sur les droits + calendrier + réversibilité + freins reliés à `data/freins.js` + handicap (aménagements, MDPH, AGEFIPH, Cap emploi si indiqué).
- **Tableau « Sources des informations »** : chaque information rapportée, avec source + portée + date, inclus dans l'impression / l'export pour le conseiller. Lignes « aucune source » = à vérifier en priorité.
- « Garder une piste à approfondir » (jamais « piste choisie ») : **réutiliser `reperesBoutonAncre` / `reperesBrancherBoutonAncre`**. Export / impression pour le rendez-vous.

---

## 2. Deux formes de comparaison (dérivées par le code, corrigibles)

| Forme | Quand | Rendu |
|---|---|---|
| **Superposer** (« même nature ») | que des métiers / formations | réglettes, une dimension à la fois, un repère couleur par piste |
| **Dans le temps** (« situation contre situation ») | au moins une situation | frise aujourd'hui / pendant / après, une colonne par piste |
| **Mixte** | les deux à la fois | écran d'aiguillage puis les deux vues ; la frise a une colonne par piste (repère = la situation, départ = chaque métier / formation), jamais de fusion |

La personne ne catégorise jamais : un passage de détection (prompt 0) propose des étiquettes, le code en déduit la forme, la personne corrige d'un clic. Sortie : **JSON strict** pour les 5 prompts (cohérent avec le reste d'APP, parsers existants ; Markdown à titres fixes écarté, trop de variance). Parser tolérant côté code, champ `incertitudes` pour les trous. Un seul appel d'assistant par prompt traite toutes les pistes.

**Nombre de passages chez un assistant** : 2 (2 métiers) à 4 (cas mixte avec récit), +1 pour « aller plus loin ». Les 5 prompts restent **séparés** (un test réel a montré qu'un prompt combiné saturerait). L'écran des fiches propose de s'arrêter après le seul prompt de collecte.

---

## 3. Tests réels du prompt de collecte (2026-08-31)

Exemple : agent d'entretien CDI, 8 ans, contrainte au dos, RQTH, Dordogne, hésite entre CAP carrelage mosaïque et CAP équipier polyvalent du commerce.

- **Test 1 (ChatGPT, recherche activée)** : recherche web réelle sur sources officielles à jour (France compétences, Onisep, BTP CFA, Écoles CCI Dordogne, Légifrance, BMO, Transitions Pro, Agefiph, Cap emploi 24, MDPH), JSON propre et parsable, règles tenues (aucun classement, `null` + `incertitudes` au lieu d'inventer). Faiblesses : pas de vraies URL (noms de sources collés), `date_info` = date du jour, sur-contrainte au département (rémunération et tension revenues `null`).
- **Test 2 (comparatif ChatGPT vs Perplexity)** : Perplexity est allé chercher les salaires sur des **agrégateurs commerciaux** et a mélangé des URL (CAP commerce sur la piste carrelage, CFA d'un autre département pour une durée) : **disqualifié pour l'étape 1**. Point utile de Perplexity : il a signalé qu'aucun CAP carreleur ne semblait proposé en Dordogne (à vérifier).
- **Test 3 (ChatGPT, prompt corrigé)** : concluant. Plus aucun agrégateur, salaire en brut Onisep (1867 euros) ou `null` + incertitude, beaucoup de `date_info: null` avec mention « date non affichée », portée sans accent. Résiduel accepté : quelques URL Légifrance en identifiant profond (consigne « pas de lien d'article Légifrance » ajoutée au prompt).

**Décision : l'étape 1 recommande ChatGPT avec la recherche web activée**, avec la vidéo de Denis. Corrections tirées des tests, intégrées à `prompts/comparer-collecte.md` : source officielle obligatoire sinon `null` (blogs et agrégateurs interdits) ; `url` seulement si réellement ouverte, jamais fabriquée ; `date_info = null` si pas de date affichée ; salaire brut accepté (`euros_brut_mensuel`), sans conversion ; portée locale d'abord avec repli régional puis national ; tokens d'énumération sans accent.

**Point vérifié (Denis, 2026-09-01)** : le CAP Carreleur mosaïste existe bien au réseau BTP CFA Nouvelle-Aquitaine (couvre la Dordogne), `https://www.btpcfa-na.fr/formation/cap-carreleur-mosaiste/`. La remarque de Perplexity (« aucun CAP carreleur en Dordogne ») était fausse.

---

## 4. Liaison au répertoire des freins (`data/freins.js`)

Réutilisation de la brique existante (décision : étendre officiellement son périmètre, aujourd'hui « Regard extérieur uniquement » -> ajouter « Comparer mes pistes » comme consommateur dans `BRIQUES_COMMUNES.md` et dans l'en-tête de `data/freins.js`).

- Quand une piste reçoit l'étiquette `frein_ou_etape` (ou que le prompt 0 renvoie ce code), le code fait correspondre un **code de frein** de la liste fermée (d'abord via le champ `synonymes`).
- Ce n'est **pas une piste** : affiché comme une **condition** sur la piste concernée, avec un « Se renseigner sur ce point » qui ouvre le contenu du répertoire (comment lever / qui voir / ressources). Même fonction de rendu que le Lexique (`regardExterieurRenduFicheFrein`).
- **Les liens actionnables viennent uniquement de `data/freins.js`** (répertoire vérifié). Aucune URL d'assistant pour un frein n'est affichée (LECONS 9.13 / 9.16). Frein sans correspondance : « Point à discuter avec mon conseiller » + renvoi générique à la fiche Lexique « Ce qui peut freiner un parcours ».
- **Freins vitaux et sensibles** (`alimentaire`, `hebergement`, `sante`, `violences`, `addiction`) : reprendre le comportement de Regard extérieur (un frein `vital` se traite avant la comparaison, orienté CCAS / 115, jamais réduit à une puce sous un métier).

---

## 5. Banque de questions (bloc B, écran 0 bis, choisie par le code)

11 séries adaptatives selon « situation de départ x pistes confirmées », une seule affichée à la fois, 3 questions maximum, tout facultatif, « je ne sais pas » -> question pour le conseiller. Routage déterministe (le prompt comprend, le code garantit).

- **B1** En emploi : rester ou se former / se reconvertir (ancienneté -> PTP, démission-reconversion ; contrat ; métier précis en tête ou pas).
- **B2** En emploi : rester, rupture conventionnelle, démission (accord de l'employeur ; droit au chômage ; projet ou « départ pour partir »). Rappel : abandon de poste présumé démission depuis 2023 (pas d'ARE).
- **B3** Sans emploi : reprendre un emploi ou se former (inscription France Travail -> AIF, POE, rémunération de formation ; ancienneté de chômage ; aides perçues ; métier en tête).
- **B4** Sans emploi : reprendre « n'importe quoi » ou attendre le bon poste (échéance des droits ARE ; charges ; réalisme à court terme).
- **B5** Se former : quelle voie (mobilité ; employeur pour l'alternance ; combien de temps avec un revenu réduit ; niveau d'études).
- **B6** Salariat ou indépendance (idée d'activité ; ARE maintenue vs ARCE ; filet de sécurité ; seul ou associés).
- **B7** Statut, droits, aides (aides perçues en cases ; composition du foyer pour les simulateurs ; effet sur l'accompagnement).
- **B8** Santé, usure, inaptitude (arrêt long / restriction / inaptitude ; médecine du travail ; RQTH ; mi-temps thérapeutique).
- **B9** Handicap (milieu ordinaire ou protégé / adapté ; besoin d'aménagement ; suivi Cap emploi / MDPH ; orientation MDPH en cours).
- **B10** Mobilité, projet de vie (déménager ? contrainte familiale ? « ailleurs » justifie-t-il le changement ?).
- **B11** « Je ne sais pas par où commencer » (idées vagues ; d'abord bouger ou d'abord réfléchir ; accompagné aujourd'hui). Ici, le module propose souvent une **prestation d'orientation** plutôt que la comparaison.

Bloc D (questions pour le conseiller, écran 5) = toutes les lignes « à vérifier » + éligibilité des dispositifs + impact sur les droits (ARE, RSA, retraite, sécu) + calendrier + réversibilité + freins + handicap + l'interlocuteur adapté (France Travail / Mission Locale / Cap emploi / Transitions Pro / opérateur CEP / assistante sociale / Point Conseil Budget / médecine du travail).

---

## 6. Situations « X ou Y » et sources officielles (pour le prompt de collecte, type « situation contre situation »)

**9 familles** : (1) travailler ou pas, maintenant ou plus tard ; (2) quitter son emploi, comment ; (3) se former, quand et comment ; (4) salariat ou indépendance ; (5) statut, droits, aides ; (6) santé, usure, inaptitude ; (7) handicap (transversal, jamais une famille isolée) ; (8) mobilité, projet de vie ; (9) « je ne sais pas par où commencer ». Détail des ~50 cas : voir la maquette de flux (annexe) et l'historique de conception.

**Sources officielles** (repli sans assistant web, et liste blanche du garde-fou) :
- Socle : service-public.fr, travail-emploi.gouv.fr, francetravail.fr, legifrance.gouv.fr, moncompteformation.gouv.fr, francecompetences.fr, france-vae.gouv.fr, mesdroitssociaux.gouv.fr, Onisep, INSEE, DARES, Cap Métiers Nouvelle-Aquitaine, Région Nouvelle-Aquitaine, La Bonne Formation / La Bonne Boîte.
- Démission-reconversion / formation : Transitions Pro Nouvelle-Aquitaine, France Travail (AIF, POE/POEI).
- Indépendance : bpifrance-creation.fr, urssaf.fr, CMA/CCI.
- Droits / aides : caf.fr, mesdroitssociaux.gouv.fr, Points Conseil Budget.
- Santé / inaptitude : ameli.fr, services de prévention et de santé au travail.
- Handicap : agefiph.fr, fiphfp.fr, monparcourshandicap.gouv.fr, MDPH du département, capemploi.fr, GESAT, UNEA.
- Mobilité : actionlogement.fr, France Travail (aides à la mobilité), EURES.
- Orientation / bilan : mon-cep.org, prestations d'orientation France Travail, centres de bilan de compétences financés par le CPF.

---

## 7. Briques réutilisées (jamais recopiées - `docs/BRIQUES_COMMUNES.md`)

| Besoin | Brique |
|---|---|
| Page de présentation routée | `htmlPageIntroModuleParcours(config)` + `brancherPageIntroModuleParcours` (déjà : `pageIntroAideDecision`) |
| Barre d'étapes | `barreEtapesModule(etapes, indexCourant)` |
| Fenêtre / navigation d'écran | `ouvrirFenetreERIP` (si fenêtre) ou page routée + `barreNavigation` ; « Retour » ne saute jamais l'intro (modèle D5d) |
| Ajout de documents (texte / PDF / photo) | `ouvrirAssistantDepotCV(mode, options)` (`data/metiers.js`) - jamais modifiée |
| Territoire / département | `demanderDepartementSiInconnu(cb)` + `CLE_DEPARTEMENT_RESSOURCES` + `htmlLienChangerDepartement()` |
| Choix de l'assistant + confidentialité + vidéo | `ouvrirFenetreAssistantIA(config)` ; `ASSISTANTS_SANS_COMPTE_IA` ; `htmlDeclencheurDemoVideo(idGeste)` |
| Collage de la réponse | `htmlCollageInstantane(suffixe)` + `activerCollageInstantane(config)` |
| Relecture / masquage avant envoi | `htmlVerificationDocument()` / `cablerVerificationDocument()` (confidentialité étape 1) |
| Garder une piste à approfondir | `reperesBoutonAncre(opts)` / `reperesBrancherBoutonAncre()` |
| Répertoire des freins | `FREINS_REPERTOIRE` (`data/freins.js`) + `regardExterieurRenduFicheFrein` |
| Recherche | `rechercherBaseConnaissances()` (accueil) - brancher une catégorie « Comparer mes pistes » (le nom du module trouvable) |
| Sauvegarde disquette | patron `xxxExporterEtatPourSauvegarde()` / `xxxRestaurerEtatDepuisSauvegarde(etat)` enregistré dans `collecterEtatsModulesPourSauvegarde()` / `restaurerEtatsModules()` (LECONS 7ter) |
| Échappement / champs | `echapperAttribut()` ; `activerChampsStandardises(zone)` |

---

## 8. Plan d'implémentation (bloc par bloc, un commit par bloc, `npm test` + navigateur avant le suivant)

Le CTA de `pageIntroAideDecision` reste **désactivé** jusqu'au dernier bloc : les commits intermédiaires n'exposent rien à l'utilisateur.

1. **Consolidation docs + prompts** (ce commit). Aucun code touché.
2. **Squelette du module** : nouveau `modules/comparer-pistes/` (ou fonction dans `data/metiers.js` selon la forme retenue), route `comparer-pistes`, machine à états, chrome de page (barre d'étapes en sourdine, « Quitter / reprendre plus tard », « Revoir la présentation », barre Retour/Continuer), mode sombre, `tests/_domStub.js` mis à jour (LECONS 1quater). CTA toujours désactivé.
3. **Écran 0** : 3 façons d'ajouter une piste (dont `ouvrirAssistantDepotCV`), bloc A, territoire (`demanderDepartementSiInconnu`), question handicap. État exporté pour la disquette.
4. **Écran 0 bis** (scindé en deux commits) :
   - **4a** : dérivation des pistes (depuis « Je nomme » + aller-retour de détection via le composant de collage standard `htmlCollageInstantane` + parser tolérant du prompt 0), éditeur d'étiquettes (nom + étiquettes cliquables + couleur par piste), routage déterministe -> `etat.formeComparaison`, encadré « Voici comment on va regarder », accordéon « aucune piste précise » -> bilan / CEP.
   - **4b** : liaison `data/freins.js` (étiquette `frein_ou_etape` -> condition sur une piste + `regardExterieurRenduFicheFrein`), bloc B (11 séries, routage par le code selon `etat.situation`).
5. **Écran 1** : constructeur du texte `comparer-collecte.md` (indicateurs codés), encadré confidentialité, aide + emplacement vidéo, `htmlCollageInstantane`, parser + garde-fou (URL absente / date du jour / source hors liste).
6. **Écran 2** : fiches par piste (base métiers + synthèse), encadré « À vérifier » en liste avec source/portée/date, bloc C.
7. **Écrans « Deux angles » / Superposer / Dans le temps** (scindé en deux commits) :
   - **7a** : écran d'aiguillage (cas mixte, recommande « dans le temps » d'abord) + logique de routage selon `etat.formeComparaison` (superposition -> écran Superposer ; frise -> écran Dans le temps ; mixte -> aiguillage puis les deux) ; **écran Superposer construit directement à partir des données de collecte** (les valeurs chiffrées sont déjà dans `etat.dossiersCollecte` : réglettes + question générique par dimension). Le prompt `comparer-meme-categorie.md` devient un **affinage optionnel** (repli si l'app ne sait pas placer une valeur floue), pas un aller-retour obligatoire -- décision de réduction de friction, l'app fait ce qu'un site statique peut faire.
   - **7b** : écran Dans le temps (frise à N colonnes) + aller-retour du prompt `comparer-situations.md` (le raisonnement aujourd'hui / pendant / après ne peut pas se déduire des chiffres, il faut l'assistant) + parser tolérant.
8. **Écrans 4 et 5** : « aller plus loin » (prompt 4), « ce que je retiens », points conseiller, tableau des sources, « garder une piste à approfondir » (`reperesBoutonAncre`), export / impression.
9. **Finitions** : recherche branchée (accueil), activation du CTA, **mise à jour du texte de `pageIntroAideDecision`**, **suivi d'usage (traqueur Umami / `trackEvenement`)**, passe de test complète clair + sombre, relecture « oeil neuf » 3 angles (LECONS Règle 10).

**Suivi d'usage (bloc 9, Denis 2026-08-31)** : câbler `trackEvenement` sur les moments clés, une fois le module fini (LECONS section 4). Évènements prévus : `comparer_session_demarree`, `comparer_ecran_atteint` (avec l'écran), `comparer_prompt_copie` (détection / collecte / superposition / frise / aller-plus-loin), `comparer_reponse_collee`, `comparer_garde_fou_declenche`, `comparer_piste_gardee`, `comparer_export`. Jamais de contenu personnel dans les évènements, seulement des compteurs et des libellés d'étape.

**Mise à jour du texte de présentation (bloc 9, précision Denis 2026-08-31)** : la page d'intro a été écrite avant la maquette de flux, il y a donc un décalage. Objectif : **corriger ce décalage sans alourdir la page**. Retirer ce qui n'est plus d'actualité, remplacer ce qui est trop général par du contenu réel et pertinent du module. Ne pas ajouter de texte pour ajouter du texte : la page doit rester digeste. Points connus à revoir : « CAP vendeur / employé de commerce » (le module parle de pistes en général) ; « depuis une fiche métier / une recherche » (points d'entrée pas encore câblés à ce stade) ; la mention d'un seul aller-retour assistant (il y en a 2 à 4) ; la formulation « la synthèse » au singulier.

**Non-régression** : ne modifier aucune brique partagée, seulement les consommer. Chaque bloc : inventaire de ce qui existe -> `GARDÉ / DÉPLACÉ / ENRICHI`, jamais de `RETIRÉ` sans ligne validée.

---

## 9. Historique de conception

- Origine : puce dans `docs/IDEES_A_RECLASSER.md` §B. Besoin formulé par Denis le 2026-08-31, brief envoyé à plusieurs assistants externes, synthèse dans une version antérieure de ce document.
- 2026-08-31 : maquette de flux v1 -> v8 (no-JS, page qui défile) ; triage des idées de Denis ; conception des questions (banque bloc B) ; recherche des situations et sources ; conception des 5 prompts ; 3 tests réels du prompt de collecte ; ajout de la traçabilité des sources (par fait + tableau export) ; liaison au répertoire des freins ; harmonisation des valeurs d'exemple sur les résultats de test.
- 2026-08-31 : Denis valide, l'autre compte Claude libère le dépôt, feu vert à l'implémentation. Consolidation dans le dépôt + début de l'implémentation.
