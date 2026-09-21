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
