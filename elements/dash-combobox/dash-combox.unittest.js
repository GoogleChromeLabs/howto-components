(function() {
  const expect = chai.expect;

  describe('dash-combobox', function() {
    before(dashElements.before());
    after(dashElements.after());
    beforeEach(function() {
      this.container.innerHTML = `
      `;
      return Promise.all([
        dashElements.waitForElement('dash-combobox'),
      ]).then(_ => {
        this.combobox = this.container.querySelector('dash-combobox');
      });
    });

    it('should be a thing', function() {
      expect(
        this.comboox
      ).to.not.equal(null);
    });
  });
})();
