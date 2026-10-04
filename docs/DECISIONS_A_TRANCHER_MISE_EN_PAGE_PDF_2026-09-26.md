# Décisions à trancher avant de coder (retours de Denis du 2026-09-26)

Source : `docs/RETOURS_DENIS_MISE_EN_PAGE_PDF_2026-09-26.md` (16 points). Rien n'est codé avant le « vas-y » de Denis, lot par lot. Déjà faits sur ordre de Denis : point 16 (formations toujours à droite en 2 colonnes) ; retrait des 3 modèles Sobre de l'ancien rendu ; suppression de l'ancien code.

## Les 12 décisions
- **D1 Carte « Allure générale » (points 1, 1b)** : galerie sur une rangée défilante + compteur, tuile d'information pour Standard (reco) / galerie repliable / zone fixe à 2 rangées. « Dégradé » grisé en Sobre.
- **D2 Couleurs d'entreprise (point 2)** : rôles des trois couleurs : 1 = principale (titres, cadres, bandeaux), 2 = secondaire (fin de dégradé, fonds), 3 = détails (traits, puces, icônes). Avec 2 couleurs seulement, la 2e prend aussi le rôle des détails. Contrôle de contraste automatique. Word : une couleur, inchangé.
- **D3 Personnaliser en 2 colonnes (points 3, 3b, 8c)** : Compétences professionnelles et comportementales SÉPARÉES ; blocs côte à côte seulement dans la colonne large ; Expérience professionnelle verrouillée à droite ; Formations à droite par défaut (fait) ; Informations complémentaires déplaçables (2 colonnes et 1 colonne).
- **D4 Par compétences / Mixte / lien compétence-expérience (points 4, 5, 7)** : Mixte redéfini (décidé). À trancher : la confirmation des liens écrit `competencesDemontrees` et sera aussi lue par la lettre et l'entretien ; suggestions de liens par correspondance avec les missions, TOUJOURS à confirmer.
- **D5 Suggestions d'informations complémentaires (point 8)** : liste et formulations à valider, dont le statut RQTH (sensible : proposé, jamais affiché sans coche).
- **D6 En-tête (point 11)** : mémorisation PAR MODÈLE (reco), corrections de texte conservées partout, changement de format = départ neuf ; poignées agrandies.
- **D7 Dates (points 12, 15)** : niveau 1 (texte libre modifiable sur le CV) tout de suite ; position des dates libre sur tous les modèles ; vraies dates avec mois (niveau 2) = chantier séparé plus tard.
- **D8 Tailles (points 9, 13)** : texte jusqu'à 16 ; en-tête qui suit la taille du texte (case « En-tête à taille fixe » pour l'éviter) ; curseur qui affiche la taille réelle ; tailles par rubrique dans les modèles à disposition propre = plus tard.
- **D9 Bouton « Mise en page » (points 14, 14b)** : présentation seule en automatique ; suggestions de structure et de gain de place sur clic uniquement, jusqu'à 3, classées ; critères de classement à valider.
- **D10 Format (point 10)** : 5 tuiles dans la carte « Format », réglages A5 dedans.
- **D11 Uniformité (point 16)** : autoriser un audit de tous les comportements imposés qui diffèrent entre modèles importés et modèles de la maquette (rapport avant tout codage).
- **D12 Ordre des lots.**

