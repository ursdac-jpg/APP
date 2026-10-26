# Synthèse des réponses des autres plateformes : « Découvrir mes compétences »

Créé le 26/10/2026. Sources : réponses de Perplexity, ChatGPT, Gemini, DeepSeek et Copilot aux 7 messages de `docs/PROMPTS_AUTRES_IA_DECOUVRIR_COMPETENCES_2026-10-26.md`. Les textes bruts ne sont pas recopiés ici (très longs) : seul le tri est gardé. Rien de ce qui suit n'est un fait vérifié tant qu'il n'a pas été ouvert à la source (circuit de veille habituel).

## 1. Fiabilité des cinq réponses

| Plateforme | Verdict | Pourquoi |
|---|---|---|
| Perplexity | **La plus solide** | Liens, distinction nette entre faits sourcés et prudence, signale ses incertitudes. |
| DeepSeek | Bonne, avec réserves | Très complète et honnête sur ses limites, mais appuie des points sur des sources secondaires douteuses (un site marocain de recrutement, une méta-analyse citée de mémoire) et ajoute un contexte juridique d'employeur peu utile ici. |
| ChatGPT | Bonne mais incomplète | Sérieuse, prudente, a refusé de bâcler les 20 compétences (livrées en partie seulement). |
| Copilot | Moyenne | Pas de liens, sources vagues, « ROME : licence pas explicite » alors que les quatre autres disent Licence Ouverte, passeport attribué à tort à France compétences / Pôle emploi, anglicismes dans son contenu. |
| Gemini | **À manier avec méfiance** | Plusieurs sources semblent inventées (« Haute Autorité du Travail et de l'Insertion », « Référentiel national des compétences transversales » du ministère, « Référentiel national d'évaluation des compétences comportementales » de l'AFPA, « Chafep / CNLRQ »), coquilles révélatrices (« doucheuse », « D,brouillard », « un collégien est débordé », « polémique » pour « politesse »), sa liste de savoir-être contient des adjectifs de personnalité (« souriant », « dynamique », « positif ») qu'elle interdit elle-même. |

**Règle** : aucune source citée n'entre dans l'application sans être ouverte. Les noms suspects de Gemini ne sont repris nulle part.

## 2. Ce sur quoi les cinq convergent (à retenir)

1. **Chaque compétence est reliée à une preuve** : l'extrait du document qui l'a fait relever, avec son origine (CV, lettre de motivation, lettre de recommandation). Sans extrait, pas de compétence.
2. **Trois niveaux de confirmation**, jamais un score :
   - « Confirmée par vos documents » (au moins deux sources indépendantes, ou une source claire que la personne confirme) ;
   - « Relevée dans un document » (une source claire) ;
   - « À préciser avec vous » (indice partiel : une question est posée, rien n'est affirmé).
3. **La personne décide** : trois gestes pour chaque ligne, « C'est exact », « C'est en partie exact », « Je retire ».
4. **Jamais « vous êtes »** : on décrit un fait (« Votre CV indique que vous avez préparé 80 commandes par jour »), pas un trait. L'adjectif (« rigoureux », « dynamique ») est remplacé par un fait observable ; sans exemple, la formule n'est pas retenue.
5. **Motivations et projet à part** : jamais présentés comme une compétence à valider, uniquement à partir d'une phrase écrite par la personne ou d'une réponse qu'elle donne.
6. **Données sensibles ignorées** (santé, détention, origine, âge, situation familiale, etc.) : retirées avant l'analyse, jamais reprises. Déjà acquis dans l'application (`prompts/decouverte-competences.md`, section « Retrait systématique du contexte de vie personnel »).
7. **Lettres de recommandation** : on retient les faits sur la personne, jamais les coordonnées du signataire ; la personne confirme qu'elle a le droit de déposer la lettre.
8. **Oral en quatre questions** (situation, ce que je devais faire, ce que j'ai fait, ce que ça a changé), résultat qualitatif accepté (pas besoin de chiffre), trois niveaux de sincérité : « je sais faire seul », « je sais faire avec un accompagnement », « je suis en train d'apprendre ».
9. **Parcours interrompu** : phrase courte et factuelle, jamais « trou », jamais d'excuse, aucune justification intime demandée.
10. **Rien de comparable n'existe pour ce public** : les dispositifs (bilan, VAE, passeport, Pix, badges, portfolios) décrivent ou certifient, mais **aucun n'explique simplement pourquoi une compétence a été relevée ni comment la dire à l'oral**. C'est la place de l'outil.

## 3. Ce qui est utile et nouveau pour nous

- **Plafonner la formulation à ce que les documents prouvent** (ChatGPT) : pour « préparation de commandes », écrire « organiser son travail », pas « piloter l'organisation ». Le niveau du poste règle le vocabulaire, jamais au-dessus de la preuve.
- **Liste de mots creux ou prétentieux par niveau** (Perplexity, Gemini, DeepSeek) : « leadership », « stratégique », « excellence », « synergie », « agilité », « proactivité », « résilience », « dynamique », « passionné ». À mettre dans le prompt comme interdits, avec l'alternative concrète.
- **Phrases que l'application ne doit jamais écrire** (listes concordantes) : « vous êtes résilient / introverti / fait pour ce métier / un leader », « vous manquez de confiance ».
- **Ne pas inventer à partir d'un intitulé** : « agent d'entretien » ne prouve pas « minutieux ». Un intitulé sans mission donne une **question**, pas une compétence.
- **Questions de précision** à la place des déductions (modèle déjà dans notre prompt : « Questions ciblées »).
- **Document final séparé en sections** : ce que mes documents montrent / ce que je peux en dire / ce qui me donne envie / où je veux aller.
- **Cartes d'écran** : extrait du document, compétence, niveau de confirmation, façon de le dire, question d'entretien (Copilot, ChatGPT, Gemini).

## 4. Ce qu'il faut écarter ou adapter

- **Les réponses modèles fictives** (« Dans mon ancien poste d'agent d'entretien, je devais… ») : risque que la personne les récite. Chez nous, la phrase à dire est construite à partir de **l'extrait réel** de la personne, jamais d'un exemple fictif.
- **Importer les référentiels entiers** (ROME, ESCO : environ 14 000 compétences pour ESCO) : trop lourd, risque de jargon. **Version 1 : notre catalogue de 79 compétences (`data/competences.js`) enrichi**, le ROME et ESCO seulement comme inspiration. Si on reprend un jour leurs données : ROME sous Licence Ouverte (mention de la source), ESCO avec mention obligatoire de la Commission et version modifiée signalée. À vérifier à la source avant.
- **Compétences psychosociales (Santé publique France)** : cadre pensé pour la prévention (enfants, jeunes, parents), pas pour évaluer des adultes. Usage possible comme **vocabulaire** de comportements observables, jamais comme grille. Cohérent avec notre règle « jamais de diagnostic ».
- **Blocs de compétences du RNCP** : réservés à un éventuel lien avec les diplômes, pas structure de l'outil.
- **Remarques juridiques d'employeur** (règlement européen sur l'intelligence artificielle, recrutement à haut risque, article 22 du RGPD) : concernent un outil qui trie des candidats pour un employeur. **Le nôtre est utilisé par la personne pour elle-même**, sans note ni classement. Point à garder : transparence et contrôle par la personne. Dates de ces textes **à ne pas citer** (les réponses divergent).
- **Remarques sur serveurs, comptes, suppression automatique** : notre application est statique, **sans serveur ni compte**. Piège : plusieurs réponses disent « vos documents restent sur votre appareil ». **Faux dans notre cas** dès que la personne copie un message vers l'assistant en ligne de son choix : le texte part chez lui. Le message d'avertissement devra le dire honnêtement (voir section 6).
- **Listes de savoir-être de 40 mots** : aucune n'est la bonne. Gemini mélange adjectifs de personnalité (à bannir). Prendre comme base notre catalogue, la liste officielle de 16 savoir-être de France Travail (**à ouvrir et vérifier**) et les verbes d'action, formulés comme des gestes.
- **VAE, bilan, passeport** : les chiffres divergent d'une réponse à l'autre (durée minimale d'expérience, plafonds, dates du service « Mes compétences »). **Rien de chiffré dans l'outil** ; au plus un renvoi « pour aller plus loin », vérifié au moment de l'écrire.

## 5. Les cinq familles proposées par les plateformes, comparées à ce que nous avons

Les plateformes proposent 4 ou 5 familles en mots simples. Notre dossier a **déjà trois catégories techniques** (savoir-faire, savoir-être, savoirs) utilisées par le CV, « Votre profil » et les exports. **Ne pas créer une deuxième classification** : on garde les trois en interne et on les **affiche** avec des mots simples.

| Interne (inchangé) | Libellé à l'écran proposé | Remarque |
|---|---|---|
| Savoir-faire | « Ce que je sais faire » | |
| Savoirs | « Ce que je connais » | |
| Savoir-être | « Ma façon de travailler » | uniquement avec fait observable |
| (nouveau, hors compétences) | « Ce qui me donne envie » | uniquement à partir de mots de la personne |
| (nouveau, hors compétences) | « Où je veux aller » | à relier à « Mon projet » (recoupement à auditer) |

## 6. Avertissement honnête à prévoir (à valider)

« Vos documents ne sont pas gardés par l'application. Quand vous copiez le message vers l'assistant en ligne que vous choisissez, le texte part chez lui : retirez ce que vous ne voulez pas partager. L'outil ne vous juge pas, ne vous note pas, n'ajoute aucune compétence sans preuve dans vos documents, et vous gardez le dernier mot sur chaque ligne. »
À compléter par ce que fait déjà l'application (CV relu et masqué avant copie : voir `construireMessageLettreCo`, `modules/lettre-core/`).

## 7. Risques de faisabilité révélés (franchise)

1. **Taille du message** : plusieurs documents dans un seul message copié vers l'assistant. Le prompt de lettre pèse déjà environ 46 000 caractères. Il faudra tester la limite des assistants et peut-être traiter les documents par lots.
2. **Lecture des lettres** : l'application sait lire un CV déposé ; la lecture des lettres de motivation et de recommandation pour ce but est à auditer (réutiliser le dépôt existant du Bilan, dette B.1).
3. **Qualité du relevé** : « jamais d'invention » repose sur le prompt ; il faut des essais réels avec de vrais documents (cas pauvres, parcours atypiques) avant d'être « apte au mode nuit ».
4. **Recoupements à auditer avant maquette** : « À partir de mon récit » (mécanismes réutilisables seulement, but différent : pas de fusion), « Mon projet » (vision à 2 et 5 ans), Cohérence (suivi d'une compétence entre documents), fiche d'entretien (oral).
