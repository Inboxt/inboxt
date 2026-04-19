export function formatEmailFrom(email: string, name = 'Inboxt') {
	return `"${name}" <${email}>`;
}
