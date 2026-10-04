# Audit d'uniformité de « La mise en page » (PDF) : lot 1 (2026-09-26)

Objet : comportements imposés qui diffèrent entre les modèles à disposition propre (Colonne et frise, Photo et frise Créatif / Sobre, Rectangles arrondis) et les modèles de la maquette.

## Fait dans ce lot
1. **Un seul dictionnaire d'intitulés** : `_PDF_INTITULES` (`modules/cv-pdf-html/cvPdfTemplateMaquette.js`), lu par tous les rendus. Plus aucun intitulé de rubrique écrit en dur. Corrigés : « Atouts » devient « Compétences comportementales » ; « Informatique » et « Outils » deviennent « Logiciels et outils » ; « Compétences » devient « Compétences professionnelles » ; « Diplômes et Formations » et « Formation » deviennent « Formations » ; « Expériences Professionnelles » devient « Expérience professionnelle » ; « Centres d'Intérêts » devient « Centres d'intérêt ». Vérifié dans le navigateur sur Colonne et frise, Photo et frise, Rectangles arrondis, Bandeau.
2. **Grisage uniforme** : « Compétences en haut » et « Compétences en pastilles » sont grisées, avec la raison écrite à côté, sur les modèles à disposition propre (Colonne et frise, Photo et frise, Rectangles arrondis). Réactivées dès qu'on change de modèle. Vérifié dans le navigateur.
3. Déjà fait avant : position des dates libre partout ; formations toujours à droite en 2 colonnes ; « Petits carrés » grisée quand les icônes des coordonnées sont allumées.

## Écarts restants (à trancher par Denis)
- **E1 Rectangles arrondis : « Domaine de Compétences et Capacités »** (titre du CV d'origine de Denis) reste le seul intitulé différent. Recommandation : barre « Compétences » + trois petits titres dans les rectangles (professionnelles / comportementales / savoirs). Attente de la réponse de Denis.
- **E2 Rectangles arrondis mélange des rubriques** : Logiciels et outils, Langues, Certifications et Informations complémentaires sont écrits comme des lignes de la liste « Centres d'intérêt » (« Langues : anglais, espagnol » sous le titre « Centres d'intérêt »). C'est fidèle à l'image d'origine, mais contraire à « chaque information à sa place ». Recommandation : leur donner leur propre barre.
- **E3 Photo et frise garde une rubrique « Contact »** que les autres modèles n'ont pas (les coordonnées y sont sans titre). Recommandation : la garder (elle fait partie du dessin du modèle) ou la retirer, au choix de Denis.
- **E4 « Compétences en action »** : intitulé propre au mode « Par compétences », voué à disparaître avec le lot 4 (fusion).
