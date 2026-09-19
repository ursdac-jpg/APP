# Plan : page « Mes informations » (ex-« Mon projet » allégé)

> Chantier « Refonte de la carte Mes documents », suite de la fusion « Votre objectif ».
> Maquette **validée par Denis le 2026-09-02** : `docs/MAQUETTE_MES_INFORMATIONS_2026-09-02.html` (v9).
> Ce document = la cible + les précautions d'implémentation. Le code n'est pas encore écrit.

## Deux consignes non négociables de Denis (2026-09-02)

1. **Zéro régression fonctionnelle.** Aucune fonction, aucun bouton, aucun champ perdu. Et **tous les endroits où ces informations sont référencées ne changent pas** : `dossier.identite`, `dossier.formations`, `dossier.certifications` (chaînes), `dossier.langues`, `dossier.experiencesPerso`, `dossier.loisirs`, `dossier.engagements`, `dossier.permis`, `dossier.detailsCatalogue`, et tous leurs lecteurs (CV, lettre, entretien, prompts, résumés, Découverte...). Inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI **avant** de toucher au code. Vérifier chaque lecteur un par un.
2. **Le code doit être fidèle à la maquette, à l'identique.** ~5 heures de travail dessus, chaque détail a été décidé. Pas de réinterprétation, pas de « à peu près » : la v9 est la cible exacte (structure, libellés, comportements, ordre des champs, majuscule/chiffres par champ, replis en résumé, contexte par élément, astuce verte, etc.). Toute question ou doute d'écart = revenir vers Denis avant de coder autrement.

---

## 1. Ce que devient la page

`pageProjet()` (`js/app.js` ~6287), aujourd'hui « Mon projet » avec 6 blocs, devient **« Mes informations »** avec **4 blocs**, uniquement du factuel.

