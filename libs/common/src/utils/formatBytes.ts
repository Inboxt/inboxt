export const formatBytes = (bytes: number | bigint): string => {
	const n = typeof bytes === 'bigint' ? Number(bytes) : bytes;
	if (!Number.isFinite(n) || n <= 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
	const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length - 1);

	const value = n / Math.pow(k, i);
	const formatted =
		value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2);

	return `${formatted.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')} ${sizes[i]}`;
};
