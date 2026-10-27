# Audit final avant code : « Découvrir mes compétences »

Mode A, `[effort : haut]`. Date : 26/10/2026. Étape 4 de la méthode maquette. Code lu pour cet audit : `modules/un-cv-plusieurs-metiers/passageAssistant.js` (en entier), `js/app.js` (routes, sauvegarde, recommencer, aide, prompts externes, accueil), `data/metiers.js` (carte « Boîte à outils », pages d'introduction, dépôt de lettres), `data/baseConnaissancesERIP.js`, `data/lexique.js`, `data/nouveautes.js`, `index.html`, `docs/BRIQUES_COMMUNES.md`. Documents liés : `docs/CHANTIER_DECOUVRIR_MES_COMPETENCES_2026-10-26.md`, `docs/FAISABILITE_DECOUVRIR_MES_COMPETENCES_2026-10-26.md`, `docs/MAQUETTE_MES_COMPETENCES_2026-10-26.html` (version 2, vraies feuilles de style), `docs/ESSAI_MES_COMPETENCES_RESULTATS_2026-10-26.md`.

## 1. Verdict

**GO.** Aucune décision produit ou d'interface n'est ouverte (Q1 à Q8, les 6 questions de la maquette, la charte visuelle sont tranchées). **Un seul point d'architecture restait ouvert, je le tranche ici** : généraliser le passage avec l'assistant par des options facultatives (voir 5.1).

**Mode nuit : APTE EN DEUX TRANCHES.**
- **Tranche 1 (étapes 1, 2, 3, 7, 8)** : logique pure testée, pages et branchements sur les patrons existants, trois lignes dans `js/app.js` pour la sauvegarde. Aucune brique partagée n'est modifiée. Apte au mode nuit.
- **Tranche 2 (étape 4)** : modifie une brique partagée (`passageAssistant.js`, utilisée par 4 passages de « Un CV, plusieurs métiers »). Apte **seulement si** l'essai de ce module est rejoué avant et après, en navigateur, et reste identique. Sinon, à faire avec Denis.
- **Tranche 3 (étapes 5, 6, 9)** : interface complète décrite par la maquette. Apte si la tranche 2 est verte.

## 2. Le parcours réel, écran par écran (écran d'avant, écran d'après, boutons)

| Écran | Vient de | Va vers | Boutons et fonctions |
|---|---|---|---|
| **Accueil, carte « Boîte à outils »** | Accueil | Introduction | Nouvelle pastille « Découvrir mes compétences » (comme « Mes Repères », « Mon Carnet », « Lexique »). Panneau de la carte : une tuile de plus. |
| **Introduction** (`mes-competences-intro`) | Pastille, recherche de l'accueil, Nouveautés | Documents | « Retour » (carte d'accueil), « Accueil », « Commencer ». Si une session est engagée : encart « Continuer / Recommencer ». |
| **1. Mes documents** | Introduction | Assistant | « Revoir la présentation ». Déposer CV / lettre de motivation / lettre de recommandation (fenêtre commune), retirer, niveau du poste. « Continuer » inactif sans document, avec sa raison. Sans aucun document : renvoi vers « Créer un nouveau CV » et « À partir de mon récit ». |
| **2. L'assistant**, trois vues | Documents | Relecture | Choisir (copie le message), chez l'assistant (compte à rebours, onglet), coller la réponse. « Retour » recule d'une vue puis revient aux documents. Réponse illisible : message, rien n'est perdu. |
| **3. Ma relecture** | Assistant | Mon document | Familles dépliables, trois gestes par ligne, question « à préciser » avec réponse, second passage « lignes seules » (mêmes trois vues). « Continuer » inactif tant qu'aucune ligne n'est gardée. |
| **4. Mon document** | Relecture | Boîte à outils | Cases « phrases de mes documents » et « phrases pour l'oral », PDF, copier le texte, (Word plus tard), « Terminer ». |

