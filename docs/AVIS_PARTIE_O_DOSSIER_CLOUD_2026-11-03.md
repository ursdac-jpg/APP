# Partie O du dossier Cloud : mon avis, mes recommandations, le coût de chaque idée (03/11/2026)

Étape 9 du plan de reprise. **Rien n'est codé et rien ne le sera sans votre accord, une maquette et un plan par étapes.** La partie O est un avis d'analyste écrit par l'autre compte ; ceci est ma lecture, après avoir intégré le reste du dossier (je connais maintenant l'état réel du code et des fichiers).

Les efforts suivent l'étiquette du projet : bas (une séance courte), moyen, haut (plusieurs séances, maquette, tests). Le risque est dit en conséquence concrète.

## 1. En deux phrases

Le plus rentable, c'est de **donner à chaque lieu une vraie adresse** (aujourd'hui elle n'existe pas dans le fichier : les 190 institutions récentes la gardent dans la colonne « Source »), puis d'écrire **une page « Délais à ne pas rater »** avec ce que la veille a déjà établi. Le plus tentant mais le plus fragile, c'est l'indicateur « secteur qui recrute » : à faire, mais seulement après avoir vérifié que les chiffres départementaux existent et se rattachent à nos 21 secteurs.

## 2. Les constats chiffrés de O.1

| Constat du dossier | Mon verdict | Effort | Pourquoi |
|---|---|---|---|
| 1. Registre inégal entre les deux départements | **Oui, en interne seulement** | bas | Un tableau de couverture (rayon par département) dans l'outil de veille, jamais affiché au public. Utile pour savoir où chercher ensuite. |
| 2. 37 % du registre « à part » | **Déjà traité** | nul | Ces 561 lignes sont marquées « à contrôler par le responsable » au sas depuis le 03/11/2026 ; un indicateur public « lu / non lu » ferait douter pour rien. |
| 3. Adresse absente des lieux | **Oui, c'est la priorité n° 1** | moyen | Voir le point 3 ci-dessous. |
| 4. Registre d'adresses sans ligne locale en Haute-Vienne | **Déjà en cours** | bas | La migration des lignes 87 est connue ; les institutions de la partie N en ajoutent 190 au sas. |
| 5. Tableau des valeurs datées | **Oui, en l'étendant à ce qui existe** | moyen | Le Lexique a déjà le bloc « Les chiffres à jour » (date, source, ligne) et le contrôle `checkLexique.js` le réclame pour tout chiffre. Ce qui manque, c'est la même chose pour les fiches de « Comprendre le cadre ». |
| 6. Niveau de preuve visible | **Non, pas en public** | nul | Les fiches portent déjà « vérifié le » et leurs sources ; ajouter « lu / résumé / titre seul » exposerait notre cuisine interne à un public fragile. À garder dans l'outil de veille. |
| 7. Étiquettes « public » et « moment du parcours » | **Plus tard, sur un seul rayon d'abord** | moyen à haut | Utile pour voir les trous, mais 145 fiches à étiqueter à la main : à tester sur un rayon pour mesurer le coût réel. |
| 8. Mesure d'usage Umami | **Oui, à votre initiative** | nul pour moi | Je n'ai pas accès aux statistiques : c'est vous qui les lisez. Les rayons les plus lus et les recherches sans résultat devraient décider de la suite. |

