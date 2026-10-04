/* ============================================================
   modules/cv-core/certifications.js  (2026-09-26, demande de Denis)
   ------------------------------------------------------------
   CERTIFICATIONS STRUCTUREES : intitule, organisme, lieu, date.
   Choix d'architecture (sans regression) : `dossier.certifications` RESTE une liste de simples textes (une trentaine d'endroits du code
   la lisent tels quels : Word, lettre, entretien, exports, assistant en ligne). Ce texte est au format « Intitule (organisme, lieu, date) »
   (c'est ce que l'import de CV produit deja). Ce module fait le pont, sans rien perdre :
   - separerCertification(texte)   : texte -> { intitule, organisme, lieu, date } ;
   - composerCertification(champs) : { intitule, organisme, lieu, date } -> texte (la meme forme, relue partout comme avant) ;
   - afficherCertification(texte)  : texte -> ligne du CV en PDF, comme les formations : « Intitule - organisme, lieu - 2023 »
                                     (ou « 2023 : Intitule - organisme, lieu » pour les modeles a date en tete).
   Regle d'or : rien n'est JAMAIS invente ni perdu. Sans information captee (un simple « SST »), seul l'intitule est affiche. Une
   parenthese qui ne ressemble pas a « organisme, lieu, date » (ex. « SST (Sauveteur Secouriste du Travail) », une seule partie sans date)
   reste dans l'intitule. Fonctions pures, testees en Node (tests/certifications.test.js). Fichier charge par index.html avant js/app.js.
   ============================================================ */

var _MOIS_CERTIF = '(?:janv|janvier|f[ée]vr|f[ée]vrier|mars|avr|avril|mai|juin|juil|juillet|ao[uû]t|sept|septembre|oct|octobre|nov|novembre|d[ée]c|d[ée]cembre)\\.?';
var _REGEX_DATE_CERTIF = new RegExp(
  '^(?:en\\s+|depuis\\s+|obtenu(?:e)?\\s+en\\s+)?(?:' +
    '(?:0?[1-9]|1[0-2])[\\/.\\-](?:19|20)\\d{2}' +           // 06/2023, 6-2023
    '|(?:19|20)\\d{2}[\\/.\\-](?:0?[1-9]|1[0-2])' +          // 2023-06
    '|(?:' + _MOIS_CERTIF + '\\s+)?(?:19|20)\\d{2}' +        // mars 2023, sept. 2023, 2023
  ')$', 'i');

function _texteCertif(x) {
  if (x === null || x === undefined) { return ''; }
  if (typeof x === 'object') { return String(x.intitule || x.nom || x.texte || '').trim(); }
  return String(x).trim();
}

function _estDateCertif(partie) { return _REGEX_DATE_CERTIF.test(String(partie).trim()); }

function separerCertification(texte) {
  var t = _texteCertif(texte);
  var vide = { intitule: t, organisme: '', lieu: '', date: '' };
  var m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(t);
  if (!m || !m[1].trim()) { return vide; }
  var parties = m[2].split(',').map(function (p) { return p.trim(); }).filter(Boolean);
  if (!parties.length) { return vide; }
  var indexDate = -1, nbDates = 0;
  parties.forEach(function (p, i) { if (_estDateCertif(p)) { indexDate = i; nbDates++; } });
  if (nbDates > 1) { return vide; }
  var date = '';
  if (nbDates === 1) { date = parties.splice(indexDate, 1)[0].replace(/^(?:en\s+|depuis\s+|obtenu(?:e)?\s+en\s+)/i, ''); }
  // Sans date : une seule partie est presque toujours le developpement d'un sigle (« SST (Sauveteur Secouriste du Travail) ») : on ne
  // touche a rien. Deux parties (« Croix-Rouge, Limoges ») = organisme et lieu.
  if (!nbDates && parties.length < 2) { return vide; }
  return { intitule: m[1].trim(), organisme: parties[0] || '', lieu: parties.slice(1).join(', '), date: date };
}

function composerCertification(champs) {
  var c = champs || {};
  var intitule = String(c.intitule || '').trim();
  var details = [c.organisme, c.lieu, c.date].map(function (x) { return String(x || '').trim(); }).filter(Boolean);
  if (!intitule) { return ''; }
  return intitule + (details.length ? ' (' + details.join(', ') + ')' : '');
}

function afficherCertification(texte, dateEnTete) {
  var c = separerCertification(texte);
  if (!c.organisme && !c.lieu && !c.date) { return c.intitule; }
  var lieuOrg = [c.organisme, c.lieu].filter(Boolean).join(', ');
  var corps = [c.intitule, lieuOrg].filter(Boolean).join(' - ');
  if (!c.date) { return corps; }
  return dateEnTete ? (c.date + ' : ' + corps) : (corps + ' - ' + c.date);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { separerCertification: separerCertification, composerCertification: composerCertification, afficherCertification: afficherCertification };
}
