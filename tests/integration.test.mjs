import fs from 'fs';

import path from 'path';
import capture from './helpers/capture.mjs'

describe('All golden test websites', () => {

    it('should be unchanged when rendered with current logic', async () => {
        const currentPages = await capture.capturePages('./tests/helpers/capture_config.json');

        for (const page of currentPages) {
            const pageName = page.page;
            const goldenPage = fs.readFileSync(path.join( './tests/golden_snapshot', pageName), 'utf8')
            expect(page.output).toBe(goldenPage);
        }
    }, 60000);
});