### Point 3, l'adresse des lieux : ce que j'ai constaté dans le code
- Le fichier des lieux n'a **pas de colonne adresse** (colonnes : id, type, nom, description, commune, zone, téléphone, site, portée, rayons, source, date, mail).
- Ajouter une colonne touche **six endroits** : `modules/mon-territoire/logique.js` (liste des colonnes, contrôles, affichage), `outils/veilleSas.js`, `outils/veilleTerritoire.js`, `outils/veilleVerification.js`, `outils/veille.html`, `tests/veilleSas.test.js`, plus la migration des 194 lieux publiés et des 706 du sas (l'adresse y est déjà, dans « Source », pour les 190 institutions).
- **Risque** : si je rate un des six, le contrôle du sas ou l'affichage casse ; c'est exactement le cas de la leçon « grep sur tout le dépôt ». Mesure de sécurité : colonne ajoutée **à la fin**, optionnelle, ancienne forme toujours lue.
- **Effort moyen**, avec une maquette de la fiche « lieu » (adresse, horaires, téléphone, date de vérification) avant tout code.

## 3. O.2, la marque sur les fiches d'employeurs

**Je suis d'accord avec l'avis du dossier : des repères neutres, jamais un label.** Précisions de ma part :

- **Les repères de candidature : oui.** Ce qu'il faut déjà est dans nos données : page de recrutement, modes de candidature (spontanée, portail, concours, intérim), date de vérification. Effort **bas à moyen** (affichage, pas de nouvelle donnée).
- **Les repères d'identité (taille, année de création) : attendre.** J'ai testé l'API Sirene aujourd'hui : la tranche d'effectif porte sur l'**entreprise** (le groupe entier), pas sur l'établissement du territoire. Une usine locale dépendant d'un grand groupe serait affichée « 1000 à 1999 salariés » : trompeur pour quelqu'un qui cherche un contact local. **Risque concret** : un public fragile lirait « grosse structure » comme « on y recrute ».
- **Le filtre par taille : non**, pour la même raison.
- **Jamais d'étoile, de couronne ni de classement.**

## 4. O.3, l'indicateur « secteur qui recrute »

**Oui à l'idée, avec trois conditions.** L'avis du dossier est juste : volume, tension et évolution disent trois choses différentes, et un seul symbole serait faux (le bâtiment, par exemple).

1. **Vérifier d'abord la source** : les chiffres de l'enquête Besoins en main-d'œuvre 2026 par département n'ont pas été lus par l'autre compte et je ne les ai pas encore chargés. **Si ces données n'existent pas au niveau département, l'indicateur n'est pas faisable proprement** : je le dirai alors clairement plutôt que d'afficher un chiffre régional déguisé.
2. **Une table de correspondance** entre nos 21 secteurs et la nomenclature de l'enquête, à faire valider par vous (les deux listes ne se recouvrent pas un pour un).
3. **Version simple d'abord** : un encadré en haut de la page secteur (les 5 métiers les plus recherchés et la part jugée difficile, avec l'année et la source), la phrase fixe « Cela ne veut pas dire qu'un employeur précis recrute », ni flèche ni couleur.

**Effort haut** (données, table, page, tests, mise à jour annuelle). **Risque** : un chiffre périmé ou mal rattaché induit les gens en erreur ; d'où la date et la source toujours visibles.

## 5. O.4, les quatorze idées de conception

