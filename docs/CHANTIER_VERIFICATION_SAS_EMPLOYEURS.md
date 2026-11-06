# Chantier : vérification des fiches employeurs du sas (module « Qui fait quoi »)

Document de passation. Dernière mise à jour : 31 octobre 2026. À relire en entier à chaque reprise (autre compte compris).

## But

Vérifier et corriger les 858 fiches de `outils/sas/employeurs.sas.txt` (le sas n'est jamais lu par l'application) avant leur passage dans le registre public `modules/mon-territoire/contenu/employeurs.txt`. Le module reste fermé au public (`MT_OUVERT=false`).

## Méthode fixée par Denis

- Les adresses, communes et téléphones des magasins viennent des **textes que Denis copie** depuis les pages officielles des enseignes. Ce sont la vérité. Un assistant ne fournit jamais une adresse ou un téléphone.
- Un assistant (Claude du cloud, Perplexity) ne sert qu'à trouver le **site** et la **page de recrutement**. Claude local teste ensuite chaque adresse par `fetch`.
- Une fiche par enseigne pour les deux départements (Dordogne 24, Haute-Vienne 87). Un magasin fermé tous les jours n'est pas retenu.
- Tout ce qui n'est pas fiable est **retiré** (« si ce n'est pas fiable, on laisse tomber »). Denis pourra réessayer plus tard avec l'outil de prospection.
- Claude n'écrit **jamais** de date de vérification : « C'est bon » est la validation de Denis.
- Règle de secteur (30/10/2026) : banques, assurances, immobilier = pas de liste d'agences, message général vers le site de l'enseigne (déjà codé : `mtMessageAgencesNombreuses`). Magasins, commerce, santé, social, artisanat = on garde adresses et téléphones.
- Prompts du cloud : toujours terminer par la section « À OUVRIR PAR MOI » (liens cliquables Markdown vers le site et la page de recrutement de chaque employeur dont le site bloque les robots).

## Outils (dossier `scripts/veille_sas/`)

