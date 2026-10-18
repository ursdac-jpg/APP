# Plan : liste « à revérifier » des pages d'offres dans l'outil de veille, puis retouche de l'écran des secteurs

> Écrit le 2026-10-17, après audit du code réel (`outils/veilleTerritoire.js`, `outils/veilleDepot.js`, `outils/serveur_veille.js`, `outils/veille.html`, `scripts/verifierRecruteursSas.js`). **Mode B, `[effort : moyen]`** pour la veille ; la retouche de l'écran des secteurs (partie 2) est de l'interface : voir la question en fin de document.

## Ce que l'audit a montré
**Simple (reprise de l'existant).** L'outil de veille a déjà une fenêtre « Qui fait quoi » avec un choix de registre (structures, employeurs), le filtre « À vérifier », les boutons Valider / Modifier / Supprimer / Ajouter, et l'enregistrement qui contrôle tout avec les règles de l'application (`mtVerifierEmployeurs`, etc.). Il suffit d'y ajouter un troisième registre : `offres.txt`, contrôlé par `mtVerifierOffres`.
**À adapter.** Le seuil n'est pas le même : pour les pages d'offres, « à revérifier » commence à **6 mois** (la page perd sa pastille verte), la page disparaît de l'application à **12 mois**. Une page d'offres ne s'enregistre jamais sans date de vérification à la main (le vérificateur la refuse) : changer l'adresse oblige à cocher « J'ai ouvert la page ».
**Nouveau.** Un contrôle **automatique** à la demande (bouton) : l'outil essaie d'ouvrir chaque page et dit si elle répond, mène ailleurs, est refusée aux robots (beaucoup de sites : Carrefour, par exemple) ou n'existe plus. **Il n'écrit rien et ne remplace jamais la vérification à la main** : une page refusée aux robots reste « à ouvrir à la main ». Les adresses sont lues dans le fichier, jamais saisies par la fenêtre (pas de risque d'ouvrir une adresse étrangère).
**Risque.** Aucun risque pour l'application publique : seul le dossier `outils/` (privé, sur le poste de Denis) et un texte d'aide changent.

## Cases à cocher
- [x] 1.1 `veilleTerritoire.js` : registre `offres` (colonnes, libellés, choix famille / territoire / secteur, colonnes `controle` et `stages` cachées et non modifiables), fraîcheur à 6 et 12 mois, ancienneté en mois, règle « date obligatoire ».
- [x] 1.2 `contexteDepuis` : fournir les identifiants des fiches d'employeurs au vérificateur.
- [x] 1.3 `veilleControle.js` (nouveau) : contrôle automatique des adresses, 4 à la fois, délai de 15 secondes, réponses classées (répond / mène ailleurs / refusé aux robots / n'existe plus / sans réponse).
- [x] 1.4 `veilleDepot.js` et `serveur_veille.js` : route `/api/territoire/controler`.
- [x] 1.5 `veille.html` : choix « Les pages d'offres des employeurs », textes du filtre et des statistiques selon le registre (6 mois / 12 mois), colonne « Adresse » qui montre la page, ancienneté en mois, bouton « Contrôler les adresses (automatique) » avec résultat par ligne, aide.
- [x] 1.6 Tests (`tests/veilleTerritoire.test.js`, contrôle sur de fausses réponses) ; `npm test` vert ; essai de la fenêtre à l'écran.
- [x] 1.7 Mise à jour : `docs/FAIRE_LA_VEILLE.md` (rythme : une fois par mois, regarder la liste « à revérifier »), `BRIQUES_COMMUNES.md` (B.25), reprise du chantier, mémoire.

## Résultat de la partie 1 (2026-10-17)
`npm test` : 1591 verts. Essai réel dans le navigateur (serveur local de l'outil, rien publié) : registre des pages d'offres affiché (27 pages), contrôle automatique réel de 27 adresses : 19 répondent, 6 refusent les robots (Académie de Bordeaux, Carrefour, CCI Limoges, hôpital de Belvès, gendarmerie, ministère de l'Intérieur), 2 sans réponse (ADEME, CROUS de Limoges : à ouvrir à la main).

## Partie 2 : demandes de Denis sur l'écran des secteurs (2026-10-17), à faire APRÈS la veille
1. Regrouper en haut de l'écran des secteurs les **trois cases** : « Employeurs qui publient leurs offres », « Agences d'intérim », « Insertion par l'activité économique ». Les agrandir un peu pour qu'elles se distinguent, sans faire concurrence aux 21 secteurs, qui suivent juste dessous. La ligne « La Bonne Boîte » reste tout en bas. Le titre « Autres portes d'entrée » disparaît.
2. **Insertion par l'activité économique (SIAE)** : dire clairement qu'il faut une **prescription** (faite par un conseiller en insertion professionnelle d'une structure d'accompagnement) et un **pass IAE valable deux ans**, avec le lien officiel pour comprendre comment il s'obtient. On peut regarder les structures, et plus tard les offres. Les informations et le lien officiel sont à chercher et à faire valider par Denis avant publication.
3. Les 21 secteurs restent tels quels (Denis : « c'est très bien fait »).

## Partie 2 : montrée à Denis dans le navigateur de test (2026-10-17), en attente de ses retours
Trois portes agrandies en haut de l écran des secteurs (offres publiées, intérim, insertion), puis les 21 secteurs, La Bonne Boîte en bas. Nouvel écran « Insertion par l activité économique » (prescription, pass IAE, trois liens officiels : Les emplois de l inclusion, aide « PASS IAE : comment ça marche », page France Travail). Précision trouvée dans les sources officielles : le pass n est pas demandé par la personne, il est délivré à l embauche une fois l éligibilité confirmée par un conseiller ; valable 24 mois au plus. Textes à valider par Denis. Essais navigateur monTerritoireOffres et monTerritoireAide verts.

Liens de l écran « Insertion » ouverts à la main par Denis le 2026-10-17 : aide « PASS IAE : comment ça marche », page « dispositifs-insertion » du ministère du Travail, page EPIDE du ministère, plateforme de l inclusion, annuaire INAÉ, page France Travail sur l IAE. À revérifier avec les pages d offres (tous les 6 mois).
