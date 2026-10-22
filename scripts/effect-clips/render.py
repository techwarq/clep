"""Render the hand-built clips in studio.html to public/showcase/<slug>.mp4 + .jpg.

Scenes are laid out at 1280x720 CSS px and captured at 3x device scale, so the output is true 4K (3840x2160).

    python3 scripts/effect-clips/render.py              # all scenes
    python3 scripts/effect-clips/render.py effect-zoom  # one scene
"""
import pathlib, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
from playwright.sync_api import sync_playwright

FPS = 60
SCALE = 3          # 1280x720 * 3 = 3840x2160
WORKERS = 4
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / "public" / "showcase"
SCENES = ["effect-zoom", "effect-typing", "effect-click-upload", "effect-multistep", "effect-walkthrough", "effect-vertical",
          "effect-cursor", "effect-deadair", "effect-looks", "effect-captions", "effect-keys", "effect-blur", "launch-push"]


def render(slug):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=SCALE)
        page.on("pageerror", lambda e: print(f"{slug} page error:", e))
        page.goto(f"{(HERE / 'studio.html').as_uri()}?scene={slug}")
        page.wait_for_function("window.READY === true", timeout=30000)
        dur, poster = page.evaluate("[window.DUR, window.POSTER]")
        mp4 = OUT / f"{slug}.mp4"
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                               "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high", "-level", "5.2",
                               "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4)], stdin=subprocess.PIPE)
        for i in range(round(dur * FPS)):
            page.evaluate(f"renderAt({i / FPS})")
            ff.stdin.write(page.screenshot(type="png"))
        ff.stdin.close()
        ff.wait()
        browser.close()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(poster), "-i", str(mp4), "-frames:v", "1",
                    "-vf", "scale=1920:-1:flags=lanczos", "-q:v", "2", str(OUT / f"{slug}.jpg")], check=True)
    return f"{slug}: {dur}s, {mp4.stat().st_size // 1024} KB"


if __name__ == "__main__":
    with ProcessPoolExecutor(WORKERS) as pool:
        for line in pool.map(render, sys.argv[1:] or SCENES):
            print(line, flush=True)
