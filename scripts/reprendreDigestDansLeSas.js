// Verse les changements d'un digest deja publie dans le sas (origine « reprise »), via « Publier » (verifie, enregistre, annulable).
const path = require('path'), fs = require('fs');
const racine = path.resolve(process.argv[2]), mois = process.argv[3];
const C = require(path.join(racine, 'outils/veilleChangements.js'));
const { creerDepot } = require(path.join(racine, 'outils/veilleDepot.js'));
const texte = fs.readFileSync(path.join(racine, C.DOSSIER_DIGESTS, mois + '.md'), 'utf8');
const periode = (/^periode:\s*"?(.+?)"?\s*$/m.exec(texte) || [])[1] || mois;
const lignes = C.changementsDuDigest(texte, mois).map((l) => Object.assign(l, { periode: periode }));
const depot = creerDepot(racine);
const r = depot.publier([{ type: 'changements', actions: [{ op: 'importer', lignes: lignes }] }]);
console.log(JSON.stringify({ ok: r.ok, code: r.code, erreur: r.erreur, resume: r.resumeChangements, commit: r.commit, lus: lignes.length }));
