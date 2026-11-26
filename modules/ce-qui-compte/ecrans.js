/* ============================================================
   modules/ce-qui-compte/ecrans.js
   Espace « Ce qui compte pour moi » : le MOTEUR D'ÉCRAN. Il lit la description d'une carte (data/cqcpmCartes.js) et dessine ses écrans :
   invitation, saisie (un type de champ chacun : texte, liste, choix, lignes, entrées), résultat. Aucune carte n'a son interface propre.
   Charge après index.js (qui porte la navigation et la page d'accueil de l'espace) ; la logique pure est dans logique.js.
   Maquettes : docs/MAQUETTE_CE_QUI_COMPTE_POUR_MOI_*.html.
   Règles : rien n'est enregistré en route (les réponses vivent dans l'état de session) ; le suivi d'usage ne reçoit que des noms d'écran, jamais une réponse ;
   tout bouton de choix est un vrai bouton (aria-pressed), jamais une ligne de texte cliquable.
   ============================================================ */


// ---------------------------------------------------------------- Lecture des valeurs d'un champ

// Les entrées affichées d'un champ « entrees » : avec `source`, une par élément retenu ; sinon celles qui sont saisies, plus des entrées vides jusqu'au nombre demandé.
function cqcpmEntreesAffichees(carte, champ, reponses) {
  var saisies = Array.isArray(reponses[champ.id]) ? reponses[champ.id] : [];
  if (champ.source) {
    var cles = Array.isArray(reponses[champ.source]) ? reponses[champ.source] : [];
    return cles.map(function (cle) {
      var trouvee = saisies.filter(function (e) { return e && e.cle === cle; })[0];
      return trouvee || { cle: cle };
    });
  }
  var voulu = Math.max(saisies.length, _cqcpmUi.nbEntrees[carte.id + ':' + champ.id] || 1);
  var l = saisies.slice();
  while (l.length < Math.min(voulu, champ.max || 3)) { l.push({}); }
  return l;
}

// ---------------------------------------------------------------- Dessin d'un champ

