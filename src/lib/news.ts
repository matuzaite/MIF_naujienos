import config from '@/config/portal.config.json';
import { parse } from 'node-html-parser';

const BASE = 'https://mif.vu.lt/lt3/';

function fixImageSrcs(html: string): string {
    if (!html) return html;
    const root = parse(html);

    // Remove the first image which is the Joomla injected thumbnail
    const firstImg = root.querySelector('img');
    if (firstImg) {
        const parent = firstImg.parentNode as any;
        firstImg.remove();
        if (parent && parent.tagName === 'P' && parent.text.trim() === '' && parent.childNodes.length === 0) {
            parent.remove();
        }
    }

    root.querySelectorAll('img').forEach(function(img) {
        // Pakeista: .getAttribute('data-src')?.trim() → su && patikrinimu
        var rawDataSrc = img.getAttribute('data-src');
        var dataSrc = rawDataSrc ? rawDataSrc.trim() : '';

        var rawSrc = img.getAttribute('src');
        var src = rawSrc ? rawSrc.trim() : '';

        // Pakeista: ?? → ternary su !== null && !== undefined
        var best: string | null;
        if (dataSrc && !dataSrc.startsWith('data:')) {
            best = dataSrc;
        } else if (src && !src.startsWith('data:')) {
            best = src;
        } else {
            best = null;
        }

        if (best) {
            try {
                var absoluteUrl = new URL(best, BASE).href;
                // Nukreipiame per Next.js image optimizer:
                // browser gaus WebP 800px, q=60 (~50-150 KB) vietoj originalaus JPG/PNG (1-3 MB)
                var optimizedUrl = '/_next/image?url=' + encodeURIComponent(absoluteUrl) + '&w=800&q=60';
                img.setAttribute('src', optimizedUrl);
                img.setAttribute('loading', 'lazy');
                img.setAttribute('decoding', 'async');
            } catch (error) {
                img.setAttribute('src', best);
            }
        }
    });
    return root.innerHTML;
}

export async function fetchNews() {
    try {
        const res = await fetch(config.feeds.naujienos, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
            next: { revalidate: 0 },
        });
        const xml = await res.text();
        const root = parse(xml, { lowerCaseTagName: true });

        return root.querySelectorAll('item')
            .slice(0, config.scraping.maxItems)
            .map(function(item) {
                var titleNode = item.querySelector('title');
                var title = (titleNode && titleNode.text ? titleNode.text : '').replace(/<[^>]*>?/gm, '').trim();


                var pubDateNode = item.querySelector('pubDate');
                var pubDate = pubDateNode && pubDateNode.text ? pubDateNode.text : '';

                var date = new Date(
                    pubDate && !isNaN(Date.parse(pubDate)) ? pubDate : Date.now()
                ).toLocaleDateString('lt-LT');

                var descNode = item.querySelector('description');
                var description = descNode && descNode.innerHTML ? descNode.innerHTML : '';

                if (description.includes('<![CDATA[')) {
                    description = description.split('<![CDATA[').join('').split(']]>').join('');
                }
                description = fixImageSrcs(description);

                return { title: title, date: date, category: 'Naujiena', description: description };
            });

    } catch (error) {
        console.error('News fetch error:', error);
        return [];
    }
}
