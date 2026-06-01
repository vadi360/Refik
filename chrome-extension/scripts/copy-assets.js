// Copy assets and build TypeScript for Chrome Extension
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// Directories to copy (non-ts files)
const dirsToCopy = [
  { from: 'icons', to: 'dist/icons' },
  { from: '_locales', to: 'dist/_locales' },
];

// Files to copy
const filesToCopy = [
  'manifest.json',
];

// TypeScript files to compile
const tsFiles = [
  { 
    src: 'src/background/service-worker.ts', 
    dest: 'dist/src/background/service-worker.js',
    format: 'iife'
  },
  { 
    src: 'src/content/script.ts', 
    dest: 'dist/src/content/script.js',
    format: 'iife'
  },
  { 
    src: 'src/content/uyap-parser.ts', 
    dest: 'dist/src/content/uyap-parser.js',
    format: 'iife'
  },
];

// CSS files to copy
const cssFiles = [
  { from: 'src/content/styles.css', to: 'dist/src/content' },
];

// Compile TypeScript file
async function compileTS(src, dest) {
  try {
    await esbuild.build({
      entryPoints: [src],
      bundle: true,
      outfile: dest,
      format: 'iife',
      platform: 'browser',
      target: ['chrome88'],
      minify: false,
      sourcemap: false,
      logLevel: 'silent',
    });
    console.log(`  ✓ ${src} → ${dest}`);
  } catch (error) {
    console.error(`  ✗ Error compiling ${src}:`, error.message);
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${srcPath} → ${destPath}`);
    }
  }
}

// Copy single file
function copyFile(src, dest) {
  const destPath = path.join(dest, path.basename(src));
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, destPath);
  console.log(`  ✓ ${src} → ${destPath}`);
}

// Print directory tree
function printDir(dir, level) {
  const prefix = '  '.repeat(level);
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      console.log(`${prefix}📁 ${item}/`);
      printDir(fullPath, level + 1);
    } else {
      console.log(`${prefix}  ${item} (${formatBytes(stat.size)})`);
    }
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function main() {
  console.log('\n🔨 Building Chrome Extension...\n');

  // Create dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // 1. Compile TypeScript files
  console.log('📝 Compiling TypeScript files...');
  for (const file of tsFiles) {
    await compileTS(file.src, file.dest);
  }

  // 2. Copy CSS files
  console.log('\n🎨 Copying CSS files...');
  for (const file of cssFiles) {
    copyFile(file.from, file.to);
  }

  // 3. Copy directories
  console.log('\n📁 Copying directories...');
  for (const dir of dirsToCopy) {
    if (fs.existsSync(dir.from)) {
      console.log(`📂 ${dir.from} → ${dir.to}`);
      copyDir(dir.from, dir.to);
    } else {
      console.log(`  ⚠️ ${dir.from} not found, skipping`);
    }
  }

  // 4. Copy files
  console.log('\n📄 Copying files...');
  for (const file of filesToCopy) {
    if (fs.existsSync(file)) {
      copyFile(file, 'dist');
    } else {
      console.log(`  ⚠️ ${file} not found, skipping`);
    }
  }

  // 5. Copy vite build output (popup)
  console.log('\n📦 Copying Vite build output...');
  if (fs.existsSync('dist/src/popup')) {
    // Already built by vite
  }
  const viteAssets = fs.readdirSync('dist/assets');
  for (const file of viteAssets) {
    console.log(`  ✓ dist/assets/${file}`);
  }

  // Copy popup.html
  if (fs.existsSync('dist/src/popup/popup.html')) {
    fs.copyFileSync('dist/src/popup/popup.html', 'dist/popup.html');
    console.log(`  ✓ dist/src/popup/popup.html → dist/popup.html`);
  }

  console.log('\n✅ Build complete!\n');
  console.log('📦 dist/ folder structure:');
  printDir('dist', 0);
  
  console.log('\n🎯 Next steps:');
  console.log('   1. Create ZIP: Select all files in dist/ and compress');
  console.log('   2. Upload to Chrome Web Store');
  console.log('   3. Or test locally: chrome://extensions → Load unpacked → dist/\n');
}

main().catch(console.error);