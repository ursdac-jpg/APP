# Module « Comprendre les chiffres » : architecture technique

**Statut : CLOS (2026-09-06), les 10 blocs codés.** Module routable et complet :
couche 1 (5 chiffres clés), 3 dépliants méthode, couche 2 (portrait, 8 dépliants
+ 2 cartes éditoriales), couche 3 (BMO), « croiser plusieurs chiffres », vue
« Union européenne », vue d'ensemble (garde-fou CIP, tableau de synthèse,
imprimer), partie B (2 portes). Contenu dans `contenu/*.md`, produit par
`outils/veille.html`. Contenu **relu et validé par Denis le 2026-09-06** ; les
lignes `[à vérifier]` restant dans les `.md` sont des **données pas encore
récupérées** (bloquées derrière un PDF ou une base), à compléter au fil des
passages de veille, pas un blocage de mise en production. Conception :
`docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md`
(24 décisions D1-D24). **Cible visuelle, consigne n°1 de Denis : IDENTIQUE à la
maquette `docs/MAQUETTE_COMPRENDRE_LES_CHIFFRES_2026-09-06.html`.**

---

## Principe directeur

Module de consultation pure, **FAMILLE 1** (comme « Comprendre le cadre ») : pas
de gel de session, pas de reprise, rien à sauvegarder. Aucune donnée personnelle
n'y transite, rien dans `dossier`. L'état de navigation interne
(`_comprendreLesChiffresEtat`) vit en mémoire de page, perdu au rechargement.
Aucun assistant en ligne n'est appelé d'ici : un texte de recherche peut être
préparé pour être copié ailleurs (partie B), aucun `fetch()` vers un assistant
ne part du module.

## Façade publique

- `pageComprendreLesChiffres()` : point d'entrée, appelée par la table `routes`
  de `js/app.js` sur la clé `'comprendre-les-chiffres'`. Une seule fonction de
  rendu, l'état interne décide quoi dessiner (même patron que
  `pageComprendreLeCadre()` / `pageComparerPistes()`). Sur l'accueil, déclenche
  le chargement asynchrone du digest (une fois par session) puis re-rend.
- `comprendreLesChiffresRevenirDeLaPresentation()` : globale, appelée depuis la
  config de `pageIntroComprendreLesChiffres()` (`data/metiers.js`) en mode détour.
- `_comprendreLesChiffresAllerVersPrecedent()` : un cran en arrière à la fois,
  partagée par le bouton contextuel et la barre fixe du bas.
- `_comprendreLesChiffresGrapheInfobulle` / `...Masquer` : globales (référencées
  en `onmousemove` dans le SVG).

## Contenu : le digest trimestriel

- Fichier `contenu/<AAAA-MM>.md` (dernier mois du trimestre couvert), produit par
  `outils/veille.html` (prompt `[CHIFFRES]`, `docs/VEILLE_PROMPTS.md` § 5ter.1).
- `_comprendreLesChiffresChargerDigest()` : `fetch` des 8 trimestres candidats,
  garde le premier trouvé comme digest courant, note les autres comme archives.
  Les 404 des mois absents sont attendus (même schéma que le Balayage de
  « Comprendre le cadre »).
- `_comprendreLesChiffresParserDigest(md)` : front-matter (`periode`,
  `publie_le`, `prochaine_maj`) + corps découpé par `## <section>` ; une entrée
  par puce `- <territoire> : **valeur** (date) ; précédent : x ; il y a un an : y.
  Source : nom | url`, ligne `serie:` indentée rattachée. Tolérant : puce sans
  `**valeur**` = ligne « à vérifier », sens d'évolution lu en prose à défaut.
- `COMPRENDRE_LES_CHIFFRES_CARTES` : config FIXE des 5 cartes (question, phrase,
  graphe oui/non, comparaison territoriale oui/non). Les valeurs viennent du
  digest, jamais codées ici.

## Points de contact avec le reste d'APP

