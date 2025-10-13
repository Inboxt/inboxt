import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig(({ mode }) => {
	const env = {
		...process.env,
		...loadEnv(mode, '../../', ''),
	};

	return {
		server: {
			host: '0.0.0.0',
			port: Number(env.WEB_PORT),
		},
		define: {
			'process.env': env,
		},
		plugins: [
			tanstackRouter({
				target: 'react',
				autoCodeSplitting: true,
				tmpDir: 'src/.tsr-temp', // Changed to use a local tmp directory
			}),
			react(),
			tsconfigPaths(),
		],
		resolve: {
			alias: {
				'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
			},
		},
		optimizeDeps: {
			include: ['@inboxt/common'],
		},
	};
});
