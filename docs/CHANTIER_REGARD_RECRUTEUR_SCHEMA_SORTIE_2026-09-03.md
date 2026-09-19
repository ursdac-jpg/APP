# Regard recruteur - schéma de sortie de l'assistant

> Écrit le 2026-09-03, après la validation de la maquette du parcours
> (`docs/MAQUETTE_REGARD_RECRUTEUR_PARCOURS_2026-09-03.html`, gelée).
> C'est le **contrat** : ce que l'assistant en ligne doit renvoyer, dans quelle forme.
> Le **prompt** et le **parser** en découlent tous les deux.
> Relu et **figé par Denis le 2026-09-03** (4 décisions de fin de doc tranchées, voir §8).
> Étape suivante : le prompt, puis le protocole de test.
>
> **NB maquette :** ce figeage retire l'axe « autres questions ». La maquette gelée
> (`MAQUETTE_REGARD_RECRUTEUR_PARCOURS_2026-09-03.html`) a été synchronisée le 03/09 :
> axe retiré, compteurs à **6 axes (4 sur le texte seul)**.
>
> Références : `docs/CHANTIER_REGARD_RECRUTEUR.md` (conception), la maquette gelée,
> `prompts/bilan-v1.md` et `prompts/regard-exterieur.md` (patrons de schéma stricts existants),
> `docs/LECONS_A_NE_PAS_REPRODUIRE.md` §1bis (un prompt par module, sortie bornée).

---

## 1. Principes (non négociables, à répéter dans le prompt)

1. **Aucune note, aucun score, aucun pourcentage, aucune jauge.** Jamais « retenu / rejeté »,
   jamais « convaincant / bon / mauvais / faible / insuffisant / trop », jamais un « niveau de certitude ».
2. **Chaque doute est une question ou un point à vérifier**, jamais un constat sur la personne
   ou sa valeur. Reformulation obligatoire (voir `CHANTIER_REGARD_RECRUTEUR.md` §2).
3. **Aucun jugement esthétique** : jamais « beau », « moderne », « élégant », « joli ». Uniquement
   des critères observables (densité, colonnes, contraste, taille, longueur...).
4. **Sortie bornée, axes fixes, un seul passage.** L'assistant ne choisit ni l'ordre ni les
   titres des axes : ils sont dans le code. Il remplit le contenu.
5. **Anonymisation jamais signalée comme un défaut.** Nom, photo, coordonnées ont été masqués
   volontairement : ne jamais signaler leur absence, nulle part.
6. **Ne rien inventer.** Si une information n'est pas dans le CV fourni, l'assistant le dit,
   il ne comble pas.
7. **Citations courtes.** `constat` peut citer un extrait du CV entre guillemets, jamais une
   longue portion (quelques mots).
8. **Rappel systématique** : « certains recruteurs pourraient », « pourrait » ; tous les
   recruteurs ne réagissent pas pareil. (Ce rappel est **fixe dans le code**, pas dans la sortie.)

---

## 2. Ce que l'application fournit à l'assistant (entrée, pas sortie)

Injecté dans le prompt avant la consigne :

| Champ | Valeurs | Rôle |
|---|---|---|
| `modeAnalyse` | `"image"` \| `"texte"` | En `texte`, l'assistant ne dispose pas de la page : les axes `presentation` et `couleurs` sont **hors sujet** (voir §4). |
| `posteVise` | texte libre ou vide | Cadre l'analyse sur ce qu'un recruteur de CE poste regarderait. |
| `entreprise` | texte libre ou vide | |
| `texteOffre` | texte libre ou vide | |
| `typeStructure` | valeur de `BILAN_TYPES_STRUCTURE` ou vide | Ajuste le registre attendu (associatif / privé / public...). |
| `siteEntrepriseFourni` | `true` \| `false` | Si `false`, l'assistant **n'émet aucun avis** sur la reprise des codes visuels de l'entreprise (le CV ne contient que le nom). |
| `couleursEntrepriseConnues` | liste de couleurs ou vide | Si l'app les connaît déjà (via Découverte ou le site). |
| Le CV | image(s) jointe(s) en mode `image` ; texte collé en mode `texte` | 1 à 3 images. |

---

## 3. Le schéma de sortie

L'assistant renvoie **un seul bloc JSON**, précédé si besoin d'aucun texte (le parser sait
extraire le bloc, mais le prompt demande « uniquement le JSON, sans introduction »).

