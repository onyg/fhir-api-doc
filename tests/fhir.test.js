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