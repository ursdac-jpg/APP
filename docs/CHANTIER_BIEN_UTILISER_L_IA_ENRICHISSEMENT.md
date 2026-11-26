# Chantier : enrichissement du module « Bien utiliser l'IA » (consignes 596, 598, 599)

Ouvert le 24/11/2026, après la rédaction des douze modèles (Denis : « Enrichir d'abord »). Module toujours fermé (`BUIA_OUVERT = false`). Rien n'est codé de ce chantier : seule la maquette existe.

## Décisions déjà prises par Denis (24/11/2026)

1. **Emplacement** : un quatrième chemin à part, « Je veux savoir comment il fonctionne » (nom et place à confirmer, question 1 de la maquette). Le chemin 1 « Comprendre comment demander » reste centré sur l'écriture d'une demande.
2. **Noms d'assistants** : cités sur un seul écran daté (« à jour au [date] »), sourcé, dans un fichier facile à corriger. Le reste du module ne cite aucun nom.
   - Ajout de Denis le 24/11/2026 : parler aussi de **Gemini** et de **Copilot** (Microsoft, très présent chez les personnes qui ont Microsoft 365), plus « un autre que je ne retrouve plus ». Maquette mise à jour : sept cartes (ChatGPT, Copilot, Gemini, Claude, Perplexity, Le Chat de Mistral, DeepSeek) et une carte « D'autres existent ». Le troisième assistant est bien Le Chat de Mistral (confirmé par Denis le 24/11/2026). Question 2 de la maquette tranchée : sept assistants nommés, plus « D'autres existent ».
   - Copilot : deux versions à distinguer (gratuite grand public ; ouverte avec un compte de travail ou d'école, protégée par les règles de l'organisation). Vérifié le 24/11/2026 sur une page d'aide Microsoft d'avril 2026 : à relire et à sourcer avant affichage. Gemini : usage lié au compte Google et à l'activité enregistrée ; gratuité et recherche web non confirmées par une source officielle. Le Chat : nom du service en cours de changement selon une source, à vérifier.
3. **Projets et mémoire** : une page « Pour aller plus loin » avec garde-fous (quoi ne jamais y mettre, comment couper la mémoire). La « fiche de départ » sur la disquette n'est pas retenue pour l'instant.

Rappel de la consigne 596 (suite) : le mot reste « assistant ». Une seule phrase, au bon endroit (écran 1 du chemin 1 et écran 1 du nouveau chemin), dit « un assistant en ligne est une intelligence artificielle (IA) ». Ensuite le module garde « assistant ».

## Maquette

`docs/maquettes/maquette-bien-utiliser-ia-enrichissement-2026-11-24.html` : l'accueil à quatre chemins, le nouveau chemin (sept écrans : L'assistant, Ses phrases, Son savoir, Recherche web, Les assistants, Projets et mémoire, À retenir), les ajouts aux chemins 1 et 3 (consigne 598), et les six décisions restantes.

## Audit du code réel (avant tout plan)

