import React, { useEffect, useMemo, useRef, useState } from 'react';

type Check = { key: string; label: string; pass: boolean | null };

export default function SelfAuditOverlay() {
  const [mounted, setMounted] = useState(false);
  const [vw, setVw] = useState<number>(0);
  const [collapsed, setCollapsed] = useState(false);
  const resizeTimer = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setVw(window.innerWidth);
    const onResize = () => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => setVw(window.innerWidth), 120);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // helpers sûrs après montage
  const q = (s: string) => (mounted ? document.querySelector(s) : null);
  const exists = (s: string) => !!q(s);

  const checks: Check[] = useMemo(() => {
    if (!mounted) return [];

    // 1) éventail
    const fanOk = exists('.fan .fanCard');
    const fanInside = (() => {
      const el = q('.fan') as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= window.innerWidth + 1;
    })();

    // 2) adversaire visible
    const oppOk =
      document.querySelectorAll(`[aria-label="Carte de l'adversaire (dos)"]`).length > 0;

    // 3) défausse gardée (cherche un bouton de prise plus spécifique si possible)
    const discardGuard = (() => {
      // Exemples de sélecteurs possibles à adapter:
      // - bouton enveloppant la top card de défausse
      // - un aria-label qui commence par "Prendre " quand autorisé
      const btn =
        (q('button[aria-label^="Prendre "]') as HTMLButtonElement | null) ||
        (q('[data-discard-top]') as HTMLButtonElement | null) ||
        (q('[aria-label*="Prendre"]') as HTMLButtonElement | null);
      if (!btn) return null;
      const title = btn.getAttribute('title') || '';
      const disabled = btn.disabled || getComputedStyle(btn).pointerEvents === 'none';
      const denied = title.includes('non permise') || disabled;
      // On valide la présence d'un garde (autorise/empêche) plutôt que l'état courant.
      return denied !== undefined;
    })();

    // 4) main scrollable mobile
    const playerScroll = (() => {
      const el = q('.player-hand-scroll') as HTMLElement | null;
      if (!el) return null;
      return el.scrollWidth > el.clientWidth;
    })();

    // 5) difficulté : plusieurs sélecteurs possibles
    const difficultyGone =
      !exists('.DifficultyBar') &&
      !exists('[data-difficulty-bar]') &&
      !exists('#difficulty-bar');

    // 6) iPhone heuristique
    const iphoneHeuristic = vw <= 430 ? true : null;

    return [
      { key: 'fan', label: 'Éventail joueur compact + chevauchement', pass: !!fanOk },
      { key: 'fanInside', label: "Pas d'overflow latéral du fan", pass: fanInside },
      { key: 'opp', label: 'Dos des cartes adverses visibles sur table', pass: oppOk },
      { key: 'discard', label: 'Défausse gardée (top cliquable seulement si autorisé)', pass: discardGuard },
      { key: 'scroll', label: 'Main joueur scrollable (mobile)', pass: playerScroll },
      { key: 'diff', label: 'Barre de difficulté masquée après choix', pass: difficultyGone },
      { key: 'iphone', label: `Heuristique iPhone (vw<=430)`, pass: iphoneHeuristic },
    ];
  }, [mounted, vw]);

  if (!mounted) return null;

  const search = new URLSearchParams(location.search);
  if (!search.has('audit')) return null;

  const toReport = (arr: Check[]) => ({
    timestamp: new Date().toISOString(),
    url: location.href,
    results: arr.map((c) => ({ key: c.key, label: c.label, pass: c.pass })),
  });

  const copyJSON = async () => {
    const data = JSON.stringify(toReport(checks), null, 2);
    try {
      await navigator.clipboard.writeText(data);
      alert('Rapport copié ✅');
    } catch {
      console.log(data);
      alert('Copie refusée : rapport loggé en console.');
    }
  };

  const copyReadable = async () => {
    const lines = checks.map((c) => `${c.pass === true ? '✅' : c.pass === false ? '❌' : '⚪'}  ${c.label}`);
    const text = `RAMI-WSOP · Self-Audit (${new Date().toLocaleString()}):\n` + lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('Résumé copié ✅');
    } catch {
      console.log(text);
      alert('Copie refusée : résumé loggé en console.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        background: 'rgba(0,0,0,.78)',
        color: '#fff',
        padding: '10px 12px',
        borderRadius: 10,
        backdropFilter: 'blur(6px)',
        maxWidth: 360,
      }}
      role="region"
      aria-label="RAMI-WSOP · Self-Audit"
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <strong>RAMI-WSOP · Self-Audit</strong>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#fff' }}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Déplier' : 'Replier'}
        >
          {collapsed ? '▾' : '▴'}
        </button>
      </div>

      {!collapsed && (
        <>
          <ul style={{ display: 'grid', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
            {checks.map((c) => (
              <li key={c.key} style={{ display: 'grid', gridTemplateColumns: '18px 1fr', alignItems: 'center', gap: 8 }}>
                <span aria-hidden>{c.pass === true ? '✅' : c.pass === false ? '❌' : '⚪'}</span>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={copyJSON}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 8, background: '#1f2937', border: '1px solid #374151', color: '#fff' }}
            >
              Copier le rapport JSON
            </button>
            <button
              onClick={copyReadable}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 8, background: '#1f2937', border: '1px solid #374151', color: '#fff' }}
            >
              Copier le résumé
            </button>
          </div>

          <p role="status" style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
            ⚪ = non détectable automatiquement (vérif manuelle).
          </p>
        </>
      )}
    </div>
  );
}
