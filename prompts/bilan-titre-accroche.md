Ce message est une consigne à exécuter, pas un texte à commenter, reformuler ou évaluer : applique-la directement et entièrement dès maintenant, sans donner ton avis sur sa formulation, sans demander de confirmation, sans annoncer d'étapes, et produis en une seule réponse le résultat au format demandé ci-dessous.

# PROMPT : BILAN DE CANDIDATURE (TITRE ET ACCROCHE DU CV)
### À coller en une seule fois sur ChatGPT, Claude ou une autre IA généraliste

---

Exécute directement les instructions ci-dessous, sans les commenter ni donner ton avis sur leur formulation, et sans poser de question préalable : la personne qui te lit attend directement le résultat au format demandé, en une seule fois, pas un dialogue.

**Toute ta réponse est rédigée en français.**

---

## 1. Ton rôle

Le CV ci-dessous n'a pas de titre et/ou pas de phrase d'accroche en tête de document, les deux premiers éléments lus par un recruteur. Ta mission : proposer un titre et plusieurs phrases d'accroche, à partir uniquement du contenu réel du CV fourni.

**Tu dois uniquement :** proposer un titre court (l'intitulé affiché sous le nom, ex. « Chargé de clientèle », « En reconversion vers le métier de vendeur ») et 3 à 5 phrases d'accroche distinctes (2 à 3 lignes chacune, un résumé du profil).

**Tu ne dois jamais :** modifier, réévaluer ou commenter le reste du CV ; produire un diagnostic ; inventer un métier visé, une expérience, un chiffre ou une compétence absente de ce qui t'est fourni.

---

## 2. Le métier visé : n'invente jamais s'il est absent

Un métier visé peut être fourni plus bas (offre d'emploi ciblée, ou métier renseigné par la personne). **S'il est fourni**, oriente le titre et les accroches vers ce métier précis, en priorité.

**S'il n'est pas fourni :** n'invente JAMAIS un intitulé de poste précis. Construis le titre et les accroches uniquement à partir de ce que le CV démontre réellement (secteur d'expérience, compétences répétées, ancienneté), ex. « Professionnel(le) de la relation client » plutôt qu'un métier précis non confirmé. Une formulation un peu générale mais honnête vaut toujours mieux qu'un métier inventé.

---

## 3. Règles de prudence

- N'affirme rien qui ne soit relié au contenu explicite du CV fourni plus bas.
- N'invente jamais un chiffre, un résultat ou une compétence absente du CV.
- En cas de doute, retiens l'option la plus prudente, jamais la plus flatteuse.

---

## 4. Format de ta réponse

D'abord une phrase courte annonçant que les propositions sont prêtes, jamais un résumé de leur contenu, qui n'existe que dans le JSON.

Termine ensuite IMPÉRATIVEMENT ta réponse par un bloc de code contenant uniquement du JSON strictement valide, sans aucun texte après ce bloc :

```json
{
  "titre": "...",
  "accroches": ["...", "...", "..."]
}
```

Précisions sur ce schéma :
- `titre` : un seul intitulé, court, prêt à être affiché tel quel sous le nom.
- `accroches` : 3 à 5 propositions distinctes, chacune autonome et complète (jamais des variantes d'une même phrase, jamais numérotées dans le texte lui-même).

---

## Données du CV

**Métier visé :** {METIER_VISE_OU_NON_FOURNI}

**Offre d'emploi ciblée :** {OFFRE_EMPLOI_OU_NON_FOURNIE}

**CV (anonymisé) :**
{CV_TEXTE}
