# Les deux modules fermés au public : ce qui les empêche de s'ouvrir (03/11/2026)

**[MISE À JOUR 05/11/2026 : les deux modules ont été OUVERTS sur le feu vert écrit de Denis (`MT_OUVERT = true`), après la validation des fiches et la migration du rayon « Fonction publique » ; le point 3 ci-dessous est résolu. Le texte qui suit est la photo du 03/11/2026.]**

Étape 10 du plan de reprise du dossier Cloud, en lecture seule : **rien n'a été ouvert** (`MT_OUVERT` reste à `false` dans `modules/mon-territoire/logique.js`). Les deux modules sont « Qui fait quoi : près de chez moi » (structures) et « Employeurs près de chez moi » (employeurs) : ils partagent le même interrupteur et les mêmes fichiers. Ils restent visibles sur le poste de Denis (localhost) et cachés partout ailleurs.

## Les chiffres du 03/11/2026

| | Publié (visible dans le module) | Au sas, en attente de Denis |
|---|---|---|
| Structures | 194 (toutes datées) | 706 (aucune datée), dont 79 pré-validées : un clic sur « C'est bon » |
| Employeurs | 108 (toutes datées), dont 93 agences d'intérim ; 1 secteur(s) de métier avec au moins un employeur | 888 (aucun daté), dont 394 pré-validés |

Règle du module : une adresse n'est cliquable que si sa ligne est datée de moins de 12 mois. Les lignes du sas n'ont pas de date tant que Denis n'a pas cliqué sur « C'est bon » : elles ne s'affichent donc pas. Ouvrir le module aujourd'hui montrerait 1 secteur(s) sur 21 avec des employeurs.

## Ce qui bloque, du plus lourd au plus léger

1. **La relecture du sas par Denis** : 706 structures et 888 employeurs à passer en revue dans l'outil de veille. Les 473 lignes pré-validées se valident d'un clic ; les autres (dont les 190 institutions de la partie N, les 40 + 25 fiches créées pour le dossier Cloud et les 391 lignes « à contrôler par le responsable ») demandent un regard. Tant que ce travail n'est pas fait, l'onglet Emploi reste presque vide.
2. **La décision 3.1 de la liste de contrôle du 12/10/2026** (ouvrir avec peu de secteurs remplis ?) : elle dépend directement du point 1. La liste reste valable : `docs/LISTE_CONTROLE_OUVERTURE_MON_TERRITOIRE_2026-10-12.md` (sections 3.3 à 3.7, 4 et 6).
3. **Les quatre nouveaux rayons de « Comprendre le cadre »** (Armées, Fonction publique, Agriculture, Parents séparés) **ne sont pas dans « Qui fait quoi »** : le module ne connaît que 17 rayons (`MT_RAYONS`). Les structures des fiches de ces rayons n'ont donc pas de domaine d'accueil. Travail de code (liste des rayons, domaines, tests), à faire avec maquette si une carte d'accueil change : décision pour Denis, effort moyen. **RÉSOLU le 05/11/2026 : les quatre rayons sont migrés (`MT_RAYONS`), « Fonction publique » a sa tuile à deux choix dans « Qui fait quoi », testée.**
4. **Écarts à trancher avant d'ouvrir** : la sous-préfecture de Nontron (fiche d'annuaire en retard sur la page de la préfecture, voir `docs/INSTITUTIONS_DOSSIER_CLOUD_PARTIE_N_2026-11-03.md`), la fiche `la-perigourdine` (département incohérent) et six fiches dont la zone est incohérente et qui n'ont pas été marquées (vyv3-coeur-d-aquitaine, la-perigourdine, anact-aract-nouvelle-aquitaine-region, defenseur-des-droits-nouvelle-aquitaine-region, cibc-solutions-rh-prc-vae-region, clap-sud-ouest-region).
5. **Les employeurs sans numéro** : la liste « sans numéro » est à jour dans `modules/mon-territoire/contenu/sans-numero.txt` ; aucun blocage, mais la phrase « qui contacter » s'appuie sur les numéros saisis.
6. **La relecture finale des textes visibles** sur un écran réel (liste de contrôle 3.7), puis les sept gestes d'ouverture de la section 4 de la liste (interrupteur, test qui l'exige fermé, carte d'accueil, suppression du bloc « Annuaire associatif » de l'outil de veille, série d'essais navigateur sans la clé d'aperçu).

## Recommandation

Ne rien ouvrir avant que Denis ait relu le sas : l'ouverture n'est qu'une ligne de code, le retour arrière aussi, mais un module presque vide donne une mauvaise première impression au public qui est déjà fragile face au numérique. Ordre conseillé : (1) relecture du sas par Denis, en commençant par les pré-validées ; (2) rayons manquants dans « Qui fait quoi » ; (3) écarts du point 4 ; (4) relecture finale ; (5) ouverture sur le feu vert écrit de Denis.
