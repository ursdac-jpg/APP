# Plan : banc de rendu fiable et miniatures fidèles des modèles de CV (2026-10-11)

Statut : VALIDÉ par Denis (2026-10-11, « ok, go »). **T0 à T6 FAITS** ; verdict T0 : GO (voir plus bas). Mode A, `[effort : haut]`. Contexte et mesures : `docs/AUDIT_VIGNETTES_MODELES_CV_2026-10-11.md`.

## Principe (une seule mécanique pour trois besoins)

Le moteur de CV sait déjà rendre un CV complet dans une page cachée à partir d'une COPIE du dossier (`ucpmRendreCv`, `modules/un-cv-plusieurs-metiers/dossierEchange.js` : page cachée, attente de la fin du rendu, récupération du HTML et des règles de style). On s'en sert pour fabriquer, avec un CV d'exemple fixe :
1. le **banc de non-régression** (empreintes du rendu de chaque modèle), fiable parce que chaque modèle est rendu dans une page cachée NEUVE (aucune pollution par le modèle d'avant, aucune dépendance à l'état du panneau) et que la photo du jeu d'essai est une valeur écrite en dur (plus de dépendance à la version du navigateur) ;
2. les **miniatures de la galerie**, qui sont le vrai rendu réduit (jamais un dessin) ;
3. l'**alarme de miniature périmée** : le fichier des empreintes est aussi le registre des miniatures ; si un modèle change, le banc dit « miniature à régénérer ».

## Options écartées (et pourquoi)
- Miniatures calculées en direct à chaque ouverture de la galerie : toujours fidèles, mais jusqu'à 24 rendus par ouverture, trop lourd pour un vieux poste de bibliothèque ; à garder comme évolution possible (une famille à la fois, en tâche de fond).
- Redessiner à la main les 15 silhouettes fausses : redérive à chaque modèle ajouté.
- Banc réduit au seul XML Word : perd le contrôle de l'aperçu.

## Tâches (une case par tâche, un commit par tâche, `npm test` et essais navigateur à chaque fois)

