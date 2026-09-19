# Chantier module Ressources (répertoire des freins) - recueil de conception

**Statut : recueil de travail, RIEN à coder, RIEN de décidé.** Créé le 2026-08-28.
Complète la mémoire assistant `chantier-repertoire-freins-ressources` et `docs/IDEES_A_RECLASSER.md`.
Principe déjà acté : l'assistant classe / reformule le frein (fiable) ; le code garantit les ressources (déterministe, jamais d'adresses ou de numéros générés).

Contexte : PCGI 87 (partenaire dans lequel APP est intégrée) a déjà un annuaire riche (200+ structures Haute-Vienne), des pages Aides et Urgences. APP ne reconstruit pas - elle fait la couche que PCGI 87 ne fait pas, et renvoie vers eux pour l'exhaustif.

---

## 1. Le modèle à 3 niveaux

### Niveau 1 - Urgences (la brique la plus rentable)
Numéros nationaux + besoins vitaux. **Stable, national, zéro maintenance, vital pour le public fragile.** Modèle direct : la page "Urgences" de PCGI 87.
- Urgences vitales : 15 (SAMU), 17 (Police), 18 (Pompiers), 112 (Europe), 115 (SAMU social / hébergement).
- Besoins fondamentaux : urgence alimentaire -> CCAS / MDS ; hébergement -> 115 (appeler chaque matin, insister si famille) ; hygiène -> accueils de jour (Secours Catholique, Croix-Rouge).
- Urgences financières : coupure énergie -> MDS, FSL Maintien ; expulsion -> ADIL + CCAS ; zéro ressource (attente RSA) -> CCAS.
- Violences & protection : 3919 (violences conjugales), 119 (enfance en danger), 3114 (prévention suicide).

Bouton "Appeler" cliquable (`tel:`) sur mobile. Aucun texte long. C'est un filet de sécurité, pas un cours.