// `ctx` : { carte, valeurs (l'objet qui porte la valeur : les réponses de la carte, ou l'entrée), parent (champ « entrees » ou null), e (rang de l'entrée) }.
function _cqcpmAttrs(champ, ctx) {
  return ' data-champ="' + _cqcpmEsc(ctx.parent ? ctx.parent.id : champ.id) + '"' + (ctx.parent ? ' data-e="' + ctx.e + '" data-sous="' + _cqcpmEsc(champ.id) + '"' : '');
}
function _cqcpmQuestion(champ) {
  return '<p class="cqcpm-q">' + _cqcpmEsc(champ.lib) + (champ.aide && champ.type !== 'liste' ? ' <span class="a">(' + _cqcpmEsc(champ.aide) + ')</span>' : '') + '</p>';
}
function _cqcpmHtmlTexte(champ, ctx) {
  var v = typeof ctx.valeurs[champ.id] === 'string' ? ctx.valeurs[champ.id] : '';
  var attrs = ' class="form-control champ-bien-visible cqcpm-champ" aria-label="' + _cqcpmEsc(champ.lib) + '" placeholder="Écrivez avec vos mots"' + _cqcpmAttrs(champ, ctx);
  return _cqcpmQuestion(champ) + (champ.court
    ? '<input type="text" maxlength="' + CQCPM_MAX_TEXTE_COURT + '"' + attrs + ' value="' + _cqcpmEsc(v) + '">'
    : '<textarea rows="3" maxlength="' + CQCPM_MAX_TEXTE + '"' + attrs + '>' + _cqcpmEsc(v) + '</textarea>');
}
function _cqcpmHtmlListe(champ, ctx) {
  var l = Array.isArray(ctx.valeurs[champ.id]) ? ctx.valeurs[champ.id] : [];
  var h = '<p class="cqcpm-q">' + _cqcpmEsc(champ.lib) + '</p>' + (champ.aide ? '<p class="cqcpm-note">' + _cqcpmEsc(champ.aide) + '</p>' : '');
  if (champ.amorces && champ.amorces.length) {
    h += '<p class="cqcpm-q">Pour démarrer, choisissez un début de phrase</p><div class="cqcpm-rep">' +
      champ.amorces.map(function (a) { return '<button type="button" class="petit" data-cqcpm-act="amorce" data-champ="' + _cqcpmEsc(champ.id) + '" data-v="' + _cqcpmEsc(a) + '">' + _cqcpmEsc(a) + '</button>'; }).join('') + '</div>';
  }
  h += '<ul class="cqcpm-lignes">' + (l.length ? l.map(function (x, i) {
    return '<li><span class="num">' + (i + 1) + '</span><span>' + _cqcpmEsc(x) + '</span><button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="liste-retirer" data-champ="' + _cqcpmEsc(champ.id) + '" data-i="' + i + '" aria-label="Retirer : ' + _cqcpmEsc(x) + '"><i class="bi bi-x-lg" aria-hidden="true"></i></button></li>';
  }).join('') : '<li class="cqcpm-vide-ligne"><span>Vos envies apparaîtront ici.</span></li>') + '</ul>';
  if (l.length < (champ.max || 10)) {
    h += '<div class="cqcpm-ajout"><input type="text" class="form-control champ-bien-visible cqcpm-champ" id="cqcpmSaisieListe" maxlength="' + CQCPM_MAX_PHRASE + '" aria-label="Une nouvelle phrase" placeholder="Écrivez une phrase, puis « Ajouter »" data-liste="' + _cqcpmEsc(champ.id) + '">' +
      '<button type="button" class="btn btn-primary" data-cqcpm-act="liste-ajouter" data-champ="' + _cqcpmEsc(champ.id) + '"><i class="bi bi-plus-lg" aria-hidden="true"></i> Ajouter</button></div>';
  }
  if (champ.libPasser) { h += '<p><button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="passer">' + _cqcpmEsc(champ.libPasser) + '</button></p>'; }
  h += '<p class="cqcpm-note"><span class="cqcpm-compte' + (l.length >= (champ.min || 1) ? ' plein' : '') + '">' + l.length + ' sur ' + (champ.max || 10) + ' au plus</span> De ' + (champ.min || 0) + ' à ' + (champ.max || 10) + ' sont attendues, mais « je ne sais pas » est une réponse possible : vous pouvez continuer sans rien écrire.</p>';
  return h;
}
function _cqcpmHtmlChoix(champ, ctx) {
  var sel = Array.isArray(ctx.valeurs[champ.id]) ? ctx.valeurs[champ.id] : [];
  var opts = cqcpmOptionsChoix(champ, ctx.valeurs, cqcpmEtat());
  var max = champ.max || 1;
  if (!opts.length) {
    var texte = champ.options && champ.options.depuis ? 'Ajoutez d’abord des phrases à l’écran précédent : elles apparaîtront ici.'
      : 'Les petites actions que vous écrivez dans la carte « Si rien ne m’arrêtait » apparaissent ici. Vous pouvez aussi écrire la vôtre juste en dessous.';
    return _cqcpmQuestion(champ) + '<p class="cqcpm-note">' + texte + '</p>';
  }
  var colonne = opts.length > 0 && (champ.options && (champ.options.depuis || champ.options.depuisCarte));
  return _cqcpmQuestion(champ) + '<div class="cqcpm-rep' + (colonne ? ' colonne' : '') + '" role="group" aria-label="' + _cqcpmEsc(champ.lib) + '">' + opts.map(function (o) {
    var pris = sel.indexOf(o.id) !== -1;
    return '<button type="button" class="' + (opts.length > 8 ? 'petit' : '') + '" data-cqcpm-act="choix"' + _cqcpmAttrs(champ, ctx) + ' data-v="' + _cqcpmEsc(o.id) + '" aria-pressed="' + pris + '">' +
      (pris ? '<i class="bi bi-check-lg" aria-hidden="true"></i> ' : '') + _cqcpmEsc(o.lib) + '</button>';
  }).join('') + '</div>' + (max > 1 ? '<p class="cqcpm-note">' + sel.length + ' choisi' + (sel.length > 1 ? 's' : '') + ' sur ' + max + ' au plus.</p>' : '');
}
// champ.compact : le libellé et les réponses sur une même ligne (les dix-neuf repères), le nom court des réponses, le nom entier en info-bulle.
function _cqcpmHtmlLigne(champ, ligne, options, valeur) {
  var compact = !!champ.compact;
  return '<div class="' + (compact ? 'cqcpm-val' : 'cqcpm-cond') + '"><' + (compact ? 'span' : 'p') + ' class="lib">' + _cqcpmEsc(ligne.lib) + '</' + (compact ? 'span' : 'p') + '><div class="cqcpm-rep" role="group" aria-label="' + _cqcpmEsc(ligne.lib) + '">' +
    options.map(function (o) {
      return '<button type="button" data-cqcpm-act="ligne" data-champ="' + _cqcpmEsc(champ.id) + '" data-ligne="' + _cqcpmEsc(ligne.id) + '" data-v="' + _cqcpmEsc(o.id) + '" aria-pressed="' + (valeur === o.id) + '"' + (compact ? ' title="' + _cqcpmEsc(o.nom) + '"' : '') + '>' +
        (o.icone ? '<i class="bi ' + o.icone + '" aria-hidden="true"></i> ' : '') + _cqcpmEsc(compact && o.court ? o.court : o.nom) + '</button>';
    }).join('') + '</div></div>';
}
function _cqcpmHtmlLignes(champ, ctx) {
  var v = ctx.valeurs[champ.id] && typeof ctx.valeurs[champ.id] === 'object' ? ctx.valeurs[champ.id] : {};
  var options = cqcpmOptionsLignes(champ), groupes = cqcpmGroupesDe(champ);
  var h = (champ.lib ? '<p class="cqcpm-q">' + _cqcpmEsc(champ.lib) + '</p>' : '') + (champ.aide ? '<p class="cqcpm-note">' + _cqcpmEsc(champ.aide) + '</p>' : '');
  var ouvert = _cqcpmUi.ouverts[ctx.carte.id + ':' + champ.id];
  if (champ.accordeon && ouvert === undefined) { ouvert = groupes[0].id; }
  groupes.forEach(function (g) {
    var n = g.lignes.filter(function (l) { return v[l.id]; }).length;
    var extras = (champ.champsDuGroupe && champ.champsDuGroupe[g.id]) || [];
    var contenu = g.lignes.map(function (l) { return _cqcpmHtmlLigne(champ, l, options, v[l.id]); }).join('') +
      extras.map(function (x) { return '<div class="cqcpm-cond">' + _cqcpmHtmlChamp(x, { carte: ctx.carte, valeurs: ctx.parentValeurs || ctx.valeurs, parent: null, e: 0 }) + '</div>'; }).join('');
    // Renvoi vers « Qui fait quoi » (maquette validée) : seulement quand ce module est ouvert, jamais un bouton vers une page absente.
    if (g.renvoi === 'territoire' && typeof mtOuvert === 'function' && mtOuvert()) {
      contenu += '<p class="cqcpm-note"><i class="bi bi-geo-alt" aria-hidden="true"></i> Pour réfléchir au transport et au lieu de vie, vous pouvez ouvrir <button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="ouvrir-territoire">Qui fait quoi</button></p>';
    }
    if (champ.accordeon) {
      var o = ouvert === g.id;
      h += '<div class="cqcpm-theme' + (o ? ' ouvert' : '') + '"><button type="button" data-cqcpm-act="ouvrir-groupe" data-champ="' + _cqcpmEsc(champ.id) + '" data-g="' + _cqcpmEsc(g.id) + '" aria-expanded="' + o + '">' +
        (g.icone ? '<span class="cqcpm-ico petit"><i class="bi ' + g.icone + '" aria-hidden="true"></i></span>' : '') +
        '<span class="t"><b>' + _cqcpmEsc(g.titre) + '</b>' + (g.sous ? '<span>' + _cqcpmEsc(g.sous) + '</span>' : '') + '</span>' +
        '<span class="nb' + (n ? ' plein' : '') + '">' + (n ? n + ' réponse' + (n > 1 ? 's' : '') : 'à compléter') + '</span>' +
        '<i class="bi ' + (o ? 'bi-chevron-up' : 'bi-chevron-down') + '" aria-hidden="true"></i></button>' + (o ? '<div class="corps">' + contenu + '</div>' : '') + '</div>';
    } else {
      h += (g.titre ? '<h3 class="cqcpm-sous-titre">' + _cqcpmEsc(g.titre) + '</h3>' : '') + contenu;
    }
  });
  return h;
}
function _cqcpmHtmlEntrees(champ, ctx) {
  var carte = ctx.carte, entrees = cqcpmEntreesAffichees(carte, champ, ctx.valeurs);
  var h = (champ.lib ? '<p class="cqcpm-q">' + _cqcpmEsc(champ.lib) + '</p>' : '') + (champ.aide ? '<p class="cqcpm-note">' + _cqcpmEsc(champ.aide) + '</p>' : '');
  if (champ.source && !entrees.length) { return h + '<p class="cqcpm-note">Retenez d’abord des envies à l’écran précédent : une fiche apparaît ici pour chacune.</p>'; }
  entrees.forEach(function (e, i) {
    var nom = champ.nomEntree || 'entrée', titre = champ.source ? e.cle : nom.charAt(0).toUpperCase() + nom.slice(1);
    h += '<div class="cqcpm-entree"><h3><span class="num">' + (i + 1) + '</span><span>' + _cqcpmEsc(titre) + (!champ.source && champ.max ? ' <small>(' + (i + 1) + ' sur ' + champ.max + ' au plus)</small>' : '') + '</span></h3>' +
      champ.champs.map(function (c) { return _cqcpmHtmlChamp(c, { carte: carte, valeurs: e, parent: champ, e: i }); }).join('');
    if (!champ.source && entrees.length > 1) {
      h += '<button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="entree-retirer" data-champ="' + _cqcpmEsc(champ.id) + '" data-e="' + i + '"><i class="bi bi-trash" aria-hidden="true"></i> Retirer cette entrée</button>';
    }
    h += '</div>';
  });
  if (!champ.source && entrees.length < (champ.max || 3)) {
    h += '<button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="entree-ajouter" data-champ="' + _cqcpmEsc(champ.id) + '"><i class="bi bi-plus-lg" aria-hidden="true"></i> Ajouter une ' + ['deuxième', 'troisième', 'quatrième'][Math.max(0, entrees.length - 1)] + ' ' + (champ.nomEntree || 'entrée') + '</button> ';
  }
  if (!champ.source && champ.libPasser) { h += '<button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="passer">' + _cqcpmEsc(champ.libPasser) + '</button>'; }
  else if (!champ.source && (champ.min || 0) === 0) { h += '<p class="cqcpm-note">« Rien à ajouter pour l’instant » est une réponse possible : vous pouvez continuer sans rien écrire.</p>'; }
  return h;
}
// Une question de premier niveau (texte, liste, choix) est une zone à part, avec un filet d'accent (maquette validée le 22/11/2026, consigne 566) ;
// dans une fiche (entrée), les questions restent sobres : la fiche est déjà une zone.
function _cqcpmZone(ctx, html) { return ctx.parent ? html : '<div class="cqcpm-qb">' + html + '</div>'; }
function _cqcpmHtmlChamp(champ, ctx) {
  if (champ.type === 'texte') { return _cqcpmZone(ctx, _cqcpmHtmlTexte(champ, ctx)); }
  if (champ.type === 'liste') { return _cqcpmZone(ctx, _cqcpmHtmlListe(champ, ctx)); }
  if (champ.type === 'choix') { return _cqcpmZone(ctx, _cqcpmHtmlChoix(champ, ctx)); }
  if (champ.type === 'lignes') { return _cqcpmHtmlLignes(champ, ctx); }
  if (champ.type === 'entrees') { return _cqcpmHtmlEntrees(champ, ctx); }
  return '';
}

