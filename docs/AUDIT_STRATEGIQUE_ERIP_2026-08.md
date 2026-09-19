# Audit stratégique ERIP -- Août 2026

> Document de réflexion produit/architecture, pas un engagement de développement. Rédigé à la demande de Denis pour préparer la feuille de route des 12 prochains mois, après l'achèvement du chantier "Assistance à la finalisation du CV". Raisonnement mené en faisant abstraction des choix déjà faits, du point de vue architecte produit + architecte logiciel + expert métier de l'accompagnement vers l'emploi.

---

## 0. Contrainte structurante, à garder en tête pour tout le reste du document

ERIP est aujourd'hui une application **statique, cent pour cent côté client, sans backend, sans API IA**. Toute génération IA passe par un copier-coller vers un assistant externe (ChatGPT, Claude...). Cette contrainte n'est pas un détail technique : c'est le filtre à travers lequel chaque idée de ce document doit être évaluée. Une idée qui suppose des données vivantes tenues à jour automatiquement, un traitement serveur, ou une IA qui agit en boucle sans passage par le candidat, n'est pas seulement "plus difficile" -- elle sort du modèle architectural actuel et exige une vraie décision d'infrastructure, pas une fonctionnalité de plus.

---

## 1. Philosophie

Rien à corriger ici -- et c'est notable : la philosophie décrite (l'IA accompagne, explique, justifie, guide, jamais ne décide à la place du candidat) est déjà exactement celle que le chantier "Assistance à la finalisation du CV" a mise en œuvre concrètement : cascade application → IA → candidat pour le *travail*, mais validation humaine systématique à chaque niveau, jamais de cascade sur la *décision*. Ce n'est donc pas un vœu pieux à réaliser plus tard, c'est déjà le comportement du code existant. Le test à appliquer à toute nouvelle idée : est-ce qu'elle réduit la charge cognitive du candidat sans jamais lui retirer le contrôle ? Deux idées de la liste (section 3 ci-dessous) échouent explicitement à ce test.

---

## 2. Bibliothèques de connaissances

Point de vigilance avant toute chose : ces cinq bibliothèques ne sont pas de même nature, et les traiter comme un bloc homogène serait une erreur de cadrage.

**Deux familles très différentes cohabitent dans la liste :**
- **Connaissance stable** (ce qu'est un ATS, ce qu'est un PLIE, les méthodes d'accompagnement, les techniques d'entretien) : change rarement, aucun risque à l'intégrer en dur, faible coût de maintenance. Compatible avec l'architecture statique actuelle.
- **Donnée vivante et réglementaire** (RNCP, CPF, financements, dispositifs régionaux, aides sociales, annuaires de partenaires locaux) : change en continu, et une information fausse ou périmée ici n'est pas juste "une réponse IA imparfaite" -- c'est un candidat mal orienté sur un droit ou un financement réel. Maintenir ça à jour sans backend ni processus de mise à jour est structurellement impossible aujourd'hui, et le risque n'est pas symétrique (une bibliothèque de conseils rédactionnels obsolète est gênante ; une bibliothèque de droits sociaux obsolète peut causer un vrai préjudice).

**Bibliothèque Emploi/Recrutement** -- pas un projet from scratch : `data/metiers.js` (3800+ lignes, `baseMetiers` + moteur de score `rechercherMetiers`) est déjà, de fait, le socle de cette bibliothèque, en production. La bonne approche est d'enrichir l'existant, jamais d'en reconstruire un second à côté.

**Bibliothèque Formation** -- appartient presque entièrement à la famille "donnée vivante réglementaire". Irréaliste à construire et maintenir dans l'architecture actuelle sans décision d'infrastructure séparée (pipeline de synchronisation, gouvernance de fraîcheur des données). À ne pas mettre dans la feuille de route 2026.

**Bibliothèque Insertion** -- mixte : les *méthodes* (connaissance stable) sont faisables ; l'*annuaire* (quelle Mission Locale, quel PLIE, avec quelles coordonnées) est de la donnée vivante, même problème que Formation.

**Bibliothèque Droits et démarches** -- la plus risquée des cinq si elle est présentée avec autorité. Recommandation : si elle voit le jour, elle doit **toujours orienter vers la source officielle et le CIP**, jamais se substituer à eux comme source de vérité.

**Bibliothèque Territoire** -- "probablement la plus importante" : je suis d'accord sur le principe, en désaccord sur la forme envisagée. Une base nationale généraliste et à jour est hors de portée. Mais reformulée comme **donnée de configuration propre à chaque structure** (un CIP ou un administrateur saisit une fois les ressources de son propre territoire), le même besoin devient réaliste, à coût faible, et sert directement l'utilisateur professionnel (CIP) que vous voulez adresser. Voir section 5, idée "Vue CIP".

**Conclusion section 2** : traiter "Emploi/Recrutement" comme extension de l'existant (faisable maintenant), traiter "Territoire" comme fonctionnalité de configuration (faisable maintenant, voir section 7), et **exclure Formation/Insertion/Droits de la feuille de route 2026** telles que décrites -- pas par manque d'intérêt, mais parce que ce sont des projets d'infrastructure de données, pas des fonctionnalités.

---

## 3. Analyse critique des évolutions envisagées

### À supprimer complètement

- **Test de crédibilité** -- existe déjà. L'axe `credibilite` du Bilan CV (`prompts/bilan-v1.md`) fait exactement ça depuis le premier chantier. Proposer cette fonctionnalité reviendrait à documenter et coder une seconde fois quelque chose déjà en production.
- **Niveau de compétitivité** (positionner la candidature) -- contredit une décision déjà prise et volontaire : `BILAN_RESTITUTION_QUALITATIVE` est explicitement **qualitatif** (`tres_convaincant`/`convaincant`/`a_renforcer`/`prioritaire`), jamais numérique -- décision déjà actée pour ne jamais réduire une candidature à un score. Un "niveau de compétitivité" chiffré est exactement le type de fausse précision démoralisante que la philosophie (section 1) écarte explicitement. À ne pas construire, sous cette forme.
- **Comité de recrutement virtuel** (plusieurs profils IA donnent leur avis) -- gadget au sens propre du terme utilisé dans votre philosophie : impressionne à la démonstration, apporte peu de valeur réelle de plus qu'un avis unique bien construit, et multiplie le risque de dérive (plusieurs personas IA, plus de surface pour halluciner ou se contredire). Voir plus bas, fusionné dans "Regard recruteur".

