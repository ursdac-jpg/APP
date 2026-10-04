# Chantier : parcours guidé de l'outil de veille (`outils/veille.html`)

> Ouvert le 2026-09-22 (maquette `docs/MAQUETTE_VEILLE_PARCOURS_2026-09-22.html`), repris et cadré
> le 2026-09-26 après audit du code réel : la couche guidée posée le 22 n'avait jamais eu son
> fichier de suivi (annoncé « à créer une fois la direction validée » dans la maquette, jamais fait).
> Denis, le 2026-09-26 : après trois tentatives, aucune mise à jour n'a abouti avec l'outil ; « je ne
> comprends rien », « pas de cohérence », « il manque des passages ». Deux modules (Comprendre le
> cadre, Comprendre les chiffres) reposent entièrement sur cet outil pour leur contenu.

## État (toujours à jour en tête de ce fichier)

**2026-09-26, chantier fermé côté Claude.** Blocs 1, 2 et 3 faits et vérifiés au navigateur, ainsi
que le bouton d'aide au dépôt et la couverture complète de toutes les tâches (chiffres, lexique,
import manuel, associations, à confronter, lien mort). Zéro bug connu restant. L'index Git du dépôt
s'est corrompu deux fois pendant la session (écritures concurrentes des deux comptes Claude sur le
même `.git` partagé) - jamais de perte réelle, seulement l'index de préparation, réparé tout seul.
Denis a confirmé que l'autre compte (mise en page PDF) ne devait pas être touché : chaque commit de
ce chantier est resté scopé à `outils/veille.html` et ce fichier de suivi, vérifié avant et après.
**Reste à faire : les tests de Denis lui-même, en conditions réelles.**

## Constat de l'audit du 2026-09-26

Audit du code réel (pas de supposition) + test en direct dans le navigateur du parcours complet
« Créer ou compléter une fiche » avec un faux contenu réaliste : **le moteur fonctionne**
techniquement de bout en bout (collecte -> rédaction -> relecture -> fichiers). Le blocage de Denis
vient très probablement de la navigation, pas d'un parseur cassé :

1. **Bug réel** : un signal de veille hebdomadaire sur le rayon « étranger » envoie vers le mauvais
   prompt de collecte, silencieusement (le rayon existe en un seul morceau côté données `RAYONS`,
   mais est coupé en deux options `etr-sejour`/`etr-demarches` côté sélecteur de prompt).
2. **5 tâches réelles et documentées invisibles** depuis le parcours guidé (aucune carte dans aucun
   sous-menu, atteignables seulement via « Voir tous les outils », qui ne les annonce même pas) :
   Ma base, Un lien source qui ne répond plus, Complément manuel du Balayage, Profil des découpes,
   Professions de santé.
3. Le bouton **« Retour à l'accueil guidé »** ne ramène jamais à l'accueil (les 3 cartes module) :
   il ramène toujours au sous-menu. Le texte ment sur ce qu'il fait.
4. **Deux systèmes de navigation coexistent sans jamais se rejoindre** : les anciens panneaux
   « Ce mois-ci » / « Ce trimestre » (interface à plat) et le nouveau système de parcours guidé.
5. Mode sombre incomplet sur les nouvelles couleurs Chiffres/Lexique (couleurs figées en clair).

Demande de Denis le 2026-09-26, au-delà de ces corrections : un **tableau de bord central** avec
historique (dates, statuts par rayon et par rythme), qui permette d'enchaîner les tâches sans
repasser par un menu à chaque fois, avec un accès direct au prompt réservé à Claude quand le
matériau est déjà en main. **Refusé/déconseillé à ce stade** : fusionner tous les rayons dans un
seul prompt d'analyse (contredit une règle volontaire, LECONS 1bis, un sujet étroit par prompt).

**Second constat, confirmé le 2026-09-26 (signalé par Denis, vérifié dans le code) : un vrai trou,
plus grave que la navigation.** Après le **Balayage** et le **Triage** (repérer ce qui a changé,
dire quelle fiche ça concerne), **l'outil ne relisait jamais la réponse du Triage** - aucune
fonction `lireTriage()` n'existait. Le seul chemin prévu était manuel : recopier chaque ligne à la
main dans `docs/NOUVEAUTES_A_STATUER.md`, puis revenir plus tard redémarrer « Créer une fiche » de
zéro, sans aucun pont automatique comme celui qui existe déjà pour la veille hebdomadaire
(`demarrerFicheDepuisSignal`) ou le Contrôle mensuel (`traiter`). C'est très probablement la cause
principale des 3 échecs de Denis : le point d'entrée naturel de la veille (Balayage) s'arrêtait net
avant Claude. **Corrigé le 2026-09-26** (voir Bloc 1bis).

