# Compte-rendu de la nuit du 2026-09-30 au 2026-10-01 (à lire en premier au réveil)

**Commit de départ (pour un retour arrière propre) : `66bec6b6`.** Tout est commité sur `master`, rien n'est poussé. `npm test` : 1178 verts. `node scripts/checkLexique.js` : aucune erreur. Parcours rejoués dans le navigateur : 70 vérifications sur 70.

## Ce qui est FAIT (dans l'ordre du plan `docs/PLAN_MODE_NUIT_2026-09-30.md`)

| Lot | Résultat | Commit |
|---|---|---|
| N1 | **Bilan** : le bloc « Relire et masquer » est retiré. La relecture vit dans « Votre CV » et s'ouvre seule après un collage de texte. Annuler la relecture oublie le CV et propose le dépôt. Un CV venant de l'application non relu garde un bouton « Relire et masquer mon CV » et bloque la suite. | `1fa8fd05` |
| N2 | **Comparer mes pistes** : les cinq envois à l'assistant (Collecter, Détection des pistes, Côte à côte affiné, Dans le temps, Aller plus loin) passent par UNE brique commune : choix de l'assistant, « Chez l'assistant », collage. Plus aucun texte de prompt affiché. **Bouton « Aller sur Perplexity (recommandé pour cette recherche) »** sur l'écran Collecter, au-dessus de la liste habituelle. « Retour » recule d'une étape (coller, chez, choix) puis quitte l'écran. Phrases de confidentialité exactes par écran. | `edf44b76` |
| N3 | Lignes directrices par situation : présentes dans le profil du CV, de la lettre et de l'entretien (21 cas sur 21) et dans Reformuler (7 sur 7). | (dans `6975eecd`) |
| N7 | **Prompts moins robotiques** (ta demande) : un fragment unique `prompts/_voix-humaine.md` (ses mots d'abord, du concret, liste de formules d'assistant à éviter, rythme naturel, verbes simples, mots-clés de l'offre seulement s'ils sont vrais). Repris par CV, Découverte, lettre, co-lettre, entretien, entretien allégé, Reformuler, titre et accroche du Bilan, et les deux prompts de réécriture du Bilan. Un test de garde. | `6975eecd`, `1d384d5a` |
| N4 | **Mode sombre** du panneau « La mise en page » : 385 textes contrôlés, un seul défaut ancien (les deux grandes cartes « Style rapide » et « Mise en page », contraste 3,0) corrigé (4,9). | `15841447` |
| N5 | C8 confirmé corrigé (rejoué), C6 confirmé (test et code), C7 non reproductible mais plus de cas silencieux. | `b0476265` |
| N6 | Référence du banc régénérée (24 modèles, identique : aucun rendu de CV n'a changé), état et mémoire à jour. | `1d384d5a` |
| Bonus | **Essais de parcours rejouables en un appel** (`scripts/parcours/parcours_smoke.js`, mode d'emploi dans `docs/TESTS_PARCOURS_NAVIGATEUR.md`) : Bilan, Comparer mes pistes (5 envois), Découverte, prompts. Je les lance moi-même avant de te livrer quoi que ce soit. | ce commit |
| Avant la nuit | Word : l'en-tête libre ne recouvre plus les compétences (`wordExtracteur.js`). Découverte : le parcours se termine dès l'import. Leçon 18. | `57bcd3c0`, `66bec6b6` |

## Ce que je n'ai PAS pu vérifier (à TON essai, en 5 minutes)

1. **Le ton obtenu avec un vrai assistant** : lance « Reformuler » ou « Créer mon CV » avec le CV de Nicolas, lis l'accroche. Est-ce moins « assistant » ? Si une formule te gêne encore, ajoute-la à la liste dans `prompts/_voix-humaine.md` (un seul fichier, une ligne).
2. **Le vrai presse-papiers et la vraie ouverture de Perplexity** dans « Comparer mes pistes » (le bouton Perplexity, puis « Je suis de retour », puis coller).
3. Le titre choisi du CV (« Technicien supérieur de maintenance en informatique ») reste-t-il en premier, sans « junior » ?

## Ce qui reste, et où c'est gardé

Tout le reste est dans **`docs/A_GARDER_POUR_LE_PROCHAIN_CHANTIER_2026-09-30.md`** (rubrique Certifications à part, Mini CV A5, autres écrans à l'ancien collage, module « Où chercher », ton texte « réponse pas lue », la disquette de Josianne, tes tests à la main, petits reports). Je n'ai rien supprimé de cette liste.

## Ta question : « Est-ce que je dois être plus exigeant, changer de modèle, y a-t-il un moyen plus facile ? »

Ma réponse franche :
- **Changer de modèle ne règle pas le problème.** Le problème vient d'une chose : les corrections que tu vois sont des défauts que personne n'a rejoués avant de te les montrer. Ce n'est pas une question d'exigence de ta part.
- **Ce qui aide vraiment : que je rejoue moi-même les parcours avant toi.** C'est ce que fait le nouveau script (`scripts/parcours/parcours_smoke.js`) : un appel, 70 vérifications, avec un assistant simulé. Chaque fois que je corrigerai quelque chose dans un parcours couvert, je le lance avant de te le livrer. Toi, tu ne gardes que ce que personne d'autre ne peut faire : juger si un texte sonne vrai, voir à l'œil un rendu, essayer avec un vrai assistant.
- **À faire ensemble quand tu seras reposé** : ajouter à ce script un parcours par module à chaque fois qu'un défaut t'arrive (Reformuler, Co-lettre, Préparer l'entretien, Les mots de votre CV). Un défaut qui te revient une deuxième fois est alors impossible.
- **Une règle que je peux suivre sans que tu la demandes** : un défaut corrigé = un essai de parcours ajouté, dans le même commit.

Bonne journée. Tu n'as rien à faire de précis : regarde d'abord les trois essais ci-dessus, dans l'ordre que tu veux.

## Complément du 2026-10-01 (suite à ton essai de « Reformuler » avec le CV de Nicolas)

| Point | Résultat | Commit |
|---|---|---|
| **Années des certifications** | Quand le CV range des certifications sous une formation (comme Nicolas : sous le Titre professionnel Plaquiste 2025 - 2026), la question propose les années de cette formation en boutons (2025, 2026) et un choix groupé « 2026 pour toutes ». Jamais d'année imposée : tu cliques ou tu écris la bonne. | `132db29d` |
| **Rubrique « Certifications »** | Vraie rubrique avec son titre, juste sous les formations, dans les 24 modèles, en PDF et en Word. Automatique dès trois certifications ; case « Certifications » dans « Éléments supplémentaires » pour la choisir ou la refuser (décochée, elles retournent dans les formations) ; option « sur 2 colonnes » ajoutée à la liste des listes courtes. Vérifié modèle par modèle en PDF et en Word, banc régénéré avec des certifications. | `4f01e094` |
| **Word, Centres d'intérêt** | Défaut reproduit (colonne 2 décalée), corrigé : deux colonnes qui se remplissent de haut en bas, vérifié dans Word. | `132db29d` |
| **C12** | Bouton « Enregistrer en fichier » sur la fiche de « Les mots de votre CV ». | `9d24cc45` |
| **C3** | « Reformuler » demande 3 à 6 savoirs à l'assistant, proposés (retirables) dans « Vos savoirs ». | `f7190f5d` |
| **C9** | Fermé. | |

**Pourquoi ton Word « cv (7) » n'avait pas la rubrique** : il a été exporté à 23 h 34 avec une page de l'application ouverte AVANT 22 h 22 (les certifications étaient déjà en poids normal, mais pas encore regroupées). Une page ouverte garde l'ancien code : recharge avec Ctrl+F5 avant un essai après une correction. Maintenant, de toute façon, la rubrique à part existe.

Essais de parcours : 78 vérifications sur 78 ; `npm test` 1191 verts.
