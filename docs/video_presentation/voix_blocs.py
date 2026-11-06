import json, sys, wave, re
from piper import PiperVoice
from piper.config import SynthesisConfig
sp, = sys.argv[1:2]
blocs = json.load(open(sp + '/blocs.json', encoding='utf-8'))
voice = PiperVoice.load(sp + '/voix/fr_FR-tom-medium.onnx')
cfg = SynthesisConfig(length_scale=1.08)  # un peu plus lent, plus posé
PRON = [(r'\bAPP\b', 'A P P'), (r'\bCV\b', 'cé vé'), (r'\bPDF\b', 'pé dé éf'), (r'\bWord\b', 'Ouorde')]
for b in blocs:
    t = b['voix']
    for a, r in PRON: t = re.sub(a, r, t)
    with wave.open(f"{sp}/voix/blocs/{b['id']}.wav", 'wb') as w:
        voice.synthesize_wav(t, w, cfg)
print('ok', len(blocs))
