const {FormattedTag, TagLint} = require('../taglint');
const {should} = require('./libtest');


for (const tc of [
  {
    input: 'Abc',
    expectTagName: 'abc',
    expectWeight: 0,
    expectNormalized: 'abc',
  },
  {
    input: '(def : 1.4)',
    expectTagName: 'def',
    expectWeight: 1.4,
    expectNormalized: '(def: 1.4)',
  },
  {
    input: '(((too many openers for tag weight)',
    expectTagName: 'too many openers for tag weight',
    expectWeight: 0,
    expectNormalized: '(((too many openers for tag weight)))',
  },
  {
    input: '(too many closers for tag weight)))',
    expectTagName: 'too many closers for tag weight',
    expectWeight: 0,
    expectNormalized: '(too many closers for tag weight)',
  },
  {
    input: '(hjk (test): 1.4)',
    expectTagName: 'hjk (test)',
    expectWeight: 1.4,
    expectNormalized: '(hjk (test): 1.4)',
  },
  {
    input: '(unmatched internal closers) are trimmed: 1.4)',
    expectTagName: 'unmatched internal closers are trimmed',
    expectWeight: 1.4,
    expectNormalized: '(unmatched internal closers are trimmed: 1.4)',
  },
  {
    input: '(unmatched internal (openers are closed: 1.4)',
    expectTagName: 'unmatched internal (openers are closed)',
    expectWeight: 1.4,
    expectNormalized: '(unmatched internal (openers are closed): 1.4)',
  },
  {
    input: 'internal tags (without weight)',
    expectTagName: 'internal tags (without weight)',
    expectWeight: 0,
    expectNormalized: 'internal tags (without weight)',
  },
]) {
  const tag = new FormattedTag(tc.input);
  should.equal(tag.tagName, tc.expectTagName);
  should.equal(tag.weight, tc.expectWeight);
  should.equal(tag.normalized, tc.expectNormalized);
}