// ---------------------------------------------------------------- Dessin d'une carte

// Titre d'un bloc : une pastille d'icône carrée, puis le titre (maquette du 22/11/2026, consigne 566).
function _cqcpmTete(icone, titre) {
  return '<h2><span class="cqcpm-ico"><i class="bi ' + icone + '" aria-hidden="true"></i></span> ' + _cqcpmEsc(titre) + '</h2>';
}
function cqcpmHtmlInvitation(carte) {
  var d = carte.invitation;
  return '<p class="chapeau text-center" style="font-size:1.05rem">' + _cqcpmEsc(carte.pour) + '</p>' +
    '<div class="cqcpm-bloc">' + _cqcpmTete('bi-pencil', 'Ce que vous faites') + '<p>' + _cqcpmEsc(d.faites) + '</p></div>' +
    '<div class="cqcpm-bloc">' + _cqcpmTete('bi-card-list', 'Ce que vous obtenez') + '<p>' + _cqcpmEsc(d.obtenez) + '</p></div>' +
    '<div class="cqcpm-bloc">' + _cqcpmTete('bi-info-circle', 'À savoir') + '<p>' + _cqcpmEsc(d.savoir) + ' Prévoyez le temps qu’il faut. Rien n’est enregistré tant que vous ne choisissez pas de garder le résultat.</p></div>';
}
// La fin d'une rubrique de l'accueil (consigne 601) : deux phrases sur ce que la partie cherche, puis un bloc dépliant « Plus d'informations »
// (la finalité de la partie, puis pour chaque carte ce que la personne y fait, ce qu'elle obtient et ce qu'il faut savoir : lus dans `invitation`, jamais recopiés).
var _CQCPM_NOMBRES = ['', 'cette carte', 'ces deux cartes', 'ces trois cartes', 'ces quatre cartes'];
function cqcpmHtmlFinTheme(theme, cartes) {
  var f = theme.fin;
  if (!f) { return ''; }
  var detail = cartes.map(function (c) {
    var d = c.invitation;
    return '<div class="cqcpm-fin-carte"><h3><span class="cqcpm-ico petit"><i class="bi ' + c.icone + '" aria-hidden="true"></i></span> ' + _cqcpmEsc(c.nom) + '</h3>' +
      '<p><b>Ce que vous faites :</b> ' + _cqcpmEsc(d.faites) + '</p><p><b>Ce que vous obtenez :</b> ' + _cqcpmEsc(d.obtenez) + '</p><p><b>À savoir :</b> ' + _cqcpmEsc(d.savoir) + '</p></div>';
  }).join('');
  return '<div class="cqcpm-fin"><p class="cherche">' + _cqcpmEsc(f.cherche) + '</p>' +
    '<details class="bloc-depli bd-accent"><summary>Plus d’informations sur ' + (_CQCPM_NOMBRES[cartes.length] || 'ces cartes') + '</summary>' +
    '<div class="bloc-depli-corps"><p class="aide">' + _cqcpmEsc(f.aide) + '</p>' + detail + '</div></details></div>';
}
function cqcpmHtmlSaisie(carte, rang) {
  var ecran = carte.ecrans[rang], etat = cqcpmEtat(), reponses = cqcpmReponsesDe(etat, carte.id);
  // Bandeau de la carte : son nom, le titre de l'écran et, s'il y en a plusieurs, « Partie 1 sur 2 » (jamais une ligne grise).
  var h = '<div class="cqcpm-bandeau"><span class="cqcpm-ico"><i class="bi ' + carte.icone + '" aria-hidden="true"></i></span><div><b>' + _cqcpmEsc(carte.nom) + '</b><span>' + _cqcpmEsc(ecran.titre) + '</span></div>' +
    (carte.ecrans.length > 1 ? '<span class="n">Partie ' + (rang + 1) + ' sur ' + carte.ecrans.length + '</span>' : '') + '</div>' +
    (ecran.intro && !ecran.titreBloc ? '<p class="chapeau text-center" style="font-size:1.05rem">' + _cqcpmEsc(ecran.intro) + '</p>' : '');
  // Titre de bloc (maquette) : un titre avec l'icône de la carte, puis l'introduction à l'intérieur du bloc.
  h += '<div class="cqcpm-bloc">' + (ecran.titreBloc ? _cqcpmTete(carte.icone, ecran.titreBloc) + (ecran.intro ? '<p>' + _cqcpmEsc(ecran.intro) + '</p>' : '') : '') + ecran.champs.map(function (c) { return _cqcpmHtmlChamp(c, { carte: carte, valeurs: reponses, parent: null, e: 0 }); }).join('') + '</div>';
  if (carte.renvoiUrgences) {
    h += '<div class="cqcpm-alerte"><i class="bi bi-life-preserver" aria-hidden="true"></i><span><b>Si c’est difficile en ce moment</b>, vous n’avez pas à rester seul(e) : les fiches d’aide immédiate de l’application vous indiquent qui contacter. ' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="urgences">Ouvrir les fiches d’aide</button></span></div>';
  }
  return h;
}
function _cqcpmListeHtml(items) { return '<ul>' + items.map(function (x) { return '<li>' + _cqcpmEsc(x) + '</li>'; }).join('') + '</ul>'; }
function cqcpmHtmlSection(s) {
  if (s.vide && s.masquerSiVide) { return ''; }   // ex. le salaire minimum : une partie à compléter ne s'affiche pas comme manquante
  var h = '<div class="cqcpm-bloc cqcpm-res">' + (s.icone ? _cqcpmTete(s.icone, s.titre) : '<h2>' + _cqcpmEsc(s.titre) + '</h2>');
  if (s.vide) { return h + '<p class="cqcpm-vide">' + (s.type === 'liste' || s.type === 'option' || s.type === 'choix' ? 'Rien dans cette liste pour l’instant.' : 'Vous n’avez pas répondu à cette partie.') + '</p></div>'; }
  if (s.type === 'texte') { h += '<p class="texte">' + _cqcpmEsc(s.texte) + '</p>'; }
  else if (s.type === 'liste' || s.type === 'option') { h += _cqcpmListeHtml(s.items); }
  else if (s.type === 'phrases') { h += '<ul>' + s.items.map(function (x) { return '<li>' + _cqcpmEsc(x.lib) + ' : <b>' + _cqcpmEsc(x.reponse) + '</b></li>'; }).join('') + '</ul>'; }
  else if (s.type === 'colonnes') {
    h += '<div class="cqcpm-pile">' + s.colonnes.map(function (c) {
      return '<div class="col"><h4>' + (c.icone ? '<i class="bi ' + c.icone + '" aria-hidden="true"></i> ' : '') + _cqcpmEsc(c.nom) + '</h4>' + (c.items.length ? _cqcpmListeHtml(c.items) : '<p class="cqcpm-vide">Rien dans cette pile.</p>') + '</div>';
    }).join('') + '</div>';
  }
  else if (s.type === 'entrees') {
    h += '<ul class="cqcpm-fiches">' + s.items.map(function (e) {
      return '<li><b>' + _cqcpmEsc(e.titre) + '</b>' + e.lignes.map(function (l) { return '<br>' + _cqcpmEsc(l.lib) + ' : ' + _cqcpmEsc(l.texte); }).join('') + '</li>';
    }).join('') + '</ul>';
  }
  else if (s.type === 'textes') { h += '<ul>' + s.lignes.map(function (l) { return '<li>' + _cqcpmEsc(l.lib) + ' : ' + _cqcpmEsc(l.texte) + '</li>'; }).join('') + '</ul>'; }
  return h + '</div>';
}
function cqcpmHtmlResultat(carte) {
  var etat = cqcpmEtat(), reponses = cqcpmReponsesDe(etat, carte.id), r = cqcpmResultat(carte.id, reponses, etat), gardee = cqcpmEstGardee(etat, carte.id);
  var h = '<p class="chapeau text-center" style="font-size:1.05rem">Voici ce que vous venez de dire, avec vos mots. ' + (gardee ? '' : 'Rien n’est enregistré tant que vous ne le gardez pas.') + '</p>';
  if (gardee) {
    var date = cqcpmDateFr(etat.gardees[carte.id].date);
    h += '<div class="cqcpm-ok"><i class="bi bi-check-circle-fill" aria-hidden="true"></i><span><b>Résultat gardé' + (date ? ' le ' + date : '') + '.</b> Vous le retrouvez dans « Ce que j’ai gardé », et il part avec votre sauvegarde personnelle (la disquette).</span></div>';
  }
  h += r.sections.map(cqcpmHtmlSection).join('');
  if (carte.pontMetiers && typeof cmvOuvert === 'function' && cmvOuvert() && !r.vide) {
    h += '<div class="cqcpm-bloc">' + _cqcpmTete('bi-briefcase', 'Dans les fiches métiers') + '<p>Certaines de ces conditions (travail de nuit, week-end, déplacements, public, extérieur…) sont signalées sur les fiches d’Explorer les métiers. Vos réponses ici ne changent pas les métiers proposés : elles vous aident à repérer ce que vous cherchez en lisant une fiche.</p>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-cqcpm-act="ouvrir-metiers"><i class="bi bi-search" aria-hidden="true"></i> Ouvrir Explorer les métiers</button></div>';
  }
  // Une fois le résultat gardé : le rappel commun de sauvegarde (brique de js/app.js), pour l'enregistrer dans la disquette.
  if (gardee && typeof htmlRappelSauvegarde === 'function') { h += htmlRappelSauvegarde(); }
  h += '<div class="cqcpm-actions">' +
    (gardee
      ? '<button type="button" class="btn btn-outline-secondary" data-cqcpm-act="ne-plus-garder"><i class="bi bi-x-circle" aria-hidden="true"></i> Ne plus garder ce résultat</button>'
      : '<button type="button" class="btn btn-primary"' + (r.vide ? ' disabled' : '') + ' data-cqcpm-act="garder"><i class="bi bi-floppy" aria-hidden="true"></i> Garder mon résultat</button>') +
    '<button type="button" class="btn btn-outline-primary" data-cqcpm-act="imprimer"' + (r.vide ? ' disabled' : '') + '><i class="bi bi-printer" aria-hidden="true"></i> Imprimer ou enregistrer en PDF</button>' +
    '<button type="button" class="btn btn-outline-secondary" data-cqcpm-act="modifier">Modifier mes réponses</button>' +
    '<button type="button" class="btn btn-outline-secondary" data-cqcpm-act="retour-espace"><i class="bi bi-arrow-left" aria-hidden="true"></i> Retour à l’espace</button></div>' +
    (r.vide
      ? '<p class="cqcpm-note">Rien à garder pour l’instant : répondez à au moins une question.</p>'
      : '<div class="cqcpm-aide"><i class="bi bi-info-circle" aria-hidden="true"></i><span>« Imprimer ou enregistrer en PDF » ouvre la fenêtre d’impression de votre appareil : choisissez votre imprimante, ou « Enregistrer en PDF ». Rien n’est envoyé ailleurs.</span></div>');
  return h;
}

