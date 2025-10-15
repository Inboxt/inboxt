import dayjs from 'dayjs';

export type HighlightView = {
	text: string;
	savedItemTitle: string;
	savedItemUrl?: string;
	createdAt: Date;
};

export function escapeHtml(s: string) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function renderHighlightsHtml(highlights: HighlightView[], ts: string): string {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Highlights Export ${ts}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;margin:24px;}
article{max-width:800px;margin:auto;}
section{padding:16px 0;border-bottom:1px solid #eee;}
h3{margin:0 0 6px;}
.meta{color:#666;font-size:0.9em;margin-bottom:8px;}
blockquote{margin:0;padding-left:12px;border-left:3px solid #ddd;white-space:pre-wrap;}
</style>
</head>
<body>
<article>
${highlights
	.map((h) => {
		const date = dayjs(h.createdAt).format('YYYY-MM-DD HH:mm');
		const title = h.savedItemUrl
			? `<h3><a href="${h.savedItemUrl}">${escapeHtml(h.savedItemTitle)}</a></h3>`
			: `<h3>${escapeHtml(h.savedItemTitle)}</h3>`;
		return `<section>
${title}
<div class="meta">${escapeHtml(date)}</div>
<blockquote>${escapeHtml(h.text)}</blockquote>
</section>`;
	})
	.join('\n')}
</article>
</body>
</html>`;
}
