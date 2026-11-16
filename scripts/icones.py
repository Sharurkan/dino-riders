# Génère les icônes de la PWA (œuf coloré sur fond néon). Usage : python3 scripts/icones.py
from PIL import Image, ImageDraw

def icone(taille, marge):
    S = 4  # suréchantillonnage pour des bords lisses
    n = taille * S
    img = Image.new('RGB', (n, n), '#1a0b3a')
    d = ImageDraw.Draw(img)
    m = int(n * marge)
    d.ellipse([m, m, n - m, n - m], fill='#3b1d7a')
    # Œuf
    l, h = (n - 2 * m) * 0.5, (n - 2 * m) * 0.66
    cx, cy = n / 2, n / 2
    d.ellipse([cx - l / 2, cy - h / 2, cx + l / 2, cy + h / 2], fill='#fff4d6')
    for (dx, dy, r, c) in [(-0.2, -0.15, 0.13, '#ff5fa2'), (0.22, 0.05, 0.16, '#3ad6ff'), (-0.1, 0.3, 0.12, '#7be36b')]:
        d.ellipse([cx + (dx - r) * l, cy + (dy - r) * h * 0.76, cx + (dx + r) * l, cy + (dy + r) * h * 0.76], fill=c)
    return img.resize((taille, taille), Image.LANCZOS)

icone(192, 0.06).save('public/icons/icone-192.png')
icone(512, 0.06).save('public/icons/icone-512.png')
icone(512, 0.16).save('public/icons/icone-512-masquable.png')
icone(180, 0.06).save('public/icons/icone-180.png')
