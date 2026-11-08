/* ============================================================
   veilleGardeTextes.js  --  garde des textes écrits à la main de « Comprendre les chiffres » (consigne 134, option 1 de A13)
   ------------------------------------------------------------
   Problème : un paragraphe d'interprétation (« Lecture du territoire ») cite des chiffres recopiés des lignes de données du même fichier.
   Quand un relevé change une ligne, le paragraphe garde l'ancien chiffre, et aucun test ne le voyait.
   Cette garde relit le fichier trimestriel (`<AAAA-MM>.md`) et vérifie, territoire par territoire :
     1. chaque nombre cité dans le paragraphe existe dans les lignes de données de CE territoire (puces et séries) ;
     2. le trimestre nommé dans le paragraphe (« deuxième trimestre 2026 ») est celui de la période du fichier (« avril à juin 2026 »).
   Elle ne juge jamais le SENS d'une phrase (« un peu en dessous de la moyenne ») : c'est le rôle de l'option 3 (déclaration des appuis).
   Aucune dépendance (Node seul), aucune écriture : elle ne fait que lire. Rend la liste des problèmes en français (vide si tout concorde).
   ============================================================ */
'use strict';

const TERRITOIRES = {
  'Dordogne': ['Dordogne'],
  'Haute-Vienne': ['Haute-Vienne'],
  'Nouvelle-Aquitaine': ['Nouvelle-Aquitaine'],
  'France entière': ['France entière', 'France métropolitaine']
};

// Un nombre cité : décimal (7,9), pourcentage (47 %), ou grand nombre avec espaces (50 400).
const RE_NOMBRE = /[+\-−]?\d[\d   ]*,\d+ ?%?|[+\-−]?\d+ ?%|\d{1,3}(?:[   ]\d{3})+/g;

const TRIMESTRES = {
  premier: 'janvier à mars', deuxième: 'avril à juin', troisième: 'juillet à septembre', quatrième: 'octobre à décembre'
};

function normaliser(texte) { return String(texte || '').replace(/\r\n/g, '\n'); }

// Nombres d'un texte, sans le signe ni le « % » (le signe se dit parfois en mots, « en hausse »).
function nombresDe(texte) {
  return (String(texte).match(RE_NOMBRE) || []).map(function (s) {
    return s.trim().replace(/^[+\-−]/, '').replace(/\s?%$/, '').trim();
  });
}

