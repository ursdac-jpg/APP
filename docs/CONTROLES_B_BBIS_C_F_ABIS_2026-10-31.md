# Contrôles A bis, B, B bis, C et F : relevé du 31/10/2026

> Relevé fait au navigateur (ordinateur portable 1280 px, mise à l'échelle 150 %, et téléphone 375 px) sur cinq écrans : accueil, « Vos informations », « Votre objectif » (offre choisie), « Vos documents » du CV, et le choix de l'assistant. Rien n'est tranché à la place de Denis : ce document donne les constats, des propositions chiffrées, et les décisions à prendre.
> Méthode : script de mesure (`scripts` du bac à sable de Claude, non versionné) qui parcourt chaque écran, classe les textes par taille réelle affichée et les boutons par apparence (fond, bordure, contraste).

## Corrections faites pendant le relevé (même passage, règle du 12/09/2026)

- **Accueil, puces des cartes** (« Créer un nouveau CV », « Reprendre mon CV », etc.) : 12,9 px, c'est-à-dire **30 % de tout le texte de la page d'accueil** sous 14 px. Passées à 14 px.
- **Accueil, pied de page** (Confidentialité, Liens utiles, Partager une information, Signaler un problème) : 42 px de haut sur téléphone, passés à 44 px.
- **Accueil sur téléphone** : la loupe de la barre de recherche passait sur le texte (la règle de la grande barre écrasait la marge laissée à la loupe) ; le grand titre était recouvert à droite par le bouton flottant. Corrigés : marge à gauche du texte, titre un peu plus petit avec marge symétrique, « voulez-vous » et « commencer ? » ne se coupent plus.

## A bis : cohérence des tailles et des polices

**Police** : une seule, Segoe UI, sur 100 % du texte des cinq écrans (Georgia n'apparaît, à 0 %, que dans l'aperçu du CV). Rien à harmoniser de ce côté.

**Tailles réellement utilisées** (ordinateur portable, racine à 17 px ; part du texte) :

| Écran | Tailles relevées |
|---|---|
| Accueil (avant correction) | 13 px : 30 % ; 16 px : 51 % ; 21 px : 8 % ; 48 px : titre |
| Votre objectif | 15 px : 64 % ; 17 à 20 px : 35 % ; 48 px : titre |
| Vos informations | 15 px : 53 % ; 17 à 20 px : 46 % ; 48 px : titre |
| Vos documents (CV) | 15 px : 94 % ; le reste 17 à 23 px |

Sur téléphone : corps 14 px, sous-titres 16 à 19 px, titre de page 32 px (maintenant 30 px sur l'accueil).

**Constat** : le corps de texte est maintenant homogène (14 px au minimum, 15 px sur portable). Ce qui reste dispersé, ce sont les tailles intermédiaires : 16, 17, 18, 19, 20, 21, 22 et 23 px selon les écrans, pour des rôles qui se ressemblent (sous-titre de bloc, titre de carte). Ce sont des dizaines de règles écrites une par une dans `css/style.css`, `css/mise-en-page-maquette.css` et les styles injectés par `js/app.js`.

**Proposition d'échelle courte** (valeurs en rem, elles suivent déjà l'agrandissement automatique du portable) :

| Rôle | Taille | Équivalent à 16 px de racine |
|---|---|---|
| Petit (aides, étiquettes, puces) | 0,875 rem | 14 px |
| Moyen (corps, boutons) | 1 rem | 16 px |
| Grand (titre de bloc, titre de carte) | 1,25 rem | 20 px |
| Très grand (sous-titre de page) | 1,5 rem | 24 px |
| Titre de page | 2,8 rem (1,9 rem sur téléphone) | 45 px |

- **Bénéfice** : une lecture identique d'un écran à l'autre, et plus aucune règle isolée à retoucher.
- **Risque** : modifier des centaines de règles d'un coup peut déplacer des mises en page ; à faire module par module, avec capture avant et après, jamais d'un seul passage.
- **Recommandation** : adopter l'échelle comme règle pour tout nouveau code et l'appliquer au fil des modules déjà retravaillés, sans chantier dédié. Décision de Denis attendue : accord sur les cinq valeurs.

## B et B bis : clarté des boutons, identifiables sur tous les écrans

**Relevé** (sur les cinq écrans, tous types de boutons confondus : boutons, jetons de choix, titres de blocs repliables) :

| Apparence | Nombre | Remarque |
|---|---|---|
| Bouton avec bordure (contour) | 10 à 215 selon l'écran | cas général, bien repérable |
| Bouton plein (couleur d'accent) | 2 à 19 | « Continuer », « Valider le CV » |
| **Sans fond ni bordure** | **9, tous dans « Vos documents » du CV** | la croix des messages d'aide, et les en-têtes de blocs repliables (« La mise en page ▾ », « Organisation du CV ⌃ », « En-tête de CV ⌃ », « Compétences ⌃ », « Expériences professionnelles... ») |
| Grisé (inactif) | 21 à 27 | boutons de choix déjà décochés ou indisponibles |

- **Les 9 boutons sans fond ni bordure** sont de grandes zones (60 à 69 px de haut) qui ressemblent à des titres : seule la flèche ▾ ou ⌃ dit qu'on peut cliquer. Pour des personnes peu à l'aise avec l'informatique, ce n'est pas assez. **Proposition** : un fond léger et un contour sur ces en-têtes, comme les autres boutons.
- **Contraste du texte bleu** : le bleu d'accent sur fond bleu très clair donne **4,0 sur 1** (le seuil conseillé pour du texte normal est 4,5 sur 1). Concerné : « Retour », « Accueil », « Revoir la présentation », la pastille d'étape déjà vue, et les options actives du panneau de mise en page ; « Modifier » et « Ajouter » sont à 4,3. **Proposition** : une teinte de bleu un peu plus foncée pour le texte posé sur fond bleu clair (variable commune, avec sa valeur du mode sombre). Risque : très faible, c'est un seul réglage. Décision de Denis : accord sur le bleu un peu plus foncé.
- **Taille** : les boutons font maintenant 44 px sur téléphone et tablette. Sur portable avec souris, ceux du panneau « La mise en page » restent entre 26 et 37 px (le bouton « Boutons plus grands » existe déjà).
- **Non relevé** : l'état au survol et au clavier (focus) n'a pas été mesuré ; à voir ensuite si Denis le souhaite.

## C : inventaire des fenêtres

**Chiffres du code** : 52 endroits ouvrent une vraie fenêtre (`ouvrirFenetreERIP`), plus 61 petites fenêtres de confirmation oui / non (`confirmerAction`), 9 panneaux guide (`ouvrirPanneauGuide`), une vingtaine d'appels de messages natifs du navigateur (`alert`, `confirm`, à vérifier un par un).

Les 52 fenêtres, classées par nature (classement fait à la main d'après le titre de chacune ; les effectifs par groupe ne sont pas comptés) :

1. **Aide et information** : À quoi sert cet écran (accueil et page), Visite guidée, Liens utiles, Confidentialité, démonstration vidéo, « Comment faire ? », bulle d'aide, « Trouver une structure », « Votre département », avertissement « Aucun domaine ciblé ». Normales en fenêtre : on les lit puis on referme.
2. **Saisie et relecture** : Vos expériences, Modifier cette expérience, Mes coordonnées, Candidature, Modifier mon CV, Cadrer ma photo, Vérifier les informations, Ajouter le complément du CV, Modifier la préparation à l'entretien, Modifier la version n, Points déjà ignorés, **Quelques passages à préciser**, Note du Carnet, Transformer en Repère. Ce sont celles qu'on voudrait pouvoir rouvrir : candidates à passer dans la page (le point 15 en traite une).
3. **Circuit de l'assistant** : Avant de continuer vers l'assistant, Choisissez votre assistant (Regard extérieur), Collez la réponse (Regard extérieur), Ce que l'assistant a préparé pour votre CV, Générer une proposition, Analyser ma candidature, et les onze fenêtres du module Regard extérieur (questions, catégories, freins, analyse...). **Plusieurs sont en contradiction avec la règle « minimiser les fenêtres »** : le circuit de collage et de choix de l'assistant existe déjà en page ailleurs.
4. **Confirmation et alerte** : Session importée, Tout effacer, confirmations. Normales en fenêtre.
5. **Détails de Repères, du Carnet et du Lexique** : fiches détaillées. Normales.

- **Ce qui n'est pas fait** : les captures d'écran de chacune des 52 fenêtres. Chacune demande de reconstituer l'état de l'application qui la fait apparaître (un CV chargé, une réponse collée, un assistant choisi...) ; je les prendrais par lots de 8 à 10, un thème à la fois. Dites-moi si vous les voulez, et par quel thème commencer.
- **Recommandation** : traiter d'abord le groupe 3 (circuit de l'assistant de Regard extérieur) et la fenêtre « Quelques passages à préciser » : ce sont celles où une fenêtre fait double emploi avec un écran déjà en page.

## F : explication de chaque étape (ce qui se passe, pourquoi, comment)

**Modèle retrouvé** :

- « **Ce qui se passe** » sur l'écran de collage (module commun `collage-reponse`) : ce que l'assistant vient de faire, écrit pour chacune des situations de collage (une vingtaine) (CV, lettre, entretien, Bilan, Cohérence, Comparer mes pistes, etc.). Ce bloc répond au « quoi », très peu au « pourquoi » ni au « comment ».
- « **Une fois X, vous faites Y** » entre deux blocs numérotés (brique `htmlLiaisonBlocs`, consigne 63) : déjà posé dans Reprendre mon CV, Reformuler, version rapide, lettre, entretien, Analyser ma candidature, Cohérence, Comparer mes pistes, Regard recruteur, ATS.
- Les quatre pastilles « **Copie, Propositions, Stratégie, Votre choix** » (`ETAPES_DETAIL_CHOIX_IA`) du choix de l'assistant : c'est probablement ce que Denis a vu dans l'un des premiers modules. Elles disent bien le « comment », moins le « pourquoi ».

**Constat** : le « quoi » est partout ; le « pourquoi » (à quoi sert cette étape pour la candidature) est le maillon manquant. Il est présent seulement dans les textes de liaison.

**Proposition** : ajouter à chaque texte « Ce qui se passe » une seconde phrase, « **Pourquoi c'est utile** » (une phrase simple, jamais de jargon), sans nouvelle fenêtre ni nouveau bloc. Effort moyen : Une vingtaine de textes à écrire et à faire relire par Denis. Risque : faible (des textes seulement). Décision de Denis : accord sur le principe « quoi + pourquoi », puis relecture des phrases par lots.

## Suite donnée le 31/10/2026 à la décision B (« Bleu et contours »)

- **Bleu** : nouvelle variable `--accent-texte` (le bleu d'accent mélangé à 15 % de noir ; orange : 30 % ; thèmes sombres : l'accent clair, inchangé). Elle remplace `color: var(--accent)` dans les deux feuilles de style (157 endroits) et dans les styles du code (16). Contraste mesuré : bleu 5,2 sur 1 sur fond bleu clair (avant 4,0), orange 5,1 (avant 2,8, le plus faible de tous), vert 5,7. Les fonds, bordures et boutons pleins gardent l'accent d'origine. Relevé final : plus aucun texte de bouton sous 4,5 sur 1 sur les cinq écrans ; captures vérifiées en bleu, orange et sombre.
- **Contours** : **correction du constat.** Les 9 « sans fond ni bordure » étaient des en-têtes posés dans une carte elle-même bordée (et teintée quand elle est fermée, règle du 29/09) : ils n'étaient pas invisibles comme je l'avais écrit. Seule vraie différence : le bloc « La mise en page » (et les blocs « assistant » repliés) n'avait pas le fond teinté des autres cartes fermées ; c'est fait. Aucun contour supplémentaire ajouté.

## Suite du 01/11/2026 : A bis et F FAITS (Denis : « tu commences dans l'ordre... pour en finir »)

- **A bis** : l'échelle de cinq tailles est posée comme jetons `--t-petit`, `--t-moyen`, `--t-grand`, `--t-tres-grand`, `--t-titre-page` dans `css/style.css` et comme règle pour tout nouveau code (`docs/LANGAGE_VISUEL_COMMUN.md`, section 3 bis). Choix conforme à la recommandation du relevé : les règles existantes ne sont PAS réécrites d'un coup (risque de déplacer des mises en page), elles s'alignent au fil des refontes de module.
- **F** : champ `pourquoi` ajouté à la fenêtre de collage, une trentaine de phrases écrites (une par module), affichées après « Ce qui se passe » dans le même paragraphe. Test ajouté (`tests/collageReponse.test.js`). Les phrases sont à relire par Denis lors de ses essais.

## Décisions attendues de Denis

1. **A bis** : accord sur l'échelle de cinq tailles ci-dessus.
2. **B** : FAIT le 31/10/2026 (voir ci-dessus).
3. **C** : veut-il les captures des fenêtres, et par quel groupe commencer (recommandé : le circuit de l'assistant de Regard extérieur).
4. **F** : accord sur l'ajout d'une phrase « Pourquoi c'est utile » à chaque « Ce qui se passe ».