## Décision de structure (validée avec Denis le 2026-09-26, précisée le même jour)

Précision de Denis après une première version : il pense par **rayon d'abord**, pas par tâche
d'abord (« je choisis quel rayon je veux travailler, et de là je vais jusqu'à ce qu'il soit
implémenté »). Décision retenue :

- **Comprendre le cadre** : le sous-menu par fréquence est remplacé par une **liste des rayons**
  (source unique `RAYONS`). Chaque ligne montre déjà tout ce qui concerne CE rayon (nombre de
  fiches, dernière date de contrôle, signal en attente s'il y en a un) et ses actions directement
  dessus (« Créer / compléter une fiche », « Contrôle ») - un clic suffit pour repartir dans le
  bon parcours, sans écran intermédiaire. Les tâches qui ne concernent pas un seul rayon (veille
  hebdo, Balayage, Triage, Complément manuel, Associations, À confronter, lien source mort) restent
  groupées à part, sous la liste des rayons.
- **Comprendre les chiffres** et **Lexique** : gardent un menu par tâche (pas de « rayon » chez eux,
  juste une poignée de digests et deux actions pour le Lexique) - inutile d'imposer un principe qui
  ne correspond à rien pour ces deux modules.
- **Essentiel vs rare**, dans la nouvelle interface guidée (jamais besoin d'aller sur « Voir tous
  les outils ») : Créer/compléter une fiche, Contrôle, Triage, Ma base, Balayage, veille hebdo,
  Associations, À confronter, lien source mort. Restent derrière « Voir tous les outils » (usage
  rare) : Import manuel, Réglages (cadence, retirer une fiche, registre des adresses, dépôt Git).

Ça résout en même temps le bug de libellé du bouton Retour (plus de sous-menu intermédiaire à
nommer pour les rayons) et les tâches orphelines (toutes rejoignent soit un rayon, soit le groupe
transversal).

## Plan

**Re-séquencement du 2026-09-26** : pendant que Git est indisponible (corruption partagée avec
l'autre compte, voir État en tête de fichier), on privilégie les correctifs qui s'AJOUTENT à
l'existant sans rien restructurer (risque faible, vite fait, testables un par un) plutôt que la
fusion en un seul tableau de bord (gros chantier, risqué à laisser longtemps sans point de
sauvegarde Git). La fusion en tableau de bord reste prévue, mais en Bloc 2, une fois Git de nouveau
disponible et le Bloc 1 committé.

### Bloc 1 - corrections et branchements additifs (faits et vérifiés au navigateur le 2026-09-26,
### en attente de commit à cause de la panne Git)

- [x] Corriger le bug du rayon « étranger » dans `demarrerFicheDepuisSignal()` (déduire
      `etr-sejour`/`etr-demarches` par mots-clés du signal, au lieu de laisser le sélecteur sur son
      ancienne valeur). Vérifié : aucune erreur console, prompt correct après passage par le pont.
- [x] **Le pont manquant Triage -> Créer une fiche** (`lireTriage()`, `demarrerFicheDepuisTriage()`,
      nouvelle zone de collage dans le bloc « Triage du digest ») : chaque ligne retenue du triage
      obtient un bouton direct vers l'étape 1 de « Créer une fiche », pré-rempli (rayon + sous-thème
      pour un sujet nouveau ; rayon + fiche verrouillée pour une mise à jour). Génère aussi les
      lignes prêtes à coller dans `docs/NOUVEAUTES_A_STATUER.md` (le registre reste à jour sans
      retyper). Vérifié au navigateur avec un faux triage réaliste (3 cas : nouvelle fiche, mise à
      jour, digest seulement) : parsing correct, bouton correct, arrivée sur l'étape 1 avec le bon
      texte pré-rempli, aucune erreur console, clair et sombre.
- [x] Les 5 tâches orphelines de l'audit rejoignent leur sous-menu guidé (`entrerFocusMaBase`,
      `entrerFocusControleSource`, `entrerFocusBalayageManuel`, `entrerFocusProfilDecoupes`,
      `entrerFocusMedecinsDecoupes`, même principe que les ponts existants) : Ma base et Un lien
      source ne répond plus (Comprendre le cadre, groupes « mensuel » et « à la demande »),
      Complément manuel du Balayage (Comprendre le cadre, trimestriel), Profil des découpes et
      Professions de santé (Comprendre les chiffres, annuel). Le Triage du digest, qui n'avait pas
      non plus de carte, rejoint le groupe trimestriel de Comprendre le cadre. Vérifié au
      navigateur : les 3 nouvelles cartes de Comprendre le cadre et les 2 de Comprendre les chiffres
      ouvrent bien le bon écran.
