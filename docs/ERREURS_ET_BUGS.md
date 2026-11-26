# Registre des erreurs et bugs - fichier central, commun à toute IA du dépôt

Créé le 2026-08-28, à la demande de Denis, pour répertorier au même endroit toutes les erreurs remontées par le tracker Umami (événement `erreur_js`) et les bugs identifiés, avec leur statut.

## Comment marche le tracker (à savoir avant de lire ce registre)

Il n'y a PAS de fichier `erreur_js`. C'est un **événement Umami** nommé `erreur_js`, envoyé par 2 écouteurs globaux dans `js/app.js` (~ligne 36) :
- `window.addEventListener('error', ...)` -> toute erreur JS **non attrapée**, n'importe où dans l'app.
- `window.addEventListener('unhandledrejection', ...)` -> toute **promesse rejetée non gérée**.

Chaque événement envoie : `message` (tronqué à 200 caractères), `fichier` (nom seul), `ligne`, `page` (le `#hash` de l'écran), et pour les promesses `type: 'promesse_non_geree'`.

### Ce que le tracker NE voit PAS (angles morts - le nombre réel d'erreurs est un plancher, pas la vérité)

1. **Les erreurs attrapées par un `try/catch`** qui ne les relance pas - invisibles (il y en a beaucoup dans l'app, dont les librairies docx).
2. **Si Umami ne charge pas** (bloqueur de pub, réseau coupé, `cloud.umami.is` indisponible) : `trackEvenement()` devient un no-op silencieux -> l'erreur arrive mais n'est jamais remontée.
3. **Les `console.error(...)`** qui ne sont pas des erreurs *lancées*.
4. **Les erreurs de scripts d'un autre domaine** (CDN docx, Umami) : le navigateur renvoie un générique « Script error. » sans détail (CORS).
5. **Pas de pile d'appel, message tronqué à 200 caractères** : souvent juste de quoi savoir « où », rarement de quoi reproduire directement.
6. **Les numéros de ligne viennent du fichier déployé**, pas du source - `js/app.js` change de taille entre deux déploiements, donc une même erreur peut « bouger » de ligne (ex. 12523 -> 13013 = du code ajouté au-dessus, même bug).
7. Certains handlers d'événement renvoient le message sans `fichier`/`ligne` (colonnes vides dans Umami).

**Conclusion** : le tracker attrape la majorité des vrais plantages visibles, mais ce n'est pas exhaustif. Ne jamais conclure « aucune erreur » de l'absence de ligne dans Umami.

## Convention d'une entrée

- **Titre** : le message de l'erreur (ou une description courte du bug).
- **Vu** : date de première apparition connue + fréquence / nombre d'occurrences si connu.
- **Fichier / ligne (Umami)** : tels que remontés (en gardant à l'esprit l'angle mort n°6).
- **Cause** : une phrase.
- **Statut** : `OUVERT` | `CORRIGÉ (commit)` | `NE PEUT PLUS SE PRODUIRE` | `PAS REPRODUCTIBLE` | `EXTERNE (librairie/navigateur)`.
- **Notes** : ce qu'il faut faire / ce qu'on attend pour trancher.

---

## Erreurs répertoriées

### « À partir de mon récit » : impossible d'aller vers le CV alors que tout était rempli (étape « Vos informations »)

- **Vu** : 2026-11-10, signalement d'une personne (ordinateur) : « impossible d'aller au CV à partir du récit alors que tout était complété ».
- **Cause** : à l'étape « Vos informations », le bouton « Continuer » restait grisé tant que l'identité n'était pas enregistrée par un clic sur « Enregistrer mon identité », bouton situé plus bas dans le bloc « Vous ». La seule explication était une infobulle au survol du bouton grisé : invisible pour qui ne survole pas. Reproduit dans le navigateur de test (nom, prénom, téléphone saisis, bouton toujours grisé).
- **Statut** : **CORRIGÉ** (2026-11-10, `modules/decouverte-competences/decouverteParcours.js`, `etapeVosInformationsDecouverte`). Le bouton reste cliquable : si l'identité est complète et saisie par la personne, elle est enregistrée au clic et le parcours continue ; sinon un message visible s'affiche dans la page et ramène au bloc « Vous ».
- **Notes** : la même règle « bouton grisé avec infobulle seulement » existe peut-être à d'autres endroits (étape « Compétences » : toutes les expériences doivent être validées). À contrôler lors de la refonte des parcours de « Créer un nouveau CV ».

### Les mots de votre CV : « Imprimer » imprime des pages blanches

- **Vu** : 2026-09-30, retour de Denis sur l'écran « Ma fiche ».
- **Cause** : le bouton appelait `window.print()` sur toute la page de l'application, dont la mise en page (zones défilantes, barre fixe) ne s'imprime pas.
- **Statut** : **CORRIGÉ** (2026-09-30, `modules/ats/index.js`, `_atsImprimerFiche`). La fiche est imprimée seule, dans un cadre invisible.

### Reformuler mon CV : « Gestion du temps ne figure pas dans votre CV. Voulez-vous la retirer ? » (fausse alerte)

- **Vu** : 2026-09-30, premier test réel sur le CV de Josianne (texte lu sur image : « Gestlon du temps »).
- **Cause** : `pointsQualitesAbsentes` (`data/incoherencesImport.js`) comparait chaque qualité renvoyée par l'assistant au texte du CV mot pour mot. L'assistant avait corrigé l'orthographe (« Gestlon » devenu « Gestion »), donc la qualité paraissait inventée.
- **Statut** : **CORRIGÉ** (2026-09-30). Comparaison tolérante mot par mot (une lettre d'écart pour un mot de 4 à 7 lettres, deux au-delà, mot de 3 lettres ou moins identique). Une vraie invention (« Patience » absente du CV) est toujours signalée. Test : `tests/incoherencesImport.test.js`.

### `Cannot read properties of undefined (reading 'texte')` - rendu du rapport du Bilan

- **Vu** : ~2 jours avant le 2026-08-28 (2 occurrences à « app.js:12523 »), puis 1 occurrence dans les 4 h précédant le 2026-08-28 à « app.js:13013 » - **même bug**, la ligne a bougé car du code a été ajouté au-dessus entre deux déploiements.
- **Cause** : `htmlBilanRapport()` lisait `resultat.premiereImpression.texte` (+ `ceQuiDonneEnvie`, `ceQuiPeutFreiner`, `syntheseProjectionRecruteur`, `syntheseGenerale`) sans filet. Un diagnostic **restauré d'une session exportée par une version antérieure de l'app** ne porte pas forcément ces blocs (le parser les garantit aujourd'hui, mais `bilanStoreRestaurerEtat` ne re-parse jamais). -> crash total du rapport.
- **Statut** : **CORRIGÉ** (`cb0a33a`, 2026-08-28). Défense en profondeur en tête de `htmlBilanRapport` : les blocs manquants deviennent `{}`. Un vieux diagnostic affiche maintenant un rapport partiel, la personne peut relancer l'analyse.

### `Failed to execute 'replaceChild' on 'Node': The node to be replaced is not a child of this node` - index.js:858

### `Failed to execute 'remove' on 'Element': ... Perhaps it was moved in a 'blur' event handler?` - :3609

- **Vu** : ~2 jours avant le 2026-08-28. Filename mal résolu par Umami (« index.js » sans chemin, ou vide).
- **Cause (même famille)** : dans **Regard extérieur**, l'édition inline d'un Repère (`_regardExterieurOuvrirEditionSelection` / `_regardExterieurFermerEditionSelection`) faisait `item.replaceChild(...)` sans vérifier que l'ancien nœud est encore enfant de `item`. Si la liste se re-affiche pendant qu'une édition est ouverte, ou double fermeture (bouton « Valider » avec `setTimeout` 900 ms + un `blur`), le nœud visé n'est plus là.
- **Statut** : **CORRIGÉ** (`cb0a33a`, 2026-08-28) - garde `if (contenu.parentNode !== item) return;` aux 2 endroits. Non visible pour l'utilisateur (chemin de nettoyage d'interface). **Si ça revient**, noter ce qui a été cliqué dans Regard extérieur juste avant (les lignes Umami ne correspondent pas au code source, correction faite sur l'endroit le plus probable).

### Import de réponse d'assistant : « Aucun diagnostic en attente de réponse. » qui persiste après un premier échec

- **Vu** : 2026-08-31, reproduit par Denis sur « Analyser ma candidature ». Réponse valide collée, ChatGPT avait donné le bilan sans commentaire. En revenant sur le site : double clic sur « Importer » (ou « Importer » + collage manuel) -> message d'erreur. « Effacer et recoller » puis « Importer » : le message restait, et **le même bilan valide recollé continuait d'échouer**. Seuls F5 + tout recommencer débloquaient.
- **Cause 1 (le vrai blocage)** : `bilanSoumettreReponseDiagnostic` (et les 2 équivalents Cohérence transversale : `ctSoumettreReponseDiagnostic`, `ctSoumettreReponseEntretienAvance`) exigeaient `diagnostic.statut === 'genere'`. Le premier échec de parsing fait passer le diagnostic à `'echec_parsing'` (dans le store). Tout essai suivant, **même avec un JSON parfait**, était alors rejeté en `SequenceInvalide` « Aucun diagnostic en attente de réponse. » L'écran « Collez la réponse » reste pourtant affiché et invite explicitement à réessayer.
- **Cause 2 (l'effet « message collé »)** : les configs `activerCollageInstantane` de ces écrans n'avaient pas de `onEffacer` pour nettoyer `#messageImport*` (seule la page Action l'avait déjà). « Effacer et recoller » et le collage manuel ne touchaient pas au message.
- **Statut** : **CORRIGÉ** (`523e738`, 2026-08-31).
  - Les 3 orchestrateurs acceptent désormais `'echec_parsing'` à la reprise (le contexte d'analyse est conservé par `bilanMarquerDiagnosticEchecParsing` / équivalents). 3 tests ajoutés (`bilanModuleOrchestrator`, `ctModuleOrchestrator`).
  - `onEffacer` + `onCollerManuel` ajoutés aux 7 configs de collage (Bilan diagnostic, Titre/accroche, Amélioration, Amélioration lot, Cohérence, Entretien avancé, Découverte), + remise à blanc du message en tête de chaque handler « Importer ».
- **Notes** : la même famille de code (état-machine `genere -> complete/echec_parsing` copiée d'un module à l'autre) portait le même bug partout -> corrigé partout d'un coup. Reste un cas non traité : un **double collage automatique** peut mettre deux blocs JSON dans la zone de texte ; « Effacer + recoller propre » récupère, mais l'idéal serait que le parser prenne le dernier bloc valide (refinement séparé si ça remonte).
  - **Vérifié 2026-09-10** : toujours non traité. `extraireBlocJSONDepuisTexte()` (`js/app.js:24733`) prend la portion de la **première `{` à la dernière `}`** - avec deux blocs collés, elle engloberait les deux et `JSON.parse` échoue. Bas volume, contournement « Effacer + recoller » suffisant, laissé tel quel. Si ça remonte : itérer sur les blocs `{...}` équilibrés et garder le dernier qui parse.

### « Sans accroche » cochée : l'accroche restait dans le Word et dans le texte copié (trouvé et corrigé le 2026-09-29)
- **Symptôme** : la case de la carte « En-tête de CV » retirait l'accroche du PDF, mais le fichier Word et « Copier le texte » la contenaient encore.
- **Cause** : la case n'écrivait que dans `dossier.reglagesMiseEnPageCV` (lu par le PDF). Le Word et le texte copié lisent `etatApercuInline.cv.sansAccroche`, jamais mis à jour dans l'écran unique. Après un rechargement de session, les deux états pouvaient aussi diverger.
- **Correction** : `_mepDefinirSansAccroche` aligne toujours les deux états ; `_appliquerReglagesMiseEnPageCV` resynchronise à chaque passage ; garde finale `_cvSansAccrocheSiDemande` dans `construireObjetCVPourExport`. Vérifié en lisant le vrai `word/document.xml` (A4 détaillé, complet, essentiel, A5).
- **Règle** : un réglage de contenu doit être vérifié dans TOUTES les sorties (PDF, Word, texte copié), en ouvrant le fichier produit, pas seulement l'aperçu.

### « Choisir ce qui ira sur le CV » disparu après l'import de la réponse de l'assistant (trouvé et corrigé le 2026-09-30)
- **Symptôme** : après le deuxième passage, « Vos documents » n'affichait que « Terminez d'abord l'étape « Choisir ce qui ira sur le CV » ci-dessus » : l'étape en question n'existait plus à l'écran, plus de synthèse de l'import, plus de mise en page. Blocage total du parcours CV.
- **Cause** : le commit `50b6d45f` (2026-09-29) a conditionné l'affichage de ce rectangle à `dossier.ia.cv.recommandations.length`. Pour le CV, `recommandations` est un objet (pas une liste) : `.length` est toujours indéfini, donc le rectangle ne s'affichait jamais. Le libellé « réponse importée » de la page Assistant avait le même défaut, en place avant.
- **Correction** : les 3 endroits de `js/app.js` utilisent `_dossierIaContientDesChoix(docActif)` (la fonction déjà existante qui dit « le deuxième passage est fait »).
- **2e passage du même bug (trouvé le 2026-09-30, tard)** : la première correction ne couvrait que le cas « réponse déjà appliquée au dossier ». Juste après « Importer dans le CV », la réponse n'est qu'en mémoire (`_brouillonRelectureIACV`) et n'est écrite dans le dossier qu'après « Continuer » : le rectangle restait masqué, donc page vide. Corrigé par `reponseIAImportee()` (dossier OU brouillon en attente). Reproduit puis vérifié en rejouant le vrai parcours (Mettre à jour mon CV, collage, Importer, Continuer vers La mise en page).
- **Règle** : ne jamais tester une donnée avec `.length` sans avoir vérifié son type dans `creerDossierIAVide()`. Un changement de condition d'affichage se teste avec un vrai JSON de l'assistant, jusqu'à l'écran final.

### Un CV qui « tient sur une page » à l'écran passe sur 2 pages à l'impression PDF (trouvé le 2026-10-07, MESURÉ le 12/11/2026 : limité à un seul modèle, NON corrigé)
- **Symptôme** : dans l'essai de fusion de 5 CV, le CV du métier « Vendeuse » (données de test du banc B7) donne 2 pages imprimées par Chrome, alors que l'aperçu mesure 1 seule page (`nbPages` = 1, aucun débordement mesuré). La 2e page ne contient que « Langues » et « Centres d'intérêt » (bas de la colonne de gauche). Les 4 autres CV de l'essai donnent bien 1 page.
- **Piste** : à l'écran, le bas du contenu de ce CV est à 1089 px sur 1122 (33 px libres, pour 63 px libres sur les autres). L'impression ne retrouve pas exactement les mesures de l'écran : un CV très rempli peut perdre quelques lignes. Ni `padding-bottom: 0` ni `min-height` réduit ne suppriment la 2e page : la cause exacte n'est pas trouvée. Reproduit aussi hors fusion (page réelle de l'application imprimée seule).
- **Mesure du 12/11/2026** (outil `scripts/rendu/imprimerReel.js`, impression réelle par Chrome des 39 modèles de la galerie avec le jeu d'essai du banc, très rempli) : 37 modèles sur 39 s'impriment sur 1 page comme l'aperçu. **Seul « Rectangles arrondis » (versions créative et sobre) passe sur 2 pages** : sa feuille mesure 1 173 px de haut pour 1 123 px (A4), soit environ 50 px de trop, alors que l'aperçu compte 1 page (il compte les feuilles, pas leur débordement). Le défaut du CV « Vendeuse » signalé le 07/10 n'est plus le même : il ne touche plus que ce modèle et ce jeu d'essai. Non corrigé : décision de Denis (voir le plan du 12/11/2026).
- **Cause établie le 12/11/2026 (même séance, pas un défaut du test)** : le CV d'essai est très rempli (3 expériences, 4 certifications, 2 formations, un engagement, des loisirs). Avec ce contenu, « Rectangles arrondis » mesure 1 173 px (sobre) et 1 199 px (créatif) pour 1 123 px, MÊME après le resserrage automatique de l'application, qui s'arrête volontairement à 9 px de texte. Les 4 certifications pèsent le plus : sans elles, ou avec 2 seulement, le modèle tient sur 1 page (1 123 px) ; avec 2 expériences et 4 certifications il dépasse encore (1 131 px sobre). Le bouton « Mise en page » ne retire jamais de contenu (décision du 26/09/2026) et n'affiche son message « le CV dépasse encore un peu la page » qu'APRÈS un clic ; à l'ouverture et au changement de modèle, rien n'avertit la personne. L'aperçu compte 1 feuille, l'impression en donne 2. Les deux outils de mesure : `scripts/rendu/imprimerReel.js` (impression réelle, remplissage de l'application actif par défaut) et l'option `window.__bancRemplissage` de `scripts/rendu/banc.js`.
- **Règle** : la mesure d'aperçu ne prouve pas le nombre de pages imprimées. Toute promesse « un CV par page » (module « Un CV, plusieurs métiers ») exige une marge de sécurité et une vérification par impression réelle (Chrome sans interface : `--print-to-pdf`).

### Les langues disparaissaient du CV avec l'option « Bandeau séparé » des coordonnées (trouvé et corrigé le 2026-10-08)
- **Symptôme** : cocher « Coordonnées en bandeau séparé » (ancien nom, champ `bandeauDisponibilite`) faisait disparaître la rubrique « Langues » du CV PDF, sans la retrouver ailleurs.
- **Cause** : le moteur de composition (`composeurComposition.js`) vide la liste des langues quand cette option est active, parce que le bandeau du Word les reprenait. La bande du PDF (`.bande-coord`) n'affichait que les coordonnées. Défaut ancien, resté invisible parce que l'option était rarement cochée ; il est apparu quand la case, le tirage au sort et le calcul « Mise en page » l'ont activée plus souvent (essai `tirageStandard`).
- **Correction** (version finale, 2026-10-08) : le PDF ne transmet plus l'option au moteur de composition (`_pdfConstruireResultatCourant`, 3e argument toujours `false`) ; elle ne sert qu'à afficher la bande, qui ne montre que les coordonnées ; les langues restent dans leur rubrique. (Première version, abandonnée : remettre les langues dans la bande.) À vérifier un jour côté Word : le bandeau Word lit `composition.contenuRetenu.langues`, qui est vide dans ce cas (même cause), donc les langues y sont peut-être absentes aussi.
- **Règle** : une option qui retire un contenu d'un endroit doit prouver, par un essai qui compare TOUS les mots du CV avant et après, qu'il apparaît ailleurs.

### Essai de parcours « ucpm p6 : on arrive toujours en haut de la page... » en échec, présent avant les modifications du 2026-10-13 (PASSE depuis : parcours `unCvMetiersPage6` rejoué le 12/11/2026, 27 vérifications, 0 échec ; l'échec venait de la fenêtre étroite du navigateur de test)
- **Symptôme** : dans `scripts/parcours/parcours_smoke.js`, parcours `unCvMetiersPage6`, le cas « on arrive toujours en haut de la page, sur le style d'écriture, même venant d'une page défilée » échoue (« avant 111.2, après 111.2 »). Vérifié en mettant de côté les modifications du jour : l'échec est identique, il ne vient donc pas d'elles.
- **Cause probable (non vérifiée)** : la page n'est pas réellement défilée dans le volet du navigateur intégré (fenêtre étroite), donc la mesure « avant » et « après » est la même. À rejouer dans une fenêtre plus grande avant de toucher au code.

### Carte « Choisir une ambiance » : texte écrasé à 36 px quand elle est ouverte avec les boutons agrandis (CORRIGÉ le 2026-10-20)
- **Symptôme** : essai `grandsBoutons` de `scripts/parcours/parcours_smoke.js` en échec (`amb-txt:72/36`) ; à l'écran, « Choisir une ambiance » écrasé en une colonne étroite entre la palette de couleurs et « Fermer ».
- **Cause (vérifiée)** : reproduit à 1200 px de large avec « Boutons plus grands » et la carte ouverte. La colonne de la mise en page fait 288 px ; moins les marges (2 × 14 px), les écarts (2 × 14 px), la palette (145 px) et « Fermer » (48 px), il restait 36 px au texte. Absent à 738 et 1440 px (colonne plus large) et quand la carte est fermée.
- **Correction** : `css/mise-en-page-maquette.css`, la carte passe à la ligne (`flex-wrap`) et le texte garde au moins 7 rem ; quand la place manque, le texte se met sous la palette. Essai `grandsBoutons` : 17 sur 17.
- **Statut** : CORRIGÉ.

### Boutons agrandis : six boutons de la carte « Compétences » débordaient à 1043 px de fenêtre (CORRIGÉ le 2026-10-20)
- **Symptôme** : à 1043 px de large avec « Boutons plus grands », « Afficher les compétences… », « Les montrer et les choisir », « Deux colonnes », « Pastilles » et « Texte » dépassaient de leur carte ; l'essai `grandsBoutons` échouait à cette largeur et passait à 1200 px.
- **Cause (vérifiée)** : la grille à deux colonnes `.grille-el` gardait deux colonnes de 279 px dans une carte de 497 px ; avec les gros boutons, chaque colonne ne pouvait plus se rétrécir.
- **Correction** : `css/mise-en-page-maquette.css`, en boutons agrandis la grille passe à une colonne dès qu'il n'y a pas la place pour deux (`auto-fit`, 17 rem), et les lignes de boutons passent à la ligne. Essai `grandsBoutons` : 17 sur 17 à 1043 et à 1200 px.
- **Règle** : un essai de mise en page se rejoue à plusieurs largeurs (738, 1043, 1200), pas à une seule.
- **Statut** : CORRIGÉ.

### CV : ruban court sur « Colonne et frise » Sobre, le début du nom et du titre est blanc sur fond clair (CORRIGÉ le 2026-10-30)
- **Symptôme** : modèle `sobre:mq-frise`, bandeau en tête « ruban court » sens 1 : la diagonale du bandeau laisse le début du nom (le « C » de Camille) et le début du titre (« Ag » de Agent de sécurité) sur le fond clair de la colonne, en blanc sur gris clair, donc illisibles. Même famille, constatée une seule fois sur `creatif:colonneBandeau` et `creatif:colonneClaire` (bandeau diagonale sens 1) : une ligne de coordonnées sombre au milieu de lignes blanches ; non reproduite à la relance.
- **Constat** : balayage des 39 modèles le 2026-10-30, mode complet (illisible : 1 cas sur 39 modèles ; mélange de couleurs : 2 cas non reproduits) et options court/moyen (0 anomalie sur les 78 passages). Capture du cas : `C:\tmp\ph1\sobre_mq-frise__bandeau_rubanCourt_1.png` (non gardée dans le dépôt).
- **Cause (vérifiée)** : le modèle `sobre-frise` construit son propre CSS et sort de `cvPdfTemplateMaquette.js` avant le bloc qui écrit la forme du bandeau pour le texte à deux tons (`--clip-bandeau`, `--hors`, `--hors-actif`). La copie `.tete-hors` n'était donc jamais posée : tout bandeau de forme découpée y laissait du texte blanc sur la colonne claire, pas seulement le ruban court.
- **Correction** : `cvPdfTemplateMaquette.js`, la branche frise sobre émet les mêmes variables et règles que le bloc générique (bandeau seulement). Scan de lisibilité `mq-frise` : 0 cas sur 34 scénarios ; `mq-photo`, `mq-rectangles`, `mq-grille` : 0 ; `npm test` : 2193.
- **Statut** : CORRIGÉ. Les deux cas de « mélange de couleurs » sur `colonneBandeau` et `colonneClaire` ne se sont pas reproduits et restent à surveiller.

### Version rapide : la réponse à « Quelques passages à préciser » ne corrigeait pas le dossier (trouvé le 01/11/2026, CORRIGÉ le 01/11/2026)
- **Symptôme** : en version rapide (lettre et entretien), répondre à une question comme « sSsT » devenu « SST » ne changeait rien dans « Vos informations » ; la réponse n'était pas non plus rangée dans les informations non classées : elle était perdue sans message.
- **Cause** : le rangement dans le dossier (`fusionnerDonnees`) se faisait AVANT les questions, puis la réponse était appliquée sur la copie `valeurs`, déjà sans lien avec le dossier ; la fonction renvoyait « appliqué », donc rien n'était gardé ailleurs. Vérifié au navigateur avant la correction (valeurs corrigées, dossier inchangé).
- **Correction** : les questions sont posées dans le bloc en page (`modules/passages-a-preciser/`), qui applique la réponse sur le dossier lui-même ; essai `prepLEPassages`.
- **Statut** : CORRIGÉ (étape 3 du chantier relecture en page).
- **Règle** : une correction doit s'appliquer sur l'objet qui sera réellement lu après, jamais sur une copie ; l'essai doit relire le dossier, pas l'objet corrigé.

### Regard extérieur : « Aller plus loin » ne faisait plus rien après un rechargement (trouvé le 01/11/2026, CORRIGÉ le 01/11/2026)
- **Symptôme** : depuis un ancien rapport rouvert dans « Mes rapports » (session sauvegardée puis rechargée), on répondait à toutes les questions de « Aller plus loin », puis rien ne se passait à la fin : pas de message, pas d'assistant.
- **Cause** : l'assistant choisi (`_regardExterieurDernierAssistant`) n'est pas sauvegardé ; `_regardExterieurLancerApprofondissementFinal` s'arrêtait en silence (`if (!assistant) { return; }`). Trouvé en relisant le code pour la maquette « Regard extérieur sans fenêtres ».
- **Correction** : si aucun assistant n'est retenu, la fenêtre « Choisissez votre assistant » s'ouvre, puis l'envoi continue. Vérifié au navigateur (assistant effacé, fonction appelée : la fenêtre s'ouvre avec les 6 assistants).
- **Statut** : CORRIGÉ. Le déroulé sans fenêtres de la maquette passera toujours par l'étape « Assistant » quand aucun n'est retenu.
- **Règle** : une variable de travail qui n'est pas sauvegardée ne doit jamais conditionner la fin d'un parcours sans solution de repli visible.

## Camembert de « Comprendre les chiffres » : trou blanc dans le disque (2026-11-06)

**Symptôme** : sur « Depuis combien de temps les demandeurs sont inscrits » (Haute-Vienne, 46 % et 54 %), un quart du disque restait blanc. **Cause** : les parts étaient tracées par des tirets d'un trait très épais (`stroke-dasharray` avec `pathLength`), que le navigateur découpe mal. **Correction** : chaque part est maintenant une vraie part de gâteau (chemin SVG), la somme fait le tour complet ; test passé sur `data-pct`. Règle : jamais de tirets pour dessiner une part de disque.

## Visite guidée (ampoule) : bulle coupée en bas de l'écran, bouton « Suivant » inatteignable (2026-11-08)

**Symptôme** : sur un écran de 720 px de haut, à l'étape 2 de la visite de « Reprendre mon CV », le bas de la bulle (boutons « Précédent », « Fermer », « Suivant ») sortait de l'écran. **Cause** : la position de la bulle supposait une hauteur fixe de 170 px, alors que le texte d'une étape en demandait plus de 300. **Correction** : la hauteur réelle de la bulle est mesurée avant de la placer (`positionnerVisiteGuidee`, js/app.js) ; vérifié sur 1280x720, 1024x600 et 390x800, quatre étapes chacune. Trouvé en préparant la vidéo « Besoin d'aide ». Règle : un placement qui dépend d'une hauteur se mesure, il ne s'estime pas.

- 12/11/2026 : « Rectangles arrondis » : texte caché par le rectangle « Savoirs » (disposition de départ) et par les rectangles déplacés ; corrigé (texte poussé, commit ad488afe). Un CV très rempli peut encore passer sur 2 pages : un message jaune le signale maintenant. Limite : un rectangle presque entièrement couvert grandit beaucoup.

## Certifications et loisirs : années et missions saisies dans « Vos informations » jamais utilisées (trouvé le 2026-11-15)

**Symptôme** : dans « Vos informations », cliquer sur une certification ou un loisir ouvre un panneau avec années et « Ce que vous avez fait (une mission par ligne) » ; ce que la personne y écrit n'arrive ni à l'assistant ni sur le CV. **Cause** : ces deux rubriques restent des listes de simples textes (`dossier.certifications`, `dossier.loisirs`) et les détails vivent à part dans `dossier.detailsCatalogue` ; seul le champ « contexte » est lu (`texteContextesCatalogues`, `js/app.js`). Les dates et les missions ne sont lues par rien (vérifié par recherche dans tout le dépôt). Les engagements et les expériences personnelles, eux, transmettent bien leurs missions. **Statut** : CORRIGÉ le 2026-11-15 (chantier « citer ou développer », consignes 355 à 357) : les missions et l'année d'obtention des certifications sont transmises à l'assistant, la zone de missions des loisirs est retirée (leurs années restent transmises).

## « Réduire les espaces » sans effet sur le CV affiché (trouvé et corrigé le 2026-11-16)

**Symptôme** : cocher « Réduire les espaces » dans la carte « Organisation du CV » ne changeait rien à l'aperçu (la hauteur du CV restait identique à celle d'origine). **Cause** : depuis le chantier « plus de clignotement » (Lot 8, fin octobre), ce réglage demandait de conserver l'aperçu vivant pendant 4 secondes ; or la densité n'est lue qu'à la reconstruction du CV, donc l'aperçu conservé n'affichait aucun changement. « Agrandir les espaces » tombait dans la même fenêtre de 4 secondes s'il était cliqué juste après. **Correction** : la demande de conservation est retirée du gestionnaire de « Réduire les espaces » (js/app.js). Vérifié : compact 644 px, normal 669 px, aéré 694 px (essai `rubriques`).

## Un tirage du dé empilait plusieurs étapes d'annulation (trouvé et corrigé le 2026-11-16)

**Symptôme** : après un clic sur le dé (style au hasard), un seul « Annuler » ne ramenait pas le CV à l'état d'avant le tirage (jusqu'à deux étapes par clic mesurées : 27 pour 14 clics). **Cause** : le tirage des formes du bandeau, de la colonne, du croisement et du décor (`_mepTirerFormesCv`, `js/app.js`) passait par `_mepReglageMoteur` sans geler l'historique. **Correction** : l'historique est gelé pendant cet appel, le clic ne pousse que sa propre étape. Vérifié : essai `tirageStandard` 45 sur 45.

## Fiches écrites à la main rattachées au mauvais code du ROME (trouvé le 2026-11-17, CORRIGÉ le 2026-11-25 pour les cinq fiches : Couvreur, Ouvrier agricole, Ouvrier de chai, Auxiliaire petite enfance, Logisticien)

**Symptôme** : en faisant chercher le niveau d'accès des métiers sans niveau par un autre assistant, celui-ci a signalé que notre fiche « Couvreur » porte le code F1610 alors que, dans le ROME, F1610 est « Installateur mainteneur en systèmes solaires » (le couvreur est F1619). Contrôle fait sur les 135 fiches écrites à la main : deux autres noms ne correspondent pas à leur code, « Ouvrier agricole / viticole » (A1405, ROME : Arboriculteur) et « Ouvrier de chai / Agent de cave » (A1413, ROME : Brasseur de bière) ; « Auxiliaire petite enfance » (K1303, ROME : Baby-sitter) et « Logisticien » (N1301, ROME : Analyste logistique) sont à regarder. **Cause probable** : le code a été attribué à la main à l'écriture de la fiche. **Effet** : le niveau d'accès, les lettres RIASEC et les conditions de travail lus par code peuvent décrire un autre métier que celui nommé. **Choix à faire (Denis)** : changer le code de la fiche (F1610 en F1619, par exemple), ou renommer la fiche selon le code. Rien n'est modifié : il faut d'abord vérifier fiche par fiche, car ces données alimentent aussi les propositions de métiers du module « Explorer les métiers ». **Corrigé le 25/11/2026 (choix de Denis, option « corriger le code »)** : Couvreur F1619 (niveau 3, lu sur MétierScope) ; Ouvrier agricole / viticole A1405 vers A1419 ; Ouvrier de chai / Agent de cave A1413 vers A1422. Le générateur ignore tout code déjà pris par une fiche à la main : les fiches générées « Ouvrier agricole polyvalent » et « Caviste de chai » n'existent donc plus (leurs deux secondes descriptions de `data/descriptionsEcrites.js` retirées, les fiches à la main ont les leurs), et « Brasseur de bière » (A1413, niveau 4) devient une fiche générée. Fichiers régénérés : `data/metiersRome.js`, `data/rome/nomsEmploi.js`. **Les deux dernières, corrigées le 25/11/2026 sur le même principe** : « Logisticien » N1301 (ROME : Responsable logistique, niveau 6) vers **N1210** (ROME : Logisticien, niveau 5) ; « Auxiliaire petite enfance » K1303 (ROME : Baby-sitter, déjà porté à juste titre par « Garde d'enfants à domicile ») vers **K1307** (ROME : Animateur petite enfance, accessible avec le CAP Accompagnant éducatif petite enfance, niveau 3 ; le module des formations rattache déjà « petite enfance » et « AEPE » à K1307). « Responsable logistique » (N1301) devient une fiche générée ; « Animateur petite enfance » (K1307) disparaît au profit de « Auxiliaire petite enfance » (sa seconde description de `data/descriptionsEcrites.js` retirée). Le métier « Logisticien » a maintenant une fiche dans « Chercher un métier » (1921 métiers au lieu de 1920). Choix de code à relire par Denis : K1307 plutôt que J1304 (Auxiliaire de puériculture, diplôme d'État du secteur de la santé).

## Graphiques du chemin « Les emplois en demande » : barres écrasées et texte qui débordait sur téléphone (trouvé et corrigé le 2026-11-18)

**Symptôme** : sur téléphone, dans la lecture « Barres » des emplois en demande, la colonne de la barre tombait à 0 pixel et le texte « Au moins 692 projets, dont 610 saisonniers » dépassait de l'écran (page plus large que l'appareil). **Cause** : le composant partagé de « Comprendre les chiffres » interdit le retour à la ligne de la valeur (`white-space: nowrap`) ; ce chemin lui donnait un texte long. **Correction** : dans ce chemin seulement (`#cmrGraphique`, `css/style.css`), le nom, la barre et le texte se rangent l'un sous l'autre sous 640 pixels ; le composant partagé n'est pas touché. Vérifié sur téléphone (375 pixels, aucun débordement).

## Métiers proposés peu pertinents : égalités classées par ordre alphabétique, étiquettes de fiche bruitées (trouvé le 2026-11-19, PARTIELLEMENT CORRIGÉ le 2026-11-19 par la consigne 488 : pourcentage plafonné par le nombre de choix, départage par le contenu, message « aucun métier reconnu » ; RESTE : étiquettes bruitées à la source, option C)

**Symptôme** : dans les chemins « Par ce que vous aimez faire » et « Par un questionnaire », les métiers proposés collent peu aux choix ; la liste de tête ressemble à un tirage au hasard (« Affûteur d'outillage industriel », « Agent d'entretien des piscines »...). **Cause** : (1) des centaines de métiers sont à égalité (45 % avec un seul choix, 100 % pour 280 métiers au code RIA) et l'égalité est départagée par l'ordre alphabétique ; (2) les listes « avec qui ou quoi / ce que je fais / où » des fiches issues du ROME sont déduites par des règles automatiques parfois trop larges (ORL « animaux d'élevage », AES « machines »). **Effet** : mesuré le 19/11/2026, les métiers d'exemple du catalogue ne sont dans les 10 premiers que 16 % du temps pour un choix seul. **État** : analyse faite, rien n'est modifié ; détail, chiffres et options dans `docs/AUDIT_PERTINENCE_METIERS_PROPOSES_2026-11-19.md` (consigne 487).

## « Bien utiliser l’IA » : les chemins Modèles et Écrire plantaient à l’ouverture (trouvé et corrigé le 2026-11-25, module encore fermé au public)

**Symptôme** : `TypeError: _buiaP._buiaNorm is not a function` puis `_buiaP.buiaDateFrancaise is not a function` à l’ouverture des routes `bien-utiliser-ia-modeles` et `bien-utiliser-ia-ecrire`. **Cause** : `modelesUi.js` (ajouté avec le partage entre collègues) déclarait `function _buiaP()`, qui remplaçait l’objet `var _buiaP` de `papierLogique.js`. **Correction** : la fonction d’écran s’appelle `_buiaPartageUi()` ; garde-fou `tests/nomsGlobauxUniques.test.js`. Voir la leçon 9.224. **Reste** : deux anciennes collisions de noms non corrigées, listées dans ce test (`_mepRerendre` : la fonction de `cvPdfCartesMaquette.js` est remplacée par la variable de `js/app.js` ; `MOTS_VIDES_RECHERCHE_ERIP` déclarée dans deux fichiers de données) ; effet réel à vérifier au navigateur avant d’y toucher.

## « Bien utiliser l’IA » : un mot ou une adresse très longue écrit par la personne élargissait la page (trouvé et corrigé le 2026-11-25, sur téléphone et sur ordinateur)

**Symptôme** : dans les chemins « Écrire la mienne » et « Modèles », une adresse web ou un mot sans coupure tapé dans un champ passait dans la demande affichée à côté : la page faisait 786 px de large sur un écran de 375 px, avec défilement sur le côté. **Cause** : la grille en deux colonnes (`.buia-deux-col`), repliée en une colonne sur petit écran, ne laissait pas rétrécir sa colonne (largeur minimale automatique) et le texte de la demande n'avait pas de coupure forcée. **Correction** : `min-width: 0` sur les enfants de la grille et `overflow-wrap: anywhere` sur `.buia-demande-texte` (`modules/bien-utiliser-ia/bienUtiliserIa.css`). Trouvé par le balayage avec saisies (`npm run telephone:modules -- --saisies`), que les balayages sans saisie ne pouvaient pas voir.

## Téléphone : champs de saisie à 14 px qui font zoomer la page sur iPhone (trouvé et corrigé le 2026-11-25)

**Symptôme** : sur iPhone, toucher une zone de saisie (Vos informations, listes du réglage du CV, tableau de bord de Cohérence, réponses ciblées) agrandit toute la page, qui reste zoomée. **Cause** : Safari zoome sur un champ dont l'écriture fait moins de 16 px ; plusieurs champs étaient à 14 px. **Correction** : règle `font-size: max(16px, 1em)` sur écran tactile ou de moins de 768 px (fin de `css/style.css`) et contrôle `champsPetits` dans la mesure partagée `scripts/rendu/mesureTelephone.js`. Leçon 9.228. Ligne dans `data/problemesCorriges.js`.

## Téléphone : phrases et choix coupés dans « Votre parcours » et les Repères, « À compléter » coupé dans les appuis de la lettre (trouvé et corrigé le 2026-11-24)

**Symptôme** : sur téléphone (375 px), la fin des phrases d'explication et certains choix de « Votre parcours » sortaient de l'écran ; même défaut dans la liste des rapports des Repères ; la mention « À compléter » ou « Fait » dépassait du cadre des appuis de la lettre. **Cause** : colonnes de largeur fixe (26 rem dans `_vpStyle`, 380 px dans les Repères) et mention sans retour à la ligne (`.appui-etat`). **Correction** : colonnes qui suivent la largeur de l'écran, mention qui passe à la ligne. Trouvé par le garde-fou `npm run telephone`. Leçon 9.220. Lignes dans `data/problemesCorriges.js`.

## Téléphone : zones à toucher de moins de 44 px (trouvé et corrigé les 2026-11-24 et 2026-11-25)

**Symptôme** : au doigt, des commandes étaient trop petites pour être touchées sans erreur : flèches du haut (18 px), pastilles d'étapes, boutons de retour, cases, titres repliables, réglage du CV, et, le 25/11, le Lexique (chapitres, favori, liens de fiche), les vidéos, Explorer les métiers (puces, filtres), Options d'affichage, filtres des Nouveautés, liens utiles. **Cause** : tailles pensées pour la souris. **Correction** : zone de 44 px sur écran tactile ou étroit seulement (bloc « Écran tactile » de `css/style.css`, `modules/lexique/lexique.css`, `modules/video-presentation/videoPresentation.css`), l'ordinateur ne change pas (empreintes de 204 pages avant et après). Garde-fous : `npm run telephone`, `telephone:parcours`, `telephone:modules`, `tests/telephoneGarde.test.js`. Pas de ligne dans « Problèmes corrigés » : c'est un confort général, annoncé dans les Nouveautés (« Plus simple à utiliser sur un téléphone »).

## Régler le CV : croix de retrait sur des titres que le retrait ne sait pas traiter (corrigé le 2026-11-25)

**Symptôme** : en plein écran, dans « Retirer une rubrique ou une mission », une croix s'affichait sur les titres Compétences (professionnelles, comportementales, en action), Savoirs et Informations complémentaires, que le retrait ne sait pas enlever. **Correction** : table unique `_PDF_RUBRIQUE_VERS_CONTENU` dans `modules/cv-pdf-html/cvPdfTemplateMaquette.js` ; la croix n'apparaît que là où le retrait agit (aussi sur ordinateur, seul changement voulu sur ordinateur). `tests/retirerRubriqueCroix.test.js`. Ligne dans `data/problemesCorriges.js`.

## Disquette : date du nom de fichier avec l'année d'abord et l'heure UTC (corrigé le 2026-11-25, commit 9caf91bb)

**Symptôme** : le nom du fichier enregistré commençait par l'année et son heure pouvait être décalée d'une ou deux heures. **Cause** : date formée à la main en heure UTC à plusieurs endroits. **Correction** : source unique `dateFichierFr` (`modules/cv-core/dates.js`, heure locale, jour-mois-année), par exemple `session-cv-25-11-2026-09h30.json` (consigne de Denis du 25/11/2026). `tests/dateFichierFr.test.js`. Ligne dans `data/problemesCorriges.js` et dans le journal.
