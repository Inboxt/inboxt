import * as dotenv from 'dotenv';
import * as path from 'path';
import type { CodegenConfig } from '@graphql-codegen/cli';

dotenv.config({ path: path.resolve('../../', '.env') });

const config: CodegenConfig = {
	overwrite: true,
	schema: `${process.env.API_URL}/api/graphql`,
	documents: 'src/lib/graphql/index.ts',
	generates: {
		'src/lib/graphql/generated/': {
			preset: 'client',
			presetConfig: { fragmentMasking: false, gqlTagName: 'gql' },
			plugins: [],
			config: {
				scalars: {
					Date: 'string',
					DateTime: 'string',
				},
			},
		},
	},
};

export default config;
