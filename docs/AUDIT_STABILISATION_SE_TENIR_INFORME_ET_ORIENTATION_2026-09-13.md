# Audit de stabilisation : « Se tenir informé » et « Vous hésitez encore ? » (dernières cartes)

Audit en lecture seule (aucun fichier de code modifié pendant l'audit lui-même), mené le 2026-09-13. Dernier volet du chantier de stabilisation de l'accueil, après « Mes documents », « Me préparer à candidater », « Boîte à outils » et « Outils d'analyse ». Périmètre : les 2 derniers parcours de « Se tenir informé » (**Comprendre le cadre**, **Comprendre les chiffres**) et l'unique parcours de « Vous hésitez encore ? » (**Comparer mes pistes**).

Avec ce rapport, les 6 cartes de la page d'accueil ont toutes été auditées.

## Verdict d'ensemble

**Aucune anomalie bloquante sur les 3 parcours.** Comprendre le cadre est le module le mieux tenu des trois (mode sombre irréprochable, territoire rigoureux, recherche branchée dynamiquement donc jamais périmée). 12 écarts relevés au total, tous gênants ou mineurs. Les points déjà corrigés dans ce passage sont listés ci-dessous ; deux points demandent ta décision avant d'agir.

---

## Comprendre le cadre

### 1. Corrigé : « Garder comme Repère » retiré du texte de présentation
- La page de présentation promettait explicitement de pouvoir garder une fiche dans « Mes Repères », sans que le bouton existe nulle part dans le module. **Décision Denis (2026-09-13)** : retirer la promesse plutôt que développer la fonctionnalité. Le bloc dédié « Mes Repères » et la ligne correspondante de « Ce que vous pourrez faire ensuite » retirés de `data/metiers.js` (page d'intro « Se tenir informé »).

### 2. Corrigé : tiret cadratin dans la fiche « QPV et zones rurales fragiles »
- `contenu/emploi/emploi-qpv-frr.md`, seule occurrence sur les 127 fiches réelles.

### 3. Corrigé : numéro de téléphone CPAM (3646) non cliquable
- `contenu/sante/sante-desert-medical.md`, seule occurrence dans tout le corpus. Transformé en lien `tel:`.

### 4. Corrigé : événement Umami manquant dans la documentation
- `comprendre_le_cadre_territoire_demande` (écran-porte de choix de territoire) existait dans le code mais pas dans le tableau de `ARCHITECTURE_TECHNIQUE.md` (16 événements documentés contre 17 réels).

### 5. Différé (mérite un vrai passage dédié, pas mineur) : zéro test automatisé pour le module
- Le parseur qui décide « cette adresse est vérifiée, donc cliquable » (mécanisme de sécurité central, LECONS 9.16) n'a aucun filet de régression. Le fichier se charge sans erreur en Node, rien ne bloque techniquement un `module.exports` + des tests. Vu le rôle protecteur de ce parseur et le volume que représenterait un tel passage (127 fiches, plusieurs parseurs), je propose de le traiter comme un mini-chantier à part plutôt que de l'improviser ici.

---

## Comprendre les chiffres

### 6. Corrigé : les 4 blocs santé n'étaient pas branchés à la recherche d'accueil
- Le branchement de recherche du module (fait le 2026-09-12) précède de peu l'ajout des blocs « accès aux médecins/spécialistes/dentistes/pharmaciens » (même jour, commits suivants) : jamais rattachés. Taper « dentiste », « pharmacien » ou « désert médical » dans la recherche d'accueil ne remontait rien, alors que le contenu existe et est complet. Corrigé sur le même modèle que les autres sources du module.

### 7. Corrigé (documentation) : dette B.9 sous-comptait une implémentation de graphe
- La courbe pluriannuelle du chômage (4 territoires en bascule) est une 4ᵉ implémentation SVG avec sa propre infobulle, absente du recensement d'origine de `BRIQUES_COMMUNES.md`. Probablement un choix justifié (interaction multi-séries), mais la dette ne le comptait pas. Registre mis à jour, résorption toujours « au fil de l'eau », rien ne change sur le fond.

### 8. Mineur, non traité : `AIDE_PAGES['comprendre-les-chiffres']` n'existe pas
- Son module jumeau (Comprendre le cadre) a une aide contextuelle par écran, ce module n'en a aucune, sans que ce choix soit documenté comme assumé (à la différence d'ATS/Regard recruteur, où l'absence est explicitement actée). Je ne l'ai pas ajoutée : à trancher comme les autres cas d'aide contextuelle optionnelle déjà rencontrés dans ce chantier (voir Bilan, ATS).

### 9. Mineur, non traité : zéro test automatisé (même remarque que pour Comprendre le cadre)
- Parseur « zones/écarts » générique réutilisé 4 fois, calcul de base de graphe (LECONS 9.36), calcul de tendance : rien de tout cela n'a de filet de régression. Même recommandation que le finding 5 : un passage dédié plutôt qu'un ajout improvisé.

---

## Comparer mes pistes

### 10. Corrigé : un succès de collage silencieux, sans confirmation visible
- Sur l'écran « Superposer », coller la réponse d'affinage de l'assistant validait silencieusement le résultat (aucun message, aucun changement visible d'écran). Pour un public à confiance en soi fragile, un clic « sans effet apparent » peut être vécu comme une erreur de manipulation. Ajouté un message de confirmation (« Réponse prise en compte, merci »), même mécanisme que le message d'erreur déjà existant juste à côté.

### 11. Corrigé (documentation) : duplication de la brique commune « choix de l'assistant » consignée
- L'écran « Collecter » réimplémente son propre écran de choix d'assistant au lieu d'utiliser la brique commune B.2 (résorbée le 2026-09-04). **Décision Denis (2026-09-13)** : garder tel quel, ne pas migrer maintenant, ce module a un vrai besoin différent (recherche web obligatoire avec instructions dédiées). Consigné comme dette assumée dans `BRIQUES_COMMUNES.md` (B.14), même traitement que Cohérence transversale (B.10) : résorption au fil de l'eau, réexaminée seulement si B.2 évolue pour accepter ce cas.

### 12. Corrigé : code mort résiduel de l'époque « territoire limité à la Dordogne »
- `dim.element === 'lieux'` (condition jamais vraie, aucune dimension actuelle n'a cet identifiant) retiré.

### 13. Corrigé (documentation) : ligne ambiguë sur le prototype abandonné
- `docs/TACHES_VALIDEES.md:462` citait `aide-decision-avant-reecriture.md` dans une liste de prompts sans préciser qu'il appartient au prototype abandonné le 2026-08-29, jamais chargé par le module actif. Précision ajoutée, rien retiré du fichier.

### 14. Mineur, non traité : série de questions « B7 » du cahier jamais implémentée
- Le cahier de chantier prévoit une série « Statut, droits, aides », absente du code (`if (!serie) return '';` gère l'absence proprement, rien ne casse). Jamais posée à personne. Pas assez d'information pour savoir si c'est un oubli ou une simplification volontaire ultérieure au cahier : signalé sans trancher.

---

## Ce qui a été vérifié en profondeur et confirmé sain

- **Aucun bouton mort** sur les 3 parcours (hors le cas particulier du finding 10, qui manquait de confirmation, pas de câblage).
- **Territoire** : rigoureux sur les 3 modules. Comprendre le cadre : un seul point d'appel à `demanderDepartementSiInconnu()`, filtrage par portée tracé ligne à ligne, aucun mélange entre départements. Comprendre les chiffres : chaque bloc vérifie strictement le niveau territorial courant sur ses 4 couches (24/87/région/France), le bug historique de lecture territoriale partagée (2026-09-10) reste corrigé.
- **Navigation Retour** : saine sur les 3 modules, tous avec leur propre machine à états locale, aucun n'est concerné par RC-03 (bug global de `barreNavigation()`).
- **Mode sombre** : Comprendre le cadre irréprochable (vérifié variable par variable) ; Comprendre les chiffres propre également (seules exceptions : du texte blanc sur bouton plein, motif établi ailleurs dans l'app).
- **Français / non-négociables** : aucune icône à visage, jamais le mot « IA » visible, sur les 3 modules et l'ensemble du corpus de fiches concerné.
- **Recherche d'accueil** : Comprendre le cadre se branche dynamiquement (nouveau rayon = rien à ajouter au code de recherche), robuste par construction. Comprendre les chiffres corrigé (finding 6). Comparer mes pistes : rien à signaler.
- **Fidélité prompt ↔ écrans** : vérifiée sur Comparer mes pistes (5 prompts, 4 parseurs) et sur les mécanismes de collecte des 2 autres modules.
- **« Rien n'est décidé à la place de la personne »** (Comparer mes pistes) : respecté partout, textes d'écran et prompts vérifiés.
- **Cohérence des données de structures** (Comprendre le cadre) : vérification systématique sur les 523 lignes du registre d'adresses, aucune ligne réelle sans date ni sans portée territoriale.
- **Cohérence des blocs santé** (Comprendre les chiffres) : structure, style et mécanisme identiques aux blocs plus anciens, aucune 4ᵉ implémentation divergente pour le rendu lui-même (seule l'infobulle de la courbe annuelle, finding 7, est une implémentation séparée mais antérieure aux blocs santé).
- **Aucune trace de code du prototype abandonné** dans le module actif « Comparer mes pistes » : seuls 3 fichiers orphelins (prompt + 2 docs de cahier), jamais chargés par aucun code, gardés en réserve comme décidé.
- **Tests** : Comparer mes pistes a 36 tests dédiés. `npm test` : 854/854 verts sur l'ensemble.

## Recommandation de traitement

Comme pour les cartes précédentes, tout ce qui pouvait se corriger sans ambiguïté l'a été dans ce même passage (findings 1, 2, 3, 4, 6, 7, 10, 11, 12, 13, les deux derniers une fois ta décision reçue). Les findings 5 et 9 (absence de tests, deux modules) sont mis de côté comme un mini-chantier à part plutôt qu'improvisés ici. Le finding 8 (aide contextuelle absente) est laissé tel quel, dans la continuité de ce qui a été décidé pour d'autres modules équivalents. Le finding 14 (question B7 manquante) reste signalé sans action, faute d'information suffisante pour juger s'il s'agit d'un oubli.
