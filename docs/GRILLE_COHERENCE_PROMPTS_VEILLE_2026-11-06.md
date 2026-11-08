# Grille de cohérence des prompts et rubriques de la veille (06/11/2026)

Consigne 135.16 et 135.17 de Denis : chaque amélioration d'un prompt doit être vérifiée sur tous les autres, et toutes les rubriques de maintenance (semaine, mois, trimestre, année, chiffres, Lexique, Qui fait quoi) doivent rester cohérentes et faciles à faire.

Méthode : relevé dans le code réel de `outils/veille.html` et des fichiers `outils/veille*.js` (quelle brique commune chaque prompt utilise), puis corrections faites tout de suite quand elles ne demandent aucun choix de Denis. Ce qui demande un choix est listé en bas.

## Les briques communes (une seule source de vérité)

| Brique | Rôle | Où elle vit |
|---|---|---|
| `socleRecherche()` | date du jour, recherche web obligatoire, jamais d'adresse inventée, relais si un site bloque, **adresses en https seulement (ajouté le 06/11/2026)** | `outils/veille.html` |
| `REGLE_HTTPS` | la phrase https, reprise par le socle et par le prompt « lien source cassé » | `outils/veille.html` |
| `VeillePreuve.consigneEntrees` + ligne `preuve:` | chaque entrée garde la page réellement ouverte | `outils/veillePreuve.js` |
| `blocSitesNonOuvertsTexte` + `[SITES-NON-OUVERTS]` | l'assistant liste ce qu'il n'a pas pu lire, pour que Denis l'ouvre à la main | `outils/veille.html` |
| `suiteVeilleTexte` | réponse en plusieurs fois (« SUITE DISPONIBLE ») | `outils/veille.html` |
| `REGLES2` | règles de rédaction des fiches (deux départements, aucune coordonnée dans le texte, ajoutées le 06/11/2026) | `outils/veille.html` |

## Grille : prompt contre consigne

Légende : oui = vérifié dans le code ; non = absent ; sans objet = la règle ne s'applique pas à ce prompt.

