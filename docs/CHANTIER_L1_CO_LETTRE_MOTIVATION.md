# Chantier — refonte du prompt de « Co-construire ma lettre de motivation » (L1)

> Ouvert le 2026-09-07. Mode A. Concepteur : Denis. Traité un bloc à la fois, `npm test` +
> navigateur à chaque sous-étape, un commit par sous-étape.
>
> Ce document est le **contrat figé** du chantier. Il ne se substitue pas aux fichiers de
> référence ; il rassemble ce qui a été décidé pour ne rien perdre entre deux sessions (et entre
> les deux comptes Claude du projet).

---

## 1. Le constat

Il existe **quatre parcours** lettre / entretien, qui forment une grille cohérente :

| | Carte dédiée (acte volontaire, on prend le temps) | Pipeline candidature (dans la foulée du CV, on va vite) |
|---|---|---|
| **Lettre** | **L1** — Co-construire ma lettre (route `co-lettre`) | **L2** — volet lettre de « Préparer ma lettre et mon entretien » (mode `pret`) |
| **Entretien** | **E1** — Préparer un entretien (route `prepa-entretien`) | **E2** — volet entretien du pipeline (mode `pret` / `maj`) |

Prompts : L1 = `prompts/lettre-v1.md` (ancien) ; L2 = `prompts/lettre.md` (V2) ; E1 =
`prompts/entretien.md` (coaching long) ; E2 = `prompts/entretien-accueil.md` (court).

**L2, E1, E2 forment déjà un système cohérent** : ils reçoivent `texteProfil()`, ne reposent pas
les questions dont la réponse est connue, et leur profondeur est adaptée au contexte (décision v3
point 17, actée le 2026-09-03 : carte dédiée = en profondeur, pipeline = rapide).

**Seul L1 est en dehors du système** : il tourne sur l'ancien paradigme (« Start », ~31 questions
scriptées en 7 groupes A-G, notes /10, commandes « je ne sais pas / je passe / STOP »), il ne
reçoit **rien** du dossier (la personne colle son CV directement dans la conversation, cf.
`js/app.js` ~ligne 23070), et il déborde sur l'entretien (conseil d'entretien + 3 questions
pièges livrés en fin d'échange).

---

## 2. Décidé (contrat figé)

1. **On garde les 4 parcours.** Aucune carte supprimée, aucun renommage.
2. **Seul L1 est refait.** L2, E1, E2 ne bougent pas. Seule retouche ailleurs : une ligne
   d'affichage sur E1 et sur L1 pour rendre la complémentarité visible (voir §5).
3. **Les écrans de l'app de L1 ne changent pas** (intro → dépôt CV → choix de l'assistant →
   coller la réponse). Ce qui change : le texte copié à l'étape « choix de l'assistant » et le
   prompt lui-même.
4. **Nouveau prompt L1** : reçoit `texteProfil('lettre')` + la stratégie CV déjà engagée (comme
   L2 et E1). **Ne redemande jamais un fait présent dans le profil.** Il peut, avec parcimonie,
   demander *quoi faire* d'un fait connu (le mettre en avant ou non, dans quel ordre), uniquement
   quand la réponse modifie réellement le texte produit. Un fait non pertinent pour ce poste
   n'est pas évoqué.
5. **Structure des questions : noyau fixe + couche variable** (voir §4).
   - Garde-fous : fourchette annoncée (en général 6 à 12 questions) ; vérification finale
     silencieuse de la couverture (avant de rédiger, l'assistant repasse chaque sujet
     obligatoire ; si un sujet n'est ni dans le profil ni dans une réponse, il pose la question
     manquante avant de continuer).
6. **On conserve l'esprit du travail de Denis** : le mécanisme « je ne sais pas → au moins 5
   suggestions différentes, classées par pertinence » est repris **mot pour mot**. Les
   explications et le fait de laisser la personne choisir sont conservés.
7. **On coupe de L1** :
   - la préparation d'entretien et les 3 questions pièges (rôle de E1 / E2) ;
   - **toutes les notes** (note du CV /10, note de la lettre /10, commandes `note` et `détails`).
     Décision Denis 2026-09-07 : le principe général d'ERIP est **sans notes**. On ne reloge pas
     ces notes ailleurs, on les supprime. L'évaluation vit dans « Regard recruteur », « Analyser
     ma candidature », etc., pas ici.
