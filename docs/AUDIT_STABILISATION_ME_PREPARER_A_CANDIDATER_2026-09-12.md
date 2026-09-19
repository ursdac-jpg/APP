# Audit de stabilisation : carte « Me préparer à candidater » (3 parcours)

Audit en lecture seule (aucun fichier de code modifié), mené le 2026-09-12, deuxième carte du chantier de stabilisation générale après « Mes documents » (`docs/AUDIT_STABILISATION_MES_DOCUMENTS_2026-09-12.md`). Périmètre : les 3 parcours de la carte d'accueil « Me préparer à candidater » : **Co-construire ma lettre**, **Préparer un entretien**, **Regard recruteur**.

Méthode identique à l'audit précédent : trois passes indépendantes par lecture directe du code, écran par écran (boutons, effet réel des choix, navigation Retour/Accueil, mode sombre, français, fidélité des prompts, suivi d'usage, doublons, tests), croisées avec les documents de suivi existants pour vérifier qu'ils sont toujours exacts.

## Verdict d'ensemble

**Une anomalie bloquante trouvée**, sur « Préparer un entretien » (finding 1 ci-dessous) : le CV et la lettre déposés dans ce module précis ne sont jamais transmis à l'assistant, silencieusement. Les deux autres parcours (Co-construire ma lettre, Regard recruteur) n'ont aucune anomalie bloquante : boutons tous câblés, choix tous relus, navigation Retour saine.

10 écarts gênants ou mineurs relevés au total sur les 3 parcours.

---

## ⚠️ Finding 1 : « Préparer un entretien », le CV/la lettre déposés ici ne partent jamais vers l'assistant (BLOQUANT)

