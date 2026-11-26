# Chantier « Mon plan » (cadrage, ouvert le 26/11/2026)

Fichier de suivi vivant : l'état du chantier se lit ici. Rien n'est codé. Mode A, effort haut.

## Origine

- Consigne 608 : Denis retient l'option A. La méthode du prompt « stratège en développement personnel » (questions d'abord, un domaine à la fois, leviers, trois priorités, petites actions, obstacle et réponse prévue, point régulier) est reprise pour le public, dans la sphère professionnelle, avec un ton attentionné et sécurisant. Questions posées dans la page, un seul message envoyé à l'assistant.
- Consigne 609 : à part, une rubrique de « Bien utiliser l'IA » donne ce prompt tel qu'il est, en exemple de demande qui fait converser l'assistant. Ce n'est pas ce chantier.
- Consigne 610 : une seule étape, partagée entre « Ce qui compte pour moi » et « Explorer les métiers ». Pas de rubrique « questions à poser à son conseiller » : le point régulier se fait en questions ouvertes pour la personne, qui peuvent évoquer ce dont elle aimerait parler avec la personne qui l'accompagne, sans jamais mettre le professionnel en difficulté.

## Ce que le prompt d'origine devient

| Prompt d'origine | « Mon plan » |
|---|---|
| Phase 1 : questions sur dix domaines de vie, notes de 1 à 10 | Aucune nouvelle série de questions : les réponses viennent des cartes de « Ce qui compte pour moi » et de « Ma synthèse ». Quelques questions courtes seulement pour ce qui manque (voir plus bas). Aucune note. |
| Phase 2 : diagnostic (schémas, croyances, angles morts) | Supprimé. Remplacé par un court rappel « vous avez indiqué… », jamais « vous êtes ». |
| Phase 3 : vision à trois ans | Ce que la personne vise dans le travail, dans les mois qui viennent, avec ses mots. |
| Phase 4 : feuille de route sur 90 jours | Trois priorités au plus, puis un plan sur quatre semaines, une à trois petites actions par semaine. Pour chaque obstacle nommé par la personne : une réponse prévue. |
| Phase 5 : système d'exploitation | Un point de la semaine : quelques questions ouvertes pour soi (ce qui a avancé, ce qui a bloqué, ce que je garde pour la semaine suivante), et ce dont j'aimerais parler avec la personne qui m'accompagne, si je le souhaite. |
| Règles : franchise brutale, « soyez direct » | Ton simple, rassurant, sans jugement. Jamais de « bravo ». |

## Ce que l'étape lit (rien n'est redemandé)

