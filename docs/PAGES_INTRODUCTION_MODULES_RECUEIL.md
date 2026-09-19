# Pages d'introduction des modules - recueil de contenu (APP)

**Statut : recueil de travail, PAS encore validé, RIEN à coder.** Créé le 2026-08-28 à la demande de Denis.
Objectif : rassembler au même endroit le contenu des pages d'introduction des modules, la comparaison avec les 2 pages déjà construites, et le message à envoyer aux autres IA pour enrichir l'ensemble. Denis tranchera ensuite ce qui part en maquette puis en code.

**Rattachement (décision de Denis, 2026-08-28)** : ce document est la **source obligatoire** du sous-chantier "page d'introduction de chaque module", lui-même partie du megachantier "Réorganisation de la page d'accueil" (`docs/TACHES_VALIDEES.md`). Quand ce megachantier avancera, module par module, il faudra ouvrir ce fichier ET les entrées du 2026-08-28 de `docs/IDEES_A_RECLASSER.md` (banque de fonctions par module, idées de modules nouveaux, grille d'évaluation) pour reprendre le lexique et le phrasé, et implémenter au passage les idées de fonctions déjà mûres. Le recueil continue de s'enrichir (récolte multi-IA) - le relire tel qu'il est le jour où le sous-chantier démarre. Les 2 pages déjà en production (Repères, Cohérence de mon dossier) sont elles aussi à revoir dans ce cadre (voir section 4).

Nom de l'application : **APP** (Accompagnement de Parcours Professionnel ; clin d'œil : Analyse de Pratiques Professionnelles). Ne plus écrire "ERIP" dans les nouveaux textes.

---

## 1. À quoi sert vraiment ce chantier (réponse à la question de Denis)

La question de Denis : est-ce qu'aller chercher toute cette philosophie auprès des autres IA, c'est **uniquement** pour trouver les bonnes phrases des pages d'introduction, ou est-ce qu'on cherche aussi autre chose ?

Réponse : au départ c'était "juste les phrases", mais l'exercice a déjà produit **trois choses distinctes**, et seule la première concerne le texte des cartes :

1. **Le texte des pages d'introduction** - les phrases elles-mêmes (accroche, "ce que ce n'est pas", etc.).
2. **Des principes de conception réutilisables** - le bloc "Ce que ce n'est pas" comme règle, la signature commune, l'ordre conseillé formulé en repère souple et non en consigne. Ça façonne le *patron* de toutes les pages, pas une carte en particulier.
3. **Des idées de fonctions** - brouillon vocal, indicateur d'état du dossier, doctrine "système d'accumulation". Ce sont des fonctionnalités, déjà rangées dans `docs/IDEES_A_RECLASSER.md`.

Donc oui, on récupère plus que des phrases. Et c'est exactement pour ça que ça vaut le coup de faire **un** grand aller-retour IA bien cadré (pas plusieurs), une fois l'application stabilisée : on demande de la matière à trier, on garde le contrôle éditorial, tout ce qui est solide va dans le fichier des idées, et on y puise au moment d'implémenter chaque module.

---

## 2. Structure canonique d'une page d'introduction

Une page d'introduction n'est pas une vitrine. Elle **ajuste l'attente** : la personne comprend ce qu'elle va trouver avant de cliquer, pour ne pas être déçue par un bon résultat qui ne ressemble pas à ce qu'elle imaginait. Une seule page/route, qui se transforme en tableau de bord dès qu'un résultat existe. Y revenir n'efface jamais rien.

Blocs, dans l'ordre :

1. **Barre d'étapes** (si le module a un parcours en plusieurs étapes) - informative, non cliquable, réutilise les pastilles + chevrons déjà construits. Jamais un temps estimé, seulement une position dans le parcours.
2. **Titre + accroche** - l'accroche porte la **raison d'être** : une phrase reliée à un frein humain réel ("Il est difficile de parler de ce qu'on sait faire quand personne n'aide à mettre les mots").
3. **À quoi ça sert** - l'objectif, en langage simple.
4. **Ce qui va se passer** - 2 à 4 points concrets, à la 2e personne. "En savoir plus" dépliable quand un point mérite du détail (repris de la page Repères).
5. **Ce que ce n'est pas** - le bloc central. Il dissipe la fausse attente la plus fréquente pour CE module.
6. **Comment ça se passe concrètement** - seulement pour les modules qui passent par un assistant : "vous copiez un texte, vous le collez sur un site que vous choisissez, vous rapportez la réponse ici, l'application vous guide à chaque étape".
7. **Cet outil travaille avec…** - encart visuellement distinct, 2 à 3 liens vers les pages d'introduction des modules connectés (ou vers leur tableau de bord si déjà utilisés).
8. **Bon à savoir** - confidentialité ("votre nom et vos coordonnées ne partent jamais vers l'assistant") + rappel sauvegarde/disquette si le module produit des données (repris de la page Repères).
9. **Bouton d'entrée** - "Je commence" au premier passage, "Je reprends" ensuite. Verbe explicite + nom complet du livrable.
10. **Signature commune, discrète, en pied** - "APP part de ce que vous apportez, vous aide à prendre du recul, et vous laisse toujours la décision."
11. **Barre de navigation standard** - "Retour" depuis un écran interne ramène à la page d'introduction ; depuis la page d'introduction, "Retour" mène à la vraie page précédente. Les fenêtres ne comptent jamais comme un écran.

