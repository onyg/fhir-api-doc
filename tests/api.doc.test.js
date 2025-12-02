import apiDoc from '../src/api.doc.js';
import utils from '../src/utils.js';


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

describe('extractCapabilityStatement', () => {
    let div;

    beforeEach(() => {
        div = document.createElement('div');
        jest.spyOn(utils, 'isJson');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('returns null data and url when container is not found', () => {
        const result = apiDoc.extractCapabilityStatement(div);
    
        expect(result).toEqual({ data: null, url: null });
    });

    test('extracts data and url from #CapabilityStatement', () => {
        const container = document.createElement('div');
        container.id = 'CapabilityStatement';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '{"resourceType": "CapabilityStatement"}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractCapabilityStatement(div);
    
        expect(result.data).toBe('{"resourceType": "CapabilityStatement"}');
        expect(result.url).toBe('https://example.com/api');
    });

    test('handles #Capability-Statement id variant', () => {
        const container = document.createElement('div');
        container.id = 'Capability-Statement';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '{"test": true}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractCapabilityStatement(div);
    
        expect(result.data).toBe('{"test": true}');
        expect(result.url).toBe('https://example.com/api');
    });

    test('handles #capability-statement id variant', () => {
        const container = document.createElement('div');
        container.id = 'capability-statement';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '{}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractCapabilityStatement(div);
    
        expect(result.data).toBe('{}');
    });

    test('returns null data when content is not valid JSON', () => {
        const container = document.createElement('div');
        container.id = 'CapabilityStatement';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = 'not json';
        div.appendChild(container);

        utils.isJson.mockReturnValue(false);

        const result = apiDoc.extractCapabilityStatement(div);
    
        expect(result.data).toBeNull();
        expect(result.url).toBe('https://example.com/api');
    });

    test('handles missing data-url attribute', () => {
        const container = document.createElement('div');
        container.id = 'CapabilityStatement';
        container.textContent = '{"test": true}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractCapabilityStatement(div);
    
        expect(result.data).toBe('{"test": true}');
        expect(result.url).toBeNull();
    });

    test('handles empty textContent', () => {
        const container = document.createElement('div');
        container.id = 'CapabilityStatement';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '';
        div.appendChild(container);

        utils.isJson.mockReturnValue(false);

        const result = apiDoc.extractCapabilityStatement(div);
    
        expect(result.data).toBeNull();
        expect(result.url).toBe('https://example.com/api');
    });
});

describe('extractOperationDefinition', () => {
    let div;

    beforeEach(() => {
        div = document.createElement('div');
        jest.spyOn(utils, 'isJson');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('returns null data and url when container is not found', () => {
        const result = apiDoc.extractOperationDefinition(div);
    
        expect(result).toEqual({ data: null, url: null });
    });

    test('extracts data and url from #OperationDefinition', () => {
        const container = document.createElement('div');
        container.id = 'OperationDefinition';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '{"resourceType": "OperationDefinition"}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractOperationDefinition(div);
    
        expect(result.data).toBe('{"resourceType": "OperationDefinition"}');
        expect(result.url).toBe('https://example.com/api');
    });

    test('handles #Operation-Definition id variant', () => {
        const container = document.createElement('div');
        container.id = 'Operation-Definition';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '{"test": true}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractOperationDefinition(div);
    
        expect(result.data).toBe('{"test": true}');
        expect(result.url).toBe('https://example.com/api');
    });

    test('handles #operation-definition id variant', () => {
        const container = document.createElement('div');
        container.id = 'operation-definition';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '{}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractOperationDefinition(div);
    
        expect(result.data).toBe('{}');
    });

    test('returns null data when content is not valid JSON', () => {
        const container = document.createElement('div');
        container.id = 'OperationDefinition';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = 'not json';
        div.appendChild(container);

        utils.isJson.mockReturnValue(false);

        const result = apiDoc.extractOperationDefinition(div);
    
        expect(result.data).toBeNull();
        expect(result.url).toBe('https://example.com/api');
    });

    test('handles missing data-url attribute', () => {
        const container = document.createElement('div');
        container.id = 'OperationDefinition';
        container.textContent = '{"test": true}';
        div.appendChild(container);

        utils.isJson.mockReturnValue(true);

        const result = apiDoc.extractOperationDefinition(div);
    
        expect(result.data).toBe('{"test": true}');
        expect(result.url).toBeNull();
    });

    test('handles empty textContent', () => {
        const container = document.createElement('div');
        container.id = 'OperationDefinition';
        container.setAttribute('data-url', 'https://example.com/api');
        container.textContent = '';
        div.appendChild(container);

        utils.isJson.mockReturnValue(false);

        const result = apiDoc.extractOperationDefinition(div);
    
        expect(result.data).toBeNull();
        expect(result.url).toBe('https://example.com/api');
    });
});

describe('extractApiContent', () => {
    test('should extract all content when all sections are present', () => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div id="description">Test description <b>with HTML</b></div>
            <div id="CapabilityStatement" data-url="https://example.com/cap.json">{"resourceType": "CapabilityStatement"}</div>
            <div id="OperationDefinition" data-url="https://example.com/op.json">{"resourceType": "OperationDefinition"}</div>
            <div id="formats">
                <div data-value="application/json"></div>
                <div data-value="application/xml"></div>
            </div>
            <div id="response-examples">
                <div data-name="Example 1" data-type="json" data-url="https://example.com/response.json"></div>
            </div>
            <div id="request-examples">
                <div data-name="Request 1" data-type="xml">Some XML</div>
            </div>
            <div id="header-parameters">
                <div data-name="Authorization" data-type="string">Auth header</div>
            </div>
            <div id="search-parameters">
                <div data-name="status" data-type="token">Status param</div>
            </div>
            <div id="responses">
                <div data-code="200" data-error-code="" data-response-type="Success">OK response</div>
            </div>
        `;

        const result = apiDoc.extractApiContent(div);

        expect(result.description).toBe('Test description <b>with HTML</b>');
        expect(result.capabilityStatement.url).toBe('https://example.com/cap.json');
        expect(result.capabilityStatement.data).toBe('{"resourceType": "CapabilityStatement"}');
        expect(result.operationDefinition.url).toBe('https://example.com/op.json');
        expect(result.operationDefinition.data).toBe('{"resourceType": "OperationDefinition"}');
        expect(result.formats).toEqual(['application/json', 'application/xml']);
        expect(result.responseExamples).toHaveLength(1);
        expect(result.requestExamples).toHaveLength(1);
        expect(result.headerParams).toHaveLength(1);
        expect(result.searchParams).toHaveLength(1);
        expect(result.responseInfos).toHaveLength(1);
    });

    test('should return empty string for missing description', () => {
        const div = document.createElement('div');
        const result = apiDoc.extractApiContent(div);
        expect(result.description).toBe('');
    });

    test('should handle description with various ID casings', () => {
        const testCases = ['description', 'Description'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `<div id="${id}">Test content</div>`;
            const result = apiDoc.extractApiContent(div);
            expect(result.description).toBe('Test content');
        });
    });

    test('should handle CapabilityStatement with various ID casings', () => {
        const testCases = ['CapabilityStatement', 'Capability-Statement', 'capability-statement'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `<div id="${id}" data-url="test.json">{"test": true}</div>`;
            const result = apiDoc.extractApiContent(div);
            expect(result.capabilityStatement.data).toBe('{"test": true}');
            expect(result.capabilityStatement.url).toBe('test.json');
        });
    });

    test('should handle OperationDefinition with various ID casings', () => {
        const testCases = ['OperationDefinition', 'Operation-Definition', 'operation-definition'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `<div id="${id}" data-url="op.json">{"operation": true}</div>`;
            const result = apiDoc.extractApiContent(div);
            expect(result.operationDefinition.data).toBe('{"operation": true}');
            expect(result.operationDefinition.url).toBe('op.json');
        });
    });

    test('should handle formats with various ID casings', () => {
        const testCases = ['formats', 'Formats'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div id="${id}">
                    <div data-value="json"></div>
                    <div data-value="xml"></div>
                </div>
            `;
            const result = apiDoc.extractApiContent(div);
            expect(result.formats).toEqual(['json', 'xml']);
        });
    });

    test('should handle response-examples with various ID casings', () => {
        const testCases = ['response-examples', 'Response-Examples', 'ResponseExamples'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div id="${id}">
                    <div data-name="Ex1" data-type="json">data</div>
                </div>
            `;
            const result = apiDoc.extractApiContent(div);
            expect(result.responseExamples).toHaveLength(1);
        });
    });

    test('should handle request-examples with various ID casings', () => {
        const testCases = ['request-examples', 'Request-Examples', 'RequestExamples'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div id="${id}">
                    <div data-name="Ex1" data-type="json">data</div>
                </div>
            `;
            const result = apiDoc.extractApiContent(div);
            expect(result.requestExamples).toHaveLength(1);
        });
    });

    test('should handle header-parameters with various ID casings', () => {
        const testCases = ['header-parameters', 'Header-Parameters', 'HeaderParameters'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div id="${id}">
                    <div data-name="Auth" data-type="string">desc</div>
                </div>
            `;
            const result = apiDoc.extractApiContent(div);
            expect(result.headerParams).toHaveLength(1);
        });
    });

    test('should handle search-parameters with various ID casings', () => {
        const testCases = ['search-parameters', 'Search-Parameters', 'SearchParameters'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div id="${id}">
                    <div data-name="status" data-type="token">desc</div>
                </div>
            `;
            const result = apiDoc.extractApiContent(div);
            expect(result.searchParams).toHaveLength(1);
        });
    });

    test('should handle responses with various ID casings', () => {
        const testCases = ['responses', 'Responses'];
        
        testCases.forEach(id => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div id="${id}">
                    <div data-code="200">OK</div>
                </div>
            `;
            const result = apiDoc.extractApiContent(div);
            expect(result.responseInfos).toHaveLength(1);
        });
    });

    test('should return null for missing formats', () => {
        const div = document.createElement('div');
        const result = apiDoc.extractApiContent(div);
        expect(result.formats).toBeNull();
    });

    test('should return null for missing examples', () => {
        const div = document.createElement('div');
        const result = apiDoc.extractApiContent(div);
        expect(result.responseExamples).toBeNull();
        expect(result.requestExamples).toBeNull();
    });

    test('should return empty array for missing parameters', () => {
        const div = document.createElement('div');
        const result = apiDoc.extractApiContent(div);
        expect(result.headerParams).toEqual([]);
        expect(result.searchParams).toEqual([]);
    });

    test('should return empty array for missing responses', () => {
        const div = document.createElement('div');
        const result = apiDoc.extractApiContent(div);
        expect(result.responseInfos).toEqual([]);
    });

    test('should handle CapabilityStatement with non-JSON content', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="CapabilityStatement">Not JSON content</div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.capabilityStatement.data).toBeNull();
        expect(result.capabilityStatement.url).toBeNull();
    });

    test('should handle OperationDefinition with non-JSON content', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="OperationDefinition">Not JSON content</div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.operationDefinition.data).toBeNull();
        expect(result.operationDefinition.url).toBeNull();
    });

    test('should handle CapabilityStatement with only URL', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="CapabilityStatement" data-url="https://example.com/cap.json"></div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.capabilityStatement.data).toBeNull();
        expect(result.capabilityStatement.url).toBe('https://example.com/cap.json');
    });

    test('should handle OperationDefinition with only URL', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="OperationDefinition" data-url="https://example.com/op.json"></div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.operationDefinition.data).toBeNull();
        expect(result.operationDefinition.url).toBe('https://example.com/op.json');
    });

    test('should trim whitespace from description', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="description">  
            Test description with whitespace  
        </div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.description).toBe('Test description with whitespace');
    });

    test('should handle empty description div', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="description"></div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.description).toBe('');
    });

    test('should handle description with only whitespace', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="description">   </div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.description).toBe('');
    });

    test('should handle empty formats container', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="formats"></div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.formats).toEqual([]);
    });

    test('should handle empty examples containers', () => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div id="response-examples"></div>
            <div id="request-examples"></div>
        `;
        const result = apiDoc.extractApiContent(div);
        expect(result.responseExamples).toEqual([]);
        expect(result.requestExamples).toEqual([]);
    });

    test('should handle empty parameters containers', () => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div id="header-parameters"></div>
            <div id="search-parameters"></div>
        `;
        const result = apiDoc.extractApiContent(div);
        expect(result.headerParams).toEqual([]);
        expect(result.searchParams).toEqual([]);
    });

    test('should handle empty responses container', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="responses"></div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.responseInfos).toEqual([]);
    });

    test('should handle malformed JSON in CapabilityStatement', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="CapabilityStatement">{invalid json}</div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.capabilityStatement.data).toBeNull();
    });

    test('should preserve HTML entities in description', () => {
        const div = document.createElement('div');
        div.innerHTML = `<div id="description">&lt;b&gt;Bold&lt;/b&gt; &amp; special</div>`;
        const result = apiDoc.extractApiContent(div);
        expect(result.description).toContain('&lt;');
        expect(result.description).toContain('&amp;');
    });

    test('should handle nested HTML in description', () => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div id="description">
                <p>Paragraph 1</p>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            </div>
        `;
        const result = apiDoc.extractApiContent(div);
        expect(result.description).toContain('<p>');
        expect(result.description).toContain('<ul>');
        expect(result.description).toContain('<li>');
    });

    test('should return default structure when div is empty', () => {
        const div = document.createElement('div');
        const result = apiDoc.extractApiContent(div);
        
        expect(result).toEqual({
            description: '',
            capabilityStatement: { data: null, url: null },
            operationDefinition: { data: null, url: null },
            formats: null,
            responseExamples: null,
            requestExamples: null,
            headerParams: [],
            searchParams: [],
            responseInfos: []
        });
    });
});

