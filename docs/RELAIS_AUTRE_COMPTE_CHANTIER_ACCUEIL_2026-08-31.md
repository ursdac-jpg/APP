# Relais pour un autre compte Claude - chantier "Reorganisation de la page d'accueil"

> Ecrit le 2026-08-31. A transmettre tel quel a l'autre compte Claude qui prendra le chantier de la page d'accueil.
> Ce compte-la n'a ni memoire ni historique de ce projet. Tous les fichiers cites ci-dessous sont dans le depot et peuvent etre ouverts directement.

---

## 1. Le projet en cinq lignes

APP (« Accompagnement de Parcours Professionnel ») est une application web statique, sans backend, sans budget API. Toute generation par un assistant en ligne passe par un copier / coller manuel vers un assistant externe. Public cible : personnes en fragilite numerique, confiance en soi fragile. Concepteur et unique porteur : Denis, conseiller en insertion professionnelle (pas programmeur ni ingenieur). « ERIP » est le nom d'un dispositif (le stage de Denis), jamais le nom de l'application : ne rien renommer.

---

## 2. Methode de travail (rien de tout cela n'est dans ta memoire, lis cette section en entier)

### 2.1 Fichiers de reference a ouvrir AVANT tout plan ou tout code

Dans cet ordre :

1. `CLAUDE.md` (racine) - fichier maitre, sommaire + procedure.
2. `docs/LECONS_A_NE_PAS_REPRODUIRE.md` - les erreurs a ne jamais refaire. La section 10 rassemble les regles transverses.
3. `docs/TACHES_VALIDEES.md` - systeme `[CLOS]` / `[A FAIRE]`. Chercher toute tache qui touche le meme endroit et la traiter dans le meme passage.
4. `docs/IDEES_A_RECLASSER.md` - idees et formulations a piocher.
5. `docs/BRIQUES_COMMUNES.md` - registre des composants transverses (source unique + qui l'utilise + dette). Avant de creer un ecran / un champ / un composant : verifier ici, reutiliser, jamais recopier.
6. `docs/LANGAGE_VISUEL_COMMUN.md` - le vocabulaire de formes commun a tous les modules.
7. `docs/TRAVAILLER_AVEC_DENIS.md` - modes de collaboration, longueur des reponses, comment presenter des choix.
8. `docs/ETAT_DES_CHANTIERS_2026-08-24.md` - la photo d'ensemble la plus a jour (mais anterieure a la semaine ecoulee, voir section 4 ci-dessous).
9. S'il existe un `docs/CHANTIER_<sujet>.md` pour le sujet en cours : le lire aussi.

### 2.2 Modes de collaboration - a annoncer au debut de chaque tache

- **Mode A** : decision d'architecture / d'UX / de philosophie produit. Reponse detaillee, un bloc a la fois, Denis valide chaque etape. **Si Denis est fatigue : reporter le chantier entier, ne pas le commencer a moitie.**
- **Mode B** : execution cadree. Le quoi et le pourquoi sont tranches. Claude avance seul sur le comment, montre le resultat par blocs.
- **Mode C** : tache mecanique / correction ciblee. Claude fait et rend compte en une ligne.

Le chantier accueil est un **Mode A**, tres gros.

### 2.3 Longueur des reponses

- Par defaut : reponse courte et directe (viser 5 lignes), une conclusion, une recommandation.
- Denis ecrit `[detaille]` : reponse longue autorisee.
- Denis ecrit `[relais IA]` : brief complet destine a etre colle chez une autre IA. Ce contenu peut rester en fichier.
- Un plan que Denis doit lire et faire evoluer se presente dans le chat, pas seulement en fichier.

### 2.4 Etat d'energie de Denis

Denis n'est pas a 100 % tous les jours. Les jours de fatigue : une seule recommandation claire, jamais un menu ; faire soi-meme les choix evidents et les annoncer en une ligne ; decouper toute decision en un choix binaire ; prendre davantage en charge les zones d'ombre. Toujours, fatigue ou non : si une decision de Denis semble sous-optimale, le signaler explicitement, meilleure option en premier, en une phrase. Jamais un acquiescement silencieux.

### 2.5 Presentation des choix (demande explicite de Denis)

Jamais une liste d'options nues. Chaque choix presente vient avec :
1. Une recommandation claire (option optimale en premier, marquee « (Recommande) ») : pourquoi + ce que ca apporte concretement + son risque.
2. Pour chaque autre option aussi : ses benefices ET ses risques.

But : reveler a Denis ce qui echappe a sa lecture d'ensemble (dependances entre chantiers, effets de bord, dette technique, cout de re-test).

### 2.6 « Zero regression » = fonctionnel, jamais visuel

Quand une maquette est validee, le visuel et l'interaction peuvent changer, c'est le but. Ce que Denis protege : aucun bouton mort, aucun bouton / champ / action disparu sans decision ecrite, aucune fonction perdue meme si elle change de place, prompts au moins aussi riches, re-test de chaque chemin reel apres la refonte. Methode : avant un bloc de refonte, inventorier les fonctions / boutons / prompts de l'existant et etiqueter chacun GARDE / DEPLACE / FUSIONNE / ENRICHI, aucun RETIRE sans ligne dediee validee.

### 2.7 Non-negociables (a verifier a CHAQUE bloc, au meme titre que le mode sombre)

- **Francais impeccable** : accents partout, orthographe correcte, sur tout texte produit ou edite (chat, maquettes, code, commentaires, templates d'export). Jamais d'anglais.
- **Jamais de tiret cadratin ni de demi-cadratin**, nulle part.
- **Jamais le mot « IA » visible** dans l'application, jamais d'icone tete de robot. Dire « l'assistant en ligne ».
- **Jamais d'icone avec un visage / des traits / une expression** (yeux, emoji de visage, cerveau). Prendre un objet ou un symbole concret. Silhouette neutre sans traits toleree.
- **Mode sombre** : toute variable de couleur a sa valeur `[data-theme="sombre"]`. Jamais de hex en dur.
- **Une seule source de verite** : jamais de duplication d'un ecran / champ / composant. Grep, reutiliser, parametrer. Toute dette de duplication est listee dans `BRIQUES_COMMUNES.md`.
- **Brancher la recherche au fur et a mesure** : chaque nouveau contenu trouvable ajoute sa categorie dans la recherche a sa creation.
- **Bouton, pas lien texte** : toute action est un vrai bouton borde.
- **Choix revocable** : tout ecran qui demande un choix offre un vrai bouton pour y revenir.
- **Public cible** : ton simple et rassurant partout, phrases courtes. Jamais poser de diagnostic sur la personne. Bannir le mot « zero » dans les textes visibles.

### 2.8 Git - workflow de ce depot

- Denis travaille seul, veut le travail termine directement sur `master`.
- Une tache terminee ET verifiee par un vrai test se commit directement sur `master`, sans branche, sans redemander.
- Creer une branche seulement si : gros ou risque, pas encore verifie, Denis veut relire, ou Denis le demande.
- **Jamais `push` ni fusion vers un depot distant sans que Denis le demande.**
- Messages de commit en francais, sans tiret cadratin.
- **Deux comptes Claude travaillent sur ce projet en parallele. Ne JAMAIS faire `git add -A`** (a deja aspire le travail en cours d'une autre fenetre le 2026-08-30). Ajouter les fichiers un par un, explicitement.

### 2.9 Tests et serveur

- Tests : `npm test` (= `node --test "tests/*.test.js"`). Reference au 2026-08-31 : 608 verts.
- Lexique modifie : `node scripts/checkLexique.js` en plus (0 erreur ET 0 avertissement).
- `js/app.js` et `modules/*/ui.js` (ou `index.js` DOM) ne sont pas charges par les tests Node : **test navigateur obligatoire** pour tout changement qui les touche.
- Serveur dev : via l'outil de preview, config `.claude/launch.json`, nom `site-v2-python-server`, port 8123 (`serveur_dev.py`, `Cache-Control: no-cache`). **Jamais lancer un serveur avec Bash.** Si une correction « ne marche jamais », suspecter le cache navigateur.
- Un commit par sous-etape. `npm test` + navigateur avant la suivante.

---

## 3. Ce qui a change ces sept derniers jours (24 au 31 aout 2026)

`docs/ETAT_DES_CHANTIERS_2026-08-24.md` est la derniere photo d'ensemble, mais elle date du 24. Depuis :

- **Consolidation du module Bilan « Analyser ma candidature »** : gros chantier mene bloc par bloc (plan `docs/CONSOLIDATION_BILAN_PLAN_2026-08-29.md`, retours `docs/CONSOLIDATION_BILAN_RETOURS_2026-08-30.md`, maquette de reference `docs/MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html`). Essentiel CLOS le 30/08, 2e batch de retours CLOS le 31/08 (fin de parcours claire, acces CV sur les 3 modes, filet anti tiret cadratin, lignes de resume du rapport, bandeau agrandi). **Reste** : dette B.1 (fusion des ~5 collecteurs de contexte de candidature en un `htmlPanneauCandidature()` unique), fusion `bilan-v1.md` + rubriques, mini-chantier « prompt `bilan-v1.md` sature » (2 points : questions Carte 3 sur CV leger, synthese trop maigre).
- **Langage visuel commun** : `docs/LANGAGE_VISUEL_COMMUN.md` + `docs/maquettes/_skeleton-intro-module.html` crees le 30/08. Le module Bilan consolide est l'exemple vivant.
- **Patron « page d'introduction de module » generalise** (nuit du 30 au 31, delegation complete de Denis) :
  - Mon Carnet, Lexique : pages routees (`_carnetRenduIntro()`, `_lexiqueRenduIntro()`), affichees a l'entree par la tuile, sautees sur les liens profonds.
  - Co-construire ma lettre, Preparer un entretien, Decouvrir mes competences : vraies pages routees (`co-lettre`, `prepa-entretien`, `decouverte-intro`) via `htmlPageIntroModuleParcours()` + `brancherPageIntroModuleParcours()` + `_introBloc*()` (`data/metiers.js`). Chaque page affiche une synthese si un travail existe deja, et un CTA adapte.
  - Coherence de mon dossier, Reperes : deja equilibrees le 30/08.
  - **3 comportements OBLIGATOIRES du patron** (implementes sur le Bilan, commits `D5a` a `D5d`, a copier, jamais reinventer) : (1) « Retour » d'un ecran de travail ramene a la page d'introduction du module, jamais droit a l'accueil ; (2) bouton permanent intro / travail au meme endroit sur chaque ecran de travail (« Revoir la presentation » / « Revenir a mon travail », detour non destructif) ; (3) la question « Continuer / Recommencer » quitte le clic depuis la Boite a outils et vit sur la page d'accueil du module, sous forme de bandeau (jamais une modale).
- **« Retour » des pages de presentation** ramene desormais au menu Boite a outils (`retourVersBoiteAOutils()`), jamais a l'accueil principal.
- **Barre d'etapes generique** `barreEtapesModule(etapes, indexCourant)` (`js/app.js`, commit `da77aaa`) : meme langage visuel que le Bilan (pastille courante jaune + halo, chevrons bleus, etape faite verte). En tete des pages routees Lettre / Entretien / Decouverte, en sourdine tant que le parcours n'est pas commence.
- **Module « Decouvrir mes competences » : refonte complete** (nuit du 30 au 31, FAITE et verifiee, 608 tests + navigateur clair et sombre) :
  - Le parcours devient une page routee (`decouverte`) au lieu d'une cascade de fenetres.
  - Refonte visuelle alignee sur le langage commun (cartes `.cv-section`, jetons de theme, plus de bleu pale code en dur).
  - Fusion d'ecrans : 1+2+3 en une page « Preparer » (recit / coordonnees / visee facultative), 6+7 en un ecran « Vos competences ».
  - Accompagnement enrichi (bandeaux rassurants, encarts a filet gauche, cadrage par etape), helpers `_decouverteEncart` / `_decouverteBandeau`.
  - Page d'introduction routee `pageDecouverteIntro()` (`data/metiers.js`), d'apres `docs/MAQUETTE_INTRO_DECOUVERTE.html`.
  - **Reste** : la page « Preparer » depliante facon `htmlBilanPreparer` (plan `docs/CHANTIER_PAGES_PREPARER_MODULES.md`) et la suppression de la fenetre de depot du CV qui « pop » (a mener AVEC Denis, il l'a dit explicitement).
- **4 pages de presentation de modules non construits**, integrees provisoirement dans la Boite a outils (`ouvrirChoixPreparationAccueil` passe de 8 a 12 tuiles) : ATS, Regard recruteur, Se tenir informe, « Comparer mes pistes ». Maquettes validees le 31/08 (`docs/MAQUETTE_INTRO_ATS.html`, `docs/MAQUETTE_INTRO_REGARD_RECRUTEUR.html`, `docs/MAQUETTE_INTRO_SE_TENIR_INFORME.html`, `docs/MAQUETTE_INTRO_AIDE_DECISION.html`). Pages routees `pageIntroAts` / `pageIntroRegardRecruteur` / `pageIntroSeTenirInforme` / `pageIntroAideDecision`, bouton d'entree desactive. **A re-placer dans la nouvelle structure d'accueil** (voir section 5).
- **Chantier freins** (`data/freins.js`) : TERMINE le 28/08. Decision : PAS de module ni de carte « Ressources » (doublon avec la plateforme partenaire PCGI 87). Juste un bloc de donnees (17 codes de frein + ressources verifiees + synonymes), consomme par Regard exterieur, Mes Reperes, la recherche d'accueil et le Lexique.
- **Vocabulaire « IA » neutre** : chantier texte CLOS le 27/08 (mot « IA » et tetes de robot retires de tout le visible ; « l'assistant en ligne »).
- **Divers** : Bootstrap CSS et Icons auto-heberges (plus aucune requete CDN), favicon ajoute, tous les pulses homogeneises et bornes (respect de `prefers-reduced-motion`, jamais d'infini).
- **Syntheses multi-IA** ecrites pour preparer les modules futurs : `docs/CHANTIER_ATS.md`, `docs/CHANTIER_REGARD_RECRUTEUR.md`, `docs/CHANTIER_SE_TENIR_INFORME.md`, `docs/CHANTIER_AIDE_DECISION_ORIENTATION.md`.

**Verification faite le 2026-08-31 : une tache `[A FAIRE]` de `docs/TACHES_VALIDEES.md` etait en realite deja faite** (« Implementer le parcours Decouverte consolide, fusions 1+2+3 et 6+7, barre de navigation ») : elle fait doublon avec deux entrees `[CLOS]` (`8ae5bd7` / `5ee40e3` et `da77aaa`). Denis la passera en `[CLOS]`. La page de presentation de Decouverte est elle aussi deja implementee (`pageDecouverteIntro`), seule la validation visuelle par Denis reste a faire.

---

## 4. L'etat reel du code de la page d'accueil aujourd'hui

`pageChoixCV()` (`js/app.js`, vers la ligne 3914) rend encore l'ANCIENNE structure :

- `afficherProgression('cv')` en tete : la barre des 7 etapes du parcours CV s'affiche sur l'accueil (elle n'y a rien a faire).
- 3 cartes CV : « Creer un nouveau CV » / « J'ai deja un CV » / « Mettre mon CV a jour ».
- un bouton « Vous hesitez encore ? » (`btnRessourcesExplorerAccueil`).
- une carte « Boite a outils » (`btnPreparationAccueil`) qui ouvre `ouvrirChoixPreparationAccueil()` (`data/metiers.js`), aujourd'hui 12 tuiles bleues identiques.
- la barre de recherche (`#rechercheERIPInput` dans `.zone-recherche-erip-large`) au MILIEU de la page.
- le bouton « Retour sur votre experience » et « Confidentialite de vos donnees » en bas.

Moteur de recherche actuel a ne pas perdre en le reconstruisant : `rendreResultatsRechercheERIP()` + `rechercherBaseConnaissances()` (`js/app.js` vers la ligne 779). Il cherche dans metiers, competences, savoir-etre, savoirs, environnements de travail et domaines d'activite en une seule passe, plus un moteur de pertinence separe (`rechercherMetiersDepuisTexte()`) qui suggere des metiers par le sens. Resultats groupes par categorie, cliquables (`ouvrirPanneauChoixParcours()` pour un metier). Suivi Umami avec debounce 600 ms (`recherche_utilisee` / `recherche_sans_resultat`).

---

## 5. Le chantier « Reorganisation de la page d'accueil » : ce qui reste, precisement

Maquette de structure validee (structure seulement, pas la charte) : `docs/MAQUETTE_ACCUEIL_PORTE_ENTREE_VALIDEE_2026-08-27.html`.
Maquette rejetee mais a garder comme matiere : `docs/MAQUETTE_ACCUEIL_BOUSSOLE_2026-08-27.html` (le long defilement facon document a ete refuse ; l'effet « exemple de recherche qui change toutes les 5 a 6 secondes dans le champ vide » a plu, a reprendre pour la vraie barre).
Detail complet et historique : `docs/TACHES_VALIDEES.md`, section « Taches ajoutees le 2026-08-27 (interface d'accueil...) ».

Points deja tranches avec Denis :

1. **6 cartes d'accueil**, dans cet ordre de lecture (elles s'enchainent naturellement sur plusieurs lignes selon la largeur, pas de position fixe) :
   1. Mes documents (Creer un nouveau CV / J'ai deja un CV / Mettre a jour mon CV)
   2. Me preparer a candidater (Co-construire ma lettre / Preparer un entretien)
   3. Boite a outils (Decouvrir mes competences / Mes Reperes / Mon Carnet / Lexique)
   4. Outils d'analyse (Analyser ma candidature / Coherence de mon dossier)
   5. Se tenir informe (sous-carte « Actualites », pas de badge « en developpement » sur la carte d'accueil ; le message « en construction » n'apparait qu'au clic sur la sous-carte)
   6. Vous hesitez encore ? (inchangee)
2. **Une seule couleur partagee** pour toutes les cartes (le bleu actuel). Jamais un systeme de couleurs par famille facon Lexique (juge « loisirs / aventure », pas « accompagnement professionnel »).
3. **« Mes documents » regroupe les 3 parcours CV derriere une tuile**. Ce n'est PAS une fusion : les 3 parcours restent distincts, juste regroupes pour liberer de la place. La tuile doit rester sans ambiguite.
4. **Chaque sous-carte** (a l'interieur d'une fenetre) porte une courte phrase descriptive, pas juste une icone et un mot.
5. **Retirer `afficherProgression('cv')` de l'accueil** : ne plus rendre la liste des 7 etapes (pas juste la masquer en CSS), mais **garder les boutons « Restaurer » / « Reinitialiser »** qui sont rendus dans le meme bloc.
6. **Barre de recherche remontee en haut de page** :
   - corriger le sens d'ouverture : `.resultats-erip-dropdown` (`css/style.css`) s'ouvre aujourd'hui vers le HAUT (`bottom: 100%; top: auto;`), logique en bas de page. Une fois en haut, elle doit s'ouvrir vers le BAS.
   - reproduire FIDELEMENT le moteur riche existant (voir section 4), jamais une version appauvrie. Les cartes metier riches (`carteMetierHTML()`) et les pastilles legeres cohabitent dans le meme encart flottant.
   - elargir le champ couvert : nom d'un module (« Lexique », « Mon Carnet »), mot du Lexique (definition affichee directement + bouton optionnel « En savoir plus dans le Lexique », jamais de redirection auto), frein.
   - resultat cliquable dans un encart flottant blanc opaque, positionne juste SOUS la barre (position calculee en JS), jamais de navigation automatique a la validation, jamais ancre au bas de l'ecran. Meme encart pour « aucun resultat ».
   - tolerance casse / accents via `normaliserTexte()` (`data/metiers.js`), jamais une nouvelle logique.
   - reprendre l'effet « exemple de recherche qui change toutes les 5 a 6 secondes » de la maquette Boussole.
7. **Infobulle « i » par carte** : reutiliser `.bulle-info-hover` / `initBulleInfoHoverFlottante()` (`js/app.js`), deja corrige (contraste clair / sombre, ne deborde jamais l'ecran). Jamais en reconstruire une. L'infobulle vit a l'INTERIEUR de la fenetre qui s'ouvre, pas sur la carte d'accueil. Texte complementaire de ce que les sous-cartes montrent deja, jamais une redite. Sur mobile / tactile : ouverture au clic, pas au survol. Tout bouton de fermeture doit avoir un `z-index` explicite superieur au reste.
8. **Un seul pulse actif a la fois sur l'ecran** (aujourd'hui plusieurs elements peuvent pulser en meme temps : 5 icones persistantes, boutons, infobulles). Ordre de priorite : l'infobulle « i » d'une fenetre ouverte passe devant les 5 icones persistantes.
9. **Fenetres d'action `ouvrirFenetreERIP()` : ne JAMAIS se fermer au clic exterieur** (uniquement croix + Echap). Le vrai code est deja conforme : ne pas regresser en implementant la maquette (la maquette d'origine avait ce bug).
10. **Reorganiser la Boite a outils** : les 12 tuiles bleues identiques de `ouvrirChoixPreparationAccueil` (`data/metiers.js`) en 2 ou 3 categories avec sous-titres. Reutiliser le style de carte deja existant dans l'app, PAS de nouvelle charte graphique. Denis a mis en pause la refonte ambitieuse (nouveau modele d'interaction) faute de maquette validee ; la version cadree et atteignable = les 6 cartes + cette reorganisation avec le style existant. Le texte d'aide `AIDE_PAGES.cv` entree `#btnPreparationAccueil` a deja ete mis a jour (8 outils listes) ; la reorganisation de fond reste a faire.
11. **Re-placer les 4 pages de presentation provisoires** : retirer leurs tuiles de `ouvrirChoixPreparationAccueil` ; ATS vers la carte « Outils d'analyse » ; Regard recruteur vers « Me preparer a candidater » ; Se tenir informe vers sa propre carte (sous-carte « Actualites ») ; « Comparer mes pistes » devient une **fonction transversale** (points d'entree : fiche metier, carte « Vous hesitez encore ? », resultats de recherche), pas une carte d'accueil. Les teintes d'accent des maquettes sont des placeholders, a accorder ensemble.
12. **Generaliser les 3 comportements du patron page d'intro** (section 3) aux modules qui recoivent un document (Coherence, Decouverte), et **harmoniser la position du bouton « Revoir la presentation »** : Denis le veut en haut a gauche ; il est en haut a droite partout aujourd'hui.
13. **Comportement de la disquette « Sauvegarder »** : sur l'accueil, le mot « Sauvegarder » s'affiche a cote de l'icone. Des que la personne entre dans un parcours, le mot disparait, il ne reste que l'icone.
14. **Couleur du pulse d'attention** : une seule couleur dediee, jamais utilisee ailleurs sur la page. Reutiliser l'ambre de la palette de statut existante, pas la couleur heritee du hasard d'un emoji.
15. **Lien obligatoire** : au moment de traiter la page d'introduction d'un module dans ce chantier, ouvrir `docs/PAGES_INTRODUCTION_MODULES_RECUEIL.md` (structure canonique + texte des cartes) ET `docs/IDEES_A_RECLASSER.md` (banque de fonctions par module).

Portee du chantier : Mode A, tres gros. Aucune charte graphique nouvelle validee. Avancer bloc par bloc, maquette et questions avant code des qu'il y a un doute d'interface, corrections regroupees par bloc.

---

## 6. Contraintes structurantes a garder en tete

- Application statique, autofinancee, pas de budget API : toute generation reste un cycle copier / coller vers un assistant externe. Contrainte fondatrice, pas temporaire.
- Philosophie non negociable : l'assistant en ligne accompagne, explique, guide ; il ne remplace jamais le candidat ni le conseiller. Voir `docs/CONSTITUTION_ERIP.md`.
- Toujours verifier `git log` et le code reel avant de traiter un point de memoire ou de doc comme « reste a faire » : plusieurs incidents de doc perimee l'ont confirme necessaire.
- L'application est deja integree chez le partenaire Inkeo C&C / PCGI 87 (Haute-Vienne).