- [x] Bouton « Retour à l'accueil guidé » : libellé mensonger corrigé (il ramène toujours au
      sous-menu, jamais à l'accueil des 3 cartes) -> devient dynamique, « Retour à « Comprendre le
      cadre » » / « ... les chiffres » / « ... Lexique » selon le sous-menu d'origine. Vérifié :
      le libellé change bien selon le module quitté.
- [x] Test de bout en bout, en un seul passage sans interruption, du chemin complet que Denis
      décrit (accueil -> Comprendre le cadre -> Triage -> pont -> collecte -> rédaction Claude ->
      relecture -> les 2 fichiers) : fait le 2026-09-26, zéro erreur console, résultat correct.
- [x] Committé (Bloc 1 + Bloc 2 + finitions), une fois l'autre compte arrêté (2026-09-26).

### Bloc 2 - le tableau de bord par rayon (Comprendre le cadre), fait et vérifié le 2026-09-26

- [x] `vueMenuCadreGuide` remplacé : liste des 17 rayons (`RAYONS`, source unique) en premier,
      chacun avec son statut (nombre de fiches, dernière date de contrôle via `chargerControle()`,
      signal en attente le cas échéant via `fichesEnAttente()` regroupé par rayon) et ses 2 actions
      directes (`entrerFocusCreerFicheRayon(rayon)`, nouveau ; `entrerFocusControleRayon(rayon)`,
      déjà existant). L'ancienne liste globale « En attente de traitement » a disparu : chaque
      signal vit maintenant dans la ligne de SON rayon (une seule source de vérité, pas de
      duplication). Les tâches transversales (hebdo, Balayage, Triage, Complément manuel,
      Associations, À confronter, lien mort) groupées sous la liste, inchangées sinon le
      déplacement.
  - [x] `entrerFocusCreerFicheRayon(rayon)` : ouvre l'étape 1 de « Créer une fiche » avec ce rayon
        déjà choisi, sous-thème vidé (départ propre, pas de reste d'un sujet précédent). Cas
        « Venir de l'étranger » : ouvre par défaut sur « séjour », l'autre option reste choisissable
        dans le menu Sujet (pas de contexte ici pour deviner, contrairement au pont depuis un
        signal).
  - [x] Fonction `entrerFocusControle()` (généraliste, plus utilisée par rien) supprimée : chaque
        rayon appelle directement `entrerFocusControleRayon(rayon)`, code mort retiré au passage.
  - [x] Vérifié au navigateur : liste correcte (17 rayons), boutons corrects par rayon (inspection
        des `onclick`), affichage d'un signal en attente injecté pour un test (« Mobilité »,
        boutons Revérifier/Traiter corrects), badges de l'accueil (compte de tâches) toujours
        justes après le changement, clair et sombre, zéro erreur console.
- [x] **Comprendre les chiffres** et **Lexique** : gardés en menu par tâche (décision actée, pas de
      « rayon » chez eux) - aucun changement nécessaire, déjà conformes depuis le Bloc 1.
- [x] **Raccourci « matériau déjà en main »** (`entrerFocusColleCollecteRayon(rayon)`) : sur chaque
      ligne de rayon, un lien discret sous les 2 boutons saute directement à l'étape 2 (coller la
      collecte), rayon déjà choisi, sans passer par l'étape 1 (copier le prompt) - pour un matériau
      déjà rassemblé ailleurs (import manuel, note prise à la main). Vérifié au navigateur.
- [x] Mode sombre des 2 pastilles Chiffres/Lexique (accueil et sous-menus) : couleurs inline figées
      en clair remplacées par des classes `.pastille.chiffres`/`.pastille.lexique` avec variante
      `body.dark`, mêmes teintes que `.groupe-module` (déjà correctes). Bordures des cartes-module
      Chiffres/Lexique de l'accueil aussi corrigées. Vérifié : couleurs calculées correctes dans les
      deux modes.
