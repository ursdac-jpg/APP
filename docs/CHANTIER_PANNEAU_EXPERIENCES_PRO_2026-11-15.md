# Chantier : panneau « Vos expériences professionnelles » refait autour du métier (2026-11-15)

> Consigne 365 de Denis (« le point le plus important »). Statut : **audit fait, maquette v1 faite, plan de codage écrit (`docs/PLAN_DE_CODAGE_PANNEAU_EXPERIENCES_PRO_2026-11-15.md`), lots 1 et 2 codés (15/11/2026) : le panneau fonctionne dans « Vos informations » de « Créer un nouveau CV ».** À lire avec `docs/PLAN_DE_CODAGE_MISSIONS_COMPETENCES_2026-11-14.md` (le chantier déjà codé qui fournit les briques).

## Ce que Denis veut (ses mots résumés)
1. Quand la personne tape l'intitulé du poste, des **suggestions de métiers** apparaissent, comme dans la barre de recherche de l'accueil.
2. On **identifie le métier et son secteur**, et on peut **parcourir tous les métiers**.
3. Le métier identifié, la personne **choisit elle-même les compétences et les missions** liées à ce métier.
4. Un **espace libre** pour ses propres compétences et ses propres missions.
5. À l'édition du CV (et plus tard quand on proposera des métiers proches), les compétences venues des **actions choisies** (avec qui, quelle action, quel environnement) s'ajoutent à celles du métier **sans doublon** : chaque compétence reste unique.
6. Toute la page « Vos informations » prend le même visuel que « Vos diplômes » (consigne 366).

## Audit du code réel (15/11/2026)

**Le panneau actuel** (`contenuExperiencesProInline`, `js/app.js` ~17226) : intitulé du poste (champ libre), entreprise, années, « Ce que vous y faisiez » (texte libre), bouton d'ajout. Aucune suggestion, aucun métier, aucun secteur, aucune compétence. Seul le mode « Corriger mon CV » avec l'assistant ajoute un bloc « Compléter avec la fiche du métier » (`mcHtmlComplementReprise`).

**Ce qui existe déjà (à réutiliser, jamais à recopier)**
- **L'étape « Vos missions et compétences »** (`modules/missions-competences/`, `MC_OUVERT = true`, page à part après « Votre parcours ») fait déjà, par expérience : retrouver la fiche du métier à partir de l'intitulé libre (4 niveaux : fiche trouvée, plusieurs possibles, approchantes, rien d'affirmé avec choix du secteur : `rechercheFiche.js`), proposer les missions à cocher (`mi`) et les compétences (savoir-faire, savoir-être, savoirs, activités précises), laisser ajouter ses propres missions et compétences, fusionner **sans doublon entre expériences** (`etape.js`, `mcSansDoublon`, `mcRangsDoublon`), écrire dans le dossier (`dossier.experiences[i].missions`, `competencesCV`, `savoirEtreCV`, `savoirsCV`).
- **Le bloc « Vos diplômes »** (`_fmRubriqueMetiers`, `fmProposes`, choix du secteur, recherche dans le secteur, `fm*` dans `js/app.js` et `modules/formations-metiers/`) sait déjà : proposer des métiers selon un texte, changer de secteur, chercher parmi tous les métiers d'un secteur, présenter les missions à cocher sur fond violet. Même répertoire du ROME (REPERTOIRE_ROME, 21 secteurs, 1 923 fiches).
- Les données : `data/rome/fiche_A.js` à `fiche_N.js` (missions `mi`, compétences `k`, métiers proches `p`, autres noms `n`).

**Ce qui manque par rapport à la demande**
- Les **suggestions en tapant** dans le champ de l'intitulé (le rapprochement existe, mais seulement dans l'étape à part, après coup).
- Le choix du métier et de ses missions et compétences **dans le panneau lui-même**, au moment où on saisit l'expérience.
- **À vérifier (pas encore vérifié)** : que les compétences venues des actions de « Votre parcours » (avec qui, quelle action, quel environnement) passent par la même fusion sans doublon que celles des fiches. La fusion existe entre expériences ; son extension aux compétences des actions n'est pas confirmée par la lecture du code.

## Proposition (à valider par Denis après maquette)
Réutiliser les deux briques existantes dans le panneau, sans créer de troisième système :
1. Le champ « Intitulé du poste » reçoit des **suggestions pendant la frappe** (mêmes métiers que la barre de recherche et « Vos diplômes »).
2. Choix du métier, du secteur et « parcourir tous les métiers » = le composant de « Vos diplômes » (`À choisir`).
3. Missions et compétences du métier à cocher (fond violet, comme « Vos diplômes ») + zones « Ou écrivez avec vos mots » (`À écrire`).
4. Les choix s'écrivent dans l'état existant de l'étape (`dossier.etapeMC`, `mcAppliquerAuDossier`) : l'étape « Vos missions et compétences » devient la **vue d'ensemble et de contrôle** (doublons, ce que le CV contiendra), plus un second endroit où tout re-saisir.

## Risques et franchise
- **Moyen à élevé** : le panneau est dans `js/app.js` (non couvert par les tests Node) ; il faut un test navigateur à chaque sous-étape. Les expériences n'ont pas d'identifiant stable (le rapprochement se fait par poste et entreprise : voir plan de codage, point « Risqué » 2).
- **Chevauchement à trancher** : si le panneau fait déjà le choix, que devient la page « Vos missions et compétences » ? Trois possibilités dans la maquette : (a) elle reste comme étape de contrôle ; (b) elle disparaît du parcours ; (c) elle ne sert qu'à la correction globale des doublons.
- **Faisable** : oui, car les briques existent et sont testées. Aucun algorithme nouveau n'est nécessaire.

## Prochaine étape
Maquette du nouveau panneau (parcours complet : écran d'avant, écran d'après, boutons), validée par Denis avant tout code. Mode recommandé : B (maquette), effort haut.
