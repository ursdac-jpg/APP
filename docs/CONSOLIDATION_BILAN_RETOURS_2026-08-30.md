# Consolidation Bilan - retours de revue de Denis (2026-08-30)

Revue par Denis de l'etat livre (Lot A + D9, `HEAD` sur `master`). Denis
donne ses retours au fil de l'eau ; **aucune correction tant qu'il n'a pas
dit "tu peux corriger"**. Ensuite : passer toutes les corrections dans
l'ordre qui minimise temps + risque.

Ce fichier = la trace. La liste vit aussi dans le chat.

---

## >>> ETAT AU 2026-08-30 (fin de session) <<<

**FAIT et commite sur `master` (npm test 603, checkLexique OK, navigateur
clair + sombre a chaque lot) :**

- **Lot 1** (`a565cde`) : barre d'etapes -- etape courante bleu + jaune,
  halo non rogne, proportions maquette. R6 + R7.
- **CLAUDE.md** (`c9d9a60`) : fichier maitre du projet + commande `/app`.
  Regle "pas d'icone a visage" (`bdd4355`, precisee : silhouette neutre OK).
- **Lot 2** (passe maquette, `4435f3b` -> `c014077`) : barre jaune, boutons
  "Choisir" alignes, fiche imprimable, 3e etat de triage, icones (📷 👍 🚧,
  ancre R12), encart de triage R13, pastilles de verdict R15, ecran
  "Organiser votre CV" (2.3, Option 1 : apres le rapport, cas B), Accompagne
  = 4 ecrans confirme.
- **Lot 3** (refonte visuelle du rapport en code, `a00fd08` -> `8c74ce3`) :
  - 3a : fondation CSS (`.bloc-depli` + variantes, `.pastille-verdict`,
    `.encart-triage`, jetons `--alert` / `--alert-bg` = rouge brique doux
    de la maquette).
  - 3b-3g : TOUS les blocs du rapport passes en `.bloc-depli` replies, tons
    de la maquette (ambre au lieu du rouge dramatique), pastilles de verdict
    dessinees, icones sans visage, encart de triage R13. Synthese aussi
    repliee (choix Denis : suivre la maquette). Rafraichissement cible
    VERIFIE (clic triage -> seule la carte change).
  - 3h : les 3 cartes de correction en `.cartes-choix` / `.carte-choix`
    (boutons "Choisir" alignes, R11).
- **R2** (`019988c`) : 🛠️ au lieu du cerveau sur "Competences et logiciels".

**FAIT (suite, meme session) :**

- **Lot 4** (`afd5cd3`) : ecran "On organise votre CV" (Option 1). Cas B ->
  ecran organiser seul, aucune carte (plus de grisage). Cas A -> 3 cartes.
- **Lot 5** (`a05ba4f`) : "Modifier mon CV" (`blocEditionCV`) rapproche du
  langage `.bloc-depli` -- restyle LEGER, classe scope `bloc-cv-refonte`,
  `.bloc-erip` (partage Mon projet, D7) jamais touche, mecanique
  div-toggle inchangee.
- **R16** (`13c08b4`) : "Garder comme Repere" ramene au gabarit des gestes
  de triage (override scope de `reperes.css`).
- **R17** (`13c08b4`) : bouton "Imprimer une fiche de synthese" lisible
  (btn-outline-primary taille normale).
- **D11** (`13c08b4`) : "Mes coordonnees" = raccourci vers "Modifier mon
  CV" bloc "Vous", plus de 2e formulaire.
- **Checklist Partie D** : `npm test` 603, `checkLexique` OK, rapport
  clair + sombre OK, **parcours Accompagne rejoue bout-en-bout** apres
  tous les changements (preparation-chiffres -> generation -> assistant
  partage -> relecture -> Appliquer ecrit bien dans `dossier.experiences`
  -> cloture unifiee) : OK.

**>>> CHANTIER CLOS (2026-08-30). Point de retour arriere : `a05ba4f`. <<<**

