const TEAM_CHEERS={
 generic:[
  ["generic_go_team","megaphone","Go Team!"],
  ["generic_nice_catch","sparkles","Nice Catch!"],
  ["generic_gym_crusher","trophy","Gym Crusher!"],
  ["generic_keep_reading","book","Keep Reading!"]
 ],
 "aether-foundation":[
  ["aether_safe","shield_star","Keep the Pokémon Safe!"],
  ["aether_love","heart","Love = Pokémon"],
  ["aether_stand","shield","Stand Firm!"],
  ["aether_go","arrow","Aether Go!"]
 ],
 "poke-dolls":[
  ["dolls_great_job","stitched_heart","Great Job!"],
  ["dolls_forever","bow","PokeDolls 4 Ever"],
  ["dolls_lover","patch_heart","Lover Not a Fighter"]
 ],
 "pokemon-rangers":[
  ["rangers_protect","tree_shield","Protect Pokémon!"],
  ["rangers_nature","leaf","Nature = Love"],
  ["rangers_explore","compass","Protect. Explore. Read."],
  ["rangers_harmony","paw","In Harmony, We Grow!"]
 ],
 "team-aqua":[
  ["aqua_waves","wave","Make Some Waves!"],
  ["aqua_swimming","drop","Keep Swimming, Team Aqua!"],
  ["aqua_tide","shell","The Tide is Turning"],
  ["aqua_high_tide","whirlpool","High Tide Energy"]
 ],
 "team-galactic":[
  ["galactic_beyond","shooting_star","Reach Beyond the Stars!"],
  ["galactic_stellar","planet","Stellar Work"],
  ["galactic_victory","cosmic_spark","Cosmic Victory"],
  ["galactic_shine","galaxy","Shine, Galactic!"]
 ],
 "team-magma":[
  ["magma_heat","flame","Turn Up the Heat!"],
  ["magma_rising","volcano","Magma Rising"],
  ["magma_streak","hot_rock","Hot Streak!"],
  ["magma_stop","lava","Too Hot to Stop!"]
 ],
 "team-plasma":[
  ["plasma_rising","bolt","Plasma Rising"],
  ["plasma_purpose","shield","Power with Purpose"],
  ["plasma_approved","energy_orb","Plasma Approved"],
  ["plasma_energy","chevrons","Team Plasma Energy"]
 ],
 "team-rocket":[
  ["rocket_blasting","rocket","Blasting Off Again!"],
  ["rocket_limits","star","No Limits, Team Rocket"],
  ["rocket_energy","bolt","Rocket Energy"],
  ["rocket_menace","burst","Absolute Menace"]
 ],
 "team-skull":[
  ["skull_chaos","spray","Cause Some Chaos!"],
  ["skull_rowdy","bones","Keep it Rowdy!"],
  ["skull_rebel","jagged_star","Rebel Energy"],
  ["skull_loud","megaphone","Too Loud to Ignore"]
 ],
 "team-yell":[
  ["yell_noise","megaphone","Make Some Noise!"],
  ["yell_up","bolt","Turn It Up!"],
  ["yell_volume","speaker","Full Volume"],
  ["yell_louder","soundwave","Yell it Louder!"]
 ]
};