Flèche « Précédent » du navigateur : branchée dès la création (B.24, mode d'emploi en 6 points).

## 3. Inventaire : GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI / NOUVEAU

| Élément | Statut | Détail |
|---|---|---|
| Fenêtre de dépôt (`ouvrirAssistantDepotCV`) et masquage | **GARDÉ** | Trois appels (CV, lettre de motivation, lettre de recommandation) avec `titre`, `intro`, `titreDocument`, `nomsInitiaux`. Précaution à reproduire : sauvegarder et remettre `dossier.cvTexte` et `dossier.cvAnalyse`. |
| CV déjà enregistré | **ENRICHI** | Proposé d'office par `obtenirOuDeposerTexteCV`. |
| Choix de l'assistant, bannière « chez l'assistant », collage | **GARDÉ** | `htmlChoixAssistantBilanCorps`, `htmlBanniereTransitionIA`, `htmlCollageInstantane`, via `passageAssistant.js` généralisé. |
| Lecture du JSON | **GARDÉ** | `extraireBlocJSONDepuisTexte` (et réparation B.20). |
| Barre d'étapes, « Revoir la présentation », bande « Continuer / Recommencer », barre du bas | **GARDÉ** | `barreEtapesModule`, `htmlBoutonRevoirModule`, `htmlBandeRepriseModule`, `barreNavigation`. |
| Page d'introduction | **GARDÉ** (patron) | `htmlPageIntroModuleParcours` avec `_introBlocAccroche` et `_introBlocSection`. Texte propre au module, à équilibrer avec les autres. |
| Blocs dépliables | **GARDÉ** | `.bloc-depli` (`bd-pret`, `bd-warn`), `.cv-section`. |
| Export PDF | **GARDÉ** (patron) | `imprimerLettrePdf(constructeurHtml, titre)`. |
| Sauvegarde dans la disquette, remise à zéro | **GARDÉ** (patron) | Fonctions `mesComp*` branchées aux trois points de `js/app.js`. |
| Lexique : « savoir-faire », « savoir-être », « savoir-être ou savoir-faire » | **GARDÉ** | Déjà dans `data/lexique.js` : la décision Q4 baisse de 2-3 fiches à **2 fiches nouvelles** (« savoirs », « comment prouver une compétence à l'oral »), plus des renvois « voir aussi » depuis les fiches existantes. |
| Mots de recherche « mes compétences », « découvrir mes compétences » | **DÉPLACÉ** | De l'entrée de « À partir de mon récit » vers la nouvelle entrée de `data/baseConnaissancesERIP.js` (l'ancienne garde « récit », « raconter mon parcours », « découverte »). |
| « À partir de mon récit » (module `decouverte`) | **GARDÉ tel quel** | Aucune route, aucun prompt, aucune donnée touchée. Pas de fusion (leçon 9.64). |
| Message à copier, filet de sécurité, relecture à trois gestes, second passage « lignes seules », document « Mes compétences », état du module | **NOUVEAU** | Voir 5. |
| Prompt `prompts/mes-competences.md` (version 6) | **NOUVEAU** | Chargé par `FICHIERS_PROMPTS_EXTERNES`. L'entête historique (essais, banc d'essai) sera raccourci avant l'envoi à l'assistant. |

**FUSIONNÉ** : rien. Aucune duplication n'est créée : le passage avec l'assistant est généralisé, pas recopié.

## 4. Points d'intégration exacts (hors du dossier du module)