### À fusionner

- **Simulation recruteur** + **Préparation selon les inquiétudes du recruteur** + (ce qui est récupérable de) **Recruteur virtuel** → une seule fonctionnalité, **"Regard recruteur"** : une lecture du CV/candidature depuis un point de vue externe structuré (points forts, doutes, objections probables), avec la même discipline que le Bilan CV (axes fixes, sortie bornée, jamais un chat ouvert). Trois fonctionnalités séparées pour la même idée sous-jacente serait exactement le piège "quinze fonctionnalités moyennes" que vous voulez éviter.
- **CV orienté métier/offre** + **CV adapté au contexte** (PME/grand groupe/association/fonction publique/startup/cabinet) → une seule fonctionnalité, **"Adaptation contextuelle"**, avec plusieurs dimensions de contexte (métier visé, type de structure) plutôt que deux fonctionnalités parallèles qui dupliqueraient une bonne partie de leur logique.

### À développer davantage

- **Vérification de cohérence CV/lettre/entretien** -- ce n'est pas une idée neuve, c'est la **fermeture d'une boucle déjà anticipée** : l'axe `coherence_transversale` existe déjà dans les 10 axes du Bilan CV, mais ne peut aujourd'hui évaluer qu'une cohérence interne au CV seul, faute de recevoir la lettre et l'entretien en entrée. C'est l'idée de cette liste avec le **meilleur rapport valeur/réutilisation** -- voir section 7.
- **Carte de correspondance** (attentes du poste / compétences / expériences / preuves) -- sous-exploitée dans la liste initiale. C'est en grande partie une nouvelle *présentation* de données que le diagnostic calcule déjà (axe `adequation`, observations liées aux preuves). Fort potentiel pédagogique : ça enseigne au candidat *comment* un recruteur évalue une candidature, ce qui développe une vraie autonomie -- exactement l'esprit de la section 1.

### Irréalistes en l'état (architecture actuelle)

- Les bibliothèques Formation/Insertion/Droits comme bases de données vivantes (voir section 2).
- Toute fonctionnalité qui suppose un dialogue IA multi-tours autonome sans repasser par un copier-coller du candidat (contrainte structurante, section 0) -- s'applique en particulier à une version ambitieuse de "Recruteur virtuel"/"Comité" si elle visait un vrai échange interactif plutôt qu'un rapport structuré.

### Très innovantes

- **Carte de correspondance** -- peu vue ailleurs sous cette forme pédagogique, différenciante.
- **Cohérence transversale** -- referme une boucle déjà présente dans l'architecture ; peu d'outils grand public vérifient qu'un CV, une lettre et une préparation d'entretien racontent la même histoire.

---

## 4. Idées non présentes dans la liste initiale

**Vue CIP / mode accompagnant** -- la demande insiste sur les CIP et structures d'accompagnement comme public cible, mais rien de construit à ce jour n'est pensé pour un professionnel -- tout est candidat-seul. Un écran de synthèse (lecture du dossier, du diagnostic, de la progression) pour un CIP préparant ou reprenant un accompagnement serait la première brique réellement tournée vers ce public. Coût faible : aucune nouvelle capacité IA, uniquement une nouvelle présentation de données déjà là (`dossier`, `resultat.axes`, `recommandations`). C'est aussi le point d'ancrage naturel pour la "Bibliothèque Territoire" reformulée en configuration par structure (section 2).

**Journal de progression du candidat** -- déjà identifié, jamais construit : voir `docs/EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md`, section 1. `_bilanStatutsCorrection` est une donnée déterministe (un clic, jamais une IA), aujourd'hui effacée à chaque nouveau diagnostic. La conserver et l'afficher ("vous aviez déjà traité 3 points le [date]") coûte peu et sert directement le suivi d'un accompagnement dans la durée -- utile au candidat comme au CIP.

**Export/partage du dossier structuré, pas seulement du CV** -- exporter le diagnostic lui-même (synthèse, axes, recommandations retenues) en document consultable, pas juste le CV final. Encore une fois : aucune nouvelle IA, une nouvelle sortie sur des données déjà calculées. Utile pour qu'un CIP prépare un rendez-vous sans repasser par l'écran candidat.

**Français simplifié / accessibilité de lecture des recommandations** -- ERIP a déjà un réglage "Confort de lecture" dans les préférences d'affichage, signe que l'accessibilité est déjà une préoccupation réelle du produit, pas neuve. Prolonger cette logique jusqu'au contenu généré (proposer une reformulation des recommandations/diagnostics en français plus simple, sur le modèle FALC) réutilise entièrement le moteur de diagnostic existant, ajoute uniquement une couche de présentation alternative, et sert exactement le public déjà identifié dans ce chantier (difficultés d'autonomie numérique et rédactionnelle). Peu d'outils IA pour l'emploi traitent sérieusement ce sujet -- différenciant.

**Ce qui a déjà été délibérément écarté, à ne pas réintroduire** -- la comparaison automatique avant/après entre deux diagnostics a été explicitement rejetée (`EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md`, section 2) : comparer deux sorties non déterministes d'un modèle de langage est un problème mal posé, risque de fausses alertes plus coûteux que l'absence de la fonctionnalité. Je le mentionne pour mémoire, pour ne pas la voir revenir sous un autre nom dans une future liste.

---

## 5. Analyse d'architecture -- fonctionnalités retenues après tri

