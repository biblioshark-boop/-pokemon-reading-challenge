/* Account-scoped, once-per-challenge welcome. No challenge-save writes. */
(()=>{
  const TABLE='rf_challenge_welcome_dismissals';
  const copy={
    pokemon:{title:'Welcome to the Pokémon Reading Challenge!',intro:'You can join at any time of year, and there’s no time limit to complete the challenge.',rules:[
      'For 2026 only, you may back log books you’ve read during 2026—even before joining—to catch Pokémon.',
      'Each book read counts toward one prompt and one Pokémon. Please don’t double up on prompts for the same read.'
    ],faq:'/pokemon/#page-faq'},
    museum:{title:'Welcome to The Reading Frenzy Museum!',intro:'You can join at any time of year, and there’s no time limit to complete the challenge.',rules:[
      'This challenge does not allow backlogging. Books read before you started the Museum challenge cannot be used to unlock exhibits.',
      'Each book read counts toward one prompt and one exhibit. Please don’t double up on prompts for the same read.'
    ],faq:'/dino/'}
  };
  let started=false;
  const cacheKey=c=>'rf-challenge-welcome-dismissed:'+c.userId+':'+c.challenge;
  function readCache(c){try{return JSON.parse(localStorage.getItem(cacheKey(c))||'null');}catch(_){return null;}}
  function writeCache(c,pending){try{localStorage.setItem(cacheKey(c),JSON.stringify({dismissed:true,pending}));}catch(_){}}
  async function persist(c){
    try{
      const {error}=await c.client.from(TABLE).upsert({user_id:c.userId,challenge_key:c.challenge},{onConflict:'user_id,challenge_key',ignoreDuplicates:true});
      if(error)throw error;
      writeCache(c,false);
    }catch(error){console.warn('Challenge welcome dismissal is waiting to sync',error);}
  }
  function show(c){
    const text=copy[c.challenge],priorFocus=document.activeElement;
    const style=document.createElement('style');
    style.textContent=`
      #rf-challenge-welcome{box-sizing:border-box;width:min(560px,calc(100vw - 28px));max-height:calc(100dvh - 28px);margin:auto;padding:30px;border:1px solid #b9c6bf;border-radius:20px;background:#fffdf5;color:#233a33;box-shadow:0 16px 60px #0005;font:16px/1.6 system-ui,sans-serif;overflow:auto}
      #rf-challenge-welcome::backdrop{background:rgba(8,23,20,.68)}
      #rf-challenge-welcome h2{margin:0 35px 18px 0;font:700 27px/1.25 Georgia,serif;color:#183f34}
      #rf-challenge-welcome p{margin:0 0 18px}
      #rf-challenge-welcome ul{padding-left:22px;margin:0 0 22px}
      #rf-challenge-welcome li+li{margin-top:14px}
      #rf-challenge-welcome a{color:#185c4b;text-decoration:underline;font-weight:700}
      #rf-challenge-welcome .rf-welcome-close{position:absolute;right:12px;top:10px;min-width:44px;min-height:44px;padding:4px;border:0;border-radius:10px;background:transparent;color:#233a33;font:28px/1 system-ui;cursor:pointer}
      #rf-challenge-welcome :focus-visible{outline:3px solid #2b8069;outline-offset:3px}
      @media(max-width:500px){#rf-challenge-welcome{padding:25px 22px;font-size:15px}#rf-challenge-welcome h2{font-size:24px}}
    `;
    document.head.appendChild(style);
    const modal=document.createElement('dialog');
    modal.id='rf-challenge-welcome';
    modal.setAttribute('aria-labelledby','rf-welcome-title');
    modal.setAttribute('aria-describedby','rf-welcome-intro');
    const close=document.createElement('button');close.type='button';close.className='rf-welcome-close';close.setAttribute('aria-label','Close welcome message');close.textContent='×';
    const title=document.createElement('h2');title.id='rf-welcome-title';title.textContent=text.title;
    const intro=document.createElement('p');intro.id='rf-welcome-intro';intro.textContent=text.intro;
    const rules=document.createElement('ul');
    for(const rule of text.rules){const li=document.createElement('li');li.textContent=rule;rules.appendChild(li);}
    const help=document.createElement('p');help.appendChild(document.createTextNode('Have more questions? Please read the '));
    const faq=document.createElement('a');faq.href=text.faq;faq.textContent='FAQ page';help.append(faq,document.createTextNode('.'));
    let closed=false;
    function dismiss(){
      if(closed)return;closed=true;
      writeCache(c,true);
      modal.close();modal.remove();style.remove();
      if(priorFocus?.isConnected)priorFocus.focus();
      void persist(c);
    }
    close.addEventListener('click',dismiss);
    modal.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
    faq.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      dismiss();
      if(c.challenge==='pokemon'&&typeof window.openFaqHelp==='function'){event.preventDefault();window.openFaqHelp();}
      if(c.challenge==='museum'){
        const button=document.querySelector('.nav button[data-tab="FAQ"]');
        if(button){event.preventDefault();button.click();}
      }
    });
    modal.append(close,title,intro,rules,help);document.body.appendChild(modal);modal.showModal();close.focus();
  }
  async function init(){
    const c=window.rfChallengeWelcomeContext;
    if(started||!c?.userId||!c.client||!copy[c.challenge]||!document.body)return;
    started=true;
    const cached=readCache(c);
    if(cached?.dismissed){if(cached.pending)void persist(c);return;}
    try{
      const {data,error}=await c.client.from(TABLE).select('challenge_key').eq('user_id',c.userId).eq('challenge_key',c.challenge).maybeSingle();
      if(error)throw error;
      if(data){writeCache(c,false);return;}
      show(c);
    }catch(error){started=false;console.warn('Challenge welcome could not load',error);}
  }
  window.addEventListener('rf-challenge-welcome-ready',init);
  window.addEventListener('online',()=>{const c=window.rfChallengeWelcomeContext;if(c?.userId&&readCache(c)?.pending)void persist(c);else void init();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else void init();
})();
