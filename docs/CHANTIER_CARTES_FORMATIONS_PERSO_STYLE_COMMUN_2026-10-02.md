# Chantier : cartes « Formations » et « Expérience personnelle » alignées sur « Expériences professionnelles », et style d'écriture commun (ouvert 2026-10-02, Mode A, effort haut)

Cible visuelle : `docs/MAQUETTE_CARTES_FORMATIONS_ET_PERSO_2026-10-02.html` (v3, validée par Denis le 2026-10-02 : « je valide tout, tu peux implémenter »).

## Décisions de Denis (2026-10-02)
- Même disposition que les expériences professionnelles : zone dépliante « Modifier mes ... et leurs missions », bouton « Éditer » identique, une ligne par élément.
- « Éditer » pour les formations et l'expérience personnelle = **correction de CE CV seulement** (jamais « Vos informations »), comme le bouton « Modifier » actuel. Les petits boutons « Modifier » de chaque ligne sont remplacés par le clic sur le nom en mode édition (même formulaire).
- Boutons G, I, S : on garde les lettres (pas de mots), plus grands, bleu plein quand actifs ; même taille pour S et I des dates et de l'entreprise.
- Expérience personnelle : même bandeau « Détail » que les formations (titre G/I/S, espace entre les entrées, style des missions).
- Option générale « Même style d'écriture dans toutes les rubriques » (Organisation du CV, options rapides, sous « Dates à la même place... ») : cochée, formations et expérience personnelle suivent les expériences professionnelles ; décochée, chacune a ses réglages. Couvre : titre (G/I/S), style des missions, style du lieu. Pas activée d'office sur un CV dont les rubriques s'écrivent déjà différemment ; bouton « Harmoniser ».
- Cette option **remplace** la décision du 2026-09-27 (« jamais de bouton synchroniser / dissocier » pour l'expérience personnelle) : décision explicite et plus récente de Denis.

## Constats de l'audit (2026-10-02)
- Le formulaire d'édition de l'expérience personnelle EXISTE déjà dans la carte (`data-mep-expperso-modifier`, champs titre + missions) : la maquette disait à tort qu'il manquait.
- Le titre d'une entrée d'expérience personnelle suit déjà le style du poste des expériences (`styleParties.poste`) ; il n'a ni réglage de titre propre ni espace entre entrées : à créer.
- Le titre d'une formation a son propre réglage (`styleTitreFormation`) ; l'espace entre formations existe (`espacementFormations`).
- Style des missions : un réglage par rubrique (`styleProfessionnel`, `stylePersonnel`, `styleFormations`), signe commun.

## Phases (un commit chacune, `npm test` + essais de parcours + banc 24 modèles)
- [x] **F1** [effort : bas] FAIT : une ligne par élément dans toutes les listes (grille à une colonne, filet entre les lignes) ; boutons G, I, S plus grands (`css/mise-en-page-maquette.css`).
- [x] **F2** [effort : moyen] FAIT : carte Formations = deux boîtes + bandeau « Détail » (3 rangées) + bouton « Éditer les formations » + zone dépliante « Modifier mes formations et leurs missions » + ordre ; plus de bouton « Modifier » par ligne (clic sur le nom en mode édition, même formulaire, correction de ce CV seulement). Essais : parcours `carteForm` (24 contrôles).
- [x] **F3** [effort : haut] FAIT : carte Expérience personnelle = quatre boîtes (mode, à afficher, savoir-faire, engagement) + bandeau « Détail de chaque entrée » (mode Développer : titre G/I/S, espace entre les entrées, style des missions) + bouton « Éditer mon expérience personnelle » + zone dépliante + ordre. Nouveaux choix `styleTitrePerso` et `espacementPerso` (dans `choixMq`, rien d'écrit tant qu'on ne choisit pas ; 8 px = l'espace d'origine) lus par le rendu (`cvPdfTemplateMaquette.js`, `titrePersoHtml`). **Défaut corrigé** : « Cacher sur le CV » ne faisait rien en mode « Toutes » quand une ancienne sélection restait en mémoire. Essais : parcours `cartePerso` (23 contrôles) ; banc 24 modèles identique.
- [x] **F4** [effort : haut] FAIT : option « Même style d'écriture dans toutes les rubriques » (Organisation du CV, options rapides). Choix `styleCommun` (`choixMq`). Cochée d'office seulement quand les trois rubriques s'écrivent déjà pareil (rien ne change) ; sinon décochée avec un bouton « Harmoniser ». Cochée : les formations et l'expérience personnelle suivent les expériences (style des missions, titre = style du poste, lieu des formations = style du lieu) ; leurs réglages d'écriture sont grisés avec la raison. Décochée : chaque rubrique retrouve ses réglages propres. Rendu : `styleCommun` dans `cvPdfTemplateMaquette.js` (`renduLieuFormation`). Essais : parcours `styleCommun` (14 contrôles).
- [x] **F5** [effort : moyen] FAIT : essais bouton par bouton des deux cartes (`carteForm` 25 contrôles, `cartePerso` 23) et de l'option commune (`styleCommun` 14) ; suite complète 297 contrôles verts ; banc des 24 modèles identique (PDF, plan Word, XML) ; mode sombre vu. **Défaut corrigé en route** : le soulignement d'un titre posé sur un élément englobant n'arrivait pas dans le Word (`wordExtracteur.js`, aussi pour le « S » des formations).

## Reste
- Test de Denis à la vraie souris, avec un vrai CV : bouton « Éditer » des deux cartes, bandeau Détail, option « Même style d'écriture ».
- Idée non traitée : bouton « Harmoniser » testé seulement par essai (pas à la souris) ; vérifier le libellé avec Denis.
