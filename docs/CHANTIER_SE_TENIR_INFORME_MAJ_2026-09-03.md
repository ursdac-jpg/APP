# Se tenir informé - mise à jour du 2026-09-03 (session maquette)

**À intégrer dans `docs/CHANTIER_SE_TENIR_INFORME.md` en section 17.** Rédigé à part parce qu'un autre compte
travaille sur le même dépôt : Denis colle ce bloc dans le chantier quand il veut, après coordination.

Sources de cette session :
- Maquette du parcours : `docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html` (en-tête du fichier : décisions).
- Outil de veille : `outils/veille.html` (trois prompts, « Ma base », contrôle de rayon).
- Page de présentation validée (inchangée) : `docs/MAQUETTE_INTRO_SE_TENIR_INFORME.html`.

Cette session est **plus ambitieuse que le recalibrage §16** (« rester modeste »). Denis l'assume : le garde-fou
est la **V1 réduite** (voir « Mise en oeuvre »), pas le périmètre. Deux points de tension signalés et tranchés :
les chiffres (§16.9 interdit de les figer -> ici rien n'est stocké, tout est live par prompt) ; le nombre de rayons
(§16.2 « une poignée » -> ici 13, parce que c'est un sous-espace où la personne entre en sachant ce qu'elle cherche,
avec un écran d'entrée groupé par familles).

## 17.1 Nom et nature

- Carte d'accueil : **« Se tenir informé »** conservée (déjà confirmée, dépendance Inkéo).
- Sous-carte : **« Actualités » devient « Comprendre le cadre »**. La page de présentation reprend ce nom.
- **Famille 1 (consultation)** : bouton « Revoir la présentation » + note. Aucun encart « Continuer / Recommencer »,
  aucun gel, aucun pulse de reprise. Ce n'est pas un parcours de dépôt.

## 17.2 L'écran d'entrée

1. **Pastille territoire en tête** (contexte, changeable, jamais bloquant, aucune mémoire). Réglé au build sur les
   instances partenaires (87, 24) ; question éphémère « France / région / département » pour les déploiements larges.
2. **Orienteur « Par où commencer ? »** (voir 17.4).
3. **13 rayons de sujet groupés en 4 familles** + **4 outils**.

## 17.3 Les 14 rayons + 5 outils

**Emploi et parcours** : Emploi et contrats · Se former et se reconvertir · L'accompagnement et les structures de
l'insertion · Créer son activité.
**Situations et publics** : Moins de 26 ans · Handicap et emploi · Venir de l'étranger : séjour, travail,
équivalences · Justice : sortie de détention et insertion · Budget, dettes, droits sociaux.
**Lever un frein du quotidien** : Mobilité · Logement · Garde d'enfant · Apprendre le français.
**Faire valoir ses droits** : Questions juridiques.
**Outils** : Ce qui a changé récemment (digest Balayage) · Comprendre les chiffres · Trouver une source officielle ·
Vérifier une information récente · Près de chez moi.

**Rayon « Moins de 26 ans »** (14e, décision 34, 2026-09-04) : Mission Locale et contrat d'engagement jeune,
école de la deuxième chance (E2C), EPIDE, service civique, obligation de formation des 16-18 ans, écoles de
production, prépa apprentissage, accompagnement intensif jeunes ; renvoi vers l'apprentissage (rayon
« Se former »). Case orienteur « J'ai moins de 26 ans ». Son propre prompt de collecte. Cadence de contrôle :
mensuelle (la politique jeunesse bouge). Non-V1, mais câblé partout (maquette + veille.html).

Contenus notables intégrés : intérim d'insertion (ETTI) + agences spécialisées handicap ; POE / AFPR ; OPCO ;
insertion par l'activité économique (AI, EI, ACI, ETTI) ; clause sociale ; cumul emploi + RSA ou chômage ;
reconversion (démission-reconversion après 5 ans d'activité continue, période de reconversion de la loi du
24 octobre 2025, projet de transition) ; coopérative d'activité et d'emploi (CAPE puis CESA ; pour le 24, Coop'Alpha) ;
handicap (RQTH, dossier MDPH, médecine du travail, AGEFIPH, réforme AGEFIPH 2026) ; permis annulé et récupération
de points ; garage solidaire ; ENIC-NARIC ; échange de permis étranger ; OFII ; naturalisation.

## 17.4 L'orienteur « Par où commencer ? »

En tête de l'accueil, pas un rayon. Deux temps :
- **Temps 1, sans assistant, instantané** : cases à cocher en langage simple (« je n'ai pas de moyen de transport »,
  « j'ai des dettes », « je viens d'un autre pays »...). L'application affiche les rayons correspondants.
  Déterministe (code, pas de prompt), aucune donnée.
- **Temps 2, facultatif** : la personne décrit sa situation avec ses mots. Avertissement confidentialité avant le champ.
  Le texte de recherche demande à l'assistant **uniquement la liste des sujets touchés**, pas un avis. La sortie
  s'affiche comme « les sujets que votre message semble concerner, à vous de voir », en liens vers les rayons,
  avec « ce n'est pas un avis sur votre situation ». Rien n'est enregistré. Jamais un « rapport » ni un diagnostic
  (Constitution, 1er principe). Évite le doublon avec le Bilan / Découverte (§11).

## 17.5 Le gabarit d'une fiche

Bloc « Ce que cette fiche explique » (fond gris, la synthèse + « Rédigé et vérifié en [mois année] ») ·
bloc « Pour connaître la situation actuelle » (cadre accent, liens vivants) · **dépliant « Lire le texte
d'origine »** (le matériau brut du prompt 1, `<id>.collecte.md`, avec « ce n'est pas une source en direct » et la
liste des sites d'où il vient) · encadré « Ce qui peut changer souvent » · **bandeau ambre « À revérifier »**
automatique dès que `verifie_le` dépasse six mois · **bandeau bleu « Mise à jour en [mois] »** quand `revisions:`
a une entrée · bouton « Garder comme Repère » · renvois de vocabulaire vers le Lexique. La fiche méthode a le même
gabarit sans le bloc « source vivante ».

## 17.6 Comprendre les chiffres

Le point fort du module (§12). **Aucun chiffre n'est stocké** : à chaque visite, il est rapporté par l'assistant
depuis la source officielle, affiché **en gras avec source + date**. La courbe est dessinée côté navigateur à partir
des chiffres de cette réponse (éphémère). Graphiques : valeur écrite au-dessus de chaque barre (lisible sans survol),
infobulle au survol, barres empilées et multicolores quand il y a plusieurs mesures, **légende obligatoire** dès plus
d'une couleur, jamais un taux (%) et un nombre de personnes sur le même graphique. Bloc « Zone d'emploi ou bassin
d'emploi ? » (la zone d'emploi est un découpage statistique INSEE, ~300 en France ; le bassin local n'a pas les
mêmes limites ; chaque graphique dit lequel il utilise et combien de communes). Garde-fou §12 : « d'après [source],
en [date] », jamais une vérité ; fiche « comment lire ça » toujours attachée.

Chiffres les plus utiles en insertion : taux de chômage localisé (INSEE) ; inscrits France Travail catégorie A/B/C ;
moins de 25 ans ; 50 ans et plus ; ancienneté d'inscription ; part des allocataires du RSA ; métiers en tension ;
salaires par secteur.

## 17.7 Associations et bloc « À confronter »

- **Associations du territoire** : les textes de recherche demandent à l'assistant de repérer les associations
  reconnues (nom, site, contact) et de les ranger **à part** (« associations à contacter »), jamais confondues avec
  un service public. Les associations affichées à la personne sont vérifiées au build (9.16) et étiquetées « association ».
- **Bloc « À confronter »** (accueil) : informations non officielles (lettres d'information, réseau, terrain).
  Jamais dans les fiches ni le tableau des sources, sans lien direct. Formulation non fataliste, deux publics :
  « à recouper vous-même, et à en parler avec la personne qui vous accompagne si vous en avez une ». (§11, « intelligence soft ».)

## 17.8 Les deux niveaux de granularité

- **Navigation** : 13 rayons + 4 outils. C'est la façon dont la personne circule ; l'écran d'entrée les groupe par
  familles pour rester lisible.
- **Textes de recherche** : découpés plus fin, au moins par rayon, souvent par thème d'un rayon (mobilité = permis /
  véhicule / transports). Côté personne (bouton « Poser une question récente » par thème, sujet pré-réglé) comme côté
  maintenance. Un texte étroit donne de meilleures sources (LECONS 1bis). Règle : jamais plus de 2 prompts par rayon.

## 17.9 Module portable

Dossier autonome `modules/comprendre-le-cadre/`. Le module ne parle jamais directement au code de l'app : il passe
par une **couche d'adaptation hôte** (4-5 fonctions : `ouvrirFenetre`, `collerReponse`, `garderRepere`,
`brancherRecherche`). Dans APP elles renvoient vers `ouvrirFenetreERIP`, `htmlCollageInstantane`, `reperesBoutonAncre`,
`rechercherBaseConnaissances`. Sur un autre site, quelqu'un fournit ses propres fonctions ; si l'hôte n'a pas
« Garder comme Repère », le module cache ce bouton. Contenu en données, CSS préfixée avec repli. À cadrer et à
coordonner avec l'autre compte (ça touche la structure de `modules/`).

