# Audit du contenu des CV pour les profils élevés (bac+5, ingénieurs, chercheurs, créatifs)

Écrit le 2026-10-07 (étape E5 de `docs/PLAN_MODELES_CV_SUITE_2026-10-07.md`). **Document seul : aucun code.** Vision de Denis : l'application sert un public large, bac+5 compris. Les modèles ne suffisent pas : il faut aussi les bonnes rubriques. Tout ce qui suit est vérifié dans le code du 2026-10-07 ; ce qui n'est pas vérifié est dit.

## 1. Ce que le dossier sait stocker aujourd'hui (vérifié : `js/app.js` ~l. 255 à 330, `modules/cv-core/normaliserDonneesCV.js`)
- **Identité** : civilité, nom, prénom, adresse, code postal, téléphone, e-mail, ville, **et UN lien** (`identite.lien`, libellé « Lien (LinkedIn, site) »). **CORRECTION du 2026-10-07 (le soir) : la première version de cet audit disait « aucun champ pour un lien ». C'était faux** : le lien existe, il s'affiche avec les coordonnées (icône « lien », `cvPdfTemplateMaquette.js` l. 199) et se coche dans la carte « Autres rubriques » (« Afficher mon lien »). La recherche avait porté sur `normaliserDonneesCV.js` seul, jamais sur toute l'application. **Limite réelle : un seul lien**, pas LinkedIn ET portfolio ET GitHub.
- **Expériences professionnelles** : poste, entreprise, lieu, dates, missions.
- **Formations** : niveau, intitulé, établissement, année, missions (donc un semestre à l'étranger ou un double diplôme s'écrit déjà comme une formation).
- **Expérience personnelle** (bénévolat, engagements, projets personnels) : intitulé, dates, détail, missions.
- **Listes de textes** : certifications, logiciels et outils, centres d'intérêt, langues (avec niveau), engagements, et « informations non classées » qui deviennent la rubrique **Informations complémentaires** (lignes cochées par la personne).
- **Titres de rubrique modifiables** (fait le 2026-10-03) : « Expérience personnelle » peut devenir « Projets personnels » ; « Informations complémentaires » peut devenir « Publications » ou « Distinctions ».
- **Compétences** professionnelles et comportementales, regroupables par thème (mode « Mixte »).

## 2. Ce qu'un profil élevé demande, et où ça en est
| Besoin | État actuel | Verdict |
|---|---|---|
| **Liens** (LinkedIn, portfolio, GitHub, site) | **Un seul** lien dans l'identité, affiché avec les coordonnées ; les autres liens se saisissent comme texte libre dans « Informations complémentaires » | **Couvert pour un lien, manque pour plusieurs** (profil technique ou créatif : LinkedIn + portfolio + GitHub) |
| **Projets** (académiques, techniques, personnels) avec dates et puces | Possible dans « Expérience personnelle » renommée « Projets » | **Couvert**, mais sans champ « technologies » ni « lien » par projet |
| **Publications, communications, brevets** | Une seule rubrique libre (« Informations complémentaires » renommée), lignes de texte simples | **Couvert pour UNE rubrique seulement** ; pas de dates ni de sous-ligne ; impossible d'en avoir deux (ex. Publications ET Distinctions) |
| **Distinctions, prix, bourses** | Même limite que ci-dessus | Idem |
| **Mobilité internationale** | Une formation ou une expérience | Couvert |
| **Enseignement, encadrement, recherche** | Des expériences professionnelles | Couvert |
| **Compétences techniques par catégorie** (« Frontend : React, Vue… ») | « Logiciels et outils » = liste simple ; thèmes seulement en mode « Mixte » | **Manque partiel** : pas de groupes étiquetés pour une pile technique |
| **Langues** avec niveau européen | Oui (niveau saisi, A1 à C2) | Couvert |
| **CV de deux pages** (profils expérimentés) | **Non vérifié** : le bouton « Mise en page » cherche à tenir sur une page ou à remplir l'espace ; les parcours testent un CV long en 2 pages | À vérifier avant toute promesse |
| **Résumé / accroche** | Oui (profil) | Couvert |

## 3. Propositions, classées par rapport bénéfice / coût / risque
1. **Plusieurs liens (au lieu d'un seul).** Voir aussi la demande de Denis du 2026-10-07 : rendre « Informations complémentaires » déplaçable partout, y compris dans l'en-tête avec les coordonnées ; cela couvre le même besoin sans nouveau champ.
   - Quoi : soit une liste de liens (libellé + adresse) à la place du lien unique, soit placer la rubrique « Informations complémentaires » dans l'en-tête (voir `docs/CHANTIER_INFOS_COMPLEMENTAIRES_DEPLACABLES_2026-10-07.md`).
   - Bénéfice : élevé pour tous les profils techniques, créatifs et très diplômés.
   - Coût : moyen (champ de dossier, écran de saisie, rendu dans les blocs de coordonnées, export Word, import depuis un CV existant).
   - Risque : moyen, car toucher aux coordonnées touche tous les modèles : **maquette avant code, et banc B7 sur les 36 modèles**.
2. **Rubriques libres multiples** (titre choisi par la personne + lignes avec dates et sous-ligne facultatives), en remplacement de la limite « une seule rubrique libre ».
   - Bénéfice : élevé, un seul mécanisme couvre publications, distinctions, bourses, brevets, vie associative…
   - Coût : élevé (nouvelle structure de données, éditeur, rendu dans chaque gabarit, ordre et déplacement des rubriques, export Word).
   - Risque : élevé pour les modèles existants. À faire en **Mode A** (maquette, plan, jalons), jamais en une nuit.
3. **Compétences techniques par catégorie** (groupes étiquetés).
   - Bénéfice : moyen à élevé pour les profils techniques.
   - Coût : moyen. Risque : moyen. Peut s'appuyer sur les thèmes de compétences existants.
4. **Guidage de la saisie** (texte d'aide, sans code de rendu) : indiquer dans l'écran des rubriques qu'« Expérience personnelle » peut s'appeler « Projets » et « Informations complémentaires » « Publications ». Coût très faible, aucun risque, bénéfice immédiat.
5. **Import** : faire reconnaître les liens et les publications par les consignes d'import. Dépend du 1 et du 2.

## 4. Ce qui n'a PAS été vérifié (à ne pas affirmer)
- Le nombre de pages réellement permis (une, deux) pour un CV chargé.
- Si l'import d'un CV existant remplit bien `identite.lien` quand il rencontre un lien dans le texte.
- Si « Informations complémentaires » accepte beaucoup de lignes sans casser la mise en page des petits modèles.

## 5. Recommandation à soumettre à Denis
Faire **4 tout de suite** (guidage, sans risque), traiter 1 par la rubrique « Informations complémentaires » déplaçable (décision de Denis du 2026-10-07), puis décider avec lui si 2 (rubriques libres multiples) vaut encore son coût. Aucun de ces points ne se décide la nuit : ils modifient le dossier de la personne, donc ils passent par Denis.
