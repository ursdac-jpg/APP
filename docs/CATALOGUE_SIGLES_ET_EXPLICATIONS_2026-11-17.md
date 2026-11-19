# Module « Comprendre les métiers » : catalogue de sigles, explications des choix et phrase de confidentialité (à relire par Denis)

Créé le 17/11/2026, phase 0 du plan (`docs/PLAN_CLOTURE_COMPRENDRE_LES_METIERS_2026-11-16.md`). **Rien n'est codé.** Les rapprochements avec les fiches ont été vérifiés en lecture seule sur les 1 925 fiches de l'application.

## 1. Sigles à ajouter à la recherche

Beaucoup de sigles sont déjà écrits dans le nom ou dans les autres noms d'une fiche : **ASH, AES, AESH, AVS, ADVF, ATSEM, CIP, TISF, CESF, MNS, PNC, CRS, ASVP, ARM, DRH, DAF, DSI, IDEC, IBODE, IADE**. La recherche les trouve sans rien ajouter. Voici les sigles **absents** des fiches, à ajouter dans le catalogue :

| Sigle | Signification (écrite pour la personne) | Fiche(s) de l'application |
|---|---|---|
| AS | Aide-soignant ou aide-soignante | Aide-soignant |
| AMP | Aide médico-psychologique (métier regroupé avec d'autres dans « accompagnant éducatif et social » depuis 2016) | Accompagnant éducatif et social (AES) |
| VRP | Voyageur, représentant, placier : commercial qui se déplace chez les clients | Représentant en biens et en services auprès des entreprises ; Commercial itinérant en entreprise de commerce de gros (**rapprochement à confirmer**) |
| EJE | Éducateur ou éducatrice de jeunes enfants | Éducateur de jeunes enfants |
| ES | Éducateur ou éducatrice spécialisé | Éducateur spécialisé |
| ME | Moniteur éducateur ou monitrice éducatrice | Moniteur éducateur |
| ETS | Éducateur ou éducatrice technique spécialisé | Éducateur technique spécialisé |
| AP | Auxiliaire de puériculture | Auxiliaire de puériculture |
| IDE | Infirmier ou infirmière diplômé d'État | Infirmier |
| ASS | Assistant ou assistante de service social | Assistant de service social |
| AMA | Assistant maternel ou assistante maternelle | Assistant maternel |
| AED | Assistant ou assistante d'éducation (surveillance et aide dans un établissement scolaire) | Assistant pédagogique en milieu scolaire (**rapprochement à confirmer** : proche, pas identique) |
| CPE | Conseiller ou conseillère principal d'éducation | Conseiller principal d'éducation |
| PE | Professeur ou professeure des écoles | Professeur des écoles |

Écartés après vérification : SSIAP, OS, CHEF, AFPA (aucune fiche qui leur corresponde clairement).

### Pièges à gérer dans le code

1. **Deux fiches pour le sigle CIP** : « Conseiller en insertion professionnelle » et « Conseiller d'Insertion et de Probation (CIP) ». La recherche doit afficher les deux, avec la signification complète à côté.
2. **Sigles de deux lettres** (AS, ES, ME, AP, PE) qui ressemblent à des mots ordinaires : un sigle n'est reconnu que si **tout ce que la personne a tapé** est le sigle (majuscules ou minuscules, accents indifférents). « as » seul affiche « Aide-soignant », mais « as de la cuisine » reste une recherche de mots.
3. **Affichage** : au-dessus des résultats, une ligne « AS : aide-soignant » et le bouton de la fiche. La personne apprend ce que veut dire le sigle.
4. **À vérifier au moment du code** : que la recherche existante retrouve bien un sigle écrit entre parenthèses dans le nom d'une fiche (ASH, ADVF...).

## 2. Explications d'une phrase des sous-catégories de choix (texte de la maquette V2)

Ces quinze phrases sont déjà dans la maquette V2 ; elles sont reprises ici pour être relues d'un coup.

| Famille | Explication |
|---|---|
| Personnes | Les personnes avec qui vous aimeriez être en contact dans votre travail : un public, des collègues, des personnes à accompagner. |
| Matériels | Ce que vous aimeriez manipuler, utiliser ou préparer : des outils, des machines, des documents, des aliments, des matériaux. |
| Animaux | Les animaux ou le vivant dont vous aimeriez vous occuper. |
| Organisation, gestion, administration | Mettre de l'ordre, planifier, suivre des chiffres ou des dossiers, coordonner une équipe ou un projet. |
| Relationnel | Être en contact avec les gens : conseiller, accueillir, soigner, former, vendre. |
| Fabriquer et construire | Faire ou assembler quelque chose de ses mains : construire, monter, installer. |
| Cuisiner et servir | Préparer des repas ou des boissons, puis les servir. |
| Réparer et entretenir | Remettre en état, entretenir, nettoyer, s'occuper des plantes ou de l'environnement. |
| Transport et logistique | Déplacer, conduire, livrer, préparer des commandes, manutentionner. |
| Surveiller, manipuler, programmer | Veiller à la sécurité, réagir vite, tester, manipuler des produits, programmer. |
| Création et conception | Imaginer, dessiner, rédiger, concevoir quelque chose de nouveau. |
| En intérieur | Dans un lieu fermé : bureau, atelier, magasin, établissement de santé, cuisine, école... |
| À domicile | Chez des particuliers ou chez vous. |
| En extérieur | Dehors ou sur un lieu de plein air : chantier, champs, espaces verts, salles de spectacle ou de sport. |
| En déplacement | Sur la route, dans les gares, les aéroports, les ports ou les entrepôts. |

## 3. Phrase de confidentialité : vérifiée dans le code

**Ce que le code envoie réellement** : la fonction de suivi d'usage (`trackEvenement`, `js/app.js:24`) envoie seulement le **nom** d'un événement (par exemple le nom de l'outil ouvert) à l'outil de comptage Umami. Les erreurs techniques sont envoyées avec un message tronqué à 200 caractères et le nom de l'écran, jamais le contenu des champs. Le futur module ne doit envoyer **aucune réponse** : seulement des noms d'événements (par exemple « questionnaire commencé », « questionnaire terminé »), jamais un score, une lettre ou un choix.

**Phrase proposée** pour l'écran d'accueil du questionnaire, à la place du petit texte de la maquette :

> Vos réponses restent sur cet appareil : personne ne les reçoit. Seul votre résultat peut être gardé, dans la disquette, si vous le décidez.

**Condition** : cette phrase n'est vraie que si le code du module respecte la règle ci-dessus ; un test Node vérifiera qu'aucune réponse n'est transmise au suivi d'usage.

## 4. Autres écarts corrigés dans la maquette V2 (17/11/2026)

- Titre du questionnaire : « Découvrir mes préférences de métier » (au lieu de « Questionnaire d'intérêts »).
- Durée : « environ une demi-heure en tout » (au lieu de « 10 minutes par partie »), à confirmer par un essai chronométré.
- Tout ou rien : « Les quatre parties se font d'une traite : si vous quittez avant la fin, vos réponses ne sont pas gardées » (au lieu de « Vous pouvez vous arrêter quand vous voulez », qui contredisait la règle).
- Page des métiers proposés : bouton « Grouper par niveau d'accès » (trois groupes) et phrase « Vos choix sont très variés » au-delà de 20 choix.

## 5. Points à valider par Denis

1. Les 14 sigles et leurs significations (surtout VRP et AED, rapprochements à confirmer).
2. Les 15 explications de la section 2.
3. La phrase de confidentialité de la section 3.
