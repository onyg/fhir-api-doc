import fhir from '../src/fhir.js';

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
