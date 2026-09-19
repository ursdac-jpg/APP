# Chantier : « Affiner ma recherche » (recherche libre en deux temps du module Comprendre le cadre)

> Statut au 2026-09-06 : **conception, maquette faite, en attente de validation visuelle de Denis.**
> Rien à coder tant que la maquette n'est pas validée.
>
> Maquette : `docs/MAQUETTE_COMPRENDRE_LE_CADRE_RECHERCHE_LIBRE_2026-09-06.html`
> Mode : **A** (nouvel écran, UX, philosophie produit).

---

## D'où ça vient

Le module « Comprendre le cadre » a été construit en 7 étapes (début septembre 2026), toutes closes
et vérifiées. La maquette d'origine (`docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html`)
prévoyait, dans l'écran « Par où commencer ? », un **2e temps** : un champ libre où la personne
décrit sa situation avec ses mots, l'application prépare un texte de recherche, la personne le colle
chez un assistant en ligne.

Ce 2e temps **n'a jamais été construit** : l'étape 3 a été cadrée sur les seules cases à cocher, avec
une note écrite dans le code et dans `ARCHITECTURE_TECHNIQUE.md` : *« le récit libre en langage
courant, 2e temps de la maquette, reste hors périmètre de cette étape »* et, pour les outils
« Vérifier une information récente » / tableau des sources, *« à discuter avec Denis avant de les
faire »*. La discussion n'a pas eu lieu : le chantier de vérification des 14 rayons a enchaîné et a
été mené jusqu'à sa fin. **Ce n'est pas une décision produit, c'est un trou entre deux chantiers.**

Denis l'a rattrapé le 2026-09-06 et a demandé une version **plus développée** que la maquette
d'origine : pas seulement un tri de sujets, mais une vraie recherche en deux temps, sur le modèle du
Bilan et du Composeur.

---

## Le concept (décisions Denis 2026-09-06)

Sur l'accueil du module, sous les 14 rayons : le bouton **« Par où commencer ? » devient
« Affiner ma recherche »**. Il mène au même écran, enrichi.

### L'écran « Affiner ma recherche »
1. **Les 14 cases à cocher** restent (voie rapide, réponse immédiate déterministe, montre les rayons).
2. **Un champ libre** en dessous, précédé de l'encadré confidentialité (garde-fou Constitution :
   « n'écrivez pas votre nom, votre adresse, le nom de votre employeur ; décrivez la situation, pas
   les personnes ; rien n'est enregistré »).

### La recherche en deux temps
- **Prompt 1** (monté par le code à partir du texte libre + territoire connu) : demande à l'assistant
  de donner du sens à la demande, d'**organiser la réponse en sous-chapitres** (6 maximum : titre
  court + 2-3 lignes + domaine), et de **poser des questions de clarification** si des points sont
  ambigus. Format balisé (`[SUJET]…[/SUJET]`, `[QUESTION]…[/QUESTION]`) que le code relit, tolérant.
- **Écran des sous-chapitres + questions** : la personne coche les sujets qu'elle veut creuser, puis
  répond à un bloc questions **à deux origines fusionnées** :
  - (a) les questions posées par l'assistant, récupérées de sa réponse (peut être vide) ;
  - (b) les **questions de l'application, dans le code**. Décision Denis 2026-09-06 : elles **ne
    peuvent pas être les mêmes pour tous les sujets**. Il y a un petit jeu de questions **par
    rayon** (§ « Les questions du code », plus bas), plus 4 questions **toujours posées**
    (département pré-rempli, depuis combien de temps, démarche déjà entamée, caractère urgent). Le
    code affiche les questions des rayons auxquels appartiennent les sous-chapitres cochés + les 4
    universelles. Courtes, à choix simple quand c'est possible ; jamais de question sur le statut
    administratif, la santé, la situation familiale précise, les revenus chiffrés. Une réponse vide
    n'empêche jamais de continuer.
  - \+ un champ « autre chose à ajouter » facultatif.
- **Prompt 2** (monté par le code) : sujets cochés + réponses aux questions + contexte libre +
  territoire. Demande l'information concrète, la source officielle et la date, ce qui change souvent,
  les structures locales à contacter.
- **Écran résultat** : la réponse dans un cadre d'avertissement (« d'après l'assistant en ligne, à
  vérifier sur la source officielle, en [date] ; ce n'est pas un avis sur vous »). Liens vers les
  rayons concernés. Boutons « Nouvelle recherche » / « Revenir au module ».

### Garde-fous transverses
Jamais un rapport ni un diagnostic sur la personne ; toujours « d'après [source], en [date] » ;
« l'assistant en ligne », jamais « IA », jamais d'icône visage ; le texte libre de la personne n'est
jamais envoyé nulle part par l'application (c'est elle qui le colle). Rien transmis, rien tracé.

---

## Les 7 questions du chantier — toutes tranchées

