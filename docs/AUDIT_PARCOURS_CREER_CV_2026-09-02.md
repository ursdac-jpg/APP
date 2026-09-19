# Audit du parcours « Créer un nouveau CV » — retours Denis du 2026-09-02

> Produit à la demande de Denis pendant qu'il parcourt le parcours (retours par lots ; il s'est
> arrêté à la page « Action »). Pas d'implémentation dans ce document : notation, améliorations,
> note projetée, et réponses à ses questions d'architecture. Les décisions se prennent ensemble.

---

## 1. Les deux bugs signalés

### 1a. Étape « faite » soulignée dans la barre du module — **CORRIGÉ** (`f17e63a`)
L'étape déjà validée est cliquable (retour en arrière). Elle était rendue en `<a>` → soulignée par
défaut. Ajout de `text-decoration:none` : elle reste cliquable, plus soulignée. Fait.

### 1b. Pilules « 0 / 3 », « 0 / 1 »… qui ne « s'illuminent pas en rouge » à l'arrivée sur « Mon projet »
**Ce n'est pas une régression.** Vérifié dans le code et au navigateur : à l'arrivée, les pilules
portent bien la classe rouge (`bloc-erip-compteur-zero`, `color: var(--danger)`) **et** l'animation
`pulseLumiereRouge`. Mais cette animation est **finie** : `animation: … 1.8s … 6` → elle pulse
6 fois (~11 secondes) puis s'arrête. Les pilules **restent rouges** (couleur), elles ne **pulsent**
plus. Quand tu fermes un bloc, la page se re-rend → nouveaux éléments → l'animation rejoue 11 s →
tu revois le mouvement, d'où l'impression que « ça se remet à fonctionner ».
Mes changements (barre d'étapes) ne touchent ni `blocERIP` ni ce CSS. **À décider** dans la
refonte de « Mon projet » : pulse infini ? juste un texte « à compléter » ? (voir §2).

---

## 2. Notation des pages du parcours « Créer un nouveau CV »

Note **/20**. « Note cible » = ce qu'on atteindrait avec les améliorations de la colonne du milieu.

| Page (route) | Note | Améliorations proposées | Note cible |
|---|---|---|---|
| **Objectif** (`objectif`) — « Quel est votre objectif ? », 6 cartes | **14** | Cartes un peu grosses → densifier pour les petits écrans de portable. Barre du module OK depuis 3a. Rien de cassé, page saine. | **16** |
| **Votre parcours** = **Activités / Actions / Environnement** (`activites` / `actions` / `environnement`) — 3 écrans multi-sélection quasi identiques | **11** | **Les regrouper en UNE page à sections** (= Phase 3b) : passer de 3 écrans à 1, ça supprime la sensation de tunnel répétitif. Densifier les cartes. Libellés plus concrets (« Avec qui ou avec quoi travailliez-vous » est abstrait). | **15** |
| **Attentes / Valeurs** (`valeurs`) — « Qu'est-ce qui est important pour vous dans un travail ? », cartes de valeurs | **12** | Tel quel, tout le monde coche tout → peu discriminant. (a) Densifier les cartes. (b) Chaque notion → **fiche Lexique « Conditions de travail »** (voir §3.6). (c) Rendre les valeurs choisies **« récupérables » comme repères** (ancrage sur cette page) pour un futur travail d'argumentaire / négociation. (d) Option : demander de **classer le top 3** parmi les cochées. | **17** |
| **Mon projet** (`projet`) — 6 blocs dépliants « Vous / Parcours / Expériences perso / Projet / Compléments / Candidature » | **10** | **La plus lourde du parcours.** Déjà une page dépliante (bon), mais 6 blocs d'un coup = écrasant. Hiérarchiser franchement obligatoire vs facultatif (2 blocs vraiment requis, le reste optionnel et replié). Pulse rouge : la rendre continue OU la remplacer par un texte « à compléter » clair. Réduire la densité (marges, tailles). Encart vidéo : le replier. | **15** |
| **Faire le point** (`revelation`) — « Faisons le point » | **11** | Gros bloc de texte d'intro pour une page dont le cœur utile est ailleurs (métier cible, métiers suggérés, analyse profil). **Couper le texte d'intro** à 1-2 phrases. Mettre en avant l'action réelle de la page : **choisir / confirmer le métier cible**. Condenser les 4 accordéons. | **15** |
| **Action** (`resultats`) — « Passons à l'action » | **9** | Voir §3.1 à §3.5 : retirer le faux choix « choisissez votre action », renommer la page (cohérent avec la barre : « Créer mon CV »), remonter la barre de navigation, refondre le bloc « informations transmises à l'assistant », retirer la sous-barre d'étapes (barre dans barre), proposer lettre + entretien **à la fin** (après export CV) et non au début. | **16** |

**Moyenne actuelle ≈ 11 / 20. Cible ≈ 15,5 / 20** sans refonte totale, juste les ajustements ci-dessus + Phase 3b.

---

## 3. Réponses à tes questions d'architecture

### 3.1 Page « Action » : le faux choix « choisissez votre action »
**Tu as raison.** Quand on arrive du parcours CV, seul « Créer votre CV » est actif ; Lettre et
Entretien sont grisés (CV pas fini). Ce n'est pas un choix.
**Reco :** retirer le sélecteur de document quand on arrive d'un des 3 parcours « Mes documents »
(exactement ce qui est déjà fait pour Découverte via le drapeau `depuisDecouverte` dans
`pageResultats` — il suffit de généraliser à `pret` / `maj` / `nouveau`). Le titre devient
**« Créer mon CV »** (cohérent avec la barre). Le rectangle « choisissez votre action » saute.
*Impact code :* la branche existe déjà pour Découverte, on l'élargit. À vérifier : les autres
entrées de `pageResultats` (« Mon projet », import de session) ne doivent pas être affectées.

### 3.2 Barre de navigation « dans » la barre de navigation
Sur la page Action du parcours guidé, il y a **la barre d'étapes du module** (en haut) **et** une
**sous-ligne CV / Lettre / Entretien** (`ligneEtapesAction`). C'est bien une barre dans une barre.
La branche Découverte la supprime déjà. **Reco :** la supprimer aussi pour les 3 modes « Mes
documents » (même généralisation qu'en 3.1).

### 3.3 Barre de navigation trop basse
La page Action a plus de marge en haut que les autres modules. **Reco :** remonter la barre
d'étapes au même niveau que Bilan / Cohérence (marge du haut alignée). Ça remonte toute la page.
Petit correctif CSS.

### 3.4 Bloc « informations transmises à l'assistant » — confusant et redondant
Deux problèmes : (a) « seront transmises » laisse croire à un envoi déjà fait ou automatique ;
(b) on a déjà tout saisi à « Mon projet », pourquoi un 2ᵉ écran ?
**Reco :** garder le principe (transparence : montrer ce qui part), mais :
- reformuler : « **Avant l'envoi**, vous relirez exactement le texte copié. Rien n'est envoyé sans
  votre geste. »
- le déplacer sur **l'écran de choix d'assistant** (juste avant l'action), pas en tête de page.
- ne pas re-demander d'informations : c'est un **récapitulatif** en lecture seule, avec un lien
  « corriger » qui ramène au bon bloc de « Mon projet ».

### 3.5 Refondre toute la page « Action » en page dépliante (comme les autres modules) ?
**Pour :** cohérence visuelle ; une seule page ; moins de changement de contexte.
**Contre :** la page Action porte aussi tout le circuit de génération / aperçu / export (Composeur,
PDF, Word) — c'est beaucoup, une page dépliante deviendrait énorme ; le risque technique est réel
(c'est le cœur du rendu documentaire).
**Reco :** **refonte partielle**, pas totale. Retirer le faux choix + la sous-barre (3.1/3.2),
remonter la barre (3.3), refondre le bloc « infos transmises » (3.4), et ajouter les raccourcis de
fin (3.7). Ça règle 80 % du ressenti sans toucher au moteur de rendu.

### 3.6 « Créer un CV » : tout mettre sur une seule page dépliante ?
**Pour :** cohérence avec Bilan / carte 3 / carte 2 ; moins de tunnel.
**Contre :** c'est le parcours **le plus long** (7-8 écrans) ; tout empiler sur une page = une page
très longue, potentiellement écrasante pour le public cible ; risque technique **élevé** (touche
`pageObjectif`, `pageCartes` ×4, `pageProjet`, `pageRevelation` = le cœur historique de l'app) ;
les écrans « catalogue » (activités/actions) sont des multi-sélections denses qui se prêtent mal à
un accordéon.
**Reco :** **refonte progressive**, pas une méga-page :
1. **Phase 3b** : regrouper Activités / Actions / Environnement / Attentes sous **UNE** page
   « Votre parcours » à sections. Gros gain (4 écrans → 1), risque circonscrit à `pageCartes`.
2. Alléger « Faire le point » (couper le texte).
3. Refonte partielle de « Action » (3.5).
4. « Mon projet » reste une page dépliante (déjà le cas), on l'allège.
Résultat : le parcours passe de ~8 écrans à ~5 (Objectif → Votre parcours → Mon projet → Faire le
point → Créer mon CV), ce qui **correspond exactement à la barre d'étapes du module**. On garde
des étapes distinctes (un CV « de zéro » a besoin d'un rythme), sans le tunnel.

### 3.7 Lettre et entretien : accès trop tardif
Aujourd'hui : Entretien exige que le CV **et** la lettre soient finis. Deux parcours entiers avant
d'y accéder. **Tu as raison, ce n'est plus d'actualité** (les 3 ne sont plus imposés ensemble).
**Reco :**
- **À la fin du CV** (après export) : une petite section « Et maintenant ? » avec **deux boutons**
  clairs — « Préparer ma lettre de motivation » / « Préparer mon entretien » — **tous les deux
  accessibles** (l'entretien ne dépend plus de la lettre).
- **+ une phrase** : « Vos informations sont enregistrées : votre lettre et votre entretien
  repartent de là, sans rien ressaisir. »
- À la fin de la lettre : raccourci « Préparer mon entretien ».
- Concrètement : `desactiveEntretien = !dossier.lettreTerminee` devient `!dossier.cvTermine` (ou
  simplement : accessible dès que le CV est fait).
Message **et** raccourcis : les deux, mais légers (une section discrète en bas de l'écran
d'export, pas un gros bandeau).

### 3.8 Garder le mécanisme « choix de cartes » (multi-sélection) ?
**Oui, on le garde.** Il est correct et bien fait. Deux ajustements transverses (toutes les pages à
cartes) :
- **Densifier** : cartes plus petites, grille plus serrée → tenir sur un écran de portable sans
  scroller à l'infini. Passe CSS sur `.carte` / la grille de `pageCartes`.
- Sur « Attentes / Valeurs » : ajouter l'ancrage repère (§3.9) et le lien vers le Lexique (§3.10).

### 3.9 Où poser des repères dans le parcours « Créer un CV » ?
Pas sur toutes les pages. Points d'ancrage pertinents :
- **« Attentes / Valeurs »** : ancrer un repère sur « ce qui compte pour moi au travail »
  (matière première pour défendre / négocier une condition plus tard).
- **« Faire le point »** : ancrer un repère sur un métier suggéré ou un doute (« est-ce que ce
  métier me correspond vraiment ? »).
- **« Mon projet »** (éventuellement) : un repère sur un manque identifié (« il me manque telle
  expérience / telle info »).
Mécanisme : le helper `reperesBoutonAncre` (déjà utilisé ailleurs), un petit « garder comme
repère » sur ces pages.

### 3.10 Les cartes « valeurs » → Lexique « Conditions de travail » + module de négociation ?
- **Bloc Lexique « Conditions de travail » : OUI.** Idée déjà parquée dans
  `docs/IDEES_A_RECLASSER.md` (2026-09-01). On la confirme et on l'élargit : chaque notion
  (télétravail, horaires, rythme, salaire, contact humain, évolution, autonomie, proximité…)
  → une fiche : qu'est-ce que c'est, ce que ça implique concrètement, **comment en parler en
  entretien**, **comment le négocier** (avec un salarié en poste, avec un responsable, à
  l'embauche vs en cours de contrat).
- **« Récupérer » les valeurs choisies comme repères : OUI** (§3.9). La page « Attentes » est
  exactement l'endroit où la personne identifie ses besoins.
- **Un module dédié à la négociation / défendre ses intérêts : à part, plus tard.** C'est un vrai
  sujet CIP (négocier son contrat, ses conditions, une augmentation) avec un prompt clair
  possible : « à partir de 1-2 conditions précises auxquelles la personne tient et de sa situation
  réelle, construire un fil argumentaire ». **Reco : nouveau chantier** (« Défendre mes
  conditions » / « Préparer une négociation »), **pas dans la refonte "Mes documents"**. À noter
  dans `IDEES_A_RECLASSER.md` et à évaluer après la stabilisation des modules.

---

## 4. Ce que je propose comme suite (à valider)

> **Avancement au 2026-09-02.** Points 1 et 2 faits (commits `3cce28c` faux choix + barre dans
> barre retirés mode `nouveau`, `6f8f728` section « Et maintenant ? »). Puis passe accordéon par
> accordéon de la page « Créer mon CV » (`2a01d33` → `754ff70`), Aperçu non refait (Composeur =
> chantier à part). **Point 4 (Phase 3b) FAIT** : les 4 écrans fusionnés en `pageVotreParcours()`
> le 2026-09-02, plan `docs/PLAN_FUSION_VOTRE_PARCOURS_2026-09-02.md`, maquette v3 validée,
> commits `b868832` → `9a56874`. Points 3, 5, 6, 7 : restent à faire.
>
> **Vérification navigateur du 2026-09-02** (après la fusion). Les 3 parcours de la carte
> « Mes documents » testés de bout en bout :
> - **Créer un nouveau CV** (`nouveau`) : Objectif → `votre-parcours` (page fusionnée : 4 questions
>   dépliantes, familles fermées avec aperçu, cartes rondes, pilules « N sur limite », compteur de
>   compétences en direct, bouton bloqué tant que les 4 questions n'ont pas ≥1 choix) → Mon projet
>   (`_pageOrigineAvantProjet = 'votre-parcours'`, retour aller-retour OK, état conservé) → Faire le
>   point → Créer mon CV. Rien de cassé.
> - **Mettre à jour mon CV** (`maj`) et **Préparer ma lettre et mon entretien** (`pret`) : branches
>   de code séparées (`pageMettreAJourCv` / dépliante `_prepLE*`), aucune référence à un symbole
>   supprimé, testées jusqu'au sélecteur d'assistant ; pages partagées en aval (`projet` /
>   `revelation` / `resultats`) rendues sans le mode guidé « Créer mon CV » (bien verrouillé sur
>   `modeCreation === 'nouveau'`).
> - Repli de navigation de « Mon projet » : `_pageOrigineAvantProjet || 'valeurs'` devenu
>   `|| 'votre-parcours'` (route valide au lieu d'une route supprimée) — strictement plus sûr.
> - 2 correctifs au passage : libellé « Rediger » → « Rédiger » (`b931c26`), commentaire
>   `CREER_CV_NAV_ETAPES` remis à jour (`4c64015`). 646 tests verts, `checkLexique` propre.

1. **Correctifs rapides de la page « Action »** : retirer le faux sélecteur + la sous-barre pour
   les 3 modes « Mes documents », renommer « Créer mon CV », remonter la barre. (Risque faible,
   généralisation de la branche Découverte existante.)
2. **Raccourcis de fin** : section « Et maintenant ? » (lettre / entretien) après l'export du CV,
   entretien débloqué. (Risque faible.)
3. **Passe « densité des cartes »** sur les pages à multi-sélection (CSS). (Risque faible.)
4. **Phase 3b** : regrouper Activités / Actions / Environnement / Attentes en une page « Votre
   parcours » à sections. (Risque moyen, plan dédié.) — **FAIT le 2026-09-02.**
5. **Allègement** de « Mon projet » et « Faire le point ». (Risque moyen.)
6. **Bloc Lexique « Conditions de travail »** + ancrage repère sur « Attentes ». (Chantier Lexique,
   à part mais lié.)
7. **Module « Défendre mes conditions / négociation »** : nouveau chantier, parqué.

Tout le reste de ton retour (bloc « infos transmises », refonte page Action en dépliante) demande
une décision de ta part avant que je fasse un plan.
