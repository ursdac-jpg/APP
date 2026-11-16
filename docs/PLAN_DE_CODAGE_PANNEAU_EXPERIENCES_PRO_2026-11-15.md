# Plan de codage : panneau « Vos expériences professionnelles » et page « Vos missions et compétences » (2026-11-15)

> Décisions de Denis : consignes 365, 388, 389, 390. Maquette validée dans l'esprit : `docs/MAQUETTE_PANNEAU_EXPERIENCES_PRO_2026-11-15.html`. Dossier de départ : `docs/CHANTIER_PANNEAU_EXPERIENCES_PRO_2026-11-15.md`. Plan du chantier déjà codé : `docs/PLAN_DE_CODAGE_MISSIONS_COMPETENCES_2026-11-14.md`.
> **Statut : audit fait, plan écrit, feu vert de Denis le 15/11/2026 (« d'abord coder le panneau »). Lot 1 FAIT (brique `etape.js`, `tests/missionsCompetencesMetiersPlus.test.js`). Lot 2 FAIT le 15/11/2026 (`modules/missions-competences/panneau.js`). Prochain : lot 3.**

## Le principe (consigne 390)

- **Le panneau regarde le PASSÉ** : la personne indique le maximum de ce qu'elle a fait (métiers, missions, compétences, ses mots).
- **La page regarde la CIBLE** : elle vérifie, retire les doublons, garde en tête le métier visé, met en avant ce qui compte pour lui parmi ce que la personne a déjà validé, et propose les missions et compétences attendues pour ce métier si la personne en a l'expérience.
- **Traçabilité** : on sait ce qui vient du panneau. Deux cas : la personne est passée par le panneau (la page reprend ses choix) ou non (CV venu d'ailleurs : la page lui laisse sélectionner ce qu'elle a déjà exercé).

## Audit du code réel : ce qui existe déjà (à réutiliser)

1. **Une seule mémoire** : `dossier.etapeMC` (`modules/missions-competences/etape.js`). Missions cochées par expérience (`miss`, `perso`, `modif`), compétences cochées (`comp`, `compPerso`, identifiants d'expérience plus `g` = toutes et `h` = hors expériences), `fiches[id]` = **un seul** code de fiche par expérience. `mcAppliquerAuDossier` écrit ensuite dans `experience.missions` (texte, une ligne par mission) et dans les trois listes du CV (`competencesCV`, `savoirEtreCV`, `savoirsCV`), sans doublon, et ne retire que ce qu'elle a écrit (`etat.ajoute`).
2. **La page fait déjà la plus grande partie du travail « cible » pour les compétences** (`ui.js` 200 à 300, `etape.js` 380 à 540) : onglet « Métier visé » avec bilan (« 9 sur 16 compétences du métier visé déjà choisies »), rubrique « Proposées par vos expériences » (avec l'expérience d'origine) et rubrique « À cocher si vous les avez déjà pratiquées » (les plus courantes d'abord), classement qui met le métier visé en premier (`mcRanger`), pastille « métier visé », compétences uniques (`mcCompetencesChoisies`), récapitulatif « Votre CV, tel qu'il se construit », limite conseillée 8 à 12 compétences.
3. **Le cas « pas passé par le panneau » est déjà couvert** : la page cherche la fiche de chaque poste, propose ses missions et compétences, la personne coche. C'est exactement le comblement du trou pour un CV venu d'ailleurs.
4. **Les identifiants d'expérience tiennent** : `idEtape` posé par `mcAssurerIds`, repris par `mcRelier` ; la modification d'une expérience dans le panneau fusionne les champs (`Object.assign`) donc ne perd pas l'identifiant ; le crochet `mcApresValidationExperience` existe déjà.
5. **Les mois sont déjà prévus dans le format des dates** : `modules/cv-core/dates.js` lit et formate « AAAA-MM » (affichage « sept. 2023 »). Le panneau actuel limite seulement la saisie à 4 chiffres.
6. **Le prompt** : `prompts/cv-choix-personne.md` (lot 7) est ajouté au message du CV seulement quand la personne a fait des choix.

## Ce qui manque (le vrai travail)

| Manque | Où | Difficulté |
|---|---|---|
| Plusieurs métiers par expérience (jusqu'à 5) : `fiches[id]` n'en garde qu'un | `etape.js`, `ui.js` | moyenne |
| Savoir si un choix vient du panneau (traçabilité) | `etape.js`, panneau, page | faible |
| Le panneau lui-même (suggestions, secteur, missions, compétences, garde-fou, mois, boutons) | `js/app.js` | haute (le plus gros morceau) |
| Les **missions** attendues pour le métier visé : l'onglet « Métier visé » ne traite que les compétences | `etape.js`, `ui.js` | moyenne, **maquette d'abord** |
| La page recadrée (titre, texte, « reprise des choix du panneau », doublons signalés) | `ui.js` | moyenne |
| Mettre en avant dans le prompt (plus recherchées, offre d'emploi) | `prompts/`, `js/app.js` | moyenne, **après** |

## Ce qui est simple, risqué, bloquant

- **Simple (reprise de l'existant)** : traçabilité, mois, suggestions (même fonction que la barre de l'accueil, `rechercherMetiersPourAjout`), compétences uniques, la page pour le cas « pas passé par le panneau ».
- **Risqué** :
  1. **Le panneau est partagé par quatre contextes** (`CONFIG_BLOC_EXPERIENCES_PRO`) : « Vos informations » (création), « Corriger mon CV » (reprise), la fenêtre « Modifier mon CV » du Bilan, l'étape 9 de « Découvrir mes compétences ». Il faut décider où le nouveau panneau s'applique et le paramétrer, jamais le dupliquer. Test navigateur dans chacun.
  2. **Étendre la mémoire à plusieurs métiers** touche `etape.js`, couvert par une douzaine de fichiers de tests (`missionsCompetences*.test.js`) : à adapter avec soin, sans changer le comportement des dossiers existants.
  3. **Le panneau est dans `js/app.js`**, non couvert par les tests Node : test navigateur à chaque sous-étape.
- **Bloquant** : aucun. **Point à trancher avant le lot 5** : où va une mission attendue du métier visé que la personne dit avoir déjà faite (dans quelle expérience ?). Cela demande une maquette et une décision de Denis.

## Lots, dans l'ordre

Chaque lot : `npm test` vert, test navigateur si `js/app.js` ou `ui.js`, un commit, ligne de journal si visible.

- **Lot 1 `[effort : haut]` FAIT le 15/11/2026 (12 tests, 2 979 verts) : mémoire, plusieurs métiers et traçabilité** (`etape.js`, tests). `metiersPlus[id]` (jusqu'à 4 autres codes), fusion des fiches d'une expérience sans doublon (propositions de missions et de compétences), marque d'origine « panneau » par expérience et par élément, rétrocompatibilité des dossiers existants (champ absent = comportement actuel). Aucun écran.
- **Lot 2 `[effort : haut]` FAIT le 15/11/2026 : le panneau, dans « Vos informations » seulement** (nouveau fichier `modules/missions-competences/panneau.js`, branché dans `js/app.js`). Suggestions pendant la frappe, métier et secteur, jusqu'à 5 métiers, missions et compétences à cocher, zones « avec vos mots », garde-fou et compteurs, case « mois », boutons « Annuler » puis « Je valide » (règle de la consigne 389 : nouvelle expérience = intitulé plus une compétence ; expérience existante = intitulé seul), texte d'origine conservé. Écrit dans `dossier.etapeMC` par la brique du lot 1.
- **Lot 3 `[effort : moyen]` FAIT le 15/11/2026 (Corriger mon CV : panneau ; Bilan, Un CV plusieurs métiers et Découverte : ancien formulaire gardé, consigne 393) Les autres contextes** : « Corriger mon CV » (le panneau remplace le bouton « Compléter avec la fiche du métier »), Bilan, Découverte. Une décision par contexte, avec Denis si besoin.
- **Lot 4 `[effort : moyen]` FAIT le 15/11/2026 : La page recadrée** (`ui.js`) : reprise visible des choix du panneau (« Choisi dans Vos informations »), doublons retirés et annoncés, texte et titre de la page, cas « pas passé par le panneau » inchangé.
- **Lot 5 `[effort : haut]` Missions attendues pour le métier visé** FAIT le 15/11/2026 (maquette `docs/MAQUETTE_MISSIONS_METIER_VISE_2026-11-15.html`, consigne 394 : la personne choisit l'expérience) : **maquette et questions à Denis d'abord**, puis code. Onglet « Métier visé » étendu aux missions.
- **Lot 6 `[effort : haut]` FAIT le 15/11/2026 (consigne 395, choix de Denis : propositions à cliquer ; missions seulement, les compétences sont déjà classées par `competencesAValoriser` ; essais réels du prompt à Denis) Le prompt** : mettre en avant, parmi les choix, les plus recherchées pour le métier et celles qui répondent à l'offre ; ne rien ajouter d'invisible. Dépend des lots 2 et 4. Essais réels de Denis.
- **Lot 7 `[effort : moyen]` FAIT le 16/11/2026 (recherche de l'accueil, aides de « Vos informations » et de « Vos missions et compétences », leçons 9.171 et 9.172) Finitions** : aides contextuelles, recherche (accueil et Lexique), `BRIQUES_COMMUNES.md`, leçons, journal. Ligne « Nouveautés » et mise sur GitHub : seulement à votre signal.

## Décisions déjà prises (ne pas rouvrir)

Option 1 (consigne 390) ; chiffres du garde-fou et libellés : propositions de la maquette, à confirmer par Denis à l'essai (missions 5 à 8, avertissement au-delà de 10 ; compétences 6 à 10, avertissement au-delà de 12) ; entreprise et dates en cadre gris foncé, intitulé en orange ; la page garde le titre « Vos missions et compétences » sauf avis contraire.
