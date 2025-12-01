import apiDoc from '../src/api.doc.js';

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
        expect(apiDoc.parseExampleDivs(null)).toBeNull();
    });

    it('should return empty array for empty container', () => {
        expect(apiDoc.parseExampleDivs(container)).toEqual([]);
    });

    it('should parse div with data attributes and innerHTML', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'test');
        div.setAttribute('data-type', 'json');
        div.innerHTML = '{"key": "value"}';
        container.appendChild(div);

        const result = apiDoc.parseExampleDivs(container);
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

        const result = apiDoc.parseExampleDivs(container);
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

        const result = apiDoc.parseExampleDivs(container);
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

        const result = apiDoc.parseExampleDivs(container);
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
        div.innerHTML = '  {"key": "value"}  ';
        container.appendChild(div);

        const result = apiDoc.parseExampleDivs(container);
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

        const result = apiDoc.parseExampleDivs(container);
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

        const result = apiDoc.parseExampleDivs(container);
        expect(result).toEqual([]);
    });
});

describe('parseValueDivs', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should return null for null container', () => {
        expect(apiDoc.parseValueDivs(null)).toBeNull();
    });

    it('should return empty array for empty container', () => {
        expect(apiDoc.parseValueDivs(container)).toEqual([]);
    });

    it('should return empty array for container with no matching divs', () => {
        const div = document.createElement('div');
        div.setAttribute('data-other', 'value');
        container.appendChild(div);
        expect(apiDoc.parseValueDivs(container)).toEqual([]);
    });

    it('should parse single div with data-value', () => {
        const div = document.createElement('div');
        div.setAttribute('data-value', 'test-value');
        container.appendChild(div);
        expect(apiDoc.parseValueDivs(container)).toEqual(['test-value']);
    });

    it('should parse multiple divs with data-value', () => {
        const div1 = document.createElement('div');
        div1.setAttribute('data-value', 'value1');
        const div2 = document.createElement('div');
        div2.setAttribute('data-value', 'value2');
        container.append(div1, div2);
        expect(apiDoc.parseValueDivs(container)).toEqual(['value1', 'value2']);
    });

    it('should handle empty data-value as empty string', () => {
        const div = document.createElement('div');
        div.setAttribute('data-value', '');
        container.appendChild(div);
        expect(apiDoc.parseValueDivs(container)).toEqual(['']);
    });

    it('should handle special characters in data-value', () => {
        const div = document.createElement('div');
        div.setAttribute('data-value', 'special&chars<>"\'');
        container.appendChild(div);
        expect(apiDoc.parseValueDivs(container)).toEqual(['special&chars<>"\'']);
    });

    it('should consider nested divs with data-value', () => {
        const outerDiv = document.createElement('div');
        outerDiv.setAttribute('data-value', 'outer');
        const innerDiv = document.createElement('div');
        innerDiv.setAttribute('data-value', 'inner');
        outerDiv.appendChild(innerDiv);
        container.appendChild(outerDiv);
        expect(apiDoc.parseValueDivs(container)).toEqual(['outer', 'inner']);
    });
});

describe('parseParams', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should return empty array for null container', () => {
        expect(apiDoc.parseParams(null)).toEqual([]);
    });

    it('should return empty array for empty container', () => {
        expect(apiDoc.parseParams(container)).toEqual([]);
    });

    it('should parse div with data-name and data-type attributes', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'param1');
        div.setAttribute('data-type', 'string');
        div.innerHTML = 'Parameter description';
        container.appendChild(div);

        const result = apiDoc.parseParams(container);
        expect(result).toEqual([{
            name: 'param1',
            type: 'string',
            documentation: 'Parameter description',
            description: 'Parameter description',
            expectation: ''
        }]);
    });

    it('should handle multiple parameter divs', () => {
        const div1 = document.createElement('div');
        div1.setAttribute('data-name', 'param1');
        div1.setAttribute('data-type', 'string');
        div1.innerHTML = 'First param';

        const div2 = document.createElement('div');
        div2.setAttribute('data-name', 'param2');
        div2.setAttribute('data-type', 'number');
        div2.innerHTML = 'Second param';

        container.append(div1, div2);

        const result = apiDoc.parseParams(container);
        expect(result).toEqual([
            {
                name: 'param1',
                type: 'string',
                documentation: 'First param',
                description: 'First param',
                expectation: ''
            },
            {
                name: 'param2',
                type: 'number',
                documentation: 'Second param',
                description: 'Second param',
                expectation: ''
            }
        ]);
    });

    it('should handle empty innerHTML as empty string', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'param1');
        div.setAttribute('data-type', 'string');
        div.innerHTML = '';
        container.appendChild(div);

        const result = apiDoc.parseParams(container);
        expect(result).toEqual([{
            name: 'param1',
            type: 'string',
            documentation: '',
            description: '',
            expectation: ''
        }]);
    });

    it('should trim innerHTML whitespace', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'param1');
        div.setAttribute('data-type', 'string');
        div.innerHTML = '  Parameter description  ';
        container.appendChild(div);

        const result = apiDoc.parseParams(container);
        expect(result).toEqual([{
            name: 'param1',
            type: 'string',
            documentation: 'Parameter description',
            description: 'Parameter description',
            expectation: ''
        }]);
    });

    it('should handle special characters in innerHTML', () => {
        const div = document.createElement('div');
        div.setAttribute('data-name', 'param1');
        div.setAttribute('data-type', 'string');
        div.innerHTML = 'Description with <tags> & entities';
        container.appendChild(div);

        const result = apiDoc.parseParams(container);
        expect(result).toEqual([{
            name: 'param1',
            type: 'string',
            documentation: 'Description with <tags> &amp; entities</tags>',
            description: 'Description with <tags> &amp; entities</tags>',
            expectation: ''
        }]);
    });
});

