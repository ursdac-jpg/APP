# Faire la veille : le rituel, pour Claude (n'importe quel compte)

Créé le 2026-10-05 à la demande de Denis. À lire en entier avant de lancer une veille. Ce fichier est fait pour qu'**un autre compte ou une autre séance reprenne exactement la même méthode**, sans mémoire ni explication.

## Ce que Denis dit

Une phrase suffit :
- « **Fais la veille du mois** » : contrôle des fiches des rayons mensuels (voir plus bas).
- « **Fais la veille du trimestre** » : balayage des changements officiels, triage, mise à jour des fiches, puis les chiffres.
- « **Mets à jour les chiffres** » : seulement « Comprendre les chiffres ».

**Répartition validée (2026-09-06, rappelée 2026-10-05) : Claude opère, Denis décide.** Claude cherche, compare, rédige, corrige, teste et commite. Denis lit, tranche (oui / non / à reprendre) et valide les textes. Il ne fait **ni** recherche sur le web **ni** copier-coller vers un autre assistant **ni** Git.

## Avant de commencer (5 minutes)

1. Lire `docs/ETAT_DES_CHANTIERS.md` partie 0 et `docs/MAJ_CONTENU_2026-10.md` (dernier passage : ce qui est fait, ce qui reste).
2. Vérifier la **date système réelle** (jamais la déduire de la conversation).
3. `git log -1` : contrôler que l'état correspond aux documents.
4. Registre des décisions : `docs/NOUVEAUTES_A_STATUER.md` (une ligne par changement, avec la décision de Denis).

## Veille du mois : contrôle des rayons mensuels

Rayons mensuels : **étranger, budget, emploi, juridique** (voir `docs/VEILLE_PROMPTS.md`, « Cadence par rayon »).
Pour chaque rayon :
1. Lister les points « ce qui change souvent » et les `revisions:` de chaque fiche (commande : lecture des `.md` de `modules/comprendre-le-cadre/contenu/<rayon>/`).
2. Chercher sur les **sources officielles** (service-public.gouv.fr, Légifrance, ministères, Unédic, France Travail, CAF, ameli, INSEE, Banque de France) ce qui a bougé depuis la dernière date.
3. Comparer au texte de la fiche. Corriger ce qui est faux ou périmé. Noter ce qui est confirmé.
4. **Contrôle fiche par fiche** (le seul qui justifie de mettre à jour `verifie_le`) : relire chaque affirmation de la fiche contre sa source. Une fiche seulement comparée aux changements récents **ne change pas** sa date `verifie_le`.

## Veille du trimestre : balayage, triage, mise à jour, chiffres

