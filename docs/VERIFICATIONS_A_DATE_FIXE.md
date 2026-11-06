# Vérifications à date fixe : le Smic, l'inflation et les métiers qui recrutent

Fichier vivant (sans date dans le nom). Il liste les chiffres de l'application qui changent à un rythme connu, la date de la prochaine vérification et la marche à suivre. Ouvert le 2026-11-05 (consigne 117 de Denis).

Source unique des deux séries : `modules/comprendre-les-chiffres/donnees/smic-inflation.json`. Affichées dans « Comprendre les chiffres » (carte du chômage et vue Union européenne) et citées dans le Lexique (mots « Smic » et « Inflation »).

## L'inflation : chaque mois

| Prochaine échéance | Ce qui sort |
|---|---|
| 2026-11-13 | Résultats définitifs d'octobre 2026 (remplacent l'estimation provisoire) |
| 2026-11-27 | Estimation provisoire de novembre 2026 |
| Ensuite | Chaque fin de mois (le calendrier de l'Insee donne la date exacte) |

Ce que fait l'application sans intervention : à la date `prochaine_publication` du fichier, la carte retire le vieux chiffre et affiche « Un nouveau chiffre est paru. Voyez le plus récent sur le site de l'Insee », avec le lien vers la source.

À faire à chaque échéance :
1. Ouvrir la page de l'Insee « Informations rapides, prix à la consommation » (lien dans le fichier JSON, `inflation.sources`).
2. Reporter dans le fichier : `dernier` (mois, `sur_un_an`, `sur_un_mois`, `provisoire`, `publie_le`, énergie, alimentation, services, etc.), `precedent`, `resultats_definitifs_prevus`, `prochaine_publication`, et `verifie_le`.
3. Mettre à jour la ligne « détails à jour » du mot « Inflation » du Lexique (`data/lexique.js`, `detailsAJour`) avec les mêmes valeurs, puis `node scripts/checkLexique.js` et `npm test`.
4. Jamais de chiffre écrit de mémoire : seulement une page officielle ouverte.

## Le Smic : au 1er janvier, et en cours d'année si une hausse est annoncée

| Prochaine échéance | Pourquoi |
|---|---|
| 2027-01-01 | Revalorisation annuelle : à revérifier dès l'annonce (décembre 2026) |
| 2027-05-05 | Limite : six mois après la vérification du 2026-11-05, l'application retire le montant si rien n'a été revérifié |
| Si les prix montent de 2 % ou plus | Revalorisation automatique en cours d'année : à revérifier dès l'annonce |

À faire à chaque échéance :
1. Ouvrir la fiche Service-public « Salaire minimum interprofessionnel de croissance (Smic) » (lien dans le JSON, `smic.sources`).
2. Mettre à jour `smic.en_vigueur` et `smic.precedent`, la liste `regles_qui_gardent_la_valeur_du_1er_janvier` (cumul emploi-retraite, RGDU : vérifier chaque règle, la réforme du cumul emploi-retraite de 2027 est à contrôler) et `verifie_le`.
3. Mettre à jour le mot « Smic » du Lexique, le mot « RGDU » et les autres textes qui citent un montant : `npm test` signale tout montant du Smic absent de la source (`tests/smicSource.test.js`).

## Où signaler que c'est fait

Une ligne datée dans `docs/JOURNAL_DES_CHANGEMENTS.md` à chaque mise à jour, et la date de la prochaine échéance corrigée dans ce fichier.

## Les métiers qui recrutent le plus : une fois par an, au printemps

Source unique : `modules/comprendre-les-chiffres/donnees/bmo-metiers.json` (10 métiers par département, Dordogne et Haute-Vienne), produit par `scripts/genereBmoMetiers.js` à partir du fichier ouvert de l'enquête « Besoins en main-d'œuvre » de France Travail. Affiché dans « Comprendre les chiffres », bloc « Ce que les employeurs prévoient d'embaucher cette année ». L'outil de veille l'a déjà dans sa liste de sites à ouvrir (source « Enquête Besoins en Main d'Œuvre (France Travail) »).

| Prochaine échéance | Ce qui sort |
|---|---|
| Printemps 2027 (l'enquête 2026 a été publiée le 21 avril 2026) | Nouvelle enquête, nouveau fichier .xlsx |
| 2027-05-21 | Limite : treize mois après la publication, l'application retire la liste et affiche « Les résultats datent de plus d'un an » si rien n'a été renouvelé |

Ce que fait l'application sans intervention : treize mois après `publie_le`, la liste disparaît (plus aucun chiffre périmé), le message explique que la nouvelle enquête paraît chaque printemps.

À faire à chaque parution :
1. Ouvrir le site de l'enquête depuis l'outil de veille (source « bmo-francetravail ») et télécharger le fichier ouvert (.xlsx) de la nouvelle année.
2. Le déposer dans `PROSPECTION/donnees_externes/bmo` (le plus récent est lu).
3. Double-cliquer sur `outils/Mettre a jour les metiers qui recrutent.bat` (ou `node scripts/genereBmoMetiers.js --xlsx AAAA-MM-JJ`) et donner la date de publication de l'enquête. Cela refait `bmo-metiers.json` et rafraîchit la copie lue par l'outil de prospection.
4. `npm test`, regarder la carte dans « Comprendre les chiffres » pour les deux départements, une ligne datée dans `docs/JOURNAL_DES_CHANGEMENTS.md`, puis commit.
5. Si le fichier change de forme (colonnes renommées), la conversion s'arrête avec « Colonne introuvable » : le dire à Claude, ne rien inventer.

Jamais de chiffre écrit de mémoire : seulement le fichier officiel. Les nombres masqués par France Travail (secret statistique) sont ignorés : tous les chiffres affichés sont des minimums, et l'écran l'annonce.
