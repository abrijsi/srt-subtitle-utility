const fs = require('fs');
const path = require('path');
const glob = require('glob');
const readline = require('readline');
const translatte = require('translatte');

// --- BAGIAN FIX IMPORT (PENTING) ---
// Kita load librarynya secara utuh dulu
const srtLibrary = require('srt-parser-2');

// Logika mencari Class Parser yang benar
let Parser;
if (typeof srtLibrary === 'function') {
    // Kasus 1: Library langsung export Class
    Parser = srtLibrary;
} else if (srtLibrary.Parser) {
    // Kasus 2: Class ada di dalam properti .Parser (Paling umum)
    Parser = srtLibrary.Parser;
} else if (srtLibrary.default) {
    // Kasus 3: Class ada di dalam .default (Style ES6)
    Parser = srtLibrary.default;
} else {
    console.error('[FATAL ERROR] Tidak bisa menemukan Class Parser di library srt-parser-2.');
    console.log('Isi library yang terbaca:', srtLibrary);
    process.exit(1);
}
// -----------------------------------

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const parser = new Parser();

// Fungsi delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text) {
    try {
        const res = await translatte(text, { to: 'id' });
        return res.text;
    } catch (err) {
        return null; 
    }
}

async function processSrtFile(filePath) {
    const fileName = path.basename(filePath);
    
    // Cek file sistem
    if (fileName.endsWith('_id.srt')) return 'SKIP_SYSTEM';
    
    const newFilePath = filePath.replace('.srt', '_id.srt');
    
    if (fs.existsSync(newFilePath)) {
        console.log(`[SKIP] Sudah ada: ${fileName}`);
        return 'SKIP_EXIST';
    }

    console.log(`\n[START] Memproses: ${fileName}`);

    try {
        const srtContent = fs.readFileSync(filePath, 'utf8');
        const srtArray = parser.fromSrt(srtContent);
        
        for (let i = 0; i < srtArray.length; i++) {
            const originalText = srtArray[i].text;
            
            // Skip jika kosong
            if (!originalText || originalText.trim() === '') continue;

            // Bersihkan enter agar kalimat nyambung saat ditranslate
            const cleanText = originalText.replace(/\n/g, ' '); 
            
            const translated = await translateText(cleanText);
            
            if (translated === null) {
                console.error(`Error pada baris ${i+1}. Gagal koneksi ke Google.`);
                return 'FAIL';
            }

            srtArray[i].text = translated;

            // Progress bar
            process.stdout.write(`\rTranslating... ${Math.round(((i + 1) / srtArray.length) * 100)}%`);
            await sleep(300); // Naikkan delay sedikit ke 300ms agar lebih aman
        }

        const newSrtContent = parser.toSrt(srtArray);
        fs.writeFileSync(newFilePath, newSrtContent);
        console.log(` -> [OK] Disimpan.`);
        return 'SUCCESS';

    } catch (error) {
        console.error(`\n[ERROR] Gagal memproses ${fileName}:`, error.message);
        return 'FAIL';
    }
}

rl.question('Masukkan Path Folder Kursus (Copy-Paste di sini): ', async (inputPath) => {
    
    const targetFolder = inputPath.replace(/"/g, '').trim();

    if (!fs.existsSync(targetFolder)) {
        console.log('[ERROR] Folder tidak ditemukan!');
        rl.close();
        return;
    }

    console.log('\nScanning file .srt...');
    const files = glob.sync(`${targetFolder}/**/*.srt`, { ignore: '**/*_id.srt' });

    if (files.length === 0) {
        console.log('Tidak ada file .srt ditemukan.');
        rl.close();
        return;
    }

    console.log(`Ditemukan ${files.length} file target. Memulai proses...\n`);
    
    let stats = { total: files.length, success: 0, skipped: 0, failed: 0 };

    for (const file of files) {
        const result = await processSrtFile(file);
        if (result === 'SUCCESS') stats.success++;
        else if (result === 'FAIL') stats.failed++;
        else if (result === 'SKIP_EXIST') stats.skipped++;
    }

    console.log('\n\n================================================');
    console.log('             REKAPITULASI PROSES                ');
    console.log('================================================');
    console.log(`Total File SRT           : ${stats.total}`);
    console.log(`Berhasil Ditranslate     : ${stats.success}`);
    console.log(`Dilewati (Sudah ada)     : ${stats.skipped}`);
    console.log(`Gagal                    : ${stats.failed}`);
    console.log('================================================');
    
    rl.close();
});