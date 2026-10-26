# Chantier : améliorer « Les mots de votre CV » (ATS) et « M'entraîner à un entretien », à partir de l'étude de l'Apec

Créé le 2026-10-19 (date système vérifiée). Mode A, `[effort : haut]` pour la décision, exécution en `[effort : bas]` et `[effort : moyen]`. **Statut : PLAN VALIDÉ PAR DENIS (2026-10-19), RIEN CODÉ.** Verdict : **NON APTE AU MODE NUIT** (les essais réels sur un assistant dépendent de Denis).

Décision de Denis (2026-10-19) : ATS au **niveau 1** (exemple fixe) avec les textes ; **Entretien en premier** (cas pratique + « ce que l'offre ne dit pas »). Aucun code tant que l'autre compte travaille sur le dépôt ; ce fichier est le seul livrable de la séance.

---

## 1. D'où vient ce chantier

Denis a étudié des contenus de l'Apec (article « ATS » de Houtarde et Estève, vidéo « Les CV sont-ils lus par des robots ? », « Adapter son CV à l'offre », « Un profil candidat Apec performant », vidéo sur l'IA, « ChatGPT presque meilleur ami », « Informations complémentaires à une offre »). Constat de Denis : l'essentiel est creux, et l'offre de simulation d'entretien vient d'un avatar disponible 24 h sur 24 (impossible chez nous : pas de serveur, pas de voix, pas de budget).

**Ce qu'on retient (peu de chose) :**
- Les 5 conseils de l'article ATS confirment la conception actuelle du module (mots de l'offre, reformulation honnête). Leur prompt exemple note le CV sur 20 et demande « les 40 mots-clés les plus utilisés pour ce poste » : **c'est exactement ce que notre module s'interdit** (score, mots hors offre). À ne jamais imiter.
- L'exemple de la vidéo (un ancien trésorier d'association qui écrit « suivi budgétaire ») est un excellent exemple pédagogique pour notre public.
- « Recherche d'informations complémentaires » : pourquoi le poste est ouvert, quotidien du poste, utiliser ces éléments en entretien. Utile, mais ce n'est pas du vocabulaire : place dans Entretien.
- **Aucun pourcentage de l'Apec n'est repris dans l'application** : 27 % / 95 % (vidéo) et 50 % (page profil) se contredisent, non datés, non sourcés.

## 2. Frontières à respecter (audit du code réel, 2026-10-19)

