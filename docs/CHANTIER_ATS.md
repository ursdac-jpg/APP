# Chantier « ATS » -> « Les mots de votre CV (ATS) » (APP)

**Statut : CHANTIER CLOS le 2026-09-08.** Module construit et vérifié navigateur, `npm test` 780 verts. Commits `1610c27..da463f5`. Suivi de fin de chantier : `CLAUDE.md` (bloc « Chantier clos le 2026-09-08 »), `docs/TACHES_VALIDEES.md` (chantier 4 = `[CLOS]`), `docs/BRIQUES_COMMUNES.md` (Historique 2026-09-08). Cible visuelle : `docs/MAQUETTE_ATS_PARCOURS_2026-09-03.html`. Plan : `docs/PLAN_ATS_2026-09-03.md`. Reste hors code (non bloquant) : relecture du prompt `prompts/ats.md` par Denis, `AIDE_PAGES.ats`, vidéo, test terrain.

Le reste de ce document est le dossier de conception d'origine (récolte multi-IA 2026-08-31), conservé comme référence.

---

**À ne pas confondre avec « Analyser ma candidature »** (le Bilan). Arbitrage confirmé par tous les assistants : les garder **séparés**.
- **ATS** = le **langage / le vocabulaire** : « le vocabulaire de mon CV est-il proche de celui de l'offre / du métier ? »
- **Analyser ma candidature** = le **contenu / le parcours / la stratégie** : « mon parcours répond-il à cette offre ? »

---

## 0. Exigences déjà actées (Denis)

1. **Jamais de score.** Aucune note, aucun pourcentage, aucun « taux de compatibilité », aucun verdict « accepté / rejeté », aucune jauge.
2. **Détecter les techniques de triche** dans le texte du CV et, à la détection, **expliquer les risques** (candidature souvent écartée d'emblée, doute jeté sur tout le CV si un recruteur le voit, ne remplace pas le travail sur le contenu), puis proposer de reformuler depuis l'expérience réelle. **Jamais** aider à mieux dissimuler.
3. **Module séparé, court et direct** (pas un long parcours à menu). Confirmé après test utilisateur : des modules qui répondent vite à un besoin précis.
4. Jamais inventer une compétence / une expérience pour caser un mot-clé.
5. **Encart « Continuer / Recommencer » + gel du module à la reprise** (retour Denis, 2026-08-31) : ATS reçoit un CV et fait un passage assistant → c'est un **parcours**, comme Bilan / Cohérence / Découverte / Comparer / Regard recruteur. À la construction du module, implémenter la même brique partagée (`htmlEncartRepriseModule` + `appliquerGelModule` + flags `_atsReprisePendante` / `_atsDetourPresentation`, alignés sur Cohérence), pas un mécanisme maison. (Carnet / Repères / Lexique : au contraire, PAS de gel — outils de captation permanente.)

---

## 1. Présentation du résultat sans score (converge fortement)

**Abandonner même le couple « présents / absents »** : le cerveau le transforme en score implicite (présent = point gagné, absent = point perdu). À la place, **des blocs textuels qualitatifs de lisibilité égale**, aucun compteur, aucune couleur rouge / verte, aucune hiérarchie visuelle :

- **« Déjà exprimé dans votre CV »** - le CV utilise déjà ce vocabulaire, ou un vocabulaire très proche. *(valorisant, en premier)*
- **« Peut être formulé autrement »** - le CV décrit probablement cette expérience, mais avec d'autres mots ; proposition de reformulation *si elle correspond bien à votre expérience*.
- **« Pas retrouvé dans le texte fourni »** - jamais « il vous manque ». « Ce terme n'a pas été retrouvé dans le texte fourni ; vérifiez d'abord s'il correspond réellement à votre expérience avant d'envisager de l'ajouter. » **Absence dans le texte ≠ absence dans le parcours.**
- **« À vérifier »** - quand l'assistant hésite (ex. « CRM » dans l'offre / « logiciel de gestion commerciale » dans le CV) : « ces formulations semblent proches, mais nécessitent votre validation ».

