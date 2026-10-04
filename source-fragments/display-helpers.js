const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const title=s=>s.replaceAll("-"," ").replace(/\b\w/g,c=>c.toUpperCase());
function region(n){n=+n;if(n<=151)return"Kanto";if(n<=251)return"Johto";if(n<=386)return"Hoenn";if(n<=493)return"Sinnoh";if(n<=649)return"Unova";if(n<=721)return"Kalos";if(n<=809)return"Alola";if(n<=905)return"Galar";if(n<=1025)return"Paldea";return"Special"}
function form(n){if(n.endsWith("-alola"))return["Alolan","Alola"];if(n.endsWith("-galar"))return["Galarian","Galar"];if(n.endsWith("-hisui"))return["Hisuian","Hisui"];if(n.endsWith("-paldea"))return["Paldean","Paldea"];return null}

const image=id=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
function gridThumbSrc(src){
 const url=String(src||"").trim();
 if(!url||url.startsWith("data:")||url.startsWith("blob:"))return url;
 if(url.includes("wsrv.nl/"))return url;
 try{
   const stripped=url.replace(/^https?:\/\//,"");
   return `https://wsrv.nl/?url=${encodeURIComponent(stripped)}&w=180&h=180&fit=contain&output=webp&q=78`;
 }catch{
   return url;
 }
}