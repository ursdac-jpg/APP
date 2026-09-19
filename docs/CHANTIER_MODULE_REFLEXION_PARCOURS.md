# Chantier « Module de réflexion du parcours » — Fiche de conception

**Statut** : conception fonctionnelle figée après convergence complète. Ne plus revenir sur le principe du module sauf découverte d'un problème majeur pendant la maquette. **Mise à jour (2026-08-18, audit de cohérence documentaire)** : implémenté depuis (module Repères, voir `modules/reperes/index.js` et `modules/reperes/ARCHITECTURE_TECHNIQUE.md`, référence à jour) — une règle ci-dessous (« Aucun texte n'est jamais demandé à la création ») a par ailleurs été révisée pendant l'implémentation, voir la note à cet endroit.
**Vocabulaire mis à jour après implémentation** : ce document emploie encore « Partagé »/« Privé » ci-dessous (raisonnement historique conservé tel quel). Ces libellés ont été remplacés dans l'application par « Prêt à en parler »/« Pour moi » — le mot « Partagé » impliquait une transmission réelle qui n'a jamais existé (aucun backend, aucune donnée transmise automatiquement). Le fonctionnement décrit ici (visibilité et Discuté, deux dimensions indépendantes et réversibles) reste, lui, inchangé.
**Origine** : ce chantier était initialement nommé « Vue CIP » dans la feuille de route du 2026-08-13 (`docs/AUDIT_STRATEGIQUE_ERIP_2026-08.md`). Cette fiche remplace et annule ce cadrage initial — voir section 1.

---

## 1. Identité du concept

**Nom provisoire** : *Repères*. Justification : la fonction du module est de poser un repère au moment où une question apparaît, pour le retrouver plus tard — pas de tenir un journal ni un tableau de bord. Nom à revalider, en particulier si l'application elle-même est renommée (discussion en cours par ailleurs).

**Phrase de définition** : Un espace où une question, une incompréhension ou une réflexion qui apparaît dans le parcours d'insertion peut être comprise, gardée, et retrouvée — seule ou avec son CIP.

**Problème résolu** : une réflexion qui naît dans le parcours (un mot incompris, un doute sur le projet, une question) n'a aujourd'hui nulle part où exister entre le moment où elle apparaît et le moment où elle pourrait être utile. Elle se perd, faute de destinataire immédiat et de mémoire — l'oral ne « reprend » jamais automatiquement une pensée laissée en suspens trois semaines plus tôt.

**Promesse principale** : ce n'est ni la définition seule (disponible ailleurs), ni le fait de noter une pensée (un bloc-notes le fait déjà), mais que les deux vivent au même endroit que la candidature déjà en cours, sans compte, disponibles au moment exact du besoin, et portables jusqu'au rendez-vous sans ressaisie.

**Un Repère n'est pas une note. C'est un sujet que la personne choisit de ne pas perdre, afin de pouvoir y revenir lorsqu'il deviendra utile.** Cette phrase est le principe directeur retenu pour toute décision UX ultérieure sur le module — elle tranche par défaut toute hésitation entre « capturer une pensée complète » et « conserver un sujet ».

---

## 2. Utilisateurs

**Bénéficiaire** — utilisateur principal, propriétaire de ses réflexions. Le module est un outil de son parcours à lui, pas un outil partagé par défaut.

**CIP** — accompagnateur potentiel, jamais deuxième propriétaire de l'outil. Il peut le recommander (« vous pouvez utiliser ceci entre nos rendez-vous ») mais n'en a pas besoin pour exercer son métier.

| | Peut voir | Peut faire | Ne peut pas faire |
|---|---|---|---|
| **Bénéficiaire** | Tout ce qui lui appartient (privé + partagé) + le contenu générique (Comprendre) | Créer, éditer, supprimer une réflexion ; changer son état privé ↔ partagé ; la marquer discutée | — |
| **CIP** | Uniquement ce qui a été explicitement partagé, + le contenu générique en support de dialogue | Consulter ce qui est partagé ; en discuter à l'oral | Créer un item ; rendre partagé un item resté privé ; éditer ou supprimer une réflexion du bénéficiaire ; voir quoi que ce soit resté privé |

---

## 3. Boucle fonctionnelle

**Comprendre → Réfléchir → Conserver → Partager (si je le souhaite) → Reprendre**