describe('parseBaseUrl', () => {
    test('should parse a valid HTTPS URL with path', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/fhir/r4');
        expect(result).toEqual(['https://example.com', 'fhir/r4/']);
    });

    test('should parse a valid HTTP URL with path', () => {
        const result = apiDoc.parseBaseUrl('http://example.com/api');
        expect(result).toEqual(['http://example.com', 'api/']);
    });

    test('should parse URL with trailing slash', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/fhir/');
        expect(result).toEqual(['https://example.com', 'fhir/']);
    });

    test('should parse URL without path', () => {
        const result = apiDoc.parseBaseUrl('https://example.com');
        expect(result).toEqual(['https://example.com', '/']);
    });

    test('should parse URL with only root path', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/');
        expect(result).toEqual(['https://example.com', '/']);
    });

    test('should parse URL with port number', () => {
        const result = apiDoc.parseBaseUrl('https://example.com:8080/fhir');
        expect(result).toEqual(['https://example.com:8080', 'fhir/']);
    });

    test('should parse URL with deep path', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/api/v1/fhir/r4');
        expect(result).toEqual(['https://example.com', 'api/v1/fhir/r4/']);
    });

    test('should parse URL with query parameters', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/fhir?version=r4');
        expect(result).toEqual(['https://example.com', 'fhir/']);
    });

    test('should parse URL with hash fragment', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/fhir#section');
        expect(result).toEqual(['https://example.com', 'fhir/']);
    });

    test('should handle localhost', () => {
        const result = apiDoc.parseBaseUrl('http://localhost:3000/api');
        expect(result).toEqual(['http://localhost:3000', 'api/']);
    });

    test('should handle IP address', () => {
        const result = apiDoc.parseBaseUrl('http://192.168.1.1:8080/fhir');
        expect(result).toEqual(['http://192.168.1.1:8080', 'fhir/']);
    });

    test('should handle null input', () => {
        const result = apiDoc.parseBaseUrl(null);
        expect(result).toEqual([null, '']);
    });

    test('should handle undefined input', () => {
        const result = apiDoc.parseBaseUrl(undefined);
        expect(result).toEqual([null, '']);
    });

    test('should handle empty string', () => {
        const result = apiDoc.parseBaseUrl('');
        expect(result).toEqual([null, '']);
    });

    test('should handle URL with special characters in path', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/fhir/r4%20test');
        expect(result).toEqual(['https://example.com', 'fhir/r4%20test/']);
    });

    test('should handle URL with subdomain', () => {
        const result = apiDoc.parseBaseUrl('https://api.sub.example.com/fhir');
        expect(result).toEqual(['https://api.sub.example.com', 'fhir/']);
    });

    test('should parse URL with multiple consecutive slashes in path', () => {
        const result = apiDoc.parseBaseUrl('https://example.com/fhir//r4');
        expect(result).toEqual(['https://example.com', 'fhir//r4/']);
    });

    test('should handle file protocol', () => {
        const result = apiDoc.parseBaseUrl('file:///path/to/file');
        expect(result).toEqual(['file://', 'path/to/file/']);
    });
});
