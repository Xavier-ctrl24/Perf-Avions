# -*- coding: utf-8 -*-
"""Compose the Play Store tiles from real toldcalc screenshots.

One table, one renderer. Each tile is a headline, a two-line subtitle and one
or more real crops of the app, magnified as far as the 1080x1920 frame allows.

Two rules learned on tile 01 and applied to all of them:
  - crop at the *content* edge, not the panel edge: the card's own padding
    would otherwise eat the magnification budget and force a crop that slices
    into digits, and a sliced figure in a performance calculator destroys the
    very credibility the tile is selling;
  - crops that share the same x span and the same panel skin butt together
    with no gap (GAP = 0), so the seam where an intermediate line was removed
    is invisible and the pieces read as one continuous card.

Scale is not a free choice: width is pinned to 1080, so scale = 1080 / crop
width, and the stack must fit the band between TOP and BOTTOM. Mixed scales
between distinct panels are fine, they read as distinct instruments.
"""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = r"C:\Users\Xavier\Documents\Claude-Code\FJAOE\images-app\play"

W, H = 1080, 1920
TOP, BOTTOM = 460, 1780          # the band the content block is centred in
CREAM = (236, 229, 211)
DIM = (164, 158, 143)
PHOS = (87, 224, 140)
BAHN = r"C:\Windows\Fonts\bahnschrift.ttf"

# ---------------------------------------------------------------- the tiles
# box = (left, top, right, bottom) in the source screenshot
# gap = vertical space *above* this crop (0 = butt against the previous one)
TILES = [
    dict(
        src="01-resultats.png", out="poster-01-promise.png",
        head="WILL IT FIT?", head_size=155,
        sub=["Your flight manual's figures,",
             "corrected for today's conditions."],
        # the reference-condition caption ("sea level, 59 F, no wind") is
        # deliberately cropped OUT and the header lifted separately: that line
        # states the manual's input reference, but sitting under a headline
        # promising figures corrected for today it reads as a claim that
        # nothing was corrected. Dropping it also frees 87 px of width, which
        # is why the figures land at 1.56x instead of 1.39x.
        crops=[((115, 158, 807, 228), 46),    # the TAKEOFF placard
               ((115, 305, 807, 711), 0),     # status badge + the four figures
               ((122, 744, 958, 910), 46)],   # the runway diagram
    ),
    dict(
        src="02-saisie-avion.png", out="poster-02-manual.png",
        head="ANY AIRCRAFT", head_size=140,
        sub=["The four numbers come from your own",
             "flight manual, not from our database."],
        cw=950,
        crops=[((130, 745, 955, 832), 46),    # AIRCRAFT - FROM YOUR FLIGHT MANUAL
               ((130, 1030, 955, 1915), 0)],  # takeoff + landing input pairs
    ),
    dict(
        src="03-instruments.png", out="poster-03-wind.png",
        head="WIND AT A GLANCE", head_size=125,
        sub=["Headwind, crosswind and the side it comes",
             "from, against your demonstrated limit."],
        # cropped to the dial, not to the card: the panel border would cost
        # 0.3x of magnification for nothing. The "WIND - RUNWAY 23" title is
        # left out (it starts further left than the dial, so lifting it the
        # way tile 01 lifts its placard would not line up) - the headline
        # carries that word instead.
        cw=950,
        crops=[((180, 160, 900, 930), 46)],
    ),
    dict(
        src="04-piste.png", out="poster-04-runway.png",
        head="ANY RUNWAY", head_size=150,
        sub=["Field elevation and declared distances,",
             "straight off your own aerodrome chart."],
        # the RUNWAY DIRECTION field is skipped on purpose: the screenshot
        # caught it focused, with a text caret after 230, which magnified on a
        # store tile reads as a half-finished screenshot.
        cw=950,
        crops=[((130, 165, 955, 258), 46),    # RUNWAY - FROM YOUR AERODROME CHART
               ((130, 315, 955, 668), 0),     # aerodrome + field elevation
               ((130, 1085, 955, 1450), 46)], # TODA + LDA
    ),
    dict(
        src="05-metar.png", out="poster-05-metar.png",
        head="METAR, DECODED", head_size=135,
        sub=["One tap fetches the weather and drops",
             "wind, temperature and QNH into the calculation."],
        cw=950,
        crops=[((180, 230, 900, 1015), 46)],
    ),
]


def font(size, variation=None):
    f = ImageFont.truetype(BAHN, size)
    if variation:
        try:
            f.set_variation_by_name(variation)
        except Exception:
            pass
    return f


def background():
    """The app's own radial glow over the cabin dark."""
    img = Image.new("RGB", (W, H), (23, 25, 29))
    px = img.load()
    cx, cy = W / 2, -120
    for y in range(H):
        for x in range(0, W, 4):
            dd = (((x - cx) / 1100) ** 2 + ((y - cy) / 700) ** 2) ** 0.5
            t = max(0.0, 1.0 - dd)
            c = (int(23 + 12 * t), int(25 + 13 * t), int(29 + 15 * t))
            for k in range(4):
                if x + k < W:
                    px[x + k, y] = c
    return img


def compose(tile):
    img = background()
    d = ImageDraw.Draw(img)

    # headline, auto-shrunk if the declared size overflows the safe width
    size = tile["head_size"]
    while d.textlength(tile["head"], font=font(size, "Bold")) > 980 and size > 70:
        size -= 5
    d.text((W / 2, 215), tile["head"], font=font(size, "Bold"), fill=CREAM, anchor="mm")

    sub_size = 56
    while max(d.textlength(s, font=font(sub_size, "SemiBold")) for s in tile["sub"]) > 980 \
            and sub_size > 34:
        sub_size -= 2
    for i, line in enumerate(tile["sub"]):
        d.text((W / 2, 330 + i * 65), line, font=font(sub_size, "SemiBold"),
               fill=DIM, anchor="mm")

    src = Image.open(os.path.join(BASE, tile["src"]))
    # content width: full-bleed (1080) only where the crop carries its own
    # margin. Everywhere else a narrower block keeps a breathing edge, so the
    # magnified labels do not read as a screenshot cut off by the frame.
    cw = tile.get("cw", W)
    parts = []
    for box, gap in tile["crops"]:
        part = src.crop(box)
        s = cw / part.width
        parts.append((gap, s, part.resize((cw, round(part.height * s)), Image.LANCZOS)))

    total = sum(p[2].height for p in parts) + sum(p[0] for p in parts[1:])
    y = TOP + (BOTTOM - TOP - total) // 2
    print("%-24s block %d px (band %d)%s" %
          (tile["out"], total, BOTTOM - TOP, "  *** OVERFLOW" if total > BOTTOM - TOP else ""))
    for i, (gap, s, part) in enumerate(parts):
        if i:
            y += gap
        img.paste(part, (round((W - part.width) / 2), y))
        print("    crop %d  scale %.2fx  %s  y %d..%d" % (i, s, part.size, y, y + part.height))
        y += part.height

    # green status dot + wordmark, echoing the app header
    d.ellipse((W / 2 - 200, 1815, W / 2 - 182, 1833), fill=PHOS)
    d.text((W / 2 - 165, 1824), "TOLDCALC", font=font(46, "SemiBold"), fill=CREAM, anchor="lm")

    img.save(os.path.join(BASE, tile["out"]))


for t in TILES:
    compose(t)
