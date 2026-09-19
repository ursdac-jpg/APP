# Chantier (en attente) — finir les stratégies de CV du Composeur, puis les piloter par l'objectif de la personne

> Ouvert le 2026-09-18. **En attente** — priorité au chantier actif
> `docs/CHANTIER_MISE_EN_PAGE_CV_2026-09-18.md`. Mode A pour la suite (maquette avant code sur la
> Phase 2, doute d'interface réel). Aucun code écrit à l'ouverture de ce document.
>
> Origine : en comparant APP à Novoresume (site de création de CV) pendant l'analyse CVDesignR du
> 2026-09-18, découverte que la fonction « CV par compétences » que Novoresume vend comme
> différenciant existe **déjà en partie** chez APP, à l'état de chantier interrompu.
>
> Ce document est le **contrat figé** de ce chantier. Il rassemble ce qui a été vérifié dans le
> code (pas des suppositions) pour que la prochaine session (y compris sur l'autre compte Claude)
> reprenne exactement où on s'est arrêté.

---

## 1. Constat vérifié — l'état réel du chantier existant

`modules/cv-composeur/composeurStrategies.js` définit **3 stratégies** de composition du CV
(`STRATEGIES_CV`) : `chronologique`, `mixte`, `parCompetences`. Une règle `COMPOSEUR_REGLE_R005`
choisit automatiquement l'une des trois selon le profil (via `calculerScoresStrategies()`,
`modules/decouverte-competences/decouverteStrategie.js`).

**Ce qui fonctionne réellement aujourd'hui** (vérifié dans `composeurComposition.js` ligne ~309) :
la stratégie choisie pilote **l'ordre des rubriques** du CV (`strategieCV.ordreRubriques`). Par
exemple, pour « Par compétences », les compétences passent avant les expériences.

**Ce qui ne fonctionne PAS, vérifié par recherche exhaustive** : chaque stratégie déclare aussi
`variantesParRubrique` (ex. `parCompetences` prévoit `competences: 'groupeParTheme'`,
`experiences: 'ligneCompacte'` ; `mixte` prévoit `competencesCles: 'bandeauCompetencesCles'`) et
`reglesSpecifiques`. **Ces deux champs ne sont lus nulle part ailleurs dans tout le dossier
`cv-composeur`** (recherché, seules leurs propres déclarations remontent). Concrètement :
- Choisir « Par compétences » aujourd'hui ne change **que** l'ordre — le rendu visuel des
  compétences et des expériences reste identique à la stratégie chronologique. Aucun regroupement
  par thème, aucun format compact.
- La stratégie « Mixte » perd carrément sa rubrique différenciante : `competencesCles` est
  filtrée en silence dans `composeurComposition.js` (« les rubriques dont aucun composant n'existe
  encore... sont filtrées, jamais un plantage, jamais un encart vide ») parce que
  `bandeauCompetencesCles` n'existe pas dans `composeurComposants.js`. Un profil qui déclenche
  « Mixte » obtient donc une présentation quasiment identique à « Chronologique ».

**Ce n'est pas un mode dégradé volontaire et fini** — l'en-tête du fichier se décrit lui-même comme
« Étape 2 du plan de développement... les étapes 3 à 5, pas encore commencées ». Le fichier existe
depuis l'état initial du dépôt (commit `ebff7cb`, 2026-07-22) et n'a reçu qu'une seule retouche
depuis (`6ed5bd5`, 2026-08-28, correctif « Logiciels et outils », sans rapport avec les variantes).
**Le document de conception cité en commentaire, `composeur-strategies-cv-v2.md`, n'existe plus
dans le dépôt** (recherché, introuvable) — le détail original des étapes 3 à 5 est perdu, il faudra
reconcevoir cette partie plutôt que la retrouver.

---

## 2. Deuxième constat — une promesse déjà écrite dans l'interface, jamais tenue

L'écran « Votre objectif » (parcours guidé) propose déjà les choix `offre / spontanée /
reconversion / stage / alternance / pmsmp` (`js/app.js` ~ligne 4611). **L'option Stage porte
littéralement la description : « CV adapté à une recherche de stage. »**

Or `calculerScoresStrategies()` ne lit que `objectifReconversion`, un simple booléen dérivé de
`dossier.objectif === 'reconversion'`. Les réponses `stage`, `alternance` et `pmsmp` — que la
personne a **déjà données** à cet écran — n'influencent **jamais** la présentation du CV
aujourd'hui. La promesse affichée dans l'interface n'est pas tenue par le moteur.

**Décision de principe pour la suite (2026-09-18)** : ne jamais reposer cette question à la
personne (elle y a déjà répondu à « Votre objectif ») — faire lire au moteur une réponse qu'il
ignore depuis toujours, pas créer un nouvel écran « choisissez le type de votre CV ». Cohérent avec
la règle déjà appliquée ailleurs dans le projet (chantier L1) : ne jamais redemander un fait déjà
connu.

**Précédent à réutiliser** : `theme.strategieForcee` permet déjà à la personne d'imposer une
stratégie précise, par-dessus la recommandation automatique — mais uniquement pour le thème Word
« Projet XXL ». Le principe (« le moteur conseille, la personne décide ») existe donc déjà,
seulement pas de façon universelle.

---

## 3. Les deux couches à ne pas confondre

**Couche A — la structure et le rendu du CV** (ce qui existe déjà, à finir) :
les 3 stratégies pilotent l'ordre des rubriques et devraient piloter leur rendu visuel
(regroupement par thème, format compact...). Extension naturelle : élargir les signaux d'entrée de
`calculerScoresStrategies()` pour qu'elle lise `stage`/`alternance`/`pmsmp`, pas seulement
`reconversion`.

**Couche B — des « axes » de contenu et de conseil différenciés selon l'objectif** (idée nouvelle
de Denis, 2026-09-18) : au-delà de la structure, adapter les conseils/la mise en avant de contenu
selon que la personne est en reconversion, en recherche de stage, avec une forte expérience, etc.
**Ça n'existe pas du tout aujourd'hui** — les 3 stratégies ne touchent jamais au contenu des
conseils, seulement à l'ordre des blocs. Cadrage à part entière à faire (Mode A, maquette), une
fois la Couche A terminée.

**Ordre recommandé, décidé le 2026-09-18** : finir la Couche A (ce qui est commencé et non tenu)
avant d'élargir les signaux d'entrée ou d'attaquer la Couche B — sinon on empile une nouvelle
couche sur une fondation qui ne rend déjà pas ce qu'elle promet.

---

## 4. Plan détaillé

### Phase 1 — Finir la Couche A existante (priorité)

1. **`groupeParTheme`** (variante de rendu des compétences pour « Par compétences ») :
   construire le composant dans `composeurComposants.js`. Contrainte déjà actée dans
   `reglesSpecifiques` de la stratégie (`composeurStrategies.js` ligne 71-75) : le regroupement par
   thème avec preuve (expérience à l'appui) ne s'applique que si le dossier vient du module
   Découverte (`illustreParSiOrigineDecouverte`) ; sinon, mode dégradé explicite = regroupement par
   thème sans lien de preuve. **Ne jamais reconstituer un lien par rapprochement de mots-clés
   deviné** (règle `aucuneReconstitutionArtificielleDuLien`, contrat §3.1 — sécurité déjà actée,
   à ne pas oublier en codant).
2. **`ligneCompacte`** (variante de rendu des expériences pour « Par compétences ») : définir
   précisément ce que « compact » signifie ici (probablement : une ligne par expérience au lieu du
   format multi-lignes actuel) — à maquetter avant de coder, doute d'interface réel.
3. **`bandeauCompetencesCles`** (variante pour « Mixte ») : construire ce composant en priorité
   dès que possible — c'est la rubrique qui manque *complètement* aujourd'hui pour cette stratégie,
   pas seulement un rendu différent.
4. Vérifier que `strategieForcee` (aujourd'hui Projet XXL uniquement) peut s'étendre aux autres
   thèmes Word sans régression, pour préparer l'exposition plus large de la Couche A à la Phase 2.

### Phase 2 — Élargir les signaux d'entrée (Couche A)

- Étendre `calculerScoresStrategies()` (`decouverteStrategie.js`) pour lire l'`objectif` complet du
  dossier (`stage`, `alternance`, `pmsmp`), pas seulement le booléen `objectifReconversion`.
- **Question ouverte, à trancher avec Denis avant de coder cette phase** : stage/alternance/pmsmp
  doivent-ils pousser vers « Par compétences » comme la reconversion (même trajectoire de score),
  ou mériter leur propre pondération distincte ? Le "pourquoi" diffère (reconversion = compétences
  transférables d'un autre métier ; stage/alternance = formation en cours, peu d'historique
  pro) — même si la stratégie structurelle choisie finit par être la même aujourd'hui, la Couche B
  aura besoin de cette distinction pour proposer des axes différents.

### Phase 3 — Couche B : axes de contenu différenciés par objectif

**Pas cadrée à ce stade — à ouvrir en Mode A, avec maquette, une fois les Phases 1 et 2 terminées.**
Questions à poser à ce moment-là : quels axes précis par objectif (reconversion / stage /
alternance / forte expérience / pmsmp) ? Sous quelle forme (conseils affichés, contenu
pré-sélectionné, les deux) ? Est-ce que ça touche uniquement le Composeur ou aussi le moteur PDF ?

---

## 5. Méthode

- Un commit par sous-étape, `npm test` (les fonctions pures de `decouverteStrategie.js` et
  `composeurStrategies.js` sont testables Node — vérifier la couverture existante avant de coder)
  **et** test navigateur obligatoire pour tout ce qui touche au rendu réel (`composeurComposants.js`,
  `composeurComposition.js`, `composeurRender.js`).
- Ne jamais commencer la Phase 2 avant que la Phase 1 soit terminée et validée par Denis — c'est la
  raison d'être de l'ordre choisi au §3.
- Ce document se met à jour au fil de l'eau (statut de chaque phase, décisions prises en cours de
  route), comme les autres chantiers du projet.
