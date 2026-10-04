# À garder pour le prochain chantier (liste de Denis du 2026-09-30, à ne pas oublier)

Décision de Denis (2026-09-30) : tout ce qui n'est pas fait ou ne sera pas fait la nuit du 2026-09-30 au 2026-10-01 **se garde et se traite bientôt, dans le prochain chantier**. Cette liste est la mémoire de ces points : elle ne doit jamais être supprimée ni vidée sans que Denis le dise. Quand un point est traité, le cocher ici avec la date et le commit, sans l'effacer.

Liés : `docs/PLAN_MODE_NUIT_2026-09-30.md` (ce qui est fait la nuit), `docs/TACHES_RESTANTES_2026-09-30_NUIT.md`, `docs/PASSATION_2026-09-30_FIN_DE_JOURNEE.md`, `docs/ETAT_DES_CHANTIERS.md` (partie 0).

## A. Chantiers reportés volontairement

- [x] **FAIT (2026-10-01, sur demande de Denis après son essai du 2026-09-30)** : vraie rubrique « Certifications » (titre à part, sous les formations, dans les 24 modèles en PDF et en Word), automatique dès trois certifications, case « Certifications » dans « Éléments supplémentaires » pour la choisir ou la refuser, option « sur 2 colonnes » ; banc : référence régénérée avec 4 certifications dans le jeu de données ; `tests/certificationsRubrique.test.js`. Placement « comme Langues » FAIT le 2026-10-01 : colonne de gauche (juste après Langues) à deux colonnes, après les petites rubriques à une colonne, déplaçable et empilable dans « Déplacer » (grand aperçu), une disposition enregistrée avant la rubrique la reçoit sans rien perdre ; `tests/certificationsPlacement.test.js` ; vérifié dans les 24 modèles en PDF et en Word (rendu Word mesuré pour Colonne). Texte d'origine : **Rubrique « Certifications » à part** (T2 temps 2) : placée comme Langues / Centres d'intérêt (colonne de gauche en deux colonnes, parmi les dernières en une colonne, empilable), dans les 24 modèles PDF et Word, avec l'ordre personnalisé (`ordrePersoRubriques`, `lignesUneColonne`, `ordreColonnes`) et le grand aperçu. À faire avec le chantier de remodelage des Mini CV A5. Avant de commencer : ajouter des certifications au jeu de données du banc (`scripts/word/banc_b7.js`, `__preparer`). Détail du plan : `docs/TACHES_RESTANTES_2026-09-30_NUIT.md` tâche T2. Aujourd'hui : dès 3 certifications, regroupement sur une ligne + case « Garder chaque certification sur sa propre ligne ».
- [ ] **Remodelage des Mini CV A5** (chantier séparé de Denis, pas sa priorité actuelle).
- [ ] **Les ~15 autres écrans à l'ancien rendu du collage** (Reformuler, Wizard CV, PrepLE, Lettre, Entretien, Cohérence x2, Découverte x2, Regard extérieur, Regard recruteur...) : à migrer vers le parcours commun d'envoi à l'assistant, **sur demande de Denis, écran par écran**, un commit chacun (dette B.17 de `docs/BRIQUES_COMMUNES.md`). Le modèle et la brique commune seront ceux posés par le lot N2 du plan de nuit.
- [ ] **Module « Où et sous quel nom chercher »** : en pause, attend les informations de Denis (autre PC). Voir `docs/` (commit `6147890`) et la mémoire `project_module_ou_chercher_en_pause`.

## B. Attend une information ou un fichier de Denis

- [ ] **« Comparer mes pistes » : « la réponse n'a pas pu être lue »** (`collecteErreur` dans sa disquette) : le texte collé est nécessaire pour trouver la cause (probablement le format de la réponse de l'assistant, parser `comparerParserCollecte`).
- [ ] **C6, points 5 et 6** : expérience personnelle affichée sans mission alors que l'assistant en fournit trois ; expériences « Coiffeuse » et « Aide cuisine » absentes du CV affiché. Il faut la disquette de Josianne (celle reçue est celle de Nicolas).
- [ ] **« Escalier »** à reproduire (modèle à préciser) ; Frise / Rectangles / Photo : attendent un exemple précis.
- [ ] **Sortie du dépôt hors d'OneDrive** (erreurs git `unable to map index file`, réessayer suffit) : décision de Denis, sans urgence.
- [ ] **Branche `master-Pc-Denis`** à abandonner ; branches déjà fusionnées (`travaux-2026-09-29-a-verifier`, `logiciels-rubrique-cv`, `nettoyage-b7-ancien-moteur-word`) à supprimer si Denis le veut (jamais de suppression sans son accord).

## C. Tests à la main de Denis (aucun fait)

