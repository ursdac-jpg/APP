# Chantier : territoire (national / régional / départemental) dans « Comprendre le cadre »

> Cadré avec Denis le 2026-09-05. Ce document est le **contrat** du chantier : il fige le
> quoi et le pourquoi. Le comment (code) suit ce document, jamais l'inverse.

> **TERMINÉ - vérifié le 2026-09-06.** Les 4 morceaux de code (§ 6, points 1, 2, 3, 5)
> étaient **déjà implémentés dans le module** (construit avec ce chantier comme cible) :
> `_comprendreLeCadreParserLiensVerifies()` lit le 4e champ `portee` ;
> `_comprendreLeCadreChargerStructuresRayon()` le rattache à chaque structure ;
> `_comprendreLeCadreRenduStructures()` fait les 3 sections + le repli honnête + la section
> « À vérifier selon votre territoire » + le cas « autre département » ; le lien annuaire est
> câblé sur `ouvrirRenvoiAnnuaire()` ; le prompt de collecte de `veille.html` demande la
> portée. Le **morceau 4** (taguer les structures) est fait aussi : les **117 lignes du
> paquet C ont toutes une portée** (`national` / `region` / `24` / `87`), taguées pendant la
> vérification des adresses. Reste **hors de ce chantier** : la **datation** des ~110
> structures du paquet C (3e colonne vide → lien pas encore cliquable, LECONS 9.16) - même
> mécanique que le paquet B, non bloquant.
>
> **2026-09-08** : ajout de la **section 10** (piste `data.inclusion` comme source de structures).
> Ne rouvre pas le contrat ci-dessus : c'est une évolution possible, à cadrer séparément.

---

## 1. Le but, en une phrase

Que « Près de chez moi » (et plus tard les recherches préparées) montre à chaque personne
les structures et les aides de **son** territoire, avec un **repli honnête** quand on n'a
que du régional ou du national : jamais les mains vides, jamais une information d'un autre
département présentée comme locale.

## 2. Le problème concret

- La maquette validée pose déjà **trois couches** : national, régional (Nouvelle-Aquitaine),
  départemental (Dordogne 24 ou Haute-Vienne 87). `docs/VEILLE_PROMPTS.md` section 7 dit déjà
  à l'assistant de ne jamais mélanger les territoires.
- Les **fiches restent nationales** (décision maquette, `MAQUETTE_SE_TENIR_INFORME_PARCOURS`
  ligne 1335 : « Seule cette couche [les liens locaux] se multiplie par département ; les
  fiches, elles, restent nationales »).
- **Mais** la liste `structures:` d'un rayon (dans `<rayon>.collecte.md`) est à 4 colonnes
  `nom-court | description | adresse | date` : **aucune ne dit à quelle couche appartient la
  structure**. L'assistant le sait au moment de la collecte, l'information est perdue au
  collage. Résultat aujourd'hui : « Près de chez moi » affiche toutes les structures du
  fichier, quel que soit le département choisi.
- Le module demande désormais le territoire à l'entrée (décision Denis 2026-09-05, écran-porte
  bloquant) : l'information EST disponible côté code, il ne reste qu'à s'en servir.

## 3. Ce qui est décidé (ne pas re-trancher)

| Décision | Choix retenu | Pourquoi |
|---|---|---|
| **Où vit la portée** | Dans `liens-verifies.txt` (un 4e champ), **pas** sur chaque ligne `structures:` | La portée est une propriété de l'organisme (« la CAF de la Dordogne, c'est du 24 »), pas de la phrase qui le cite. Une structure citée dans 3 rayons ne se tague qu'une fois. Denis parcourt déjà ce fichier ligne par ligne pour vérifier les adresses : ajouter la portée pendant qu'il y est est quasi gratuit, sans ouvrir 14 fichiers de collecte en plus. |
| **Nombre de couches** | 3 : national / régional / départemental. Régional = Nouvelle-Aquitaine (les deux départements pris en charge y sont). | Repris de la maquette et de VEILLE_PROMPTS §7. Le prompt a de toute façon besoin des 3 pour que l'assistant ne prenne pas d'info d'une autre région. |
| **La région dans l'interface** | Pas de choix « région » à part : la région est déduite du département (24 -> NA, 87 -> NA). L'utilisateur ne choisit que son département. | Avec deux départements pris en charge, tous deux en NA, un choix « région » séparé ne changerait jamais rien. La couche régionale sert au **contenu** et à l'**affichage**, pas à un troisième bouton. |
| **Les fiches** | Restent 100 % nationales. Zéro tag territoire sur une fiche. | Décision maquette. Une aide qui varie par région (ex. Carte Solidaire de Nouvelle-Aquitaine) est une **structure** taguée `region`, pas du contenu de fiche. La fiche renvoie à « Près de chez moi ». |
| **Mémoire du territoire** | Reste mémorisé (comportement actuel, `demanderDepartementSiInconnu` + `CLE_DEPARTEMENT_RESSOURCES`). | La maquette évoque une question « éphémère, sans mémoire » pour un déploiement grand public : c'est une décision de configuration de déploiement, **hors de ce chantier**. |

