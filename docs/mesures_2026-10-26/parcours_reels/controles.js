// Controles automatiques appliques a l'ecran visible (non-negociables du CLAUDE.md + lisibilite)
const fs = require('fs');
const SORTIE = process.env.ANOMALIES || '/tmp/claude-0/-home-user-APP/642c3445-eb3e-5259-ba86-29201aa22f54/scratchpad/anomalies.jsonl';
async function controlerEcran(p, etiquette) {
  const r = await p.evaluate(() => {
    const vis = e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed';
    const texteVisible = document.body.innerText || '';
    const out = { tirets: [], ia: [], emoji_visage: [], debordement: null, contraste: [], vide: [], chevauchement: [] };
    // 1) tirets cadratins / demi-cadratins
    (texteVisible.match(/.{0,25}[–—].{0,25}/g) || []).slice(0, 4).forEach(x => out.tirets.push(x.trim()));
    // 2) mot IA visible, tete de robot
    (texteVisible.match(/.{0,25}(\bIA\b|intelligence artificielle|\u{1F916}).{0,25}/gu) || []).slice(0, 4).forEach(x => out.ia.push(x.trim()));
    // 3) icones avec visage (liste courte d'emoji de visage)
    (texteVisible.match(/[\u{1F600}-\u{1F64F}\u{1F9E0}\u{1F441}]/gu) || []).slice(0, 4).forEach(x => out.emoji_visage.push(x));
    // 4) debordement horizontal
    out.debordement = document.documentElement.scrollWidth > window.innerWidth + 2 ? `${document.documentElement.scrollWidth}>${window.innerWidth}` : null;
    // 5) contraste du texte (sombre ou clair) : rapport < 3 sur du texte visible
    function lum(c) { const a = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
    function parse(s) { const cm = s.match(/color\(srgb ([^)]+)\)/); if (cm) { const v = cm[1].split(/[ \/]+/).map(x => parseFloat(x)); return { c: v.slice(0, 3).map(x => Math.round(x * 255)), a: v.length > 3 ? v[3] : 1 }; } const m = s.match(/rgba?\(([^)]+)\)/); if (!m) { return null; } const v = m[1].split(',').map(x => parseFloat(x)); return { c: v.slice(0, 3), a: v.length > 3 ? v[3] : 1 }; }
    function fond(el) { let e = el; while (e) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') { return null; } const b = parse(cs.backgroundColor); if (b && b.a > 0.6) { return b.c; } e = e.parentElement; } return document.documentElement.getAttribute('data-theme') === 'sombre' ? [15, 23, 42] : [255, 255, 255]; }
    const vus = new Set();
    document.querySelectorAll('h1,h2,h3,p,span,label,button,a,li,td,strong,small').forEach(el => {
      if (!vis(el) || !el.childNodes.length) { return; }
      const propre = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim().length > 2).map(n => n.textContent.trim()).join(' ');
      if (!propre) { return; }
      const rect = el.getBoundingClientRect(); if (rect.width < 4 || rect.height < 4 || rect.bottom < 0 || rect.top > window.innerHeight) { return; }
      const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.opacity === '0') { return; }
      const col = parse(st.color); if (!col) { return; }
      if (el.disabled || el.closest('[disabled], .disabled, [aria-disabled="true"]')) { return; }
      const fd = fond(el); if (!fd) { return; }
      const L1 = lum(col.c), L2 = lum(fd); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (ratio < 3 && !vus.has(propre.slice(0, 30))) { vus.add(propre.slice(0, 30)); out.contraste.push(`${ratio.toFixed(1)} « ${propre.slice(0, 40)} » <${el.tagName.toLowerCase()} class=${(el.className || "").toString().slice(0, 40)}> couleur=${st.color} fond=${JSON.stringify(fd)}`); }
    });
    out.contraste = out.contraste.slice(0, 5);
    // 5b) chevauchement : un bouton flottant (position fixe, petit) recouvre un element interactif ou un titre
    const flottants = [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') { return false; } const r = e.getBoundingClientRect(); return r.width > 20 && r.width < 90 && r.height > 20 && r.height < 300 && cs.visibility !== 'hidden'; });
    const cibles = [...document.querySelectorAll('button, a, input, select, textarea, h1, h2')].filter(e => vis(e) && getComputedStyle(e).position !== 'fixed' && !e.closest('[style*="position: fixed"], .barre-navigation-fixe') && !flottants.some(f => f.contains(e)));
    flottants.forEach(f => { const fr = f.getBoundingClientRect(); cibles.forEach(c => { const cr = c.getBoundingClientRect(); const ix = Math.max(0, Math.min(fr.right, cr.right) - Math.max(fr.left, cr.left)); const iy = Math.max(0, Math.min(fr.bottom, cr.bottom) - Math.max(fr.top, cr.top)); if (cr.width * cr.height > 0 && (ix * iy) / (cr.width * cr.height) > 0.04 && out.chevauchement.length < 4) { out.chevauchement.push(`${(f.getAttribute('aria-label') || f.id || f.className || f.tagName).toString().slice(0, 30)} recouvre « ${(c.textContent || c.placeholder || c.tagName).trim().slice(0, 30)} »`); } }); });
    // 6) ecran (quasi) vide : peu de texte hors barres
    if (texteVisible.replace(/\s+/g, '').length < 80) { out.vide.push(String(texteVisible.length)); }
    return out;
  }).catch(() => null);
  if (!r) { return; }
  const theme = await p.evaluate(() => document.documentElement.getAttribute('data-theme') || 'clair').catch(() => '?');
  for (const [type, liste] of Object.entries(r)) {
    const l = Array.isArray(liste) ? liste : (liste ? [liste] : []);
    if (l.length) { fs.appendFileSync(SORTIE, JSON.stringify({ ecran: etiquette, theme, type, details: l }) + '\n'); }
  }
}
module.exports = { controlerEcran };