1. **Balayage** : changements officiels des trois derniers mois, par domaine (voir `docs/VEILLE_PROMPTS.md` § 5bis). Fichier produit : `modules/comprendre-le-cadre/contenu/balayage/AAAA-MM.md`. Règles : un changement n'apparaît **qu'une fois** ; ce qui est déjà en vigueur ne va jamais dans « Annoncé, pas encore en vigueur » ; jamais « en vigueur : à vérifier » sans le dire clairement.
2. **Triage** : pour chaque changement, la fiche concernée (ou « sujet nouveau ») et la décision : MISE À JOUR / NOUVELLE FICHE / ÉCARTÉ (actualité seulement). Une ligne par changement dans `docs/NOUVEAUTES_A_STATUER.md`.
3. **Mise à jour des fiches** (voir « Règles d'écriture »).
4. **Chiffres** : `modules/comprendre-les-chiffres/contenu/` (voir plus bas).
5. **Lexique** si un terme change : `data/lexique.js` puis `node scripts/checkLexique.js` (0 erreur, 0 avertissement).

## Règles d'écriture des fiches (rappel des règles du module)

- **Aucun montant ni date figée** dans le corps d'une fiche : les montants changent (la fiche dit où les trouver). Les durées et dates de mise en application d'une règle, oui.
- Français impeccable, accents, **jamais de tiret cadratin**, jamais le mot « IA », ton simple et rassurant, jamais de diagnostic sur la personne.
- Chaque fait important vient d'une **source officielle ouverte pendant la séance** (ouvrir la page, pas seulement lire un résultat de recherche). Ajouter l'adresse à `modules/comprendre-le-cadre/liens-verifies.txt` avec la date du jour, sous la forme `nom-court | adresse | AAAA-MM-JJ | national`.
- Une ligne `revisions:` datée dans la fiche pour chaque changement, avec la source et la date de vérification. Mettre `verifie_le: AAAA-MM`.
- Nouvelle fiche : fichier dans le bon rayon, ligne dans le `README.md` du rayon (tableau « Les N fiches »), entrée dans `<rayon>.collecte.md` (sources et matériau), `voir_aussi_lexique` avec des identifiants qui existent. Puis `node scripts/genererRenvoisCadre.js`.
- Un résumé automatique d'une page web dynamique (par exemple Data Emploi) peut être faux : **lire la page dans le navigateur intégré**.

## Chiffres

- Chômage localisé et emploi salarié : INSEE, fichiers Excel de la série longue (région et département), publiés environ 2,5 mois après la fin du trimestre. Lire le fichier avec Excel en lecture seule (PowerShell, objet COM) ou autre outil, jamais en recopiant à la main.
- Offres d'emploi, embauches : Data Emploi (France Travail), pages « Panorama », à lire dans le navigateur. Les embauches ont un retard d'environ six mois.
- Demandeurs d'emploi : **ne jamais mélanger** la mesure de la Dares (corrigée des variations saisonnières) et celle de Data Emploi : elles donnent des nombres différents.
- Après modification : vérifier que le module lit bien le fichier (fonction d'analyse du module dans le navigateur).

## Après chaque modification de fiche (obligatoire)

1. `node scripts/genererBaseVeille.js` : régénère `outils/base_fiches.js`, la copie lue par l'outil de veille (sinon `npm test` échoue, test `tests/baseVeille.test.js`).
2. `node scripts/genererRenvoisCadre.js` si une fiche a changé ses `voir_aussi_lexique`.
3. `node scripts/checkLexique.js` si le Lexique a changé.
4. `npm test` entièrement vert.
5. Vérifier une fiche modifiée dans l'application (module « Comprendre le cadre »).
6. Commit sur `master` avec **chemins explicites** (jamais `git add -A`), message en français. **Jamais de push** sans demande de Denis.
7. Mettre à jour `docs/MAJ_CONTENU_<date>.md` et la partie 0 de `docs/ETAT_DES_CHANTIERS.md`.

## Ce qu'on rend à Denis à la fin

Une liste **courte** : ce qui a été modifié (fiche, une ligne), ce qui demande sa décision (avec la recommandation de Claude et les bénéfices / risques de chaque option), et la façon de vérifier en 10 secondes. Jamais le détail du travail.

## L'outil de veille (`outils/veille.html`)

Denis l'ouvre par un raccourci sur son bureau (fichier local, sans serveur). Depuis le 2026-10-05, il charge sa base tout seul (`outils/base_fiches.js`), affiche l'état réel des rayons d'après les `verifie_le` des fiches, et propose trois gestes. Il reste utile pour regarder l'état des fiches. La **recherche** elle-même, le **triage**, la **rédaction** et le **dépôt** se font ici, avec Claude, pas dans l'outil.

## Pages d'offres des employeurs : la liste « à revérifier » (une fois par mois)

Rubrique « Employeurs qui publient leurs offres » (fichier `modules/mon-territoire/contenu/offres.txt`). Une page porte la pastille verte « Vérifié le [date] » pendant 6 mois ; de 6 à 12 mois elle reste visible « à revérifier » ; au-delà, elle disparaît de l'application.
1. Outil de veille, fenêtre « Qui fait quoi », registre **« Les pages d'offres des employeurs »**, filtre **« À revérifier »**.
2. Facultatif : bouton **« Contrôler les adresses (automatique) »** (une à deux minutes). Il dit pour chaque page si elle répond, mène ailleurs, refuse les robots ou n'existe plus. Il ne modifie rien et ne prouve pas qu'une liste d'offres y figure : une page « refuse les robots » (beaucoup d'employeurs) est simplement à ouvrir à la main.
3. Ouvrir chaque page, vérifier qu'une liste d'offres y figure, puis **« Valider »** (date du jour). Si l'adresse a changé : **« Modifier »**, coller la nouvelle adresse et cocher « J'ai ouvert la page ». Une page qui n'existe plus : **« Supprimer »**.
4. **« Enregistrer les modifications »** (l'outil contrôle tout avec les règles de l'application avant d'écrire).

## Où trouver quoi dans l'outil de veille (module « Qui fait quoi »), mis à jour le 2026-10-17
- Fenêtre « Qui fait quoi » (registres publiés, avec « à revérifier ») : structures, employeurs (dont les agences d'intérim), **pages d'offres des employeurs**.
- Bouton **« Le sas »** (fiches proposées à vérifier une par une, « C'est bon, publier » pose la date du jour) : structures, employeurs, téléphones, **pages d'offres**. Dans le sas des employeurs, le filtre « Tous les types » propose « Agence d'intérim », « Enseigne », « Employeur local ». Dans le sas des **pages d'offres**, le même filtre propose **« Fonction publique »**, « Employeur privé ou association », « Groupement d'employeurs », « Chambre ou fédération » ; les autres filtres : territoire et secteur.
- Fenêtre « Les adresses » (registre des adresses) : tous les liens du module écrits à un seul endroit (liens de l'écran Insertion, La Bonne Boîte...), à rouvrir tous les 12 mois.
- Importer des pages proposées par un assistant : « Importer plusieurs fiches », choisir « des pages d'offres des employeurs », coller les lignes au format `id | famille | nom | secteur | territoire | page | employeur | source | date | contrôle | stages`.
