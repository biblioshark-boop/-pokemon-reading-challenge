from pathlib import Path
import base64
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "index.html"
ASSET_SOURCE = ROOT / "assets"
DIST = ROOT / "dist"
DIST_ASSETS = DIST / "assets"
MAX_CF_ASSET = 25 * 1024 * 1024

MIME_EXT = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
    "application/font-woff": ".woff",
    "application/font-woff2": ".woff2",
}

DATA_URI = re.compile(
    r"data:(?P<mime>(?:image|font|application)/[A-Za-z0-9.+-]+);base64,(?P<data>[A-Za-z0-9+/=\\r\\n]+)"
)

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def rel_web(path: Path) -> str:
    return path.relative_to(DIST).as_posix()

def main():
    if not SOURCE.exists():
        raise SystemExit("ERROR: index.html was not found.")

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    if ASSET_SOURCE.exists():
        shutil.copytree(ASSET_SOURCE, DIST_ASSETS)
    else:
        DIST_ASSETS.mkdir(parents=True, exist_ok=True)

    existing = {}
    for p in DIST_ASSETS.rglob("*"):
        if not p.is_file():
            continue
        size = p.stat().st_size
        if size > MAX_CF_ASSET:
            raise SystemExit(
                f"ERROR: Existing asset exceeds Cloudflare's 25 MiB limit: {rel_web(p)} ({size / 1024 / 1024:.1f} MiB)"
            )
        try:
            existing[sha256_bytes(p.read_bytes())] = rel_web(p)
        except OSError:
            pass

    text = SOURCE.read_text(encoding="utf-8")

    # Keep static catalogs at their original script positions without browser requests.
    for filename, constant in [
        ("team-trainer-characters.js", "TEAM_TRAINER_CHARACTERS"),
        ("leader-character-art.js", "LEADER_CHARACTER_ART"),
        ("team-card-banners.js", "TEAM_CARD_BANNERS"),
    ]:
        marker = f"/* RF_INCLUDE:source-fragments/{filename} */"
        if text.count(marker) != 1:
            raise SystemExit(f"Expected exactly one source fragment marker: {filename}")
        fragment = (ROOT / "source-fragments" / filename).read_text(encoding="utf-8")
        prefix = f"const {constant}="
        if not fragment.startswith(prefix) or not fragment.endswith(";"):
            raise SystemExit(f"Invalid static catalog declaration: {filename}")
        json.loads(fragment[len(prefix):-1])
        text = text.replace(marker, fragment)
    if "/* RF_INCLUDE:" in text:
        raise SystemExit("Unknown source fragment marker")

    # Preserve the original anonymous base style element and its position.
    base_style = re.search(r'(<style>)([\s\S]*?)(</style>)', text)
    if not base_style or base_style.group(2) != "/* RF_CSS_INCLUDE:styles/base.css */":
        raise SystemExit("ERROR: Expected exact base stylesheet include marker.")
    base_css = (ROOT / "styles" / "base.css").read_text(encoding="utf-8")
    text = text[:base_style.start(2)] + base_css + text[base_style.end(2):]

    # Reinsert extracted styles in their exact original cascade positions.
    for style_id, filename in [
        ("dexDetailPrevNext20260818", "dex-detail-navigation.css"),
        ("teamPageBackgroundsVisible20260818", "team-page-backgrounds.css"),
        ("safariZoneSparseFix20260818", "safari-zone.css"),
        ("badgeCaseGymTheme20260818", "badge-case.css"),
        ("teamStarPatch84", "team-star.css"),
        ("gymStadiumBackground20260818", "gym-stadium-background.css"),
    ]:
        css_pattern = re.compile(r'(<style id="' + re.escape(style_id) + r'">)([\s\S]*?)(</style>)')
        css_matches = list(css_pattern.finditer(text))
        if len(css_matches) != 1:
            raise SystemExit(f"ERROR: Expected exactly one stylesheet: {style_id}")
        css_match = css_matches[0]
        marker = f"/* RF_CSS_INCLUDE:styles/{filename} */"
        if css_match.group(2) != marker:
            raise SystemExit(f"ERROR: Expected exact CSS include marker: {style_id}")
        css = (ROOT / "styles" / filename).read_text(encoding="utf-8")
        text = text[:css_match.start(2)] + css + text[css_match.end(2):]
    # Preserve each remaining style element, including anonymous late overrides.
    for attributes, path in [
        (" id=\"siteThemePatch267\"", "styles/sections/site-theme-patch267.css"),
        (" id=\"mobileSafariEncounterTextContrast20260916\"", "styles/sections/mobile-safari-encounter-text-contrast.css"),
        (" id=\"darkSafariEncounterContrast20260916\"", "styles/sections/dark-safari-encounter-contrast.css"),
        (" id=\"lockedRegressionRecovery20260819\"", "styles/sections/locked-regression-recovery.css"),
        (" id=\"gymTheme20260818\"", "styles/sections/gym-theme.css"),
        (" id=\"gymHeroThemeSafe20260818\"", "styles/sections/gym-hero-theme-safe.css"),
        (" id=\"gymTypePillLayoutFix20260818\"", "styles/sections/gym-type-pill-layout-fix.css"),
        (" id=\"adminMembers20260818\"", "styles/sections/admin-members.css"),
        (" id=\"usernameLockAndAdminEditor20260818\"", "styles/sections/username-lock-and-admin-editor.css"),
        (" id=\"gymUncaughtRule20260818\"", "styles/sections/gym-uncaught-rule.css"),
        (" id=\"teamOneChoiceLock20260818\"", "styles/sections/team-one-choice-lock.css"),
        (" id=\"trainerCardHome20260818\"", "styles/sections/trainer-card-home.css"),
        (" id=\"teamCharacterTrainerCard20260818\"", "styles/sections/team-character-trainer-card.css"),
        (" id=\"trainerCardInlineEditUsernameOnce20260818\"", "styles/sections/trainer-card-inline-edit-username-once.css"),
        (" id=\"trainerCardUniversalPhoneFit20260819\"", "styles/sections/trainer-card-universal-phone-fit.css"),
        (" id=\"adminPokemonQuickEdit20260819\"", "styles/sections/admin-pokemon-quick-edit.css"),
        (" id=\"recoveryAdminTeamLeaderGold20260818\"", "styles/sections/recovery-admin-team-leader-gold.css"),
        (" id=\"adminUserCardPreview20260818\"", "styles/sections/admin-user-card-preview.css"),
        (" id=\"teamStatsOverhaul20260818\"", "styles/sections/team-stats-overhaul.css"),
        (" id=\"teamStatsReadabilityFix20260818\"", "styles/sections/team-stats-readability-fix.css"),
        (" id=\"teamRankCardsConsistent20260818\"", "styles/sections/team-rank-cards-consistent.css"),
        (" id=\"authPasswordVisibility20260818\"", "styles/sections/auth-password-visibility.css"),
        (" id=\"passwordRecoveryFix20260820\"", "styles/sections/password-recovery-fix.css"),
        (" id=\"planned-catching-styles\"", "styles/sections/planned-catching-styles.css"),
        (" id=\"fan-disclaimer-styles\"", "styles/sections/fan-disclaimer-styles.css"),
        (" id=\"required-team-selection-styles\"", "styles/sections/required-team-selection-styles.css"),
        (" id=\"login-load-overlay-styles\"", "styles/sections/login-load-overlay-styles.css"),
        (" id=\"dex-image-performance-styles\"", "styles/sections/dex-image-performance-styles.css"),
        (" id=\"dex-compact-batch-styles\"", "styles/sections/dex-compact-batch-styles.css"),
        (" id=\"auth-inline-disclaimer-styles\"", "styles/sections/auth-inline-disclaimer-styles.css"),
        (" id=\"myTeamStage1Styles20260824\"", "styles/sections/my-team-stage1-styles.css"),
        (" id=\"patch62PokedexQoL\"", "styles/sections/patch62-pokedex-qo-l.css"),
        (" id=\"manualAdminBonuses20260825\"", "styles/sections/manual-admin-bonuses.css"),
        (" id=\"specialTrainerBadges20260826\"", "styles/sections/special-trainer-badges.css"),
        (" id=\"patch115UnifiedTrainerBadgeSizing\"", "styles/sections/patch115-unified-trainer-badge-sizing.css"),
        (" id=\"competitionBattleStats20260826\"", "styles/sections/competition-battle-stats.css"),
        (" id=\"pokeDollsMyTeamTrueGridFix20260827\"", "styles/sections/poke-dolls-my-team-true-grid-fix.css"),
        (" id=\"pokeDollsActivityContainmentFix20260827\"", "styles/sections/poke-dolls-activity-containment-fix.css"),
        (" id=\"pokeDollsListLengthFix20260827\"", "styles/sections/poke-dolls-list-length-fix.css"),
        (" id=\"patch109MobileTeamDetailFixes\"", "styles/sections/patch109-mobile-team-detail-fixes.css"),
        (" id=\"patch110DetailAndIosNavFix\"", "styles/sections/patch110-detail-and-ios-nav-fix.css"),
        (" id=\"teamSelectionPreviewUpgrade20260827\"", "styles/sections/team-selection-preview-upgrade.css"),
        (" id=\"trainerCardAdminTestLayout20260906\"", "styles/sections/trainer-card-admin-test-layout.css"),
        (" id=\"monthlyBonusPokemonStyles20260908\"", "styles/sections/monthly-bonus-pokemon-styles.css"),
        (" id=\"faqOrientationPatch271\"", "styles/sections/faq-orientation-patch271.css"),
        ("", "styles/sections/admin-image-editing.css"),
        ("", "styles/sections/late-page-overrides.css"),
    ]:
        marker = f"/* RF_CSS_INCLUDE:{path} */"
        css_pattern = re.compile(r'(<style' + re.escape(attributes) + r'>)(' + re.escape(marker) + r')(</style>)')
        css_matches = list(css_pattern.finditer(text))
        if text.count(marker) != 1 or len(css_matches) != 1:
            raise SystemExit(f"ERROR: Expected one exact stylesheet include: {path}")
        css_match = css_matches[0]
        css = (ROOT / path).read_text(encoding="utf-8")
        text = text[:css_match.start(2)] + css + text[css_match.end(2):]
    if "/* RF_CSS_INCLUDE:" in text:
        raise SystemExit("ERROR: Unknown or duplicate CSS include marker.")
    # Apply the reviewed event patch with exact context checks.
    # Exact context checks prevent silently applying it to incompatible future edits.
    patch_file = ROOT / "pokemon-special-event-controls.patch.json"
    for change in json.loads(patch_file.read_text(encoding="utf-8")):
        if text.count(change["old"]) != 1:
            raise SystemExit("ERROR: Special Event patch context changed; review the source before deploying.")
        text = text.replace(change["old"], change["new"])

    extracted_dir = DIST_ASSETS / "extracted-inline"
    extracted_dir.mkdir(parents=True, exist_ok=True)

    def replace(match):
        mime = match.group("mime").lower()
        ext = MIME_EXT.get(mime)
        if not ext:
            return match.group(0)

        raw_b64 = re.sub(r"\\s+", "", match.group("data"))
        try:
            data = base64.b64decode(raw_b64, validate=True)
        except Exception:
            return match.group(0)

        if len(data) > MAX_CF_ASSET:
            raise RuntimeError(
                f"Decoded inline asset exceeds Cloudflare's 25 MiB limit: {mime} ({len(data) / 1024 / 1024:.1f} MiB)"
            )

        digest = sha256_bytes(data)
        if digest in existing:
            return existing[digest]

        out = extracted_dir / f"{digest[:24]}{ext}"
        if not out.exists():
            out.write_bytes(data)
        web_path = rel_web(out)
        existing[digest] = web_path
        return web_path

    try:
        processed = DATA_URI.sub(replace, text)
    except RuntimeError as exc:
        raise SystemExit(f"ERROR: {exc}")

    # Optional Pumpkin Hunt runs separately after the challenge loads.
    processed = re.sub(r"RF_BUILD:\d+", "RF_BUILD:20261002184000", processed, count=1)
    processed = re.sub(r'const RF_BUILD="\d+";', 'const RF_BUILD="20261002184000";', processed, count=1)
    processed = re.sub(r"RF_PATCH_NAME:[^<]+? -->", "RF_PATCH_NAME:Patch #279 — One-time Admin Pumpkin Spawns -->", processed, count=1)
    processed = re.sub(r'const RF_PATCH_NAME="[^"]+";', 'const RF_PATCH_NAME="Patch #279 — One-time Admin Pumpkin Spawns";', processed, count=1)
    script = '<script async src="rf-pumpkin-hunt.js?v=20261002184000" data-rf-challenge="pokemon"></script>'
    if "</body>" not in processed:
        raise SystemExit("ERROR: Expected a body closing tag for the optional pumpkin script.")
    body_end = processed.rfind("</body>")
    processed = processed[:body_end] + script + processed[body_end:]
    shutil.copyfile(ROOT / "rf-pumpkin-hunt.js", DIST / "rf-pumpkin-hunt.js")

    out_index = DIST / "index.html"
    out_index.write_text(processed, encoding="utf-8")

    if out_index.stat().st_size > MAX_CF_ASSET:
        raise SystemExit(
            "ERROR: Prepared index.html is still over 25 MiB. Stop here; another embedded source needs to be isolated."
        )

    print("SUCCESS: dist/ is ready for hidden /pokemon/ Cloudflare deployment.")

if __name__ == "__main__":
    main()
