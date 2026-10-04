# Inventaire des dates par rubrique (2026-10-04, mode A, aucun code)

Demande de Denis : un **mode d'affichage des années pour chaque rubrique qui capte une date**, avec le choix « comme l'ensemble des rubriques » (panneau d'optimisation, déjà en partie fait) ou « mode propre à la rubrique », et des années qui **s'adaptent quand plusieurs rubriques sont sur la même ligne**.

## 1. Ce qui existe déjà (relevé dans le code)

| Réglage | Portée | Où |
|---|---|---|
| « Dates alignées » (case) | toutes les rubriques placent leurs dates comme les expériences | carte Organisation du CV |
| Position des dates des expériences : à droite / sous le poste / avant le poste | expériences ; les formations et l'expérience personnelle la suivent si « Dates alignées » | carte Expériences (`data-mep-position-dates`) |
| Position propre aux Formations, à l'Expérience personnelle (à droite / sous / avant / comme le modèle) | une rubrique, visible seulement si « Dates alignées » est décochée | cartes Formations, Expérience personnelle (`data-mep-datesrub`) |
| « Dates juste après le titre » | Formations et Certifications seulement, **proposé uniquement par une suggestion** (avec « côte à côte ») | suggestion « dates-apres », réglage `datesApresTitre` |
| « Afficher les mois » (case) | toutes les rubriques, même forme « sept. 2023 » | carte Organisation du CV (`moisAffiches`) |

**Forme de la date aujourd'hui** (une seule, non réglable, `_pdfFormaterPeriode`) : « 2019 - 2021 », « 2022 - en cours », une seule année si début = fin. Deux exceptions :
- expérience personnelle en « Citer seulement » : « Bricolage (2019 - 2021, Limoges) » (entre parenthèses, avec le lieu) ;
- formations et certifications : l'année est un texte libre recopié tel quel (ou réduit à l'année), jamais une période calculée.

## 2. Rubriques qui captent une date

| Rubrique | Donnée | Rendu actuel | Position réglable |
|---|---|---|---|
| Expériences professionnelles | début, fin | plage « 2019 - 2021 » | oui (3 positions) |
| Formations | année (texte) | année seule | oui (3 positions + « juste après ») |
| Certifications | date (texte) | année seule, suit les Formations | via les Formations |
| Expérience personnelle (et engagements) | début, fin | plage ; entre parenthèses en « Citer seulement » | oui (3 positions) |
| Langues, logiciels, loisirs, permis, compétences | aucune | sans objet | sans objet |

## 3. Ce qui manque pour la demande de Denis

1. **La forme de la date** n'est pas réglable par rubrique (plage, entre parenthèses, année de fin seule).
2. **« Juste après le titre »** n'existe que pour Formations et Certifications, et seulement par suggestion ; pas pour les expériences ni l'expérience personnelle.
3. **Un seul endroit** : le choix « comme l'ensemble / propre à la rubrique » est aujourd'hui caché derrière « Dates alignées » (carte Organisation) et ne propose que la position.
4. **Adaptation sur une ligne partagée** : rien n'adapte la date d'une rubrique quand elle est placée côte à côte avec une autre (seule la suggestion « dates-apres » le fait, pour deux rubriques précises).

## 4. Rendus à toucher (une seule source de vérité à créer)

Les dates sont écrites à **plusieurs endroits** du gabarit de la maquette (`cvPdfTemplateMaquette.js`) : expériences (~l.671-690, 1167, 1367, 1442), formations (~l.935-945, 1178, 1378, 1460), expérience personnelle (~l.989, 1395), certifications (~l.587-605), plus l'ancien rendu A4 (`cvPdfTemplateA4.js`) et le Mini CV A5 (`cvPdfTemplateA5.js`). Le Word lit le rendu : rien à faire de son côté.

**Chantier de code (après validation de la maquette)** : une fonction unique « texte de la date d'une rubrique » (forme + mois) appelée par tous ces endroits, une carte « Dates » identique dans chaque rubrique concernée (composant partagé), puis le branchement de l'adaptation sur une ligne partagée. Risque : moyen à élevé (beaucoup de points d'appel) ; garde-fou : le rendu par défaut ne change pas (banc des 24 modèles = 0 différence).

## 5. Décisions à prendre (voir la maquette `docs/MAQUETTE_DATES_PAR_RUBRIQUE_2026-10-04.html`)

1. Les formes proposées (recommandation : « Années », « Entre parenthèses », « Année de fin seule »).
2. « Juste après le titre » disponible pour toutes les rubriques avec dates.
3. Sur une ligne partagée : adaptation automatique (recommandé) ou seulement par suggestion.
4. Certifications : réglage propre ou suit les Formations (recommandation : propre, valeur de départ = celle des Formations).
5. « Afficher les mois » : reste global, avec un choix propre à la rubrique.
