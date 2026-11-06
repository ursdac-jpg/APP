# Outils de vérification des sites et de veille (dossier Cloud, partie M)

Trois petits programmes Python, venus du dossier Cloud, installés ici le 03/11/2026 et testés sur Windows.
Aucun ne publie quoi que ce soit : ils produisent des fichiers à relire, Denis décide.

## Règles communes (non négociables)

- Une seule requête par seconde au plus, jamais de rafale.
- Aucun contournement d'une protection anti-robot (Cloudflare, captcha, 403) : si le site refuse, le programme le dit et on s'arrête. Le site est alors à ouvrir à la main.
- Aucun lien vers un site d'offres d'emploi commercial.
- Un résultat n'est jamais une preuve définitive : c'est une aide à la relecture. Une adresse ne devient cliquable dans l'application qu'une fois datée par Denis (« C'est bon » dans l'outil de veille).

## 1. `verif_employeur.py` : vérifier le site d'un employeur

À partir d'un fichier `nom <TAB> site <TAB> préfixes de codes postaux (24,87)`, ouvre le site, exige le nom de l'employeur et un code postal du territoire, recopie l'adresse et les numéros tels qu'affichés (sans choisir s'il y en a plusieurs), cherche une page de recrutement sur le domaine de l'employeur (jamais un site d'offres) et rend un verdict (PRE-ENREGISTRE, A COMPLETER, REJETE, BLOQUE).
Essai : `python verif_employeur.py test.tsv resultats.json` (le fichier `test.tsv` donne le modèle).
Limite connue : un site protégé par un contrôle anti-robot est rendu « REJETE » et non « BLOQUE » (cas de travail-industrie.com) : le lire à la main.

## 2. `veille_rss.py` : nouveautés des sites officiels

Lit les flux RSS listés dans `flux.tsv` (service-public, ministère du Travail, Justice, Agefiph), ne garde que les nouveautés depuis le dernier passage, les classe par thème et écrit un fichier à relire.
Essai : `python veille_rss.py flux.tsv etat.json nouveautes.md`
Le fichier `etat.json` (mémoire des liens déjà vus) est créé au premier passage : ne pas le versionner.

## 3. `sirene_candidats.py` : dresser la liste des employeurs réels d'un département

Interroge la base publique Sirene (API « Recherche d'entreprises ») et liste les établissements actifs de 20 salariés et plus d'un département, par section d'activité.
Usage : `python sirene_candidats.py 24 sortie_24.tsv` puis `87`.
Paramètres confirmés le 03/11/2026 sur une vraie requête. Point à retenir : le département et la tranche d'effectif portent sur l'entreprise ; le programme ne garde que les établissements actifs dont le code postal est du département demandé (le siège peut être ailleurs).
Le lancement complet d'un département prend plusieurs minutes (une requête par seconde) : à faire à un moment choisi par Denis.
Le résultat se compare ensuite au registre de l'application, puis chaque candidat passe par `verif_employeur.py` une fois son site officiel trouvé.
