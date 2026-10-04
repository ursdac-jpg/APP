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
