---
description: Veille légale : lit les réponses des assistants enregistrées par l'outil de veille et dépose des propositions à verser dans les sas (Denis valide ensuite)
---

Reprise de la **veille légale** par le chemin rapide de l'outil de veille (onglet « Travailler avec Claude »). Denis a fait chercher les informations sur Internet par ChatGPT ou Perplexity, a collé chaque réponse dans l'outil, qui les a écrites en fichiers. Ton rôle : trier, comparer aux fiches, et **déposer des propositions** que Denis versera dans les sas puis validera une par une. **Aucune recherche sur Internet.** Tu ne modifies pas toi-même les fiches publiées ni les fichiers `outils/sas/` : tout passe par les sas, avec les contrôles de l'outil.

Fais, dans l'ordre :

1. Lis `CLAUDE.md`, `docs/ETAT_DES_CHANTIERS.md` (partie 0), puis `git log -5` et `git status`. Ne fais jamais `git add -A`, aucun `push`, jamais `git stash`.
2. Trouve le dossier du jour : `outils/retours/AAAA-MM-JJ/` (date système réelle ; si Denis en indique un autre plus bas, prends le sien). Lis d'abord `_index.md`, puis les fichiers. L'index donne pour chaque réponse sa **qualité** : `ok`, `attention` ou `inutilisable`.
   - **Ne lis pas** les réponses `inutilisable` : dis seulement à Denis lesquelles il doit relancer ou aller chercher lui-même.
   - Une réponse `attention` est coupée ou sans source : traite ce qui a une preuve, signale le reste.
   - Les fichiers `main-*.md` sont des textes que Denis a copiés lui-même sur des sites que les assistants ne lisent pas. Cite le site et la date de la page, ne reformule rien. Des captures d'écran peuvent s'y ajouter dans la conversation : lis-les de la même façon.
3. Chaque réponse contient des blocs (`[VEILLE-HEBDO]`, `[BALAYAGE]`, `[COUVERTURE]`, `[CONTROLE]`, `[SITES-NON-OUVERTS]`...) et des preuves (adresse, date, passage recopié).
4. Compare chaque changement aux fiches concernées (cherche le sujet dans `modules/comprendre-le-cadre/contenu/` et dans les registres de `modules/mon-territoire/contenu/`).
5. **Dépose tes propositions** dans `outils/retours/AAAA-MM-JJ/propositions/` (crée le dossier), avec ces seuls noms de fichier :
   - `balayage.json` : les changements du balayage à verser dans le sas des changements (un objet par changement) ;
   - `fiches-hebdo.md` : les mises à jour de fiches issues de la veille de la semaine ;
   - `fiches-rayon-<rayon>.md` : celles d'un rayon contrôlé (par exemple `fiches-rayon-emploi.md`).
   - `chiffres.md` : les chiffres clés du trimestre, avec les blocs `[CHIFFRES periode: ...]`, `[OU-SE-SITUER]`, `[LECTURE]` et `[SYNTHESE-COURTE]` (l'écran des chiffres les lit tels quels) ;
   - `reseau.md` : le bloc `[CONFRONTER periode: ...]` de « Ce qui circule dans le réseau », recoupé et avec preuve ;
   - `lexique.md` : le bloc `[LEXIQUE-BRUT]` des mots nouveaux ou changés (pas de doublon avec le Lexique existant).
   - `portrait.md` et `ue.md` (une fois par an) : le fichier **complet** du module, repris de `portrait-AAAA.md` / `ue-AAAA.md` de l'année précédente et mis à jour avec les réponses `portrait` et `ue`, avec son en-tête (`---`, `type:`, `annee:`) ; une valeur sans preuve reste `[à vérifier]`, jamais inventée. L'onglet préremplit l'écran correspondant ; Denis ajoute le fichier au Dépôt et le publie.
   - Cartes `profil-decoupes` et `medecins` : **aucun fichier à déposer** (pas de lecteur). Si Denis te donne les tableaux copiés, calcule les pourcentages en conversation et montre-lui la mise à jour des fichiers du module avant de l'appliquer.
   Pour les fichiers chiffres, réseau et lexique, ne garde que ce que les preuves des réponses justifient ; si rien de solide ne ressort, dépose quand même le bloc avec une seule ligne « signal: Rien retenu ce trimestre » (réseau) ou n'écris pas le fichier (chiffres, lexique) et dis-le à Denis. L'onglet ouvre ensuite l'écran existant déjà rempli : Denis relit et publie avec le bouton habituel de cet écran.
   Les formats exacts : `node scripts/veilleProposer.js gabarit`. Pour une mise à jour de fiche, repars du texte actuel de la fiche (ne change que ce que la preuve justifie, mêmes champs, `revisions` complétée) ; pour tout fait **nouveau, incertain ou sans preuve**, ne le mets pas dans un fichier : propose-le à Denis dans ta réponse, avec les options, une recommandation et les risques de chacune.
6. **Contrôle avant de prévenir Denis** : `node scripts/veilleProposer.js controler`. Il utilise les mêmes lecteurs que l'outil. Corrige jusqu'à « Rien à corriger » (ou explique à Denis ce qu'il reste à compléter et pourquoi).
7. Si un point est flou, demande à Denis un complément précis (ou dis-lui quelle page ouvrir lui-même). Ne cherche pas toi-même sur le web.
8. Respecte les non-négociables de `CLAUDE.md` : français impeccable avec accents, jamais de tiret cadratin, jamais le mot « IA » visible, dates affichées en français (jour/mois/année). `npm test` doit être vert avant tout commit de code ; ne commite pas les fichiers de `outils/retours/` (dossier privé).
9. Pour finir, dis à Denis, sans jargon : combien de propositions tu as déposées par fichier, ce qui reste à vérifier à la main (sites non ouverts, preuves manquantes), les réponses à relancer. Il clique sur « Actualiser » dans l'onglet, verse chaque catégorie dans le sas, puis valide une par une.

10. **Échéances à date fixe** : relis `docs/VERIFICATIONS_A_DATE_FIXE.md` (inflation chaque mois, Smic, liste des métiers qui recrutent le plus après la parution annuelle de l'enquête BMO) et dis à Denis, en une ligne, lesquelles tombent ou sont déjà dépassées à la date système. Tu ne fais pas la mise à jour toi-même sans fichier officiel ouvert : tu lui donnes la marche à suivre du document.

Complément de Denis (liste des réponses, date, remarques) : « $ARGUMENTS ».