### Niveau 2 - Frein -> bonne porte (le coeur du module, ce que PCGI 87 ne fait pas)
~10 freins (mobilité, garde d'enfants, logement, santé / handicap, langue, endettement / administratif, alimentaire, hébergement, matériel, judiciaire). Pour chacun :
- une définition simple (qu'est-ce qui constitue ce frein) ;
- comment on le lève (les grandes pistes) ;
- qui voir (2-3 types de structures / professionnels) ;
- 3-4 ressources clés **vérifiées** (nationales + départementales) ;
- une fiche imprimable "à apporter à mon rendez-vous conseiller".

L'assistant intervient seulement pour situer / reformuler ce que la personne décrit ("je n'ai personne pour garder mon fils" -> frein "garde d'enfants"). Le reste est du code déterministe.

Charge tenable : ~10 freins x ~5 ressources = ~50 pointeurs vérifiés, pas 200 fiches structure.

### Niveau 3 - Annuaire exhaustif = des renvois, pas du contenu
Une carte courte "Pour la liste complète des structures près de chez vous", avec 2-4 liens sortants et une ligne "ce que vous y trouverez" :
- **PCGI 87 - Annuaire des Ressources** (200+ structures Haute-Vienne, par type) - mis en avant pour un usager du 87 ;
- **DORA** (dora.inclusion.beta.gouv.fr) - national, structures d'insertion par territoire ;
- **Conseil départemental** (CD24 / CD87) - annuaire social départemental ;
- éventuellement : annuaire France Services, annuaire Mission Locale, annuaire Cap Emploi.

Territoire-conscient (voir `docs/CHANTIER_SE_TENIR_INFORME.md` section 14) : le build 87 montre PCGI 87 d'abord ; le build 24 montre DORA + CD24 d'abord. Maintenance = un contrôle de liens morts de temps en temps.

---

## 2. Comment la barre de recherche renvoie vers l'annuaire

Le module Ressources n'est pas une page qu'on parcourt : on y arrive par un besoin. La barre de recherche élargie est la porte d'entrée. On ajoute à son mécanisme existant (`rechercherBaseConnaissances()` + `normaliserTexte()`, `data/metiers.js`) une **nouvelle catégorie de déclencheurs : "structure / annuaire"**.

**Requêtes qui doivent faire apparaître le renvoi annuaire** (exemples) :
- des noms / types de structure : "mission locale", "cap emploi", "france travail", "CCAS", "MDS", "france services", "épicerie sociale", "accueil de jour", "structure d'insertion", "chantier d'insertion", "recyclerie", "point numérique", "médiathèque"... ;
- une intention de lieu : "où trouver une association", "structure près de chez moi", "un endroit pour faire mon CV", "où aller pour...", "quelle structure pour..." ;
- un nom de structure précise qu'APP n'a pas en fiche (ex. "Association LIRE", "BFM Aurence") -> "Nous n'avons pas de fiche sur cette structure. Vous la trouverez dans l'annuaire : [lien]".

**Ce qui NE déclenche PAS le renvoi** (reste dans APP) :
- "faire mon CV" -> ouvre l'outil CV ;
- "qu'est-ce qu'une mission locale" -> fiche Lexique d'abord, avec le lien annuaire seulement en dessous ("pour en trouver une près de chez vous -> annuaire") ;
- "chômage", "ça recrute où" -> fiche "Comprendre le monde du travail".

**Règle d'affichage** (cohérente avec la règle déjà actée "un mot du Lexique ne redirige jamais automatiquement") :
1. si APP a une fiche (Lexique ou Ressources) sur le sujet -> l'afficher en premier ;
2. en dessous, un encart secondaire : "Pour trouver [ce type de structure] près de chez vous -> [Annuaire complet]".
Jamais un renvoi sec qui donne l'impression que l'app ne sait rien.

**Mécanique** : le résultat s'affiche dans l'encart flottant déjà existant (même UI que "résultat trouvé" / "aucun résultat"). Le lien annuaire est filtré par la config `DEPARTEMENT` du build.

**Données** : un fichier partagé (ex. `data/annuaires.js`) : par territoire (national / région / département), une liste `{ nom, description, url }`. Réutilisable par la barre de recherche, par le niveau 3 du module Ressources, et par l'encart "Cet outil travaille avec...". C'est une application concrète de l'idée "objets métier partagés" (`docs/IDEES_A_RECLASSER.md`).

---

## 2bis. Verdict doublon et changement de dimension (2026-08-28)

Question posée franchement par Denis : ce module fait-il doublon avec PCGI 87 ? **Oui, dans sa forme "répertoire / catalogue".** PCGI 87 couvre déjà, et mieux, l'Annuaire (200+ structures), les Aides (RSA, FSL, FAME, Mobili-Jeune, APRE, Chèque énergie...) et les Urgences (numéros, besoins fondamentaux, financières). Un module APP qui **liste** des ressources duplique ces trois pages.

**Ce que PCGI 87 ne fait PAS** : la traduction "problème vécu -> bonne porte" pour quelqu'un qui n'a pas le vocabulaire. Leurs pages supposent qu'on sait qu'il faut demander le "FSL Maintien" ou dans quelle catégorie chercher. La personne dit "on va me couper l'électricité" - elle ne sait pas que ça mène à MDS + FSL Maintien.

**Décision : le module change de dimension.** De **"répertoire"** (un catalogue, ce qu'est PCGI 87) vers **"orienteur de freins" / "traducteur de situation"**.
- **Rôle** : comprendre ce qui bloque la personne, dans ses mots, et la diriger vers la bonne porte. Pas lister, router.
- **Mission** : réduire l'écart entre "j'ai un problème" et "je sais à quelle porte frapper".
- **Objectif** : qu'une personne qui ne sait pas naviguer un annuaire institutionnel atteigne quand même la bonne structure, avec les bons mots, et quelque chose de concret à apporter à son prochain rendez-vous.
- **Nom** : pas "Répertoire" (mot de catalogue). Pistes : "Ce qui me freine" (déjà la rubrique choisie dans le rapport Regard extérieur), "Lever un frein", "Par où commencer", "Trouver la bonne porte".
- Les 3 niveaux de la partie 1 tiennent toujours, mais recadrés : niveau 1 Urgences = filet de sécurité compact (avoir les numéros en double avec PCGI 87 n'est pas un problème, c'est comme un extincteur) ; niveau 2 = le coeur, la traduction ; niveau 3 = renvoi pur vers PCGI 87 / DORA.

**Cadre non conflictuel** : APP est déjà listée dans les "Plateformes & Outils" de PCGI 87 sous "ERIP - TRE (CV & parcours)". PCGI 87 envoie les gens vers APP pour le travail CV / parcours ; APP renvoie vers PCGI 87 pour l'annuaire. La boucle est complémentaire par construction. À présenter exactement comme ça aux responsables.

**"Guides" de PCGI 87 = confirmé par Denis (2026-08-28)** : c'est le catalogue d'aides déjà vu (minima sociaux, logement / énergie, mobilité / formation : RSA, Prime d'activité, FSL, FAME, Mobili-Jeune, AGE, Permis à 1 euro, APRE, Chèque énergie...). Donc PCGI 87 possède entièrement l'espace "catalogue" : Guides + Aides + Annuaire + Urgences.

---

## 2ter. Pas un module, un bloc de données + du câblage (2026-08-28)

En relisant, Denis constate : "j'étais trop enthousiaste à l'idée de faire un nouveau module, mon module s'avère pas très utile". **Il a raison sur la forme, pas sur l'idée.**

- Ce qui n'est **pas utile** : un module autonome, avec sa page, sa navigation, son tableau de bord, qui **catalogue** des ressources en concurrence avec les Guides / Aides / Annuaire / Urgences de PCGI 87.
- Ce qui **reste utile et n'est PAS redondant** : le **bloc de données frein -> ressources** (~10 freins : définition simple + comment lever + qui voir + 3-4 pointeurs vérifiés), câblé dans **trois endroits qui existent déjà** :
  1. **le rapport Regard extérieur, rubrique "Ce qui vous freine"** - son foyer d'origine ; l'assistant classe le frein exprimé, le code fournit les pistes (découplage déjà acté) ;
  2. **Mes Repères** - un frein exprimé peut devenir un Repère, qui **porte ses pistes** ; la personne le retravaille dans le temps, en parle à son conseiller. C'est l'accumulation / le patrimoine - **unique à APP, PCGI 87 n'a aucun espace personnel** ;
  3. **la barre de recherche** - "je n'ai pas de voiture", "on va me couper l'électricité" -> la fiche frein correspondante + un renvoi vers l'annuaire / les Urgences.
- Optionnel et quasi gratuit si le bloc existe : une **vue-liste légère "Ce qui me freine"** (les ~10 freins cliquables), pas un module avec tout l'appareillage.

**C'était en fait la vision d'origine de Denis** (mémoire `chantier-repertoire-freins-ressources` : "bloc de données réutilisable un peu partout sur le site, pas propre au seul rapport"). L'enthousiasme l'avait gonflée en "nouveau module". Revenir au bloc de données = moins de travail ET pas de doublon.

**Pourquoi ce n'est pas redondant avec PCGI 87** : PCGI 87 fait le catalogue (qui existe, où, comment joindre). APP fait (a) la traduction "ce que je vis -> le bon type de porte" dans les mots de la personne, et (b) le suivi personnel dans le temps via les Repères. Ni l'un ni l'autre n'est chez PCGI 87.

Le niveau 1 "Urgences" (partie 1) reste pertinent comme filet de sécurité compact, où qu'il vive dans l'app (accueil, ou en tête de la vue "Ce qui me freine").

---

## 4. L'interface "frein identifié par l'assistant" -> "ressources" (2026-08-28)

Rappel de l'origine (Denis) : le besoin est né pendant le module **Regard extérieur**. On voulait que le prompt donne des solutions à des freins. Constat : faire recommander des sites par l'assistant est peu fiable. Décision : l'assistant **identifie** seulement le frein ; APP fournit les ressources, en dur.

**Le mécanisme de communication entre modules = un vocabulaire fermé de codes de frein, partagé.**

1. **Une liste fermée de codes de frein** - elle EXISTE DÉJÀ dans `prompts/regard-exterieur.md` (section "Freins identifiés à partir des Repères"), **17 codes** : `alimentaire`, `hebergement`, `mobilite`, `materiel`, `sante`, `handicap`, `endettementAdministratif`, `emploi`, `formation`, `gardeEnfants`, `judiciaire`, `langue`, `illettrisme`, `illectronisme`, `discrimination`, `violences`, `addiction`. Le prompt renvoie déjà `freinsIdentifies: [{ code, justification }]` et dit déjà explicitement "les ressources associées à chaque frein seront affichées séparément à partir du code, pas du texte". **Le côté prompt est fait.** Ce qui manque : `data/freins.js` (le bloc ressources indexé par ces 17 codes, source unique de vérité côté données), le rendu, la couche synonymes, le câblage Repères.

2. **Le bloc frein -> ressources**, indexé par ces codes exacts :
   `freins[code] = { titre, definition, pistesDeReflexion: [...], commentLever, quiVoir: [...], ressources: [{ nom, url, verifieLe }] }`

3. **Le prompt Regard extérieur** est contraint : "si tu identifies un frein, classe-le uniquement avec ces libellés : [les noms lisibles des ~10 codes]. N'invente pas de catégorie. Ne recommande aucun site." Il renvoie par exemple `freinsIdentifies: ["mobilité", "endettement / administratif"]`.

4. **Un parseur déterministe** (code, dans le module Regard extérieur) remappe les libellés renvoyés vers les codes canoniques (tolérance casse / accents / synonymes via `normaliserTexte`). Un libellé qui ne mappe pas est ignoré. C'est le découplage "l'assistant classe, le code garantit".

5. **Le rendu** : pour chaque code identifié, le rapport affiche l'entrée du bloc (définition, pistes de réflexion, sites vérifiés, qui voir). Jamais les recommandations de l'assistant.

6. **Le lien avec Mes Repères** : quand la personne transforme "ce frein" en Repère, le Repère **stocke le code de frein** (pas seulement du texte libre). Partout où le Repère est affiché, APP re-rend les ressources à jour pour ce code (toujours fraîches : le bloc est la source de vérité, le Repère ne porte que le code).

7. **Le lien avec la barre de recherche** : même vocabulaire. "je n'ai pas de voiture" -> mappe vers `mobilite` -> même entrée du bloc.

**La seule discipline à tenir** : les 17 codes du prompt (`prompts/regard-exterieur.md`) et les clés de `data/freins.js` doivent rester synchrones. Au minimum un test qui vérifie qu'elles correspondent (voir [[LECONS]] sur les prompts fourre-tout et la fragilité des sorties IA non bornées).

### 4bis. La couche synonymes (pour la barre de recherche)

Chaque entrée de `data/freins.js` porte un champ `synonymes: [...]` : les mots qu'une personne tape vraiment. Ex. `mobilite.synonymes = ["voiture", "pas de voiture", "permis", "pas de permis", "conduire", "locomotion", "déplacement", "se déplacer", "transport", "bus", "isolé", "rural", "loin de tout"]`. La barre de recherche applique `normaliserTexte` et matche contre ces tableaux -> code de frein -> fiche.

Ce n'est **pas un lexique séparé** : c'est un champ sur chaque frein, dans le même fichier que les données du frein. À distinguer de la vraie fiche Lexique "Mobilité" (définition / référence) : les deux coexistent. "mobilité" tapé peut montrer la fiche Lexique ET (si formulé comme un problème) la fiche frein ; "pas de voiture" ne déclenche que le frein.

**Prudence sur les freins sensibles** (`violences`, `addiction`, `discrimination`, `sante`, `handicap`) : le prompt les encadre déjà ("uniquement si la personne l'exprime elle-même"). Pour la barre de recherche, ne jamais renvoyer un libellé brutal ("vous avez le frein ADDICTION") - formulation douce ("des ressources existent sur ce sujet"). Les plus sensibles (`violences`, `addiction`) ne figurent sans doute pas dans la vue-liste en accès libre, seulement via Regard extérieur ou une recherche explicite et prudente.

---

## 3. Ce qu'on écarte

- Reconstruire un annuaire de structures dans APP - le leur est meilleur et maintenu, et il ne faut pas géo-verrouiller APP sur un département.
- Un prompt qui "cherche des structures" - risque d'adresses / numéros inventés, dangereux pour ce public.
- Un renvoi automatique vers l'annuaire dès qu'un nom de structure est tapé, sans montrer d'abord ce qu'APP sait.