Principe de conception central : **chaque étape est une sortie légitime, pas une étape intermédiaire d'un tunnel de conversion.** Rien ne doit inciter à aller plus loin que ce que la personne souhaite.

- **Comprendre** — la personne rencontre un mot ou une notion, consulte sa définition contextualisée. *Si elle s'arrête ici* : rien n'est conservé, aucune trace, usage complet et légitime en soi — comme un dictionnaire qu'on referme.
- **Réfléchir** — elle se demande ce que ça signifie pour elle. *Si elle s'arrête ici* : la réflexion reste mentale, non enregistrée. ERIP n'a pas à la capter à ce stade — aucune relance, aucune notification.
- **Conserver** — elle qualifie sa pensée par un type, en un seul geste (voir « Ce qu'est un Repère, concrètement » ci-dessous). *Si elle s'arrête ici* : le Repère existe déjà sous une forme complète et valide — type + source automatique + date — strictement privé, jamais vu par personne, modifiable ou supprimable à tout moment sans justification. Aucune précision supplémentaire n'est jamais requise à ce stade.
- **Partager** — geste volontaire, unique, réversible. *Si elle s'arrête ici* : l'item devient visible au CIP mais n'attend rien de précis en retour tant qu'aucun rendez-vous n'a eu lieu — pas de relance, pas de statut « en attente » anxiogène.
- **Reprendre** — au moment utile (rendez-vous ou non), l'un ou l'autre retrouve l'item. C'est aussi, naturellement, le moment le plus propice pour proposer — jamais imposer — d'enrichir un Repère resté minimal (voir ci-dessous). Après reprise, rien n'oblige à une conclusion formelle : l'item peut rester ouvert indéfiniment, être discuté à l'oral sans se retranscrire dans l'outil, ou être supprimé.

**« Agir » est délibérément exclu de cette boucle.** L'action réelle (postuler, faire une démarche, décider) se passe hors ERIP ou dans d'autres modules déjà existants (Bilan CV, entretien). Tenter de la capturer ferait glisser le mécanisme vers un système de suivi de réalisation — explicitement exclu (section 10).

### Ce qu'est un Repère, concrètement

**À la création**, un Repère ne capture jamais « pourquoi je veux le garder » — seulement « quel type de Repère est-ce », par un choix dans une taxonomie fixe :
- 📌 Question
- 💡 Idée
- 🔍 À approfondir
- 💬 À discuter

Ce choix, combiné à la source automatique **quand elle existe** (voir distinction ci-dessous) et à la date, suffit à constituer un Repère complet. *(Ces quatre libellés restent à valider en phase de maquette — un risque de chevauchement entre catégories, notamment Idée/À approfondir et Question/À discuter, a été identifié et doit être testé avant d'être figé.)*

**Repères ancrés et Repères libres.** Une réflexion a toujours une origine — mais cette origine n'est pas toujours un contenu qu'ERIP peut observer. On distingue :
- **Repère ancré** : la source est un contenu déjà affiché dans ERIP (un mot du lexique, une recommandation, un axe de diagnostic, une fiche, un résultat de recherche) — le mot ou le passage d'origine est capté automatiquement, sans effort demandé à la personne.
- **Repère libre** : la réflexion existe bien, avec une origine réelle (un rendez-vous, un entretien, un échange, une offre, une pensée personnelle), mais cette origine est extérieure à ce qu'ERIP peut capter automatiquement.

Cette distinction remplace la formulation antérieure et trompeuse « avec/sans source ». Elle ne change **rien** au mécanisme de création — un seul geste, un seul choix (le type), jamais de champ pour préciser l'origine dans les deux cas. Demander « d'où vient cette réflexion » romprait le même principe qui a fait abandonner le champ texte à la création (voir plus bas) : le coût cognitif d'une question dépasserait la valeur immédiate qu'elle apporte. Le seul effet observable de la distinction est que le Repère ancré dispose d'un indice de contexte automatique (le mot/passage) que le Repère libre n'a pas — un écart déjà accepté comme compromis pour la reprise (voir section 9).

**Aucun texte n'est jamais demandé à la création.** Un champ libre, même présenté comme facultatif, crée par sa seule présence une pression à écrire — l'expérience de conception a montré que cette pression contredit l'objectif de simplicité radicale. Le texte libre n'existe que comme **édition ultérieure**, toujours optionnelle, proposée au moment de la reprise plutôt qu'à la création — un moment psychologiquement plus disponible pour préciser une pensée que celui, pressé, de la capture initiale.

> **Note (2026-08-18, audit de cohérence documentaire)** : cette règle a été révisée après un test utilisateur réel de Denis, postérieur à cette fiche — pour un Repère libre, un écran de saisie (titre + texte, tous deux facultatifs) s'ouvre désormais automatiquement juste après le choix du type, voir `modules/reperes/ARCHITECTURE_TECHNIQUE.md` section « Titre et texte à la création (geste libre uniquement) ». Le principe reste respecté pour le Repère ancré (aucune saisie à la création). Voir aussi `docs/PRINCIPES_UX_REPERES.md`, même écart.

**Principes UX retenus pour la création d'un Repère** (à respecter dans toute maquette future) :
- On ne cherche pas à capturer une pensée complète ; on cherche à conserver un sujet de réflexion.
- Le sens peut émerger progressivement au fil du parcours plutôt qu'être exigé dès la création.
- Aucune pression à écrire n'est jamais introduite, même sous une forme facultative.
- L'enrichissement est une possibilité offerte à la reprise, jamais une obligation, à aucun moment.
- Ne jamais demander aujourd'hui une information qui pourra être demandée demain.

---

## 4. Modèle de visibilité

**Deux dimensions indépendantes, précisées le 2026-08-14 après une ambiguïté détectée pendant la conception de l'écran Reprendre** (la formulation précédente, « Privé → Partagé → Discuté », laissait croire à une séquence à choix exclusif — ce n'était pas le modèle réellement voulu) :

1. **Visibilité** : Privé ↔ Partagé. Toggle exclusif et réversible dans les deux sens, uniquement à l'initiative du bénéficiaire.
2. **Discuté** : marqueur optionnel et non administratif, qui ne peut s'appliquer qu'à un Repère actuellement (ou déjà) partagé — on ne peut pas avoir discuté de quelque chose que le CIP n'a jamais vu. Ce marqueur **ne remplace jamais** l'état de visibilité : un Repère peut être à la fois Partagé et Discuté. Rien ne justifierait qu'être marqué « discuté » retire automatiquement la visibilité au CIP — seul le passage explicite « Partagé → Privé » le fait.

**Qui peut changer un état** : uniquement le bénéficiaire, sur les deux dimensions. Ce n'est pas au CIP de clore un sujet dans l'outil du bénéficiaire — même après en avoir parlé à l'oral, c'est la personne qui décide si l'item reste partagé, redevient privé, et si le marqueur discuté est posé ou retiré.

**Réversibilité** :
- Partagé → Privé : possible à tout moment, indépendamment du marqueur Discuté. Limite honnête à assumer : si le CIP a déjà consulté l'item avant ce retrait, revenir en arrière n'efface pas ce qu'il a lu — seule la visibilité *future* est reprise en main.
- Discuté → non-discuté : réversible sans conséquence, indépendamment de l'état de partage.

**Filtre d'affichage, décidé le 2026-08-14 lors de la conception de l'écran Reprendre.** ERIP n'ayant pas de comptes séparés, le bénéficiaire et le CIP consultent physiquement le même écran quand ils sont ensemble — rien ne sépare techniquement leurs sessions. La confidentialité du privé ne peut donc pas reposer uniquement sur la vigilance de la personne à chaque instant. Solution retenue : un filtre d'affichage, entièrement contrôlé par le bénéficiaire, à deux positions :
- *Tous mes Repères* (par défaut)
- *Repères partagés uniquement*

Ce filtre ne change **jamais** les données ni les états — uniquement ce qui est affiché à l'écran à un instant donné. Ce n'est pas une vue différente selon qui regarde (ce serait recréer une « Vue CIP » par la bande) : c'est un choix d'affichage que le propriétaire des Repères actionne lui-même, par exemple juste avant de montrer son écran à son CIP. Ce principe gouverne la conception de l'écran Reprendre et de tout parcours futur qui afficherait une liste de Repères.

**Suppression** : possible à tout moment, par le bénéficiaire seul, sans confirmation lourde ni justification à fournir — cohérent avec le principe que ce n'est pas un dossier.

---

## 5. Données

**Déjà présentes dans ERIP, réutilisées** : `dossier` comme point d'ancrage local (pas de nouveau compte) ; les axes/recommandations du Bilan CV comme source ponctuelle de mots pour la brique Comprendre.

**Nouvelles données nécessaires** : le type choisi à la création (parmi la taxonomie fixe : Question / Idée / À approfondir / À discuter) ; la source automatique quand elle existe — Repère ancré uniquement (mot ou passage d'origine) ; la date ; son état (privé/partagé/discuté). Le texte libre n'est jamais recueilli à la création — seulement en édition ultérieure, facultative, proposée à la reprise. L'origine d'un Repère libre n'est jamais demandée ni déduite, quelle qu'elle soit.

**Jamais demandées** : toute information de santé, logement, situation familiale, ressources financières ; toute identité au-delà de ce que `dossier` contient déjà.

**Jamais déduites** : aucune classification automatique de responsabilité (« dépend de vous / du contexte ») ; aucune inférence de freins personnels à partir du texte libre — même si la personne l'évoque incidemment, l'outil ne doit rien en tirer automatiquement.

**Jamais conservées** : le texte brut des réponses IA dans le temps ; tout indice de présence ou d'absence à un rendez-vous.

---

## 6. Rapport avec l'existant

- **`dossier`** : extension légère, nouvelle liste de réflexions rattachée localement — aucune modification de ce qui existe.
- **Bilan CV** (`resultat.axes`, `recommandations`) : reste totalement séparé et intact. Sert de source ponctuelle de mots cliquables pour Comprendre, ne module en rien son fonctionnement propre.
- **`planAction` / `_bilanStatutsCorrection`** : appartiennent au Bilan CV, pas à ce chantier (décision actée précédemment). Pourront cohabiter visuellement plus tard, mais relèvent d'un autre mécanisme.
- **Module entretien** : même logique que le Bilan CV — source ponctuelle de vocabulaire, rien de plus.
- **Futur glossaire/bibliothèque** : n'est pas un chantier séparé. Sa version contextuelle (mots déjà rencontrés) est la brique Comprendre elle-même, incluse dès le MVP. Son extension en bibliothèque autonome consultable librement est une V2 (section 9).

**Relève de ce chantier** : la boucle et son modèle de visibilité.
**Ne relève pas de ce chantier** : la qualité de la candidature (Bilan CV), le suivi du plan d'action, tout diagnostic social ou de parcours global.

---

## 7. Différenciation

- **vs. un moteur de recherche** : un moteur répond et oublie. Ici la réponse se rattache à une réflexion personnelle, gardée et reprise dans le contexte précis du parcours de la personne.
- **vs. un bloc-notes** : un bloc-notes est un espace neutre et générique. Ici chaque réflexion naît d'un point de compréhension précis et peut être partagée dans un cadre pensé pour un dialogue avec un accompagnant — pas juste stockée.
- **vs. l'outil CV existant** : le Bilan CV évalue et corrige un document. Ce mécanisme ne produit ni ne corrige aucun document ; il accompagne une pensée.
- **vs. i-Milo / un logiciel de suivi** : i-Milo trace pour l'institution et appartient au professionnel. Ce mécanisme appartient au bénéficiaire, ne produit aucune preuve, aucune valeur administrative, et rien n'y est visible sans son accord explicite.
- **Pourquoi intéressant sans compte** : la portabilité est immédiate — l'objet ouvert seul chez soi est exactement celui apporté au rendez-vous, sans ressaisie, sans synchronisation, sans risque de mot de passe oublié — une vraie barrière pour un public à autonomie numérique réduite.

---

## 8. MVP — le plus petit produit qui permette de savoir si l'hypothèse est vraie

L'hypothèse à tester n'est pas « cette fonctionnalité est-elle utilisable » mais : **un bénéficiaire ouvre-t-il réellement ce mécanisme entre deux rendez-vous, de son propre chef, et cela change-t-il quelque chose au rendez-vous suivant ?** — l'hypothèse la plus incertaine identifiée pendant la phase d'exploration.

Le plus petit produit testable :
1. Un point d'entrée Comprendre minimal — un petit lexique (10-15 mots) ancré aux mots déjà présents dans un diagnostic Bilan CV existant. Pas besoin d'une bibliothèque complète pour tester l'hypothèse.
2. La capacité de créer un Repère en un geste — choix d'un type dans la taxonomie fixe, rien d'autre. Aucun champ texte à la création.
3. La capacité de la partager (bouton simple, réversible).
4. L'affichage de ces Repères (privés + partagés) à la visite suivante, avec une invitation optionnelle à préciser un Repère resté minimal — jamais une obligation.

Rien d'autre au lancement. Pas de journal guidé, pas de reformulation à 3 niveaux de l'ensemble du diagnostic, pas de cycle « Discuté » élaboré — ces raffinements n'ont de sens que si l'hypothèse centrale se confirme.

**Recommandation avant tout code** : tester ce concept avec un CIP en exercice (et si possible un bénéficiaire réel) sur une maquette non fonctionnelle, pour vérifier que l'idée « parle » avant d'investir du temps de développement — cohérent avec la discipline déjà appliquée au chantier Bilan CV (diagnostic → maquette → code).

---

## 9. V2 / plus tard

- Journal guidé (questions structurées : qu'ai-je fait / appris / qu'est-ce qui a changé).
- Bibliothèque élargie, consultable librement au-delà des mots déjà rencontrés dans un diagnostic.
- État « Discuté » avec un cycle de vie plus riche que privé/partagé.
- Rapprochement visuel avec `planAction` × `_bilanStatutsCorrection` (reste un mécanisme distinct, cohabitation d'écran éventuelle seulement).
- Export ou persistance étendue au-delà de ce que permet déjà le mécanisme de sauvegarde de session existant.
- Regroupement ou historique des Repères créés sur un même terme source, pour limiter la confusion quand plusieurs Repères minimalistes (type + source seule) s'accumulent sur le même mot sans texte pour les distinguer — limite identifiée pendant la conception, acceptée comme compromis pour le MVP.

---

## 10. Exclusions définitives

- Reporting CIP ou tableau de bord candidat.
- Notes cachées ou unilatérales (dans un sens comme dans l'autre).
- Tracking comportemental (présence, assiduité, régularité d'usage).
- Diagnostic social (santé, logement, famille, ressources).
- Évaluation ou notation du bénéficiaire.
- Classification automatique de responsabilité (« dépend de vous / du CIP / du marché »).
- Toute fonction remplaçant i-Milo ou apportant une valeur de preuve institutionnelle.
- Compte utilisateur ou authentification.
- Chat ouvert avec l'IA sur ce sujet — cohérent avec la discipline déjà appliquée ailleurs dans ERIP (axes fixes, jamais de conversation libre).

---

## 11. Critères de réussite (fonctionnels et d'usage)

- Des bénéficiaires utilisent la brique Comprendre sans qu'on le leur rappelle activement à chaque visite.
- Une partie des réflexions conservées sont partagées avant même que le CIP ne les sollicite à l'oral.
- Des CIP rapportent qu'un rendez-vous a démarré différemment (question précise plutôt que silence poli) grâce à un item partagé.
- Le bénéficiaire modifie ou supprime librement ses réflexions sans y être incité — signe qu'il se sent réellement propriétaire de l'espace.
- Aucun CIP ne demande à accéder aux réflexions restées privées — signe que le principe de visibilité est compris et accepté sans friction.

**Signal d'échec à surveiller** : si le mécanisme n'est utilisé que pendant les rendez-vous eux-mêmes, jamais seul entre deux — cela invaliderait l'hypothèse centrale. Dans ce cas, revenir à la case départ plutôt que d'ajouter des fonctionnalités pour compenser.

---

## 12. Scénarios d'échec — où ERIP ne doit pas essayer de faire quelque chose

- **Une question touchant à la santé, au logement, à la situation familiale** : rediriger vers le CIP ou un professionnel compétent, jamais tenter de « comprendre » ou « conserver » ce contenu comme les autres.
- **Une détresse exprimée dans une réflexion** (mots de découragement marqué, expressions inquiétantes) : l'outil ne doit jamais y répondre par un contenu automatique. C'est un point nouveau, pas encore couvert par les garde-fous précédents : un champ de texte libre, même court et bien intentionné, peut techniquement capter ce type de contenu — l'outil doit rester silencieux dessus, ce cas relève exclusivement de l'échange humain.
- **Une question réglementaire précise** (montant d'une aide, condition d'éligibilité) : ne jamais répondre par un chiffre, toujours renvoyer vers la source officielle ou le CIP — même règle que celle déjà actée pour le futur glossaire.
- **Une demande du type « que dois-je faire »** : l'outil peut aider à comprendre et réfléchir, jamais trancher à la place de la personne ni du CIP.