1. **Essai réel du prompt du CV** : « Reformuler » avec le CV de Nicolas, copier le prompt chez un vrai assistant, coller la réponse : le titre choisi (« Technicien supérieur de maintenance en informatique ») doit rester le premier proposé, sans « junior ».
2. **Reformuler avec le CV de Josianne** (« Gestion du temps », SST) : cartes de situation, Formation, questions sur les années des certifications.
3. **Disquette** : importer son fichier, « Aller directement à l'aperçu ».
4. **Grand aperçu avec la vraie souris** : poignées ⠿, « Mon ordre », position des dates, rectangle rouge.
5. **« Comparer mes pistes » avec un vrai assistant** : copie dans le presse-papiers et ouverture réelle de Perplexity (jamais testées), après la migration du lot N2.
6. **Word du CV de Nicolas à l'œil** (l'en-tête libre ne recouvre plus les compétences ; vérifié par moi dans Word).
7. **« Les mots de votre CV »** (Ma fiche : imprimer).

## D. Petits reports, seulement sur signal de Denis

- [x] **C3 FAIT (2026-10-01, option validée par Denis)** : le prompt de « Reformuler » (`prompts/reformuler-cv.md`) demande 3 à 6 savoirs (connaissances) tirés de ce que le CV montre ; lus par `_reformulerCvNettoyerStruct` (sans doublon, 6 au plus), affichés « Savoirs proposés » à l'écran de choix, ajoutés à `dossier.savoirsCV` (donc à « Vos savoirs », où la personne peut les retirer) ; `tests/reformulerCvSavoirs.test.js`. À juger à ton essai avec un vrai assistant : les savoirs proposés sont-ils justes ?
- [x] **C12 FAIT (2026-09-30 nuit)** : bouton « Enregistrer en fichier » (fichier texte UTF-8, fins de ligne Windows, message qui dit où il arrive) sur la fiche de « Les mots de votre CV » (`modules/ats/index.js`) ; essai ajouté au script de parcours (`ats`).
- [x] **C9 FERMÉ par Denis le 2026-09-30** : le balayage n'a trouvé les deux rectangles que dans « Cohérence de mon dossier » (retirés). Les autres blocs explicatifs sont voulus ; Denis signalera un bloc précis s'il le gêne.
- [x] **Word, Centres d'intérêt en deux colonnes FAIT (2026-09-30 nuit)** : défaut reproduit (colonne 2 décalée sous la colonne 1), corrigé en deux blocs explicites dans une grille (`blocListe`, `cvPdfTemplateMaquette.js`), vérifié dans Word ; banc : aucun des 24 modèles changé.

## E. Décisions prises, rien à faire mais à ne pas perdre de vue

- Mode par défaut de l'expérience personnelle : « Citer seulement » (D3).
- Lignes directrices « alternance » et « formation » : validées par Denis le 2026-09-30 (D2), retouchables (une ligne par situation dans `LIGNES_DIRECTRICES_SITUATION`, `js/app.js`).
- Bloc « Relire et masquer » du Bilan : retrait validé le 2026-09-30 (D1), fait la nuit (lot N1).

## F. Ajouts de la nuit du 2026-09-30

- [x] **Voix humaine étendue aux prompts de réécriture du Bilan** (`bilan-v2.md`, `bilan-v2-lot.md`) : fait la nuit du 2026-09-30 (même fragment, `{VOIX_HUMAINE}`). Reste : ton avis sur le ton obtenu avec un vrai assistant (essai réel de l'accroche, de la lettre, d'une proposition du Bilan) ; les formules à éviter se règlent dans `prompts/_voix-humaine.md`.
- [x] **FAIT (2026-10-01)** CSS `.cp-prompt` retiré de `css/style.css`. Texte d'origine : **CSS `.cp-prompt`** (`css/style.css`) n'est plus utilisé dans Comparer mes pistes : à retirer au prochain nettoyage du CSS.

## G. Ajouts du 2026-10-01 (après-midi)

- [x] **REMPLACÉ (2026-10-01 soir)** Suggestion « dates à gauche » : la demande de fond (gagner de la place, mieux agencer) est traitée autrement, voir « expérience à côté d'une rubrique courte » dans docs/ANALYSE_RETOURS_DENIS_2026-10-01.md. Les dates à gauche elles-mêmes ne gagnent pas de place.
- [x] **FAIT (2026-10-01 soir)** Les 10 retours de Denis du 2026-10-01 (espacer les rubriques, régler le corps, genre partout, lieu non capté, année seule, etc.) : état de chaque point dans `docs/ANALYSE_RETOURS_DENIS_2026-10-01.md`. Reste son test réel à la vraie souris, avec un CV de femme (civilité Madame et civilité vide) et un CV dont les expériences n'ont qu'une année.
- [x] **FAIT (2026-10-01 soir)** CQP APS et autres titres rangés comme « savoirs » : dix titres retirés de data/metiers.js, garde-fou en test. Reste en réserve (décision du 2026-09-30) : suggérer une certification à partir du métier.
- [x] **TRAITÉ (2026-10-01 soir)** Dates à gauche : verdict dans l'analyse ; la demande de Denis (expérience à gauche, autre rubrique à droite) est faite.
- [x] **FAIT (2026-10-01 soir)** Expérience personnelle citée : dates et lieu affichés quand ils sont connus (décision de Denis : « si on a les infos, il faut les afficher »).
