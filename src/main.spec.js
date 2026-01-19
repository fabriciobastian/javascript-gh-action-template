const { myHelpFunction } = require('./main');

describe('main', () => {
  describe('myHelpFunction', () => {
    it('should return the help text', () => {
      const exampleInput = 'example-input';
      const helpText = myHelpFunction(exampleInput);
      expect(helpText).toBe(`${exampleInput} + my help text`);
    });
  });
});