| Fichier | Quoi |
|---|---|
| `index.html` | Scripts du module, **après** `modules/un-cv-plusieurs-metiers/passageAssistant.js` (ligne 544) et avant `js/app.js` ; feuille de style seulement si le module en a besoin (il n'en a pas besoin : classes existantes). |
| `js/app.js` | Routes `mes-competences-intro` et `mes-competences` (près de `regard-recruteur`, ligne 4088) ; `FICHIERS_PROMPTS_EXTERNES` et `promptsExternesCharges` (lignes 33934 et 33947) ; `recommencer()` (ligne 41235) ; `collecterEtatsModulesPourSauvegarde` et `restaurerEtatsModules` (lignes 41478 et 41491) ; `AIDE_PAGES` (lignes 42668 et 42703) ; pastille de la carte (ligne 5239) ; texte de visite guidée de la carte (ligne 42340). |
| `data/metiers.js` | Panneau de la carte : `items` (ligne 9342), `tuile` (ligne 9547), `brancher` et `pulseDecouverteUneFois` (ligne 9747) ; page d'introduction `pageIntroMesCompetences` (patron ligne 11821). |
| `data/baseConnaissancesERIP.js` | Nouvelle entrée + déplacement de mots-clés (ligne 65). |
| `data/lexique.js` | 2 fiches + renvois ; `node scripts/checkLexique.js` (0 erreur, 0 avertissement). |
| `data/nouveautes.js` et `docs/JOURNAL_DES_CHANGEMENTS.md` | Une ligne chacun, dans le même commit que la fonction visible. |
| `docs/BRIQUES_COMMUNES.md` | B.52 (module) et mise à jour de la dette B.10 / B.17 (passage avec l'assistant). |
| `scripts/parcours/parcours_smoke.js` | Essai `mesCompetences` (et rejeu de l'essai de « Un CV, plusieurs métiers »). |

## 5. Décisions d'architecture tranchées

**5.1 Passage avec l'assistant : généraliser, par options facultatives.** `passageAssistant.js` ne dépend du module « Un CV, plusieurs métiers » que par quelques points : le rafraîchissement `ucpmRendrePage()` (7 appels), l'attribut `data-assistant-ucpm`, l'identifiant `ucpmErreurChoixIA`, les noms de suivi `ucpm_*`. Changement : `config.rerendre`, `config.attrAssistant`, `config.idErreur`, `config.nomSuivi`, et un troisième argument facultatif `rerendre` pour `ucpmPassageRetour`. **Valeurs par défaut = les valeurs actuelles** : les quatre passages existants ne changent pas d'un caractère. Le nom `ucpm*` reste (renommage = dette notée dans B.10 / B.17, pas de renommage à chaud). `_ucpmIntervalleDecompte` et `_etatTransitionIA` restent globaux : un seul passage est à l'écran à la fois.

**5.2 État du module : hors de `dossier`.** `_mesCompEtat` (documents `{ id, type, texte }`, niveau, écran, passages, lignes avec leur geste et leur texte corrigé, motivations, réponses aux questions, options du document). Fonctions : `mesCompExporterEtatPourSauvegarde`, `mesCompRestaurerEtatDepuisSauvegarde`, `mesCompReinitialiser`, et **`mesCompObtenir()`** (lecture du document final, pour d'autres modules après essais comparatifs). Les textes déposés sont déjà relus et masqués par la personne.

**5.3 Filet de sécurité : une seule source.** Le vérificateur (`scripts/essaiMesCompetences/verifier.js`) devient `modules/mes-competences/filet.js` (JavaScript pur, garde `module.exports`), le banc d'essai l'importe. Refonte nécessaire : le vérificateur renvoie aujourd'hui des phrases d'erreur ; l'application a besoin de résultats **par ligne** (`{ ligne, gravite, code, message }`) pour écarter ou marquer une ligne, et de messages écrits pour la personne. Les 19 tests existants restent verts ; de nouveaux tests couvrent le classement par ligne. Mode sans profil d'essai : les documents viennent de l'état du module.

**5.4 Rapprochement du second passage.** Chaque ligne « à préciser » porte un `id` (donné par l'application, renvoyé par l'assistant) ; une ligne sans `id` connu ou avec un libellé changé est refusée et reste « à préciser ». Ajout d'une phrase au prompt, à essayer au prochain essai réel.

**5.5 Limites de dépôt.** 3 CV, 2 lettres de motivation, 3 lettres de recommandation (plafond déjà utilisé par la lettre). Plafond de sécurité du message : environ 45 000 caractères ; au-delà, message clair avec le moyen de retirer un document.

**5.6 Identifiants.** Routes `mes-competences-intro` et `mes-competences`, préfixe de fonctions `mesComp`, dossier `modules/mes-competences/`, prompt `prompts/mes-competences.md`, chaîne de sauvegarde `mesCompetences`. Rien ne réutilise `decouverte*`. Les commentaires de `data/metiers.js` et `js/app.js` qui appellent encore l'ancien module « Decouvrir mes competences » sont corrigés au passage (leçon 9.33).

## 6. Plan en étapes (un commit par sous-étape, `npm test` vert avant la suivante)

| # | Étape | Effort | Tests et vérification |
|---|---|---|---|
| 1 | `modules/mes-competences/` : `logique.js` (documents, message, lecture de la réponse, second passage, document, états) et `filet.js` (déplacé, résultats par ligne) + prompt raccourci | haut | Tests Node (fonctions pures), banc d'essai inchangé |
| 2 | Introduction, routes, `index.html`, aide, prompt externe, pastille de la carte et tuile, recherche de l'accueil | moyen | Navigateur (Playwright) : ouverture depuis la carte, retour, « Précédent » |
| 3 | Écran 1 : documents, niveau, état vide | moyen | Navigateur : dépôt simulé, plafonds, raison du bouton |
| 4 | Passage avec l'assistant : généralisation par options | haut | **Rejeu de l'essai de « Un CV, plusieurs métiers » avant puis après**, identique ; puis écran 2 du nouveau module |
| 5 | Écran 3 : relecture, trois gestes, second passage | haut | Navigateur : réponse simulée de chaque assistant du banc d'essai, ligne écartée par le filet, mode sombre |
| 6 | Écran 4 : document, PDF, copie du texte, options | moyen | Navigateur : contenu du document = lignes gardées |
| 7 | Sauvegarde disquette, `recommencer`, reprise (encart « Continuer / Recommencer ») | moyen | `grep` sur tout le dépôt avant de toucher `js/app.js` ; aller-retour sauvegarde / restauration |
| 8 | Lexique (2 fiches), Nouveautés, journal, BRIQUES_COMMUNES, leçons | bas | `node scripts/checkLexique.js` : 0 erreur, 0 avertissement |
| 9 | Essai `mesCompetences` dans `parcours_smoke.js` et passage complet clair et sombre, 0 erreur console | haut | Playwright ; vrai assistant : essai de Denis |

### Séances regroupées par niveau d'effort (règle du 2026-10-01 : une séance, un niveau)

| Séance | Niveau | Étapes | Pourquoi ce niveau |
|---|---|---|---|
| **A** | `[effort : haut]` | 1 (logique pure et filet par ligne) puis 4a (généralisation du passage, rejeu de l'essai de « Un CV, plusieurs métiers » avant et après) | Fonction partagée à changer, algorithme du filet refait |
| **B** | `[effort : moyen]` | 2, 3, 4b (écran « L'assistant » du nouveau module), 7, 8 | Patrons existants, plusieurs fichiers, essai navigateur, aucun choix de conception |
| **C** | `[effort : haut]` | 5 (relecture), 6 (document), 9 (essais complets) | Plus gros morceau d'interface, second passage, essais de bout en bout |

Dépendances respectées : 2 et 3 s'appuient sur 1 ; 4b s'appuie sur 2, 3 et 4a ; 5 s'appuie sur 4b ; 6 sur 5 ; 9 sur tout.

## 7. Ce qui est simple, risqué, imprévu

- **Simple** : introduction, routes, pastille, tuile, aide, recherche, Lexique, Nouveautés, dépôt (patrons existants).
- **Risqué** : la généralisation du passage (brique partagée, quatre passages à ne pas casser) ; le filet par ligne (code neuf, mais la matière est déjà écrite et testée) ; l'écran de relecture (plus gros morceau d'interface).
- **Imprévu constaté** : (a) les mots « mes compétences » de la recherche appartiennent à l'ancien parcours : déplacés (étape 2) ; (b) deux des trois fiches de Lexique prévues existent déjà ; (c) les essais navigateur de l'application s'exécutent par script dans la page : ils sont rejouables ici avec Playwright en ouvrant `index.html` directement.
- **Aucun point bloquant.**

## 8. À relire par Denis plus tard (rien ne bloque le code)

Texte de l'introduction du module (équilibre avec les autres), les deux fiches de Lexique, la phrase de la pastille et de la tuile de la carte.

## 9. Prochaine étape

Étape 1 (logique pure et filet), puis 2 et 3. Je m'arrête après l'étape 4 pour te montrer le résultat réel, sauf si tu me demandes de continuer sans pause.
