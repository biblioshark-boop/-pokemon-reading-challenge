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

              function applyHubAccountUi() {
                removePokemonPublicSharingUi();
                removeLocalAdminControls();

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
