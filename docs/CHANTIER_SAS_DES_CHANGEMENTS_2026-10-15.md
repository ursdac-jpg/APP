# Chantier : le sas des changements du balayage (2026-10-15)

Décision de Denis : **rien n'est publié dans « Ce qui a changé récemment » sans validation, un changement après l'autre**. Un changement « à vérifier » n'est jamais affiché. Ce qui est publié porte la marque verte « Vérifié le <date> ».
Maquette validée : `docs/MAQUETTE_SAS_DES_CHANGEMENTS_2026-10-15.html` (Q1 = A : digest seulement, les fiches des rayons plus tard ; Q2 = B : les 15 changements déjà publiés sont repris dans le sas, le digest actuel reste visible pendant la transition).

## Comment ça marche

1. **Le balayage** (outil de veille, « Balayage trimestriel ») : le bouton « Verser les changements dans le sas » (ex-« Télécharger le digest ») envoie chaque changement dans `outils/sas/changements.sas.txt`, fichier **jamais lu par l'application**. Il ne publie plus le fichier du trimestre d'un coup.
2. **Le sas** (outil de veille, Dépôt, section « 6. Les changements du trimestre ») : une carte par changement, tous les champs modifiables (domaine, intitulé, nature, date d'entrée en vigueur, public, ce qui change, source), « Ouvrir la source ». « C'est bon, publier » reste grisé tant qu'il manque un champ, que la date d'entrée en vigueur n'est pas au format `AAAA-MM-JJ` (ou `prévu AAAA-MM-JJ`, ou `sans objet` pour une simple information), que la source n'est pas en `https://` ou qu'un champ contient « à vérifier ».
3. **« Enregistrer »** : le changement entre dans `modules/comprendre-le-cadre/contenu/balayage/<mois>.md` (il **remplace** le changement du même intitulé dans le même domaine, jamais de doublon), avec la ligne `Vérifié le : <date du jour>` et sa source ajoutée à la liste de l'en-tête. Les tests automatiques tournent ; un enregistrement Git local, annulable (« Annuler la dernière publication »), remet le changement dans le sas.
4. **L'application** affiche la marque verte « Vérifié le … » ; un changement dont le texte contient « à vérifier » n'est jamais affiché.

## Fichiers

- `outils/veilleChangements.js` : format du sas, contrôles (`verifierChangement`), écriture dans le digest (`integrerDansDigest`), reprise d'un digest existant (`changementsDuDigest`), actions (`importer`, `valider`, `retirer`).
- `outils/veilleDepot.js` : type de publication `changements` ; `listerChangements()`. `outils/serveur_veille.js` : route `/api/changements/lister`.
- `outils/veille.html` : section 6 du Dépôt, fenêtre `#chgFenetre`, bouton du balayage.
- `tests/veilleChangements.test.js` : 14 essais (module, digests réels, publication complète dans un dépôt jetable).
- `scripts/reprendreDigestDansLeSas.js <racine> <AAAA-MM>` : verse les changements d'un digest déjà publié dans le sas (origine « reprise »). Fait le 2026-10-15 pour `2026-09` (16 changements ; 5 sans date d'entrée en vigueur lisible, à compléter ; 2 « sans objet »).
- Application : `modules/comprendre-le-cadre/index.js` (marque verte, masquage « à vérifier », lecture des sources avec fins de ligne Windows).

## État

- FAIT : tout ce qui précède, vérifié en navigateur sur une copie du dépôt (reprise, saisie d'une date, validation, enregistrement, remplacement sans doublon), `npm test` vert.
- **Reste à Denis** : valider les 16 changements du trimestre un par un (outil de veille, « 6. Les changements du trimestre »), dont 5 à compléter (France compétences, déploiement du contrat d'engagement, circulaire FIE, décret Mayotte, discours ministériel).
- **Constat à trancher par Denis** : « Allègement du dossier de saisine du conseil de prud'hommes » figure deux fois dans le digest (domaine « Emploi » et domaine « Annoncé, pas encore en vigueur »), alors que le décret est en vigueur depuis le 1er octobre. À écarter dans le sas ou à retirer du second domaine.
- **Décidé** : les domaines « Rien de nouveau retenu ce trimestre » ne sont plus affichés (seule la phrase nue est masquée ; les notes plus longues, dont « Dernier changement connu (hors trimestre) » du digest 2026-06, restent). Afficher un « dernier changement connu » validé (nouveau type du sas, étiqueté plus ancien) : plus tard.
- Pas encore repris : le digest `2026-06` (avril à juin), 14 changements.
- Les fiches des rayons restent hors sas (Q1 = A) : chantier séparé.
- Le type `balayage` de « Publier » (fichier entier) existe toujours côté serveur (tests) mais l'outil ne le produit plus.
