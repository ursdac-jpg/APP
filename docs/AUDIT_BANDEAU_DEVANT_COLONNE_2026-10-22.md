# Audit : choisir si le bandeau passe devant la colonne, ou la colonne devant le bandeau (2026-10-22)

Mode A, `[effort : haut]`. Demande de Denis (2026-10-21). Audit du code réel fait le 2026-10-22, RIEN CODÉ. Prochaine étape : maquette avec questions (aucun code avant ses réponses).

## Ce qui existe aujourd'hui
- **Colonne** : le fond de colonne des CV à deux colonnes est le pseudo-élément `.cv.col-vague-g::before` (ou `-d`), `position: absolute; top: 0; bottom: 0`, `z-index: -1`, dans `.cv { isolation: isolate }` (`cvPdfTemplateMaquette.js`, vers la ligne 2465). Il commence donc tout en haut de la page et passe DERRIÈRE tout.
- **Bandeau** : l'en-tête `.tete-fond` porte son fond lui-même (`background: var(--cv)`) ou, pour les formes (vague, diagonale, pâle), un pseudo-élément `::before` en `z-index: 0` (`.tete-vague`, `.tete-diag`, `.tete-pale`).
- **Résultat actuel** : le bandeau est toujours DEVANT la colonne ; la colonne n'apparaît qu'en dessous (c'est pourquoi « Colonne et bandeau » a une colonne qui démarre sous le bandeau).
- **Modèles concernés** (table des capacités, `scripts/rendu/capacites.json`) : 34 des 40 entrées permettent à la fois un bandeau et une colonne. Sans l'option (masquée, jamais grisée) : Frise, Frise foncée, Photo et frise, Rectangles, Sobre Photo, Sobre Rectangles (structures propres ou pas de colonne).

## Essai réel dans le navigateur (2026-10-22, modèle « Colonne et bandeau »)
Deux règles de style ajoutées à la volée : colonne `z-index: 1`, contenu de l'en-tête `position: relative; z-index: 2`. **Résultat : la colonne passe devant et le bandeau n'apparaît plus qu'à droite** : c'est exactement le dessin des exemples de la famille A (colonne pleine hauteur à gauche, bandeau à droite). **Donc faisable.** Mais l'essai montre aussi trois réserves :
1. **Contraste du texte de l'en-tête** : le nom et les coordonnées, blancs (faits pour le bandeau foncé), se retrouvent sur la colonne ; sur une colonne pâle (« Colonne claire », colonne douce du mode Sobre) ils deviennent illisibles. Il faut leur donner la couleur de texte de la colonne dans la zone qu'elle recouvre.
2. **Contenu de la colonne** : sans rehausser aussi le corps de la page (`.corps`), le texte de la colonne disparaît derrière son propre fond (visible sur la capture : « Compétences comportementales », « Langues »… absents). À traiter par une règle d'empilement unique, pas modèle par modèle.
3. **Disposition de l'en-tête** : selon la disposition (2 colonnes, 3 colonnes, décalée), le nom et les coordonnées sont à gauche (sur la colonne) ou répartis autrement : le texte du titre et de l'accroche peut passer sur la colonne.

## Ce qui est simple, risqué, bloquant
- **Simple** : l'inversion d'empilement elle-même (un `z-index`, une classe sur la page, un réglage enregistré comme les autres), l'option n'est proposée que si le modèle a bandeau ET colonne (table des capacités).
- **Risqué** : le contraste du texte d'en-tête (réserve 1), les en-têtes particuliers (Médaillon, Bandeau vertical, diagonales : la photo et les formes interagissent avec la colonne), le texte à deux tons (`.tete-hors`) qui suppose le bandeau derrière, les poignées de l'aperçu, le banc de rendu (zéro écart exigé hors du réglage).
- **À vérifier avant de promettre** : l'export Word (l'extracteur trie les décors par ordre d'empilement : à essayer dans un vrai Word), l'impression PDF réelle (méthode `msedge --print-to-pdf`).
- **Aucun point bloquant** à ce stade.

## Verdict préliminaire : GO AVEC RÉSERVES (voir les trois réserves)
Plan en cases provisoire (à valider après la maquette) :
- [ ] `[effort : haut]` Maquette avec Denis (réponses aux questions ci-dessous).
- [ ] `[effort : haut]` Moteur : réglage `colonneDevant` (page `.col-devant`), empilement unique, couleur de texte de l'en-tête sur la colonne.
- [ ] `[effort : moyen]` Bouton dans l'onglet Colonne ou Bandeau (deux positions, images), masqué si le modèle ne permet pas.
- [ ] `[effort : moyen]` Banc de rendu (zéro écart hors réglage), essais navigateur, impression PDF réelle, vrai Word, message Word si écart.

## Questions à poser à Denis
1. Où mettre le choix (onglet Colonne, onglet Bandeau, ou une ligne commune « Quel est devant ? »).
2. Si le texte du nom sur une colonne pâle devient sombre automatiquement (recommandé) ou si la personne choisit.
3. Pour les en-têtes particuliers (Médaillon, Bandeau vertical, diagonales) : proposer l'option partout où c'est possible sans bug, sinon la masquer (principe du 2026-10-21).

## Mise à jour du 2026-10-22 (retour de Denis sur la maquette)
Denis a demandé : (1) arrondir le croisement entre bandeau et colonne (au lieu d'un angle droit) et d'autres choix du même genre ; (2) pouvoir uniformiser la couleur du bandeau et de la colonne, auquel cas « devant ou derrière » n'a plus de sens. **Jeu de choix VALIDÉ par Denis** et mis dans la maquette `docs/MAQUETTE_BANDEAU_DEVANT_COLONNE_2026-10-22.html` : couleurs (chacune la sienne, d'office, ou même couleur) ; quel est devant (masqué si même couleur) ; angle au croisement (droit d'office, arrondi, biseau) ; liseré blanc (case). Le croisement = le coin rentrant au point (bord droit de la colonne, bas du bandeau). Réserves en plus : (a) quand la colonne prend la couleur du bandeau, la couleur du TEXTE de la colonne doit être recalculée (le texte sombre d'une colonne pâle devient blanc sur fond foncé, vu dans la maquette) ; (b) l'arrondi intérieur (coin creusé, dégradé radial) ne sera probablement pas reproduit par le Word (coin droit) : à vérifier dans un vrai Word, message d'export si écart ; liseré et biseau devraient passer ; (c) « même couleur » réutilise le lien existant entre couleurs de zones (aucun second réglage de couleur). **Reste à valider par Denis** : les trois questions de la maquette (où mettre la ligne « Croisement », texte automatiquement sombre sur colonne pâle, options masquées là où elles créent un bug).

## Maquette de référence (2026-10-22, fin de séance) : `docs/MAQUETTE_BANDEAU_ET_COLONNE_FUSION_2026-10-22.html`
Denis a retenu le mélange : les réglages fins du croisement DÉJÀ validés (couleurs, devant, angle droit, arrondi ou biseau, liseré) + les sept compositions de `docs/MAQUETTE_COMPOSITIONS_BANDEAU_COLONNE_2026-10-22.html` (plaque de titre, diagonale partagée, équerre, L d'un seul tenant, teintes superposées, onglet, carte qui chevauche). **ABANDONNÉ par Denis** : le coin étiré à la main, le coin coloré, la couleur libre du coin. Remplacé par trois tailles fixes de coin (petit, moyen, grand), jamais sur le texte. Règles d'articulation proposées : la composition est le point de départ, le croisement l'affinage (réglages fins seulement pour « Comme aujourd'hui » et « L ») ; une composition remplace la forme du bandeau et de la colonne (les onglets Bandeau et Colonne sont masqués tant qu'elle est active) ; les couleurs viennent du modèle (couleur principale + teinte claire dérivée). **Reste à valider par Denis** : Q1 (huit vignettes ou quatre à cinq), Q2 (trois tailles fixes à la place du coin étiré), Q3 (la composition remplace les formes). Aucun code avant ses réponses.
