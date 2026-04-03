/**
 * Asset Optimizer Script (Node.js)
 * 
 * Usage: node scripts/optimize-models.js
 * 
 * Instructions:
 * 1. Place any large .glb or .gltf files (e.g., your Car or Buildings) into the public/models directory.
 * 2. Run this script.
 * 3. It will compress them using @gltf-transform and save an optimized version.
 */

const { Document, NodeIO } = require('@gltf-transform/core');
const { quantize, resample, dedup } = require('@gltf-transform/functions');
const fs = require('fs');
const path = require('path');

const io = new NodeIO();

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

async function optimizeModels() {
    console.log(`Scanning for models in: ${MODELS_DIR}`);
    if (!fs.existsSync(MODELS_DIR)) {
        fs.mkdirSync(MODELS_DIR, { recursive: true });
        console.log("Created models directory. Please drop your .glb files inside and run again.");
        return;
    }

    const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith('.glb') && !f.includes('-optimized'));

    if (files.length === 0) {
        console.log("No unoptimized .glb files found to compress.");
        return;
    }

    for (const file of files) {
        const srcPath = path.join(MODELS_DIR, file);
        const destPath = path.join(MODELS_DIR, file.replace('.glb', '-optimized.glb'));

        console.log(`Processing Model: ${file}...`);

        try {
            const document = await io.read(srcPath);

            await document.transform(
                dedup(),          // Deduplicate accessors to save space
                resample(),       // Resample animations to remove redundancy
                quantize()        // Quantize mesh geometry (highly effective for file size)
            );

            await io.write(destPath, document);
            
            const originalSize = (fs.statSync(srcPath).size / 1024 / 1024).toFixed(2);
            const newSize = (fs.statSync(destPath).size / 1024 / 1024).toFixed(2);
            
            console.log(`✅ Success! [${originalSize}MB] -> [${newSize}MB]. Saved as ${path.basename(destPath)}`);
            
            // Optionally overwrite original by renaming
            // fs.renameSync(destPath, srcPath);
        } catch (error) {
            console.error(`❌ Failed to process ${file}:`, error);
        }
    }
}

optimizeModels();
