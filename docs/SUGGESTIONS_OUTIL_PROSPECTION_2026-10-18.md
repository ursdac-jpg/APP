# Suggestions pour l'outil de prospection et pour l'application (2026-10-18)

> Réponse à la demande de Denis : quoi ajouter dans les trois onglets (filtres, compréhension, utilité) et comment tirer parti de ces données pour l'application. Aucune donnée de personne ici. Chaque suggestion porte son étiquette d'effort. **Ce qui est marqué « à vérifier » n'a pas été vérifié** : à ouvrir avant tout engagement.
> Plan du chantier : `docs/CHANTIER_OUTIL_PROSPECTION_2026-10-18.md`. Outil : dossier privé `PROSPECTION` (hors dépôt).

## 0. Fait cette nuit (voir le plan pour le détail)
- Onglets Ventes et Fermetures : **comparaison avec la même période un an plus tôt**, **radiations d'office séparées** (70 % des radiations de la Dordogne sur 12 mois portent la mention « Radiation d'office » dans le BODACC : ce ne sont pas des fermetures récentes), bloc « Comment lire ces chiffres » avec renvois vers l'Insee, la Banque de France et le BODACC, **détail par secteur** (les 21 secteurs, classement indicatif par mots-clés sur l'activité écrite dans l'annonce, avec « activité non précisée » et « non classé » comptés à part).
- Prospection : filtre « seulement ceux qui ont déjà des salariés » (89 établissements sur 397 dans le fichier de Bergerac), pastille économie sociale et solidaire, date de contact avec rappel « contactée il y a N jours », trois messages pour assistants (retrouver les coordonnées, faire vérifier par un second assistant, repérer recrutement et actualité) et lecture de leur réponse, avec l'avis « confirmé, corrigé, non vérifiable, fermée ou absente » (jamais « vérifié »).

## 1. Onglet Prospection
**Groupe bas niveau**
- `[effort : bas]` Copier le carnet en tableau (pour un tableur ou un compte rendu à ton employeur).
- `[effort : bas]` Filtre « siège » ou « agence » et filtre par forme juridique précise.
- `[effort : bas]` Compteur de démarches : combien contactées, combien de réponses, combien de refus (pour voir ce qui marche).
**Groupe moyen niveau**
- `[effort : moyen]` **Tri par distance** : le fichier contient des coordonnées géographiques (système Lambert). Il manque seulement un point de départ (une adresse, à convertir avec l'API publique « Adresse » de l'État, gratuite, à vérifier). Utile surtout à ton public : la mobilité est souvent le premier frein.
- `[effort : moyen]` **Recoupement avec La Bonne Boîte et Immersion Facilitée** : aujourd'hui à la main (deux cases dans le carnet). Une API existe peut-être pour La Bonne Boîte (inscription à prévoir, à vérifier).
- `[effort : moyen]` **Besoins en main-d'œuvre par bassin d'emploi** : l'enquête annuelle de France Travail (« BMO ») donne des projets de recrutement par métier et par bassin, en données ouvertes (à vérifier). Elle indiquerait quels métiers cherchent du monde autour de Bergerac, donc quels secteurs prospecter en premier.
- `[effort : moyen]` **Veille mensuelle des nouvelles entreprises** : le filtre « moins d'un an » existe déjà ; il manque un bouton « nouvelles depuis ma dernière visite ».
**Groupe haut niveau**
- `[effort : haut]` **Pont vers la rubrique « Employeurs qui publient leurs offres »** : une entreprise du carnet dont toutes les coordonnées sont vérifiées à la main peut être proposée au sas de l'outil de veille (uniquement des informations d'entreprise, jamais de nom de personne).
- `[effort : haut]` **Mention « a indiqué être ouvert aux stages d'observation »** : à n'afficher qu'avec l'accord de l'employeur (date et trace de l'accord à tenir dans le carnet). Reste à trancher : accord écrit ou oral.

