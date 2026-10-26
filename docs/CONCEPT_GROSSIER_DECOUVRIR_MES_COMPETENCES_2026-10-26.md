# Concept grossier : « Découvrir mes compétences » (parcours de la personne)

Statut : brouillon pour discussion avec Denis, **ni maquette ni code**. S'appuie sur les décisions Q1 à Q8 (`docs/CHANTIER_DECOUVRIR_MES_COMPETENCES_2026-10-26.md`) et sur les sept essais du prompt (`docs/ESSAI_MES_COMPETENCES_RESULTATS_2026-10-26.md`). Mode A, `[effort : haut]`.

## En une phrase
La personne dépose ses documents, un assistant en ligne en tire des compétences **prouvées par ses propres phrases**, elle relit chaque ligne et garde ce qui lui ressemble, et elle repart avec un document « Mes compétences ».

## Les 5 écrans

### 0. Entrée (Boîte à outils, carte « Découvrir mes compétences »)
- Page d'introduction (modèle `htmlPageIntroModule`) : ce qu'est une compétence **en mots simples** (ce que je sais faire, ce que je connais, ma façon de travailler), ce que l'outil fait (relever, expliquer, aider à le dire) et **ne fait pas** (ni note, ni diagnostic, ni métier proposé), « c'est vous qui décidez ».
- Aucun document encore dans l'application : renvoi vers « Créer un nouveau CV » ou « À partir de mon récit » (Q8).

### 1. Mes documents
- Dépôt d'**un ou plusieurs** documents parmi : CV, lettre de motivation, lettre de recommandation (dépôt déjà existant dans l'application, pas de nouvelle zone de collage).
- Une carte « Niveau du poste visé » à trois choix + « Laisser l'outil proposer » (Q5).
- Au moins un document pour continuer.

### 2. L'assistant en ligne
- L'application construit **un seul message** (consigne + documents). La personne le copie, va chez l'assistant de son choix, colle la réponse (briques existantes de copier/coller).
- **Filet de sécurité** appliqué à la réponse collée : jamais de réponse brute affichée ; une ligne dont l'extrait n'est pas dans les documents, qui reprend un mot de santé ou de détention, ou qui est « confirmée » sans source tierce, est écartée ou marquée. Message à la personne : « Quelques lignes ont été mises de côté pour être sûres de ne rien inventer. »

### 3. Je relis mes compétences
- Une carte par compétence, rangées en trois familles : **ce que je sais faire**, **ce que je connais**, **ma façon de travailler**. « Ce qui me donne envie » à part, uniquement avec ses propres mots (Q3).
- Sur chaque carte : le libellé, « en mots simples », **sa phrase de preuve** (« votre CV dit : ... »), « pour mon CV », « pour le dire à l'oral », deux autres façons de le dire.
- Trois gestes : **C'est exact** (garder) / **En partie exact** (la personne corrige elle-même la phrase : la ligne devient « écrite par moi ») / **Je retire**.
- Les lignes « à préciser » : une question simple chacune, la personne répond en une ou deux phrases, puis **second passage** (même mécanique que le premier). Facultatif : on peut passer.

### 4. Mes compétences (le document)
- Sections distinctes (savoir-faire, savoirs, savoir-être, ce qui me donne envie), chaque compétence avec sa preuve et sa phrase pour l'oral.
- Téléchargeable (PDF, Word, texte) et **gardé dans le dossier** (`dossier.mesCompetences`). Aucun autre module ne le lit avant les essais comparatifs (Q2).

## Ce que la v1 ne fait pas
Pas de vision à 2 ou 5 ans (lien vers « Mon projet »), pas de fiche par compétence dans le Lexique (seulement 2 à 3 fiches générales), pas de récit libre (c'est « À partir de mon récit »), pas de lecture du document par le CV, la lettre ou l'entretien.

## Risques et points à trancher
1. **Second passage** : un assistant sur deux modifie la liste entière. Proposition : il ne renvoie que les lignes qui avaient une question, l'application les remet en place (à tester, version 6 limitée à ce passage).
2. **Longueur du parcours** : 4 écrans actifs plus l'introduction ; pour un public fragile, prévoir une sauvegarde automatique à chaque geste et la reprise là où on s'est arrêté.
3. **Beaucoup de lignes** (jusqu'à 14) : relire une par une peut fatiguer. Piste : présenter d'abord les mieux prouvées, les autres sous « Voir le reste ».
4. **Messages longs** si plusieurs documents (précédent de la lettre : environ 46 000 caractères, au bord de ce que certains assistants acceptent) : à mesurer avant la maquette.
5. **Filet de sécurité** : c'est du vrai code à écrire et à tester dans le navigateur (`modules/mes-competences/`), effort haut.

## Prochaine étape
Validation de ce concept par Denis, puis faisabilité chiffrée, **maquette détaillée** (HTML, écran par écran), audit final avec inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI, puis code.
