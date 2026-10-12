# Essai des prompts « Un CV, plusieurs métiers » : mode d'emploi (2026-10-08)

> Pour Denis. But : voir si les prompts tiennent, jusqu'où (combien de lettres, combien de métiers), et ce qui casse. **Rien n'est branché dans l'application** : on teste seulement avec un assistant en ligne, par copier-coller, comme le fera la personne.

## 1. Ce qui est prêt
- Trois prompts d'essai dans `prompts/` : `ucpm-metiers.md`, `ucpm-accroches.md`, `ucpm-lettres.md` (versions d'essai à corriger selon les résultats).
- Un CV **fictif déjà masqué** (agent d'entretien, trois expériences) et dix métiers d'essai avec chacun un objectif différent (candidature spontanée, offre, stage, alternance, changement de métier, immersion, formation).
- Des fichiers **prêts à coller** dans `docs/essais_prompts_ucpm/` (un fichier = une demande complète, à copier en entier).
- Un vérificateur : `node scripts/essai_prompts_ucpm.js verifier ...` (je le lance pour toi si tu me donnes le fichier ou le texte de la réponse).

**Les fichiers portent leur version dans leur nom** (par exemple `01_metiers_V3.txt`) et le prompt l'indique dans son titre (« VERSION 3 »). À chaque correction du prompt, la version augmente (V4...) : l'ancien fichier n'est jamais écrasé sans changer de nom, et les réponses sont rangées sous le nom de la version essayée (`reponses/01_metiers_V3_chatgpt_1.txt`).

## 2. Comment faire un essai (3 gestes)
1. Ouvrir un fichier de `docs/essais_prompts_ucpm/`, **tout sélectionner, copier**, le coller dans l'assistant (ouvrir une **nouvelle conversation** à chaque essai).
2. Quand l'assistant a fini, **copier sa réponse en entier** et l'enregistrer dans un fichier texte (par exemple `docs/essais_prompts_ucpm/reponses/lettres_10_chatgpt.txt`), ou me la coller dans la conversation.
3. Me dire « vérifie » : je lance le contrôle et je te donne le résultat. Tu relis ensuite quelques textes à la main (voir la grille plus bas).

## 3. Les essais, dans l'ordre conseillé
| N° | Fichier | Ce qu'on cherche à savoir | À regarder |
|---|---|---|---|
| 1 | `01_metiers_V3.txt` | Les métiers proposés sont-ils sensés et tirés du CV ? | « Électricien d'entretien » doit être marqué « À vérifier » (le CV a seulement l'habilitation BS). Aucun métier réglementé. Les deux colonnes sont distinctes. |
| 2a | `02_accroches_V1_5_feminin.txt` puis 2b `02_accroches_V1_5_masculin.txt` | Les accroches changent-elles seulement par les accords ? | Mêmes idées, seuls les accords changent (test de biais de genre). |
| 2c | `02_accroches_V1_9_neutre.txt` | Tient-il à 9 métiers d'un coup ? | Toujours deux accroches par métier, jamais deux accroches identiques. |
| 3a | `03_lettres_V1_3.txt` | Trois lettres : la qualité de base | Chaque lettre suit bien son objectif (spontanée, offre, stage). |
| 3b | `03_lettres_V1_5.txt` | Cinq lettres (le plafond prévu à l'origine) | Mêmes critères. |
| 3c | `03_lettres_V1_10.txt` | **Dix lettres dans UNE réponse : le vrai test** | Réponse complète ? Lettres encore distinctes à la fin ? Longueur qui diminue vers la fin ? |
| 4a | `04_offres_V2_2.txt` | La recherche d'offres marche-t-elle ? | Sur **Perplexity sans compte**, puis sur **ChatGPT avec la recherche web activée** : réponse utile, avec des sources et des dates, « non trouvé » sinon. |
| 4b | `04_offres_V2_6.txt` | Même chose avec 6 métiers | Idem. |

Refaire chaque essai sur **deux assistants différents** (par exemple ChatGPT et Gemini ou Claude) : un prompt qui ne tient que sur un seul n'est pas fiable.

## 4. Comment lire les résultats
- **« JSON coupé »** : l'assistant s'est arrêté avant la fin. C'est LE signal que le nombre de lettres ou de métiers est trop grand pour une seule demande. Noter le nombre où ça casse.
- **Lettres de plus en plus courtes** : l'assistant s'essouffle. Avec dix lettres, regarder les trois dernières.
- **Lettres qui se ressemblent** (le vérificateur donne un pourcentage) : danger, la personne enverrait dix fois la même lettre.
- **Mots absents du CV** (diplôme, titre) : invention possible, à relire.
- **Formules d'assistant** (« passionné », « fort de »...) : à corriger dans le prompt.

## 5. Ce que chaque résultat décide
| Si... | Alors... |
|---|---|
| Dix lettres passent proprement | On garde « tout en un seul prompt » (ta demande). |
| Ça casse entre 6 et 9 lettres | Découpage automatique en deux demandes au-delà d'un seuil, ou lettres un peu plus courtes. |
| Ça casse dès 5 | On revient à 5 lettres par demande (à te présenter, ce n'est plus « un seul prompt »). |
| Perplexity gratuit refuse la demande d'offres | Perplexity reste conseillé avec compte ; sinon ChatGPT avec recherche web (le texte de l'application ne dira pas « sans compte »). |
| Les métiers proposés sont faibles ou inventés | On resserre le prompt 1 (sources dans le CV, interdits, nombre) avant de continuer. |

## 6. Notes
- Le CV de test est fictif : pour un essai plus fiable, **ajouter 2 ou 3 vrais CV masqués** de personnes différentes (autre secteur, peu d'expérience, reconversion). Dire à Claude les fichiers : il adaptera le générateur (`node scripts/essai_prompts_ucpm.js generer`, données en haut du script).
- Ne jamais coller un vrai CV non masqué dans un assistant.
- Les résultats bruts sont à garder (dossier `docs/essais_prompts_ucpm/reponses/`) pour comparer après chaque correction du prompt.
- Étapes suivantes selon les résultats : corriger les prompts, relancer les essais, puis (autre compte) bloc B2 du plan `docs/PLAN_IMPLEMENTATION_UN_CV_PLUSIEURS_METIERS_2026-10-08.md`.
