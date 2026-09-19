# Consolidation du module Bilan / « Analyser ma candidature » - plan d'exécution

**Date : 2026-08-29. Exécution prévue : 2026-08-30 (matin).**

---

## Journal d'exécution (2026-08-30)

---

### >>> OÙ EN EST LE CHANTIER (2026-08-30, fin du « Lot A » + D9) <<<

**FAIT et commité sur `master` (`npm test` 603 + navigateur à chaque bloc) :**

- **Vague 1** (additif) : 1.1 nom, 1.2 page d'introduction, 1.3 Carte 1 enrichie, 1.4 couche 2 des axes.
- **Vague 2** : 2.1 **réduit** (fin de la fenêtre-dans-fenêtre du panneau Candidature du Bilan), 2.2 coquille partagée du choix d'assistant.
- **Vague 3** : 3.2 avancement des corrections sérialisé (DEC-2), 3.6 barre d'étapes 5 pastilles, 3.1 machine à états conteneur `_etatBilan`, 3.4a + **3.4b rapport + choix de correction sur un seul écran** (les 3 cartes toujours visibles sous le rapport, `_etatBilan.agir` retiré, RC-08 préservé), 3.5 (déjà fait avant le chantier), repère « Étape X sur N » des sous-écrans Accompagné.
- **Améliorations D9** : (a) **déjà fait** avant le chantier (buckets « convaincants » avant « à ajuster »/« prioritaires » ; « ce qui donne envie » avant « ce qui peut freiner ») ; **(c)** fiche de synthèse imprimable du bilan (`bilanFicheSyntheseHtml` / `bilanOuvrirApercuFicheSynthese`, patron « Point sur ma situation », bouton en bas du rapport) ; **(d)** 3e état de triage « je ne suis pas d'accord avec ce point » (`bilanEtatIgnore`, libellé de plus, même comportement que « pris connaissance » - décision Denis) ; **(e)** phrase « Votre CV n'est pas vous » en tête de l'intro.
- **Point « fonction 16 »** (`b3b6b3f`) : décision Denis - « Analyser à nouveau » réanalyse le CV **tel qu'il est dans l'application** (comportement actuel), messages de clôture (mode copier) et de confirmation rendus explicites là-dessus.
- **Méthode** (hors module, mais issus de ce chantier) : LECONS Règle 12 (tout choix = reco + bénéfices/risques de chaque option), Règle 13 + `docs/BRIQUES_COMMUNES.md` (une source de vérité, jamais de duplication ; migration au fil de l'eau, copies désactivées avec cadenas, pas de big bang).

**RESTE pour que la refonte du module soit INTÉGRALE - « Lot B », UNIQUEMENT sur maquettes à retravailler ENSEMBLE avant tout code :**

1. **Bloc 3.3 - « Préparer et envoyer » une page dépliante.** Les écrans amont (dépôt CV, « Où en êtes-vous », ciblage offre) - aujourd'hui des fenêtres lancées **avant** tout écran du module par `demarrerBilanCandidatureAvecDepot()` - deviennent des blocs dépliants d'**une** page. Inclut le **bloc 1.5** (écran « Chez l'assistant » : bouton « Rouvrir le site de l'assistant » + phrase, la chaîne naît ici). → **maquette écran par écran à revalider avec Denis avant de coder** (Règle 2bis).
2. **Bloc 2.1 complet - `htmlPanneauCandidature()` unique** (fusion des ~5 collecteurs de contexte de candidature). = dette **B.1** de `docs/BRIQUES_COMMUNES.md`. Inventaire fait ; **maquette du composant unifié à valider** ; sous-étapes minuscules, test **Mon projet + Cohérence + Coécrire la lettre** à chaque commit. Migration des autres modules **au fil de l'eau** ensuite (jamais un big bang).
3. **Bloc 3.4c - restylage `blocEditionCV`** avec `.bloc-depli`, une fois le langage visuel posé par 3.3 / refonte visuelle. `blocERIP` jamais touché (D7).
4. **Refonte VISUELLE de `htmlBilanRapport`** (décision Denis 2026-08-30 : OUI, fait partie du chantier - LECONS Règle 11). Nouvelles couleurs, accordéons `.bloc-depli`, buckets restylés, comme la maquette `MAQUETTE_BILAN_PARCOURS_CONSOLIDE`. **Bloc non planifié à l'origine** ; touche la fonction la plus dense du module (`htmlBilanRapport` + `rendreCarteAxe` + `rendreCarteRecommandation` + rafraîchissement ciblé) → maquette d'abord.
5. **Checklist de non-régression complète (Partie D)** - à passer intégralement après 3.3 / 2.1 complet / 3.4c / refonte visuelle. **Puis `[CLOS]`.** Au 2026-08-30 : `npm test` 603 ✓, `node scripts/checkLexique.js` 0 erreur ✓, sweep navigateur des écrans touchés (intro, rapport + cartes inline + fiche imprimable + 3e état de triage + message fonction 16, barre d'étapes sur les 5 phases, correction libre/copier, 5 sous-écrans Accompagné, repère X/N, chemin Mon projet, `ouvrirFormulaireCoordonneesEntreprise` pour ses autres appelants, `ctHtmlEtapeChoixIA` intacte).

**Point de retour arrière courant : `b3b6b3f`.**

---

**Vague 1 - TERMINÉE (blocs 1.1 à 1.4), un commit par bloc, `npm test` + navigateur à chaque fois.**

| Bloc | Commit | Note |
|---|---|---|
| 1.1 - nom « Analyser ma candidature » | `e87f326` | 3 H1 visibles renommés ; ids / events Umami / noms de fonctions inchangés. |
| 1.2 - page d'introduction `htmlBilanIntro()` | `64f04b6` | Patron `ctHtmlExplication()`. Aiguillage via helper partagé `bilanIntroEnCours(diagnostic)` (pas de diagnostic ET pas de candidature). `demarrerBilanCandidature()` sans candidature atterrit sur l'intro. **Barre d'étapes 5 pastilles + bandeau État 2 : reportés en Vague 3 (décision Denis « intro seule maintenant »).** AIDE_PAGES + Umami `bilan_intro_affichee`. |
| 1.3 - Carte 1 « J'écris avec mes mots » enrichie | `9030e9a` | Par reco (tant que non corrigée) : `extraitConcerne` (« Le passage de votre CV »), pourquoi (observations liées résolues via `bilanResoudreObservations()`), encart ambre `--warning-*` « Un chiffre ou un résultat est attendu ici » depuis `phraseAChiffrer`. Pas le « comment m'y prendre ». |
| 1.4 - couche 2 des axes | `4c71751` | Champ `ceQuOnRegarde` sur chaque entrée de `axeAnalyseRegistry.js` (reformulation §2 du prompt). `bilanCreerDefinitionAxe` expose le champ. `rendreCarteAxe()` l'affiche en tête d'accordéon, même si l'axe est solide. Nouveau test dans `bilanCoherencePrompt1CatalogueAxes.test.js` (603 verts). |

**Bloc 1.5 - REPORTÉ EN VAGUE 3.** Le libellé « Rouvrir l'onglet de l'assistant » n'existe pas dans le code (vérifié : `htmlCollageInstantane`, `htmlBanniereTransitionIA`, `ouvrirFenetreAssistantIA`, variantes Découverte / Cohérence). Le bouton « Rouvrir le site de l'assistant » + sa phrase appartiennent à l'écran 2c « Chez l'assistant » de la maquette, construit au bloc 3.3. Décision Denis 2026-08-30.

---

**Vague 2 - terminée (livrable : bloc 2.1 réduit).**

| Bloc | Commit | Note |
|---|---|---|
| 2.1 - **RÉDUIT** (décision Denis 2026-08-30) : tuer seulement la fenêtre-dans-fenêtre du panneau Candidature du Bilan | `21d4dcd` | Enquête : **5** collecteurs de contexte de candidature se recouvrent (`bilanOuvrirFenetreCandidature`→`contenuModeRecherche(true)`, `ouvrirFormulaireCoordonneesEntreprise`, `bilanOuvrirCiblageOffreEmploi`, `ctOuvrirCollecteComplement`, `blocRechercheCandidature`) - champs et écritures différents, `#1` pilote `dossier.modeRecherche`/`metierCible` qui alimentent Mon projet → Potentiel → génération CV. La **fusion complète en un `htmlPanneauCandidature()` unique** n'est pas un one-commit → **passe dédiée ultérieure** (voir plus bas). Fait ici : quand `typeRecherche==='offre'`, le bloc entreprise/offre/recruteur/couleur s'affiche **en ligne** (`contenuCoordonneesEntrepriseBilanInline()`) au lieu d'ouvrir une 2e fenêtre. Câblage civilité/couleur extrait de `wireObjectifDetails` vers `wireCiviliteEtCouleurRecruteurCandidature()` (partagé, logique inchangée). `ouvrirFormulaireCoordonneesEntreprise` : **non touché**. **Changement de comportement assumé** : le nom d'entreprise n'est plus obligatoire pour valider le panneau du Bilan (entièrement facultatif). `typeStructure` reste hors de ce panneau. Testé navigateur : panneau Bilan, chemin Mon projet, `ouvrirFormulaireCoordonneesEntreprise` pour ses autres appelants ; `npm test` 603. |
| 2.2 - choix assistant unique | **SAUTÉ** (décision Denis 2026-08-30) | Les 2 implémentations du Bilan (`htmlBilanEtapeChoixIA` plein écran + `bilanOuvrirChoixAssistantLot` modale) sont **déjà toutes les deux en version complète** (4 étapes + vidéo + confidentialité, commit `220ba77`). Leur coquille commune ≈ 25 lignes ; le déduplication n'apporte **aucune amélioration visible** pour la personne, contre un vrai coût de re-test des 3 parcours du Bilan. Reclassé en nettoyage interne futur, pas prioritaire. |
| 2.3 - restylage `blocEditionCV` | **REPORTÉ avec / après Vague 3** (décision Denis 2026-08-30) | `.bloc-depli` (la classe visée par D7) **n'existe pas** dans `css/style.css` : c'est une classe de maquette. `.bloc-erip` (45 règles CSS, le vrai style d'accordéon) est partagé par `blocERIP` ET `blocEditionCV`. « Restyler pour matcher la refonte » suppose que le langage visuel de la refonte existe déjà dans l'app - or il n'y est pas encore (seulement dans la maquette). Restyler cette seule fenêtre maintenant la ferait diverger du reste du module non encore refondu. À faire quand les écrans consolidés de la Vague 3 posent ce langage visuel pour de bon. |

**Vague 2 close côté livrable : bloc 2.1 (réduit) uniquement.** 2.2 sauté, 2.3 reporté en Vague 3. Point de retour arrière = `21d4dcd`.

**Passe dédiée future (hors plan actuel) :** fusion complète des ~5 collecteurs de contexte de candidature en un `htmlPanneauCandidature()` unique (voir bloc 2.1 ci-dessus). Inventaire + maquette + découpage sûr requis avant de coder - touche `dossier.modeRecherche`/`metierCible` qui alimentent Mon projet → Potentiel → génération CV.

---

**Vague 3 - blocs 3.6, 3.2, 3.3 faits. Blocs 3.1 et 3.4 = effort dédié restant.**
(3.3 « Préparer » a été implémenté sans attendre la fusion 3.1 : le conteneur `_etatBilan = { correction, assistance, preparer }` suffit, `.preparer` suit le même patron - décision prise en cours de chantier 2026-08-30, l'aiguillage en cascade `if/else` est resté celui validé par Denis.)

| Bloc | Commit | Note |
|---|---|---|
| 3.6 - barre d'étapes 5 pastilles | `193a335` | UNE ligne, `📝 Préparer » 📤 Envoyer » 📄 Rapport » ✏️ Corriger » ✅ Terminé`. Vert sur les faites (`.pastille-etape-action-validee`), halo bleu sur la courante (`.pastille-etape-action-ouverte`, choix A de Denis), chevron courant→suivant qui clignote (`.chevron-pulse`, bornée, `prefers-reduced-motion` OK). Injectée par **un seul `.replace()`** dans `pageBilanCandidature()` (seul re-rendu, LECONS 9.28.1). `bilanIndexEtapeCourante()` mappe sur l'architecture actuelle. Résout le report du bloc 1.2 (l'intro porte la barre, en sourdine). Testé : les 5 phases, 1 ligne à 1100px et 375px. `npm test` 603. |
| 3.2 - `dossier.bilanAvancementCorrection` sérialisé (DEC-2) | `700ea79` | Objet séparé de `_bilanStatutsCorrection` (cache, jamais persisté tel quel - LECONS 9.28.2). Sur `dossier` → sérialisé/restauré automatiquement par la disquette. `bilanEnregistrerAvancementCorrection()` miroir aux 4 points d'écriture ; rehydratation dans `pageBilanCandidature()` ; remise à zéro dans `bilanViderCachesUI()` + `recommencer()` + « Recommencer un nouveau bilan ». Testé : marquer/vider cache/re-rendre → carte encore verte ; save→restore intact. `npm test` 603. |
| 3.5 - clôture unique | **DÉJÀ FAIT** (voir Partie E.2) | `htmlBilanCorrectionCloture()` est déjà l'unique écran de clôture. No-op. |
| 3.1 - machine à états unique | ✅ **DÉJÀ FAIT** (audit code 2026-08-30) | `_etatAgirBilan` / `_etatCorrectionBilan` / `_etatAssistanceBilan` : **0 occurrence** dans le code. Fusionnées dans `_etatBilan` lors d'une session antérieure (« Lot 3.1b »). Le dispatch en cascade `if/else` de `pageBilanCandidature()` est la forme validée par Denis (objet conteneur, pas d'aplatissement `ecran` string). L'estimation « ~60 références » ci-contre datait d'AVANT cette migration. Rien à faire. |
| 3.3 - « Préparer » une page dépliante | **FAIT** `013a0aa` (P1) · `cde5fc0` (P2) · `69e11c1` (P3) · P4 (ce commit) | `htmlBilanPreparer()` : une page, 4 blocs `.bloc-depli` (Votre CV / Relire et masquer / Votre situation / L'offre visée) remplacent la cascade de 2 à 4 modales d'avant-module. `_etatBilan.preparer = { relectureFaite, situationTouchee, cvTexte }` (patron `.correction`/`.assistance`). Aiguillage ajouté dans `pageBilanCandidature()` **et** `brancherEvenementsBilanCandidature()` au même rang (avant `bilanIntroEnCours`). `demarrerBilanCandidatureAvecDepot()` → `bilanEntrerPreparation()`. Corps du ciblage extrait en brique partagée (`bilanCorpsCiblageOffreHTML` / `bilanCablerCiblageOffre` / `bilanLireCiblageOffre`). Modales `bilanOuvrirChoixSituation()` et `bilanOuvrirCiblageOffreEmploi()` retirées (0 appelant). Relecture déplacée dans le bloc 2 → dépôt en `cvDejaRelu:true`. Testé navigateur : 3 entrées (intro / Cohérence transversale / Recommencer), flux complet, clair+sombre, mobile 375, CV déjà présent, situation déjà connue. `npm test` 603. **Modernisation « Choisir l'assistant » + « Coller la réponse » faite le 2026-08-30** : M1 `7293b80` / M2 `8d9f3e0` (`htmlChoixAssistantBilanCorps`) / M3 `13afc93` + M3+ `f12aa48` (`htmlBilanEtapeImportIA`, jetons + « hero » du décompte + repli) / **bloc 1.5** `623b76e` (bouton « Rouvrir le site de l'assistant » phase `ouvert`, câblé sur les 3 parcours) / M4 `f52d81a` (bouton de collage rectangulaire au lieu du rond, tous consommateurs). **Bloc 3.3 + sa modernisation : terminés.** |
| 3.4 - rapport + choix de correction sur un écran (DEC-1) | ✅ **DÉJÀ FAIT** (audit code 2026-08-30) | `htmlBilanAgirChoix` (écran « Agir » plein écran) **retiré** ; les 3 cartes sont rendues dans `htmlBilanRapport` via `htmlFrontiereAgir` (qui appelle `htmlBilanAgirChoixContenu()`, point d'entrée générique — verrou RC-08 préservé). Le bloc **2.3** (fusion `blocEditionCV` + `blocERIP`) : tranché **non** par Denis le 25/08 (D7), Lot 5 a fait un restyle léger. Rien à faire. |

**Point de retour arrière après la partie faite de la Vague 3 = `700ea79`.**

---

Ce document est la **liste de contrôle « rien de perdu »** + le **plan d'implémentation ordonné**.
Base : `docs/INVENTAIRE_FONCTIONNEL_BILAN_CANDIDATURE.md` (17 fonctions, 2026-08-20) rafraîchi, + les ajouts des chantiers Carte 3 / lot / brique commune.

Règle absolue (décision Denis, 2026-08-29) : **côté fonction, zéro régression, zéro perte de choix. Uniquement des ajouts.** Côté code, la fusion des 3 sources d'état est autorisée (plomberie interne). Si une ligne de l'inventaire ne peut recevoir aucune des 4 étiquettes `GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI`, on ne touche à rien tant qu'on n'en a pas parlé.

---

## Décisions validées (2026-08-29)

| # | Décision |
|---|---|
| D1 | Nom à l'écran : **« Analyser ma candidature »** (au lieu de « Bilan de candidature »). |
| D2 | Choix de l'assistant : **écran à part**, juste après « Préparer et envoyer » (= la brique commune). |
| D3 | L'avancement des corrections : **sauvegardé** (survit à un rechargement) - via un objet **séparé** `dossier.bilanAvancementCorrection`, jamais en persistant `_bilanStatutsCorrection` (cf. DEC-2, tranchée A). |
| D4 | Périmètre du 2026-08-30 : **tout**, y compris la fusion des 3 sources d'état (`_etatAgirBilan` / `_etatCorrectionBilan` / `_etatAssistanceBilan`). |
| D5 | Page d'introduction sur le patron Cohérence / Repères ; État 2 = bandeau sur cette même page, pas d'écran séparé. |
| D6 | Rapport : garde son système de couleurs par verdict. **Tout le rapport est en accordéons repliés** (icône + couleur + compte + « cliquez pour ouvrir » qui disparaît à l'ouverture) - priorité charge cognitive, la personne dose ce qu'elle lit. Le choix de correction passe **sous** le rapport, révélé sur place (cf. DEC-1). |
| D7 | « Modifier mon CV » reste une fenêtre. **PAS de fusion** `blocEditionCV` / `blocERIP` (corrigé le 2026-08-30 : le contenu est déjà partagé, seul le chrome diffère, décision Denis 2026-08-25). On **restyle** `blocEditionCV`, `blocERIP` n'est jamais touché. Bloc 2.3 de la Vague 2 devient un simple restylage → **risque supprimé**. |
| D11 | **Jamais redemander ce qu'on sait déjà (Denis, 2026-08-30).** Principe de non-régression du chantier : tout champ est **pré-rempli depuis `dossier`** ; tout écran / alerte de saisie ne s'affiche **que si l'information manque réellement** (déjà le cas : « Où en êtes-vous » sauté si `dossier.objectif` connu ; alertes titre/accroche et coordonnées conditionnelles à `titreManquant` / `!identiteEstComplete()` ; type de structure pré-sélectionné ; poste visé gaté par `posteCibleActuel()`). **Jamais deux formulaires pour la même donnée.** Un seul point de fragilité identifié : l'identité / les coordonnées sont éditables à **2 endroits** dans le Bilan (fenêtre « Mes coordonnées » **et** bloc « Vous » de « Modifier mon CV ») - les deux écrivent `dossier.identite`, donc pas de conflit de données, mais 2 portes pour la personne. → Dans la consolidation : « Mes coordonnées » devient un **raccourci qui ouvre « Modifier mon CV » directement sur le bloc « Vous »** (`bilanOuvrirEditionCV({blocId:'vous'})`, le paramètre `preOuvrir` existe déjà), pas un 2e formulaire. |
| D8 | Panneau Candidature : un seul composant partagé (fusion des ~3 exemplaires). |
| D9 | **Améliorations retenues (2026-08-29)** : (a) « Ce qui est solide » présenté avant « Points à corriger » ; (c) fiche de synthèse imprimable du bilan (patron « Point sur ma situation ») ; (d) 3e état de triage « je ne suis pas d'accord avec ce point » ; (e) phrase « Votre CV n'est pas vous » sur la page d'intro. **a, e** en Vague 1 (intro + réordonnancement) ; **d** en Vague 1 (mécanisme d'ignore existant + 1 état) ; **c** en Vague 1 ou 2 (réutilise un patron existant). |
| D10 | Idée **b** (case « important pour plus tard » → Cohérence de mon dossier) → **PAS ici**. Devient un chantier futur dédié : **« Cohérence entre les modules »** (voir `TACHES_VALIDEES.md`). Bien plus tard. |

---

## Partie A - Inventaire fonctionnel + étiquette de consolidation

Chaque fonction : ce qu'elle fait pour la personne, où elle est aujourd'hui, l'étiquette, la note.

### Entrée et préparation

| # | Fonction | Aujourd'hui | Étiquette | Note |
|---|---|---|---|---|
| 1 | **Dépôt / structuration du CV** (texte, PDF/Word, photo) | `ouvrirAssistantDepotCV()` (`data/metiers.js`), prompt `extraction-cv.md` | **GARDÉ** | Composant partagé. Léger restylage visuel dans la passe brique commune, aucune modif de comportement. |
| 2 | **Vérification / masquage avant envoi** (surlignage tel/email/nom, relecture manuelle, aucune anonymisation auto) | `htmlVerificationDocument()` / `cablerVerificationDocument()` + `relectureConfidentialite.js` | **GARDÉ** | Composant partagé. Écran distinct après « Préparer et envoyer ». Déclencheur vidéo masquage conservé. |
| 3 | **Validation / correction des infos extraites** (par catégories, décocher, corriger) | écran d'import étape 4 du dépôt CV | **GARDÉ** | Inchangé. |
| 4 | **Choix de l'assistant** (sans compte / compte nécessaire + couleurs, 4 étapes « ce qui va se passer », rappel confidentialité, vidéo) | `htmlBilanEtapeChoixIA()` (plein écran) **ET** `bilanOuvrirChoixAssistantLot()` (fenêtre) - 2 implémentations, toutes deux en **version complète** depuis `220ba77` | **FUSIONNÉ** | Un seul composant canonique (la « brique commune »), écran à part (D2). Version complète partout. Raccourci « Continuer avec [assistant mémorisé] » conservé. |
| 4b | **Écran « Où en êtes-vous ? »** (objectif : recherche d'emploi / reconversion / stage / premier emploi) - affiché seulement si `dossier.objectif` inconnu | `OBJECTIF_CHOIX_CANDIDATURE` / `definirObjectifCandidature()` | **DÉPLACÉ** | Devient le bloc « Votre situation » de « Préparer et envoyer ». Même règle « ne pas redemander si déjà connu ». |
| 4c | **Ciblage offre / entreprise / type de structure / site** | `bilanOuvrirCiblageOffreEmploi()` (`data/metiers.js`) + `bilanOuvrirFenetreCandidature()` (`js/app.js`) + `ouvrirFormulaireCoordonneesEntreprise()` (fenêtre dans fenêtre) | **FUSIONNÉ + DÉPLACÉ** | Un seul **panneau Candidature partagé** (D8). Accessible depuis le bloc « L'offre visée » de « Préparer et envoyer » ET depuis l'écran « à compléter » de l'Accompagné. Fin de la fenêtre-dans-la-fenêtre : « Coordonnées entreprise » (civilité + nom recruteur + couleur entreprise) devient une section du même panneau. |

### Diagnostic

| # | Fonction | Aujourd'hui | Étiquette | Note |
|---|---|---|---|---|
| 5 | **Lancement du diagnostic** (CV + métier visé + offre, 10 dimensions, observations déterministes côté app) | `bilanDemarrerDiagnostic()`, prompt `bilan-v1.md` | **GARDÉ** | Inchangé. |
| 6 | **Import de la réponse** (bouton rond, collage auto, confirmation verte, « coller un morceau supplémentaire », mode manuel de secours, message d'échec de lecture + recoller) | `htmlBilanEtapeImportIA()` + `htmlCollageInstantane()` / `activerCollageInstantane()` | **GARDÉ** | Composant partagé. Le texte reste caché + `readonly` en mode normal. Message d'échec de lecture conservé. Seul le libellé « Rouvrir l'onglet » → « Rouvrir le site de l'assistant » (1 chaîne, tous modules). |
| 7 | **Lecture du rapport** : bloc alertes (« Points à corriger avant tout envoi » = titre/accroche non détecté + coordonnées incomplètes, chacun avec « Ignorer pour l'instant » réversible), Synthèse (teintée par verdict), Première lecture du recruteur, Axes (3 accordéons de couleur, chaque axe dépliable), Recommandations, Garder comme Repère, Anonymisation | `htmlBilanRapport()` | **GARDÉ + ENRICHI** | Garde tous ses blocs, ses couleurs, ses accordéons. **Enrichi** : couche 2 (« ce qu'on évalue sur cet axe », texte fixe, présent même si l'axe est solide). Le choix de correction passe **sous** le rapport, même écran (D6). |
| 8 | **Carte de correspondance** (bascule « Voir le raisonnement par attente » sur l'axe Adéquation) | `bilanRenduVueAttentes()` | **GARDÉ** | Inchangé (message dédié si diagnostic ancien sans attentes). |
| 9 | **Garder comme Repère** (bouton sur **chaque axe ET chaque recommandation** → module Repères) | `reperesBoutonAncre()` appelé depuis `htmlBilanRapport()` | **GARDÉ** | Inchangé. Seul pont Bilan → Repères. |
| 9b | **Titre / accroche du CV** dans le rapport (génération dédiée `bilan-titre-accroche.md`, ou saisie) | intégré à `htmlBilanRapport` | **GARDÉ** | Inchangé. |
| 9c | **« J'en ai déjà pris connaissance » / « Revenir sur ce choix »** (triage) - sur **chaque alerte, chaque axe, chaque recommandation** : marque « vu, je ne traite pas maintenant », **réversible**, ne supprime jamais rien, teinte violette ; les points ignorés sont récapitulés plus loin dans le rapport | `dossier.bilanAlertesIgnorees` (drapeau par id) + `bilanCarteIgnorable()` / `bilanAlertesStructurellesCV()` | **GARDÉ** | Inchangé. Sérialisé par la disquette (déjà dans `dossier`). |
| 9d | **Accordéon « CV anonymisé avant l'analyse »** (après les recommandations) : ligne visible « Vos informations personnelles n'ont jamais été envoyées à l'assistant » + détail (masquage volontaire, vérifier sur le CV d'origine) | `htmlAnonymisation` dans `htmlBilanRapport` | **GARDÉ** | Inchangé. |
| 9e | **Accordéon « Garder comme Repère » (explication)** - dit à quoi sert le bouton, pour les personnes qui ne connaissent pas | `htmlGarderCommeRepere` dans `htmlBilanRapport` | **GARDÉ + ENRICHI** | Garder l'accordéon du rapport. **Enrichi** : une phrase « qu'est-ce qu'un Repère ? » sur la page d'introduction (quelqu'un qui arrive frais ne connaît pas le mot). |

### Correction (les 3 cartes)

| # | Fonction | Aujourd'hui | Étiquette | Note |
|---|---|---|---|---|
| 10 | **Générer une proposition pour UNE recommandation** (Prompt 2, `bilan-v2.md`) - depuis le rapport, réutilisé par les cartes 2 et 3 | `bilanOuvrirModaleAmelioration()` / `bilanDemanderAmelioration` | **GARDÉ** | Mécanisme commun de génération. Inchangé. |
| C1 | **Carte 1 « J'écris avec mes mots »** (mode `libre`) : recos une par une, ordre libre, « Corriger » → « C'est corrigé », navigation, fond vert quand traité | `htmlBilanCorrectionLibre()` | **GARDÉ + ENRICHI** | Aucune fonction retirée. **Enrichi** : par reco, afficher le **passage concerné** (`extraitConcerne`), le **pourquoi** (observation / point faible), et le **signal « un chiffre / un résultat est attendu »** (`phraseAChiffrer`, déjà produit par le Prompt 1, aujourd'hui utilisé seulement par la carte 3). Le « comment m'y prendre » (couche 3, prompt) : **plus tard**, pas demain. |
| C2 | **Carte 2 « Aidez-moi à trouver les mots »** (mode `copier`) : sélection des recos → choix assistant du lot (version complète) → copier → coller → propositions, « Reprendre telle quelle » / « Adapter », bouton « Générer une formulation » par carte aussi disponible | `htmlBilanCorrectionCopier()` + `bilanOuvrirSelectionAmeliorationLot()` + `bilanOuvrirChoixAssistantLot()` | **GARDÉ** | La fenêtre « choix assistant du lot » = la brique commune (fonction 4). Sinon inchangé. Le CV n'est jamais modifié par cette voie (la personne copie dans son propre document). |
| C3 | **Carte 3 « Accompagné du début à la fin »** (`_etatAssistanceBilan`) : sous-parcours `preparation-chiffres` (phrases à trous par expérience) → `completude` (panneau Candidature) → `generation` → `relecture` (« après application », Appliquer / Écarter, point par point) ; cas `aucune-automatisation` ; reco de type `structure` → carte de guidage « ouvrir l'atelier CV » (jamais dans le lot) | `htmlBilanAssistance()` + `orchestrationAssistance.js` | **GARDÉ + DÉPLACÉ** | Les 4 temps **restent** (aucun retiré), mais rendus **sur une page** ; la position interne est un repère « X sur 4 » dans le titre de l'écran (jamais une 2e barre). Le cas `aucune-automatisation` et la carte `structure` → conservés à l'identique. |
| ~~11~~ | Correction guidée | **déjà supprimée** le 2026-08-27 (code mort, jamais atteignable) | - | Rien à faire. |
| ~~14~~ | Édition libre du texte du CV entier | **déjà supprimée** le 2026-08-27 (boucle auto-référente) | - | Rien à faire. Le cas « CV sans structure » reste géré dans le mode libre. |

### Fenêtres et fin de parcours

| # | Fonction | Aujourd'hui | Étiquette | Note |
|---|---|---|---|---|
| M1 | **Fenêtre « Modifier mon CV »** (blocs : Titre/accroche, Vous = identité/coordonnées/mobilité/permis/langues, Parcours = formations/certifications, Compléments = loisirs/engagements, Compétences CV ; + bouton « Modifier mes expériences » → `ouvrirFenetreExperiences()`) - ouverte depuis l'écran « Agir » | `bilanOuvrirEditionCV()` + `blocEditionCV()` | **GARDÉ + RESTYLÉ** | **CORRECTION de l'analyse (2026-08-30, lecture du code).** Ce n'est **PAS un doublon à fusionner.** Le CONTENU est **déjà partagé** avec « Mon projet » (mêmes `CONFIG_BLOC_TITRE_ACCROCHE` / `_VOUS` / `_PARCOURS` / `_COMPLEMENTS` / `_COMPETENCES_CV` ; champs et logique de sauvegarde identiques). Seul le **chrome** (habillage : ouverture/fermeture, invite au clic, « des éléments ont été récupérés ») est propre au Bilan - **décision de Denis du 2026-08-25** : une 2e implémentation dédiée plutôt qu'un mode conditionnel sur `blocERIP` (la fonction la plus partagée de l'app), « zéro risque de régression sur Mon projet **par construction** ». `blocEditionCV` **reste dans la fenêtre du Bilan**, ne navigue jamais vers « Mon projet ». → Consolidation : **on ne fusionne pas**, on **restyle** `blocEditionCV` (jetons de couleur, `.bloc-depli`) pour qu'il matche la refonte. `blocERIP` : **AUCUNE ligne touchée**. Risque quasi nul. |
| M2 | **Fenêtre « Mes coordonnées »** (identité : nom, prénom, téléphone, e-mail, civilité, ville) | `bilanOuvrirFenetreCoordonnees()` | **GARDÉ** | Inchangé. Ajout d'une barre « Retour ». |
| 15b | **Carte de correspondance poste / compétences** (fonction 8) et **carte « Votre CV organisé » / « Points à corriger »** de l'écran Agir (liste expériences + boutons Modifier expériences / Mes coordonnées / Modifier mon CV / Organiser mon CV si non structuré) | `htmlBilanAgirChoix()` | **DÉPLACÉ** | Le contenu de l'écran « Agir » (recap CV + les 3 cartes) fusionne dans le bas du rapport (D6). Aucun bouton retiré : « Organiser mon CV » (si CV non structuré), « Modifier mes expériences », « Mes coordonnées », « Modifier mon CV » tous conservés. |
| 16 | **Réanalyser la candidature** (« Analyser à nouveau mon CV » depuis la clôture) | bouton dans `htmlBilanCorrectionCloture()` | **GARDÉ** | Inchangé. **À clarifier avec Denis (hors périmètre demain)** : que réanalyse-t-on quand la personne a corrigé dans son propre document (modes libre/copier) ? Piste notée, pas traitée le 2026-08-30. |
| 17 | **Clôture** (message adapté à ce qui a été fait, « Finaliser et télécharger mon CV » → Atelier CV, « Analyser à nouveau ») | `htmlBilanCorrectionCloture()` **ET** `htmlBilanAssistanceCloture()` - 2 implémentations | **FUSIONNÉ** | Un seul écran de clôture. Les 2 boutons + le texte explicatif conservés. |
| E1 | **Reprendre / Recommencer** à l'entrée (si un bilan existe) | `demarrerBilanCandidature()` (`data/metiers.js`) confirmerAction | **GARDÉ + DÉPLACÉ** | Devient le **bandeau « Vous avez déjà une analyse »** sur la page d'introduction (D5) : « Revoir mon rapport » / « Recommencer ». Même logique, meilleure place. |

---

## Partie B - Ce qui bouge côté code (invisible pour la personne)

1. **Fusion des 3 variables d'état d'écran** `_etatAgirBilan` / `_etatCorrectionBilan` / `_etatAssistanceBilan` → une seule machine à états `_etatBilan = { ecran: '...', ... }`. `pageBilanCandidature()` reste le re-rendu maître ; il aiguille sur `_etatBilan.ecran`.
2. **`_bilanStatutsCorrection` sérialisé** par `sauvegarderSession()` / restauré par `restaurerSession()` + `importerSessionFichierSelectionne()` (D3).
3. **Brique commune** : `htmlBilanEtapeChoixIA` + `bilanOuvrirChoixAssistantLot` → un composant unique ; `blocEditionCV` + `blocERIP` → un éditeur unique ; les ~3 panneaux Candidature → un composant unique.
4. **Nom** : `'Bilan de candidature'` → `'Analyser ma candidature'` dans les chaînes visibles uniquement (pas les ids, events Umami, noms de fonctions).

---

## Partie C - Plan d'exécution ordonné (2026-08-30)

**Méthode : un bloc = un commit, testé (`npm test` + navigateur) avant le suivant. L'additif d'abord (ne peut rien casser), le risqué en dernier, avec un point de retour arrière avant.**

### Vague 1 - Additif pur (aucune régression possible)

| Bloc | Contenu | Test |
|---|---|---|
| 1.1 | **Nom** : `Bilan de candidature` → `Analyser ma candidature` (chaînes visibles). | `npm test` + coup d'œil accueil/rapport. |
| 1.2 | **Page d'introduction** : nouvelle fonction `htmlBilanIntro()` sur le patron `ctHtmlExplication()` (barre d'étapes + accroche + à quoi ça sert + ce qui va se passer + ce que ce module ne fait pas + ce que vous pourrez faire ensuite + toute forme de CV + comment ça se passe + bon à savoir). Bouton « Analyser mon CV ». **Bandeau État 2** si diagnostic existant. Branchée comme premier écran de `pageBilanCandidature()` quand `!diagnostic && !_etatBilan`. | Navigateur : entrée dans le module → intro → bouton → parcours actuel inchangé derrière. Mode sombre. |
| 1.3 | **Carte 1 enrichie** (`htmlBilanCorrectionLibre`) : par reco, afficher `extraitConcerne` (si présent), le pourquoi (observation/point faible résolus), et `phraseAChiffrer` en encart « un chiffre est attendu ici » (si présent). | Navigateur : parcours mode libre, reco avec et sans `extraitConcerne`, reco `impact`/`credibilite` (a une `phraseAChiffrer`) vs autre. |
| 1.4 | **Couche 2 axes** : texte « ce qu'on évalue sur cet axe » ajouté à `axeAnalyseRegistry.js` (une entrée courte par axe, tirée de `bilan-v1.md` §2), rendu dans l'accordéon de chaque axe du rapport. Étendre `tests/bilanCoherencePrompt1CatalogueAxes.test.js` pour garder prompt et code alignés. | `npm test` + navigateur : rapport, ouvrir un axe solide → le bloc est là. |
| 1.5 | **Libellé partagé** : « Rouvrir l'onglet de l'assistant » → « Rouvrir le site de l'assistant » + phrase d'explication (composant `htmlCollageInstantane` / transition, 1 chaîne, bénéficie aux 4 modules). | Navigateur : les 4 modules qui l'utilisent, coup d'œil. |

**→ Commit de fin de Vague 1. Point de retour arrière avant la Vague 2.**

### Vague 2 - Brique commune (touche plusieurs modules → test 4 modules à chaque bloc)

| Bloc | Contenu | Test |
|---|---|---|
| 2.1 | **Panneau Candidature unique** : extraire un composant `htmlPanneauCandidature()` / `cablerPanneauCandidature()` à partir de `bilanOuvrirFenetreCandidature` + la variante Cohérence + `ouvrirFormulaireCoordonneesEntreprise`. Toutes les sections (métier/domaine, offre, type de structure, site, civilité + nom recruteur, couleur entreprise). Écrit dans `dossier.rechercheCandidature`. | Navigateur : Bilan, Cohérence de mon dossier, Mon projet - chacun ouvre le panneau, saisit, valide, la donnée remonte. Fin de la fenêtre-dans-fenêtre. |
| 2.2 | **Choix assistant unique** : un composant canonique (version complète : sans compte/compte + couleurs + 4 étapes + rappel confidentialité + vidéo + raccourci « continuer avec »). Remplace `htmlBilanEtapeChoixIA` et le corps de `bilanOuvrirChoixAssistantLot`. | Navigateur : diagnostic initial (Bilan), lot carte 2, lot carte 3, + page Action / Découverte / Cohérence (non-régression). |
| 2.3 | **Éditeur CV unique** : fusion `blocEditionCV` + `blocERIP`. Restylé. Toutes les sous-sections (exp pro/perso, formations, langues, permis, loisirs, engagements). Reste une fenêtre pour le Bilan. | Navigateur : « Modifier mon CV » depuis le Bilan + l'éditeur de « Mon projet ». Ajout/suppression dans chaque section. |

**→ Commit de fin de Vague 2.**

### Vague 3 - Fusion des états + consolidation des écrans (le morceau risqué)

**État au 2026-08-30 : 3.6 et 3.2 faits (voir Journal en tête de document). 3.5 était déjà fait. 3.1 / 3.3 / 3.4 = un effort dédié restant, décrit juste après ce tableau.**

| Bloc | Contenu | Test | État |
|---|---|---|---|
| 3.1 | **Machine à états unique** : `_etatBilan` conteneur remplace les 3 variables. | - | ✅ **DÉJÀ FAIT** (0 occurrence des 3 anciennes variables, audit 2026-08-30) |
| 3.2 | **`dossier.bilanAvancementCorrection` sérialisé** (DEC-2, option A : objet séparé, jamais le cache `_bilanStatutsCorrection`). | Navigateur : corriger 2 points, sauvegarder (disquette), recharger, restaurer → l'avancement est là. | ✅ `700ea79` |
| 3.3 | **« Préparer »** : une page dépliante (CV / relire-masquer / situation / offre) ; le choix de l'assistant = écran à part juste après. Les écrans amont (dépôt, « Où en êtes-vous », ciblage) sont devenus des blocs de cette page. Relecture/masquage = bloc 2 (plus un écran séparé) → dépôt en `cvDejaRelu:true`. | Testé : 3 entrées, flux complet, clair+sombre, mobile 375, CV préexistant, objectif connu. `npm test` 603. | ✅ `013a0aa`/`cde5fc0`/`69e11c1` + P4. **Reste le bloc 1.5** (« Rouvrir le site de l'assistant », écran « Chez l'assistant ») → avec la modernisation « Choisir l'assistant » + « Coller la réponse ». |
| 3.4 | **Rapport + choix de correction sur un écran** : `htmlBilanAgirChoix` retiré, 3 cartes rendues dans `htmlBilanRapport` via `htmlFrontiereAgir` (RC-08 préservé). Bloc 2.3 : tranché non (D7), restyle léger fait (Lot 5). | - | ✅ **DÉJÀ FAIT** (audit 2026-08-30) |
| 3.5 | **Clôture unique** : `htmlBilanCorrectionCloture` était déjà l'unique écran de clôture (l'Accompagné y arrive via `bilanTerminerAgirVersCloture()`, voir Partie E.2). | - | ✅ **DÉJÀ FAIT** avant ce chantier |
| 3.6 | **Barre d'étapes - UNE seule ligne, 5 pastilles** (décision Denis 2026-08-30 : jamais de barre-en-barre) : `📝 Préparer » 📤 Envoyer » 📄 Rapport » ✏️ Corriger » ✅ Terminé`. **Halo bleu** sur la courante (`.pastille-etape-action-ouverte`, choix A de Denis), **pastille verte** sur les faites (`.pastille-etape-action-validee`), **le chevron courant→suivant clignote** (`.chevron-pulse`, borné, `prefers-reduced-motion` via la règle globale de `style.css`). **Aucune sous-barre.** Injectée par un seul `.replace()` dans `pageBilanCandidature()`. `bilanIndexEtapeCourante()` mappe sur l'architecture **actuelle** (3.1 ne changera pas ce mapping, juste sa lecture). Le repère « X sur 4 » dans le titre des sous-écrans Accompagné : **pas fait ici**, à ajouter avec 3.3. | Navigateur : la barre suit les 5 phases ; le chevron courant→suivant clignote ; 1 ligne à 1100px comme à 375px. | ✅ `193a335` |

---

### >>> Chantier consolidation Bilan : QUASI CLOS (audit 2026-08-30)

**3.1, 3.4 et 3.3 sont faits.** L'audit du code le 2026-08-30 a montré que **3.1 et 3.4 étaient déjà faits depuis une session antérieure** — le plan ne l'avait jamais acté, ce qui a fait croire pendant des semaines qu'un gros chantier restait. Il n'en reste rien :
- 3.1 : `_etatAgirBilan` / `_etatCorrectionBilan` / `_etatAssistanceBilan` = 0 occurrence, tout dans `_etatBilan`.
- 3.4 : `htmlBilanAgirChoix` retiré, 3 cartes dans `htmlBilanRapport`.
- 3.3 « Préparer » : `013a0aa` / `cde5fc0` / `69e11c1` + P4.
- D5a (`fb9346f`) et D5d (`0d05ce3`) faits le 2026-08-30.

**D5b et D5c faits le 2026-08-30** (`d38070b`, `e9bdf12`) :
- **D5b** : plus de boîte de dialogue à l'entrée avec travail en cours → on atterrit sur la page de présentation (mode détour) avec bandeau « Vous avez une analyse en cours » + « Continuer mon analyse » / « Recommencer à zéro » (confirmation + `bilanRecommencerAnalyse()`, reset extrait de `demarrerBilanCandidature`).
- **D5c** : bouton permanent « ⓘ Revoir la présentation » (`bilanBoutonRevoirPresentation()`) en haut à droite de chaque écran de travail ; absent de la présentation elle-même et de l'intro à froid.

**>>> Chantier consolidation Bilan : CLOS. <<<** Plus rien en attente. Point E reporté par Denis jusqu'à la refonte de la page d'accueil.

**Denis 2026-08-30 : ce chantier DOIT être fini** (« on ne peut pas laisser comme ça »). En même temps que 3.1 / 3.4 / le bandeau, traiter ces 4 demandes, toutes liées au même aiguillage :

- **D5a - question à CHAQUE entrée quand un travail est en cours.** Aujourd'hui `demarrerBilanCandidature()` (metiers.js) ne montre le dialogue « Reprendre / Recommencer » **que si une candidature est déposée** (`bilanObtenirCandidature()`). Si la personne est en plein « Préparer » sans avoir encore déposé (drapeau `_etatBilan.preparer` posé, pas de candidature), l'entrée par la Boîte à outils la **ramène directement où elle en était, sans rien demander**. → la garde doit détecter TOUT travail en cours (`_etatBilan.preparer` OU diagnostic en cours/complet OU candidature OU `_etatBilan.correction`/`.assistance`) et proposer **« Continuer là où j'en étais » / « Recommencer à zéro »**. « Recommencer » réutilise le reset déjà écrit (`bilanStoreReinitialiser` + `bilanReinitialiserEtatBilan` + caches). **3.1 seul ne fait PAS ça** - à ajouter explicitement.
- **D5b - bandeau « Vous avez déjà une analyse »** sur la page d'intro (au lieu de la boîte de dialogue). « Revoir mon rapport » / « Recommencer une analyse ». Dépend du dispatch unifié (montrer l'intro alors qu'un diagnostic existe).
- **D5c - bouton persistant « Revoir la présentation du module »**, visible en permanence (en haut à droite du contenu du module ; sur le 1er écran, au-dessus de « Votre CV »). Clic → affiche `htmlBilanIntro()` **sans rien perdre** (nouveau drapeau `_etatBilan.voirIntro`, l'intro rendue quel que soit l'état, avec un bouton « ← Revenir à mon analyse »). Re-clic / bouton retour → on revient exactement où on était.
- **D5d - bouton « Retour » recâblé.** Aujourd'hui `barreNavigation('cv', ...)` → « Retour » va **droit à l'accueil**, en sautant la page de présentation du module. → quand un travail est en cours, « Retour » doit d'abord afficher la page de présentation (`_etatBilan.voirIntro`), et c'est le « Retour » de l'intro qui va à l'accueil. Chaîne : écran de travail → présentation du module → accueil.

Ces 4 points s'appuient tous sur le conteneur `_etatBilan` propre (le travail de 3.1). `_etatBilan.voirIntro` est un drapeau de plus, sur le même patron que `.preparer`.

**Bloc 3.1 - fusion des 3 machines à états.**
- Cible : `_etatBilan = { ecran: '...', ... }` remplace `_etatAgirBilan` (booléen), `_etatCorrectionBilan = {mode, index, confirmationRecoId}`, `_etatAssistanceBilan = {ecran, repartition, etatRelecture, chiffres}`.
- Périmètre : ~60 références dans `js/app.js` + 3 dans `data/metiers.js` (init du dialogue « Recommencer »). Recenser avec `grep -n "_etatAgirBilan\|_etatCorrectionBilan\|_etatAssistanceBilan"`.
- Invariants à ne pas casser :
  - **Ordre d'aiguillage identique** dans `pageBilanCandidature()` ET `brancherEvenementsBilanCandidature()` : correction > assistance > agir > intro > pas de diagnostic > diagnostic complet > diagnostic en cours (LECONS 9.28.1).
  - La clé spéciale `_bilanStatutsCorrection._texteAction` (jamais un id de reco) - ne pas la casser en itérant (LECONS 9.28.5).
  - `rendreCarteAxe` / `rendreCarteRecommandation` (globales hissées) : le rafraîchissement ciblé après « garder comme Repère » / « pris connaissance » ne doit pas casser (LECONS 9.28.6).
  - `bilanIndexEtapeCourante()` (barre 3.6) : adapter sa lecture à `_etatBilan`, garder le même résultat par phase.
  - `bilanViderCachesUI()` / `recommencer()` / metiers.js « Recommencer » : centraliser la remise à zéro de `_etatBilan`, ne plus laisser 3 lignes séparées.
  - `onclickPrecedent` de la barre de nav d'Agir : réécrire la **chaîne évaluée** `"_etatAgirBilan = false; pageBilanCandidature();"` proprement (LECONS 9.28.4).
- Aucun bénéfice visible pour la personne. C'est de la plomberie qui débloque 3.3/3.4.
- Test navigateur exhaustif obligatoire : les 3 cartes (libre / copier / accompagné), tous les sous-écrans Accompagné (`preparation-chiffres` / `completude` / `generation` / `relecture` / `aucune-automatisation`), la clôture, retour arrière depuis chaque écran, + `dossier.bilanAvancementCorrection` (3.2) qui doit toujours se rehydrater.

**Bloc 3.3 - « Préparer et envoyer » une page dépliante** (voir maquette écran 2, `data-vue="envoyer"`). Les écrans amont (dépôt CV, « Où en êtes-vous », ciblage offre) - aujourd'hui des fenêtres modales lancées **avant** tout écran du module par `demarrerBilanCandidatureAvecDepot()` - deviennent des blocs dépliants d'une seule page. Le choix de l'assistant reste un écran à part juste après. Inclut le **bloc 1.5** : sur l'écran « Chez l'assistant » (maquette 2c), bouton « Rouvrir le site de l'assistant » + phrase « sert si le site ne s'est pas ouvert tout seul… ce n'est pas un retour en arrière » (la chaîne n'existe pas encore dans le code, elle naît ici).

**Bloc 3.4 - rapport + choix de correction sur un écran** (DEC-1 option A, tranchée). Le bouton « Choisir comment travailler sur mon CV » **déplie la section des 3 cartes sur le même écran** au lieu d'ouvrir `htmlBilanAgirChoix` en plein. La fonction de rendu des 3 cartes reste **séparée** (verrou RC-08 : `htmlBilanRapport` n'appelle qu'un point d'entrée générique, ne nomme jamais les modes). Concrètement : scinder `htmlBilanAgirChoix` en contenu (les 3 cartes + `blocStructuration` + condition « CV non structuré ») et habillage (son `<h1>`, sa `barreNavigation`) ; quand `_etatBilan.ecran === 'agir'`, rendre `htmlBilanRapport(...)` **puis** le contenu-agir dans la même page. Inclut le **bloc 2.3** : restyler `blocEditionCV` (jetons de couleur, accordéons `.bloc-depli` à créer dans `css/style.css`) une fois le langage visuel de la refonte posé par 3.3/3.4 ; `blocERIP` (Mon projet) jamais touché (D7).

**Après cet effort : la checklist de non-régression complète (Partie D).**

### Si le temps manque

On s'arrête **au dernier commit de fin de vague / de bloc**. Jamais un état à moitié refondu. Vague 1 seule = déjà une amélioration livrable et sûre. Vagues 1 + 2 + (3.6, 3.2) sans 3.1/3.3/3.4 = OK aussi (les 3 variables d'état restent, c'est juste moins élégant). Point de retour arrière courant = `700ea79`.

---

## Partie D - Checklist de non-régression (à passer après l'effort dédié 3.1/3.3/3.4)

- [ ] `npm test` : 603 verts au 2026-08-30 (602 d'origine + 1 test « couche 2 des axes » du bloc 1.4) ; + les tests ajoutés par l'effort dédié.
- [ ] `node scripts/checkLexique.js` : 0 erreur (par sécurité, même si non concerné).
- [ ] **Entrée** : module → page d'intro → « Analyser mon CV ». Avec bilan existant → bandeau « Revoir / Recommencer ».
- [ ] **Sans CV** : dépôt (texte / PDF / photo) → validation des infos extraites → suite.
- [ ] **Avec CV** : entrée directe sans redemander le dépôt.
- [ ] **« Où en êtes-vous »** : affiché si objectif inconnu, sauté sinon.
- [ ] **Offre** : les 4 choix (métier précis / plusieurs métiers / réponds à une offre / cherche un emploi) + le panneau Candidature (offre, entreprise, type structure, site, civilité + nom recruteur, couleur entreprise).
- [ ] **Relecture / masquage** : surlignage tel/email/nom, « Continuer » désactivé tant que non validé.
- [ ] **Choix assistant** : sans compte / compte, couleurs, 4 étapes, rappel confidentialité, vidéo, « continuer avec [mémorisé] ».
- [ ] **Envoi + retour** : bouton rond, collage auto sans texte visible, « morceau supplémentaire », mode manuel de secours, message d'échec de lecture + recoller.
- [ ] **Rapport** : bloc « Points à corriger avant tout envoi » (titre/accroche, coordonnées, « Ignorer pour l'instant » réversible), Synthèse teintée, Première lecture, Axes (3 couleurs, dépliables, + « ce qu'on évalue »), Recommandations, Carte de correspondance (axe Adéquation), titre/accroche.
- [ ] **Garder comme Repère** : bouton présent sur **chaque axe ET chaque recommandation** → crée bien un Repère.
- [ ] **« J'en ai déjà pris connaissance »** : sur alerte, axe, recommandation → teinte violette, « Revenir sur ce choix » réactive, récap des points ignorés plus bas, survit à un rechargement.
- [ ] **Accordéons explicatifs** : « CV anonymisé avant l'analyse » et « Garder comme Repère » (explication) présents après les recommandations.
- [ ] **Page d'introduction** : explique ce qu'est un Repère, mentionne « garder une recommandation comme Repère », mentionne la relecture/masquage avant envoi.
- [ ] **Carte 1** : recos ordre libre, passage concerné + pourquoi + « un chiffre est attendu », « Corriger » → « C'est corrigé », fond vert.
- [ ] **Carte 2** : sélection recos → choix assistant du lot (complet) → copier → coller → propositions, « Reprendre » / « Adapter », « Générer une formulation » par carte.
- [ ] **Carte 3** : Vos chiffres (phrases à trous par expérience) → À compléter (panneau Candidature) → Génération → Relecture (Appliquer / Écarter point par point) ; cas « aucune automatisation » ; reco `structure` → « ouvrir l'atelier CV ».
- [ ] **Modifier mon CV** : fenêtre, toutes les sections (exp pro **et** perso, formations, langues, permis, loisirs, engagements), + Ajouter partout. Même éditeur dans « Mon projet ».
- [ ] **Mes coordonnées** : devient un raccourci vers « Modifier mon CV » (bloc « Vous »), pas un 2e formulaire ; barre Retour.
- [ ] **Rien redemandé** : « Où en êtes-vous » sauté si objectif connu ; alertes titre/accroche + coordonnées seulement si vraiment manquant ; type de structure, poste visé, offre/entreprise pré-remplis depuis `dossier` ; aucun champ à ressaisir deux fois.
- [ ] **Clôture** : message adapté, « Finaliser et télécharger » → Atelier CV, « Analyser à nouveau ».
- [ ] **Sauvegarde** : corriger 2 points → disquette → recharger → restaurer → avancement présent.
- [ ] **Boutons Retour** : présents sur chaque écran et chaque fenêtre.
- [ ] **Mode sombre** : tous les écrans, aucun texte invisible.
- [ ] **Non-régression autres modules** : page Action, Découvrir mes compétences, Cohérence de mon dossier, Coécrire ma lettre - le choix d'assistant et le panneau Candidature partagés fonctionnent.
- [ ] **Français** : accents complets, aucun tiret cadratin, aucun mot « IA » visible, aucune tête de robot.

---

## Partie E - Résultat de l'analyse approfondie du code (2026-08-29, lecture directe de `htmlBilanRapport`, `htmlBilanAgirChoix`, `htmlBilanCorrection*`, `htmlBilanAssistance*`, `bilanOuvrirEditionCV`, `bilanOuvrirFenetreCoordonnees`, clôture)

### E.1 - Divergences trouvées entre la maquette et le vrai code, **corrigées dans la maquette**

| Bloc | Vrai code | Ce que la maquette montrait à tort | Corrigé |
|---|---|---|---|
| **Synthèse** | **Toujours visible**, le rectangle entier prend la couleur du verdict (vert = prêt / orange = à ajuster / rouge = à retravailler). Décision Denis 2026-08-22 : « la couleur ELLE-MÊME porte l'information, jamais cachée derrière un clic ». | Un accordéon replié → **régression d'une décision explicite**. | Oui - toujours visible, bordure + fond verdict. |
| **Première lecture du recruteur** | Accordéon, contenu = texte de projection recruteur (police agrandie) **+ 3 sous-cartes colorées** (Première impression = bleu, Ce qui donne envie = vert, Ce qui peut freiner = ambre). | 3 puces simples. | Oui - projection + 3 sous-cartes. |
| **Analyse par dimension** | Accordéon **ouvert par défaut**, légende 3 couleurs, puis **3 buckets par sévérité côte à côte** (Points convaincants / à ajuster / prioritaires), chaque bucket un sous-accordéon avec compte. | Liste plate de 4 axes. | Oui - 3 buckets par sévérité. |
| **Recommandations** | Accordéon, **groupées par priorité** (haute / moyenne / faible) avec libellé coloré. | Liste plate. | Oui - groupées par priorité. |
| **Frontière Comprendre → Agir** | Bloc de conclusion « Votre diagnostic est terminé. » + bouton « Choisir comment travailler sur mon CV » → écran `htmlBilanAgirChoix` **séparé**. Règle d'architecture verrouillée par Denis : `htmlBilanRapport` appelle **uniquement** `bilanOuvrirAgir()` (point d'entrée générique) - le rapport **ne doit jamais nommer ni connaître les modes de correction**. | Les 3 cartes directement dans le rapport, sans la frontière. | Frontière ré-ajoutée dans la maquette. **Le choix inline vs écran séparé = DÉCISION (voir E.3).** |
| **3 cartes de correction bloquées** | Les 3 cartes sont **désactivées** tant que le CV n'est pas organisé en rubriques (`dossierAStructureExperiences()`) → bouton « Organiser mon CV » d'abord. | Non montré. | Note ajoutée à la maquette. |
| **« Garder comme Repère » + « J'en ai pris connaissance »** | Sur **chaque axe ET chaque recommandation** (pas seulement les recos). | Sur les recos seulement. | Ajouté sur les axes. |
| **Accordéon « Garder comme repère » (explication)** | Titre exact « ⚓ Garder comme repère », texte long. | Titre « Qu'est-ce qu'un Repère ? ». | Aligné sur le vrai titre + texte. |

### E.2 - Confirmations (pas de perte, pas d'incohérence)

- **Clôture** : **déjà unifiée** - il n'existe qu'une `htmlBilanCorrectionCloture()`. Le flux Accompagné y arrive aussi (`bilanTerminerAgirVersCloture()`). Le point « FUSIONNÉ » de la fonction 17 est **déjà fait**, rien à faire. Son texte s'adapte à 3 cas (aucune action / CV modifié dans l'app / formulations copiées seules) - **à préserver tel quel**.
- **« Analyser à nouveau »** : pas d'incohérence. En mode libre/accompagné les corrections sont appliquées à `dossier` → `cvModifieDansERIP` vrai → bouton « Finaliser » + « Analyser à nouveau ». En mode copier, `dossier` n'est pas modifié → message adapté (« une fois ces formulations appliquées dans votre document... »). L'app réanalyse `dossier` tel quel. **Le point « à clarifier » de la fonction 16 est en fait déjà géré** - je le retire des inquiétudes.
- **Écran de clôture** : a déjà « Revenir au rapport actuel » **et** « Accueil » (décision Denis 2026-08-25 : retour + accueil partout). À conserver.
- **`bilanOuvrirEditionCV`** : 5 blocs (`CONFIG_BLOC_TITRE_ACCROCHE`, `_VOUS`, `_PARCOURS`, `_COMPLEMENTS`, `_COMPETENCES_CV`) + bouton séparé « Modifier mes expériences » → `ouvrirFenetreExperiences()` (éditeur partagé, remplace la fenêtre en place, jamais imbriqué). Fenêtre `tresLarge`. Fermeture (croix/Échap) → `pageBilanCandidature()` (rafraîchit la page dessous). **Tout ça à préserver dans l'éditeur unique.**
- **`bilanOuvrirFenetreCoordonnees`** : champs prénom, nom, téléphone, email, adresse, codePostal, ville (`construireChampsIdentiteFenetre()` / `lireChampsIdentiteFenetre()` partagés). Fermeture → `pageBilanCandidature()`.
- **`brancherEvenementsAgirChoix`** : `btnAgirOrganiserCV` → `structurerTexteExistant()` ; `btnAgirModifierExperiences` → `ouvrirFenetreExperiences()` ; `btnAgirModifierCV` → `bilanOuvrirEditionCV()` ; `btnAgirModifierCoordonnees` → `bilanOuvrirFenetreCoordonnees()` ; `[data-agir-carte]` → `assurerCVStructure()` puis `bilanOuvrirModeCorrection('libre')` / `('copier')` / `bilanOuvrirAssistanceFinalisation()`. **Tous ces branchements à recâbler à l'identique dans la vue consolidée.**

### E.3 - DÉCISIONS qui impactent le plan (à trancher avant de finaliser la Vague 3)

#### DEC-1 - La « frontière Comprendre → Agir » : révélation sur place, ou écran séparé ?

**Contexte.** Aujourd'hui le rapport se termine par « Votre diagnostic est terminé » + un bouton qui ouvre un **écran séparé** (`htmlBilanAgirChoix`). Ce cloisonnement est une **décision d'architecture verrouillée par Denis (RC-08)** : `htmlBilanRapport` ne connaît que `bilanOuvrirAgir()`, un point d'entrée générique ; le rapport ne doit **jamais** nommer les modes de correction, pour qu'un futur changement d'Agir ne touche pas une ligne du rapport.

**Importance.** Haute. C'est le point où la consolidation « rapport + choix de correction sur un écran » (D6) rencontre une règle d'architecture. Se tromper ici = soit on casse le verrou RC-08, soit on n'atteint pas la consolidation voulue.

**Options :**
- **A - Révélation sur place** : le bouton « Choisir comment travailler sur mon CV » reste, mais au lieu d'ouvrir un écran, il **déplie la section des 3 cartes juste en dessous, sur le même écran**. Le rendu des 3 cartes reste une fonction séparée (`htmlBilanAgirChoix` quasi inchangée), appelée par la machine à états quand `_etatBilan.ecran === 'agir'` mais rendue **dans la continuité de la page du rapport** (pas de `barreNavigation` intermédiaire, pas de nouvel écran plein). Le verrou RC-08 est **préservé** (le rapport appelle toujours un point d'entrée générique). Zéro saut d'écran ressenti.
- **B - Fusion totale** : `htmlBilanRapport` rend lui-même les 3 cartes. **Casse le verrou RC-08.**

**Ma recommandation : A.** Elle atteint l'objectif de D6 (pas de saut d'écran) **sans** casser une décision d'architecture que Denis a explicitement verrouillée. Le coût est nul (on garde la fonction de rendu séparée, on change juste où/quand elle s'affiche). Je n'ai pas trouvé de meilleure option : B a un vrai coût (dette d'architecture, un futur chantier Agir devra retoucher le rapport), pour un gain nul par rapport à A.

**>>> TRANCHÉ par Denis le 2026-08-29 : option A.**

**Ce qui existe déjà / ce qui est nouveau :**
- **Existe** : le mécanisme « une variable d'état fait afficher un écran plutôt qu'un autre par `pageBilanCandidature()` » (c'est tout le système `_etatAgirBilan` / `_etatCorrectionBilan` / `_etatAssistanceBilan`). `bilanOuvrirAgir()` = `_etatAgirBilan = true; pageBilanCandidature();` → `htmlBilanAgirChoix()` remplace `htmlBilanRapport()`.
- **N'existe PAS** : afficher le rapport **et** les 3 cartes sur une même page continue. Aujourd'hui c'est un remplacement plein écran (soit le rapport, soit l'écran des 3 cartes, jamais les deux ; l'écran des 3 cartes a son propre `<h1>` « Comment souhaitez-vous travailler... » et sa propre `barreNavigation`).
- **Le changement (léger)** : garder le **contenu** de `htmlBilanAgirChoix` (les 3 cartes + `blocStructuration` + la condition « CV non structuré »), lui retirer son habillage de page (son `<h1>`, sa `barreNavigation`), et le rendre **à la suite** du rapport au lieu de le remplacer. Dans la machine à états unifiée : quand `_etatBilan.ecran === 'agir'`, on rend `htmlBilanRapport(...)` **puis** `htmlBilanAgirChoixContenu(...)` dans la même page. `htmlBilanRapport` continue de ne connaître qu'un point d'entrée générique (le bouton « Choisir comment travailler » → passe `ecran` à `'agir'`).

**Impact sur le plan (A) :** bloc 3.4 = « scinder `htmlBilanAgirChoix` en contenu + habillage ; la machine à états rend rapport + contenu-agir ensemble ». Simple, faible risque.

#### DEC-2 - Sauvegarder l'avancement des corrections : conflit avec une décision de 2026-08-22

**Contexte.** D3 (validé par toi le 2026-08-29) : « l'avancement des corrections (3 points sur 5) survit à un rechargement ». **Mais** le code porte une décision inverse, explicite, « VALIDÉE PAR DENIS » le 2026-08-22 (stabilisation Bilan, point 15) : `_bilanStatutsCorrection` est **un cache d'interface**, volontairement vidé à chaque réanalyse (`bilanViderCachesUI()`), « incapable de porter une vérité métier qui doit survivre à une réanalyse ». La seule vérité métier persistée est `dossier.bilanCvModifie` (le CV exportable diffère-t-il de l'origine).

**Importance.** Moyenne-haute. Persister `_bilanStatutsCorrection` tel quel **contredit** une décision que tu as prise, avec une raison précise (un cache ne doit pas devenir une source de vérité).

**Options :**
- **A - Persister un objet séparé et léger** : `dossier.bilanAvancementCorrection = { recoId: 'corrigee' | 'copiee' | 'prise_connaissance', ... }`, sérialisé par la disquette, **remis à zéro à chaque nouvelle analyse** (comme `_bilanStatutsCorrection` aujourd'hui). Sert **uniquement** l'affichage « X points sur Y » et la reprise. `dossier.bilanCvModifie` reste la vérité métier. Pas de contradiction : ce n'est pas le cache d'interface qu'on persiste, c'est un état de progression assumé comme tel.
- **B - Persister `_bilanStatutsCorrection` directement** : plus simple à coder, mais transforme le cache en source de vérité → contredit la décision de 2026-08-22, risque de rouvrir le bug que cette décision avait fermé.
- **C - Ne rien persister** (revenir sur D3) : la progression reste perdue au rechargement, comme aujourd'hui. Le diagnostic, lui, est déjà sauvegardé.

**Ma recommandation : A.** Elle donne ce que tu veux (reprise sans perte de la progression) **sans** rouvrir la décision de 2026-08-22 : on ne persiste pas le cache, on persiste un état de progression dédié, avec la même règle de remise à zéro à la réanalyse. Je n'ai pas trouvé mieux : B est un raccourci qui rejoue un ancien problème ; C n'atteint pas l'objectif.

**Impact sur le plan :** bloc 3.2 dépend de ce choix. Avec A : « créer `dossier.bilanAvancementCorrection`, l'alimenter là où `_bilanStatutsCorrection` est écrit, le lire pour l'affichage + la reprise, le vider dans `bilanViderCachesUI`/à la réanalyse ».

**>>> TRANCHÉ par Denis le 2026-08-29 : option A.** Précision de Denis : une nouvelle analyse dans la même session se déclenche depuis l'entrée du module (accueil → « Bilan » → dialogue « Reprendre / Recommencer », `demarrerBilanCandidature()`). C'est ce dialogue existant qui pilote « nouvelle analyse vs continuer », rien à ajouter là-dessus. Bloc 3.2 : `dossier.bilanAvancementCorrection` (objet séparé), alimenté aux mêmes points que `_bilanStatutsCorrection`, lu pour l'affichage « X sur Y » + la reprise, vidé par `bilanViderCachesUI()` et par « Recommencer ».

### E.4 - Points de fragilité du code actuel (à garder sous les yeux pendant l'implémentation)

1. **`pageBilanCandidature()` est le seul re-rendu** et lit 3 variables + `bilanObtenirDiagnostic()`. La fusion en `_etatBilan` doit garder **exactement** le même ordre de priorité d'aiguillage (correction > assistance > agir > pas de diagnostic > diagnostic complet > diagnostic en cours). Une inversion = un écran qui s'affiche au mauvais moment.
2. **`bilanViderCachesUI()`** est appelé à la réanalyse et vide `_bilanStatutsCorrection` + les propositions. Toute nouvelle persistance doit décider explicitement si elle passe par là (cf. DEC-2).
3. **Les fenêtres se re-rendent la page dessous à la fermeture** (`pageBilanCandidature()` sur la croix) - c'est un correctif récent (alerte structurelle périmée sinon). L'éditeur CV unique et le panneau Candidature unique **doivent garder ce comportement**.
4. **`_etatAgirBilan = false` est posé à plusieurs endroits** (dans le callback des cartes, dans `onclickPrecedent` de la barre de nav, dans `demarrerBilanCandidature`). La machine à états doit centraliser ces transitions, sinon un `ecran` résiduel.
5. **La barre de navigation d'Agir** utilise `onclickPrecedent: "_etatAgirBilan = false; pageBilanCandidature();"` (chaîne évaluée). À réécrire proprement avec la nouvelle machine à états, jamais laisser une chaîne qui référence l'ancienne variable.
6. **`_bilanStatutsCorrection` porte une clé spéciale `_texteAction`** (pas un id de reco) - le code de clôture la filtre explicitement. À ne pas casser en itérant sur l'objet.
7. **`rendreCarteAxe` / `rendreCarteRecommandation` sont des fonctions globales hissées** hors de `htmlBilanRapport` (pour le rafraîchissement ciblé après « garder comme Repère » / « pris connaissance »). Le rafraîchissement ciblé ne doit pas être cassé par la mise en accordéons/buckets.
8. **Deux blocs portent le titre « Points à corriger avant tout envoi »** (`htmlBilanAlertesStructurelles` déterministe + `htmlAlertes` de l'assistant). C'est voulu. Ne pas « dédoublonner » en les fusionnant : sources et logiques différentes.
9. **`blocEditionCV` vs `blocERIP`** : avant de coder le bloc 2.3, **vérifier si `blocERIP` (Mon projet) utilise les mêmes `CONFIG_BLOC_*`** ou des configs différentes. Si différentes, la « fusion » est une harmonisation de 2 jeux de config, pas juste un renommage. (Investigation à faire au début du bloc 2.3, pas une décision de Denis.)
10. **`htmlBilanAgirChoix` bloque les 3 cartes si `!dossierAStructureExperiences()`** + affiche `blocStructuration` (recap « Votre CV organisé » / « Points à corriger » + 4 boutons). Ce recap doit atterrir dans la vue consolidée avec la même condition.

### E.5 - Verdict

**Aucune fonction perdue.** L'inventaire (Partie A) + E.1 + E.2 couvrent tout ce que j'ai lu. Les divergences de maquette sont corrigées.

**2026-08-29 : toutes les décisions sont prises.** DEC-1 = A (révélation sur place), DEC-2 = A (objet séparé), D1-D10 validées. Le plan (Vagues 1-2-3) est **finalisable** - plus rien en attente d'une décision de Denis. Reste, au moment de coder, l'**investigation INV-1** (bloc 2.3 : `blocEditionCV` vs `blocERIP` utilisent-ils les mêmes `CONFIG_BLOC_*` ?) - à faire en début de bloc 2.3, ce n'est pas une décision de Denis.