**Correctif 2026-08-30 (suite, apres audit demande par Denis)** -- 2 retours
etaient restes ouverts :
- **R1** (`1e04c1c`) : la derniere icone "yeux" 👁 (titre "Relisez et
  validez chaque modification", `htmlBilanAssistanceRelecture`) -> 📝.
  Plus aucune icone "yeux" dans `js/app.js`.
- **R9** (`1e04c1c`) : ecran "Verifiez les informations importees" --
  R9a instruction en encart teinte visible (etait en petit gris) ;
  R9b corbeille sur les elements ajoutes a la main (groupe 'ajoutes'),
  retrait reel de la ligne au lieu du simple decochage.
- **"Preparer" bloc 1** (`6c18127`) : la zone "Ou coller le texte" a un
  bouton "Annuler" (champ vide) / "Enregistrer ce texte" (champ rempli),
  pour pouvoir la refermer.
- **D5a** (`fb9346f`) : question "Continuer / Recommencer" a CHAQUE entree
  quand un travail est en cours (pas seulement quand une candidature est
  deposee -- inclut "Preparer" sans depot).
- **D5d** (`0d05ce3`) : "Retour" d'un ecran de travail -> page de
  presentation du module -> accueil (drapeau `_etatBilan.voirIntro`).
- **D5b** (`d38070b`) : plus de boite de dialogue -> page de presentation
  (mode detour) + bandeau "Vous avez une analyse en cours" + boutons
  "Continuer mon analyse" / "Recommencer a zero".
- **D5c** (`e9bdf12`) : bouton permanent "Revoir la presentation" sur
  chaque ecran de travail, non destructif.
- **Audit 2026-08-30** : 3.1 et 3.4 etaient DEJA FAITS (le plan doc ne
  l'avait jamais acte). Rien a faire. **Module entierement termine.**

Reste hors chantier (chantiers separes, deja identifies) :
- Fusion des ~5 collecteurs de contexte de candidature en
  `htmlPanneauCandidature()` unique (dette B.1 de `BRIQUES_COMMUNES.md`).
- Fusion `bilan-v1.md` + rubriques (supprimer le passage IA residuel du
  cas B) -- mini-chantier prompt + re-test qualite.
- R8 (carte "reorganiser mon CV" de l'Accompagne -> quelle fenetre avec
  video) : la cible exacte reste a choisir avec Denis ; aujourd'hui encore
  `bilanOuvrirEditionCV()`.

---

## META - regle a renforcer (demande explicite de Denis, 2026-08-30)

Denis a passe ~4-5 h a mettre au point + valider la maquette
(`MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html`) et se retrouve avec
l'ancien visuel. A renforcer dans `LECONS_A_NE_PAS_REPRODUIRE.md` (Regle 11)
et `TRAVAILLER_AVEC_DENIS.md` :

1. **Maquette validee = cible a implementer fidelement (~100 %).** Quand
   Denis a valide une maquette et demande son implementation, le resultat
   doit etre tres proche de la maquette, JAMAIS un repli sur l'ancien
   visuel "par prudence". Garder l'ancien look = une faute, pas une
   securite. Le fonctionnel est protege par l'inventaire GARDE/DEPLACE/
   FUSIONNE/ENRICHI ; le visuel est protege par la maquette.
2. **"zero regression" + maquette existante** = zero regression
   **fonctionnelle** seulement. Le visuel doit devenir la maquette.
3. **"zero regression" SANS maquette + contexte ambigu** = poser
   concretement la question a Denis : regression **visuelle /
   conceptuelle / fonctionnelle / l'ensemble** ?

(Memoire mise a jour : `feedback_zero_regression_est_fonctionnel.md`.)

**Consequence sur ce chantier** : la refonte visuelle du rapport (Lot B
#3/#4) n'est pas optionnelle ni "si le temps le permet" - c'est le coeur
de ce que Denis attend. Temps de travail supplementaire assume par Denis.

---

## Reperes transverses

- **Refonte VISUELLE du rapport (`htmlBilanRapport`) = Lot B, PAS encore faite.**
  Ce que Denis voit aujourd'hui = ancien visuel (`.bloc-erip`, encarts
  teintes, triangles) + ajouts fonctionnels du Lot A (couche 2, 3e etat de
  triage, fiche imprimable, ecran consolide). Les accordeons `.bloc-depli`,
  bordures gauche colorees, fonds de summary colores, en-tete de section,
  buckets restyles de la maquette validee
  (`docs/MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html`) arrivent avec
  le Lot B. L'impression de Denis ("plus proche de ce que j'avais que de ce
  que j'ai valide") est donc exacte.
- Plusieurs retours d'icones ci-dessous sont des **evolutions de la
  maquette** (la maquette validee porte deja l'icone en question) - a
  reporter dans la passe maquette du Lot B, pas a trancher a chaud.

---

## Liste des retours

### R1 - "Premiere impression" : remplacer l'icone "yeux" par une autre (PAS la retirer)
- **Ou** : carte "Premiere impression" du bloc "Premiere lecture du
  recruteur" -> `js/app.js` ~13678 (`htmlBilanRapport`, `&#128064;`).
  Aussi `&#128064;` sur "Relisez et validez chaque modification" ->
  `js/app.js` ~14960 (`htmlBilanAssistanceRelecture`).
- **Demande (MAJ 2026-08-30, apres relecture de la maquette par Denis)** :
  Denis ne veut pas les "yeux", mais il VEUT une icone sur "Premiere
  impression" - il constate qu'elle en manque une. -> proposer une icone
  parlante (pas les yeux), l'ajouter aussi dans la maquette (la maquette
  n'en a pas). Pour "Relisez et validez" : retirer / remplacer les yeux
  aussi.
- **Fichiers/fonctions** : `htmlBilanRapport`, `htmlBilanAssistanceRelecture`,
  + maquette.

### R2 - Icone "cerveau" a retirer
- **Ou** : bloc "Competences et logiciels" -> `js/app.js` ~7964
  (`CONFIG_BLOC_COMPETENCES_CV`, `&#129504;`).
- **Attention** : ce bloc de config est PARTAGE par `blocEditionCV`
  ("Modifier mon CV", Bilan) ET `blocERIP` ("Mon projet"). Changer l'icone
  touche les deux (D7 : `blocERIP` jamais touche). A trancher : icone
  neutre partout, ou override cote Bilan seulement.
- **Fichiers/fonctions** : `CONFIG_BLOC_COMPETENCES_CV`, consommee par
  `blocEditionCV` / `blocERIP`.

### R3 - Icone "ce qui donne envie" (bulle verte) - plus expressive
- **Ou** : `js/app.js` ~13681 (`htmlBilanRapport`, `&#128994;` rond vert).
- **Demande** : la bulle verte est tres bien ; remplacer le simple rond
  vert par une icone plus expressive.
- **Maquette** : porte deja `&#128994;` -> evolution de la maquette.
- **Fichiers/fonctions** : `htmlBilanRapport`.

### R4 - Icone "ce qui peut freiner" (triangle) - plus legere
- **Ou** : `js/app.js` ~13683 (`htmlBilanRapport`, `&#9888;&#65039;`).
- **Demande** : le triangle fait "fataliste" et c'est le MEME que
  "A verifier" / "Points a corriger avant tout envoi" (`js/app.js` ~13604).
  Denis veut quelque chose de plus leger et distinct.
- **Maquette** : porte deja `&#9888;&#65039;` -> evolution de la maquette.
- **Fichiers/fonctions** : `htmlBilanRapport`.

### R5 - Ecart maquette / rapport (refonte visuelle)
- Voir "Reperes transverses" ci-dessus. = Lot B #3/#4 (refonte visuelle de
  `htmlBilanRapport` + `rendreCarteAxe` + `rendreCarteRecommandation` +
  `bilanCarteIgnorable` + `bilanFicheSyntheseHtml`, classe `.bloc-depli` a
  creer dans `css/style.css`, theme-aware clair + sombre). Maquette d'abord.

### R6 - Barre d'etapes trop grande / icone courante coupee
- **Ou** : `bilanBarreEtapes()` -> `js/app.js` ~12381-12408.
- **Constat** :
  - Conteneur inline `padding-bottom:0.15rem` (~2.4px) alors que le halo de
    `.pastille-etape-action-ouverte` deborde de 5px + `overflow-x:auto`
    -> le halo (et visuellement "l'icone") de l'etape courante est rogne.
    Bug DEJA corrige sur la barre de la page Action (`css/style.css`
    ~1302-1308 : padding porte a 0.4rem) - `bilanBarreEtapes` a son propre
    conteneur et re-introduit le bug (dette : ne reutilise pas
    `.ligne-etapes-action`).
  - Pastilles plus grosses que la maquette (`.pastille-etape-action`
    `padding 0.5rem 0.9rem` vs maquette `.etape` `padding .3rem .7rem`),
    conteneur `nowrap + overflow-x:auto` vs maquette `flex-wrap:wrap`.
- **Action** : reduire la taille des pastilles de cette barre + garantir
  que le halo de la courante n'est jamais rogne (padding suffisant, ou
  reutiliser le conteneur de la page Action).
- **Fichiers/fonctions** : `bilanBarreEtapes`, `css/style.css`
  (`.pastille-etape-action*`, `.ligne-etapes-action`).

### R7 - Etape courante : fond jaune manquant
- **Ou** : `bilanBarreEtapes()` applique seulement
  `.pastille-etape-action-ouverte` (halo bleu). La classe
  `.pastille-etape-action-courante` (fond jaune `#fffaeb`, `css/style.css`
  ~1342) existe et sert sur la page Action, mais pas ici.
- **Demande** : garder le contour/halo bleu ET ajouter le fond jaune sur
  l'etape courante.
- **A CONFIRMER avec Denis** : la decision du bloc 3.6 (plan de
  consolidation) etait "halo bleu, PAS le jaune de Coherence (choix A de
  Denis)". Ce retour est un revirement assume -> a acter avant correction.
