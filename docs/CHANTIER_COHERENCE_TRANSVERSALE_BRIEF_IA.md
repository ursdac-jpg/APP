# Brief pour avis externe (ChatGPT ou autre IA) — Chantier "Cohérence transversale CV / lettre / entretien"

Document préparé par Claude (assistant travaillant sur le code d'ERIP) à la demande de Denis, porteur du projet ERIP. Objectif : obtenir un troisième avis avant de trancher la conception de ce chantier. Merci de répondre en évaluant les deux propositions ci-dessous, en signalant les angles morts, et en proposant votre propre recommandation argumentée.

## Contexte du projet (à connaître avant de répondre)

ERIP est une application web d'accompagnement à la candidature (CV, lettre de motivation, préparation d'entretien), destinée en priorité à des personnes en difficulté d'insertion professionnelle, souvent peu à l'aise avec l'informatique. Contrainte structurante : **application 100% statique, aucun backend, aucune API IA payante**. Toute génération IA passe par un copier-coller manuel vers un assistant externe (ChatGPT, Claude, etc.) — l'utilisateur colle un prompt préparé par l'app, colle la réponse de l'IA dans l'app, qui la structure ensuite. Philosophie non négociable : l'IA n'écrit et ne décide jamais rien seule sans validation explicite de la personne à chaque étape ; jamais de score chiffré (diagnostic toujours qualitatif : "à renforcer / convaincant / très convaincant" etc.).

L'application dispose déjà d'un module "Bilan de candidature" fonctionnel et stabilisé : la personne renseigne son CV (et peut cibler une offre d'emploi/entreprise), un prompt (`bilan-v1.md`) produit un diagnostic qualitatif structuré en une dizaine d'axes fixes (ex. `adequation`, `coherence` du parcours, `posture`, `personnalisation`...), avec des recommandations, que la personne peut ensuite accepter/modifier/rejeter une par une pour corriger son CV via un mécanisme de correction déjà construit.

Un axe nommé `coherence_transversale` existe déjà dans le schéma de ce diagnostic (poids "contextuel", activé seulement à partir d'un certain niveau de complétude du dossier) mais **n'a aujourd'hui aucune donnée à évaluer** : le code qui prépare les données envoyées à l'IA (`hostDataAdapter.js`) ne transmet que le CV, jamais le texte de la lettre de motivation ni celui d'une préparation d'entretien. L'axe existe dans le schéma mais est structurellement vide. C'est le chantier qu'il s'agit de concevoir : le faire exister réellement.

Une réflexion d'architecture antérieure (nom de code interne "V4", jamais implémentée, gelée) a exploré l'idée de modéliser un CV comme un ensemble d'"Observations" (faits, qualités, incohérences, avec une preuve textuelle et un niveau de confiance) reliées par des "Relations" (entre deux sections du CV, ou entre une section et une référence externe comme un métier cible) — un même Relation pourrait en théorie aussi relier deux documents différents (CV et lettre), mais cette architecture reste à ce jour une piste papier, pas du code.

## Proposition A — l'idée de Denis (porteur du projet, terrain CIP)

- Créer une **entrée séparée** de l'outil actuel d'analyse de CV : l'analyse CV existante doit rester CV seul, sans être alourdie. Une nouvelle fonctionnalité dédiée à l'analyse transversale, où la personne renseigne plusieurs documents.
- **Entrées obligatoires pour démarrer** : offre d'emploi + CV + lettre de motivation.
- **Entrée optionnelle mais très valorisée** : la préparation d'entretien (questions probables générées par l'IA + réponses données par la personne) — considérée comme "un grand plus" car elle permet de travailler à la fois sur les questions elles-mêmes et sur la qualité des réponses de la personne.
- **Ce qui doit être analysé** : la cohérence CV↔lettre, CV↔entretien, CV↔offre, lettre↔entretien, et une vision globale croisant CV + lettre + entretien + offre + entreprise.
- **Prendre en compte les atouts**, pas seulement les problèmes : ressources, expériences, tout ce qui peut donner du poids à la candidature doit aussi ressortir de l'analyse, pas seulement les manques.
- **Détecter des "zones d'ombre" concrètes**, avec un exemple précis donné par Denis : si le CV a une phrase d'accroche, cette même phrase ne doit **jamais réapparaître mot pour mot** dans la lettre de motivation — l'idée peut être reprise, mais la formulation doit être différente. Plus largement : incohérences internes au CV, incohérences dans la formulation de la lettre.
- **Ne pas s'arrêter au diagnostic** : donner à la personne un moyen concret d'appliquer les corrections proposées, pas seulement une liste de remarques à traiter elle-même.

## Proposition B — l'avis de Claude (assistant technique sur le projet)

Claude est plutôt d'accord sur le fond (les 5 objectifs d'analyse, la valorisation des atouts, la détection de la duplication de phrase, la correction applicable) mais propose une architecture différente pour y arriver, par souci de coût et de cohérence avec ce qui existe déjà :

