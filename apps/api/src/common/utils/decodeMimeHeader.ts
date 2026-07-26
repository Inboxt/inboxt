export function decodeMimeHeader(header: string | null | undefined): string | null {
	if (!header) {
		return null;
	}

	// Remove linear-white-space between adjacent encoded-words
	const decoded = header.replace(/(=\?[^?]+\?[QB]\?[^?]+\?=)\s+(?==\?)/gi, '$1');

	return decoded.replace(/=\?([^?]+)\?([QB])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
		try {
			if (encoding.toUpperCase() === 'Q') {
				// Quoted-printable
				const bytes: number[] = [];
				for (let i = 0; i < text.length; i++) {
					if (text[i] === '=') {
						bytes.push(parseInt(text.substr(i + 1, 2), 16));
						i += 2;
					} else if (text[i] === '_') {
						bytes.push(32); // space
					} else {
						bytes.push(text.charCodeAt(i));
					}
				}
				return Buffer.from(bytes).toString(charset.toLowerCase() || 'utf-8');
			} else if (encoding.toUpperCase() === 'B') {
				// Base64
				return Buffer.from(text, 'base64').toString(charset.toLowerCase() || 'utf-8');
			}
		} catch (_e) {
			return match;
		}
		return match;
	});
}
