# Principes UX de Repères

**Statut** : charte de conception, à appliquer à toute maquette future. Ce document ne contient ni écran, ni wireframe, ni code — uniquement des principes testables contre lesquels évaluer chaque proposition d'interface.
**Rattaché à** : `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md` (conception fonctionnelle, figée).
**Vocabulaire** : « Partagé »/« Privé » ci-dessous désignent le même principe que « Prêt à en parler »/« Pour moi » dans l'application (libellés renommés après implémentation, le mot « Partagé » impliquant à tort une transmission réelle). Les principes eux-mêmes (geste conscient, réversibilité) n'ont pas changé.

**Comment utiliser ce document** : face à toute maquette ou proposition d'écran, vérifier qu'elle respecte chacun des principes ci-dessous. Un principe violé n'est pas nécessairement disqualifiant, mais doit être justifié explicitement plutôt qu'ignoré.

---

## A. Vitesse et légèreté de la création

1. **Un Repère se crée en moins de 15 secondes.** C'est la contrainte de départ du chantier, elle prime sur toute autre considération d'enrichissement.
2. **Un seul choix est demandé à la création** : le type (Question / Idée / À approfondir / À discuter). Rien d'autre n'est requis.
3. **Aucune saisie n'est obligatoire à la création**, y compris sous forme de champ facultatif — un champ texte vide, même optionnel, crée par sa seule présence une pression à écrire. *(Note 2026-08-18, audit de cohérence documentaire : révisé pour le Repère libre après un test utilisateur réel — un écran de saisie facultative titre/texte s'ouvre désormais automatiquement après le choix du type, voir `modules/reperes/ARCHITECTURE_TECHNIQUE.md`. Reste vrai pour le Repère ancré.)*
4. **La création ne doit jamais ressembler à un formulaire.** Un geste (un tap, un clic sur une icône) doit suffire — pas de validation intermédiaire, pas d'étape de confirmation superflue.
5. **Le chargement du module doit rester léger.** Il doit pouvoir s'ouvrir et se refermer en quelques secondes volées (salle d'attente, pause), pas dans un contexte qui suppose du temps disponible.

## B. Continuité du parcours

6. **Ne jamais interrompre une lecture en cours.** Créer un Repère depuis un mot ou un passage doit se faire sans quitter l'écran où la personne se trouve déjà.
7. **Aucun changement brutal de contexte.** Pas de redirection vers un nouvel écran isolé pour un geste aussi simple que la création — privilégier une interaction en place (survol, popover, extension légère de l'écran courant).
8. **Le module doit rester accessible sans dossier complet ni CV rédigé.** La brique Comprendre en particulier doit fonctionner pour quelqu'un qui n'a encore rien construit dans ERIP.
9. **Rien ne doit dépendre de la présence simultanée du CIP.** Le bénéficiaire doit pouvoir parcourir tout le cycle seul, de la création au partage, sans qu'un rendez-vous soit en cours ou même prévu.

## C. Absence de pression et de relance

10. **Toujours permettre une reprise ultérieure, jamais l'exiger.** Un Repère resté minimal (type + source seule) est un état final valide, pas un état incomplet à corriger.
11. **Aucune notification, aucune relance, aucun rappel.** Le module ne doit jamais chercher à faire revenir la personne artificiellement — l'usage doit rester déclenché par un besoin réel, jamais par une sollicitation de l'outil.
12. **Aucun indicateur de progression, de score ou de quota** (« 3 Repères sur 5 traités », par exemple). Ça introduirait une évaluation implicite, explicitement exclue du concept.
13. **Un Repère n'expire jamais et ne devient jamais visuellement « en retard » ou « urgent ».** Aucune notion de délai ou d'échéance ne doit lui être associée.

## D. Propriété et confiance

14. **Un Repère appartient au bénéficiaire, jamais au CIP.** Toute décision d'interface doit pouvoir se justifier par cette hiérarchie : en cas de doute sur un droit d'action, il revient par défaut au bénéficiaire, jamais au CIP.
15. **Le partage est un geste conscient et visible, jamais un effet de bord.** Aucune action ne doit rendre un Repère partagé par accident ou par défaut (ex. un délai qui le partagerait automatiquement).
16. **Toute action doit être réversible** : changer le type, retirer un partage, annuler un « discuté ». Seule la suppression met fin au Repère — et elle doit rester aussi simple que la création, sans confirmation lourde ni justification à fournir.
17. **Rien de ce qui reste privé n'est jamais visible au CIP, sous aucune forme** (ni aperçu partiel, ni compteur, ni métadonnée). L'absence de mur technique entre les deux (pas de comptes) ne doit jamais se traduire par une fuite d'information dans l'interface.
18. **Le langage de l'interface s'adresse toujours à la première personne** (« mes Repères », « ce que je veux garder ») — jamais à la troisième personne clinique (« le dossier du bénéficiaire », « ses éléments »).

## E. Sobriété émotionnelle

19. **Éviter les écrans vides anxiogènes.** L'absence de Repères ne doit jamais se présenter comme un manque (« vous n'avez encore rien créé ») mais comme un état neutre et normal.
20. **Aucune formulation culpabilisante**, y compris implicite — pas de comparaison, pas de rappel de ce qui n'a « pas encore » été fait.
21. **Aucun vocabulaire professionnel non expliqué dans l'interface elle-même.** Si un terme du module suppose une connaissance du jargon CIP/RH, il doit être compréhensible sans avoir à quitter l'écran.

## F. Cohérence avec l'existant

22. **Le module doit se sentir intégré à ERIP, jamais rapporté.** Continuité visuelle et de ton avec le reste de l'application — pas un sous-produit à part.
23. **Le CIP ne doit jamais percevoir Repères comme un outil de gestion supplémentaire.** Aucune liste à trier, aucun statut à mettre à jour de son côté, aucune charge de travail nouvelle proposée à lui.
24. **La frontière avec le glossaire reste visible dans l'usage, pas seulement dans la documentation** : consulter une définition (Comprendre) et créer un Repère doivent rester deux gestes clairement distincts à l'écran, même s'ils sont proches dans le parcours.

---

## Rappel du principe fondateur

> Un Repère n'est pas une note. C'est un sujet que la personne choisit de ne pas perdre, afin de pouvoir y revenir lorsqu'il deviendra utile.

Tout principe ci-dessus qui entrerait en tension avec cette phrase doit céder devant elle.
