# Inventaire : alléger les consignes, protéger le travail, moins dépendre des assistants en ligne

Rédigé le 2026-11-08, à la demande de Denis (Mode A, `[effort : haut]`). **Audit seulement : rien n'a été codé, aucun prompt modifié.**
Ce document répond à trois questions de Denis : (1) où le code peut faire à la place de l'assistant, (2) comment protéger le travail contenu dans les consignes, (3) que faire si les assistants gratuits se raréfient.

## 0. Ce qui a été lu, et ce qui ne l'a pas été (honnêteté de l'audit)

- **Mesuré** (comptages, scripts) : taille des 35 consignes, doublons exacts, sections jamais envoyées au bon moment, contenu des 129 fiches métiers, 13 843 intitulés et 1 923 codes du répertoire élargi, usage réel des champs des fiches, flux d'envoi.
- **Lu en entier** : `cv.md`, section « Ta tâche » ; extraits de `ats.md`, `regard-recruteur.md`, `lettre-co.md`, `cv.md` (complément).
- **Lu seulement par titres de sections** : les 30 autres consignes. Les propositions qui les concernent sont des **hypothèses à confirmer par lecture complète** au moment d'engager le lot.
- **Non vérifié** : le dépôt GitHub est-il public ou privé (outil `gh` absent du poste) ; si les CSV du ROME contiennent bien les liens « fiche -> compétences » (voir section 4).

## 1. Constats mesurés