| Fonctionnalité | Difficulté | Coût architectural | Réutilisation | Risque de complexité | Valeur candidat | Valeur CIP | Valeur ERIP |
|---|---|---|---|---|---|---|---|
| Cohérence transversale (CV/lettre/entretien) | Moyenne | Faible-moyen (étendre Prompt 1 en entrée, réutiliser tout le moteur de diagnostic) | Très forte | Faible (borné, qualitatif comme l'existant) | Forte | Moyenne | Forte (différenciant) |
| Vue CIP | Moyenne | Faible (présentation uniquement) | Forte (dossier déjà source unique) | Faible | Faible-moyenne | Très forte | Très forte (ouvre le positionnement "outil professionnel") |
| Carte de correspondance | Faible-moyenne | Faible (restructure des données déjà calculées) | Très forte | Faible | Forte (pédagogique) | Moyenne | Moyenne-forte (différenciant) |
| Regard recruteur (fusion) | Moyenne-élevée | Moyen (nouveau diagnostic à axes fixes, sur le modèle Prompt 1) | Moyenne (méthode réutilisée, pas le code) | Moyenne (tenir la discipline "sortie bornée") | Forte | Moyenne | Forte |
| Adaptation contextuelle (fusion) | Élevée | Élevé (doit rester fragment par fragment, jamais régénérer tout le CV) | Moyenne | Élevée (le plus gros risque de dérive vers "générateur de documents") | Forte | Faible | Forte |
| Assistance finalisation lettre (telle que décrite initialement) | Élevée | Élevé (reconstruire diagnostic + résolution de destination) | Faible | Moyenne-élevée | Moyenne (déjà bien servi par la génération existante) | Faible | Faible-moyenne |
| Assistance préparation entretien (telle que décrite initialement) | Élevée | Élevé, et mal ajusté (nature dialogique, pas document) | Très faible | Élevée | Moyenne (recoupe l'existant) | Faible | Faible-moyenne |
| Journal de progression | Faible | Très faible | Totale (donnée déjà là) | Très faible | Moyenne | Forte | Moyenne |
| Français simplifié | Moyenne | Faible-moyen | Forte | Faible | Forte (public cible direct) | Moyenne | Forte (différenciant) |

---

## 6. Feuille de route à 12 mois -- 300 à 500 heures, quatre fonctionnalités

Choix délibéré de quatre, pas quinze, en cohérence avec la préférence exprimée. Ordre de priorité justifié ci-dessous, budget approximatif et honnête (pas une fausse précision).

### 1. Cohérence transversale CV / lettre / entretien -- ~80-100h
La meilleure porte d'entrée : referme une boucle que l'architecture a déjà anticipée (`coherence_transversale`), réutilise entièrement le moteur de diagnostic existant, ne casse aucune discipline déjà validée (reste qualitatif, reste borné). C'est la fonctionnalité la plus "gratuite" des quatre relativement à sa valeur, et elle sert directement le message central du produit : une candidature raconte une seule histoire.

### 2. Vue CIP (accompagnant) -- ~80-120h
Le chantier qui manque le plus aujourd'hui au regard de l'ambition affichée ("outil de référence pour... les CIP"). Tout ce qui a été construit jusqu'ici est candidat-seul. Coût faible (présentation de données déjà calculées), mais impact stratégique fort : c'est ce qui transforme ERIP d'un outil pour candidat isolé en outil d'accompagnement professionnel, ce qui est littéralement l'objectif énoncé en introduction de cette demande. C'est aussi le point d'ancrage naturel de la "Bibliothèque Territoire" reformulée en configuration par structure, sans en faire un projet séparé.

### 3. Carte de correspondance poste/compétences/expériences/preuves -- ~40-60h
Le meilleur rapport effort/valeur pédagogique des quatre. Construit presque entièrement sur des données déjà calculées par le diagnostic existant (axe `adequation`, observations). Développe l'autonomie du candidat en rendant visible *comment* une candidature est évaluée -- exactement la philosophie énoncée en section 1, pas un gadget.

### 4. Regard recruteur (fusion Simulation + Inquiétudes) -- ~100-140h
Le "grand pari" des quatre, volontairement le plus ambitieux et le plus risqué. Justifié malgré le risque parce que c'est la fonctionnalité la plus différenciante du lot : peu d'outils grand public offrent une lecture externe structurée, à la fois honnête sur les doutes qu'un recruteur aurait et disciplinée dans sa forme (jamais un chat ouvert, toujours des axes fixes bornés, sur le modèle exact du Prompt 1). Nécessite la même rigueur de conception que le Bilan CV -- diagnostic avant maquette avant code -- pas un raccourci.

**Total estimé : 300-420h**, laissant une marge réelle (80-200h) pour l'imprévu, la maintenance du chantier "Assistance à la finalisation" tout juste livré, et de petites améliorations à faible coût identifiées en section 4 (journal de progression, français simplifié) si le budget le permet -- sans qu'elles remplacent l'une des quatre priorités.

### 5. Glossaire des termes emploi/insertion/droit -- ~30-50h

> **Mise à jour (2026-08-19, audit de cohérence documentaire)** : le chantier « Glossaire » décrit ci-dessous a depuis été réalisé sous la forme du module Lexique (121 fiches, une portée bien supérieure aux ~30-50h envisagées ici, voir `docs/CARNET_FICHES_LEXIQUE.md`). Les constats historiques ci-dessous restent valables (raisonnement, contraintes, positionnement), mais cette section ne reflète plus l'état actuel du projet et ne doit pas être utilisée pour rebudgéter ou replanifier ce chantier.

Ajouté après discussion (2026-08-13), suite à une reformulation de la proposition initiale de "bibliothèques". Contrairement aux bibliothèques Formation/Insertion/Droits (données vivantes, écartées en section 2), un glossaire de définitions est de la **connaissance stable** (la définition de "période d'essai" ou "plan d'action" ne se périme pas comme un montant CPF) -- compatible avec l'architecture statique actuelle, sans le risque de péremption dangereuse identifié pour les autres bibliothèques. Mécaniquement, ce n'est pas une idée nouvelle : `data/metiers.js` (base structurée + moteur de recherche `rechercherMetiers`) est déjà la preuve que ce pattern fonctionne et est réutilisable tel quel pour un glossaire.

Règle à respecter dès la conception : le glossaire définit des **concepts**, jamais des **chiffres ou droits actuels** -- toute fiche touchant à un dispositif réglementaire renvoie vers la source officielle ou le CIP pour les montants/conditions à jour, jamais une valeur affichée comme vérité figée. Point à trancher avant de coder : le contenu est-il maintenu par l'équipe (comme `metiers.js` aujourd'hui, un ajout = une mise à jour de code) ou les candidats/CIP peuvent-ils *suggérer* un terme manquant (un simple formulaire, sans autre infrastructure) ?

Coût très faible (contenu + moteur de recherche déjà démontré, aucune nouvelle capacité IA), valeur forte pour le candidat (autonomie, compréhension du vocabulaire) et pour le CIP (rappel rapide) -- rejoint la feuille de route en 5ᵉ position, sans remplacer aucune des 4 priorités précédentes.

**Total estimé avec le glossaire : 330-470h**, toujours dans l'enveloppe 300-500h.

**Ce qui n'entre volontairement pas dans ces cinq choix** : l'assistance à la finalisation de lettre et d'entretien telles que décrites initialement, ni "Adaptation contextuelle" (fusion CV orienté métier/offre + CV adapté au contexte, écartée en section 5 : coût le plus élevé, risque de complexité le plus élevé, valeur CIP la plus faible des idées analysées). Pas par manque de valeur, mais parce que leur coût est disproportionné par rapport à l'existant déjà solide (génération de lettre, coaching entretien) ou au risque de dérive vers un générateur de documents. Si le besoin réel se confirme après usage, ce sont des candidats légitimes pour une feuille de route 2027 -- pas un abandon, un report argumenté.

---

## 7. Positionnement concurrentiel (2026-08-13)

Recherche menée sur le marché des générateurs de CV IA (Zety, Rezi, Teal, Kickresume, Canva, CVcrea, CVdesignR) et sur l'écosystème insertion professionnelle française (CIP, Missions Locales, France Travail).

**Constat central : ERIP ne se bat pas sur le même terrain que le marché commercial.** Les générateurs commerciaux vendent un document fini, vite, à un utilisateur déjà autonome et solvable (Zety : 700+ gabarits, intégration directe à l'API OpenAI, abonnement payant). Sur la finition visuelle et la richesse de gabarits, ERIP est objectivement en retrait -- pas un terrain où chercher à rivaliser, vu le modèle autofinancé. En revanche, aucun concurrent commercial trouvé n'a de brique tournée vers l'accompagnant professionnel, ni la discipline méthodologique déjà en place dans ERIP (diagnostic qualitatif jamais chiffré, validation humaine systématique, sortie IA toujours bornée). Le secteur de l'insertion professionnelle lui-même converge vers cette philosophie ("l'IA en complément de l'accompagnement humain", selon la Fédération des entreprises d'insertion) mais je n'ai trouvé aucun outil qui l'incarne dans son architecture comme le fait déjà ERIP -- le marché du secteur, aujourd'hui, c'est surtout des CIP formés à utiliser des outils génériques (ChatGPT) à la main, pas un produit dédié.

**Évaluation par axe (refus délibéré d'une note globale unique, pour rester cohérent avec le rejet de "Niveau de compétitivité" section 3)** :
- Finition visuelle du document final : faible face au marché -- pas un axe à investir.
- Rigueur méthodologique / sécurité de l'accompagnement : fort, différenciant, aucun concurrent équivalent trouvé.
- Adéquation au public réellement visé (autonomie réduite) : fort, angle mort du marché commercial.
- Lien avec le professionnel accompagnant (CIP) : faible aujourd'hui, mais potentiel le plus fort -- aucun concurrent n'a même commencé (voir priorité 2, Vue CIP).

**Axes de différenciation proposés, compatibles avec les contraintes (pas d'API payante, minimiser les passages IA, public à autonomie réduite)** :
1. Assumer explicitement "le cadre, pas le contenu" comme positionnement : ERIP ne remplace pas l'IA, il structure la relation du candidat avec n'importe quel assistant IA gratuit -- à l'inverse du marché commercial qui vend justement l'automatisation complète.
2. "Vue CIP" doit se mesurer à "le CIP prépare mieux son rendez-vous", jamais à "le candidat a moins besoin du CIP" -- le critère de succès protège contre le risque de vider le rôle du CIP.
3. Règle structurelle anti-péremption/anti-responsabilité : tout contenu chiffré ou réglementaire renvoie systématiquement vers la source officielle et le CIP, ne se présente jamais comme la vérité elle-même (protège Denis juridiquement et renforce la philosophie en même temps).
4. Minimiser les passages IA est déjà une discipline appliquée sans avoir été nommée : la Famille 2 ("complétude") du chantier "Assistance à la finalisation" ne passe jamais par l'IA. À formaliser comme question systématique avant toute nouvelle fonctionnalité : "l'application peut-elle déjà trancher ça seule ?"
5. Ne jamais construire de "module accompagnement" monolithique : traiter l'accompagnement comme une propriété que chaque fonctionnalité doit respecter, livrer le plus petit artefact honnête possible, laisser l'usage réel dicter l'extension -- même discipline déjà appliquée pour le chantier "Assistance à la finalisation" lui-même.

---

## 8. Réflexion complémentaire : diagnostic d'accompagnement CIP global (2026-08-13)

> Traitée volontairement à part de la feuille de route à 5 chantiers (section 6) : changement d'échelle du produit, pas une fonctionnalité de plus. Conservée ici par écrit pour ne pas reperdre ce raisonnement si la question revient, de la part de Denis ou d'un tiers.

### Le cadre proposé

Denis a proposé d'étendre ERIP à un diagnostic d'accompagnement global, au-delà du CV/candidature : situation → freins → ressources/atouts → leviers → projet → objectifs → plan d'action, diagnostic partagé et évolutif, jamais figé. Six pistes envisagées :
- **A. Diagnostic dynamique** -- représentation des relations frein ↔ ressource ↔ levier ↔ projet ↔ action, plutôt qu'une simple liste.
- **B. Assistant de raisonnement pour le CIP** -- l'IA argumente une lecture de la situation ("trois ressources pourraient être mobilisées"), le CIP reste libre de confirmer/modifier/rejeter.
- **C. Plan d'action intelligent** -- relie frein → levier → action → partenaire → objectif → échéance.
- **D. Mémoire évolutive de l'accompagnement** -- ce qui a changé, les actions réalisées/abandonnées, entre deux rendez-vous.
- **E. Outil de préparation du rendez-vous CIP** -- synthèse avant rendez-vous (situation, évolution, points bloqués, questions à approfondir).
- **F. Détection d'incohérences ou angles morts** -- ex. "le plan d'action correspond encore à l'ancien projet", "aucune échéance renseignée".

### Le fait déterminant, vérifié avant toute analyse

La structure proposée n'est pas une intuition de conception : c'est **la méthodologie officielle et certifiée du métier de CIP**. Le CCP1 du Titre Professionnel CIP s'intitule *"Accueillir pour analyser la demande des personnes et poser les bases d'un diagnostic partagé"*. Bon signe de légitimité -- mais avec un revers direct : cette méthodologie est déjà digitalisée, à l'échelle nationale, **de façon obligatoire**, dans les Missions Locales, via **i-Milo** (diagnostic partagé, freins/ressources, plan d'action co-construit, historique de contact) -- actuellement en transition vers un système d'information encore plus large, le "Réseau Pour l'Emploi" (2026).

**Conséquence pour l'architecture** : ERIP ne doit jamais essayer de devenir un second dossier de suivi. Deux risques concrets sinon :
1. **Double saisie** -- le CIP entrerait la même information dans i-Milo (obligatoire) et dans ERIP (non obligatoire). Le premier réflexe d'abandon irait vers ERIP.
2. **Illégitimité institutionnelle** -- les données d'i-Milo alimentent du reporting officiel et du financement ; celles d'ERIP n'auraient aucun statut équivalent.

**Positionnement retenu** : ERIP doit être la couche de réflexion qui **prépare ou prolonge** le dossier officiel, jamais celle qui le remplace -- même principe que "Vue CIP" ("le CIP prépare mieux son rendez-vous", jamais "le candidat a moins besoin du CIP"), étendu ici au rapport entre ERIP et l'outil institutionnel du CIP. i-Milo est structurellement un outil de consignation administrative, pas un outil de réflexion -- c'est précisément là qu'ERIP peut apporter quelque chose sans dupliquer personne.

### Analyse des six pistes, groupées par risque réel

**Les plus sûres (largement déterministes, sans interprétation IA)**
- **F. Détection d'incohérences** -- "aucune échéance renseignée", "le plan d'action référence encore l'ancien projet" : de la cohérence de données structurées, zéro IA nécessaire. Même discipline que la Famille 2 du chantier "Assistance à la finalisation" (l'application tranche seule quand elle le peut).
- **A. Diagnostic dynamique** -- sûr tant que ce sont la personne et le CIP qui déclarent les éléments et leurs liens, et que l'app se contente de structurer/visualiser (jamais d'inférer un frein non déclaré).

**Fortes mais conditionnelles**
- **C. Plan d'action intelligent** -- la connexion frein → dispositif → partenaire ne vaut que ce que vaut la configuration Territoire de la structure (section 2). Sans ça : des pistes génériques creuses. Version déterministe (plan structuré, relié à son frein d'origine, sans suggestion automatique) séparée d'une version "intelligente" réservée aux structures ayant investi dans leur configuration locale.
- **D. Mémoire évolutive** -- rejoint le "Journal de progression" déjà identifié (section 4, `_bilanStatutsCorrection` comme précédent). Point de vigilance réel : ERIP n'a pas de compte persistant fiable entre sessions/appareils aujourd'hui, seulement un export/import manuel -- un vrai suivi longitudinal en a besoin.
- **E. Préparation du rendez-vous CIP** -- pas une septième idée : c'est "Vue CIP" (déjà priorité 2), appliquée à ce nouveau domaine.

**La plus dangereuse, à ne pas construire telle quelle**
- **B. Assistant de raisonnement pour le CIP** -- empiète directement sur le jugement professionnel certifié du CIP, sur un terrain plus sensible que le CV (le CIP perçoit en entretien des signaux -- ton, non-dit -- qu'un texte ne transmet jamais). À reformuler impérativement en **questions ouvertes plutôt qu'en constats affirmatifs** ("avez-vous envisagé... ?" plutôt que "voici ce qui devrait se passer") si cette piste est un jour ouverte.

### Idées nouvelles, émergeant de la réflexion

- **Retourner l'idée B vers la personne, pas vers le CIP** -- un questionnement structuré qui aide la personne à préparer ce qu'elle va dire à son rendez-vous, sur le modèle du CCP1 lui-même, sans que l'IA ne produise jamais elle-même le diagnostic.
- **Journal des hypothèses de projet écartées**, pas seulement le projet actuel -- trace déterministe des pistes explorées puis abandonnées, avec la raison. Évite qu'un CIP remplaçant reparte de zéro.
- **Marqueur de confiance systématique** sur toute sortie IA de ce domaine ("hypothèse à vérifier" vs "élément confirmé par la personne") -- règle de conception à ériger dès le départ, pas une fonctionnalité en soi.

### Verdict

Changement d'échelle du produit, pas une fonctionnalité de plus : données bien plus sensibles (santé, logement, situation familiale, situation administrative) que tout ce qui existe dans ERIP aujourd'hui, questions de déontologie professionnelle (empiéter sur le jugement du CIP) et de protection des données qui dépassent une décision d'architecture. Traité comme une deuxième phase de réflexion, après (ou en parallèle très encadré de) les 5 chantiers déjà priorisés -- "Vue CIP" (déjà priorité 2) est un terrain d'essai naturel avant de se lancer dans quelque chose d'aussi vaste. Sur la partie freins/données sociales sensibles : avis d'un CIP en exercice, voire un regard juridique RGPD, recommandé avant d'aller plus loin -- ce n'est plus une question purement logicielle.

---

## 9. Éléments récupérés pour enrichir la feuille de route existante (2026-08-13)

Passage en revue des 5 chantiers déjà priorisés (section 6) à la lumière de la section 8, selon le critère posé par Denis : récupérer uniquement ce qui est peu risqué, cohérent avec la philosophie, sert la personne, et ne dessert pas le CIP.

**Chantier 1, Cohérence transversale -- enrichi.** Emprunt du principe de l'idée F (détection déterministe) : une pré-vérification **sans IA**, avant l'appel à Prompt 1, qui compare `dossier.metierCible` (déjà connu du CV) au métier ciblé dans la dernière lettre générée -- signale un décalage flagrant avant même que le diagnostic IA tourne. Coût marginal (une comparaison de deux champs déjà existants), réduit le nombre de passages IA nécessaires pour détecter un cas grossier -- cohérent avec la discipline "l'application tranche seule quand elle le peut".

**Chantier 2, Vue CIP -- enrichi, c'est le plus gros bénéficiaire.** Fusion des idées D (mémoire évolutive) et F (détection d'incohérences), appliquée uniquement aux données qui existent déjà -- **aucune nouvelle donnée sensible collectée** : un sous-bloc qui croise `_bilanStatutsCorrection` (déjà déterministe, ce qui a été fait) et `planAction` (déjà produit par Prompt 1, ce qui était prévu) pour signaler des écarts ("3 recommandations validées, 1 seule marquée corrigée"). Reprend le Journal de progression déjà identifié (section 4) sans l'étendre au-delà du périmètre CV déjà couvert.

**Chantier 3, Carte de correspondance -- validé, pas de changement de périmètre.** L'idée A (représenter des relations plutôt qu'une liste) valide a posteriori le principe déjà retenu pour ce chantier -- même mécanique, entités différentes. Confirme la direction de conception, n'ajoute rien de nouveau.

**Chantier 4, Regard recruteur -- enrichi sur la sécurité, pas sur le périmètre.** Deux garde-fous empruntés directement à la critique de l'idée B : chaque élément de sortie ("doutes", "objections probables") doit être formulé comme **question ou point à vérifier, jamais comme un constat affirmatif** ; envisager un champ de certitude explicite dans le schéma de sortie. Coût zéro (règle de conception, pas de code supplémentaire), réduit le risque déjà identifié comme le plus élevé des 5 chantiers (section 5, "risque de complexité : moyenne-élevée").

**Chantier 5, Glossaire -- inchangé aujourd'hui.** Compatibilité future notée : si la piste CIP globale (section 8) est un jour ouverte, le glossaire pourrait naturellement s'étendre au vocabulaire freins/leviers/plan d'action -- aucun changement de périmètre pour l'instant.

---

## 10. Feuille de route détaillée -- version technique

Pour chaque chantier : ce qui est réutilisé tel quel, ce qui est nouveau et pourquoi, difficulté, estimation de temps.

### 1. Cohérence transversale CV / lettre / entretien (~80-100h)
- **Réutilise intégralement** : le moteur de diagnostic (`diagnostic/`, `modeles/`), l'axe `coherence_transversale` déjà présent dans le catalogue des 10 axes, l'écran de rapport existant (`htmlBilanRapport`).
- **Nouveau, obligatoire** : étendre la collecte de données envoyées à Prompt 1 pour inclure le texte de la lettre et/ou de l'entretien préparé (aujourd'hui, seul le CV est transmis) -- nouvelles fonctions de lecture dans `hostDataAdapter.js` (`lireLettreTexte()`, `lireEntretienTexte()`, sur le modèle de `lireExperiencesTexte()` déjà existante), et adaptation de `prompts/bilan-v1.md` pour recevoir ces nouveaux placeholders.
- **Nouveau, léger (section 9)** : `bilanDetecterIncoherenceEvidente(dossier)`, une fonction pure et déterministe, avant l'appel IA.
- **Difficulté** : moyenne -- le vrai travail est l'extension du schéma du Prompt 1, pas une nouvelle architecture.

