# Qui fait quoi : message UNIQUE pour Perplexity, vérification des doutes de la Haute-Vienne

> Écrit le 2026-10-17. Denis a peu de messages sur Perplexity : tout ce qui reste douteux après le contrôle automatique est regroupé dans **un seul message**. Contrôle automatique : `docs/VERIFICATION_RECRUTEURS_HAUTE_VIENNE_2026-10-17.md` (41 adresses au sas `outils/sas/recruteurs87.sas.txt` : 29 répondent, 12 non contrôlables depuis ici ; 8 domaines inexistants et 3 doublons retirés).
>
> **Mode d'emploi** : copiez l'encadré ci-dessous en entier dans UN message Perplexity (mode recherche, pas de question de retour). Collez la réponse entière à Claude.

```
Je vérifie des pages de recrutement d'employeurs de la HAUTE-VIENNE (87), pour une page d'information destinée à des personnes qui cherchent un emploi. Je ne publie AUCUNE offre : je donne seulement l'adresse de la page où l'employeur publie ses offres. Réponds en UNE SEULE fois, sans me poser de question et sans découper ta réponse.

RÈGLES, à suivre à la lettre :
1. Une page n'est retenue que si elle appartient à l'employeur lui-même (ou au logiciel de recrutement officiel vers lequel SON site renvoie) et si tu l'as réellement ouverte AUJOURD'HUI et vue lister des offres. Interdits : Indeed, Jooble, Optioncarrière, Cadremploi, Hellowork, Welcome to the Jungle, Meteojob, LinkedIn, Glassdoor, Jobijoba, France Travail, agences d'intérim, tout site qui recopie des offres.
2. N'invente JAMAIS une adresse et ne la devine pas : si tu n'as pas pu ouvrir la page, écris « introuvable » ou « non vérifiable » dans la colonne de l'adresse. Une page de contact, d'accueil ou de présentation sans liste d'offres n'est pas une page de recrutement.
3. Date de la plus récente : date de publication (AAAA-MM-JJ) lue sur la page, vide si la page n'en affiche pas (« Aujourd'hui » et les dates limites de candidature ne comptent pas). Offres vues : le nombre lu sur la page, ou « plusieurs ».
4. Pour les employeurs nationaux, dis si au moins une offre est située en Haute-Vienne ou à Limoges aujourd'hui (colonne « en Haute-Vienne » : oui / non / non vérifiable).

FORMAT DE LA RÉPONSE, deux blocs seulement :
BLOC 1, un seul bloc de code, une ligne par employeur de la liste ci-dessous (garde l'id donné), au format exact :
id | page de recrutement | offres vues | date de la plus récente | compte demandé (oui/non) | en Haute-Vienne (oui/non/non vérifiable) | remarque en 10 mots au plus
BLOC 2 : la liste des id que tu proposes d'ÉCARTER, avec une raison de 8 mots au plus (par exemple « aucune offre listée », « page de contact seulement »).

PARTIE A : ces 12 adresses sont données par un assistant mais n'ont pas pu être contrôlées (le site refuse les robots). Ouvre chacune, dis si elle liste des offres, et corrige l'adresse si elle est fausse.
- Korian | id : korian-87 | adresse à tester : https://recrutement.korian.fr/ (Korian s'appelle aujourd'hui emeis : donne la page de recrutement officielle d'emeis, avec ses offres en Haute-Vienne)
- Ville de Saint-Junien | id : ville-saint-junien-87 | adresse à tester : https://saint-junien.gestmax.fr/search
- Carrefour | id : carrefour-87 | adresse à tester : https://recrute.carrefour.fr/search?query=&location=Limoges
- Ville de Panazol | id : ville-panazol-87 | adresse à tester : https://www.panazol.fr/ma-ville/la-mairie-recrute/
- Hôpital intercommunal du Haut-Limousin (Bellac) | id : hopital-haut-limousin-87 | adresse à tester : https://hopital-hautlimousin.nous-recrutons.fr/
- Centre hospitalier Jacques Boutard de Saint-Yrieix-la-Perche | id : ch-saint-yrieix-87 | adresse à tester : https://ch-saintyrieix.nous-recrutons.fr/
- Centre hospitalier de Saint-Junien | id : ch-saint-junien-87 | adresse à tester : https://ch-saintjunien.nous-recrutons.fr/
- Ministère de l'Intérieur, recrutements de la zone de défense Sud-Ouest | id : ministere-interieur-zone-sud-ouest-87 | adresse à tester : https://www.interieur.gouv.fr/ministere/metiers-du-ministere/je-veux-devenir-agent-public/recrutements-ouverts-de-zone-de-defense-et-de-securite-sud-ouest
- Académie de Limoges, espace recrutement | id : academie-limoges-87 | adresse à tester : https://www.ac-limoges.fr/espace-recrutement-123263
- CROUS de Limoges | id : crous-limoges-87 | adresse à tester : https://recrutement.lescrous.fr/
- Gendarmerie nationale, centre d'information et de recrutement de Limoges | id : gendarmerie-cir-limoges-87 | adresse à tester : https://www.gendarmerie.interieur.gouv.fr/recrutement/contact/centre-d-information-et-de-recrutement-de-limoges-haute-vienne-87 (cette page est une fiche de contact : donne la page qui liste réellement des recrutements ou des concours de la gendarmerie)
- CCI Limoges et Haute-Vienne | id : cci-limoges-87 | adresse à tester : https://www.limoges.cci.fr/les-offres-demploi-en-haute-vienne

PARTIE B : ces 8 employeurs n'ont pas de bonne adresse (l'adresse donnée n'existe pas). Trouve en partant de leur site officiel la page où ils listent leurs offres, ou écris « introuvable ».
- emeis (ex-Korian), maison de retraite et soins : l'adresse donnée n'existe pas | id : emeis-87 | secteur : sante | territoire : national
- Centre départemental de l'enfance et de la famille de la Haute-Vienne (CDEF 87) : l'adresse donnée n'existe pas | id : cdef87-87 | secteur : social-personne | territoire : Haute-Vienne
- Groupama Centre-Atlantique : l'adresse donnée n'existe pas | id : groupama-centre-atlantique-87 | secteur : banque-assurance-immobilier | territoire : national
- Sogelink (Limoges) : l'adresse donnée n'existe pas | id : sogelink-87 | secteur : numerique | territoire : national
- Arquus (Limoges) : l'adresse donnée n'existe pas | id : arquus-limoges-87 | secteur : industrie | territoire : national
- Covéa : l'adresse donnée n'existe pas | id : covea-87 | secteur : banque-assurance-immobilier | territoire : national
- Ville de Limoges : trouve la page où sont listées les offres d'emploi de la mairie (les adresses recrutement.limoges.fr n'existent pas ; deux autres adresses sont déjà connues, ne les redonne pas sauf si ce sont les bonnes) | id : ville-limoges-87 | secteur : administration | territoire : Haute-Vienne
- Limoges Métropole : trouve la page où sont listées les offres (recrutement.limoges-metropole.fr n'existe pas) | id : limoges-metropole-87-bis | secteur : administration | territoire : Haute-Vienne

PARTIE C : ces 5 adresses répondent, mais un doute reste. Vérifie ce qui est indiqué.
- Sopra Steria | id : sopra-steria-87 | adresse à tester : https://careers.soprasteria.fr/Jobs (vérifie surtout que des offres sont situées en Haute-Vienne ou à Limoges)
- Groupe Atlantic | id : groupe-atlantic-87 | adresse à tester : https://groupe-atlantic.nous-recrutons.fr/ (vérifie surtout que des offres sont situées en Haute-Vienne ou à Limoges)
- Cerfrance Centre Limousin | id : cerfrance-centre-limousin-87 | adresse à tester : https://centre-limousin.cerfrance.fr/recrutement/ (date annoncée ancienne : 2026-07-07 ; vérifie si des offres sont encore publiées aujourd'hui)
- GEIQ SAGe | id : geiq-sage-87 | adresse à tester : https://www.geiqsage.org/nos-offres-demploi/ (date annoncée ancienne : 2026-02-16 ; vérifie si des offres sont encore publiées aujourd'hui)
- Chambre d'agriculture de la Haute-Vienne | id : chambre-agriculture-haute-vienne-87 | adresse à tester : https://haute-vienne.chambres-agriculture.fr/votre-chambre/nos-offres-demploi (date annoncée ancienne : 2026-06-05 ; vérifie si des offres sont encore publiées aujourd'hui)
```

## Ce que Claude fera de la réponse

1. Mettre à jour `outils/sas/recruteurs87.sas.txt` (adresses corrigées, lignes écartées), relancer le contrôle automatique.
2. Remettre à Denis la liste des pages à ouvrir à la main, par secteur. Aucune fiche n'est publique avant le « C'est bon » de Denis.
