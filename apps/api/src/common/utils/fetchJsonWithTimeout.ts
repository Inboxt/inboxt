export async function fetchJsonWithTimeout(
	url: string,
	timeoutMs: number,
	opts?: { allowedHosts?: Set<string>; method?: 'GET' | 'POST' | 'DELETE' },
) {
	const u = new URL(url);

	if (u.protocol !== 'https:') {
		throw new Error('Only https URLs are allowed');
	}

	if (opts?.allowedHosts && !opts.allowedHosts.has(u.hostname)) {
		throw new Error(`Host not allowed: ${u.hostname}`);
	}

	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(u.toString(), {
			method: opts?.method ?? 'GET',
			signal: controller.signal,
			redirect: 'error',
		});
		return { ok: res.ok, status: res.status, json: (await res.json()) as unknown };
	} finally {
		clearTimeout(id);
	}
}
