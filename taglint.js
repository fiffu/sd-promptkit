const Action = {
  Noop: 'Noop',
  Remove: 'Remove',
  Lint: 'Lint',
}

class FormattedTag {
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
    const braces = {
      '(': ')',
      '[': ']',
      '{': '}',
      '<': '>',
    };
    const openingBraces = Object.keys(braces);
    const closingBraces = Object.values(braces);
    const allBraces = openingBraces.concat(...closingBraces);

    const openers = this.getLeadingChars(openingBraces, tagBody);
    tagBody = tagBody.slice(openers.length);

    const nonBraces = this.getLeadingChars(allBraces, tagBody, true);
    tagBody = nonBraces.join('');

    return {
      tagBody,
      leftParen: openers.join(''),
      rightParen: openers.map(o => braces[o]).join(''),
    };
  }

  /**
   * @param {[]string} charset
   * @param {string} str
   * @param {boolean} inverse If true, returns the chars that are _not_ in the charset.
   * @return {[]string}
   */
  getLeadingChars(charset, str, inverse=false) {
    let found = [];
    for (const c of str) {
      const isInSet = charset.indexOf(c) > -1;
      if ((isInSet && !inverse) || (!isInSet && inverse)) {
        found.push(c);
        continue;
      }
      break;
    }
    return found;
  }

  /** @param {string} tagBody */
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
    return s.replace(/\n/, ' ');
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


/**
 * @typedef ProcessedResult
 * @property {FormattedTag} tag
 * @property {string} action
 */


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
