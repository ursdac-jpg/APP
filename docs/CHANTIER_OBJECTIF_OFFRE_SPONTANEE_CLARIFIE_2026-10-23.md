# Chantier : clarifier « offre » et « candidature spontanée » dans l'objectif (23 octobre 2026)

Mode A, `[effort : haut]`. Lié à `docs/CHANTIER_LETTRE_CV_DANS_LE_PROMPT_2026-10-23.md` (décision 10). Rien n'est codé. Ce document est le concept grossier et la carte de faisabilité (étapes 1 et 2 de la méthode maquette) ; la maquette détaillée vient après validation de Denis.

## Décisions de Denis (23/10/2026)

1. **On ne supprime pas `dossier.typeRecherche`, on rend invisible ce qui ne sert pas** (doublon dans le meilleur cas, contradiction dans le pire).
2. **Répondre à une offre** : la question « Votre recherche concerne : je cherche simplement un emploi / je réponds à une offre » disparaît. Le mot « (facultatif) » disparaît aussi du bloc « L'offre et l'entreprise » : répondre à une offre, ce n'est pas facultatif. Si la personne ne renseigne pas l'offre, **sa candidature devient une candidature spontanée**.
3. **Candidature spontanée** : on garde la question, mais avec deux choix très explicites : « sans viser d'entreprise » (candidature générale) ou « en visant une entreprise précise ». Si une entreprise est visée : au moins deux informations, idéalement trois : **le poste visé, l'entreprise, le site de l'entreprise**. Pas de champ « offre » (une offre collée ferait d'une candidature spontanée autre chose).
4. **Inchangé** : les questions « type de structure » et « connaissez-vous la personne en charge du recrutement ? ».
5. **Changer de métier** : la question « cherche simplement / répond à une offre » reste (seul endroit légitime).

**Maquette cliquable faite le 23/10/2026** : `docs/MAQUETTE_OBJECTIF_OFFRE_SPONTANEE_2026-10-23.html` (cartes, questions, panneaux, message d'avertissement, bouton dans la page et dans la barre du bas, bloc « Adaptation » grisé sans objectif, remise à zéro au changement de carte, aperçu de ce qui est transmis, mode sombre, 375 px). Vérifiée par essai dans le navigateur. Stage, alternance, immersion et formation ne sont pas reproduits (inchangés). **En attente de la relecture de Denis** ; aucun code de l'application.

**Maquette v2 (23/10/2026, après le retour de Denis)** : même fichier, mis à jour. Changements : (1) « Connaissez-vous la personne en charge du recrutement ? » seulement quand une entreprise est identifiée (offre, spontanée avec entreprise) ; masquée pour « de façon générale » ; (2) panneau « Vos appuis » (lettre de recommandation) dans tous les cas ; (3) domaine : liste complète cliquable ou recherche, puis intitulé de poste proposé obligatoire (suggestions du domaine et champ libre) ; (4) « Changer de métier » aligné sur la spontanée avec trois choix : offre, entreprise précise sans offre, de façon générale (remplace « Je cherche simplement un emploi / Je réponds à une offre »). Audit rapide : le « domaine » vient de `SECTEURS_DETAIL` (`data/secteurs.js`, champ `metiersPhares`), les suggestions d'intitulé peuvent partir de ces métiers, les intitulés polyvalents (« Ouvrier polyvalent du bâtiment ») sont du contenu neuf à écrire et valider pour les 21 domaines ; le champ « ancien métier » du profil (`of.ancien`, `js/app.js:32338`) n'est demandé nulle part dans l'interface, aucun écran à modifier.

**Validé par Denis le 23/10/2026** : la question unique sur la lettre de recommandation (Non / Oui avec dépôt relu et masqué, « de la part de » en option, rôle sans le nom). **Validé aussi (23/10/2026, après essai de la maquette)** : « Changer de métier » avec trois choix (offre, entreprise précise sans offre, de façon générale) quand le métier est précis ; **avec « plusieurs métiers d'un domaine », le choix « offre » n'est pas proposé** (une offre vise un poste précis), restent l'entreprise précise sans offre (agence d'intérim, entreprise multi-secteurs) et la candidature générale. Conséquence pour le prompt : en mode domaine, la lettre porte un intitulé mais dit l'ouverture à plusieurs postes du domaine. **Validé aussi** : les formulations de la spontanée (« Je me présente de façon générale, sans viser une entreprise », « Je m'adresse à une entreprise précise »). **Validé aussi (23/10/2026)** : les règles de blocage de « Choisir mon assistant » (objectif, métier ou intitulé, situation actuelle, choix général ou entreprise et son nom ; jamais bloquants : entreprise, site, offre, structure, recruteur, recommandation) ; les intitulés de la maquette, avec 2 ou 3 de plus par domaine (voir `docs/INTITULES_PAR_DOMAINE_2026-10-23.md`, à valider). **Encore à valider** : (c) le texte du message d'avertissement quand l'offre manque ; (e) la liste finale des intitulés par domaine.