- **Fichiers/fonctions** : `bilanBarreEtapes`, `css/style.css`.

### R8 - Accompagne, etape de reorganisation du CV : fenetre simple au lieu de complete
- **Ou** : carte "Organisation de votre CV" de l'ecran relecture ->
  `[data-assistance-structure-ouvrir]` -> `bilanOuvrirEditionCV()`
  (`js/app.js` ~14487, cablage dans `brancherEvenementsAssistanceRelecture`).
  `bilanOuvrirEditionCV` ouvre `blocEditionCV` (editeur de champs simple).
- **Demande de Denis** : cette activite (reorganiser le CV) peut etre faite
  en autonomie OU accompagnee. Une personne qui a ete accompagnee par un
  professionnel pour l'etape 1 et se retrouve seule devant l'etape 2 sera
  perdue -> elle a besoin de la **fenetre complete** (video + toutes les
  consignes), pas de la version simple. Denis dit l'avoir demande
  explicitement.
- **A INVESTIGUER avant correction** : identifier "la fenetre complete".
  Candidats : `ouvrirAtelierCV()` (`js/app.js` ~14293), `ouvrirAssistantDepotCV()`
  ("plus grosse fenetre", `data/metiers.js`), un assistant de structuration
  avec video. Verifier laquelle porte la video + les consignes voulues.
