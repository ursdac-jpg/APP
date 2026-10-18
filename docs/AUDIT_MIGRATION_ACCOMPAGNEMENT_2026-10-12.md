# Mon territoire : audit de la migration du rayon « accompagnement » (phase 4) - 2026-10-12

> Audit du code et des données réels, effort élevé. **Décisions D12 à D15 : OUI aux recommandations de Claude (Denis, 2026-10-12). Migration faite le 2026-10-12 : voir le plan et `modules/mon-territoire/ARCHITECTURE_TECHNIQUE.md`.**

## 1. Chiffres
25 lignes de structures dans `modules/comprendre-le-cadre/contenu/accompagnement/accompagnement.collecte.md` : **16 déplacées** vers le répertoire, **1 fusionnée** (l'identifiant générique des Missions locales), **8 gardées** dans la collecte (4 services ou annuaires en ligne, décision D8 ; 4 structures de la Haute-Vienne, pas encore migrée). Aucune ligne n'est RETIRÉE.

| Structure (identifiant) | Portée | Date | Aussi dans | Étiquette proposée | Type |
|---|---|---|---|---|---|
| france-travail | national | 2026-09-06 | emploi | DÉPLACÉ | france-travail |
| mission-locale-perigord | 24 | 2026-09-06 | garde, jeunes, mobilite | FUSIONNÉ | (remplacé par les trois Missions locales réelles) |
| cap-emploi-dordogne | 24 | 2026-09-06 | emploi, handicap | DÉPLACÉ | cap-emploi |
| conseil-departemental-dordogne-insertion | 24 | 2026-09-06 | budget | DÉPLACÉ | collectivite-etat |
| structures-iae-dordogne | 24 | 2026-09-06 | emploi | DÉPLACÉ | siae |
| inae-nouvelle-aquitaine | region | 2026-09-06 | rien | DÉPLACÉ | siae |
| plie-et-maison-emploi-dordogne | 24 | 2026-09-06 | rien | DÉPLACÉ | plie |
| apec | national | 2026-09-06 | former | DÉPLACÉ | formation-orientation |
| asso-varlin-pont-neuf | 87 | 2026-09-08 | rien | GARDÉ (Haute-Vienne, pas encore migrée) | - |
| carto-inclusion-numerique | national | 2026-09-07 | rien | GARDÉ (service en ligne, D8) | - |
| asso-base-24 | 24 | 2026-09-08 | rien | DÉPLACÉ | siae |
| asso-la-main-forte-24 | 24 | 2026-09-08 | rien | DÉPLACÉ | siae |
| dora-services-insertion | national | 2026-09-07 | rien | GARDÉ (service en ligne, D8) | - |
| annuaire-acteurs-dordogne | 24 | 2026-09-07 | rien | GARDÉ (annuaire en ligne, D8) | - |
| asso-mission-locale-du-bergeracois-24 | 24 | 2026-09-07 | budget, former, garde, jeunes, mobilite | DÉPLACÉ | mission-locale |
| asso-mission-locale-du-grand-perigueux-24 | 24 | 2026-09-07 | budget, former, garde, jeunes, mobilite | DÉPLACÉ | mission-locale |
| asso-aleas-87 | 87 | 2026-09-08 | rien | GARDÉ (Haute-Vienne) | - |
| asso-france-alzheimer-24 | 24 | 2026-09-08 | rien | DÉPLACÉ | soutien-aux-familles |
| asso-unafam-24 | 24 | 2026-09-08 | rien | DÉPLACÉ | soutien-aux-familles |
| asso-unafam-87 | 87 | 2026-09-08 | rien | GARDÉ (Haute-Vienne) | - |
| figem-annuaire-gem | national | 2026-09-07 | rien | GARDÉ (annuaire en ligne, D8) | - |
| asso-reseau-alliage-87 | 87 | 2026-09-08 | rien | GARDÉ (Haute-Vienne) | - |
| asso-croix-marine-24 | 24 | 2026-09-08 | rien | DÉPLACÉ | sante-soins-addictions |
| asso-saveurs-du-bois-du-roc-24 | 24 | 2026-09-08 | rien | DÉPLACÉ | siae |
| asso-geiq-24 | 24 | 2026-09-08 | rien | DÉPLACÉ | siae |

## 2. Ce que l'audit a trouvé

**2.1 Les zones des Missions locales ne sont pas connaissables par les sources publiques (point bloquant pour le comportement « selon votre commune »).**
- Le site de la Mission locale du Bergeracois (vérifié le 2026-10-12) **n'indique aucune zone** : ni liste de communes, ni intercommunalités, ni antennes. Il donne seulement son adresse (Bergerac) et un téléphone.
- Les sources publiques divergent : 128 communes (contrat du Grand Bergeracois, 4 intercommunalités), 112 (périmètre du SCoT), et les « 145 communes » de nos propres textes, que je n'ai pu confirmer nulle part. Les Missions locales sont des associations dont la zone est fixée par les communes et agglomérations qui les administrent : seule la structure peut la donner.
- La Dordogne compte peut-être **plus de trois Missions locales** : nos données en citent trois (Bergeracois, Grand Périgueux, Périgord Noir). Je n'ai pas pu vérifier si une partie du département (Ribéracois, Nontronnais...) en a une autre. **À demander aux partenaires.**
- **Conséquence** : remplir « communes desservies » reviendrait à deviner, au risque d'envoyer quelqu'un à la mauvaise structure. L'option C retenue (« si la zone est inconnue : toutes les structures du type, avec selon votre commune de résidence ») couvre ce cas : on s'en sert donc honnêtement.

**2.2 Quinze des vingt-cinq structures sont partagées avec d'autres rayons non migrés** (Mission locale du Bergeracois dans cinq rayons, France Travail, Cap emploi, APEC, le conseil départemental...). Leur description est propre à chaque rayon (la Mission locale n'est pas décrite pareil en Budget et en Mobilité), mais leur adresse et leur date de vérification devraient être uniques. Sans précaution : deux dates à tenir, exactement la double vérification à éviter.