1. ✅ `data/metiers.js`, `ouvrirCarteAccueil` config `informe` : **2e sous-carte**
   `btnCarteAccueilChiffres` ajoutée (« Se tenir informé » devient un hub à 2
   sous-cartes, décision Denis 2026-09-06, D1). Wiring dans le handler
   `id === 'informe'` → `naviguerVers('comprendre-les-chiffres-intro')`.
2. ✅ `data/metiers.js`, `pageIntroComprendreLesChiffres()` : page de présentation,
   même patron que `pageIntroSeTenirInforme()`. Contient le **rectangle de
   complémentarité** `_introBlocComplementariteChiffres()` (D16) - le même
   rectangle est ajouté à `pageIntroSeTenirInforme()`. **Pas de bouton ni de
   lien de renvoi entre les deux modules.**
3. ✅ `js/app.js`, table `routes` : `'comprendre-les-chiffres-intro'` (présentation)
   et `'comprendre-les-chiffres'` (le module).
4. ✅ `index.html` : `<link>` + `<script>` du module, chargés avant `js/app.js`.
5. ✅ `tests/_domStub.js` : `pageComprendreLesChiffres` et
   `pageIntroComprendreLesChiffres` stubés (LECONS 1quater).
6. ✅ `modules/comprendre-le-cadre/index.js` : l'entrée `chiffres` de
   `COMPRENDRE_LE_CADRE_OUTILS` est **retirée** (le digest Chiffres n'est plus un
   outil de « Comprendre le cadre », il devient ce module).
7. ✅ Visibilité de la 2e sous-carte sur l'accueil (retours Denis 2026-09-06) :
   - `js/app.js`, `htmlCarteAccueil('informe', ...)` : 2e puce « Comprendre les
     chiffres » + description de carte élargie.
   - `js/app.js`, aide guidée `[data-carte-accueil="informe"]` : texte réécrit,
     les deux outils décrits au style maison (nom en gras + parenthèse, jamais
     « nom : clause »).
   - `data/metiers.js`, `INFOS_CARTE_ACCUEIL.informe.items` : 2e entrée pour
     l'infobulle « i ».
8. ✅ `outils/veille.html` : rectangle violet renommé « Nourrit : Comprendre les
   chiffres », prompt `[CHIFFRES]` élargi (5 indicateurs + `[LECTURE]`), 2
   dépliants annuels `[PORTRAIT]` / `[CHIFFRES-UE]`, section « Mettre à jour
   Comprendre les chiffres » dans le guide « Comment ça marche », import manuel
   `cible = 'chiffres'` recâblé.

## Bouton Retour : copier la logique de « Comprendre le cadre » (consigne Denis 2026-09-06)

Le bouton Retour de « Comprendre le cadre » a demande plusieurs passes. Pour
« Comprendre les chiffres », **reprendre exactement la meme logique**, sans
reinventer :

- un seul cran en arriere a la fois (`_comprendreLesChiffresAllerVersPrecedent()`),
  partage par le bouton contextuel plein en haut de l'ecran ET par la barre fixe
  du bas (`barreNavigation('cv', null, null, { onclickPrecedent: ... })`) ;
- jamais un lien texte : toujours un vrai bouton plein
  (`.comprendre-les-chiffres-bouton-retour`, LECONS 9.6) ;
- la marge mobile `@media (max-width: 768px) { [data-...-retour] { margin-top: 48px } }`
  pour ne pas passer sous la barre d'etapes fixe (LECONS 9.x, « Comprendre le
  cadre : boutons Retour coherents + barre d'etapes fixe », commit 92bf0be) ;
- l'ecran d'accueil du module renvoie a la presentation
  (`_comprendreLesChiffresRevoirPresentation()`), la presentation renvoie a la
  carte « Se tenir informe » (`carteRetour: 'informe'`), jamais un cul-de-sac ;
- verifier le parcours **complet** au navigateur a chaque bloc (aller ET retour
  depuis chaque ecran : accueil, portes A/B, ecran-porte territoire, presentation).

## Territoire

