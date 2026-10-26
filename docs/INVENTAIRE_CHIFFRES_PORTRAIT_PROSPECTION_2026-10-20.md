# Inventaire : chiffres d'entreprises du portrait annuel et ce que fournit la prospection (20/10/2026)

> Demande de Denis : savoir, SANS RIEN MODIFIER, quels chiffres le prompt du « Portrait annuel du territoire » (`outils/veille.html`, `assemblerPortrait`) demande à un assistant pour les entreprises, et lesquels la prospection fournit déjà. Lu dans le code le 20/10/2026. Cahier : `docs/CHANTIER_PROSPECTION_PONT_REPERAGE_PETITES_STRUCTURES_2026-10-20.md`.

## Ce que la prospection sait produire aujourd'hui (données officielles, sans assistant)
- **BODACC** (annonces légales, Dordogne et Haute-Vienne) : annonces de jugement d'ouverture de procédure collective, ventes de fonds de commerce, radiations (dont radiations d'office), créations ; sur 3 ou 12 mois, avec la même période un an plus tôt ; carte « Chiffres pour l'application » avec contrôle à la main sur une semaine.
- **Insee** : micro-entrepreneurs créés, par mois, pour la Dordogne, la Haute-Vienne et la France.
- **Enquête BMO** (France Travail) : projets de recrutement par métier et par **bassin d'emploi**, part jugée difficile.
- **Banque de France** (défaillances) : prévu, en attente de la clé de Denis.
- **Fichier Sirene** : établissements (ancienneté, secteur indicatif, forme) : des **établissements**, pas des emplois ; l'effectif est vide pour environ 81 % d'entre eux.

## Tableau
| Chiffre demandé par le portrait | La prospection le fournit ? | Détail |
|---|---|---|
| E1. Nombre de créations d'entreprises sur l'année | **Non, pas le même chiffre** | Le BODACC compte environ la moitié des créations de l'Insee (leçon 9.53). Les micro-entrepreneurs créés sont fournis (Insee), pas le total |
| E1. dont micro-entrepreneurs | **Oui** | Série Insee, Dordogne, Haute-Vienne, France, 12 mois |
| E1. Taux de création | **Non** | Aucun dénominateur (nombre total d'entreprises) dans les données lues |
| E2. Créations par grand secteur (5 familles), département, région, France | **Non** | Le détail par secteur de la prospection classe des annonces par mots-clés (21 secteurs, indicatif), pas les 5 familles de l'Insee, et pas la région ni la France |
| E3. Défaillances régionales, évolution, secteurs les plus touchés | **Non** | Département seulement. La Banque de France (région) est prévue, pas encore active |
| **E4. Défaillances par département : procédures ouvertes sur l'année, évolution** | **OUI, et mieux** | Annonces de jugement d'ouverture, 12 mois contre les 12 précédents, contrôlées à la main sur le site officiel. C'est déjà le chiffre publié dans « Les entreprises ici ». **Doublon** avec la ligne du prompt, qui demande à l'assistant de recompter lui-même (méthode qui avait surestimé de 3 à 4 fois) |
| E5. Poids du tourisme | **Non** | Aucune donnée d'emploi |
| T. Métiers en tension : 8 à 12 métiers avec le plus de projets de recrutement dans le DÉPARTEMENT + part difficile | **En partie** | BMO fournie par **bassin d'emploi** (Bergerac, Est Dordogne, Périgueux Nord-Est, Limoges, Bellac...), pas par département : un total départemental est possible à calculer, pas affiché aujourd'hui |
| T. 3 à 5 secteurs les plus en tension, niveau régional | **Non** | Pas de lecture régionale |
| A. Emploi par secteur, plus gros employeurs ; B. embauches ; C. salaires ; D. demandeurs ; F. habitants ; G. formation ; H. freins | **Non** | Hors du périmètre de la prospection (établissements, annonces légales) |

## Verdict
1. **Un seul vrai doublon : E4.** Les autres chiffres restent demandés à l'assistant, faute d'équivalent : les migrer ferait PERDRE ces chiffres.
2. **Aucune migration en bloc.** Rien n'est modifié.
3. **Risque à traiter si Denis le souhaite** : à la prochaine édition annuelle, la ligne E4 du prompt redemandera à l'assistant un chiffre que la prospection produit déjà et mieux. Remède minimal et sans perte : remplacer cette seule ligne par « reprendre le chiffre de « Les entreprises ici » préparé par l'outil de prospection » (un seul endroit touché, `[effort : bas]`), à décider par Denis.
4. Pistes d'enrichissement possibles (nouvelles fonctions, non demandées) : total départemental des métiers en tension (BMO), série régionale des défaillances (Banque de France, dès la clé).

## Suite : ligne E4 remplacée (20/10/2026, accord de Denis)
La ligne « défaillances par département » du prompt du portrait (`assemblerPortrait`, `outils/veille.html`) ne demande plus rien à l'assistant : « NE LES CHERCHE PAS et ne les recompte pas, n'écris AUCUNE entrée pour cet indicateur » ; le chiffre vient de l'outil de prospection (carte « Chiffres pour l'application ») et reste publié dans « Les entreprises ici ». Deux phrases voisines ont été ajustées pour ne pas se contredire : la consigne finale sur les défaillances ne vise plus que le niveau régional, et « une entrée pour CHAQUE indicateur » excepte celui-ci. Aucune autre ligne touchée, aucun test ne dépendait de cette ligne (1778 essais verts).