## 4. L'échelle de repli (le cœur du chantier)

Quand une personne ouvre « Près de chez moi » pour un rayon, on descend l'échelle jusqu'à
trouver quelque chose à montrer :

1. **Il y a du départemental précis** (structures taguées pour son département)
   -> on l'affiche, dans une section « En Dordogne (24) » (ou Haute-Vienne).

2. **Rien de départemental, mais du régional** (structures taguées `region`)
   -> on affiche le régional, encadré d'une phrase honnête :
   > « Voici ce qui existe au niveau de la Nouvelle-Aquitaine. Ces dispositifs s'appliquent
   > dans tous les départements de la région, dont le vôtre. Pour savoir où vous adresser
   > précisément près de chez vous, le mieux est de passer par [un type de guichet nommé,
   > jamais une adresse inventée : France Travail, votre Mission Locale, le CCAS de votre
   > commune, un point conseil budget…]. »

3. **Rien de régional non plus, mais du national** (structures taguées `national`, ou le
   principe est national même si on n'a pas la structure locale)
   -> on affiche le principe national + :
   > « Ce dispositif existe partout en France. Chaque département l'organise à sa façon ;
   > le point d'entrée près de chez vous est en général [type de structure]. »

4. **Rien du tout pour ce rayon**
   -> phrase honnête + les « portes universelles » nommées par **type** (CCAS, France
   Services, Maison des solidarités, Point conseil budget), jamais une adresse devinée
   (LECONS 9.16). Plus un lien vers l'annuaire déjà existant du territoire quand il y en a
   un (voir §6, point 4).

**Règle stricte, à ne jamais enfreindre :** on ne dit **jamais** « ça existe probablement
aussi dans votre département » pour une structure trouvée seulement dans un **autre**
département. Le régional s'applique par définition (la personne est dans la région) ; le
national aussi. Mais « trouvé en Dordogne » ne se transpose pas à la Haute-Vienne par
supposition. Un dispositif **national** dont on n'a que l'instance d'un autre département :
on affiche le principe national + « comment trouver la vôtre », jamais l'instance de
l'autre département.

## 5. Le format exact

### `liens-verifies.txt` : un 4e champ

```
nom-du-lien | adresse | date de vérification | portée
```

- `portée` prend une seule valeur : `national`, `region`, `24`, `87`.
- Ligne à 3 champs (l'existant, sans portée) = **rétrocompatible** : la structure est
  considérée « sans territoire », donc affichée pour tout le monde (comportement actuel),
  jusqu'à ce que Denis la tague.
- Une structure `region` s'affiche pour un utilisateur `24` ET un utilisateur `87`, jamais
  pour `ailleurs`.
- Une structure `national` s'affiche pour tout le monde, y compris `ailleurs`.
- Une structure `24` ne s'affiche que pour un utilisateur `24`. Idem `87`.

### `structures:` dans `<rayon>.collecte.md` : **inchangé**

Toujours `nom-court | description | adresse-candidate | date`. La portée n'est PAS ici :
elle est résolue au chargement, en croisant le `nom-court` avec `liens-verifies.txt` (le
module fait déjà ce croisement pour savoir si une adresse est vérifiée).

## 6. Les morceaux de travail

**1. Le format + le parseur (code, maintenant).**
- `liens-verifies.txt` : le 4e champ documenté dans l'en-tête du fichier.
- `_comprendreLeCadreParserLiensVerifies()` : lit le 4e champ, le range à côté de `url` et
  `dateVerification`.
- `_comprendreLeCadreChargerStructuresRayon()` : ajoute `portee` à chaque objet structure
  retourné.

**2. L'affichage « Près de chez moi » (code, maintenant).**
- 3 sections avec titres : « Partout en France » / « En Nouvelle-Aquitaine » / « En Dordogne
  (24) » (le libellé du département choisi).
- National + régional : toujours affichés (pour tout utilisateur 24 ou 87).
- Section départementale : les structures du département choisi ; si vide -> la phrase de
  repli du niveau 2 de l'échelle (§4).
- Utilisateur `ailleurs` : sections « Partout en France » + une note expliquant qu'on n'a
  pas d'information régionale ou locale pour son territoire, avec les portes universelles.
- Les structures **sans portée** (pas encore taguées) : une 4e section neutre « À vérifier
  selon votre territoire » plutôt que de les mélanger aux autres, honnête sur le fait que
  leur périmètre n'est pas encore établi.

**3. Le prompt de collecte (`outils/veille.html` + `VEILLE_PROMPTS.md`, maintenant).**
Ajout court à la consigne « à qui s'adresser » du prompt 1 (collecte) :
> « Pour chaque structure, indique sa portée : nationale (vaut partout en France),
> régionale (Nouvelle-Aquitaine) ou départementale ([DÉPT]). Quand tu ne trouves qu'une
> source régionale et rien de spécifique au département, dis-le explicitement plutôt que de
> laisser un vide. »
Et `VEILLE_PROMPTS.md` : mettre à jour la description du bloc `[COLLECTE]` en conséquence
(la portée est notée dans le matériau brut ; Denis la reporte dans `liens-verifies.txt` au
moment de vérifier l'adresse).

**4. Le contenu existant (Denis, à son rythme, avec un coup de pouce).**
- ~285 lignes candidates dans `liens-verifies.txt`, à taguer.
- **Pré-tag automatique** : un script (jetable, non committé) marque les cas mécaniques :
  - adresse sur un domaine `*.dordogne.fr` ou `*.cd24.fr`, ou nom contenant
    « dordogne », « périgord », « périgueux », « bergerac », « sarlat » -> `24`
  - idem Haute-Vienne : `*.haute-vienne.fr`, `limoges`, « haute-vienne » -> `87`
  - nom ou adresse contenant « nouvelle-aquitaine », « cap métiers », « nouvelle aquitaine »
    -> `region`
  - domaines nationaux connus (`service-public`, `legifrance`, `caf.fr` racine sans mention
    de département, `travail-emploi.gouv.fr`, `pole-emploi` / `francetravail` racine,
    `agefiph`, `msa` racine…) -> `national`
  - le reste -> laissé vide, pour Denis.
- Denis relit et corrige, notamment les faux positifs (« CAF de la Dordogne » est sur
  `caf.fr` mais c'est du `24`, pas du `national`).

**5. Le repli vers un annuaire existant (code, maintenant, petit).**
Sous chaque section de « Près de chez moi », un lien vers l'annuaire du territoire déjà
câblé dans l'app (`ouvrirRenvoiAnnuaire()`, `js/app.js` : PCGI 87 pour la Haute-Vienne, page
Bergerac pour la Dordogne, DORA au national). Pour qu'une couverture mince ne soit jamais un
cul-de-sac.

## 7. La séquence

- **Maintenant** : morceaux 1, 2, 3, 5. Tout est rétrocompatible : une structure non taguée
  reste visible pour tout le monde, comme aujourd'hui. Rien ne casse.
- **Ensuite, au rythme de Denis** : morceau 4, dans la même passe que la vérification
  factuelle des adresses. Au fur et à mesure qu'il tague, le filtrage s'active structure par
  structure.

## 8. Hors de ce chantier

- Les **recherches préparées** (« Vérifier une information récente ») : elles devront elles
  aussi injecter le territoire dans le prompt public. À faire quand cet outil sera construit
  (pas encore le cas). Le présent chantier prépare le terrain (les 3 couches sont posées).
- La question de territoire **éphémère** pour un déploiement grand public (voir §3).
- L'ajout d'un **3e ou 4e département** : le modèle le supporte (une valeur de portée en
  plus), mais aucun n'est prévu.

## 9. Ce que ce chantier ne remet pas en cause

- Les fiches restent nationales.
- « Près de chez moi » reste le seul écran territorial du module.
- Une adresse ne devient un lien cliquable que si sa date de vérification est remplie
  (LECONS 9.16) - le tag de portée ne change rien à cette règle.
- L'écran-porte « choisissez votre territoire » reste en place (décision Denis 2026-09-05).

---

## 10. Piste future : `data.inclusion` comme source de structures pour « Près de chez moi »

> Ajouté le 2026-09-08 à la demande de Denis. **Piste, pas encore cadrée.** À instruire avec
> Denis (mode A) avant toute ligne de code. Ne remet rien en cause de ce qui précède.

### Le constat qui motive la piste

Aujourd'hui, remplir « Près de chez moi » d'un rayon coûte cher à la main : l'assistant en ligne
cherche les structures (prompt de collecte), Denis vérifie chaque adresse au navigateur, la date,
lui met une portée. ~110 structures du paquet C restent non datées pour cette raison.

### Ce qu'est `data.inclusion`

Un « commun numérique » du ministère du Travail (équipe beta.gouv, même écurie que « les emplois
de l'inclusion » et DORA) qui rassemble, dans un **schéma standard unique**, l'offre d'insertion
sociale et professionnelle de toute la France.

- **Volume** : de l'ordre de 80 000 à 100 000 structures, ~100 000 services.
- **19 thématiques** qui recoupent nos rayons : mobilité, garde d'enfant, apprendre le français,
  logement, handicap, numérique, accompagnement, remobilisation, budget, emploi...
- **Producteurs** : ~16 (France Travail, conseils départementaux, missions locales, DORA,
  annuaires associatifs...) déversent leurs données ; `data.inclusion` les normalise.
- **Accès** :
  - fichiers **open data** sur data.gouv.fr (Excel, CSV, JSON), mis à jour **chaque lundi soir** ;
  - **API** (rafraîchie jusqu'à toutes les heures) ;
  - **licence ouverte** : réutilisation libre, y compris dans une application.
- **DORA** (`dora.inclusion.gouv.fr`) est le moteur grand public sur la même donnée. Déjà cité
  en lien dans le rayon « Accompagnement » et dans `ouvrirRenvoiAnnuaire()` (§ 6 point 5).

### Ce que ça pourrait remplacer

Interroger `data.inclusion` par **territoire** (département 24 / 87, ou bassin d'emploi) et par
**thématique** (nos 15 rayons) pour récupérer une liste de structures **déjà structurée et
géolocalisée**, au lieu de la collecte manuelle + vérification une par une.

### Les vraies questions à trancher avant (mode A)

1. **API ou fichier ?** Brancher une API dans une application **statique sans serveur** est un
   vrai sujet (clé d'API exposée côté client, quotas, disponibilité). Charger un gros fichier
   open data et le filtrer côté navigateur est plus simple mais lourd (taille, fraîcheur).
2. **Confiance dans la donnée.** La qualité dépend des producteurs : fiches incomplètes,
   doublons, structures fermées encore listées. Le garde-fou LECONS 9.16 (« pas de lien tant
   que non vérifié ») ne peut pas s'appliquer à 100 000 lignes une par une. Quel niveau de
   confiance accorde-t-on à une source officielle agrégée ? Affichage différent (« liste
   indicative, à confirmer ») ?
3. **Cohabitation avec le paquet C existant.** Les ~110 structures déjà collectées et taguées
   à la main sont souvent les meilleures (choisies, décrites). `data.inclusion` vient-il en
   **complément** (comme l'annuaire associatif, décision 5octies de `VEILLE_PROMPTS.md`), en
   **remplacement**, ou en **source de propositions** que Denis valide ?
4. **Périmètre.** Tous les rayons d'un coup, ou un rayon pilote (mobilité, garde) pour tester ?
5. **Le mapping thématiques `data.inclusion` -> rayons** n'est pas 1 pour 1 : à établir.

### Rattachement

Ce n'est pas une newsletter (voir `docs/VEILLE_NEWSLETTERS.md`, section « data.inclusion : une
base, pas une lettre »). C'est une brique du **chantier territoire / « Près de chez moi »**,
à programmer après la datation du paquet C, et seulement si Denis valide le principe.