## 17.10 Le format du contenu (l'objet documentaire unique de §16.7)

**DEUX fichiers par sujet (décision Denis 2026-09-03)** :
- `<id>.md` : la fiche (en-tête + la synthèse du prompt 2). Petit, stable, affiché en permanence.
- `<id>.collecte.md` : le matériau brut du prompt 1. Volumineux, lu seulement quand la personne clique
  « Lire le texte d'origine ». En-tête minimal (id, fiche, collecte_le, sources).

Séparer garde le fichier de la fiche léger et ses diffs git nets, même quand la collecte fait plusieurs milliers
de mots. Les deux voyagent ensemble (même dossier, même identifiant).

En-tête de `<id>.md` : id, rayon, titre, pour_qui, tags, territoire, **statut** (`actif` | `retire`), verifie_le,
frein, lexique, sources, ce_qui_change_souvent, **revisions** (liste de « AAAA-MM : ce qui a changé »),
collecte (nom du fichier de collecte). Puis le texte. Le `.md` est la **seule vérité** ; le reste est une vue
générée au build : la fiche du module, l'entrée Lexique (`lexique:` seulement), l'entrée `data/freins.js`
(`frein: true`), l'index de recherche, `corpus.json`. Personne ne recopie rien (Règle 13).

Arborescence : `contenu/<rayon>/<id>.md` + `contenu/<rayon>/<id>.collecte.md` · `sources.txt` · `liens-verifies.txt`
(nom-du-lien | adresse | date) · `config.js` (territoire). **Les adresses ne sont jamais dans le `.md` de la
fiche** : la fiche cite une source par son nom, l'adresse vit dans `liens-verifies.txt`. Si l'adresse n'y est pas,
le bouton s'affiche désactivé.

**Retrait** : `statut: retire` + `retire_le` + `retire_raison` (+ `remplace_par` facultatif). La fiche devient une
pierre tombale (« Cette information a été retirée en [mois] : [raison] »), jamais supprimée, git garde l'historique.
**Mise à jour** : `revisions:` gagne une ligne datée, `verifie_le` est remis au mois courant. Dans la fiche, un
bandeau **bleu** (accent du module, pas l'ambre) « Mise à jour en [mois] : [dernier changement] », dépliable sur la
liste. C'est distinct du bandeau ambre « à revérifier » (personne n'a regardé depuis 6 mois).

Le schéma complet et une fiche exemple : écran « Annexe technique » de la maquette.

Câbler Lexique / `data/freins.js` sur ce format reste un **chantier séparé** (maquette + plan), jamais à chaud.

## 17.11 Les prompts

Deux blocs communs à tous : **le ton** (« écris pour une personne réelle qui va te lire, pas pour un système... ni
administratif, ni familier... ne conclus jamais à la place de la personne ») et **le format de sortie**.

**Architecture à TROIS prompts (décision Denis 2026-09-03, révisée le même jour)** :
- **Prompt 1, COLLECTE** (un par RAYON, cherche large ; ou ciblé sur une fiche précise en mise à jour) : ramène le
  MAXIMUM d'information officielle, sans rédiger. Aucune limite de longueur. Sort un bloc `[COLLECTE]` (sources en
  4 colonnes `nom-court | titre | adresse | date` + texte_brut). Objectif : ne rien perdre.
- **Prompt 2, RÉDACTION** (commun à tous les rayons) : reçoit le texte_brut **et la liste des fiches déjà existantes
  du rayon** (`id | titre | tags`), applique les règles de ton communes, et **découpe le matériau en PLUSIEURS fiches
  (3 à 8), une par sujet distinct** (champ `texte` de chaque bloc `[FICHE n]`, 10 à 20 lignes, prête à publier).
  Consigne : si une fiche produite recouvre un sujet déjà listé, recopier son `id` exact (mise à jour, pas doublon).
  Denis le lance sur son compte personnel (pas de limite de caractères).
- **Prompt 3, CONTRÔLE** (un par RAYON, une fois par mois) : reçoit toutes les fiches du rayon (id, titre,
  `verifie_le`, `ce_qui_change_souvent`, texte), va sur le web, **ne réécrit rien**, rend un bloc `[CONTROLE]` :
  pour chaque fiche `etat: A JOUR | CHANGEMENT | INCERTAIN` + `depuis` + `resume` (2-3 lignes) + `sources`. C'est le
  repérage qui évite de relancer une collecte complète sur 200 fiches : seules les fiches en `CHANGEMENT` déclenchent
  un prompt 1 ciblé.
- Le **fichier de collecte est au niveau du rayon** (`mobilite.collecte.md`), partagé par toutes ses fiches ;
  chaque fiche a `collecte: mobilite.collecte.md`.
- L'outil parse tous les blocs `[FICHE n]`, les étiquette *met à jour / ressemble à / nouvelle*, Denis les traite
  une par une (relire, télécharger), puis la collecte du rayon une fois.

Denis **relit** chaque fiche, ne réécrit pas, ne fait aucune synthèse (impossible sur 13 rayons). Le prompt 2 est
**vérifiable contre la collecte** (les deux sont dans l'outil, côte à côte). Conséquence assumée : le texte publié
est écrit par l'assistant puis validé par Denis. Garde-fous : relecture obligatoire ; ton et interdits dans le
prompt ; tampon « vérifié en [mois] » + « la source fait foi » + « comment lire ça » + le matériau brut consultable.
La distinction §16.3 « rédigé à la main » vaut désormais pour « curé et validé par Denis à une date ».

**5 prompts de maintenance pour la V1** : Étranger séjour et travail · Étranger démarches et équivalences · Mobilité
(paramétré par sous-thème) · Comprendre les chiffres (paramétré par indicateur) · Balayage trimestriel.
Plus **1 prompt public** (« Poser une question récente »), même base allégée.
Pour les 13 rayons à terme : 12 à 16 prompts + 1 balayage. Les prompts de maintenance vivent dans un document privé
(`docs/VEILLE_PROMPTS.md`), jamais publiés. Prompts complets : écran « Annexe technique » de la maquette.

## 17.12 L'outil de veille : `outils/veille.html`

Fichier local, à ouvrir dans le navigateur. **Ne contacte aucun assistant** : le copier / coller reste manuel.
Flux création : (1) choisir le sujet, copier le prompt de collecte ; (2) « Coller ici et lire » la réponse 1,
l'outil lit le `[COLLECTE]` et **assemble le prompt de rédaction avec le matériau et la liste des fiches existantes
dedans** ; (3) copier ce prompt 2, le lancer sur le compte perso ; (4) « Coller ici et lire » la réponse 2, l'outil
lit les `[FICHE n]`, les **étiquette** *met à jour / ressemble à / nouvelle*, remplit tout, texte compris ; (5)
relire (bouton « Cette fiche est toujours bonne » pour redater sans révision) ; (6) télécharger les **deux** fichiers
(`<id>.md` et `<rayon>.collecte.md`). En plus (décisions Denis 2026-09-03) :
- **Boutons « Coller ici et lire »** (presse-papier -> champ -> lecture en un clic) sur les trois zones de collage.
- **« Ma base »** : Denis charge ses `.md` de fiches ; index + recherche par mot + **filtres** (jamais mise à jour /
  déjà mise à jour / à revérifier > 6 mois / fraîche / retirée) + **tri** (vérif. la plus ancienne / récente,
  dernière révision, rayon, titre) + colonne **Âge** (« il y a N mois », ambre à 6 mois) + **tableau de bord par
  rayon** (fiches, vérif. la plus ancienne, à revérifier, dernier contrôle) + **bandeau rappel** des rayons en retard.
- **« Contrôle mensuel d'un rayon »** : génère le prompt 3 à partir des fiches de « Ma base », lit le rapport
  `[CONTROLE]`, pose une **pastille** par fiche dans « Ma base » (à jour / changement + bouton **« Traiter »** /
  incertain). « Traiter » pré-remplit le prompt 1 ciblé (sujet + résumé du contrôle + `id` figé).
- **Sources de la collecte** : l'outil liste les sources du prompt 1 avec adresse + lien « ouvrir » ; un bouton
  ajoute les sources cochées au registre d'un coup.
- « Mettre à jour une fiche existante » (recharge un `.md`, ajoute une révision datée), « Retirer une fiche »
  (pierre tombale), registre des adresses. Bouton « Committer sur GitHub » désactivé, prévu pour plus tard.
- Brouillon, registre et résultats de contrôle en `localStorage`, repli mémoire si le navigateur le bloque.

**Recherche côté public** : le module a sa propre barre de recherche (fiches par titre et mots-clés) ET est
branché sur la barre de recherche de l'accueil (au build, chaque fiche est indexée dans `rechercherBaseConnaissances`).
Taper « permis » sur l'accueil fait remonter la fiche directement.

Denis a écarté l'option A pure (tout éditer à la main) faute de temps (certification, dossiers, recherche d'emploi).
Cet outil est le « B allégé » ; il évoluera vers le « B avec commit » puis, si le module est prouvé, éventuellement
un « C » hébergé.