TEAM_CHEERS["team-star"]=[
 ["star_starfall","shooting_star","Operation Starfall!"],
 ["star_shine","star","Shine On, Team Star!"],
 ["star_power","cosmic_spark","Star Power!"],
 ["star_vistar","sparkles","Hasta la vistar!"]
];
function cheerIconSvg(type){
 const a='fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"';
 const icons={
  megaphone:`<path ${a} d="M4 13v-2l10-4v10L4 13Zm10-4 4-2v10l-4-2M6 13l1 5h4l-2-5"/>`,
  sparkles:`<path ${a} d="M12 3l1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3Zm6 10 .7 2.1L21 16l-2.3.9L18 19l-.7-2.1L15 16l2.3-.9L18 13ZM5 4l.6 1.8L7.5 6.5l-1.9.7L5 9l-.6-1.8-1.9-.7 1.9-.7L5 4Z"/>`,
  trophy:`<path ${a} d="M8 4h8v4c0 3-1.6 5-4 5s-4-2-4-5V4Zm0 2H5v2c0 2 1 3 3 3m8-5h3v2c0 2-1 3-3 3M12 13v4m-4 3h8m-6-3h4"/>`,
  book:`<path ${a} d="M4 5c3-1 5-.6 8 1v13c-3-1.6-5-2-8-1V5Zm16 0c-3-1-5-.6-8 1v13c3-1.6 5-2 8-1V5Z"/>`,
  shield_star:`<path ${a} d="M12 3 19 6v5c0 4.6-2.7 7.8-7 10-4.3-2.2-7-5.4-7-10V6l7-3Zm0 5 1 2.2 2.5.2-1.9 1.6.6 2.4-2.2-1.3-2.2 1.3.6-2.4-1.9-1.6 2.5-.2L12 8Z"/>`,
  heart:`<path ${a} d="M12 20S4 15.4 4 9.3C4 6.4 7.6 5 9.5 7.2L12 10l2.5-2.8C16.4 5 20 6.4 20 9.3 20 15.4 12 20 12 20Z"/>`,
  shield:`<path ${a} d="M12 3 19 6v5c0 4.6-2.7 7.8-7 10-4.3-2.2-7-5.4-7-10V6l7-3Z"/>`,
  arrow:`<path ${a} d="M4 12h14m-5-5 5 5-5 5"/>`,
  stitched_heart:`<path ${a} d="M12 20S4 15.4 4 9.3C4 6.4 7.6 5 9.5 7.2L12 10l2.5-2.8C16.4 5 20 6.4 20 9.3 20 15.4 12 20 12 20Z M9 15l6-6m-4 1 2 2m-5 1 2 2"/>`,
  bow:`<path ${a} d="M12 12c-3-4-7-5-8-2-1 3 2 5 8 3m0-1c3-4 7-5 8-2 1 3-2 5-8 3m-2-2h4v4h-4zM9 15l-2 5m8-5 2 5"/>`,
  patch_heart:`<path ${a} d="M12 20S4 15.4 4 9.3C4 6.4 7.6 5 9.5 7.2L12 10l2.5-2.8C16.4 5 20 6.4 20 9.3 20 15.4 12 20 12 20Zm-6-7 2-1m8 4 2-1M9 6l1 2m5-1-1 2"/>`,
  tree_shield:`<path ${a} d="M12 3 19 6v5c0 4.6-2.7 7.8-7 10-4.3-2.2-7-5.4-7-10V6l7-3Zm0 4-3 5h2l-2 3h6l-2-3h2l-3-5Zm0 8v2"/>`,
  leaf:`<path ${a} d="M20 4C12 4 6 7 5 14c4 1 8 0 11-3 2-2 3-4 4-7ZM5 19c3-5 7-8 12-11"/>`,
  compass:`<circle ${a} cx="12" cy="12" r="8"/><path ${a} d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>`,
  paw:`<path ${a} d="M8 13c-3 2-3 6 0 7 2 .6 3-1 4-1s2 1.6 4 1c3-1 3-5 0-7-2-1-2-4-4-4s-2 3-4 4ZM7 8c-1 0-2-1.2-2-2.5S6 3 7 3s2 1.2 2 2.5S8 8 7 8Zm10 0c-1 0-2-1.2-2-2.5S16 3 17 3s2 1.2 2 2.5S18 8 17 8Z"/>`,
  wave:`<path ${a} d="M3 14c3-6 7-8 11-6 3 1 4 4 7 3-1 5-5 8-10 8-4 0-7-2-8-5Zm3 1c3 1 5 0 7-2"/>`,
  drop:`<path ${a} d="M12 3S6 10 6 14a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/>`,
  shell:`<path ${a} d="M4 17c0-6 3-10 8-10s8 4 8 10H4Zm8-10v10M8 9l2 8m6-8-2 8M5 13h14"/>`,
  whirlpool:`<path ${a} d="M4 12c0-5 5-8 10-6 5 2 6 8 2 11-4 4-11 2-11-3 0-4 5-6 8-4 3 2 1 6-2 5-2 0-3-1-3-2"/>`,
  shooting_star:`<path ${a} d="m16 4 1.3 3.2L21 8l-2.8 2.2.8 3.5-3-1.8-3 1.8.8-3.5L11 8l3.7-.8L16 4ZM3 18l8-6M3 13l6-4"/>`,
  planet:`<circle ${a} cx="12" cy="12" r="4"/><path ${a} d="M3 14c3 2 7 2 11 0s7-5 7-7c-3-2-7-2-11 0S3 12 3 14Z"/>`,
  cosmic_spark:`<path ${a} d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Zm7 12 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>`,
  galaxy:`<path ${a} d="M4 13c2-6 9-9 14-6 5 3 2 9-3 11-5 2-10 0-9-4 1-3 6-4 9-2 2 2 0 4-2 4"/>`,
  flame:`<path ${a} d="M12 21c-4 0-7-3-7-7 0-3 2-5 5-8 0 3 2 4 3 5 1-3 1-5 0-8 4 3 6 6 6 10 0 5-3 8-7 8Zm0-2c2 0 3-2 3-4 0-1-1-3-2-4 0 2-1 3-2 4 0-1-1-2-2-3-1 3 0 7 3 7Z"/>`,
  volcano:`<path ${a} d="M4 20 9 8h6l5 12H4Zm6-12 2 2 2-2m-7 8h10M10 5l2-2 2 2"/>`,
  hot_rock:`<path ${a} d="M7 7 15 5l4 6-3 8H8l-4-6 3-6Zm3 1 3 3-2 3 3 3"/>`,
  lava:`<path ${a} d="M4 18c3-5 5-7 8-7s5 2 8 7H4Zm4-7 2-5 2 4 2-6 2 7"/>`,
  bolt:`<path ${a} d="m13 2-8 12h6l-1 8 9-13h-6V2Z"/>`,
  energy_orb:`<circle ${a} cx="12" cy="12" r="7"/><circle ${a} cx="12" cy="12" r="3"/><path ${a} d="M12 2v3m0 14v3M2 12h3m14 0h3"/>`,
  chevrons:`<path ${a} d="m5 8 7 5 7-5M5 13l7 5 7-5"/>`,
  rocket:`<path ${a} d="M14 4c3-2 5-2 6-2 0 1 0 3-2 6l-5 5-4-4 5-5Zm-5 5-4 1-2 3 6 1m4-1 1 6 3-2 1-4M8 16l-3 3m5-2-2 4"/>`,
  star:`<path ${a} d="m12 3 2.5 5.5 6 .6-4.5 4 1.3 5.9-5.3-3-5.3 3 1.3-5.9-4.5-4 6-.6L12 3Z"/>`,
  burst:`<path ${a} d="m12 3 2 5 5-2-2 5 5 2-5 2 2 5-5-2-2 5-2-5-5 2 2-5-5-2 5-2-2-5 5 2 2-5Z"/>`,
  spray:`<path ${a} d="M7 8h9v12H7V8Zm2-3h5l2 3H7l2-3Zm7 1 4-2m-4 5 5-1"/>`,
  bones:`<path ${a} d="M7 7 17 17M17 7 7 17M5 5c-2-2-4 1-2 3 1 1 2 0 3-1m13-2c2-2 4 1 2 3-1 1-2 0-3-1M5 19c-2 2-4-1-2-3 1-1 2 0 3 1m13 2c2 2 4-1 2-3-1-1-2 0-3 1"/>`,
  jagged_star:`<path ${a} d="m12 3 2 5 5-2-2 5 4 3-5 1 1 5-5-3-4 4 1-5-6-1 5-3-3-4 5 1 4-4Z"/>`,
  speaker:`<path ${a} d="M5 9h4l5-4v14l-5-4H5V9Zm12 1c2 1 2 3 0 4m2-7c4 3 4 7 0 10"/>`,
  soundwave:`<path ${a} d="M4 10v4m3-7v10m3-13v16m4-14v12m3-9v6m3-3v1"/>`
 };
 return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[type]||icons.sparkles}</svg>`;
}