8. **Sortie de L1** (décision Denis 2026-09-07) : **une version longue + une version courte**,
   de **natures différentes**.
   - **Version longue** (`texte`) : la lettre complète. Elle doit **impérativement tenir sur
     une seule page A4**, police jamais inférieure à 10 pt. Contrainte portée par le prompt
     (sélection resserrée des arguments, reprise mot pour mot de la consigne de `lettre.md`
     § « Stratégie de longueur ») **et** garantie par le gabarit d'export (voir §5ter). La
     personne la **visualise dans l'application** (aperçu mis en page, mêmes modèles que L2),
     l'**imprime** et l'**enregistre** (DOCX).
   - **Version courte** (`texteCourt`) : **texte seul, sans mise en page**, destiné à être
     collé dans le **corps d'un e-mail** (avec le CV en pièce jointe). C'est sa seule raison
     d'être : sans cet usage « corps de mail », une version courte n'a pas de sens. Lettre
     autonome et complète (formule d'appel, développement resserré, formule de politesse),
     jamais un extrait tronqué de la longue. Cible ≈ 800 à 900 caractères. La personne la
     **visualise en texte**, la **copie** (bouton « Copier le texte »), et peut
     l'**enregistrer** en .txt.
9. **Validation** : test sur 3 à 4 vrais CV (profil riche, profil maigre, reconversion, premier
   emploi) avant mise en ligne — on compte et on lit les questions réellement posées, on ajuste
   la liste obligatoire ou la fourchette si besoin. Protocole identique aux tests `bilan-v1`.
   Test navigateur obligatoire (clair + sombre). `js/app.js` et `data/metiers.js` ne sont pas
   couverts par les tests Node.

---

## 3. Parcours L1 actuel (référence, ne change pas)

Écran d'avant : accueil / Boîte à outils / fiche métier → « Co-construire ma lettre de
motivation ».

| # | Écran (fonction) | Contenu | Ce qui part à l'assistant |
|---|---|---|---|
| 1 | Intro (`_coLettreRendreIntro`) | présentation du module ; encart Continuer / Recommencer si une lettre existe déjà | rien |
| 2 | Votre CV (`_coLettreRendreDepot`) | dépôt fichier (PDF, Word, .txt, photo, scan) ou « coller le texte » ; photo/scan → éditeur d'image pour masquer | rien |
| 3 | Choisir mon assistant (`_coLettreRendreChoixAssistant`) | liste d'assistants + confidentialité | **le prompt** copié dans le presse-papiers (aujourd'hui `lettre-v1.md` seul) |
| 3b | Écran tampon (`ouvrirFenetreAssistantIA`, partagé) | « Avant de continuer » : étapes, décompte 5 s | ouvre l'onglet de l'assistant |
| 4 | Coller la réponse (`_coLettreRendreReponse`) | zone de collage instantané ; bouton « Copier mon CV » ; génération DOCX | rien ne repart ; le JSON de l'assistant est importé dans `dossier.ia.lettre` |

Après le nouveau prompt : à l'étape 3, on copie **le nouveau prompt + `texteProfil('lettre')` +
la stratégie CV**, comme le fait déjà L2 / E1.

### 3ter. Écran 2 devient une page dépliante — briques existantes uniquement (décision Denis 2026-09-07)

Denis : « récupérer un maximum de fenêtres qui existent déjà », tout sur **une seule page**, y
compris un **bloc conséquent sur l'entreprise** (la lettre s'adresse à une entreprise précise).
Modèle direct : la dépliante de « Préparer ma lettre et mon entretien » (`_prepLERendreDepot`,
`data/metiers.js`). Écran 2 refait à l'identique de ce patron :

| Bloc | Contenu | Brique (rien de neuf) |
|---|---|---|
| 1 · Votre CV | dépôt fichier / coller le texte ; repli photo-scan | `obtenirOuDeposerTexteCV()` ; `ouvrirAssistantDepotCV()` |
| 2 · Relire, vérifier, masquer | relecture + masquage nom / adresse / téléphone / liens | `bilanDemanderRelectureCv()` + `relectureConfidentialite.js` |
| 3 · Le poste que vous visez (facultatif) | intitulé du poste ou du domaine | même champ que le bloc 3 de L2 |
| 4 · L'entreprise et le recruteur (facultatif) | entreprise ciblée, site, offre (lien ou texte), type de structure, **civilité et nom du recruteur** | `bilanCorpsCiblageOffreHTML()` + `bilanCablerCiblageOffre()` + `bilanLireCiblageOffre()` ; `contenuCiviliteRecruteurCandidature()` + `wireCiviliteEtCouleurRecruteurCandidature()` |

