# Conception d'un moteur de recommandation de métiers explicable pour un outil d'orientation professionnelle

> Exercice demandé par Denis le 19/11/2026 (consigne 490) : défendre chaque choix devant un jury (psychologue de l'orientation, data scientist, ergonome, conseiller en insertion, architecte logiciel). Aucun code modifié. Mode A, effort haut.

## Résumé

Nous décrivons un moteur de recommandation pour des personnes éloignées de l'emploi, peu à l'aise avec le numérique et en confiance fragile. Il fonctionne sans serveur, sans compte et sans données d'usage. Nous défendons une position volontairement modeste : le moteur ne prédit pas l'adéquation d'une personne à un métier, il **classe des pistes selon leur ressemblance explicable avec ce que la personne a choisi**, dit son degré de confiance, et aide à **réduire** le champ plutôt qu'à l'élargir. Chaque score est la somme de contributions lisibles par choix ; chaque limite est annoncée.

## 1. Exigences

E1 explicable par un conseiller en une phrase ; E2 déterministe et stable ; E3 honnête sur l'incertitude (peu d'information, peu de confiance) ; E4 aucun diagnostic sur la personne ; E5 local, statique, maintenable par un non-programmeur ; E6 aucun faux espoir (« nous ne connaissons pas de métier » est une réponse valable) ; E7 aide à décider, pas seulement à lister.

## 2. Décisions, alternatives, objections du jury

| # | Décision | Alternatives écartées | Justification | Objection du jury et réponse |
|---|---|---|---|---|
| D1 | Formuler le problème comme une **ressemblance explicable** entre choix et fiches | Prédiction d'adéquation (apprentissage automatique) ; compatibilité globale (capacités, santé, marché) | Aucune vérité terrain ni donnée d'usage ; la compatibilité globale supposerait de collecter des données sensibles | *Psychologue* : pas de validité prédictive. Réponse : nous ne la revendiquons pas ; validité de contenu et d'apparence seulement, dite à l'écran (« pistes, pas réponse unique ») |
| D2 | Référentiel officiel (ROME) et étiquettes **dérivées par règles**, puis auditées | Étiquetage manuel de 1 919 fiches ; étiquetage par modèle de langage | Les règles sont reproductibles et corrigeables en un endroit ; l'étiquetage manuel est hors de portée d'une personne seule ; un modèle de langage n'est ni reproductible ni vérifiable | *Data scientist* : le bruit d'étiquette plafonne la qualité. Réponse : c'est le premier défaut mesuré ; audit par échantillon et corrections à la source avant tout réglage fin |
| D3 | Score = **part pondérée des choix retrouvés**, poids par rareté (un choix répandu pèse moins) | Cosinus sur vecteurs ; régression ; méthodes multicritères (AHP, TOPSIS) ; réseau de neurones | Le score est une somme de contributions que l'on peut montrer ; les méthodes multicritères exigent des poids exprimés par la personne, que ce public ne sait pas donner ; le cosinus cache le « pourquoi » | *Architecte* : pourquoi pas plus savant ? Réponse : sans données pour caler ou valider, la sophistication est de l'apparence |
| D4 | **Plafond selon le nombre de choix** (25, 40, 55, 65, 75, 82, 88, 94, 100 %) | Borne prudente statistique (n sur n+3, qui plafonne vers 75 %) ; pas de plafond | Un pourcentage doit croître avec l'information (demande de Denis) ; la table est monotone et facile à dire | *Data scientist* : la table n'est pas calibrée. Réponse : exact, c'est une heuristique de prudence, pas une probabilité ; nous ne l'appelons jamais « probabilité » et la borne statistique donne un résultat voisin sans plus de preuve |
| D5 | **Seuil minimal** : au moins 40 % des choix retrouvés | Score purement compensatoire (un choix très bien retrouvé efface les autres) | Évite les métiers qui ne retrouvent qu'un choix sur cinq | *Psychologue* : un seuil arbitraire. Réponse : réglable et mesuré par le banc d'essai ; la valeur sera revue sur les cas réels |
| D6 | Les **refus** (à éviter) et conditions difficiles **font descendre nettement et sont signalés, sans jamais exclure en silence** | Filtre dur ; ignorer les refus | Les étiquettes sont bruitées : un filtre dur crée des faux négatifs invisibles et irréversibles ; un refus est pourtant l'information la plus fiable que donne une personne | *Conseiller* : un métier qui demande ce que la personne refuse ne devrait pas être en tête. Réponse : il descend et porte « à vérifier : demande X, que vous voulez éviter » |
| D7 | Présenter **peu de pistes, regroupées en directions**, avec « x sur y choix retrouvés » avant le pourcentage ; proposer « retirer le choix qui bloque » | Liste longue triée ; pourcentage seul | Un public à confiance fragile se décourage devant 300 lignes ; le pourcentage s'entend comme une note sur soi | *Ergonome* : le pourcentage ancre le jugement. Réponse : à trancher par Denis (voir la décision ouverte ci-dessous) |
| D8 | **Explication causale** : par choix, retrouvé ou non, et où dans la fiche | Phrase générique après coup | Le score étant la somme de ces contributions, l'explication n'est pas une justification a posteriori | *Conseiller* : lisible en une phrase. Réponse : « 3 de vos 4 choix : animaux, plantes, espaces verts » |
| D9 | Évaluation par **banc d'essai de cohérence + jury d'experts** (Denis, conseillers) | Tests A/B ; validation prédictive | Pas de panel ni de données ; le jugement d'experts sur 30 profils × 5 métiers (« pertinent », « acceptable », « absurde ») est faisable et suffisant pour détecter l'absurde | *Data scientist* : les métiers d'exemple du catalogue sont circulaires (écrits avec les mêmes étiquettes). Réponse : d'où le jury humain, indépendant des étiquettes |
| D10 | **Local, statique, déterministe**, sans stockage de choix sauf demande | Serveur, comptes, journalisation | Vie privée du public, maintenance par une seule personne | *Architecte* : pas d'amélioration continue par les données. Réponse : assumé ; l'amélioration passe par le jury et le banc d'essai |