| Bloc | Devenir |
|---|---|
| 👤 **Vous** (`CONFIG_BLOC_VOUS`) | **reste** (Identité / Mobilité / Langues) |
| 🎓 **Parcours** (`CONFIG_BLOC_PARCOURS`) | **reste**, renommé « Vos formations et diplômes » (Formations / Certifications) |
| ⭐ **Expériences et savoir-faire personnels** (`CONFIG_BLOC_EXPERIENCES_PERSO`) | **reste**, renommé « Ce que vous avez appris ailleurs qu'au travail » |
| 🧩 **Compléments** (`CONFIG_BLOC_COMPLEMENTS`) | **reste** (Loisirs / Engagements) |
| 💼 **Projet professionnel** (`CONFIG_BLOC_PROJET`) | **PART sur « Votre objectif »** (contrat / temps / disponibilité, adapté à l'objectif) |
| 📝 **Candidature** (`CONFIG_BLOC_CANDIDATURE`) | **PART sur « Votre objectif »** (métier ou domaine, entreprise, offre) |

Les 2 blocs qui partent sont traités dans la maquette « Votre objectif » (`docs/MAQUETTE_OBJECTIF_RESTRUCTURE_2026-09-02.html`).

---

## 2. La cible, bloc par bloc (d'après la maquette v9)

### Bloc « Vous »

**Identité**
- Ordre : **Prénom puis Nom** (aujourd'hui Nom puis Prénom).
- Majuscule automatique sur la 1re lettre : Prénom, Nom, Adresse, Ville, et toute zone de texte libre de la page.
- Chiffres seuls : Téléphone (jusqu'à 15), Code postal (5), Année d'obtention (4).
- Civilité : **« Ne pas préciser » présélectionné par défaut**. Côté génération CV, « Ne pas préciser » prend la logique « Monsieur » (à câbler, décision Denis).
- **Adresse postale marquée « (facultatif) »** dans le libellé + phrase : « Sur un CV, le code postal et la ville suffisent. L'adresse précise n'est plus attendue ; ne la renseignez que si c'est utile (proximité avec l'entreprise). » Code postal et Ville **restent sans mention** (ils comptent sur le CV, sinon les gens les sautent).
- **Entrée** dans un champ = passe au champ suivant ; au dernier champ, Entrée = valider si le minimum est là.
- **Bouton « Enregistrer mon identité »** : désactivé tant que Prénom + Nom + (Téléphone ou Courriel) ne sont pas remplis (info-bulle au survol + phrase visible en dessous). Une fois validé, l'identité **se replie en résumé** (« ✓ Marie Durand · 06... · marie@... ») avec bouton **Modifier**. Même motif que Mobilité.
- **Question photo** en haut de la colonne photo (à droite) : question sur une ligne, Oui/Non en dessous, emplacement photo encore en dessous si « Oui ».
- **Le bandeau « Sans coordonnées, votre CV ne pourra pas être finalisé... ou plus tard sur l'écran Créer mon CV » est RETIRÉ** (voir §4, point coordonnées).

**Mobilité**
- « Non » → la section se referme aussitôt sur un résumé (« Pas de permis »).
- « Oui » → catégories (plusieurs) + « Avez-vous un véhicule ? ». **Dès que la question véhicule est répondue**, la section se referme sur un résumé (« Permis B, C · avec véhicule ») + bouton **Modifier**.

**Langues**
- Titre « Langues », l'explication, **puis directement la barre** (pas de 2e libellé « Langue »).
- Barre alignée hauteur fixe : `[ langue ]  [ niveau ]  [ + Ajouter cette langue ]`, révélés progressivement, jamais désalignés.
- Menu langue : défaut affiché **« Je n'ai pas de langue étrangère à indiquer »**, avec une **invitation visible** en dessous (« ↑ Vous parlez une langue étrangère ? Cliquez ci-dessus pour l'ajouter »).
- « Autre langue… » : champ texte, **1re lettre en majuscule**, **Entrée valide** (le niveau apparaît sans quitter le champ). Ne jamais enregistrer « Autre » comme une langue.
- Langues ajoutées = pastilles avec croix.

### Bloc « Vos formations et diplômes »

**Formations** — mécanisme repris **tel quel du code existant** (voir §4) :
1. **« Qu'avez-vous obtenu ? »** : Sans diplôme / Diplôme / Titre professionnel / CQP (`TYPES_FORMATION_MON_PROJET`).
   - « Sans diplôme » : pris en compte **sans confirmation**, aucun champ, aucun bouton « Valider ». Bouton **Modifier** (pas un lien texte) pour revenir dessus.
2. **« Son niveau »** : CAP à Bac+5 pour un diplôme ; niveau 1 à 7 (+ repères d'équivalence) pour titre pro / CQP.
   - Puis **Intitulé exact** (exemple adapté au niveau : CAP → « CAP Cuisine, BEP Vente » ; Bac → « Bac pro Commerce... » ; Bac+2 → « BTS... » ; etc.) **et Année d'obtention** : **les deux obligatoires**. Entrée dans l'intitulé → passe à l'année ; Entrée dans l'année → valide si possible.
3. **« Détailler ce que vous y avez appris et fait (facultatif) »** : accordéon **replié**, seulement pour les niveaux jusqu'au Bac (RNCP <= 4). Contenu = `contenuMissionsFormationBrouillon` : « Dans quel secteur avez-vous exercé, pratiqué ou appris ? » (7 secteurs de `CATALOGUE_MISSIONS_FORMATIONS_PAR_SECTEUR`), missions à cocher, zone de texte libre, conseil chiffres.
4. **Bouton « Valider le diplôme / le titre / le CQP »** : désactivé → grisé, curseur interdit, info-bulle **et** phrase visible en dessous (« Renseignez l'intitulé et l'année pour valider »). La phrase visible sert sur écran tactile (pas de survol).
5. **Formations validées = pastilles cliquables** : clic → le panneau se recharge pré-rempli, le bouton devient **« Valider ces modifications »**, un lien « Annuler » apparaît. La croix retire la formation. Une ligne sous les pastilles l'explique.

**Certifications**
- « Non » → fini. « Oui » → le menu de choix apparaît **juste sous la réponse**, resserré.
- Menu déroulant classé par thème (`CATALOGUE_CERTIFICATIONS`) + « Autre (préciser) ».
- La phrase « proposées plus loin à Faire le point » est **remplacée** par l'astuce de contexte commune (voir ci-dessous).

### Blocs « Ce que vous avez appris ailleurs qu'au travail » + « Compléments » (Loisirs / Engagements)

- **« Voir des exemples » retiré partout** : le menu déroulant classé par thème EST la liste d'exemples.
- Menus déroulants classés (`CATALOGUE_EXPERIENCES_PERSO`, `CATALOGUE_LOISIRS`, `CATALOGUE_ENGAGEMENTS`) + « Autre ».
- **Contexte par élément** : un élément ajouté = pastille colorée. **Clic sur la pastille** → zone de texte pour le contexte (« Dans quel cadre ? Qu'avez-vous fait concrètement ? Un chiffre si possible »). Entrée ou clic ailleurs enregistre. Un point « • » marque une pastille dont le contexte est rempli. **Clic sur la croix** → retire l'élément **et** son contexte.
- Zone de contexte : 1re lettre en majuscule, ligne d'aide mentionnant la **dictée (touches Windows + H)**, l'assistant remettant en forme.
- **Astuce en vert et en gras** sous les pastilles : « Astuce : cliquez sur un élément ajouté pour préciser le contexte (facultatif mais fortement conseillé). Ces détails peuvent faire ressortir une compétence recherchée pour le poste que vous visez. » C'est une forte recommandation, pas un simple conseil.

### Hiérarchie visuelle
- « Vous » et « Vos formations » = marqués **recommandé**, filet gauche accent, ouverts par défaut.
- Les 2 autres = **facultatif**, filet gris, repliés.
- État calme « à compléter » → « complété » (vert), **jamais de pulse rouge**.
- Habillage identique à « Votre objectif » (jetons case à cocher / rond, champs avec halo, badges, chevrons).
- **Encart vidéo retiré** : la page est assez légère (décision Denis 2026-09-02).

---

## 3. Structures de données (inchangées, à réutiliser)

| Donnée | Forme | Lu par |
|---|---|---|
| `dossier.identite` | `{civilite, nom, prenom, adresse, codePostal, telephone, email, ville}` | partout (CV, lettre, entretien) |
| `dossier.permis` | `{possede, categories:[], vehicule}` | CV |
| `dossier.langues` | `[{langue, niveau}]` + `dossier.languesFrancaisUniquement` | CV |
| `dossier.formations` | `[{niveau, intitule, annee, typeCredential, niveauRNCP, ...}]` (+ missions du brouillon) | CV, `resumeParcours`, ~15 endroits |
| `dossier.certifications` | **simples chaînes** (~15 lecteurs) ; dates/contexte dans `dossier.detailsCatalogue.certifications` | CV, prompts |
| `dossier.experiencesPerso` | `[{intitule, dateDebut, dateFin}]` | CV |
| `dossier.loisirs` / `dossier.engagements` | chaînes ou `{texte, dateDebut, dateFin}` | CV |
| `dossier.detailsCatalogue` | contexte/dates par élément (via `avecContexte` / `avecDatesSeparees`) | CV |

Le contexte par élément de la maquette = le mécanisme `avecContexte` déjà présent (`CONFIG_CERTIFICATIONS`, expériences perso, loisirs, engagements). Ne pas créer une 2e nomenclature.

---

## 4. Précautions d'implémentation (à vérifier TRÈS soigneusement)

1. **`contenuFormations` et son mécanisme de missions sont PARTAGÉS avec le parcours Découverte** (`modules/decouverte-competences/decouverteParcours.js`). Fonctions/données communes : `contenuMissionsFormationBrouillon`, `CATALOGUE_MISSIONS_FORMATIONS_PAR_SECTEUR`, `NIVEAUX_AVEC_CATALOGUE_SECTEURS`, `TYPES_CREDENTIAL_FORMATION` (Découverte) vs `TYPES_FORMATION_MON_PROJET` (Mon projet), `NIVEAUX_DIPLOME_SIMPLES`, `NIVEAUX_RNCP_TITRE_CQP`, `formationBrouillonPeutAjouter`, `libelleValiderFormation`, `niveauFormationAffiche`, `brouillonFormationEnCours`, `construireBrouillonDepuisFormation`, `_editionFormationExistanteIndex`. **Réutiliser, jamais réécrire.** La v1 de cette maquette avait fait disparaître les missions par secteur : ne pas refaire l'erreur.
2. **`dossier.certifications` reste en simples chaînes** (lu à ~15 endroits). Le contexte/les dates vont dans `dossier.detailsCatalogue`, comme aujourd'hui (`avecDatesSeparees`, `avecContexte`). Ne pas transformer `dossier.certifications` en objets.
3. **`etatAccesRevelation()`** : le verrou d'accès à « Faire le point » portait sur `CONFIG_BLOC_CANDIDATURE` (via `blocCibleId: 'blocERIP-candidature'`). Ce bloc part sur « Votre objectif » ; le verrou part avec lui. « Mes informations » ne doit **rien bloquer** (« Continuer » toujours actif).
4. **Repli de la barre de navigation de `pageProjet`** : `barreNavigation(_pageOrigineAvantProjet || 'votre-parcours', 'revelation', ...)`. `_pageOrigineAvantProjet` est capturé par `naviguerVers()`. À conserver.
5. **`modeAllege` (`dossier.modeCreation === 'pret'`)** : aujourd'hui `pageProjet` masque Parcours / Expériences perso / Compléments pour `pret` (le CV complet contient déjà ces infos). Décider : garder ce masquage sur « Mes informations » ? Probablement oui pour `pret`, mais vérifier avec les 3 parcours.
6. **Doublon des coordonnées** : `construireContenuApercuFinalisation` (dans `pageResultats`) affiche une carte **« Coordonnées »** avec **exactement les mêmes champs** (civilité, nom, prénom, courriel, téléphone, adresse, code postal, ville, photo) et le message « Nous n'avons actuellement aucune coordonnée enregistrée... renseignez-les ici ». C'est le doublon que Denis veut éliminer. **« Mes informations » devient la source unique.** Sur « Créer mon CV », cette carte devient un **récapitulatif en lecture seule** (avec « Modifier » qui renvoie ici) ou disparaît, puisque « Mes informations » est une étape obligatoire des 3 parcours. À trancher au moment du code.
7. **`blocERIP` / `wireBlocERIP` / `verifierTransitionsCompletionBlocs`** : le système d'accordéons de `pageProjet`. Les sous-parties (Identité, Mobilité, Langues, Formations, Certifications...) restent des petits accordéons `blocERIP` comme aujourd'hui ; la maquette les montre dépliées pour la lisibilité.
8. **`resumeParcours`, `resumeVous`, `resumeExperiencesPerso`, `resumeComplements`, `resumeCandidature`** : fonctions de résumé des pastilles vertes. Celles des blocs qui restent doivent continuer de fonctionner ; `resumeCandidature` / `resumeProjet` partent avec leurs blocs.
9. **`js/app.js`, `data/metiers.js`, `modules/*/*.js` ne sont pas couverts par les tests Node** : test navigateur **obligatoire**, sur les 3 parcours (`nouveau` / `maj` / `pret`) ET sur Découverte (à cause du partage `contenuFormations`).
10. **Aide contextuelle (l'ampoule)** : `AIDES_CONTEXTUELLES` a des entrées pour les écrans du parcours guidé. À réviser **en dernier**, quand la structure ne bouge plus (déjà noté comme dernière tâche du chantier « Mes documents »).
11. **Umami** : `bilan_preparer_affichee` et autres événements liés à `pageProjet` : vérifier qu'ils suivent le renommage.
12. **Français impeccable, jamais de tiret cadratin, jetons + champs = composant partagé** (à généraliser, pas un CSS jetable sur cet écran) : la passe visuelle des jetons/champs de la maquette doit devenir une brique commune, appliquée partout où contrat / disponibilité / langue / etc. apparaissent.

---

## 5. Ordre de code suggéré (à valider avec Denis)

1. Renommage `pageProjet` → « Mes informations » + retrait des 2 blocs qui partent (coordonner avec la maquette « Votre objectif » : les blocs doivent arriver là-bas **avant** de partir d'ici, zéro trou).
2. Bloc « Vous » : ordre prénom/nom, majuscule/chiffres par champ, Entrée-au-suivant, bouton « Enregistrer mon identité » + résumé replié, adresse facultative, question photo, retrait du bandeau coordonnées.
3. Mobilité : repli sur résumé après réponse.
4. Langues : barre alignée, invitation, « Autre » + Entrée.
5. Formations : réutiliser `contenuFormations` (étapes 1/2/3, intitulé + année obligatoires, pastilles éditables). Vérifier Découverte à chaque étape.
6. Certifications + Loisirs + Engagements + Expériences perso : contexte par élément (`avecContexte`), astuce verte, retrait « Voir des exemples ».
7. Passe visuelle commune (jetons / champs).
8. Doublon coordonnées de « Créer mon CV » (§4.6).
9. Test navigateur exhaustif : `nouveau` / `maj` / `pret` + Découverte. `npm test` vert.
10. Aide contextuelle (ampoule) : à la toute fin.
