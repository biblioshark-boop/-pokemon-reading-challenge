// RF_WORKER_PATCH: Shared username management moved to Hub — 2026-09-26
// RF_WORKER_PATCH: Locked achievement progress — 2026-09-25
// RF_WORKER_PATCH: Restore Pokémon settings; narrow local admin-control hiding — 2026-09-25
// RF_WORKER_PATCH: Global admin controls + shared maintenance — 2026-09-25
// RF_WORKER_PATCH: Remove Pokémon Public Sharing UI — 2026-09-25
const SUPABASE_URL = "https://yamjfaacvewvrinxytep.supabase.co";
const SUPABASE_KEY = "sb_publishable_1NoVsY53V4CBFMg_i09Lcg_DCf8w_Lb";

function addSharedAuthShell(response) {
  return new HTMLRewriter()
    .on("head", {
      element(el) {
        el.append(`
          <style id="rf-shared-auth-gate">
            html{visibility:hidden}
          </style>
          <meta name="rf-hub-challenge-path" content="/pokemon/">
        `, { html: true });
      }
    })
    .on("body", {
      element(el) {
        el.append(`
          <style id="rf-pokemon-hub-topbar-visibility">
            #rf-hub-topbar{
              position:relative !important;
              display:flex !important;
              visibility:visible !important;
              opacity:1 !important;
              width:100% !important;
              min-height:46px !important;
              height:auto !important;
              box-sizing:border-box !important;
              z-index:2147483647 !important;
            }
            #rf-back-to-hub{
              display:inline-flex !important;
              visibility:visible !important;
              opacity:1 !important;
              color:#fff !important;
              background:rgba(255,255,255,.10) !important;
              text-decoration:none !important;
              font:700 13px/1.2 Arial,sans-serif !important;
            }
          </style>
          <div id="rf-hub-topbar"
               style="width:100%;box-sizing:border-box;
                      display:flex;justify-content:flex-end;align-items:center;
                      padding:8px 14px;background:#1f2f29;
                      border-bottom:1px solid rgba(255,255,255,.10)">
            <a id="rf-back-to-hub"
               href="https://thereadingfrenzy.com/"
               style="display:inline-flex;align-items:center;gap:8px;
                      padding:8px 12px;border-radius:999px;
                      background:rgba(255,255,255,.10);color:#fff;
                      font:700 13px/1.2 Arial,sans-serif;text-decoration:none;
                      border:1px solid rgba(255,255,255,.16)">
              ← Back to The Reading Frenzy
            </a>
          </div>
          <script>
            (() => {
              const hubBar = document.getElementById('rf-hub-topbar');
              if (hubBar && document.body.firstChild !== hubBar) {
                document.body.prepend(hubBar);
              }
            })();
          <\/script>
          <script>
            (() => {
              const SUPABASE_URL = "https://yamjfaacvewvrinxytep.supabase.co";
              const SUPABASE_KEY = "sb_publishable_1NoVsY53V4CBFMg_i09Lcg_DCf8w_Lb";
              let finished = false;

              function reveal() {
                if (finished) return;
                finished = true;
                document.getElementById('rf-shared-auth-gate')?.remove();
                document.documentElement.style.visibility = 'visible';
              }

              function returnToHub() {
                location.replace('/');
              }


              function removePokemonPublicSharingUi() {
                const shareTextPattern = /(?:public sharing|make (?:my |this )?(?:challenge|profile) public|share (?:my |this )?(?:challenge|profile)|public (?:challenge|profile|page)|copy public link|share link)/i;
                const shareAttrPattern = /(?:public[-_ ]?share|share[-_ ]?public|public[-_ ]?sharing)/i;

                document.querySelectorAll('button,a,label,summary,h2,h3,h4,strong,p,span,div,input,[role="button"]').forEach((node) => {
                  const text = (node.textContent || '').trim().replace(/\\s+/g, ' ');
                  const attrs = [
                    node.id || '',
                    node.className || '',
                    node.getAttribute?.('name') || '',
                    node.getAttribute?.('aria-label') || '',
                    node.getAttribute?.('title') || '',
                    node.getAttribute?.('value') || ''
                  ].join(' ');

                  if (!shareTextPattern.test(text) && !shareAttrPattern.test(attrs)) return;

                  const block =
                    node.closest?.(
                      'details,.settings-card,.setting-card,.settings-row,.setting-row,.profile-setting,.sharing-setting,.card,.panel,.section,li'
                    ) || node;

                  if (block && block.id !== 'rf-hub-topbar') {
                    block.style.setProperty('display', 'none', 'important');
                    block.setAttribute?.('aria-hidden', 'true');
                  }
                });
              }

              function removePokemonUsernameEditingUi() {
                const usernameAttrPattern=/(?:^|[-_ ])(?:user[-_ ]?name|username)(?:$|[-_ ])/i;
                const usernameActionPattern=/^(?:save|set|change|update|edit|choose)\s+(?:my\s+)?@?username$/i;

                document.querySelectorAll('input,textarea,button,[role="button"]').forEach((node)=>{
                  const attrs=[
                    node.id||'',
                    node.className||'',
                    node.getAttribute?.('name')||'',
                    node.getAttribute?.('aria-label')||'',
                    node.getAttribute?.('title')||'',
                    node.getAttribute?.('placeholder')||''
                  ].join(' ');
                  const text=(node.textContent||node.getAttribute?.('value')||'').trim().replace(/\s+/g,' ');

                  const isUsernameInput=(node.tagName==='INPUT'||node.tagName==='TEXTAREA')&&usernameAttrPattern.test(attrs);
                  const isUsernameAction=usernameActionPattern.test(text)||usernameAttrPattern.test(attrs)&&node.tagName==='BUTTON';
                  if(!isUsernameInput&&!isUsernameAction)return;

                  const block=node.closest?.(
                    '.settings-row,.setting-row,.profile-setting,.account-setting,.settings-card,.setting-card,.card,.panel,li'
                  )||node;
                  block.style.setProperty('display','none','important');
                  block.setAttribute?.('aria-hidden','true');
                });

                document.querySelectorAll('label').forEach((label)=>{
                  const text=(label.textContent||'').trim().replace(/\s+/g,' ');
                  const target=label.getAttribute('for')||'';
                  if(!/^@?username$/i.test(text)&&!usernameAttrPattern.test(target))return;
                  const block=label.closest?.(
                    '.settings-row,.setting-row,.profile-setting,.account-setting,.settings-card,.setting-card,.card,.panel,li'
                  )||label;
                  block.style.setProperty('display','none','important');
                  block.setAttribute?.('aria-hidden','true');
                });
              }

              function removeLocalAdminControls() {
                const exactLabels = new Set([
                  'site version',
                  'admin tools • site version',
                  'maintenance mode',
                  'admin tools • maintenance mode',
                  'test mode',
                  'admin tools • test mode'
                ]);
                const actionPattern = /^(?:check live version now|refresh live version|turn maintenance (?:on|off)|refresh maintenance(?: status)?|turn test mode (?:on|off)|refresh test mode(?: status)?)$/i;

                document.querySelectorAll('button,input[type="button"],input[type="submit"],summary,h2,h3,h4,strong,label').forEach((node) => {
                  const text=[
                    node.textContent||'',
                    node.getAttribute?.('aria-label')||'',
                    node.getAttribute?.('title')||'',
                    node.getAttribute?.('value')||''
                  ].join(' ').trim().replace(/\\s+/g,' ');
                  const normalized=text.toLowerCase();

                  if(actionPattern.test(text)){
                    node.style.setProperty('display','none','important');
                    node.setAttribute?.('aria-hidden','true');
                    return;
                  }

                  if(exactLabels.has(normalized)){
                    if(node.tagName==='SUMMARY'){
                      const details=node.closest('details');
                      if(details){
                        details.style.setProperty('display','none','important');
                        details.setAttribute('aria-hidden','true');
                        return;
                      }
                    }
                    node.style.setProperty('display','none','important');
                    node.setAttribute?.('aria-hidden','true');
                  }
                });
              }

              function ensureGlobalMaintenanceBanner() {
                let banner=document.getElementById('rf-global-maintenance-banner');
                if(!banner){
                  banner=document.createElement('div');
                  banner.id='rf-global-maintenance-banner';
                  banner.style.cssText='display:none;position:sticky;top:0;z-index:2147483646;padding:11px 16px;background:#fff3cd;color:#6b4f00;border-bottom:1px solid #e8ca72;text-align:center;font:800 13px/1.35 Arial,sans-serif';
                  document.body.prepend(banner);
                }
                return banner;
              }

              async function refreshGlobalMaintenance(client) {
                const banner=ensureGlobalMaintenanceBanner();
                try{
                  const {data,error}=await client.rpc('get_rf_site_maintenance');
                  if(error)throw error;
                  const row=Array.isArray(data)?data[0]:data;
                  const enabled=!!row?.enabled;
                  banner.textContent=row?.message||'Site maintenance is currently in progress. Some features may be temporarily unavailable.';
                  banner.style.display=enabled?'block':'none';
                }catch(err){
                  console.warn('Pokémon maintenance status unavailable',err);
                  banner.style.display='none';
                }
              }

              function rfLockedAchievementProgressText(title) {
                const safeCount=(fn)=>{try{return Math.max(0,Number(fn())||0)}catch{return 0}};
                const clamp=(value,total)=>Math.max(0,Math.min(total,Number(value)||0));
                const simple=(value,total)=>String(clamp(value,total))+' / '+String(total);

                const milestoneTargets={
                  'First Catch':1,
                  'Poke Collector':10,
                  'Growing Collection':25,
                  'Pokedex Builder':50,
                  'Century Club':100
                };
                if(Object.prototype.hasOwnProperty.call(milestoneTargets,title) &&
                   typeof achievementCaughtCount==='function'){
                  const total=milestoneTargets[title];
                  return simple(safeCount(()=>achievementCaughtCount()),total);
                }

                const typeMatch=String(title||'').match(/^(Normal|Water|Grass|Flying|Bug|Poison|Fire|Electric|Fighting|Ground|Rock|Psychic|Dark|Ice|Ghost|Steel|Fairy|Dragon) Collector$/);
                if(typeMatch && typeof achievementCaughtPrimaryTypeCount==='function'){
                  return simple(safeCount(()=>achievementCaughtPrimaryTypeCount(typeMatch[1])),10);
                }

                if(title==='Safari Specialist' && typeof achievementSafariCaughtCount==='function'){
                  return simple(safeCount(()=>achievementSafariCaughtCount()),20);
                }

                const shinyTargets={
                  'Shiny Start':1,
                  'Shiny Hunter':3,
                  'Shiny Collector':5,
                  'Shiny Specialist':10
                };
                if(Object.prototype.hasOwnProperty.call(shinyTargets,title) &&
                   typeof achievementShinyCaughtCount==='function'){
                  const total=shinyTargets[title];
                  return simple(safeCount(()=>achievementShinyCaughtCount()),total);
                }

                const gymTargets={
                  'First Badge':1,
                  'Gym Challenger':3,
                  'Gym Veteran':8,
                  'Badge Collector':16
                };
                if(Object.prototype.hasOwnProperty.call(gymTargets,title) &&
                   typeof achievementGymClearedCount==='function'){
                  const total=gymTargets[title];
                  return simple(safeCount(()=>achievementGymClearedCount()),total);
                }

                if(title==='League Ready' &&
                   typeof achievementGymClearedCount==='function' &&
                   typeof gymsData!=='undefined' &&
                   Array.isArray(gymsData) &&
                   gymsData.length){
                  return simple(safeCount(()=>achievementGymClearedCount()),gymsData.length);
                }

                return '';
              }

              function applyLockedAchievementProgress() {
                document.querySelectorAll('.achievement-card:not(.is-claimed)').forEach((card) => {
                  const lockcopy=card.querySelector('.achievement-card-lockcopy');
                  if(!lockcopy)return;

                  const title=String(
                    card.dataset?.achievementTitle ||
                    lockcopy.querySelector('strong')?.textContent ||
                    ''
                  ).trim();
                  if(!title)return;

                  // Trainer Team cards already have their own exact roster progress.
                  if(/team Pokémon caught/i.test(lockcopy.textContent||''))return;

                  const progress=rfLockedAchievementProgressText(title);
                  let node=lockcopy.querySelector('.rf-locked-achievement-progress');

                  if(!progress){
                    node?.remove();
                    return;
                  }

                  if(!node){
                    node=document.createElement('span');
                    node.className='rf-locked-achievement-progress';
                    node.style.cssText='display:block;margin-top:6px;font-weight:900;font-size:12px;line-height:1.2;color:#fff';
                    lockcopy.appendChild(node);
                  }
                  if(node.textContent!==progress)node.textContent=progress;
                });
              }

              function applyHubAccountUi() {
                removePokemonPublicSharingUi();
                removePokemonUsernameEditingUi();
                removeLocalAdminControls();
                applyLockedAchievementProgress();

                document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]').forEach((node) => {
                  const text = [
                    node.textContent || '',
                    node.getAttribute('aria-label') || '',
                    node.getAttribute('title') || '',
                    node.id || '',
                    node.className || '',
                    node.getAttribute('name') || '',
                    node.getAttribute('value') || ''
                  ].join(' ').replace(/\\s+/g, ' ').toLowerCase();

                  if (
                    text.includes('logout') ||
                    text.includes('log out') ||
                    text.includes('sign out')
                  ) {
                    node.style.setProperty('display', 'none', 'important');
                    node.setAttribute('aria-hidden', 'true');
                  }
                });

                const removeQuestions = [
                  'i found a bug or need help. what should i do?',
                  'where can i send suggestions?',
                  'how do i request a team change?'
                ];

                document.querySelectorAll('summary,button,h3,h4,strong').forEach((node) => {
                  const label = (node.textContent || '').trim().replace(/\\s+/g, ' ').toLowerCase();
                  if (!removeQuestions.includes(label)) return;
                  const block = node.closest('details,.faq-item,.faq-entry,.accordion-item,li') || node.parentElement;
                  if (block) block.remove();
                });

                const discordLink = Array.from(document.querySelectorAll('a,button')).find((node) =>
                  /join the reading frenzy discord/i.test((node.textContent || '').trim())
                );

                if (discordLink && !document.getElementById('rf-hub-contact-faq-note')) {
                  const note = document.createElement('div');
                  note.id = 'rf-hub-contact-faq-note';
                  note.textContent = 'If you need help, have a question, or need to report an issue, you can also use the Contact button/form located at the bottom of The Reading Frenzy main hub page.';
                  note.style.marginTop = '12px';
                  note.style.padding = '12px 14px';
                  note.style.borderRadius = '12px';
                  note.style.background = 'rgba(255,255,255,.55)';
                  note.style.lineHeight = '1.55';
                  discordLink.insertAdjacentElement('afterend', note);
                }
              }

              function loadSupabase() {
                return new Promise((resolve, reject) => {
                  if (window.supabase?.createClient) return resolve(window.supabase);
                  const s = document.createElement('script');
                  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                  s.onload = () => resolve(window.supabase);
                  s.onerror = reject;
                  document.head.appendChild(s);
                });
              }

              const safety = setTimeout(() => {
                console.warn('Shared-auth check timed out.');
                returnToHub();
              }, 6000);

              loadSupabase()
                .then(async (sdk) => {
                  const client = sdk.createClient(SUPABASE_URL, SUPABASE_KEY, {
                    auth: {
                      persistSession: true,
                      autoRefreshToken: true,
                      detectSessionInUrl: true
                    }
                  });

                  const RF_AUTH_CUTOVER_COOKIE = 'rf_auth_cutover_2026_09_21_v2';
                  const hasCutoverCookie = document.cookie.split(';').some(
                    part => part.trim() === RF_AUTH_CUTOVER_COOKIE + '=1'
                  );

                  if (!hasCutoverCookie) {
                    const prefix = 'sb-yamjfaacvewvrinxytep-auth-token';
                    for (const storage of [window.localStorage, window.sessionStorage]) {
                      try {
                        for (let i = storage.length - 1; i >= 0; i--) {
                          const key = storage.key(i);
                          if (key && key.startsWith(prefix)) storage.removeItem(key);
                        }
                      } catch (err) {
                        console.warn('Pokémon auth storage cleanup failed', err);
                      }
                    }
                    try {
                      await client.auth.signOut({ scope: 'local' });
                    } catch (err) {
                      console.warn('Pokémon local auth cutover cleanup failed', err);
                    }
                    document.cookie = RF_AUTH_CUTOVER_COOKIE + '=1; Max-Age=31536000; Path=/; SameSite=Lax; Secure';
                    clearTimeout(safety);
                    returnToHub();
                    return;
                  }

                  const { data, error } = await client.auth.getSession();
                  if (error) console.warn('Shared session check failed', error);

                  if (!data?.session) {
                    clearTimeout(safety);
                    returnToHub();
                    return;
                  }

                  applyHubAccountUi();
                  await refreshGlobalMaintenance(client);
                  setInterval(()=>refreshGlobalMaintenance(client),30000);
                  const hubUiObserver = new MutationObserver(applyHubAccountUi);
                  hubUiObserver.observe(document.body, { childList: true, subtree: true });

                  client.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_OUT' || !session) returnToHub();
                  });

                  clearTimeout(safety);
                  reveal();
                })
                .catch((error) => {
                  console.warn('Could not initialize shared auth', error);
                  clearTimeout(safety);
                  returnToHub();
                });
            })();
          <\/script>
        `, { html: true });
      }
    })
    .transform(response);
}

async function servePokemon(request, env, pathname) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) return addSharedAuthShell(response);
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/pokemon") {
      return Response.redirect(url.origin + "/pokemon/", 301);
    }

    if (url.pathname === "/pokemon/") {
      return servePokemon(request, env, "/");
    }

    if (url.pathname.startsWith("/pokemon/")) {
      return servePokemon(request, env, url.pathname.slice("/pokemon".length) || "/");
    }

    return env.ASSETS.fetch(request);
  }
};
