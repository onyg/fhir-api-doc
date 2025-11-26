import fhir from '../src/fhir.js';
import utils from '../src/utils.js'

describe('extractExtensionValues', () => {

    it('should extract extension values for matching URL', () => {
        const input = [
            {
                url: 'https://example.com/extension',
                extension: [
                    { url: 'param1', valueString: 'value1' },
                    { url: 'param2', valueCode: 'value2' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        
        expect(result).toEqual([
            { param1: 'value1', param2: 'value2' }
        ]);
    });

    it('should handle multiple items with same target URL', () => {
        const input = [
            {
                url: 'https://example.com/extension',
                extension: [
                    { url: 'param1', valueString: 'value1' }
                ]
            },
            {
                url: 'https://example.com/extension',
                extension: [
                    { url: 'param2', valueString: 'value2' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        
        expect(result).toEqual([
            { param1: 'value1' },
            { param2: 'value2' }
        ]);
    });

    it('should filter out non-matching URLs', () => {
        const input = [
            {
                url: 'https://example.com/extension1',
                extension: [
                    { url: 'param1', valueString: 'value1' }
                ]
            },
            {
                url: 'https://example.com/extension2',
                extension: [
                    { url: 'param2', valueString: 'value2' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension1');
        
        expect(result).toEqual([
            { param1: 'value1' }
        ]);
    });

    it('should handle different value types (valueString, valueCode, valueBoolean, etc.)', () => {
        const input = [
            {
                url: 'https://example.com/extension',
                extension: [
                    { url: 'string', valueString: 'text' },
                    { url: 'code', valueCode: 'CODE' },
                    { url: 'boolean', valueBoolean: true },
                    { url: 'integer', valueInteger: 42 },
                    { url: 'decimal', valueDecimal: 3.14 }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        
        expect(result).toEqual([{
            string: 'text',
            code: 'CODE',
            boolean: true,
            integer: 42,
            decimal: 3.14
        }]);
    });

    it('should handle complex value types', () => {
        const input = [
            {
                url: 'https://example.com/extension',
                extension: [
                    { url: 'object', valueCodeableConcept: { coding: [] } },
                    { url: 'array', valueReference: { reference: 'Example/123' } }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        
        expect(result).toEqual([{
            object: { coding: [] },
            array: { reference: 'Example/123' }
        }]);
    });

    it('should skip extensions with URL starting with "value"', () => {
        const input = [
            {
                url: 'https://example.com/extension',
                extension: [
                    { url: 'valueParam', valueString: 'should-be-skipped' },
                    { url: 'validParam', valueString: 'should-be-included' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        
        expect(result).toEqual([
            { validParam: 'should-be-included' }
        ]);
    });

    it('should skip extensions without any value* property', () => {
        const input = [
            {
                url: 'https://example.com/extension',
                extension: [
                    { url: 'noValue' },
                    { url: 'hasValue', valueString: 'value' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        
        expect(result).toEqual([
            { hasValue: 'value' }
        ]);
    });

    it('should return empty array for empty input', () => {
        const result = fhir.extractExtensionValues([], 'https://example.com/extension');
        expect(result).toEqual([]);
    });

    it('should return empty array when no URLs match', () => {
        const input = [
            {
                url: 'https://example.com/other',
                extension: [
                    { url: 'param1', valueString: 'value1' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        expect(result).toEqual([]);
    });

    it('should return empty object when extension array is empty', () => {
        const input = [
            {
                url: 'https://example.com/extension',
                extension: []
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        expect(result).toEqual([{}]);
    });

    it('Should handle missing extension property', () => {
        const input = [
            {
                url: 'https://example.com/extension'
                // missing extension property
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        expect(result).toEqual([{}]);
    });

    it('should handle URL with special characters', () => {
        const input = [
            {
                url: 'https://example.com/extension?param=1&other=2',
                extension: [
                    { url: 'param1', valueString: 'value1' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension?param=1&other=2');
        expect(result).toEqual([{ param1: 'value1' }]);
    });

    it('should be case-sensitive for URLs', () => {
        const input = [
            {
                url: 'https://example.com/Extension',
                extension: [
                    { url: 'param1', valueString: 'value1' }
                ]
            }
        ];

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        expect(result).toEqual([]);
    });

    it('should handle large arrays efficiently', () => {
        const input = Array(1000).fill(null).map((_, i) => ({
            url: i % 2 === 0 ? 'https://example.com/extension' : 'https://example.com/other',
            extension: [
                { url: `param${i}`, valueString: `value${i}` }
            ]
        }));

        const result = fhir.extractExtensionValues(input, 'https://example.com/extension');
        
        expect(result).toHaveLength(500);
        expect(result[0]).toHaveProperty('param0', 'value0');
    });
});

describe('extractExtensionValue', () => {
    it('should extract valueString from matching extension', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: 'value1' },
            { url: 'https://example.com/ext2', valueString: 'value2' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should return null when extension is not found', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/non-existent');
        
        expect(result).toBeNull();
    });

    it('should return null when extensions is null', () => {
        const result = fhir.extractExtensionValue(null, 'https://example.com/ext1');
        
        expect(result).toBeNull();
    });

    it('should return null when extensions is undefined', () => {
        const result = fhir.extractExtensionValue(undefined, 'https://example.com/ext1');
        
        expect(result).toBeNull();
    });

    it('should return null when extensions is not an array', () => {
        const result = fhir.extractExtensionValue('not-an-array', 'https://example.com/ext1');
        
        expect(result).toBeNull();
    });

    it('should return null when extensions is an object (not array)', () => {
        const extensions = { url: 'https://example.com/ext1', valueString: 'value1' };
        
        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBeNull();
    });

    it('should return null when extensions is an empty array', () => {
        const result = fhir.extractExtensionValue([], 'https://example.com/ext1');
        
        expect(result).toBeNull();
    });

    it('should ignore extensions with non-string valueString', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: 123 },
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should ignore extensions with null valueString', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: null },
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should ignore extensions with undefined valueString', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: undefined },
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should ignore extensions with missing valueString property', () => {
        const extensions = [
            { url: 'https://example.com/ext1' },
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should ignore extensions with different value types (valueCode, valueBoolean, etc.)', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueCode: 'code1' },
            { url: 'https://example.com/ext1', valueBoolean: true },
            { url: 'https://example.com/ext1', valueInteger: 42 },
            { url: 'https://example.com/ext1', valueString: 'correct' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('correct');
    });

    it('should handle extensions with null elements in array', () => {
        const extensions = [
            null,
            { url: 'https://example.com/ext1', valueString: 'value1' },
            undefined
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should handle extensions with missing url property', () => {
        const extensions = [
            { valueString: 'no-url' },
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should handle extensions with null url property', () => {
        const extensions = [
            { url: null, valueString: 'null-url' },
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should handle extensions with non-string url property', () => {
        const extensions = [
            { url: 123, valueString: 'number-url' },
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should return null when url parameter is null', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, null);
        
        expect(result).toBeNull();
    });

    it('should return null when url parameter is undefined', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, undefined);
        
        expect(result).toBeNull();
    });

    it('should return null for empty string as valueString', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: '' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe(null);
    });

    it('should handle whitespace string as valueString', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: '   ' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('   ');
    });

    it('should perform exact URL matching (case-sensitive)', () => {
        const extensions = [
            { url: 'https://example.com/EXT1', valueString: 'uppercase' },
            { url: 'https://example.com/ext1', valueString: 'lowercase' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('lowercase');
    });

    it('should not perform partial URL matching', () => {
        const extensions = [
            { url: 'https://example.com/ext1/extra', valueString: 'longer' },
            { url: 'https://example.com/ext', valueString: 'shorter' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBeNull();
    });

    it('should handle extensions array with non-object elements', () => {
        const extensions = [
            'string-element',
            123,
            true,
            { url: 'https://example.com/ext1', valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('value1');
    });

    it('should handle very long URL strings', () => {
        const longUrl = 'https://example.com/' + 'a'.repeat(1000);
        const extensions = [
            { url: longUrl, valueString: 'value1' }
        ];

        const result = fhir.extractExtensionValue(extensions, longUrl);
        
        expect(result).toBe('value1');
    });

    it('should handle special characters in valueString', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: '特殊文字 !@#$%^&*()' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('特殊文字 !@#$%^&*()');
    });

    it('should handle newlines and tabs in valueString', () => {
        const extensions = [
            { url: 'https://example.com/ext1', valueString: 'line1\nline2\ttab' }
        ];

        const result = fhir.extractExtensionValue(extensions, 'https://example.com/ext1');
        
        expect(result).toBe('line1\nline2\ttab');
    });
});

describe('extractBaseUrl', () => {
    test('should extract base URL from extensions', () => {
        const extensions = [
            {
                url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-base-url',
                valueString: 'https://api.example.com/fhir'
            }
        ];
    
        const result = fhir.extractBaseUrl(extensions);
        expect(result).toBe('https://api.example.com/fhir');
    });

    test('should return null when no base URL extension found', () => {
        const extensions = [
            {
                url: 'https://gematik.de/fhir/ti/StructureDefinition/other-extension',
                valueString: 'other-value'
            }
        ];
    
        const result = fhir.extractBaseUrl(extensions);
        expect(result).toBeNull();
    });

    test('should return null when extensions is null', () => {
        const result = fhir.extractBaseUrl(null);
        expect(result).toBeNull();
    });
});

describe('fhir.extractHttpMethods', () => {
    it('should return default ["POST"] when extensions is undefined', () => {
        const result = fhir.extractHttpMethods(undefined);
        expect(result).toEqual(["POST"]);
    });

    it('should return default ["POST"] when extensions is null', () => {
        const result = fhir.extractHttpMethods(null);
        expect(result).toEqual(["POST"]);
    });

    it('should return default ["POST"] when extensions is not an array', () => {
        const result = fhir.extractHttpMethods({});
        expect(result).toEqual(["POST"]);
    });

    it('should return default ["POST"] when extensions is an empty array', () => {
        const result = fhir.extractHttpMethods([]);
        expect(result).toEqual(["POST"]);
    });

    it('should return default ["POST"] when no matching extension URL is found', () => {
        const extensions = [
            {
                url: "https://some-other-url.com",
                valueCode: "GET"
            }
        ];
        const result = fhir.extractHttpMethods(extensions);
        expect(result).toEqual(["POST"]);
    });

    it('should extract a single HTTP method', () => {
        const extensions = [
            {
                url: "https://gematik.de/fhir/ti/StructureDefinition/extension-http-method",
                valueCode: "GET"
            }
        ];
        const result = fhir.extractHttpMethods(extensions);
        expect(result).toEqual(["GET"]);
    });

    it('should extract multiple HTTP methods', () => {
        const extensions = [
            {
                url: "https://gematik.de/fhir/ti/StructureDefinition/extension-http-method",
                valueCode: "GET"
            },
            {
                url: "https://gematik.de/fhir/ti/StructureDefinition/extension-http-method",
                valueCode: "POST"
            },
            {
                url: "https://gematik.de/fhir/ti/StructureDefinition/extension-http-method",
                valueCode: "PUT"
            }
        ];
        const result = fhir.extractHttpMethods(extensions);
        expect(result).toEqual(["GET", "POST", "PUT"]);
    });

    it('should convert methods to uppercase', () => {
        const extensions = [
            {
                url: "https://gematik.de/fhir/ti/StructureDefinition/extension-http-method",
                valueCode: "get"
            },
            {
                url: "https://gematik.de/fhir/ti/StructureDefinition/extension-http-method",
                valueCode: "Post"
            }
        ];
        const result = fhir.extractHttpMethods(extensions);
        expect(result).toEqual(["GET", "POST"]);
    });
});

describe('fhir.extractHeaderValues', () => {
    const targetUrl = "https://gematik.de/fhir/ti/StructureDefinition/extension-http-header";

    test('should return empty array when input array is empty', () => {
        const result = fhir.extractHeaderValues([]);
        expect(result).toEqual([]);
    });

    test('should return empty array when no matching URL found', () => {
        const extensions = [
            {
                url: 'https://some-other-url.com',
                extension: [
                    { url: 'name', valueString: 'Content-Type' }
                ]
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([]);
    });

    test('should extract single header with one extension property', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'Content-Type' }
                ]
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([
            { name: 'Content-Type' }
        ]);
    });

    test('should extract single header with multiple extension properties', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'Authorization' },
                    { url: 'required', valueBoolean: true },
                    { url: 'description', valueString: 'Bearer token' }
                ]
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([
            {
                name: 'Authorization',
                required: true,
                description: 'Bearer token'
            }
        ]);
    });

    test('should extract multiple headers', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'Content-Type' }
                ]
            },
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'Authorization' },
                    { url: 'required', valueBoolean: true }
                ]
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([
            { name: 'Content-Type' },
            { name: 'Authorization', required: true }
        ]);
    });

    test('should handle different value types (valueString, valueBoolean, valueInteger, valueCode)', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'X-Custom-Header' },
                    { url: 'required', valueBoolean: false },
                    { url: 'maxLength', valueInteger: 255 },
                    { url: 'type', valueCode: 'string' }
                ]
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([
            {
                name: 'X-Custom-Header',
                required: false,
                maxLength: 255,
                type: 'string'
            }
        ]);
    });

    test('should skip extension items where url starts with "value"', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'Content-Type' },
                    { url: 'valueString', valueString: 'should-be-skipped' }, // malformed
                    { url: 'valueCode', valueCode: 'also-skipped' }, // malformed
                    { url: 'required', valueBoolean: true }
                ]
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([
            {
                name: 'Content-Type',
                required: true
            }
        ]);
    });

    test('should handle mixed matching and non-matching URLs', () => {
        const extensions = [
            {
                url: 'https://other-url.com',
                extension: [
                    { url: 'ignored', valueString: 'ignored' }
                ]
            },
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'Accept' }
                ]
            },
            {
                url: 'https://another-url.com',
                extension: [
                    { url: 'alsoIgnored', valueString: 'ignored' }
                ]
            },
            {
                url: targetUrl,
                extension: [
                    { url: 'name', valueString: 'Content-Type' }
                ]
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([
            { name: 'Accept' },
            { name: 'Content-Type' }
        ]);
    });

    test('should return empty array when extensions is undefined', () => {
        const result = fhir.extractHeaderValues(undefined);
        expect(result).toEqual([]);
    });

    test('should return empty array when extensions is null', () => {
        const result = fhir.extractHeaderValues(null);
        expect(result).toEqual([]);
    });

    test('should handle empty extension array within matching item', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: []
            }
        ];

        const result = fhir.extractHeaderValues(extensions);
        expect(result).toEqual([{}]);
    });
});

describe('fhir.extractResponseInfoValues', () => {
    const targetUrl = "https://gematik.de/fhir/ti/StructureDefinition/extension-http-response-info";

    test('should return empty array when input array is empty', () => {
        const result = fhir.extractResponseInfoValues([]);
        expect(result).toEqual([]);
    });

    test('should return empty array when no matching URL found', () => {
        const extensions = [
            {
                url: 'https://some-other-url.com',
                extension: [
                    { url: 'code', valueString: '200' }
                ]
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([]);
    });

    test('should extract single response info with one extension property', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '200' }
                ]
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([
            { code: '200' }
        ]);
    });

    test('should extract single response info with multiple extension properties', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '200' },
                    { url: 'message', valueString: 'OK' },
                    { url: 'description', valueString: 'Success response' }
                ]
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([
            {
                code: '200',
                message: 'OK',
                description: 'Success response'
            }
        ]);
    });

    test('should extract multiple response infos', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '200' },
                    { url: 'message', valueString: 'OK' }
                ]
            },
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '404' },
                    { url: 'message', valueString: 'Not Found' }
                ]
            },
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '500' },
                    { url: 'message', valueString: 'Internal Server Error' }
                ]
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([
            { code: '200', message: 'OK' },
            { code: '404', message: 'Not Found' },
            { code: '500', message: 'Internal Server Error' }
        ]);
    });

    test('should handle different value types (valueString, valueBoolean, valueInteger, valueCode)', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '201' },
                    { url: 'message', valueString: 'Created' },
                    { url: 'isSuccess', valueBoolean: true },
                    { url: 'statusCode', valueInteger: 201 },
                    { url: 'category', valueCode: 'success' }
                ]
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([
            {
                code: '201',
                message: 'Created',
                isSuccess: true,
                statusCode: 201,
                category: 'success'
            }
        ]);
    });

    test('should skip extension items where url starts with "value"', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '200' },
                    { url: 'valueString', valueString: 'should-be-skipped' }, // malformed
                    { url: 'valueCode', valueCode: 'also-skipped' }, // malformed
                    { url: 'message', valueString: 'OK' }
                ]
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([
            {
                code: '200',
                message: 'OK'
            }
        ]);
    });

    test('should handle mixed matching and non-matching URLs', () => {
        const extensions = [
            {
                url: 'https://other-url.com',
                extension: [
                    { url: 'ignored', valueString: 'ignored' }
                ]
            },
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '200' }
                ]
            },
            {
                url: 'https://another-url.com',
                extension: [
                    { url: 'alsoIgnored', valueString: 'ignored' }
                ]
            },
            {
                url: targetUrl,
                extension: [
                    { url: 'code', valueString: '404' }
                ]
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([
            { code: '200' },
            { code: '404' }
        ]);
    });

    test('should return empty array when extensions is undefined', () => {
        const result = fhir.extractResponseInfoValues(undefined);
        expect(result).toEqual([]);
    });

    test('should return empty array when extensions is null', () => {
        const result = fhir.extractResponseInfoValues(null);
        expect(result).toEqual([]);
    });

    test('should handle empty extension array within matching item', () => {
        const extensions = [
            {
                url: targetUrl,
                extension: []
            }
        ];

        const result = fhir.extractResponseInfoValues(extensions);
        expect(result).toEqual([{}]);
    });
});

describe('parseGlobalServerInfo', () => {
    test('should parse capability statement with all extensions', () => {
        const data = {
            format: ['application/fhir+json', 'application/fhir+xml'],
            extension: [
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-base-url',
                    valueString: 'https://example.com/fhir'
                },
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-header',
                    extension: [
                        { url: 'name', valueString: 'Authorization' }
                    ]
                },
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-response-info',
                    extension: [
                        { url: 'code', valueString: '200' },
                        { url: 'message', valueString: 'OK' }
                    ]
                }
            ]
        };

        const result = fhir.parseGlobalServerInfo(data);

        expect(result).toEqual({
            headerParams: [{ name: 'Authorization' }],
            responseInfos: [{ code: '200', message: 'OK' }],
            formats: ['application/fhir+json', 'application/fhir+xml'],
            baseUrl: 'https://example.com/fhir'
        });
    });

    test('should handle missing extensions array', () => {
        const data = {
            format: ['application/fhir+json']
        };

        const result = fhir.parseGlobalServerInfo(data);

        expect(result).toEqual({
            headerParams: [],
            responseInfos: [],
            formats: ['application/fhir+json'],
            baseUrl: null
        });
    });

    test('should handle empty extensions array', () => {
        const data = {
            format: ['application/fhir+json'],
            extension: []
        };

        const result = fhir.parseGlobalServerInfo(data);

        expect(result).toEqual({
            headerParams: [],
            responseInfos: [],
            formats: ['application/fhir+json'],
            baseUrl: null
        });
    });

    test('should handle multiple header extensions', () => {
        const data = {
            format: ['application/fhir+json'],
            extension: [
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-header',
                    extension: [
                        { url: 'name', valueString: 'Authorization' }
                    ]
                },
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-header',
                    extension: [
                        { url: 'name', valueString: 'X-Custom-Header' }
                    ]
                }
            ]
        };

        const result = fhir.parseGlobalServerInfo(data);

        expect(result.headerParams).toHaveLength(2);
        expect(result.headerParams[0]).toEqual({ name: 'Authorization'});
        expect(result.headerParams[1]).toEqual({ name: 'X-Custom-Header'});
    });

    test('should handle multiple response info extensions', () => {
        const data = {
            format: ['application/fhir+json'],
            extension: [
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-response-info',
                    extension: [
                        { url: 'code', valueString: '200' },
                        { url: 'message', valueString: 'OK' }
                    ]
                },
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-response-info',
                    extension: [
                        { url: 'code', valueString: '404' },
                        { url: 'message', valueString: 'Not Found' }
                    ]
                }
            ]
        };

        const result = fhir.parseGlobalServerInfo(data);

        expect(result.responseInfos).toHaveLength(2);
        expect(result.responseInfos[0]).toEqual({ code: '200', message: 'OK' });
        expect(result.responseInfos[1]).toEqual({ code: '404', message: 'Not Found' });
    });

    test('should handle null data gracefully', () => {
        const data = null;

        const result = fhir.parseGlobalServerInfo(data);

        expect(result).toEqual({
            headerParams: [],
            responseInfos: [],
            formats: undefined,
            baseUrl: null
        });
    });
});

