const {FormattedTag, TagLint} = require('../taglint');

describe('FormattedTag', () => {
  for (const tc of [
    {
      desc: 'default tag weight is considered 0',
      input: 'masterpiece',
      expectTagName: 'masterpiece',
      expectWeight: 0,
      expectNormalized: 'masterpiece',
    },
    {
      desc: 'input should be lowercased',
      input: 'Masterpiece',
      expectTagName: 'masterpiece',
      expectWeight: 0,
      expectNormalized: 'masterpiece',
    },
    {
      desc: 'whitespace should be fixed',
      input: '(masterpiece : 1.4)',
      expectTagName: 'masterpiece',
      expectWeight: 1.4,
      expectNormalized: '(masterpiece: 1.4)',
    },
    {
      desc: 'excess openers in tag weight should be closed',
      input: '(((masterpiece)',
      expectTagName: 'masterpiece',
      expectWeight: 0,
      expectNormalized: '(((masterpiece)))',
    },
    {
      desc: 'excess closers in tag weight should be trimmed',
      input: '(masterpiece)))',
      expectTagName: 'masterpiece',
      expectWeight: 0,
      expectNormalized: '(masterpiece)',
    },
    {
      desc: 'braces in tag name should be untouched',
      input: 'le malin (azur lane)',
      expectTagName: 'le malin (azur lane)',
      expectWeight: 0,
      expectNormalized: 'le malin (azur lane)',
    },
    {
      desc: 'braces in tag name should be untouched, even with numbered weights',
      input: '(le malin (azur lane): 1.4)',
      expectTagName: 'le malin (azur lane)',
      expectWeight: 1.4,
      expectNormalized: '(le malin (azur lane): 1.4)',
    },
    {
      desc: 'braces in tag name should be untouched, even with braced weights',
      input: '(((le malin (azur lane))))',
      expectTagName: 'le malin (azur lane)',
      expectWeight: 0,
      expectNormalized: '(((le malin (azur lane))))',
    },
    {
      desc: 'braces in tag name should be untouched, even for multiple pairs',
      input: "le malin (the knight's true nature) (azur lane)",
      expectTagName: "le malin (the knight's true nature) (azur lane)",
      expectWeight: 0,
      expectNormalized: "le malin (the knight's true nature) (azur lane)",
    },
    {
      desc: 'braces in tag name should have excess openers closed',
      input: 'le malin (azur lane',
      expectTagName: 'le malin (azur lane)',
      expectWeight: 0,
      expectNormalized: 'le malin (azur lane)',
    },
    {
      desc: 'braces in tag name should have excess closers trimmed',
      input: 'le malin azur lane)',
      expectTagName: 'le malin azur lane',
      expectWeight: 0,
      expectNormalized: 'le malin azur lane',
    },
  ]) {
    test(tc.desc, () => {
      const tag = new FormattedTag(tc.input);

      expect(tag.tagName).toBe(tc.expectTagName);
      expect(tag.weight).toBe(tc.expectWeight);
      expect(tag.normalized).toBe(tc.expectNormalized);
    })
  }
})