## Précisions de Denis, suite (23/10/2026) : la logique visée, carte par carte

Écran concerné : page « Préparer » de « Écrire ma lettre avec l'assistant » (`_coLettreRendreDepot`, `data/metiers.js:5082`) : bloc 1 « Votre CV », bloc 2 « Votre candidature » (les six cartes d'objectif puis leurs questions), bloc 3 « Adaptation au métier », bouton « Choisir mon assistant ». Mêmes briques que Mon projet, le Bilan et Découverte.

**Règle générale.**
- **Le bloc « Adaptation au métier » est visible mais désactivé tant qu'aucun objectif n'est choisi** (aujourd'hui on peut y répondre sans objectif).
- **Plus de « facultatif »** : la phrase « Tout est facultatif » et les étiquettes « facultatif » du bloc 2 disparaissent. Ce que la personne renseigne donne son poids à la lettre.
- **Changer de carte remet à zéro** tout ce qui avait été saisi pour l'objectif précédent (aucune information conservée, pour éviter les contradictions).
- **Le bouton « Choisir mon assistant » est aussi dans la barre fixe du bas**, à côté de « Retour » et « Accueil » (faisable : `barreNavigation` accepte déjà un bouton « suivant » désactivable).

**Carte « Répondre à une offre ».**
1. Pas de question « Votre recherche porte sur » ni « Votre recherche concerne » : c'est forcément un métier précis, forcément une offre.
2. Directement : « Quel métier cherchez-vous ? » (le poste visé).
3. Puis le panneau « L'offre et l'entreprise », sans « (facultatif) » : entreprise, site de l'entreprise, offre d'emploi (texte ou lien), type de structure, connaissez-vous la personne qui recrute.
4. En bas du panneau, **si aucune offre (ni lien, ni texte) n'a été saisie**, un message bien visible : « Comme vous n'avez pas saisi d'offre d'emploi, votre candidature sera traitée comme une candidature spontanée auprès de : [nom de l'entreprise saisie plus haut] » (ou une formulation sans entreprise si elle n'est pas renseignée). **La carte reste « Répondre à une offre »** (on ne la change pas pour la personne) ; la situation réelle est calculée et transmise à l'assistant, qui la redit dans son rappel des choix.

**Carte « Candidature spontanée ».** Pas de champ « offre ».
1. On garde le choix « un métier précis » ou « plusieurs métiers d'un même domaine ».
2. Puis le métier (ou le domaine).
3. Puis, deux choix très explicites : candidature de façon générale, sans viser d'entreprise, ou auprès d'une entreprise identifiée.
4. De façon générale : type de structure (non obligatoire) et « connaissez-vous la personne ».
5. Entreprise identifiée : le poste (déjà saisi), l'entreprise, le site, puis type de structure et « connaissez-vous la personne ».

**Carte « Changer de métier ».** Inchangée : la question « cherche simplement un emploi / répond à une offre » reste.

**Pistes à trancher en maquette** (la fatigue de Denis le 23/10 : une seule décision à la fois) : (a) ce qui bloque vraiment « Choisir mon assistant » (objectif choisi et métier saisi : oui ; entreprise / site / offre : « attendus » mais jamais bloquants, puisque l'absence d'offre devient une candidature spontanée) ; (b) formulation exacte des deux choix de la spontanée ; (c) texte du message en bas du panneau ; (d) effet sur les autres écrans qui affichent la même question (Mon projet, Bilan, Découverte, Préparer l'entretien).

## Audit du code réel (23/10/2026)

- La question est dans `contenuModeRecherche` (`js/app.js:6381`, lignes 6511 à 6556), affichée pour offre, spontanée et reconversion quand le mode est « un métier précis », et sous une autre formulation en mode « domaine » (« Avez-vous une structure précise en tête ? »). Stage, alternance, immersion et formation ne la posent pas (le choix d'objectif vide ces champs, `definirObjectifCandidature`, `js/app.js:5404`).
- Pour la spontanée, `simple` affiche aujourd'hui `contenuCandidatureReduiteSansStructure` (type de structure et destinataire seulement) et `offre` affiche `contenuCoordonneesEntrepriseBilanInline` (entreprise, site, **offre**, type de structure, destinataire, couleur). Le mot « (facultatif) » vient de cette dernière (`js/app.js:7190`). La brique `bilanCorpsCiblageOffreHTML` (`data/metiers.js:9137`) est partagée avec le Bilan, la Cohérence et « Préparer » : on n'y touche pas, on choisit quels champs on appelle (le drapeau `_ciblageOffreSeule` existe déjà pour l'offre seule).
- Le « poste visé » est déjà demandé juste au-dessus (« Un métier précis » avec son champ, ou « un domaine »). Rien à ajouter : l'écran réutilise cette réponse, sans second champ (une seule source).
- `typeRecherche` est lu 53 fois (`js/app.js` 48, `data/metiers.js` 3, `scripts/parcours/parcours_smoke.js` 2) : type de CV (`typeCVDepuisTypeRecherche`), complétude du bloc (`modeRechercheRempli`, `_candCalculerEtat`), demande de civilité, encart « entreprise manquante » (`js/app.js:8983`), accès à Potentiel (`js/app.js:8642`), résumés, passerelle de `data/metiers.js`. L'objectif « offre » lui-même n'est lu directement que deux fois ; il passe surtout par `texteProfil` (profil envoyé aux prompts CV, lettre, entretien).
- Appelants de la question : Mon projet (`pageObjectif`), fenêtre Candidature du Bilan, Découverte, « Préparer » de la lettre et de l'entretien (`data/metiers.js:5221` et `10327`). Un changement ici se voit dans tous ces écrans.

## Verdict préliminaire : GO AVEC RÉSERVES

- **Simple** : masquer la question pour « offre » ; remplacer les deux choix de la spontanée par les deux formulations explicites ; retirer « (facultatif) » dans le cas offre ; réutiliser les briques existantes.
- **Risqué** : la bascule « offre sans offre devient spontanée » doit être appliquée partout où le code lit `typeRecherche` ou l'objectif, sinon un écran dira « offre » pendant qu'un autre demande une entreprise ou bloque. Il faut une seule fonction qui dit la situation réelle (offre, spontanée avec entreprise, spontanée générale) et l'utiliser aux endroits clés (profil des prompts, complétude, encart entreprise manquante, type de CV, résumés).
- **Imprévu à traiter** : les sessions déjà sauvegardées (disquette) peuvent contenir « offre » avec `typeRecherche = simple`, ou l'inverse. Normaliser au chargement. Et quand la personne passe d'une carte à l'autre, remettre `typeRecherche` à vide pour la spontanée (sinon l'ancienne valeur « offre » signifierait par erreur « entreprise précise »).

## Questions à trancher avant la maquette détaillée

- **Q1. La bascule offre vers spontanée est-elle visible et réversible, ou change-t-on vraiment la carte choisie ?** Recommandé : on ne change PAS la carte cliquée (ce serait désorientant et déclencherait les nettoyages de données), on calcule la situation réelle, on l'affiche en une phrase sur l'écran (« Vous n'avez pas collé d'offre : votre candidature sera présentée comme une candidature spontanée »), et l'assistant le redit dans son rappel des choix. Si la personne colle l'offre plus tard, tout redevient « offre ».
- **Q2. Que faut-il pour qu'une offre « compte » ?** Recommandé : le champ « Offre d'emploi » (texte ou lien) non vide. Une entreprise et un site sans offre = candidature spontanée vers cette entreprise.
- **Q3. Spontanée avec entreprise : que bloque-t-on ?** Recommandé : le poste et le nom de l'entreprise sont nécessaires pour continuer ; le site est conseillé (il sert à chercher les valeurs de l'entreprise) mais ne bloque pas. À confirmer.
- **Q4. Formulation des deux choix de la spontanée.** Proposition : « Je me présente de façon générale, sans viser une entreprise » et « Je m'adresse à une entreprise précise ».
- **Q5. Mode « domaine » avec l'objectif offre** : une offre vise un poste précis, « plusieurs métiers d'un même domaine » est incohérent avec une offre. À regarder (non traité ici).

## Plan en cases (provisoire, après validation des questions et de la maquette)

- [ ] 1. `[effort : haut]` Maquette détaillée des trois cas (offre, spontanée, changer de métier) dans le panneau Candidature, avec les phrases exactes.
- [ ] 2. `[effort : haut]` Une seule fonction « situation réelle de la candidature » (offre / spontanée avec entreprise / spontanée générale) ; grep de tous les usages de `typeRecherche` et de l'objectif avant de remplacer les lectures qui comptent.
- [ ] 3. `[effort : haut]` Écran : question masquée pour « offre », « (facultatif) » retiré, deux choix explicites pour la spontanée, bloc entreprise sans offre pour la spontanée, phrase de bascule visible.
- [ ] 4. `[effort : moyen]` Normalisation des sessions déjà enregistrées et remise à vide de `typeRecherche` au changement de carte.
- [ ] 5. `[effort : moyen]` Profil des prompts (`texteProfil`) : la situation réelle remplace la ligne « Objectif » quand l'offre manque ; alignement avec la règle de cohérence déjà ajoutée au prompt de la lettre.
- [ ] 6. `[effort : moyen]` Tests : `npm test`, essais de parcours (`scripts/parcours/parcours_smoke.js`), vérification navigateur dans les quatre écrans appelants (Mon projet, Bilan, Découverte, Préparer lettre / entretien), clair, sombre, 375 px.
- [ ] 7. `[effort : bas]` Documents : leçons, briques communes, état des chantiers.

## Verdict mode nuit

**NON APTE AU MODE NUIT** : les questions Q1 à Q5 et la maquette sont à trancher.