- `valider_sas.js` : contrôle de forme (même règle que l'application). À lancer après toute modification : attendu 0 erreur.
- `tester_urls.js <url> ...` : code de réponse, adresse finale et titre. 403/429/503 = anti-robot, non concluant ; `ENOTFOUND` = domaine inexistant (à confirmer deux fois) ; erreur de certificat = non concluant ; 404 sur une page de recrutement = à retirer.
- `test_massif.js [sortie.json]` puis `appliquer_massif.js [sortie.json]` (`DRY=1` pour simuler) : test de toutes les adresses non vérifiées et retrait automatique des domaines morts et des pages de recrutement en 404.
- `npm test` doit rester vert (2194 réussis) ; si le lexique est touché : `node scripts/checkLexique.js`.

## Format d'une ligne du sas

`id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date`

Nature : enseigne, local ou interim. Établissements : `Commune:adresse:téléphone ; ...`. Les noms de communes doivent exister exactement dans `modules/mon-territoire/contenu/communes-24.txt` ou `communes-87.txt` (ex. « Coly-Saint-Amand »). Écrire avec Python en `newline=''`, en découpant sur `|`, jamais `git add -A`.

## Pièges rencontrés (leçon 9.78 de `docs/LECONS_A_NE_PAS_REPRODUIRE.md`)

Homonymes et filiales régionales (Banque Populaire bpbfc = Bourgogne Franche-Comté ; Caisse d'Épargne cepac = Provence-Alpes-Corse ; Adapeila = Loire-Atlantique, pas Dordogne). Sites annuaires ou à vendre ou parqués. Sites de ressemblance. Toujours lire une phrase de la page qui nomme le département ou la ville avant d'enregistrer.

## Fait au 30/10/2026

858 fiches, 0 erreur. Environ 70 fiches confirmées, 132 sites morts et 116 pages de recrutement mortes retirés, 5 sites erronés retirés. Message « agences nombreuses » codé et testé. Fiche Cerfrance Centre Limousin et Apei Périgueux faites. Derniers commits : 6105a0fc, 5f30f6e2, fccf4efe.

## Repère « Pré-validée » (31/10/2026, consigne 83 de Denis)

Une fiche du sas déjà contrôlée porte une étoile avec la raison du contrôle dans son coin, un filtre « Pré-validées » (combinable avec tous les autres filtres) et un bouton « Mettre C'est bon sur ces N » qui coche les pré-validées de la liste filtrée (toutes les pages). Rien n'est publié avant « Enregistrer ». Une fiche modifiée depuis son contrôle perd l'étoile (« Modifiée depuis la pré-validation »).

- Le repère vit dans `outils/sas/prevalidees.txt` (fichier, identifiant, base du contrôle, empreinte). Code : `outils/veillePrevalidees.js` (brique unique), branché dans `listerSas` de `outils/veilleDepot.js` et dans la fenêtre du sas de `outils/veille.html`. Tests : `tests/veillePrevalidees.test.js`.
- Bases : `texte-denis`, `denis-main`, `test-et-assistant`, `appel-denis`.
- **Inscrire des fiches contrôlées (seulement avec l'accord de Denis)** : `node scripts/veille_sas/prevalider.js employeurs texte-denis id1,id2` (ou `lieux`). Relancer cette commande après toute correction d'une fiche déjà pré-validée, si on veut lui rendre l'étoile.
- Premier remplissage (`--amorcer`) : 101 employeurs dont la source dit « Denis » ou « testés », sauf six non terminés (derichebourg-proprete, mma, yelloh-village-dordogne, greta-cfa-aquitaine-dordogne, la-perigourdine, caisse-d-epargne-aquitaine-poitou-charentes). Aucune structure n'est encore pré-validée.
- Aucune date n'est écrite dans ce fichier : la date est celle du commit Git.
- **Deux niveaux d'étoile (31/10/2026)** : doré = « à la main » (bases `texte-denis`, `denis-main`, `appel-denis`), bleu = « par l'assistant » (base `test-et-assistant`). Filtres « à la main » et « par l'assistant » ; bouton « Seulement sur les N vérifiées à la main ».
- **Fiches venues de la prospection** : à l'import dans le sas (`outils/veilleDepot.js`, branche `sas`), une fiche dont la source commence par « Via prospection ; » et contient « vérifiées à la main le JJ/MM/AAAA » (date écrite par la prospection, passage 3) reçoit l'étoile dorée automatiquement, dans le même enregistrement Git ; « Annuler la dernière publication » la retire aussi. Seuls les employeurs sont concernés : pour les structures de la prospection (« comparée »), rien d'automatique, un appel reste nécessaire.
- **Vue tableau du sas (31/10/2026)** : bouton « Voir en tableau » dans la barre de filtres de la fenêtre du sas (tous les sas sauf les numéros) : toutes les fiches des filtres en cours, une colonne « Pré-validation », tri par clic sur le titre de colonne, clic sur un nom pour ouvrir la fiche, « Copier ces N lignes pour un tableur » (texte tabulé, collable dans Excel ou LibreOffice). Lecture seule : aucun choix ni enregistrement depuis le tableau.
- **Attention** : si `outils/sas/prevalidees.txt` est modifié sans être commité (après `prevalider.js`), l'outil de veille refuse un import ou une publication du sas (« Un enregistrement précédent a été interrompu »). Commiter le fichier tout de suite après `prevalider.js`.

## Prompts du cloud du sas complet (31/10/2026)

`docs/PROMPTS_CLOUD_LOTS_SAS_COMPLET_2026-10-31.md` : 51 lots de 25 fiches (confirmer les sites qui répondent, trouver les bons sites, trouver les sites manquants), fabriqués par `scripts/veille_sas/fabriquer_prompts.js` à partir de `test_massif.js` (employeurs) et `test_lieux.js` (structures). `docs/A_OUVRIR_PAR_DENIS_2026-10-31.md` : 30 employeurs et 10 structures dont le site refuse les robots, avec liens cliquables. Pour une structure, le cloud copie le numéro AFFICHÉ sur la page officielle avec l'adresse de la page ; le Claude local retrouve ce numéro dans la page lui-même avant de l'inscrire (jamais un numéro non retrouvé).

## Reste à faire

0. **Messages cloud du 01/11/2026 (tout ce qui reste à vérifier)** : `docs/PROMPTS_CLOUD_PAR_SECTEUR_2026-11-01.md` (lots A et B à part, puis 76 lots : employeurs et structures non pré-validés) et `docs/PROMPTS_CLOUD_INTERIM_ET_RECRUTEURS_2026-11-01.md` (15 lots : 93 agences d'intérim, 112 pages de recrutement sans date). Chaque réponse doit donner le verdict de présence en 24 et en 87 (« pas de présence sur le territoire » si aucune agence ni point). Denis rapporte les réponses dans un document : tester chaque adresse, inscrire seulement le confirmé, proposer le retrait des fiches sans présence, aucune date écrite.
1. Lots de recherche cloud 6 à 9 : faits par Denis le 31/10/2026, résultats à intégrer quand il les apporte. Puis les 51 nouveaux lots (voir ci-dessus) : résultats à intégrer, fiches confirmées inscrites en « pré-validées » avec l'accord de Denis.
2. Non résolus : ASSAD Dordogne, Éveil Aides et Services, Weesure, Provençale, Boulangerie Sylvain Chatenet, Clara Automobiles, Yelloh Pomport Beach (site et recrutement bloqués), Greta-CFA (page de recrutement), fusion proposée de « Gamm Vert (La Périgourdine) » dans `la-perigourdine`.
3. Banque Populaire Aquitaine Centre Atlantique et Caisse d'Épargne Aquitaine Poitou-Charentes : Denis cherche les pages de recrutement de la bonne région.
4. Après le « C'est bon » de Denis sur les fiches regroupées : retirer du registre public les 9 anciennes fiches `…-dordogne` (leroy-merlin, brico-depot, mr-bricolage, jardiland, action, gifi, super-u, u-express, hyper-u), puis ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` et `data/nouveautes.js` quand le module ouvre.

## Quand Denis rapporte des informations

Pour chaque employeur : tester le site et la page de recrutement avec `tester_urls.js` (nom de l'employeur présent dans la page, bonne région), inscrire dans le sas seulement ce qui est confirmé, retirer ce qui est mort, ne jamais inventer une adresse ou un téléphone, valider (`valider_sas.js`, `npm test`), committer le sas seul sur `master` (pas de push), puis rendre compte en quelques lignes : ce qui est ajouté, ce qui est retiré, ce qui reste à trancher par Denis.

## Passe du 01/11/2026 (résultats de Denis et rapports du cloud sur les lots 6 à 9 et suivants)

Denis a donné, pour une soixantaine d'employeurs, le site, la page de recrutement et parfois l'adresse et le téléphone copiés sur les pages officielles. Testés avec `tester_urls.js` (variante qui cherche aussi le nom de l'employeur et la région dans la page). **49 fiches corrigées** : sites et pages de recrutement remplacés par ceux de Denis (les anciens étaient souvent des domaines devinés), adresses et téléphones recopiés tels que donnés. **Regroupés par enseigne** : Monoprix (Périgueux et Limoges, id `monoprix`), Weldom (Sarlat, Limoges, Aixe-sur-Vienne, id `weldom`), Hénault Recyclage (Oradour-sur-Glane, Limoges, Bonnac-la-Côte). **Fondu** : Royer Logistique dans Transports Royer-Sazerat (même site Santos Dumont). **Solune** : page de recrutement retirée (domaine différent, non confirmé). Commit du sas seul, 857 fiches, 0 erreur de forme.
- Réponse 200 avec le nom de l'employeur dans la page : Abeille Compost, Amelis, Avenir Paysage, Big Big, Centrale Auto Marché, Celio (recrutement), Chronopost (recrutement), CH de Domme, Code to Solve, Ecomdata, Entreprise Guy, Flacassier, Grasasa, Greta du Limousin, Guyenne Papier, Hébert, Hénault, L'Agence, Les Pros d'Avenir, Maisons du Monde (recrutement), Monoprix (recrutement), Monstera, Nicollin (recrutement), Petits-fils (recrutement), Rebinguet, Royer-Sazerat, Senior Compagnie, Solune, Vesunna et la page des offres de la Ville de Périgueux, Veolia (offres).
- Bloqués par le site (403, 503) : adresses de Denis gardées, non concluantes : Cultura, Monoprix (site), Maisons du Monde (site), Besson, Celio (site), H&M, Weldom, CH de Périgueux (maintenance), CH de Vauclaire, CEVA (site), Chronopost (site), CCI Limoges, Protectim, Académie de Limoges, ASPTT, Esthetic Center, Veolia.fr, WTTJ (Arquus).
- Erreur de certificat ou connexion coupée (non concluant) : Eurenco, Arquus, MGEN (recrutement), Nicollin (site), URSSAF.
- **À trancher par Denis** : CDR Environnement (le site donné est celui de la Corrèze), AGC (le site `agc-contractant.fr` est une autre société, indicatif 05 56 Gironde, la fiche « AGC Dordogne » n'est pas modifiée), Savencia (présence en 24 ou 87 inconnue, pas de fiche), Nicollin et Protectim (présence 24 ou 87 à confirmer), Esthetic Center (Limoges seulement : la fiche indique Le Vigen), pages de recrutement de Greta-CFA, CH de Périgueux (site en maintenance : à retester), Arquus (page WTTJ, un site d'offres tiers).
- Pas encore inscrit « Pré-validée » : attente de l'accord de Denis (`prevalider.js`).
