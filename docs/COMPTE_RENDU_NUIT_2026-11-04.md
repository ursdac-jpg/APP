# Compte-rendu de la nuit du 04/11/2026 (mode Nuit, réponses du Cloud)

Commit de départ : `224ba544`. Rien de poussé. Plan détaillé : `docs/PLAN_NUIT_2026-11-04_REPONSES_CLOUD.md`.

## Fait (chaque point est un commit, tests verts, contrôle du Lexique sans erreur)

- **Les 9 fiches en écart** corrigées d'après les pages officielles relues (RSA, accompagnement, coopérative d'activité, armées, aides à l'embauche, ESAT, Épide, droit au logement opposable, mise à la retraite).
- **Seconds niveaux du Lexique** : lots 1 à 11, soit environ 170 mots, chacun écrit après relecture de la page officielle (aucun chiffre dans les textes). Plusieurs textes du Cloud ont été corrigés quand la page lue disait autre chose (autorisation de travail, dispense de prévoyance, conseiller extérieur à l'entretien préalable, lourdeur du handicap, etc.).
- **Fiche « Qui accompagne vers l'emploi »** : le délai de « six semaines » retiré, car aucune des deux pages du ministère du Travail relues ne le mentionne.

## Pas fait / bloqué, et pourquoi

1. **58 fiches « NON VERIFIE » sur 59 : non vérifiées.** Les sources de beaucoup d'entre elles sont des sites qui bloquent les robots ou des documents sans adresse enregistrée ; je n'ai pas voulu cocher « à jour » sans avoir lu. Liste dans le plan, section 2. Points à regarder en premier : « 22 août 2026 » (clause sociale obligatoire, source economie.gouv.fr bloquée), GEIQ de Bergerac, Visale et Loca-Pass, « contester une décision ».
2. **12 nuances sur les textes principaux du Lexique** : non appliquées (plan, section 4).
3. **Mots du Lexique sans second niveau** parce que la page n'a pas pu être lue :
   - Caf (le site refuse les robots, y compris via Chrome) : plafond-de-ressources, quotient-familial, creche-avip, relais-petite-enfance, declaration-de-ressources.
   - Onisep (refus) : ecole-de-production, psad.
   - Documents PDF illisibles : obligation-de-formation (eduscol), pension-de-famille et siao-115 (ministère du Logement), levee-d-ecrou (ministère de la Justice).
   - Autres : obligations-employeur-embauche (connexion Urssaf coupée, à réessayer), plateforme-mobilite (page Dora).
   - Les mots « à ouvrir par moi » de la première partie (aide-materielle, epicerie-sociale, heures-d-insertion, non-recours, parrainage-vers-l-emploi, personnes-invisibles, numero-unique-enregistrement, pajemploi, atelier-sociolinguistique, fonds-d-aide-aux-jeunes, o2r, metier-en-tension, garantie-de-pret, francais-a-visee-professionnelle, clause-d-execution-ou-critere-d-attribution, reste-a-vivre, accueil-de-jour, auto-ecole-sociale, garage-solidaire, geiq, mam, point-conseil-budget).
   - Les 11 mots de psychologie sans page officielle : volontairement non traités.

## Pour Perplexity (aucun compte requis de ma part : à vous de voir si vous le faites)

Trois messages possibles, chacun demandant à Perplexity de lire la page et de recopier les phrases utiles sans rien ajouter :

- **Message 1, pages de la Caf** : plafond de ressources du RSA (page « Le revenu de solidarité active » de la Caf), quotient familial Caf et impôts (« Quotient familial Caf, impôts : quelles différences »), crèche Avip (« Une crèche Avip pour faciliter la recherche d'emploi »), relais petite enfance (« Les relais petite enfance, c'est quoi »), déclaration de ressources.
- **Message 2, Onisep, Urssaf, PDF** : Onisep (« Décrochage : les établissements pour reprendre des études », « Obligation de formation : accompagner les jeunes de 16 à 18 ans »), Urssaf (déclaration préalable à l'embauche), PDF eduscol (boîte à outils obligation de formation), fiches pratiques du ministère du Logement (pensions de famille, SIAO), guide Justice sur la levée d'écrou, page Dora de la plateforme mobilité.
- **Message 3, mots « à ouvrir »** : les liens listés dans les réponses du Cloud (DARES métier en tension, economie.gouv.fr garantie de prêt et guide des aspects sociaux, Banque de France reste à vivre, sécurité routière auto-école associative, flyer mobilités inclusives, Dora GEIQ, guide des maisons d'assistants maternels, mesquestionsdargent.fr points conseil budget, monemploi français à visée professionnelle, guide SIAO accueil de jour).

## Reprise

Prochaine séance : vérifier les fiches par rayon (ouvrir la page, corriger seulement si elle le justifie), appliquer les 12 nuances, puis intégrer les retours de Perplexity.

## Complément (suite de la nuit) : vérification des 94 fiches du Cloud

- Commits `9f680110` et `68f8c0f7` : 25 fiches recoupées sur les pages officielles lues par moi et corrigées (ce qui n'était pas sur la page a été retiré ou assouplie, avec une ligne `revisions` datée du 04/11/2026). Le verdict « A JOUR » du Cloud n'était pas fiable : plusieurs fiches « à jour » contenaient des éléments absents des pages.
- **Reste à vérifier** (pages bloquées ou lecture partielle) : fiches dont la source est la Caf (RSA et prime d'activité), economie.gouv.fr et travail-emploi.gouv.fr (lisibles seulement via Chrome, refus de changement de domaine), CESU, licenciement (deux fiches), obligations de santé et sécurité des employeurs, résidences sociales et FJT, mobilité sans voiture (la page Carte Solidaire ne confirme pas gratuité ni transport à la demande). À donner à Perplexity ou à relire à la main.
- **Fiches du Cloud encore non relues** : une trentaine de fiches « NON VERIFIE » (liste dans `scratchpad/fiches94.json`, non conservée dans le dépôt : à refaire depuis le plan, section 2).
- Les 12 nuances sur les textes principaux du Lexique : toujours à appliquer.
- **Phrase sans chiffres après six mois + répertoire des fiches dans l'outil de veille** : plan à valider par Denis avant tout code (voir la réponse de fin de séance).

## Phrase après six mois et répertoire de veille (plan validé par Denis)

- Fait : (1) filtre « À chiffres, à revérifier (plus de 6 mois) » et compte dans l'avertissement de l'onglet des fiches de l'outil de veille ; (2) avertissement automatique, sans chiffre, en haut d'une fiche qui cite des chiffres et dont `verifie_le` a six mois ou plus (`_comprendreLeCadreFichePerimee`, testé, vérifié dans le navigateur). Aucune fiche n'est périmée aujourd'hui (la plus ancienne date du 14/09/2026) : l'avertissement apparaîtra à partir de mars 2027.
- Choix à signaler : je n'ai PAS écrit 110 phrases de repli fiche par fiche (le corps d'une fiche ne se remplace pas par une phrase sans perdre l'essentiel). L'avertissement général fait le même travail pour la personne. Un champ de repli par fiche reste possible si Denis le souhaite.
- Contrôle automatique « pas de chiffre sans repli » dans `npm test` : non fait, sans objet avec ce choix.

## Fin de matinée du 04/11/2026 : état final

- **Fiches du Cloud relues et corrigées : 80 sur 94** (commits `9f680110` à `e4056bbc`). Règle suivie : ce qui n'est pas sur la page lue est retiré ou assoupli, jamais gardé de mémoire. Date de vérification inchangée quand la page ne couvrait presque rien de la fiche (compétences de base, aide à la création, garages solidaires, horaires décalés).
- **Pas relues (pages bloquées, voir `docs/MESSAGES_PERPLEXITY_2026-11-04.md`)** : RSA et prime d'activité (Caf), crèches Avip (Caf), CMG et famille monoparentale (Urssaf, deux fiches), mutuelle obligatoire (Urssaf), O2R et loi plein emploi, abandon de poste, égalité professionnelle, seuils du CSE, prépa-apprentissage et écoles de production, ateliers de français pour les parents. Les deux fiches « droit au compte » et « armées » avaient été confirmées avant.
- **Points à confirmer sur des pages dédiées** (retirés ou laissés tels quels, listés dans les lignes `revisions` de chaque fiche) : Tese de l'Urssaf, déclaration préalable à l'embauche, microcrédit et primes véhicule, résidences sociales et intermédiation locative, 115 et accueils de jour, Institut de l'Engagement et Agefiph, réseaux BGE, ADIE, Initiative France et France Active, CARSAT, garages solidaires et plateformes mobilité, ordre des recours aux droits du travail, date d'obligation de la clause sociale (22 août 2026, retirée).
- **Nuances du Lexique : 10 sur 12 appliquées.** Restent : plateforme-mobilite (la page Dora ne décrit pas la plateforme) et siao-115 (PDF illisible).
- Phrase sans chiffres après six mois et filtre de veille : faits (voir plus haut).

## Suite : réponses de Perplexity intégrées (04/11/2026)

- Quinze fiches de plus corrigées d'après les phrases recopiées par Perplexity (RSA et reprise d'emploi, crèches AVIP, CMG, élever seul son enfant, O2R, abandon de poste, égalité professionnelle, prépa-apprentissage et écoles de production, CSE, mutuelle, embauche, français près de chez soi, GEIQ, clause sociale). Tout point que les pages ne confirment pas a été retiré ou assoupli.
- Quatre fiches passées en OBSOLÈTE (statut « retire », texte conservé, retirées de l'application) car aucune page n'a confirmé leur contenu : lecture et écriture (compétences de base), créer son activité (se faire accompagner), garages et locations solidaires, garde à horaires décalés ou en urgence. Pour les remettre en service : outil de veille, filtre « Retirées », statut repassé à « actif » après vérification (le message 4 pour Perplexity sert à cela).
- Lexique : huit textes principaux ajustés (GEIQ, SIAO et 115, pension de famille, école de production, obligation de formation, PSAD, plateforme de mobilité, levée d'écrou). Il ne reste aucune des douze nuances prévues.
- Fichier `MESSAGES_PERPLEXITY_2026-11-04.md` réécrit : les anciens messages 1 à 3 sont retirés, il reste les messages 4 à 8, à envoyer un par un, sans échéance.
- Toujours en attente : la partie 5 de Perplexity (mots du Lexique Caf), la page officielle de l'Aripa, et la ligne de journal qui dit « huit » fiches au lieu de sept.
- Une autre conversation travaille en parallèle sur l'outil de veille : je n'ai pas touché à `outils/veille.html`.

## Parties 5 et 6 de Perplexity intégrées (04/11/2026)

- Sept mots du Lexique ajustés : plafond de ressources, quotient familial, déclaration de ressources, crèche AVIP, relais petite enfance, maison d'assistants maternels, point conseil budget. Ne reste dans chaque texte que ce que la page recopiée dit.
- Pas de nouveau texte pour : métier en tension (page non lue), garantie de prêt (la page trouvée ne parle que du prêt garanti des entreprises), reste à vivre, auto-école associative, garage solidaire, français à visée professionnelle, accueil de jour (rien trouvé). Ils restent dans le message 8 de `MESSAGES_PERPLEXITY_2026-11-04.md`.

## Partie 7 de Perplexity et message 4 (partie 1) intégrés (04/11/2026)

- Lexique : quatre mots ajustés (métier en tension, reste à vivre, garage solidaire, accueil de jour). Sans réponse lisible : auto-école associative, français à visée professionnelle ; garantie de prêt inchangée (la page trouvée ne concerne que les entreprises).
- Fiche « lecture, écriture, compétences de base » remise en service (statut actif) : texte réécrit d'après les pages de l'ANLCI et de Service Public. Il reste trois fiches obsolètes (créer son activité, garages solidaires, garde à horaires décalés), en attente de la partie 2 du message 4.
- Vérifié : aucun commit des autres conversations (veille, sas) n'a touché au Lexique ni aux fiches de Comprendre le cadre depuis mes modifications.

## Réponses du message 4 et des messages suivants intégrées (04/11/2026)

- Remises en service d'après les pages recopiées : créer son activité, garages et locations solidaires, garde à horaires décalés ou en urgence. Plus aucune fiche obsolète.
- Précisées d'après les pages : CMG, crèches AVIP, élever seul son enfant (montant de l'allocation de soutien familial et rôle de l'Aripa), relais petite enfance (gratuit), abandon de poste, accompagnement rénové du RSA, CSE et délégué syndical, égalité professionnelle (liste des indicateurs), Tese, droits au travail (inspection, harcèlement, CSE), résidences sociales et pensions de famille, retraite (entretien dès 45 ans), justice, O2R, GEIQ.
- Clause sociale : le Code de la commande publique (L. 2112-2) dit que les conditions sociales « peuvent » être prises en compte, ce qui contredit l'idée d'une obligation : le texte des deux fiches est assoupli, la question est dans le message 9.
- GEIQ de Dordogne : seules l'électricité et la plomberie sont confirmées, « Bergerac » et les autres métiers sont retirés du texte.
- Lexique : six mots ajustés (Aripa, relais petite enfance, délégué syndical, français à visée professionnelle, SIAO et 115, pension de famille).
- Reste : les points du message 9 de `MESSAGES_PERPLEXITY_2026-11-04.md` (embauche, prévoyance des cadres, clause sociale, prépa-apprentissage, intermédiation locative, casier, Carsat, ateliers sociolinguistiques, plateforme de Dordogne).

## Lot du message 9 (réponses Perplexity)

- Fiches modifiées : obligations à l'embauche (destinataire, délai, formalités regroupées, registre), clause sociale (deux fiches, article L. 2112-2-1 : obligation au-dessus des seuils européens, quatre exceptions, entrée en vigueur par décret au plus tard le 22 août 2026), prépa-apprentissage (dispositif terminé fin 2024, texte à l'imparfait), intermédiation locative, casier (bulletin n° 2), Carsat (Dordogne : Carsat Aquitaine ; Haute-Vienne : Carsat Centre-Ouest ; l'ancienne mention « Nouvelle-Aquitaine » était fausse), ateliers sociolinguistiques (description retirée), plateforme mobilité MUST (ajoutée), O2R (aucun changement de texte).
- Lexique : o2r, intermediation-locative, atelier-sociolinguistique, prepa-apprentissage, casier-judiciaire, clause-sociale. La clause sociale sort de la liste de transition (plus de chiffre).
- Sans réponse : prévoyance des cadres, bulletin n° 3, qui oriente vers l'O2R (message 10).

## Lot du message 10 (réponses Perplexity)

- Prévoyance des cadres : cotisation à la charge exclusive de l'employeur, 1,50 % de la tranche inférieure au plafond, affectée par priorité au décès (fiche mutuelle, mot prévoyance-complémentaire).
- Bulletin n° 3 : jamais délivré à un tiers ; la phrase « un employeur peut le demander pour certains postes » est retirée (fiche casier, deux mots du Lexique, bulletin n° 2 ou 3 corrigé).
- Garantie de prêt : définition de France Active et de Bpifrance (fiche créer, mot du Lexique).
- Toujours sans réponse : ateliers sociolinguistiques, qui oriente vers l'O2R, ce qui a remplacé la prépa-apprentissage, auto-école associative.

## Lot du message 11 (réponses Perplexity)

- Ateliers sociolinguistiques : public, objectifs, calendrier, donnés comme exemple local (Poitiers), gratuité non confirmée. Auto-école associative : public, accompagnement et orientation (fiche et deux mots).
- Seul point resté sans réponse : qui peut orienter vers l'O2R (texte prudent conservé).