// Les lignes de données de chaque territoire : une puce « - Dordogne (24) : ... » et les lignes indentées qui la suivent (serie, serie_annuelle, histo, repere).
function lignesParTerritoire(donnees) {
  const puces = {};
  let courant = null;
  donnees.split('\n').forEach(function (l) {
    const m = /^- (Dordogne|Haute-Vienne|Nouvelle-Aquitaine|France entière|France métropolitaine)/.exec(l);
    if (m) { courant = m[1]; (puces[courant] = puces[courant] || []).push(l); }
    else if (courant && /^\s+(serie|serie_annuelle|histo|repere):/.test(l)) { puces[courant].push(l); }
    else if (l.trim() === '' || /^#/.test(l)) { courant = null; }
  });
  const parNom = {};
  Object.keys(TERRITOIRES).forEach(function (nom) {
    parNom[nom] = TERRITOIRES[nom].reduce(function (acc, cle) { return acc.concat(puces[cle] || []); }, []).join('\n');
  });
  return parNom;
}

// Contrôle un fichier trimestriel complet (texte). Rend { problemes: [...], nbNombres, nbParagraphes }.
function controlerDigest(texteBrut) {
  const t = normaliser(texteBrut);
  const problemes = [];
  const coupe = t.split('\n## Lecture du territoire');
  if (coupe.length < 2) { return { problemes: ['Le fichier n\'a pas de section « Lecture du territoire » à contrôler.'], nbNombres: 0, nbParagraphes: 0 }; }
  const donnees = coupe[0].split('\n## Synthèse courte')[0];
  const lignes = lignesParTerritoire(donnees);
  const periode = (/^periode:\s*"?([^"\n]+)"?/m.exec(t) || [])[1] || '';
  let nbNombres = 0, nbParagraphes = 0;
  coupe[1].split(/\n### /).slice(1).forEach(function (bloc) {
    const nom = bloc.split('\n')[0].trim();
    const paragraphe = bloc.split('\n').slice(1).join(' ').replace(/\s+/g, ' ');
    if (!lignes[nom]) { problemes.push('Territoire « ' + nom + ' » : aucune ligne de données trouvée pour contrôler son paragraphe.'); return; }
    nbParagraphes++;
    nombresDe(paragraphe).forEach(function (n) {
      nbNombres++;
      if (lignes[nom].indexOf(n) === -1) {
        problemes.push('« ' + nom + ' » : le paragraphe cite ' + n + ', mais aucune ligne de données de ce territoire ne porte ce chiffre. Relire le paragraphe.');
      }
    });
    // Contrôle précis (un ancien chiffre peut survivre dans une série plus ancienne) : le taux annoncé est la valeur en gras de la première puce du territoire, et « un an plus tôt » est son « il y a un an ».
    const premiere = lignes[nom].split('\n')[0] || '';
    const valeur = (/\*\*([\d,]+) ?%\*\*/.exec(premiere) || [])[1];
    const anAvant = (/il y a un an : ([\d,]+) ?%/.exec(premiere) || [])[1];
    const dit = /s'établit à ([\d,]+) ?%/.exec(paragraphe);
    if (valeur && dit && dit[1] !== valeur) { problemes.push('« ' + nom + ' » : le paragraphe annonce un taux de ' + dit[1] + ' %, mais la valeur relevée est ' + valeur + ' %. Relire le paragraphe.'); }
    const ditAn = /\(([\d,]+) ?% un an plus tôt\)/.exec(paragraphe);
    if (anAvant && ditAn && ditAn[1] !== anAvant) { problemes.push('« ' + nom + ' » : le paragraphe dit ' + ditAn[1] + ' % un an plus tôt, mais le relevé donne ' + anAvant + ' %. Relire le paragraphe.'); }
    // Chômage de longue durée : la part citée entre parenthèses après « depuis plus d'un an » est la valeur en gras de la puce « inscrits depuis un an et plus » (une série plus ancienne peut porter le même nombre sans être la valeur actuelle).
    const puceLongue = lignes[nom].split('\n').filter(function (x) { return /^- /.test(x) && /inscrits depuis un an et plus/.test(x); })[0] || '';
    const valeurLongue = (/\*\*(?:environ )?([\d,]+) ?%\*\*/.exec(puceLongue) || [])[1];
    const ditLongue = /depuis plus d'un an \((?:environ )?([\d,]+) ?%/.exec(paragraphe);
    // Les deux avec décimale : égalité exacte ; sinon (« environ 47 % ») : même nombre arrondi.
    const memeLongue = ditLongue && valeurLongue && (/,/.test(ditLongue[1]) && /,/.test(valeurLongue)
      ? ditLongue[1] === valeurLongue
      : Math.round(parseFloat(ditLongue[1].replace(',', '.'))) === Math.round(parseFloat(valeurLongue.replace(',', '.'))));
    if (valeurLongue && ditLongue && !memeLongue) {
      problemes.push('« ' + nom + ' » : le paragraphe donne ' + ditLongue[1] + ' % de personnes inscrites depuis plus d\'un an, mais la valeur relevée est ' + valeurLongue + ' %. Relire le paragraphe.');
    }
    // Le paragraphe doit nommer la période du fichier au moins une fois quand il cite un trimestre précis : sinon il parle d'une autre période que celle des chiffres.
    const nomme = paragraphe.match(/(premier|deuxième|troisième|quatrième) trimestre \d{4}/gi) || [];
    if (periode && nomme.length && !nomme.some(function (s) {
      const mm = /(premier|deuxième|troisième|quatrième) trimestre (\d{4})/i.exec(s);
      return periode.indexOf(TRIMESTRES[mm[1].toLowerCase()] + ' ' + mm[2]) !== -1;
    })) {
      problemes.push('« ' + nom + ' » : le paragraphe parle du ' + nomme.join(', ') + ' alors que le fichier couvre « ' + periode + ' ». Relire le paragraphe.');
    }
  });
  return { problemes: problemes, nbNombres: nbNombres, nbParagraphes: nbParagraphes };
}

module.exports = { controlerDigest: controlerDigest, nombresDe: nombresDe, lignesParTerritoire: lignesParTerritoire };
