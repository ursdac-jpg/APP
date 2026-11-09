// Historique des employeurs écartés (consigne de Denis du 09/11/2026) : à lancer AVANT de déposer un employeur ou une page de recrutement au sas.
// Lecture seule : rien n'est écrit. Code de sortie 1 si un employeur est déjà écarté (ne pas le déposer, sauf demande de Denis).
//   node scripts/employeurEcarte.js nom "Clara Automobiles" 24 [Périgueux] [https://site]   un employeur seul (département 24 ou 87, commune facultative)
//   node scripts/employeurEcarte.js employeurs fichier.txt                                   des lignes au format du sas des employeurs (une par ligne)
//   node scripts/employeurEcarte.js offres fichier.txt                                       des lignes au format du sas des pages d'offres
//   node scripts/employeurEcarte.js liste                                                    tout l'historique des employeurs écartés
'use strict';
const fs = require('fs');
const path = require('path');
const racine = path.join(__dirname, '..');
const { creerDepot } = require('../outils/veilleDepot.js');
const sas = require('../outils/veilleSas.js');
const E = require('../outils/veilleEcartes.js');

function dire(e) { return '« ' + e.titre + ' » écarté le ' + String(e.ecarte_le || e.ecarteLe).split('-').reverse().join('/') + ' : ' + (E.LIBELLES_MOTIFS[e.motif] || e.motifLibelle) + (e.precision ? ' (' + e.precision + ')' : '') + (e.lieu ? ' ; ' + e.lieu : ''); }
const depot = creerDepot(racine);
const [commande, a, b, c, d] = process.argv.slice(2);

if (commande === 'liste') {
  const h = depot.listerEcartes().lignes.filter(function (e) { return e.sorte === 'employeur'; });
  console.log(h.length ? h.map(dire).join('\n') : 'Aucun employeur écarté pour l\'instant.');
  process.exit(0);
}
if (commande === 'nom') {
  if (!a) { console.log('Usage : node scripts/employeurEcarte.js nom "Nom" 24|87 [commune] [site]'); process.exit(2); }
  const ctx = require('../outils/veilleTerritoire.js').contexteDepuis(racine, new Date().toISOString().slice(0, 10));
  const info = sas.infoEmployeur({ nom: a, etablissements: c || '', portee: /^\d{2}$/.test(b || '') ? b : '', site: d || '' }, ctx);
  const t = fs.existsSync(path.join(racine, E.CHEMIN)) ? E.parser(fs.readFileSync(path.join(racine, E.CHEMIN), 'utf8')) : [];
  const e = E.trouver(t, 'employeur', info);
  if (e) { console.log('DÉJÀ ÉCARTÉ : ' + dire(e) + '\nNe pas le déposer, sauf demande de Denis.'); process.exit(1); }
  console.log('Pas dans l\'historique des écartés : on peut le déposer.');
  process.exit(0);
}
if ((commande === 'employeurs' || commande === 'offres') && a) {
  const texte = fs.readFileSync(path.resolve(a), 'utf8');
  const r = depot.analyserLot(commande, texte);
  if (!r.ok) { console.log('Analyse impossible : ' + r.erreur); process.exit(2); }
  const ecartees = r.lignes.filter(function (l) { return l.statut === 'ecartee'; });
  ecartees.forEach(function (l) { console.log('DÉJÀ ÉCARTÉ (ligne ' + l.numero + ', ' + (l.nom || '') + ') : ' + dire(l.ecartee)); });
  console.log(r.lignes.length + ' ligne(s) lue(s), ' + ecartees.length + ' déjà écartée(s).' + (ecartees.length ? ' Ne pas les déposer, sauf demande de Denis.' : ''));
  process.exit(ecartees.length ? 1 : 0);
}
console.log('Usage : voir l\'en-tête de scripts/employeurEcarte.js');
process.exit(2);
