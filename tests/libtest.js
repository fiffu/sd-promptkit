class should {
  equal(a, b) {
    this.assert(a === b, `'${a}' should equal '${b}'`);
  }

  notEqual(a, b) {
    this.assert(a !== b, `'${a}' should not equal '${b}'`);
  }

  assert(bool, msg) {
    if (!bool) {
      throw new Error(msg);
    }
  }
}

module.exports.should = new should();