- [x] Ancien système de navigation en double retiré : panneaux « Ce mois-ci » / « Ce trimestre »
      (HTML `#carteMois`/`#carteTrim`) supprimés, plus jamais nécessaires depuis le tableau de bord
      par rayon. `lancerControleRayon()`/`ouvrirDigest()` (devenus sans appelant) supprimées ;
      `rendrePanneauMois()`/`rendrePanneauTrim()` gardées (guardées, encore appelées ailleurs pour
      tenir à jour `chargerTrimFaits()`/l'état des rayons, dont dépendent les badges du tableau de
      bord) mais ne rendent plus rien, leur cible n'existant plus. Vérifié : plus aucune trace dans
      l'interface classique, `npm test`\-équivalent (vérif syntaxe JS) et navigateur sans erreur.
- [x] **Trouvé et corrigé le 2026-09-26 (vérification demandée par Denis, "jusqu'à ce que
      l'information finisse sur mon module")** : `modules/comprendre-le-cadre/index.js` ne
      découvre jamais les fiches toute seule - elle lit le tableau « Les N fiches » du `README.md`
      du rayon pour savoir quels fichiers `.md` aller chercher. **Une fiche neuve déposée sans
      cette ligne n'apparaît jamais dans l'application**, même bien placée sur le disque - et
      l'aide-mémoire « Déposer dans le dépôt » ne le mentionnait pas du tout. Corrigé :
      `alerteReadmeAJour()`, à l'étape « Les deux fichiers », affiche désormais automatiquement la
      ligne exacte à ajouter (seulement pour un sujet neuf ; une mise à jour n'en a pas besoin,
      l'id existe déjà). Aide-mémoire mis à jour en conséquence. **Preuve réelle faite** : fiche de
      test déposée + ligne README ajoutée à la main, ouverte dans la vraie application
      (`http://localhost:8123/index.html#comprendre-le-cadre`), visible et lisible dans le rayon
      Mobilité ; tout supprimé ensuite, aucune trace laissée.
- [x] **Signalé par Denis le 2026-09-26** : liens `<a>` en bleu par défaut du navigateur, illisibles
      ("bleu fluo") sur fond sombre - `outils/veille.html` n'avait aucune règle CSS pour les liens.
      Corrigé : règle globale `a { color: var(--accent); }` (+ `a:visited`), déjà définie dans les
      deux modes. Vérifié : couleur calculée correcte en clair et en sombre, à l'écran et par
      inspection.
- [x] **Couverture complète des tâches restantes, testées avec des réponses réalistes (2026-09-26)** :
      Comprendre les chiffres (chiffres clés du trimestre avec la lecture Claude en 2 temps, portrait
      annuel, Union européenne, profil des découpes, professions de santé), Lexique (lecture des 404
      termes du vrai `data/lexique.js`, génération d'entrées candidates - syntaxe JS valide vérifiée -,
      triage des mots), Import manuel (3 destinations), Associations (annuaire), À confronter, Un lien
      source ne répond plus, Complément manuel du Balayage (checklist). **Zéro bug trouvé** sur cette
      passe : tout fonctionne tel que construit précédemment.
- [x] **Bouton d'aide « Comment faire, une fois l'information trouvée ? »** ajouté à l'accueil guidé
      (demande de Denis, entre les 3 cartes module et « Voir tous les outils »), avec une icône,
      qui ouvre directement l'aide-mémoire de dépôt (déjà dépliée) : mène désormais aussi le cas
      Lexique (pas de fichier à déplacer, coller dans `data/lexique.js`) et rappelle en premier la
      seule vérification fiable (ouvrir l'application elle-même et regarder). Repéré et corrigé au
      passage : l'encadré « Dater une adresse » utilisait des variables CSS qui n'existaient pas
      (`--bordure`, `--fond-doux`), illisible en mode sombre - remplacées par les vraies variables du
      thème (`--border-strong`, `--bg-subtle`).

### Bloc 3 - historique et persistance - FAIT le 2026-09-26

- [x] **Trouvé et corrigé le 2026-09-26** (en répondant à la question de Denis « c'est quoi le
      bloc 3 ») : `reponseTriage` (le champ de collage du pont Triage, ajouté au Bloc 1) manquait
      dans `CHAMPS`, la liste des champs sauvegardés par `memoire()`. Une réponse de triage collée
      puis non traitée avant de fermer l'onglet était perdue pour de vrai, contrairement à tous les
      autres champs de collage. Vérifié : survit maintenant à un rechargement complet de la page.
- [x] **Corrigé le 2026-09-26 (demande de Denis : « importe toute la correction nécessaire »)** :
      jusqu'ici, un rechargement restaurait la DONNÉE de chaque digest déjà lu (`_balayage`,
      `_chiffres`, `_lexique`, `_confronter`, `_cycle`, et maintenant `_veilleHebdo`/`_triage`) mais
      jamais son AFFICHAGE - un seul re-clic sur « Lire » suffisait à le faire revenir (rien n'était
      perdu), mais ce clic en plus n'avait pas lieu d'être. `restaurer()` appelle désormais la bonne
      fonction d'affichage pour chacun des 8 cas (`rendreSourcesCollecte`, `construireBalayageMd`,
      `construireChiffresMd`, `construireLexiqueSortie`, `construireConfronterMd`, `rendreCycle`,
      `rendreVeilleHebdoResultat`, `rendreResultatTriage` + `assemblerRegistreTriage`), pas
      seulement les 2 cas signalés au départ. `_veilleHebdo`/`_triage` ajoutés à `memoire()`/
      `restaurer()` (ils n'y étaient pas du tout). Vérifié un par un : les 6 digests testables
      (hebdo, triage, balayage, chiffres, lexique, à confronter) réapparaissent tout seuls après un
      rechargement complet, sans aucun re-clic, zéro erreur console.
- [x] **Historique par rayon fait (2026-09-26)**, demande étendue de Denis (« quels dispositifs sont
      les plus touchés, quelle régularité, quel taux de changement »). Construit honnêtement à
      partir de ce qui existe réellement et est daté : le champ `revisions:` déjà présent dans
      chaque fiche (une ligne par changement retenu au fil des mises à jour passées) - pas de
      nouvelle collecte de données inventée. Deux ajouts :
  - [x] Panneau **« Les dispositifs les plus révisés »** en haut du tableau de bord Comprendre le
        cadre (`rendreRevisionsCadre()`) : les 5 fiches (tous rayons) avec le plus de révisions,
        nombre et dernière révision affichés. Masqué si aucune fiche révisée.
  - [x] Chaque ligne de rayon affiche désormais aussi le nombre de fiches révisées (ex. « 3 fiches
        dont 1 révisée »).
  - **Limite dite clairement dans l'outil** (note affichée au-dessus du panneau) : ce n'est PAS un
    journal de tous les Contrôles passés - `chargerControle()` n'a jamais gardé qu'un seul état par
    rayon (le dernier), jamais un historique. Un vrai « taux de changement dans le temps » précis
    demanderait de construire ce journal, un chantier à part, pas fait ici pour ne pas laisser croire
    à une précision qui n'existe pas.
  - Vérifié au navigateur avec 3 vraies fiches (dont une avec une révision réelle) : panneau et
    compte corrects, masqué correctement sans données, clair et sombre, zéro erreur console.

## Notes de suivi

- 2026-09-26 : audit + test navigateur faits, plan écrit. Bloc 1 entièrement fait et vérifié au
  navigateur (bug étranger, pont Triage -> Créer une fiche, 5 tâches orphelines branchées, libellé
  du bouton Retour corrigé).
- 2026-09-26 (suite) : Denis précise vouloir un parcours par rayon d'abord. Bloc 2 fait et vérifié
  (tableau de bord par rayon pour Comprendre le cadre, Chiffres/Lexique inchangés). Test de bout en
  bout complet, en un seul passage, du trajet que Denis décrit (rayon -> collecte -> Claude ->
  fichiers) : réussi, zéro erreur.
- 2026-09-26 (fin) : les 3 points de finition faits (raccourci matériau déjà en main, mode sombre
  des pastilles, retrait des panneaux dupliqués). Trou du manifeste README.md trouvé, corrigé et
  prouvé en conditions réelles dans l'application. Lien `<a>` illisible en sombre corrigé. L'autre
  compte s'est arrêté (à court de crédit) : Denis confirme qu'il ne faut pas toucher à ce qu'il a
  laissé en cours sur la mise en page PDF. Commit fait, scope limité à `outils/veille.html` et ce
  fichier de suivi uniquement.
