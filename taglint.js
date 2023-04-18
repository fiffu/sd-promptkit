const Action = {
  Noop: 'Noop',
  Remove: 'Remove',
  Lint: 'Lint',
}



class Braces {
  constructor(braceMap) {
    this.b = braceMap;
  }

  match(s) {
    for (let [opener, closer] of this.entries(this.b)) {
      if (s === opener) return closer;
      if (s === closer) return opener;
    }
    return undefined;
  }

  isOpener(s) {
    return Object.keys(this.b).indexOf(s) > -1
  }

  isCloser(s) {
    return Object.values(this.b).indexOf(s) > -1
  }

  entries() {
    return Object.entries(this.b);
  }
}

class Stack extends Array {
  peek() {
    return this.length > 0
      ? this[this.length-1]
      : undefined;
  }
}


/**
 * @typedef ProcessedResult
 * @property {FormattedTag} tag
 * @property {string} action
 */

class FormattedTag {
  braces = new Braces({
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
  });

  constructor(orig) {
    const rawTag = orig.toLowerCase().trim();

    let {tagBody, leftParen, rightParen} = this.normParens(rawTag);
    let {name, weight} = this.normTagBody(tagBody);

    this.orig = orig;
    this.tagName = name;
    this.weight = weight;
    this.normalized = (
      leftParen
      + name
      + (weight && `: ${weight}` || '')
      + rightParen
    );
  }

  get hashKey() {
    return this.tagName;
  }

  /** @param {String} tagBody  */
  normParens(tagBody) {
    const pivot = Math.floor(tagBody.length / 2);
    const tagHead = tagBody.slice(0, pivot);
    const tagTail = tagBody.slice(-pivot, tagBody.length);
    
    // accumulate leading openers
    let openers = [];
    for (let i=0; i<tagHead.length; i++) {
      const ch = tagHead[i]
      if (this.braces.isOpener(ch)) openers.push(ch);
      else break;
    }
    tagBody = tagBody.slice(openers.length, tagBody.length);

    // accumulate trailing closers
    let closers = [];
    for (let i=tagTail.length-1; i > 0; i--) {
      const ch = tagTail[i];
      if (this.braces.isCloser(ch)) closers.push(ch);
      else break;
    }
    if (closers.length) tagBody = tagBody.slice(0, -closers.length);

    if (openers.length >= closers.length) {
      closers = openers.map(o => this.braces.match(o));
    } else {
      openers = closers.map(c => this.braces.match(c));
    }

    return {
      leftParen: openers.join(''),
      tagBody: tagBody,
      rightParen: closers.join(''),
    }
  }

  /**
   * @this FormattedTag
   * @param {string} tagBody
   */
  normTagBody(tagBody) {
    let name = '';
    let weight = 0;
    if (tagBody.indexOf(':') > -1) {
      [name, weight] = tagBody.split(':', 2);
      weight = this.normWeight(weight);
    } else if (tagBody.match(/1\.\d *$/)) {  // don't be greedy, let's just match on 1.x
      const numStr = tagBody.match(/1\.\d *$/)[0];
      name = tagBody.slice(0, -numStr.length);
      weight = this.normWeight(numStr);
    } else {
      name = tagBody;
    }
    name = this.normName(name);
    return {name, weight};
  }

  /** @param {string} s */
  normName(s) {
    s = s.trim().replace(/\n/, ' ');

    let r = ''
    let stackClosers = new Stack();
    s.split('').forEach(ch => {
      if (this.braces.isOpener(ch)) {
        // found opener, push its closer to stack
        stackClosers.push(this.braces.match(ch));
        r += ch;
        return;

      } else if (this.braces.isCloser(ch)) {
        // only append matched closer, ignore unmatched
        if (ch === stackClosers.peek()) {
          r += ch;
          stackClosers.pop();
        }
        return;

      } else {
        // not opener or closer, just append
        r += ch;
      }

    })
    const unusedClosers = stackClosers.join('');
    return r + unusedClosers;
  }

  /**
   * @param {string} s
   * @return {number}
   */
  normWeight(s) {
    s = parseFloat(s);
    if (isNaN(s)) {
      return 0;
    }
    return s;
  }
}


class TagLint {
  constructor(inputId, resultId, copyButtonId) {
    this.eInput = document.getElementById(inputId);
    this.eOutput = document.getElementById(resultId);
    this.eCopyButton = document.getElementById(copyButtonId);
  }

  resetForm() {
    this.eOutput.textContent = '';
    this.eCopyButton.innerHTML = 'Copy';
  }

  onInput() {
    this.resetForm()

    this.processTags(this.eInput.value).forEach(result => {
      let {tag, action} = result;

      switch (action) {
      case Action.Noop:
      case Action.Lint:
        const span = this.newSpan(tag, action.toLowerCase());
        this.eOutput.appendChild(span);
        break;
      case Action.Remove:
        // console.log(`Removed ${tag.normalized}`);
        break;
      }
    });
  }

  copyResult() {
    let result = '';

    const spans = this.eOutput.getElementsByTagName('span');
    for (const span of spans) {
      result += span.innerText;
    }

    navigator.clipboard.writeText(
      result,
      () => {
        alert(result);
        console.log(result);
        this.eCopyButton.innerHTML = 'Copied!';
      },
      err => { console.error(err) },
    );
  }

  /**
   * @param {string} allTags
   * @return {Array<ProcessedResult>}
   */
  processTags(allTags) {
    const seen = {};
    const result = [];

    allTags.split(',').forEach(rawTag => {
      if (rawTag.trim() === '') {
        return;
      }

      const tag = new FormattedTag(rawTag);
      const hash = tag.hashKey;
      const hasDiff = rawTag.trim() !== tag.normalized;

      let action = Action.Noop;

      if (seen[hash]) {
        action = Action.Remove;

      } else if (tag.normalized === '') {
        action = Action.Remove;

      } else if (hasDiff) {
        action = Action.Lint;
      };

      seen[hash] = tag;
      result.push({tag, action});
    });

    return result;
  }

  /**
   * @param {FormattedTag} tag
   * @param {string} className
   */
  newSpan(tag, className) {
    const span = document.createElement('span');
    if (className) span.classList.add(className);

    span.innerText = `${tag.normalized}, `;
    return span;
  }

}

(module || {}).exports = {
  TagLint,
  FormattedTag,
}
