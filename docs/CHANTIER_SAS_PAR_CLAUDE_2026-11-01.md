# Chantier : Claude trie les réponses et préremplit le sas, Denis valide (audit du 2026-11-01)

> État : **audit et maquette faits, lots 4a, 4b, 4c et bouton « Relancer » CODÉS le 01/11/2026 (voir TACHES_VALIDEES), reste l'essai réel de Denis.** Historique de l'audit : Maquette cliquable : `docs/MAQUETTE_PROPOSITIONS_DE_CLAUDE_2026-11-01.html` (volet de réglages avec les trois choix, bouton « Copier mes choix »). Prochaine étape : Denis tranche les trois questions, puis inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI et audit complet avant le lot 4a.
> Origine : demande de Denis du 2026-11-01. Un seul parcours efficace et complet. Les prompts existants et les fonctions existantes sont réutilisés, Claude fait le tri, Denis ne fait plus que la validation individuelle dans le sas. Le parcours autonome (écrans actuels) reste, et les deux finissent dans les mêmes sas.

## 1. Ce qui existe (constat sur le code réel)

Il n'y a pas un sas mais plusieurs. Ce sont des fichiers texte que l'application ne lit jamais (`outils/sas/`), vidés un par un par « C'est bon » puis « Enregistrer ». Cet enregistrement passe toujours par `/api/publier` (contrôles, tests, annulation possible, enregistrement Git).

| Sas | Fichier | Alimenté par | Publié vers |
|---|---|---|---|
| Changements du balayage | `outils/sas/changements.sas.txt` (`veilleChangements.js`) | bouton « Verser les changements dans le sas » après lecture de `[BALAYAGE]` (`telechargerBalayage`, page) | `modules/comprendre-le-cadre/contenu/balayage/<mois>.md` |
| Fiches du cadre | `outils/sas/fiches.sas.txt` (`veilleFichesSas.js`), pas encore créé sur disque | `fcAPI.lire` (lit une réponse collée avec blocs `[FICHE]`) puis `fcAPI.importer` | fiches du cadre (types `fiche-champs`, `fiche`) |
| Qui fait quoi (lieux, employeurs, offres, compléments) | `outils/sas/*.sas.txt` (`veilleSas.js`) | collage ou « pont » depuis l'outil de prospection | registres de `modules/mon-territoire/` |
| Mots du Lexique | pas de fichier propre : candidats `lx.cand` | `[LEXIQUE-BRUT]` lu par `lxLireReponse` | type `lexique-nouveau` |

Sans sas : les chiffres (écran d'édition champ par champ, case « J'ai relu », « Enregistrer », type `chiffres-champs`) ; le confronter, le portrait et l'Europe (publication directe de leur digest, types `confronter`, `portrait`, `ue`).

## 2. Chaque prompt de l'onglet « Travailler avec Claude » : sa sortie aujourd'hui

| Prompt | Bloc rendu | Sortie actuelle | Ce que Claude ferait |
|---|---|---|---|
| Veille de la semaine | `[VEILLE-HEBDO]` | simple liste affichée, aucun sas | comparer aux fiches, proposer des mises à jour dans le sas des fiches |
| Balayage (7 messages) | `[BALAYAGE]` | sas des changements, déjà complet | rien à rédiger : seulement brancher « Verser dans le sas » sur les réponses enregistrées |
| Contrôle d'un rayon | `[CONTROLE rayon: ...]` | rapport A JOUR / CHANGEMENT ; pour un changement, l'ancien parcours demande un 2e prompt « Mise à jour » | rédiger la mise à jour (blocs `[FICHE]`), sas des fiches |
| 5 chiffres clés | `[CHIFFRES]` | écran des chiffres, confirmation, publication directe | préparer les changements champ par champ : à auditer dans le détail (`veilleChiffres.js`, 595 lignes) |
| Réseau | `[CONFRONTER]` | digest publié directement | à auditer |
| Lexique | `[LEXIQUE-BRUT]` | candidats, saisie d'un mot, `lexique-nouveau` | proposer les mots : à auditer |
| Portrait, Europe | `[PORTRAIT]`, `[CHIFFRES-UE]` | digests annuels publiés | rare : plus tard |
| Profil des découpes, médecins | aucun bloc propre | pas de lecteur automatique | rare : plus tard |

Les prompts de la deuxième moitié de l'ancien parcours (`assemblerTriage`, `assemblerRegistreTriage`, `assemblerControleSource`, `assemblerLectureChiffres`, `assemblerLectureUe`, vérification des chiffres) ne sont PAS dans l'onglet : Claude les remplace (tri, lecture, comparaison). La vérification contre un document officiel suppose que Denis fournisse le document (Claude ne cherche pas sur le web).

## 3. Contraintes et risques constatés