### 2. Vue CIP (~80-120h, potentiellement +10-20h avec l'enrichissement section 9)
- **Réutilise intégralement** : `dossier`, `resultat.axes`, `recommandations`, `_bilanStatutsCorrection` (déjà déterministe), `planAction` (déjà produit par Prompt 1).
- **Nouveau** : uniquement une couche de présentation -- un nouvel écran, aucune nouvelle capacité IA.
- **Enrichissement (section 9)** : un croisement déterministe `_bilanStatutsCorrection` × `planAction`, pure logique, zéro nouvelle IA.
- **Difficulté** : faible-moyenne -- présentation uniquement, le risque technique le plus faible des 5.

### 3. Carte de correspondance (~40-60h)
- **Réutilise intégralement** : l'axe `adequation`, les observations déjà calculées par Prompt 1.
- **Nouveau** : uniquement une présentation structurée/visuelle.
- **Difficulté** : faible.

### 4. Regard recruteur (~100-140h)
- **Réutilise** : le modèle de conception de Prompt 1 (axes fixes, sortie bornée), `diagnosticResponseParser.js` comme référence de validation stricte.
- **Nouveau, obligatoire** : un nouveau prompt, un nouveau schéma de sortie (axes propres -- points forts perçus, doutes, objections probables), un nouveau parser sur le modèle de `diagnosticResponseParser.js`.
- **Garde-fou obligatoire (section 9)** : formulation en questions/points à vérifier, pas en constats ; champ de certitude explicite.
- **Difficulté** : élevée -- seul chantier des 5 qui demande un nouveau moteur de diagnostic complet, pas une nouvelle présentation de données existantes. Nécessite la même rigueur que le Bilan CV : conception avant maquette avant code.

