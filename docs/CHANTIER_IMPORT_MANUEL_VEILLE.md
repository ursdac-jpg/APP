# Chantier : import manuel dans l'outil de veille

> Ouvert et posé le 2026-09-05. Décision Denis : option B (trois prompts séparés, choix explicite
> de la destination), pas de classement automatique.
>
> Motif : le contrôle des liens du 2026-09-05 a montré qu'une dizaine de sites officiels
> (Légifrance, Intérieur, education.gouv.fr, monenfant.fr, justice.fr...) refusent toute lecture
> automatique. Un assistant en ligne ne peut rien en tirer. Il faut une porte d'entrée « texte
> collé à la main ».

---

## 1. Fait le 2026-09-05 (committé)

Dans `outils/veille.html`, nouvelle section **« Importer un texte à la main »**, tout en haut,
hors des deux modes (« Entretenir » / « Créer »), donc toujours visible.

- **Zone de texte** : le passage copié sur le site.
- **Champ « L'adresse exacte de la page que vous avez ouverte »** (retour Denis 2026-09-05). Le
  prompt demande de citer cette adresse comme source ET de la reporter dans le bloc final **avec la
  date du jour** : Denis vient de la consulter, elle est vérifiée. Un site qui bloque la lecture
  automatique n'est pas fermé. C'est la seule exception au « pas de lien tant que non vérifié »
  (LECONS 9.16), et elle est légitime : la vérification, c'est la visite. Toute autre adresse
  ajoutée par l'assistant reste sans date. Générer un prompt avec une adresse d'un domaine connu
  bloqué marque ce site « vu » (`genererImport()`).
- **Zone de contexte** : « Où l'avez-vous trouvé, et que cherchiez-vous ? » (l'idée d'expliciter le
  cadre de la trouvaille : elle oriente le prompt et évite le classement à l'aveugle).
- **Choix de la destination** : Comprendre le cadre / Lexique / Comprendre les chiffres.
- **Trois prompts** (`assemblerImport()`), un par destination, qui injectent le texte + le contexte :
  - **cadre** : l'assistant identifie le ou les rayons, produit des blocs `[FICHE n]` (format du
    prompt 2) + un bloc `[COLLECTE]` (sources et structures avec portée).
  - **lexique** : bloc `[LEXIQUE]` au format du corpus (5quater de `VEILLE_PROMPTS.md`).
  - **chiffres** : bloc `[CHIFFRES]` + note disant que le format définitif attend le module.
- **Sous-section « Les sites à consulter à la main »** : liste `SITES_BLOQUES`, chacun avec lien
  direct et marque « vu le [date] » persistée (`localStorage` `veille_sites_vus`, bouton « J'y suis
  allé »). Sert à savoir quand chaque site a été consulté pour la dernière fois.
- **Note de dépôt** qui change selon la destination (où déposer le résultat).
- **Garde-fou dans le prompt** : travailler à partir du texte fourni, ne rien inventer (adresse,
  numéro de texte, date), écrire « à vérifier » sinon. Adresses extraites -> `liens-verifies.txt`
  colonne date vide (LECONS 9.16).
- Textes explicatifs « Comment ça marche ? » mis à jour (nouveau paragraphe « Le cas particulier :
  un site qui bloque les assistants en ligne »).
- `VEILLE_PROMPTS.md` : nouvelle section 5sexies.

Vérifié en navigateur (clair et sombre) : les trois prompts se génèrent, la persistance tient au
rechargement, la marque « vu » se pose et se garde, aucune erreur console.

---

## 2. Fait le 2026-09-06 (committé) : le branchement du volet « Chiffres »

Traité pendant le chantier « Comprendre les chiffres » (bloc 2 puis bloc 9).

- Le bloc `[CHIFFRES]` de `assemblerImport()` (`cible === 'chiffres'`) est calé sur le format réel
  du module : une entrée par indicateur et par territoire, lignes `indicateur / territoire /
  valeur / date_donnee / valeur_precedente / serie / source` (le même que le prompt trimestriel
  `[CHIFFRES]` de `docs/VEILLE_PROMPTS.md` § 5ter.1, que le module sait parser).
- La **note de dépôt** distingue : un des 5 indicateurs trimestriels -> coller dans le bloc
  « Les 5 chiffres clés du trimestre » de `veille.html` et « Coller ici et lire » ; le portrait
  annuel ou le comparatif Union européenne -> garder pour la prochaine mise en forme de
  `modules/comprendre-les-chiffres/contenu/`.
- Le texte d'introduction du volet a été réécrit (chômage, demandeurs, emploi salarié, offres,
  salaires, métiers en tension, structure de la population, formation).

Pour les volets **Lexique** et **Comprendre le cadre**, rien n'est en attente.

Pour les volets **Lexique** et **Comprendre le cadre**, rien n'est en attente : les formats
existent, les prompts sont complets, le dépôt est le circuit habituel (à la main dans le dépôt).