describe('getRelatedSearchParams', () => {

    beforeEach(() => {
        jest.spyOn(utils, 'translateExpectation');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should return undefined when no interactions exist', () => {
        const resourceDetails = {
            searchParam: [{ name: 'name', type: 'string' }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toBeUndefined();
    });

    test('should return undefined when interaction array is empty', () => {
        const resourceDetails = {
            interaction: [],
            searchParam: [{ name: 'name', type: 'string' }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toBeUndefined();
    });

    test('should return undefined when search-type interaction not found', () => {
        const resourceDetails = {
            interaction: [
                { code: 'read' },
                { code: 'create' },
                { code: 'update' }
            ],
            searchParam: [{ name: 'name', type: 'string' }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toBeUndefined();
    });

    test('should process searchParams when search-type interaction exists', () => {
        const resourceDetails = {
            interaction: [
                { code: 'read' },
                { code: 'search-type' },
                { code: 'create' }
            ],
            searchParam: [
                { name: 'name', type: 'string', definition: 'http://example.com' }
            ]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            name: 'name',
            type: 'string',
            definition: 'http://example.com'
        });
    });

    test('should return undefined when searchParam is undefined', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: undefined
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toBeUndefined();
    });

    test('should undefined array when searchParam is null', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: null
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toBeUndefined();
    });

    test('should return undefined when searchParam is empty array', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: []
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toBeUndefined();
    });

    test('should map all search parameters', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [
                { name: 'name', type: 'string', definition: 'http://example.com/name' },
                { name: 'birthdate', type: 'date', definition: 'http://example.com/birthdate' },
                { name: 'gender', type: 'token', definition: 'http://example.com/gender' }
            ]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toHaveLength(3);
        expect(result.map(p => p.name)).toEqual(['name', 'birthdate', 'gender']);
    });

    test('should map name, definition, and type fields', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'identifier',
                definition: 'http://hl7.org/fhir/SearchParameter/Patient-identifier',
                type: 'token'
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result[0]).toMatchObject({
            name: 'identifier',
            definition: 'http://hl7.org/fhir/SearchParameter/Patient-identifier',
            type: 'token'
        });
    });

    test('should use default documentation when not provided', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string'
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result[0].documentation).toBe('No description');
    });

    test('should use provided documentation when available', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string',
                documentation: 'Search by patient name'
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result[0].documentation).toBe('Search by patient name');
    });

    test('should handle empty string documentation', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string',
                documentation: ''
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result[0].documentation).toBe('');
    });

    test('should return undefined expectation when no extension exists', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string'
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result[0].expectation).toBeUndefined();
        expect(utils.translateExpectation).toHaveBeenCalledWith(undefined);
    });

    test('should return undefined expectation when extension array is empty', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string',
                extension: []
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result[0].expectation).toBeUndefined();
        expect(utils.translateExpectation).toHaveBeenCalledWith(undefined);
    });

    test('should return undefined expectation when expectation extension not found', () => {
        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string',
                extension: [
                    { url: 'http://example.com/other', valueCode: 'something' }
                ]
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result[0].expectation).toBeUndefined();
        expect(utils.translateExpectation).toHaveBeenCalledWith(undefined);
    });

    test('should extract and translate expectation extension', () => {
        utils.translateExpectation.mockReturnValue('SHALL_TRANSLATED');

        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string',
                extension: [{
                    url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
                    valueCode: 'SHALL'
                }]
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(utils.translateExpectation).toHaveBeenCalledWith('SHALL');
        expect(result[0].expectation).toBe('SHALL_TRANSLATED');
    });

    test('should handle multiple extensions and find correct one', () => {
        utils.translateExpectation.mockReturnValue('SHOULD');

        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [{
                name: 'name',
                type: 'string',
                extension: [
                    { url: 'http://example.com/custom', valueCode: 'custom' },
                    { url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation', valueCode: 'SHOULD' },
                    { url: 'http://example.com/other', valueCode: 'other' }
                ]
            }]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(utils.translateExpectation).toHaveBeenCalledWith('SHOULD');
        expect(result[0].expectation).toBe('SHOULD');
    });

    test('should handle different expectation values', () => {
        const expectations = ['SHALL', 'SHOULD', 'MAY', 'SHOULD-NOT'];

        expectations.forEach(expectedValue => {
            utils.translateExpectation.mockReturnValue(expectedValue);

            const resourceDetails = {
                interaction: [{ code: 'search-type' }],
                searchParam: [{
                    name: 'name',
                    type: 'string',
                    extension: [{
                        url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
                        valueCode: expectedValue
                    }]
                }]
            };

            const result = fhir.getRelatedSearchParams(resourceDetails);

            expect(result[0].expectation).toBe(expectedValue);
        });
    });

    test('should handle multiple search params with mixed extensions', () => {
        utils.translateExpectation
            .mockReturnValueOnce('SHALL')
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce('MAY');

        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [
                {
                    name: 'name',
                    type: 'string',
                    definition: 'http://example.com/name',
                    documentation: 'Patient name',
                    extension: [{
                        url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
                        valueCode: 'SHALL'
                    }]
                },
                {
                    name: 'birthdate',
                    type: 'date',
                    definition: 'http://example.com/birthdate'
                    // No extension
                },
                {
                    name: 'gender',
                    type: 'token',
                    definition: 'http://example.com/gender',
                    documentation: 'Gender',
                    extension: [{
                        url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
                        valueCode: 'MAY'
                    }]
                }
            ]
        };

        const result = fhir.getRelatedSearchParams(resourceDetails);

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({
            name: 'name',
            expectation: 'SHALL',
            documentation: 'Patient name'
        });
        expect(result[1]).toMatchObject({
            name: 'birthdate',
            expectation: undefined,
            documentation: 'No description'
        });
        expect(result[2]).toMatchObject({
            name: 'gender',
            expectation: 'MAY',
            documentation: 'Gender'
        });
    });

    test('should not mutate original resourceDetails', () => {
        const originalSearchParam = {
            name: 'name',
            type: 'string',
            definition: 'http://example.com'
        };

        const resourceDetails = {
            interaction: [{ code: 'search-type' }],
            searchParam: [originalSearchParam]
        };

        fhir.getRelatedSearchParams(resourceDetails);

        expect(originalSearchParam).toEqual({
            name: 'name',
            type: 'string',
            definition: 'http://example.com'
        });
    });
});


