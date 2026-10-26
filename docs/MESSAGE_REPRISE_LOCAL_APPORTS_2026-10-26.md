# Message à coller au début de ta session locale (apports de Denis, 26/10/2026)

À coller tel quel, dans l'ordre. Il contient tout ce qu'une nouvelle session doit savoir. Avant de le coller, vérifie que ces trois fichiers sont bien dans `docs/` de ton dépôt local (sinon, copie-les depuis ceux que je t'ai envoyés) :

- `docs/DOSSIER_MATIERE_APPORTS_2026-10-26.md`
- `docs/BROUILLONS_LEXIQUE_LOTS_1_2_2026-10-26.md`
- `docs/LIGNES_SAS_APPORTS_2026-10-26.txt`

---

```
/app Reprise des apports de Denis du 26/10/2026 (documents et photos pris en formation et en stage).

LIS D'ABORD, dans l'ordre :
1. docs/DOSSIER_MATIERE_APPORTS_2026-10-26.md (l'inventaire : 62 informations utiles, module cible, garde-fous, cases de décision).
2. docs/BROUILLONS_LEXIQUE_LOTS_1_2_2026-10-26.md (dix brouillons de fiches du Lexique au format exact de data/lexique.js, déjà contrôlés par node scripts/checkLexique.js : aucune erreur).
3. docs/DOCTRINE_LEXIQUE.md (le Lexique explique le pourquoi, jamais le comment ; aucun chiffre qui peut vieillir ; jamais de diagnostic sur la personne).
4. docs/LIGNES_SAS_APPORTS_2026-10-26.txt (15 lignes de structures de la Dordogne pour le sas).

RÈGLES DE DENIS À RESPECTER :
- Jamais de nom de personne. Pour une structure : son nom, son téléphone, son mail. Rien d'autre.
- Les coordonnées passent par le sas (outils/sas/lieux.sas.txt), colonne date vide. Rien n'est publié avant que Denis ait appelé ou ouvert la page, puis cliqué « C'est bon » dans l'outil de veille.
- Les fiches du Lexique sont rédigées par Denis. Tu prépares la matière et des brouillons ; il tranche.
- Jamais de chiffre (montant, plafond, durée, pourcentage) dans le texte d'une fiche : ils vont dans un bloc daté vérifié à la source (chantier « chiffres à jour »).
- Ne reprends ni les textes ni les schémas des auteurs (supports de Lagarde et de Chaillat, 2017) : idées seulement, formulations propres. Ne reprends pas les questions de la grille d'Alèthéia (licence Creative Commons probablement sans modification).
- Respecte le protocole de CLAUDE.md : annonce mode et effort, attends mon réglage et mon « démarre », un commit par sous-étape, npm test avant, ligne dans docs/JOURNAL_DES_CHANGEMENTS.md, aucun push sans ma demande.

CE QUI EST DÉJÀ FAIT :
- 15 lignes de structures préparées (équipe mobile psychiatrie précarité du Bergeracois, 8 groupes d'entraide mutuelle de Croix Marine, Part'ÂGE, centre médico-social de Sigoulès, La Traverse accès aux droits, CIDFF 24 numérique, Parcours Confiance, service L'Appui de La Banque Postale). Vérifie d'abord si elles sont déjà dans outils/sas/lieux.sas.txt (cherche par identifiant) ; sinon ajoute-les à la fin du fichier, sans doublon.
- Dix brouillons de fiches du Lexique (estime de soi, confiance en soi, affirmation de soi, les trois notions voisines, croyance limitante, cercle de l'estime de soi, message en « je », méthode DESC, critique ou reproche, styles de communication). Rien n'est dans data/lexique.js.

MODE B, [effort : moyen]. TÂCHES, dans cet ordre :
A. [effort : bas] Sas : vérifier que les 15 lignes sont bien dans outils/sas/lieux.sas.txt, lancer npm test, et me dire en une ligne ce qui reste à valider dans l'outil de veille (appels).
B. [effort : bas] Fiches publiées à compléter : ajouter le mail associationbase@gmail.com à la fiche asso-base-24 et mentionner l'espace de vie sociale Part'ÂGE ; ajouter le mail association@croixmarine24.fr à asso-croix-marine-24 ; comparer l'Atelier budgétaire de Périgueux (sas, ligne atelier-budgetaire-perigueux-24) avec le mail contact24@latelierbudgetaire.org et l'adresse 5 rue Sirey ; comparer Adie Saint-Astier avec la fiche du dossier. Tout passe par le sas ou par la procédure habituelle, avec date « j'ai appelé ».
C. [effort : moyen] Lexique, lot 1 puis lot 2 : relis avec moi chaque brouillon (une fiche à la fois, je dis GARDER, CORRIGER ou ÉCARTER), colle les fiches validées dans data/lexique.js, lance node scripts/checkLexique.js (0 erreur et 0 avertissement) et npm test, ajoute la ligne du journal, puis vérifie dans le navigateur la recherche de l'accueil et celle du Lexique, en clair et en sombre.
D. Les quatre dispositifs de la Mission Locale du Bergeracois (« Mieux dans ma tête, mieux dans mon job », Pair'mission, « Raconte-moi ton projet », Terres Equi'Solidaires) : NE crée PAS quatre lignes. Lis la page officielle missionlocaledubergeracois.com pour confirmer qui porte chacun, puis propose-moi UNE phrase pour la ligne publiée asso-mission-locale-du-bergeracois-24. Attention : la brochure de Terres Equi'Solidaires porte le logo de l'association APES 24, il faut vérifier le porteur.
E. Plus tard, séances séparées, Mode A [effort : haut] (maquette d'abord, jamais à chaud) : les exercices de Mes Repères et du Carnet (carnet de réussites, livre d'or des paroles bienveillantes, carte d'identité relationnelle), les phrases d'entraînement à l'entretien, puis les fiches du logement (Mobili-Jeune, accompagnement social d'Action Logement) avec bloc daté pour les chiffres.

ÉCARTÉ, ne pas reproposer : questionnaires avec scores, étiquettes « faible ou haute estime de soi », portrait du manipulateur, pourcentages de communication, planches illustrées, feuille manuscrite de contacts.

À CHAQUE ÉTAPE : dis-moi en une ligne comment vérifier moi-même en dix secondes (quoi cliquer, quoi regarder). Si tu constates une erreur ou un malentendu, inscris-le dans docs/LECONS_A_NE_PAS_REPRODUIRE.md.
```

---

## Ce que fait chaque tâche pour toi

| Tâche | Ce que tu obtiens | Ce que tu fais |
|---|---|---|
| A | les 15 structures sont dans le sas | appeler, puis « C'est bon » dans l'outil de veille |
| B | trois fiches publiées complétées avec des mails | rien, juste valider |
| C | dix fiches dans le Lexique, contrôlées et trouvables par la recherche | dire GARDER, CORRIGER ou ÉCARTER pour chaque fiche |
| D | une phrase unique sur les quatre dispositifs, ou rien | dire oui ou non |
| E | maquettes, jamais du code direct | tranches en Mode A, un jour où tu es en forme |
