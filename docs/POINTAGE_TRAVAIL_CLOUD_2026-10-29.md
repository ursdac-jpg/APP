# Pointage du travail cloud du 26/10/2026 : ce qui est fait, ce qui ne l'est pas (29/10/2026)

Source : `docs/MESSAGE_REPRISE_COMPLETE_2026-10-26.md`, `docs/CHANTIER_LOT8_EDITEUR_CV_2026-10-26.md`, `docs/SYNTHESE_AUDIT_TOUTES_CARTES_ET_PLAN_2026-10-26.md`. Chaque ligne a été recoupée avec le code, l'historique git (`git log b10fe586..HEAD`) ou une mesure du jour. Légende : FAIT (code ou commit retrouvé), MESURÉ (rejoué le 29/10), PAS FAIT, À VÉRIFIER (rien trouvé dans le code, pas remesuré).

## A. Éditeur de CV (Lot 8)

| Point | État | Preuve |
|---|---|---|
| 1. Choix automatique de la disposition « Empilée » | FAIT | `_pdfRetirerEnteteDecaleeSiTropEtroite`, `_cvPdfEmpileeRefusee`, `_pdfEnteteDebordePage` (`cvPdfPanneauReglages.js`), commit `ccdcb906`. Le bouton « Empilée » existe (`243929f`), retiré pour frise et friseFoncee. |
| 2. Éditorial et Chrono foncé | FAIT | `_pdfAjusterNomEditorial` (`a9791d08`), Chrono foncé (`d2dc066d`, `_cvPdfBoostInterditPour`). |
| 3. Bornes de l'en-tête et des colonnes (L8-12 à L8-15) | PARTIEL | `mqColonne` réglé (`0cfd7808`). Cahier du 27/10 : plus aucun anormal à l'état d'un CV neuf, 39 modèles, contenu long, moyen et court. Les réglages extrêmes choisis à la main (fond de colonne à droite, largeur 70 %, arche, colonnes inversées) n'ont pas été remesurés : le cloud notait que rien ne les répare quand la personne règle elle-même. |
| 4. « Style rapide » sans répétition | FAIT | `_pdfSacStyleRapide` (`cb0d38e8`), 0 répétition voisine sur 60 tirages. |
| 5. Page refaite deux fois | FAIT | `3ad417bc`, rejeu de `mesure_danse_de.js`. |
| 6. Autres gestes qui font clignoter | FAIT | `fa78427b`, preuve par empreintes. |
| 7. Trois cas de texte illisible restants | PAS FAIT (MESURÉ le 29/10) | `scan_f27.js` sur « Colonne claire » : « Limoges, 87000 » (texte sombre sur fond bleu foncé) reste illisible avec les bandeaux « pointe », « demi-ovale » et « créneaux ». Les trois cas du cloud sont toujours là. |
| 8. Balayage complet des options, contenu court puis moyen | PAS FAIT | Scripts prêts (`balayage_options.js`), aucun résultat enregistré, environ 1 h 30 par contenu. |
| 9. Largeur de colonne propre à chaque modèle | FAIT | `d36d247f` (30, 40 ou 50 % comme la vignette, largeur réglée à la main conservée). |
| 10. Mesure finale | PAS FAIT | À faire après les points 7 et 8. |
| L8-9 dates des certifications sous l'intitulé | FAIT | `0c6d5f94`. |
| L8-16 échelle de texte au maximum | PAS FAIT, basse priorité | 9 modèles dépassent 30 % pour l'en-tête avec le réglage extrême. |

## B. Lots de l'audit des cartes

| Lot | État | Preuve ou reste |
|---|---|---|
| L0, L1a, L4a, D30 | FAIT dans le cloud | `12efec0`, `bb78a2e`, `c2351ce`. |
| L1b (C14, retour du récit sans session) | FAIT | `6c3203cc`. |
| L2 (C1, plus de second passage pour Reformuler) | FAIT | `2ed8fda2`, barre de Reformuler `8bb0b440`. |
| L3a (titre au mot entier avec « … ») | FAIT | `9e93c9bd`. |
| L3b (mot « département ») | FAIT | `6c3203cc`. |
| L3c : D9 (majuscules), D11 (« Windows + H ») | FAIT | `6c3203cc`. |
| L3c : C8, D26, C22, D32, D15, D16, D17 | À VÉRIFIER | Aucun commit local ne les cite. D15 : deux thèmes du Lexique avec la même icône. D16 : sigle PMSMP non expliqué. |
| L4b (contrastes sombres) | FAIT | `d84dae95`. |
| L4c (D38, boutons flottants à 375 px) | PAS FAIT | Exige une maquette et un vrai téléphone. |
| L5 (un seul « Continuer » dans la barre) | PARTIEL | Fait : UCPM page 1, Reformuler et Récupérer votre CV (`ffbeaa46`). Pas fait : D1 (le message ne montre pas la section à remplir), D35 (deux boutons de Cohérence grisés sans explication), D41 (Comparer, étiquettes hors de vue), D45 (Cohérence, « Valider » dans la page), D47 (UCPM, le message ne dit pas quels CV), D49 (UCPM page 8, boutons dans la page), D50. |
| L6 (fin de parcours, décision 2) | PARTIEL | Fait pour tous les CV, entretien et UCPM (`190b90c4`). Pas fait : D33, D40, D44, aucun module d'analyse (Regard, ATS, Cohérence, Comparer, UCPM) n'a de bouton « Merci bien, j'ai fini ». |
| Décision 3 (titre des pages = nom du module) | FAIT | `e7a33de7` pour UCPM, Comparer, Regard, ATS, page Corriger du Bilan. Les autres modules sont à vérifier. |
| L7 (registre des familles de « Vos documents ») | PARTIEL | Pas 0 (module pur, 26 essais) et titre branché (`d58abe41`). Pas faits : barre, barre du bas unique, « Retour » unifié, fin, décisions, nettoyage. |
| L8 (« Revoir la présentation » en une seule brique) | À VÉRIFIER | Le standard existe (clos le 01/09), pas de trace de ce lot. |
| L9 (vocabulaire des barres d'étapes) | PARTIEL | Faites : Regard recruteur, ATS, Bilan, Cohérence, lettre, entretien, UCPM, Découvrir, Reformuler. Reste : barre du CV (« Réponse » contre « Résultat »), Comparer, style distinct de la navigation. |
| L10 (objectif, « Vos appuis » une seule fois, récit à 6 cartes) | FAIT | `889db970`, `c147ca2a`. |
| L11 (enveloppe commune de l'étape de l'assistant) | FAIT pour l'essentiel | Fenêtre commune « Collez la réponse » et décompte uniques (chantier B.17). |

## C. À regarder par Denis (le cloud ne peut pas juger)

Bouton « Empilée » avec de vrais clics, sept cas de lisibilité (`MAQUETTE_LISIBILITE_TEXTE_2026-10-26.html`), un vrai PDF et un vrai Word, Mes Repères sur téléphone, empreintes Word du banc de rendu dans son navigateur habituel, harmonie du mode sombre.
