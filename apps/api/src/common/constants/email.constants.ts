export const EMAIL_ACCOUNT_DELETED = {
	subject: 'Inboxt: Account deleted',
	description: 'Your Inboxt account and data have been permanently deleted per your request.',
};

export const EMAIL_CHANGED_EMAIL = {
	subject: 'Your Inboxt email address has been changed',
	description: ({ oldEmail, newEmail }: { oldEmail: string; newEmail: string }) =>
		`Email changed from ${oldEmail} to ${newEmail}. Contact support if this wasn’t you.`,
};

export const EMAIL_FORWARDED = {
	subject: ({ originalSubject }: { originalSubject: string }) =>
		`Unable to process in Inboxt: ${originalSubject}`,
	description:
		"This newsletter couldn't be processed in Inboxt and has been forwarded to your email.",
};

export const EMAIL_CHANGED_PASSWORD = {
	subject: 'Your Inboxt password has been changed',
	description:
		'Password changed successfully. Contact support immediately if you didn’t make this change.',
};

export const EMAIL_RESET_PASSWORD = {
	subject: 'Inboxt: Reset your password',
	description: 'Use the code below to reset your password and access your account.',
};

export const EMAIL_VERIFY_REMINDER = {
	subject: 'Inboxt: Verify your email to keep your account',
	description: ({ daysRemaining }: { daysRemaining: string }) =>
		`Your Inboxt account will be deleted in ${daysRemaining} days if not verified. Verify now to unlock all features.`,
};

export const EMAIL_VERIFY = {
	subject: 'Inboxt: Verify your email',
	description: 'Use the code to verify your email and unlock all Inboxt features.',
};

export const EMAIL_WELCOME = {
	subject: 'Welcome to Inboxt!',
	description:
		'Explore your new account and see how Inboxt helps you save and read content distraction-free.',
};

export const EMAIL_EXPORT_READY = {
	subject: 'Your Inboxt data export is ready',
	description:
		'Download your ZIP archive. The link will expire in 24 hours. The file will be automatically deleted from our servers after 3 days.',
};

export const EMAIL_STORAGE_APPROACHING_LIMIT = {
	subject: 'You’re nearing your Inboxt storage limit',
	description:
		'You have used most of your storage quota. Consider freeing up space to avoid interruptions.',
};

export const EMAIL_STORAGE_LIMIT_REACHED = {
	subject: 'You’ve reached your Inboxt storage limit',
	description:
		'Your storage quota has been fully used. Some actions may be restricted until you free up space.',
};
