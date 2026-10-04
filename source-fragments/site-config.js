const REGIONS=["Kanto","Johto","Hoenn","Sinnoh","Unova","Kalos","Alola","Galar","Hisui","Paldea","Pokopia","Special"];
const THEMES={Kanto:["#f5eee7","#fffaf4","#eadfd4","#271f1d","#75655f","#b91c1c","#7f1d1d","#d6c5b9"],Johto:["#f5f0df","#fffaf0","#ebe1bc","#29251b","#776d4e","#b8860b","#705c0b","#d9c98e"],Hoenn:["#e9f4ef","#f7fffb","#d7ebe2","#16372c","#527164","#16856a","#176b87","#bad8cc"],Sinnoh:["#edf1f6","#fbfdff","#dbe3ec","#192738","#607080","#496886","#263e59","#c4d0dc"],Unova:["#eeeeee","#ffffff","#dedede","#141414","#666","#222","#555","#c8c8c8"],Kalos:["#eef0f8","#fafbff","#dfe3f2","#222944","#68708c","#334b9b","#b28c2f","#c7cde0"],Alola:["#fff5df","#fffdf7","#f5e7bb","#3e3018","#806e43","#e88932","#2c8e8b","#e5d29d"],Galar:["#f2edf3","#fffaff","#e5d9e8","#332437","#77627d","#7c3b83","#253f74","#d2bfd6"],Hisui:["#eee8da","#faf6eb","#ddd2bd","#2f3027","#777562","#6d7751","#474f38","#c8bba3"],Paldea:["#f8eadc","#fff9f2","#efd7bf","#3a271d","#876955","#c56038","#6d438b","#dfc2a8"],Special:["#eeeef5","#fafaff","#ddddec","#24243a","#68687d","#5f5fb2","#393971","#c8c8dc"]};
const TEAM_THEMES={
"team-rocket":["#f4e7e7","#fff8f8","#ead7d7","#261b1b","#756060","#d9272e","#1f1f1f","#d9bcbc"],
"team-plasma":["#edf1f5","#fbfcfe","#dce3ea","#202733","#657080","#4f5d75","#8997a8","#c6d0db"],
"team-aqua":["#e7f1ff","#f8fbff","#d5e6fb","#142844","#58708d","#1f6feb","#0b3d91","#b8d0ec"],
"team-magma":["#f8e9e6","#fff9f7","#efd8d3","#341d19","#85645f","#c94b40","#7a1f1f","#ddbdb7"],
"team-galactic":["#efebf7","#fbf9ff","#e2d9f0","#28223a","#70657f","#6e59a5","#2f2a4a","#cbbfe0"],
"pokemon-rangers":["#fbefe7","#fffaf6","#f2ddcf","#35231a","#80675a","#e86a33","#8a2f1b","#e3c4b2"],
"aether-foundation":["#faf5df","#fffdf4","#efe5b7","#342f1b","#7d7351","#c7a227","#8e7420","#e1d39b"],
"poke-dolls":["#faeaf3","#fff8fc","#efd7e5","#38212e","#856578","#d96aa7","#7e3a63","#dfbdd1"],
"team-flare":["#f9e9e4","#fff8f5","#efd5cd","#331a14","#835e53","#e95420","#70210e","#dfb9ad"],
"team-skull":["#f0e9f5","#fcf8ff","#e4d6ed","#25172d","#76617f","#71308c","#ec3fa0","#cdb9d8"],
"team-yell":["#fae7f2","#fff7fb","#efd2e2","#2d1723","#825f72","#cf3e8e","#121212","#ddb7cc"]
};
TEAM_THEMES["team-star"]=["#f3e9ff","#fffaff","#e7d9f5","#261733","#785f84","#f97316","#6d28d9","#d8c3e6"];

const DEFAULT_GENRES=["Horror","Thriller","Science Fiction","Fantasy","Mystery","Romance","Contemporary","Historical Fiction","Nonfiction","Graphic Novel / Manga"];