import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

// Curated list of UPSC-relevant feeds
const FEEDS = [
    { id: 'hindu', title: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', category: 'National' },
    { id: 'pib', title: 'PIB', url: 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3', category: 'Government' },
    { id: 'ie_explained', title: 'IE Explained', url: 'https://indianexpress.com/section/explained/feed/', category: 'Explained' },
    { id: 'ie_editorials', title: 'IE Editorials', url: 'https://indianexpress.com/section/opinion/editorials/feed/', category: 'Editorial' },
    { id: 'ie_economy', title: 'IE Economy', url: 'https://indianexpress.com/section/business/economy/feed/', category: 'Economy' },
    { id: 'ie_world', title: 'IE World', url: 'https://indianexpress.com/section/world/feed/', category: 'International' },
    { id: 'ie_sci', title: 'IE Science', url: 'https://indianexpress.com/section/technology/science/feed/', category: 'Sci-Tech' }
];

export async function GET() {
    try {
        const feedPromises = FEEDS.map(async (feed) => {
            try {
                const feedData = await parser.parseURL(feed.url);
                return {
                    id: feed.id,
                    source: feed.title,
                    category: feed.category,
                    items: feedData.items.slice(0, 50).map(item => {
                        // Attempt to extract image from enclosure or content
                        let imageUrl = item.enclosure?.url;
                        if (!imageUrl && item.content) {
                            const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                            if (imgMatch) imageUrl = imgMatch[1];
                        }
                        // Fallback for The Hindu specific format if needed, or generic

                        return {
                            title: item.title,
                            link: item.link,
                            pubDate: item.pubDate,
                            contentSnippet: item.contentSnippet,
                            imageUrl: imageUrl,
                            category: feed.category // Pass category to item for easy filtering
                        };
                    })
                };
            } catch (error) {
                console.error(`Error fetching feed ${feed.title}:`, error);
                return { id: feed.id, source: feed.title, items: [], error: true };
            }
        });

        const feedResults = await Promise.all(feedPromises);

        // Flatten and sort by date
        const allItems = feedResults
            .flatMap(feed => feed.items.map(item => ({ ...item, source: feed.source })))
            .sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime())
            .slice(0, 50);

        return NextResponse.json({ items: allItems });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
    }
}