1. **Volume.** 35 fichiers dans `prompts/`, environ 585 000 caractères (environ 150 000 jetons, estimation). Une séance n'en envoie qu'un : de 1 Ko (`_garde-fou-reponse`) à 57 Ko (`lettre-co`), `cv` 42 Ko, `regard-exterieur` 40 Ko.
2. **Aucun appel direct à un assistant.** Pas de clé, pas de serveur : l'application assemble le texte, le **copie dans le presse-papiers**, et la personne le colle chez ChatGPT, Gemini, Claude, etc. (`navigator.clipboard.writeText`, `js/app.js`). Conséquence capitale pour la protection (section 2) et excellente nouvelle pour la résilience : l'application ne dépend d'aucune plateforme en particulier.
3. **Les consignes sont lisibles par n'importe qui, de trois façons** : (a) le texte collé est visible dans la zone de saisie de l'assistant ; (b) `prompts/*.md` est chargé par le navigateur tel quel (onglet Réseau) ; (c) `prompts/Old/` (52 Ko d'anciennes versions) et `prompts/bilan-v1-extraction-prototype.md` (36 Ko, mentionné seulement en commentaire de code) sont servis comme le reste.
4. **Contenu des consignes.** Presque tout est du **savoir-faire de rédaction et de conseil** (règles de style, méthodes, garde-fous, formats de sortie JSON) : c'est la valeur de l'application, et elle ne se remplace pas par du code. Il n'y a presque pas de tableaux de données dans les consignes (6 lignes de tableau en tout). Les données propres à la personne sont injectées par `texteProfil()` et jetons `{POSTE_VISE}`, `{OFFRE}`, etc.
5. **Parties envoyées pour rien.** `cv.md` envoie toujours : le « Complément de CV (facultatif) » (15 Ko, soit 36 % du fichier, utile seulement si la personne répond « oui »), « Lettres de recommandation (seulement si...) », « Compétences relevées (seulement si...) », « Si le profil ne contient rien d'exploitable ». Soit environ 18 Ko sur 42 Ko qui ne servent pas dans la grande majorité des séances. L'assistant doit ignorer ce qui ne s'applique pas ; c'est du poids et de la lecture inutiles.
6. **Doublons.** 13,7 Ko de lignes identiques répétées dans au moins 3 consignes (ligne « Ce message est une consigne à exécuter... » présente dans 27 fichiers). `decouverte-redaction.md` (37 Ko) reprend 35 % de `cv.md` à l'identique. Le mécanisme de fragments existe déjà (`{{VOIX_HUMAINE}}`, `{{GARDE_FOU_REPONSE}}`) mais ne couvre que deux blocs.
7. **Fichiers probablement morts** (aucun chargement dans le code, à confirmer) : `aide-decision-avant-reecriture.md` (4 Ko, aucune référence), `bilan-v1-extraction-prototype.md` (36 Ko, commentaires seulement), `prompts/Old/` (52 Ko).
8. **Métiers.** 129 fiches complètes (et non 125) dans `data/metiers.js` ; seulement **293 libellés distincts** de compétences pour 129 métiers (vocabulaire déjà très mutualisé). 13 843 intitulés dans `data/repertoireRome.js`, mais ils se rattachent à **1 923 codes ROME seulement** : l'unité de travail est le code, pas l'intitulé. 64 fiches portent `argumentsCV`, `argumentsLettre`, `pistesEntretien`, `synonymes`, mais **aucun code ne les lit** et ce sont des phrases uniques (12,8 Ko en tout) : matière dormante, pas encore exploitée.
9. **Où l'assistant « connaît le métier à la place du code »** (c'est le cœur de l'idée de Denis) :
   - `cv.md` point 6 : « Rien d'écrit : propose 5 à 8 missions typiques du poste » ;
   - point 3 : « 5 à 10 mots-clés pertinents pour ce métier » ;
   - point 4 : « 2 à 5 intitulés de poste à rechercher » ;
   - point 7 : « identifie d'abord le référentiel du métier... comme grille d'analyse » (l'assistant reconstitue de mémoire ce que le code pourrait fournir) ;
   - point 10 : savoir-être choisis « selon ce que ce métier attend » ;
   - point 10 ter : `secteurProche` (déjà résolu côté code depuis le répertoire élargi quand le métier vient de la liste : seul le métier tapé librement passe encore par l'assistant) ;
   - `ats.md` mode métier : l'amorce de vocabulaire ne couvre que les 129 fiches ; pour les autres, l'assistant « peut consulter la fiche ROME en ligne » (donc dépendance au web de l'assistant) ;
   - `regard-recruteur.md` section 3 (« L'adaptation au secteur ») : cinq blocs de connaissance par type de métier, tous envoyés quel que soit le métier ;
   - `lettre-co.md` section 4 et `entretien*.md` : valeurs et attentes du métier, questions typiques.

## 2. Franchise sur la protection du travail

- **Tant que la personne copie le texte pour le coller, elle peut le lire en entier.** Aucune astuce de code n'y change rien. Chiffrer ou brouiller le texte est impossible : l'assistant doit le comprendre en clair.
- **La vraie protection vient de ce qu'on ne met pas dans le texte envoyé.** Un savoir déplacé dans le code (référentiel de compétences, règles par métier) n'apparaît plus dans la consigne. Il reste dans un fichier de données du site : téléchargeable en théorie, mais beaucoup moins lisible et utilisable qu'une consigne en français, et pas relié à la méthode.
- **Deux protections supplémentaires et réelles :** (a) n'envoyer que les parties qui s'appliquent à la séance (une personne qui ne demande pas le complément ne reçoit jamais ces 15 Ko) ; (b) découper en deux messages quand le deuxième dépend du premier (ce que la personne n'a jamais demandé n'est jamais publié dans sa conversation).
- **Une protection totale n'est possible qu'avec un serveur** qui appelle lui-même l'assistant : cela coûte de l'argent à chaque usage, exige des comptes et des clés, et contredit le principe actuel « statique, sans compte, gratuit ». **Je le déconseille aujourd'hui.**
- **Sans lien avec le code, à ne pas oublier :** une mention de droits (« Consigne propriété de ... ») en tête des textes ne protège rien techniquement mais pose une preuve d'antériorité et un recours. À décider par Denis avec l'avis d'un juriste si ça compte pour lui ; l'historique Git daté est déjà une preuve.
- **VÉRIFIÉ le 08/11/2026 (Lot 1, point a) : le dépôt `ursdac-jpg/APP` est PUBLIC**, sans aucune licence (`license: null`, donc « tous droits réservés » par défaut, mais lisible et copiable pour tout visiteur), dernier envoi le 06/11/2026, avec GitHub Pages actif. Constaté par requêtes sur l'API publique de GitHub et sur le site publié : `prompts/*.md`, `prompts/Old/cv_33.md`, `data/metiers.js`, **`docs/` en entier (1 157 fichiers suivis), `CLAUDE.md` et `docs/TRAVAILLER_AVEC_DENIS.md`** répondent tous « 200 » sur l'adresse publique. Conséquences :
  1. Les consignes sont déjà lisibles par tous, sans même passer par l'application. Tout fichier que le navigateur doit charger reste lisible par construction (c'est vrai sur n'importe quel hébergement de site statique).
  2. **Retirer un fichier de l'arbre de travail ne le retire pas de l'historique public** : `prompts/Old/` et les consignes mortes resteraient lisibles dans l'historique Git déjà envoyé. Le Lot 1 point b n'a donc aucune valeur de protection ; il ne reste qu'un intérêt de propreté. Effacer l'historique public (réécriture + envoi forcé) est une opération outward-facing risquée, jamais faite sans demande écrite de Denis.
  3. `docs/` et `CLAUDE.md` n'ont aucune raison d'être publiés pour le fonctionnement du site : ils contiennent toute la méthode, les essais de prompts, les décisions et des notes personnelles de travail avec Denis. C'est là, plus que dans `prompts/`, que se trouve l'essentiel du travail exposé.
  4. Options à présenter à Denis (voir la réponse du 08/11/2026) : A) dépôt privé (stoppe la publication Pages gratuite, hébergement du site à revoir, dépendance partenaire Inkéo à vérifier) ; B) deux dépôts, un privé de travail et un public ne contenant que ce que le site sert (le plus protecteur sans coût, mais une séparation à bâtir) ; C) rester public et poser une licence « tous droits réservés » explicite et une mention de droits, sans protection technique.

## 3. Les huit pistes, classées

Légende gain : poids retiré du texte envoyé / protection / autonomie. Risque : conséquence concrète si ça tourne mal.

| N° | Piste | Gain | Risque | Effort | Verdict préliminaire |
|---|---|---|---|---|---|
| P1 | Retirer du site les fichiers morts (`prompts/Old/`, prototype Bilan, `aide-decision-avant-reecriture.md`) | protection (88 Ko d'historique n'est plus lisible) | nul si vraiment non chargés (vérifier tests et docs) | bas | **GO** |
| P2 | Envoyer seulement les sections qui s'appliquent (cv : lettres de recommandation, compétences relevées, profil vide ; autres consignes à repérer) | cv : jusqu'à environ 3 Ko par séance ; protection | une section oubliée change le comportement de l'assistant : un essai réel par consigne | moyen | **GO** |
| P3 | Complément de CV : le mettre dans un **deuxième message** copié par le bouton « Complément de CV » existant (15 Ko hors du premier envoi) | cv : -36 % ; protection forte | le deuxième message doit rappeler assez de contexte ; la phrase « répondez oui » disparaît ; à tester sur ChatGPT, Gemini, Claude | haut | **GO AVEC RÉSERVES** |
| P4 | **Référentiel de compétences et de mots-clés par code ROME** (idée de Denis) | voir section 4 | voir section 4 | haut | **GO AVEC RÉSERVES** |
| P5 | Adaptation au secteur de `regard-recruteur` (et équivalents ailleurs) : n'envoyer que le bloc du domaine concerné (les 21 domaines sont connus du code) | environ 2 Ko par séance ; protection | domaine mal détecté : on retombe sur un bloc générique | moyen | **GO** (après lecture complète) |
| P6 | Vocabulaire de l'analyse de mots (`ats`) calculé par le code pour **tous** les métiers (via P4) et comparaison de base faite en code | autonomie : fonction utilisable sans assistant ; fin de la consultation du web par l'assistant | la comparaison de vocabulaire sans contexte peut paraître sèche ; à présenter comme « repère », jamais comme un score | haut | **GO AVEC RÉSERVES** |
| P7 | Fragments communs (ligne d'ouverture, règles de langue) : un seul fichier, repères `{{...}}` | 13,7 Ko de moins à maintenir ; aucun gain de protection | peu : même mécanisme que la voix humaine | bas | **GO** |
| P8 | Fiabiliser et exploiter les phrases dormantes des fiches (`argumentsCV`, `pistesEntretien`) | matière gratuite pour le mode sans assistant (section 5) | phrases d'une ligne, 64 fiches : faibles en l'état | moyen | **À décider** |

## 4. L'idée de Denis : un référentiel de compétences pour tous les métiers

**Le raisonnement de Denis est juste et réalisable.** Au lieu de demander « trouve les compétences de ce métier », le code fournit la liste attendue pour ce métier, et la consigne devient « voici ce que le métier attend ; dis lesquelles la personne prouve par son parcours et propose les compétences complémentaires qui y manquent ».

**Ce qui change par rapport à ce que Denis imagine :**
- L'unité n'est pas 13 843 métiers mais **1 923 codes ROME** (les intitulés d'un même code partagent leurs compétences). C'est un travail 7 fois plus petit.
- Il n'y a pas à les rédiger à la main : deux sources officielles ou ouvertes existent.
  1. **ROME 4.0 de France Travail** (déjà utilisé pour les intitulés, Licence Ouverte). La page des données ouvertes annonce des référentiels de savoir-faire (17 193), savoir-être professionnels (16), compétences socio-comportementales (2 269) et savoirs (15 699). **Je n'ai pas pu confirmer que les fichiers téléchargeables contiennent les liens « code ROME -> compétences »** (les noms de ressources n'étaient pas lisibles, et l'API Fiches métiers de France Travail les reconstitue). Étape 1 du chantier : ouvrir la liste des ressources et le dire.
  2. **« Mots-clés de CV par métier »** (data.gouv.fr, producteur JobAlign, Licence Ouverte 2.0, mis à jour le 24/09/2026) : 1 911 codes ROME, 47 769 liens métier -> mot-clé, avec un indicateur `coeur_de_metier` et un type (compétence métier, savoir-être, outil, certification...). Fichiers de 1 à 5 Mo. **Réserve : issu d'offres d'emploi analysées automatiquement, donc qualité à contrôler par échantillon** ; la source (ROME 4.0 version 61) est plus ancienne que la nôtre (version 62).
- Même chaîne que le répertoire élargi : un script génère un fichier, chargé seulement à la première frappe, jamais modifié à la main. Les 129 fiches complètes gardent la priorité (travail de Denis), le référentiel couvre le reste.

**Ce que ça allège concrètement dans les consignes** : points 3, 4, 6 (missions typiques si rien n'est écrit), 7 et 10 de `cv.md`, l'amorce de `ats.md`, une partie de `regard-recruteur`, `entretien-accueil`, `lettre-co` section 4. Estimation : de 1 à 4 Ko par consigne, mais surtout **une consigne qui n'a plus à deviner le référentiel du métier**, donc des résultats plus stables d'un assistant à l'autre.

**Risques à traduire en conséquences visibles :**
- *Compétences attribuées sans preuve.* Si on donne la liste du métier à l'assistant, il peut la recopier dans le CV de la personne. Il faut écrire noir sur blanc : « cette liste est ce que le métier attend, pas ce que la personne sait ; ne retiens que ce que son parcours prouve ». Le principe est déjà dans le point 7 ; il faudra le tester sur de vrais assistants (banc d'essai existant).
- *Liste trop générique ou trop longue* : un CV bourré de mots de référentiel. Limiter à l'envoi des 10 à 15 éléments les plus pertinents (le code peut classer par `coeur_de_metier`).
- *Qualité inégale* : certaines fiches ROME sont très abstraites. Échantillon de 30 codes à faire relire par Denis avant d'ouvrir.
- *Poids du fichier* : 1 à 2 Mo estimés, chargement à la demande comme le répertoire élargi.
- *Mise à jour* : à refaire à chaque version du ROME (la prochaine est annoncée en mars 2027 dans nos notes ; la page des données parle d'octobre 2026).

## 5. Si les assistants gratuits se raréfient : ce qui reste possible

**Point fort actuel** : aucune clé, aucun compte, quatre assistants au moins déjà utilisables : si l'un devient payant, l'application n'est pas touchée. Le risque réel serait la disparition **de tous** les accès gratuits en même temps.

Pour savoir quoi sauver, classer les fonctions par dépendance (à confirmer pendant le lot, voir section 0) :

| Famille | Sans assistant, aujourd'hui | Avec plus de code |
|---|---|---|
| Mise en page du CV, modèles, export PDF/Word | **Oui** (déjà possible : « mettre mon CV en page sans rien changer ») | rien à ajouter |
| Saisie guidée du profil, métiers, secteurs, chiffres, Lexique, Qui fait quoi, Employeurs, Comprendre le cadre | **Oui** (c'est du contenu et du code) | rien à ajouter |
| Repérage d'incohérences à l'import, mots du CV face au métier | partiel (`incoherencesImport.js`) | **P6** : comparaison de vocabulaire en code via P4 |
| Lecture d'un CV déposé (`extraction-cv`, 24 Ko) | non | analyse de texte en code : **réaliste seulement pour les rubriques simples** ; je ne promets rien sur la qualité, à étudier à part |
| Rédaction : accroche, missions reformulées, lettre | non | **modèles de phrases à compléter** à partir des fiches (P8) : qualité nettement plus faible, à présenter comme « version de secours » |
| Entraînement à l'entretien en dialogue, Regard recruteur, Cohérence | non | une **fiche de questions typiques** par métier (P8) remplace le dialogue, pas l'analyse |
| Analyse de situation (Comparer mes pistes, Regard extérieur) | non | rien de réaliste |

**Modèle local dans le navigateur** (WebLLM et équivalents) : mon avis, **NO GO aujourd'hui** pour ce public : téléchargement de plusieurs Go, lenteur ou impossibilité sur un petit ordinateur ou un téléphone, qualité en français moyenne. À réexaminer si le matériel du public évolue. Je n'ai pas testé ; c'est un jugement, pas une mesure.

**Recommandation de cadrage** : ne pas construire un « mode sans assistant » complet. Construire ce qui sert **en même temps** à alléger les consignes et à garder une fonction utile sans assistant (P4, puis P6 et P8). Ainsi un seul effort sert les deux buts.

## 6. Plan proposé, par lots (une séance = un niveau d'effort)

**Lot 1 `[effort : bas]`** : (a) Denis vérifie si le dépôt est public ; (b) P1, après confirmation de Denis et vérification de ce que les tests et les docs référencent ; (c) P7, fragments communs.
**Lot 2 `[effort : moyen]`** : P2 (sections conditionnelles de `cv.md`, puis les autres consignes) et P5 (adaptation au secteur de `regard-recruteur`), avec un essai réel sur au moins deux assistants par consigne.
**Lot 3 `[effort : haut]`** : P4 (référentiel par code ROME). Étapes : confirmer les fichiers sources ; script de génération ; échantillon de 30 codes relu par Denis ; branchement dans `texteProfil()` ; adaptation de `cv.md` ; banc d'essai sur assistants réels ; test navigateur (`js/app.js` n'est pas chargé par les tests Node).
**Lot 4 `[effort : haut]`** : P3 (complément de CV en deuxième message), puis P6 (vocabulaire du ATS en code) une fois P4 fait.
**Lot 5 `[effort : moyen]`** : P8, après décision de Denis sur le mode de secours.

Ordre recommandé : Lot 1, puis Lot 3 (c'est l'idée de Denis et elle commande P6), puis Lot 2 et Lot 4. Le lot 2 peut se faire avant si Denis veut un gain rapide.

**Verdict Mode Nuit : NON APTE.** Décisions encore ouvertes : (1) dépôt public ou privé ; (2) source du référentiel (ROME officiel si les liens existent, sinon JobAlign) ; (3) accord pour retirer les fichiers morts ; (4) ampleur du mode de secours (section 5) ; (5) mention de droits ou non.

## 7. Règles à respecter pendant les lots

- Une consigne n'est jamais allégée sans essai réel sur de vrais assistants (banc d'essai existant), puisque « zéro régression » vaut pour les prompts : aucune règle retirée sans décision.
- `bilan-v1.md` : une consigne courte de même mission reste possible, jamais deux missions dans un prompt.
- Mode sombre, accents, aucun tiret long, aucun mot « IA » visible : sans objet pour les consignes (non affichées), mais vrai pour tout texte nouveau visible dans l'application.
- Toute fonction ou signature partagée touchée : grep sur tout le dépôt (`texteProfil`, `chargerPromptsExternes`, `FICHIERS_PROMPTS_EXTERNES`).

## 8. Réévaluation du 08/11/2026 (effort haut, à la demande de Denis) : ce qui change dans les sections 3 à 6

Cette section **prime** sur les verdicts et les gains des sections 3 à 6 en cas de contradiction.

**Corrections de mes propres affirmations**
1. **Protection surestimée pour P2, P3, P4.** `prompts/*.md` et `data/*.js` sont publics sur le site et dans le dépôt : tout fichier que le navigateur doit charger reste lisible par construction. Envoyer moins de texte ou découper en deux messages **allège et réduit ce que la personne voit dans sa conversation**, mais ne cache rien. Les seules protections réelles sont : ne pas publier ce qui n'a pas besoin de l'être (`docs/`, `CLAUDE.md`, notes, essais, consignes en cours de travail), et le cadre juridique.
2. **Gains en Ko non mesurés.** Les « 1 à 4 Ko » et « jusqu'à environ 3 Ko » sont des estimations. Pour P4, injecter 10 à 15 compétences du métier ajoute du texte au lieu d'en retirer : le **gain réel de P4 n'est pas un prompt plus léger mais** (a) un assistant qui n'a plus à deviner le référentiel du métier, donc des résultats plus stables avec des assistants gratuits plus faibles ; (b) une liste de compétences du métier affichable à l'écran **sans assistant**.
3. **Mode de secours niveau 1 : ERREUR.** Le ROME ne contient pas de questions d'entretien. Ce que la fiche officielle fournit : compétences (savoir-faire, savoir-être, socio-comportementales), savoirs, contextes de travail, conditions d'accès, certifications associées. Les questions d'entretien types devront être **écrites par Denis ou validées par lui** (les 64 phrases dormantes de `pistesEntretien` sont trop minces).
4. **P3 (complément de CV en deuxième message) rétrogradé** de « GO AVEC RÉSERVES » à « à décider après mesure » : sa protection est quasi nulle (voir 1), son gain est un premier message plus léger, son risque est de changer un parcours pour un public fragile et de tout retester sur plusieurs assistants.
5. **La mention de droits** : le droit d'auteur existe sans licence ni mention (en droit français), donc le `LICENSE` « tous droits réservés » **clarifie et documente** (surtout pour le partenaire) mais ne protège pas davantage. À ne pas présenter comme une protection.

**Faits vérifiés ce jour**
- **ROME officiel** (data.gouv.fr, licence `fr-lo`, mis à jour le 20/10/2026) : 1 923 fiches (= nos 1 923 codes), la description précise que chaque fiche donne « les compétences associées (savoir-faire, savoirs, savoir-être) ». Ressources : « Toutes les données du ROME » (XML, CSV, JSON), arborescences des compétences, des savoirs, des contextes de travail. **Les liens de téléchargement de « Toutes les données du ROME » répondent 404 aujourd'hui** (la page signale que certains fichiers ne sont pas disponibles) : le dossier de CSV téléchargé le 04/11/2026 pour le répertoire élargi est donc précieux ; **à demander à Denis où il se trouve**, il contient peut-être déjà les fichiers de compétences. Structure exacte des liens fiche -> compétences : **toujours non ouverte**.
- **GitHub** : sur l'offre gratuite, un site Pages ne peut venir que d'un dépôt **public** (documentation officielle de GitHub) ; un dépôt privé reste gratuit mais sans Pages. Denis a donc raison : public parce que gratuit.
- Ce qui a déjà été publié (historique, copies, clones) **ne peut pas être repris** ; une séparation protège l'avenir, pas le passé.

**Recommandations révisées, par ordre**
1. **Demander à Denis** : où est le dossier de CSV du ROME ? par quelle adresse les personnes ouvrent-elles l'application (github.io ou le partenaire) ? à qui appartient légalement l'application ?
2. **P4 avec le ROME officiel** (Lot 3), en deux temps : d'abord ouvrir les fichiers et dire ce qu'ils contiennent ; ensuite un banc d'essai sur trois métiers (une fiche complète, un code ROME seul, un métier tapé librement) avant de toucher une seule consigne. JobAlign reste un secours.
3. **P2 (sections conditionnelles) puis P5**, avec **mesure** : un script assemble la consigne réellement envoyée pour six profils types et compte les caractères avant et après.
4. **Séparer le travail privé du site public** (deux dépôts, le public gardant le nom `APP` pour conserver l'adresse) : utile, mais **pas urgent**, car le passé est déjà exposé ; à faire quand Denis le décide, jamais sans sa demande écrite.
5. **Mention de droits** : à faire, sans la présenter comme une protection.
6. P3, P6, P8 : après mesure et décision.

## 9. Le ROME officiel contient bien les compétences par fiche (vérifié le 08/11/2026, Lot 3 étape 1 faite)

**Source retrouvée.** Le dossier de CSV du ROME 4.0 version 62 téléchargé le 04/11/2026 était resté dans le dossier temporaire d'une ancienne séance (30 fichiers, 28 Mo). **Copié le 08/11/2026 dans `C:\Users\Denis\Documents\ROME_v62_donnees`** (hors du dépôt, pour ne pas faire recharger la page d'essai de Denis et ne pas être effacé avec les fichiers temporaires). Les liens de téléchargement de data.gouv.fr étant en erreur 404, **cette copie est actuellement la seule disponible : à ne pas supprimer**.

**Ce qu'elle contient, mesuré :**
- `unix_coherence_item` : 124 911 liens **fiche -> élément**, pour les 1 923 codes (médiane 63 par fiche, de 29 à 137), avec un repère **« Principale » (cœur de métier)** : 22 031 liens, soit 7 à 17 par fiche (médiane 12), aucune fiche sans cœur de métier.
- Nature des éléments : 60 517 savoir-faire (techniques et transverses), 40 715 savoirs, 6 343 savoir-être professionnels, 17 335 contextes de travail (par exemple « Travail les week-ends et jours fériés »).
- `unix_item` et `unix_referentiel_competence` / `unix_referentiel_savoir` : les libellés et les catégories.
- Exemples lus : Employé de rayon libre-service (« Réaliser la mise en rayon », « Gérer une caisse »...), Maçon (« Monter les murs en utilisant les matériaux adaptés »...), Assistant de vie (« Aider une personne à s'habiller »...). Concret, propre au métier, en français.
- `unix_texte` : définitions de chaque fiche (« Réalise des travaux agricoles mécanisés... »), utilisables pour la phrase « en quoi consiste ce métier » du CV.

**Limites à connaître :**
- **Savoir-être : peu de matière.** Le ROME n'en liste que **16 au total** (écoute, autonomie, rigueur, esprit d'équipe, sens du service...), 3 par fiche en médiane. Les qualités personnelles propres à chaque métier ne sont donc PAS dans le ROME ; elles continueront de venir de nos 129 fiches, des 21 domaines (`data/competencesSecteurs.js`) et de l'assistant (point 10 de `cv.md`). C'est un point à dire à Denis clairement : le référentiel couvre bien les gestes et les savoirs du métier, pas ses qualités humaines.
- **Libellés « techniques »** : parfois longs ou administratifs (« Respecter les règles de Qualité, Hygiène, Sécurité, Santé et Environnement (QHSSE) »). À filtrer ou raccourcir pour un CV lisible.
- Version 62 du 19/10/2026 : à refaire à chaque nouvelle version, et il faudra un moyen de retélécharger (les liens actuels sont en erreur).

**Poids du fichier à générer** (cœur de métier + 8 savoirs + savoir-être + 3 contextes, par code) : environ **2,3 Mo**, à charger à la demande comme le répertoire élargi ; réductible en ne gardant que le cœur de métier (environ 1 Mo, à mesurer).

**Conséquence sur le plan.** P4 est confirmé avec le ROME officiel (JobAlign devient inutile pour les compétences métier, il reste un secours pour les savoir-être). Prochaine étape du Lot 3 : banc d'essai avant/après sur trois métiers avec de vrais assistants, avant de toucher une consigne.