| N° | Idée | Mon verdict | Effort | Remarque |
|---|---|---|---|---|
| 1 | Fiche « lieu » complète et datée | **Oui, en premier** | moyen | C'est le point 3 ci-dessus. |
| 2 | Entrée par situation (« je viens de perdre mon emploi »...) | **Oui, après maquette** | haut | Tout le contenu existe ; c'est l'ordre qui manque. Proche de la carte « Votre objectif » : à ne pas dupliquer. |
| 3 | Page « Délais à ne pas rater » | **Oui, en deuxième** | bas à moyen | Les délais sont déjà établis (ACRE au 60e jour, congé de naissance sous 9 mois, contestation d'un avis d'inaptitude sous 15 jours...). Un tableau daté, alimenté par la veille. |
| 4 | Espace « Professionnels » | **Plus tard** | haut | Très utile, mais c'est un module entier : à cadrer quand les modules en cours seront finis. |
| 5 | Niveau de preuve visible | **Non en public** | nul | Voir O.1 point 6. |
| 6 | Cartographie avec temps de transport | **Non pour le moment** | très haut | L'application est statique, sans service externe et sans données personnelles : une carte demande des fonds de carte tiers et des horaires de transport mis à jour. Un renoncement dit clairement vaut mieux qu'un faux espoir. |
| 7 | Comparateurs de dispositifs | **Plus tard, avec prudence** | moyen | Des questions fermées donnent vite l'impression d'un conseil personnalisé : la ligne entre information et conseil juridique est à écrire avec soin. |
| 8 | Alertes arnaques | **Oui** | bas | Une rubrique courte, alimentée par la veille (l'alerte de l'Agefiph est déjà au Lexique depuis aujourd'hui). |
| 9 | Accessibilité et langues | **Version imprimable et langage simplifié : plus tard ; audio et langues : non** | haut | Cela rejoint le chantier d'accessibilité prévu après les modules. L'audio et les traductions coûtent cher à maintenir et à relire. |
| 10 | Bouton « signaler une erreur ou un changement » | **Oui** | bas à moyen | Le formulaire de retours des beta-testeurs existe déjà : un bouton qui l'ouvre avec la fiche en cours préremplie suffit, sans serveur. |
| 11 | Relecteurs institutionnels | **Démarche humaine, pas du code** | nul en code | À proposer à quelques structures partenaires ; je prépare un texte si vous le souhaitez. |
| 12 | Observatoire local, bulletin du mois | **Réserve** | haut | Dépend de la veille automatique (outils installés aujourd'hui) et de vos disponibilités. |
| 13 | Parcours pour les professionnels | **Plus tard** | haut | Même remarque que le n° 4. |
| 14 | Page « Employeurs qui accueillent » | **Oui** | bas à moyen | Un filtre sur les fiches déjà créées (insertion, entreprises adaptées, clauses sociales) ; jamais de classement. |

## 6. L'ordre que je recommande

1. **Maquette de la fiche « lieu »** (adresse, horaires, téléphone, date) puis colonne adresse (n° 1). 
2. **« Délais à ne pas rater »** (n° 3) et **alertes arnaques** (n° 8) : peu coûteux, appuyés sur ce que la veille a déjà établi.
3. **Bouton « signaler »** (n° 10) et **page « Employeurs qui accueillent »** (n° 14).
4. **Vérifier la source des chiffres départementaux** (O.3), puis décider si l'indicateur est faisable.
5. Les gros chantiers (entrée par situation n° 2, espace professionnels n° 4) quand les modules en cours seront finis.

## 7. Ce que j'ai besoin que vous tranchiez

- Voulez-vous la **fiche « lieu » complète** en premier ? (ma recommandation : oui)
- Voulez-vous que je **vérifie dès maintenant si les chiffres départementaux de l'enquête Besoins en main-d'œuvre existent** avant de décider de l'indicateur ? (ma recommandation : oui, c'est une vérification de moins d'une heure, sans code)
- **Annulation** : ces idées ne sont engagées nulle part ; les écarter ne coûte rien.

## 8. Vérification faite le 03/11/2026 : les chiffres départementaux de l'enquête BMO 2026 existent

Denis a dit « oui, les deux » : voici le résultat de la vérification des chiffres, sans une ligne de code dans l'application.

**Source** : fichier officiel de France Travail « Enquête Besoins en Main d'Oeuvre (BMO) » sur data.gouv.fr (licence ouverte, mis à jour le 21/04/2026, format tableur, 3,7 Mo). Fichier téléchargé dans un dossier de travail à part, jamais ajouté au dépôt, lu comme des données seulement.

**Ce qu'il contient pour nos deux départements** :
- une ligne par métier, par bassin d'emploi et par comité local, avec trois nombres : projets de recrutement, projets jugés difficiles, projets saisonniers ;
- Dordogne : 441 lignes, 158 métiers, 3 bassins (Périgueux Nord-Est Dordogne, Est Dordogne, Bergerac) ; **au moins 16 485 projets** ;
- Haute-Vienne : 432 lignes, 174 métiers, 4 bassins (Limoges, Bellac, Saint-Junien, Saint-Yrieix) ; **au moins 10 332 projets**.

**Trois réserves honnêtes, qui changent la façon de l'afficher** :
1. **Le fichier classe par métier (nomenclature FAP 2021), pas par secteur.** Il faudra une table de correspondance de plusieurs centaines de métiers vers nos 21 secteurs, relue par Denis. Ce n'est pas un calcul automatique.
2. **Beaucoup de cases sont masquées (secret statistique)** : environ 45 % des nombres en Dordogne et 54 % en Haute-Vienne, remplacés par une étoile. Les totaux calculés sont donc des **minimums**, jamais des chiffres exacts. L'affichage devra dire « au moins » ou n'afficher que des repères (les métiers les plus recherchés), pas de total précis ni de comparaison entre départements.
3. **Les saisonniers pèsent énormément** : en Dordogne, 1 383 des 1 447 projets de viticulteurs sont saisonniers, 1 145 des 1 212 pour les agriculteurs, et le tourisme (serveurs, hôtellerie, cuisine) suit. Une personne cherchant un emploi durable serait trompée par un classement brut. Il faut séparer « emplois saisonniers » et « emplois durables ».

**Premiers repères lisibles (à ne pas publier tels quels)** : Dordogne, les plus recherchés sont viticulteurs et arboriculteurs, agriculteurs, aides de cuisine, serveurs, employés de l'hôtellerie ; Haute-Vienne : agriculteurs, aides de cuisine, aides-soignants, serveurs, cuisiniers, aides à domicile. Les métiers du soin et de l'aide à domicile sont les moins saisonniers et les plus jugés difficiles : ce sont ceux qui sont durables.

**Verdict** : l'indicateur de secteur est **faisable, en version prudente** : un encadré « métiers les plus recherchés » par département, avec « au moins », l'année, la source, un tri durable / saisonnier et la phrase fixe « cela ne veut pas dire qu'un employeur précis recrute ». Pas d'indicateur unique ni de flèche. **Effort haut** inchangé ; la table de correspondance est le plus gros morceau (une séance de relecture pour Denis). Pas de code avant votre feu vert et une maquette.
