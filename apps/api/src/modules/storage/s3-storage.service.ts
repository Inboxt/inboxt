import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config } from '~config/index';

@Injectable()
export class S3StorageService {
	private readonly s3: S3Client;
	private readonly bucket: string;

	constructor(private readonly configService: ConfigService<Config>) {
		const storageConfig = this.configService.getOrThrow('storage', { infer: true });

		this.bucket = storageConfig.bucket;
		this.s3 = new S3Client({
			region: storageConfig.region,
			endpoint: storageConfig.endpoint,
			credentials: {
				accessKeyId: storageConfig.accessKeyId,
				secretAccessKey: storageConfig.secretAccessKey,
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
