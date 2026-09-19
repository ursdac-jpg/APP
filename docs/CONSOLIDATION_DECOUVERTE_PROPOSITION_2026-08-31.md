# « Découvrir mes compétences » — proposition de parcours consolidé (2026-08-31)

> Demande de Denis (nuit du 30 au 31/08) : « récupère la stratégie, la philosophie, la charte
> graphique de ce qu'on a fait pour les autres modules et propose une maquette pour ce module
> dans le même esprit, en réduisant le nombre d'écrans, en faisant attention à ne pas avoir de
> régression en termes de fonction et fonctionnalité. »
>
> **Ce document est une PROPOSITION à valider, pas une implémentation.** Aucune ligne de
> `modules/decouverte-competences/` n'a été touchée. Maquettes :
> - `docs/MAQUETTE_INTRO_DECOUVERTE.html` — page de présentation. **Implémentée en code** le
>   2026-08-31 (route `decouverte-intro`, `pageDecouverteIntro()` dans `data/metiers.js`).
> - `docs/MAQUETTE_DECOUVERTE_CONSOLIDE_2026-08-31.html` — le parcours consolidé (5 écrans
>   empilés) avec la **barre de navigation visuelle du module** (5 pastilles : faite / en cours /
>   à venir, comme le Bilan et Cohérence). **Pas encore implémenté** — à valider par Denis.

Référence de langage : `docs/LANGAGE_VISUEL_COMMUN.md`. Rôle réel du module (mémoire
`project_module_decouvrir_mes_competences_role_reel`) : **bâtir un CV de zéro depuis un récit**,
pour une personne très éloignée de l'emploi. Ce n'est pas de l'exploration ; flux direct
récit → CV, pas de panier.

---

## 1. Ce qui existe aujourd'hui (9 écrans, cascade de fenêtres)

Source : `modules/decouverte-competences/decouverteParcours.js` (~3800 lignes, `afficherEtape(1..9)`).

| # | Écran (titre actuel) | Ce que la personne y fait | Fonctions / champs à conserver |
|---|---|---|---|
| 1 | 🔍 Découverte de vos compétences (accueil) | Dit ce qu'elle recherche | métier précis **ou** domaine ; objectif (réponse à une offre / spontanée) ; stage avec ou sans structure. Alimente `dossier.objectif`, `dossier.metierCible`/`secteurCible`, `dossier.titreCV`. Sous-états internes + bouton Retour qui recule sous-état par sous-état. |
| 2 | 🪪 Vos coordonnées | Saisit son identité | civilité (pastilles Madame / Monsieur / Ne pas préciser) ; nom, prénom, téléphone, email, code postal, ville. **Seule la civilité est transmise à l'assistant** (accord féminin/masculin). Continuer requiert nom + prénom. |
| 3 | 📝 Racontez votre parcours | Écrit son récit | zone de texte libre (`etat.recit`) ; astuce Win + H (dictée) toujours visible ; détection en direct de coordonnées tapées dans le récit (avertissement). |
| 4 | 💬 Choisissez votre assistant | Choisit un assistant en ligne | composant partagé (3 lignes : sans compte / avec compte / ce qui va se passer + panneau de détail). Identique au Bilan. |
| 5 | 📥 Collez la réponse de l'assistant | Fait l'aller-retour | écran tampon / décompte + `htmlCollageInstantane` + import. Identique au Bilan. |
| 6 | 💡 Découverte de vos compétences | Valide expérience par expérience | pour chaque expérience (fragment) : choisir la formulation qui lui ressemble + cocher jusqu'à 5 compétences ; « aucune ne convient → dites-en plus » = **raffinement** (nouvel aller-retour ciblé) ; onglets par expérience ; récapitulatif quand tout est validé ; bouton « Modifier ». |
| 7 | ❓ Quelques précisions (questions ciblées) | Répond aux manques repérés | **n'apparaît que si l'analyse a détecté des manques.** Questions dynamiques de type : `texte` ; `date` (2 sélecteurs d'année) ; `formation` (intitulé + niveau d'études en pastilles + dates) ; `engagement` (intitulé + dates). |
| 8 | 📋 Informations complémentaires | Complète le CV | 4 onglets : **Mobilité** (permis, véhicule) ; **Formations** (catalogue + saisie) ; **Engagement** (bénévolat, avec dates + description) ; **Savoir-faire personnel** (avec dates + description). Ajout / retrait (croix) / modification par item. Récapitulatif + « Modifier ». |
| 9 | → CV | — | `finaliserEtNaviguerVersResultats()` → `pageResultats()` (atelier CV). |