| # | Question | Décision |
|---|---|---|
| 1 | Nom du bouton | **« Affiner ma recherche »** |
| 2 | On garde les cases à cocher sur cet écran ? | **Oui**, voie rapide en plus du champ libre |
| 3 | Un « sous-chapitre » = quoi ? Combien ? | titre + 2-3 lignes + badge domaine. **Plafond 6** |
| 4 | Questions obligatoires de l'appli | département (pré-rempli), ancienneté, démarche déjà faite, urgence. **Liste à confirmer visuellement** |
| 5 | Contexte libre en plus des réponses à l'étape 3 ? | **Oui, facultatif** |
| 6 | Persistance (module = famille 1, pas de reprise) | **Option A : rien n'est gardé.** Même si la personne sauvegarde sa session ailleurs dans l'application, cette recherche n'entre pas dans la sauvegarde. Raison (Denis) : on ignore le temps écoulé entre deux ouvertures et ce qui aura changé dans la loi ; une réponse ancienne ressortie telle quelle serait un risque réel. L'état vit en mémoire de page uniquement, jamais dans `localStorage`, jamais dans le fichier de session. **Message clair à la personne sur l'écran résultat** : « cette recherche n'est pas enregistrée ; si vous voulez la garder, copiez-la maintenant ». Aucune exception au principe famille 1 : c'est cohérent avec lui. |
| 7 | Un écran commun avec « Comprendre les chiffres » ? | **Non** : même brique de collage, **deux entrées** (droits/démarches ici, chiffres là-bas), deux jeux de prompts |

---

## Les questions du code : un jeu par rayon (brouillon, à relire par Denis)

Le `domaine` de chaque `[SUJET]` (renvoyé par le prompt 1) sert à choisir les questions à poser.
Quand un sous-chapitre coché relève d'un rayon, le code affiche les questions de ce rayon.

**Toujours posées** (les 4 universelles) : département (pré-rempli) · depuis combien de temps dans
cette situation · avez-vous déjà fait une démarche à ce sujet · est-ce urgent (une échéance).

| Rayon | Questions du code (brouillon) |
|---|---|
| Emploi et contrats | type de contrat (CDI, CDD, intérim, apprentissage) · en poste, ou contrat terminé / en cours de rupture · depuis combien de temps dans l'entreprise |
| Se former | salarié, demandeur d'emploi, ou sans activité · idée précise de formation ou vous cherchez encore · un diplôme ou juste des compétences |
| Accompagnement | inscrit à France Travail · déjà un conseiller ou un référent · percevez-vous le RSA |
| Créer son activité | projet précis ou vous explorez · demandeur d'emploi avec des droits au chômage · activité artisanale, commerciale, de services |
| Moins de 26 ans | quel âge · en études, en emploi, ou sans solution · avez-vous un diplôme |
| Handicap et emploi | une RQTH ou une demande en cours · en poste, en arrêt, ou en recherche. **Jamais de question sur le problème de santé lui-même.** |
| Venir de l'étranger | quelle information cherchée (séjour, travail, diplômes, permis, nationalité). **Jamais demander ni afficher le statut ; renvoi préfecture / OFII / permanence d'accès au droit.** |
| Justice : sortie de détention | encore en détention, en aménagement de peine, ou déjà sorti · un suivi par un SPIP |
| Budget, dettes, droits sociaux | dettes, découvert, refus de banque, ou aide d'urgence · déjà contacté un point conseil budget ou un travailleur social · percevez-vous le RSA |
| Mobilité | avez-vous le permis · un véhicule même en panne · besoin lié à un emploi précis (avec une date) ou général |
| Logement | locataire, hébergé, sans logement, menacé d'expulsion · déjà une dette de loyer · une demande de logement social déposée |
| Garde d'enfant | âge de l'enfant (moins de 3 ans, 3 à 6 ans, scolarisé) · élevez-vous seul votre enfant · besoin régulier, ponctuel, en horaires décalés |
| Apprendre le français | pour la vie quotidienne, pour un titre de séjour ou la nationalité, ou pour le travail · déjà passé un test ou suivi une formation |
| Questions juridiques | type de litige (employeur, administration, discrimination, autre) · un courrier officiel avec un délai · déjà consulté un point-justice ou un avocat |

Règle transverse : questions courtes, à choix simple quand c'est possible ; jamais sur la santé, la
situation familiale précise, les revenus chiffrés, le statut administratif. Les rayons **Handicap**,
**Venir de l'étranger** et **Justice** ont un garde-fou renforcé écrit dans le tableau : on interroge
le besoin, jamais la condition de la personne.

---

## Les prompts ne s'inventent pas : ils réutilisent l'existant

Décision Denis 2026-09-06 : **ne rien réinventer**. L'outil de veille (`outils/veille.html`,
`docs/VEILLE_PROMPTS.md`) a déjà des briques de prompt éprouvées. On les reprend telles quelles.

