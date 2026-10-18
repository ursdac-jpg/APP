# Qui fait quoi : prompt pour retrouver la bonne adresse des 17 pages de recrutement introuvables (Dordogne)

> Écrit le 2026-10-16. Contexte : le contrôle automatique des adresses (`docs/VERIFICATION_RECRUTEURS_DORDOGNE_2026-10-16.md`) a montré que ces 17 sites existent mais que la page donnée par l'assistant n'existe pas (erreur 404). Il s'agit de retrouver la **vraie** page de recrutement, sans rien inventer.

## Mode d'emploi

1. Une seule conversation ChatGPT (avec la recherche web activée).
2. Copiez l'encadré ci-dessous tel quel.
3. Collez la réponse **entière** dans la conversation avec Claude : il range les adresses corrigées dans le sas, relance le contrôle automatique, puis vous ouvrez les pages à la main.
4. Une adresse « introuvable » est une bonne réponse : elle vaut mieux qu'une adresse inventée.

```
Je dois retrouver la page de recrutement officielle de 17 employeurs de la Dordogne (24). Pour chacun, la page que tu m'avais donnée n'existe pas (erreur 404), mais le site officiel de l'employeur existe.

Règles, à suivre à la lettre :
1. Pars du site officiel de l'employeur (adresse donnée plus bas) et trouve, en le parcourant, le lien « Carrières », « Recrutement », « Nous rejoindre » ou « Offres d'emploi ». Donne l'adresse EXACTE de la page où les offres sont listées.
2. N'écris une adresse que si tu as réellement ouvert cette page ce jour et que tu y as vu des offres. Sinon écris « introuvable » dans la colonne de l'adresse. N'invente jamais une adresse, ne la devine pas à partir d'autres sites.
3. La page doit appartenir à l'employeur lui-même, ou à son logiciel de recrutement officiel s'il y renvoie depuis son propre site (par exemple une page « talent-soft » ou « recruitee » vers laquelle le site officiel envoie). Interdits : Indeed, Jooble, Optioncarrière, Cadremploi, Hellowork, Welcome to the Jungle, Meteojob, LinkedIn, Glassdoor, Jobijoba, Staffsanté, Staffsocial, France Travail et tout site qui recopie des offres. Aucune agence d'intérim.
4. Ne redonne JAMAIS l'adresse fausse indiquée pour chaque employeur.
5. Colonne « offres vues » : le nombre d'offres visibles sur la page ce jour-là, ou « plusieurs » si la page n'affiche pas de total. Colonne « date de la plus récente » : la date (AAAA-MM-JJ) de l'offre la plus récente vue sur la page ; vide si la page n'affiche pas de date. Ne remplis ces colonnes que si tu les as lues sur la page.
6. Zéro bavardage. Si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par employeur, au format exact (en gardant l'identifiant donné) :
id | famille | nom | secteur | territoire | page de recrutement | offres vues | date de la plus récente | compte demandé | source | date

- famille : « employeur », « portail-officiel » ou « groupement » comme dans la liste ci-dessous (garde la valeur de la liste).
- territoire : « Dordogne » ou « national » ; garde la valeur du nom donné.
- compte demandé : oui ou non (faut-il créer un compte pour VOIR les offres ?).
- source : l'adresse du site officiel où tu as trouvé le lien vers la page de recrutement.
- date : laisse vide.

Les 17 employeurs (id | secteur | adresse fausse | site officiel connu) :
- FedEx Express (Marsac-sur-l'Isle) | id : fedex-express-marsac-sur-lisle-24 | secteur : transport-logistique | adresse FAUSSE à ne pas redonner : https://careers.fedex.com/fr-fr | site officiel connu : https://www.fedex.com/fr-fr/about/careers.html
- Polyrey | id : polyrey-24 | secteur : industrie | adresse FAUSSE à ne pas redonner : https://www.polyrey.com/fr/carrieres | site officiel connu : https://www.polyrey.com/fr
- ADHAP | id : adhap-24 | secteur : social-personne | adresse FAUSSE à ne pas redonner : https://www.adhap.fr/offres-emploi | site officiel connu : https://www.adhap.fr/trouver-une-agence/adhap-laide-a-domicile-dans-le-departement-de-la-dordogne/
- O2 Care Services | id : o2-care-services-24 | secteur : social-personne | adresse FAUSSE à ne pas redonner : https://www.o2recrute.fr/nos-offres | site officiel connu : https://www.o2.fr
- Constructions Savignacoises Ferron | id : constructions-savignacoises-ferron-24 | secteur : btp | adresse FAUSSE à ne pas redonner : https://www.constructions-savignacoises.com/recrutement/ppd.php | site officiel connu : https://www.constructions-savignacoises.com/
- Fiducial Sécurité | id : fiducial-securite-24 | secteur : securite | adresse FAUSSE à ne pas redonner : https://www.fiducial.fr/Carrieres | site officiel connu : https://www.fiducial.fr
- Seris Security | id : seris-security-24 | secteur : securite | adresse FAUSSE à ne pas redonner : https://www.seris.fr/recrutement | site officiel connu : https://www.seris.fr
- Groupe Terres du Sud | id : terres-du-sud-24 | secteur : agriculture-nature | adresse FAUSSE à ne pas redonner : https://terresdusud-career.talent-soft.com/ | site officiel connu : https://terresdusud-career.talent-soft.com/offre-de-emploi/liste-toutes-offres.aspx?all=1&mode=list
- Apei Périgueux | id : apei-perigueux-24 | secteur : social-personne | adresse FAUSSE à ne pas redonner : https://www.apei-perigueux.org/recrutement | site officiel connu : https://www.apei-perigueux.org
- Conseil départemental de la Dordogne | id : conseil-departemental-dordogne-24 | secteur : administration | adresse FAUSSE à ne pas redonner : https://www.dordogne.fr/votre-departement/emplois-et-stages/offres-d-emploi | site officiel connu : https://www.dordogne.fr/votre-departement/emplois-et-stages
- Grand Périgueux | id : grand-perigueux-recrutement | secteur : administration | adresse FAUSSE à ne pas redonner : https://www.grandperigueux.fr/informations-transversales/offres-demploi | site officiel connu : https://www.grandperigueux.fr/
- Centre hospitalier de Sarlat | id : centre-hospitalier-sarlat-24 | secteur : sante | adresse FAUSSE à ne pas redonner : https://www.ch-sarlat.fr/recrutement/ | site officiel connu : https://emploi.fhf.fr/profil/etablissement/centre-hospitalier-de-sarlat
- Service départemental d'incendie et de secours de la Dordogne | id : sdis24-recrutement | secteur : securite | adresse FAUSSE à ne pas redonner : https://www.sdis24.fr/recrutement/ | site officiel connu : https://www.sdis24.fr/
- La Sécu recrute (CAF, CPAM, Carsat, Urssaf) | id : caf-cpam-carsat-urssaf-securecrute | secteur : administration | adresse FAUSSE à ne pas redonner : https://www.lasecurecrute.fr/home | site officiel connu : https://www.caf.fr/allocataires/caf-de-la-dordogne/nous-connaitre/recrutement
- Chambre d'agriculture de la Dordogne | id : chambre-agriculture-dordogne-recrutement | secteur : agriculture-nature | adresse FAUSSE à ne pas redonner : https://dordogne.chambres-agriculture.fr/recrutement | site officiel connu : https://dordogne.chambres-agriculture.fr
- CIRFA des Armées de Périgueux | id : cirfa-perigueux-recrutement | secteur : administration | adresse FAUSSE à ne pas redonner : https://www.sengager.fr/nous-rencontrer/cirfa-de-perigueux | site officiel connu : https://www.defense.gouv.fr/sga/nous-rejoindre/cirfa
- Terra'Job | id : terrajob-24 | secteur : sport-animation | adresse FAUSSE à ne pas redonner : https://terra-job.fr/offres-demploi/ | site officiel connu : https://terra-job.fr/
```

## Si l'assistant répond « introuvable » pour certains

Ce n'est pas un échec : l'employeur n'a peut-être pas de page de recrutement publique (certains n'affichent les offres que sur un portail d'État ou à l'accueil de leur site). Ces lignes sont alors écartées ou notées « pas de page propre », jamais complétées par une adresse venue d'un agrégateur.
