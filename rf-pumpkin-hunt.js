/* Pokémon-only seasonal hunt overlay. Dinosaur remains disabled server-side. */
(() => {
  'use strict';
  if (window.__rfChallengePumpkinV1) return;
  window.__rfChallengePumpkinV1 = true;
  const site = document.currentScript?.dataset.rfChallenge || '';
  if (!['pokemon', 'dino'].includes(site)) return;
  const API = 'https://yamjfaacvewvrinxytep.supabase.co/rest/v1/rpc/';
  const KEY = 'sb_publishable_1NoVsY53V4CBFMg_i09Lcg_DCf8w_Lb';
  const AUTH_KEY = 'sb-yamjfaacvewvrinxytep-auth-token';
  const HUB = 'https://thereadingfrenzy.com/';
  const LEAF_CHOICE_KEY = 'rf-pokemon-pending-leaf-choice-v1';
  let currentView = '', attemptedView = '', generation = 0;
  let rolling = false, claiming = false, active = null, expiryTimer = null, dialog = null;
  let initial = true;

  function session() {
    try {
      const value = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
      if (!value?.access_token || !value?.user?.id) return null;
      if (value.expires_at && value.expires_at * 1000 <= Date.now()) return null;
      return value;
    } catch (_) { return null; }
  }
  // Use the session refreshed by the challenge. Never initialize or modify its auth.
  async function rpc(name, args) {
    const auth = session();
    if (!auth) throw new Error('Sign in to claim this pumpkin.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(API + name, {
        method: 'POST', signal: controller.signal,
        headers: {apikey: KEY, Authorization: 'Bearer ' + auth.access_token, 'Content-Type': 'application/json'},
        body: JSON.stringify(args || {})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Pumpkin Hunt is temporarily unavailable.');
      return Array.isArray(data) ? data[0] : data;
    } finally { clearTimeout(timeout); }
  }
  function visible(node) {
    return !!node && !node.hidden && getComputedStyle(node).display !== 'none';
  }
  function viewKey() {
    if (document.visibilityState === 'hidden' || document.getElementById('rf-shared-auth-gate')) return '';
    if (getComputedStyle(document.documentElement).visibility === 'hidden') return '';
    const auth = session();
    if (!auth) return '';
    if (site === 'pokemon') {
      if (typeof publicMode !== 'undefined' && publicMode) return '';
      if (visible(document.getElementById('loginLoadOverlay'))) return '';
      const page = document.querySelector('.page.active');
      if (!page || page.id === 'authPage') return '';
      return auth.user.id + ':pokemon:' + page.id + ':' + location.hash;
    }
    const ids = ['rangerHQPage', 'fieldGuidePage', 'myParkPage', 'faqPage', 'settingsPage'];
    const page = ids.map(id => document.getElementById(id)).find(visible);
    if (!page) return '';
    let part = '';
    if (page.id === 'fieldGuidePage') {
      part = document.querySelector('#museumWingTabs .wing-tab.active')?.dataset.wing || '';
      const detail = document.getElementById('fgDetail');
      if (visible(detail)) part += ':' + (detail.querySelector('h2,h3')?.textContent || 'exhibit');
    }
    return auth.user.id + ':dino:' + page.id + ':' + part;
  }
  function clearPumpkin() {
    document.getElementById('rf-challenge-pumpkin')?.remove();
    active = null;
    clearTimeout(expiryTimer);
  }
  function asset(path) {
    const url = new URL(path || '', HUB);
    const hubArt = url.origin === new URL(HUB).origin && url.pathname.startsWith('/assets/images/events/pumpkin-hunt-2026/');
    const seasonalArt = url.origin === new URL(API).origin && url.pathname.startsWith('/storage/v1/object/public/rf-hunt-public-art/');
    if (!hubArt && !seasonalArt) throw new Error('Unexpected collectible image.');
    return url.href;
  }
  function position(button) {
    const size = innerWidth <= 600 ? 82 : 106;
    const x = Math.max(12, innerWidth - size - 16);
    const bottom = Math.max(110, innerHeight - size - 125);
    const top = Math.min(bottom, Math.max(110, (document.querySelector('header')?.getBoundingClientRect().bottom || 100) + 12));
    const y = top + Math.random() * Math.max(0, bottom - top);
    Object.assign(button.style, {position:'fixed', zIndex:'4700', width:size+'px', height:size+'px', left:(Math.random()<.5?12:x)+'px', top:y+'px', padding:'0', border:'0', background:'transparent', cursor:'pointer', filter:'drop-shadow(0 5px 6px rgba(0,0,0,.25))'});
  }
  function showPumpkin(item, key) {
    clearPumpkin();
    const button = document.createElement('button');
    button.id = 'rf-challenge-pumpkin';button.type = 'button';
    button.setAttribute('aria-label', 'Claim ' + (item.display_name || 'pumpkin'));
    const image = document.createElement('img');image.src = asset(item.asset_path);image.alt = item.display_name || 'Pumpkin';
    image.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;pointer-events:none';
    image.onerror = () => clearPumpkin();
    button.appendChild(image);position(button);document.body.appendChild(button);
    active = {item, key};button.onclick = () => claim(item, key, button);
    const expires = new Date(item.expires_at).getTime();
    expiryTimer = setTimeout(clearPumpkin, Math.max(0, Math.min(120000, expires - Date.now())));
  }
  function element(tag, text) { const node=document.createElement(tag);node.textContent=text;return node; }
  // Gold Leaf tickets must accept the same final, searchable Pokémon choice as on the Hub.
  // A pending ticket is remembered locally so a refresh cannot silently hide the choice.
  function pendingLeafTicket(){
    try{
      const saved=JSON.parse(localStorage.getItem(LEAF_CHOICE_KEY)||'null');
      return saved?.userId===session()?.user?.id && typeof saved.ticketId==='string'?saved.ticketId:null;
    }catch(_){return null}
  }
  function rememberLeafTicket(ticketId){
    try{const userId=session()?.user?.id;if(userId)localStorage.setItem(LEAF_CHOICE_KEY,JSON.stringify({userId,ticketId}));}catch(_){}
  }
  function clearLeafTicket(){try{localStorage.removeItem(LEAF_CHOICE_KEY)}catch(_){}}
  function addLeafShinyChoice(card,ticketId){
    rememberLeafTicket(ticketId);
    const block=document.createElement('section');
    block.style.cssText='padding:12px;margin:14px 0;background:#fff2cb;border:2px solid #b58a45;border-radius:12px;text-align:left';
    block.append(element('p','🎟️ Gold Leaf: choose your guaranteed shiny Pokémon! This choice is FINAL and cannot be switched.'));
    const label=element('label','Search for your Pokémon');label.htmlFor='rf-leaf-pokemon-choose';label.style.cssText='display:block;font-weight:bold;margin:8px 0';
    const input=document.createElement('input');input.id=label.htmlFor;input.maxLength=80;input.placeholder='Search Pokémon…';
    input.style.cssText='width:100%;box-sizing:border-box;padding:10px;border:1px solid #9a845e;border-radius:8px';
    const results=document.createElement('div');results.setAttribute('role','listbox');
    results.style.cssText='max-height:180px;overflow-y:auto;margin:6px 0';
    const status=element('p','Loading Pokémon choices…');status.setAttribute('role','status');
    const submit=element('button','Confirm final Pokémon choice');submit.type='button';submit.disabled=true;
    submit.style.cssText='padding:10px;background:#206e54;color:white;border:none;border-radius:8px;font-weight:bold';
    let selected='';let choices=[];
    function search(){
      selected='';submit.disabled=true;results.replaceChildren();
      const value=input.value.trim().toLowerCase();
      if(!value)return;
      choices.filter(p=>p.toLowerCase().includes(value)).slice(0,16).forEach(name=>{
        const option=element('button',name);option.type='button';
        option.style.cssText='display:block;width:100%;padding:8px;text-align:left;background:white;border:1px solid #d0c098;border-radius:6px;margin:2px 0;color:#32291e';
        option.onclick=()=>{selected=name;input.value=name;results.replaceChildren();submit.disabled=false};
        results.append(option);
      });
      if(!results.childElementCount)results.append(element('p','No matching Pokémon.'));
    }
    input.addEventListener('input',search);
    submit.onclick=async()=>{
      if(!selected||input.value.trim()!==selected)return;
      if(!confirm('FINAL CHOICE: '+selected+'\n\nYou cannot switch this Pokémon after submitting. Confirm?'))return;
      submit.disabled=true;status.textContent='Saving your choice…';
      try{
        await rpc('rf_submit_leaf_shiny_choice',{p_ticket_id:ticketId,p_pokemon:selected});
        clearLeafTicket();
        status.textContent='Your final shiny Pokémon choice is saved and sent to Reading Frenzy staff!';
        input.disabled=true;results.replaceChildren();
      }catch(err){status.textContent=err.message||'Could not submit Pokémon. Try again.';submit.disabled=false;}
    };
    block.append(label,input,results,submit,status);card.append(block);
    const auth=session();
    if(!auth){status.textContent='Sign in on the Hub to finish your Pokémon choice.';return;}
    fetch('https://yamjfaacvewvrinxytep.supabase.co/rest/v1/pokemon_catalog?select=name,form_name,dex_number&is_active=eq.true&limit=2000',{
      headers:{apikey:KEY,Authorization:'Bearer '+auth.access_token}
    }).then(async response=>{if(!response.ok)throw new Error('Unable to load Pokémon choices');
      const list=await response.json();
      choices=[...new Set(list.map(p=>p.form_name||p.name).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
      status.textContent='Search and select a Pokémon from the results.';
    }).catch(err=>{status.textContent=err.message+'. Visit the Hub or contact staff if needed.'});
  }
  function showReward(result) {
    dialog?.remove();
    dialog = document.createElement('div');dialog.id='rf-challenge-pumpkin-reward';
    dialog.style.cssText='position:fixed;inset:0;z-index:4900;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box';
    const card=document.createElement('div');
    card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label',result.seasonal?'Seasonal collectible reward':'Pumpkin reward');
    card.style.cssText='width:100%;max-width:380px;max-height:85vh;overflow:auto;padding:22px;box-sizing:border-box;border-radius:20px;background:#fff8ed;color:#312718;text-align:center;font:16px/1.4 Arial,sans-serif';
    const image=document.createElement('img');image.src=asset(result.asset_path);image.alt=result.display_name||'Pumpkin';image.style.cssText='width:110px;height:110px;object-fit:contain';
    card.append(image,element('h2',result.seasonal?(result.rarity==='gold'?'You found a Gold Leaf!':'Leaf found!'):(result.rarity==='gold'?'You found a Golden Pumpkin!':'Pumpkin found!')),element('p',result.display_name||(result.seasonal?'Leaf':'Pumpkin')),element('p','+'+(Number(result.points_awarded)||0)+' Reading Frenzy Points'),element('p',result.is_new?'Added to your Collectibles.':'You already own this collectible.'));
    if (Number(result.find_count)>1) card.append(element('p','Found '+result.find_count+' times.'));
    if (result.shiny_ticket_id && result.seasonal) {
      addLeafShinyChoice(card,result.shiny_ticket_id);
    } else if (result.shiny_ticket_id) {
      card.append(element('p','You also received a Shiny Ticket!'));
      const label=element('label','Discord username (optional)');label.htmlFor='rf-challenge-ticket-discord';
      const input=document.createElement('input');input.id=label.htmlFor;input.maxLength=100;input.placeholder='Your Discord username';input.style.cssText='width:100%;box-sizing:border-box;padding:10px;margin:8px 0';
      const save=element('button','Save Discord username');save.type='button';
      const status=element('p','');status.setAttribute('role','status');
      save.onclick=async()=>{
        save.disabled=true;status.textContent='Saving…';
        try{await rpc('set_my_rf_shiny_ticket_discord',{p_ticket_id:result.shiny_ticket_id,p_discord_username:input.value.trim()});status.textContent='Saved! Travis can contact you about your ticket.';}
        catch(err){status.textContent=err.message;}finally{save.disabled=false;}
      };
      card.append(label,input,save,status);
    }
    const link=element('a','View Collectibles on the Hub');link.href=HUB;link.style.cssText='display:block;margin:14px 0;color:#126b76';
    const close=element('button','Continue Challenge');close.type='button';close.style.cssText='padding:12px 16px;border:0;border-radius:12px;background:#126b76;color:white;font-weight:700';
    close.onclick=()=>{dialog?.remove();dialog=null;};card.append(link,close);dialog.appendChild(card);document.body.appendChild(dialog);close.focus();
  }
  async function claim(item, key, button) {
    if (claiming || key!==currentView) return;
    claiming=true;button.disabled=true;
    try {
      const result=await rpc(item.seasonal?(item.action_key?'rf_claim_seasonal_action':'rf_claim_seasonal_browse'):'claim_rf_pumpkin_browse_spawn',{p_spawn_key:item.spawn_key});
      if (!result?.collectible_key) throw new Error('Could not confirm the pumpkin reward.');
      clearPumpkin();showReward({...result,seasonal:!!item.seasonal});
    } catch (err) {
      console.warn('Seasonal collectible claim unavailable',err);
      if(button.isConnected){button.disabled=false;button.setAttribute('aria-label',err.message+' Click to retry.');}
    } finally {claiming=false;}
  }
  async function roll(key, version) {
    rolling=true;attemptedView=key;
    const navigationType=initial&&performance.getEntriesByType('navigation')[0]?.type==='reload'?'reload':'navigate';initial=false;
    try {
      // Use the same active seasonal hunt and shared cooldown/state as the main hub.
      // Do not fall back to the expired Pumpkin Hunt after November 1.
      const hunt=await rpc('rf_current_seasonal_event');
      if(!hunt?.event_key) return;
      const action=await rpc('rf_roll_seasonal_action');
      if(version!==generation || key!==currentView || viewKey()!==key) return;
      if(action?.spawned&&action.spawn_key){
        showPumpkin({...action,seasonal:true},key);
        return;
      }
      const item=await rpc('rf_roll_seasonal_browse',{p_navigation_type:navigationType});
      if(version!==generation || key!==currentView || viewKey()!==key) return;
      if(item?.spawned&&item.spawn_key)showPumpkin({...item,seasonal:true},key);
    } catch(err) {console.warn('Optional seasonal hunt unavailable',err);}
    finally{rolling=false;}
  }
  function tick() {
    try {
      const key=viewKey();
      if(key!==currentView){currentView=key;generation++;clearPumpkin();}
      if(key && key!==attemptedView && !rolling && !claiming && !dialog) void roll(key,generation);
    } catch(err) {console.warn('Optional Pumpkin Hunt check unavailable',err);}
  }
  // A separate timer observes completed navigation; challenge functions stay untouched.
  function start(){setTimeout(()=>{
    const pending=pendingLeafTicket();
    if(pending){showPendingLeafChoice(pending);}else tick();
    setInterval(tick,700);
  },1500);}
  function showPendingLeafChoice(ticketId){
    if(!session())return;
    dialog?.remove();dialog=document.createElement('div');dialog.id='rf-challenge-pumpkin-reward';
    dialog.style.cssText='position:fixed;inset:0;z-index:4900;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:18px';
    const card=document.createElement('div');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');
    card.style.cssText='width:min(100%,390px);max-height:88vh;overflow:auto;padding:18px;box-sizing:border-box;border-radius:16px;background:#fff8ed;color:#312718';
    card.append(element('h2','Finish your Gold Leaf Pokémon choice'));
    addLeafShinyChoice(card,ticketId);
    const close=element('button','Continue Challenge');close.type='button';close.onclick=()=>{dialog?.remove();dialog=null};
    card.append(close);dialog.append(card);document.body.append(dialog);
  }
  if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