| Module | Rôle | Ce chantier y touche ? |
|---|---|---|
| ATS (`modules/ats/`, `prompts/ats.md`) | Vocabulaire : quels mots du CV correspondent à ceux de l'offre ou du métier. Jamais de score. | Oui, textes seulement (niveau 1) |
| Entretien (`prompts/entretien.md` + `prompts/entretien-accueil.md`, `modules/entretien-editor/`) | Préparation guidée par le dialogue, synthèse JSON puis fiche Word | Oui, prompts seulement |
| Bilan (Analyser ma candidature) | Fond du CV : adéquation, **chiffres** (`phraseAChiffrer`, axe Impact), **lisibilité** (axe Lisibilité) | **Non.** Ne jamais refaire dans l'ATS le contrôle des chiffres ni des rubriques |
| Regard recruteur | Perception à la première lecture, mise en page, questions probables | **Non.** Le registre de langage a déjà été retiré de son axe `message` et envoyé vers `questionsLieesAuCv` (le « chevauchement non tranché » de l'audit du 2026-09-17 est donc réglé dans le prompt actuel) |
| Cohérence transversale | Lit `questionsAnticipees` via `hostDataAdapter` | **Non, à condition de ne pas changer le format de la synthèse** |
| Un CV, plusieurs métiers (page 8 « Préparer mes entretiens ») | Sa propre préparation (prompt `ucpm-preparation.md`, sujet `situation`) | **Non** |
| Panneau « candidature » (`dossier.rechercheCandidature`, `js/app.js`) | Structure remise à zéro à une douzaine d'endroits | **Non : ne pas y ajouter de champ** |

**Règle de frontière de l'ATS** : il ne répond qu'à « quels mots ? ». Ni le fond (Bilan), ni la forme (Regard recruteur), ni l'entraînement (Entretien).

**Idées écartées de l'ATS** : contrôle local des chiffres et des rubriques (déjà au Bilan), « Corriger dans mon CV » (la brique existe dans le Bilan, `correction/resolutionDestination.js` : à rendre commune plus tard, chantier à part, `[effort : haut]`), simulation en direct (impossible).

## 3. Plan en cases

### A. Entretien (en premier)

- [x] `[effort : moyen]` **A1. Cas pratique** : dans `prompts/entretien.md` (section « Pendant la préparation ») ET `prompts/entretien-accueil.md` (section « Ta réponse »), demander une mise en situation tirée du métier de l'offre. Dans la version dialogue : l'assistant pose la situation, la personne répond, retour bref, puis la situation est rangée comme une question de plus dans `questionsAnticipees` (avec `pistes` et `amorce`). Dans la version « accueil » (une seule réponse) : la situation est rangée directement comme une question, sans échange. **Aucun changement du format JSON.** La situation vient de l'offre et du métier, jamais d'un fait inventé sur l'entreprise ; elle respecte le niveau du poste et le type de structure déjà décrits dans le prompt.
- [x] `[effort : bas]` **A2. « Ce que l'offre ne dit pas »** : dans les mêmes deux prompts, à la rubrique « Questions du candidat » : ajouter au moins deux questions sur le contexte du poste (pourquoi il est ouvert : remplacement, création ; quotidien : déplacements, outils, taille de l'équipe) et rappeler, dans le message de fin, qu'on peut téléphoner à l'entreprise avec trois questions préparées. Aucune question de calibration nouvelle (règle existante du prompt).
- [x] `[effort : bas]` **A3. Tests** : `npm test` vert ; `grep` sur tout le dépôt de `questionsAnticipees` (28 occurrences dans 12 fichiers au 2026-10-19) pour constater qu'aucun fichier n'est à changer ; relire que les deux prompts restent identiques sur le format de sortie.
- [ ] `[effort : moyen]` **A4. Essais réels, par Denis** : deux CV différents (une reconversion, un premier emploi), un en dialogue (prompt complet) et un en une réponse (prompt « accueil »). Vérifier : le bloc JSON final est présent et valide ; la mise en situation apparaît dans la fiche Word comme une question avec pistes ; aucun fait inventé sur l'entreprise ; la réponse reste lisible pour un public fragile.

### B. ATS, niveau 1 (textes seulement, `modules/ats/index.js`)

- [x] `[effort : bas]` **B1. Exemple fixe** dans l'écran de résultat, près du bloc « Peut être formulé autrement » : réutiliser `_atsEncart(...)` (déjà compatible mode sombre, aucune couleur nouvelle). Visible dans la page, pas de fenêtre, pas de dépliant fermé (règle de Denis). Proposition de texte, **à valider par Denis** : « Exemple : vous avez tenu les comptes d'une association de quartier. L'offre demande du « suivi budgétaire ». Si c'est bien ce que vous faisiez (suivre les dépenses, tenir un tableau), vous pouvez l'écrire avec ces mots dans votre CV. Si vous ne l'avez pas fait, ne l'ajoutez pas. »
- [x] `[effort : bas]` **B2. FAQ « Pourquoi ce module ne donne pas de score »** (`_atsFaq()`) : remplacer « que le recruteur ne voit jamais » par une formule exacte. Proposition : « Les scores affichés par certains sites sont des estimations de ces sites. Ce n'est pas le classement du logiciel de l'employeur, que vous ne voyez pas. Ici, on vous montre du vocabulaire à ajuster, pas une note. » (Raison : les vrais logiciels calculent bien un classement.)
- [x] `[effort : bas]` **B3. Fiche « mise en forme »** (`_atsOuvrirFenetreForme()`) : ajouter une puce sur l'intitulé. Proposition : « Écrire le titre du poste comme dans les offres (par exemple « chargé de recrutement »), pas un titre imaginé. »
- [ ] `[effort : bas]` **B4. Tests** : `npm test` ; parcours navigateur de l'ATS (`scripts/parcours/parcours_smoke.js`) ; vérifier clair et sombre à 375 px ; aide contextuelle `AIDE_PAGES.ats` : relire qu'elle reste juste (aucune étape retirée sans accord de Denis).

