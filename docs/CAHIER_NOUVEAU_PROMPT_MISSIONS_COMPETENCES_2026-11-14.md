# Cahier du nouveau prompt « missions et compétences choisies par la personne » (14/11/2026)

Fichier de notes vivant : tout ce que le futur prompt devra respecter est consigné ici AU FIL de la maquette et du code, pour ne rien oublier au moment de l'écrire. Ce prompt est distinct de `prompts/cv.md` (qui reste intact pour le parcours actuel : zéro régression). Il s'en inspire fortement, mais les informations sont déjà données par la personne : l'assistant n'a rien à chercher.

## 1. Missions, compétences et activités plus précises
- Les **missions** sont les 5 à 7 grandes activités d'un métier (champs `m` et `mi` des fiches ROME).
- Les **activités plus précises** (champ `k`) sont des **compétences détaillées**, formulées comme des actions. Elles restent dans le bloc « Vos compétences » (rubrique repliée « Activités plus précises »). Elles ne remontent JAMAIS dans « Vos missions » (décision et confirmation Denis, 14/11/2026).
- Le prompt doit traiter les activités précises comme des compétences : jamais comme des missions, jamais recopiées dans les missions.
- Surveiller le recoupement de sens entre une mission et une activité précise (ex. « Contribuer au maintien et au développement de l'autonomie de la personne accompagnée » et « Contribuer à maintenir et développer l'autonomie des personnes ») : une même idée ne doit pas apparaître deux fois sur le CV.

## 2. Doublons
- Aucune compétence deux ou trois fois sur le CV (entre expériences, entre savoir-faire et activités précises).
- Mêmes règles anti-doublon que `cv.md` pour les missions d'un même métier réparties entre plusieurs expériences.

## 3. Accord homme/femme
- Passer la civilité de la personne au prompt (à vérifier : `dossier.identite.civilite` arrive-t-elle jusqu'aux prompts ?).
- N'accorder que ce qui change : adjectifs, participes, intitulés de métier. Les missions à l'infinitif et les compétences en noms restent invariables.
- Contrôle par le code en plus : repérer un intitulé masculin dans une phrase au féminin.

## 4. Métier sans fiche
- L'assistant propose missions et compétences, qui arrivent sur l'écran de choix existant (à cocher).
- Ordre : fiches proches d'abord (seuils à régler sur des cas réels : 0,75 et plus, 0,5 à 0,75, sous 0,5), puis le secteur avec bouton pour parcourir ses métiers, puis tous les secteurs.

## 5. Longueur des phrases (à décider)
- Constat mesuré sur les fiches ROME : 19 % des missions (1 937 sur 10 200) dépassent 15 mots, 409 dépassent 20 mots ; 6 % des activités précises (2 980 sur 47 480) dépassent 15 mots, 629 dépassent 20 mots (maximum 38 mots).
- Souhait de Denis : pouvoir raccourcir les phrases trop longues, en nombre de mots, sans appauvrir le sens, pour des textes plus directs. Jamais de coupure mécanique en milieu de phrase.
- Deux pistes, rien décidé : (a) réécriture en amont, une fois pour toutes, dans les données (comme les phrases prêtes à cocher) ; (b) raccourcissement par l'assistant, à la demande, sur les seules phrases cochées. Choix à présenter à Denis avec bénéfices et risques de chaque piste.

## 6. Comparaison avec le métier visé
- Mesure du 14/11/2026 sur le métier visé d'exemple (AES, K1306) : ses compétences ne sont pas propres à ce métier. Savoir-faire portés par 87 à 251 fiches sur 1 790, savoir-être par 273 à 1 138 fiches (« Rigueur » : 1 138), savoirs plus spécifiques (de 2 à 56 fiches, ex. « Techniques de manipulation de la personne âgée ou accompagnée » : 2 fiches).
- Conséquence : une compétence « pas encore couverte » est le plus souvent une compétence courante que la personne n'a simplement pas cochée, pas une compétence rare. Le prompt (et les libellés) doivent le dire simplement, sans jamais laisser entendre un manque de la personne.

## 7. Principes du parcours avec assistant (Denis, 14/11/2026, consigne 299)
- **Deux chemins** quand la personne choisit de faire son CV avec l'assistant en ligne : (a) elle choisit elle-même ses missions et compétences dans l'étape, et l'assistant reçoit ces choix : nouveau prompt ; (b) comme aujourd'hui, `cv.md` sans aucun changement. Règle proposée pour distinguer les deux sans question supplémentaire : des choix faits dans l'étape donnent le chemin (a) ; l'étape passée (« Passer cette étape ») donne le chemin (b).
- **Jamais d'écrasement** des choix de la personne : ils restent visibles, tels qu'elle les a faits, du début à la fin.
- **Les compléments sont mis en évidence**, séparés des choix de la personne, et la personne décide de les ajouter ou non (elle les juge valorisants ou pas). Ils arrivent sur l'écran de choix existant, à cocher, jamais appliqués d'office.
- **Doublons** : l'assistant repère un doublon entre les choix de la personne (et avec ses compléments) et le signale ; il ne supprime pas à sa place.
- **Phrases trop longues** : les rares phrases longues sont raccourcies légèrement, pour tenir en quelques mots sur le CV (jamais deux lignes de description). Sans assistant, ce raccourcissement ne peut pas venir de l'assistant : il doit être fait EN AMONT dans les données (voir plan, lot 8).