## 3. Décision ouverte pour Denis : le pourcentage

Option A (**recommandée**) : garder le pourcentage, plafonné, toujours accompagné de « x sur y choix retrouvés » et d'une barre. Bénéfice : repère simple, souhaité par Denis, cohérent avec les autres écrans. Risque : lu comme une note sur soi par une personne fragile.
Option B : remplacer par trois mentions (« retrouve tous vos choix », « la plupart », « quelques-uns »). Bénéfice : moins d'ancrage chiffré, plus honnête sur la précision. Risque : moins de nuance pour classer, rupture avec l'existant.

## 4. Menaces à la validité

Étiquettes dérivées par règles (bruit) ; table de plafond non calibrée ; seuil de 40 % arbitraire ; métiers d'exemple circulaires ; questionnaire d'intérêts court et non validé en population ; aucune mesure d'effet réel sur les parcours des personnes.

## 5. Architecture proposée (celle que je choisirais)

1. **Données** : fiches ROME, étiquettes dérivées par règles versionnées, régénérables, avec un contrôle avant et après à chaque correction.
2. **Choix de la personne** : trois familles (avec qui ou quoi, ce que je fais, où) + **à éviter** (même liste, signe inverse) + conditions facile ou difficile + au plus trois choix marqués « essentiels ».
3. **Score de ressemblance** : part pondérée par la rareté des choix retrouvés ; essentiels comptés double ; refus retranchés ; départage par le contenu.
4. **Confiance** : plafond selon le nombre de choix ; seuil minimal ; message honnête si rien ne correspond.
5. **Réalisme** : niveau d'accès toujours affiché, jamais éliminatoire ; « Pourquoi ils recrutent » pour le territoire.
6. **Explication** : contribution par choix, choix non retrouvés, signalement des directions contradictoires.
7. **Présentation** : directions (secteurs) puis quelques métiers, « retirer le choix qui bloque », suite vers « Ma synthèse » et la recherche d'offres.
8. **Contrôle qualité** : banc d'essai rejouable + jury d'experts, rejoués à chaque changement des données ou des poids.

## 6. Ce que cet article ne prétend pas

Que le moteur oriente à lui seul : il **éclaire des pistes** et aide à les réduire ; le choix reste à la personne, avec un conseiller.