```json
{
  "modeAnalyse": "image",

  "analyseImpossible": false,
  "messageAnalyseImpossible": "",

  "cvCourt": false,
  "messageCvCourt": "",

  "syntheseOuverture": "En quelques secondes, un recruteur voit d'abord un profil d'accueil clair et polyvalent. Il pourrait s'arrêter sur le niveau de responsabilité réel des dernières expériences, et une page assez dense en bas.",

  "axes": [
    {
      "id": "positif",
      "afficher": true,
      "points": [
        { "titre": "", "constat": "La hiérarchie est claire : on distingue tout de suite les titres du reste.", "lecture": "", "piste": "" },
        { "titre": "", "constat": "Les intitulés de postes sont visibles et faciles à repérer.", "lecture": "", "piste": "" }
      ]
    },
    {
      "id": "coherence",
      "afficher": true,
      "points": [
        {
          "titre": "Emploi ou stage ?",
          "constat": "Votre CV indique « à la recherche d'un stage ». L'offre visée est un poste en contrat.",
          "lecture": "Un recruteur peut hésiter sur ce que vous cherchez vraiment. Ce point peut faire écarter une candidature avant l'entretien.",
          "piste": "Adapter l'objectif du CV au poste visé."
        },
        {
          "titre": "Le titre et la phrase d'accroche",
          "constat": "Titre : « Agent polyvalent ». Accroche : « Motivé et dynamique... »",
          "lecture": "Le titre et l'accroche pourraient convenir à beaucoup d'offres ; le lien avec ce poste n'est pas immédiat.",
          "piste": "Un titre proche de l'intitulé de l'offre, une accroche qui dit en une phrase ce que vous savez faire, pour quel poste, avec un élément concret."
        },
        {
          "titre": "Les dates et les chevauchements",
          "constat": "Deux expériences se chevauchent sur 2022. Une période n'a pas de dates.",
          "lecture": "Un recruteur ne conclut pas : il note et pourra poser la question. Un chevauchement peut être normal.",
          "piste": "Vérifier les dates. Préparer une phrase courte qui l'explique, sans se justifier."
        }
      ]
    },
    {
      "id": "message",
      "afficher": true,
      "points": [
        {
          "titre": "Le registre de langage",
          "constat": "Vous employez souvent : « accompagnement du public », « dynamique de projet », « valeurs de solidarité ».",
          "lecture": "Un vocabulaire de l'action sociale. L'offre est dans une entreprise privée, où l'on attend plutôt ce que vous avez géré, avec quels résultats, quels outils.",
          "piste": "Garder ce que vous avez fait, le dire dans les mots du secteur : « accueil de 60 personnes par jour, gestion des rendez-vous sur logiciel »."
        },
        {
          "titre": "Les logiciels et les outils que vous nommez",
          "constat": "Votre CV mentionne « outils de bureautique » et « logiciel de gestion », sans les nommer.",
          "lecture": "Pour un métier de bureau, nommer précisément les logiciels est un signal fort et rassurant.",
          "piste": "Remplacer les termes vagues par les noms réels, préciser ce que vous en faisiez. Ne nommer que ce que vous savez utiliser."
        },
        {
          "titre": "Quelles expériences vous mettez en avant",
          "constat": "En premier : un poste de vendeur. Plus bas : un engagement associatif de deux ans. Le CV liste aussi 6 expériences courtes très variées.",
          "lecture": "Vous candidatez dans l'associatif ; l'engagement bénévole parle plus directement de ce milieu. Un CV qui liste beaucoup d'expériences différentes peut noyer ce qui compte pour ce poste.",
          "piste": "Remonter en premier les 3 ou 4 expériences qui appuient cette candidature. Regrouper le reste dans un bloc « Autres expériences » en bas. Un parcours varié montre une vraie capacité d'adaptation : c'est une force à assumer."
        },
        {
          "titre": "La rubrique loisirs et centres d'intérêt",
          "constat": "Votre CV indique : « football, lecture, cuisine ».",
          "lecture": "Un recruteur n'y compte pas les activités : il y lit un savoir-être. « Football » seul dit peu ; « football en club, capitaine d'équipe » dit travail d'équipe, engagement, responsabilités.",
          "piste": "À côté de chaque activité, une courte mention de ce qu'elle développe. Ces qualités se transposent au poste : à vous de faire le lien."
        },
        {
          "titre": "Généraliste ou ciblé",
          "constat": "Le CV semble écrit pour plusieurs types de postes à la fois.",
          "lecture": "Un recruteur peut se demander si vous visez vraiment celui-ci.",
          "piste": "Mettre en avant en premier ce qui parle à ce poste ; le reste peut rester, plus court, plus bas."
        }
      ]
    },
    {
      "id": "premiere-lecture",
      "afficher": true,
      "points": [
        {
          "titre": "",
          "constat": "Le titre du poste ressort en haut. Le CV est sur deux colonnes. La première page respire, la seconde est plus chargée.",
          "lecture": "La lecture peut demander plus d'allers-retours du regard entre les deux colonnes ; le bas du CV peut être parcouru plus vite.",
          "piste": "Les informations les plus importantes (postes, dates) sont-elles toutes sur la première page ou dans la première colonne ?"
        }
      ]
    },
    {
      "id": "presentation",
      "afficher": true,
      "points": [
        { "titre": "Mise en page", "constat": "Deux colonnes.", "lecture": "La lecture peut demander davantage de mouvements du regard.", "piste": "À vérifier une fois le document imprimé." },
        { "titre": "Densité", "constat": "Texte dense en bas de la seconde page, peu de blancs.", "lecture": "Une partie peut être parcourue vite.", "piste": "" },
        { "titre": "Hiérarchie", "constat": "Titres bien distincts du corps du texte.", "lecture": "Facilite le repérage.", "piste": "" },
        { "titre": "Longueur", "constat": "Deux pages.", "lecture": "", "piste": "Chaque information mérite-t-elle sa place, ou peut-on resserrer ?" },
        { "titre": "Police et taille du texte", "constat": "Le texte semble écrit petit, sans doute pour tout faire tenir.", "lecture": "Un recruteur pressé qui doit forcer pour lire met le CV de côté « pour plus tard » - et le plus tard ne vient pas.", "piste": "Une police simple et une taille confortable comptent plus qu'une police travaillée." }
      ]
    },
    {
      "id": "couleurs",
      "afficher": true,
      "points": [
        {
          "titre": "Combien de couleurs, et comment",
          "constat": "Votre CV utilise quatre couleurs : un bleu, un orange, un vert et du gris.",
          "lecture": "Au-delà de deux couleurs, un CV paraît vite chargé, et ce n'est pas apprécié. L'idéal : une couleur principale et, si besoin, une seule autre pour souligner, les deux allant bien ensemble. Éviter les couleurs très vives et les contrastes agressifs.",
          "piste": "Revenir à deux couleurs au maximum. Garder le bleu comme couleur principale, retirer l'orange et le vert."
        },
        {
          "titre": "Les codes visuels de l'entreprise",
          "constat": "Le bleu de votre CV est proche de celui du site de l'entreprise.",
          "lecture": "Certains recruteurs y voient un signe d'intérêt ; d'autres y sont indifférents et préfèrent une présentation neutre. Ce n'est jamais une obligation, la lisibilité passe avant.",
          "piste": ""
        }
      ]
    }
  ],

  "questionsLieesAuCv": [
    {
      "question": "Qu'avez-vous fait pendant la période 2020-2021 ?",
      "origine": "Aucune expérience ni formation datée sur cette période.",
      "ceQueLeRecruteurCherche": "Comprendre un trou ou un chevauchement, sans en faire un problème.",
      "commentYRepondre": "Une phrase courte, factuelle, tournée vers ce que vous avez appris ou fait."
    },
    {
      "question": "Votre CV parle surtout d'associatif ; qu'est-ce qui vous attire dans notre secteur ?",
      "origine": "Registre et expériences majoritairement associatifs, offre en entreprise privée.",
      "ceQueLeRecruteurCherche": "Si votre intérêt pour ce secteur est réfléchi, ou si vous postulez un peu partout.",
      "commentYRepondre": "Ce qui vous relie concrètement au poste (compétences, envies), sans renier votre parcours."
    }
  ]
}
```