Tout est facultatif sauf le CV déposé et relu. Les blocs 3 et 4 écrivent dans
`dossier.rechercheCandidature` (mêmes champs que partout ailleurs). La couleur d'entreprise
(`contenuCouleurEntrepriseCandidature()`) n'est **pas** reprise ici : c'est une donnée de CV, pas
de lettre.

### 3quinquies. Chrome du module : à conserver à l'identique (rappel Denis 2026-09-07)

Rien de nouveau à écrire ici, **tout existe déjà sur L1** depuis le chantier « élimination des
fenêtres de dépôt CV » (2026-09-04) et l'audit RC-03 (2026-09-07, commits `f74381c` / `6797841`).
La refonte **conserve** :

- **Bouton « Revoir la présentation »** (bande partagée `_coLettreBandePresentation()` /
  `_coLettreBrancherBandePresentation()`), sur **chacun des écrans de travail** (2, 3, 4), même
  place, même libellé, même note première fois. Détour non destructif : `_coLettreVoirPresentation()`
  ouvre l'intro par-dessus, `_coLettreRevenirModule()` revient à l'écran quitté.
- **Encart « Continuer / Recommencer »** sur l'intro quand une lettre existe déjà
  (`_introBlocReprise`), avec « Recommencer » fond saumon et confirmation qui nomme ce qui part.
- **Barre du bas « Retour » + « Accueil »** (`barreNavigation('cv', null, null, {onclickPrecedent})`)
  sur chaque écran de travail.