**État 2 (après le premier résultat)** : la même page devient le tableau de bord, contenu modifiable sur place, avec toujours une **raison de revenir** mise en avant (ce qui reste à faire, ce qu'on peut relancer). Vocabulaire : *retrouver, reprendre, continuer*.

---

## 3. Les 6 cartes consolidées (7 points "à garder" intégrés)

### Carte 1 - Mon Carnet

- **Accroche / raison d'être** : « Beaucoup de choses importantes nous viennent au mauvais moment, puis s'oublient. Mon Carnet est un endroit à vous pour les poser tout de suite : une idée, un souvenir de travail, une phrase entendue, une chose à ne pas oublier. »
- **À quoi ça sert** : garder une trace de ce qui compte pour vous, sans avoir à savoir tout de suite ce que vous en ferez.
- **Ce qui va se passer** :
  - Vous écrivez ce que vous voulez, quand vous voulez, sans forme imposée.
  - Vos notes s'enregistrent au fil de l'eau et restent sur cette page.
  - Vous pouvez les relire, les modifier, les supprimer à tout moment.
- **Ce que ce n'est pas** : « Ce n'est pas analysé, ni corrigé, ni transmis à qui que ce soit. Votre Carnet n'est jamais lu ni analysé automatiquement. C'est un brouillon personnel, pas un document. »
- **Cet outil travaille avec…** : Mes Repères (« quand une note vous semble compter vraiment pour votre parcours, un bouton la transforme en Repère »).
- **Bon à savoir** : l'application ne demande jamais de compte. Pensez à sauvegarder (icône disquette) après avoir écrit, sinon vos notes seront perdues à la fermeture de la page.
- **Bouton** : « Ouvrir mon Carnet ».
- **Tableau de bord** : la liste de vos notes, la plus récente en haut, avec un repère discret sur celles déjà transformées en Repères.

### Carte 2 - Lexique

- **Accroche / raison d'être** : « Le monde du travail est plein de mots qu'on est censé connaître sans nous les avoir jamais expliqués. Le Lexique les explique simplement, sans jargon et sans supposer que vous savez déjà. »
- **À quoi ça sert** : comprendre un mot précis au moment où il vous bloque, puis repartir.
- **Ce qui va se passer** :
  - Vous cherchez un mot (CDI, période d'essai, ATS, lettre de motivation…) ou vous parcourez par thème.
  - Chaque entrée donne une définition claire, courte, avec un exemple quand c'est utile.
  - Certains mots renvoient directement vers l'outil de l'application qui s'en sert.
- **Ce que ce n'est pas** : « Ce n'est pas un cours à suivre du début à la fin, ni une liste à mémoriser. Vous venez chercher un mot, vous repartez. Il n'y a rien à terminer. »
- **Cet outil travaille avec…** : Analyser ma candidature, Coécrire ma lettre de motivation, Préparer un entretien d'embauche (« depuis une définition, vous pouvez ouvrir l'outil concerné ; et depuis un autre outil, un mot difficile peut vous ramener ici »).
- **Bon à savoir** : le Lexique ne contient aucune information sur vous ; vos recherches ne sont pas enregistrées.
- **Vision (à annoncer dès maintenant)** : « Bientôt : des repères plus larges sur les compétences et le projet professionnel. »
- **Bouton** : « Ouvrir le Lexique ».
- **Tableau de bord** : la barre de recherche, vos derniers mots consultés, et une petite sélection de mots utiles selon l'étape où vous en êtes.

### Carte 3 - Analyser ma candidature

- **Accroche / raison d'être** : « Avant de modifier un CV, il est souvent utile de comprendre ce qui fonctionne déjà. Analyser ma candidature vous donne un regard extérieur et structuré : ce qui est solide, ce qui peut faire hésiter un recruteur, et par quoi commencer. »
- **À quoi ça sert** : faire un état des lieux de votre CV tel qu'un recruteur peut le percevoir.
- **Ce qui va se passer** :
  - Vous partez de votre CV (déjà déposé ou saisi) et, si vous le souhaitez, du poste ou du secteur visé.
  - Un assistant en fait une lecture selon des critères fixes : adéquation, crédibilité, points forts, points qui peuvent freiner, cohérence du parcours, clarté.
  - Vous recevez un rapport clair, puis vous choisissez la suite : écrire les corrections vous-même, être aidé sur la formulation, ou être accompagné étape par étape.
- **Ce que ce n'est pas** : « Ce n'est pas une note ni un jugement sur vous. Ici, on regarde l'état de votre CV, pas ce que vous direz à l'oral. Chaque point vient avec une piste concrète. »
- **Comment ça se passe concrètement** : vous copiez votre CV, vous le collez sur le site d'un assistant de votre choix, vous rapportez la réponse ici. L'application vous guide à chaque étape.
- **Cet outil travaille avec…** : Coécrire ma lettre de motivation, Préparer un entretien d'embauche, Cohérence de mon dossier.
- **Repère d'usage (souple, jamais une consigne)** : « Souvent utilisé avant d'écrire la lettre de motivation et de préparer l'entretien d'embauche. »
- **Bon à savoir** : votre nom et vos coordonnées ne partent jamais vers l'assistant.
- **Bouton** : « Analyser mon CV ».
- **Tableau de bord** : un bandeau qui indique l'état général de votre CV, puis les points déjà traités et ceux qui restent, avec la possibilité de relancer une analyse sur la version corrigée.

### Carte 4 - Préparer un entretien d'embauche

- **Accroche / raison d'être** : « Un entretien ne se prépare pas seulement en apprenant des réponses : il se prépare en comprenant son propre parcours. Ce module vous aide à savoir quoi dire, et à anticiper les questions qui pourraient vous déstabiliser. »
- **À quoi ça sert** : arriver à l'entretien plus à l'aise, en ayant réfléchi avant.
- **Ce qui va se passer** :
  - Vous partez de votre CV et, si vous l'avez, de l'offre visée.
  - Un assistant prépare une lecture : vos points forts à mettre en avant, les questions probables, les points de votre parcours qui pourraient être questionnés (trou, changement de voie…) et comment les présenter avec justesse.
  - Vous obtenez de quoi vous entraîner, à votre rythme.
- **Ce que ce n'est pas** : « Ce n'est pas un script à réciter, ni une simulation en direct. Ici, on prépare ce que vous allez dire ; on ne juge pas votre CV (c'est le rôle d'Analyser ma candidature). C'est un temps de réflexion, pour le jour J. »
- **Comment ça se passe concrètement** : vous copiez votre CV et l'offre, vous les collez sur le site d'un assistant de votre choix, vous rapportez la réponse ici. L'application vous guide à chaque étape.
- **Cet outil travaille avec…** : Analyser ma candidature, Coécrire ma lettre de motivation, Cohérence de mon dossier.
- **Repère d'usage (souple)** : « Souvent utilisé une fois le CV calé, et après avoir écrit la lettre de motivation. »
- **Bon à savoir** : votre nom et vos coordonnées ne partent jamais vers l'assistant.
- **Bouton** : « Préparer mon entretien d'embauche ».
- **Tableau de bord** : votre dernière préparation, les questions déjà travaillées, celles qu'il reste à explorer, et la possibilité de recommencer si le poste visé change.

### Carte 5 - Coécrire ma lettre de motivation

- **Accroche / raison d'être** : « La page blanche est le vrai obstacle d'une lettre de motivation. Ici, vous n'en partez pas : un assistant propose, vous gardez la main sur chaque phrase. »
- **À quoi ça sert** : écrire une lettre de motivation qui vous ressemble, à deux.
- **Ce qui va se passer** :
  - Vous donnez votre CV, le poste visé et, si vous l'avez, l'offre et l'entreprise.
  - Un assistant propose une structure et des formulations à partir de votre parcours réel.
  - Vous reprenez, modifiez, coupez ce que vous voulez : rien n'est écrit à votre place sans que vous validiez.
- **Ce que ce n'est pas** : « Ce n'est pas une lettre générée d'un clic qu'il n'y aurait plus qu'à envoyer. Ici, on rédige un document, pas un état des lieux. L'assistant propose, vous décidez, la lettre reste la vôtre. »
- **Comment ça se passe concrètement** : vous copiez votre CV et l'offre, vous les collez sur le site d'un assistant de votre choix, vous rapportez la réponse ici, puis vous retravaillez le texte. L'application vous guide à chaque étape.
- **Cet outil travaille avec…** : Analyser ma candidature, Préparer un entretien d'embauche, Cohérence de mon dossier.
- **Repère d'usage (souple)** : « Souvent utilisé après avoir analysé son CV. »
- **Bon à savoir** : votre nom et vos coordonnées ne partent jamais vers l'assistant. Pensez à sauvegarder après avoir travaillé votre lettre.
- **Bouton** : « Écrire ma lettre de motivation ».
- **Tableau de bord** : votre dernière lettre, le poste pour lequel elle a été écrite, les versions précédentes, et la possibilité d'en repartir pour une autre candidature.

### Carte 6 - Découvrir mes compétences

- **Accroche / raison d'être** : « Il est difficile de parler de ce qu'on sait faire quand personne n'aide à mettre les mots. Ce module met des mots justes sur vos savoir-faire, y compris ceux qui viennent de la vie et pas seulement du travail déclaré. »
- **À quoi ça sert** : reconnaître et formuler des compétences que vous avez déjà, pour pouvoir les dire.
- **Ce qui va se passer** :
  - Vous racontez librement des expériences : un emploi, mais aussi de l'aide à la famille, du bénévolat, une passion.
  - Un assistant vous propose des formulations de compétences, toujours appuyées sur ce que vous avez raconté (jamais inventées).
  - Vous choisissez celles qui vous parlent, vous les affinez si besoin, et elles peuvent rejoindre votre CV.
- **Ce que ce n'est pas** : « Ce n'est pas un test qui vous dit qui vous êtes ni qui vous range dans des cases. C'est un travail de formulation : vous savez déjà faire des choses, l'outil aide à le dire de façon qui compte pour un employeur. »
- **Comment ça se passe concrètement** : vous écrivez librement votre expérience, vous la copiez sur le site d'un assistant de votre choix, vous rapportez la réponse ici, puis vous choisissez les compétences justes. L'application vous guide à chaque étape.
- **Cet outil travaille avec…** : votre CV (rubrique Compétences), Mes Repères, Analyser ma candidature.
- **Repère d'usage (souple)** : « Souvent utilisé avant de travailler son CV. »
- **Bon à savoir** : votre nom et vos coordonnées ne partent jamais vers l'assistant.
- **Bouton** : « Découvrir mes compétences ».
- **Tableau de bord** : vos compétences déjà dégagées, celles ajoutées à votre CV, et les expériences que vous pouvez encore explorer.

---

## 4. Les 2 pages d'introduction déjà construites

### 4.1. Cohérence de mon dossier (`modules/coherence-transversale/ui.js`, `ctHtmlExplication()`)

Contenu actuel : barre d'étapes (5 pastilles : Vos documents / Infos complémentaires / Choix de l'assistant / Chez l'assistant / Rapport) + titre + sous-titre + 3 blocs :
- « À quoi ça sert ? » (le recruteur lit CV puis lettre puis entretien ; s'ils se contredisent, ça sème le doute ; ce module les compare entre eux et avec l'offre).
- « Ce qu'on va vous demander » (CV et lettre obligatoires, préparation d'entretien facultative, offre/entreprise/question si souhaité ; fichier ou texte collé).
- « Comment ça marche » (documents relus et validés par vous, envoyés à un assistant de votre choix, vous rapportez la réponse, le rapport s'affiche et reste modifiable).
Puis bouton « Je commence → ». État 2 : `ctHtmlTableauDeBord()` - une carte par document (modifiable sur place), une carte candidature (entreprise / type de structure / site / offre), messages contextuels, boutons « Voir/imprimer votre lettre », « Relancer l'analyse », « Aller plus loin : mon entretien ».

### 4.2. Mes Repères (`modules/reperes/index.js`, `_reperesRenduAccueil()`)

Contenu actuel : entête (icône ⚓, titre, accroche « Un espace pour garder vos réflexions au fil du temps, sans avoir à savoir tout de suite ce que vous allez en faire ») + rubriques :
- « À quoi ça sert » (une question, une idée, un sujet à creuser, quelque chose à discuter ; rien n'est obligatoire, rien n'est jugé).
- « Vous en verrez ailleurs aussi » (le bouton "garder comme Repère" croisé ailleurs, c'est le même module).
- « Comment ça marche » (grille de 4 cartes : Question / Idée / À approfondir / À discuter, chacune avec un « En savoir plus » dépliable).
- « Pour aller plus loin, si vous le souhaitez » (Journal de parcours, Regard Extérieur, Aller plus loin).
- « Important à savoir » (l'application ne demande jamais de compte ; sauvegarder avec la disquette, sinon perte).
Puis bouton « Je commence » ou « Je reprends » selon l'état.

### 4.3. Verdict : supérieur ou inférieur à la proposition ?

**Ni l'un ni l'autre : à égalité, complémentaires.** Des 2, la page Repères est la plus aboutie (la plus proche du 20/20).

Ce que la proposition (section 3) apporte que **ni** page existante n'a :
- un bloc **« Ce que ce n'est pas »** explicitement titré (Repères a seulement « rien n'est jugé » en passant ; Cohérence n'a rien) ;
- une **phrase de raison d'être** compacte en tête, reliée à un frein humain ;
- une **signature commune** en pied ;
- l'encart **« Cet outil travaille avec… »** au format générique (Repères a un « Pour aller plus loin » spécifique ; Cohérence n'a aucun lien inter-module).

Ce que les 2 pages existantes ont et que la proposition n'avait pas formalisé :
- le **« En savoir plus » dépliable** (Repères) - essentiel pour éviter le mur de texte au public fragile ;
- le **rappel sauvegarde/disquette** (Repères) ;
- le **bouton d'état « Je commence » / « Je reprends »** ;
- l'**explication concrète du copier-coller** (Cohérence, bloc « Comment ça marche ») ;
- la **barre d'étapes réelle** (Cohérence).

### 4.4. Ce qu'il faut faire

Le patron canonique de la section 2 **fusionne déjà les deux**. Reste à hisser les 2 pages existantes à ce niveau, quand leur tour viendra dans le megachantier accueil :

- **Cohérence de mon dossier** : ajouter le bloc « Ce que ce n'est pas », la phrase de raison d'être, l'encart « Cet outil travaille avec… » (Analyser ma candidature, Coécrire la lettre de motivation, Préparer un entretien d'embauche), le rappel sauvegarde, la signature.
- **Mes Repères** : ajouter un bloc « Ce que ce n'est pas » titré, une phrase de raison d'être compacte en tête, et transformer « Pour aller plus loin » en encart générique « Cet outil travaille avec… » (garder « En savoir plus » et « Important à savoir » tels quels).

---

## 5. Message à envoyer aux autres IA (à utiliser plus tard, pas maintenant)

> **Contexte.** Nous concevons APP (Accompagnement de Parcours Professionnel), une application web d'aide à la recherche d'emploi. Public visé : des personnes peu à l'aise avec l'informatique et souvent en manque de confiance en elles. Principes non négociables : l'application ne décide jamais à la place de la personne, ne l'influence pas implicitement, ne cherche pas à capter son attention, et la personne reste propriétaire de ses informations (aucun compte, tout est local). Ton : simple, direct, rassurant, jamais infantilisant, jamais commercial. Interdits d'écriture : pas d'estimation de durée, pas le mot « IA » dans les textes vus par l'utilisateur (on dit « un assistant »), noms toujours complets (« lettre de motivation », « préparation d'entretien d'embauche »), pas de tiret long.
>
> **Ce qu'on vous demande.** Nous préparons une « page d'introduction » pour chaque module : une page qui ajuste l'attente de la personne avant qu'elle n'entre dans l'outil, et qui se transforme ensuite en tableau de bord. Nous voulons l'enrichir sur **deux plans** :
> 1. **Le texte** de ces pages (accroche/raison d'être, « ce qui va se passer », « ce que ce n'est pas », liens entre modules, bouton).
> 2. **Les fonctions** que ces modules pourraient offrir, accueillir ou montrer - nous sommes en pleine conception, tout est encore ouvert.
>
> Nous cherchons **beaucoup** d'idées, quitte à en écarter la moitié. Tout ce qui est solide sera versé dans notre fichier d'idées et pioché au moment d'implémenter chaque module.
>
> **Modules qui existent déjà et auront une page d'introduction :**
> - *Mon Carnet* : espace de capture libre, jamais lu ni analysé automatiquement ; une note peut devenir un « Repère ».
> - *Lexique* : glossaire du vocabulaire de l'emploi expliqué simplement, relié aux outils de l'app.
> - *Mes Repères* : réflexions que la personne choisit de garder (question, idée, sujet à approfondir, sujet à discuter) ; au-delà d'un certain nombre, elle peut demander un « Regard extérieur » à un assistant.
> - *Découvrir mes compétences* : la personne raconte des expériences (pro et non pro), un assistant propose des formulations de compétences appuyées sur son récit, elle choisit celles qui rejoignent son CV.
> - *Analyser ma candidature* : un assistant lit le CV selon des critères fixes et renvoie un diagnostic + des pistes ; 3 façons de corriger (soi-même, aidé sur la formulation, accompagné pas à pas).
> - *Coécrire ma lettre de motivation* : un assistant propose structure et formulations à partir du parcours réel, la personne garde la main sur chaque phrase.
> - *Préparer un entretien d'embauche* : à partir du CV et de l'offre, un assistant prépare points forts, questions probables, points sensibles du parcours et comment les présenter.
> - *Cohérence de mon dossier* : compare CV, lettre de motivation et préparation d'entretien d'embauche entre eux et avec l'offre, pour repérer les contradictions.
>
> **Modules envisagés, pas encore construits (peu d'informations, à enrichir aussi) :**
> - *ATS* : donner à la personne une idée de la correspondance entre son CV et les mots-clés d'un métier / d'une offre. Comment : à concevoir (liste des mots présents / absents / proches, suggestions de reformulation) - jamais une note globale sur la personne.
> - *Regard recruteur* : simuler le regard d'un recruteur sur une candidature (première impression, inquiétudes possibles, questions). Piste retenue : analyser une **image** du CV (capture d'écran), pas seulement le texte, pour juger la forme ; anonymisation par rectangles dessinés sur l'image.
> - *Répertoire des freins et ressources* : la personne décrit un frein (mobilité, garde d'enfants, langue, santé, confiance…) ; un assistant aide à situer le frein, et l'application garantit ensuite des ressources concrètes et vérifiées associées. Nom pas tranché.
> - *Se tenir informé (Actualités)* : donner accès à une veille utile (sites de référence vérifiés, analyses ponctuelles). Comment : à concevoir.
>
> **Format de réponse attendu** : pour chaque module, séparez clairement (a) vos propositions de **texte** et (b) vos propositions de **fonctions**, et pour chaque fonction, dites en une phrase **ce qu'elle améliore** pour la personne. N'inventez pas de contrainte technique ; ne cherchez pas à décider à notre place.
>
> **À ne pas proposer** : un score ou une note sur la personne ; une simulation d'entretien en direct ; une génération automatique de document sans validation humaine ; un plan de travail chiffré en jours ou semaines ; l'ajout d'un compte utilisateur ou d'un stockage en ligne.
>
> **PARTIE 2 - ARCHITECTURE (en plus des propositions par module).**
> Répondez aussi, en fin de réponse, à ces six questions - c'est là qu'on attend le plus de valeur :
> 1. Pour chaque module, en une ligne : que reçoit-il, que transforme-t-il, que transmet-il aux autres modules ?
> 2. Quelles règles générales de conception devraient s'appliquer à tous les modules, présents et futurs ? Par exemple : quand créer un tableau de bord, quand garder un historique, quand proposer un lien vers un autre module, quand réutiliser une information déjà saisie.
> 3. Si vous deviez supprimer un module de cette liste, lequel, pourquoi, et comment redistribueriez-vous ses fonctions dans le reste ?
> 4. Voyez-vous des incohérences, des doublons, des angles morts ? Deux modules qui devraient fusionner, un module trop large à découper, un concept qui manque entre deux modules ?
> 5. Quelles informations d'un parcours professionnel (une compétence, une expérience, une candidature, un frein, un employeur, une motivation...) devraient devenir des « objets communs » réutilisés par plusieurs modules ? Et lesquelles n'ont aujourd'hui aucun endroit naturel dans cette liste ?
> 6. Sans qu'on vous la donne, quelle philosophie lisez-vous dans l'ensemble de ces modules ? Reformulez-la en quelques principes. Certaines de vos propositions la contredisent-elles ?
>
> **Exigence sur votre réponse** : ne commentez pas la qualité de ce document, donnez seulement votre apport. Classez vos propositions par rapport valeur attendue / effort. Nommez les trois que vous abandonneriez vous-même. Signalez toute proposition qui entre en tension avec la philosophie annoncée plus haut.
>
> **Autocritique obligatoire, à la fin de votre réponse.** Notez votre réponse globale sur 20, selon quatre critères : respect strict des principes non négociables ; utilité concrète pour la personne ; apport réel au-delà de l'évident ; honnêteté sur les limites et les arbitrages. Si votre note est inférieure à 17 sur 20, refaites votre analyse avant de répondre. Dans tous les cas, même à 20 sur 20 : décrivez ce que contiendrait une version supérieure de deux points, et produisez cette version améliorée.

---

## 6. Idées transverses issues du recueil (déjà versées dans `docs/IDEES_A_RECLASSER.md`, 2026-08-28)

Rappel de ce qui a été rangé, pour mémoire : indicateur d'état du dossier sur l'accueil ; repère « étape souvent utilisée ensuite » ; indicateur de progression global (probablement à écarter) ; brouillon vocal pour Carnet et Découvrir mes compétences ; distinction visuelle avant/après dans l'encart de liens ; version résumée + dépliée sur mobile ; doctrine « APP est un système d'accumulation, pas un générateur de documents ».

---

## 7. Tri raisonné de la récolte multi-IA (2026-08-28)

Denis a soumis ce recueil (et le message de la section 5) à plusieurs assistants externes. Ils ont tous jugé le document bien écrit ; ce qui compte ici est leur apport. Tri exigeant ci-dessous : ce qu'on garde et pourquoi, ce qu'on met en réserve et pourquoi, ce qu'on écarte et pourquoi. Le détail des idées retenues est déjà recopié dans `docs/IDEES_A_RECLASSER.md` (entrée du 2026-08-28 soir) ; cette section porte le raisonnement.

### 7.1. Les 7 documents "de couche supérieure" proposés (A à G)

Un assistant a proposé puis produit 7 documents : A patron canonique, B système d'accumulation, C cartographie des modules, D design du tableau de bord, E charte éditoriale, F message IA optimisé, G plan de migration.

| Doc | Verdict | Pourquoi |
|-----|---------|----------|
| A - Patron canonique | **Écarté comme document, fondu ici** | Redit à ~90 % la section 2 de ce recueil. Seul apport réel : les règles de transition état 1 -> état 2 (quels blocs disparaissent, persistent, se déplacent) - à intégrer en section 2, pas à maintenir un 2e "patron" qui divergera. |
| B - Système d'accumulation | **En réserve, à réécrire nous-mêmes court** | Le fond est juste et important, mais la version reçue est verbeuse et répétitive. Le noyau est déjà capté (idée 7 + grille d'évaluation). À transformer un jour en une note de doctrine d'UNE page, écrite serrée, près de la Constitution. Pas prioritaire. |
| C - Cartographie des modules | **Gardé - le meilleur des 7** | Ce n'est pas de la prose mais un outil : un tableau `module | reçoit | produit | transmet | débloque`. Il force chaque module (présent ou futur) à justifier sa place, et il alimente directement les encarts "Cet outil travaille avec…" et la grille d'évaluation. À construire (un seul tableau) pendant le chantier accueil. |
| D - Design du tableau de bord | **Idée gardée, spec complète en réserve** | Le modèle "3 zones (déjà fait / en cours / à reprendre) + bandeau d'état non chiffré + une raison de revenir" est bon et cohérent avec ce que fait déjà Cohérence. Mais écrire une spec visuelle complète maintenant est prématuré : on n'a que 2 tableaux de bord, chacun avec des données différentes. On extraira le patron du vrai code au 3e. |
| E - Charte éditoriale | **En réserve, source = nos propres docs** | La version reçue est correcte mais générique, et par endroits contredit des décisions prises (elle bannit "on"/"nous" et toute exclamation de façon absolue). Nos vraies règles, plus précises, sont éparpillées dans LECONS + TACHES + mémoire, issues de vraies corrections. À consolider un jour à partir de CES sources, dans le chantier Accessibilité / socle typographique. |
| F - Message IA optimisé | **Ajouts gardés, réécriture écartée** | Les interdits ajoutés sont utiles et déjà intégrés en section 5 (pas de score, pas de simulation en direct, pas de génération auto, pas de plan en semaines, pas de compte). Le reste n'améliore pas ce qu'on a. |
| G - Plan de migration | **Checklist gardée, planning écarté** | Le découpage "semaine 1, semaine 2" est inventé (l'assistant ne connaît pas notre rythme). En revanche la liste des 8 décisions à verrouiller avant de toucher Repères / Cohérence est utile (textes des blocs "Ce que ce n'est pas", accroches, contenu des encarts, formulation du bandeau d'état, ordre des blocs, style des dépliables, position de la signature, texte du bouton). À reprendre au moment de la migration. |

### 7.2. Idées de modules nouveaux

**Gardées (versées dans le fichier des idées) :**
- **Grille d'évaluation d'un module** (reçoit / transforme / produit du réutilisable / enrichit un autre module). *Pourquoi* : coût nul, effet de levier maximal ; c'est le filtre anti-gadget pour toutes les années à venir. À promouvoir en principe écrit.
- **Famille "Décider" / "Explorer un choix"** (mettre en balance 2-3 pistes, structurer la réflexion, jamais choisir à la place). *Pourquoi* : vrai manque - la Constitution dit "préparer ses décisions" et aucun module ne le fait ; parfaitement aligné avec la philosophie.
- **Cohérence des compétences** (une compétence apparaît dans le CV et la lettre, jamais dans la préparation d'entretien). *Pourquoi* : petit, concret, réutilise un mécanisme déjà éprouvé, valeur immédiate.
- **Questions difficiles** (bibliothèque : trou, licenciement, reconversion, peu d'expérience - d'abord "ce que la personne en face cherche vraiment", puis des pistes). *Pourquoi* : contenu à forte valeur ; *mais* plutôt une ressource transversale (proche du Lexique élargi) qu'un module autonome.
- **Lexique -> centre de connaissances** (comprendre une fiche de poste, un contrat, une convention collective, les attentes recruteurs). *Pourquoi* : évolution cohérente du Lexique, déjà amorcée. *Cadre* : avancer par fiches, ne pas promettre une encyclopédie.

**En réserve (bonnes mais lourdes ou à arbitrer) :**
- **Mon histoire** (récit professionnel chronologique et narratif, socle où les autres modules puisent). *Pourquoi en réserve* : idée forte et vraiment différente d'un CV, mais gros chantier, et recouvre en partie ce que Repères + Découverte collectent déjà. Mérite sa propre conception plus tard.
- **Avant de candidater / "Cette offre me correspond-elle ?"** (lecture d'une offre : ce qui colle, ce qui manque, ce qui est compensable). *Pourquoi en réserve* : recoupe ATS (mots-clés) et le Bilan (qui prend déjà une offre) - à arbitrer contre ces deux avant d'en faire un module ; sans doute une fonction du Bilan.
- **Préparer une rencontre (générique)** : généraliser "Préparer un entretien d'embauche" au RDV conseiller / Mission Locale / centre de formation. *Pourquoi en réserve* : séduisant, mais risque de diluer le module entretien - à étudier quand on retouchera ce module, pas comme module de plus.
- **Relecture du parcours / photographie** (après plusieurs semaines : "vous avez beaucoup travaillé le CV, jamais l'entretien"). *Pourquoi en réserve, avec garde-fou* : frôle deux limites - "jamais poser de diagnostic sur la personne" (mémoire) et "ne jamais solliciter l'attention" (Constitution, 2e principe). Acceptable seulement en reflet strictement factuel, ouvert volontairement par la personne, jamais une notification, jamais une interprétation.
- **Modules de questionnement (famille)** : des modules dont la sortie est une série de questions qui font réfléchir, sans conclure. *Pourquoi en réserve* : très aligné avec le 1er principe de la Constitution ; c'est une catégorie de conception à garder en tête, pas un module précis.

**Idée d'architecture gardée :**
- **Objets métier partagés avec une identité** (compétence, expérience, offre, employeur, candidature, frein, ressource : chacun un objet unique, référencé par tous les modules, jamais dupliqué). *Pourquoi* : supprime la duplication d'information à mesure que l'app grandit ; directement pertinent pour le chantier de découpage de `js/app.js` et toute refonte de `dossier`. *Cadre* : ne jamais entreprendre isolément.

### 7.3. Idées de fonctions (modules existants et transverses)

**Gardées** (détail dans le fichier des idées, banque par module) : brouillon vocal ; épingler une note ; étiquettes de thème légères ; recherche / filtre ; "transformer en Repère" en un geste ; annuler la dernière suppression ; comparaison avant / après ; section "ce qui est déjà bien" affichée en premier ; liste à cocher des points (corrigé / pas d'accord) ; "cette phrase vient de votre CV / de votre récit" ; historique des versions ; 4 déclencheurs de récit pour les compétences ; exemple de phrase prête pour le CV ; fiche "question déstabilisante -> ce que la personne en face cherche vraiment" ; ponts explicites entre modules ; info-bulle Lexique au survol d'un mot ailleurs ; "mots souvent confondus" ; recherche par proximité dans le Lexique.
*Pourquoi* : toutes servent la reprise, la liaison entre modules, ou la lisibilité - jamais l'engagement ni le score.

**Écartées, avec la raison :**
- **Tout score / note / "heatmap" sur la personne ou son CV** -> contredit "pas de score sur la personne" et le choix délibéré du Bilan (non chiffré). On garde uniquement la version en 3 états (solide / à clarifier / à reprendre).
- **Simulation d'entretien avec un faux recruteur en direct** -> déjà un interdit ; on garde seulement l'entraînement écrit (la personne écrit sa réponse, reçoit des améliorations de formulation).
- **"Mot du jour" / mécanique de mise en avant quotidienne dans le Lexique** -> mécanique d'engagement, contraire au 2e principe de la Constitution (ne jamais solliciter l'attention). On garde "des mots utiles selon l'étape où vous en êtes", sans logique de rendez-vous.
- **Indicateur de progression global "3 outils sur 8 explorés"** -> pression sur un public à confiance fragile ; déjà signalé "probablement à ne pas faire".
- **Conseils de tenue / logistique le jour de l'entretien** -> risque d'infantilisation ; mis de côté, à ne reprendre que si formulé avec beaucoup de soin.
- **Plans d'action chiffrés en jours ou semaines** -> aucun assistant ne connaît le rythme réel du projet.

**Routées vers un autre chantier (donc pas "nouvelles") :**
- Mode simple / avancé, mode sombre, masquer les icônes -> chantier Accessibilité.
- Recherche globale dans toute l'application -> chantier "barre de recherche élargie / Porte d'entrée".
- Reprise "là où j'en étais", activité récente, zone "à faire ensuite" -> chantier accueil / tableaux de bord.

### 7.4. Pour la prochaine récolte : monter la barre d'exigence

Constat de Denis : les assistants ont surtout complimenté le document, et rendu des listes plates. Pour le prochain aller-retour, demander explicitement dans le message :
- **classer** ses propres propositions par rapport valeur / effort ;
- **nommer les 3 propositions qu'il abandonnerait** lui-même ;
- **signaler toute proposition qui entre en tension** avec la philosophie annoncée (les 2 principes, "pas de score", "pas d'engagement", public fragile) ;
- pas de compliment sur le document, uniquement l'apport.
Cela force l'auto-critique au lieu d'une liste où tout se vaut.
