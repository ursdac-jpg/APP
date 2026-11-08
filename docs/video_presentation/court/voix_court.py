import json, sys, wave, re
from piper import PiperVoice
from piper.config import SynthesisConfig
vt, vid = sys.argv[1:3]
blocs = json.load(open(f'{vt}/{vid}/blocs.json', encoding='utf-8'))
voice = PiperVoice.load(f'{vt}/voix/fr_FR-tom-medium.onnx')
cfg = SynthesisConfig(length_scale=1.08)
PRON = [(r'\bAPP\b', 'A P P'), (r'\bCV\b', 'cé vé'), (r'\bPDF\b', 'pé dé éf'), (r'\bWord\b', 'Ouorde'), (r'\bChatGPT\b', 'tchatte gé pé té'), (r'\bPerplexity\b', 'Perplexité')]
import os
os.makedirs(f'{vt}/{vid}/blocs', exist_ok=True)
for b in blocs:
    t = b['voix']
    for a, r in PRON: t = re.sub(a, r, t)
    with wave.open(f"{vt}/{vid}/blocs/{b['id']}.wav", 'wb') as w:
        voice.synthesize_wav(t, w, cfg)
print('ok', len(blocs))