- **Simple (reprise de l'existant)** : les textes du chemin 1 sont dans `data/buiaComprendre.js` (un fichier, un objet par écran) ; le nouveau chemin suit le même patron (`data/buiaFonctionne.js` à créer, écrans lus par une interface calquée sur `comprendreUi.js`). L'écran d'entrée lit `BUIA_CHEMINS` et `BUIA_AIDE_PHRASES` (`data/buiaEntree.js`) : ajouter un chemin et une phrase d'aide.
- **Moyen** : le routage et les tests qui comptent « trois chemins » (`index.js`, tests de l'entrée et de la disquette éventuelle) ; la recherche de l'accueil et le Lexique (règle « brancher la recherche au fur et à mesure ») ; la présentation et la vidéo, à refaire une seule fois à la fin.
- **Risqué** : tout ce qui est affirmé sur des produits commerciaux (gratuit, compte, recherche web, mémoire, projets). Vérifié le 24/11/2026 par recherche : les sources sont des articles tiers, pas les pages officielles, et elles se contredisent (par exemple Projets gratuit ou non sur Claude, limites de DeepSeek). Conséquence retenue : décrire le TYPE d'usage de chaque assistant, ne jamais annoncer de quota, daté et à revérifier sur la page officielle avant l'ouverture.
- **Point d'attention** : DeepSeek est un service chinois, avertissement sur les données à sourcer (question 3).
- **Rien de bloquant** pour l'architecture.

## Réponses de Denis (24/11/2026)

Questions 1, 3, 4 et 6 : recommandations validées (bouton en 2e position, avertissements DeepSeek et Copilot après source officielle, quatre techniques sauf « rôle réaliste » non sourcé, date « à jour au » et contrôle tous les six mois). Question 2 : sept assistants plus « D'autres existent ». Question 5 (deux réglages du chemin 3) : reste à Denis seul.

## Fait le 24/11/2026

Chemin 4 codé : `data/buiaFonctionne.js`, `fonctionneLogique.js`, `fonctionneUi.js`, route, bouton, phrase d'aide, aide contextuelle, recherche d'accueil, 14 tests, vérifié au navigateur (clair, sombre, 375 px). Le Lexique couvre déjà IA, assistant, LLM, recherche web, mémoire (famille « Numérique et assistants en ligne ») : rien à y ajouter pour ce chemin.

Ajouts de la consigne 598 codés le 24/11/2026 (effort haut) : questions d'aide « Pour qui ? Pourquoi ? Une phrase pour chacun suffit. » (but) et « Qu'est-ce qui est déjà fait ? Qu'est-ce qui bloque ? » (situation), champ `aide` des éléments 1 et 2 de `data/buiaDemande.js` (liste unique), affichées dans la ligne ouverte du chemin 1 (écran 3) et sous les champs du chemin 3 (`buiaLibreAideQuestions`) ; trois techniques (découper en étapes, plus long n'est pas meilleur, demander la citation du passage) dans `BUIA_C1_E3.techniques`, au niveau « Pour aller plus loin » de l'écran 3. Aucun prompt touché : les questions n'entrent jamais dans la demande construite. Deux ajouts de rédaction à valider par Denis : « Vous relisez chaque étape avant de passer à la suivante » (découper), « Retrouvez ensuite le passage dans votre document : l'assistant peut se tromper de phrase » (citation, cohérent avec la mise en garde de l'écran 6). Tests : 5 de plus, `npm test` 3737 verts. Vérifié au navigateur (clair, sombre, 375 px).

## Sources relues le 24/11/2026 (effort haut, pages officielles)

Chemin 4, écran 5 (fiches `source` de `data/buiaFonctionne.js`, `aSourcer` passé à false) :
- **Copilot** : https://support.microsoft.com/en-us/microsoft-copilot/privacy-faq-for-microsoft-copilot (version grand public : conversations gardées par défaut, entraînement possible avec refus possible si connecté, comptes de travail ou d'école exclus) et https://learn.microsoft.com/en-us/copilot/plan/privacy-and-protections (version de travail : protection des données de l'organisation, aucun entraînement sur les demandes et réponses). Copilot inclus dans Microsoft 365 Personnel et Famille, pour le titulaire seulement (résultat de recherche sur pages Microsoft, formulation à revoir si Denis veut la citer plus précisément). Les pages disent aussi que « Microsoft 365 Copilot » est devenu « Microsoft Copilot » et qu'une nouvelle application est sortie le 18/08/2026 : le nom « Copilot » reste le bon pour le public.
- **Gemini** : https://support.google.com/gemini/answer/13594961?hl=fr (réglage nommé « Historique », 18 mois par défaut, relecture humaine d'un échantillon conservée jusqu'à trois ans). CORRIGÉ : la fiche disait « s'utilise avec un compte Google » ; la page officielle décrit aussi un usage sans compte (données traitées selon les règles générales de Google). La gratuité n'est dite sur aucune page lue : la fiche ne l'affirme pas.
- **Le Chat (Mistral)** : https://mistral.ai/products/vibe/ et https://mistral.ai/pricing/ : « Le Chat is now Vibe » (conversations et réglages repris), offre gratuite avec « messages et recherches web limités », sans chiffre publié. CORRIGÉ : la fiche dit maintenant que le service s'appelle désormais Vibe. DÉCIDÉ par Denis le 24/11/2026 : le nom affiché reste « Le Chat (Mistral) » (le nom connu du public), la fiche signale que le service s'appelle désormais Vibe. À reconsidérer à la revue de six mois si Mistral retire le nom « Le Chat » de son site.
- **DeepSeek** : https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html (mise à jour du 10/02/2026) : données conservées en Chine, utilisables pour améliorer les modèles, refus possible par courriel. CORRIGÉ : « usage gratuit très large, sans abonnement » retiré (aucune page officielle lue ne le dit) ; « traités hors de l'Union européenne » remplacé par « conservés en Chine ».

