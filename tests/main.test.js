import main from '../src/main.js';

describe('resizeSVGs', () => {
    let container;
    let svgContainer;
    let svg;

    beforeEach(() => {
        container = document.createElement('div');
        svgContainer = document.createElement('div');
        svgContainer.classList.add('gem-ig-svg-container');
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
        svg.setAttribute('viewBox', '0 0 100 50');
    
        Object.defineProperty(svgContainer, 'clientWidth', { 
            value: 200, 
            writable: true 
        });
    
        svgContainer.appendChild(svg);
        container.appendChild(svgContainer);
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should resize SVG to match parent container width while maintaining aspect ratio', () => {
        svgContainer.clientWidth = '200';
    
        
        // Call the resizeSVGs function
        main.resizeSVGs();
        
        // Check that the SVG has been resized correctly
        expect(svg.style.width).toBe('200px');
        expect(svg.style.height).toBe('100px'); // 200 / (100/50) 
    });

    it('should not resize SVG when parent container has zero width', () => {
        svgContainer.clientWidth = '0';
        
        main.resizeSVGs();
        
        // Check that the SVG styles remain unchanged
        expect(svg.style.width).toBe('');
        expect(svg.style.height).toBe('');
    });

    it('should handle multiple SVGs in different containers', () => {

        // Create a second SVG container with a different width
        const svgContainer2 = document.createElement('div');
        svgContainer2.classList.add('gem-ig-svg-container');
        const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg2.setAttribute('viewBox', '0 0 200 100');

        Object.defineProperty(svgContainer2, 'clientWidth', { 
            value: 150, 
            writable: true 
        });
                
        svgContainer2.appendChild(svg2);
        container.appendChild(svgContainer2);
        
        main.resizeSVGs();
        
        expect(svg.style.width).toBe('200px');
        expect(svg.style.height).toBe('100px');
        
        expect(svg2.style.width).toBe('150px');
        expect(svg2.style.height).toBe('75px');
    });

    it('should handle SVGs with extreme aspect ratios', () => {
        // Very wide SVG
        svg.setAttribute('viewBox', '0 0 1000 10');
        svgContainer.clientWidth = '200';
        
        main.resizeSVGs();
        
        expect(svg.style.width).toBe('200px');
        expect(svg.style.height).toBe('2px'); // 200 / (1000/10)
        
        svg.setAttribute('viewBox', '0 0 10 1000');
        svgContainer.clientWidth = '100';
        
        main.resizeSVGs();
        
        expect(svg.style.width).toBe('100px');
        expect(svg.style.height).toBe('10000px'); // 100 / (10/1000)
    });
});
