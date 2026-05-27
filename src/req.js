import utils from './utils.js';
import gematikLabels from './labels.js'

document.addEventListener("DOMContentLoaded", () => {
    renderRequirements();
    hashLinkHighlight();
    addDataAnchorToRequirementLink();
});

function addDataAnchorToRequirementLink() {
    document.querySelectorAll(".requirement-link").forEach(function (link) {
        let anchor = link.getAttribute("data-anchor");
        if (anchor && link.href) {
            link.href = link.href + "#" + anchor;
        }
    });
}

function removeActorTags(xmlString) {
    xmlString = xmlString.replace(/<actor\b[^>]*>[\s\S]*?<\/actor>/gi, '');
    xmlString = xmlString.replace(/<actor\b[^>]*\/>/gi, '');
    return xmlString;
}

function removeMetaTags(xmlString) {
    xmlString = xmlString.replace(/<meta\b[^>]*>[\s\S]*?<\/meta>/gi, '');
    xmlString = xmlString.replace(/<meta\b[^>]*\/?>/gi, '');
    return xmlString;
}

function cleanRequirementDescription(desc) {
    desc = removeActorTags(desc);
    desc = removeMetaTags(desc);
    return desc;
}

function renderRequirements() {
    const requirements = document.querySelectorAll('requirement');

    requirements.forEach(req => {
        const reqKey = req.getAttribute('key') || '';
        const reqVersion = parseFloat(req.getAttribute('version')) || 0;

        const formattedVersion = reqVersion > 0
            ? String(reqVersion).padStart(2, '0')
            : '';

        const combinedReqKey = reqKey && reqVersion > 0
            ? `${reqKey}-${formattedVersion}`
            : reqKey;

        const actors = Array.from(req.querySelectorAll('actor'));

        let actorText = req.getAttribute('actor') || '';

        if (actors.length > 0) {
            actorText = actors
                .map(actor => actor.getAttribute('description') || actor.getAttribute('name'))
                .filter(Boolean)
                .join(', ');
        }

        const testProceduresByActor = actors
            .map(actor => {
                const actorName = actor.getAttribute('description') || actor.getAttribute('name') || '';

                const testProcedures = Array.from(actor.children)
                    .filter(child => child.tagName.toLowerCase() === 'testprocedure')
                    .map(tp => ({
                        id: tp.getAttribute('id') || '',
                        text: tp.textContent.trim()
                    }));

                return {
                    actorName,
                    testProcedures
                };
            })
            .filter(entry => entry.actorName && entry.testProcedures.length > 0);

        const titleText = req.getAttribute('title') || '';
        const conformanceText = utils.translateExpectation(req.getAttribute('conformance') || '');
        const descriptionHTML = cleanRequirementDescription(req.innerHTML.trim());

        const reqDiv = document.createElement('div');
        reqDiv.classList.add('requirement');

        if (combinedReqKey) {
            reqDiv.id = combinedReqKey;
        }

        const headingParts = [
            combinedReqKey,
            titleText,
            conformanceText
        ].filter(Boolean);

        if (headingParts.length > 0) {
            const heading = document.createElement('p');
            heading.classList.add('heading');
            heading.textContent = headingParts.join(' - ');
            reqDiv.appendChild(heading);

            if (combinedReqKey) {
                const anchor = document.createElement('a');
                anchor.href = `#${combinedReqKey}`;
                anchor.className = 'anchorjs-link';
                anchor.setAttribute('aria-label', 'Anchor');
                anchor.setAttribute('data-anchorjs-icon', '');
                anchor.style.font = '1em / 1 anchorjs-icons';
                anchor.style.paddingLeft = '0.375em';
                heading.appendChild(anchor);
            }
        }

        if (descriptionHTML) {
            const descP = document.createElement('p');
            descP.innerHTML = `${descriptionHTML} <span class="gem-req-workitem-fields-end-inner"><span class="gem-req-actor">${actorText}</span> [<=]</span>`;
            reqDiv.appendChild(descP);
        }

        const testProcedureRows = testProceduresByActor
            .flatMap(entry =>
                entry.testProcedures
                    .filter(tp => tp.text)
                    .map(tp => ({
                        actorName: entry.actorName,
                        text: tp.text
                    }))
            );

        if (testProcedureRows.length > 0) {
            const OPEN_SYM = '▼';
            const CLOSE_SYM = '►';

            const details = document.createElement('details');
            details.classList.add('gem-req-testprocedures');

            const summary = document.createElement('summary');

            const icon = document.createElement('span');
            icon.classList.add('gem-req-details-icon');
            icon.textContent = CLOSE_SYM;

            details.addEventListener('toggle', () => {
                icon.textContent = details.open
                    ? OPEN_SYM
                    : CLOSE_SYM;
            });

            summary.appendChild(icon);

            const summaryText = document.createElement('span');
            summaryText.classList.add('gem-req-details-title');
            summaryText.innerHTML =
                ` ${gematikLabels.requirements.TESTPROCEDURE} ${gematikLabels.common.FOR} ${combinedReqKey}`;

            summary.appendChild(summaryText);

            details.appendChild(summary);

            const table = document.createElement('table');

            const tbody = document.createElement('tbody');

            testProcedureRows.forEach(row => {
                const tr = document.createElement('tr');

                const actorTd = document.createElement('td');
                actorTd.textContent = row.actorName;

                const textTd = document.createElement('td');
                textTd.textContent = row.text;

                tr.appendChild(actorTd);
                tr.appendChild(textTd);
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            details.appendChild(table);
            reqDiv.appendChild(details);
        }

        req.parentElement.replaceChild(reqDiv, req);
    });
}

function hashLinkHighlightTarget(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        targetElement.classList.add('requirement-highlight');
        setTimeout(() => {
            targetElement.classList.remove('requirement-highlight');
        }, 2000);
    }
}

function hashLinkHighlight() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        hashLinkHighlightTarget(hash);
    }

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            hashLinkHighlightTarget(hash);
        }
    });
}

export default {
    addDataAnchorToRequirementLink,
    removeActorTags,
    removeMetaTags,
    cleanRequirementDescription,
    renderRequirements,
    hashLinkHighlightTarget,
    hashLinkHighlight
};