> Le tableau `questionsLieesAuCv` est **classé par ordre d'importance décroissante** par l'assistant
> (le prompt le demande). Le code affiche les **5 premiers** (voir §4).
> `pointsARetenir` **n'est plus dans la sortie de l'assistant** : le code le construit à partir des
> `piste` non vides des axes (voir §7).

---

## 4. Bornes et règles par champ

| Champ | Type | Bornes / règles |
|---|---|---|
| `modeAnalyse` | string | Doit reprendre la valeur fournie en entrée. |
| `analyseImpossible` | booléen | `true` **uniquement** si le CV fourni ne permet d'identifier **aucun** contenu de CV exploitable (texte incompréhensible, image illisible, ce n'est pas un CV). Sinon `false`. |
| `messageAnalyseImpossible` | string | Rempli **seulement si** `analyseImpossible` = `true`. Une phrase courte, bienveillante, sans reproche. Sinon `""`. |
| `cvCourt` | booléen | `true` si le CV est réel mais très maigre (une seule expérience, quelques lignes, début de parcours). La lecture reste faite, mais partielle. |
| `messageCvCourt` | string | Seulement si `cvCourt` = `true`. Phrase encourageante (« votre CV est encore court, la lecture est forcément partielle - c'est normal à ce stade »). |
| `syntheseOuverture` | string | 1 à 3 phrases. En mode `texte` : « en parcourant vite le texte... ». Jamais un jugement global, jamais une note. |
| `axes` | tableau | **Exactement 6 objets**, dans cet ordre d'`id` : `positif`, `coherence`, `message`, `premiere-lecture`, `presentation`, `couleurs`. |
| `axe.afficher` | booléen | `false` = rien à dire sur cet axe. **Toujours `false`** pour `presentation` et `couleurs` quand `modeAnalyse` = `"texte"` (il reste alors **4 axes** : positif, coherence, message, premiere-lecture). Si `afficher` = `true` mais `points` vide, le code traite comme `false`. |
| `axe.points` | tableau | Voir bornes par axe ci-dessous. |
| `point.titre` | string | Sous-titre du point. `""` autorisé (axes `positif`, `premiere-lecture`). |
| `point.constat` | string | L'observation. Peut citer un extrait court du CV entre guillemets. Obligatoire (jamais `""`). |
| `point.lecture` | string | Comment un recruteur le lit / ce qu'il en fait. Obligatoire sauf axe `positif` (où `""` est permis). |
| `point.piste` | string | Piste concrète ou reformulation. Toujours optionnelle (`""` permis). Jamais un ordre (« vous devez »), toujours une proposition. |
| `questionsLieesAuCv` | tableau | **Viser au moins 5.** Le tableau est **classé par importance décroissante**. Le parser accepte 0 à 8 objets ; **le code n'en affiche que les 5 premiers**. Si le tableau est vide, le bloc « Questions liées à votre CV » ne s'affiche pas (les 5 questions générales, elles, sont dans le code et s'affichent toujours). |
| `question` | string | Formulée comme un recruteur la poserait, à l'oral. |
| `origine` | string | **Obligatoire.** L'élément précis du CV qui motive la question. Non affiché (ou affiché en petit « tirée de : ... »). Sert de garde-fou anti-invention : une question sans origine claire dans le CV ne doit pas être proposée. |
| `ceQueLeRecruteurCherche` | string | L'attente réelle derrière la question. Obligatoire. |
| `commentYRepondre` | string | Piste de préparation. Obligatoire. |

### Bornes par axe

| `id` | `afficher` conditionnel | `points` : nombre | Forme des points |
|---|---|---|---|
| `positif` | jamais masqué (viser 2 minimum, même sur un CV pauvre) | 2 à 5 | `constat` seul ; `titre` = `""`, `lecture`/`piste` = `""` |
| `coherence` | masqué si rien à signaler | 0 à 3 | Un point par sujet parmi : objectif emploi/stage · titre + accroche · dates/chevauchements. Chacun avec `titre`, `constat`, `lecture`, `piste`. |
| `message` | masqué si rien à signaler | 0 à 5 | Un point par sujet parmi : registre de langage · logiciels/outils nommés · expériences mises en avant · rubrique loisirs · généraliste ou ciblé. |
| `premiere-lecture` | jamais masqué (sauf `analyseImpossible`) | **exactement 1** | `constat` = ce que le recruteur voit (mode image) / retient en parcourant (mode texte) ; `lecture` = effet possible ; `piste` = ce qui mérite d'être vérifié. |
| `presentation` | `afficher: false` en mode texte | 3 à 6 | Un point par critère : mise en page · densité · hiérarchie · longueur · police et taille · (couleurs : voir axe `couleurs`, pas ici). Chacun un mini « 3 temps ». |
| `couleurs` | `afficher: false` en mode texte | 1 à 2 | Point 1 « Combien de couleurs » : toujours si mode image. Point 2 « Les codes visuels de l'entreprise » : **seulement si `siteEntrepriseFourni` = `true`**. |

---

## 5. Règle d'aiguillage (éviter les doublons entre axes)

Un même élément du CV ne va **que dans un seul endroit** :

- **Un problème de dates ou de chevauchement** → axe `coherence` (point « dates »).
- **Le titre et l'accroche** → axe `coherence` (cohérence CV ↔ offre ↔ contenu, pas « message »).
- **L'objectif du CV (emploi / stage) qui ne colle pas au poste** → axe `coherence`.
- **Le registre de langage, les logiciels nommés, la hiérarchie des expériences, la rubrique loisirs, le ciblage** → axe `message`.
- **Un trou dans le parcours, une mission peu détaillée, un point que le recruteur voudra creuser à l'oral** → `questionsLieesAuCv` (avec son `origine`). Pas ailleurs.
- **Ce que le recruteur voit / retient dans les 10 premières secondes** → axe `premiere-lecture` (1 point).
- **Tout ce qui concerne la page réelle** (colonnes, densité, hiérarchie, police, longueur) → `presentation`.
- **Tout ce qui concerne les couleurs** → `couleurs`.

Si une observation ne rentre dans aucun de ces cas, l'assistant **ne l'invente pas** : il n'y a
plus d'axe « fourre-tout ». Le prompt porte cette règle explicitement.

---

## 6. Drapeaux dégradés et comportement du parser

| Situation | Détection | Ce que fait le code |
|---|---|---|
| L'assistant a répondu, mais dit que ce n'est pas un CV exploitable | `analyseImpossible` = `true` | Écran dédié « on n'a pas réussi à exploiter votre CV » (exemples, encouragement, « réécrivez / redéposez »). Jamais le rapport. |
| CV réel mais très maigre | `cvCourt` = `true` | Le rapport s'affiche + `messageCvCourt` en tête. Les axes peu remplis sont simplement masqués (`afficher: false`). |
| Réponse illisible : pas de bloc JSON, JSON tronqué, l'assistant a commenté la consigne au lieu de la suivre | Le parser ne trouve pas de JSON valide | Écran `erreur-lecture` (déjà dans la maquette) : phrase prête à recoller, recoller, autre assistant. |
| Un axe a `afficher: true` mais `points: []` | Après parsing | Traité comme `afficher: false`. |
| `questionsLieesAuCv` vide | Après parsing | Le bloc 2 de « Décoder » ne s'affiche pas ; le bloc 1 (5 questions fixes) reste. |
| `questionsLieesAuCv` avec plus de 5 objets | Après parsing | Le code affiche les **5 premiers** (le tableau est déjà classé par importance). |
| Une `questionLieeAuCv` sans `origine` (vide) | Après parsing | Le point est **retiré** (garde-fou anti-invention : pas d'ancrage clair dans le CV). |
| Construire `pointsARetenir` | Après parsing | Le code prend les `piste` non vides des axes, dans l'ordre `coherence` > `message` > `presentation` > `couleurs`, dédoublonnées, plafonnées à 6. Si aucune : « Rien d'urgent à changer, votre CV est déjà lisible. » |
| Mots interdits dans un champ texte (« score », « note », « retenu », « faible »...) | Assainisseur au parsing | Signalé en interne (événement Umami), le champ est gardé tel quel (on n'essaie pas de réécrire l'assistant) ; à surveiller sur les tests. |
| Tiret cadratin / demi-cadratin dans un champ texte | Assainisseur | Remplacé par un tiret court (patron `bilanAssainirTypographie`). |

---

## 7. Ce qui reste FIXE dans le code (jamais dans la sortie de l'assistant)

- Les **titres et l'ordre des 6 axes**, leurs icônes.
- Les **5 questions générales** de « Décoder » + leur « ce que le recruteur cherche » + « comment y répondre ».
- **`pointsARetenir`** (« À retenir pour votre prochain CV ») : **construit par le code** à partir
  des `piste` non vides des axes (jamais produit par l'assistant).
- L'**encart « appropriation du CV »**, la **ligne « tenue d'entretien »**, la carte **« vos coordonnées sur le CV que vous enverrez »**.
- Le **rappel « ce sont des pistes, pas des vérités »**, le rappel « notre lecture est limitée ».
- Le **garde-fou « sans le site de l'entreprise, pas d'avis sur les codes visuels »**.
- La **phrase de secours** de l'écran `erreur-lecture`.
- Les **boutons** (Garder comme Repère, triage, imprimer, exporter).

---

## 8. Décisions figées par Denis le 2026-09-03

1. **`pointsARetenir`** : **construit par le code** à partir des `piste` des axes, jamais produit
   par l'assistant. Zéro risque d'invention, la fiche ne peut pas diverger du rapport.
2. **Axe « autres questions » : supprimé.** On passe à **6 axes** (4 sur le texte seul). Avec
   `coherence` et `message`, chaque observation a un axe naturel ; plus d'axe fourre-tout. Si un
   besoin réel apparaît en test, on remettra un axe filet à plafond bas.
3. **`questionsLieesAuCv`** : viser 5, classées par importance par l'assistant, **le code affiche
   les 5 premières**. 5 + 5 générales = 10 sujets, le maximum raisonnable à préparer.
4. **`origine`** : champ **obligatoire**, garde-fou anti-invention. Une question sans origine
   claire dans le CV est retirée. Affichage discret (« tirée de : ... ») à décider à l'implémentation.

## 9. Suite

1. ✅ **Prompt écrit et revu** : `prompts/regard-recruteur.md` (2026-09-03, format aligné sur `prompts/ats.md`).
   3 regards, adaptation au secteur, règle d'aiguillage, garde-fous, classement de
   `questionsLieesAuCv`, mode image / texte, site entreprise conditionnel.
   **Relecture faite (12 corrections)** : tirets cadratins retirés ; garde-fou « rectangles de
   masquage jamais un défaut » (règle absolue 5) ; consigne « aucun contexte fourni » ; secteur
   déduit de poste + offre (pas de type de structure) ; `origine` = description, pas citation ;
   `positif` : 1 point vrai plutôt que 2 forcés ; `piste` infinitif ou conditionnel ; « Ton »
   en section dédiée ; 3 regards remontés dans les règles absolues ; `questionsLieesAuCv` = 5
   (jusqu'à 8) ; mode image = `{CV_TEXTE}` vide.
   **Relecture faite le 2026-09-08 (5 retouches, croisée avec le parser et le schéma)** :
   A1 §2 mode image = `{CV_TEXTE}` porte une mention (le code n'y met plus rien de vide) ;
   A2 §5 les quatre champs d'une question sont obligatoires (le parser ne filtrait que sur
   `question` + `origine`, l'écran affichait sinon l'`origine` interne à la place de
   `ceQueLeRecruteurCherche`) ; B1 règle absolue 5 = rectangles de masquage jamais comptés
   comme une couleur du CV ; B2 §9 = ne jamais laisser les `« ... »` du gabarit ;
   C1 en-tête = liste des assistants alignée sur l'app (Mistral / Perplexity, pas Copilot).
   **Dernière relecture par Denis, puis test.**
2. ✅ **Protocole de test écrit** : `docs/PROTOCOLE_TEST_PROMPT_REGARD_RECRUTEUR_2026-09-03.md`
   (6 cas tour 1 + 4 cas d'extension, grille à 7 critères, fiche de test). **Denis fait tourner.**
   Zones d'ombre à juger sur de vrais CV (pas des corrections) : §3 « adaptation au secteur »
   écrit à la main (recherche par secteur non faite) ; `premiere-lecture` en 1 seul point ;
   recouvrement `message` ↔ ATS ; variabilité du jugement visuel (passer le même CV 2-3 fois).
3. Le **parser** et les **écrans** sont construits (chantier clos le 2026-09-08,
   `modules/regard-recruteur/`) ; l'extraction du socle commun détachable reste un chantier séparé.
4. ✅ **Sync maquette faite le 03/09** : axe « Points qui peuvent susciter d'autres questions »
   retiré, compteurs passés à 6 axes (4 sur le texte seul).
