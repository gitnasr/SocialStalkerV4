import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'
export default defineManifest({
	name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
	description: packageData.description,
	version: packageData.version,
	manifest_version: 3,
	background: {
		service_worker: 'src/background/index.ts',
		type: 'module',
	},
	permissions: ['cookies',"activeTab"],
	host_permissions: ['*://*.instagram.com/']

})
