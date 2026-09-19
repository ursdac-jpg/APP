# Module Regard extérieur — Architecture technique

**Statut** : reconstruction complète terminée et vérifiée en navigateur de bout en bout (choix assistant, décompte/ouverture/repli, collage, JSON 1er passage en vue d'ensemble + vue par catégorie, sélection de catégories, formulaire de questions groupé, JSON 2e passage). Reste à confronter au comportement réel d'un vrai assistant IA (pas seulement des JSON simulés) une fois en usage. La conception (pourquoi, quoi) vit dans `docs/CHANTIER_REGARD_EXTERIEUR_IA.md` — ce document ne couvre que le comment, et documente ici la reconstruction, pas seulement la version d'origine.

---

## Historique : pourquoi une reconstruction complète

La première implémentation (bouton simple, lien `<a target="_blank">`, format à balises `[[REVIENT]]`, 3 prompts avec un aller-retour dédié pour les questions de clarification) fonctionnait mais a révélé deux problèmes lors d'un test utilisateur réel par Denis :
1. **Rupture de continuité** : une fois sur la plateforme IA (testé avec Gemini), rien ne rappelait à la personne qu'elle devait revenir dans ERIP — la plateforme externe se comporte comme une destination finale, pas une étape.
2. **Incohérence avec le reste d'ERIP** : le Parcours Découverte avait déjà un mécanisme de transition plus abouti (décompte automatique, repli manuel si pop-up bloqué, catégorisation Sans compte/Compte nécessaire) que ce module n'utilisait pas.

Décision prise avec Denis : réutiliser au maximum les briques déjà partagées plutôt que maintenir une variante propre à ce module, et passer du format à balises au JSON (jugé plus explicite pour la personne : un bloc JSON signale clairement « ceci doit être rapporté dans ERIP », contrairement à une réponse conversationnelle qui se suffit à elle-même). L'architecture est aussi passée de 3 prompts à 2 : les questions d'approfondissement sont désormais produites dès le 1er passage, organisées par catégorie de Repère — plus d'aller-retour dédié pour les obtenir.

## Principe directeur (inchangé)

Ce module **n'est pas une extension de Repères**. Repères reste exactement ce qu'il est : minimal, ignorant de tout le reste du dossier. Regard extérieur est une brique séparée, qui *lit* `dossier.reperes` comme n'importe quel autre consommateur. Aucune ligne de `modules/reperes/` ne connaît l'existence de Regard extérieur, hormis le point d'extension générique `#reperesZoneRegardExterieur` (une ancre vide, symétrique à `app`/`#btnJournalParcours`) et `reperesLibellesTypes()` (façade publique de la taxonomie des types).

**Toujours le premier module d'ERIP qui n'écrit rien dans `dossier`.** Lecture seule — cohérent avec la persistance éphémère de la conception.

## Dépendances externes

| Dépendance | Nature | Justification |
|---|---|---|
| `dossier.reperes` (lecture seule) | Donnée | Le sujet même de la brique. Jamais modifié. |
| `dossier.metierCible`, `dossier.secteurCible` (lecture seule) | Donnée | Cadrage minimal de situation, jamais l'entreprise visée. |
| `#reperesZoneRegardExterieur` (ancre DOM) | Structure transversale | Point d'extension déclaré par Repères. |
| `naviguerVers()` (appel entrant) | Orchestration | `app.js` appelle `regardExterieurApresNavigation()`, jamais l'inverse. |
| `reperesLibellesTypes()` (`modules/reperes/index.js`) | Façade publique | Taxonomie des catégories de Repères, jamais une copie locale qui pourrait diverger. |
| `echapperAttribut()`, `trackEvenement()` | Utilitaires transversaux | Déjà justifiés ailleurs dans le projet. |
| `ASSISTANTS_IA`, `ASSISTANTS_SANS_COMPTE_IA`, `lignePastillesAssistantsIA()`, `stylePastilleInline()` (`js/app.js`) | Briques génériques du choix d'assistant | `ASSISTANTS_SANS_COMPTE_IA`/`lignePastillesAssistantsIA()` ont été extraites lors du chantier « alignement Découverte » précisément pour accueillir un 2e (puis ce 3e) consommateur — voir `docs/CHANTIER_DECOUVERTE_ALIGNEMENT_IA.md`. Regard extérieur écrit sa propre liste de « ce qui va se passer » (`_REGARD_EXTERIEUR_ETAPES_DETAIL`) et son propre attribut `data-assistant-regard-exterieur` : l'étape « choisir un assistant » reste, comme documenté par le chantier d'origine, non entièrement générique (chaque consommateur écrit son propre contenu et sa propre disposition de clic), seules les listes de données et le rendu des pastilles sont partagés. |
| `htmlBanniereTransitionIA()`, `_etatTransitionIA` (`js/app.js`) | Mécanique de transition partagée | **Nouveau dans cette reconstruction** : même décompte automatique, même repli manuel en cas de blocage pop-up, que Bilan CV/Action/Découverte. Adapté à `ouvrirFenetreERIP()` (modale) plutôt qu'à un wizard ou un accordéon inline : le garde-fou « l'écran est-il toujours affiché ? » vérifie `document.body.contains(fenetre)` (la référence à l'overlay retournée par `ouvrirFenetreERIP()`), jamais une classe CSS (voir « Bug trouvé » ci-dessous). |
| `ouvrirFenetreERIP()`/`fermerFenetreERIP()`, `htmlCollageInstantane()`/`activerCollageInstantane()`, `copierTexteVersPressePapier()`, `promptCache()` (`js/app.js`) | Utilitaires transversaux confirmés génériques | Inchangés depuis la version d'origine. |
| `extraireBlocJSONDepuisTexte()`, `normaliserTexteIA()`, `normaliserListeTextesIA()` (`js/app.js`) | Extraction/normalisation JSON | **Nouveau** : même outil déjà éprouvé par le Bilan CV et la Lettre (gère bloc de code ```json```, texte parasite avant/après, guillemets typographiques, virgules superflues, valeurs sans guillemets) — jamais réinventé ici. |

## Bug trouvé et corrigé pendant la vérification navigateur

Le garde-fou initial de `_regardExterieurOuvrirAttente()` vérifiait `document.body.contains(fenetre) && fenetre.classList.contains('visible')`. La classe `'visible'` n'est ajoutée qu'au `requestAnimationFrame` suivant l'ouverture (`ouvrirFenetreERIP()`), pas garanti synchrone selon le contexte de rendu — un test en navigateur a montré le décompte bloqué indéfiniment à 0 sans jamais basculer vers l'ouverture ou le repli manuel. Corrigé en ne vérifiant que `document.body.contains(fenetre)`, aligné sur le patron déjà éprouvé de Découverte/Bilan CV (qui ne vérifient jamais de classe CSS, seulement la présence dans le DOM).

## Format d'échange : JSON, à 2 passages

**1er passage** (`prompts/regard-exterieur.md`) — un seul appel IA produit trois volets à la fois :
1. Une **vue d'ensemble** transversale (`vueEnsemble.ceQuiRevient/ceQuiAEvolue/questionsAPoser/deQuoiParlerAvecVotreCIP`) qui croise les Repères sans tenir compte de leur catégorie.
2. Une **vue par catégorie** (`vueParCategorie.question/idee/approfondir/discuter`, clés identiques à `_REPERES_TYPES`) : pour chacune, un texte `ceQuiRessort` qui ne doit **jamais** être une reformulation de la vue d'ensemble — strictement propre aux Repères de cette catégorie.
3. Pour chaque catégorie, entre 0 et 5 **questions d'approfondissement déjà préparées** (`questionsApprofondissement`, chacune `{ question, choix: [...] | null }`), suivant la même méthode de sélection (« la réponse changerait-elle vraiment quelque chose ? ») que l'ancien prompt de clarification, désormais fondue dans le prompt principal.

**2e passage** (`prompts/regard-exterieur-approfondissement.md`), déclenché seulement si la personne choisit d'approfondir une ou plusieurs catégories et répond à leurs questions — reçoit le 1er JSON complet (stringifié) + les catégories choisies + les réponses groupées par catégorie + les Repères. Produit le même type de `vueEnsemble` (transversal, peut relier des réponses venues de catégories différentes) mais une `vueParCategorie` simplifiée : un texte direct par catégorie (`question`/`idee`/`approfondir`/`discuter`, chaîne vide si non approfondie), plus de nouvelles questions à ce stade — c'est la dernière étape.

**Parsing** (`_regardExterieurAnalyser1erPassage()`/`_regardExterieurAnalyser2ePassage()`) : `extraireBlocJSONDepuisTexte()` + normalisation locale champ par champ, tolérante à un champ manquant ou mal formé (retombe sur une valeur neutre plutôt que de faire échouer tout le parsing) — jamais un `JSON.parse()` nu.

## Flux complet (résumé)

1. Bouton visible dès 3 Repères (`_REGARD_EXTERIEUR_SEUIL`), avec un texte explicatif (« Avec votre accord... ») ajouté lors de cette reconstruction pour rendre la fonctionnalité compréhensible sans avoir à cliquer dessus pour le découvrir.
2. `_regardExterieurChoisirAssistant()` — fenêtre catégorisée Sans compte/Compte nécessaire + stepper « Ce qui va se passer », même disposition que Découverte.
3. `_regardExterieurCopierPuisAttendre()` — copie presse-papiers puis pose `_etatTransitionIA` (phase `decompte`, 5 secondes) et ouvre l'écran d'attente.
4. `_regardExterieurOuvrirAttente()` — rend `htmlBanniereTransitionIA()` (décompte → ouverture automatique OU repli manuel si bloqué → confirmation « Je suis de retour ») + le widget de collage + un bouton **Importer** dédié (le collage automatique affiche juste une confirmation, ne traite jamais seul — cohérent avec le patron de Découverte, où un bouton explicite déclenche toujours le traitement, qu'il s'agisse d'un collage auto ou manuel).
5. `_regardExterieurTraiterReponse1erPassage()` — parse le JSON, affiche la bascule vue d'ensemble/vue par catégorie (`_regardExterieurRenduToggleVues()`), affiche « Aller plus loin » seulement si au moins une catégorie a des questions préparées (sinon, le clic affiche directement le message honnête d'absence de piste, sans aller-retour IA supplémentaire pour le découvrir — amélioration directe permise par le nouveau JSON, qui connaît déjà cette information).
6. `_regardExterieurLancerApprofondir()` → `_regardExterieurOuvrirSelectionCategories()` — cases à cocher, une par catégorie disposant de questions, avec leur compte affiché.
7. `_regardExterieurOuvrirFormulaireQuestions()` — questions groupées visuellement par catégorie choisie, même formulaire hybride (choix guidés + précision facultative, ou texte libre) qu'avant.
8. `_regardExterieurLancerApprofondissementFinal()` — même cycle copie/attente/collage que le 1er passage, réutilise l'assistant déjà choisi.
9. `_regardExterieurTraiterReponseApprofondissement()` — même bascule de vues, sans bouton « Aller plus loin » cette fois (dernière étape).

## Suivi Umami

| Événement | Données | Changement par rapport à la version d'origine |
|---|---|---|
| `regard_exterieur_seuil_atteint` | — | Inchangé. |
| `regard_exterieur_ouvert` | — | Inchangé. |
| `regard_exterieur_assistant_choisi` | `{ assistant }` | Inchangé. |
| `regard_exterieur_reponse_recue` | `{ mode, formatReconnu, categoriesAvecQuestions, longueur, dureeSecondes }` | `rubriques` (balises) remplacé par `categoriesAvecQuestions` (compte). |
| `regard_exterieur_texte_copie` | — | Inchangé. |
| `regard_exterieur_erreur_collage` | — | Inchangé. |
| `regard_exterieur_popup_bloque` | — | **Nouveau**, même patron que `bilan_popup_bloque`/`action_popup_bloque`/`decouverte_popup_bloque` — mesure combien de navigateurs bloquent l'ouverture automatique, accepté comme compromis conscient en reprenant ce mécanisme. |
| `regard_exterieur_approfondir_ouvert` | — | Inchangé. |
| `regard_exterieur_approfondir_categories_choisies` | `{ nombreCategories }` | **Nouveau**, remplace `regard_exterieur_approfondir_questions_recues`/`_aucune_question` (l'aller-retour IA séparé qu'ils mesuraient n'existe plus). |
| `regard_exterieur_approfondir_reponses_envoyees` | `{ nombreReponses }` | Inchangé dans l'intention (total désormais calculé sur l'ensemble des catégories choisies). |
| `regard_exterieur_approfondir_reponse_recue` | `{ formatReconnu, longueur }` | `rubriques` retiré (n'a plus de sens avec le JSON à 4 clés fixes). |
| `regard_exterieur_approfondir_texte_copie` | — | Inchangé. |

**Événements supprimés** : `regard_exterieur_approfondir_questions_recues`, `regard_exterieur_approfondir_aucune_question` — l'étape séparée de clarification qu'ils mesuraient n'existe plus (fondue dans le 1er passage). Aucune configuration à faire côté Umami pour ce changement : `trackEvenement()` n'est qu'un appel direct à `umami.track()`, sans registre local (voir `js/app.js:24`) ; les anciens noms cessent simplement d'apparaître, les nouveaux sont découverts automatiquement.

## Prompts

`prompts/regard-exterieur.md` et `prompts/regard-exterieur-approfondissement.md` — réécrits pour le JSON, mais les règles analytiques (convergence, traçabilité, jamais de recommandation, distinction observation solide/hypothèse/point trop peu étayé...) restent identiques à la version à balises, mot pour mot. `prompts/regard-exterieur-clarification.md` **supprimé** : sa méthode de sélection des questions (le test « la réponse changerait-elle vraiment quelque chose ? », les 4 étapes de tri) a été intégralement reprise dans `regard-exterieur.md`, appliquée séparément à chacune des 4 catégories.

## Typographie

Reconstruction de `regardExterieurCSS.css` avec le socle discuté avec Denis suite à un retour terrain sur la lisibilité de Repères : texte de travail à 1rem minimum (16px), jamais en dessous de ~0.85rem même pour le texte secondaire, boutons visant ~44px de hauteur cliquable.

## Façade publique

Inchangée : `regardExterieurApresNavigation(route)`, seule fonction exposée, appelée par `js/app.js`.

## Persistance

Aucune. `dossier` n'est jamais modifié par ce module.