### C. Plus tard, seulement sur décision de Denis

- [ ] `[effort : haut]` **C1. ATS niveau 2** : question de rappel générée (« Quand vous avez fait ceci, qu'avez-vous concrètement fait ? ») avant chaque piste. Demande un champ de plus dans la réponse de l'assistant (`prompts/ats.md`) et dans son contrôle (`modules/ats/resultatParser.js`, qui garde le garde-fou anti-invention), puis l'écran et les tests. À décider seulement si les essais montrent que l'exemple fixe ne suffit pas.
- ATS niveau 3 (zone de saisie mémorisée) : **déconseillé** (toucher à la sauvegarde sur disquette, à la fiche copiée et imprimée, au mode sombre).
- Idées à noter dans `docs/IDEES_A_RECLASSER.md` (pas ici) : fiche « reprise du travail après une longue maladie » à partir de sources officielles uniquement ; profil en ligne (LinkedIn) ; brique « corriger dans mon CV » partagée.

### D. Sortie de « M'entraîner à un entretien » : l'ancien décor après l'import (retour de Denis, 2026-10-19)

**Constat** : à l'import de la réponse, `data/metiers.js:10080` appelle `naviguerVers('resultats')` : la page partagée « Vos documents » s'affiche avec l'ancienne barre à 7 repères, le bandeau « Il manque vos coordonnées, votre CV ne pourra pas être finalisé » et « Adaptation au métier » (réglages sans effet après la réponse). La lettre (« Écrire ma lettre avec l'assistant ») a été corrigée le 2026-09-17 par un drapeau `_origineCoLettre` ; l'entretien jamais. Leçon : `LECONS_A_NE_PAS_REPRODUIRE.md` 9.56. Maquette : `docs/MAQUETTE_SORTIE_ENTRETIEN_2026-10-19.html`.

**Décisions de Denis (2026-10-19), maquette VALIDÉE** : titre « Votre préparation d'entretien » ; encart de confirmation « Votre préparation est enregistrée » (nouveau) ; retrait d'« Adaptation au métier » et du second passage de l'assistant de cet écran. Le parcours « Préparer ma lettre et mon entretien » (classique) ne change pas.

**À coder quand l'autre compte aura fini (Mode B, `[effort : moyen]`, patron existant)** :
- [x] D1 (FAIT autrement : pas de drapeau mémorisé, voir BRIQUES_COMMUNES B.36). `data/metiers.js` (import, ligne ~10077) : poser `dossier._origineEntretien = true` ; le remettre à faux dans les parcours qui repartent d'ailleurs (chercher où `_origineCoLettre` et `_origineReformuler` sont remis à zéro, `grep` sur tout le dépôt).
- [x] D2. `js/app.js` : étendre aux 4 endroits qui lisent `_origineCoLettre` (barre `afficherProgression` vers `barreEtapesModule(PREPA_ENTRETIEN_NAV_ETAPES, 3)` ; `secondPasseIARequise` ; masquage de `accordeonAdaptation` ; câblage ~30592).
- [x] D3. Titre « Votre préparation d'entretien » et encart de confirmation (texte de la maquette) seulement quand l'entretien est le document actif venu du module ; texte du bandeau de coordonnées propre à l'entretien. **Vérifier d'abord au code** que la fiche se télécharge sans nom (`normaliserDonneesEntretien` accepte un nom vide) ; sinon le bandeau reste bloquant.
- [x] D4. Tests : parcours navigateur « sortie entretien » (nouveau, dans `scripts/parcours/parcours_smoke.js`) ; rejouer les parcours de la lettre, du CV, de « Reformuler » et « Un CV, plusieurs métiers » ; clair, sombre, 375 px ; `npm test`.
- [x] D5. `BRIQUES_COMMUNES.md` : noter le patron « drapeau d'origine » (trois modules : reformuler, co-lettre, entretien) et la dette restante (page partagée jamais refondue).

