const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Cari semua file .txt di folder script ini
const txtFiles = glob.sync(`${__dirname}/*.txt`);

if (txtFiles.length === 0) {
    console.log('[INFO] Tidak ada file .txt ditemukan di folder script ini.');
    process.exit(0);
}

console.log(`Ditemukan ${txtFiles.length} file .txt. Memeriksa konten terjemahan...\n`);

let totalSuccess = 0;

txtFiles.forEach(txtFile => {
    const content = fs.readFileSync(txtFile, 'utf8');

    // Cek apakah file ini mengandung delimiter kita (tanda kalau ini file kerjaan kita)
    if (!content.includes('<<<<PATH::')) {
        // Skip file txt biasa (misal readme.txt atau log)
        return;
    }

    console.log(`>>> Memproses file: ${path.basename(txtFile)}`);

    // Pecah konten berdasarkan delimiter
    const parts = content.split(/<<<<PATH::(.*?)>>>>/g);
    
    let fileSuccessCount = 0;

    // Loop hasil pecahan
    for (let i = 1; i < parts.length; i += 2) {
        let originalPath = parts[i].trim(); 
        let srtContent = parts[i + 1]; 

        if (!originalPath || !srtContent) continue;

        srtContent = srtContent.trim();

        // Tentukan nama file output (_id.srt)
        let newPath;
        if (originalPath.endsWith('.srt')) {
            newPath = originalPath.replace('.srt', '_id.srt');
        } else {
            newPath = originalPath + '_id.srt';
        }

        try {
            fs.writeFileSync(newPath, srtContent, 'utf8');
            console.log(`    [OK] Saved: ${path.basename(newPath)}`);
            fileSuccessCount++;
            totalSuccess++;
        } catch (err) {
            console.error(`    [FAIL] Error writing to: ${newPath}`);
        }
    }
    console.log(`    (Selesai memproses ${fileSuccessCount} subtitle dari file ini)\n`);
});

console.log(`=== TOTAL SELESAI: ${totalSuccess} file subtitle berhasil disimpan ===`);