Encart en tête : « Cette comparaison de vocabulaire n'est ni un test ni une note. Il n'y a pas de bon ou de mauvais CV : ce sont des pistes pour reformuler si vous le souhaitez. »

---

## 2. Origine des mots-clés de référence (converge, strict)

Trois niveaux, par priorité :
1. **L'offre d'emploi collée** par la personne - toujours la source principale, mots-clés extraits **strictement** du texte de l'offre.
2. **Une fiche métier officielle** (ROME / France Travail / ESCO) choisie par la personne, si pas d'offre.
3. **Une recherche web ciblée**, seulement si aucune offre ni fiche - avec **source + date + métier** obligatoires pour chaque mot.

**Règle imposée dans le prompt** : « N'extrais que des termes explicitement présents dans le texte fourni. Interdiction de deviner, d'inventer ou d'ajouter des mots-clés génériques externes. Pour chaque mot-clé retenu, indique son origine (offre / fiche ROME / URL + date). Si tu ne peux pas rattacher un mot-clé à une source claire, ne le proposes pas. » Interdit : « les recruteurs attendent généralement… » sans source.

Interface : bouton « J'ai une offre » / « Je n'ai pas d'offre » (→ sélection dans la base métiers).

---

## 3. Reformulation ancrée sur l'expérience réelle (LE garde-fou principal, converge)

**Règle de prompt** : « Ne propose que des reformulations directement déductibles du texte du CV fourni. N'invente aucune compétence, aucun poste, aucune mission, aucun outil, aucun résultat. Si une reformulation suppose une compétence non mentionnée : ne la propose pas, indique "À vérifier avec vous". Si aucune expérience du CV ne correspond au mot-clé : dis-le - "Ce terme ne semble pas correspondre à une expérience présente dans votre CV ; ne l'ajoutez pas si vous ne l'avez pas fait." »

- Le **« si » conditionnel** change tout : « Si vous utilisiez Excel pour réaliser ces tableaux de suivi, vous pouvez le préciser. »
- Format : **une phrase**, verbe d'action, reliée à une tâche réelle du CV (avec un court extrait cité).
- **Limiter à ~5 termes majeurs** par analyse (évite la robotisation du CV).
- Avertissement systématique à la personne : « Vérifiez que chaque reformulation correspond bien à votre vécu ; ne l'utilisez que si elle vous semble juste. »

---

## 4. Détection de triche : être honnête sur les limites (converge)

**Ce qu'on NE PEUT PAS détecter** à partir d'un simple copier / coller du texte (la couleur et la taille sont perdues) : texte blanc sur fond blanc, police de taille quasi nulle, texte invisible, texte derrière une image, blocs dans les marges. **Le dire explicitement.**

**Ce qu'on PEUT repérer** (indices textuels, heuristique) : longues listes de mots-clés sans ponctuation ni phrases · répétitions massives anormales d'un même terme · blocs de termes hors contexte (souvent en fin de document, ou juste avant / après les coordonnées) · sections « Compétences » démesurées sans lien avec les expériences · ratio élevé de noms sans verbes.