- **Fichiers/fonctions** : `htmlBilanAssistanceRecommandationsNonAutomatisables`,
  `brancherEvenementsAssistanceRelecture` (le `forEach` sur
  `[data-assistance-structure-ouvrir]`), `bilanOuvrirEditionCV` vs
  `ouvrirAtelierCV` / `ouvrirAssistantDepotCV`.

### R9 - Ecran "Verifiez les informations importees" : rendre l'instruction visible + supprimer ses propres ajouts
- **Ou** : `ouvrirEcranValidationImport()` -> `js/app.js` ~22646. Ecran
  atteint quand la personne re-depose son CV pour le reorganiser en
  rubriques. **Fenetre PARTAGEE** par tous les parcours de depot de CV de
  l'app, pas seulement le Bilan.
- **R9a - message perdu dans la masse** : l'instruction "Décochez ce que
  vous ne souhaitez pas ajouter, modifiez librement le texte avant de
  valider." (`js/app.js` ~22667) est en `text-muted small`, on ne la voit
  pas. -> la differencier : fond, icone, ou encadre, pour qu'on comprenne
  ce qu'il faut faire.
- **R9b - supprimer (pas seulement decocher) les elements AJOUTES a la main**
  : aujourd'hui, un element ajoute via "+ Ajouter un élément"
  (`wireAjoutManuelValidationImport`, groupe `'ajoutes'`) ne peut qu'etre
  decoche - la ligne (parfois vide) reste a l'ecran. Denis veut un vrai
  "clic pour supprimer" **uniquement sur les elements que la personne a
  ajoutes elle-meme** (groupe `'ajoutes'`). Les elements proposes par
  l'assistant (`nouveaux` / `doublonsProbables`) gardent le decochage seul.
  Raison : quelqu'un ajoute un element, se ravise, ne veut pas laisser une
  ligne vide/parasite.
