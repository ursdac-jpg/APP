/* ============================================================
   modules/cv-core/identiteFormat.js
   ------------------------------------------------------------
   Écriture des coordonnées d'un CV (retour Denis 2026-10-01). Fonctions PURES, testables en Node, sans dépendance.
   - formaterTelephone(texte)  : « 0612345678 » ou « 06 12 34 56 78 » devient « 06.12.34.56.78 » (un point toutes les deux chiffres), PARTOUT.
                                 « +33 6 12 34 56 78 » devient « +33.6.12.34.56.78 ». Un numéro d'un autre format est laissé tel quel.
   - formaterNom(texte)        : le nom s'écrit EN MAJUSCULES (convention d'un CV).
   - formaterPrenom(texte)     : le prénom s'écrit avec une majuscule à chaque mot ou partie (« jean-pierre » devient « Jean-Pierre »).
   - inverserNomPrenom(nom, prenom) : échange les deux champs ET adapte l'écriture à la rubrique d'arrivée : l'ancien prénom devient le nom
                                 (EN MAJUSCULES), l'ancien nom devient le prénom (majuscule initiale).
   ============================================================ */

function formaterTelephone(texte) {
  var brut = String(texte === undefined || texte === null ? '' : texte).trim();
  if (!brut) { return ''; }
  var international = /^(\+|00)\s*33/.test(brut);
  var chiffres = brut.replace(/\D/g, '');
  if (international) {
    var reste = chiffres.replace(/^(33)/, '');           // 0033 ou +33 : on retire l'indicatif ecrit (« 00 » eventuel inclus ci-dessous)
    if (/^0033/.test(chiffres)) { reste = chiffres.slice(4); }
    reste = reste.replace(/^0/, '');
    if (reste.length === 9) { return '+33.' + reste.charAt(0) + '.' + reste.slice(1).replace(/(\d{2})(?=\d)/g, '$1.'); }
    return brut;
  }
  if (chiffres.length === 10 && chiffres.charAt(0) === '0') { return chiffres.replace(/(\d{2})(?=\d)/g, '$1.'); }
  return brut;
}

function _identiteMajusculeInitiale(mot) {
  return mot.charAt(0).toLocaleUpperCase('fr-FR') + mot.slice(1).toLocaleLowerCase('fr-FR');
}

function formaterNom(texte) {
  return String(texte === undefined || texte === null ? '' : texte).trim().toLocaleUpperCase('fr-FR');
}

function formaterPrenom(texte) {
  var t = String(texte === undefined || texte === null ? '' : texte).trim();
  // une majuscule au debut de chaque mot et apres chaque tiret ou apostrophe (« jean-pierre » : « Jean-Pierre », « d'artagnan » : « D'Artagnan »)
  return t.split(/(\s+|-|['’])/).map(function (morceau) { return /^(\s+|-|['’])$/.test(morceau) || !morceau ? morceau : _identiteMajusculeInitiale(morceau); }).join('');
}

function inverserNomPrenom(nom, prenom) {
  return { nom: formaterNom(prenom), prenom: formaterPrenom(nom) };
}

// Nom du fichier d'un CV enregistre en PDF ou en Word (retour Denis 2026-10-01) : « NOM_poste », par exemple « DUPONT_vendeur.pdf ».
// Le nom en MAJUSCULES, le poste visé en minuscules (métier visé, sinon titre du CV), sans accent, mots reliés par des tirets, 40 caractères au plus.
// Sans nom : le prénom ; sans poste : le nom seul ; sans rien : « cv ». extension : « pdf », « docx » ou vide (utile pour le titre de la page imprimée en PDF :
// le navigateur en fait le nom proposé à l'enregistrement).
function _identiteSegmentFichier(texte) {
  return String(texte === undefined || texte === null ? '' : texte).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function nomFichierCV(source, extension) {
  var d = source || {}, id = d.identite || {};
  var nom = _identiteSegmentFichier(String(id.nom || id.prenom || '').toLocaleUpperCase('fr-FR'));
  var poste = _identiteSegmentFichier(String(d.metierCible || d.titreCV || '').toLocaleLowerCase('fr-FR'));
  if (poste.length > 40) { poste = poste.slice(0, 40).replace(/-[^-]*$/, '').replace(/^$/, poste.slice(0, 40)); }
  var base = [nom, poste].filter(Boolean).join('_') || 'cv';
  return base + (extension ? '.' + extension : '');
}

// Permis de conduire écrit dans un texte de CV (retour Denis 2026-10-01 : « Permis B » était écrit et n'a pas été capté, l'assistant ne l'ayant pas renvoyé).
// Filet SANS assistant, utilisé quand la réponse de l'assistant ne dit rien du permis. Renvoie { possede, categories, vehicule } ou null si rien de clair.
// « Permis B », « Permis A et B », « titulaire du permis de conduire (B) », « véhiculé » ; « sans permis » donne possede false ; « permis en cours » : null.
function detecterPermisDansTexte(texte) {
  var t = String(texte === undefined || texte === null ? '' : texte);
  if (/sans\s+permis|pas\s+de\s+permis|non\s+titulaire\s+du\s+permis/i.test(t)) { return { possede: false, categories: [], vehicule: null }; }
  var categories = [];
  var m, re = /permis(?:\s+de\s+conduire)?\s*(?:cat[ée]gorie\s*)?[:\-(]?\s*\(?\s*((?:[ABCDE](?:\s*[,\/&+]\s*|\s+et\s+|\s+ou\s+)?)+)\)?(?![a-zàâçéèêëîïôûù])/gi;
  while ((m = re.exec(t)) !== null) {
    var morceau = m[1];
    if (/en\s+cours|en\s+preparation|passe\s+en|a\s+passer/i.test(t.slice(m.index, m.index + 40))) { continue; }
    (morceau.match(/[ABCDE]/g) || []).forEach(function (c) { if (categories.indexOf(c) === -1) { categories.push(c); } });
  }
  var vehicule = /v[ée]hicul[ée]|v[ée]hicule\s+personnel/i.test(t) ? true : null;
  if (!categories.length) {
    return /permis\s+de\s+conduire/i.test(t) && !/en\s+cours|en\s+preparation/i.test(t) ? { possede: true, categories: [], vehicule: vehicule } : (vehicule ? { possede: true, categories: [], vehicule: true } : null);
  }
  return { possede: true, categories: categories, vehicule: vehicule };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formaterTelephone: formaterTelephone, formaterNom: formaterNom, formaterPrenom: formaterPrenom, inverserNomPrenom: inverserNomPrenom, nomFichierCV: nomFichierCV, detecterPermisDansTexte: detecterPermisDansTexte };
}
