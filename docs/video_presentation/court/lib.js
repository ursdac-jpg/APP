/* Outils communs des vidéos courtes (30 s) : pointeur dessiné, déplacements, clics à la vraie souris, cale de la voix.
   Repris de enregistrer.js (vidéo d'introduction), mis en bibliothèque pour que chaque vidéo n'ait que son scénario. */
const dormir = s => new Promise(r => setTimeout(r, s * 1000));

const CURSEUR = () => {
  let el;
  const fait = () => {
    if (el && el.isConnected) return el;
    el = document.createElement('div'); el.id = '__curseur';
    el.style.cssText = 'position:fixed;left:0;top:0;width:34px;height:34px;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));';
    el.innerHTML = '<svg width="34" height="34" viewBox="0 0 30 30"><path d="M3 2 L3 23 L8.5 18 L12.5 27 L16 25.5 L12 16.5 L19.5 16.5 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(el); return el;
  };
  document.addEventListener('mousemove', e => { fait().style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }, true);
  document.addEventListener('mousedown', e => {
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:4px solid rgba(11,94,215,.85);border-radius:50%;width:12px;height:12px;left:' + (e.clientX - 6) + 'px;top:' + (e.clientY - 6) + 'px;transition:all .5s ease-out;opacity:1;';
    document.documentElement.appendChild(o);
    requestAnimationFrame(() => { o.style.width = '64px'; o.style.height = '64px'; o.style.left = (e.clientX - 32) + 'px'; o.style.top = (e.clientY - 32) + 'px'; o.style.opacity = '0'; });
    setTimeout(() => o.remove(), 700);
  }, true);
};

function creer(p, duree) {
  const o = { p, T0: 0, depart: {}, finVoix: 0, mx: 640, my: 600 };
  o.maint = () => (Date.now() - o.T0) / 1000;
  o.top = () => { o.T0 = Date.now(); };
  o.jusqua = async t => { if (t > o.maint()) await dormir(t - o.maint()); };
  o.finDeVoix = async (marge = 0.4) => { await o.jusqua(o.finVoix + marge); };
  o.bloc = async id => {
    const t = Math.max(o.maint(), o.finVoix + 0.35);
    if (t > o.maint()) await dormir(t - o.maint());
    o.depart[id] = o.maint(); o.finVoix = o.depart[id] + duree[id];
    console.log('  [' + o.maint().toFixed(1) + 's] ' + id);
  };
  o.aller = async (x, y, ms = 750) => {
    const n = Math.max(8, Math.round(ms / 28)); const x0 = o.mx, y0 = o.my;
    for (let i = 1; i <= n; i++) {
      const u = i / n, e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      await p.mouse.move(x0 + (x - x0) * e, y0 + (y - y0) * e); await dormir(ms / 1000 / n);
    }
    o.mx = x; o.my = y;
  };
  o.centre = async loc => {
    await loc.evaluate(e => { const r = e.getBoundingClientRect(); if (r.top < 100 || r.bottom > 600) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }).catch(() => {});
    await dormir(0.35);
    const bb = await loc.boundingBox(); if (!bb) throw new Error('élément sans boîte');
    return [bb.x + bb.width / 2, bb.y + bb.height / 2];
  };
  o.survol = async (loc, ms = 750) => { const [x, y] = await o.centre(loc); await o.aller(x, y, ms); };
  o.cliquer = async (loc, ms = 750) => {
    const [x, y] = await o.centre(loc); await o.aller(x, y, ms); await dormir(0.2);
    await p.mouse.down(); await dormir(0.08); await p.mouse.up(); await dormir(0.4);
  };
  o.cliquerA = async (x, y, ms = 650) => { await o.aller(x, y, ms); await dormir(0.2); await p.mouse.down(); await dormir(0.08); await p.mouse.up(); await dormir(0.4); };
  o.glisser = async (x0, y0, x1, y1, ms = 800) => {
    await o.aller(x0, y0, 600); await dormir(0.15); await p.mouse.down();
    const n = Math.max(10, Math.round(ms / 30));
    for (let i = 1; i <= n; i++) { await p.mouse.move(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); await dormir(ms / 1000 / n); }
    await p.mouse.up(); o.mx = x1; o.my = y1; await dormir(0.3);
  };
  o.defiler = async (y, ms = 1000) => {
    const y0 = await p.evaluate(() => window.scrollY); const n = Math.max(6, Math.round(ms / 40));
    for (let i = 1; i <= n; i++) { await p.evaluate(v => window.scrollTo(0, v), y0 + (y - y0) * (i / n)); await dormir(ms / 1000 / n); }
  };
  return o;
}
module.exports = { dormir, CURSEUR, creer };
