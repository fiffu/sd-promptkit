const Action = {
  Noop: 'Noop',
  Remove: 'Remove',
  Lint: 'Lint',
}

class FormattedTag {
  constructor(orig) {
    const rawTag = orig.toLowerCase().trim();

    let {tagBody, leftParen, rightParen} = this.normParens(rawTag);
    let {tag, weight} = this.normTagBody(tagBody);

    this.orig = orig;
    this.tag = tag;
    this.weight = weight;
    this.normalized = (
      leftParen
      + tag
      + (weight && `: ${weight}` || '')
      + rightParen
    );
  }

  get hashKey() {
    return this.normalized;
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
    let tag = '';
    let weight = 0;
    if (tagBody.indexOf(':') > -1) {
      [tag, weight] = tagBody.split(':', 2);
      weight = this.normWeight(right);
    } else {
      tag = tagBody;
    }
    return {tag, weight};
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


class TagFmt {
  constructor(inputId, resultId) {
    this.eInput = document.getElementById(inputId)
    this.eOutput = document.getElementById(resultId)
  }

  onInput() {
    this.eOutput.textContent = '';

    this.processTags(this.eInput.value).forEach(result => {
      let {tag, action} = result;

      switch (action) {
      case Action.Noop:
      case Action.Lint:
        const span = this.newSpan(tag, action.toLowerCase());
        this.eOutput.appendChild(span);
        break;
      case Action.Remove:
        console.log(`Removed ${tag.normalized}`);
        break;
      }
    });
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
      
      seen[hash] = true;
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