describe('parseResponseInfos', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should return empty array for null container', () => {
        expect(apiDoc.parseResponseInfos(null)).toEqual([]);
    });

    it('should return empty array for empty container', () => {
        expect(apiDoc.parseResponseInfos(container)).toEqual([]);
    });

    it('should parse div with all response info attributes', () => {
        const div = document.createElement('div');
        div.setAttribute('data-code', '200');
        div.setAttribute('data-error-code', 'OK');
        div.setAttribute('data-response-type', 'application/json');
        div.innerHTML = 'Successful response';
        container.appendChild(div);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([{
            statusCode: '200',
            errorCode: 'OK',
            description: 'Successful response',
            responseType: 'application/json'
        }]);
    });

    it('should handle missing optional attributes', () => {
        const div = document.createElement('div');
        div.setAttribute('data-code', '404');
        div.innerHTML = 'Not found';
        container.appendChild(div);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([{
            statusCode: '404',
            errorCode: null,
            description: 'Not found',
            responseType: null
        }]);
    });

    it('should handle multiple response info divs', () => {
        const div1 = document.createElement('div');
        div1.setAttribute('data-code', '200');
        div1.setAttribute('data-error-code', 'OK');
        div1.innerHTML = 'Success';

        const div2 = document.createElement('div');
        div2.setAttribute('data-code', '400');
        div2.setAttribute('data-response-type', 'application/json');
        div2.innerHTML = 'Bad request';

        container.append(div1, div2);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([
            {
                statusCode: '200',
                errorCode: 'OK',
                description: 'Success',
                responseType: null
            },
            {
                statusCode: '400',
                errorCode: null,
                description: 'Bad request',
                responseType: 'application/json'
            }
        ]);
    });

    it('should trim description whitespace', () => {
        const div = document.createElement('div');
        div.setAttribute('data-code', '200');
        div.innerHTML = '  Success  ';
        container.appendChild(div);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([{
            statusCode: '200',
            errorCode: null,
            description: 'Success',
            responseType: null
        }]);
    });

    it('should handle empty description as empty string', () => {
        const div = document.createElement('div');
        div.setAttribute('data-code', '204');
        div.innerHTML = '';
        container.appendChild(div);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([{
            statusCode: '204',
            errorCode: null,
            description: '',
            responseType: null
        }]);
    });

    it('should handle special characters in description', () => {
        const div = document.createElement('div');
        div.setAttribute('data-code', '200');
        div.innerHTML = 'Response with <tags> & entities';
        container.appendChild(div);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([{
            statusCode: '200',
            errorCode: null,
            description: 'Response with <tags> &amp; entities</tags>',
            responseType: null
        }]);
    });

    it('should handle numeric status codes', () => {
        const div = document.createElement('div');
        div.setAttribute('data-code', '500');
        div.innerHTML = 'Server error';
        container.appendChild(div);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([{
            statusCode: '500',
            errorCode: null,
            description: 'Server error',
            responseType: null
        }]);
    });

    it('should handle non-numeric status codes', () => {
        const div = document.createElement('div');
        div.setAttribute('data-code', '4XX');
        div.innerHTML = 'Client error';
        container.appendChild(div);

        const result = apiDoc.parseResponseInfos(container);
        expect(result).toEqual([{
            statusCode: '4XX',
            errorCode: null,
            description: 'Client error',
            responseType: null
        }]);
    });
});

describe('extractApiConfig', () => {
    test('should extract all attributes when present', () => {
        const div = document.createElement('div');
        div.setAttribute('data-api-type', 'FHIR');
        div.setAttribute('data-api-fhir-resource-type', 'Patient');
        div.setAttribute('data-api-fhir-interaction', 'read');
        div.setAttribute('data-api-operation-id', 'op123');
        div.setAttribute('data-api-url-path', '/api/v1/patients');
        div.setAttribute('data-api-fhir-invoke-level', 'instance');
        div.setAttribute('data-api-method', 'GET');

        const result = apiDoc.extractApiConfig(div);

        expect(result).toEqual({
            apiType: 'FHIR',
            resourceType: 'Patient',
            interaction: 'read',
            operationId: 'op123',
            urlPath: '/api/v1/patients',
            invokeLevel: 'instance',
            httpMethod: 'GET',
        });
    });

    test('should use default ApiType.CUSTOM when data-api-type is missing', () => {
        const div = document.createElement('div');

        const result = apiDoc.extractApiConfig(div);

        expect(result.apiType).toBe(apiDoc.ApiType.CUSTOM);
    });

    test('should return null for missing attributes except apiType', () => {
        const div = document.createElement('div');

        const result = apiDoc.extractApiConfig(div);

        expect(result.resourceType).toBeNull();
        expect(result.interaction).toBeNull();
        expect(result.operationId).toBeNull();
        expect(result.urlPath).toBeNull();
        expect(result.invokeLevel).toBeNull();
        expect(result.httpMethod).toBeNull();
    });

    test('should handle mix of present and missing attributes', () => {
        const div = document.createElement('div');
        div.setAttribute('data-api-url-path', '/api/test');
        div.setAttribute('data-api-method', 'POST');

        const result = apiDoc.extractApiConfig(div);

        expect(result.apiType).toBe(apiDoc.ApiType.CUSTOM);
        expect(result.urlPath).toBe('/api/test');
        expect(result.httpMethod).toBe('POST');
        expect(result.resourceType).toBeNull();
    });
});
