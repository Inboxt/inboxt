import { User } from '~lib/graphql';

export const getUserStorage = (data: User | null | undefined) => {
	const usedStorageRaw = data?.storageUsageBytes ?? '0';
	const usedStorage = Number(usedStorageRaw);
	const storageQuotaRaw = data?.storageQuotaBytes ?? '0';
	const storageQuota = Number(storageQuotaRaw);
	const storagePercentage = Math.min(Math.round((usedStorage / storageQuota) * 100), 100);

	return { usedStorage, storageQuota, storagePercentage };
};