- **Quel département** : brique canonique partagée `demanderDepartementSiInconnu()`
  / `departementRessourcesMemorise()` / `oublierDepartementRessources()`
  (`js/app.js`), la même que « Comprendre le cadre » et « Ressources ». Jamais un
  nouveau sélecteur. Deux départements : Dordogne (24), Haute-Vienne (87).
  Écran-porte bloquant tant qu'aucun département n'est connu. Depuis
  2026-09-09 (décision Denis), cet écran montre aussi un aperçu verrouillé :
  `_comprendreLesChiffresRenduApercuContenu()` (les cinq chiffres clés + le
  portrait annuel + l'enquête employeurs + la question chiffrée en direct,
  jamais les nombres eux-mêmes) est rendu dans
  `.comprendre-les-chiffres-apercu-verrou` (`data-comprendre-les-chiffres-apercu`),
  contenu interne `inert` + `pointer-events: none`. Un clic dans la zone, ou
  Entrée / Espace, déclenche le même `demanderDepartementSiInconnu` que le
  bouton (`_comprendreLesChiffresBrancherChoixTerritoire()`). Le choix fait,
  l'accueil réel s'affiche.
- **Niveau de lecture** : `_comprendreLesChiffresEtat.niveau` -
  `dep` (mon département) / `na` (Nouvelle-Aquitaine) / `fr` (France) / `ue`
  (Union européenne). Tous les chiffres de l'écran s'adaptent (branché blocs 3+).

## Contenu (bloc 2 : prompts + squelettes de fichiers faits)

Trois fichiers dans `modules/comprendre-les-chiffres/contenu/`, produits par
`outils/veille.html` (rectangle violet « Nourrit : Comprendre les chiffres »,
mode « Entretenir »), chacun avec sa cadence :

| Fichier | Prompt | Cadence | Prod veille.html |
|---|---|---|---|
| `<mois>.md` (ex. `2026-06.md`) | `[CHIFFRES]` + `[LECTURE]` | trimestrielle | parseur + aperçu + cohérence + `[VERIF]` |
| `portrait-<annee>.md` | `[PORTRAIT]` | annuelle | prompt + collage + téléchargement brut (mise en forme à la main) |
| `ue-<annee>.md` | `[CHIFFRES-UE]` | annuelle | idem |

Formats détaillés : `docs/VEILLE_PROMPTS.md` § 5ter.1 / 5ter.2 / 5ter.3.

**État au 2026-09-06** : les trois fichiers existent avec la vraie structure.
Le trimestriel `2026-06.md` porte les chiffres phares vérifiés (taux de chômage
T1 2026 des quatre territoires, demandeurs Nouvelle-Aquitaine T2 2026) ; le reste
est marqué `[a verifier]` avec sa source. `portrait-2026.md` et `ue-2026.md` sont
des squelettes à remplir par les prompts annuels. **Le module ne doit pas passer
en production tant que ces fichiers ne sont pas complétés et relus par Denis.**

## Umami

`trackEvenement()` avec la garde `if (typeof trackEvenement === 'function')`
partout. Jamais un identifiant personnel ni un contenu saisi.

| Événement | Quand |
|---|---|
| `comprendre_les_chiffres` | clic sur la sous-carte (`data/metiers.js`) |
| `comprendre_les_chiffres_intro_affichee` | ouverture de la présentation |
| `comprendre_les_chiffres_accueil_affiche` | affichage de l'accueil du module |
| `comprendre_les_chiffres_territoire_demande` | écran-porte (département inconnu) |
| `comprendre_les_chiffres_porte_a_affichee` / `_b_affichee` | ouverture d'une porte de « Une autre question » |

## Étapes d'implémentation

1. ✅ **Coquille** : module routable, accueil (structure), écrans-portes stubés,
   hub à 2 sous-cartes, présentation + rectangle de complémentarité réciproque,
   retrait du digest Chiffres de « Comprendre le cadre ». Rendu visible aussi
   dans : puce de la carte d'accueil, infobulle « Se tenir informé », aide
   guidée « Explication rapide » (retours Denis 2026-09-06).