## 17.13 Mise en oeuvre : option A + socle

- **V1 = le socle qui ne vieillit pas** (tableau des sources + orienteur + « Vérifier une information récente » +
  « Comprendre les chiffres » live) **+ 2 rayons rédigés à fond : Venir de l'étranger, Mobilité.**
- **Handicap et emploi** en 3e, un mois après.
- Les autres rayons : visibles dans l'orienteur et l'accueil, marqués honnêtement « en préparation », **jamais un
  cul-de-sac** (tableau des sources + un texte de recherche pour ce sujet).
- Puis un rayon de plus par mois ou deux, au rythme du rituel.

**L'ordre de production a été revu le 2026-09-03 (soir) : voir la section 17.19, qui recentre la V1 sur le
public CIP et remonte le Balayage trimestriel avant le 3e rayon.**

## 17.14 Ce qui reste à faire avant le code

1. Écrire les vraies fiches `.md` des 2 rayons V1 (via l'outil).
2. ~~Rédiger `docs/VEILLE_PROMPTS.md` à partir de l'annexe.~~ **Fait le 2026-09-03** (commit 7c22913).
3. Cadrer le dossier module portable et la couche d'adaptation hôte.
4. Coordonner avec l'autre compte (structure de `modules/`, format du contenu, câblage Lexique / freins).
5. Rituel mensuel écrit : contrôle de rayon (prompt 3), fiches en `CHANGEMENT` traitées, liens morts, date de vérification.

## 17.15 Le schéma d'ensemble

**Identité :** chaque fiche est un fichier dont le nom `<rayon>-<slug-du-titre>` est fixé une fois et ne change
jamais. C'est lui qui dit « c'est la même fiche », même si le titre ou le texte évoluent.

```
BOUCLE 1 - CRÉER UNE FICHE (sujet nouveau)

  Denis : quel sujet ?
    -> PROMPT 1 COLLECTE (web, ramène tout, ne résume pas)
    -> veille.html assemble le prompt 2 (matériau + fiches existantes du rayon dedans)
    -> PROMPT 2 RÉDACTION (compte perso) : 1 à 8 fiches courtes, au bon ton
    -> veille.html produit :  <id>.md  (la fiche)  +  <rayon>.collecte.md  (le matériau brut)
    -> Denis commit sur GitHub  ->  le module public affiche la fiche


BOUCLE 2 - ENTRETENIR (une fois par mois, par rayon)

  PROMPT 3 CONTRÔLE (web) : reçoit toutes les fiches du rayon, ne réécrit rien,
    rend un rapport « fiche X : à jour / changement / incertain »
    -> veille.html relie chaque ligne à sa fiche PAR l'id, pose une pastille dans « Ma base » :
         * à jour     -> rien à faire (redater si vraiment revérifié)
         * changement -> bouton « Traiter » -> repart en BOUCLE 1, prompt 1 pré-rempli (sujet + id)
                         -> la nouvelle version retombe sur la MÊME fiche -> ligne « Mis à jour en... »
         * incertain  -> Denis va voir lui-même
```

13 contrôles par mois, pas 200. Collecte + rédaction complètes seulement sur les fiches signalées.

## 17.16 L'identité d'une fiche et l'anti-doublon (doctrine, décision Denis 2026-09-03)

- **Ce qui identifie une fiche = l'`id`** (le slug), pas le titre (l'assistant le reformule), pas le contenu (il
  change à chaque mise à jour), pas « le sens » (trop flou). L'`id` est décidé par Denis, une fois. C'est sa
  nomenclature hiérarchique en clair (`mobilite-permis`, `mobilite-voiture-en-panne`).
- **Pas de codes émis par l'assistant** : il n'a pas de mémoire d'une session à l'autre, il en réinventerait à
  chaque passage. Le projet ChatGPT payant peut servir de filet (mémoire de consignes de rédaction), jamais de clé.
- **Anti-doublon** : les prompts 2 et 3 reçoivent la liste `id | titre | tags` des fiches existantes du rayon et
  doivent reprendre l'`id` exact quand ils retombent sur un sujet connu. À l'import, l'outil étiquette chaque fiche :
  *met à jour* (id repris), *ressemble à* (recouvrement de mots-clés du titre + tags >= 0,5 ; Denis tranche avec
  « Oui, mise à jour » / « Non, fiche distincte »), *nouvelle*. Le rapprochement **signale**, il ne décide pas.
- **Trois issues par fiche au contrôle** : *redater* (sources revues, rien de matériel changé -> `verifie_le` au
  mois courant, pas de révision), *réviser* (un détail a bougé -> corriger + ligne `revisions:` datée), *retirer*
  (dispositif fermé ou info trompeuse -> `statut: retire`).
- **On ne garde jamais une info fausse « pour l'historique ».** Ce qu'on garde, c'est la trace (`revisions:` dit
  « en mars, tel point a changé » sans réafficher l'ancienne valeur) et le matériau brut d'origine (`.collecte.md`,
  marqué « état à la date de collecte, pas une source vivante »).
- **Critère 30 secondes** : le dispositif existe-t-il encore ? (non -> retirer) ; un chiffre / une liste / un délai
  a-t-il changé ? (oui -> réviser) ; sinon, sources revérifiées -> redater.
- **Règle dure** : on ne renomme jamais un fichier de fiche. Titre devenu faux -> on change `titre:` dans l'en-tête,
  pas le nom du fichier.

## 17.17 Le contrat de fichiers entre « Se tenir informé » et l'outil de veille

Les deux ne communiquent **que par des fichiers**, jamais par du code. Il n'y a pas d'appel direct de l'un à l'autre.

- **`veille.html` écrit** : `<id>.md` (la fiche), `<rayon>.collecte.md` (le matériau), et met à jour
  `liens-verifies.txt` (nom-court | adresse | date). Aujourd'hui Denis télécharge puis dépose ; plus tard le bouton
  « Committer » le fera.
- **« Comprendre le cadre » lit** ces mêmes fichiers, au build, pour générer ses vues (fiche affichée, entrée
  Lexique, entrée `data/freins.js`, index de recherche, `corpus.json`).
- **Emplacement unique** : `modules/comprendre-le-cadre/contenu/<rayon>/`. C'est là que veille dépose, c'est là que
  le module lit. Le module vit **dans** « Se tenir informé » (sous-carte). L'outil de veille vit à part
  (`outils/veille.html`, jamais publié) mais écrit dans le dossier du module.

```
modules/comprendre-le-cadre/
  contenu/
    mobilite/
      mobilite-financer-le-permis.md          <- veille écrit, module lit
      mobilite-financer-le-permis... (rien : pas de collecte par fiche)
      mobilite.collecte.md                     <- veille écrit, module lit (dépliant « texte d'origine »)
    etranger/
      etranger-titre-de-sejour-et-travail.md
      etranger.collecte.md
  sources.txt                                  <- liste des sources de référence du module
  liens-verifies.txt                           <- veille met à jour ; adresses vérifiées à la main
  config.js                                    <- territoire de l'instance
```

- **Denis ne peut pas utiliser les deux dissociés** : veille sans le module ne sert à rien, le module sans veille
  vieillit. Ils ont deux fonctions distinctes, ils sont autonomes en code, mais couplés par ce dossier.
- Reste à cadrer avec l'autre compte : le chemin exact sous `modules/`, et si `contenu/` est commité tel quel ou
  passé par un script de build. Point 4 de « ce qui reste à faire ».

## 17.18 Ergonomie de veille.html : 6 réductions de charge (décision Denis 2026-09-03)

Objectif tenu explicitement : que le rituel mensuel reste soutenable **en parallèle d'un emploi**, sinon Denis
décroche et le module vieillit. Le vrai garde-fou anti-épuisement est déjà dans le produit : chaque fiche porte
« vérifié en [mois] » + « la source fait foi », donc une fiche en léger retard n'est pas une faute, elle est
datée et renvoie au lien vivant. Le rituel est un « au mieux », pas un « sinon c'est cassé ».

1. **« Ma base » persistée** (`localStorage`) : Denis ne recharge ses `.md` du disque que quand il en a ajouté.
2. **Deux modes en tête** : « Entretenir la base » (par défaut, le travail de toujours) / « Créer une fiche »
   (replie les cartes 1 à 6). « Traiter » et « Ce mois-ci » basculent le bon mode automatiquement.
3. **Panneau « Ce mois-ci »** en haut du mode Entretenir : « À contrôler (N) : [rayons cliquables] » +
   « Contrôlés ce mois-ci : ... ». Un clic sur un rayon prépare le prompt 3.
4. **Cadence de contrôle par rayon** (mensuel / trimestriel / semestriel), réglable et gardée. Défauts :
   mensuel = étranger, budget, emploi, juridique ; trimestriel = former, créer, accompagnement, handicap,
   mobilité, logement, justice ; semestriel = garde d'enfant, apprendre le français. « Ce mois-ci » ne réclame
   un rayon que quand SA cadence est due : sur 13 rayons, environ 5 ou 6 par mois, pas 13.
