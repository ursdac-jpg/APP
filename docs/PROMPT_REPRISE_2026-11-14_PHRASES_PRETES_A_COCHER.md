# Message de reprise : phrases prêtes à cocher pour le CV (14/11/2026)

À coller en premier message dans l'autre compte (dépôt `Site_V2`, branche `master`, ne jamais pousser).

> **Mise à jour du 14/11/2026 (soir) : étapes 1 à 5 FAITES.** Le convertisseur, le détecteur, les corrections et les tests sont dans `scripts/importRome/` et `tests/phrasesCV.test.js` ; l’état précis est à la fin de `docs/CHANTIER_CV_A_PARTIR_DES_FICHES_ROME_2026-11-14.md` (section « Phrases prêtes à cocher »). Le prototype `scripts/conversionMissionsInfinitif.js` est supprimé.

---

Bonjour. Tu reprends un travail en cours sur le projet APP. Lis d'abord `CLAUDE.md`, puis `docs/TRAVAILLER_AVEC_DENIS.md`, puis les consignes 281 à 285 de `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` et `docs/CHANTIER_CV_A_PARTIR_DES_FICHES_ROME_2026-11-14.md` (cahier du chantier) et `docs/PLAN_GENERAL_APRES_DECISION_283_2026-11-14.md`. Vérifie `git log -8` et `git status` avant de travailler. Ne touche pas aux fichiers de l'autre session : `scripts/parcours/protocole/sorties/*.json` et `scripts/rendu/sorties_rectangles/`. N'utilise jamais `git add -A`.

**Finalité (consigne 283)** : le module de création et de reprise de CV vise un CV fidèle à la personne, avec ou sans assistant. Pour écrire un CV sans assistant, la personne coche des missions et des compétences tirées des fiches du ROME (France Travail), proposées par expérience. Ces phrases arrivent telles quelles sur le CV : elles doivent donc être **toutes bien écrites**.

**Décisions de Denis déjà prises** (ne pas les rediscuter) :
- Étape « Vos missions et compétences » entre « Votre parcours » et « Votre profil » (création), et dans la reprise : bouton « Compléter avec la fiche du métier » sur chaque expérience, affiché **seulement si une fiche proche est trouvée** (consigne 284).
- Tout afficher d'un coup (missions et compétences, pas de limite ; seules les activités précises restent repliées), **missions à l'infinitif**, écran téléphone validé (consigne 285).
- Maquette cliquable faite et commitée : `docs/MAQUETTE_MISSIONS_COMPETENCES_PAR_EXPERIENCE_2026-11-14.html`.
- Méthode choisie pour garantir des phrases bien écrites : **« règles + correction + test »** (option 1 sur trois). Conversion automatique des missions du ROME de la 3e personne vers l'infinitif, contrôle automatique des phrases suspectes, réécriture à la main des phrases repérées (quelques centaines), puis test du dépôt qui échoue si une phrase sort de la forme. Relecture d'un échantillon de 100 phrases par Denis. Ensuite relecture complète secteur par secteur (restauration, commerce, propreté, aide à la personne, logistique, bâtiment d'abord), sans urgence.

**Ce qui est fait** : prototype de conversion `scripts/importRome/phrasesCV.js` (traite le premier verbe, les verbes coordonnés après « et », « , » et « puis », la forme « Peut + infinitif » ; ne traite pas un verbe précédé d'un pronom comme « les installe », ni les phrases commençant par « Il », « En », « Selon » ; bug connu à corriger : « L'artisan… » devient « Ler… »). Mesures sur le ROME : 10 138 missions, une centaine mal formées après conversion, 191 de plus de 170 caractères, 52 contenant « il » ou « elle ». Les **47 480 « activités » détaillées** (champ `k` des fiches) sont déjà à l'infinitif (99,95 %) et courtes : c'est la meilleure réserve de phrases à cocher (2 726 dépassent 110 caractères, à raccourcir à la main).

**Ce qui reste, dans l'ordre** :
1. Audit (commencé) : les fichiers `data/rome/fiche_*.js` sont **générés** (ne jamais les modifier à la main) par `scripts/importRome/genererMetiersRome.js` (ligne ~336 : `e.m = f.missions.map(net)`). L'application lit `fiche.d` et `fiche.ri` (`js/app.js` vers les lignes 1176, 10672, 10731, 10818) ; la page « fiche d'un métier » affiche les missions. Piste retenue : ajouter un champ `mi` (missions à l'infinitif) dans les fiches générées, produit par le générateur à partir d'un convertisseur et d'un fichier de corrections écrites à la main (par exemple `scripts/importRome/phrasesCorrigees.json`), sans toucher à `m` (affichage actuel de la fiche métier). À confirmer à la lecture du générateur avant de coder.
2. Améliorer le convertisseur (accent, « L'… », « Également / Aussi » en tête, pronoms avant verbe, « A travers »…) et écrire le **détecteur de phrases suspectes** (premier mot non infinitif, « il / elle », pronom + verbe conjugué, longueur, mots nom ou verbe comme « contrôle »).
3. Lister les phrases suspectes, les réécrire à la main par lots (verser par script, jamais un gros bloc à la main), phrases longues raccourcies.
4. Test du dépôt (`tests/`) : toute phrase `mi` doit commencer par un infinitif, sans « il / elle », longueur maximale, même forme partout (majuscule initiale, pas de point final). Même règle pour les libellés courts de compétences (lexique `data/competences.js`).
5. `npm test` complet en arrière-plan (environ 75 s) : lire la ligne `ℹ fail 0` avant tout commit (leçon 9.157). Si le lexique est touché : `node scripts/checkLexique.js` (0 erreur, 0 avertissement).
6. Feuille d'échantillon de 100 phrases pour Denis ; une ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` seulement si un effet visible est livré ; aucune ligne `data/nouveautes.js` (fonction pas encore ouverte au public).
7. Après ce chantier : audit des trois voies de « Reprendre mon CV » (plan, étape 1.2), puis codage de l'étape en lots (plan, étape 1.3), puis maquette refaite de « Votre parcours » (chantier 2), puis cahier du module « Trouver un métier » (chantier 3).

**Règles de travail rappelées** : français impeccable avec accents, jamais de tiret long, jamais le mot « IA » visible dans l'assistance (« l'assistant en ligne »), pas d'icône à visage, peu de « on ». Test navigateur obligatoire pour tout changement de `js/app.js` ou de `modules/*/ui.js`. Chaque choix présenté à Denis : recommandation en premier avec bénéfices et risques de chaque option. Annoncer le mode et l'effort recommandés (ici effort **haut**). Heredocs shell avec guillemets imbriqués : utiliser l'outil d'écriture de fichiers plutôt que le shell. Date système réelle à vérifier avant d'écrire une date.

Commence par `git log -8`, relis ce message et le cahier du chantier, puis reprends à l'étape 1 ou 2 selon ce que le dépôt montre.

---

*Dernier commit au moment de l'écriture : 259c8aad (maquette mise à jour, convertisseur prototype). Prochaines lignes du plan à confirmer avec Denis si le dépôt a avancé.*