- [x] T0 `[effort : haut]` **Prototype de faisabilité** (GO / NO GO avant tout le reste) : rendre dans une page cachée neuve 3 modèles (une colonne, un bandeau, un Sobre), comparer au rendu du panneau (mêmes empreintes), vérifier que l'export Word d'une copie de dossier donne le même XML, vérifier que l'enregistrement de fichiers depuis la page (T1) marche. Si NO GO : repli = même banc avec remise à zéro de l'état entre deux modèles.
- [x] T1 `[effort : moyen]` **Enregistrement de fichiers pour le développement** : `serveur_dev.py` reçoit un POST limité au dossier `scripts/rendu/sortie/`, noms contrôlés, taille plafonnée, jamais utilisé par l'application elle-même (outil de développement, comme le serveur).
- [x] T2 `[effort : haut]` **Banc de rendu** (`scripts/rendu/banc.js`) : jeu d'essai fixe (photo en dur), un modèle = une page cachée neuve, empreintes HTML et XML Word, mode « vérifier » et mode « régénérer », sortie : `registre.json`.
- [x] T3 `[effort : moyen]` **Nouvelle référence** prise au dernier commit d'avant les changements de rendu du jour (`756b48aa`), puis comparaison avec la version actuelle. Attendu : seuls les 7 modèles à colonne pleine hauteur changent (fond rentré de 1,9 mm voulu) ; tout autre écart est une régression à expliquer.
- [x] T4 `[effort : haut]` **Miniatures fidèles** : le banc écrit aussi la miniature de chaque modèle (35 : 24 Créatif et 11 Sobre) ; la galerie les affiche (une famille à la fois, chargement à la demande), les silhouettes dessinées servent de repli puis sont retirées ; « Photo et frise » rendu avec une photo neutre ; mode sombre et accessibilité vérifiés ; nom et description lisibles.
- [x] T5 `[effort : moyen]` **Suite complète des 96 essais par lots** de 5 avec rechargement et stockage vidé entre deux lots, résultats cumulés ; trouver par dichotomie l'essai qui ne se termine pas.
- [x] T6 `[effort : moyen]` **Documents** : `docs/BRIQUES_COMMUNES.md` (nouvelle brique : banc de rendu et miniatures), `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (référence dépendante du navigateur et de l'ordre), protocole d'utilisation (quand régénérer), `docs/ETAT_DES_CHANTIERS.md`.

## Ensuite (hors de ce plan, décisions de Denis à prendre sur maquette)
- Lot 3, variété : différencier les modèles trop proches (familles listées dans l'audit, section 2), idée de bord droit ou vallonné, miniature qui montre la particularité.
- Choix de ce qu'on dégrade (colonne ou bandeau, couleur principale ou secondaire) et accès aux autres couleurs depuis la carte d'ambiance.

## Risques nommés
- T0 peut échouer (le rendu dans une page cachée neuve ne reproduit pas exactement celui du panneau) : on le sait dès le prototype, avant de bâtir.
- Taille des miniatures : à mesurer en T4 (objectif : quelques centaines de ko au total, chargées par famille).
- Une miniature reste figée dans la couleur de départ du modèle ; suivre la couleur choisie par la personne est une évolution possible, pas incluse.

## Résultat du prototype T0 (2026-10-11) : GO
Mesuré dans le navigateur de test (jeu d'essai du banc) :
- Rendu d'un modèle dans une page cachée neuve (copie du dossier, même méthode que `ucpmRendreCv`) = rendu du panneau, octet pour octet, aux deux attributs d'interaction du panneau près (`title` et `cursor: pointer` sur la page) : mqBandeau, 13 945 caractères des deux côtés.
- **Indépendance de l'ordre** : 6 modèles (Colonne claire, Bandeau entier, Colonne et frise, Colonne foncée et frise, Sobre Fond pâle, Sobre Chronologique) rendus dans un ordre puis dans l'ordre inverse : les 6 empreintes sont identiques.
- **Export Word d'une copie** : le XML de Bandeau entier est exactement l'ancienne empreinte de référence (`82606844:42689`) ; celui de Colonne claire est celui que le banc actuel mesure après le changement voulu du fond de colonne (`e6d3f178:52660`).
- **Enregistrement de fichiers** (T1, `serveur_dev.py`, POST limité à `scripts/rendu/sortie/`) : écriture réussie ; noms avec `..` ou commençant par un point refusés (400), autres chemins refusés (404), refus aussi hors de la machine locale. Le dossier de sortie est ignoré par git.
- Réserve : le serveur de test a redémarré sur un autre port (58844) car l'ancien processus tenait encore 8123 ; sans effet sur le travail.

## Résultat de T2 et T3 (2026-10-11)
- **Banc de rendu** : `scripts/rendu/banc.js` (37 modèles : 25 Créatif et 12 Sobre), registre : `scripts/rendu/registre.json`. Mode d'emploi en tête du fichier. Durée : environ 2 min 30. Page fraîchement rechargée, stockage vide, fenêtre de 738 de large.
- **Référence prise au commit `756b48aa`** (avant les changements de rendu du jour), commit `2f62c2d2`. Vérification de la version actuelle contre cette référence : **le HTML est identique pour les 37 modèles** ; 30 modèles sont identiques en tout (HTML, style, Word, nombre de pages) ; **seuls changent, comme voulu, les 6 modèles Créatif à colonne pleine hauteur (Colonne à vague, Colonne foncée, Colonne claire, Colonne et bandeau, Colonne foncée et rubans, Colonne foncée chronologique) et Sobre Chronologique** (largeur du fond de la colonne, style et Word). Aucune erreur, aucun modèle sans référence.
- Défaut trouvé et corrigé grâce au banc : ma règle de largeur du fond s'écrivait aussi, avec une valeur négative inutile, pour les modèles sans colonne ; elle est maintenant limitée aux modèles à colonne.
- **Rendus complets** enregistrés par `lancer('regenerer', { rendus: true })` dans `scripts/rendu/sortie/` (ignoré par git) : environ 25 ko par modèle (10 ko de HTML, 15 ko de style), 1 Mo pour 37 modèles. Base de T4.
- Le registre actuel (`scripts/rendu/registre.json`) est celui de la version d'aujourd'hui ; le registre d'avant reste dans l'historique git (`2f62c2d2`).

## Résultat de T4 (2026-10-11)
- 37 miniatures réelles dans `data/miniatures/` (1 Mo en tout, une par modèle, `<famille>_<id>.json` : HTML, style prêt pour un compartiment étanche, empreinte). Fabriquées par le banc (`lancer('regenerer', { rendus: true })`, puis copie des fichiers de `scripts/rendu/sortie/`). Deux mesures indépendantes du banc donnent exactement le même registre : le banc est reproductible.
- La galerie (Créatif par familles, « Voir tous les modèles », Sobre) et les trois petits aperçus des onglets de famille montrent le VRAI rendu réduit, chargé à la demande (`_mepMiniCharger`, `_mepMiniaturesReelles`, `js/app.js`). Vignettes agrandies à 96 px de large avec la proportion d'une page A4.
- Les silhouettes dessinées à la main (`_mepVignetteMini`, 63 lignes) sont SUPPRIMÉES : tant qu'une miniature n'est pas arrivée, la vignette est une page blanche, jamais un faux dessin. La 4e colonne de `_MEP_GALERIE_CREATIF` (id de silhouette) ne sert plus ; elle est laissée en place (commentaire mis à jour) pour ne pas toucher aux 24 lignes.
- Tests : `tests/miniaturesModeles.test.js` (4 tests, `npm test` 1408 verts) vérifie que chaque modèle de la galerie a son entrée au registre, que sa miniature existe, porte l'empreinte du registre (alarme « miniature périmée »), est prête à afficher, et qu'aucune miniature n'est orpheline. Essai navigateur `miniaturesReelles` (4 contrôles) : 24 vignettes Créatif et toutes les vignettes Sobre ont leur vraie miniature. Essais `looksFamilles`, `modelesColonne`, `grandsBoutons` verts.
- Protocole : quand un modèle change, lancer le banc en mode « vérifier » ; s'il signale un écart voulu, régénérer (mode « régénérer » avec `rendus: true`), copier les fichiers dans `data/miniatures/` et `registre.json` dans `scripts/rendu/`, commiter ensemble.

## Résultat de T5 et T6 (2026-10-11)
- **Suite complète des essais navigateur rejouée par lots** (procédure dans `docs/TESTS_PARCOURS_NAVIGATEUR.md`, indicateur `window.__parcoursCourant` ajouté) : les 96 essais passent, hors `banc` joué séparément (0 écart sur 37 modèles, 2 min). Aucun blocage : les essais « longs » prennent 60 s chacun, c'était la durée et non un blocage.
- **Corrigés (essais périmés, pas le code)** : le contrôle du style de « Options supplémentaires » comparait au mauvais bouton ; le contrôle de place de « Dégradé » datait d'avant la décision de Denis du 2026-10-10.
- **Défaut préexistant, non dû à ce chantier** : `enteteDecale`, en-tête de Ruban diagonal et de Diagonales contrastées avec photo à 36 % de la page au lieu de moins de 35 %, identique avec les fichiers de rendu d'avant le 2026-10-11 ; noté dans l'état des chantiers.
- **Documents** : B.21 dans `docs/BRIQUES_COMMUNES.md`, deux leçons dans `docs/LECONS_A_NE_PAS_REPRODUIRE.md`, procédure de la suite par lots, passation dans `docs/ETAT_DES_CHANTIERS.md`. L'ancien banc (`scripts/word/banc_b7.js`) est marqué périmé.
