import utils from '../src/utils.js';

describe('createElement', () => {
    test('should create a basic element with just a tag', () => {
        const element = utils.createElement('div');
        
        expect(element.tagName).toBe('DIV');
        expect(element.classList.length).toBe(0);
        expect(element.innerHTML).toBe('');
    });

        test('should add single class to element', () => {
        const element = utils.createElement('div', { classes: ['container'] });
        
        expect(element.classList.contains('container')).toBe(true);
        expect(element.classList.length).toBe(1);
    });

    test('should add multiple classes to element', () => {
        const element = utils.createElement('div', { classes: ['container', 'active', 'flex'] });
        
        expect(element.classList.contains('container')).toBe(true);
        expect(element.classList.contains('active')).toBe(true);
        expect(element.classList.contains('flex')).toBe(true);
        expect(element.classList.length).toBe(3);
    });

    test('should set single attribute', () => {
        const element = utils.createElement('input', { attributes: { type: 'text' } });
        
        expect(element.getAttribute('type')).toBe('text');
    });

    test('should set multiple attributes', () => {
        const element = utils.createElement('input', { 
            attributes: { 
                type: 'email', 
                placeholder: 'Enter email',
                required: 'true'
            } 
        });
        
        expect(element.getAttribute('type')).toBe('email');
        expect(element.getAttribute('placeholder')).toBe('Enter email');
        expect(element.getAttribute('required')).toBe('true');
    });

    test('should set innerHTML', () => {
        const element = utils.createElement('div', { innerHTML: '<span>Gematik</span>' });
        
        expect(element.innerHTML).toBe('<span>Gematik</span>');
        expect(element.querySelector('span')).toBeTruthy();
    });

    test('should append single child element', () => {
        const child = document.createElement('span');
        const element = utils.createElement('div', { children: [child] });
        
        expect(element.children.length).toBe(1);
        expect(element.children[0]).toBe(child);
    });

    test('should append multiple child elements', () => {
        const child1 = document.createElement('span');
        const child2 = document.createElement('p');
        const child3 = document.createElement('button');
        const element = utils.createElement('div', { children: [child1, child2, child3] });
        
        expect(element.children.length).toBe(3);
        expect(element.children[0]).toBe(child1);
        expect(element.children[1]).toBe(child2);
        expect(element.children[2]).toBe(child3);
    });

    test('should handle all options together', () => {
        const child = document.createElement('span');
        const element = utils.createElement('div', {
            classes: ['toss', 'a'],
            attributes: { coin: 'for', 'your': 'poor' },
            innerHTML: '<p>developer</p>',
            children: [child]
        });
        
        expect(element.classList.contains('toss')).toBe(true);
        expect(element.classList.contains('a')).toBe(true);
        expect(element.getAttribute('coin')).toBe('for');
        expect(element.getAttribute('your')).toBe('poor');
        expect(element.innerHTML).toContain('<p>developer</p>');
        expect(element.children.length).toBeGreaterThan(0);
    });

    test('should handle empty arrays as parameter values', () => {
        const element = utils.createElement('div', { 
            classes: [], 
            attributes: {}, 
            children: [] 
        });
        
        expect(element.classList.length).toBe(0);
        expect(element.children.length).toBe(0);
    });

    test('should create different element types', () => {
        const div = utils.createElement('div');
        const span = utils.createElement('span');
        const button = utils.createElement('button');
        const input = utils.createElement('input');
        
        expect(div.tagName).toBe('DIV');
        expect(span.tagName).toBe('SPAN');
        expect(button.tagName).toBe('BUTTON');
        expect(input.tagName).toBe('INPUT');
    });

    test('should handle empty innerHTML string', () => {
        const element = utils.createElement('div', { innerHTML: '' });
        
        expect(element.innerHTML).toBe('');
    });

    test('should work with complex nested children', () => {
        const grandchild = document.createElement('span');
        const child = utils.createElement('div', { children: [grandchild] });
        const parent = utils.createElement('section', { children: [child] });
        
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].children.length).toBe(1);
        expect(parent.querySelector('span')).toBe(grandchild);
    });

    test('should return the created element', () => {
        const element = utils.createElement('div');
        
        expect(element).toBeInstanceOf(HTMLDivElement);
        expect(element.nodeType).toBe(Node.ELEMENT_NODE);
    });

    test('should handle null options parameter', () => {
        const element = utils.createElement('div', null);
        
        expect(element.tagName).toBe('DIV');
        expect(element.classList.length).toBe(0);
        expect(element.innerHTML).toBe('');
    });

    test('should handle undefined options parameter', () => {
        const element = utils.createElement('div', undefined);
        
        expect(element.tagName).toBe('DIV');
        expect(element.classList.length).toBe(0);
    });

    test('should filter out null in classes array', () => {
        const element = utils.createElement('div', { classes: ['valid', null, 'another'] });
        
        expect(element.classList.length).toBe(2);
        expect(element.classList.contains('valid')).toBe(true);
        expect(element.classList.contains('another')).toBe(true);
    });

    test('should filter out undefined in classes array', () => {
        const element = utils.createElement('div', { classes: ['valid', undefined, 'another'] });
        
        expect(element.classList.length).toBe(2);
        expect(element.classList.contains('valid')).toBe(true);
        expect(element.classList.contains('another')).toBe(true);
    });

    test('should filter out empty string in classes array', () => {
        const element = utils.createElement('div', { classes: ['valid', '', 'another'] });
        
        expect(element.classList.length).toBe(2);
        expect(element.classList.contains('valid')).toBe(true);
        expect(element.classList.contains('another')).toBe(true);
    });

    test('should filter out null value in attributes', () => {
        const element = utils.createElement('div', { 
            attributes: { 
                'data-valid': 'value',
                'data-null': null,
                'data-another': 'another'
            } 
        });
        
        expect(element.getAttribute('data-valid')).toBe('value');
        expect(element.getAttribute('data-null')).toBeNull();
        expect(element.getAttribute('data-another')).toBe('another');
    });

    test('should filter out undefined value in attributes', () => {
        const element = utils.createElement('div', { 
            attributes: { 
                'data-valid': 'value',
                'data-undefined': undefined
            } 
        });
        
        expect(element.getAttribute('data-valid')).toBe('value');
        expect(element.getAttribute('data-undefined')).toBeNull();
    });

    test('should handle null innerHTML', () => {
        const element = utils.createElement('div', { innerHTML: null });
        
        expect(element.innerHTML).toBe('');
    });

    test('should handle undefined innerHTML', () => {
        const element = utils.createElement('div', { innerHTML: undefined });
        
        expect(element.innerHTML).toBe('');
    });

    test('should handle null in children array', () => {
        expect(() => {
            utils.createElement('div', { children: [null] });
        }).toThrow();
    });

    test('should handle undefined in children array', () => {
        expect(() => {
            utils.createElement('div', { children: [undefined] });
        }).toThrow();
    });

    test('should throw for non-element in children array', () => {
        expect(() => {
            utils.createElement('div', { children: ['string'] });
        }).toThrow();
    });

    test('should handle non-object in children array', () => {
        expect(() => {
            utils.createElement('div', { children: [123] });
        }).toThrow();
    });

    test('should handle text node in children array', () => {
        const textNode = document.createTextNode('Hello');
        const element = utils.createElement('div', { children: [textNode] });
        
        expect(element.childNodes.length).toBe(1);
        expect(element.textContent).toBe('Hello');
    });

    test('should handle invalid tag name', () => {
        expect(() => {
            utils.createElement('');
        }).toThrow();
    });

    test('should throw for numeric tag name', () => {
        expect(() => {
            utils.createElement(123);
        }).toThrow();
    });

    test('should handle null tag name like native DOM', () => {
        const element = utils.createElement(null);
        expect(element.tagName).toBe('NULL');
    });

    test('should handle undefined tag name like native DOM', () => {
        const element = utils.createElement(undefined);
        expect(element.tagName).toBe('UNDEFINED');
    });

    test('should handle invalid HTML tag names gracefully', () => {
        const element = utils.createElement('invalid-custom-tag');
        
        expect(element).toBeTruthy();
        expect(element.tagName).toBe('INVALID-CUSTOM-TAG');
    });

    test('should handle special characters in class names', () => {
        const element = utils.createElement('div', { 
            classes: ['my-class', 'another_class', 'class123'] 
        });
        
        expect(element.classList.contains('my-class')).toBe(true);
        expect(element.classList.contains('another_class')).toBe(true);
        expect(element.classList.contains('class123')).toBe(true);
    });

    test('should filter out mixed null and valid classes', () => {
        const element = utils.createElement('div', { 
            classes: ['valid', null, undefined, '', 'another', false, 0] 
        });
        
        expect(element.classList.length).toBe(2);
        expect(element.classList.contains('valid')).toBe(true);
        expect(element.classList.contains('another')).toBe(true);
    });

    test('should handle empty object for attributes', () => {
        const element = utils.createElement('div', { attributes: {} });
        
        expect(element.attributes.length).toBe(0);
    });

    test('should handle very long class names', () => {
        const longClassName = 'a'.repeat(1000);
        const element = utils.createElement('div', { classes: [longClassName] });
        
        expect(element.classList.contains(longClassName)).toBe(true);
    });

    test('should handle very long innerHTML', () => {
        const longHTML = '<span>long, boring, and repetitive.</span>'.repeat(100);
        const element = utils.createElement('div', { innerHTML: longHTML });
        
        expect(element.innerHTML).toBe(longHTML);
    });

    test('should allow valid falsy attribute values', () => {
        const element = utils.createElement('div', { 
            attributes: { 
                'data-zero': 0,
                'data-false': false,
                'data-empty': ''
            } 
        });
        
        expect(element.getAttribute('data-zero')).toBe('0');
        expect(element.getAttribute('data-false')).toBe('false');
        expect(element.getAttribute('data-empty')).toBe('');
    });

    test('should handle children that are already appended elsewhere', () => {
        const child = document.createElement('span');
        const parent1 = utils.createElement('div', { children: [child] });
        const parent2 = utils.createElement('div', { children: [child] });
        
        // Child should be moved to parent2
        expect(parent1.children.length).toBe(0);
        expect(parent2.children.length).toBe(1);
        expect(parent2.children[0]).toBe(child);
    });

    test('should handle setting innerHTML after children', () => {
        const child = document.createElement('span');
        const element = utils.createElement('div', {
            innerHTML: '<p>Initial</p>',
            children: [child]
        });
        
        // innerHTML is set first, then children are appended
        expect(element.innerHTML).toContain('<p>Initial</p>');
        expect(element.children.length).toBeGreaterThan(1);
    });
});