Écrans **déjà retirés** au fil des retours (à ne pas réintroduire) : « présentation de la saisie
libre » séparée du récit (fusionnée dans l'écran 3) ; « identification des manques » comme écran
propre (évaluation invisible qui alimente l'écran 7) ; fenêtre « Votre stratégie » avant la
personnalisation du CV.

---

## 2. Proposition : 1 page de présentation + 5 écrans

Même stratégie que la consolidation du Bilan : une **page dépliante « Préparer »** en tête (blocs
qui s'ouvrent l'un après l'autre), l'aller-retour assistant inchangé (2 écrans, incompressibles),
puis **fusion** des deux écrans de validation/précisions.

### Écran 0 — Présentation du module *(nouveau, patron page d'intro)*
`docs/MAQUETTE_INTRO_DECOUVERTE.html`. Accroche + à quoi ça sert + ce qui va se passer + ce que
ça ne fait pas + ce que vous pourrez faire ensuite + Mes Repères + comment ça se passe + bon à
savoir. CTA **« Raconter mon parcours → »**. Affichée à l'entrée par la tuile Boîte à outils ;
sautée si un travail est déjà engagé (bandeau « reprise en cours » comme le Bilan, D5b).
« Retour » de la présentation → menu Boîte à outils.

### Écran 1 — Préparer *(fusionne les écrans 1 + 2 + 3)*
Page dépliante, 3 blocs. Le bloc 1 est ouvert d'emblée, c'est le cœur.

- **Bloc 1 — Votre parcours (obligatoire)** : la zone de texte du récit, l'astuce Win + H
  toujours visible, la détection de coordonnées en direct. Pilule d'état « À écrire » →
  « Écrit ».
- **Bloc 2 — Vos coordonnées (facultatif, sauf nom et prénom)** : civilité en pastilles + nom /
  prénom / téléphone / email / code postal / ville. Rappel « seule la civilité est transmise ».
  Replié par défaut.
- **Bloc 3 — Ce que vous visez (facultatif)** : métier précis **ou** domaine ; objectif
  (réponse à une offre / candidature spontanée / stage). Replié par défaut. Les mêmes choix
  qu'à l'écran 1 actuel, mêmes effets sur `dossier`.
- Bouton du bas : **« Choisir mon assistant → »**, actif dès que le bloc 1 contient du texte.

> Le « Retour qui recule sous-état par sous-état » de l'écran 1 actuel disparaît naturellement :
> tous les choix sont sur une seule page, il n'y a plus de sous-états à dérouler à l'envers.

### Écran 2 — Choisir l'assistant *(inchangé — écran 4 actuel)*
Composant partagé, aucune modification.

### Écran 3 — Coller la réponse *(inchangé — écran 5 actuel)*
Écran tampon + `htmlCollageInstantane` + import, aucune modification.

### Écran 4 — Vos compétences, expérience par expérience *(fusionne les écrans 6 + 7)*
- **Partie haute** : la validation par expérience de l'écran 6 actuel (onglets, formulation +
  compétences, « aucune ne convient → dites-en plus » = raffinement, récapitulatif, « Modifier »).
- **Partie basse, même écran** : quand l'analyse a repéré des manques, un bloc dépliant
  **« Quelques précisions »** contenant les questions ciblées (types `texte` / `date` /
  `formation` / `engagement`, à l'identique). S'il n'y a aucune question, le bloc ne s'affiche
  pas (comme l'écran 7 aujourd'hui, qui est absent si rien ne le déclenche).
- Bouton du bas : **« Continuer → »**, actif quand toutes les expériences sont validées (les
  précisions restent facultatives, comme aujourd'hui).

### Écran 5 — Compléter mon CV *(écran 8 actuel, renommé)*
Les 4 onglets **Mobilité / Formations / Engagement / Savoir-faire personnel**, à l'identique
(ajout, retrait par croix, dates, description par item, récapitulatif, « Modifier »). Titre
qui dit clairement que c'est la dernière étape. Bouton du bas : **« Voir mon CV → »**.

### → CV *(écran 9 actuel, inchangé)*

**Bilan : de 9 écrans à 1 présentation + 5 écrans.** Deux fusions (1+2+3 et 6+7), aucune
fonction supprimée.

---

## 3. Zéro régression — où vit chaque fonction actuelle

| Fonction / donnée actuelle | Dans la proposition |
|---|---|
| métier précis / domaine / objectif / stage (`dossier.objectif`, `metierCible`, `secteurCible`, `titreCV`) | Écran 1, bloc 3 |
| civilité + nom / prénom / contact ; règle « seule la civilité transmise » ; blocage sur nom+prénom | Écran 1, bloc 2 |
| récit libre + Win + H + détection coordonnées | Écran 1, bloc 1 |
| choix de l'assistant (composant partagé) | Écran 2 (inchangé) |
| écran tampon + collage + import | Écran 3 (inchangé) |
| validation par expérience : formulation, ≤ 5 compétences, onglets, raffinement, récap, Modifier | Écran 4, partie haute |
| questions ciblées `texte` / `date` / `formation` (+ niveau) / `engagement` ; absentes si rien ne les déclenche | Écran 4, bloc dépliant « Quelques précisions » |
| Informations complémentaires : 4 onglets, ajout / retrait / dates / description / récap / Modifier | Écran 5 (renommé) |
| finalisation → atelier CV | → CV (inchangé) |
| fermer = mettre en pause / reprendre à la dernière étape ; « Réinitialiser » = seul vrai départ à zéro | Conservé tel quel (mécanisme `masquerDecouverteCompetences` / `recommancer`) |
| bouton Retour à chaque étape | Conservé ; en plus, « Retour » d'un écran de travail repasse par la présentation du module (patron, `LANGAGE_VISUEL_COMMUN` 5bis) |

---

## 3bis. Zéro régression — relecture détaillée écran par écran (2026-08-31, à la demande de Denis)

Relecture ligne à ligne de `modules/decouverte-competences/decouverteParcours.js`. **Corrections apportées à la maquette après cette relecture :** l'écran 1 de la maquette (« Ce que vous visez ») était trop simplifié — il ne montrait pas le domaine, le stage, ni le bloc « recherche de candidature ». Corrigé : la maquette montre maintenant tout.

### Écran actuel 1 « Découverte de vos compétences » (`etapeAccueil`)
| Fonction actuelle | Dans la proposition | OK |
|---|---|---|
| 3 cartes « métier précis / domaine / stage » (`etat.modeRecherche`) | Écran 1, bloc 3, jetons | ✅ |
| Recherche métier (`baseMetiers` + texte libre validé par Entrée, reconnu ou non) | Écran 1, bloc 3, champ + suggestions | ✅ |
| Recherche domaine (`secteursDisponibles`, raccourcis les plus courants) | Écran 1, bloc 3, même champ (selon le jeton choisi) | ✅ |
| Métier / domaine choisi = **pastille cliquable** pour le retirer (`data-changer-metier` / `-domaine`) | Écran 1, bloc 3, mention explicite | ✅ |
| Domaine : affichage de l'**intitulé de CV réellement construit** (« Profil polyvalent - … », `dossier.titreCV`) | Écran 1, bloc 3, mention explicite | ✅ |
| Stage : « structure d'accueil en tête ? » (`etat.stageAvecStructure`) | Écran 1, bloc 3, « offre / structure en tête ? » | ✅ |
| Métier : « offre en tête ? » (`dossier.objectif` = `offre` / `spontanee`) | Écran 1, bloc 3, même question | ✅ |
| Domaine : « structure précise en tête ? » (`etat.domaineAvecStructure`) | Écran 1, bloc 3, même question | ✅ |
| `blocRechercheCandidature` : nom entreprise / structure (`dossier.rechercheCandidature.entreprise`) | Écran 1, bloc 3, sous-bloc « recherche de candidature » | ✅ |
| `blocRechercheCandidature` : site (`.site`) | idem | ✅ |
| `blocRechercheCandidature` : lien ou texte de l'offre (`.lienOffre`) | idem | ✅ |
| `blocRechercheCandidature` : civilité du recruteur (`.civiliteRecruteur`) + nom du recruteur si connu (`.nomRecruteur`) | idem, mention explicite | ✅ |
| `blocRechercheCandidature` : mettre en avant les couleurs de l'entreprise (`.mettreEnAvantCouleurEntreprise`) + sélecteur de couleur (`.couleurEntreprise`, proposé sur le CV Composeur) | idem, mention explicite | ✅ |
| Infobulle « pourquoi Continuer est désactivé » (`raisonBlocage` par sous-cas) | À conserver à l'implémentation — sur le bouton du bas de l'écran 1 | ✅ |
| `marquerProgresEtape1` (pousse l'historique dès un choix réel) | Mécanisme interne, à conserver | ✅ |

### Écran actuel 2 « Vos coordonnées » (`etapeIdentite`)
Civilité (Madame / Monsieur / Ne pas préciser) + nom / prénom / téléphone / email / code postal / ville ; « seule la civilité est transmise » ; Continuer requiert nom + prénom. → **Écran 1, bloc 2** (identique).

### Écran actuel 3 « Racontez votre parcours » (`etapeRecit`)
Zone de texte `etat.recit` ; astuce Win + H toujours visible ; `afficherDetectionCoordonneesDecouverte` (surlignage tel/mail en jaune). → **Écran 1, bloc 1** (identique). Continuer requiert du texte.

### Écran actuel 4 « Choisissez votre assistant » (`etapeChoixAssistant`)
Reproduit `accordeonChoixIA` (js/app.js) : 3 lignes sans compte / avec compte / ce qui va se passer + panneau de détail partagé. → **Écran 2** (inchangé ; la maquette montre désormais la distinction sans compte / avec compte, comme le Bilan).

### Écran actuel 5 « Collez la réponse » (`etapeCollerReponse`)
Écran tampon / décompte + `htmlCollageInstantane` + import. → **Écran 3** (inchangé).

### Écran actuel 6 « Découverte de vos compétences » (`etapeDecouverte`)
Onglets par expérience (icône selon `origine`), choix de formulation, ≤ 5 compétences à cocher, « aucune ne convient → dites-nous-en un peu plus » = **raffinement** (aller-retour ciblé, `DECOUVERTE_QUESTION_RAFFINEMENT_TYPE`), récapitulatif quand tout est validé, bouton « Modifier », navigation libre entre expériences. → **Écran 4, partie haute** (identique).

### Écran actuel 7 « Quelques précisions » (`etapeQuestionsCiblees`)
N'apparaît que si l'analyse a repéré des manques. Questions dynamiques : `texte` ; `date` (2 sélecteurs d'année) ; `formation` (intitulé + **niveau d'études** en pastilles `NIVEAUX_DIPLOME_SIMPLES` + dates) ; `engagement` (intitulé + dates). Réponses stockées en objets `{texte, dateDebut, dateFin, niveau}`. `calculerStrategieSiBesoin()` est appelé ici (calcul silencieux, plus d'écran « Votre stratégie »). → **Écran 4, bloc dépliant « Quelques précisions »** (identique ; plus d'écran distinct quand il n'y a aucune question).

### Écran actuel 8 « Informations complémentaires » (`etapeMobilite`)
4 onglets : **Mobilité** (permis / véhicule, `actif: null` distinct de « répondu Non ») ; **Formations** (3 paliers Oui/Non indépendants : niveau / certifications / catalogue ; `typeCredential`, `niveauRNCP`, missions de formation via `contenuMissionsFormationBrouillon` partagé ; repli piloté par drapeau explicite par palier) ; **Engagement** (intitulé + dates + missions) ; **Savoir-faire personnel** (intitulé + dates + missions). Ajout, retrait par croix (`data-retirer-infocompl`), modification par item (`pillsAvecDetailEtDates`), récapitulatif + « Modifier », majuscule auto sur la 1re lettre des zones de texte. `finaliserEtNaviguerVersResultats()` : mapping fragments → `experiences`/`competences`/`experiencesPerso`/`engagements`/`certifications`/`formations`, jamais exécuté 2 fois. → **Écran 5 « Compléter mon CV »** (identique, seul le titre change).

### Écran « Votre stratégie » (ancienne étape 8)
**Déjà retiré** du parcours actuel (décision Denis antérieure). Seul le calcul de fond `calculerStrategieSiBesoin()` (type de CV chronologique / par compétences) subsiste, appelé depuis l'écran 7. → inchangé, rien à réintroduire.

### Mécanismes transverses
Fermer (croix) = `masquerDecouverteCompetences` (met en pause, état + closures intacts) ; rouvrir = réaffiche la dernière étape ; `recommencer()` (js/app.js) = seul vrai départ à zéro. `reafficherDecouverteCompetences` / `_decouverteVersResultats`. → **tous conservés**, la consolidation ne touche que le HTML/l'aiguillage des écrans, jamais l'état.

**Conclusion : aucune fonction, aucun bouton, aucun champ perdu.** Les seuls changements : moins d'écrans (fusions 1+2+3 et 6+7), une barre de navigation visible en permanence, le titre de l'écran 8 → « Compléter mon CV », et la distinction sans compte / avec compte rendue visible sur l'écran assistant (déjà le comportement réel du composant partagé).

---

## 4. Points à trancher par Denis (aucun ne bloque la maquette d'intro)

1. **Écran 1 dépliant** : garder les 3 blocs dans l'ordre récit → coordonnées → visée, ou mettre
   la visée avant les coordonnées ? (Le récit reste toujours en premier.)
2. **Écran 4** : les précisions dans un bloc dépliant *sous* la validation, ou sur une petite
   deuxième page après « Continuer » (comme aujourd'hui, mais sans écran distinct pour le cas
   « pas de question ») ?
3. **Écran 5** : le renommer « Compléter mon CV » (proposé) ou garder « Informations
   complémentaires » ?
4. **Teinte du module** : indigo `#6366f1` proposé pour la maquette. À confirmer (chaque module
   a sa teinte d'accent, le reste est partagé).
5. Ordre d'implémentation quand ce sera lancé : d'abord la page de présentation seule (comme pour
   les autres modules), puis la fusion 1+2+3, puis la fusion 6+7 — un commit vérifié en
   navigateur par étape, jamais le parcours à moitié refondu.
