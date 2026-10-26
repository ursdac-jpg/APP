# Chantier : étape « complément du CV » avant la page de création, « Valider » dans la barre, suggestions de mise en page qui remplissent la page

> Ouvert le 2026-10-19, Mode A, `[effort : haut]`. Demandes de Denis du 2026-10-19 (captures 9, 10, 11). Ce fichier fait foi : une case par tâche.
> Aucune donnée de personne ici.

## Ce que Denis demande (reformulé)

1. **Touche Entrée dans les questions « passages à préciser »** : le texte disparaîtrait. Non reproduit en local (voir « Constat »).
2. **Case « Barre à gauche du texte »** : grisée quand « Sans accroche » est cochée. FAIT (2026-10-19).
3. **Suggestions de mise en page** : dès qu'on clique une suggestion, le CV doit occuper toute la page (remplir ou réduire) automatiquement, avec les mêmes leviers que le bouton « Mise en page », du moment que tout tient sur une page.
4. **Étape « complément du CV » AVANT la page de création** : après la 1re partie, la personne choisit entre importer la 2e partie ou passer. Passer est un bouton bien visible, avec un message disant qu'elle a déjà de quoi générer le CV avec l'essentiel. Si elle recolle le même message que la 1re partie : message l'invitant à retourner dans la dernière fenêtre de l'assistant en ligne, répondre « oui », et revenir avec la 2e partie. Jamais le mot « IA » visible. La page de création n'apparaît qu'après l'import ou le passage.
5. **Page « Vos documents »** : « Valider le CV → » dans la barre du bas (Retour / Accueil). Garder la synthèse actuelle (5 expériences affichées sur 5, estimation d'une page, PDF identique à l'aperçu) visible et non cliquable, avec un titre purement informatif. À droite de cette synthèse, un bouton pour importer le complément. L'écran de choix (point 4) dit explicitement que le bouton restera là plus tard. Le complément importé **garde le modèle, la forme et les réglages déjà choisis** : seul le contenu s'enrichit.

## Constat de l'audit (code réel lu le 2026-10-19)

- **Détection de la question du complément** : `dossier.complementCVPropose = /compl[ée]ment de CV/i.test(texte)` à l'import (`js/app.js` ~13822). `complementCVEnAttente()` = proposé et ni ajouté ni refusé. `fusionnerComplementCV(texte)` fusionne sans rien écraser ; `htmlBanniereComplementCV()` (bandeau « Étape 2 sur 2 ») est affichée en haut de « Vos documents » et de la vue assistant du module.
- **Aujourd'hui** : après « Continuer vers La mise en page », la personne arrive sur « Vos documents » avec un bandeau et, avant validation, un rectangle « Compléter mon CV ». Il n'y a donc PAS de choix explicite avant la page de création.
- **Validation** : `_onValiderRelectureIACV` fait avancer vers `resultats`. Le module « Un CV, plusieurs métiers » (page 3, vue `assistant`) a son propre enchaînement (`p3Vue`), à traiter à part.
- **« Valider le CV »** : `#btnMepValider` dans `.bloc-valider-mep` avec la synthèse (`#mepInfoPage`, `#mepAvertPage`) ; le mécanisme commun `data-barre-bas` (brique B, `docs/BRIQUES_COMMUNES.md`) sait le recopier dans la barre ; la zone cachée doit être le seul bouton (la synthèse reste).
- **Auto-remplissage** : `_pdfAjusterMiseEnPageCalcul()` (aperçu, `cvPdfPanneauReglages.js`) est le moteur du bouton « Mise en page » (échelle, marges, interlignes, en-tête, équilibrage). `_pdfCapturerEtatPersistant()` / `_pdfAppliquerEtatPersistant()` couvrent l'état complet : une suggestion prévisualisée peut donc être annulée proprement.
- **Entrée dans les questions** : essais avec vraies frappes de touches en local : la valeur reste, la pastille passe à « répondu », le focus va à la question suivante puis au bouton « Continuer ». Non reproduit. Hypothèse : version plus ancienne sur le site en ligne.

## Verdicts de faisabilité