| Prompt (rubrique) | Rythme | Socle (web, pas d'adresse inventée, https) | Preuve | Sites non ouverts / « non vérifié » | Couverture | Deux départements, pas de coordonnées dans le texte |
|---|---|---|---|---|---|---|
| Veille rapide de la semaine | semaine | oui | oui | oui | élargie le 06/11 : logement, garde, santé, handicap, étrangers, retraite, formation + 6 sources de plus, classement par urgence | sans objet (ne rédige pas de fiche) |
| Ce qui a changé ce mois-ci (balayage) | mois, trimestre | oui | oui (page ouverte exigée) | oui, plus le bloc `[COUVERTURE]` | **10 messages, 23 domaines, les 21 rayons couverts** (avant : 7 messages, 10 domaines) | sans objet |
| Contrôle d'un rayon | à la demande | oui | oui | oui (le bloc existait déjà ; la lecture de la réponse l'affiche) | une fiche à la fois | sans objet |
| Collecte d'une fiche | à la demande | oui | non (le matériau garde ses sources) | oui | un thème à la fois | sans objet |
| Rédaction des fiches | à la demande | sans objet (rédige depuis le matériau) | sans objet | sans objet | sans objet | **oui, ajouté le 06/11** |
| Contrôle d'une fiche du sas | à la demande | oui | oui | verdict « introuvable » | une fiche | **oui, ajouté le 06/11** |
| Faire vérifier un changement | à la demande | oui | oui | oui | un changement | sans objet |
| Lien source cassé | à la demande | règles propres écrites dans le prompt + phrase https | oui (`sources_ouvertes`) | **oui, ajouté le 06/11** (le bloc manquait) | une fiche | sans objet |
| Triage du digest et du registre | à la demande | non (pas de recherche web) | sans objet | sans objet | sans objet | sans objet |
| À confronter (non officiel) | trimestre | oui | oui | oui | un sujet | sans objet |
| Chiffres clés, lecture du territoire | trimestre | oui | pas de ligne `preuve:`, mais un second message « Confronter les chiffres à leur source » vérifie les points douteux | oui | 5 chiffres | sans objet |
| Portrait, Union européenne | année | oui | pas de ligne `preuve:` ni de second message de vérification (voir question 3) | oui | un portrait | sans objet |
| Profil des découpes, médecins | année | non : adresses données une à une dans le prompt, l'assistant copie des tableaux | pas de ligne `preuve:` (voir question 3) | oui | une série | sans objet |
| Mots du Lexique | trimestre | oui | oui (sources lues, bloc d'ouverture) | oui | un lot de mots | sans objet |
| Qui fait quoi (structures, employeurs, pages d'offres) | à la demande | prompts côté serveur, https exigé dans chaque prompt | oui (adresse exacte, « non vérifiable » sinon) | oui | une carte | les coordonnées viennent de la fiche de la structure, jamais du texte d'une fiche |
| Test des adresses | mois | pas de prompt : le programme ouvre les pages | sans objet | sans objet | toutes les familles d'adresses | sans objet |

## Corrections faites dans ce passage

1. Tous les prompts qui utilisent le socle exigent désormais des adresses en https, car l'application ignorait en silence les adresses http (voir consigne 135.12).
2. Le registre des adresses de l'outil refuse une adresse http avec un message qui dit quoi faire (avant : il l'acceptait, puis l'application l'ignorait).
3. Le balayage mensuel couvre les 21 rayons : trois messages ajoutés (vie quotidienne ; droit, justice et langue française ; activité, employeurs, agriculture, fonction publique, armées), avec chacun ses sites à ouvrir.
4. Le prompt de la semaine regarde plus large et classe par urgence, sans doubler le balayage mensuel.
5. Les prompts de rédaction et de contrôle de fiche : fiches valables pour la Dordogne et la Haute-Vienne, aucune coordonnée dans le texte.

## Questions pour Denis (rien n'est corrigé tant que Denis n'a pas tranché)

1. **TRANCHÉ par Denis le 06/11/2026 : chaque mois, les 10 messages (rien à changer dans le code).** Question d'origine : rythme des trois nouveaux messages du balayage. Les trois groupes ajoutés (logement et santé ; droit et langue ; activité, agriculture, fonction publique, armées) bougent moins vite que l'emploi et le chômage. Recommandé : les garder dans le balayage du mois (une seule habitude, rien à retenir), quitte à prendre un message sur deux. Autre option : les faire seulement au trimestre (moins de travail par mois, mais un changement peut rester trois mois sans être vu).
2. **Contrôle d'un rayon : RÉGLÉ.** Mon premier relevé s'était arrêté trop tôt : le bloc « sites non ouverts » existait déjà dans ce prompt et sa lecture l'affiche. Erreur de relevé corrigée dans ce tableau. Le bloc manquait en revanche au prompt « Lien source cassé » : ajouté.
3. **Relecture des prompts un par un : FAITE le 06/11/2026 (Denis l'a demandée).** Chaque prompt a été construit par la page puis contrôlé (recherche web, https, preuve, sites non ouverts, tirets longs, mot « IA »). Trouvé et corrigé : le mot « IA » dans le prompt des chiffres clés, une mention de « Claude » adressée à un autre assistant dans le prompt des médecins, le bloc manquant du lien cassé. **Reste à décider** : les prompts portrait, Union européenne, profil des découpes et médecins n'ont ni ligne `preuve:` ni second message de vérification (les chiffres clés en ont un). Recommandé : ne rien ajouter pour les découpes et les médecins, dont les adresses sont données une à une, mais prévoir plus tard un second message de vérification pour le portrait et l'Union européenne. **FAIT le 07/11/2026** : bouton « Préparer le message de vérification » sous le portrait et sous la comparaison France / Union européenne (lecture du bloc de retour incluse).