**Faux positifs** (pied de page, mentions légales, profil technique dev / data / IT qui liste légitimement beaucoup d'outils) : toujours **afficher l'extrait suspect en contexte** (quelques mots avant / après), **laisser la personne juger**, **jamais bloquer**.

**Message** (informatif, jamais accusateur ; jamais « nous avons détecté du texte caché ») :
> « Le texte fourni contient un passage qui ressemble à une liste de mots-clés sans contexte. Cela peut venir d'une mise en forme perdue lors du copier / coller, ou d'une technique destinée à influencer un logiciel de tri. Vérifiez votre document. Si des mots invisibles ont été ajoutés volontairement, nous vous le déconseillons : cela peut entraîner un rejet de la candidature, ou un doute sur l'ensemble du CV. Il est préférable de faire apparaître les compétences réelles dans la description de vos expériences. »

Où faire la détection : soit un **script JS local** au collage (compatible statique), soit **via le prompt** (l'assistant signale). Les deux sont possibles. **Jamais** expliquer comment mieux dissimuler.

---

## 5. Mise en forme qui gêne un ATS : mentionner, pas analyser (converge)

Le module ne voit que le texte, pas le fichier → **ne jamais dire** « votre CV a deux colonnes ». Deux approches, cumulables :
- **Test de révélation par le collage** : « Si votre texte apparaît mélangé ou incompréhensible quand vous le collez ici, le logiciel du recruteur le lira de la même façon. »
- **Une fiche de bonnes pratiques FIXE** (pas une analyse) : texte sélectionnable · éviter tableaux complexes et colonnes multiples qui cassent l'ordre de lecture · éviter les images contenant du texte · éviter le contenu important dans les en-têtes / pieds de page · police classique · vérifier le rendu après export PDF. Liens vers des guides (France Travail a une page ATS). Maintenance : vérifier les liens tous les 6-12 mois.

---

## 6. Sans offre précise : utile, avec un autre objectif (converge)

Référence = une **fiche métier ROME**. L'objectif devient « employer le vocabulaire généralement utilisé pour ce métier », + aider à **clarifier le projet** (« ça je l'ai fait / ça je veux faire / ça je ne veux pas ») + préparer des recherches d'offres plus ciblées. L'assistant précise : « Ces termes proviennent d'une fiche métier officielle et peuvent varier selon les employeurs » (aucune illusion de précision). Variante « exploration » : 3 mots-clés prioritaires à travailler.

---

## 7. Nom : bannir « ATS » du titre (converge fortement)

Le plus cité chez les assistants : **« Les mots de votre CV »**. Autres : « Adapter mon CV » · « Le vocabulaire de votre CV » · « CV et mots-clés » · « Mots du métier, mots du CV ».
Sous-titre type : « Comparer le vocabulaire de votre CV avec celui d'un métier ou d'une offre, pour mieux faire ressortir votre parcours. »
« ATS » peut vivre dans une **aide contextuelle** (« Pourquoi parle-t-on de logiciels de tri des CV, les ATS ? »), jamais en titre. Aucun nom ne doit contenir « filtre » ni « sélection » ni promettre de « passer ».

**Répercussions d'un changement** : carte d'accueil « ATS », route `ats-intro`, `pageIntroAts`, titre de `MAQUETTE_INTRO_ATS.html`, ligne d'`AIDE_PAGES.cv`.

---

## 8. Ce qui est réutilisable : des éléments de travail, jamais un résultat (converge)

- Une **liste de reformulations proposées** (à relire avant usage).
- Une **liste courte de « mots à travailler »**, intitulée « mots que vous pourriez ajouter si vous le voulez » (+ « il n'est pas nécessaire de tous les utiliser »).
- Des **questions à poser au conseiller** (« Est-ce que mon expérience chez X couvre bien le terme Y ? », « Ai-je utilisé cet outil ? »).
- Une **« Aide-mémoire Vocabulaire & CV »** copiable / imprimable : les 3-4 mots à remplacer soi-même dans Word / LibreOffice.
- Bouton « Copier ma fiche » / « Imprimer », **aucun stockage automatique**.
- **Jamais** : « CV optimisé », « compatible ATS », « validation », « niveau de compatibilité », un fichier certifié.

---

## 9. Risques et dérives (converge)

- **Score déguisé** : les catégories interprétées comme une notation → catégories strictement qualitatives, aucun compteur, aucune hiérarchie visuelle.
- **Invention de compétences** : l'assistant « forcit » la réalité (« j'ai aidé à organiser » → « j'ai géré des projets ») → règle stricte + avertissement + vérification par la personne + plafond de 5 termes.
- **Faux sentiment de sécurité / promesse « passer l'ATS »** : rappeler que l'ATS n'est qu'une étape, que le recruteur humain décide, que rien n'est garanti. Nom neutre.
- **Détection de triche** trop agressive (faux positifs, culpabilisation) ou trop laxiste ; en texte brut on ne détecte pas le vrai texte caché → honnêteté sur la limite, ton informatif, extrait en contexte.
- **Confusion sur la responsabilité** : croire que l'assistant « valide » le CV → rappeler que le CV reste le reflet fidèle et personnel, à relire avec le conseiller.
- **CV avec peu de texte** (intérimaire, une mission) : peu de reformulations possibles → « moins vous avez d'expériences, plus les mots-clés vous donnent des pistes pour décrire ce que vous avez fait ».
- **Offre mal rédigée** : accepter qu'une comparaison soit moins pertinente si la référence est de faible qualité, sans compléter par des suppositions non sourcées.

---

## 10. Notes d'autocritique rendues : 16 à 19 / 20

Points faibles récurrents : la détection de triche en texte brut est nécessairement limitée (approximation assumée) ; dépendance à la qualité du texte collé et de l'assistant externe ; aucun test utilisateur ; la friction du copier / coller peut demander un étayage au premier usage pour le public le plus éloigné du numérique.

---

## 11. Décisions à prendre par Denis avant maquette

1. Nom : « Les mots de votre CV » (le plus recommandé) ou autre ? (répercussions carte + route + maquette + aide)
2. Présentation : 4 blocs (Déjà exprimé / Peut être formulé autrement / Pas retrouvé / À vérifier) - on garde les 4 ou on fusionne ?
3. Détection de triche : script JS local au collage, consigne dans le prompt, ou les deux ?
4. Fiche « mise en forme et ATS » : une page de conseils fixes avec liens externes, oui / non ? (maintenance liens 6-12 mois)
5. Plafond de reformulations proposées par analyse (5 ?).

---

## 12. Annexe : brief envoyé aux assistants (2026-08-31)

Contexte : APP, application web statique d'accompagnement de parcours professionnel, public en fragilité numérique + conseillers, un seul mainteneur, sans budget, tout par copier / coller. Philosophie : aide à comprendre et préparer, ne décide jamais, aucun diagnostic sur la personne, aucun score. Ton simple, jamais culpabilisant.

Module : « ATS » (les mots-clés du CV). Rôle : donner une idée de la correspondance entre le vocabulaire du CV et les mots-clés attendus pour un métier ou une offre (présents / proches / à reformuler). Mécanique : CV (fichier / photo / scan / texte collé) + métier visé + offre si possible ; masquage des infos sensibles ; comparaison par un assistant en ligne ; copier / coller. Exigence actée : détecter les techniques de triche dans le texte (blanc sur blanc, invisible mais sélectionnable, marges, police quasi nulle) et, à la détection, expliquer les risques puis proposer de reformuler depuis l'expérience réelle, jamais aider à dissimuler. Tension : « ATS qui glisse vers un score ». Recouvrement : module séparé de « Analyser ma candidature » (décision : garder séparé, court et direct).

9 questions : présentation sans score ni checklist anxiogène · origine des mots-clés (source obligatoire, jamais deviner) · règle de reformulation ancrée sur l'expérience réelle · détection de triche (méthode, faux positifs, message) · alerte mise en forme oui / non · utilité sans offre · nom accessible · production réutilisable.

Garde-fous : jamais un score / taux / verdict ; jamais inventer une compétence ; la détection de texte caché débouche toujours sur un déconseil argumenté ; les mots-clés de référence ont une source ; ne pas culpabiliser ; signaler toute proposition qui suppose base / parseur de fichier / serveur / API.

Format : (a) textes pour la personne · (b) fonctions avec « ce que ça améliore » · (c) risques et dérives, y compris dans ses propres propositions · (d) autocritique notée sur 20.