1. **« Ce qui compte pour moi »** : les cartes gardées, et le papier « Ce qui revient dans mes cartes » s'il existe. La carte « Mon prochain petit pas » donne déjà une petite action et « qui peut m'aider » (voir la question 1).
2. **« Explorer les métiers »** : « Ma synthèse » gardée (jusqu'à trois métiers retenus, le niveau, le suivi choisi). Jamais le texte libre ni la lecture de l'assistant (même règle que la disquette).
3. **Répertoire des freins** (`data/freins.js`, 17 codes) : l'assistant classe les obstacles nommés par la personne dans un de ces codes, le code de l'application affiche les ressources (principe déjà en place : « l'assistant classe, le code garantit »). Un frein « vital » (logement, santé, violences, faim, addiction) passe avant le plan, comme dans « Regard extérieur ».

L'étape marche avec une seule des deux sources. Sans aucune des deux, elle propose de commencer par l'un des deux modules.

## Les questions posées dans la page (seulement ce qui manque)

À valider sur maquette, toutes « à compléter » :
- Ce que je vise dans le travail, dans les mois qui viennent (une ou deux phrases).
- Ce qui pourrait m'empêcher d'avancer (une à trois choses, avec mes mots).
- Le temps que je peux y consacrer chaque semaine (choix simple, sans minutes : un peu, un moment par semaine, plusieurs moments par semaine).

## Ce que la réponse de l'assistant contient

1. Un court rappel de ce que la personne a indiqué (« vous avez indiqué », « vous avez retenu »).
2. Trois priorités au plus, chacune reliée à ce qu'elle a écrit.
3. Le plan sur quatre semaines : une à trois petites actions par semaine, réalisables, sans dépense ni démarche lourde imposée.
4. Pour chaque obstacle nommé : une réponse prévue (« si… alors je… »), et le code du frein pour que l'application affiche les ressources.
5. Le point de la semaine : questions ouvertes pour la personne, et « ce dont vous aimeriez parler avec la personne qui vous accompagne », formulé du côté de la personne.
6. La phrase de prudence : ce plan reprend ce que vous avez écrit ; ce n'est ni un profil ni un diagnostic, et vous pouvez le changer quand vous voulez.

Interdits : score, note, profil, type de personne, diagnostic, « vous êtes », détails de santé, de couple ou d'argent, question qui teste ou interpelle le professionnel, date ou chiffre inventé.

## Audit du code (26/11/2026)

- Simple (reprise de l'existant) : lecture des cartes gardées et du papier (`modules/ce-qui-compte/logique.js`, `papier.js`, `document.js`) ; lecture de « Ma synthèse » gardée (`synPourFichier` dans `syntheseLogique.js`) ; passerelle déjà en place entre les deux modules (`cqcpmOuvrirDepuis`, `cqcpmHtmlPartieSynthese`) ; répertoire des freins et son affichage (Regard extérieur, Comparer mes pistes) ; circuit « copier la demande, coller la réponse ».
- Risqué : la demande sera longue (deux sources en plus des questions) ; il faut une demande qui marche avec une seule source ; la réponse doit être relue par le code (format fermé) comme pour le papier. Un nouveau prompt : Claude l'écrit, Denis le teste (consigne 532).
- Point à trancher (voir les questions) : la carte existante « Mon prochain petit pas » fait déjà une partie du travail (petite action, qui peut m'aider) et contient le champ « Une question à poser à mon conseiller ».
- Aucun point bloquant trouvé.

## Questions pour Denis (avant la maquette)

1. **« Mon prochain petit pas » et « Mon plan »** : TRANCHÉ le 26/11/2026 (consigne 611). Le plan reprend la petite action et « qui peut m'aider » sans les redemander ; le petit pas devient l'action de la première semaine. La carte ne change pas ; sans elle, le plan marche quand même.
2. **Le champ « Une question à poser à mon conseiller »** : TRANCHÉ le 26/11/2026 (consigne 615), adouci en « Ce dont j'aimerais parler avec la personne qui m'accompagne » (fait dans `data/cqcpmCartes.js`). Le plan reprend ce champ dans le point de la semaine.
3. **Où garder le plan** : TRANCHÉ le 26/11/2026 (consigne 618), les deux, sur le patron du papier « Ce qui revient dans mes cartes ». Le plan est toujours gardé sur la disquette et imprimable ; la personne peut en plus cocher « Joindre à Ma synthèse » : il apparaît alors comme une rubrique de la feuille imprimée de « Ma synthèse ». Il n'est JAMAIS envoyé à l'assistant qui écrit la synthèse (le plan vient après la synthèse, et la demande `ma-synthese.md` ne prend pas une seconde mission) : `prompts/ma-synthese.md` ne change pas.

## Maquette (26/11/2026)

`docs/maquettes/maquette-mon-plan-2026-11-26.html`, câblée, avec le style réel de l'application et le vrai répertoire des freins : sept écrans (bloc dans « Ce qui compte pour moi », bloc dans « Ma synthèse » avec « Joindre », préparer, passage avec l'assistant, le plan, le PDF, la feuille de « Ma synthèse »), situations (deux espaces, un seul, aucun ; petit pas ; papier ; frein qui passe avant ; source changée). Choix de forme déjà intégrés : le plan reprend le petit pas, le papier et les métiers retenus, cochés d'avance (pas les cartes une à une) ; trois questions ; le temps en une, deux ou trois actions par semaine ; joindre ou retirer seulement depuis « Ma synthèse », comme le papier. Les quatre questions ci-dessous sont TRANCHÉES le 26/11/2026 (consigne 619) : les quatre recommandations sont retenues.
1. Où vit le plan : page « Mon plan » à part, ouverte depuis les deux espaces (Recommandé), ou dans « Ce qui compte pour moi ».
2. Cases « Fait » sur les actions, gardées sur la disquette (Recommandé), ou plan à lire seulement.
3. Point de la semaine : trois questions fixes écrites par l'application (Recommandé), ou écrites par l'assistant.
4. Une réponse reprise change : plan gardé avec un message doux (Recommandé), ou retiré comme le papier.

## Code (26/11/2026, « Oui, on code ») : FAIT, module FERMÉ au public

Cinq commits sur `master` :
1. `69978f96` fonctionnement interne sans écran (`modules/mon-plan/logique.js`, `tests/monPlanLogique.test.js`).
2. `31320961` la demande `prompts/mon-plan.md` version 1 (écrite par Claude, **jamais essayée** : à essayer par Denis, consigne 532).
3. `2fd897c2` la page « Mon plan » (route `mon-plan`), le document imprimable, la disquette (`monPlan`).
4. `c32f69a7` le même bloc dans « Ce qui compte pour moi » et dans « Ma synthèse », « Joindre » dans « Ma synthèse » seulement, rubrique en dernier sur la feuille imprimée.
5. recherche de l'accueil (`data/baseConnaissancesERIP.js`), fiche du Lexique `mon-plan` (collection « Ce qui compte pour moi »), aide de la page (`AIDE_PAGES['mon-plan']`), brique B.81.

Interrupteur : `MPL_OUVERT = false` dans `modules/mon-plan/index.js` (visible seulement sur l'ordinateur de travail, comme « Ce qui compte pour moi »). Vérifié au navigateur avec une réponse fictive : préparer, passage, plan, cases, impression, effacer, disquette aller-retour, joindre et feuille, recherche, clair, sombre, 375 px.

## Essai réel fait par Claude à la demande de Denis (26/11/2026)

ChatGPT sans compte, deux situations fictives, demande envoyée telle que l'application la prépare, réponse recollée dans l'application.
- **Essai 1** (boulangerie ou rayon, sans permis, peur d'appeler, un moment par semaine, avec petit pas) : réponse acceptée du premier coup ; petit pas bien en tête de la semaine 1 ; sujet de discussion recopié en double par ChatGPT, retiré par l'application. Écarts de la réponse : semaine 3 avec une seule action au lieu de deux (permis : « sans jamais dépasser ») ; « employé de rayon » au masculin deux fois ; la peur d'appeler classée dans le frein « emploi » (sa fiche « Trouver ou garder un emploi » s'affiche, un peu à côté).
- **Essai 2** (magasin, logement menacé, ordinateur difficile, plusieurs moments par semaine, sans petit pas) : réponse acceptée ; trois actions par semaine ; logement : seulement « en parler à une personne de confiance », code `hebergement`, le bloc « Avant votre plan » s'affiche en premier avec le 115 ; ordinateur : code `illectronisme` juste ; formes inclusives respectées. Écart : la troisième priorité reste vague (« Avancer vers un emploi stable… »).
- **Défauts de l'application trouvés et corrigés** : « Si Je… , alors Je… » (majuscule au milieu de la phrase), « si » de tête retiré même dans un mot comme « Simplement », et une majuscule dans la demande (« Plusieurs moments par semaine »), commits `64ca3536` et `74b94d77`.
- La demande n'a pas été modifiée (consigne 532) : les écarts ci-dessus sont à juger par Denis.

## Suite

1. **Demande : gardée telle quelle** (décision de Denis du 26/11/2026, au vu de l'essai ci-dessus). Les écarts notés (genre « employé de rayon », frein « emploi » pour la peur d'appeler, priorité vague, une seule action en semaine 3) sont acceptés ; ne pas reproposer de retouche sans fait nouveau.
2. Titre « Ce que vous avez indiqué » : aux deux essais, la phrase de l'assistant commençait par « Vous visez… », sans répétition à l'écran. Sur la feuille imprimée, le titre « Ce que j'ai indiqué » est suivi d'une phrase à « vous » : **titre gardé** (décision de Denis du 26/11/2026), ne pas reproposer.
3. **OUVERT AU PUBLIC le 26/11/2026** (décision de Denis) : `MPL_OUVERT = true`, ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` et dans `data/nouveautes.js` (bouton « Essayer » vers la page `mon-plan`, carte « Boîte à outils »), même commit. « Ce qui compte pour moi » étant ouvert depuis le 25/11/2026, le bloc apparaît dans les deux espaces. Pour refermer : repasser `MPL_OUVERT` à false.