**2.3 Le Lexique contient des renvois codés en dur** (`_LEXIQUE_RENVOI_LOCAL_PAR_FICHE`, `modules/lexique/index.js`) : pour `mission-locale` et `plie`, une adresse du Bergeracois pour toute la Dordogne (un habitant de Périgueux est renvoyé vers la Mission locale du Bergeracois). Le bouton `data-lexique-renvoi-local` appelle `_lexiqueRenvoiLocalParFiche`. À remplacer par la lecture du répertoire.

**2.4 Quatre lignes ne sont pas des lieux** (DORA, carte de l'inclusion numérique, FIGEM, annuaire des acteurs du Conseil départemental) : services ou annuaires en ligne, gardés dans la collecte (D8), donc toujours affichés dans « Près de chez moi ».

**2.5 Trois entrées sont génériques** : `mission-locale-perigord` (Missions locales du Périgord, citée dans quatre rayons), `structures-iae-dordogne` et `plie-et-maison-emploi-dordogne`. La première double les trois Missions locales réelles ; les deux autres décrivent un dispositif (IAE, PLIE) et n'ont pas d'équivalent précis.

**2.6 Haute-Vienne : 4 structures restent dans la collecte** et continuent de s'afficher comme aujourd'hui (le chargeur mixte l'assure déjà).

## 3. Décisions à prendre (recommandations de Claude en premier)

**D12 : les zones des Missions locales.**
- **A (recommandé)** : ne pas remplir les zones pour l'instant. Pour une commune connue, on affiche les Missions locales de la Dordogne avec « selon votre commune de résidence » et le téléphone de chacune. On demande les zones aux partenaires (entretien du 2026-10-15 : une Mission locale y sera représentée) ou par téléphone, puis on les ajoute avec la date. *Bénéfice* : aucun risque de mauvais guichet. *Risque* : la personne doit lire la phrase et choisir.
- B : remplir avec les intercommunalités des documents publics (Bergeracoise, Portes Sud Périgord, Bastides, Montaigne = 128 communes), marquées « à confirmer ». *Bénéfice* : réponse précise tout de suite. *Risque* : un habitant d'une commune hors liste, ou une zone erronée, est mal orienté ; je ne peux pas le vérifier.

**D13 : les entrées génériques.**
- **Recommandé** : fusionner `mission-locale-perigord` dans les trois Missions locales réelles (on **ajoute** la Mission locale du Périgord Noir à ce rayon : un habitant de Sarlat ne la voyait pas ici) ; garder `structures-iae-dordogne` et `plie-et-maison-emploi-dordogne` telles quelles.
- Alternative : tout garder tel quel. *Bénéfice* : zéro changement. *Risque* : un doublon de Mission locale reste affiché.

**D14 : l'adresse et la date des structures partagées.**
- **Recommandé** : le répertoire devient la seule source de l'adresse et de la date pour toutes les structures qu'il contient, **même dans les rayons pas encore migrés**, qui gardent leur propre description. Une seule date à tenir, aucune perte pour ces rayons.
- Alternative : laisser les deux. *Risque* : double vérification, dates qui divergent.

**D15 : le Lexique (Mission locale et PLIE).**
- **Recommandé** : le bouton local de ces deux fiches affiche les structures du répertoire pour la Dordogne (les trois Missions locales, avec « selon votre commune ») au lieu d'une adresse du Bergeracois pour tout le département. L'adresse du PLIE du Bergeracois (vérifiée le 2026-08-29) devient une fiche du répertoire.
- Alternative : ne pas toucher au Lexique. *Risque* : le renvoi du Lexique reste faux pour la moitié de la Dordogne.

## 4. Plan de réalisation proposé (après validation) `[effort : haut]` puis `[effort : moyen]`
1. Fichier des zones (vide pour les Missions locales tant que D12 = A) et lecture « commune connue, zone inconnue » (option C) : `[haut]`.
2. Lignes de `lieux.txt` pour les structures déplacées, vérification adresse par adresse avec le registre : `[moyen]`.
3. Chargeur : rayon migré lit le répertoire ; rayons non migrés lisent adresse et date du répertoire pour les structures qu'il contient (D14), tests de parité : `[haut]`.
4. Lexique : lecture du répertoire pour `mission-locale` et `plie` (D15), grep sur tout le dépôt : `[haut]`.
5. Retrait des anciennes lignes de la collecte (après validation de Denis) et des adresses devenues inutiles du registre : `[bas]`.
6. Essais navigateur et rejeu des sept parcours : `[moyen]`.

## 5. Risques et verdicts
- **Aucun point bloquant technique.** Le point bloquant est une **donnée** (les zones), traité par l'option C.
- **Simple** : lecture d'un fichier texte, mécanisme déjà prouvé sur le Logement.
- **Risqué** : la fonction partagée du Lexique ; le changement de lecture des rayons non migrés (D14).
- **Verdict mode nuit** : NON APTE tant que D12 à D15 ne sont pas tranchées.
