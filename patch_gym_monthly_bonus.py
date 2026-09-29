from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

old='''await saveNow();
await logTeamCatchForPokemon(p,e,title);
const gymBonus=await syncMyTeamBonusForPokemon(p,true);'''

new='''await saveNow();
await logTeamCatchForPokemon(p,e,title);
await syncMonthlyBonusForPokemon(p,true);
const gymBonus=await syncMyTeamBonusForPokemon(p,true);'''

count=text.count(old)
if count != 1:
    raise SystemExit(f"Expected exactly one Gym catch sync block, found {count}")

patched=text.replace(old,new,1)

if patched.count("await syncMonthlyBonusForPokemon(p,true);") < 1:
    raise SystemExit("Monthly bonus sync call was not added")

path.write_text(patched,encoding="utf-8")
print("Patched Gym-to-Pokedex monthly bonus sync.")