## 4. Risques

- **Un prompt trop chargé peut faire oublier le bloc JSON final** : `npm test` ne le détecte pas. D'où les essais réels A4. Ajouter des lignes courtes, ne rien retirer.
- **Le prompt Entretien existe en deux versions** (dialogue et « accueil ») : les modifier ensemble, sinon incohérence (dette de duplication déjà existante, à ne pas aggraver).
- **Inventer des faits sur l'entreprise** : la situation de A1 ne doit venir que de l'offre, du métier et du profil.
- **Collisions avec l'autre compte** : ce plan touche `prompts/entretien.md`, `prompts/entretien-accueil.md`, `prompts/ats.md` (non prévu au niveau 1) et `modules/ats/index.js`. Il ne touche pas `js/app.js`.
- Chemins explicites au commit, jamais `git add -A`.

## 5. Comment vérifier en 10 secondes

- Entretien : lancer une préparation, aller jusqu'à la fin, ouvrir la fiche Word : une question de type « mise en situation » est présente, avec 2 à 3 pistes.
- ATS : faire une comparaison, ouvrir le résultat : l'exemple est visible sous « Peut être formulé autrement », lisible en mode sombre.

## 6. Reprise (pour l'autre compte ou la prochaine séance)

Dernier état connu au 2026-10-19 : dépôt propre, dernier commit `0224f506` (chantier « petites structures » de l'autre compte). Commencer par A1 (relire d'abord les deux prompts en entier), puis A2, A3 ; faire essayer A4 par Denis avant d'attaquer B. Ne pas ajouter ce chantier à `docs/ETAT_DES_CHANTIERS.md` sans le dire à Denis (fichier partagé, risque de collision).

## 7. Suite du 2026-10-19 (soir) : ce qui a été fait en plus et vérifié

- **Sortie de l'entretien (D1 à D5)** : codée, essai `sortieEntretien` (12 contrôles, parcours_smoke.js), clair et sombre et 375 px vus (aucun débordement horizontal). Signal sans mémoire, voir `BRIQUES_COMMUNES.md` B.36.
- **Bouton « Voir toute la feuille »** dans l'aperçu à taille réelle de la fiche d'entretien (`modules/cv-editor/apercuDocxIntegre.js`) : zoom CSS, vu à 375 px (toute la page tient). Pas d'essai automatique (le panneau charge une librairie en ligne). Lettre et CV : non concernés pour l'instant.
- **Carte du bas de la sortie de l'entretien** : propose le module « Écrire ma lettre avec l'assistant » (`ouvrirModuleCoLettre()`, partagée avec la tuile de l'accueil). **Constat** : ce module a son propre dépôt de CV (`_coLettreDocument`), le CV déposé dans l'entretien n'y est pas repris et sera redemandé. Piste, sur décision de Denis : un dépôt de CV commun (dette B.1 de `BRIQUES_COMMUNES.md`), `[effort : haut]`.
- **Libellé corrigé** : le bouton de l'ATS vers la lettre disait encore « Coécrire ma lettre de motivation » (ancien nom, avant le renommage du 2026-10-16) ; il porte le nom actuel.
- **Reste à Denis** : essai réel complet de « M'entraîner à un entretien » avec un assistant (dialogue, JSON seulement à la fin, rappel du téléphone dans les points à préparer, import, fiche Word).
