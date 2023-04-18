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
      desc: 'underscore should be fixed',
      input: 'le_malin',
      expectTagName: 'le malin',
      expectWeight: 0,
      expectNormalized: 'le malin',
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
    });
  }
});

describe('TagLintOptions', () => {
  test('preserveUnderscores', () => {
    const opt = {
      default: {preserveCase: false},
      enabled: {preserveCase: true},
    };
    expect(new FormattedTag('', opt.default).normName('ASDF')).toBe('asdf');
    expect(new FormattedTag('', opt.enabled).normName('ASDF')).toBe('ASDF');
  });

  test('preserveUnderscores', () => {
    const opt = {
      default: {preserveUnderscores: false},
      enabled: {preserveUnderscores: true},
    };
    expect(new FormattedTag('', opt.default).normName('a_s_d_f')).toBe('a s d f');
    expect(new FormattedTag('', opt.enabled).normName('a_s_d_f')).toBe('a_s_d_f');
  });

  test('preserveNewlines', () => {
    const opt = {
      default: {preserveNewlines: false},
      enabled: {preserveNewlines: true},
    };
    expect(new TagLint(opt.default).tokenize('a,b\nc')).toStrictEqual(['a', 'b', 'c']);
    expect(new TagLint(opt.enabled).tokenize('a,b\nc')).toStrictEqual(['a', 'b\nc']);
  });
});


describe('TagLint', () => {
  describe('tokenize()', () => {
    test('uses comma as delimiter by default', () => {
      const t = new TagLint();
      expect(t.tokenize(`a,b`)).toStrictEqual(['a', 'b']);
    })

    test('treats newline as delimiter by default', () => {
      const t = new TagLint();
      expect(t.tokenize('a,b\nc')).toStrictEqual(['a', 'b', 'c']);
    })

    test('filters out empty tokens after splitting on delimiter(s)', () => {
      const t = new TagLint();
      expect(t.tokenize('a,b\n,c')).toStrictEqual(['a', 'b', 'c']);
    });
  });
});
