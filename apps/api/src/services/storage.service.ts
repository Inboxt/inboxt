import { Injectable } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
	private readonly s3: S3Client;
	private bucket = process.env.STORAGE_S3_BUCKET!;

	constructor() {
		this.s3 = new S3Client({
			region: process.env.STORAGE_S3_REGION,
			endpoint: process.env.STORAGE_S3_ENDPOINT,
			credentials: {
				accessKeyId: process.env.STORAGE_S3_ACCESS_KEY!,
				secretAccessKey: process.env.STORAGE_S3_SECRET_KEY!,
			},
			forcePathStyle: true,
		});
	}

	async upload(params: {
		key: string;
		body: Buffer | Uint8Array | Blob | string;
		contentType?: string;
		acl?: 'private' | 'public-read';
	}) {
		await this.s3.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: params.key,
				Body: params.body,
				ContentType: params.contentType ?? 'application/octet-stream',
				ACL: params.acl ?? 'private',
			}),
		);

		return { key: params.key };
	}

	async getSignedDownloadUrl(key: string) {
		return await getSignedUrl(
			this.s3,
			new GetObjectCommand({ Bucket: this.bucket, Key: key }),
			{ expiresIn: 60 * 60 * 24 }, // 24-hour expiration
		);
	}
}
