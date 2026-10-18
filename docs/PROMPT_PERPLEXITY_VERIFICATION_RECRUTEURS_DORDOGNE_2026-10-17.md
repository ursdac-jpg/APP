# Qui fait quoi : message UNIQUE pour Perplexity, vérification des doutes de la Dordogne

> Écrit le 2026-10-17, sur le modèle exact du message de la Haute-Vienne (`docs/PROMPT_PERPLEXITY_VERIFICATION_RECRUTEURS_HAUTE_VIENNE_2026-10-17.md`). Il regroupe tout ce qui reste douteux dans le sas `outils/sas/recruteurs.sas.txt` (84 lignes) après le contrôle automatique : 26 vérifications en UN message. La liste à regarder à la main reste dans `docs/A_VERIFIER_A_LA_MAIN_RECRUTEURS_DORDOGNE_2026-10-17.md`.
>
> **Mode d'emploi** : copiez l'encadré en entier dans UN message Perplexity (mode recherche), sans question de retour. Collez la réponse entière à Claude. Remarque tirée de la Haute-Vienne : Perplexity n'a pu ouvrir presque aucune page ; si c'est encore le cas, ce message ne remplace pas votre vérification à la main, il sert surtout à trouver les adresses des parties B et D.

```
Je vérifie des pages de recrutement d'employeurs de la DORDOGNE (24), pour une page d'information destinée à des personnes qui cherchent un emploi. Je ne publie AUCUNE offre : je donne seulement l'adresse de la page où l'employeur publie ses offres. Réponds en UNE SEULE fois, sans me poser de question et sans découper ta réponse.

RÈGLES, à suivre à la lettre :
1. Une page n'est retenue que si elle appartient à l'employeur lui-même (ou au logiciel de recrutement officiel vers lequel SON site renvoie) et si tu l'as réellement ouverte AUJOURD'HUI et vue lister des offres. Interdits : Indeed, Jooble, Optioncarrière, Cadremploi, Hellowork, Welcome to the Jungle, Meteojob, LinkedIn, Glassdoor, Jobijoba, France Travail, agences d'intérim, tout site qui recopie des offres.
2. N'invente JAMAIS une adresse et ne la devine pas : si tu n'as pas pu ouvrir la page, écris « introuvable » ou « non vérifiable » dans la colonne de l'adresse. Une page de contact, d'accueil ou de présentation sans liste d'offres n'est pas une page de recrutement.
3. Date de la plus récente : date de publication (AAAA-MM-JJ) lue sur la page, vide si la page n'en affiche pas (« Aujourd'hui » et les dates limites de candidature ne comptent pas). Offres vues : le nombre lu sur la page, ou « plusieurs ».
4. Pour les employeurs nationaux, dis si au moins une offre est située en Dordogne aujourd'hui (colonne « en Dordogne » : oui / non / non vérifiable).

FORMAT DE LA RÉPONSE, deux blocs seulement :
BLOC 1, un seul bloc de code, une ligne par employeur de la liste ci-dessous (garde l'id donné), au format exact :
id | page de recrutement | offres vues | date de la plus récente | compte demandé (oui/non) | en Dordogne (oui/non/non vérifiable) | remarque en 10 mots au plus
BLOC 2 : la liste des id que tu proposes d'ÉCARTER, avec une raison de 8 mots au plus (par exemple « aucune offre listée », « page de contact seulement »).

PARTIE A : ces 11 adresses sont données par un assistant mais n'ont pas pu être contrôlées (le site refuse les robots). Ouvre chacune, dis si elle liste des offres, et corrige l'adresse si elle est fausse.
- Centre hospitalier Vauclaire | id : centre-hospitalier-vauclaire-24 | adresse à tester : https://www.ch-vauclaire.fr/recrutement/ (selon un assistant, Vauclaire publie ses offres sur le portail hospitalier emploi.fhf.fr : si c'est le cas, donne l'adresse exacte de sa fiche sur ce portail)
- Petits-fils | id : petits-fils-24 | adresse à tester : https://recrutement.petits-fils.com
- Fondation de Selves | id : fondation-de-selves-24 | adresse à tester : https://www.fselves.org/recrutement
- Centre hospitalier de Nontron | id : centre-hospitalier-nontron-24 | adresse à tester : https://www.ch-nontron.fr/recrutement/
- Centre hospitalier de Belvès | id : centre-hospitalier-belves-24 | adresse à tester : https://hl-belves.fr/poste/
- CCI Dordogne (réseau CCI) | id : cci-dordogne-recrutement | adresse à tester : https://www.cci.fr/nous-rejoindre
- Académie de Bordeaux | id : academie-bordeaux-recrutement | adresse à tester : https://www.ac-bordeaux.fr/recrutement
- Police nationale | id : police-nationale-recrutement | adresse à tester : https://www.police-nationale.interieur.gouv.fr/nous-rejoindre
- Gendarmerie nationale | id : gendarmerie-nationale-recrutement | adresse à tester : https://www.gendarmerie.interieur.gouv.fr/recrutement
- Agence de l'eau Adour-Garonne | id : agence-eau-adour-garonne-recrutement | adresse à tester : https://eau-grandsudouest.fr/recrutement
- ADEME | id : ademe-recrutement | adresse à tester : https://recrutement.ademe.fr/accueil.aspx

PARTIE B : ces 4 employeurs n'ont pas d'adresse de recrutement connue. Trouve en partant de leur site officiel la page où ils listent leurs offres, ou écris « introuvable ».
- Centre hospitalier de Sarlat : le site officiel est https://www.ch-sarlat.fr ; trouve où il publie ses offres (sur son site, ou sur le portail hospitalier emploi.fhf.fr) | id : centre-hospitalier-sarlat-24 | secteur : sante | territoire : Dordogne
- Service départemental d'incendie et de secours de la Dordogne (SDIS 24) : le site officiel est https://www.sdis24.fr ; ne retiens que s'il liste des recrutements de personnels (pas le seul formulaire de sapeur-pompier volontaire) | id : sdis24-recrutement | secteur : securite | territoire : Dordogne
- Chambre d'agriculture de la Dordogne : le site officiel est https://dordogne.chambres-agriculture.fr ; trouve sa page d'offres d'emploi | id : chambre-agriculture-dordogne-recrutement | secteur : agriculture-nature | territoire : Dordogne
- Groupe Terres du Sud : le site officiel est https://terresdusud.fr ; trouve sa page d'offres d'emploi (l'adresse talent-soft connue donne une erreur 404) | id : terres-du-sud-24 | secteur : agriculture-nature | territoire : Dordogne

PARTIE C : ces 6 adresses répondent, mais un doute reste. Vérifie ce qui est indiqué.
- FedEx Express (Marsac-sur-l'Isle) | id : fedex-express-marsac-sur-lisle-24 | adresse à tester : https://careers.fedex.com/fr/ (vérifie qu'il y a des offres situées à Marsac-sur-l'Isle ou en Dordogne)
- Seris Security | id : seris-security-24 | adresse à tester : https://www.serisrecrute.fr (vérifie que la page liste des offres et s'il y en a en Dordogne)
- Conseil départemental de la Dordogne | id : conseil-departemental-dordogne-24 | adresse à tester : https://www.dordogne.fr/votre-departement/emplois-et-stages (c'est la rubrique d'entrée : donne la page qui liste réellement les offres du Conseil départemental, ou dis qu'il n'y en a pas)
- Fiducial Sécurité | id : fiducial-securite-24 | adresse à tester : https://jobs.fiducial.fr/nos-offres-d-emploi (vérifie s'il y a des offres en Dordogne)
- Securitas France | id : securitas-france-24 | adresse à tester : https://carrieres.securitas.fr/fr/annonces (vérifie s'il y a des offres en Dordogne)
- Terra'Job | id : terrajob-24 | adresse à tester : https://terra-job.fr/ (12 offres vues sans date : relève la date de publication si elle existe)

PARTIE D : ces 5 adresses ont été retrouvées sur les sites officiels mais personne n'a confirmé qu'elles listent des offres. Ouvre-les et dis si des offres y sont listées aujourd'hui.
- Grand Périgueux | id : grand-perigueux-recrutement | adresse à tester : https://www.grandperigueux.fr/votre-agglo/recrutement/
- Apei Périgueux | id : apei-perigueux-24 | adresse à tester : https://www.apei-perigueux.org/offres-demploi
- O2 Care Services | id : o2-care-services-24 | adresse à tester : https://www.o2recrute.fr/
- Constructions Savignacoises Ferron | id : constructions-savignacoises-ferron-24 | adresse à tester : https://www.constructions-savignacoises.com/recrutement.php
- La Sécu recrute (CAF, CPAM, Carsat, Urssaf) | id : la-secu-recrute-24 | adresse à tester : https://www.lasecurecrute.fr/accueil (vérifie que la page liste des offres, et dis s'il y en a en Dordogne)
```

## Ce que Claude fera de la réponse

1. Mettre à jour `outils/sas/recruteurs.sas.txt` (adresses corrigées, lignes écartées), relancer `node scripts/verifierRecruteursSas.js`.
2. Remettre à Denis ce qu'il reste à ouvrir à la main. Aucune fiche n'est publique avant le « C'est bon » de Denis.