2. ✅ **Prompts de veille + squelettes de contenu** : `docs/VEILLE_PROMPTS.md`
   § 5ter réécrit (3 sous-prompts), `outils/veille.html` (rectangle violet
   renommé, `assemblerChiffres` élargi + `[LECTURE]`, dépliants `[PORTRAIT]` et
   `[CHIFFRES-UE]`, guide « Comment ça marche » complété), 3 fichiers de contenu
   créés dans `contenu/`.
3. ✅ **Couche 1 (les 5 chiffres clés)** : parseur du digest, graphe SVG en
   barres + infobulle, 5 cartes (question, valeur, tendance, comparaisons,
   source cliquable), archive (liste, consultation au bloc suivant), dépliant
   des pièges, lecture du territoire. Testé au navigateur (clair + sombre,
   4 niveaux de lecture, retour cohérent).
4. ✅ **Couche 2 (portrait)** : 3 dépliants méthode + 8 dépliants portrait
   (freins en premier, replié et neutre) + 2 cartes éditoriales, lus dans
   `portrait-<annee>.md`. **Couche 3 (BMO)** : carte enquête Besoins en Main
   d'Œuvre. **Niveau « Union européenne »** : tableau de synthèse France /
   moyenne UE-27 depuis `ue-<annee>.md` + dépliant des freins comparés.
5. ✅ **« Croiser plusieurs chiffres »** : cases par unité (% / nombres),
   garde-fou anti-mélange, graphe combiné multi-séries (une couleur par série,
   légende, infobulle par trimestre) construit depuis les `serie:` du digest.
   Une série sans données = case désactivée « pas encore de série ».
6. ✅ **Vue d'ensemble** : garde-fou CIP, lecture du territoire en clair,
   tableau de synthèse, dépliants ouverts, renvoi « à lire avec », imprimer.
7. ✅ **Partie B, porte A** (question chiffrée précise, un temps) : question
   -> texte de recherche -> collage -> résultat (valeur + graphe + source),
   rien enregistré.
8. ✅ **Partie B, porte B** (comprendre le territoire, deux temps) : panorama
   en sujets (`[SUJETS]`) -> cases à cocher -> second texte ciblé. Même socle
   de prompt que « Affiner ma recherche ».
9. ✅ **Import manuel + docs** : volet « Chiffres » de `veille.html` calé sur le
   format réel (`docs/CHANTIER_IMPORT_MANUEL_VEILLE.md` § 2). Docs de fin :
   `LECONS 9.34-9.36`, `TACHES_VALIDEES`, `IDEES_A_RECLASSER`, `BRIQUES B.8/B.9`,
   `CLAUDE.md`.

### Ajout 2026-09-06 (décision Denis) : 3 fiches méthode

`contenu/methode/` : `comment-lire-un-taux-de-chomage.md` (venue de « Comprendre
le cadre »), `taux-insee-ou-personnes-inscrites.md`, `comment-lire-une-evolution.md`
(neuves). Chargées par `_comprendreLesChiffresChargerMethode()`, rendues en
sous-dépliants à l'intérieur du dépliant des pièges (« Ce qu'il faut savoir avant
de lire ces chiffres »), sous « Pour aller plus loin ».

### Retouche 2026-09-06 (demande Denis) : sections entières repliées

Pour réduire l'impact visuel sans rien enlever ni réordonner, quatre sections
sont enveloppées dans un rectangle dépliable
(`_comprendreLesChiffresRenduBlocRepliable`, classe
`.comprendre-les-chiffres-depli-section`) : **Les trimestres précédents**, **Le
portrait du territoire**, **Croiser plusieurs chiffres**, **Ce que les employeurs
prévoient d'embaucher cette année**. Le titre de section devient le résumé
cliquable (dépliants imbriqués pour le portrait). Ouvertes d'office en vue
d'ensemble. Le reste (les 5 chiffres clés, les 3 dépliants méthode, l'encart des
pièges, la lecture du territoire, l'encart de prudence, « Une autre question »)
inchangé. Valable pour les niveaux département / région / France.