## 2. Onglets Ventes et reprises, Fermetures
- `[effort : bas]` Bouton « Voir ces annonces sur le BODACC » avec la zone pré-remplie.
- `[effort : moyen]` Comparer deux zones côte à côte (Dordogne et Haute-Vienne).
- `[effort : moyen]` Détail par commune (le BODACC donne la ville) et par bassin d'emploi en réutilisant la table de l'application (module « Comprendre les chiffres »).
- `[effort : moyen]` « Annonces autour de mes entreprises » : afficher dans le carnet toutes les annonces des 24 derniers mois, pas seulement le résumé (le bouton « Vérifier les annonces » existe déjà).
- `[effort : moyen]` Ajouter les chiffres officiels nationaux (Insee, Banque de France) en repère, avec leur date, pour situer le département par rapport à la France. Pour la Banque de France, c'est le total sur 12 mois glissants qui fait référence.
- `[effort : haut]` Meilleur classement par secteur : aujourd'hui des mots-clés. Pistes : croiser avec le fichier officiel (code d'activité) quand l'entreprise y figure, ou faire relire un échantillon à la main pour corriger les règles.

## 3. Pour l'application APP (sans donnée de personne)
1. **Repères du territoire dans « Comprendre le cadre » ou « Comprendre les chiffres »** : quelques chiffres agrégés par département (créations, ventes, procédures collectives, dates et sources), passés par le **sas des changements** de l'outil de veille comme les autres chiffres (rien de public sans validation, date « Vérifié le »). L'outil pourrait exporter un petit fichier de chiffres agrégés, sans aucun nom d'entreprise. `[effort : haut]`
2. **« Préparer ma démarche » depuis une entreprise ciblée** : relier ce que la personne trouve (une entreprise de sa commune et de son secteur) aux modules existants (lettre spontanée, appel, entretien). C'est là que se trouve la valeur pour le public cible : peu d'entreprises, proches, atteignables, et une démarche préparée, plutôt que de longs tableaux. Partie publique reportée, comme décidé. `[effort : haut]`
3. **Rubrique « Employeurs qui publient leurs offres »** : les entreprises vérifiées du carnet l'alimentent, l'outil de veille les tient à jour (rappel de revérification tous les six mois). `[effort : moyen]`
4. **Lexique** : fiches « Comment lire les chiffres de créations, de radiations et de défaillances » (micro-entrepreneurs, radiation d'office, défaillance, vente de fonds de commerce), avec les sources déjà trouvées. `[effort : bas]`

## 4. Interprétation : ce qui est établi et ce qui ne l'est pas
Sources lues le 2026-10-18 :
- **Insee** (Informations rapides n° 321, publiée le 19 décembre 2025) : les micro-entrepreneurs représentent 65,1 % des créations sur les 12 mois de décembre 2024 à novembre 2025 (64,3 % un an plus tôt). L'Insee compare les périodes de 3 et de 12 mois à la même période un an avant. Conséquence : beaucoup de créations ne veut pas dire beaucoup d'emplois. `https://www.insee.fr/fr/statistiques/8686480`
- **Banque de France** (bulletin n° 248, 6 octobre 2023) : une défaillance est l'entrée en cessation de paiements, comptée à l'ouverture d'un redressement ou d'une liquidation judiciaire ; la référence est le total sur 12 mois glissants ; un niveau bas pendant la crise sanitaire s'expliquait surtout par la fermeture des tribunaux et les aides, et la hausse qui a suivi était un rattrapage. `https://www.banque-france.fr/fr/publications-et-statistiques/publications/quel-est-limpact-economique-des-defaillances-dentreprises`
- **BODACC** : chaque annonce de radiation porte la mention « Radiation d'office » ou non (constaté sur les données). Je n'ai **pas** trouvé de définition officielle de la radiation d'office (recherche sur les sites de l'État sans résultat probant) : l'outil se limite à dire « décidée par le greffe, non demandée par l'entreprise ».
**Non établi** : pourquoi les « autres radiations » de la Dordogne ont augmenté de 22 % en un an (cause non étudiée) ; la part des ventes de fonds de commerce qui sont des transmissions sans difficulté ; l'effet des lots de publication sur les chiffres d'un mois. Ces points demandent un avis d'expert ou une étude, pas une déduction.

## 5. Messages pour les assistants (dans l'outil, carnet, boutons « Message 1, 2 et 3 »)
Construits d'après le complément de prompt de vérification qui marche (`docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md` : règle de décision par cas, interdiction d'inventer, « continue en PARTIE 2, PARTIE 3 », aucun commentaire). Message 1 : retrouver les coordonnées. Message 2 : faire vérifier par un second assistant (propositions du message 1 incluses). Message 3 : repérer recrutement, accueil de stagiaires, actualité et alerte. Réponses collées dans l'outil (lecture automatique pour les messages 1 et 2). **Aucune ne dit « vérifié » : seule ton ouverture à la main donne la date.**
