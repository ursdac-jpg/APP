# Rapport du 15/11/2026 : essai A contre B (7 expériences) et comparaison des sources de compétences

Consigne 320. Lecture seule : rien n'est importé dans l'application.

## 1. Essai A (rien choisi) contre B (choix de la personne), même profil de 7 expériences

Messages : `docs/MESSAGE_ESSAI_A_7_EXPERIENCES_2026-11-15.txt` (45 278 caractères) et `docs/MESSAGE_ESSAI_B_7_EXPERIENCES_2026-11-15.txt` (53 490 caractères). Une seule réponse de l'assistant pour chacun (variation d'une réponse à l'autre possible).

| Point | A (2 lignes écrites à la main par expérience) | B (6 lignes choisies par expérience) |
|---|---|---|
| Réponse complète en une partie | oui, `"fin": "complet"` | oui, `"fin": "complet"` |
| Expériences traitées | 7 sur 7 | 7 sur 7 |
| Lignes de missions | 35 lignes réécrites par l'assistant, avec remplissage (« Veiller au bon déroulement… » ×5) et faits non écrits dans le profil (« maintien de l'autonomie », « confort et bien-être ») | 42 lignes recopiées mot pour mot, aucune inventée |
| Compétences en plus | sans objet | liste vide (la règle renforcée a été suivie) |
| Version plus courte | sans objet | 1 proposition correcte (ligne d'origine gardée) |
| Doublon de sens | sans objet | aucun signalé |
| Compétences à valoriser | 12 | 10, justifiées par les lignes choisies |
| Titres et accroches | corrects, plus généraux | corrects, plus concrets |

Conclusion : avec 7 expériences, le chemin B n'a ni débordé ni perdu en qualité de rédaction. Il a fait mieux sur le contenu, mais l'écart vient surtout de l'entrée (6 lignes de fiche contre 2 lignes tapées), pas du prompt. Limites : une réponse par chemin, un seul assistant, pas de profil plus lourd (10 expériences ou plus).

Point à vérifier dans l'application : en B, les compétences choisies par la personne (Soins d'hygiène, Conseil client, Encaissement, Patience) ne sont pas reprises dans les listes « à valoriser » et « personnelles » de la première partie. Elles figurent dans le second bloc (thèmes). Il faut confirmer qu'elles arrivent bien sur le CV par le dossier.

Optimisation possible, non faite : l'assistant recopie 42 lignes que le code garantit déjà. Les lui épargner allègerait la réponse. À faire seulement si un profil plus lourd montre un dépassement.

## 2. Comparaison des sources

Version de notre base : ROME version 62, publiée le 19/10/2026 (`ROME_v62_donnees`). La page officielle de data.gouv.fr indique 1 923 fiches, mise à jour du 20/10/2026 : notre base compte 1 923 fiches. Nous sommes à jour.

### JobAlign « Mots-clés de CV par métier » (Licence Ouverte 2.0, 7,5 Mo, 3 CSV)
- 47 769 couples métier et mot-clé pour 1 912 métiers.
- Mots d'origine ROME : déjà chez nous à 95 % (compétences métier), 93 % (langages), 95 % (outils), 98 % (méthodes), 95 % (langues). Rien à importer.
- Savoir-être d'origine ROME : 54 % seulement retrouvés (7 070 couples). Exemples absents : « Esprit d'équipe », « Rigueur et précision », « Gestion des priorités », « Sens du service ». Nos listes de savoir-être sont courtes (4 à 5 par métier). Ces libellés ne figurent pas dans nos CSV du ROME : leur provenance n'est pas confirmée.
- Mots hors ROME (offres, guides) : 1 299 couples sur 26 métiers seulement, surtout des métiers de bureau (RH, marketing, qualité, finance). 129 absents de nos fiches. Aucun intérêt pour notre public.
- Verdict : rien à importer, sauf éventuellement une liste de savoir-être plus riche par métier (gain modeste).

### RNCP (France compétences, export CSV 9,8 Mo)
- 56 560 blocs de compétences pour 10 983 certifications, reliés à 557 codes ROME.
- Les codes ROME du RNCP sont ceux de l'ancien ROME (ex. « M1203 Comptabilité »). Le lien avec nos fiches demande une table de correspondance.
- Les blocs sont des intitulés de blocs de diplômes, hétérogènes et bruités (« Mathématiques et sciences physiques », « Éducation physique et sportive », « Bloc de compétences n°2 fiche RNCP n°… »). Quelques bons intitulés (« Tenir un poste de caisse », « Entretenir le logement et le linge d'un particulier »), déjà couverts par nos missions.
- Verdict : peu de valeur pour enrichir missions et compétences. Utile surtout pour afficher les diplômes d'accès, sujet à part.

### ONISEP Idéo-Fiches métiers (XML 13 Mo)
- Récupéré, non exploité. Licence ODbL (partage à l'identique) : une contrainte à examiner avant tout usage. Contenu descriptif plutôt que compétences. Non recommandé.

### Ancien ROME (ROME 3)
- Aucune archive accessible trouvée. Environ 532 métiers et 7 500 savoir-faire, contre 17 193 savoir-faire aujourd'hui : l'apport serait nul ou presque.

### ESCO
- Non téléchargé : le téléchargement demande un courriel. À faire par Denis si souhaité : https://esco.ec.europa.eu/en/use-esco/download (français, CSV, compétences et professions).
