import apiDoc from '../src/api.doc.js';
const { parseExampleDivs } = apiDoc;

jest.mock('../css/ig.apidoc.gematik.css', () => ({}));

describe('parseExampleDivs', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should return null for null container', () => {
        expect(parseExampleDivs(null)).toBeNull();
    });

    it('should return empty array for empty container', () => {
        expect(parseExampleDivs(container)).toEqual([]);
    });

    it('should parse div with data attributes and innerHTML', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'test');
        div.setAttribute('data-type', 'json');
        div.innerHTML = '{"key": "value"}';
        container.appendChild(div);

        const result = parseExampleDivs(container);
        expect(result).toEqual([{
            name: 'test',
            type: 'json',
            render: null,
            data: '{"key": "value"}'
        }]);
    });

    it('should parse div with data-url instead of innerHTML', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'test');
        div.setAttribute('data-type', 'xml');
        div.setAttribute('data-url', 'http://example.com/data.xml');
        container.appendChild(div);

        const result = parseExampleDivs(container);
        expect(result).toEqual([{
            name: 'test',
            type: 'xml',
            render: null,
            url: 'http://example.com/data.xml'
        }]);
    });

    it('should parse div with data-render attribute', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'test');
        div.setAttribute('data-type', 'html');
        div.setAttribute('data-render', 'true');
        div.innerHTML = '<div>test</div>';
        container.appendChild(div);

        const result = parseExampleDivs(container);
        expect(result).toEqual([{
            name: 'test',
            type: 'html',
            render: 'true',
            data: '<div>test</div>'
        }]);
    });

    it('should handle multiple example divs', () => {
        const div1 = document.createElement('div');
        div1.setAttribute('data-name', 'test1');
        div1.setAttribute('data-type', 'json');
        div1.innerHTML = '{"key": "value"}';

        const div2 = document.createElement('div');
        div2.setAttribute('data-name', 'test2');
        div2.setAttribute('data-type', 'xml');
        div2.setAttribute('data-url', 'http://example.com/data.xml');

        container.append(div1, div2);

        const result = parseExampleDivs(container);
        expect(result).toEqual([
            {
                name: 'test1',
                type: 'json',
                render: null,
                data: '{"key": "value"}'
            },
            {
                name: 'test2',
                type: 'xml',
                render: null,
                url: 'http://example.com/data.xml'
            }
        ]);
    });

    it('should trim innerHTML whitespace', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'test');
        div.setAttribute('data-type', 'json');
        div.innerHTML = '\n  {"key": "value"}  \n';
        container.appendChild(div);

        const result = parseExampleDivs(container);
        expect(result).toEqual([{
            name: 'test',
            type: 'json',
            render: null,
            data: '{"key": "value"}'
        }]);
    });

    it('should handle empty innerHTML as empty string', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'test');
        div.setAttribute('data-type', 'json');
        div.innerHTML = '';
        container.appendChild(div);

        const result = parseExampleDivs(container);
        expect(result).toEqual([{
            name: 'test',
            type: 'json',
            render: null,
            data: ''
        }]);
    });

    it('should skip divs missing required attributes', () => {
        const div1 = document.createElement('div');
        div1.setAttribute('data-name', 'test1');
        div1.innerHTML = 'content'; // missing data-type

        const div2 = document.createElement('div');
        div2.setAttribute('data-type', 'json');
        div2.innerHTML = 'content'; // missing data-name

        container.append(div1, div2);

        const result = parseExampleDivs(container);
        expect(result).toEqual([]);
    });
});
