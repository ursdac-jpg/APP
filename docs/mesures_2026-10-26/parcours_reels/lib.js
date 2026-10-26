const { chromium } = require('playwright');
const SC = '' + (process.env.CAPTURES || require('os').tmpdir() + '/captures_parcours') + '';
require('fs').mkdirSync(SC, { recursive: true });
async function ouvrir() {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { window.__ouvertures = []; window.open = function (u) { window.__ouvertures.push(String(u)); return { closed: false, focus() {}, close() {} }; }; });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const p = await ctx.newPage(); p.errs = []; p.log = [];
  p.on('pageerror', e => p.errs.push(String(e).slice(0, 160)));
  p.on('dialog', d => { p.log.push('DIALOGUE: ' + d.message().slice(0, 120)); d.accept(); });
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  return { b, p };
}
async function etat(p, etiquette) {
  await p.waitForTimeout(900);
  const e = await p.evaluate(() => {
    const vis = el => el && el.offsetParent !== null;
    const h = [...document.querySelectorAll('h1')].filter(vis).map(x => x.textContent.trim().replace(/\s+/g, ' ')).join(' / ');
    const barre = [...document.querySelectorAll('.pastille-etape-action-label')].filter(vis).map(x => x.textContent.trim());
    const actif = [...document.querySelectorAll('.pastille-etape-action')].filter(vis).map(x => x.className.includes('active') || x.className.includes('courant') ? '*' : '').join('');
    const bas = [...document.querySelectorAll('.barre-navigation-fixe button, .barre-navigation button')].filter(vis).map(x => (x.disabled ? '(grisé) ' : '') + x.textContent.trim().replace(/\s+/g, ' '));
    return { route: typeof pageActuelle !== 'undefined' ? pageActuelle : '?', h1: h, barre: barre.join(' > '), bas: bas.join(' | '), modal: !!document.querySelector('.fenetre-erip, .modal.show, [role=dialog]') };
  });
  const ligne = `[${etiquette}] route=${e.route} | h1=${e.h1} | barre=${e.barre || '(aucune)'} | bas=${e.bas}${e.modal ? ' | FENÊTRE OUVERTE' : ''}`;
  p.log.push(ligne); console.log(ligne);
  return e;
}
async function clic(p, sel, etiquette) {
  try { await p.locator(sel).first().click({ timeout: 4000 }); } catch (err) { console.log(`!! clic impossible ${sel} : ${String(err).slice(0, 90)}`); p.log.push('ECHEC CLIC ' + sel); return false; }
  return etat(p, etiquette || ('clic ' + sel));
}
async function clicTexte(p, texte, etiquette) {
  try { await p.getByText(texte, { exact: false }).first().click({ timeout: 4000 }); } catch (err) { console.log(`!! clic texte impossible "${texte}" : ${String(err).slice(0, 90)}`); p.log.push('ECHEC CLIC ' + texte); return false; }
  return etat(p, etiquette || ('clic « ' + texte + ' »'));
}
async function photo(p, nom) { await p.screenshot({ path: `${SC}/${nom}.png` }); }
async function boutons(p) { return p.evaluate(() => [...document.querySelectorAll('button, a.btn, input[type=text], input[type=checkbox], select, textarea')].filter(e => e.offsetParent !== null).slice(0, 80).map(e => `${e.tagName.toLowerCase()}#${e.id || ''}.${(e.className + '').split(' ')[0]} «${(e.textContent || e.placeholder || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 50)}»${e.disabled ? ' (grisé)' : ''}`)); }
module.exports = { ouvrir, etat, clic, clicTexte, photo, boutons };
