# Chantier « Où et sous quel nom chercher » (titre de travail) - ouvert le 2026-09-29, Mode A

> **Statut : concept grossier + carte de faisabilité faits (étapes 1 et 2 de la méthode). Aucun code.** En attente des réponses de Denis (section 5) avant la maquette détaillée (étape 3).
> Maquette concept cliquable : `docs/MAQUETTE_OU_CHERCHER_CONCEPT_2026-09-29.html`.

## 1. Ce qui avait été recueilli (retrouvé le 2026-09-29)

Rien de plus que deux notes, dans `docs/IDEES_A_RECLASSER.md` (entrée du 2026-09-22 + complément du 2026-09-25). Aucune donnée, aucun fichier, aucun extrait de référentiel n'a été rassemblé. Origine : message de Denis du 2026-09-21 (session « Module de correspondance métiers »), resté sans réponse à cause de la limite d'usage, puis noté le 2026-09-25.

**Le besoin, en une phrase** : une personne dépose son CV pour savoir **où et sous quel nom chercher**, afin d'accroître ses chances. Deux réalités : (1) un même métier porte plusieurs appellations ; (2) des métiers de secteurs différents demandent les mêmes compétences. Second volet, à part : générer un CV par métier repéré (seuls le titre et l'accroche changent).

**Garde-fous déjà posés** : jamais un score, jamais un diagnostic sur la personne, formulation « pistes à regarder », ne pas dupliquer `modules/ats/` ni « Comparer mes pistes ».

## 2. Audit du code réel (ce qui existe)

| Sujet | Constat vérifié |
|---|---|
| Base métiers | `data/metiers.js` : **129 fiches**, 21 secteurs (`SECTEURS_APP`), code ROME sur environ 124 fiches, lien `lienFicheROME()` vers France Travail. |
| Appellations voisines | Champ `synonymes` : renseigné sur **29 fiches seulement**, vide sur 35 autres, absent du reste. **Le référentiel actuel ne porte pas les appellations voisines.** |
| Comparaison de compétences | `competencesCommunesAvecMetierVise()` (`js/app.js` ~9577) compare **deux fiches** entre elles, jamais un CV à tout le référentiel. Réutilisable comme idée d'affichage (« compétences en commun »), pas comme moteur. |
| Cartes de pistes | `carteMetierResumeHTML()` : « Garder comme Repère », « Comparer cette piste », « Fiche du métier ». **Réutilisable telle quelle** pour le bloc 2. |
| Modèle de module | Module « Famille 2 » (dépôt de CV + passage par l'assistant en ligne) : `modules/ats/`, `modules/regard-recruteur/`. Briques partagées : `ouvrirAssistantDepotCV`, `htmlVerificationDocument`, `htmlChoixAssistantBilanCorps`, `htmlBanniereTransitionIA`, `htmlCollageInstantane`, `extraireBlocJSONDepuisTexte`, `htmlEncartRepriseModule`. |
| Place sur l'accueil | Carte « Vous hésitez encore ? » (seule sous-carte actuelle : Comparer mes pistes) ou « Outils d'analyse ». |

## 3. Carte de faisabilité, élément par élément

| Élément du concept | Existe ? | Risque | Verdict |
|---|---|---|---|
| Dépôt, relecture/masquage, choix de l'assistant, collage de la réponse | Oui, briques partagées | Faible | Faisable tel quel |
| Bloc 1 « Le même métier sous d'autres noms » | Non (la base n'a pas les appellations) | **Moyen** : l'assistant peut inventer un intitulé qui n'existe pas | Faisable avec ajustement : l'assistant propose, chaque intitulé a un bouton « Chercher sur France Travail » pour vérifier ; on demande des intitulés et des lieux où on les voit, **jamais de codes ROME de mémoire** |
| Bloc 2 « Métiers proches dans d'autres secteurs » | Cartes oui, moteur non | **Moyen** : « d'autres secteurs » dépasse nos 129 fiches | Faisable avec ajustement : l'assistant propose librement, l'application rapproche ensuite de la base quand le nom correspond (`metierParNom`), sinon lien de recherche France Travail |
| « Retrouvé dans votre CV » (pourquoi cette piste) | Non | **Moyen** : ne jamais inventer une compétence absente du CV | Faisable : consigne stricte dans le prompt (citer uniquement ce qui est dans le CV), à tester sur plusieurs vrais CV |
| Bloc 3 « Mes mots pour chercher » (liste à copier) | Non, mais simple | Faible | Faisable |
| Boutons Repère / Comparer / Fiche du métier | Oui | Faible | Faisable tel quel |
| Sauvegarde (disquette) et reprise en cours | Oui, patron connu | Faible | Faisable |
| Recherche (accueil + Lexique) | Patron connu | Faible | À brancher dès la création |
| **Volet 2 : un CV par piste** | Touche le CV lui-même | **Élevé** | **GO AVEC RÉSERVES, à traiter en chantier séparé**, après le volet 1 (le Composeur en attente, `CHANTIER_COMPOSEUR_STRATEGIES_CV_2026-09-18.md`, est un préalable naturel) |

**Point franc** : sans base externe, la qualité des propositions dépend de l'assistant en ligne. On ne peut pas garantir qu'un métier proposé existe ou que son nom est exact. La parade (lien de vérification sur chaque intitulé + mention « pistes à vérifier ») rend le module utile et honnête, mais pas infaillible. Une vraie base d'appellations (ROME complet, environ 11 000 appellations) serait un chantier de données à part, à maintenir : je ne le recommande pas pour la première version.

## 4. Verdict préliminaire

**GO AVEC RÉSERVES** pour le volet 1 (les 3 blocs). Réserves : (a) qualité des propositions à tester sur de vrais CV avant de conclure ; (b) le volet 2 est un autre chantier.

## 5. Questions à Denis avant la maquette détaillée

1. **Volet 1 seul d'abord (Recommandé)** : c'est le besoin exprimé en premier (« où et sous quel nom chercher »), et il ne touche pas au CV. Le volet 2 viendrait après, sur un module qui aura fait ses preuves. Risque : aucun. Autre choix : les deux ensemble, plus long et plus risqué (le CV est la pièce la plus sensible de l'application).
2. **Où le placer sur l'accueil ?** Recommandation : carte « Vous hésitez encore ? », à côté de « Comparer mes pistes » (les pistes trouvées s'envoient dans le panier de comparaison). Risque : la carte devient plus chargée (2 entrées). Autre choix : « Outils d'analyse », plus cohérent avec le dépôt de CV mais moins avec le sens (c'est de l'exploration, pas une vérification de candidature).
3. **Le nom.** Titre de travail « Où et sous quel nom chercher ». Il est long mais dit exactement ce qui est fait. Alternatives à discuter : « Mes mots pour chercher », « Chercher autrement ».
4. **Le module part-il d'un métier tapé par la personne, ou seulement du CV ?** Dans le concept : métier facultatif (le CV suffit). Ça permet aussi aux personnes en reconversion sans métier précis d'utiliser le module.

## 6. Prochaines étapes (une fois les 4 réponses données)

- [ ] Étape 3 : maquette détaillée (écran par écran, textes définitifs, états particuliers : CV peu fourni, aucun métier proche trouvé).
- [ ] Étape 4 : audit complet contre `LANGAGE_VISUEL_COMMUN.md` et `BRIQUES_COMMUNES.md`, verdict par élément, puis verdict Mode Nuit.
- [ ] Prompt dédié (`prompts/ou-chercher.md`), mis au point sur plusieurs vrais CV.
- [ ] Code du module (`modules/...`), tests, vérification navigateur clair et sombre.