Chemin 1 :
- **Exemples dans la demande** (écran 3, niveau « Pour aller plus loin ») : confirmé par https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (« Use examples effectively » : exemples placés entre balises pour les distinguer des consignes) et https://developers.openai.com/api/docs/guides/prompt-engineering (quelques exemples, contenus et documents séparés des consignes). La phrase « Les guides des éditeurs d'assistants recommandent quelques exemples, bien séparés du reste de la demande » est exacte.
- **Conservation des conversations** (écran 5) : « Selon l'assistant et selon ses réglages, vos conversations peuvent être conservées ou servir à l'améliorer » est confirmé par les trois pages ci-dessus (Copilot grand public, Gemini, DeepSeek). Phrase exacte, sans changement.
- **Techniques ajoutées** : citation du passage (guide Anthropic « Reduce hallucinations »), « plus long n'est pas meilleur » (article Anthropic « Effective context engineering for AI agents », étude Wharton arXiv 2506.07142), sources notées à la consigne 598, non relues ici.

À refaire tous les six mois (tâche à créer le jour de l'ouverture).

Écran « Projets et mémoire » du chemin 4, relu le 24/11/2026 (commit `a350aea2`) : couper la mémoire n'efface pas les souvenirs et supprimer une conversation non plus (OpenAI, Anthropic, Microsoft, Google), conversation temporaire sans souvenir (OpenAI, Claude « incognito », Gemini « Temporary Chats »). Sources complètes dans `docs/PROPOSITIONS_BIEN_UTILISER_L_IA_2026-11-24.md` (annexe).

## Dossier de propositions (24/11/2026)

`docs/PROPOSITIONS_BIEN_UTILISER_L_IA_2026-11-24.md` (références Pix IA, DigComp, AILit ; propositions P1 à P13 ; décisions A à D à prendre par Denis) et la maquette interactive `docs/maquettes/maquette-bien-utiliser-ia-exercices-2026-11-24.html`. FAIT le 24/11/2026 (décision A, option 1 de Denis) : P1 « Réparer une demande » (écran 3 du chemin 1) et P2 « Repérer ce qui se vérifie » (écran 6 du chemin 1), `data/buiaExercices.js`, `exercicesLogique.js`, `exercicesUi.js`, deux cas inventés chacun, visibles aux DEUX niveaux de lecture (écart avec le dossier, qui disait « Pour aller plus loin » : les personnes en « Les bases » sont le public le plus fragile) ; P4 « Quand s'en passer » (écran 7 du chemin 4, `BUIA_C4_E7`, huit étapes au lieu de sept, quatrième point de la fiche). Aucun prompt touché. Reste P3 « Avant et après » et les décisions B, C, D.

Rien d'autre n'est codé.

## Ce qui reste

1. Réponses de Denis aux questions 1 à 6 de la maquette (onglet « Vos décisions »).
2. Vérifier les affirmations sur les assistants dans leurs pages officielles (aide et tarifs), les dater.
3. Coder : `data/buiaFonctionne.js`, l'écran, le bouton d'accueil, la phrase d'aide, les tests, la recherche et le Lexique, la tâche de contrôle tous les six mois.
4. (FAIT le 24/11/2026, voir plus haut) Ajouts de la consigne 598 aux chemins 1 et 3 ; les deux réglages du chemin 3 sont la décision de Denis seule (Claude ne modifie pas les prompts).
5. Présentation et vidéo refaites une seule fois, en dernier.