- **Chaîne « Retour » RC-03** (à re-tester après la mise en dépliante de l'écran 2) :

  | Écran | « Retour » de la barre du bas mène à |
  |---|---|
  | 2 · Préparer (dépliante) | `_coLettreRetourIntro()` : l'intro en mode **normal** (pas détour), pour que le « Retour » de l'intro continue ensuite vers l'accueil de la carte. **Ne pas** rebrancher sur `_coLettreVoirPresentation()` (créerait la boucle dépôt <-> intro corrigée le 2026-09-07). |
  | 3 · Choisir mon assistant | `_coLettreRetourDepot()` : l'écran 2, sans rien détruire (CV déposé conservé) |
  | 4 · Coller la réponse | `_coLettreRetourChoixAssistant()` : l'écran 3 (permet de repartir avec un autre assistant) |
  | Intro (normale) | son propre « Retour » va vers l'accueil de la carte (`carteRetour: 'preparer'`) |
  | Intro (en détour) | « Revenir au module » revient à l'écran de travail quitté |

  Non destructif partout : `_coLettreDocument` (le CV) n'est jamais effacé par un « Retour ».

### 3quater. « Changer de modèle » — précision (question de Denis)

« Changer de modèle » = choisir **l'habillage visuel** de la lettre (police, marges, en-tête).
Ce n'est **pas** là que vivent les deux versions : la version longue et la version courte sont
deux **contenus** produits par l'assistant. Le modèle, lui, est la mise en forme, et il ne
s'applique qu'à la version longue. **Aujourd'hui il n'existe qu'un seul modèle de lettre**
(« Sobre », `MODELES_LETTRE_DISPONIBLES` dans `modules/lettre-editor/modelesDisponiblesLettre.js`)
— donc aucun choix à présenter pour l'instant. Le carrousel (`construireCarrouselModeles('lettre',
...)`) est prêt si un deuxième modèle est ajouté un jour. À l'écran 4, ne rien afficher de plus
qu'un aperçu + Imprimer + Enregistrer en DOCX.

---

## 4. Cahier des charges du nouveau prompt — questions

Base : les 7 groupes de `prompts/lettre-v1.md`, reclassés selon ce que `texteProfil()` contient
déjà (identité, expériences pro + perso, compétences, formations, langues, permis + véhicule
(« Mobilité »), loisirs, certifications, métier / secteur visé, objectif = type de candidature,
entreprise / site / offre, civilité du recruteur, disponibilités, type de contrat, situation
actuelle, + stratégie CV : accroche, points forts, mots-clés, expériences mises en avant, loisir
retenu).

### 4.1 Noyau fixe — presque toujours posé (jamais fiable dans le profil, et décisif)

1. **Motivation réelle, dans vos mots** : pourquoi ce métier / ce poste ? (fusion C1 + C3 de
   l'ancien prompt ; demander un classement si plusieurs raisons).
2. **Pourquoi cette entreprise précisément ?** (C2) — posée seulement si une entreprise est
   connue ; sinon variante « qu'est-ce qui vous attire dans ce secteur ? ».
3. **Ce que vous ne voulez PAS voir mentionné** dans la lettre (trou, reconversion, contexte de
   départ...) (B7).
4. **Compétences / réalisations à mettre en avant en priorité** (B6) — avec classement.
5. **Registre et ton souhaités** : soutenu / professionnel et accessible / simple et direct (F1).
6. **Projet professionnel à court terme** (D1, version courte).

### 4.2 Couche variable — posée seulement si absente du profil ET pertinente pour ce poste

- exigences spécifiques de l'offre à traiter (C4) — si objectif = réponse à une offre et offre connue ;
- raison de départ du dernier poste (A7) — **pour l'interne uniquement, jamais dans la lettre** ;
- mettre en avant permis / véhicule (E1) — seulement si le poste implique des déplacements ;
- proximité du lieu de travail / mobilité géographique (E2 / E3) — si pertinent ;
- horaires avec coupures / horaires décalés (E4 / E5) — secteurs concernés seulement ;
- langue étrangère à mentionner (F3) — si pertinent pour le poste ;
- outils / logiciels (F5) — si le poste les demande et qu'ils sont absents du CV ;
- centre d'intérêt qui sert la candidature (F2) — si un loisir du profil est réellement pertinent ;
- portfolio / certifications / présence en ligne professionnelle (F4) ;
- nommer ou anonymiser les anciens employeurs (G1) — surtout si candidature chez un concurrent ;
- lettres de recommandation / références (G2) ;
- temps plein / partiel (A4), type de contrat (A3) — seulement si absents du profil.

### 4.3 Écarté

- format d'envoi papier / pièce jointe / corps de mail (A2) — la mise en page est gérée par l'app ;
- niveau d'expérience / d'études / de positionnement dans le secteur (B2 / B3 / B4) — déductibles du profil ;
- toutes les notes /10 et les commandes `note` / `détails` (décision Denis) ;
- conseil de préparation d'entretien + 3 questions pièges (rôle de E1 / E2).

### 4.4 Conservé tel quel

- question de clôture « quelque chose à ajouter que la lettre doit refléter ? » — systématique ;
- « je ne sais pas » → au moins 5 suggestions différentes, classées par pertinence, chacune
  expliquée (reprise mot pour mot de la Règle 1 de `lettre-v1.md`, **sans la note sur 10**) ;
- « je passe » / « STOP » — navigation conservée ;
- règles de fiabilité (ne jamais inventer, ne jamais présumer une information sensible) ;
- français impeccable, aucun tiret cadratin ni demi-cadratin.

### 4.5 Format de sortie attendu (JSON, en fin d'échange)

Même schéma que `lettre.md` (pour rester compatible avec `analyserReponseIALettre` et le rendu
existant), avec **une seule entrée** dans `versions` :

```json
{"accroche": "...", "arguments": ["...", "..."], "versions": [
  {"objet": "...", "texte": "<lettre complète, tient sur 1 page A4, >= 10 pt>", "texteCourt": "<texte seul pour corps de mail, ~800-900 caractères>"}
]}
```

- `objet` + `texte` = la **version longue mise en page** (aperçu + impression + DOCX dans l'app).
- `texteCourt` = la **version courte texte seul** (corps de mail). Pas d'objet propre affiché ;
  si un objet de mail est utile, le prompt peut le mettre en première ligne de `texteCourt`.
- Consigne de fiabilité du prompt : `texte` **doit** tenir sur une page (le prompt resserre la
  sélection d'arguments ; il ne compte pas sur la mise en page pour rattraper un texte trop long).

Décision Denis 2026-09-07 : **1 version longue + 1 courte** (pas 3 comme `lettre.md` : L1 est
co-construit phrase par phrase, la personne ne choisit pas parmi 3, elle travaille la sienne).

### 4.6 Rendu dans l'application (réutilisation, rien de neuf)

La sortie de L1 alimente `dossier.ia.lettre` exactement comme celle de L2. Le rendu existe déjà :
- aperçu mis en page : `chargerApercuLettreInline(modele)` + `MODELES_LETTRE_DISPONIBLES` +
  `construireCarrouselModeles('lettre', ...)` ;
- assemblage contenu + identité + date : `modules/lettre-core/normaliserDonneesLettre.js` ;
- export Word : `genererDocxNatifLettre` / `modules/lettre-editor/exportDocxNatifLettre.js` (le
  gabarit « Sobre » est déjà calibré pour tenir sur une page, cf. `TAILLE_CORPS` / `TAILLE_ENTETE`).

À faire côté L1 : à l'écran 4, après import, offrir **aperçu + Imprimer + Enregistrer (DOCX)**
pour la version longue, et **aperçu texte + Copier le texte + Enregistrer (.txt)** pour la courte.
Vérifier si un bouton « Imprimer » dédié existe déjà pour la lettre ; sinon, reprendre la même
brique d'impression que le CV. À cartographier à l'étape branchement.

---

## 5. Rendre la complémentarité visible (hors prompt) — [FAIT 2026-09-10, commit `cd96502`, option A]

**Décision Denis 2026-09-10 : la complémentarité vit sur les tuiles / infobulles de l'accueil,
JAMAIS sur les pages d'introduction.** Une page d'introduction ne parle que de son propre module
(RÈGLE ABSOLUE du 2026-08-30, réaffirmée). Le §5 d'origine (ci-dessous) demandait un renvoi
« voir Préparer ma lettre et mon entretien » sur l'intro L1 : **abandonné**, il violait cette
règle. Chaque libellé décrit **son** module, aucun ne nomme l'autre — le contraste émerge de la
description elle-même :

- **Co-construire ma lettre** (tuile, carte « Me préparer à candidater ») : « Vous écrivez la
  lettre avec un assistant, phrase par phrase, **en prenant le temps**. »
- **Préparer un entretien** (tuile, même carte) : « Une séance d'entraînement : vous répondez à
  des questions d'entretien, à l'écrit ou à voix haute, et l'assistant réagit à vos réponses. »
- **Préparer ma lettre et mon entretien** (tuile, carte « Mes documents » — le conteneur L2/E2) :
  « Vous avez déjà un CV. On s'en sert **directement** comme base pour produire votre lettre de
  motivation et une préparation d'entretien, **rapidement** et sans rien vous faire ressaisir. »
  + infobulle « … quand vous voulez aller vite vers la lettre et l'entretien. »

**Signalé à Denis, à trancher séparément** : deux renvois inter-modules déjà présents sur des
pages d'introduction, contraires à la règle — `_prepLE` intro (`data/metiers.js` ~3822, encart
qui nomme « Co-construire ma lettre » et « Préparer un entretien » de l'accueil) et intro
Découverte (`~7209`, puce « Enchaîner sur « Co-construire ma lettre de motivation » ou
« Préparer un entretien » »).

<details><summary>§5 d'origine (2026-09-07, abandonné le 2026-09-10)</summary>

Une ligne sur chaque carte / intro, sur le modèle déjà écrit pour L2 (`data/metiers.js` ~ligne
3660) :

- **L1** : « Vous écrivez la lettre avec l'assistant, phrase par phrase. Pour une lettre rapide à
  partir d'un CV existant, voir Préparer ma lettre et mon entretien. »
- **E1** : « Une séance où vous répondez à voix haute et l'assistant réagit à vos réponses. »
- **E2** : renvoi vers E1 pour s'entraîner à l'oral.

</details>

---

## 5bis. Le retour de l'échange : import, pas texte brut (décision Denis 2026-09-07)

La personne **ne revient pas avec la lettre en texte libre**. Elle colle la réponse complète de
l'assistant (qui se termine par le bloc JSON) dans l'écran 4 ; l'app extrait `accroche` /
`arguments` / `versions` / `lettre`, l'importe dans `dossier.ia.lettre`, puis **génère un vrai
document Word** (`genererDocxNatifLettre` via `normaliserDonneesLettre`). C'est déjà le
fonctionnement actuel de L1 (`_coLettreRendreReponse`). On le garde : un retour en texte brut
perdrait la variante courte et la mise en forme propre.

**Coordonnées et anonymisation.** Le CV a été masqué au dépôt (nom, adresse, téléphone) : la
lettre produite par l'assistant n'a donc pas d'en-tête expéditeur réel, et **c'est voulu**.
L'en-tête est reconstitué **localement** à la génération du DOCX, à partir de `dossier.identite`
(civilité, nom, prénom, adresse, code postal, ville, téléphone, email) — voir
`modules/lettre-core/normaliserDonneesLettre.js`. Deux cas :

- la personne a déjà rempli « Vos informations » (parcours CV, etc.) → l'en-tête est complet,
  rien à demander ;
- la personne est venue directement sur L1 sans identité renseignée → l'en-tête serait vide.

**À faire** : avant « Enregistrer en DOCX », L1 affiche un bloc **« Vos coordonnées »**
pré-rempli depuis `dossier.identite`, modifiable, sautable si déjà complet. **On réutilise la
brique identité partagée** (le formulaire de « Vos informations » / le bloc identité compact déjà
réutilisé dans les contextes d'aperçu et d'enregistrement, `js/app.js` ~lignes 5968-6018 et
~9640-9690). On ne recrée pas de formulaire. À cartographier précisément à l'étape maquette.

---

## 6. Étapes du chantier

1. [FAIT 2026-09-07, commit 6069dee] Audit des 4 parcours + contrat figé (ce document).
2. [FAIT 2026-09-07, commit 6069dee] Maquette : `docs/MAQUETTE_L1_CO_LETTRE_ECRANS_2026-09-07.html`.
3. [FAIT 2026-09-07, commit 6069dee] Écriture du prompt : `prompts/lettre-co.md`.
4. [FAIT 2026-09-07, commit a3398d6] Enregistrement du prompt `lettre-co` dans `js/app.js` (`FICHIERS_PROMPTS_EXTERNES`, `promptsExternesCharges`, `promptParDefaut`). `lettre-v1` laissé en place, marqué « remplacé ». Pas encore appelé.
5. [FAIT 2026-09-07] Branchement de l'écran « Choisir mon assistant » (`_coLettreBrancherChoixAssistant`, `data/metiers.js`) sur `promptCache('lettre-co', texteProfilEffectif('lettre'))` + substitution du jeton unique `{CONSIGNE_TRANSMISSION_CV}` (texte / image / générique), à la place des deux jetons `lettre-v1`. Vérifié navigateur : `lettre-co` chargé, prompt + profil transmis, aucun jeton résiduel, plus de « Start », 0 erreur console. **Incident de concurrence** : `data/metiers.js` était édité en parallèle par le chantier « Reformuler et présenter mon CV » ; ma modification de cette fonction a été balayée dans **leur** commit `10235d7` (« Reformuler et présenter mon CV : plus de questions ni de marqueurs ») par un `git commit -a`. Le code est correct et sur `master`, juste réparti entre `a3398d6` (js/app.js + prompt) et `10235d7` (metiers.js). Ne pas réécrire l'historique. **Leçon : ne pas mener deux chantiers en parallèle sur `data/metiers.js`.**
6. [FAIT 2026-09-07, commit bfbbb3b] Écran 2 : `_coLettreRendreDepot` devient une page dépliante à 2 blocs. Bloc 2 « L'entreprise et le poste » = `bilanCorpsCiblageOffreHTML()` + `contenuCiviliteRecruteurCandidature()` + un champ poste (`dossier.metierCible`). Écriture immédiate dans `dossier.rechercheCandidature` (survit à un re-rendu), re-rendu de la seule zone civilité au choix (LECONS 9.5). **Gap corrigé au passage dans `texteProfil()`** : `dossier.rechercheCandidature.typeStructure` est enfin transmis à l'assistant (utile cv.md / lettre.md / entretien.md). Vérifié navigateur : saisie → dossier → `texteProfil('lettre')`, persistance, chaîne Retour RC-03, clair + sombre.
7. [FAIT 2026-09-07, commit 7a0e000] Écran 4 : **bug d'import corrigé** (`dossier.ia.lettre.lettre = resultat.valeurs.lettre` écrivait `undefined` depuis le passage à `versions[]` → DOCX vide ; corrigé sur `versions[0]` comme le pipeline). `normaliserLettreImbriquee()` capte enfin `texteCourt`. **Nouveau bouton « Copier la version courte (pour un e-mail) »** : texte seul, pour le corps d'un message. Message d'aide si l'assistant n'a pas fourni de version courte. Vérifié navigateur.
8. [FAIT dans l'étape 7] `analyserReponseIALettre` : `versions` OK, `texteCourt` était perdu → corrigé.
9. [PARTIELLEMENT FAIT] Écran 2, ajouts restants du §3ter :
   - [FAIT - 2026-09-10, commit `2409a72`, vérifié navigateur] **bloc « Relire, vérifier, corriger, masquer » (obligatoire)** inséré comme bloc 2, entre « Votre CV » et « L'entreprise et le poste » (renumérotée 3). Modèle `_prepLE` : drapeau module `_coLettreCvRelu`, brique partagée `bilanDemanderRelectureCv`. Le collage inline reste sur la page (bloc 2 ouvert, CTA bloqué tant que non relu) au lieu de sauter vers le choix d'assistant. Chemin fichier / image : `_coLettreCvRelu = true` à `onDocumentPrepare` (la modale a déjà masqué), comportement inchangé. « Changer de CV » / « Recommencer » remettent le drapeau à `false`. Garde-fou dans le handler du CTA. Corrige le trou de confidentialité : avant, un CV collé en texte partait brut à l'assistant via le bouton « Copier mon CV » de l'écran 4. `npm test` 780.
   - [FAIT - 2026-09-10, commit `cd96502`] complémentarité L1 / L2 / entretien portée par les tuiles et infobulles de l'accueil (option A, jamais sur les intros). Détail : §5. 2 renvois d'intro existants signalés à Denis pour décision séparée.
10. [PARTIELLEMENT FAIT] Écran 4 :
    - [FAIT 2026-09-10, commit `c31a4e0`, vérifié navigateur] bloc **« Vos coordonnées »** avant la zone de collage. `_coLettreBlocCoordonnees()` : rappel lecture seule de `dossier.identite` ; incomplet → encart + bouton « Compléter mes coordonnées » (non bloquant). Réutilise `bilanOuvrirFenetreCoordonnees(onEnregistre)` (nouveau paramètre optionnel, défaut = `pageBilanCandidature`, comportement Bilan inchangé). Re-rendu en place du seul bloc.
    - [FAIT 2026-09-10, commit `0526f50`, vérifié navigateur] bouton **« Aperçu / Imprimer »** sur l'écran 4 (entre DOCX et « version courte »). `_coLettreLettreImprimableHtml()` : en-tête expéditeur depuis `dossier.identite` (via `normaliserDonneesLettre`), lieu + date, objet, corps ; iframe `srcdoc` + panneau plein écran Imprimer / Fermer (patron `bilanOuvrirApercuFicheSynthese`). Au clic : réutilise `dossier.ia.lettre` si importée, sinon parse la zone de collage, sinon message. **ÉTAPE 10 TERMINÉE.**
11. [FAIT 2026-09-07, commit 5659cdd] `lettre-v1` retiré de `FICHIERS_PROMPTS_EXTERNES`, `promptsExternesCharges`, `promptParDefaut`. `prompts/lettre-v1.md` n'est plus chargé. [FAIT 2026-09-11, confirmation Denis] fichier supprimé.
12. [PARTIELLEMENT FAIT] :
    - [FAIT 2026-09-10, vérifié navigateur clair + sombre] non-régression du chrome (§3quinquies) : bande « Revoir la présentation » (écrans 2/3/4), barre du bas Retour + Accueil, chaîne Retour RC-03 (4 → 3 → 2 → intro normale, non destructive), intro normale → panneau « Me préparer à candidater », détour « Revoir la présentation » → « Revenir au module », encart « Continuer / Recommencer » + confirmation. Ajouts des étapes 9 et 10 sans impact sur le chrome. Point mineur pré-existant : `recommencer()` global ne réinitialise pas les vars `_coLettre*`.
    - [À FAIRE, Denis] test du prompt sur 3-4 vrais CV (profil riche / maigre / reconversion / premier emploi).
    - [FAIT 2026-09-11] `prompts/lettre-v1.md` supprimé (confirmation Denis).

---

## 7. Questions tranchées (Denis, 2026-09-07)

- Sortie : **1 version longue** (1 page A4) **+ 1 version courte** (texte seul, corps de mail). Pas 3.
- Nom du prompt : **`prompts/lettre-co.md`** (nouveau). `lettre-v1` sera orphelin (étape 11).
- Mot « Start » : **supprimé**, démarrage direct.
- Position du bloc « Vos coordonnées » (écran 4) : **avant** la zone de collage.
- Entrée directe sans « Vos informations » remplie : **tolérée, non bloquante** (encart + lien vers
  « Vos informations », le DOCX se génère quand même).

## 8. Écran « Avant de continuer vers [assistant] » — hors périmètre L1 (question Denis 2026-09-07)

Cet écran (`ouvrirFenetreAssistantIA`, `js/app.js`) est une **brique partagée** : il apparaît
**à l'identique** dans les 5 parcours qui envoient vers un assistant (CV, lettre x2, entretien x2)
et dans la page Action, Découverte, le Bilan, Cohérence. Ce n'est **pas** un reliquat propre à L1.
C'est la confirmation brève « vous allez être redirigé vers un site externe », techniquement une
fenêtre modale (`ouvrirFenetreERIP`). Le chantier « élimination des fenêtres de dépôt CV »
(2026-09-04) l'a **explicitement laissée hors périmètre** : ce n'est pas une fenêtre de *saisie*
de document.

Denis (2026-09-07) : ne veut pas de fenêtre à part, veut limiter le nombre de fenêtres. **Décision
à prendre dans un chantier dédié** (transverse aux 9 consommateurs), pas dans la refonte L1 qui
porte sur le contenu et le prompt. Piste : remplacer cette modale par un bloc dépliant inline
« Dernière étape avant [assistant] » sur la page du parcours, comme les autres écrans routés. À
cadrer séparément.

---

## 9. Mise à jour 2026-09-17 (retour utilisateur, hors chantier initial)

Ce document reste le contrat figé du chantier d'origine (2026-09-07/11) ci-dessus - non réécrit -
mais plusieurs évolutions réelles depuis modifient ce que décrit le §3 (« parcours actuel,
référence ») :

- **Écran 2 « Preparer »** : le bloc 3 (ex-« L'entreprise et le poste ») est remplacé par le
  fonctionnement de « Votre objectif » (`pageObjectif()`, js/app.js) - type de candidature
  (`OBJECTIF_CHOIX_CANDIDATURE`), puis `contenuModeRecherche()`/`contenuCandidature()` (métier/
  domaine, entreprise/site/offre/type de structure, civilité du recruteur déjà incluse). Un bloc 4
  « Adaptation au métier » est ajouté (`contenuRectangleStyleCV()`, même composant que « Créer un
  nouveau CV ») - ce parcours n'avait jusque-là aucun moyen d'adapter le ton de la lettre.
  Voir `docs/BRIQUES_COMMUNES.md` B.1 (6ᵉ consommateur) et B.15 (3ᵉ consommateur).
- **Écran 4 « Coller la réponse »** : les 3 boutons DOCX/Aperçu-Imprimer/version courte (et le
  panneau d'impression dédié) sont retirés. Un seul bouton « Importer ma lettre » écrit
  `dossier.ia.lettre` puis navigue directement vers « Vos documents », qui prend le relais avec
  l'interface moderne déjà utilisée par L2 (« Préparer ma lettre et mon entretien ») - bascule
  Feuille A4/Message par mail, aperçu, téléchargement. Le bouton « Terminé » de cet écran disparaît
  (la navigation est l'action de fin). Ceci **réalise enfin le renvoi du §4.6** (« À faire côté L1 :
  offrir aperçu + Imprimer + Enregistrer... vérifier si un bouton Imprimer dédié existe déjà »).
- **`dossier._origineCoLettre`** (nouveau drapeau, posé à l'import) signale à `pageResultats()`/
  `afficherProgression()` (js/app.js) qu'un document vient de ce parcours, jamais du pipeline
  pret/maj/nouveau - évite l'ancienne barre à 9 repères et un 2ᵉ passage assistant redondant sur
  « Vos documents » (Adaptation au métier/Choisir mon assistant déjà faits ici, à l'écran 2).
- **Reprise (Continuer/Recommencer)** : la tuile Accueil force désormais `_coLettreEcran` à
  `'intro'` à chaque retour (comme « Mes documents »), au lieu de redéposer directement sur l'écran
  quitté (comportement d'origine du §3, dispatcher `pageCoLettre()`) - demande explicite de Denis,
  contraire à la décision initiale de ce chantier, tranchée à nouveau le 2026-09-17.
- **`detecterCoordonneesSensibles()`** (brique partagée, masquage) pré-remplit désormais
  `dossier.identite.telephone`/`.email` dès le dépôt du CV (texte brut, avant tout masquage) -
  répond au §5bis/§7 sur les coordonnées manquantes à l'écran 4.

Détail complet, commits et tests : voir l'historique git du 2026-09-17 (module `data/metiers.js`,
fonctions `_coLettre*`) et `docs/BRIQUES_COMMUNES.md`.
