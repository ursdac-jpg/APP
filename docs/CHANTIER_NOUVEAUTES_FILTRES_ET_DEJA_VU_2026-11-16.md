# Chantier : Nouveautés, « déjà vu » mémorisé et filtres (consigne 418, 16/11/2026)

Maquette cliquable (vraies données) : `docs/MAQUETTE_NOUVEAUTES_FILTRES_ET_DEJA_VU_2026-11-16.html`. État : maquette présentée, ajustée trois fois, RIEN CODÉ.

## Décisions de Denis (16/11/2026)
1. ~~Les déjà vus sont masqués par défaut~~ **REMPLACÉE par la décision 8 (consigne 420)** : tout est affiché au départ.
2. Mobile : **trois pastilles seules** (bleue, jaune, verte) ; un clic ouvre l'entrée et écrit son nom au-dessus de la liste.
3. Filtre **repliable** (bouton en haut à droite) ; replié : une ligne de résumé + le compte. Sur téléphone il démarre replié.
4. « Droits et règles » : montrer aussi les **changements à venir**. Ils s'affichent TOUJOURS en tête (même déjà vus) tant qu'aucun filtre ne les écarte ; **pas de rectangle de rappel** (retiré à la demande de Denis).
5. **Aucune limite de durée** : fiches et changements restent toujours ; Date = À venir, 7, 30, 60 jours, Plus anciens, Toute la période (par défaut).
6. **Recherche** au niveau du compte d'éléments, **seulement** dans « Droits et règles ».
7. « Problèmes corrigés » : **aucun filtre**, seulement la mémoire du « vu ».
8. **Filtres plus simples (consigne 420, 16/11/2026)** : à l'arrivée sur une entrée, **tout est affiché** (« Tout l'historique »). « Ce que je n'ai pas encore vu » devient un filtre que la personne choisit. « Tout réinitialiser » efface les filtres et redonne tout, jamais une liste vide. Appliqué à l'application et à « Droits et règles » ; la maquette montre encore l'ancien réglage de départ.

## Hypothèses retenues faute de réponse contraire (à confirmer)
- Mémoire du « vu » dans `localStorage` de l'appareil (pas de compte), avec bouton « Tout remettre à neuf ».
- Une seule liste de cadres (les 21 rayons) ; les changements officiels y sont rattachés par une table domaine -> rayon (**16 lignes VALIDÉES par Denis le 16/11/2026**) protégée par un test qui échoue si un domaine n'est pas rattaché.
- Période par boutons, pas de calendrier.
- **Premier passage** (aucune mémoire) : tout ce qui date de plus de 7 jours est considéré comme déjà vu, sinon la pastille afficherait « 119 » à la première visite. Les 7 derniers jours restent « Nouveau ».

