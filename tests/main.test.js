import main from '../src/main.js';
import gematikLabels from '../src/labels.js';

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
    
        
        main.resizeSVGs();
        
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

describe('downloadSVG', () => {
    let container;
    let originalFetch = window.fetch;
    let mockURL;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        mockURL = {
            createObjectURL: jest.fn().mockReturnValue('blob:mockurl')
        };
        global.URL = mockURL;

        global.XMLSerializer = jest.fn(() => ({
            serializeToString: jest.fn().mockReturnValue('<svg></svg>')
        }));
    });

    afterEach(() => {
        document.body.removeChild(container);

        delete global.URL;
        delete global.XMLSerializer;
    });

    it('should create download buttons for embedded SVGs', () => {
        // Create an SVG container with an embedded SVG
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('gem-ig-svg-container');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svgContainer.appendChild(svg);
        container.appendChild(svgContainer);

        main.downloadSVG();

        // Check that a download link was created
        const downloadLink = svgContainer.querySelector('.gem-ig-download-btn');
        expect(downloadLink).toBeTruthy();
        expect(downloadLink.innerText).toBe(gematikLabels.ig.Download_Button_SVG);
        expect(downloadLink.download).toBe('downloaded.svg');
        expect(downloadLink.href).toBe('blob:mockurl');
    });

    it('should create download buttons for SVG images', async () => {
        // Create an SVG image
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('gem-ig-svg-container');
        const img = document.createElement('img');
        img.src = 'test.svg';
        imgContainer.appendChild(img);
        container.appendChild(imgContainer);

        window.fetch = jest.fn().mockImplementation(() => 
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('<svg></svg>')
            })
        );

        main.downloadSVG();

        await new Promise(resolve => {
            setTimeout(() => {
                const downloadLink = imgContainer.querySelector('.gem-ig-download-btn');
                expect(downloadLink).toBeTruthy();
                expect(downloadLink.innerText).toBe(gematikLabels.ig.Download_Button_SVG);
                expect(downloadLink.download).toBe('downloaded.svg');
                expect(downloadLink.href).toBe('blob:mockurl');
                resolve();
            }, 10);
        });

        window.fetch = originalFetch;
    });

    it('should handle fetch errors for SVG images gracefully', async () => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('gem-ig-svg-container');
        const img = document.createElement('img');
        img.src = 'test.svg';
        imgContainer.appendChild(img);
        container.appendChild(imgContainer);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Mock fetch to return an error
        window.fetch = jest.fn().mockImplementation(() => 
            Promise.resolve({
                ok: false,
                statusText: 'Not Found'
            })
        );

        main.downloadSVG();

        await new Promise(resolve => {
            setTimeout(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Error fetching SVG from <img>:', 
                    expect.any(Error)
                );
                
                const downloadLink = imgContainer.querySelector('.gem-ig-download-btn');
                expect(downloadLink).toBeFalsy();

                consoleErrorSpy.mockRestore();
                resolve();
            }, 10);
        });

        window.fetch = originalFetch;
    });

    it('should handle serialization errors for embedded SVGs', () => {
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('gem-ig-svg-container');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svgContainer.appendChild(svg);
        container.appendChild(svgContainer);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Mock XMLSerializer to throw an error
        global.XMLSerializer = jest.fn(() => ({
            serializeToString: () => { throw new Error('Serialization failed'); }
        }));

        main.downloadSVG();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error processing embedded SVG:', 
            expect.any(Error)
        );

        const downloadLink = svgContainer.querySelector('.gem-ig-download-btn');
        expect(downloadLink).toBeFalsy();

        consoleErrorSpy.mockRestore();
    });
});