- **Ne pas créer un module entièrement séparé, mais un approfondissement optionnel du Bilan existant.** Techniquement, l'axe `coherence_transversale` existe déjà dans le schéma de diagnostic, le moteur de diagnostic/correction existe déjà, l'écran de rapport gère déjà un nombre variable d'axes. Créer un second module dupliquerait cette plomberie pour un gain d'isolement qui peut aussi s'obtenir par une simple présentation à l'écran ("cette section n'apparaît que si vous avez fourni une lettre") plutôt que par un second système de bout en bout. Le CV seul resterait exactement aussi simple qu'aujourd'hui pour qui n'a pas encore de lettre — rien n'est alourdi par défaut, l'axe reste juste inactif tant que les documents ne sont pas fournis.
- **La détection de phrase dupliquée mot-pour-mot ne devrait pas être confiée à l'IA** (peu fiable, coûte un passage IA pour une vérification que le code peut faire seul et de façon fiable). Proposition : une fonction déterministe, côté application, qui compare le texte de l'accroche du CV (déjà un champ distinct dans les données) au texte de la lettre, et signale une similarité suspecte avant même l'appel IA — sur le même principe qu'une pré-vérification déterministe déjà envisagée ailleurs dans la feuille de route du projet ("l'application tranche seule quand elle le peut, l'IA ne juge que ce qu'elle seule peut juger").
- **Rendre l'entretien optionnel, CV+lettre+offre obligatoires** : d'accord avec Denis sur ce point précis, pour une raison technique supplémentaire — le texte d'une préparation d'entretien est un contenu généré en plusieurs échanges (questions probables + réponses de la personne), donc plus coûteux et plus rare à obtenir qu'un CV ou une lettre déjà écrite. Le rendre optionnel évite de bloquer la fonctionnalité pour la majorité des personnes qui n'auront pas encore fait cette étape.
- **Point ouvert, à trancher** : "donner un moyen concret de corriger" — l'app a déjà un mécanisme de correction pour le CV (accepter une recommandation, elle est appliquée). Mais une recommandation qui concerne la lettre de motivation ou une réponse d'entretien peut-elle être appliquée de la même façon, ou seulement affichée comme conseil ? Cette question technique n'est pas encore tranchée et mériterait un avis.

## Question posée à vous (l'IA consultée)

1. Entre l'approche "module séparé" (Denis) et "approfondissement optionnel du module existant" (Claude), laquelle recommanderiez-vous, et pourquoi ?
2. Y a-t-il des angles morts dans les 5 axes de cohérence à analyser (CV↔lettre, CV↔entretien, CV↔offre, lettre↔entretien, vision globale) ?
3. Une idée pour la question ouverte sur l'application concrète des corrections quand elles concernent la lettre ou l'entretien plutôt que le CV ?
4. Toute autre perspective qui manquerait à cette réflexion.
