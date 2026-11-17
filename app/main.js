// make.fun frontend. Routes: #/ board, #/bounty/<slug>, #/bounty/<slug>/leaderboard, #/user/<handle>.
// Read-only GET to the public API, cached 30s in memory. The board loads
// first; the other views load on demand with import(). __shotReady marks a rendered route.
const A='https://make.fun/api',app=document.getElementById('app'),qi=document.getElementById('q'),C=new Map();
async function get(p){const h=C.get(p);if(h&&Date.now()-h.t<3e4)return h.d;const r=await fetch(A+p);if(!r.ok){const e=new Error(r.status);e.status=r.status;throw e}const d=await r.json();C.set(p,{d,t:Date.now()});return d}
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
export const usd=v=>{const n=+v;return Number.isFinite(n)?'$'+(Number.isInteger(n)?n.toLocaleString('en-US'):n.toFixed(2)):'-'};
export const dt=i=>i?new Date(i).toISOString().slice(0,16).replace('T',' ')+' UTC':'-';
export const lf=i=>{const m=new Date(i)-Date.now();if(!(m>0))return 'ended';const d=m/864e5|0,h=m%864e5/36e5|0,n=m%36e5/6e4|0;return d?d+'d '+h+'h left':h?h+'h '+n+'m left':n+'m left'};
export const opn=b=>b.deadline&&new Date(b.deadline)>Date.now();
export const pot=b=>usd(b.potUsd??b.rewardAmount);
export const fee=b=>b.entryFeeUsd?usd(b.entryFeeUsd):'Free';
export const fc=b=>'<dl class="facts"><div><dt>Live pot</dt><dd class="pot">'+pot(b)+'</dd></div><div><dt>Entry fee</dt><dd>'+fee(b)+'</dd></div><div><dt>Time left</dt><dd>'+lf(b.deadline)+'</dd></div><div><dt>Entries</dt><dd>'+(b.submissionCount??0)+'</dd></div></dl>';
export const pg=(p,n,k)=>{if(n<2)return '';const keep=[1,n];for(let i=p-2;i<=p+2;i++)if(i>1&&i<n)keep.push(i);keep.sort((a,b)=>a-b);let h='<nav class="pg">',last=0;for(const i of keep){if(i-last>1)h+='<span class="mut">...</span>';h+='<button data-p="'+i+'" data-k="'+k+'"'+(i===p?' class="on"':'')+'>'+i+'</button>';last=i}return h+'</nav>'};
let BD=null,LD=null,PD=null,V=null,S={f:'all',q:'',p:1},lp=1;
async function views(){if(!V)V=await import('./views.js');return V}
function applyBoard(){let it=BD.items.slice();const qy=S.q.trim().toLowerCase();if(qy)it=it.filter(b=>(b.title+' '+(b.summary||'')+' '+(b.category||'')).toLowerCase().includes(qy));if(S.f==='open')it=it.filter(opn);else if(S.f==='ended')it=it.filter(b=>!opn(b));it.sort((a,b)=>+(b.potUsd??b.rewardAmount)-+(a.potUsd??a.rewardAmount));app.innerHTML=V.boardView(it,S)}
async function render(){window.__shotReady=false;const h=location.hash||'#/',lb=h.match(/^#\/bounty\/([^/]+)\/leaderboard$/),bm=h.match(/^#\/bounty\/([^/]+)$/),um=h.match(/^#\/user\/([^/]+)$/);try{const W=await views();if(lb){if(!LD){app.innerHTML='<p>Loading...</p>';LD=await get('/competitions/'+encodeURIComponent(lb[1])+'/leaderboard')}document.title='Leaderboard | make.fun bounties';app.innerHTML=W.lbView(LD,lp)}else if(bm){app.innerHTML='<p>Loading...</p>';const b=await get('/competitions/'+encodeURIComponent(bm[1]));document.title=b.title+' | make.fun bounties';app.innerHTML=W.bountyView(b)}else if(um){if(!PD){app.innerHTML='<p>Loading...</p>';PD=await get('/profiles/'+encodeURIComponent(um[1]))}document.title='@'+PD.handle+' | make.fun bounties';app.innerHTML=W.profileView(PD)}else{document.title='make.fun bounties';if(!BD){app.innerHTML='<p>Loading...</p>';BD=await get('/competitions?status=open&activity=times')}applyBoard()}}catch(e){app.innerHTML='<h1>'+(e.status===404?'Not found':'Something went wrong')+'</h1><p>'+(e.status===404?'That bounty or account does not exist.':'The make.fun API did not answer. Try again in a moment.')+'</p><p><a href="#/">Back to the board</a></p>'}window.scrollTo(0,0);window.__shotReady=true}
app.addEventListener('click',async ev=>{const f=ev.target.closest('[data-f]');if(f){S.f=f.dataset.f;S.p=1;applyBoard();return}const g=ev.target.closest('[data-p]');if(g){const p=+g.dataset.p;if(g.dataset.k==='l'){lp=p;app.innerHTML=V.lbView(LD,lp)}else{S.p=p;applyBoard()}window.scrollTo(0,0)}});
qi.addEventListener('input',()=>{S.q=qi.value;S.p=1;if(location.hash&&location.hash!=='#/')location.hash='#/';else applyBoard()});
window.addEventListener('hashchange',()=>{lp=1;LD=null;PD=null;render()});
render();
