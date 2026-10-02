/* RF_CHALLENGE_PUMPKINS: 20261002181500 — optional live browse overlay. */
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
    if (url.origin !== new URL(HUB).origin || !url.pathname.startsWith('/assets/images/events/pumpkin-hunt-2026/')) throw new Error('Unexpected pumpkin image.');
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
  function showReward(result) {
    dialog?.remove();
    dialog = document.createElement('div');dialog.id='rf-challenge-pumpkin-reward';
    dialog.style.cssText='position:fixed;inset:0;z-index:4900;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box';
    const card=document.createElement('div');
    card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label','Pumpkin reward');
    card.style.cssText='width:100%;max-width:380px;max-height:85vh;overflow:auto;padding:22px;box-sizing:border-box;border-radius:20px;background:#fff8ed;color:#312718;text-align:center;font:16px/1.4 Arial,sans-serif';
    const image=document.createElement('img');image.src=asset(result.asset_path);image.alt=result.display_name||'Pumpkin';image.style.cssText='width:110px;height:110px;object-fit:contain';
    card.append(image,element('h2',result.rarity==='gold'?'You found a Golden Pumpkin!':'Pumpkin found!'),element('p',result.display_name||'Pumpkin'),element('p','+'+(Number(result.points_awarded)||0)+' Reading Frenzy Points'),element('p',result.is_new?'Added to your Collectibles.':'You already own this pumpkin, but still receive its reward.'));
    if (Number(result.find_count)>1) card.append(element('p','Found '+result.find_count+' times.'));
    if (result.shiny_ticket_id) {
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
      const result=await rpc('claim_rf_pumpkin_browse_spawn',{p_spawn_key:item.spawn_key});
      if (!result?.collectible_key) throw new Error('Could not confirm the pumpkin reward.');
      clearPumpkin();showReward(result);
    } catch (err) {
      console.warn('Pumpkin claim unavailable',err);
      if(button.isConnected){button.disabled=false;button.setAttribute('aria-label',err.message+' Click to retry.');}
    } finally {claiming=false;}
  }
  async function roll(key, version) {
    rolling=true;attemptedView=key;
    const navigationType=initial&&performance.getEntriesByType('navigation')[0]?.type==='reload'?'reload':'navigate';initial=false;
    try {
      const item=await rpc('roll_rf_pumpkin_browse_spawn',{p_navigation_type:navigationType});
      if(version!==generation || key!==currentView || viewKey()!==key) return;
      if(item?.spawned&&item.spawn_key)showPumpkin(item,key);
    } catch(err) {console.warn('Optional Pumpkin Hunt unavailable',err);}
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
  function start(){setTimeout(()=>{tick();setInterval(tick,700);},1500);}
  if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
