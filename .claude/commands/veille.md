---
description: Veille légale : lit les réponses des assistants enregistrées par l'outil de veille et dépose des propositions à verser dans les sas (Denis valide ensuite)
---

Reprise de la **veille légale** par le chemin rapide de l'outil de veille (onglet « Travailler avec Claude »). Denis a fait chercher les informations sur Internet par ChatGPT ou Perplexity, a collé chaque réponse dans l'outil, qui les a écrites en fichiers. Ton rôle : trier, comparer aux fiches, et **déposer des propositions** que Denis versera dans les sas puis validera une par une. **Aucune recherche sur Internet.** Tu ne modifies pas toi-même les fiches publiées ni les fichiers `outils/sas/` : tout passe par les sas, avec les contrôles de l'outil.

Fais, dans l'ordre :

1. Lis `CLAUDE.md`, `docs/ETAT_DES_CHANTIERS.md` (partie 0), puis `git log -5` et `git status`. Ne fais jamais `git add -A`, aucun `push`, jamais `git stash`.
2. Trouve le dossier du jour : `outils/retours/AAAA-MM-JJ/` (date système réelle ; si Denis en indique un autre plus bas, prends le sien). Lis d'abord `_index.md`, puis les fichiers. L'index donne pour chaque réponse sa **qualité** : `ok`, `attention` ou `inutilisable`.
   - **Ne lis pas** les réponses `inutilisable` : dis seulement à Denis lesquelles il doit relancer ou aller chercher lui-même.
   - Une réponse `attention` est coupée ou sans source : traite ce qui a une preuve, signale le reste.
   - `hebdo.md` peut contenir **plusieurs réponses d'assistants côte à côte** (ChatGPT, Perplexity...), chacune sous une ligne `=== Réponse de <assistant> (collée à HH:MM) ===` : lis-les toutes, elles ne se remplacent pas et ne suivent pas toujours le format (un texte brut est normal). Chacune a son propre bloc `[SITES-NON-OUVERTS]` : un site n'est « non lu » que si aucune réponse ne l'a ouvert.
   - Les fichiers `main-*.md` (dont `main-sem-<site>.md` pour la veille de la semaine) sont des textes que Denis a copiés lui-même sur des sites que les assistants ne lisent pas. Cite le site et la date de la page, ne reformule rien. Des captures d'écran peuvent s'y ajouter dans la conversation : lis-les de la même façon.
3. Chaque réponse contient des blocs (`[VEILLE-HEBDO]`, `[BALAYAGE]`, `[COUVERTURE]`, `[CONTROLE]`, `[SITES-NON-OUVERTS]`...) et des preuves (adresse, date, passage recopié).
4. Compare chaque changement aux fiches concernées (cherche le sujet dans `modules/comprendre-le-cadre/contenu/` et dans les registres de `modules/mon-territoire/contenu/`).
   **Contrôle des doublons (décision de Denis, 08/11/2026), obligatoire pour toute réponse qui contient des fiches rédigées** (blocs `[FICHE n]`) : enregistre la réponse dans un fichier et lance `node scripts/veilleDoublons.js <fichier> <rayon>`. Il compare chaque fiche à TOUTES les fiches publiées, tous rayons confondus (le message de rédaction ne montre à l'assistant que les fiches d'un rayon : un même sujet peut déjà exister ailleurs). Il distingue « RÉPÈTE n % DU TEXTE DE » (des passages sont repris : redite, il les montre) de « MÊME THÈME QUE » (mêmes mots-clés ou mêmes sources, sans redite de texte : pas un doublon en soi). Ce signal ne voit que les mots repris à l'identique : une même information reformulée lui échappe, donc lis toujours les fiches proches. Puis **lis le texte des fiches signalées** et tranche, fiche par fiche, avec la preuve :
   - **DÉJÀ COUVERTE** : la fiche publiée dit déjà la même chose. Rien à déposer. Dis à Denis laquelle (identifiant) et pourquoi, en une ligne.
   - **MISE À JOUR** : le matériau apporte un fait nouveau ou plus récent. Dépose seulement les champs et phrases qui changent, avec la preuve, en repartant du texte actuel de la fiche.
   - **NOUVELLE** : seulement si aucune fiche publiée ne couvre le sujet. Range-la dans le bon rayon (le rayon du sujet, pas forcément celui du matériau).
   - **Ne dégrade jamais une fiche publiée** : si la fiche existante est plus précise, plus récente ou mieux sourcée que la réponse (par exemple elle donne une date confirmée là où la réponse dit « à vérifier »), la réponse ne sert à rien pour cette fiche, ne dépose rien.
   - **COMPLÉMENT** : la réponse apporte un fait qui manque à une fiche publiée : ajoute-le à cette fiche (mise à jour), jamais dans une nouvelle fiche.
   - Une fiche qui n'en reprend qu'une partie : ne crée pas une seconde fiche, enrichis l'existante ou écarte.
   - **Jamais deux fiches qui disent la même chose** (décision de Denis, 08/11/2026) : si une nouvelle fiche reprend des passages d'une fiche publiée, retire-les d'un des deux côtés (mise à jour de l'autre fiche) et renvoie vers l'autre fiche. Dis à Denis, en une ligne par sujet, ce que tu as tranché et pourquoi.
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