5. **Suivi des téléchargements** : chaque fiche d'un lot est marquée « lue » puis « téléchargée » ;
   « Télécharger les deux fichiers » et « Télécharger toutes les fiches lues » (dépôt en série + la collecte une fois).
6. **Relecture assistée** : dépliant « Relire en surbrillance » qui surligne nombres, montants, pourcentages et
   dates (ce qui vieillit le plus vite) et affiche le matériau brut juste à côté.

Estimation : un mois où 5 fiches ont bougé sur 13 rayons passe d'environ 1 h 30 - 2 h à nettement moins,
surtout grâce à la cadence (point 4) qui supprime les contrôles inutiles.

7. **Cycle de contrôle** (Denis 2026-09-03) : dans le bloc « Contrôle mensuel des rayons », une checklist
   par rayon (⬜ à faire · 🔄 en cours · ✅ contrôlé ce mois-ci, persistée). On coche les rayons du jour,
   « Démarrer » : l'outil prépare le prompt 3 du 1er rayon et, dès qu'on colle son `[CONTROLE]`, enchaîne
   automatiquement sur le suivant jusqu'au bout. Le choix reste possible : un rayon isolé ou un cycle de N.
   Le cycle n'automatise pas les allers-retours avec l'assistant (pas d'API) ; il supprime la navigation,
   le suivi, et le risque de refaire un rayon déjà fait. Le Balayage reste **séparé** du cycle (cadence et
   nature différentes ; un lancement par trimestre, pas une corvée).

## 17.19 V1 recentrée sur le public CIP (Denis 2026-09-03, soir)

### Le cadrage

Denis assume le module comme un **outil d'utilité professionnelle**, pas seulement une aide aux personnes
en recherche d'emploi. Constat de terrain (Denis est CIP en exercice) : **la veille informationnelle
représente environ la moitié du temps de travail d'un CIP**, et la plupart n'arrivent pas à la tenir. Ils la
font sur leur temps de pause, le soir, le week-end, ou attendent le digest d'un responsable qui, lui, a des
heures dédiées. Le module peut prendre en charge une part de ce travail : trié, daté, sourcé, en langage
clair, au même endroit.

**Le créneau n'est PAS l'exhaustivité.** Un CIP a déjà Centre Inffo, le CARIF-OREF, les newsletters
ministère, i-Milo actus, son réseau. Denis est seul : sur la complétude, il perd. L'avantage tient à
**« trié + daté + en clair + la version simple à montrer au bénéficiaire dans la même fiche »**. Viser là,
pas ailleurs.

### Ce que ça change dans l'ordre de production V1

| Priorité | Élément | Pourquoi ce rang |
|---|---|---|
| 1 | **Balayage trimestriel** (le digest « ce qui a changé ce trimestre ») | C'est LA chose qu'un CIP veut. Peu coûteux : une liste datée et sourcée, pas de fiches `.md` à maintenir. Peut être la première chose livrée. |
| 2 | **Le socle qui ne vieillit pas** : tableau des sources (~13 sources officielles + le CARIF-OREF, Centre Inffo), fiche méthode « comment lire un taux », orienteur | Un CIP qui découvre « on m'explique à quoi sert le CARIF-OREF et où cliquer » y gagne beaucoup. Passe avant un 3e rayon. |
| 3 | **« Comprendre les chiffres » live** | Les CIP ont besoin des chiffres locaux du marché du travail et ne savent pas toujours lire l'INSEE. |
| 4 | **Rayon « Venir de l'étranger »** rédigé à fond | Le rayon le plus dense et administratif : s'il passe bien dans l'outil, les autres passeront. Sert de mesure du temps réel. |
| 5 | **Rayon « Mobilité »**, puis Handicap en 3e rayon | Au rythme décidé après avoir mesuré le rayon 4. |

Les autres rayons restent visibles, marqués « en préparation », jamais un cul-de-sac (tableau des sources +
un texte de recherche).

### Un point de conception ajouté à la construction (phase 3)

**Une vue « version technique » sur les fiches** pour le lecteur CIP : l'article de loi, la date d'entrée en
vigueur, le matériau brut. Le bénéficiaire lit la version simple ; le CIP déplie la version de référence. Le
dépliant « Lire le texte d'origine » existe déjà (17.5) : le rendre plus visible côté professionnel, ou
ajouter un mode d'affichage. À trancher au moment du code.

### Les phases du plan (rappel, ordre logique)

Contenu -> cadrage -> code -> automatisation du commit -> rituel.

| Phase | Quoi | Qui | Dépend de |
|---|---|---|---|
| 0. Rodage | Un cycle complet de `veille.html` sur un sujet jetable, pour confirmer que l'outil tient | Denis, ~20 min | rien |
| 1. Contenu V1 | Dans l'ordre 17.19 ci-dessus. Rangé en local dans `modules/comprendre-le-cadre/contenu/` | Denis seul | phase 0 |
| 2. Cadrage technique | Emplacement de `modules/comprendre-le-cadre/`, génération des vues au build (`.md` -> fiche + Lexique + `data/freins.js` + index recherche + `corpus.json`), `contenu/` commité tel quel ou via script | Denis **+ l'autre compte** | touche `modules/` et la Règle 13 |
| 3. Construire le module | Lecteur de fiches (2 bandeaux, dépliant, vue technique CIP), accueil, générateur de vues, couche d'adaptation hôte, activer le bouton d'entrée, brancher la recherche, `npm test` + test navigateur | chantier code | phases 1 et 2 |
| 4. `veille.html` « commit et pousse » | Le bouton aujourd'hui désactivé : dépôt direct des `.md` + `git add` + commit + push | plus tard | phase 3 |
| 5. Le rituel tourne | Prompt 3 par rayon au rythme des cadences, traiter les « changement », commit. Puis un rayon de plus par mois. | Denis, ~1 h/mois | phase 3 |

### Zones d'ombre à surveiller

1. **Formulation et responsabilité.** Si un CIP agit sur une fiche fausse et qu'un bénéficiaire y perd un
   droit : le bouclier est « la source officielle fait foi » + la date + « à confronter », visibles et
   systématiques. Une fiche ne dit **jamais** « faites ceci » : elle explique, le CIP décide. Tient même
   quand une fiche paraît simple.
2. **Charge de maintenance à l'échelle.** Si les retours CIP affluent, appliquer la méthode d'analyse des
   retours terrain (6 catégories, jamais modifier sur un seul retour sauf erreur avérée), sinon réécriture
   permanente.
3. **Ne pas survendre.** « Je fais votre veille » est une promesse tenue seul, tous les mois, en plus d'un
   emploi. Posture juste : « un point de départ daté et un deuxième regard », pas « le digest officiel ».
   Les garde-fous de la maquette (bandeau d'âge, « à confronter ») restent.
4. **Ça reste APP.** Pas de renommage, pas de module à part. Même carte « Se tenir informé » ; les CIP sont
   un second public reconnu.

### Recommandation

Définir explicitement le **« MVP qui prouve la valeur pro »** et faire que la première chose livrée soit le
**Balayage trimestriel + le socle**, pas un rayon complet. Un CIP l'essaie une fois, voit un digest de
trimestre daté et sourcé avec les liens officiels : c'est ça qui peut donner un premier retour de CIP à
citer, et c'est bien plus rapide à produire que deux rayons de fiches.

## 17.20 Le Balayage trimestriel : artefact, outil, écran (Denis 2026-09-03, décisions validées)

Le Balayage ne produit **pas de fiches**. Il produit un **digest trimestriel**, sa propre chose.
Décisions validées par Denis le 2026-09-03 (les deux premières revues le même jour après le 1er test réel) :

1. **Période** : le **dernier trimestre civil complet** (janvier-mars / avril-juin / juillet-septembre /
   octobre-décembre), pas une fenêtre glissante de 3 mois. Un digest fait en septembre couvre avril-juin.
   `periode: "avril à juin 2026"`. L'outil calcule le trimestre par défaut ; pour un autre, on choisit un
   mois qui en fait partie.
2. **Nommage** : nommé par le **dernier mois du trimestre couvert** : `contenu/balayage/2026-06.md` pour
   avril-juin, `2026-09.md` pour juillet-septembre. Le nom dit ce que le digest couvre ; `publie_le` dans
   l'en-tête dit quand Denis l'a fait.
3. **Placement** : un **5e outil sur l'accueil**, « Ce qui a changé récemment » (icône 🗞️, maquette écran
   `recemment`). Pas un bandeau en tête (trop d'urgence visuelle pour un public en fragilité). Pas un rayon.
4. **Archive** : tous les digests passés restent consultables ; le dernier est mis en avant, les
   précédents listés en dessous (« Les trimestres précédents »).
5. **Règle éditoriale** (1er test) : une mesure publiée au trimestre mais qui n'entre en vigueur qu'après
   la fin du trimestre va **uniquement** dans « Annoncé, pas encore en vigueur », jamais aussi dans son
   domaine habituel. Chaque changement dans un seul domaine. Instruction ajoutée au prompt.

### Le format du digest

En-tête : `type: balayage`, `periode`, `publie_le`, `territoire: national`, `sources` (les noms-courts
avec adresse et date). Corps groupé par **domaine** ; chaque changement = intitulé + type + date de
publication + date d'entrée en vigueur (ou « à venir ») + qui est concerné + ce qui change (1 à 3 phrases)
+ source. Un domaine séparé « Annoncé, pas encore en vigueur » pour les projets de loi et concertations.

Domaines couverts : emploi et contrats ; assurance chômage et règles France Travail ; formation, CPF,
apprentissage, VAE, France compétences ; insertion par l'activité économique et contrats aidés ; handicap
et emploi ; RSA, prime d'activité, AAH et cumuls ; séjour et droit au travail des étrangers ; mobilité ;
accompagnement des jeunes.

### Le prompt et l'outil

Le prompt complet : `docs/VEILLE_PROMPTS.md` section 5bis. L'assistant rend un bloc `[BALAYAGE periode: ...]`
organisé par `domaine:` puis des lignes `champ: valeur`. Le parseur de l'outil est **tolérant** (1er test
réel 2026-09-03) : `intitule:` avec ou sans tiret, lignes vides entre les champs acceptées.

Dans `outils/veille.html`, mode « Entretenir » : bloc **« Balayage trimestriel »** (à côté de « Contrôle
mensuel d'un rayon »). Le prompt est déjà généré à l'ouverture, pour le dernier trimestre complet ->
coller la réponse -> l'outil lit le `[BALAYAGE]`, montre un aperçu groupé par domaine, produit le `.md`
nommé par le dernier mois du trimestre. Fonctions : `assemblerBalayage`, `lireBalayage`,
`construireBalayageMd`, `trimestreDefaut`. L'option « balayage » a été retirée du menu du prompt 1.

### L'écran du module (maquette `recemment`)

h1 « Ce qui a changé récemment » + une ligne « Digest de [mois], couvre [période], surtout pour les
professionnels » + les changements groupés par domaine (intitulé, méta datée, « concerne », « ce qui
change », bouton « ouvrir le texte officiel ») + « Les trimestres précédents » + un encart de prudence
(« ce n'est pas une source de droit ; à recouper ; ce qui est annoncé ne s'applique pas encore »).

### Ce qui reste

Rien à concevoir : Denis lance le prompt pour avril-juin 2026 -> premier digest -> il devient le contenu de
l'écran (aujourd'hui rempli d'un exemple). Le générateur de vues (phase 3) devra lire `balayage/*.md` en
plus de `contenu/<rayon>/`.

## 17.21 Digest « chiffres clés » (Denis 2026-09-04, CONSTRUIT)

Révision de la décision 21 (« on stocke la lecture datée, pas les chiffres »). Denis : **les chiffres
impératifs** (chômage localisé, structure des inscrits, métiers en tension) sont assez importants pour
être **conservés et rafraîchis chaque trimestre** ; les chiffres pointus restent live (la personne va
chercher). Ce n'est pas un tableau de bord live : c'est une **photo trimestrielle**, datée, sourcée, avec
« la source fait foi » et le lien vers la version courante. Même discipline qu'une fiche, §16.9 respecté.

**Prompt SÉPARÉ du Balayage** (Denis a insisté) : un prompt étroit va chercher profond, un prompt qui
cumulerait « changements + chiffres + séries » ramènerait du survol (LECONS 1bis). Deux blocs, deux
fichiers, deux moments ; le seul point commun est le champ « trimestre ».

**Le modèle : un 2e digest trimestriel, même machinerie que le Balayage.**
- `contenu/chiffres/<dernier-mois-du-trimestre>.md` : ~8 indicateurs, chacun avec valeur + date de la
  donnée + territoire + source + valeur du trimestre précédent + une `serie` (6-8 trimestres) pour le
  chômage et les inscrits, qui trace la courbe.
- Bloc « Chiffres clés du trimestre » dans `veille.html` : `assemblerChiffres` / `lireChiffres`
  (parseur tolérant ligne à ligne) / `construireChiffresMd` / `apercuChiffres` (avec une petite courbe
  SVG à partir de la `serie`). Prompt complet : `docs/VEILLE_PROMPTS.md` section 5ter.
- L'écran « Comprendre les chiffres » (maquette) est réorganisé en deux parties : **« Les chiffres clés
  du trimestre »** (le digest stocké : courbe du chômage, barres empilées A/B/C, métiers en tension
  classés, « Les trimestres précédents » en archive) et **« Une autre question sur les chiffres »**
  (live, rien stocké, décision 21 inchangée). Encart de prudence adapté.
- Générateur de vues (phase 3) : lit `chiffres/*.md` en plus de `balayage/*.md` et `contenu/<rayon>/`.

**Indicateurs** (V1, ajustables, c'est une ligne de texte dans le prompt) : taux de chômage localisé
(national / Nouvelle-Aquitaine / Dordogne, INSEE) ; demandeurs d'emploi France Travail cat. A et A+B+C,
Dordogne (DARES) ; part des moins de 25 ans / des 50 ans et plus ; part des inscrits depuis plus d'un an ;
nombre / part d'allocataires du RSA (CAF / Département) ; métiers en tension et projets de recrutement en
Dordogne (enquête BMO France Travail) ; salaire net médian par grand secteur (INSEE). Chaque chiffre garde
sa fréquence propre (certains trimestriels, d'autres annuels).

**Sources du digest chiffres** : INSEE, DARES, France Travail (BMO, statistiques du marché du travail),
et **le CARIF-OREF de la région**, soit pour la Nouvelle-Aquitaine, **Cap Métiers et son outil SI-Terr**
(données emploi / métiers / formation jusqu'au bassin d'emploi, comparaison entre territoires, données
téléchargeables ; publie aussi des portraits de territoire et diagnostics). Rôle configuré par instance :
un autre CARIF-OREF pour une autre région. Nommé dans le tableau des sources et dans « Près de chez moi ».

**Reste à faire** : Denis lance le prompt chiffres pour avril-juin 2026 -> premier digest chiffres.

## 17.22 Vérification assistée et Lexique (Denis 2026-09-04)

### Contrôle de cohérence + « confronter à la source »

`veille.html` ne lit pas les PDF (pas de serveur, pas de budget). Mais il **signale** ce qui est louche
après « Coller ici et lire » (chiffres et balayage) : point qui s'écarte de plus de 10 % de sa série,
valeur qui ne colle pas au dernier point de la série, % hors 0-100, source sans adresse, date de donnée
dans le futur. **L'outil signale, il ne corrige pas.** Les adresses des sources (PDF compris) sont
cliquables dans l'aperçu.

Bouton **« Préparer une vérification »** (chiffres) : génère un prompt listant les points douteux + leur
source, à confronter au document dans Claude ou ChatGPT. Retour dans un bloc `[VERIF]`
(`point / valeur_verifiee / statut confirme|corrige|introuvable / citation`). Recollé, l'outil remplace
la valeur des points « corrige », marque « (vérifié) », tamponne l'en-tête `verifie_le: <mois>`. **La
correction va dans le digest**, pas dans un fichier à part (même logique qu'une ligne `revisions:`).
Les prompts balayage et chiffres exigent désormais une adresse de source **obligatoire, jamais vide**.

### Objectif « Nourrir le Lexique »

Bloc à part dans `veille.html` (pas un digest du module). Repère les termes / dispositifs / pratiques du
champ de l'insertion **apparus ou qui ont changé de sens** ; sort un bloc `[LEXIQUE]` -> des **entrées
candidates au format `docs/CORPUS_LEXIQUE.md`** (### Terme, **Univers/Registres/Variantes**, définition,
*Ce qui a changé*, > source). **Rien n'apparaît dans le module « Se tenir informé ». Rien n'est écrit
automatiquement** : Denis relit, garde, colle dans CORPUS_LEXIQUE.md. `data/lexique.js` dérive de
CORPUS_LEXIQUE.md -> pas de changement de code. **Réserve** : le corpus Lexique est « prêt pour le commit
unique » (autre chantier) ; ne rien y injecter tant que ce chantier n'a pas atterri, à coordonner.
Prompt complet : `docs/VEILLE_PROMPTS.md` section 5quater.


## 17.23 Digest « À confronter » (Denis 2026-09-04, CONSTRUIT)

4e digest trimestriel, bloc dédié dans `veille.html` (section « Chaque trimestre »). **Le seul endroit
du circuit qui regarde des sources non officielles.** Les prompts 1, 3, Balayage, Chiffres et Lexique
restent volontairement sur les sources institutionnelles ; ils le disent explicitement (« Cherche
sur : Légifrance, service-public.fr, ... »). « À confronter » va voir le réseau des professionnels
(publications LinkedIn de CIP / France Travail / missions locales / IAE, lettres d'information de
réseaux, groupes et pages métier, blogs emploi-formation), **puis confronte chaque signal à l'officiel**
(recherche web sur les sites publics) et le classe : `CONFIRME` / `EN PARTIE` / `INEXACT` /
`PAS DE POSITION`.

Bloc `[CONFRONTER periode: ...]`, une entrée par signal (`signal / d_ou / rayon / confrontation /
statut / a_recouper`). Sortie `contenu/a-confronter/<fin>.md` (`type: a-confronter`, `non_verifie:
true`). **Ne produit pas de fiches** : alimente le bloc « À confronter » des rayons (décision 12 de la
maquette), jamais mélangé aux fiches ni au tableau des sources, jamais de lien cliquable, formulation
non fataliste. Contrôle de cohérence : signal sans confrontation, rayon manquant. Panneau « Ce
trimestre » : 4e ligne. Prompt complet : `docs/VEILLE_PROMPTS.md` section 5quinquies.

### Renfort du prompt 3 (contrôle)

Nouvel état `PRINCIPE OBSOLETE` : quand le dispositif décrit par une fiche a été supprimé, fermé ou
entièrement remplacé, l'assistant ne le classe plus en simple « changement ». Parseur + « Ma base »
(pastille « principe obsolète » -> « Retirer une fiche ») + message de bilan. Pas de bouton « Traiter »
pour ce cas : direction retrait (pierre tombale, avec le remplacement dans le résumé).

### Ergonomie de veille.html (Denis 2026-09-04, « je veux suivre des reco »)

- **Panneau « Ce trimestre »** (Balayage / Chiffres / Lexique / À confronter), miroir de « Ce mois-ci »,
  coche chaque digest dès sa lecture, pour le dernier trimestre civil complet.
- **Trois sections** en mode « Entretenir » : *Chaque mois* (base + contrôle) · *Chaque trimestre*
  (les 4 digests) · *Réglages et gestion*.
- **Bouton « committer en un clic » : écarté.** Il demanderait un jeton GitHub stocké dans le navigateur,
  contraire à « rien n'est envoyé nulle part ». Remplacé par un aide-mémoire de dépôt manuel. À revoir
  une fois `modules/comprendre-le-cadre/` cadré avec l'autre compte (réconciliation 17.9).


## 17.24 Socle « Comprendre le cadre » rédigé (2026-09-04)

Emplacement provisoire `docs/CONTENU_COMPRENDRE_LE_CADRE/` (déménage dans `modules/comprendre-le-cadre/`
quand la structure est cadrée) :

- `sources.txt` : 18 sources (Légifrance, service-public, ministère du Travail, BO travail, Intérieur
  étrangers, ENIC-NARIC, France compétences, Centre Inffo, INSEE, DARES, France Travail stats + BMO,
  Cap Métiers / SI-Terr, Transitions Pro, Observatoire des territoires, CAF, Service Civique, AGEFIPH),
  format `nom | à quoi elle sert | quand l'ouvrir | nom-du-lien`.
- `liens-verifies.txt` : adresses **candidates**, à vérifier une par une avant publication (LECONS 9.16).
- `methode/` : 3 fiches `type: methode` (ne se périment pas, sans `sources:` vivantes) :
  *comment-lire-un-taux-de-chomage*, *reconnaitre-une-source-officielle*,
  *comment-savoir-quelle-regle-s-applique-a-ma-situation*.


## 17.25 Renforcement des prompts + les 14 sujets de collecte écrits (Denis 2026-09-04)

Denis : « la clé de la réussite de ce module, ce sont les prompts » ; « je préfère faire tout d'un bloc
que par petits bouts, au moins tout est au niveau de la maquette, on n'aura qu'à implémenter ».

### Socle commun `socleRecherche()`

Un seul garde-fou, injecté dans les 6 prompts de recherche (collecte, contrôle, balayage, chiffres,
lexique, à confronter) : date du jour ; recherche web obligatoire ; n'utiliser que des pages réellement
ouvertes ; ne jamais fabriquer une adresse / un numéro de texte / une date (« à vérifier » à la place) ;
une adresse = une seule URL d'un seul tenant, sans espace ni texte inséré. Motivé par des retours réels
(URL avec du texte inséré au milieu, indicateurs omis sans avoir cherché).

Renforts ciblés : **balayage** liste EXACTE des domaines à reprendre + gestion du trimestre en cours ;
**chiffres** une entrée par indicateur même sans valeur + pointer les séries STMT par département +
décalage d'un trimestre du chômage localisé ; **contrôle** une vérif « de mémoire » = INCERTAIN, pas
A JOUR ; **à confronter** viser le signal faible, pas l'actualité déjà officielle ; **rédaction** ne
rien ajouter qui ne soit pas dans le matériau. Contrôle de cohérence balayage élargi : domaine hors
liste, même adresse réutilisée pour deux changements.

### Les 14 sujets de collecte

Tous écrits dans `outils/veille.html` (`SUJETS`, menu « Sujet ») et résumés dans `VEILLE_PROMPTS.md`
§ 3 : emploi, former, accompagnement, creer, jeunes, handicap, etr-sejour, etr-demarches, justice,
budget, mobilite, logement, garde, francais, juridique. Chaque rayon a un sous-thème réglable sauf les
deux « Étranger ». La clé `SUJETS` = le slug du rayon, donc `lireCollecte` route la fiche vers le bon
rayon automatiquement (plus de `mapR` à tenir à jour). Il ne reste qu'à lancer le pipeline
collecte -> rédaction rayon par rayon ; aucun texte de prompt à écrire.


## 17.26 « À qui s'adresser » dans la collecte + rayons Étranger et Budget rédigés (2026-09-04)

### Section `structures:` dans tous les prompts de collecte (décision Denis)

Chaque prompt de collecte rassemble maintenant, en plus de `sources:`, une section `structures:` :
« à qui s'adresser » pour ce sujet, au niveau national et surtout dans le département (guichets
publics, permanences d'accès au droit, réseaux d'accompagnement, associations reconnues). Format
identique aux sources (nom-court | nom + rôle | adresse | date). L'outil parse, affiche pour
vérification, et écrit `structures:` dans l'en-tête du `<rayon>.collecte.md`. **Ça alimente
« Près de chez moi », jamais le corps des fiches** : dans la prose, la fiche renvoie à un *type*
de structure, pas à un nom + lien (LECONS 9.16, décision 20 de la maquette). Rien pour les digests
(chiffres, lexique, à confronter). Détail : `VEILLE_PROMPTS.md` § 3.

### Rayon « Venir de l'étranger » : 6 fiches (brouillon)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/etranger/` : titre de séjour et travail, comparabilité de
diplôme, permis de conduire étranger, naturalisation (B2 + examen civique 2026), contrat
d'intégration républicaine, demandeur d'asile et emploi. Recherche web sur les pages officielles,
consignée dans `etranger.collecte.md` (avec la section `structures:` : préfecture 24, ANEF, OFII,
ENIC-NARIC, ANTS, CDAD 24, Cimade, SPADA). À relire + vérifier les adresses.

### Rayon « Budget, dettes, droits sociaux » : 6 fiches (brouillon)

`.../contenu/budget/` : procédure de surendettement, point conseil budget, RSA + prime d'activité
et reprise d'emploi, microcrédit personnel accompagné, fichage FICP, droit au compte. Recherche
sur service-public.gouv.fr, Banque de France, solidarites.gouv.fr, CAF ; `budget.collecte.md`
avec `structures:` (points conseil budget, succursale Banque de France de Périgueux, CCAS, services
d'insertion du conseil départemental 24, CAF 24, MSA, UDAF 24, CRÉSUS, réseaux du microcrédit).

Correctif outil : « Mettre à jour une fiche existante » garde toujours l'identifiant du fichier,
même quand « Ma base » n'est pas chargée.


## 17.27 Rayons Mobilité et grande précarité (2026-09-04)

### Rayon « Mobilité » : 6 fiches (brouillon)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/mobilite/` : financer le permis, permis suspendu/annulé/
points, garages et locations solidaires, acheter ou réparer un véhicule, se déplacer sans voiture,
aide à la mobilité de France Travail. Recherche : service-public.gouv.fr, Sécurité routière, France
Travail, ministère de la Transition écologique, Région Nouvelle-Aquitaine. **Fait réglementaire
majeur : l'aide au permis B de France Travail est supprimée depuis le 1er avril 2026** (+ aide de
500 € aux apprentis, loi de finances 2026) ; deux fiches portent une ligne `revisions:`. `structures:` :
Mes aides France Travail, France Mobilités, plateforme mobilité 24, service transports de la Région
(Carte Solidaire, transport à la demande), Covoit' Modalis, conseil départemental 24, Missions
locales, auto-écoles associatives.

### Grande précarité (demande Denis : « ceux qui sont dans la rue »)

Deux fiches ajoutées, rattachées au bon rayon plutôt que dans un rayon dédié :
- **`logement-sans-hebergement-urgence`** (début du rayon Logement) : 115, SIAO, hébergement
  d'urgence et son principe d'inconditionnalité, maraudes et équipes mobiles, accueils de jour,
  domiciliation. Le reste du rayon Logement (Action Logement, Visale, FSL, allocation logement)
  reste à collecter.
- **`budget-aide-alimentaire-et-aides-urgence`** (7e fiche du rayon Budget) : les quatre réseaux
  habilités (Restos du Cœur, Banque alimentaire, Secours populaire, Croix-Rouge), paniers-repas vs
  aide d'urgence, épiceries sociales et solidaires ; secours d'urgence du CCAS, aides individuelles
  du département, FAJ, aides ponctuelles CAF et France Travail, chèque énergie.

Les deux fiches se renvoient l'une à l'autre. Structures dans `logement.collecte.md` et
`budget.collecte.md`.


## 17.28 Rayon « Se former et se reconvertir » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/former/` : compte personnel de formation, se former avant
l'embauche (POEI / POEC), validation des acquis de l'expérience, projet de transition professionnelle,
démission-reconversion, conseil en évolution professionnelle. Recherche : service-public.gouv.fr,
France Travail, France VAE, Transitions Pro, France compétences.

Faits réglementaires récents intégrés : **participation forfaitaire du CPF portée à 150 €** (avril
2026, ligne `revisions:` dans la fiche CPF) ; **AFPR fusionnée dans la POEI** depuis la loi pour le
plein emploi du 18 décembre 2023 ; **suppression de la condition d'un an d'expérience pour la VAE**
(réforme 2023-2024, portail France VAE).

`structures:` : opérateur CEP Nouvelle-Aquitaine, Transitions Pro Nouvelle-Aquitaine, APEC, France
Travail (financement formation), Région Nouvelle-Aquitaine, points relais conseil VAE, AFPA / GRETA /
CNAM. Reste noté dans la collecte : financement des formations pour demandeurs d'emploi, période de
reconversion (loi 2025, à revérifier), Pro-A.

## 17.29 Rayon « Emploi et contrats » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/emploi/` : période d'essai, rupture conventionnelle, CDD /
CDI / saisonnier, intérim (+ ETTI), contrats de l'insertion (CDDI, PEC, CDD Tremplin), fin de contrat
(documents, solde de tout compte, portabilité mutuelle). Recherche : service-public.gouv.fr, ministère
du Travail, Unédic, France Travail. Correspond à l'écran détaillé `dossier` de la maquette (4
questions + 2 ajoutées).

Fait réglementaire intégré : **rupture conventionnelle individuelle, fin de contrat à compter du 1er
septembre 2026 = durée maximale d'indemnisation chômage spécifique** (15 mois avant 55 ans, 20,5 mois
à partir de 55 ans), repérée dans le balayage juillet-septembre 2026 ; ligne `revisions:` dans la
fiche. `structures:` : France Travail, inspection du travail (DDETS 24), prud'hommes Périgueux /
Bergerac, points-justice, structures de l'IAE 24, Cap emploi 24.

## 17.30 Rayon « Logement » complété : 6 fiches (brouillon, 2026-09-04)

Aux côtés de `logement-sans-hebergement-urgence` (17.27), cinq fiches ajoutées :
`logement-action-logement` (Visale, avance Loca-Pass), `logement-fonds-de-solidarite-logement` (FSL,
accès et maintien), `logement-aides-au-logement-caf` (APL / ALS / ALF), `logement-droit-au-logement-
opposable` (DALO), `logement-residences-sociales-fjt` (foyers de jeunes travailleurs, pensions de
famille, intermédiation locative). Recherche : service-public.gouv.fr, solidarites.gouv.fr, Action
Logement, DIHAL. `logement.collecte.md` réécrit en collecte complète (12 sources, 10 structures).
`structures:` : 115 / SIAO 24, CCAS, conseil départemental 24 (FSL), ADIL 24, Action Logement
Nouvelle-Aquitaine, CAF 24, préfecture 24 (DALO), Habitat Jeunes du Périgord.

## 17.31 Rayon « Accompagnement et structures de l'insertion » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/accompagnement/` : qui accompagne vers l'emploi (le bon
interlocuteur), le contrat d'engagement, l'accompagnement quand on touche le RSA, l'insertion par
l'activité économique (EI, ETTI, ACI, AI), la clause sociale et le PLIE, l'accompagnement global /
intensif / sous-traitance. Recherche : service-public.gouv.fr, ministère du Travail, France Travail,
économie.gouv.fr.

Faits intégrés : loi pour le plein emploi (inscription obligatoire des allocataires du RSA et des
jeunes ML à France Travail depuis 2025, contrat d'engagement unifié, orientation sous 6 semaines) ;
**barème de sanctions du 30 mai 2025 (suspension-remobilisation puis suppression), en vigueur depuis
le 1er juin 2025** (ligne `revisions:` dans la fiche contrat d'engagement).

Recoupements assumés : Mission locale renvoie au futur rayon Jeunes, Cap emploi au futur rayon
Handicap, les contrats d'insertion (CDDI, PEC, CDD Tremplin) au rayon Emploi
(`emploi-contrats-de-l-insertion`). Ici, ces structures sont présentées comme des repères du paysage,
pas en détail. `structures:` : France Travail, Missions locales du Périgord, Cap emploi 24, conseil
départemental 24, structures de l'IAE 24, PLIE et maisons de l'emploi 24, APEC.

## 17.32 Rayon « Handicap et emploi » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/handicap/` : RQTH et MDPH, médecine du travail et inaptitude
(visite de reprise, aménagement, reclassement, licenciement), AGEFIPH, Cap emploi et emploi
accompagné, entreprise adaptée et ESAT, obligation d'emploi et reconnaissance de la lourdeur du
handicap. Recherche : service-public.gouv.fr, ministère du Travail, AGEFIPH.

Faits intégrés : **révision de l'offre AGEFIPH au 1er octobre 2025** (ligne `revisions:`) ; RQTH
automatique pour certains jeunes de 15-20 ans (à confirmer) ; fin de l'écrêtement de la contribution
OETH depuis 2025 ; aide RLH ~6 770 € / ~13 479 € par an en 2026.

Recoupements assumés : Cap emploi est aussi dans le rayon Accompagnement (paysage), ici détaillé ; le
CDD Tremplin est dans le rayon Emploi.

## 17.33 Rayon « Moins de 26 ans » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/jeunes/` : Mission locale et contrat d'engagement jeune,
école de la deuxième chance et EPIDE, service civique, obligation de formation des 16-18 ans,
prépa-apprentissage et écoles de production, aides financières pour les jeunes. Recherche :
service-public.gouv.fr, ministère du Travail, Éducation nationale, Agence du service civique.

Montants 2026 intégrés : allocation CEJ jusqu'à 566,17 € (1er avril 2026) ; E2C ~500 € (>18) / ~200 €
(16-18) ; EPIDE allocation 460 € + prime ~106 € ; service civique 504,98 € + 114,85 € de prestation
de subsistance.

Recoupements assumés : l'apprentissage au rayon Se former, la Mission locale au rayon Accompagnement
(paysage), le fonds d'aide aux jeunes au rayon Mobilité. Ici, détaillé pour le public jeune.
`structures:` : Missions locales du Périgord, France Travail jeunes 24, E2C Périgueux, EPIDE
Nouvelle-Aquitaine, Agence du service civique, plateforme décrocheurs 24, CFA et écoles de production
Nouvelle-Aquitaine.

## 17.34 Rayon « Créer son activité » : 6 fiches + fiche O2R ajoutée à Accompagnement (2026-09-04)

**Créer son activité** : micro-entreprise ou société (comment choisir), coopérative d'activité et
d'emploi (CAPE puis CESA), aides à la création (ACRE, ARE, ARCE, RSA), se faire accompagner et
financer (chambres consulaires, BGE, ADIE, Initiative France, France Active), premières démarches
(guichet unique, immatriculation, SIRET), régime micro au quotidien. Recherche : service-public.gouv.fr,
URSSAF, France Travail, Bpifrance Création, fédération des CAE.

Faits intégrés : plafonds micro 2026 (203 100 € vente / 83 600 € services) ; **ACRE à demander à
l'URSSAF sous 60 jours depuis le 1er janvier 2026** (ligne `revisions:`) ; **cumul ARE plafonné à
60 % du reliquat depuis le 1er avril 2025** ; ARCE = 60 % en deux versements ; évolution du taux
minoré de cotisations micro au 1er juillet 2026 (à confirmer).

**Fiche `accompagnement-o2r-remobilisation`** ajoutée au rayon Accompagnement (demande Denis) :
l'offre de repérage et de remobilisation, créée par la loi pour le plein emploi, pour aller chercher
les personnes très éloignées de l'emploi et non inscrites (« invisibles »), accompagnement renforcé
d'environ 6 mois, opérationnelle depuis 2025. Le rayon Accompagnement passe à 7 fiches.

## 17.35 Rayon « Justice : sortie de détention » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/justice/` : le SPIP, l'aménagement de peine et la libération
sous contrainte, le travail et la formation en détention (contrat d'emploi pénitentiaire), le casier
judiciaire (les 3 bulletins, effacement), la sortie et l'accès aux droits, la reprise d'un parcours
vers l'emploi (France Travail justice). Recherche : service-public.gouv.fr, ministère de la Justice,
Justice.fr, France Travail. **Ton : public très fragile, aucun jugement, on explique le cadre, tout
renvoie au SPIP.**

Faits intégrés : **contrat d'emploi pénitentiaire depuis le 1er mai 2022** (ligne `revisions:`),
ouverture progressive des droits sociaux (ordonnance du 19 octobre 2022) ; libération sous contrainte
automatique à 3 mois de reliquat (à confirmer) ; bulletin n° 3 = seul demandable par la personne.

Recoupements : hébergement -> `logement-sans-hebergement-urgence` ; IAE de droit commun -> rayon
Accompagnement ; contentieux -> rayon Questions juridiques. `structures:` : SPIP 24, France Travail
justice 24, casier judiciaire national, points-justice 24, SIAO 24, associations post-sentencielles,
IAE en milieu pénitentiaire (ATIGIP).

## 17.36 Rayon « Garde d'enfant » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/garde/` : trouver un mode de garde (accueil individuel ou
collectif, relais petite enfance, monenfant.fr, PMI), le complément de libre choix du mode de garde
(CMG) de la CAF, l'aide à la garde d'enfants de France Travail (AGE), les crèches à vocation
d'insertion professionnelle (AVIP), la garde en horaires décalés ou d'urgence, et la situation des
parents qui élèvent seuls leurs enfants. Recherche : service-public.gouv.fr, solidarites.gouv.fr, CAF,
Urssaf, France Travail, monenfant.fr, Légifrance. La garde est traitée comme un **frein périphérique**
(`frein: true` sur les 6 fiches). **Ton : jamais de jugement sur les choix de garde.**

Faits intégrés : réforme du CMG par le décret n° 2025-515 du 30 mai 2025, en vigueur au 1er septembre
2025 (calcul aux heures déclarées, fin du reste à charge de 15 pour cent ; ligne `revisions:`) ;
CMG jusqu'aux 12 ans pour les familles monoparentales ; deux parents en résidence alternée depuis le
1er décembre 2025 ; bascule AGEPI vers AGE au 1er mai 2024 (ligne `revisions:`) ; obligation d'un RPE
dans les communes de plus de 10 000 habitants depuis le 1er janvier 2026 ; crèche AVIP ouverte sur
l'agglomération de Bergerac début 2026 (à revérifier avant de la nommer dans « Près de chez moi »).

Recoupements : FAJ garde pour les moins de 26 ans -> rayon Moins de 26 ans ; RSA majoré et allocation
de soutien familial -> rayon Budget ; accompagnement global -> rayon Accompagnement. `structures:` :
relais petite enfance, CAF 24, PMI du conseil départemental, France Travail, monenfant.fr, CCAS,
Missions locales du Périgord, Pajemploi (Urssaf).

## 17.37 Rayon « Apprendre le français » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/francais/` : à quoi servent les niveaux de langue (A1 à C2),
les cours de l'OFII dans le cadre du contrat d'intégration républicaine, apprendre le français près de
chez soi (ateliers sociolinguistiques, OEPRE, associations), les formations aux compétences de base
pour les personnes scolarisées en France (illettrisme, CléA), se former en français pour le travail et
faire financer la formation (CPF, AIF, OPCO), faire reconnaître son niveau (DILF, DELF, TCF, DCL).
Recherche : ministère de l'Intérieur, direction générale des étrangers en France, éduscol, ANLCI,
France Travail, France Éducation international. `frein: true` sur les 6 fiches. **Ton : trois publics
souvent confondus (français langue étrangère, alphabétisation, illettrisme) ; aucun mot qui humilie.**

Faits intégrés : A2 pour la carte pluriannuelle et B1 pour la carte de résident depuis le 1er janvier
2026 (loi du 26 janvier 2024 ; ligne `revisions:` de la fiche « niveaux ») ; CIR = 4 jours de
formation civique + 100 à 600 heures de linguistique, part à distance depuis le 1er juillet 2025 ;
OEPRE jusqu'à 100 heures par an ; environ 3,7 millions d'adultes scolarisés en France en difficulté
avec les compétences de base ; participation CPF de 150 euros depuis le 2 avril 2026, exonération pour
les demandeurs d'emploi (ligne `revisions:` de la fiche « se former pour le travail »).

Recoupements : séjour, carte de résident, naturalisation et niveau exigé -> rayon Étranger (ne pas
dupliquer) ; financement d'une formation -> rayon Se former ; aides pendant la formation -> rayons Se
former et Budget. `structures:` : OFII, centres sociaux 24, service social départemental, France
Travail, Région Nouvelle-Aquitaine (savoirs de base), établissements scolaires OEPRE, La Cimade
(Périgueux), centres d'examen DELF/DILF/TCF 24.

## 17.38 Rayon « Questions juridiques » : 6 fiches (brouillon, 2026-09-04)

`docs/CONTENU_COMPRENDRE_LE_CADRE/contenu/juridique/` : trouver un conseil juridique gratuit
(points-justice, CDAD, consultations d'avocats), l'aide juridictionnelle, le litige avec l'employeur
(conseil de prud'hommes, délais, barème), faire respecter ses droits au travail (inspection du
travail, harcèlement, représentants du personnel), la discrimination à l'embauche (Défenseur des
droits, preuve aménagée), contester une décision de France Travail, de la CAF ou d'une autre
administration (recours amiable, RAPO, médiateur). Recherche : service-public.gouv.fr, code du travail
numérique, justice.fr, France Travail, Défenseur des droits, CAF. `frein: false` sur le panorama et
l'aide juridictionnelle, `frein: true` sur les quatre fiches de litige. **Ton : jamais alarmiste,
toujours une porte de sortie concrète.** Ce rayon oriente, il ne donne pas de conseil personnalisé.

Faits intégrés : **timbre fiscal de 50 euros** pour saisir une juridiction civile ou les prud'hommes
depuis le 1er mars 2026, exonération pour l'aide juridictionnelle (lignes `revisions:` de la fiche
prud'hommes) ; délais de prescription prud'homaux (12 mois / 2 ans / 3 ans) ; barème dit « Macron »
(3 à 20 mois), écarté en cas de nullité ; médiateur France Travail préalable obligatoire pour les
sanctions ; commission de recours amiable de la CAF dans les 2 mois.

Recoupements : rupture du contrat et contrats d'insertion -> rayon Emploi ; recours MDPH -> rayon
Handicap ; recours préfecture (séjour) -> rayon Étranger ; surendettement, saisies, expulsion ->
rayons Budget et Logement. `structures:` : points-justice 24, CDAD 24, bureau d'aide juridictionnelle,
conseils de prud'hommes de Périgueux et Bergerac, inspection du travail (DREETS), délégués du
Défenseur des droits en Dordogne, France Victimes 24, barreau de Périgueux.

### Décompte des rayons rédigés

**Les 14 rayons sont rédigés (brouillons).** Accompagnement 7 · Budget 7 · Créer 6 · Emploi 6 ·
Étranger 6 · Français 6 · Garde 6 · Handicap 6 · Jeunes 6 · Justice 6 · Juridique 6 · Logement 6 ·
Mobilité 6 · Se former 6. Soit 86 fiches, plus 14 fichiers de collecte, 3 fiches méthode, `sources.txt`
et `liens-verifies.txt`.

## 17.39 Relecture QA des 14 rayons (2026-09-04)

Passage de relecture linguistique et de cohérence (grammaire, ton, non-négociables, cohérence
fiche/collecte) sur les 14 rayons, rayon par rayon, chacun testé en navigateur après correction.
**Ce n'est pas la vérification factuelle** (dates, montants, adresses) : celle-ci reste à faire par
Denis dans `outils/veille.html`, les points sensibles restant listés dans le README de chaque rayon.

Trouvailles principales :
- **Tiret cadratin** glissé dans les 14 `README.md` de rayon et les en-têtes de `liens-verifies.txt`
  (jamais dans une fiche ni une collecte) : corrigé partout, balayage complet à 0 occurrence.
- **Décomptes `sources:`/`structures:` du README non mis à jour** après l'ajout tardif d'une fiche
  (Accompagnement : O2R : 6→7 fiches, 11→12 sources ; Budget : aide alimentaire : 6→7 fiches, 14→16
  sources, 10→14 structures) : corrigés.
- **Omissions ou simplifications excessives** repérées fiche par fiche en comparant au matériau de
  la collecte (déjà recherché mais pas repris dans le texte final) : par exemple le rétablissement
  personnel avec liquidation judiciaire (Budget), le délai de prévenance asymétrique de la période
  d'essai (Emploi), l'exception « sauf décision contraire motivée » de la libération sous contrainte
  (Justice), deux exceptions d'âge liées au handicap (Moins de 26 ans), une source citée mais jamais
  exploitée dans le corps (Questions juridiques).
- Un point de architecture distinct (fiche `mobilite-se-deplacer-sans-voiture` en `territoire:
  regional` avec des dispositifs nommés en dur) a été signalé à Denis puis corrigé sur sa décision.

Chaque correction est tracée dans son propre commit (voir le journal git pour le détail rayon par
rayon). Prochaine étape : vérification factuelle et des adresses par Denis, puis déménagement vers
`modules/comprendre-le-cadre/` une fois la structure cadrée avec l'autre compte (réconciliation 17.9).
