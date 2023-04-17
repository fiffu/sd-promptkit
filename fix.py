import re

TAG_PATTERNS = dict(
      word=re.compile(r'^(?P<tag>[\w\s]+)$'),
      word_weighted=re.compile(r'^(?P<left>\()(?P<tag>[\w\s]+)(?P<right>(:\d+(\.\d+)?)?\))$'),
)

class Tag:
      def __init__(self, tag, left='', right=''):
            self.clean = f"{left or ''}{tag}{right or ''}"
            self.hash = tag
            self.weight = self.parse_weight(right)
      

      @staticmethod
      def parse_weight(w: str):
            while w:
                  if not w[0].isnumeric():
                        w = w[1:]
                        continue
                  if not w[-1].isnumeric():
                        w = w[:-1]
                        continue
                  break
            return float(w) if w.isnumeric() else 1

def fix(tag) -> Tag:
      for patt in TAG_PATTERNS.values():
            match = patt.match(tag)
            if not match:
                  continue
            return Tag(**match.groupdict())
                  
def fix_tags(tags):
      out = {}
      for tag in tags.split(','):
            tag = fix(tag.strip())
            if not tag:
                  continue
            
            seen = out.get(tag)
            if not seen:
                  out[tag.hash] = tag
            elif tag.weight > seen.weight:
                  out[tag.hash] = tag
                  
      print(', '.join(tag.clean for tag in out.values()))

fix_tags(
      """
      multiple breasts, mutated hands and fingers, (long body:1.3), (mutation:1.2), (poorly drawn:1.2), bad anatomy, liquid body, liquid tongue, disfigured, malformed, mutated, anatomical nonsense, text font ui, error, malformed hands, long neck, blurred, lowers, lowres, bad proportions, bad shadow, uncoordinated body, unnatural body, fused breasts, bad breasts, huge breasts, poorly drawn breasts, extra breasts, liquid breasts, heavy breasts, missing breasts, huge haunch, huge thighs, huge calf, bad hands, fused hand, missing hand, disappearing arms, disappearing thigh, disappearing calf, disappearing legs, fused ears, bad ears, poorly drawn ears, extra ears, liquid ears, heavy ears, missing ears, fused animal ears, bad animal ears, poorly drawn animal ears, extra animal ears, liquid animal ears, heavy animal ears, missing animal ears, text, ui, missing fingers, missing limb, fused fingers, one hand with more than 5 fingers, one hand with less than 5 fingers, one hand with more than 5 digit, one hand with less than 5 digit, extra digit, fewer digits, fused digit, missing digit, bad digit, liquid digit, colorful tongue, black tongue, cropped, watermark, username, extra digits, worst quality, low quality, normal quality, jpeg artifacts, (blurry), mismatched eyes, signature, poorly drawn face, (extra limb), ugly, poorly drawn hands, messy drawing, broken legs, censor, censored, censor bar, low res, malformed feet, extra feet, bad feet, poorly drawn feet, fused feet, missing feet, extra shoes, bad shoes, fused shoes, more than two shoes, poorly drawn shoes, bad, gloves, poorly drawn gloves, fused gloves, bad cum, poorly drawn cum, fused cum, bad hairs, poorly drawn hairs, fused hairs, big musces, bad face, fused face, cloned face, big face, long face, bad eyes, fused eyes, drawn eyes, extra eyes, malformed limbs, more than 2 nipples, missing nipples, different nipples, fused nipples, bad nipples, poorly drawn nipples, black nipples, colorful nipples, gross proportions, short arm, missing thighs, missing calf, missing legs, duplicate, morbid, mutilated, more than 1 left hand, more than 1 right hand, deformed, extra arms, extra thighs, more than 2 thighs, extra calf, fused calf, extra legs, bad knee, extra knee, more than 2 legs, bad tails, bad mouth, fused mouth, poorly drawn mouth, bad tongue, tongue within mouth, too long tongue, big mouth, cracked mouth, dirty face, dirty teeth, fused panties, poorly drawn panties, fused cloth, poorly drawn cloth, bad panties, yellow teeth, thick lips, bad camel toe, colorful camel toe, bad asshole, poorly drawn asshole, fused asshole, missing asshole, bad anus, bad pussy, bad crotch, bad crotch seam, fused anus, fused pussy, fused crotch, poorly drawn crotch, fused seam, poorly drawn anus, poorly drawn pussy, poorly drawn crotch seam, bad thigh gap, missing thigh gap, fused thigh gap, liquid thigh gap, poorly drawn thigh gap, bad collarbone, fused collarbone, missing collarbone, liquid collarbone, strong girl, obesity, liquid tentacles, bad tentacles, poorly drawn tentacles, split tentacles, fused tentacles, missing clit, bad clit, fused clit, colorful clit, black clit, liquid clit, qr code, bar code, safety panties, safety knickers, beard, pony, pubic hair, mosaic, futa, testis, no color, weird colors, deformed glasses, big muscles, poorly drawn eyes, tongue within mouth, dirty panties, safety knickers

      """
)
