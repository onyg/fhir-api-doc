import utils from '../src/utils.js';

describe('createElement', () => {
    test('should create a basic element with just a tag', () => {
        const element = utils.createElement('div');
        
        expect(element.tagName).toBe('DIV');
        expect(element.classList.length).toBe(0);
        expect(element.innerHTML).toBe('');
    });
});
