# Audit de conception du moteur de recommandation, réponse au texte d'un autre modèle (19/11/2026, consigne 489)

> Analyse seule, aucun code modifié. Mode A (décision de fond), effort haut. Mesures faites sur le vrai moteur après la correction des pourcentages (consigne 488).

## 1. Le vrai problème que résout le moteur

Le texte demande : « cherchons-nous des métiers qui ressemblent aux réponses, ou les métiers les plus compatibles avec la personne ? ». Notre moteur fait la **première** chose : il classe les métiers selon leur ressemblance avec ce que la personne a dit vouloir. Ce n'est pas équivalent à la compatibilité globale, qui supposerait de connaître ses capacités, ses limites de santé, son marché local : nous ne les connaissons pas et ne devons pas les deviner (public fragile, jamais de diagnostic). Conclusion : le choix est **bon**, mais le mot « Compatibilité » affiché sur les cartes promet plus que ce que le moteur fait. À dire « Ressemblance avec vos choix ».

## 2. Ce que j'ai vérifié (mesures du 19/11/2026)

| Essai | Résultat | Lecture |
|---|---|---|
| Deux profils presque identiques (un choix général ajouté) | 9 métiers sur 10 identiques en tête | Stable |
| Deux profils opposés (animaux et nature contre vente en magasin) | 0 métier sur 10 en commun | Sépare bien |
| Deux fois le même profil | Même résultat (tri sans hasard) | Déterministe |
| Choix contradictoires (bureau, extérieur, seul, clients, équipe) | 771 métiers, « Programmateur des travaux sur cordes » et « Ingénieur écologue » à 75 % | Les contradictions ne sont ni vues ni signalées |
| 15 choix hétéroclites | 3 métiers seulement, au plus 39 % | Honnête : peu de métiers retrouvent 6 choix sur 15 |
| Un seul choix général (« bureau ») | 655 métiers à 25 % | Honnête, liste très large |

## 3. Défauts de conception relevés