1. **Les lecteurs de réponses vivent dans la page** (JavaScript du navigateur : `lireBalayage`, `lireChiffres`, `lxLireReponse`...). Claude, dans sa conversation, ne peut pas les lancer. Seul le lecteur du sas des fiches existe aussi côté serveur (`fichesSas.lireReponse`), donc Claude peut le faire tourner pour contrôler ses propositions avant de les donner.
2. **Claude ne doit pas écrire directement dans `outils/sas/*.sas.txt`** : cela contournerait les contrôles (forme, dates, « à vérifier » jamais validable) et l'annulation.
3. Plusieurs conversations travaillent dans ce dépôt (leçon 9.89) : écrire en fichiers séparés et nommés, jamais de `git stash`.

## 4. Conception recommandée (à valider par Denis avant tout code)

Claude écrit ses propositions dans `outils/retours/<jour>/propositions/<catégorie>.md`, dans **le format exact que les lecteurs actuels acceptent** (blocs `[FICHE]`, lignes `[BALAYAGE]`...). L'onglet affiche pour chaque catégorie un bloc « Propositions de Claude » avec un bouton « Verser dans le sas » qui appelle les lecteurs et importeurs existants. Denis valide ensuite dans les fenêtres actuelles (« 6. Les changements du trimestre », « Mise à jour, À valider »). Une seule source de vérité : mêmes lecteurs, mêmes sas, mêmes contrôles pour le parcours rapide et le parcours autonome.

Découpage proposé :
- **Lot 4a** `[effort : moyen]` : balayage vers le sas des changements (simple, reprise de l'existant) ; veille de la semaine et rayons vers le sas des fiches (Claude rédige les `[FICHE]`, contrôle avec `fichesSas.lireReponse`, bouton « Verser dans le sas »). C'est le cœur de la veille légale.
- **Lot 4b** `[effort : haut]` : chiffres clés, réseau, lexique. Pas de sas : il faut d'abord un audit détaillé de chaque lecteur, puis décider si Claude préremplit l'écran existant (Denis confirme) ou si l'on crée un sas.
- **Lot 4c** `[effort : bas]` : portrait, Europe, profil des découpes, médecins (annuels, rares).
- **À part** `[effort : bas]` : bouton « Relancer » sur les cartes inutilisables (message de relance adapté à la cause).

Simple : balayage vers le sas (le sas existe et marche). Risqué : la qualité du format écrit par Claude (d'où le contrôle par le même lecteur) ; le lot 4b (pas de sas). Bloquant : aucun, mais il faut la maquette de l'onglet avant de coder.

## 5. Questions à poser à Denis avant la maquette

1. Où voir les propositions : dans la carte de chaque prompt (le plus simple à suivre) ou dans une section unique « Propositions de Claude » ?
2. Faut-il un bouton unique « Tout verser dans les sas » ou un bouton par catégorie (recommandé : par catégorie, pour garder la main) ?
3. Pour les chiffres, le réseau et le lexique : préremplir l'écran actuel ou créer un sas comme pour les changements ?

## 6. Choix retenus (Denis, 2026-11-01 : « Prenez vos recommandations »)

1. **Propositions dans la carte de chaque prompt** (le lien avec la réponse collée reste visible).
2. **Un bouton par catégorie** (Denis garde la main avant de verser).
3. **Chiffres, réseau, lexique : préremplir l'écran actuel** (aucun nouvel écran à apprendre). Ce volet est le lot 4b, après audit détaillé de chaque écran.

## 7. Inventaire de l'existant avant code (lot 4a)

| Élément | Étiquette | Remarque |
|---|---|---|
| Copier le prompt, ouvrir ChatGPT ou Perplexity, coller la réponse, enregistrement en fichier | GARDÉ | inchangé |
| Détection des réponses inutilisables, passages notés | GARDÉ | inchangé |
| Compteur, bouton « Actualiser la liste » (`tcActualiser`) | ENRICHI | recharge aussi les propositions de Claude |
| Message pour Claude (commence par `/veille`) | ENRICHI | demande à Claude de déposer ses propositions et de les contrôler |
| `.claude/commands/veille.md` | ENRICHI | ajoute l'écriture de `outils/retours/<jour>/propositions/<catégorie>.md` et le contrôle par le lecteur existant |
| Bloc « Propositions de Claude » dans chaque carte (liste, cases, bouton par catégorie, résultat) | NOUVEAU | seule partie visible ajoutée |
| Route de lecture des propositions du jour | NOUVEAU | lecture seule, chemin fixe, comme `/api/retours/lister` |
| Versement : balayage vers le sas des changements | RÉUTILISÉ | `publier` type `changements`, action `importer` (même que `telechargerBalayage`) |
| Versement : fiches (hebdo, rayons) vers le sas des fiches | RÉUTILISÉ | `fcAPI.lire` puis `fcAPI.importer` |
| Écrans de validation (« 6. Les changements », « Mise à jour, À valider ») | GARDÉ | non touchés |
| Chiffres, réseau, lexique | REPORTÉ (lot 4b) | audit des écrans à préremplir |
| Rien supprimé, rien fusionné | | zéro régression fonctionnelle |

Points à confirmer avant code : le format exact des fichiers de propositions (identique à ce que les lecteurs acceptent déjà), et un script de contrôle que Claude lance avant de déposer.
