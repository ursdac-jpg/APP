# Idées à reclasser - fichier central, commun à toute IA travaillant sur ce dépôt

Créé le 2026-08-27, à la demande explicite de Denis, pendant la conception de la barre de recherche élargie.

## À quoi sert ce fichier

Pendant la conception d'un module, Denis propose parfois une idée qui, après réflexion, ne trouve pas sa place dans le module en cours de discussion - pas parce que l'idée est mauvaise, mais parce que ce module n'a pas la fonction, l'objectif ou l'architecture pour l'accueillir. **Aucune idée de ce type ne doit être abandonnée silencieusement.** Elle doit être notée ici, avec :

- **La date**
- **L'idée elle-même**, aussi complète que ce qui a été dit
- **Le contexte d'origine** : dans quel module/quelle discussion l'idée est apparue
- **La recommandation** : quel(s) autre(s) module(s) semble(nt) mieux convenir - ou, si rien n'est identifié, **"Sans module identifié"**
- **Le statut** : `[SANS MODULE]` tant qu'aucune destination n'est trouvée, ou `[RECLASSÉ -> nom du module]` une fois qu'elle a rejoint le document de ce module (`TACHES_VALIDEES.md` ou un doc dédié)

**Règle d'usage, à respecter par toute IA qui ouvre ce fichier** : avant de concevoir un nouveau module, vérifier si des idées `[SANS MODULE]` accumulées ici pourraient enfin trouver leur place dans ce nouveau module. Si plusieurs idées `[SANS MODULE]` partagent un thème commun, le signaler à Denis - elles forment peut-être, ensemble, un module à part entière qui n'existait pas encore.

Ce fichier est différent de la section "Idées en réserve" de `docs/TACHES_VALIDEES.md` : celle-ci liste des idées déjà correctement rattachées à leur futur module (juste pas encore commencées). Celui-ci sert au tri d'une idée qui s'est présentée au mauvais endroit.

---

## Idées en attente de reclassement

### 2026-09-13 - "Mon style" : mémoriser les réglages de mise en page du CV et les réappliquer à un futur CV

**Idée** : dans le panneau "La mise en page" (niveau "Je veux tout régler" > "Reprendre la main"), permettre d'enregistrer la combinaison de réglages actuelle (allure, couleur, police, colonnes, densité...) sous un nom ("mon style"), puis de la réappliquer en un clic à un futur CV (nouveau document, ou CV recommencé) sans tout reregler à la main.

**Contexte d'origine** : un encart "Garder ces réglages pour un prochain CV" existait déjà dans le panneau, avec 2 boutons visiblement désactivés et un texte "À venir" - jamais construit. Repéré par Denis (point 25 de sa liste de 26 retours sur le parcours "Créer un nouveau CV", 2026-09-13) : "ça reste seulement marqué ici mais jamais codé". Décision de Denis : retirer l'encart maintenant plutôt que de laisser une promesse non tenue affichée - l'idée part ici pour un futur chantier, pas abandonnée.

**Recommandation** : module **Créer un nouveau CV / panneau "La mise en page"** - destination déjà claire, pas "sans module". Nécessite de trancher où stocker "mon style" (session en cours seulement, ou persistant entre CV/sessions - donc lié à la disquette), et si un seul style mémorisable suffit ou plusieurs.

**Statut** : destination connue (voir ci-dessus), pas encore repris dans un document dédié à ce module - à traiter comme un ajout de fonctionnalité au prochain chantier "mise en page du CV", pas avant.

---

### 2026-08-27 - Enrichissement du contenu du Lexique (compétences et projet)

**Idée** : enrichir le module Lexique avec de nouveaux grands sujets :
- **Les compétences** : qu'est-ce qu'une compétence, comment elle est composée, son histoire, les 3 critères actuels déjà connus (savoir-être / savoir-faire / savoirs), et une 4e dimension distincte à traiter : le "savoir y faire" (différent du savoir-faire - la capacité à mobiliser ses savoirs/savoir-faire en situation réelle). Mentionner aussi que le mot français "compétence" est fortement inspiré de l'anglais "competency", qui englobe en plus la motivation et le projet d'avenir - une définition plus large que l'usage français courant.
- **Le projet** : qu'est-ce qu'un projet, comment le construire, l'évaluer, le tenir dans la durée, le faire évoluer. Mentionner des outils concrets utiles (ex. diagramme de Gantt). Utile aussi bien aux bénéficiaires non accompagnés qu'aux professionnels.
- **Expressions RH modernes / formulations valorisantes** (ajouté 2026-08-28) : des tournures récentes du monde de l'insertion et des RH que les employeurs ne connaissent pas toujours, et qui, posées sur un CV, suscitent la curiosité et donc le questionnement en entretien - le bénéficiaire peut alors raconter et valoriser une pratique. Exemples donnés par Denis : "médiation corporelle" pour de la randonnée / de la marche ; "médiation artistique" pour des activités artistiques / arts plastiques. À traiter avec prudence doctrinale : ne jamais encourager à embellir ou à mentir - il s'agit de nommer justement une pratique réelle avec le vocabulaire du secteur, pas de la travestir. Le bénéficiaire doit pouvoir expliquer sincèrement ce que recouvre le terme.
- **Alimentation par la veille** (2026-08-28) : le module "Se tenir informé" (voir `docs/CHANTIER_SE_TENIR_INFORME.md`) n'est PAS en conflit avec le Lexique, il l'alimente. Quand la veille de Denis fait remonter un terme, une pratique ou une expression nouvelle, elle rejoint le Lexique. À prévoir : définir les champs/domaines que le Lexique veut couvrir, et un système d'alimentation continue (sur le modèle du `sources.txt` de "Se tenir informé") pour que le Lexique grandisse de façon large et pertinente sans rouvrir l'architecture à chaque ajout.

**Contexte d'origine** : proposée pendant la conception de la barre de recherche élargie ("Porte d'entrée") - Denis a réalisé en cours de discussion que ce contenu n'a pas sa place DANS la barre de recherche elle-même, mais dans le contenu du module Lexique.

**Recommandation** : module **Lexique** - destination déjà claire, pas "sans module".

**Statut** : `[SANS MODULE]` au sens strict du champ ci-dessus n'est pas exact ici puisque la destination (Lexique) est déjà connue - à traiter comme un ajout de contenu au prochain chantier Lexique, pas encore recopié dans un document dédié à ce module.

---

### 2026-08-28 - Analyse d'une IMAGE de CV (mise en page, forme, couleurs) pour "Regard recruteur"

**Module concerné** : **"Regard recruteur"** (Denis l'appelle aussi "Regard employeur") - à NE PAS confondre avec le module existant "Regard extérieur". C'est le chantier 4 de `docs/AUDIT_STRATEGIQUE_ERIP_2026-08.md` (~100-140h, "toujours en dernier", exige un nouveau moteur de diagnostic complet sur le modèle du Prompt 1). Pas commencé.

**Idée** : donner à l'IA non pas le texte brut du CV, mais une **image** (capture d'écran ou photo) du CV. Une IA multimodale voit alors ce qu'un recruteur voit : mise en page, aération, colonnes, police, couleurs, hiérarchie visuelle, longueur réelle. Dans "Regard recruteur", l'image serait **obligatoire ou fortement recommandée** : sans elle, pas d'avis pertinent sur la forme.

**Contexte d'origine** : apparue pendant le chantier Carte 3 du Bilan (2026-08-28), en corrigeant l'axe "Lisibilité et forme" -> "Lisibilité et structure". Constat : le Bilan envoie un texte, l'IA ne peut PAS juger la forme visuelle. Denis : cette limite du Bilan devient la raison d'être d'une analyse par image dans "Regard recruteur".

**À distinguer de** [[project_idee_ocr_image_ecartee]] : là c'était de l'OCR (extraire le TEXTE d'une image, en local, qualité insuffisante). Ici on ne lit pas le texte, on donne l'image à une IA multimodale pour juger le VISUEL.

**Avis de Claude (2026-08-28, complété après les précisions de Denis)** :
- **Faisable : oui, clairement.** Les IA multimodales (GPT-4o, Claude, Gemini) acceptent les images. Flux : la personne joint une capture d'écran / photo de son CV chez l'assistant, en plus du prompt.
- **Retour pertinent sur forme / lisibilité / agencement : oui, nettement meilleur qu'à partir du texte** (colonnes, densité, blancs, alignements, hiérarchie, longueur en pages, couleurs, "impression générale").
- **Réserve 1 (confidentialité) - LARGEMENT LEVÉE par Denis** : l'app a déjà un dispositif de masquage par rectangles dessinés. La personne masque nom / photo / coordonnées sur l'image avant de l'envoyer - même logique d'anonymisation que le reste de l'app, transposée à l'image.
- **Réserve 2 (qualité) - LEVÉE par Denis** : pas besoin d'une photo. Une **capture d'écran** du CV (ou une page PDF exportée en image) est nette et suffit. À guider dans ce sens.
- **Réserve 3 (variabilité) - reste** : le jugement visuel varie plus d'un passage à l'autre que l'analyse de contenu. À cadrer par des axes fixes et une sortie bornée, exactement comme les autres prompts du dépôt (la discipline déjà prévue pour "Regard recruteur" dans l'audit stratégique).
- **Conclusion** : avec le masquage par rectangles et la capture d'écran, l'idée tient bien et s'intègre naturellement à "Regard recruteur" (qui aura de toute façon son propre moteur de diagnostic). Rien qui empêche d'en faire une entrée obligatoire de ce module.

**Recommandation / statut** : `[FAIT dans « Regard recruteur », 2026-09-08]` - l'image est le mode principal du module (fortement conseillée, jamais obligatoire ; repli « Mode texte seul » = 4 axes au lieu de 6). Masquage par guide 4 étapes (l'outil de rectangles dans le navigateur reste la décision 4, ouverte). Axes fixes + sortie bornée = `docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md`.

### 2026-09-08 - Notes laissées par le chantier « Regard recruteur » (à traiter dans d'autres chantiers)

- **Repères comme plaque tournante (idée Denis 03/09, `[À ANALYSER]`, ne pas concevoir maintenant)** : plutôt qu'un nouveau « panier », se servir de Mes Repères pour faire circuler des points d'un module famille 2 vers un autre. Recoupe le sac de « Comparer mes pistes » (`_comparerEtat`), le chantier « Cohérence entre les modules », les objets métier partagés. Analyse dédiée avant tout code.
- **Sélection groupée « Garder comme Repère » + choix du type ensuite** : la maquette de Regard recruteur a deux zones (bouton par point + zone groupée), marquées « à fusionner ». La v1 implémente seulement le bouton par point. Denis doit trancher la forme finale (rejoint le « bouton Repère global » évoqué dans la maquette).

---

### 2026-08-28 - Un seul import IA qui donne le CV rangé en rubriques ET le diagnostic

**Idée / besoin** : quand une personne importe la réponse d'une plateforme IA dans le Bilan, elle aimerait récupérer en une fois (a) son CV structuré en rubriques (expériences, formations, compétences...) ET (b) le diagnostic du Bilan - sans avoir à faire deux passages IA séparés. Aujourd'hui, l'écran "Organiser mon CV en rubriques" (`structurerTexteExistant()` / `assurerCVStructure()`, `data/metiers.js`) relance un passage IA dédié : il réinjecte bien le texte du CV déposé (pas une reconstruction à vide), mais c'est un aller-retour IA de plus, distinct du diagnostic.

**Contexte d'origine** : tâche `[À FAIRE]` "Pré-remplissage de Organiser mon CV en rubriques" (depuis `docs/ETAT_DES_CHANTIERS_2026-08-24.md`), restée ambiguë. Lors de la B3 de la Carte 3, Denis avait imaginé la résoudre en **fusionnant le prompt de diagnostic et le prompt d'extraction** en un seul. Cette fusion (prompt V3) a été testée, déployée, et retirée le jour même : en usage réel, l'IA laissait parfois tomber le bloc extraction. C'est devenu la règle [[LECONS §1bis]] : "jamais un prompt fourre-tout".

**Ce qui reste** : la fusion de prompts est écartée définitivement, mais le besoin (éviter le double passage IA) est réel. Une autre voie est à concevoir - par exemple réutiliser l'extraction que le diagnostic produit déjà, ou faire de la structuration une étape légère non-IA quand c'est possible.

**Recommandation / statut** : `[SANS MODULE]` pour l'instant - à reprendre pendant le chantier "**consolider le Bilan sur une page**" (voir `docs/TACHES_VALIDEES.md`), qui retouchera de toute façon l'architecture du module. Ne rien coder ici tant que la voie n'est pas tranchée avec Denis.

---

### 2026-08-28 - Idées issues du recueil de contenu des pages d'introduction de module

