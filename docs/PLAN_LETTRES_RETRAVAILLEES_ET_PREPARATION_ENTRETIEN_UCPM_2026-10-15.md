# Module « Un CV, plusieurs métiers » : lettres retravaillées et préparation d'entretien par métier

Créé le 2026-10-15 à la demande de Denis. Mode A, `[effort : haut]` pour la conception et la maquette, puis exécution `[effort : moyen]`. Rien n'est codé. Audit du code réel fait le 2026-10-15 (voir section 1).

## 0. Demande de Denis (résumé fidèle)

**Chantier A : retravailler une lettre.** Chaque lettre reste modifiable à la main ; ces modifications et des compléments d'information partent dans un nouveau passage avec l'assistant, pour une lettre meilleure. Disponible pour chaque lettre. On retrouve les options de rédaction déjà proposées (niveau de langage, ton, longueur...).

**Chantier B : préparation d'entretien d'embauche, une feuille A4 par métier.** Questions probables et pistes de réponse (ce que le recruteur attend, comment répondre), dont les questions délicates : trous dans le CV, pourquoi cette entreprise, pourquoi cette reconversion ou ce changement de secteur (en s'appuyant sur les compétences déjà acquises). Document autonome, son propre passage avec l'assistant, SANS les options de rédaction, MAIS avec un niveau d'exigence et d'autres réglages. Le CV et la lettre du métier sont transmis sans données sensibles. Impression : toutes les préparations ensemble (un seul PDF), et par métier un bouton séparé, jamais dans le fichier « CV avec sa lettre » (pour ne pas envoyer trois documents à l'employeur).

## 1. Audit du code réel (ce qui existe, ce qui est simple, ce qui est risqué)

**Simple (reprise de l'existant)**
- Le moteur de passage avec l'assistant est unique et réutilisable : `modules/un-cv-plusieurs-metiers/passageAssistant.js` (choix, « chez l'assistant », collage). Un passage = une config (`construireTexte`, `importer`, `apresSucces`), comme `_ucpmConfigPassageLettres` (`page6Lettres.js:82`).
- Les options de rédaction existent : `ucpmHtmlStyleEcriture('lettre')` et `ucpmConsignesStyle('lettre')` (`passageAssistant.js:27-53`). Chantier A les reprend à l'identique.
- La lettre est déjà un champ modifiable (`page6Lettres.js:129`, `lettresOrigine`, « Remettre la lettre reçue »). Le format de réponse `[{id, lettre}]`, la lecture (`ucpmLireReponseLettres`), la fusion (`ucpmFusionnerLettres`), les empreintes de péremption (`ucpmSignaturesLettres`) se réutilisent.
- Impression : `ucpmImprimerDocument`, `ucpmDocumentImpression(titre, feuilles)`, `_ucpmP7Telecharger` (`page7Fin.js`) acceptent déjà des « feuilles » ; une feuille de préparation s'ajoute avec son propre CSS A4 (modèle `UCPM_CSS_LETTRE`, `logiqueDocuments.js:54`).
- Profil sans coordonnées : `ucpmConstruireProfilValide` n'envoie ni nom, ni téléphone, ni adresse.
- Détection des périodes sans activité : `data/incoherencesImport.js` traite déjà les dates ; un calcul d'écart entre expériences est un petit ajout pur, testable en Node.

**Risqué / à traiter avec soin**
1. **La lettre contient le nom en signature** (ajouté par l'application). Pour le chantier A, il faut retirer formule d'appel et signature avant l'envoi, puis les remettre à la réception (la fonction `ucpmPreparerLettresRecues` le fait déjà dans le sens retour). Les compléments tapés librement par la personne peuvent contenir un nom ou un numéro : rappel visible + filet de détection existant à brancher (`relectureConfidentialite`).
2. **Une feuille A4 par métier est une contrainte dure.** Un prompt mal borné produit 2 pages. Il faut plafonner le nombre de questions et la longueur des pistes, mesurer côté code (comme `ucpmLettreLongue`) et avertir.
3. **Une seule réponse pour 10 préparations est irréaliste** (10 métiers x 12 questions x pistes = environ 7 000 mots, risque de réponse coupée, déjà vu sur les lettres à 2 000 mots). Recommandation : un passage PAR métier choisi (ce que Denis a lui-même formulé : « lorsque j'ai choisi le métier »), éventuellement 2 ou 3 métiers cochés ensemble au maximum.
4. **Le nombre de pages est fixé à 7** (`UCPM_NB_PAGES`, `logique.js:27` ; barre d'étapes, Retour, essais par page). Ajouter une page 8 touche index.js, logique.js, la barre d'étapes et les essais `unCvMetiersPage*`. Faisable, mais c'est de la restructuration : à décider (section 3).
5. **Doublon à éviter** : l'application a déjà « Préparer un entretien » (`prompts/entretien.md`), un coaching par dialogue. Ici c'est un document écrit en une réponse. La brique commune (dépôt, recherche, vocabulaire) est partagée, mais les deux produits restent distincts : le dire clairement dans l'écran pour que la personne ne les confonde pas.
6. **Prompts non testés** : comme pour les 4 prompts existants, le nouveau prompt doit passer par un banc d'essai sur de vrais assistants (`scripts/essai_prompts_ucpm.js` à étendre) AVANT branchement. Je ne peux pas le valider seul : Denis essaie sur son assistant.
7. **Contenu sensible** : les questions sur les trous du CV et la reconversion touchent la confiance en soi. Règle : aucun diagnostic sur la personne, formulation qui montre COMMENT répondre, pas qui juge. Jamais de question sur le handicap, la santé, la famille de la propre initiative de l'assistant (même règle que `entretien.md`).

**Aucun point bloquant.** Franchise : le chantier A est petit (une vue de plus sur la page 6 et un prompt). Le chantier B est un vrai nouveau passage, un nouveau prompt, une feuille imprimable, des réglages : plus gros, et la qualité des questions dépend du prompt, pas du code.

## 2. Effort

| Partie | Étiquette |
|---|---|
| Décisions et maquette (sections 3 et 4) | `[effort : haut]` (Mode A) |
| Prompt `ucpm-lettres-retravail.md` + banc d'essai | `[effort : haut]` (le prompt est la qualité) |
| A : code (vue « Retravailler », passage, péremption, tests) | `[effort : moyen]` |
| Prompt `ucpm-preparation.md` + banc d'essai | `[effort : haut]` |
| B : code (page ou bloc, passage, feuille A4, impression, tests) | `[effort : moyen]`, `haut` pour l'ajout de page si choisi |
| Textes, aide contextuelle, recherche, mode sombre, vérifications | `[effort : bas]` |

Séances recommandées : (1) Mode A `high` : décisions + maquette A et B ; (2) Mode A `high` : les deux prompts et leurs essais ; (3) Mode B `medium` : code A ; (4) Mode B `medium` : code B ; (5) Mode C `low` : finitions. Ordre : A avant B (A est petit et vérifie la mécanique de retour ; B réutilise la page 7).

## 3. Décisions à prendre par Denis (avec recommandation)

**D1. TRANCHÉE par Denis le 2026-10-15 : option recommandée (bouton sur chaque lettre de la page 6 et rappel sur la page 7).**

**D1 (rappel des options). Où entre-t-on dans « Retravailler une lettre » ?**
- (Recommandé) Un bouton « Retravailler cette lettre avec l'assistant » sur chaque lettre de la page 6 (lecture), et un rappel sur la page 7. Une seule implémentation, aucun doublon. Risque : aucun.
- Page 7 uniquement : cohérent avec « à la fin », mais il faut revenir en arrière pour modifier le texte. Risque : parcours moins naturel.

**D2. TRANCHÉE par Denis le 2026-10-15 : page 8 facultative, atteinte par un bouton de la page 7, qui affiche le « Document 3 ».**

**D2 (rappel des options). Où vit la préparation d'entretien ?**
- (Recommandé) Une **page 8 facultative** « Préparer mes entretiens », atteinte par un bouton sur la page 7 ; la page 7 reste la page d'impression et affiche un « Document 3 : mes préparations » avec ses boutons. Bénéfice : page 7 non alourdie, retour simple. Risque : toucher le nombre de pages et les essais.
- Tout dans la page 7 (bloc dépliant) : pas de page de plus. Risque : page 7 déjà dense, et le passage avec l'assistant (3 vues) s'y loge mal.

**D3. TRANCHÉE par Denis le 2026-10-15 : DEUX modes.** (a) **Préparation générale** : pour tous les métiers ou pour ceux que la personne coche, en un seul passage, version COURTE (5 à 6 questions par métier, pistes brèves, niveau d'exigence fixe « Réaliste », réglages réduits). (b) **Préparation approfondie** : un seul métier, version complète (10 à 12 questions), avec le niveau d'exigence et tous les réglages. Une feuille A4 par métier dans les deux cas ; une préparation approfondie remplace la version générale du même métier (avec confirmation). Garde-fou : au-delà de 6 métiers cochés en mode général, la réponse risque d'être coupée (limite constatée sur les lettres : environ 2 000 mots) ; l'application le signale et propose de scinder en deux passages.

**D3 (rappel de la question d'origine). Un passage par métier ou tous ensemble ?** (Recommandé) Un métier à la fois, avec la possibilité d'enchaîner. Bénéfice : réponses complètes, pistes de qualité. Risque : plusieurs allers-retours si 10 métiers. Alternative : jusqu'à 3 métiers ensemble.

**D4. TRANCHÉE par Denis le 2026-10-15** : mode général = niveau « Réaliste » fixe, 5 à 6 questions, thèmes par défaut (parcours, points délicats, pourquoi ce métier ou ce changement), pistes courtes ; mode approfondi = niveau d'exigence au choix (Rassurant / Réaliste / Exigeant / Très exigeant), 8 à 12 questions, thèmes à cocher, pistes avec ou sans ; employeur et offre repris de l'objectif dans les deux modes.

**D4 (proposition d'origine). Réglages de la préparation (avant l'envoi).** Proposition, tout facultatif avec un défaut raisonnable :
1. **Niveau d'exigence** : Rassurant (questions classiques, ton encourageant) / Réaliste (défaut) / Exigeant (recruteur direct, relances) / Très exigeant (cas pratiques et questions de déstabilisation).
2. **Nombre de questions** (8, 10 ou 12) : plafonné pour tenir sur une feuille.
3. **Thèmes à inclure** (cases) : mon parcours ; mes points délicats (trous, ruptures) ; pourquoi cette entreprise ; pourquoi ce changement de métier ou de secteur ; mes compétences ; mises en situation ; qualités et défauts ; disponibilités, contrat, rémunération.
4. **Si la personne le souhaite : avec ou sans pistes de réponse** (par défaut avec).
5. **Employeur visé** : repris de l'objectif du CV (employeur, poste, extrait d'offre) quand il est donné, sinon questions générales du métier.
Risque : trop d'options décourage ce public. Recommandation : deux niveaux d'affichage (niveau d'exigence + nombre toujours visibles, le reste dans « Plus de réglages »).

**D5. TRANCHÉE par Denis le 2026-10-15** : feuille et boutons comme décrits ci-dessous ; maquette `docs/MAQUETTE_LETTRES_RETRAVAILLEES_ET_PREPARATION_UCPM_2026-10-15.html` à valider.

**D5 bis, ajout de Denis (2026-10-15) : la feuille du mode général se remplit avec des CONSEILS.** En dessous des 5 à 6 questions : (1) « Ce que vous pouvez mettre en avant » (3 à 4 atouts tirés du CV et de la lettre de ce métier, rédigés par l'assistant, rien d'inventé) ; (2) « Savoir-être, attitude et comportement » : conseils pour avant, pendant et après l'entretien (ponctualité, tenue, regard, écoute, façon de répondre, remerciement). Décision de conception proposée : les conseils d'attitude sont des TEXTES FIXES écrits par l'application (relus par Denis, identiques sur toutes les feuilles, hors de la réponse de l'assistant), ce qui garantit que la feuille tient sur une page et raccourcit la réponse de l'assistant ; seuls « ce que vous pouvez mettre en avant » et les questions viennent de l'assistant. En mode approfondi, les mêmes conseils sont présents (plus courts si la page est pleine).

**D5 (description). Feuille imprimée.** Une feuille A4 par métier : en-tête (métier, objectif), les questions numérotées, sous chacune « Ce que le recruteur cherche » et « Une piste pour répondre » ; questions délicates marquées d'un repère visuel discret (pas de couleur seule). Bouton « Télécharger ma préparation » par métier ; « Télécharger toutes mes préparations (un seul PDF) » ; jamais incluses dans « Ce CV avec sa lettre ». Un texte rappelle : « Vous envoyez le CV et la lettre ; la préparation est pour vous. » À valider sur maquette.

**D6. Mots à l'écran** : jamais « IA » (« l'assistant »), jamais de tiret long, ton rassurant, aucun diagnostic. Les trous du CV sont présentés comme « des périodes à pouvoir expliquer simplement », jamais comme des défauts.

## 4. Plan par tâches (cases à cocher, un commit par case)

### Étape 0 : décisions et maquette `[effort : haut]`
- [x] 0.1 Denis tranche D1 à D5 (fait le 2026-10-15).
- [x] 0.2 (validée par Denis le 2026-10-15) Maquette HTML cliquable : page 6 avec « Retravailler cette lettre », page 8 (choix du métier, réglages, passage), page 7 complétée (Document 3, boutons), feuille A4 type. Parcours complet écrit (écran d'avant, d'après, boutons).
- [ ] 0.3 Audit de la maquette contre `LANGAGE_VISUEL_COMMUN.md` et `BRIQUES_COMMUNES.md`, inventaire GARDÉ / ENRICHI (aucun RETIRÉ), verdict de faisabilité par élément.

### Étape 1 : prompts et essais `[effort : haut]`
- [x] 1.1 (écrit le 2026-10-15, V1 à essayer par Denis) `prompts/ucpm-lettres-retravail.md` : reçoit la lettre actuelle (sans signature), les compléments de la personne, l'objectif du CV, le profil validé, le style. Règles : garder ce que la personne a écrit et voulu garder, intégrer ses ajouts, rien d'inventé, même format `[{id, lettre}]`, mêmes bornes de longueur que `ucpm-lettres.md`.
- [x] 1.2 (écrit le 2026-10-15, V1 à essayer par Denis) `prompts/ucpm-preparation.md` : reçoit métier, objectif, employeur et offre si donnés, CV du métier (titre, accroche, expériences), lettre (sans signature), périodes sans activité repérées par le code, réglages. Sortie : JSON par métier (questions : texte, thème, délicate oui/non, attente du recruteur, piste de réponse ; conseil général court). Règles : jamais de diagnostic, jamais de question sur la santé, la famille, le handicap de sa propre initiative ; s'appuie sur les compétences réellement présentes ; chaque piste est une aide à répondre avec les faits du CV, jamais une réponse toute faite inventée.
- [x] 1.3 (vérificateur FAIT le 2026-10-15 : types retravail, preparation-general, preparation-approfondi dans scripts/essai_prompts_ucpm.js ; reste les essais de Denis) (génération des fichiers d'essai FAITE : `05_retravail_V1_3.txt`, `06_preparation_V1_general_3.txt`, `06_preparation_V1_approfondi_1.txt` dans `docs/essais_prompts_ucpm/` ; reste le vérificateur de réponse et les essais de Denis) Étendre `scripts/essai_prompts_ucpm.js` (types `retravail`, `preparation`), vérificateur de format et de longueur ; essais par Denis sur un assistant (au féminin, au masculin, reconversion, trou de 2 ans, premier emploi).

### Étape 2 : chantier A, code `[effort : moyen]`
- [x] 2.1 (fait 2026-10-15) Fonctions pures dans `logiqueCv.js` : retrait de la formule et de la signature avant envoi, construction du bloc « lettre à retravailler » (+ compléments), tests Node.
- [x] 2.2 (fait 2026-10-15) Vue `retravail` de la page 6 (`p6Vue`), passage `retravail` via `passageAssistant.js` avec `ucpmHtmlStyleEcriture('lettre')`, `texteConfidentialite`, lecture de la réponse, mise à jour de `lettres`, `lettresSig`, conservation de `lettresOrigine`.
- [x] 2.3 (fait 2026-10-15) Bouton par lettre (page 6) et rappel page 7 ; règle de Retour sans rien supprimer ; confirmation avant remplacement du texte (comme « Refaire la demande »).
- [x] 2.4 (fait 2026-10-15, essai `unCvMetiersRetravail` 26 contrôles verts, pages 6 et 7 rejouées, `npm test` vert) Essai navigateur (nouveau `unCvMetiersRetravail`), `npm test`, mode sombre, vérification que `scripts/parcours/parcours_smoke.js` reste vert.

### Étape 3 : chantier B, code `[effort : moyen]` (haut si page 8)
- [x] 3.1 (fait 2026-10-15, logiquePreparation.js, 9 essais) Fonctions pures (`logiquePreparation.js`) : périodes sans activité, construction du prompt, lecture de la réponse (tolérante comme `ucpmLireReponseLettres`), mesure de tenue sur une page, tests Node.
- [x] 3.2 (fait 2026-10-15, page 8 = 8e page facultative, barre d'étapes, Retour) Si D2 = page 8 : `UCPM_NB_PAGES = 8`, barre d'étapes, `continuer`, `retour`, bornes (`logique.js:85`) ; grep sur tout le module et ses essais.
- [x] 3.3 (fait 2026-10-15, page8Entretiens.js) Page « Préparer mes entretiens » : choix du métier, réglages (niveau d'exigence, nombre, thèmes, pistes), passage avec l'assistant SANS le panneau de style d'écriture, stockage `etat.preparations[id]` (donnée pure, part dans la disquette).
- [x] 3.4 (fait 2026-10-15, feuille A4 mesurée à l'écran, deux pages au plus en approfondi) Feuille A4 (`UCPM_CSS_PREPARATION`, `ucpmHtmlPreparation`), impression par métier et groupée, « Document 3 » sur la page 7, jamais dans « CV avec sa lettre ».
- [x] 3.5 (fait 2026-10-15, péremption, Retour sans boucle, essai unCvMetiersPreparation 45 contrôles verts) Péremption (si l'objectif ou le CV a changé depuis la demande : signalé, rien effacé), Retour sans boucle.
- [ ] 3.6 Essais navigateur, `npm test`, impression réelle (1 feuille par métier, toutes ensemble), mode sombre.

### Étape 4 : finitions `[effort : bas]`
- [ ] 4.1 Aide contextuelle (`AIDE_PAGES`), recherche de l'accueil, Lexique si besoin (`node scripts/checkLexique.js`), français et tirets, mot « IA » absent.
- [ ] 4.2 `docs/BRIQUES_COMMUNES.md` (feuille imprimable, passage), `docs/ETAT_DES_CHANTIERS.md` (passation), `docs/TACHES_VALIDEES.md`.
- [ ] 4.3 Vérification d'ensemble : suite de parcours, rejouer l'essai réel de bout en bout par Denis.

## 5. Verdict Mode Nuit

**NON APTE AU MODE NUIT.** Décisions ouvertes qui bloquent : D1, D2, D3, D4, D5 (maquette), puis validation des deux prompts sur un vrai assistant par Denis. Après ces décisions et les prompts figés, les étapes 2 à 4 deviendraient aptes au Mode Nuit.

## 6. Points à ne pas oublier

- Ne pas commiter les fichiers de l'autre compte ; chemins explicites ; jamais de push.
- Le module est encore en phase de corrections après tests (voir `docs/RETOURS_TEST_UN_CV_PLUSIEURS_METIERS_2026-10-10.md`) : les points restants et ce chantier se traitent dans des commits séparés. Le travail du 2026-10-13 (`fdfd5177`, `a8517eed`) n'est pas encore consigné dans la passation de `ETAT_DES_CHANTIERS.md`.

## 7. Premiers essais des prompts V1 par Denis (2026-10-15) : constats et corrections

**Essai 1 (lettres retravaillées)** : les 3 lettres rendues, sans signature, formule d'appel gardée, bénévolat ajouté à la lettre 1, aucun tiret long. Défauts : (a) mes lettres d'exemple étaient trop courtes (60 à 85 mots), donc l'assistant les a allongées, ce qui empêchait de juger le « léger retravail » : exemples refaits à 150 mots et plus ; (b) engagements et sentiments ajoutés (« prête à m'engager sur la durée », « travail utile au quotidien ») ; (c) même formule de fin dans deux lettres (« Je serais heureuse de pouvoir vous rencontrer ») et « Je me permets de » ; (d) « plus chaleureux » à peine visible. **Corrigé dans le prompt** : même longueur à 20 % près sans remarque, aucun engagement ni sentiment ajouté, formules de fin différentes, ton par les mots et non par une formule.
**Essai 2 (préparation générale, 3 métiers)** : 6 questions par métier, période sans activité traitée avec délicatesse, aucun fait inventé sur l'employeur, pistes de 27 à 33 mots (limite 30 : légèrement dépassée, à mesurer côté code). Défauts : le sujet `changement` servait pour de simples questions de motivation ; `delicate` appliqué de façon variable. **Corrigé** : nouveau sujet `motivation`, `changement` réservé au vrai changement de métier, règle fixe `delicate` (vrai pour `delicat`, `entreprise`, `changement`, `qualites`).
**Essai 3 (approfondi, niveau Exigeant, 10 questions)** : 10 questions, tous les sujets demandés couverts. Défaut principal : le niveau « Exigeant » ne se distingue pas assez du « Réaliste » (peu d'exemples chiffrés, aucune relance). **Décision à prendre (D6)** : ajouter un champ facultatif `relance` (une phrase, 15 mots au plus) aux niveaux Exigeant et Très exigeant, imprimé sous la piste (« Le recruteur peut relancer : ... »).
**Constat de faisabilité (D7)** : le mode général remplit environ 60 % de la page avec les conseils (cohérent avec ce que voulait Denis). Le mode approfondi à 10 questions représente environ 5 700 signes : tient sur une page à 9 points, trop petit pour le public ; à 12 questions, déborde. **Décision à prendre** : autoriser deux pages A4 pour une préparation approfondie quand elle ne tient pas lisiblement sur une (corps à 10 points minimum).

**D6 TRANCHÉE par Denis le 2026-10-15 : OUI.** Champ `relance` (une phrase, 15 mots au plus), seulement aux niveaux Exigeant et Très exigeant, imprimé sous la piste (« Il peut relancer : ... »). Fait dans `prompts/ucpm-preparation.md` et dans la feuille approfondie de la maquette ; fichier d'essai approfondi régénéré (niveau Exigeant). À faire au code : lecture du champ `relance` (facultatif, chaîne vide acceptée), impression, mesure de longueur.

**D7 TRANCHÉE par Denis le 2026-10-15 : OUI.** Une préparation approfondie peut occuper deux pages A4 (corps de 10 points minimum) ; le mode général reste sur une seule page. À faire au code : mesure de la hauteur de la feuille, saut de page propre entre deux questions (jamais au milieu d'une question), nombre de pages annoncé à la personne.

**Ordre suivi (2026-10-15)** : étape 2 (chantier A, lettres retravaillées) avant l'étape 3 (préparation). Les prompts restent des fichiers `.md` chargés à l'exécution : leur mise au point par Denis continue en parallèle sans bloquer le code.

**Chantier A (lettres retravaillées) CODÉ le 2026-10-15** : bouton « Retravailler cette lettre avec l'assistant » sur chaque lettre (page 6) et rappel page 7 ; choix de la lettre ou de toutes, remarques, style d'écriture, avis (non bloquant) si un téléphone ou un courriel est tapé, signature jamais envoyée ; au retour, ancienne lettre gardée avec « Revenir à la lettre d'avant » (variante de la maquette : pas de fenêtre de confirmation avant le remplacement, mais un retour en arrière toujours possible). Reste du chantier A : essai réel par Denis du prompt V2 corrigé.

## 8. Mise en page réelle mesurée à l'écran (2026-10-15) : trois ajustements à connaître

La maquette estimait qu'une feuille générale remplissait environ 60 % de la page : FAUX, mesuré avec le vrai rendu (corps de 11 points, largeur utile 178 mm). Avec 5 à 6 questions, un recruteur qui cherche, une piste, trois atouts et les conseils en trois colonnes, la feuille débordait sur une deuxième page. Pour tenir D7 (général sur UNE page, approfondi sur DEUX au plus, corps de 10 points au moins) :
1. **Général : exactement 5 questions** (avant : 5 à 6), question de 18 mots au plus, `attente` de 12 mots, `piste` de 25 mots, 3 atouts de 15 mots.
2. **Conseils de savoir-être raccourcis** (trois puces courtes par colonne : avant, pendant, après), texte fixe de l'application, À RELIRE par Denis (`UCPM_CONSEILS_ENTRETIEN`, `modules/un-cv-plusieurs-metiers/logiquePreparation.js`).
3. **Approfondi : limites du prompt resserrées** (question 18 mots, attente 12, piste 25, relance 10, 3 atouts) ; marges de 12 mm (haut et bas) et 14 mm (côtés), interligne 1,3. Résultat mesuré : 5 questions = 1 page à 11 points ; 12 questions avec relances = 2 pages à 10 points ; avec 8 ou 10 questions = 2 pages à 11 points. Si un assistant dépasse les limites, la feuille peut passer à trois pages : l'application le dit (« cette feuille occupe 3 pages A4 »), rien n'est coupé.
Autres écarts avec la maquette : nom de fichier proposé « PREPARATION_NOM » (toutes) et « preparation_metier_NOM » (une seule), même règle que les autres PDF du module ; page 7 : le bouton du bas devient « Préparer mes entretiens (facultatif) » (la page 8 est facultative mais atteignable aussi par le Document 3).
Les prompts V2 corrigés (limites, 5 questions) sont à ré-essayer par Denis sur un assistant (fichiers régénérés dans `docs/essais_prompts_ucpm/`).

## 9. Essais des prompts par Denis sur ChatGPT (2026-10-15, fin de séance)
- **Préparation générale (3 métiers)** : VALIDÉE sur le troisième essai. 5 questions et 3 atouts par métier, période sans activité traitée partout, question de changement de métier présente pour le peintre et la gardienne et absente pour l'agent d'entretien (grâce à la ligne « Changement de métier par rapport au CV de référence » décidée par l'application), aucun fait inventé. Les pistes dépassent parfois la limite (26 à 31 mots pour 25) : sans conséquence, mesuré à 1 page à 10,5 points. Deux réponses précédentes étaient des erreurs de collage (le texte collé n'a pas été exécuté) : le « Rappel final » ajouté aux prompts est gardé par précaution.
- **Préparation approfondie** : essayée une fois (niveau Exigeant, 10 questions, relances présentes), jugée bonne ; non ré-essayée après les derniers ajustements (limites, ligne de changement).
- **Lettres retravaillées** : bonnes (signature absente, bénévolat repris, pas d'engagement ajouté). Défaut restant : phrase finale « contente / ravie de pouvoir échanger » malgré l'interdiction ; prompt renforcé (commit `bc30f1ae`), à ré-essayer une fois.
- **Lettres retravaillées, dernier essai (2026-10-15)** : VALIDÉES. La phrase finale « contente / ravie de pouvoir échanger » a disparu (les lettres finissent sur un fait : contrat, disponibilité). Points mineurs notés sans correction : la demande « plus chaleureux » reste peu visible ; une phrase légèrement ajoutée (« cet engagement fait partie de mon quotidien ») ; la candidature spontanée est dite par « je vous contacte directement » sans « même sans offre publiée ». À surveiller sur de vrais usages.
