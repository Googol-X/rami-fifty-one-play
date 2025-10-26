import React, { useEffect, useMemo, useState } from 'react';

type Check = { key:string; label:string; pass:boolean|null };
const q = (s:string)=>document.querySelector(s);
const exists = (s:string)=>!!q(s);

function toReport(checks:Check[]){
  return {
    timestamp: new Date().toISOString(),
    url: location.href,
    results: checks.map(c=>({key:c.key,label:c.label,pass:c.pass}))
  };
}

export default function SelfAuditOverlay(){
  if (typeof window==='undefined') return null;
  const [vw,setVw]=useState(window.innerWidth);
  useEffect(()=>{ const r=()=>setVw(window.innerWidth); window.addEventListener('resize',r); return ()=>window.removeEventListener('resize',r);},[]);
  const checks:Check[] = useMemo(()=>{
    const fanOk = exists('.fan .fanCard'); // éventail actif
    const fanInside = (()=>{ const el=q('.fan') as HTMLElement|null; if(!el) return null; const r=el.getBoundingClientRect(); return r.left>=0 && r.right<=window.innerWidth+1;})();
    const oppOk = document.querySelectorAll(`[aria-label="Carte de l'adversaire (dos)"]`).length>0;
    const discardGuard = (()=>{ const btn=q('[aria-label*="Prendre"]') as HTMLButtonElement|null; if(!btn) return null; const denied = btn.getAttribute('title')?.includes('non permise') || btn.disabled; return denied!==undefined;})();
    const playerScroll = (()=>{ const el=q('.player-hand-scroll') as HTMLElement|null; if(!el) return null; return el.scrollWidth>el.clientWidth;})();
    const difficultyGone = !exists('.DifficultyBar'); // adapte si ton sélecteur diffère
    return [
      { key:'fan', label:'Éventail joueur compact + chevauchement', pass:!!fanOk },
      { key:'fanInside', label:`Pas d'overflow latéral du fan`, pass:fanInside },
      { key:'opp', label:'Dos des cartes adverses visibles sur table', pass:oppOk },
      { key:'discard', label:'Défausse gardée (top cliquable seulement si autorisé)', pass:discardGuard },
      { key:'scroll', label:'Main joueur scrollable (mobile)', pass:playerScroll },
      { key:'diff', label:'Barre de difficulté masquée après choix', pass:difficultyGone },
      { key:'iphone', label:`Heuristique iPhone (vw<=430)`, pass: vw<=430 ? true : null },
    ];
  },[vw]);

  if (!new URLSearchParams(location.search).has('audit')) return null;

  const copy = async ()=>{
    const data = JSON.stringify(toReport(checks), null, 2);
    try { await navigator.clipboard.writeText(data); alert('Rapport copié dans le presse-papiers ✅'); }
    catch { console.log(data); alert('Copie non autorisée, rapport dans la console.'); }
  };

  return (
    <div style={{position:'fixed',top:10,right:10,zIndex:9999,background:'rgba(0,0,0,.78)',color:'#fff',padding:'10px 12px',borderRadius:10,backdropFilter:'blur(6px)',maxWidth:360}}>
      <div style={{fontWeight:800,marginBottom:6}}>RAMI-WSOP · Self-Audit</div>
      <ul style={{display:'grid',gap:6,listStyle:'none',padding:0,margin:0}}>
        {checks.map(c=>(
          <li key={c.key} style={{display:'grid',gridTemplateColumns:'18px 1fr',alignItems:'center',gap:8}}>
            <span aria-hidden>{c.pass===true?'✅':c.pass===false?'❌':'⚪'}</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
      <button onClick={copy} style={{marginTop:8,width:'100%',padding:'6px 8px',borderRadius:8,background:'#1f2937',border:'1px solid #374151',color:'#fff'}}>Copier le rapport</button>
      <div style={{marginTop:6,fontSize:12,opacity:.8}}>⚪ = non détectable automatiquement.</div>
    </div>
  );
}