| Point | Verdict | Réserve |
|---|---|---|
| 2 case grisée | fait | |
| 3 suggestions qui remplissent la page | faisable avec réserve | le moteur « Mise en page » touche aussi les marges et la taille du texte : une suggestion changera donc plus que son seul réglage. Une suggestion qui ne tient pas sur une page même après ajustement est retirée de la liste. |
| 4 étape complément avant la création | faisable, risque moyen | nouvel écran dans la navigation (Retour, flèche « Précédent », barre d'étapes) ; une branche à part pour le module « Un CV, plusieurs métiers ». |
| 5 « Valider » dans la barre + synthèse titrée + bouton complément | faisable, risque faible | le complément importé après coup doit conserver modèle et réglages : à vérifier par un essai réel. |

## Plan en cases

- [x] **2. `[effort : bas]`** Case « Barre à gauche du texte » grisée sans accroche.
- [x] **5a. `[effort : moyen]`** « Valider le CV » dans la barre (`data-barre-bas`), synthèse conservée avec un titre informatif, sans bouton cliquable dedans.
- [x] **4a. `[effort : haut]`** Écran « Étape 2 sur 2 : le complément » (choix : importer / passer), détection du même message collé deux fois, textes sans le mot « IA ».
- [x] **4b. `[effort : haut]`** Brancher cet écran entre la validation de la relecture et la page de création (parcours « Créer un nouveau CV » et « Mettre à jour »).
- [x] **5b. `[effort : moyen]`** Bouton « Ajouter le complément du CV » à droite de la synthèse, fenêtre d'import, le CV garde son modèle et ses réglages (essai réel avec le CV de test).
- [x] **3. `[effort : haut]`** Suggestions : appliquer le moteur d'ajustement après chaque suggestion (aperçu et application), retirer celles qui ne tiennent pas sur une page.
- [x] **4c. `[effort : haut]`** Même écran dans le module « Un CV, plusieurs métiers » (page 3).
- [ ] **1.** Entrée dans les questions : attendre une précision de Denis (écran, version).

## Décisions à confirmer par Denis (avant 4a)

- Noms des boutons : « Passer, je vois mon CV » (barre, à droite) et « Ajouter le complément du CV » (page « Vos documents »).
- Un seul écran de choix, aussi dans « Un CV, plusieurs métiers » (étape 4c), mais en dernier.

## Réalisé le 2026-10-19 (5a, 4a, 4b, 5b)
- `dossier.complementCVPasse` (nouveau) : « Passer » ne ferme pas la porte ; `complementCVImportable()` = proposé et pas ajouté. Écran `pageComplementCV` (route `complement-cv`), atteint par la garde de `pageResultats` (hors module « Un CV, plusieurs métiers » et hors Découverte, traités à part). Bouton de la barre « Passer, je vois mon CV ». Message si la 1re partie est recollée. Bandeau et rectangle du complément retirés de la page « Assistant » et de « Vos documents » tant que le choix n'est pas fait.
- « Valider le CV » dans la barre (`data-barre-bas`), synthèse sous le titre « Résumé de votre CV », bouton « Ajouter le complément du CV » à droite, fenêtre d'import ; le CV garde son modèle.
- **À savoir** : le complément enrichit les données (missions des formations, qualités attendues...) mais l'éditeur ne les affiche pas d'office : on les choisit dans les cartes de réglage (Formations, Compétences...). Le message d'ajout le dit.
- Essai : `complementCv` dans `scripts/parcours/parcours_smoke.js`.

## Réalisé le 2026-10-19 (3 : suggestions)
- Les leviers de présentation du bouton « Mise en page » sont extraits (`_pdfReduirePourTenir`, `_pdfAgrandirPourRemplir`, comportement du bouton inchangé) et réutilisés par `_pdfAjusterPourSuggestion` : dès qu'une suggestion est choisie (aperçu ou application), le CV est resserré ou agrandi pour remplir la page, sans le message du bouton ni le recalcul de la liste.
- Une suggestion qui ne tient pas sur une page même après ce réglage n'est pas proposée (`_pdfCalculerSuggestions`).
- L'annulation d'un aperçu rend l'état exact : les interlignes et espaces gardés côté page (`dossier.reglagesMiseEnPageCV`, `reglagesProjetXXL`) sont capturés et rendus (`_mepInstantaneParentSuggestion`). Bug trouvé et corrigé pendant l'essai.
- **Limite** : le moteur ne remplit pas au-delà de 90 % de la page (règle d'aération du bouton, 2026-10-11) ; une suggestion peut donc laisser un peu de blanc en bas.
- Essai : `suggestionsPage` dans `scripts/parcours/parcours_smoke.js`.

## 4c TERMINÉ le 2026-10-19 (ancienne passation, conservée pour l'historique)
- **Écrit mais pas encore validé** : `htmlEcranComplementCV()` extraite de `pageComplementCV` (`js/app.js`) ; vue `p3Vue = 'complement'` dans `modules/un-cv-plusieurs-metiers/page3Reference.js` (continuer depuis l'assistant mène d'abord à cet écran, « Passer, je vois mon CV » ensuite l'éditeur ; retour vers l'assistant) ; bandeau et rectangle du complément retirés de la vue assistant tant que le choix n'est pas fait ; essai `unCvMetiersPage3` adapté dans `scripts/parcours/parcours_smoke.js`.
- **Reste** : lancer `unCvMetiersPage3`, `unCvMetiersPage5`, `unCvMetiersRetour`, `unCvPlusieursMetiers`, `complementCv`, `reformulerRetours` sur une page rechargée (fenêtre 738 de large), corriger, `npm test`, commiter. Si un essai échoue pour une raison de fond : `git diff` sur ces 4 fichiers pour revenir en arrière.
- Dernier commit sûr : `0673a234` (suggestions).
- Non traité : l'Entrée dans les questions « passages à préciser » (non reproduite, en attente d'une précision de Denis) ; l'écran du complément pour le parcours Découverte.

**4c vérifié** : parcours `unCvMetiersPage3`, `unCvMetiersPage5`, `unCvMetiersRetour`, `complementCv`, `reformulerRetours`, `barreBas` verts (73 contrôles), `npm test` vert. Une erreur de ma refonte (fonction `ouvrirFenetreComplementCV` effacée par mégarde) a été trouvée par l'essai et corrigée avant commit.

## Suite du 2026-10-19 : Découverte et Entrée
- **Découverte** : « Continuer vers mon CV » mène à l'étape 14 (même écran que « Vos documents » et le module « Un CV, plusieurs métiers », `htmlEcranComplementCV(true)`), « Retour » ramène à « Collez la réponse », « Passer, je vois mon CV » mène à la page de création ; plus de bandeau ni de rectangle du complément à l'étape 12 tant que le choix n'est pas fait. Essai `decouverte` étendu.
- **Entrée dans les questions « passages à préciser »** : toujours non reproduite. Précaution prise : la réponse reste lisible dans l'en-tête de la question (« répondu : 2025 »), le focus passe à la question suivante sans saut de la fenêtre, et un point « à retirer » n'est plus écrasé par « répondu » à la sortie du champ.
- **Complément partout** : trois entrées (Créer mon CV / Vos documents, Un CV plusieurs métiers, Découverte) partagent le même écran, le même message et le même bouton d'ajout tardif.

## Changement de modèle : option A validée et faite (2026-10-19)
- `_pdfResserrerSiDepasse` (aperçu) : après le choix d'un modèle (galerie Créatif, variantes Sobre, « Un autre modèle »), si le CV dépasse la page il est resserré avec les leviers du bouton « Mise en page » ; jamais agrandi ; jamais touché quand tout tient. A4 seulement.
- Essai avec un CV chargé : les 25 modèles Créatif tiennent sur une page. Essai `modeleTient`. 209 contrôles de parcours de modèles verts.
- **À savoir** : le resserrement est conservé quand on passe ensuite à un modèle moins chargé (le texte ne regrossit pas tout seul, « jamais agrandi »). Le bouton « Mise en page » peut le réagrandir.
