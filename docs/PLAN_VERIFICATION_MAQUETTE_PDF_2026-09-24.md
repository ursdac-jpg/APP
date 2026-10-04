# Plan de vérification écran par écran : application vs maquette (PDF)

> Objectif : reprendre le chantier "Refonte de la mise en page du CV en PDF" bloc par bloc, dans l'ordre ci-dessous. Pour CHAQUE bloc, comparer 6 choses entre `docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html` (source de vérité) et l'application réelle : **visuel** (couleurs, tailles, espacements, icônes), **boutons** (présence, libellé exact, ordre), **emplacement** (à quel endroit de l'écran), **taille** (proportions, largeurs), **fonctions** (le réglage existe-t-il vraiment derrière), **interactions** (un clic réel change-t-il vraiment le CV affiché, pas juste un état interne).
>
> **Règle de travail, non négociable** : vérifier CHAQUE bloc dans le VRAI écran de l'application (naviguer jusqu'à "La mise en page" d'un CV PDF réel), jamais avec un dossier de synthèse injecté par script. Ne cocher un bloc que si un clic réel dedans a été vu changer le CV affiché. Un commit par bloc vérifié, jamais plusieurs blocs d'un coup.

---

## Bloc 0 : structure générale de l'écran

- [ ] Bandeau du haut ("Style au hasard" + "Mise en page") : côte à côte (grille 2 colonnes), avec 3e bouton "Revenir au modèle de départ" (icône ⏮) à côté du bouton "↩ Annuler le tirage" de la carte "Style au hasard".
- [ ] "Aperçu en plein écran" : bouton seul, au-dessus du bandeau du haut.
- [ ] Ordre des cartes dans la colonne de réglages (maquette, de haut en bas) : carte plate "Allure générale + Couleurs" → "Organisation du CV" → "Expériences professionnelles" → "Formations" → "Éléments supplémentaires" → "Mise en page et texte" → "Réglages avancés" → "Format". Vérifier que c'est bien cet ordre-là dans l'écran réel.
- [ ] Barre du bas (`.barre-bas` maquette) : "Revenir au modèle de départ" à gauche, "Valider le CV →" à droite, pleine largeur, toujours visible. **Pas encore fait à l'identique** (repli actuel : bouton seul après la carte Format, pas la vraie barre pleine largeur).
- [ ] Panneau élargi : colonne réglages / colonne CV en proportion 1.5fr / 1fr, CV à droite qui suit le défilement (`position: sticky`).
- [ ] Aperçu du CV : rempli sur toute la largeur disponible (mise à l'échelle sur la largeur seule, jamais coupé par la hauteur), aucune barre de défilement visible à l'intérieur du cadre.
- [ ] Réglages "hors maquette" (ceux qui n'ont pas de case dans les 8 blocs ci-dessus) : rangés à part, séparés visuellement, jamais mélangés, jamais touchés par "Style au hasard" (vérifié : condition posée par Denis, déjà en place).

## Bloc 1 : carte plate "Allure générale + Couleurs" (pas de `<details>`, jamais repliable)

- [ ] Segment Sobre / Standard / Créatif : 3 boutons égaux, bien stylés (pas de boutons bruts sans style).
- [ ] En dessous : texte d'aide fixe ("Sobre : classique... Standard : équilibré... Créatif : couleurs et formes...").
- [ ] Couleurs : 5 pastilles rondes (teintes curées) + bouton couleur de l'entreprise (si captée) + "Personnalisée" (sélecteur de couleur natif).
- [ ] Case "Dégradé" (à cocher, cochée par défaut) avec le texte "Un effet que Word ne sait pas faire."
- [ ] En dessous : galerie de vignettes de modèles, visible SEULEMENT si Sobre ou Créatif est actif (rien pour Standard à part le texte d'aide déjà mentionné). Vérifier qu'un clic sur Créatif fait bien apparaître les vignettes, et qu'un clic sur une vignette change bien le CV affiché.

## Bloc 2 : carte "Organisation du CV" (la plus incertaine, vérifier en profondeur)

- [ ] Bascule "Standard (recommandé)" / "Personnaliser" : 2 boutons, un seul actif à la fois.
- [ ] Si 2 colonnes actives : rien de plus (juste le texte expliquant que l'ordre est automatique en 2 colonnes).
- [ ] Si 1 colonne ET "Personnaliser" actif : liste "Ordre des rubriques" avec 4 lignes (Compétences / Expériences / Formations / Logiciels-centres d'intérêt), chacune avec des flèches ▲▼ pour la faire monter/descendre. **Vérifier qu'un clic sur une flèche change vraiment l'ordre affiché dans le CV.**
- [ ] 9 cases à cocher ("Options rapides") : Compétences en haut, Formations avant expériences, Afficher les centres d'intérêt, Deux colonnes, Réduire les espaces, Agrandir les titres, Icônes sur les rubriques, Icônes sur les coordonnées, Compétences en pastilles.
- [ ] **Signalé par Denis (24/09) : le CV disparaît complètement après avoir choisi 1 colonne OU 2 colonnes, dans l'application réelle avec son vrai CV.** Testé le 24/09 avec un CV de synthèse (1 expérience, 2 compétences) : le changement 1/2 colonnes fonctionne correctement plusieurs fois de suite dans ce test (état interne, synchronisation iframe et rendu HTML tous corrects, CV toujours affiché), jamais reproduit avec ces données minimales. Cause possible non testée : un champ précis du vrai dossier de Denis (accents, champ vide, très grand nombre d'expériences, présence/absence d'une rubrique...) qui ferait planter le rendu silencieusement avec CE contenu-là. **À reproduire en premier avec le vrai CV de Denis, jamais un CV de synthèse minimal.**
- [ ] **CONFIRMÉ CASSÉ (24/09, comparaison directe avec le CV Doumbouya de la maquette, mêmes données)** : "Compétences en haut" est coché par défaut (case "Standard recommandé") mais le CV réel affiche "Formations" en premier bloc, "Expérience professionnelle" en second, "Compétences professionnelles" seulement en troisième position, "Compétences comportementales" en dernier, à droite. Dans la maquette (mêmes données), l'ordre est Compétences pro+comportementales (haut, 2 colonnes) puis Expérience professionnelle. Cause probable : en 2 colonnes, l'algorithme de répartition gauche/droite du vrai moteur (`cvPdfTemplateA4.js`, poids glouton + "experiences toujours forcée en colonne 1") ignore l'ordre logique que la case "Compétences en haut" essaie d'imposer (`ordreRubriques`, voir js/app.js `_htmlSecOrganisationMiseEnPage`/cvPdfTemplateA4.js réordonnancement ajouté le 23/09). À corriger : soit adapter l'algorithme de répartition pour respecter cette case, soit trouver un autre mécanisme réellement efficace.
- [ ] **Constat additionnel (même comparaison)** : les compétences comportementales affichées dans le CV réel ne correspondent pas exactement à celles saisies (le moteur en ajoute/substitue certaines par ses propres suggestions par défaut), comportement probablement normal du moteur de remplissage automatique, à confirmer que ce n'est pas un bug, pas forcément lié à la maquette.
- [ ] "Blocs courts : Côte à côte / L'un sous l'autre" : **PAS ENCORE CONSTRUIT DU TOUT.** Visible seulement en 1 colonne dans la maquette (juxtapose Compétences pro/comportementales, et Logiciels/Centres d'intérêt, en mini-grille 2 colonnes au lieu de les empiler). À construire.

## Bloc 3 : carte "Expériences professionnelles"

- [ ] Ordre des 3 boîtes "Mode de présentation" : Chronologique, Par compétences, Mixte (dans cet ordre précis).
- [ ] "Expériences à afficher" : Toutes / Les plus pertinentes. **Point cassé, confirmé au 23/09 (nuit) : cliquer sur "Les plus pertinentes" ne fait apparaître aucune case à cocher par expérience. À corriger en tout premier avant le reste de ce bloc.**
- [ ] Une fois corrigé : vérifier qu'on peut décocher une expérience précise et que le CV affiché la retire vraiment.
- [ ] **Point à re-vérifier (analyse du 24/09) : le panneau "Vos expériences et leurs missions" est-il ouvert ou fermé PAR DÉFAUT ?** Le texte brut de la maquette montre le chevron fermé (`⌄`) à côté de "9 expériences affichées · cliquez pour modifier" à l'état de départ, et le code JS de la maquette ne force l'ouverture (`zoneChoixExp.open = true`) QUE quand on choisit "Les plus pertinentes", donc probablement FERMÉ par défaut, ouvert seulement sur pertinentes ou clic manuel. L'application actuelle l'ouvre TOUJOURS (changé le 23/09 sur la foi d'une capture d'écran de Denis qui avait peut-être déjà cliqué dessus). À trancher en comparant à nouveau, avec un chargement neuf de la maquette (jamais déjà cliquée).
- [ ] **Écart réel trouvé (analyse du 24/09, pas encore corrigé)** : le contrôle "Ordre" est un menu déroulant natif dans la maquette, avec 3 options exactes : "Du plus récent au plus ancien" / "Mon ordre" / "Du plus pertinent". L'application actuelle utilise 4 boutons segmentés avec un jeu d'options différent : "Pertinence" / "Plus récentes" / "Plus anciennes" / "Poste A vers Z", ni le type de contrôle (boutons au lieu de menu déroulant), ni les options elles-mêmes ne correspondent. "Mon ordre" implique un réordonnancement manuel des expériences (glisser ou flèches), qui n'existe pas du tout aujourd'hui, à construire si retenu.
- [ ] Liste des expériences : grille 2 colonnes.
- [ ] Chaque ligne : case à cocher (ou case désactivée si "Toutes"), nom, compteur de missions avec fraction "N / total", bouton "Missions ▾" qui déroule la liste précise des missions à cocher/décocher.
- [ ] Ligne du bas : Ordre (voir écart ci-dessus), Missions par expérience (compteur), Style des missions (Épurées/Condensées), Dates (S/I), Entreprise (S/I), Afficher le lieu (case), Style du lieu.
- [ ] Bannière d'info en bas ("Pour tout faire tenir sur une page, les missions des expériences les moins pertinentes ont été raccourcies : aucune expérience n'est retirée.") visible seulement en mode "Automatique". Vérifier le texte exact (l'application dit "peuvent être raccourcies", la maquette dit "ont été raccourcies", à harmoniser).
- [ ] Vérifier concrètement : un clic sur chaque bouton S/I, sur Style des missions, change bien le rendu du CV.

## Bloc 4 : carte "Formations"

- [ ] "Quelles formations montrer" : Complet / Optimisé.
- [ ] "Détail" : case "Afficher les missions de la formation" (décochée par défaut) + curseur "Espace entre les formations".
- [ ] Vérifier qu'un clic sur la case fait bien apparaître/disparaître les missions sous chaque formation dans le CV.
- [ ] **Non construit (connu, noté dans le cahier)** : G/I/S sur le titre de la formation (demande de changer une architecture partagée avec Expériences, vrai choix à trancher avec Denis avant de coder).

## Bloc 5 : carte "Éléments supplémentaires"

- [ ] Compteurs "Compétences professionnelles/comportementales à afficher" (+/-) : vérifier qu'ils réduisent vraiment le nombre affiché dans le CV.
- [ ] 3 cases Logiciels / Langues / Certifications (afficher/masquer).
- [ ] **Non construit (connu)** : choisir une compétence précise une par une (comme les missions d'expérience), message "N compétences non proposées".

## Bloc 6 : carte "Mise en page et texte"

- [ ] Police, Espacement, Compétences (style pastille/rectangle/texte), Fond de la colonne : vérifier chaque changement visible.
- [ ] **Non construit (connu)** : "Titre du CV"/"Phrase d'accroche" (sélecteurs), curseur de taille séparé pour les titres (un seul curseur global existe aujourd'hui).

## Bloc 7 : carte "Réglages avancés"

- [ ] Texte justifié, Trait entre les colonnes : 2 cases, vérifier le rendu.
- [ ] **Non construit (connu)** : "Petits carrés devant les coordonnées" (fonctionnalité visuelle neuve).

## Bloc 8 : carte "Format"

- [ ] A4 (une page) / A4 complet (plusieurs pages) : vérifier que le CV change vraiment de mise en page.

## Bloc 9 : réglages "hors maquette" (déjà en place, à ne pas casser)

- [ ] Vérifier qu'ils restent bien rangés à part (section "Réglages supplémentaires"), jamais mélangés aux 8 cartes ci-dessus, jamais touchés par "Style au hasard" (déjà vérifié une fois, à reconfirmer après tout changement dans cette zone).

---

## Méthode à suivre pour chaque case ci-dessus

1. Ouvrir l'application réelle (jamais un dossier de synthèse par script), aller jusqu'à "La mise en page" d'un CV en PDF.
2. Comparer à l'œil avec la maquette ouverte à côté (`docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html`).
3. Cliquer réellement sur le contrôle, regarder si le CV affiché change vraiment.
4. Cocher la case seulement si les 6 points (visuel/boutons/emplacement/taille/fonctions/interactions) sont bons.
5. `npm test` doit rester vert, vérifier l'absence de tiret cadratin dans le diff avant de commit.
6. Un commit par case cochée (ou petit groupe cohérent), jamais plusieurs blocs à la fois.
