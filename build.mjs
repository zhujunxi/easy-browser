import { build } from 'vite';
import { resolve } from 'path';
import { rm } from 'fs/promises';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import fs from 'fs';

import react from '@vitejs/plugin-react';
import manifest from './src/manifest.js';
import extensionPlugin from './plugins/vite-plugin-extension.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, './..');

const distPath = resolve(__dirname, 'dist');
const isProduction = process.env.NODE_ENV === 'production';

// Common Config
const commonResolve = {
  alias: {
    '@': resolve(__dirname, 'src'),
    '@components': resolve(__dirname, 'src/components'),
    '@assets': resolve(__dirname, 'src/assets'),
    '@utils': resolve(__dirname, 'src/utils'),
    '@store': resolve(__dirname, 'src/store'),
    '@services': resolve(__dirname, 'src/services'),
    '@config': resolve(__dirname, 'src/config'),
    '@hooks': resolve(__dirname, 'src/hooks'),
    '@tools': resolve(__dirname, 'src/tools'),
  },
};

const commonCss = {
  preprocessorOptions: {
    scss: {
      // Variables and mixins must be explicitly @use'd in each file
    },
  },
};

// Other
const otherBuildConfig = {
  resolve: commonResolve,
  plugins: [
    react(),
    extensionPlugin(manifest),
  ],
  define: {
    __TEST_MODE__: !isProduction,
  },
  build: {
    sourcemap: !isProduction,
    emptyOutDir: false,
    watch: !isProduction ? {} : null,
    rollupOptions: {
      input: {
        options: resolve(__dirname, 'src/options/index.html'),
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        background: resolve(__dirname, 'src/background/index.js'),
        contentStyle: resolve(__dirname, 'src/content/style.scss'),
      },
      output: {
        entryFileNames: chunk => {
          return `src/${chunk.name}/index.js`;
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]'
      },
      external: [resolve(__dirname, 'src/content/index.js')]
    },
  },
  css: commonCss,
}

// Content Script
const contentBuildConfig = {
  resolve: commonResolve,
  plugins: [],
  build: {
    sourcemap: !isProduction,
    emptyOutDir: false,
    watch: !isProduction ? {} : null,
    rollupOptions: {
      input: resolve(__dirname, 'src/content/index.js'),
      output: {
        format: 'iife',
        entryFileNames: 'src/content/index.js',
      },
    },
  }
};

// Function to create zip file
async function createZip() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream('easy-browser.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression level
    });

    output.on('close', () => {
      console.log(`📦 Archive created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(distPath, false);
    archive.finalize();
  });
}

// --- Build ---
async function runBuilds() {
  try {
    console.log(`🧹 Cleaning output directory: ${distPath}...`);
    await rm(distPath, { recursive: true, force: true });
    console.log('✅ Output directory cleaned.');

    console.log('\n🚀 Building other extension parts (Popup, Options, Background, etc.)...');
    await build(otherBuildConfig);
    console.log('✅ Other parts build finished.');

    console.log('\n🚀 Building Content Script...');
    await build(contentBuildConfig);
    console.log('✅ Content Script build finished.');

    if (isProduction) {
      console.log('\n📦 Creating zip archive of dist directory...');
      await createZip();
      console.log('✅ Zip archive created successfully!');
    }

    console.log('\n🎉 Build process completed successfully!');

  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

runBuilds();