| Brique | D'où | Ce qu'elle apporte |
|---|---|---|
| `socleRecherche()` | `outils/veille.html` | date du jour, recherche web obligatoire, « n'utilise que des pages ouvertes », « ne fabrique jamais une adresse / un numéro / une date » (sinon « à vérifier »), sites qui bloquent → relais officiels |
| `TON` | `outils/veille.html` | « écris pour une personne réelle », phrases courtes, jamais condescendant, commence par le cas concret, développe chaque sigle, « ne conclus jamais à la place de la personne » |
| ligne « pas d'avis sur les personnes, pas de conseil, pas de ton alarmiste » | `docs/VEILLE_PROMPTS.md` | garde-fou Constitution, 1er principe |
| les 3 couches de territoire (national / régional / départemental, « ne mélange jamais les départements ») + nuance bassin d'emploi | maquette d'origine décision 9, `docs/VEILLE_PROMPTS.md` | l'ancrage local |
| le format balisé (`[SUJET]`, `[QUESTION]`, `[COLLECTE]`…) | `outils/veille.html` (`assemblerImport`, digests) | une réponse que le code sait relire, tolérant au bruit |

**Deux ajouts demandés par Denis** (2026-09-06), à intégrer dans `TON` ou à côté :
1. « **réponds toujours en français** » ;
2. « **reformule d'abord la demande de la personne** dans un français correct et clair, sans rien
   ajouter ni retirer » → bloc `[REFORMULATION]` renvoyé par le prompt 1, affiché à l'écran 3
   (« ce que l'assistant a compris de votre demande » + lien « ce n'est pas ça ? reprendre mon texte »).
   Répond au besoin exprimé par Denis : le public écrit souvent avec des fautes, on lui montre qu'on
   l'a bien compris avant de chercher.

**À décider au moment de construire** : soit extraire `TON` / `socleRecherche()` dans un petit
fichier partagé (une seule source de vérité, CLAUDE.md), soit faire de `docs/VEILLE_PROMPTS.md` la
référence écrite que l'outil **et** le module citent. Jamais une copie dispersée.

### Contenu de chaque prompt
- **Prompt 1** : `socleRecherche()` + `TON` (+ les 2 ajouts) + texte libre + territoire connu +
  « reformule, organise en 6 sous-chapitres max, pose des questions si besoin » + format balisé.
- **Prompt 2** : `socleRecherche()` + `TON` + sujets cochés + réponses aux questions (assistant +
  application) + contexte libre + territoire + « information concrète, source, date, structure locale ».

---

## Briques d'interface réutilisées (rien de neuf côté technique de fond)

- `htmlCollageInstantane` / `activerCollageInstantane` (js/app.js) : préparer un texte, choisir
  l'assistant, coller la réponse. Déjà partout dans l'application.
- `ASSISTANTS_IA` / `ASSISTANTS_SANS_COMPTE_IA` : les pastilles d'assistants.
- Le territoire : `CLE_DEPARTEMENT_RESSOURCES`, déjà lu par le module.
- `_comprendreLeCadreRenduDigestCorps` (modules/comprendre-le-cadre/index.js) : rendu markdown souple
  dans un cadre d'avertissement, déjà utilisé pour les digests Balayage/Chiffres du module.
- La charte visuelle : classes du module (`comprendre-le-cadre-*`), jamais de couleur inventée,
  mode sombre couvert, mêmes boutons que le reste de l'application.

Le neuf : l'écran 1 (champ libre + cases), le montage des deux prompts (assemblage de briques
existantes), la relecture des blocs `[REFORMULATION]` / `[SUJET]` / `[QUESTION]`, l'écran des
sous-chapitres + questions, et le message « rien n'est enregistré ».

---

## Ce qui reste à faire

1. **Denis relit le brouillon des questions par rayon** (§ ci-dessus) : chaque ligne, une par une.
   C'est le seul point encore ouvert de la conception.
2. Une fois validé : construction, probablement en 3 blocs :
   - bloc 1 : l'écran 1 (champ libre + cases + garde-fou) et le renommage du bouton ;
   - bloc 2 : le prompt 1, le collage, la relecture du format balisé, l'écran des sous-chapitres ;
   - bloc 3 : le bloc questions (par rayon + universelles + questions de l'assistant), le prompt 2,
     l'écran résultat avec le message « rien n'est enregistré ».
   Chaque bloc testé en navigateur, un commit par bloc.
3. `ARCHITECTURE_TECHNIQUE.md` du module : ajouter cette partie au tableau des étapes. Persistance =
   rien gardé, cohérent avec famille 1, à noter explicitement.
4. Penser en même temps l'entrée « question libre » de « Comprendre les chiffres » (même brique).

---

## Liens

- Maquette : `docs/MAQUETTE_COMPRENDRE_LE_CADRE_RECHERCHE_LIBRE_2026-09-06.html`
- Maquette d'origine du module : `docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html` (le 2e temps de l'orienteur, écran orienteur ; l'outil « Vérifier une information récente », écran 12)
- Architecture du module : `modules/comprendre-le-cadre/ARCHITECTURE_TECHNIQUE.md`
- Prompts de maintenance (privés, jamais montrés au public) : `docs/VEILLE_PROMPTS.md`
- Suites du module : `docs/COMPRENDRE_LE_CADRE_SUITES_2026-09-05.md`
