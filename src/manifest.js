import packageData from '../package.json' assert { type: 'json' }

export default {
  manifest_version: 3,
  name: `Easy Browser`,
  description: packageData.description,
  version: packageData.version,
  permissions: ['storage', 'activeTab', 'scripting', 'tabs', 'sidePanel'],
  icons: {
    16: 'assets/logo/icon-16.png',
    48: 'assets/logo/icon-48.png',
    128: 'assets/logo/icon-128.png',
  },
  host_permissions: ['<all_urls>'],
  action: {
    default_icon: 'assets/logo/icon-48.png',
    default_title: 'Toggle Side Panel',
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.js'],
      css: ['src/content/style.css'],
    },
  ],
  background: {
    service_worker: 'src/background/index.js',
    type: 'module',
  },
  options_page: 'src/options/index.html',
  web_accessible_resources: [
    {
      resources: ['assets/logo/*'],
      matches: ['<all_urls>'],
    },
  ],
}