**Contexte d'origine** : session de recueil de contenu (sans code) pour les pages d'introduction de 6 modules (Mon Carnet, Lexique, Analyser ma candidature, Préparer un entretien d'embauche, Coécrire la lettre de motivation, Découvrir mes compétences). Plusieurs IA ont été sollicitées en parallèle pour critiquer et enrichir. Les propositions ci-dessous sont bonnes mais ne relèvent PAS du texte des cartes elles-mêmes - elles concernent la page d'accueil, l'accessibilité, ou une doctrine transversale.

**1. Indicateur d'état du dossier sur la page d'accueil**
Afficher, discrètement en haut de l'accueil, l'état de chaque brique : CV renseigné / non, lettre de motivation commencée / non, nombre de Repères, etc. But : la personne sait d'où partent les modules sans avoir à ouvrir chaque page d'introduction. Réserve forte : risque de pression / culpabilisation sur un public à confiance fragile. À concevoir comme une photo neutre, jamais comme une barre de complétion.
Recommandation : megachantier "Refonte de la page d'accueil" (`docs/TACHES_VALIDEES.md`).

**2. Repère "étape souvent utilisée ensuite"**
Sur l'accueil, marquage visuel léger et non bloquant qui suggère un enchaînement naturel (ex. après avoir calé le CV, "beaucoup de personnes passent ensuite à la lettre de motivation"). Formulation souple obligatoire ("souvent utilisé après", "vous pouvez aussi") - jamais "à faire avant / après" qui transformerait l'app en parcours obligatoire, à l'opposé du principe "chacun entre où il veut".
Recommandation : megachantier "Refonte de la page d'accueil".

**3. Indicateur de progression global ("2 modules sur 6 explorés")**
Proposé par une IA pour motiver. Avis : à écarter très probablement - gamification de progression = pression sur le public cible, contradiction directe avec la philosophie. Noté ici seulement pour ne pas perdre la trace de la discussion ; ne pas implémenter sans arbitrage explicite de Denis contre l'objection.
Recommandation : `[SANS MODULE]`, faible priorité, probablement à ne pas faire.

**4. Brouillon vocal (dictée voix vers texte) pour Mon Carnet et Découvrir mes compétences**
Proposer un bouton d'enregistrement vocal transformé en texte, en local, pour alimenter une note du Carnet ou raconter une expérience dans Découvrir mes compétences. But : lever la barrière de la page blanche et de l'écrit pour les personnes en fragilité scripturale (coeur du public cible). À vérifier : qualité de la reconnaissance vocale navigateur hors ligne, langue française, confidentialité (traitement strictement local).
Recommandation : `[SANS MODULE]` - concerne à terme Mon Carnet et Découvrir mes compétences, à rouvrir quand ces deux modules seront retouchés.

**5. Distinction visuelle "avant / après" dans l'encart "Cet outil travaille avec…"**
Dans l'encart de liens inter-modules, distinguer d'un pictogramme les outils "souvent utilisés avant" et ceux "souvent utilisés après". Détail de maquette, à trancher au moment du design de l'encart, pas maintenant.
Recommandation : chantier "pages d'introduction de module" (phase maquette).

**6. Version résumée + version dépliée de la page d'introduction sur mobile**
Sur petit écran, afficher par défaut accroche + bouton, et rendre dépliables les blocs de détail (ce qui va se passer, ce que ce n'est pas, ce que la page devient). Évite un mur de texte pour un public fragile numériquement.
Recommandation : chantier Accessibilité (déjà séquencé après la finition des modules, cf. mémoire `project_sequencement_modules_accessibilite_decoupage`).

**7. Doctrine transversale "ERIP est un système d'accumulation, pas un générateur de documents"**
Formulation dégagée pendant cette session : le coeur du produit n'est pas la liste des modules, c'est la circulation entre modules de la connaissance produite par la personne (une note peut devenir un Repère ; un Repère nourrit la réflexion ; une compétence enrichit le CV ; le CV nourrit la lettre de motivation et la préparation d'entretien d'embauche ; Cohérence de mon dossier confronte le tout). Chaque nouveau module devrait être évalué à l'aune d'une question : enrichit-il ce patrimoine commun, ou reste-t-il isolé ? Mérite de devenir un principe écrit (doc de doctrine ou section de `docs/LECONS_A_NE_PAS_REPRODUIRE.md`), pas juste une idée.
Recommandation : `[SANS MODULE]` - à transformer en principe documenté si Denis valide, sinon à garder comme grille de lecture pour les futurs modules.

---

### 2026-08-28 (soir) - Récolte multi-IA sur les pages d'introduction et l'architecture des modules

**Contexte d'origine** : Denis a soumis `docs/PAGES_INTRODUCTION_MODULES_RECUEIL.md` (et le message de la section 5) à plusieurs assistants externes, et a collé leurs réponses dans le chat. Ce qui suit est le tri : seules les idées jugées solides sont retenues, condensées. Beaucoup de propositions n'apparaissent PAS ici (redites du recueil, plans "en semaines" fictifs, menus "je peux produire tel document"). Rien n'est décidé, rien n'est à coder. À repiocher au moment d'implémenter chaque module.

**A. Grille d'évaluation d'un nouveau module (règle d'or, à valider comme principe)**
Avant d'accepter un module, il doit répondre oui à : (1) reçoit-il quelque chose d'un autre module ou de la personne ? (2) transforme-t-il cette matière en quelque chose de nouveau ? (3) ce qu'il produit est-il réutilisable ailleurs ? (4) enrichit-il concrètement au moins un autre module ? Si la réponse est floue, le module fait probablement doublon ou ajoute de la complexité sans enrichir le patrimoine de la personne. Complète la doctrine "système d'accumulation" (idée 7 ci-dessus). Destination : doc de doctrine ou `LECONS`.

**B. Idées de modules nouveaux (aucun n'existe, aucun n'est décidé)**
- **Explorer un choix / "Décider" / "Aide à la décision d'orientation"** : aider à mettre en balance 2 ou 3 pistes (métiers, formations, projets, parcours, domaines) - structurer la réflexion, ce qui colle / ce qui manque / ce qui est compensable, jamais choisir à la place. Denis (2026-08-31) veut aussi que l'app **cherche pour la personne** les infos utiles à la comparaison (durée, salaire, lieu, financement, concurrence, pérennité, évolutions, conditions de travail, avantages). Comble un manque : APP aide à capturer, comprendre, produire, vérifier, mais pas à décider. Cohérent avec la Constitution (préparer ses décisions). **Amorce de conception + garde-fous (données vivantes, jamais de classement, recouvrement avec « Se tenir informé ») : `docs/CHANTIER_AIDE_DECISION_ORIENTATION.md`.**
- **Préparer une rencontre (générique)** : "Préparer un entretien d'embauche" est un cas particulier d'un mécanisme plus large - même logique pour préparer un rendez-vous conseiller France Travail, Mission Locale, centre de formation, employeur. À étudier comme généralisation possible du module entretien, pas comme module séparé de plus.
- **Mon histoire** : le récit professionnel chronologique et narratif (ruptures, choix, réorientations, événements) - ni CV ni lettre. Socle dans lequel les autres modules viennent puiser. Ambitieux.
- **Avant de candidater / "Cette offre me correspond-elle ?"** : lecture d'une offre - ce qui correspond, ce qui manque, ce qui est compensable. Une lecture, pas un score. À distinguer d'ATS (mots-clés) : ici c'est une lecture de fond de l'adéquation. Risque de recouvrement à arbitrer avec ATS et avec le Bilan.
- **Questions difficiles** : bibliothèque de réflexion au-delà de l'entretien (trou dans le parcours, licenciement, reconversion, peu d'expérience, changement de voie) - pour chaque question, d'abord "ce que la personne en face cherche vraiment à savoir", puis des pistes de réponse. Pourrait être une ressource transversale plutôt qu'un module.
- **Relecture du parcours / photographie** : après plusieurs semaines d'usage, une photo NEUTRE de l'activité ("vous avez beaucoup travaillé le CV et les compétences, jamais l'entretien" ; "vous revenez souvent sur le thème changer de métier"). JAMAIS un diagnostic ni une interprétation sur la personne (cf. mémoire : jamais poser de diagnostic). Uniquement un reflet factuel de ce qui a été fait.
- **Modules de questionnement (famille)** : des modules dont la sortie n'est pas un document mais des questions qui font réfléchir ("qu'est-ce qui vous plaît vraiment dans ce métier ?", "qu'attendez-vous de votre prochain emploi ?"). Ne concluent jamais. Très aligné avec le premier principe de la Constitution.
- **Cohérence des compétences** : appliquer la logique de "Cohérence de mon dossier" aux compétences elles-mêmes - "cette compétence apparaît dans le CV et la lettre, jamais dans la préparation d'entretien". Petit, concret, réutilise un mécanisme déjà éprouvé.

**C. Évolution du Lexique vers un "centre de connaissances"** (élargit l'entrée du 2026-08-27 plus haut)
Au-delà du vocabulaire et des deux sujets déjà prévus (compétences, projet) : comprendre une fiche de poste, comprendre un contrat, comprendre une convention collective, les attentes des recruteurs, les méthodes de recherche, un panorama de métiers. Le Lexique deviendrait une petite bibliothèque de référence, reliée aux outils. À cadrer : ne pas promettre une encyclopédie, avancer par fiches.

**D. Architecture : objets métier partagés avec une identité** (technique, structurant)
À terme, les modules ne devraient plus seulement échanger des bouts de texte mais des objets nommés et uniques : une compétence, une expérience, une offre d'emploi, un employeur, une candidature, un frein, une ressource. Chaque objet a une identité ; tous les modules s'y réfèrent ; l'information n'est jamais dupliquée. À garder en tête pour le chantier de découpage de `js/app.js` (chantier stratégique 3) et pour toute refonte de `dossier`. Ne rien entreprendre isolément.

**E. Banque de fonctions par module existant (à trier module par module)**
- *Mon Carnet* : épingler une note ; étiquette de thème légère (idée / question / doute / piste / contact) ; recherche et filtre par date ; "transformer en Repère" en un seul geste depuis la note ; ~~annuler la dernière suppression~~ **FAIT 2026-09-09** (`_carnetAnnulerDerniereSuppression`, filet transitoire ~10 s) ; export `.txt` de toutes les notes ; ~~date relative ("il y a 2 jours")~~ **FAIT 2026-09-09** (dans le panneau compact). Brouillon vocal déjà noté plus haut (idée 4).
- *Lexique* : recherche par proximité ("entretien" propose "préparation d'entretien d'embauche") ; section "mots souvent confondus" (CDI / CDD, compétence / savoir-être) ; mode débutant / mode approfondi (définition courte + version détaillée) ; favoris ; derniers mots consultés ; "ce mot apparaît dans tel outil" ; lecture à voix haute pour les personnes qui lisent difficilement ; info-bulle Lexique au survol d'un mot dans les autres modules.
- *Analyser ma candidature* : état non chiffré en 3 niveaux (solide / à clarifier / à reprendre) ; section "ce qui est déjà bien" affichée en premier ; liste à cocher des points (corrigé / pas d'accord) ; comparaison avant / après d'une section ; hiérarchie des corrections (d'abord ce qui bloque) ; vue recruteur vs vue candidat ; lignes du CV citées ; ponts explicites vers lettre de motivation, préparation d'entretien d'embauche, Cohérence de mon dossier.
- *Préparer un entretien d'embauche* : fiches "question déstabilisante -> ce que la personne en face cherche vraiment" ; "ce que je veux absolument faire passer" ; questions à poser au recruteur ; version premier tour / second tour ; version entretien court / long ; écrire sa réponse et recevoir des améliorations de formulation (entraînement actif, sans simulation en direct) ; petite liste logistique le jour J (documents, heure, lieu) sans ton infantilisant.
- *Coécrire ma lettre de motivation* : plan de la lettre visible d'abord ; sélecteur de tonalité (sobre / directe / chaleureuse / plus formelle) ; "cette phrase vient de votre CV / de votre récit" ; historique des versions avec retour arrière ; alerte quand une affirmation de la lettre ne colle pas au CV (dates) ; alternatives de phrase par paragraphe ; paragraphes réorganisables.
- *Découvrir mes compétences* : un exemple de phrase prête pour le CV sous chaque compétence ; 4 déclencheurs de récit (ce que vous avez géré / organisé, fabriqué / réparé, transmis / expliqué, résolu) ; regroupement par thème (organisation, relation, travail manuel...) ; compétences "déjà validées" vs "à préciser" ; décrire une activité à partir d'une photo pour en tirer des compétences non professionnelles ; bouton "ajouter à mon CV" ; pont vers Mes Repères.

**F. Fonctions transverses (réserve, plusieurs modules)**
Reprise "là où j'en étais" ; activité récente ; zone "à faire ensuite" ; versionnement et annulation ; duplication d'un contenu ; archivage ; favoris ; recherche globale dans toute l'application ; mode simple / mode avancé (rejoint le chantier Accessibilité) ; indicateur de complétude sans score anxiogène ; repères d'usage "souvent utilisé avant / après" ; rappel de sauvegarde au bon moment seulement ; mode sombre (Accessibilité) ; export du contenu d'un module.

**G. Ajouts à intégrer au message pour les autres IA** (section 5 du recueil)
Ajouter aux interdits de réponse : pas de score ni de notation de la personne ; pas de simulation d'entretien en direct ; pas de génération automatique sans validation humaine. Et imposer le format de réponse : pour chaque module, séparer explicitement (a) propositions de texte et (b) propositions de fonctions, chaque fonction accompagnée d'une phrase "ce que ça améliore pour la personne".

---

### 2026-08-28 (2e récolte multi-IA) - Nouveaux apports au-delà de ce qui est déjà noté

**Contexte** : Denis a soumis le message enrichi (avec autocritique obligatoire) à plusieurs assistants. La plupart des retours répètent la 1re récolte (brouillon vocal, historique des versions, avant/après, "ce qui est déjà bien" en premier, fiches question -> intention, ponts entre modules, anonymisation par rectangles). Ci-dessous UNIQUEMENT le neuf.

**H. Matrice de réassurance et d'erreurs de manipulation (fort intérêt, transversal)**
Pour chaque module, prévoir une table : situation d'erreur -> risque ressenti par la personne -> message rassurant affiché -> action de l'application. Exemples : texte vide ou trop court collé ("le texte semble très court, vous pouvez compléter ou reprendre l'étape" ; ne pas effacer ce qui est saisi) ; navigateur fermé par accident ("vos notes et documents enregistrés sont conservés sur votre appareil" ; restaurer le dernier état) ; clic sur un lien sortant ("votre travail sur cette page reste enregistré" ; ouvrir dans un nouvel onglet). C'est un filet de sécurité pour un public en fragilité numérique - personne ne l'a formalisé jusqu'ici. Destination : chantier accueil (patron des pages) + chantier Accessibilité.

**I. Thème transversal : produire quelque chose à apporter à son accompagnateur**
Signal revenu chez plusieurs assistants indépendamment : plusieurs modules gagneraient à produire une **fiche de synthèse imprimable** récapitulant les points / démarches / questions à aborder avec un conseiller (France Travail, Mission Locale, CIP...). Vu pour : Répertoire des freins (démarches à faire), Mes Repères (marquer un Repère "à discuter en rendez-vous"), Préparer un entretien. APP prépare la rencontre humaine, ne la remplace pas. À garder comme dimension possible de plusieurs modules.

**J. Interaction concrète Analyser ma candidature -> Cohérence de mon dossier**
Pendant l'analyse du CV, une case "ce point me semble important pour plus tard" ; les points cochés sont repris comme éléments à revérifier dans Cohérence de mon dossier (ex. une incohérence de dates repérée dans le CV réapparaît comme point à contrôler entre CV et lettre). Rend le lien entre les deux modules automatique sans imposer d'ordre. Concret, à retenir pour le chantier "consolider le Bilan".

**K. Journal de bord personnel discret (recurrent, avec garde-fou)**
Une page listant chronologiquement ce que la personne a fait dans l'app ("vous avez analysé votre CV", "vous avez créé un Repère"), sans score, sans objectif, effaçable à tout moment. Proche de l'idée "Relecture du parcours" (B ci-dessus) mais plus légère : juste des traces, pour que la personne se voie avancer et se l'approprie. **Garde-fou** : strictement local ; aucune notification ; aucune barre de progression ni relance ; il constate, il n'incite pas (2e principe de la Constitution). À n'ouvrir que si la personne le demande.

**L. Deuxième bloc "Ce que ce n'est pas", ciblé légitimité**
En plus du bloc "Ce que ce n'est pas" du patron, une variante courte visant les personnes qui doutent d'avoir le droit d'utiliser l'outil. Exemples proposés : Mon Carnet "personne ne relit, les fautes n'ont aucune importance" ; Analyser ma candidature "votre CV n'est pas vous" ; Préparer un entretien "ce n'est pas un examen blanc, personne ne vous filme ni ne vous écoute". À tester au stade maquette - peut alourdir si systématique.

**M. Fonctions ponctuelles neuves (réserve)**
- *Préparer un entretien* : fiche d'aide dédiée aux ruptures de parcours (trou, inactivité, reconversion) pour transformer une zone de doute en explication factuelle - proche de "Questions difficiles" (B).
- *Découvrir mes compétences* : variante des 4 déclencheurs de récit -> "ce que vous avez fait / avec quoi ou qui / quel résultat / ce qui était difficile" ; "panier de compétences" où s'accumulent les formulations validées avant passage au CV.
- *Coécrire la lettre* : connecteurs logiques simples proposés pour lier les paragraphes, sans style ampoulé.
- *Mes Repères* : relier un Repère au fait déclencheur (la note ou l'expérience dont il vient).

**N. Convergences entre assistants (confirment la direction, rien à faire)**
Tous ont convergé sur : garder le bloc "Ce que ce n'est pas" ; aucun score sur la personne ; ponts explicites entre modules. Tous ont pointé les mêmes tensions à surveiller : ATS qui glisse vers un score, Regard recruteur formulé comme verdict, Actualités qui cherche à retenir l'attention, Freins qui décide à la place, géolocalisation qui suppose un service externe (préférer une saisie manuelle du code postal). Notes d'autocritique rendues : entre 17 et 19 sur 20 - chiffres non fiables, mais l'exercice a produit la matière ci-dessus.

**O. Questions d'architecture à ajouter au message pour la prochaine récolte** (voir aussi section 5 du recueil, PARTIE 2)
Un assistant a proposé 13 questions pour pousser les retours vers l'architecture plutôt que la liste de fonctions. Retenues : (1) pour chaque module, "que reçoit-il / que transforme-t-il / que transmet-il ?" ; (2) "quelles règles générales de conception pour tous les modules présents et futurs ?" (quand un tableau de bord, quand un historique, quand un lien, quand réutiliser une info) ; (3) "si vous deviez supprimer un module, lequel et comment redistribuer ses fonctions ?" ; (4) incohérences / doublons / angles morts / modules à fusionner ou découper ; (5) "quels objets communs (compétence, expérience, candidature, frein, employeur...) et quelles informations d'un parcours n'ont aujourd'hui aucun endroit naturel ?" ; (6) "sans qu'on vous la donne, quelle philosophie lisez-vous dans ces modules, et vos propositions la contredisent-elles ?". Écartées ou basse priorité : vision à 3 ans (spéculatif).

---

### 2026-08-28 (3e récolte multi-IA) - Réponses aux questions d'architecture (PARTIE 2)

**Contexte** : les questions d'architecture ont été posées pour la 1re fois. Le contenu "par module" ne bouge plus (redites). Ce qui suit est le neuf, tout est architecture. Rien n'est décidé.

**P. Angle mort convergent : le SUIVI DES CANDIDATURES**
Signalé indépendamment par plusieurs assistants. Aucun module actuel ne suit : candidatures envoyées, date d'envoi, relances, réponses reçues, statut (en cours / envoyée / relancée / refusée / entretien prévu / entretien passé), rendez-vous, retour après entretien. C'est le manque le plus cité. Serait un module ou un objet transversal. À arbitrer : jusqu'où APP va dans le "suivi" sans devenir un CRM et sans créer d'habitude de consultation (2e principe).

**Q. Angle mort : contacts / réseau / interlocuteurs**
Les coordonnées de personnes ressources (conseiller, contact en entreprise, association) n'ont aujourd'hui d'endroit que les notes libres du Carnet. Pas prioritaire, mais noté.

**R. Fusions proposées de façon convergente (à peser, pas à adopter tel quel)**
- **ATS dans "Analyser ma candidature"** : 3 assistants sur 4 disent qu'ATS fait doublon (Analyser + Lexique couvrent déjà). Proposition : un volet "mots-clés / vocabulaire" dans Analyser ma candidature plutôt qu'un module séparé - réduit aussi le risque de dérive vers un score. **Tension avec le plan actuel** : ATS est listé comme chantier stratégique 4 (`docs/TACHES_VALIDEES.md`). À trancher par Denis.
- **Regard recruteur dans "Analyser ma candidature"** : 2 assistants proposent un volet "forme / présentation visuelle" à côté du volet "fond". **Tension forte avec le plan de Denis** : Regard recruteur a un moteur propre prévu (analyse d'image, chantier 5). À garder comme signal, pas comme décision.

**S. Découpage en 4 familles fonctionnelles (utile pour la Boîte à outils)**
Un assistant propose de regrouper les modules en 4 familles : **Capturer** (Carnet, Repères) ; **Comprendre** (Lexique, ATS, Regard recruteur) ; **Formuler** (Découvrir mes compétences, Coécrire la lettre de motivation, Préparer un entretien d'embauche) ; **Comparer / relier / suivre** (Analyser ma candidature, Cohérence de mon dossier, Répertoire des freins, Se tenir informé, + futur suivi des candidatures). **Alimente directement** la tâche "regrouper les 8 boutons de la Boîte à outils en 2-3 catégories" (`docs/TACHES_VALIDEES.md`) - à confronter au regroupement déjà envisagé là-bas ("Construire mes documents / Réfléchir et me situer / Suivre mon parcours").

**T. Objet transversal manquant : "motivation"**
Le "pourquoi cette offre / pourquoi cet employeur" est dispersé entre lettre, entretien et Repères, sans objet propre. Pourrait devenir un objet commun (offre associée, employeur associé, texte, compétences associées) réutilisé par Coécrire la lettre et Cohérence.

**U. Règle : données durables contre données périssables**
Toutes les informations n'ont pas la même durée de vie : une compétence vaut ~10 ans, une candidature quelques semaines, une offre quelques jours. Cette différence devrait guider l'architecture : ce qui est durable s'accumule dans le patrimoine (compétences, expériences, Repères) ; ce qui est périssable s'archive ou se marque comme daté (offres, candidatures). Bon principe pour le chantier de découpage de `js/app.js` et toute refonte de `dossier`.

**V. Règle : carte des dépendances entre modules**
"Que reçoit / transforme / transmet" ne suffit pas : il faut aussi "de quoi ce module a besoin pour être utile". Préparer un entretien d'embauche dépend fortement d'un CV déjà travaillé ; le Lexique ne dépend de rien. Cette carte des dépendances détermine l'ordre naturel des parcours et ce qu'on met en avant sur l'accueil.

**W. Règle : ce qui ne doit PAS circuler entre modules**
Tout ne doit pas devenir transversal. Les notes brutes du Carnet ne circulent jamais automatiquement (doctrine Carnet). Une réflexion personnelle d'un Repère ne part pas seule vers un autre module. La réutilisation automatique se limite aux objets "de candidature" (CV, offre, entreprise, compétences validées).

**X. Règle : mode dégradé si l'assistant est indisponible**
Tout module qui propose de passer par un assistant doit prévoir un message si ça échoue : "ce n'est pas bloqué, vous pouvez réessayer plus tard, ou continuer sans lui". Robustesse, et rassure le public fragile. À intégrer au patron des pages.

**Y. Reformulation de la question "supprimer un module" pour la prochaine récolte**
En l'état, certains assistants suppriment un module par obligation. Mieux : "Si vous estimez qu'un module pourrait être supprimé, fusionné ou profondément redéfini, lequel et pourquoi ? Si vous estimez qu'aucun ne devrait l'être, expliquez pourquoi." - distingue les vraies redondances vues de l'extérieur d'une architecture jugée cohérente.

**Z. Consigne à ajouter au message : privilégier les principes sur les fonctions**
Phrase à ajouter (jugée la plus impactante par un assistant) : "Nous cherchons autant des principes de conception, des concepts transversaux et des règles d'architecture que des fonctionnalités. Si une idée peut s'exprimer comme un principe applicable à toute l'application plutôt que comme une fonction d'un module, privilégiez le principe." Fait monter les réponses du niveau brainstorming au niveau architecture.

**AA. Autres questions "théorie du produit" proposées (réserve, si un dernier tour)**
- "Si cette application a 50 modules dans 5 ans, quels problèmes de compréhension et de maintenance voyez-vous apparaître dès aujourd'hui ?"
- "Dans quels cas conseilleriez-vous de NE PAS créer un module mais d'enrichir un module existant ?" (anti-inflation fonctionnelle - complète la grille d'évaluation, point A).
- "Quel module deviendrait inutile si un autre évoluait suffisamment ?"
- "Vous reprenez le projet comme architecte principal, interdiction d'ajouter le moindre module pendant un an : vos cinq priorités ?"
- "Quelles idées séduisantes rejetteriez-vous volontairement pour préserver la simplicité ?"

---

### 2026-08-28 - Du "moment de découverte" vers le document (Lexique / compétences -> CV)

**Contexte** : Denis veut que, quand une personne trouve quelque chose dans le Lexique ou dans Découvrir mes compétences ("tiens, 'médiation corporelle', je pourrais le mettre dans mon CV" ; ou "je me rends compte que je n'ai pas telle compétence"), elle puisse porter cette intention jusqu'à l'édition de son CV / sa lettre. Aujourd'hui il n'y a pas de canal entre "je découvre" et "je modifie mon document".

**BB. Un "panier / éléments à intégrer" (à trancher, PAS via les Repères)**
Une petite liste d'action `{ texte, source, cible }` (localStorage), distincte de Mes Repères. Le Lexique et Découvrir mes compétences y ajoutent ("Ajouter à mes éléments à intégrer") ; l'éditeur de CV / lettre l'affiche ("Vous avez noté ces éléments à intégrer : ...") avec un bouton d'insertion par élément.
*Pourquoi PAS un Repère* : un Repère est une réflexion qu'on garde ("question / idée / à approfondir / à discuter" - les 4 catégories couvrent bien le réflexif). "Médiation corporelle à mettre dans mon CV" n'est pas une réflexion, c'est un aide-mémoire d'action. Le faire passer par Repères diluerait ce que sont les Repères, et brancherait l'éditeur de CV sur les Repères, ce qui frotte avec la doctrine "espace personnel, jamais lu / analysé". Le panier, lui, est explicitement une liste d'action, sans ambiguïté.
*Lexique -> Repère reste possible* mais uniquement pour le cas réflexif (ex. "posture professionnelle" -> "je devrais réfléchir à ma posture" -> Repère "à approfondir"). Deux boutons, deux destinations : "Garder comme Repère" (réflexion) vs "Ajouter à mes éléments à intégrer" (action document).
*Où loger le panier (question posée par Denis 2026-08-28)* : Denis propose de le rattacher au futur module "Décider / aider à l'action" (le manque identifié dans la récolte IA). Avis : le module "Décider" reste un vrai manque à construire, mais il porte sur des **choix** (peser 2-3 pistes), pas sur "capturer un élément et l'injecter dans un document". Le panier est encore plus léger qu'une fonctionnalité de module : c'est un **pont** découverte -> document. Son foyer naturel est **la destination** : l'éditeur de CV / lettre affiche "Éléments à intégrer", le bouton "collecter" vit dans le Lexique. Pas de nouveau module, pas de page. Si Denis veut par ailleurs un vrai espace "action / à faire" (distinct de Carnet=capture et Repères=réflexion), c'est une question plus large à peser séparément - ne pas la trancher maintenant.

*Portée resserrée (Denis, 2026-08-28)* : le panier ne concerne **PAS** "Découvrir mes compétences". Ce module bâtit un CV de zéro à partir du récit d'une personne très éloignée de l'emploi (voir mémoire `module-decouvrir-mes-competences-role-reel`) - le flux est direct récit -> compétences -> CV, tout ce qui est découvert va sur le CV, aucun aide-mémoire intermédiaire n'a de sens. Le seul vrai cas d'usage du panier reste : **le Lexique** (quelqu'un tombe sur un terme / une pratique en naviguant, hors de tout parcours d'édition, et veut le garder pour son CV plus tard). Éventuellement aussi : enrichir un CV existant. Si ce seul cas ne justifie pas le coût, la version "→ Ouvrir mon CV pour l'ajouter maintenant" (immédiat, rien de stocké) reste le repli.

*RÉSOLUTION TRANCHÉE (Denis, 2026-08-28) : pas de panier séparé, pas de nouveau module. Le Carnet est le point de capture unique, avec deux sorties volontaires.*

Modèle arrêté :
- **Le Carnet = le seul espace de capture.** Calme, sans pression, toujours visible, ouvrable à tout moment. On y écrit, on y dicte, on y colle du contenu du site, on y note des choses d'ailleurs. Il enregistre tout. Par défaut, une note reste une note.
- **Sortie 1 : une note -> Repère** (déjà existant). Pour ce qui demande une réflexion plus poussée. Va dans le module Repères.
- **Sortie 2 : une note -> Action** (nouveau). Pour ce que la personne a noté parce qu'elle veut l'utiliser. La note "action" devient un élément à intégrer : visible dans l'éditeur de CV / lettre, insérable, disparaît une fois utilisée. La transformation se fait **depuis le Carnet** (une petite fonction "transformer en action" sur la note, pas un écran à part).
- Le Lexique / la barre de recherche qui veulent "garder ce terme" créent une **note de Carnet** (éventuellement pré-marquée "action"). Le Carnet reste l'entonnoir unique.
- Résultat : **deux espaces** (Carnet + Repères), pas trois. Le "panier" n'est qu'un état d'une note et une vue filtrée côté éditeur de document.

Pourquoi c'est le bon choix (Denis) : un troisième espace visible surchargerait l'écran et la personne ne saurait plus "quoi mettre où" (Repère ? panier ? Carnet ?). Là, la règle est simple : tout part du Carnet, et parmi ce qu'on y met, certaines choses deviennent des Repères, d'autres des actions.

Cohérent avec la doctrine Carnet : "jamais lu ni analysé **automatiquement**" tient - les deux transformations sont volontaires, par note. Garde-fous : le Carnet par défaut ne change pas (les boutons de transformation sont discrets et contextuels) ; les notes "action" non utilisées ne doivent pas culpabiliser (l'éditeur affiche juste un compteur, les notes utilisées sont marquées / retirées). `docs/DOCTRINE_CARNET.md` à compléter au moment de construire.

*Le bouton "garder" et le tri (Denis, 2026-08-28)* : **ne pas trier au niveau de "garder", trier au niveau de "action".**
- **"Garder cette information"** (terme, expression, idée, question, notion, concept, auteur, outil, méthode...) : proposé sur **TOUT** dans le Lexique et la recherche. Aucun tri éditorial. Pas de "pourquoi celui-ci et pas l'autre".
- **-> Repère** : possible sur n'importe quelle note (choix de la personne, pour la réflexion).
- **-> Action** (élément à intégrer dans un document) : **tri strict**, uniquement sur du contenu utilisable dans un CV ou une lettre de motivation - compétences, synonymes / meilleurs mots pour un CV, expressions pour une lettre. Une définition de sigle, un concept théorique, un auteur ne deviennent pas une action (mais restent gardables et transformables en Repère).
- **Prérequis** : les entrées du Lexique doivent porter un champ **type / famille** (compétence / expression-CV / expression-lettre / synonyme-professionnel / concept / auteur / méthode / sigle / dispositif...). Le bouton "-> Action" apparaît sur les types "utilisables document", pas sur les autres. Ce champ sert aussi à l'organisation du Lexique et recoupe le système de familles de couleur déjà partiellement en place.
- **Notes tapées librement dans le Carnet** : "-> Action" toujours disponible (la personne affirme elle-même que c'est de la matière document).
- **Repli à faible enjeu** : le panneau "éléments à intégrer" de l'éditeur laisse toujours retirer un élément - même un élément mal placé n'est pas grave.

---

### 2026-08-28 - Module "faire un CV à partir de l'offre" (chemin inverse) - À VÉRIFIER

**Idée (Denis, abandonnée puis re-notée)** : au lieu de "j'ai mon CV, je l'adapte à l'offre", écrire le CV **en partant de l'offre**.

**Ligne éthique à ne pas franchir** : "partir de l'offre et mettre un maximum de choses pour que l'employeur appelle" = risque d'aider quelqu'un à écrire un CV qui n'est pas vrai (mettre des compétences que la personne n'a pas parce que l'offre les demande). Contraire à la Constitution ("jamais inventer à la place de la personne") ET mauvais conseil de CIP (la personne est démasquée en entretien).

**La version légitime** : l'offre est lue **d'abord** et sert de **grille de lecture** pour décider **lesquelles des expériences réelles de la personne mettre en avant, dans quel ordre, avec quels mots**. La matière vient toujours de la personne ; l'offre oriente la hiérarchie et le vocabulaire.

**Où ça vit** : sans doute PAS un module de plus. C'est une **porte d'entrée / un cadrage** du travail CV, avec un fort recouvrement avec "Analyser ma candidature" (lit déjà le CV contre l'offre), ATS (mappe déjà les mots-clés de l'offre) et le composeur CV. Chemin inverse (offre -> CV) et chemin normal (CV -> adapter) = deux portes d'entrée d'une même machinerie CV. À passer par la grille d'évaluation. Statut : `[SANS MODULE]`, à reprendre quand le Bilan / le CV seront retouchés.

---

### 2026-08-28 - Recommandation : ATS = un volet de "Analyser ma candidature", pas un module

Question posée par Denis : ATS et "Analyser ma candidature" font-ils doublon ? Peut-on les fusionner ?

**Ce ne sont PAS la même chose** (questions différentes) :
- **Analyser ma candidature** = lecture **qualitative et globale** : comment un recruteur humain perçoit le CV (adéquation de fond, crédibilité, cohérence du parcours, impact, clarté, lisibilité / structure). Juge la substance et la forme.
- **ATS** = comparaison **mécanique, au niveau du vocabulaire** : le CV contient-il les mots que le logiciel de tri (ou le recruteur qui scanne) recherche ? Mots présents / absents / proches + reformulations.

Un CV peut être solide qualitativement mais rater les mots-clés exacts ("tu dis 'j'ai piloté', l'offre attend 'gestion de projet'"), et l'inverse.

**Recommandation de Claude (à confirmer par Denis)** : **fusionner ATS DANS "Analyser ma candidature", comme un volet dédié "Vocabulaire et mots-clés"**, pas un module séparé. Raisons : (1) le Bilan lit déjà le CV contre l'offre ; (2) ATS est mince (une liste de mots + des reformulations) = une fonctionnalité, pas un module ; (3) un seul outil, un seul rapport, un seul endroit -> tue la confusion "lequel j'utilise ?" ; (4) réduit le risque qu'ATS dérive vers un score. Le volet "Vocabulaire et mots-clés" n'apparaît que quand une offre ou un métier est fourni. Confirmé par la récolte multi-IA (3 assistants sur 4). Si adopté : le chantier stratégique 4 "ATS" (`docs/TACHES_VALIDEES.md`) devient "volet vocabulaire du Bilan", plus un chantier autonome.

**Le "CV à partir de l'offre"** (chemin inverse) vit alors aussi ici : c'est le **mode accompagné du Bilan lancé d'emblée avec une offre**, l'offre servant de grille de lecture pour construire / réécrire le CV section par section, toujours à partir de la matière réelle de la personne. Net : au lieu de 3 choses (Bilan, ATS, CV-depuis-offre), **un seul hub - "Analyser ma candidature" - avec l'offre qui le traverse**, plus des portes d'entrée.

---

### 2026-08-28 - "Analyser ma candidature" comme hub à dimensions (idée de Denis + avis Claude)

Denis propose : "Analyser ma candidature" devient un hub. Dimensions possibles : **Bilan** (analyse de fond + structure), **ATS** (vocabulaire / mots-clés), **CV depuis l'offre**, **Regard recruteur** (forme visuelle, image). La personne choisit les dimensions ; **chaque dimension a son propre prompt** ; peut-être un prompt global à la fin.

**Avis Claude :**
- **OUI au hub pour les dimensions "texte"** : Bilan (par défaut) + ATS (volet "vocabulaire", apparaît si une offre / un métier est fourni). Un seul point d'entrée, un seul rapport.
- **Regard recruteur = à garder comme dimension, MAIS c'est un sous-flux à part** : entrée différente (image / capture d'écran du CV), étape de masquage par rectangles, moteur différent (chantier stratégique 5). L'offrir **depuis** le hub ("vous voulez aussi un regard sur la forme visuelle ? ->"), pas le traiter comme "un prompt de plus dans la liste".
- **"CV depuis l'offre" n'est PAS une analyse, c'est une construction.** Les autres produisent un diagnostic ("voici ce qui va / manque") ; celle-ci produit un document ("voici votre CV"). La mettre dans un outil nommé "Analyser" crée un décalage de modèle mental. Sa place : côté "Mes documents" (construction), OU comme **sortie** du hub ("d'après cette analyse, voulez-vous qu'on reconstruise le CV en partant de l'offre ? ->").
- **UX : ne PAS faire choisir les dimensions dans un menu en amont.** Une personne qui ne sait pas ce qu'est un ATS ne peut pas décider "je veux la dimension ATS". Lancer une **analyse par défaut sensée** (fond + structure), et le rapport **propose** les dimensions supplémentaires en étapes suivantes ("vous voulez aussi vérifier les mots-clés face à une offre ? ->"). Progressif, pas un menu.
- **Prompts : un par dimension = OUI** (conforme à [[LECONS]] §1bis "jamais un prompt fourre-tout"). **Un prompt global "qui fait tout" à la fin = NON** - c'est exactement le fourre-tout qui a déjà brûlé Denis (fusion V3 diagnostic + extraction, retirée le jour même). À la place : une **synthèse au niveau du code** qui assemble les résultats des dimensions réellement lancées, en un rapport lisible.
- Cohérent avec le megachantier accueil : un seul carreau "Analyser ma candidature" qui ouvre une page calme (pas une cascade de fenêtres), avec l'analyse par défaut et les dimensions proposées ensuite.

**REVIREMENT de Denis (2026-08-28, tard) : plutôt garder les modules SÉPARÉS.** Raison : il a testé le principe "faire un parcours pour arriver à la dernière case" -> au bout d'un moment c'est fatigant, il faut aimer sur-analyser en continu. Il préfère des modules courts et directs qui répondent vite à un besoin, sans détour ni menu de choix. Donc : ATS = petit module à part (rapide), Regard recruteur = à part, CV depuis l'offre = côté documents. À reprendre reposé - ne pas figer ce revirement comme définitif, mais c'est sa préférence actuelle et elle s'appuie sur un vrai test utilisateur.

**Simplification du bouton "action" (2026-08-28, tard)** : abandonner le tri par "type action-eligible". Trop compliqué, et on ne peut pas deviner si une note tapée à la main est "de la matière document". À la place : sur n'importe quelle note, un bouton "-> mettre dans mon CV / ma lettre". Si la personne clique, c'est son choix. Si c'est inutile, elle retire. Pas de logique de type.
"Le panneau à intégrer" = quand la personne ouvre son CV pour le modifier, une petite boîte sur le côté liste les notes qu'elle a marquées "pour mon CV", chacune avec un bouton "insérer". Juste un pense-bête au moment d'éditer.

**Garde-fous et suivi (Denis, 2026-08-28, tard) :**
- Les éléments "action" **complètent**, ils ne **remplacent jamais** une phrase déjà formulée par l'assistant. Au mieux : proposer de les intégrer dans des passages.
- Ils sont pris en compte **au 1er passage** (le contenu se formule autour d'eux), pas glissés de force au 2e. Le 2e passage sert de **filet** : re-vérifier la cohérence, au cas où le 1er a laissé passer.
- **Garde-fou au niveau du prompt** (on ne peut pas faire signer un papier sur l'honneur à une personne fatiguée / qui lit mal le français) : consigne explicite au prompt - vérifier la cohérence entre ce que la personne a marqué et ce qu'on peut réellement en faire ; si rien n'est faisable, l'élément n'est pas retenu. Consigne reprise dans le 2e prompt en filet.
- **Traçabilité dans le Carnet** : le Carnet garde la trace des 3 états - note simple / note -> Repère / note -> Action - à titre informatif (la personne peut toujours supprimer).
- **Statut affiché** :
  - Repère issu du Carnet : "pas encore analysé" tant que le Regard extérieur ne l'a pas traité ; "Repère analysé / examiné" ensuite.
  - Action issue du Carnet : "intégré au CV" si l'assistant l'a jugé cohérent et l'a placé ; sinon "non retenu" avec une raison **douce, jamais accusatrice** (ex. "cet élément ne correspondait pas à une expérience de votre parcours").
- **Note doctrine** : ceci ajoute une dimension "suivi" au Carnet (statut de ce qu'il a produit). C'est une évolution de ce qu'est le Carnet - `docs/DOCTRINE_CARNET.md` à mettre à jour. Reste conforme à "jamais lu / analysé automatiquement" : c'est du statut sur des éléments que la personne a volontairement fait sortir, pas de l'analyse du Carnet.

**CC. Champ libre "quel est votre objectif" AVANT tout parcours qui passe par un prompt pour modifier un document (validé par Denis, à faire)**
Règle générale : **avant** de lancer une analyse ou une modification de document (CV, lettre...) via un assistant, demander à la personne ce qu'elle veut concrètement obtenir / changer. Champ libre **optionnel**.
- **Champ vide** -> le comportement de l'assistant ne change pas, analyse complète comme aujourd'hui.
- **Champ rempli** -> le prompt doit traiter **d'abord** cette demande spécifique de la personne, **puis** faire tout ce qu'il faisait jusque-là. L'ordre compte : la demande de la personne passe en tête, le reste vient ensuite, jamais l'inverse.
**Le patron existe déjà** dans Cohérence de mon dossier ("Une question ou une demande précise ?", `ctOuvrirCollecteComplement`). À étendre à Analyser ma candidature, au parcours de modification du CV, et à tout module qui réécrit un document. Le panier (BB) peut pré-remplir ce champ ("j'ai vu 'médiation corporelle' dans le Lexique, je veux l'intégrer"). Destination : chantier "consolider le Bilan sur une page" + à garder comme règle transverse des prompts de réécriture.

**DD. Mettre en Repère un mot du Lexique / de la barre de recherche**
Techniquement facile (même mécanisme que Carnet -> Repère). Utile pour le cas réflexif. Attention à ne pas encourager à transformer chaque mot consulté en Repère (bruit) - proposer le bouton seulement sur les entrées "de fond" du Lexique (concepts, postures, grilles de lecture), pas sur une simple définition de sigle.

### 2026-08-28 - Banque de tournures « nommer une difficulté sans la durcir » (Denis)

**Idée** : pendant la conception du chantier « ton des prompts Regard extérieur », Denis a fourni une longue banque de formulations types (validation de ce que la personne exprime, nommer un frein au présent sans le figer, rester prudent et humain, ouvrir vers une suite, formulations « ni un drame ni un détail »). Les 3 axes vraiment nouveaux ont été intégrés directement dans le paragraphe « Ton » des 2 prompts (`prompts/regard-exterieur.md`, `regard-exterieur-approfondissement.md`) : frein dit au présent / pas une étiquette / pas une situation définitive ; « le nommer ne réduit jamais la personne à ce frein » ; « ni un drame, ni un détail ». **Le reste de la banque n'a pas sa place dans un prompt d'analyse** : ce sont surtout des phrases de retour à quelqu'un pendant qu'il écrit ou répond (« Vous l'exprimez clairement », « Ce point est bien formulé », « On comprend bien ce qui se passe »).

**Contexte d'origine** : chantier ton Regard extérieur, 2026-08-28.

**Recommandation** : réutiliser cette banque comme **lexique de formulations**. Destination principale ajoutée le **2026-08-29 (décision Denis)** : le futur chantier **« revisualiser le module Découvrir mes compétences »** (voir `docs/TACHES_VALIDEES.md`, section « Chantier futur »). C'est le module qui accueille le plus de récits en vrac d'un public très éloigné de l'emploi - le retour à la personne y gagne à s'appuyer sur ces tournures. À traiter **en même temps que sa page d'accueil** (Denis : « quand je ferai la page d'accueil de ce module, il faudra qu'on voie ça aussi »).
Autres destinations possibles (secondaires) :
- l'écran de relecture / correction du **Bilan candidature** (retour à la personne sur ce qu'elle vient de saisir) ;
- un futur mode de **réponse guidée** (accompagner la personne quand elle répond aux questions fixes de Regard extérieur ou du Bilan) ;
- le **Lexique** (entrée « nommer une difficulté / un frein », registre du secteur sans langue de bois).

**Texte brut à conserver** (fourni par Denis, à trier au moment du reclassement) :
- Valider ce qui est juste : « Vous l'exprimez clairement. » / « Ce point est bien formulé. » / « La situation est dite avec précision. » / « Vous nommez quelque chose de réel. » / « Le frein est identifiable. » / « On comprend bien ce qui se passe. » / « Ce que vous dites permet d'avancer. » / « Votre réponse aide à situer la difficulté. »
- Nommer une difficulté sans la durcir : « Aujourd'hui, c'est un point difficile. » / « À ce stade, cela vous bloque. » / « C'est une difficulté réelle, ici et maintenant. » / « Ce point mérite d'être pris au sérieux. » / « La situation est concrète, pas vague. » / « Ce n'est pas un détail, c'est un vrai point d'appui pour la suite. » / « C'est un point à regarder sans précipitation. »
- Rester prudent et humain : « Ce n'est pas un jugement. » / « Ce n'est pas définitif. » / « Cela ne dit rien de votre valeur. » / « Vous n'êtes pas réduit à cette difficulté. » / « Le point est là, mais il peut évoluer. » / « La situation peut changer avec le temps. » / « On peut le traiter par étapes. » / « Il y a une marge de progression. »
- Ouvrir vers une suite : « Ce point peut être travaillé à part. » / « On peut commencer par là. » / « C'est un bon point de départ. » / « Ce frein peut être abordé avant le reste. » / « Il y a une suite possible. » / « On voit déjà par où commencer. » / « Il existe des pistes concrètes pour avancer. »
- Phrases complètes : « Vous dites ne pas avoir le permis. Aujourd'hui, cela vous empêche d'aller sur les postes qui vous intéressent. » / « Vous nommez une difficulté de confiance. Ce n'est pas un défaut de fond, c'est une situation actuelle qu'on peut travailler. » / « Ce que vous décrivez n'est pas deux problèmes séparés : c'est le même frein qui revient dans plusieurs moments. » / « On comprend bien ce qui vous freine maintenant, sans en faire une étiquette sur vous. »
- Éviter le vocabulaire trop dur : « Dites-le simplement. » / « Gardez le mot juste. » / « Restez au plus près de ce que vous avez écrit. » / « N'en faites ni un drame, ni un détail. » / « Formulez-le comme une situation, pas comme une étiquette. »

**Statut** : `[RECLASSÉ -> chantier futur « revisualiser Découvrir mes compétences »]` (3 axes déjà dans le ton de Regard extérieur ; le reste rattaché à ce chantier + à sa page d'accueil, à reprendre le moment venu).

### 2026-08-28 - Petits « plus » différés du chantier freins (étapes 5 à 9) - SOLDÉS le 2026-08-29

Le chantier freins (9 étapes) est terminé. Trois pistes secondaires avaient été laissées de côté ; **toutes traitées** pendant la 2e moitié du chantier Ressources (voir `docs/TACHES_VALIDEES.md`) :

1. **Liens cliquables depuis « Mes freins identifiés »** → **FAIT** (étape 4 de la 2e moitié, commit `bf76c93`) : rapport / Repère s'ouvre dans la même fenêtre avec un « ← Retour à mes freins ».

2. **Accès direct depuis l'accueil vers la rubrique Lexique « Ce qui peut freiner un parcours »** → **ABANDONNÉ** (décision Denis) : tout passe par le Lexique + la barre de recherche, pas de raccourci accueil supplémentaire.

3. **Enrichir `_FREINS_LEXIQUE_VOIR_AUSSI`** → **FAIT** : **17 freins sur 17** ont maintenant une cible Lexique. 9 nouvelles fiches concept écrites (`illettrisme`, `fle`, `illectronisme`, `casier-judiciaire`, `aide-alimentaire`, `hebergement-urgence`, `aide-materielle`, `violences`, `aide-a-la-mobilite`, `surendettement`, `aides-garde-enfants`, `assistante-sociale`, `addictologie`), faits vérifiés.

**Statut** : `[RECLASSÉ -> TACHES_VALIDEES, chantier Ressources 2e moitié]` - clos.

### 2026-08-29 - Idées avancées pendant le chantier « Ressources - 2e moitié » (non implémentées ici)

**Contexte d'origine** : chantier Ressources 2e moitié (Urgences + Annuaire + fiches Lexique + renvois locaux). Ces pistes ont été discutées, jugées bonnes, mais laissées de côté parce qu'elles débordent le périmètre du chantier ou dépendent d'un autre chantier / d'un tiers.

**1. Pré-réglage du département au déploiement (`?dep=87` ou config par URL dédiée)**
Alternative à la géolocalisation navigateur (écartée - voir `docs/TACHES_VALIDEES.md`). Si le partenaire (PCGI 87 / Inkéo, ou un futur territoire) diffuse l'application sur une URL dédiée, on peut y pré-régler le département : la clé `erip_departement_ressources` est posée d'office, aucun popup, aucune géoloc. Même principe avec un paramètre d'URL `?dep=87` sur le lien diffusé. Zéro coût pour l'utilisateur.
*Recommandation* : à activer le jour où un déploiement partenaire le justifie. `[SANS MODULE]` - petite fonction transverse (`js/app.js`, autour de `departementRessourcesMemorise`).

**2. « Forme 2 » généralisée : indications par fiche selon le département**
Chaque fiche Lexique « type de structure » (France Travail, Cap emploi, CAF, SIAE...) donnerait, une fois le département connu, un pointeur concret (87 → PCGI 87, 24 → le site de la structure, etc.). Aujourd'hui seul `plie` et `mission-locale` ont ce comportement (étape 13, limité au 24). Le généraliser suppose un modèle de données fiche × département → lien, et surtout **un cadrage avec les partenaires PCGI 87** : est-ce qu'ils étendent leur annuaire au 24, ou est-ce Denis qui prend la relève via ses propres fiches ?
*Recommandation* : `[SANS MODULE]` - gros chantier futur, à ne pas démarrer avant l'accord partenaire. Déjà noté dans `docs/TACHES_VALIDEES.md` (section Ressources, « Décisions »).

**3. Patron réutilisable : renvoi vers un catalogue local en libre-service**
Le mécanisme mis en place pour le 24 (`_LEXIQUE_RENVOI_LOCAL_PAR_FICHE` type `atelier` → l'ERIP du Bergeracois, ateliers mensuels, **jamais de date annoncée**, on renvoie vers le programme + inscription en ligne) est un patron : dès qu'un territoire a un catalogue d'offres récurrentes où la personne peut s'inscrire seule, on peut y renvoyer une fiche thème. À réutiliser tel quel pour d'autres territoires, ou pour d'autres modules qui voudraient pointer vers une offre locale programmée.
*Recommandation* : `[RECLASSÉ -> mécanisme en place]`, à répliquer sans redévelopper.

**4. Repointer `RESSOURCES_DEPARTEMENTS['24'].lien`** — ✅ **FAIT le 2026-08-29 (étape 16, commit `036c9fc`)**. Le lien pointe maintenant vers `missionlocaledubergeracois.com/erip` (au lieu du catalogue brut `linscription.com`). `[RECLASSÉ -> TACHES_VALIDEES étape 16]`.

**5. Groupe « Dans le Lexique » dans les résultats de la barre d'accueil** — ✅ **FAIT le 2026-08-29 (étape 16, commit `036c9fc`)**. `rechercherBaseConnaissances()` a un groupe `« Dans le Lexique »` : plafond 5, match titre + variantes, classé en dernier, dédoublonné. Tout le corpus Lexique ressort désormais de l'accueil. `[RECLASSÉ -> TACHES_VALIDEES étape 16]`. Reste cosmétique (position exacte du groupe, style de carte) pour le chantier Accueil.

**6. Patron éditorial : « nommer une porte, pas une URL » pour un concept dont la réponse locale varie**
Utilisé pour le 2e niveau « Par où commencer » de `mobilite-internationale` : on nomme le **type** de structure à contacter (Info Jeunes / Eurodesk, conseiller France Travail réseau EURES, Mission Locale si < 26 ans) sans donner de lien, exactement comme on nomme CCAS / Maison des solidarités ailleurs. Réutilisable pour toute fiche concept où « à qui s'adresser » dépend du territoire ou du profil.
*Recommandation* : `[RECLASSÉ -> doctrine Lexique]`, à appliquer à l'écriture des futures fiches.

---

## Idée notée le 2026-09-01 (Denis) : ponts entre modules, à l'intérieur des modules

**PLUS TARD** — une fois tous les modules faits et stabilisés. Permettre à une personne de **passer d'un module à l'autre via des ponts internes** (depuis l'intérieur d'un module, un lien vers un autre module pertinent). Quand elle revient au module de départ, elle retrouve la question **« Continuer ou Recommencer »** (même mécanisme que le chantier « bouton présentation », `_ctReprisePendante`). Ne rien faire avant la stabilisation générale.

---

## Idée notée le 2026-09-01 (Denis) : bloc « Conditions de travail » dans le Lexique + repères ancrés dessus

**Bloc Lexique « Conditions de travail » - RÉALISÉ le 2026-09-04.** 12 fiches écrites (`data/lexique.js`, univers `conditions-travail`, libellé ajouté dans `modules/lexique/index.js`) : Télétravail, Horaires de travail, Rythme et variété des missions, Travail de nuit, Astreintes, Déplacements professionnels, Port de charges et effort physique, Environnement de travail, Formation et accompagnement à la prise de poste, Temps partiel choisi ou subi (comparatif), Contact avec le public, Proximité domicile-travail - chacune avec son second niveau (« En savoir plus »), réunies dans un nouveau parcours `parcours-conditions-travail`. **Doctrine tranchée par Denis 2026-09-04** : fiches neutres, comme le reste du Lexique - **le volet « comment en parler en entretien / le négocier » n'a PAS été ajouté**, il reste la matière du futur module « Défendre mes conditions » (idée du 2026-09-02, ci-dessous), qui s'appuiera sur ces fiches plutôt que de dupliquer leur contenu. Audit de couverture fait contre les 25 cartes de `data/valeursProfessionnelles.js` : les notions non reprises en fiche neuve (salaire, autonomie, évolution, stabilité, ambiance, sens...) sont soit déjà couvertes par une fiche existante (liens ajoutés), soit trop personnelles/subjectives pour être un terme de Lexique. `node scripts/checkLexique.js` : 0 erreur, 0 avertissement (153 fiches). **Reste non fait** : le mécanisme d'ancrage d'un repère sur une condition de travail (2 puces ci-dessous), qui touche le module Repères en plus du Lexique - toujours "chantier transversal à cadrer après stabilisation", pas commencé.

**Contexte d'origine** : discussion sur la refonte de la carte « Mes documents » (plan `docs/PLAN_REFONTE_MES_DOCUMENTS_2026-09-01.md`). En parlant des repères, Denis a cherché « un bon endroit pour poser un repère » et « une super synergie entre les modules ».

**L'idée** :
- Créer un **nouveau grand sujet « Conditions de travail » dans le Lexique** (télétravail, horaires, rythme, déplacements, port de charges, environnement bruyant, travail de nuit, astreintes, temps partiel choisi/subi...). Fiches sur le même principe que le reste du Lexique : de la connaissance, jamais un diagnostic sur la personne.
- Permettre d'**ancrer un repère sur une condition de travail** (comme on ancre déjà un repère sur un frein, un axe du Bilan, etc.). Quand la personne parcourt les conditions de travail et en met une de côté, c'est le signe qu'elle a **identifié un besoin ou une limite**.
- Réutiliser ce repère plus tard pour **aider la personne à construire son fil argumentaire** : défendre auprès d'un futur employeur une condition à laquelle elle tient (ex. « pouvoir télétravailler 2 jours »), ou expliquer une contrainte réelle. Le repère devient une matière première pour l'argumentation (lettre, entretien, négociation).
- Réflexion plus large restée ouverte : **sur quoi peut-on ancrer un repère** — un métier, un groupe de métiers, un secteur, un environnement ? À cartographier.
- **Point de connexion pressenti par Denis** : l'écran **« Attentes »** du parcours « Créer un nouveau CV » (l'actuel `pageValeurs`, valeurs / attentes professionnelles) — c'est là que la personne exprime déjà ce qui compte pour elle au travail.
- Piste connexe : pendant les 5-6 écrans de choix du parcours « Créer un nouveau CV » (Objectif / Activités / Actions / Environnement / Attentes), repérer les éléments qui mériteraient une fiche Lexique (avec justification, au cas par cas).

**Recommandation** : `[SANS MODULE]` pour la partie « bloc Conditions de travail » — rejoint la famille des enrichissements du Lexique (voir l'idée du 2026-08-27 plus haut : compétences, projet, expressions RH). La partie « repère ancré sur une condition + fil argumentaire » touche à la fois le Lexique, le module Repères et les modules Lettre / Entretien : **chantier transversal à cadrer après la stabilisation des modules**, pas dans la refonte « Mes documents » en cours. À ne pas démarrer maintenant.

**Complément 2026-09-02** (retours parcours « Créer un CV », `docs/AUDIT_PARCOURS_CREER_CV_2026-09-02.md`) :
- Le point d'entrée naturel de cette idée est l'écran **« Attentes / Valeurs »** du parcours « Créer un CV » (« Qu'est-ce qui est important pour vous dans un travail ? »). Denis : ces cartes = des valeurs / conditions ; tout le monde coche tout, donc peu discriminant tel quel. Piste : rendre les valeurs cochées **« récupérables »** (clic → repère) pour servir de matière première à un travail d'argumentaire ; et **classer un top 3**.
- Chaque fiche « Conditions de travail » du Lexique donnerait, en plus de la définition : **comment en parler en entretien** et **comment le négocier** (avec un salarié en poste, avec un responsable, à l'embauche vs en cours de contrat).

## Idée notée le 2026-09-02 (Denis) : module « Défendre mes conditions / Préparer une négociation »

**Contexte d'origine** : retours sur le parcours « Créer un CV », page « Attentes / Valeurs ». Denis se demande s'il faut « carrément un module avec un prompt spécifique » pour : comment négocier ses conditions de travail, son contrat, défendre ses intérêts.

**L'idée** : un module qui aide à **construire un fil argumentaire** pour défendre 1 ou 2 conditions précises auxquelles la personne tient (télétravail, horaires aménagés, montant du salaire, formation, évolution…), à partir de sa **situation réelle** et de ce qu'elle apporte. Prompt clair possible : entrée = les conditions visées + le contexte (poste, entreprise, rapport de force perçu) ; sortie = des arguments concrets, une façon de les amener, ce qu'il ne faut pas dire, les contreparties possibles. Sujet CIP légitime (négociation d'embauche, d'augmentation, aménagement de poste).

**Recommandation** : `[SANS MODULE]` — **nouveau chantier à part entière**, à évaluer **après** la stabilisation des modules existants et la refonte « Mes documents ». Se nourrit du bloc Lexique « Conditions de travail » et des repères ancrés sur l'écran « Attentes ». Ne pas démarrer maintenant.

## Idée notée le 2026-09-02 (Denis) : alimenter le Lexique avec un référentiel de compétences

**Contexte d'origine** : maquette de la page « Votre profil » (ex-« Faire le point »), `docs/MAQUETTE_VOTRE_PROFIL_2026-09-02.html`. La rubrique « Vos compétences » classe les compétences repérées en Savoir-faire / Savoir-être / Savoirs ; un clic sur une compétence ouvre un petit descriptif.

**L'idée** : construire un **référentiel de compétences** (les ~60 libellés de `categorieCompetence` + ce qui remonte de `savoirFaire` / `savoirEtre` / `savoirs` des ~125 fiches métier), chacun avec une **fiche courte** (une phrase : ce que la compétence recouvre concrètement). Ces fiches nourrissent :
- le descriptif au clic sur une compétence de « Votre profil » (aujourd'hui un mock dans la maquette) ;
- potentiellement le Lexique lui-même (nouvelle collection « Compétences »).

**Recommandation** : `[SANS MODULE]` — travail de **données / contenu**, à faire avec la refonte « Votre profil » (le descriptif au clic en dépend) OU juste après. Rejoint la famille des enrichissements du Lexique déjà notés (compétences, projet, expressions RH, conditions de travail). Périmètre à cadrer : d'abord les compétences les plus fréquentes, jamais un dictionnaire exhaustif. Le classement Savoir-faire / Savoir-être ne couvre pas « Savoirs » aujourd'hui (`categorieCompetence` est à 2 catégories) : à compléter.

## Idées avancées pendant le chantier « Comprendre le cadre » (2026-09-05 / 2026-09-06), non implémentées

**Contexte d'origine** : vérification des 14 rayons + construction de « Affiner ma recherche » (recherche libre en deux temps). Pistes discutées ou repérées en passant, laissées de côté car hors périmètre.

**1. Extraire `socleRecherche()` / `TON` dans un fichier de briques de prompt partagé**
Aujourd'hui ces textes existent en double : une fois dans `outils/veille.html` (fichier autonome, utilisable hors ligne, pas de JS partageable) et une fois recopiés dans `modules/comprendre-le-cadre/index.js` (`_comprendreLeCadreSocleRecherche()` / `COMPRENDRE_LE_CADRE_TON_RECHERCHE`), avec un commentaire « dette de duplication ». Si un 3e endroit a besoin du même socle, créer un `data/briquesPromptRecherche.js` (ou équivalent) et faire pointer les modules dessus ; `veille.html` resterait sur sa copie tant qu'il doit fonctionner hors ligne.
*Recommandation* : `[SANS MODULE]` — dette technique à inscrire dans `docs/BRIQUES_COMMUNES.md`, à résorber au prochain module qui réutilise ces prompts, jamais à chaud.

**2. Résultats de recherche d'accueil qui ouvrent directement le bon rayon**
`data/baseConnaissancesERIP.js` fait remonter chaque rayon de « Comprendre le cadre » depuis la barre d'accueil, mais la cible est `route:comprendre-le-cadre` : la personne atterrit sur l'accueil du module, pas sur le rayon qu'elle a cherché. Ouvrir directement le rayon demande de passer un paramètre à `naviguerVers` / `ouvrirCibleRechercheApp` (`js/app.js`) puis de le lire dans `pageComprendreLeCadre()` pour poser `_comprendreLeCadreEtat.ecran = 'rayon'`.
*Recommandation* : `[SANS MODULE]` — petite amélioration transverse, touche `js/app.js` : à faire soit dans le chantier « Découpage de `js/app.js` », soit dans un futur passage sur la barre de recherche d'accueil.

**3. Passer l'écran « copier / coller » de « Affiner ma recherche » au composant partagé `htmlCollageInstantane` / `activerCollageInstantane`**
Le module utilise pour l'instant un simple `<textarea>` + bouton « Copier », alors que le reste de l'app (Bilan, Composeur) utilise le composant de collage instantané partagé (collage automatique, aperçu, bouton importer un fichier). Aligner « Affiner ma recherche » dessus quand la dette B.1 de `BRIQUES_COMMUNES.md` (composant d'import partagé) sera résorbée sur ce module.
*Recommandation* : `[SANS MODULE]` — rejoint la résorption « chantier par chantier » de la dette d'import CV / de collage (décision Denis 2026-08-30).

**4. Fiches de « Comprendre le cadre » proposées à la personne à partir de sa recherche libre**
Sur l'écran résultat de « Affiner ma recherche », on renvoie vers les **rayons** touchés. On pourrait aller plus loin : faire remonter les **fiches** précises (par le titre / le « pour qui ») qui correspondent aux sous-chapitres choisis, comme un pont entre la recherche libre et le contenu déjà vérifié du module.
*Recommandation* : `[RECLASSÉ -> Comprendre le cadre]` — amélioration du module lui-même, à évaluer après un vrai test terrain de « Affiner ma recherche » (est-ce que les gens s'en servent ?).

**5. Correspondance floue entre le « domaine » renvoyé par l'assistant et les rayons du module**
Le bouton « Ouvrir le rayon » de l'écran des sous-chapitres ne s'affiche que si le mot `domaine` écrit par l'assistant correspond **exactement** à une clé de `RAYON_LABEL` (`mobilite`, `budget`...). Un assistant qui écrit « transport » ou « déplacements » au lieu de « mobilite » ne déclenche pas le renvoi. Une petite table de synonymes (domaine libre → clé de rayon) fiabiliserait ce pont.
*Recommandation* : `[RECLASSÉ -> Comprendre le cadre]` — à ajuster au fil des retours terrain, quand on verra quels mots les assistants emploient réellement.

**6. Module / digest « Comprendre les chiffres » (extraction, Mode A)** — ✅ **CHANTIER OUVERT le 2026-09-06** : `docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md`. `[RECLASSÉ -> chantier Comprendre les chiffres]`.

## Idées issues des retours d'assistants sur « Comprendre les chiffres » (2026-09-06), hors périmètre du chantier

**Contexte d'origine** : Denis a collecté les retours de plusieurs assistants en ligne sur quels chiffres mettre dans le module « Comprendre les chiffres » (voir `docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md` § 4, où l'essentiel a été intégré). Les pistes ci-dessous sont bonnes mais ne rentrent pas dans le chantier en cours - à reprendre plus tard, module par module.

**A. 4e échelle territoriale : le bassin d'emploi**
Le module compare département / Nouvelle-Aquitaine / France. Un assistant recommande, pour la Dordogne et la Haute-Vienne, de descendre au **bassin d'emploi** (Périgueux, Bergerac, Sarlat ; Limoges, Saint-Junien) - sans aller plus bas si les effectifs sont trop faibles. L'enquête BMO et certaines séries France Travail sont d'ailleurs surtout exploitables à ce niveau.
*Recommandation* : `[RECLASSÉ -> Comprendre les chiffres, V2]` - à ajouter une fois la V1 (trio dept/région/France) stable et testée en terrain. Demande un digest par bassin, pas seulement par département : alourdit la production trimestrielle, à cadrer avec Denis.

**B. Calendrier de saisonnalité éditorial, par département**
Au-delà de la « part de projets saisonniers » (BMO), un petit calendrier écrit à la main : Dordogne = agriculture au printemps/été, tourisme et restauration en juillet-août, vendanges à l'automne ; Haute-Vienne = services à la personne et médico-social toute l'année, BTP au printemps.
*Recommandation* : `[RECLASSÉ -> Comprendre les chiffres]` - contenu éditorial léger, à écrire avec Denis (CIP, connaissance terrain) une fois le module en place. À dater et à revérifier chaque année contre la BMO locale et Cap Métiers.

**C. Renvois du module Chiffres vers d'autres modules d'APP**
Plusieurs assistants proposent d'adosser aux chiffres : un encadré « dispositifs d'accès à l'emploi » (immersions PMSMP, contrats aidés PEC), un rappel des aides qui ont bougé, un lien vers « qui peut m'aider ? », des passerelles vers les filières / formations (Cap Métiers). Tout ça existe déjà ailleurs dans APP (rayons « accompagnement » / « emploi » de Comprendre le cadre, digest Balayage « ce qui a changé récemment »).
*Recommandation* : `[SANS MODULE]` - relève des **ponts entre modules** (idée du 2026-09-01 déjà notée plus haut). Le module Chiffres ne doit pas recopier ce contenu : il pointera vers lui quand le mécanisme de ponts internes existera. À ne pas traiter dans ce chantier.

**D. Bouton « besoin d'aide pour comprendre ce chiffre »**
Un déclencheur, à côté de chaque indicateur, qui ouvre une explication très simple + un contact local (Mission Locale, Cap Emploi).
*Recommandation* : `[RECLASSÉ -> Comprendre les chiffres]` pour la partie « explication très simple » (peut être la fiche méthode déjà prévue, ex. `comment-lire-un-taux-de-chomage`). La partie « contact local » = un pont vers un annuaire / une structure, donc `[SANS MODULE]`, même famille que C.

**E. Pictogrammes comme représentation alternative aux barres**
Pour le public le plus fragile : une silhouette = 10 personnes, plutôt qu'un pourcentage ou une barre. À proposer en complément du graphe, pas à sa place.
*Recommandation* : `[RECLASSÉ -> chantier Accessibilité]` - relève de l'option « interface plus sobre / pictogrammes » déjà notée pour le futur module Accessibilité (`docs/TACHES_VALIDEES.md`, chantier 2). À ne pas coder isolément.

**F. « Projets locaux connus » : gros recrutements, campagnes départementales**
Ex. « Le Conseil départemental de la Dordogne recrute 400 aides à domicile ». Très concret, très parlant.
*Recommandation* : `[SANS MODULE]` - c'est de l'**actualité hyper-locale**, qui périme vite (LECONS : jamais un montant / une info figée sans date ni source vivante). Plus proche du digest Balayage que du module Chiffres. À n'envisager que si un circuit de mise à jour daté existe (Denis, trimestriel). Risque de fausse promesse si la campagne est finie.

**G. Automatiser la mise à jour trimestrielle via API / open data (INSEE, France Travail, Urssaf)**
Un assistant propose de remplacer le prompt manuel `[CHIFFRES]` de `veille.html` par des appels API / téléchargements CSV automatisés.
*Recommandation* : **ÉCARTÉ**, noté pour mémoire. Contraire au principe fondateur d'APP (pas d'API, pas de serveur, pas de budget - `CLAUDE.md`, `docs/CONSTITUTION_ERIP.md`). Le module reste sur le circuit « un prompt, une photo datée, relue par un humain ». Même logique que le compagnon IA écarté (`project_compagnon_ia_erip_piste_long_terme`).

**Ce qui a été GARDÉ des retours d'assistants** (intégré dans `docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md`) : la liste hiérarchisée des indicateurs (cœur trimestriel + contexte BMO annuel + écartés), la structure « une carte = une idée + question simple + valeur + double comparaison temps/espace + phrase en langage courant », les règles visuelles (tendance en mots + flèche discrète, jamais rouge/vert agressif, « 1 sur 4 » avant « 25 % », toujours daté/sourcé), l'encart « à savoir avant de lire ces chiffres » (11 pièges), et le tableau des sources officielles par indicateur avec leur fréquence.

**H. Blocs du portrait du territoire + « Croiser plusieurs chiffres »** - Claude avait recommandé une V1 allégée (4 blocs de portrait, pas de « croiser ») pour un digest annuel tenable et un chantier plus court. **Denis a tranché le 2026-09-06 pour TOUT inclure dans la V1** (pas de perte de contenu par rapport à ce qui a été conçu ; « croiser plusieurs chiffres » jugé très important dès l'implémentation). `[RECLASSÉ -> chantier Comprendre les chiffres, V1 complète]`. La seule chose à surveiller : la charge de production annuelle du portrait pour Denis.

**J. Comparer la France aux pays de l'Union européenne** (idée Denis 2026-09-06)
- **Version légère (France vs moyenne UE-27) : FINALEMENT DANS LA V1** de « Comprendre les chiffres » (Denis a rejugé que ce n'était pas lourd : 2-3 chiffres Eurostat, un panneau fermé « La France dans l'Union européenne »). `[RECLASSÉ -> chantier Comprendre les chiffres, V1]`.
- **Reste ici pour plus tard** : choisir **un pays précis** de l'UE et le comparer à la France (ses séries, ses dispositifs). But : repérer ce qui marche ailleurs, se demander ce qui pourrait être transposé. Denis y voit un « travail de jeu » utile aux futurs CIP. `[SANS MODULE - après stabilisation de « Comprendre les chiffres »]`. Source Eurostat. Cadrage : mise en perspective / support de formation, jamais un jugement sur la France, jamais un repère pour l'usager en recherche.

### Points relevés pendant l'implémentation de « Comprendre les chiffres » (blocs 3-9, 2026-09-06)

- **Séries trop courtes dans le digest de départ.** Le graphe SVG de la couche 1 et l'outil « croiser » ont besoin de 6 à 8 trimestres par indicateur, et de séries pour les 5 indicateurs (pas seulement le chômage). Le premier `contenu/2026-06.md` n'a que 4 points de chômage (base INSEE en JavaScript, non lisible par un assistant). `[À FAIRE - production veille]` : au prochain passage `[CHIFFRES]`, compléter les séries à la main depuis les séries chronologiques de l'INSEE et de la STMT, et ajouter des séries pour demandeurs / emploi salarié / offres. Tant qu'une série manque, sa case dans « croiser » est désactivée (« pas encore de série ») - comportement voulu, pas un bug.
- **Renvois « à lire avec » limités à la carte chômage.** La maquette n'en montrait qu'un ; l'implémentation le reprend. Si Denis en veut d'autres (offres <-> emploi salarié, longue durée <-> âge des demandeurs), ils s'ajoutent dans `COMPRENDRE_LES_CHIFFRES_CARTES` / la carte concernée. `[RECLASSÉ -> Comprendre les chiffres, si retour terrain]`.
- **Archive des trimestres : liste seulement.** Les boutons « trimestres précédents » sont affichés mais désactivés (le module ne charge que le digest le plus récent). Consulter une photo ancienne = un bloc à part, non prioritaire. `[À FAIRE si besoin - Comprendre les chiffres]`.
- **Le portrait ne s'adapte pas au niveau de lecture.** Les dépliants de la couche 2 décrivent toujours le département, même quand on lit « au niveau France ». Conforme à la maquette (`#localView`), mais à surveiller si un utilisateur trouve ça déroutant. `[OBSERVATION]`.

---

### 2026-09-06 - La retraite / fin de carrière : sujet totalement absent de « Comprendre le cadre »

**Constat (Denis)** : en datant les adresses du paquet B, Denis est tombé sur des
pages travail-emploi.gouv.fr consacrées à la retraite et a constaté que le module
« Comprendre le cadre » n'en parle **nulle part** (vérifié : « retraite » n'apparaît
qu'incidemment - droits sociaux d'un contrat CAE, travail en détention, départ
anticipé RQTH). Or c'est un sujet important pour le public du module (personnes en
fin de parcours, seniors éloignés de l'emploi).

**Idée** : ajouter une (ou des) fiche(s) sur la retraite, et décider dans quel rayon.

**Matière fournie par Denis (pages travail-emploi.gouv.fr qui s'ouvrent et sont sur
le bon sujet)** :
- `https://travail-emploi.gouv.fr/la-retraite-progressive` - fiche pratique complète
  (réduire son activité en fin de carrière, 60 ans + 150 trimestres, 40 à 80 % d'un
  temps plein, liquidation provisoire d'une fraction de pension). Mise à jour
  19/12/2025.
- `https://travail-emploi.gouv.fr/le-cumul-emploi-retraite` - travailler après
  liquidation de la pension.
- `https://travail-emploi.gouv.fr/le-depart-volontaire-la-retraite` - rupture du
  CDI à l'initiative du salarié pour partir en retraite.
- `https://travail-emploi.gouv.fr/la-mise-la-retraite-dun-salarie` - à l'initiative
  de l'employeur (en principe 67 ans).
- `https://travail-emploi.gouv.fr/ou-sinformer-sur-sa-retraite-qui-sadresser` -
  « à qui s'adresser » (l'Assurance retraite, info-retraite.fr, CARSAT).
- `https://travail-emploi.gouv.fr/le-systeme-et-les-regimes-de-retraite` - repère
  général.
- `https://travail-emploi.gouv.fr/le-contrat-de-valorisation-de-lexperience-cve` -
  embauche des seniors (connexe).
- `https://travail-emploi.gouv.fr/emploi/travailler-apres-50-ans` - la rubrique
  « seniors » du ministère (structure de référence si on ouvre un rayon).
- Nouveauté datée, plutôt pour le **digest Balayage** que pour une fiche permanente :
  `https://travail-emploi.gouv.fr/retraites-des-femmes-et-parentalite-de-nouveaux-droits-au-1er-septembre-2026`
  (calcul sur 24 meilleures années dès 1 enfant, 23 dès 2 ; jusqu'à 2 trimestres
  enfants comptés pour la carrière longue ; en vigueur au 1er septembre 2026 ;
  art. 104 de la LFSS 2026, `https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000053265454/`).

**Contexte d'origine** : passe de datation du paquet B de « Comprendre le cadre »
(`docs/PAQUET_B_BLOQUE_A_DATER.md`), 2026-09-06.

**Recommandation (Claude)** :
- Destination : **module « Comprendre le cadre »** - c'est bien son objet (repère +
  lien officiel sur un droit lié au parcours). Le module renverrait vers
  l'Assurance retraite comme il renvoie déjà vers la CAF ou la Banque de France.
- Emplacement : **nouveau rayon « Travailler après 50 ans et retraite »** (calqué sur
  la rubrique du ministère) plutôt que des fiches dispersées dans « Emploi et
  contrats » et « Accompagnement ». Bénéfice : porte d'entrée claire pour le public
  senior, rayon extensible (CVE, index seniors, entretien de mi-carrière,
  aménagements de fin de carrière). Risque : c'est un 15e rayon à brancher partout
  (recherche d'accueil `MODULES_RECHERCHABLES` / `RAYON_LABEL`, « Affiner ma
  recherche » = 15e jeu de questions + garde-fous, éventuellement « Près de chez
  moi »), et un rayon jeune paraît maigre au début.
- Alternative légère : glisser `depart-volontaire` + `mise-a-la-retraite` dans
  « Emploi et contrats » (ce sont des ruptures du contrat) et `retraite-progressive`
  + `cumul-emploi-retraite` dans « Accompagnement ». Rapide, pas de plomberie, mais
  éparpillé et pas de porte « retraite ».
- Périmètre d'une V1 : 5 fiches - retraite progressive, cumul emploi-retraite,
  départ volontaire à la retraite, mise à la retraite par l'employeur, où
  m'informer / à qui m'adresser. **Pas** le calcul des pensions ni la réforme
  (hors objet : ça, c'est l'Assurance retraite).
- **Zone d'ombre à trancher avec Denis** : la news « retraites femmes/parentalité
  1er sept 2026 » est de l'actualité datée -> sa place est le **digest Balayage**,
  pas une fiche permanente.

**Décision de structure = Mode A** : à faire dans une session dédiée quand Denis est
frais, pas en fin de passe de datation. Questions de cadrage : rayon dédié ou fiches
dispersées ? périmètre « retraite » seul ou « seniors 50+ » large ? combien de fiches
au départ ?

**Statut** : `[SANS MODULE au sens strict - destination « Comprendre le cadre »
connue, emplacement (rayon) à décider avec Denis, Mode A]`

---

### 2026-09-06 - Enrichir la fiche `budget-surendettement` (matériau Banque de France collé par Denis)

**Contexte d'origine** : passe de datation du paquet B (2026-09-06). En vérifiant la
page `banque-france-detail-procedure-surendettement`
(`https://www.banque-france.fr/fr/detail-de-la-procedure-de-surendettement`, datée),
Denis a collé son contenu intégral. La fiche `budget-surendettement` (rayon Budget)
existe déjà, mais ce matériau frais de septembre 2026 contient beaucoup de détails
qu'elle ne couvre sans doute pas.

**Ce que le matériau ajoute par rapport à une fiche « comment ça marche » de base :**
- Composition et rôle de la commission de surendettement (7 membres, présidée par le
  préfet, secrétariat Banque de France) ; elle ne paie pas les dettes, ne prête pas.
- Étapes après le dépôt : vérification du dossier, attestation sous 48 h, inscription
  FICP dès le dépôt, obligation de continuer à payer loyer et factures courantes.
- Décision de recevabilité : critères (situation personnelle, dettes, patrimoine,
  capacité de remboursement, bonne foi) ; recours possible en cas d'irrecevabilité.
- Conséquences de la recevabilité : suspension des saisies (interdiction de nouvelle
  saisie jusqu'à 2 ans, sauf dettes pénales ou alimentaires), possibilité de demander
  au juge la suspension d'une expulsion, interdiction pour la banque de résilier un
  contrat pour ce motif, droit au maintien du compte et à des moyens de paiement
  adaptés, pas de frais de rejet, commissions d'intervention réduites (clientèle
  fragile).
- Les 3 issues : plan conventionnel de redressement (accord créanciers, étalement /
  baisse des mensualités / baisse du taux / moratoire / vente d'un bien), mesures
  imposées par la commission (sans accord, contestables devant le juge), rétablissement
  personnel (effacement des dettes, avec ou sans liquidation judiciaire).
- Durées FICP : 7 ans max pour un plan ou des mesures imposées (radiation anticipée à
  5 ans si respect sans incident), 5 ans pour un rétablissement personnel.
- Dettes qui ne s'effacent jamais : alimentaires, pénales et amendes, fraude à un
  organisme social, prêt sur gage, dettes payées par une caution personne physique,
  certaines dettes fiscales.
- Obligations du débiteur pendant la procédure (ne pas aggraver l'endettement, ne pas
  céder de patrimoine, ne pas rembourser les crédits en cours, continuer à payer le
  courant).

**Recommandation (Claude)** : destination claire = fiche `budget-surendettement`
(rayon Budget de « Comprendre le cadre »). Deux façons :
- **enrichir la fiche existante** (elle risque de devenir longue) ;
- ou **la découper en deux** : « La procédure de surendettement : comment ça marche ? »
  (dépôt, commission, recevabilité) + « Surendettement : ce qui change pour vous une
  fois le dossier recevable » (saisies, logement, compte, FICP, les 3 issues, dettes
  non effaçables).
Passe par « Modifier une fiche existante » de `outils/veille.html`, MAJ `verifie_le`
+ `revisions:`. La source `banque-france-detail-procedure-surendettement` est déjà
datée dans `liens-verifies.txt`.

**Statut** : `[SANS MODULE au sens strict - destination « Comprendre le cadre » /
rayon Budget connue ; enrichissement ou découpage à trancher avec Denis ; à faire
après le rayon retraite et le prompt CONTROLE-SOURCE]`

---

### 2026-09-06 - Brancher la veille sur le Lexique (communication veille -> Lexique)

**Constat (Denis)** : le Lexique a une fonction « se faire nourrir par l'outil de veille »
(le prompt `[LEXIQUE]` de `docs/VEILLE_PROMPTS.md` § 5quater existe et produit des termes
nouveaux ou changés). Mais **il n'y a pas de communication réelle entre la veille et le
Lexique** aujourd'hui : la sortie `[LEXIQUE]` alimente `docs/CORPUS_LEXIQUE.md` (une note,
pas le module), et rien ne relie ça à `data/lexique.js` que le module lit.

**Contexte d'origine** : mise en place du circuit veille -> fiche pour « Comprendre le
cadre » (2026-09-06). Denis : « c'est ça qu'il va falloir qu'on regarde et qu'on mette à
jour », **après le chantier territoire**.

**À creuser dans ce chantier** :
- où atterrit vraiment la sortie `[LEXIQUE]` aujourd'hui, et ce qui manque pour qu'un
  terme repéré par la veille devienne une fiche Lexique consultable ;
- format : `data/lexique.js` est un gros objet JS édité à la main ; l'outil `veille.html`
  produit-il un fichier au bon format, ou faut-il un pont ;
- le lien avec le registre `docs/NOUVEAUTES_A_STATUER.md` (un terme nouveau = une ligne à
  statuer, comme une fiche) ;
- l'idée déjà notée « Enrichissement du contenu du Lexique » (entrée 2026-08-27 de ce
  fichier) : les deux se rejoignent.

**Statut** : `[SANS MODULE au sens strict - concerne le Lexique ET le circuit veille ;
à traiter après le chantier territoire]`

---

### 2026-09-09 - Persistance, historique, hébergement (réflexion Denis)

**Constat (Denis)** : de plus en plus de modules accumulent de l'état (Bilan, Cohérence,
Comparer, ATS, Regard recruteur, Carnet, Repères). Aujourd'hui la seule vraie sauvegarde
est **la disquette** (export / import d'un fichier JSON à la main) ; le `localStorage`
(`CLE_SESSION` = `aps_session_sauvegarde`, `js/app.js`) ne sert que de filet **juste avant
une action destructrice** (`ecrireSauvegarde(sauvegarderSession())` appelé avant
Réinitialiser / vider). Donc : fermer l'onglet sans cliquer la disquette = tout est perdu.
Mauvais pour un public en fragilité numérique.

**Reco Claude, dans l'ordre :**
1. **Sauvegarde automatique locale (`localStorage`), maintenant.** À chaque changement
   significatif de `dossier` + des états de modules déjà pontés
   (`collecterEtatsModulesPourSauvegarde()` / `restaurerEtatsModules()`), avec un délai
   (debounce). Survit à la fermeture d'onglet et au rechargement, **sur le même appareil /
   navigateur**. La disquette redevient l'outil de **transfert entre appareils**, plus le
   « ne pas tout perdre ». Aucun changement d'hébergeur, aucun compte, la donnée ne quitte
   pas l'ordinateur (doctrine de confidentialité intacte). Petit chantier de code.
2. **Historique local léger** : garder les N derniers instantanés de sauvegarde dans
   `localStorage` → un « revenir à une version précédente » 100 % local.
3. **Bouton « effacer mes données de cet ordinateur » bien visible.** *Vrai arbitrage
   soulevé par Denis* : en structure (Inkéo, PCGI 87), les personnes sont **rarement sur
   le même PC**, souvent un poste partagé. La sauvegarde auto aide surtout Denis chez lui
   et les personnes qui ont un PC perso ; en structure elle n'aide **que dans la session
   en cours** (résistance à un rechargement / une fausse manip / un plantage - qui font
   perdre 40 min aujourd'hui). Contrepartie : sur un poste partagé, elle **laisse un
   résidu** jusqu'à effacement (aujourd'hui, fermer l'onglet efface tout, "par accident").
   Mitigation : bouton d'effacement proéminent + rappel + c'est la même donnée que la
   disquette exporterait de toute façon. Conclusion Claude : **l'adopter quand même** -
   jamais pire qu'aujourd'hui, bien mieux pour 2 cas d'usage sur 3, filet et non stratégie
   de stockage.
4. **Changer d'hébergeur** (Netlify / Cloudflare Pages / Vercel, paliers gratuits meilleurs
   que GitHub Pages) : plus confortable (en-têtes, redirections, préviews) mais **ne donne
   pas d'historique** - il faut un serveur. Pas la peine de bouger juste pour ça, GitHub
   suffit.
5. **Serveur + comptes + historique = décision STRATÉGIQUE, pas technique.** Change : la
   promesse « rien n'est envoyé sur Internet » (argument fort pour ce public et pour le
   partenaire), le **statut légal de Denis** (responsable de traitement de données
   sensibles sur des personnes en insertion, seul, non-développeur), la charge de
   maintenance et le coût dans la durée. Correspond à l'horizon « association / revenus /
   serveur » (mémoire `project_integration_partenaire_et_avenir`). **À rouvrir le jour où
   il y a une structure (association) qui peut porter la responsabilité RGPD + un vrai
   plan.** Le moment venu : hébergement UE + sécurité par ligne + connexion anonyme,
   **Supabase** le candidat le plus probable.

**Pour les structures (poste partagé), la réponse reste** : la disquette (sur clé USB /
mail à soi ou au conseiller) **+ le document fini** (CV, lettre en PDF / Word) que la
personne emporte. Ce n'est pas une régression - c'est le modèle actuel, honnête pour une
app sans compte. La sauvegarde auto est un bonus par-dessus, pas un remplacement.

**MISE À JOUR 2026-09-09 (le jour même) - Denis tranche CONTRE la sauvegarde auto locale
(points 1-3).** Un même PC en structure sert à deux personnes ; une sauvegarde auto ferait
tomber la 2e sur la session de la 1re (accès à ses infos). Le comportement **« page fermée
= tout effacé » est voulu** (protection vie privée poste partagé). On ne renomme pas non
plus le panneau disquette. Voir `docs/CHANTIER_SAUVEGARDE_AUTO_2026-09-09.md` (marqué
ABANDONNÉ, conservé comme trace). **Ne pas re-proposer.** Restent valides : point 4
(changer d'hébergeur = pas prioritaire) et point 5 (serveur = décision stratégique liée à
une association).

**Statut** : `[TRANCHÉ - pas de sauvegarde auto locale ; serveur = plus tard, association]`

---

### 2026-09-09 - Calendrier / agenda dans l'application ? (réflexion Denis)

**Idée (Denis)** : un calendrier dans l'app, avec notes et **tâches** dedans ; et, plus
loin, une vue « timeline » montrant pour une personne : les notes prises, les
programmations faites, **les modules utilisés, à quelle date et quelle heure** (« ça peut
être instructif »).

**Avis Claude - deux idées distinctes :**

**a) Agenda / calendrier que la personne remplit (RDV, échéances, tâches) : non.**
- Mauvais outil pour ce public : un calendrier fabrique des obligations, du « en retard »
  en rouge, de la culpabilité - pour des gens à confiance fragile.
- Sans serveur = pas de rappels = un demi-calendrier ; les gens ont déjà l'agenda de leur
  téléphone.
- **Dans le Carnet, pire encore** : contredit frontalement la doctrine (capture sans délai
  ni décision ; rien qui donne à voir un espace « à traiter » - principes 1 et 6).
- *Si un vrai besoin apparaît* (clients qui oublient un RDV France Travail, un entretien,
  une date limite) : une **liste « mes échéances »** (chronologique, « à venir », pas de
  grille, pas de rouge, pas de cases à cocher). À valider par l'usage avant de construire.

**b) Timeline de l'activité (notes, modules utilisés, date/heure) : intéressant mais gros
drapeau.**
- Côté instructif réel : pour le conseiller (voir le chemin d'un client) et pour la
  personne (« voilà tout ce que vous avez parcouru » = renfort de confiance, cœur du
  public).
- **Mais « voir les modules utilisés à quelle date et quelle heure » = du traçage.** Umami
  couvre déjà l'usage **anonyme** ; un historique nominatif visible de chaque action peut
  être vécu comme du contrôle par un public en insertion.
- Le modèle qui marche déjà ici : le **Journal de parcours** (`#btnJournalParcours`,
  Repères) - la personne **choisit** ce qu'elle ancre. C'est elle qui construit sa trace,
  l'app ne la journalise pas.
- Même problème de persistance que le point ci-dessus (local seulement, sans serveur).

**Conclusion** : calendrier complet = non. Une version « votre parcours jusqu'ici » côté
confiance = à explorer plus tard, **sur des traces choisies** (modèle Journal de
parcours), jamais du log automatique, et seulement une fois la persistance réglée.

**Statut** : `[SANS MODULE - à ne pas construire maintenant ; rouvrir seulement sur besoin
terrain observé, et dans la forme « liste douce » / « traces choisies », jamais grille +
tâches + log auto]`

---

### 2026-09-17 - « Registre de langage adapté au secteur » : le même sous-sujet dans 4 prompts indépendants

**Contexte d'origine** : audit du module « Un regard sur mon CV » (ex Regard recruteur),
`docs/AUDIT_REGARD_RECRUTEUR_2026-09-17.md` et `docs/CHANTIER_REGARD_RECRUTEUR.md` §7bis,
en vérifiant les recoupements avec les autres modules d'analyse de candidature.

**Constat** : la question « le vocabulaire/le ton du CV correspond-il à ce qu'on attend
dans ce secteur/ce type de structure ? » est traitée **indépendamment dans 4 prompts** :
`prompts/bilan-v1.md` (axe `posture`), `prompts/ats.md` (comparaison de vocabulaire face à
une offre/un métier), `prompts/coherence-transversale.md` (analyse transversale, « registre
de langage adapté au secteur visé »), et `prompts/regard-recruteur.md` (jusqu'au
2026-09-17 : sous-point de l'axe `message`, retiré ce jour-là et replié dans
`questionsLieesAuCv`). Chacun l'écrit à sa façon, avec ses propres exemples et son propre
vocabulaire interdit/autorisé - aucune source unique.

**Pourquoi ce n'est pas réglé maintenant** : corriger un seul module (Regard recruteur) ne
réglait qu'un quart du problème ; une vraie source unique demanderait soit un composant de
prompt partagé (un bloc de consigne inséré dans les 3 prompts restants), soit un module/hub
dédié à cette seule question - un vrai chantier d'architecture, pas une retouche locale.

**Recommandation** : à regarder ensemble le jour d'un chantier de cohérence entre les
modules d'analyse de candidature (Bilan, ATS, Cohérence de mon dossier) - voir aussi l'idée
du 2026-08-28 ci-dessus (« Analyser ma candidature » comme hub à dimensions), qui pourrait
être le bon endroit pour trancher ce genre de duplication une fois pour toutes plutôt que
prompt par prompt.

**Statut** : `[SANS MODULE - dépend d'un chantier de cohérence inter-modules pas encore
ouvert, pas à traiter module par module]`