// ---------------------------------------------------------------- Actions

// Imprimer ou enregistrer en PDF (demande 5 de la consigne 566) : le document est construit par document.js, l'impression est le composant commun.
function cqcpmImprimer(ids) {
  var html = cqcpmHtmlDocument(cqcpmEtat(), ids);
  if (!html) { if (typeof afficherToast === 'function') { afficherToast('Rien à imprimer pour l’instant : répondez d’abord à une question.', 5000); } return; }
  if (typeof ucpmImprimerDocument !== 'function') { if (typeof afficherToast === 'function') { afficherToast('L’impression n’est pas disponible pour le moment.', 5000); } return; }
  ucpmImprimerDocument('ce-qui-compte-pour-moi', html);
  if (typeof trackEvenement === 'function') { trackEvenement('ce_qui_compte_imprime', { nb: ids.length }); }
}

function _cqcpmCarteCourante() { return _cqcpmUi.carte ? cqcpmCarte(_cqcpmUi.carte) : null; }
// Les réponses d'un champ, lues pour le modifier : les réponses de la carte, ou une entrée d'un champ « entrees ».
function _cqcpmPoserEntree(carte, parentId, e, sousId, valeur) {
  var etat = cqcpmEtat(), reponses = cqcpmReponsesDe(etat, carte.id), parent = cqcpmChamp(carte, parentId);
  if (!parent) { return; }
  var entrees = cqcpmEntreesAffichees(carte, parent, reponses).map(function (x) { var c = {}; Object.keys(x).forEach(function (k) { c[k] = x[k]; }); return c; });
  if (!entrees[e]) { return; }
  entrees[e][sousId] = valeur;
  cqcpmPoserReponse(etat, carte.id, parentId, entrees);
}
function _cqcpmValeurDe(carte, champId, e, sousId) {
  var etat = cqcpmEtat(), reponses = cqcpmReponsesDe(etat, carte.id);
  if (sousId) { var parent = cqcpmChamp(carte, champId); var l = parent ? cqcpmEntreesAffichees(carte, parent, reponses) : []; return l[e] ? l[e][sousId] : undefined; }
  return reponses[champId];
}
function _cqcpmPoser(carte, champId, e, sousId, valeur) {
  if (sousId) { _cqcpmPoserEntree(carte, champId, e, sousId, valeur); } else { cqcpmPoserReponse(cqcpmEtat(), carte.id, champId, valeur); }
}

