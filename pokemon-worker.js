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

                if (!document.getElementById('rf-hub-contact-faq-note')) {
                  const faqCandidates = Array.from(document.querySelectorAll('[id*="faq" i],[class*="faq" i]'));
                  const faqHost = faqCandidates.find((node) => /discord/i.test(node.textContent || '')) || faqCandidates[0];
                  if (faqHost) {
                    const note = document.createElement('p');
                    note.id = 'rf-hub-contact-faq-note';
                    note.textContent = 'If you need help, have a question, or need to report an issue, you can also use the Contact button/form located at the bottom of The Reading Frenzy main hub page.';
                    note.style.marginTop = '12px';
                    note.style.lineHeight = '1.55';
                    faqHost.appendChild(note);
                  }
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
                reveal();
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
                  reveal();
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
