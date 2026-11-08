# Banc d'essai : la liste « ce que le métier attend » (ROME) change-t-elle le CV proposé ?

Créé le 08/11/2026. Voir la section 9 de `docs/INVENTAIRE_ALLEGER_PROMPTS_ET_DEPENDANCE_ASSISTANTS_2026-11-08.md`.
Personnages entièrement fictifs. Rien n'est modifié dans l'application : on compare deux versions du même message.

## Ce qu'on compare

- **A, message actuel** : exactement ce que l'application envoie aujourd'hui.
- **B, avec le ROME** : le même message, mais la ligne « Compétences typiquement attendues pour ce métier » est remplacée par la liste officielle du ROME (France Travail) : environ 8 à 11 gestes du cœur de métier et 8 savoirs, avec une phrase qui rappelle que la liste décrit le métier et pas la personne.

La consigne `prompts/cv.md` est identique dans A et B. Seul le profil change, de 800 à 1 100 caractères (environ 2 % du message). **Ce banc ne mesure donc pas un message plus léger, il mesure si les résultats sont meilleurs ou plus stables.**

## Les trois personnages

| Fichiers | Métier visé | Ce qu'on teste |
|---|---|---|
| `p1_libre_service_*` | Employé libre-service (dans nos 129 fiches) | Profil pauvre. L'application envoie déjà 9 mots ; le ROME en donne 11 gestes plus concrets. |
| `p2_conducteur_ligne_*` | Conducteur de ligne de conditionnement (absent de nos fiches) | Aujourd'hui l'assistant ne reçoit RIEN sur ce métier. Expérience très proche. |
| `p3_serveur_vers_platrier_*` | Plâtrier (absent de nos fiches) | Reconversion : risque que l'assistant recopie la liste du métier comme si la personne la maîtrisait. |

## Comment faire (6 messages, une conversation neuve à chaque fois)

**Voie simple (décision Denis 08/11/2026) : ouvrir `ESSAI_6_MESSAGES.html` dans le navigateur** (double-clic). Un bouton « Copier ce message » par message, une case par réponse (gardée dans le navigateur), et un bouton « Copier toutes les réponses » qui étiquette « p1 A » à « p3 B ». Le fichier est généré par `node scripts/essaiReferentielRome/fichierUnique.js` (à relancer si les messages sont régénérés). Les étapes ci-dessous décrivent la voie manuelle.

1. Ouvrir l'assistant en ligne (ChatGPT sans compte de préférence : c'est le cas le plus fragile, donc le plus instructif).
2. Pour chaque fichier `*_A_actuel.txt` et `*_B_rome.txt` : ouvrir le fichier, tout sélectionner (Ctrl+A), copier (Ctrl+C), **ouvrir une nouvelle conversation**, coller (Ctrl+V), envoyer.
3. Copier toute la réponse et la coller dans la discussion avec Claude, en précisant « p1 A », « p1 B », etc. (ou l'enregistrer dans `<profil>_A_reponse.txt` / `<profil>_B_reponse.txt` dans ce dossier).
4. À la fin, Claude lance `node scripts/essaiReferentielRome/essai.js comparer` et produit `COMPARAISON.md`.

Si l'assistant coupe sa réponse en plein milieu, noter « coupée » : c'est une information utile en soi.

## Grille de lecture (la décision est humaine, les compteurs ne sont que des repères)

Pour chaque personnage, comparer A et B :

1. **Justesse** : les compétences retenues correspondent-elles bien à ce métier ? (B devrait être meilleur pour p2 et p3, où A ne reçoit rien.)
2. **Preuve** : chaque compétence est-elle appuyée par ce que la personne a écrit ? **C'est le test le plus important.** Une compétence que la personne n'a pas prouvée, recopiée depuis la liste du métier, est un échec de B, même si elle est juste pour le métier.
3. **Concret** : les formulations sont-elles plus précises (« Réaliser la mise en rayon ») que génériques (« Gestion des stocks ») ?
4. **Lisibilité** : un CV bourré de vocabulaire administratif (« Respecter les règles de Qualité, Hygiène, Sécurité... ») est un défaut de B.
5. **Honnêteté de la reconversion (p3)** : le CV montre-t-il les compétences transférables du service en salle et le loisir de rénovation, sans faire passer la personne pour un plâtrier expérimenté ?

## Verdict attendu

- **B meilleur sur 1 et 3, sans défaut sur 2 et 4** : on branche le ROME (sur la même ligne du profil, rien dans la consigne).
- **B recopie la liste (défaut sur 2)** : on durcit la phrase de garde-fou et on rejoue p3, ou on n'envoie que le cœur de métier réduit à 5 éléments.
- **Aucune différence nette** : le gain restant est l'affichage des compétences du métier à l'écran sans assistant ; on ne touche pas aux consignes.