1. **Étiquettes bruitées à la source** (le plus important) : les listes « avec qui ou quoi, ce que je fais, où » de 1 790 fiches sont déduites du ROME par des règles automatiques, parfois trop larges. Le meilleur calcul du monde ne corrige pas une donnée fausse.
2. **Aucune notion d'incompatibilité** : on ne sait que « retrouvé » ou « non retrouvé ». « Bureau » et « extérieur » ne s'excluent pas dans les fiches, donc rien ne signale que ces choix tirent dans deux directions.
3. **Position dans la liste de la fiche** : le moteur donne plus de poids à un choix cité en tête de la liste d'un métier ; or cet ordre vient des règles automatiques, pas d'un jugement. Biais léger, non mesuré.
4. **Fiches de tailles très différentes** : un métier qui cite beaucoup d'éléments en retrouve plus par hasard.
5. **Deux populations de fiches** : une centaine de fiches écrites à la main (étiquettes soignées) et 1 790 générées. Leur traitement est équivalent, mais leur qualité ne l'est pas. À mesurer.
6. **Doubles comptages** : les compétences déduites des choix n'ont que 10 % du poids (déjà limité par la consigne 410). Pas de double comptage majeur trouvé dans le chemin 2.
7. **Chemin 1** : une compétence demandée par 511 métiers sur 1 919 (« autonomie ») pèse autant qu'une compétence rare. La rareté n'y est pas appliquée (elle l'est dans le chemin 2).
8. **Chemin 3 (RIASEC)** : deux ou trois lettres donnent des centaines de métiers à égalité ; le départage par le contenu est fait (consigne 488), mais la précision reste celle d'un questionnaire d'intérêts : une piste, jamais un verdict.

## 4. Verdict sur chaque idée du texte

| Idée | Faisable ? | Pourquoi / comment |
|---|---|---|
| Remettre en cause le problème (ressemblance contre compatibilité) | Oui | Garder la ressemblance ; changer le mot « Compatibilité » en « Ressemblance avec vos choix ». Coût faible, aucun risque de calcul. |
| Corriger les données sources | **Oui, priorité 1** | Corriger les règles de `scripts/importRome/tablesRome.js` (ex. « traite » reconnaît aussi « traitement »), régénérer depuis le paquet CSV (sur le poste), contrôle avant/après, liste des fiches modifiées. Risque moyen (1 790 fiches), maîtrisé par le contrôle. |
| Banc d'essai de profils difficiles (casser le moteur) | **Oui, priorité 1** | Fichier de profils rejouables (les 108 choix du chemin 2 avec leurs métiers d'exemple du catalogue, 10 codes RIASEC, 12 combinaisons du chemin 1, profils contradictoires, vides, très généraux), avec un test qui mesure : part des métiers d'exemple dans les 10 premiers, nombre d'égalités, stabilité. Sert à juger chaque réglage futur par des chiffres. |
| Seuils minimaux | Fait (consigne 488) | 40 % des choix retrouvés au moins. |
| Indice de confiance | Fait de fait | Le plafond selon le nombre de choix EST l'indice de confiance : peu de choix, pourcentage bas. À mieux expliquer à l'écran (déjà fait pour 1 et 2 choix). |
| Pénalité des choix non retrouvés, critères bloquants | **Partiel** | Faisable : signaler « ces choix tirent dans deux directions » (liste courte de couples opposés validée par Denis : bureau et extérieur, domicile et déplacement...). **Pas faisable comme barrage** : décision déjà prise par Denis (jamais un barrage, une condition difficile reste un « à vérifier »). |
| Détection des profils contradictoires | Oui, petit | Message neutre « Vos choix vont dans plusieurs directions » (jamais « vous êtes contradictoire »), sans changer le classement. |
| Rareté (poids des choix généraux) dans le chemin 1 | Oui, risque moyen | Appliquer la même pondération par rareté qu'au chemin 2 sur les compétences ; mesure avant/après avec le banc d'essai ; le classement change de façon visible, donc à valider. |
| Explication causale (« comment mes choix ont été traduits ») | **Oui** (consigne 487) | Par choix : retrouvé ou non, et dans quelle partie de la fiche. Maquette et questions à Denis d'abord ; point à trancher : montrer ou non les choix non retrouvés (règle « jamais ce qui manque » du chemin 1). |
| Choix prioritaires (la personne marque 1 à 3 choix essentiels) | Oui, plus tard | Réponse directe à « la compensation excessive » : un choix essentiel non retrouvé retire plus. Demande une maquette (nouveau geste pour un public fragile). À reporter. |
| Croiser RIASEC et choix en un seul profil | Possible, **pas maintenant** | Les trois chemins sont volontairement séparés ; « Ma synthèse » les croise déjà en lecture. Fusionner les calculs change le produit : décision de Denis, après les essais réels. |
| Similarité vectorielle, cosinus, apprentissage automatique, filtrage collaboratif | **Non** | Aucun jeu de données d'usage ni de vérité terrain (application statique, sans compte, sans serveur, vie privée) : impossible de régler ou valider autre chose que des pondérations à la main. Une formule plus savante ne serait ni plus juste ni explicable à un conseiller. Mieux vaut des ensembles pondérés par la rareté, comme maintenant. |
| Capacités, limitations physiques ou de santé comme critères | **Non** | Données sensibles, non collectées, risque de diagnostic sur la personne (interdit par nos règles), et le ROME ne les décrit que grossièrement. Les « conditions de travail » facile ou difficile couvrent l'essentiel sans rien diagnostiquer. |
| Tests utilisateurs avec comparaison A/B | **Non en l'état** | Pas d'outil de mesure ni de panel ; Denis est l'utilisateur de validation. Le banc d'essai le remplace en partie. |

## 5. Architecture idéale (dans nos contraintes) et écarts

Idéal : (1) des fiches dont les étiquettes sont fiables, (2) un score de ressemblance par ensembles pondérés par la rareté, plafonné par la quantité d'information, (3) un seuil minimal de choix retrouvés, (4) un départage par le contenu, (5) une explication par choix, (6) un banc d'essai qui mesure tout changement, (7) des messages honnêtes quand rien ne correspond.

Écarts classés : **1** étiquettes bruitées (fort) ; **2** pas de banc d'essai permanent (fort : sans lui, on règle à l'aveugle) ; **3** rareté absente du chemin 1 (moyen) ; **4** explication par choix absente (moyen, consigne 487) ; **5** mot « Compatibilité » trompeur (faible coût) ; **6** contradictions non signalées (faible) ; **7** choix prioritaires (plus tard).

## 6. Ordre de travail proposé

1. Banc d'essai rejouable (effort moyen, aucun risque : il ne change rien à l'application).
2. Correction des étiquettes à la source, mesurée par le banc d'essai (effort haut).
3. « Ressemblance avec vos choix » à la place de « Compatibilité » (effort bas).
4. Rubrique « comment mes choix ont été traduits », maquette d'abord (effort haut).
5. Rareté dans le chemin 1 (effort moyen).
6. Message « vos choix vont dans plusieurs directions » (effort bas).
7. Appellations des métiers et cinq appellations dans la demande d'offres (effort moyen, consigne 487).