### Le Balayage et les Chiffres trimestriels sont-ils impactés ? (question Denis 2026-09-05, TRAITÉE le jour même)

Oui. Le Balayage vise le JORF et Légifrance, qui bloquent l'accès automatique ; c'est le prompt le
plus exposé. Trois réponses, cumulables, toutes en place :

1. **Le socle de recherche commun** (`socleRecherche()`, donc Balayage + Chiffres + Lexique +
   collecte + contrôle + à confronter d'un coup) dit : si tu ne peux pas ouvrir une source primaire,
   appuie-toi sur les relais qui la republient (service-public.gouv.fr, Centre Inffo, CARIF-OREF,
   espace presse France Travail, Unédic, presse spécialisée) et signale ce que tu n'as pas pu
   confirmer.
2. **Le prompt de balayage renforcé** : il commence maintenant explicitement par Centre Inffo et
   Cap Métiers Nouvelle-Aquitaine (veilles réglementaires de professionnels, non bloquées), et il
   sait qu'un complément manuel est fait à côté.
3. **Le bloc « Complément manuel du Balayage »** dans `veille.html` (section « Chaque trimestre ») :
   liste les sites bloqués qui publient de la réglementation (`SITES_BLOQUES` avec `veille: true`),
   chacun avec un lien vers la bonne rubrique. Denis les parcourt une fois par trimestre ; pour tout
   changement, il passe par « Importer un texte à la main » -> Comprendre le cadre. Case « parcouru
   pour ce trimestre » par site ; toutes cochées -> « Ce trimestre » marque le point fait. Le digest
   Balayage reste une couche de confort ; la substance vit dans les fiches.

Filet de sécurité : le contrôle mensuel par rayon rattrape ce qui a glissé, dans le mois ou les deux
qui suivent.

Pas de 4e destination « Balayage » dans l'import manuel : le format `[BALAYAGE]` est un balayage de
tout un trimestre, pas un ajout unitaire. Une trouvaille manuelle se range dans les fiches.

### Peut-on contourner le blocage anti-robot ? (question Denis 2026-09-05)

Non, pas de façon fiable et propre. Ces sites utilisent des pare-feux (Cloudflare, Radware,
DataDome) qui repèrent les adresses de centres de données et les signatures non-navigateur. Les
techniques pour passer outre (proxys résidentiels, faux navigateurs, résolution de CAPTCHA) sont
exactement ce qu'on s'interdit, et souvent contraires aux conditions des sites.

Ce qui existe de légitime, mais qui est un chantier en soi, pas un ajout rapide :
- Légifrance a une **API officielle** (PISTE / DILA) et des **données ouvertes** (JORF en masse sur
  data.gouv.fr). service-public.gouv.fr publie aussi de l'open data. Brancher une API dans un outil
  statique sans serveur est un vrai projet.
- Essayer plusieurs assistants : certains (Perplexity, Claude selon la configuration) passent plus
  souvent que d'autres.

Conclusion : pour ces sites précis, le copier-coller à la main est la méthode robuste, et le coût
est faible parce que Denis ne le fait que quand un changement est confirmé comme n'étant que là.

---

## 3. Nouveau chantier à part : connexion Lexique <-> veille

**Noté le 2026-09-05, pas commencé. Petit ou grand chantier, à évaluer.**

Constat de Denis : aujourd'hui le **Lexique** et l'**outil de veille** ne communiquent pas.
- Le prompt « Nourrir le Lexique » (5quater) et le nouveau volet lexique de l'import manuel
  produisent des **entrées candidates** que Denis colle à la main dans `docs/CORPUS_LEXIQUE.md`.
- Rien ne fait le chemin inverse : le module Lexique de l'application ne « sait » pas qu'une
  veille a eu lieu, ne signale pas les termes récemment ajoutés ou modifiés, ne relie pas un mot
  du corpus à ce qui a bougé dans « Comprendre le cadre ».

Question à instruire : **comment créer cette connexion**, et jusqu'où.
- Piste basse : le corpus porte déjà une date par entrée ; le module pourrait afficher « ajouté /
  revu récemment » sans rien changer au circuit.
- Piste haute : un lien entre une entrée de lexique et la ou les fiches de « Comprendre le cadre »
  qui l'emploient (le champ `lexique:` des fiches existe déjà).
- Garde-fou mémoire `feedback_veille_formats_lecture_lexique` : toute idée de nouvelle « vue » du
  corpus se note dans `docs/EVOLUTIONS_LEXIQUE.md`, jamais de nouveau contenu ni de nouveau module.
  Ici on parle de **plomberie entre deux briques existantes**, à cadrer avant de coder.

---

## 4. Ordre

1. **Finir « Comprendre le cadre »** (vérification factuelle de Denis + migration du contenu).
2. **Construire « Comprendre les chiffres »** en module à part, puis boucler le §2 ci-dessus.
3. **Instruire le §3** (connexion Lexique <-> veille).