function cqcpmSaisie(ev) {
  var el = ev.target, carte = _cqcpmCarteCourante();
  if (!carte || !el || !el.getAttribute) { return; }
  var champId = el.getAttribute('data-champ');
  if (!champId || (el.tagName !== 'TEXTAREA' && el.tagName !== 'INPUT')) { return; }
  var sousId = el.getAttribute('data-sous');
  _cqcpmPoser(carte, champId, parseInt(el.getAttribute('data-e') || '0', 10), sousId, el.value);
}

function cqcpmClic(ev) {
  if (typeof mplClicBloc === 'function' && mplClicBloc(ev, cqcpmRendre)) { return; }   // le bloc « Mon plan » (modules/mon-plan/index.js)
  var b = ev.target.closest ? ev.target.closest('[data-cqcpm-act]') : null;
  if (!b) { return; }
  var act = b.getAttribute('data-cqcpm-act'), etat = cqcpmEtat(), carte = _cqcpmCarteCourante();
  var champId = b.getAttribute('data-champ'), v = b.getAttribute('data-v'), e = parseInt(b.getAttribute('data-e') || '0', 10), sousId = b.getAttribute('data-sous');

  if (act.indexOf('papier') === 0 && typeof cqcpmClicPapier === 'function' && cqcpmClicPapier(act, b)) { return; }   // le papier de fin (papierEcrans.js)
  if (act === 'commencer-carte') { cqcpmAllerCarte(v, 0); return; }
  if (act === 'voir-gardees') { cqcpmAllerVue('gardees'); return; }
  if (act === 'retour-espace') { cqcpmAllerVue('accueil'); return; }
  if (act === 'relire') { cqcpmAllerCarte(v, cqcpmCarte(v).ecrans.length + 1); return; }
  if (act === 'effacer') { cqcpmConfirmerEffacerCarte(v); return; }
  if (act === 'tout-effacer') { cqcpmConfirmerToutEffacer(); return; }
  if (act === 'imprimer-tout') { cqcpmImprimer(cqcpmIdsADocumenter(etat)); return; }
  if (act === 'urgences') {
    if (typeof lexiqueOuvrirFiche === 'function') { lexiqueOuvrirFiche('urgence-numeros', null, CQCPM_NOM, CQCPM_ROUTE, function () { naviguerVers(CQCPM_ROUTE); }); }
    return;
  }
  if (act === 'ouvrir-territoire') { if (typeof mtOuvert === 'function' && mtOuvert()) { naviguerVers('mon-territoire-intro'); } return; }
  if (act === 'ouvrir-metiers') { if (typeof cmvOuvert === 'function' && cmvOuvert()) { naviguerVers(CMV_ROUTE_INTRO); } return; }
  if (!carte) { return; }

  if (act === 'passer') { cqcpmContinuerBarre(); return; }   // « Je ne sais pas pour l'instant » : on continue sans rien écrire
  if (act === 'imprimer') { cqcpmImprimer([carte.id]); return; }
  if (act === 'garder') { cqcpmGarder(etat, carte.id); if (typeof trackEvenement === 'function') { trackEvenement('ce_qui_compte_carte_gardee', { carte: carte.id }); } cqcpmRendre(); return; }
  if (act === 'ne-plus-garder') { cqcpmNePlusGarder(etat, carte.id); cqcpmRendre(); return; }
  if (act === 'modifier') { _cqcpmUi.ecran = 1; cqcpmRendre(); return; }
  if (act === 'ouvrir-groupe') { var cle = carte.id + ':' + champId; _cqcpmUi.ouverts[cle] = _cqcpmUi.ouverts[cle] === b.getAttribute('data-g') ? '' : b.getAttribute('data-g'); cqcpmRendre(); return; }

  if (act === 'choix') {
    var champ = sousId ? ((cqcpmChamp(carte, champId) || {}).champs || []).filter(function (c) { return c.id === sousId; })[0] : cqcpmChamp(carte, champId);
    if (!champ) { return; }
    var actuel = (_cqcpmValeurDe(carte, champId, e, sousId) || []).slice(), pos = actuel.indexOf(v), max = champ.max || 1;
    if (pos !== -1) { actuel.splice(pos, 1); }
    else if (max === 1) { actuel = [v]; }
    else if (actuel.length < max) { actuel.push(v); }
    else { return; }
    _cqcpmPoser(carte, champId, e, sousId, actuel); cqcpmRendre(); return;
  }
  if (act === 'ligne') {
    var courant = Object.assign({}, cqcpmReponsesDe(etat, carte.id)[champId] || {}), ligne = b.getAttribute('data-ligne');
    if (courant[ligne] === v) { delete courant[ligne]; } else { courant[ligne] = v; }
    cqcpmPoserReponse(etat, carte.id, champId, courant); cqcpmRendre(); return;
  }
  if (act === 'amorce') {
    var saisie = document.getElementById('cqcpmSaisieListe');
    if (saisie) { saisie.value = v.replace(/…$/, '').replace(/\s+$/, '') + ' '; saisie.focus(); }
    return;
  }
  if (act === 'liste-ajouter') { _cqcpmAjouterALaListe(carte, champId); return; }
  if (act === 'liste-retirer') {
    var liste = (cqcpmReponsesDe(etat, carte.id)[champId] || []).slice(); liste.splice(parseInt(b.getAttribute('data-i'), 10), 1);
    cqcpmPoserReponse(etat, carte.id, champId, liste); cqcpmRendre(); return;
  }
  if (act === 'entree-ajouter') { var k = carte.id + ':' + champId, cp = cqcpmChamp(carte, champId); _cqcpmUi.nbEntrees[k] = Math.min((cp.max || 3), cqcpmEntreesAffichees(carte, cp, cqcpmReponsesDe(etat, carte.id)).length + 1); cqcpmRendre(); return; }
  if (act === 'entree-retirer') {
    var champE = cqcpmChamp(carte, champId), affichees = cqcpmEntreesAffichees(carte, champE, cqcpmReponsesDe(etat, carte.id)).slice();
    affichees.splice(e, 1); _cqcpmUi.nbEntrees[carte.id + ':' + champId] = Math.max(1, affichees.length);
    cqcpmPoserReponse(etat, carte.id, champId, affichees); cqcpmRendre(); return;
  }
}
function _cqcpmAjouterALaListe(carte, champId) {
  var saisie = document.getElementById('cqcpmSaisieListe');
  if (!saisie || !saisie.value.trim()) { if (saisie) { saisie.focus(); } return; }
  var etat = cqcpmEtat(), l = (cqcpmReponsesDe(etat, carte.id)[champId] || []).slice();
  l.push(saisie.value.trim());
  cqcpmPoserReponse(etat, carte.id, champId, l);
  cqcpmRendre();
  var suite = document.getElementById('cqcpmSaisieListe'); if (suite) { suite.focus(); }
}
function cqcpmTouche(ev) {
  if (ev.key === 'Enter' && ev.target && ev.target.id === 'cqcpmSaisieListe') {
    ev.preventDefault();
    var carte = _cqcpmCarteCourante(); if (carte) { _cqcpmAjouterALaListe(carte, ev.target.getAttribute('data-liste')); }
  }
}