- **Fichiers/fonctions** : `ouvrirEcranValidationImport` (R9a, le `<p>`
  d'intro) ; `ligneItemListeTextes` / `ligneItemCompetence` /
  `ligneItemExperience` / `ligneItemListeObjets` (`js/app.js` ~21080-21230,
  ajouter un bouton supprimer si `groupe === 'ajoutes'`) + un cablage qui
  retire le noeud du DOM (les `'ajoutes'` sont relus directement du DOM par
  `lireDecisionsValidationImport`, donc retirer le noeud suffit, aucun etat
  a nettoyer). Bas risque.
- **Note perimetre** : fenetre partagee -> a tester aussi depuis un depot
  de CV hors Bilan.

### R10 - Passage "Organiser le CV en rubriques" : absent de la maquette comme etape + question de fond
- **Etat du code** : les 3 cartes de correction sont bloquees tant que
  `dossierAStructureExperiences()` est faux. `assurerCVStructure(cb)`
  (`data/metiers.js` ~2547) : si deja structure -> `cb()` immediat ; sinon
  `confirmerAction("Organiser votre CV", "... Cette etape passe par
  l'assistant ...")` -> `structurerTexteExistant()` -> `ouvrirAssistantDepotCV`
  a `etapeInitiale: 3` = **un aller-retour IA** (`extraction-cv.md`).
  Conditionnel : invisible pour qui vient du parcours normal (CV deja
  structure au depot).
- **Maquette** : ce passage n'est PAS un ecran. Il est seulement
  **mentionne en texte** ("Vous pourrez revoir et corriger le contenu
  apres le rapport, une fois qu'il aura ete range en rubriques",
  maquette ~500) + note dans le plan Partie E.1 ("3 cartes desactivees
  tant que CV pas organise | Non montre | Note ajoutee a la maquette").
  Donc : **connu, traite comme une note, jamais concu comme un ecran.**
  Pas un oubli pur ; pas une decision de le retirer non plus (le code le
  garde). Claude n'a pas pousse pour le dessiner en ecran -> a corriger.
- **Question de fond de Denis** : a-t-on besoin d'un CV range par rubriques
  pour pouvoir le modifier ensuite ?
  - **Carte 3 (Accompagne)** : OUI, indispensable. "Appliquer" ecrit par
    `destination` (`dossier.experiences[i].missions`, `mecanisme:
    'remplacement'`) - impossible sans rubriques adressables. Idem
    `blocEditionCV` / `ouvrirFenetreExperiences` (editeurs de champs).
  - **Cartes 1 et 2** : besoin moindre (reco + `extraitConcerne` +
    `phraseAChiffrer` ; Carte 2 ne touche jamais `dossier`). A verifier si
    l'"Appliquer" de la Carte 1 ecrit dans des champs structures.
  - Fusion dans le diagnostic (1 prompt) : deja essayee, abandonnee ;
    `bilan-v1.md` deja ~24k caracteres ; melange analyse + extraction ;
    c'est le travail d'`extraction-cv.md`, pas du diagnostic.
- **Reco Claude (option A)** : **garder** le passage, mais en faire un
  **vrai ecran** dans la maquette Lot B (aujourd'hui = `confirmerAction()`
  + note), avec **la fenetre complete (video + consignes)** = rejoint R8.
  Benefice : les corrections s'appliquent au bon endroit, ET l'ecran
  explicite/rassure exactement la personne accompagnee a l'etape 1 qui
  arrive seule ici. Risque : un ecran de plus - mitige : n'apparait que si
  le CV n'est pas deja range (jamais pour le parcours normal).
  - Option B : passage exige seulement pour la Carte 3, saute pour 1 et 2.
    Benefice : moins de friction sur les corrections legeres. Risque :
    incoherence (parfois demande, parfois non), et une Carte 1 qui
    appliquerait dans le dossier casserait sans structure.
  - Option C : fusion dans le diagnostic. Benefice : 0 passage en plus.
    Risque : deja abandonne, prompt sature, qualite de structuration
    degradee.
- **= meme sujet que R8.** A concevoir ensemble dans la maquette Lot B.
- **Fichiers/fonctions** : `assurerCVStructure`, `structurerTexteExistant`
  (`data/metiers.js`) ; `htmlBilanAgirChoixContenu` + `blocStructuration`
  (le gate) ; maquette (nouvel ecran a dessiner).

- **MAJ 2026-08-30 (Denis creuse : "ce passage est plus pour la personne
  que pour l'IA")** - analyse code approfondie :
  - **L'IA n'en a PAS besoin** : elle recoit le texte complet du CV dans le
    prompt de toute facon. Denis a raison sur ce point.
  - **L'APP en a besoin** pour 3 sorties, jamais pour l'IA :
    - **Carte 1 "Corriger"** -> `bilanDeclencherActionCorrection` ouvre
      l'editeur AU BON ENDROIT (il faut des "endroits" = rubriques). ("C'est
      corrige" seul = simple coche `_bilanStatutsCorrection`.)
    - **Carte 3 "Appliquer"** -> ecrit `dossier.experiences[i].missions` par
      `destination` -> impossible sans rubriques adressables.
    - **"Finaliser et telecharger"** -> l'Atelier CV rend les gabarits
      PDF/Word depuis `dossier.experiences`/`formations`/... -> un CV en
      texte brut = plus de gabarit, grosse regression de la sortie.
  - **Carte 2 "copier"** : ZERO structure requise (la personne copie dans
    son propre document, `dossier` jamais touche).
  - **Aujourd'hui** : DEUX verrous en amont du choix de carte -
    (1) `htmlBilanAgirChoixContenu` masque les 3 cartes si `!dossierAStructureExperiences()`,
    (2) chaque `[data-agir-carte]` appelle `assurerCVStructure()` avant
    d'ouvrir le mode. Pour qui vient du parcours normal (depot via
    l'assistant), le CV est deja structure -> les 2 verrous sont invisibles.
    Le passage ne se declenche QUE pour un CV arrive en texte brut.
  - **Reco Claude (revue)** : ne pas SUPPRIMER, mais **decoupler du choix
    de carte** + **rendre paresseux et contextuel** :
    1. apres le diagnostic, les 3 cartes sont choisissables directement
       (retirer le masquage de `htmlBilanAgirChoixContenu`) ;
    2. **Carte 2** : ne jamais structurer ;
    3. **Cartes 1 / 3 / "Finaliser"** : `assurerCVStructure()` au moment
       d'entrer dans le chemin, et seulement si pas deja structure (cas rare)
       -> ecran court, en contexte, avec video + consignes (= R8) ;
    4. garder un "ajouter une experience / une info" accessible depuis les
       cartes sans imposer la vue "tout le CV en rubriques".
  - **3e voie a la question de Denis (autre que "2e passage IA" ou "fusion
    des prompts")** : (a) garantir que le depot normal produit toujours la
    structure -> le passage Bilan devient un cas-limite rare ; (b) pour le
    "remplacement" de la Carte 3 quand la reco a un `extraitConcerne`,
    splice au niveau du texte (chercher/remplacer le passage) sans
    structure complete - ne couvre pas "ajouter" ni l'export.
  - **A trancher par Denis** : option "decoupler + paresseux" (reco) vs
    "garder le gate upfront" vs "supprimer entierement" (casse Carte 1/3 +
    export).

- **TRANCHE (2026-08-30, Lot 2.3) : Option 1.** L'ecran "Organiser votre
  CV" se place **apres le rapport, avant les 3 cartes**, en plein ecran,
  pour tout le monde en **cas B** (CV arrive en texte brut). Cas A (CV
  construit dans l'app) : jamais, on va direct du rapport aux 3 cartes.
  Raison : la personne voit son resultat (le rapport) AVANT de fournir le
  2e aller-retour ; qui ne veut que le diagnostic ne le fait jamais ;
  l'entree ("Preparer") reste legere. Ce n'est pas un "gate par carte"
  (ecarte pour l'egalite des cartes) : un seul ecran, une fois, puis les
  3 cartes a egalite.
  - Texte de l'ecran **valide par Denis** (voir maquette, `data-vue="organiser"`).
  - Rappels : `bilan-v1` (diagnostic) tourne sur le texte brut, n'a PAS
    besoin des rubriques. `extraction-cv` (rangement) = un aller-retour
    separe. Fusion des deux : abandonnee (qualite).
  - **= aussi la cible de R8** (carte "reorganiser mon CV" de l'Accompagne).
  - **Action code (Lot 4)** : sortir le gate de `htmlBilanAgirChoixContenu` ;
    quand `!dossierAStructureExperiences()` en cas B, afficher un bloc
    "On organise votre CV" (a la place des 3 cartes) menant a
    `assurerCVStructure()` ; au retour, les 3 cartes. Cabler R8 sur le
    meme chemin.

### R11 - Boutons "Choisir" des 3 cartes de correction : pas alignes
- **Ou** : les 3 cartes "ecrire avec mes mots" / "trouver les bons mots" /
  "accompagne" sous le rapport (`htmlBilanAgirChoixContenu`, `js/app.js`
  ~13888) ET dans la maquette (`data-vue="rapport"`, les 3 `.carte` du bas).
- **Demande** : les boutons "Choisir" doivent etre **alignes** quelle que
  soit la longueur du texte de chaque carte. Au besoin, allonger le texte
  ou agrandir le titre pour egaliser.
- **Action** : cartes en hauteur egale (flex, `align-items: stretch`) +
  bouton pousse en bas (`margin-top: auto`). A faire dans la maquette
  d'abord, puis le code. Faible complexite.
- **Fichiers/fonctions** : `htmlBilanAgirChoixContenu` + CSS, + maquette.

### R12 - Icone "Garder comme Repere" incoherente
- **Constat Denis** : sur les recommandations, l'icone n'etait pas la bonne.
- **Verif code** : l'app utilise DEJA l'ancre partout via la fonction
  partagee `reperesBoutonAncre()` (`_reperesRenduBoutonAncre`,
  `modules/reperes/index.js` ~255 : `'⚓ Garder comme Repère'`). Aucune
  incoherence cote application. Seul un commentaire perime dans
  `js/app.js` ~13572 parle encore de "📋 Garder comme Repere".
- **Maquette** : les recommandations utilisaient `&#128203;` (presse-papiers),
  les axes `&#9875;&#65039;` (ancre). **Corrige dans la maquette** (Lot 2.1/2.2) :
  ancre partout.
- **Action code** : nettoyer le commentaire perime `js/app.js` ~13572
  (zero risque). Rien d'autre.

### R13 - Regrouper les deux gestes de triage dans un encart a part
- **Demande Denis** : "J'en ai (deja) pris connaissance" et "Je ne suis
  pas d'accord" = meme geste ("ce point est traite pour moi"). Les mettre
  cote a cote dans un petit rectangle borde, distinct de "Generer une
  proposition" (agir) et "Garder comme Repere" (mettre de cote).
- **Fait dans la maquette (Lot 2.2)** : nouvelle classe `.encart-triage`
  (bordure pointillee violette, fond violet tres pale, mode sombre inclus),
  mini-intitule "Ou classer ce point :", sur les 7 points ignorables
  (2 alertes + 3 axes + 2 recommandations).
- **Action code (Lot 3)** : `htmlBilanRapport` -> sortir les 2 boutons de
  triage de la rangee d'actions et les rendre dans un `.encart-triage`
  (a creer dans `css/style.css`, theme-aware). `bilanCarteIgnorable()` /
  `bilanAlertesStructurellesCV()` produisent ces boutons.

### R14 - Pas d'icone avec un visage / des traits (silhouette neutre OK)
- **Consigne Denis (2026-08-30, precisee)** : ecarter les icones de
  **visage / traits de visage / expression** (yeux, emoji de visage,
  cerveau). Prendre un objet concret. **Exception : une silhouette neutre
  sans traits (👤) reste acceptable.** Ajoute a `CLAUDE.md` + memoire
  `feedback_pas_d_icones_avec_tete`.
- **Sur ce chantier** : 📷 👍 🚧 🛠️ sont conformes. **`&#128100;` 👤
  "Premiere lecture du recruteur" est GARDE** (silhouette, pas un visage).
  Loupe 🔍 ecartee (deja polysemique / utilisee ailleurs dans l'app).
  Rien a changer cote code pour cet en-tete.

### R15 - Ronds de verdict 🟢🟡🔴 -> pastille dessinee (Option A)
- **Constat Denis** : les ronds emoji font "mediocre" a cote du reste ; le
  🔴 est un peu agressif.
- **Fait dans la maquette (Lot 2.2)** : classe `.pastille-verdict`
  (`.v-ok` / `.v-warn` / `.v-alert`), petit disque aux couleurs du theme
  (`--ok` / `--warn` / `--alert`) + halo doux de la teinte pale. Applique
  a la legende "Chaque dimension est classee : ..." + aux 3 en-tetes de
  bucket. Rendu clair + sombre verifie. **A valider visuellement par Denis.**
- **Action code (Lot 3)** : creer `.pastille-verdict` dans `css/style.css`
  (theme-aware) ; `htmlBilanRapport` remplace `&#128994;/&#128993;/&#128308;`
  (buckets + legende) par ces `<span>`.
- **Bug corrige au passage** : mes regles mode sombre de `.encart-triage`
  (R13) utilisaient `[data-theme="sombre"]` alors que la MAQUETTE bascule
  avec `body.dark` -> corrige en `body.dark`. (Cote app c'est bien
  `[data-theme="sombre"]` -- ne pas confondre les deux.)

### Icones validees (Lot 2.2, defaut Denis)
- "Premiere impression" : **📷** (`&#128248;`) - remplace 👁.
- "Ce qui donne envie" : **👍** (`&#128077;`) - remplace le rond vert 🟢.
- "Ce qui peut freiner" : **🚧** (`&#128679;`) - remplace ⚠️ (choix Denis,
  ma reco 🤔 ecartee = tete).
- "Competences et logiciels" (R2, `CONFIG_BLOC_COMPETENCES_CV`) : **🛠️**
  - remplace 🧠. **Change aussi dans "Mon projet"** (config partagee),
  accepte par Denis.

### R3/R4 - confirmes apres relecture maquette
Denis confirme : rond vert -> icone plus parlante ; triangle "ce qui
freine" -> autre chose (le triangle fait "grave" par ressemblance avec les
alertes du haut, alors que ce n'est pas grave). A repercuter dans la
maquette aussi.

---

## Fenetres / fonctions touchees (vue d'ensemble, pour l'ordre d'execution)

| Zone | Retours | Fichier principal |
|---|---|---|
| `htmlBilanRapport` (icones + refonte visuelle) | R1, R3, R4, R5 | `js/app.js` |
| `htmlBilanAssistanceRelecture` (icone yeux) | R1 | `js/app.js` |
| `CONFIG_BLOC_COMPETENCES_CV` (icone cerveau, partage Mon projet) | R2 | `js/app.js` |
| `bilanBarreEtapes` + CSS pastilles | R6, R7 | `js/app.js` + `css/style.css` |
| Accompagne -> reorganisation CV (fenetre) | R8 | `js/app.js` (+ `data/metiers.js`) |

**Regroupements naturels pour l'execution :**
- Lot "icones rapport" : R1 + R3 + R4 (meme fonction `htmlBilanRapport`, un
  seul commit, un seul test navigateur) - mais R3/R4 dependent d'un choix
  d'icone de Denis, et se recouvrent avec R5 (refonte visuelle Lot B).
- Lot "barre d'etapes" : R6 + R7 (meme fonction + meme CSS, un commit).
- R2 : isole (touche une config partagee - prudence Mon projet).
- R8 : isole, investigation d'abord.
- R5 : Lot B, maquette d'abord, ne se traite pas dans cette passe de
  corrections rapides.