### 5. Glossaire (~30-50h)
- **Réutilise** : le pattern de `data/metiers.js` (base structurée + moteur de recherche `rechercherMetiers`).
- **Nouveau, obligatoire** : un nouveau fichier de données, un moteur de recherche simple (peut s'inspirer directement de `rechercherMetiers`), un nouvel écran de recherche.
- **Difficulté** : faible-moyenne -- l'essentiel du coût est la rédaction du contenu, pas le code.

**Total inchangé : 330-470h**, dans l'enveloppe 300-500h.

---

## 11. Version courte -- à présenter aux CIP

| Chantier | En une phrase | Pour qui, surtout | Limite assumée |
|---|---|---|---|
| Cohérence transversale | Vérifie que le CV, la lettre et l'entretien racontent la même histoire | Candidat | Ne corrige rien tout seul, signale et laisse décider |
| Vue CIP | Un compte-rendu du dossier candidat, consultable par le CIP avant un rendez-vous | CIP | Ne remplace jamais le dossier officiel (i-Milo ou équivalent) |
| Carte de correspondance | Montre visuellement pourquoi une expérience répond (ou non) à une attente du poste | Candidat | Pédagogique, pas un score |
| Regard recruteur | Une lecture externe du CV, points forts et doutes probables | Candidat | Présente des questions à vérifier, jamais des vérités |
| Glossaire | Un dictionnaire cherchable du vocabulaire emploi/insertion | Candidat et CIP | Définit des concepts, jamais des montants/droits actuels |
| Accessibilité (chantier 6, continu) | Vérifie que chaque écran reste utilisable par tous (contraste, clavier, lecteur d'écran) | Candidat, en priorité le public à autonomie réduite | Effort permanent, pas un chantier qu'on coche une fois |

### Argumentaire pour les échanges avec d'autres CIP

**Techniques** :
- Rien ne s'écrit ni ne se décide automatiquement : chaque proposition IA passe par un écran de relecture explicite, validé un par un par la personne.
- Aucune nouvelle donnée sensible (santé, logement, situation familiale) n'est collectée par cette feuille de route -- elle reste strictement dans le périmètre CV/candidature déjà en place.
- Tout est local à la session du candidat, pas de compte central ni de base de données partagée entre usagers -- cohérent avec ce qu'ERIP fait déjà.

**Déontologiques et éthiques** :
- ERIP ne remplace jamais le dossier officiel du CIP (i-Milo ou équivalent) -- il prépare et prolonge, jamais ne consigne à sa place.
- ERIP ne remplace jamais le jugement professionnel du CIP -- toute sortie IA sensible (Regard recruteur) est formulée en questions à vérifier, jamais en constats.
- Aucune fonctionnalité ne se mesure à "la personne a moins besoin du CIP" -- le seul critère de réussite accepté est "le CIP est mieux préparé", jamais "le CIP intervient moins".
- La piste plus large (diagnostic freins/ressources/plan d'action, section 8) est volontairement écartée de cette feuille de route précisément pour ces raisons -- elle empièterait sur une méthodologie déjà certifiée (CCP1) et déjà digitalisée nationalement (i-Milo), avec un vrai risque de double saisie et d'absence de statut institutionnel.

---

## 12. Deux pistes supplémentaires, hors concurrence état/marché payant (2026-08-13)

Recherche explicite d'espace libre : ni en concurrence avec les logiciels imposés par l'État (i-Milo, Réseau Pour l'Emploi), ni avec les outils commerciaux financés (Zety, Canva...). Verdict général : la feuille de route à 5 chantiers représente une ambition déjà bien calibrée compte tenu des contraintes réelles (autofinancé, seul, pas de backend) -- pas le plafond absolu du possible, mais pousser plus loin conduirait probablement vers l'un des deux territoires déjà écartés. Deux pistes modestes, à faible coût, trouvées en dehors de ces deux zones :

### Post-embauche : "les premiers pas dans l'emploi"

Tous les outils, sans exception (i-Milo, Zety, ERIP aujourd'hui compris), s'arrêtent à la candidature. Rien ne s'occupe des premières semaines dans un emploi : comprendre une fiche de paie pour la première fois, la période d'essai, les codes implicites d'un lieu de travail. Angle mort réel, pas seulement chez les concurrents. Public concerné élargi : y compris les personnes déjà en SIAE (contrat d'insertion en cours), un public mentionné par Denis parmi les cibles d'ERIP.

- Coût : faible -- contenu explicatif, réutilise directement le moteur de recherche prévu pour le Glossaire (chantier 5), aucune nouvelle IA, aucune donnée sensible.
- Trou couvert : total (rien n'existe aujourd'hui, ni chez ERIP ni chez la concurrence).
- Différenciation : forte.

### Accessibilité comme pilier explicite, pas seulement un réglage

Ni l'État (outils pensés pour l'efficacité du professionnel) ni le marché payant (pensé pour un candidat déjà autonome) ne priorisent réellement l'accessibilité pour ce public précis. Déjà dans l'ADN d'ERIP (réglage "Confort de lecture" existant) mais mérite d'être assumé comme un pilier différenciant à part entière, pas un réglage parmi d'autres -- vérification réelle des contrastes, de la navigation clavier, de la compatibilité lecteurs d'écran, au-delà du texte simplifié déjà évoqué (section 4).

Piste écartée en cours de route, pour mémoire : un partage de configuration Territoire entre structures différentes. Intéressant en théorie, mais suppose une forme d'infrastructure partagée/backend -- incompatible avec la contrainte "pas de backend, autofinancé".

---

## 13. Ordre de mise en œuvre révisé, avec critères explicites (2026-08-13)

Denis a proposé 5 critères pour ordonner les chantiers : trou le plus important couvert, plus grande utilité, plus grande différenciation face à la concurrence, actuellement non couvert du tout, faible difficulté (aucune nouvelle fonction manquante). Application honnête de ces critères aux 7 pistes maintenant identifiées (5 chantiers + les 2 de la section 12) :

| Chantier | Trou total ? | Utilité | Différenciation | Difficulté / nouvelles fonctions |
|---|---|---|---|---|
| Vue CIP | Oui, rien n'existe | Très haute | Très haute (aucun concurrent) | Faible -- réutilisation à 100%, présentation uniquement |
| Glossaire | Oui (sauf `data/metiers.js` comme brique proche) | Haute | Moyenne-haute | Faible -- pattern déjà validé |
| Post-embauche (section 12) | Oui, rien n'existe | Moyenne-haute (moment plus étroit) | Forte | Faible -- même mécanisme que le Glossaire |
| Carte de correspondance | Partiel (données déjà calculées, pas présentées) | Haute | Moyenne | Faible -- présentation uniquement |
| Cohérence transversale | Partiel (axe déjà présent, sous-alimenté) | Haute | Haute | Moyenne -- nouvelles fonctions de lecture, extension du schéma Prompt 1 |
| Accessibilité (section 12) | Partiel (réglage déjà présent) | Très haute pour le public cible | Haute | Diffuse -- pas une fonctionnalité bornée, un balayage transversal (voir ci-dessous) |
| Regard recruteur | Oui, rien n'existe | Haute | Très haute | Élevée -- nouveau moteur de diagnostic complet |

**Constat en appliquant ces critères strictement** : "Vue CIP" les coche tous les cinq simultanément -- plus fortement que "Cohérence transversale", pourtant placé en premier dans la section 6 initiale (où le critère dominant était différent : le meilleur rapport valeur/réutilisation d'une boucle déjà anticipée par l'architecture, `coherence_transversale`). Les deux logiques ne se contredisent pas, elles pèsent différemment : la section 6 valorisait l'élégance architecturale (fermer une boucle déjà prévue) ; les critères de Denis valorisent le trou comblé et la simplicité d'exécution. Sur ce second jeu de critères, assumé ici comme le plus pertinent pour décider un ordre concret, "Vue CIP" l'emporte.

**Ordre révisé recommandé** :
1. **Vue CIP** -- coche les 5 critères simultanément.
2. **Glossaire**, avec **Post-embauche** comme extension directe (même mécanisme technique, à livrer ensemble ou immédiatement à la suite plutôt que comme deux chantiers séparés).
3. **Carte de correspondance** -- faible difficulté, bonne utilité, présentation de données déjà calculées.
4. **Cohérence transversale** -- valeur confirmée mais nécessite de vraies nouvelles fonctions (lecture de la lettre/de l'entretien, extension du schéma Prompt 1), moins "gratuit" que les 3 précédents sur le critère difficulté.
5. **Regard recruteur** -- toujours en dernier : le seul des 5 chantiers d'origine qui exige un nouveau moteur de diagnostic complet, cohérent avec le critère difficulté appliqué strictement.
6. **Accessibilité** -- ajoutée à la liste à la demande explicite de Denis (2026-08-13), pour ne jamais la perdre de vue, tout en gardant sa nature différente à l'esprit : ce n'est pas un chantier séquentiel comme les 5 précédents (voir ci-dessous), mais un effort continu à démarrer dès le chantier 1, pas après.

**Cas particulier : l'Accessibilité (chantier 6) n'a pas la même forme que les 5 précédents.** Elle échoue à deux des cinq critères de Denis (pas un trou total -- un réglage existe déjà -- et une difficulté diffuse plutôt que bornée), pas par manque de valeur mais parce qu'elle n'a pas la même *forme* qu'un chantier séquentiel : c'est une exigence transversale, qui touche potentiellement chaque écran existant et futur, plutôt qu'une fonctionnalité isolée. La traiter comme un chantier unique à cocher une fois serait trompeur -- le vrai risque est qu'elle se dégrade progressivement si elle n'est pas maintenue en continu à mesure que de nouveaux écrans s'ajoutent. Conservée dans la liste numérotée ci-dessus pour rester visible, mais à mener en parallèle du chantier 1, pas en séquence après le chantier 5.

### Accessibilité -- analyse complète, demandée explicitement par Denis

**Pourquoi** : c'est la seule piste qui bénéficie immédiatement à l'usage déjà existant (contrairement aux 5 chantiers, qui créent tous du neuf), pour le public qu'ERIP dit vouloir servir en priorité. Un gain ici profite à 100% des utilisateurs actuels dès demain, pas seulement aux futurs utilisateurs d'une nouvelle fonctionnalité.

**Comment le faire** :
1. Audit des écrans à plus fort trafic (rapport Bilan, écrans "Assistance à la finalisation" tout juste construits, éditeur de CV principal) contre les critères RGAA/WCAG de base : contraste des couleurs, navigation au clavier (ordre de tabulation, focus visible), attributs ARIA sur les composants interactifs (boutons, cases à cocher, fenêtres modales), lisibilité (déjà partiellement couvert par "Confort de lecture").
2. Corriger les manquements trouvés, écran par écran, en réutilisant les composants déjà en place -- aucune nouvelle architecture.
3. Formaliser une checklist courte, appliquée systématiquement à chaque futur écran construit -- sur le même principe que les disciplines déjà appliquées cette session ("jamais d'em-dash", "toujours vérifier en navigateur").

**Combien de temps** : difficile à borner précisément -- c'est sa principale faiblesse en tant que "chantier". Un premier passage ciblé sur les écrans à plus fort trafic est raisonnable en 30-50h ; la discipline continue ensuite coûte quelques heures par futur chantier, pas un budget séparé à isoler.

**Avantages** : bénéfice immédiat sur l'existant ; aligné à 100% avec la philosophie déjà écrite (section 1) ; différenciant, angle mort réel du marché pour ce public précis ; coût marginal faible une fois la discipline installée.

**Inconvénients** : pas un livrable "fini" et démontrable comme les autres chantiers (pas de nouvel écran à présenter, moins visible dans un échange avec des CIP) ; difficile à chiffrer en heures avec la même précision ; facile à négliger ou reporter précisément parce que ce n'est jamais "urgent" au sens d'un nouveau chantier qui manque.

**Difficultés** : nécessite une vraie connaissance des normes RGAA/WCAG, pas seulement du bon sens, sinon le risque est un travail cosmétique sans vraie valeur d'accessibilité ; certains composants déjà construits (fenêtres modales, panneaux flottants) demandent une vérification technique précise (piège au clavier, gestion du focus) qui peut révéler des refontes plus profondes que prévu à l'audit initial.

**Zones d'ombre** : aucun audit RGAA réel n'a été fait à ce jour sur ERIP -- impossible de dire aujourd'hui si le travail nécessaire est petit ou important, c'est une vraie inconnue tant qu'un premier audit n'est pas mené.

**Points de fragilité** : sans discipline explicite appliquée à chaque nouveau chantier, le travail d'accessibilité se dégrade progressivement à mesure que de nouveaux écrans sont ajoutés sans y penser -- c'est un effort permanent, pas un chantier qu'on coche une fois pour toutes.

**Améliorations futures possibles** : audit avec un vrai lecteur d'écran (NVDA/VoiceOver) une fois le premier passage fait ; tests utilisateurs réels avec des personnes en situation de handicap ou à faible littératie numérique, si le réseau de CIP de Denis permet un jour d'organiser ça.

**Recommandation finale** : démarrer l'audit ciblé (30-50h) en parallèle du chantier 1 (Vue CIP), pas après -- et adopter la checklist dès le chantier 1 pour que chaque nouvel écran construit à partir de maintenant la respecte nativement, plutôt que d'accumuler une dette à corriger plus tard.
