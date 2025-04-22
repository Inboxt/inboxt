import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	/* ===============================
	=            Retrieve             =
	=============================== */
	async get(where: Prisma.userFindUniqueArgs['where']) {
		return this.prisma.user.findUnique({
			where,
		});
	}
}
