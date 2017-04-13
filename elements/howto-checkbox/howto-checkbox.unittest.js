(function() {
  const expect = chai.expect;

  describe('howto-checkbox', function() {
    before(howtoComponents.before());
    after(howtoComponents.after());
    beforeEach(function() {
      this.container.innerHTML = `<howto-checkbox></howto-checkbox>`;
      return howtoComponents.waitForElement('howto-checkbox')
        .then(_ => {
          this.checkbox = this.container.querySelector('howto-checkbox');
        });
    });

    it('should add a `role` to the checkbox', function() {
      expect(this.checkbox.getAttribute('role')).to.equal('checkbox');
    });

    it('should add a `tabindex` to the checkbox', function() {
      expect(this.checkbox.getAttribute('tabindex')).to.equal('0');
    });

    it('should toggle `checked` and `aria-checked` when calling ' +
      '`_toggleChecked`', function() {
        expect(this.checkbox.checked).to.equal(false);
        this.checkbox._toggleChecked();
        expect(this.checkbox.getAttribute('aria-checked')).to.equal('true');
        expect(this.checkbox.checked).to.equal(true);
    });

    it('should toggle `checked` and `aria-checked` when setting `checked` ' +
        'property', function() {
        expect(this.checkbox.checked).to.equal(false);
        this.checkbox.checked = true;
        expect(this.checkbox.getAttribute('aria-checked')).to.equal('true');
        expect(this.checkbox.checked).to.equal(true);
    });

    it('should toggle `disabled`, `aria-disabled`, and `tabindex` when ' +
       'setting disabled property', function() {
        expect(this.checkbox.disabled).to.equal(false);
        this.checkbox.disabled = true;
        expect(this.checkbox.getAttribute('aria-disabled')).to.equal('true');
        expect(this.checkbox.hasAttribute('tabindex')).to.equal(false);
        expect(this.checkbox.disabled).to.equal(true);
    });
  });
})();