describe('parseFhirCapabilityStatement', () => {
    
    test('should parse complete capability statement with search-type interaction', () => {
        const capabilityStatement = {
            format: ['json', 'xml'],
            extension: [
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-base-url',
                    valueString: 'https://api.example.com'
                },
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-header',
                    extension: [
                        { url: 'name', valueString: 'Authorization' },
                        { url: 'value', valueString: 'Bearer token' }
                    ]
                },
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-response-info',
                    extension: [
                        { url: 'code', valueString: '200' },
                        { url: 'message', valueString: 'OK' }
                    ]
                }
            ],
            rest: [{
                resource: [{
                    type: 'Patient',
                    conditionalUpdate: true,
                    interaction: [{
                        code: 'search-type',
                        extension: [
                            {
                                url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-header',
                                extension: [
                                    { url: 'x-custom', valueString: 'local-value' }
                                ]
                            }
                        ]
                    }],
                    searchParam: [{
                        name: 'identifier',
                        definition: 'http://example.com/identifier',
                        type: 'token',
                        documentation: 'Search by identifier',
                        extension: [{
                            url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
                            valueCode: 'VALUECODEVALUE'
                        }]
                    }],
                    searchInclude: ['Patient:organization'],
                    searchRevInclude: ['Observation:patient']
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient', 'search-type');

        expect(result.searchParams).toHaveLength(1);
        expect(result.searchParams[0]).toEqual({
            name: 'identifier',
            definition: 'http://example.com/identifier',
            type: 'token',
            documentation: 'Search by identifier',
            expectation: 'VALUECODEVALUE'
        });
        expect(result.searchInclude).toEqual(['Patient:organization']);
        expect(result.searchRevInclude).toEqual(['Observation:patient']);
        expect(result.headerParams).toHaveLength(2);
        expect(result.responseInfos).toHaveLength(1);
        expect(result.formats).toEqual(['json', 'xml']);
        expect(result.conditionalUpdate).toBe(true);
        expect(result.baseUrl).toBe('https://api.example.com');
    });

    test('should return empty object when resourceType is not found', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient'
                }]
            }]
        };

        console.error = jest.fn();
        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Observation');

        expect(result).toEqual({});
        expect(console.error).toHaveBeenCalledWith('Observation not found in any rest entry!');
    });

    test('should return empty structure when requested interaction not found', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{
                        code: 'read'
                    }],
                    searchParam: []
                }]
            }]
        };

        console.error = jest.fn();
        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient', 'search-type');

        expect(result).toEqual({
            baseUrl: null,
            conditionalUpdate: undefined,
            formats: undefined,
            headerParams: [],
            responseInfos: [],
            searchInclude: undefined,
            searchParams: undefined,
            searchRevInclude: undefined,
        });
    });

    test('should handle missing searchParam field', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }]
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.searchParams).toBeUndefined();
        expect(result.headerParams).toEqual([]);
    });

    test('should handle searchParam without documentation', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: [{
                        name: 'name',
                        definition: 'http://example.com/name',
                        type: 'string'
                    }]
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.searchParams[0].documentation).toBe('No description');
    });

    test('should handle searchParam without expectation extension', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: [{
                        name: 'name',
                        definition: 'http://example.com/name',
                        type: 'string',
                        documentation: 'Search by name'
                    }]
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.searchParams[0].expectation).toBeUndefined();
    });

    test('should handle empty rest array', () => {
        const capabilityStatement = {
            rest: []
        };

        console.error = jest.fn();
        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result).toEqual({});
    });

    test('should handle missing rest field', () => {
        const capabilityStatement = {};

        console.error = jest.fn();
        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result).toEqual({});
    });

    test('should handle missing extension field', () => {
        const capabilityStatement = {
            format: ['json'],
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: []
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.headerParams).toEqual([]);
        expect(result.responseInfos).toEqual([]);
        expect(result.baseUrl).toBeNull();
    });

    test('should handle missing resource array', () => {
        const capabilityStatement = {
            rest: [{}]
        };

        console.error = jest.fn();
        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result).toEqual({});
    });

    test('should parse JSON string input', () => {
        const capabilityStatement = JSON.stringify({
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: []
                }]
            }]
        });

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.searchParams).toBeUndefined();
    });

    test('should prioritize local headers over global headers', () => {
        const capabilityStatement = {
            extension: [
                {
                    url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-header',
                    extension: [
                        { url: 'global-header', valueString: 'global' }
                    ]
                }
            ],
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{
                        code: 'search-type',
                        extension: [
                            {
                                url: 'https://gematik.de/fhir/ti/StructureDefinition/extension-http-header',
                                extension: [
                                    { url: 'local-header', valueString: 'local' }
                                ]
                            }
                        ]
                    }],
                    searchParam: []
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.headerParams).toHaveLength(2);
        expect(result.headerParams[0]).toHaveProperty('local-header');
        expect(result.headerParams[1]).toHaveProperty('global-header');
    });

    test('should handle interaction without extension field', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: []
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.headerParams).toEqual([]);
        expect(result.responseInfos).toEqual([]);
    });

    test('should handle multiple rest entries and find resource in second entry', () => {
        const capabilityStatement = {
            rest: [
                {
                    resource: [{
                        type: 'Observation',
                        interaction: [{ code: 'search-type' }]
                    }]
                },
                {
                    resource: [{
                        type: 'Patient',
                        interaction: [{ code: 'search-type' }],
                        searchParam: [{
                            name: 'id',
                            definition: 'http://example.com/id',
                            type: 'token',
                            documentation: 'ID search'
                        }]
                    }]
                }
            ]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.searchParams).toHaveLength(1);
        expect(result.searchParams[0].name).toBe('id');
    });

    test('should default to search-type interaction when no code provided', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: [{ name: 'name', type: 'string' }]
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.searchParams).toContainEqual(
            {
                "definition": undefined,
                "documentation": "No description",
                "expectation": undefined,
                "name": "name",
                "type": "string"
            }
        );
    });

    test('should ignore non-matching interactions when using default', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [
                        { code: 'read' },
                        { code: 'create' }
                    ],
                    searchParam: [{ name: 'name', type: 'string' }]
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        // Should not find search params since search-type interaction missing
        expect(result).toEqual({
            baseUrl: null,
            conditionalUpdate: undefined,
            formats: undefined,
            headerParams: [],
            responseInfos: [],
            searchInclude: undefined,
            searchParams: undefined,
            searchRevInclude: undefined,
        });
    });

    test('should handle conditionalUpdate as false', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    conditionalUpdate: false,
                    searchParam: []
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.conditionalUpdate).toBe(false);
    });

    test('should handle missing conditionalUpdate field', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: []
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.conditionalUpdate).toBeUndefined();
    });

    test('should handle multiple search parameters', () => {
        const capabilityStatement = {
            rest: [{
                resource: [{
                    type: 'Patient',
                    interaction: [{ code: 'search-type' }],
                    searchParam: [
                        {
                            name: 'identifier',
                            definition: 'http://example.com/identifier',
                            type: 'token',
                            documentation: 'Search by identifier'
                        },
                        {
                            name: 'name',
                            definition: 'http://example.com/name',
                            type: 'string'
                        },
                        {
                            name: 'birthdate',
                            definition: 'http://example.com/birthdate',
                            type: 'date',
                            documentation: 'Search by birthdate',
                            extension: [{
                                url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
                                valueCode: 'MAY'
                            }]
                        }
                    ]
                }]
            }]
        };

        const result = fhir.parseFhirCapabilityStatement(capabilityStatement, 'Patient');

        expect(result.searchParams).toHaveLength(3);
        expect(result.searchParams[0].name).toBe('identifier');
        expect(result.searchParams[1].name).toBe('name');
        expect(result.searchParams[1].documentation).toBe('No description');
        expect(result.searchParams[2].expectation).toBe('KANN');
    });
});
