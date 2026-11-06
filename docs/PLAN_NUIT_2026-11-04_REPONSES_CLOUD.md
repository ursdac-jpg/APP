# Plan de la nuit du 04/11/2026 : intégrer les réponses du Cloud (mode Nuit, effort medium)

Commit de départ : `224ba544` (retour arrière : `git reset` seulement sur demande de Denis). Règles : voir `CLAUDE.md` (français impeccable, jamais de tiret long, jamais « IA », « à compléter » jamais « facultatif », jamais `git add -A`, jamais de push, `Cloud/` jamais dans Git). Chrome (extension) autorisé UNIQUEMENT pour les pages que les autres outils ne peuvent pas ouvrir. Jamais de chiffre ou de fait écrit de mémoire. Ce qui reste inaccessible même avec Chrome : liste finale pour Perplexity (groupée en 2 ou 3 messages), à donner à Denis au réveil.

Les réponses brutes du Cloud (94 fiches, 238 mots) étaient dans la conversation ; elles sont consignées ici sous forme d'état par tâche. Un compactage ne les efface pas : chaque case cochée correspond à un commit.

## 1. Les 9 écarts des fiches « INCERTAIN » (le Cloud a lu la page, Claude la rouvre avant de corriger)
- [x] accompagnement-rsa : « dispenses » devient « diminution du nombre d'heures » (handicap, invalidité, parent isolé d'enfant de moins de 12 ans), page F19778
- [x] garde-aide-france-travail : reprise d'emploi = enfants de moins de 10 ans (AGEPI) ; 12 ans seulement pour la formation
- [x] creer-cooperative-activite-emploi : contribution « en moyenne de 10 % » (page F37875), pas « 8 à 15 % »
- [x] emploi-armees : 29 ans pour un militaire du rang (17,5 à 29), 32 pour sous-officier (sengager.fr)
- [x] employeurs-aides-a-embauche : distinguer l'aide exceptionnelle apprentissage (6 000 € handicap, etc.) et l'« aide unique » de 5 000 € (A18837)
- [x] handicap-entreprise-adaptee-esat : « contrat d'accompagnement par le travail » (F1654)
- [x] jeunes-e2c-epide : prime Épide mensuelle versée 3 mois après la fin du parcours (F1190)
- [x] logement-droit-au-logement-opposable : la commission a 3 mois ; « 3 ou 6 mois selon le département » = proposition de logement (F18005)
- [x] seniors-mise-a-la-retraite : l'employeur « peut » interroger (pas « doit », pas « chaque année ») (F13966)

## 2. Fiches « NON VERIFIE » (59) : Claude ouvre la page (service-public, Chrome si bloquée), compare, corrige si la page le justifie, date `verifie_le` + ligne `revisions`
Liste par rayon, cocher quand traité (verdict : A JOUR / CORRIGÉ / RESTE À VÉRIFIER) :
- accompagnement : a-qui-m-adresser, clause-sociale-plie, contrat-d-engagement, geiq, global-et-intensif, o2r-remobilisation
- francais : a-quoi-servent-les-niveaux, apprendre-pres-de-chez-soi, cours-de-l-ofii-cir, faire-reconnaitre-son-niveau, lecture-ecriture-competences-de-base
- garde : complement-mode-de-garde-cmg, creche-insertion-avip, elever-seul-son-enfant, horaires-decales-urgence, trouver-un-mode-de-garde
- justice : sortie-acces-aux-droits, travail-formation-en-detention, vers-l-emploi
- former : aides-moins-connues-financer-formation, conseil-en-evolution-professionnelle, financer-sa-formation-demandeur-emploi, se-former-avant-l-embauche
- budget : point-conseil-budget
- creer : micro-entreprise-ou-societe, premieres-demarches, se-faire-accompagner
- emploi : abandon-de-poste, arret-maladie, cdd-cdi-saisonnier, contrats-de-l-insertion, demission, fonction-publique, qpv-frr, quand-un-contrat-se-termine, rupture-conventionnelle
- employeurs : clause-sociale-marche-public, devenir-employeur, egalite-professionnelle, mutuelle-obligatoire, obligations-embauche, seuils-representation-personnel
- etranger-titre-de-sejour-et-travail ; handicap : aucun ; jeunes-prepa-apprentissage-ecoles-de-production
- juridique : contester-une-decision, discrimination-a-l-embauche, faire-respecter-ses-droits-au-travail
- logement : action-logement, demande-de-logement-social, proprietaire-sans-moyens-travaux, sans-hebergement-urgence
- mobilite : acheter-ou-reparer-un-vehicule, garages-et-locations-solidaires, permis-suspendu-annule-points
- sante-desert-medical ; seniors : cumul-emploi-retraite, depart-volontaire-retraite, ou-s-informer-retraite, retraite-progressive

## 3. Seconds niveaux du Lexique (238 mots, par lots de 8 à 32 ; format `LEXIQUE_SECOND_NIVEAU`, aucun chiffre dans `corps`, source ouverte et lue)
Un lot = un commit. Le journal de progression est dans `git log` (messages « Lexique, seconds niveaux, lot N »).
Mots NON TRAITÉS (aucune page officielle, psychologie) : affirmation-de-soi, coach, confiance-en-soi, critique-ou-reproche, croyance-limitante, estime-confiance-ou-affirmation, estime-de-soi, groupe-de-pairs, message-en-je, methode-desc, styles-de-communication.
Mots « À OUVRIR PAR MOI » (Chrome d'abord) : aide-materielle, epicerie-sociale, heures-d-insertion, non-recours, parrainage-vers-l-emploi, personnes-invisibles, numero-unique-enregistrement, pajemploi, atelier-sociolinguistique, fonds-d-aide-aux-jeunes, o2r, metier-en-tension, garantie-de-pret, francais-a-visee-professionnelle, clause-d-execution-ou-critere-d-attribution, reste-a-vivre, accueil-de-jour, auto-ecole-sociale, garage-solidaire, geiq, mam, point-conseil-budget.

## 4. Nuances sur les textes principaux du Lexique (le Cloud a signalé sans modifier)
economie-presentielle (affirmations non retrouvées), demandeur-emploi-longue-duree (définition France Travail), aref-ou-rfft (RFPE / RFFT), cape (structure accompagnatrice), periode-essai-cote-employeur (trois conditions), ass (durée réduite pour élever un enfant), ecole-2e-chance-ou-epide (« rémunéré » vs allocation), entreprise-adaptee (« contrat de droit commun » vs CDD), transitions-pro (« deux dispositifs »), plateforme-mobilite (exemple d'Amiens), prepa-apprentissage (page ancienne), siao-115 (accueils de jour).

## 5. Fin de nuit
- [x] Compte-rendu fait / bloqué / pourquoi dans `docs/ETAT_DES_CHANTIERS.md` et `docs/PLAN_DE_REPRISE_DOSSIER_CLOUD_2026-11-03.md` (point d'arrêt)
- [x] Liste Perplexity (2 ou 3 messages) pour ce qui est resté inaccessible même avec Chrome
