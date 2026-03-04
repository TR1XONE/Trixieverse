import * as cheerio from 'cheerio';

async function run() {
    try {
        console.log("Fetching wr-meta.com...");
        const res = await fetch('https://wr-meta.com/');
        const html = await res.text();
        const $ = cheerio.load(html);

        const links: string[] = [];
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.match(/^\/\d+-[\w-]+\.html$/)) {
                links.push(href);
            }
        });

        const uniqueLinks = [...new Set(links)];
        console.log(`Found ${uniqueLinks.length} champion links.`);
        if (uniqueLinks.length > 0) {
            console.log("First 5 links:", uniqueLinks.slice(0, 5));
            console.log("Fetching Ahri specifically to check if build items are in the DOM...");
            const ahriRes = await fetch('https://wr-meta.com/1-ahri.html');
            const ahriHtml = await ahriRes.text();

            const ahri$ = cheerio.load(ahriHtml);
            let items: string[] = [];
            let runes: string[] = [];

            ahri$('.item').each((_, el) => {
                const img = ahri$(el).find('img').attr('alt');
                if (img) items.push(img);
            });

            // Or look for any image with /items/ and /runes/
            ahri$('img').each((_, img) => {
                const src = ahri$(img).attr('src') || '';
                const alt = ahri$(img).attr('alt') || '';
                if (src.includes('/items/')) items.push(alt);
                if (src.includes('/runes/')) runes.push(alt);
            });

            if (items.length > 0) {
                console.log("ITEMS FOUND! WR-META is statically generated.");
                console.log("Items:", [...new Set(items)]);
                console.log("Runes:", [...new Set(runes)]);
            } else {
                console.log("No items found. The DOM is likely dynamically rendered by JS.");
            }
        }
    } catch (e) {
        console.error(e);
    }
}
run();