## Réponse de Denis (2026-09-26) : D1 à D12 validées, lot 1 lancé. D9 : la miniature d'aperçu sur chaque suggestion est INTÉGRÉE au lot « Mise en page : suggestions » (Denis aime l'idée ; faisable : la page candidate est déjà calculée hors écran pour la mesure, on l'affiche réduite).
## Lot 1 « Uniformité » : fait à ce jour
- Position des dates LIBRE sur tous les modèles (barres des 11 modèles de l'application, Photo et frise, Rectangles arrondis, Colonne et frise) ; le choix de la personne prime, sinon le placement d'origine du modèle. Vérifié dans le navigateur (3 positions sur 5 modèles, images).
- Formations toujours à droite en 2 colonnes (case pour les passer à gauche).
- Intitulés de rubriques identiques partout (dictionnaire unique `_PDF_INTITULES`) : FAIT et vérifié navigateur. Grisage uniforme des réglages sans objet : FAIT et vérifié. Rapport d'audit : `docs/AUDIT_UNIFORMITE_MISE_EN_PAGE_PDF_2026-09-26.md` (écarts E1 à E4, E1 et E2 à trancher par Denis). LOT 1 TERMINÉ (2026-09-26).
## Lot 2 « Petites retouches » : TERMINÉ (2026-09-26, commits 6b6423f, d5bd9d5 et suivant)
- Taille du texte jusqu'à 16 ET curseur à la taille RÉELLE (12,5 px x réglage x échelle automatique du moteur, exposée par `window._pdfMqEchelleAuto`) ; vérifié à 16 sur Bandeau et Photo et frise (une page, pas de débordement).
- L'en-tête (nom, métier, coordonnées, accroche) suit la taille du texte dans la même proportion (variable CSS `--kh` = réglage de la personne) ; case « Garder l'en-tête à taille fixe » (`enteteTailleFixe`). Vérifié : 21 px devient 24,6 px à 16, reste 21 px avec la case.
- Poignées de l'en-tête : zone de saisie de 14 à 32 px, barres plus épaisses et plus sombres, surbrillance au survol. Non testé au toucher.
- Dates modifiables dans « Modifier le texte » sur tous les modèles (`da:` périodes des expériences, `dp:` expériences personnelles, `fa:` années de formation) : texte libre pour CE CV, le dossier n'est pas modifié, l'ordre et les calculs lisent toujours les vraies dates. Niveau 2 (vraies dates avec mois) non fait.
- Bouton « Ajouter » des informations complémentaires : style de la maquette (`mep-btn principal`, « + Ajouter »). Restent aux lots 3 et 5 : suggestions (8b), apparition dans Personnaliser (8c).

## Lot 3 « Stabilité du panneau » : TERMINÉ (2026-09-26)
- Carte Allure : titres « Allure générale » et « Couleurs » au même niveau ; rangée de modèles de HAUTEUR FIXE qui défile (compteur « N modèles ») ; tuile d'information pour Standard ; case Dégradé grisée (pas masquée) en Sobre. Mesuré : hauteur de la carte 319 à 321 px selon le mode (avant : elle variait beaucoup).
- Zone dépliante des expériences : vrai bouton bordé « Modifier mes expériences et leurs missions » (sous-ligne, résumé, verbe Ouvrir / Refermer, chevron).
- Carte Format : les CINQ formats en tuiles (A4, A4 complet, A4 essentiel, Mini CV A5 portrait, Mini CV A5 paysage), réglages du Mini CV A5 DANS la carte (fonction unique `_htmlReglagesA5MiseEnPage`), plus aucun format dans « Réglages supplémentaires », un seul gestionnaire de clic (`data-mep-format` et `data-mep-format-simple`). 
- **En Mini CV A5, sans effet (mesuré) donc grisés avec la raison** : Compétences en haut, Formations avant expériences, Agrandir les titres, Réduire les espaces, Afficher les centres d'intérêt. À traiter dans le chantier A5 (le dernier est un vrai contenu : la case devrait agir).
- Suggestions d'informations complémentaires (bouton « Suggestions ») : disponibilité, mobilité, statut RQTH (ajouté mais JAMAIS coché à la place de la personne), phrase d'expérience à compléter. Permis et véhicule NON proposés : déjà dans les coordonnées du CV.

## Lot 4 « Par compétences : fusion » : TERMINÉ (2026-09-26)
- « Compétences en action » disparaît (dictionnaire `_PDF_INTITULES` : clé supprimée). En modes Par compétences (C) et Mixte (B), le bloc regroupé par thème s'appelle « Compétences professionnelles » et REMPLACE la liste de gauche (plus de doublon) ; il est dans la colonne des expériences (donc à droite en 2 colonnes). Vérifié : Standard, Colonne et frise, Photo et frise. Rectangles arrondis : la case des compétences professionnelles est retirée quand le bloc thématique est là (non vérifié en image, 1 colonne seulement).
- Ce bloc obéit aux mêmes réglages que la liste : croix (mode « Retirer »), « − n + » et « Choisir » (mesuré : 11 devient 8 puis 9). Quand les thèmes de l'assistant reformulent les compétences (aucun texte en commun avec la liste), seules les croix comptent. Un thème unique n'affiche pas son nom (doublon avec le titre).
- Mixte (B) = compétences regroupées puis expériences chronologiques COMPLÈTES avec missions (20 missions vérifiées) ; Par compétences (C) = compétences regroupées puis « Parcours professionnel » sur une ligne par expérience, sans missions.
- « Indiquer l'expérience entre parenthèses » : case TOUJOURS cliquable, message inquiétant supprimé ; zone dépliante « Relier mes compétences à mes expériences » DANS la carte (pas de fenêtre, demande de Denis) : pastilles d'expériences par compétence, suggestions en pointillés (assistant + correspondance avec les missions) pré-cochées mais enregistrées seulement par « Enregistrer » ; écrit `experience.competencesDemontrees` (source unique lue par le CV, la lettre, l'entretien).
- **Bug de fond corrigé en chemin** : `extraireDonneesCV` PERDAIT `competencesDemontrees` : le lien (même celui créé par Découverte) n'arrivait jamais au Composeur, donc « Illustré par » ne s'affichait pour aucun dossier. Le Composeur fusionne maintenant les liens de l'assistant et ceux de la personne ; entreprise en double dédoublonnée.
- Réserve : les suggestions par mots-clés sont larges pour un parcours homogène (RH : 30 liens suggérés sur 66 possibles) ; toujours à confirmer. À resserrer si Denis les trouve trop nombreuses.

## PRIORITÉ PASSÉE (2026-09-26) : perte d'informations entre la saisie et le CV (expériences ajoutées à la main absentes du CV) : voir `docs/ANALYSE_PERTE_INFORMATIONS_SAISIE_CV_2026-09-26.md`. Les lots de mise en page attendent.