- **Écran** : « Préparer » (blocs « Votre CV » / « Votre lettre de motivation »).
- **Écriture** : `data/metiers.js:6793-6812` (`_prepaEntretienCfgVerif`, `onEnregistre`) : une fois le texte relu/corrigé/masqué et enregistré, il part dans `dossier.cvTexte` / `dossier.lettreMotivation.texte`.
- **Lecture attendue, absente** : `js/app.js:22996-23470` (`texteProfil()`, la fonction qui construit tout ce qui est envoyé à l'assistant pour CV/lettre/entretien) ne référence **nulle part** `dossier.cvTexte` ni `dossier.lettreMotivation`. Le bloc « PROFIL DU CANDIDAT » de cette fonction est construit uniquement à partir des champs **structurés** du dossier (`dossier.experiences`, `formations`, compétences, etc., remplis via « Créer mon CV », « Mettre à jour mon CV », « Découvrir mes compétences »…), jamais à partir d'un texte brut déposé.
- **Conséquence concrète** : ce module a son propre mécanisme de dépôt de CV/lettre, distinct de celui des autres modules, précisément pour permettre à quelqu'un d'arriver **directement** sur « Préparer un entretien » sans être passé par la construction d'un CV dans l'application. Pour cette personne (un usage tout à fait normal du module), l'écran affiche « CV enregistré » / « Lettre enregistrée », mais l'assistant reçoit un profil quasiment vide. Aucun message d'erreur, aucun indice visible : la personne croit que son CV a été pris en compte.
- **Ce qui fonctionne bien, en contraste** : le poste et l'entreprise saisis dans ce module (`dossier.entretienDirect`) sont bien transmis ; la stratégie déjà produite pour un CV/une lettre **générés par l'application elle-même** (`dossier.ia.cv` / `dossier.ia.lettre`) est bien transmise aussi. Seul le texte brut déposé **dans ce module précis** se perd.
- **Documentation périmée liée** : `docs/CHANTIER_ELIMINATION_FENETRES_DEPOT_CV.md:118-121` et `docs/TACHES_VALIDEES.md:539` affirment que ce point a déjà été « retrouvé et corrigé » : l'écriture a bien été vérifiée à l'époque, mais pas la lecture en aval, qui reste manquante.
- **Vérifié indépendamment** (moi-même, pas seulement l'agent d'audit) : `grep` confirme zéro lecture de `dossier.cvTexte`/`dossier.lettreMotivation` dans `js/app.js`, et les 3 autres écritures de `dossier.cvTexte` ailleurs dans `data/metiers.js` appartiennent toutes à un mécanisme différent (le dépôt générique `ouvrirAssistantDepotCV`, qui alimente ensuite une extraction assistée vers les champs structurés, un circuit qui, lui, fonctionne).

**Pourquoi je ne corrige pas ce point directement avec les autres** : la réparation demande de toucher `texteProfil()`, une fonction partagée et très finement ajustée au fil du temps entre CV, lettre et entretien (de nombreux correctifs anti-fuite entre ces 3 contextes y sont déjà tracés en commentaire). Il y a un vrai choix à faire, avec un risque réel de régression sur les 2 autres documents si c'est mal fait :

- **Option recommandée** : ajouter une section dédiée dans `texteProfil()`, réservée à `type === 'entretien'`, qui inclut le texte brut de `dossier.cvTexte`/`dossier.lettreMotivation.texte` **seulement si** aucun profil structuré substantiel n'existe déjà (`dossier.experiences.length === 0`), pour éviter d'envoyer à la fois un résumé structuré et un texte brut potentiellement redondant ou contradictoire à quelqu'un qui aurait aussi construit un CV complet dans l'application par ailleurs.
  *Apport* : couvre exactement le cas cassé (personne arrivée directement sur ce module) sans toucher au cas qui fonctionne déjà.
  *Risque* : si une personne a un profil structuré ancien/partiel ET dépose un CV à jour ici, le texte à jour resterait ignoré (cas plus rare, mais réel).
- **Autre option** : toujours inclure le texte brut, en plus du profil structuré s'il existe, avec une consigne au prompt du type « si ces deux sources se contredisent, privilégier le texte déposé le plus récent ».
  *Apport* : ne perd jamais aucune information.
  *Risque* : profil plus long et potentiellement incohérent à trancher par l'assistant, changement de comportement pour des personnes qui utilisent déjà ce module avec un profil structuré riche (aujourd'hui elles ne remarquent rien d'anormal).

Je recommande la première option. J'attends ton feu vert avant de toucher à `texteProfil()` précisément à cause de ce risque partagé CV/lettre/entretien : tous les autres points de cet audit sont des corrections indépendantes et sûres.

---

## Autres findings

### 2. Co-construire ma lettre : le bouton « Terminé » reste bloqué au téléchargement Word (gênant)
- **Fichier** : `data/metiers.js:6153` (bouton `#btnTermineLettreV1` créé `disabled`), réactivé seulement par le handler DOCX (`:6357-6358`).
- **Problème** : les actions « Aperçu / Imprimer » et « Copier la version courte » (deux usages explicitement promis dans l'intro du module) écrivent bien la lettre mais ne réactivent jamais « Terminé ». Une personne qui ne veut qu'imprimer ou copier sa lettre est obligée de télécharger un fichier Word qu'elle ne voulait pas, uniquement pour pouvoir cliquer « Terminé ».

### 3. Co-construire ma lettre : texte de l'écran « Choisir mon assistant » décrit le mauvais parcours (gênant)
- **Fichier** : `data/metiers.js:5883-5887` (réutilise `ETAPES_DETAIL_CHOIX_IA`, `js/app.js:10568-10573`).
- **Problème** : le texte décrit un écran de relecture « où vous décochez, modifiez et réordonnez », propre au circuit CV. Co-lettre n'a pas cet écran (dialogue direct avec l'assistant, une seule réponse collée). Un module voisin (Regard extérieur) a déjà eu ce même souci et s'est écrit son propre texte pour cette raison ; Co-lettre a réutilisé le texte générique sans l'adapter.

### 4. Regard recruteur : 5 tirets cadratins dans le module lui-même (gênant)
- **Fichier** : `modules/regard-recruteur/index.js:1062, 1070, 1087, 1135, 1196`.
- **Problème** : le module a sa propre fonction d'assainissement qui retire les tirets longs des réponses de l'assistant, mais n'applique jamais cette règle à son propre texte (items de la fiche, en-tête du document imprimable, `<title>` du fichier `.doc` téléchargé). Deux occurrences sortent même de l'application (document téléchargé, impression).

### 5. Couleurs de message figées, non theme-aware : motif systémique retrouvé dans les 3 parcours (gênant)
- **Fichiers** : `data/metiers.js:6286-6425` (Co-lettre), `data/metiers.js:6604-6658` (Préparer un entretien), et confirmé déjà présent ailleurs dans l'app (CV, Bilan, Cohérence, pas né sur cette carte).
- **Problème** : `message.style.color = '#b91c1c'` / `'#157347'` écrits en JS, au lieu de `var(--danger)` / `var(--success-strong)` qui ont pourtant leurs valeurs `[data-theme="sombre"]`. Contraste insuffisant en mode sombre (~2,3:1 et ~3,2:1, sous le seuil de 4,5:1). Motif compté précisément : 46 occurrences dans tout le dépôt (voir `docs/BRIQUES_COMMUNES.md`, dette B.12), trop large pour ce passage, mais présent aussi sur cette carte.

### 6. Regard recruteur : calque de relecture illisible en mode sombre (gênant)
- **Fichier** : `data/metiers.js:1544-1557` (brique partagée `htmlVerificationDocument`, utilisée par Regard recruteur à l'écran « Masquer »).
- **Problème** : `color:#212529` (quasi noir) en style inline sur le texte à relire avant de masquer ses coordonnées, jamais adapté au sombre. Sur fond `--bg-page` quasi noir en mode sombre, ce texte devient pratiquement invisible. Affecte aussi tout autre module qui utilise cette même brique (wizard CV, Bilan, Cohérence).

### 7. Aide contextuelle incomplète (Regard recruteur) et plus mince que son jumeau (Co-lettre) (mineur)
- Regard recruteur (`js/app.js:33890-33891`) : le texte de la barre d'étapes ne couvre que 3 des 4 pastilles réelles (oublie « Ma fiche »).
- Co-lettre (`js/app.js:33853-33860`) : couverture plus légère que le module jumeau « Préparer ma lettre et mon entretien » (3 sélecteurs génériques contre une entrée par bloc), probablement volontaire vu le commentaire au-dessus, mais à égaliser si l'aide contextuelle est retravaillée un jour.

### 8. Préparer un entretien : couleur sans variante sombre sur un badge (mineur)
- **Fichier** : `css/style.css:2765` (`.verif-doc-btn-action-jaune`, bouton « Agrandir » du masquage image).
- Couleurs en dur, reste lisible dans les deux thèmes par coïncidence, mais viole la règle non négociable.

### 9. Logique pure non testée (gênant, 2 modules)
- **Co-construire ma lettre** : `analyserReponseIALettre()`/`normaliserLettreImbriquee()` (`js/app.js:25237-25296`, hors périmètre Node par contrainte du projet) et surtout `modules/lettre-core/normaliserDonneesLettre.js` (fonction pure, sans DOM, aucune excuse technique) : aucun test, contrairement à ATS/Bilan/Cohérence/Regard recruteur qui ont chacun le leur.
- **Préparer un entretien** : `modules/entretien-editor/normaliserDonneesEntretien.js` (pure, sans DOM) : même lacune.

### 10. Variable morte et classe CSS morte (mineur)
- `_coLettreDetourRetourRoute` (`data/metiers.js:3181`) : déclarée, jamais lue ni écrite ailleurs. Sans impact, commentaire l'assume déjà.
- `.prepa-entretien-parcours` (`data/metiers.js:2983, 6501, 6938`) : posée sur le DOM mais aucune règle CSS ne la cible nulle part dans le dépôt.

### 11. Écart doc/code sans impact réel (documentation seulement)
- `modules/regard-recruteur/ARCHITECTURE_TECHNIQUE.md:113-116` demande d'ajouter `'pageRegardRecruteur'` au stub de test Node (`tests/_domStub.js`). Non fait, mais `npm test` (797 tests) passe intégralement : la table `routes` absorbe déjà l'absence via une garde `typeof`. L'instruction documentée s'avère non nécessaire en pratique.

---

## Ce qui a été vérifié en profondeur et confirmé sain

- **Aucun bouton mort** sur les 3 parcours (hors le cas particulier du finding 2, qui est un bouton fonctionnel mais mal conditionné, pas un bouton mort).
- **Navigation Retour** : saine sur les 3 parcours, y compris le piège documenté « Retour vs Revoir la présentation » de Regard recruteur (LECONS section 2), toujours respecté.
- **Suivi Umami** : présent et cohérent à l'entrée des 3 parcours (`co_construire_lettre`, `preparer_entretien`, `regard_recruteur`), contraste favorable avec le trou trouvé sur la carte « Mes documents ».
- **Regard recruteur** : option A tenue (aucune modification du CV nulle part), 6 axes fixes sans score, masquage d'image intact, fidélité du prompt parfaite (8 placeholders vérifiés mot pour mot), les 3 fichiers de tests existent et passent (38 tests), les 4 « évolutions possibles » listées dans `TACHES_VALIDEES.md` sont bien absentes du code sans début d'implémentation.
- **Co-construire ma lettre et Préparer un entretien** : bons consommateurs des briques communes (B.1, B.2, B.4, B.5 de `BRIQUES_COMMUNES.md`), aucune ré-implémentation maison retrouvée. Le dépôt de fichier propre à « Préparer un entretien » (distinct de `ouvrirAssistantDepotCV`) est une décision déjà actée et documentée, pas une dette cachée.
- **Panneau « Aperçu avant impression »** à couleurs volontairement non thématisées (mime un vrai dialogue d'impression) : convention cohérente et partagée par 4 modules (Co-lettre, Bilan, Regard extérieur, Cohérence), aucune action à mener.

## Recommandation de traitement

Comme pour « Mes documents », je propose : **finding 1 à part** (feu vert explicite attendu vu le risque partagé), puis **tous les autres findings (2 à 10) corrigés dans la foulée**, comme la dernière fois : ce sont des corrections locales et sûres. Le finding 5 (couleurs de message systémiques, 46 occurrences dans tout le dépôt) mérite un traitement séparé et global plutôt que d'être corrigé au coup par coup module par module : je propose de le consigner comme dette transverse (`BRIQUES_COMMUNES.md`) plutôt que de le corriger ici à moitié.
