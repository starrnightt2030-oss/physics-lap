# -*- coding: utf-8 -*-
"""
يولّد صوت «شاكر» المصري (Microsoft Edge Neural: ar-EG-ShakirNeural) لكل جمل المعلم.
محتاج إنترنت مرة واحدة بس. بيشتغل تلقائياً على GitHub مع كل رفع، وتقدر تشغّله على جهازك:
    pip install edge-tts
    python tools/make_shakir.py
الملفات اللي اتعملت قبل كده مش بتتعمل تاني. لما كل الجمل تخلص بيكتب voice/shakir/pack.js
فيظهر اختيار «شاكر» في المعمل.
"""
import asyncio, json, os, sys

VOICE = os.environ.get('SHAKIR_VOICE', 'ar-EG-ShakirNeural')
RATE = os.environ.get('SHAKIR_RATE', '-4%')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'voice', 'shakir')
LINES = os.path.join(ROOT, 'tools', 'lines.json')


async def one(edge_tts, key, text, sem):
    path = os.path.join(OUT, key + '.mp3')
    if os.path.exists(path) and os.path.getsize(path) > 2000:
        return True
    async with sem:
        for attempt in range(4):
            try:
                tmp = path + '.part'
                await edge_tts.Communicate(text, VOICE, rate=RATE).save(tmp)
                if os.path.getsize(tmp) > 2000:
                    os.replace(tmp, path)
                    print('  ✓', key)
                    return True
            except Exception as e:  # network hiccup: retry
                print('  …', key, type(e).__name__, str(e)[:80])
            await asyncio.sleep(2 + attempt * 3)
    print('  ✗', key)
    return False


async def main():
    try:
        import edge_tts
    except ImportError:
        print('محتاج: pip install edge-tts')
        return 1
    lines = json.load(open(LINES, encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    sem = asyncio.Semaphore(4)
    print(f'توليد صوت شاكر لـ {len(lines)} جملة…')
    res = await asyncio.gather(*(one(edge_tts, k, v['say'], sem) for k, v in lines.items()))
    ok = sum(res)
    print(f'تم {ok} من {len(lines)}')
    if ok == len(lines):
        with open(os.path.join(OUT, 'pack.js'), 'w', encoding='utf-8') as f:
            f.write("window.VPACKS=window.VPACKS||{};VPACKS.shakir={name:'شاكر',note:'مصري طبيعي'};\n")
        print('صوت شاكر جاهز ✓')
        return 0
    print('لسه فيه جمل ناقصة؛ شغّل السكريبت تاني. المعمل هيفضل شغال بصوت كريم.')
    return 2 if '--strict' in sys.argv else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
