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
          <a id="rf-back-to-hub"
             href="https://thereadingfrenzy.com/"
             style="position:fixed;top:22px;right:18px;z-index:2147483647;
                    display:inline-flex;align-items:center;gap:8px;
                    padding:10px 14px;border-radius:999px;
                    background:rgba(34,47,41,.94);color:#fff;
                    font:700 13px/1.2 Arial,sans-serif;text-decoration:none;
                    box-shadow:0 8px 24px rgba(0,0,0,.18);
                    backdrop-filter:blur(8px)">
            ← Back to The Reading Frenzy
          </a>
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


              function applyHubAccountUi() {
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
