# Fiche de contrôle de l'essai : « Découvrir mes compétences » (26 octobre 2026)

Prompt essayé : `prompts/mes-competences.md` (version 1, non branchée dans l'application). Profils **fictifs** : aucune donnée réelle.

## Comment faire l'essai

1. Ouvrir un des fichiers de `docs/essais_mes_competences/` (un fichier = une demande complète : consigne + documents).
2. Copier **tout** le contenu, ouvrir une **nouvelle conversation** dans un assistant en ligne, coller en un seul message.
3. Garder la réponse (copier-coller dans un fichier texte, ou me la coller ici : je lance le contrôle automatique).
4. Refaire avec **au moins deux assistants différents** pour les profils 02 et 03.
5. Relire avec la liste ci-dessous. Noter dans la colonne de droite ce qui ne va pas.

Les fichiers :

| Fichier | Ce qu'il éprouve |
|---|---|
| `01_logistique_cv_seul` | CV seul et pauvre : peu de compétences, aucune « confirmée », « sérieux et motivé » et le football ne deviennent pas des compétences. |
| `02_accueil_trois_documents` | Trois sources : l'accueil, les rendez-vous et le courrier doivent être « confirmés » ; l'envie va dans « motivations » ; le nom et les coordonnées du directeur ne sont jamais repris. |
| `03_parcours_atypique_contexte_sensible` | La détention et la santé n'apparaissent **nulle part** ; « dynamique, motivé, passionné » ne produisent rien ; bénévolat et aide à un proche relevés comme des activités. |
| `04_technicien_maintenance` | Vocabulaire du métier, savoirs (habilitation, schémas), compétence confirmée par un tiers. |
| `05_chef_equipe_niveau_cadre_choisi` | La personne a choisi « cadre » mais les documents prouvent surtout l'animation d'une équipe de six : le relevé reste au niveau de la preuve et le dit, sans « leadership ». |

## Ce que le contrôle automatique vérifie (erreurs bloquantes)

Chaque extrait existe vraiment dans le document · aucun chiffre inventé · aucun « vous êtes » · aucun contexte de vie repris · aucun nom ni coordonnée de tiers · aucun tiret long ni mot « IA » · « confirmée » seulement avec deux sources · « à préciser » sans formulation mais avec une question · JSON complet et valide.

## Ce qu'il faut relire soi-même (le contrôle ne peut pas le juger)

- [ ] **Fidélité** : tout ce qui est dit est vrai d'après les documents ? Rien de « gonflé » ?
- [ ] **Utilité** : la liste est courte, claire, rassurante ? Pas de répétition d'une même idée sous deux noms ?
- [ ] **« Pour le CV »** : chaque ligne pourrait être copiée dans un CV sans retouche ?
- [ ] **« Pour l'oral »** : la personne pourrait **dire** ces phrases telles quelles ? Elles sonnent humaines, pas « assistant » ?
- [ ] **« En mots simples »** : compris sans connaître le mot ?
- [ ] **Questions « à préciser »** : naturelles, jamais intrusives, jamais un jugement caché ?
- [ ] **Niveau du poste** : le vocabulaire correspond bien au niveau (pas de mot de direction pour un employé) ?
- [ ] **Ton de l'introduction** : encourageant sans flatterie, sans « félicitations », sans point d'exclamation ?
- [ ] **Motivations** : seulement ce qui est écrit noir sur blanc ?
- [ ] **Taille** : le message passe en un seul collage ? la réponse n'est pas coupée avant la fin du JSON ?

## Seuil de décision (proposition)

- **Continuer vers la maquette** si, sur les 5 profils et au moins 2 assistants : zéro erreur bloquante après au plus deux révisions du prompt, et au moins 8 lignes sur 10 jugées utilisables par Denis.
- **Réviser le prompt** si les erreurs reviennent mais sont corrigeables par une consigne (noter laquelle).
- **S'arrêter et en parler** si l'invention persiste malgré les révisions : il faudrait alors repenser l'outil avant d'investir dans des écrans.

## Après les réponses

Colle-moi les réponses (ou les noms des fichiers). Je lance `node scripts/essaiMesCompetences/essai.js verifier <profil> <fichier>`, je te dis ce qui est faux, puis je propose les corrections du prompt. Second passage (réponses de la personne aux questions « à préciser ») : `node scripts/essaiMesCompetences/essai.js passe2 <profil> <réponse_premier_passage> <réponses_personne>`.