## Audit du code réel (ce qui existe)
- `modules/nouveautes/index.js` (page, 3 entrées, pastille) et `logique.js` (logique pure). « Vu » actuel = `sessionStorage` `aps_nouveautes_vues`, par RUBRIQUE entière (consigne 332 ter), perdu à la fermeture de l'onglet.
- « Nouveau » = moins de 7 jours (`NV_JOURS_NOUVEAU`) ; bouton « Essayer » tant que « Nouveau ».
- Droits et règles : `comprendreLeCadreLireRecent` / `comprendreLeCadreRenduRecent` (façade, brique B.54 / ligne « Ce qui a changé récemment hors du module » de `BRIQUES_COMMUNES.md`). Changements lus sur **6 mois** seulement ; affichage coupé à **60 jours** (`COMPRENDRE_LE_CADRE_JOURS_RECENT`). Un groupe « À venir » existe déjà (dates futures).
- Fiches : `fiches-recentes.json` généré depuis le journal ; **garde déjà toutes les fiches** (la coupure à 60 jours n'est qu'à l'affichage) : rien à changer côté données.
- Cadres : fiches = 21 rayons (`RAYON_LABEL`) ; changements officiels = 16 domaines de texte libre : deux vocabulaires, d'où la table.

## Inventaire (existant -> maquette)
| Élément existant | Étiquette |
|---|---|
| 3 entrées (boutons avec nombre et couleur) | GARDÉ (ordinateur) ; ENRICHI (pastilles seules sur téléphone) |
| Pastille du bouton (total) | ENRICHI : compte les éléments non vus, mémorisés |
| Mémoire du « vu » en session par rubrique | REMPLACÉ par une mémoire ligne par ligne d'une visite à l'autre (remplacement acté par la décision 1, à tracer dans le journal) |
| Étiquette « Nouveau » (7 jours) | ENRICHI : « Nouveau » = pas encore vu ; « Déjà vu » sinon |
| Bouton « Essayer » | GARDÉ (tant que « Nouveau ») |
| Mention « Vous trouverez ce module dans la carte… » | GARDÉ |
| Bouton « Un problème avec une nouveauté ? » | GARDÉ |
| Regroupement par mois | GARDÉ |
| Cartes de fiches (« Ouvrir la fiche », pastilles Nouvelle / Mise à jour, date, cadre) | GARDÉ |
| Cartes de changements officiels (dépliables, sources) | GARDÉ |
| Groupe « À venir » | GARDÉ et mis en tête, toujours visible |
| « Tout déplier », résumé « N changements », « Dernière mise à jour » | GARDÉ (à conserver sous la barre de filtres) |
| Invitation « Ouvrir Comprendre le cadre », encart « pas une source de droit » | GARDÉ |
| Fenêtre d'aide de la page, recherche de l'accueil (`fn:nouveautes-appli/-regles/-corriges`) | GARDÉ, texte d'aide à mettre à jour |
| Fenêtre des 60 jours / lecture sur 6 mois | RETIRÉ : acté par la décision 5 |

## Plan par lots (une case = un commit, `npm test` + test navigateur à chaque fois)
- [x] (FAIT le 16/11/2026, 3 053 tests verts, vérifié dans le navigateur) Lot 1 `[effort : haut]` Mémoire du « vu » : logique pure (clé par élément, premier passage, nettoyage des clés disparues), stockage `localStorage` protégé par try/catch, pastille = non vus, tests Node (adapter `tests/nouveautes.test.js` et `tests/boutonsRepliables.test.js`).
- [x] (FAIT le 16/11/2026, 3 054 tests verts, vérifié dans le navigateur ordinateur et téléphone) Lot 2 `[effort : haut]` Entrée « Nouveautés de l'application » : barre de filtres (afficher, période, carte), repliable, instantané des non vus pour la visite, « Tout l'historique », état vide.
- [x] (FAIT le 16/11/2026, 3 057 tests verts, vérifié dans le navigateur) Lot 3 `[effort : haut]` Entrée « Droits et règles » : 6 mois lus d'abord puis tous les mois anciens en arrière-plan (`comprendreLeCadreLireTout`), « À venir » en tête, filtres (quoi, date, cadre), table domaine -> cadre + test (`NV_DOMAINE_CADRE`, `logique.js`), recherche, lecture 20 par 20. Retouche de la consigne 420 appliquée aussi au lot 2 (tout affiché au départ). Le bouton « Replier » ne passe plus sous le bouton flottant du carnet.
- [x] (FAIT le 16/11/2026, 3 059 tests verts, vérifié dans le navigateur à 375 px, mode sombre compris) Lot 4 `[effort : moyen]` Téléphone : trois pastilles seules de 68 px, nom de l'entrée écrit au-dessus de la liste (`#nvTitreEntree`), nom gardé dans la page pour les lecteurs d'écran, `@media (max-width: 600px)`. Ajout demandé par Denis le 16/11/2026 : dans « Droits et règles », la barre de recherche reste toujours au milieu (trois colonnes, le bouton « Tout réinitialiser » absent garde sa place).
- [x] (FAIT le 16/11/2026, 3 059 tests verts, vérifié dans le navigateur) Lot 5 `[effort : moyen]` (bouton « Tout remettre à neuf » sur la page d'arrivée, mention « Nouveau » sur les corrections non lues, aide contextuelle, recherche de l'accueil, ligne `data/nouveautes.js` écrite ; ajouts de Denis : titres de rubriques en bandeau (À venir en ambre) et « Nouveau cette semaine » ramené à 7 jours, leçon 9.186) Lot 5 `[effort : moyen]` (consigne 419 : NE PAS OUBLIER la ligne data/nouveautes.js qui annonce ces filtres) Entrée « Problèmes corrigés » (mémoire seulement), bouton « Tout remettre à neuf », aide contextuelle, recherche de l'accueil, journal, `BRIQUES_COMMUNES.md` (B.54), leçons, vérification des vidéos et de la page d'introduction (`modules/introduction/logique.js`), ligne `data/nouveautes.js` à la fin.

- [x] (FAIT le 16/11/2026, 3 063 tests verts, vérifié dans le navigateur, mode sombre compris) Consigne 422 `[effort : haut]` en trois étapes : A filtre figé et flèche de retour (46adfffc), B fiches lues sur place avec deux boutons et « Revenir à Nouveautés » (85b814d2), C pastilles de carte qui filtrent (jour exact, Nouveau, cadre, type ; second clic = retire).

## Risques
- Mémoire sur un poste partagé : la personne suivante hérite du « déjà vu » (pas de donnée personnelle, bouton de remise à neuf).
- Première visite : sans règle de départ, tout paraîtrait nouveau (voir hypothèse).
- Table domaine -> cadre : un rattachement discutable est possible (ex. « Assurance chômage » vers « Accompagnement »).
- Chargement des mois anciens : un mois sans fichier répond 404 (toléré aujourd'hui).
- `js/app.js` et `modules/*/index.js` ne passent pas les tests Node : test navigateur obligatoire à chaque lot.

## Verdict avant code
- Faisable tel quel : filtres, repli, recherche, pastilles mobile, « À venir » en tête, mémoire du vu.
- Faisable avec un ajustement : lecture sans limite des changements officiels (chargement progressif).
- **NON APTE AU MODE NUIT** tant que Denis n'a pas confirmé : (1) les trois hypothèses ci-dessus, (2) la table domaine -> cadre (16 lignes).
