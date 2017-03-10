const expect = chai.expect; // FIXME: expect has already been declared

describe('dash-checkbox', function() {
  before(dashElements.before());
  after(dashElements.after());
  beforeEach(function() {
    this.container.innerHTML = `
      <dash-checkbox></dash-checkbox>
    `;
    dashElements.waitForElement('dash-checkbox')
      .then(_ => {
        this.checkbox = this.container.querySelector('dash-checkbox');
      });
  });

  it('should add a `role` to the checkbox', function() {
    expect(this.checkbox.getAttribute('role')).to.equal('checkbox');
  });

  it('should set `aria-checked` to `false`', function() {
    expect(this.checkbox.getAttribute('aria-checked')).to.equal('false');
  });

  it('should add a `tabindex` to the checkbox', function() {
    expect(this.checkbox.getAttribute('tabindex')).to.equal('0');
  });
});
