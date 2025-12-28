const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('=== MEMULAI PROGRAM SPLIT BATCH (SIMPLE MODE) ===\n');
console.log('Catatan: Semua file subtitle akan disimpan di folder ini langsung.\n');

// 1. Cari semua file .txt di folder ini
const allTxtFiles = glob.sync(`${__dirname}/*.txt`);
const filesToProcess = [];

// 2. Filter file (hanya proses yang ada isinya dan valid)
allTxtFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('<<<<PATH::')) {
        filesToProcess.push(file);
    }
});

if (filesToProcess.length === 0) {
    console.log('[INFO] Tidak ada file terjemahan (.txt) yang valid ditemukan.');
    process.exit(0);
}

console.log(`Ditemukan ${filesToProcess.length} file valid. Memulai proses...\n`);

let totalSuccess = 0;

filesToProcess.forEach(txtFile => {
    const filename = path.basename(txtFile);
    const content = fs.readFileSync(txtFile, 'utf8');
    
    console.log(`>>> Memproses file: ${filename}`);

    const parts = content.split(/<<<<PATH::(.*?)>>>>/g);
    let fileSuccessCount = 0;

    for (let i = 1; i < parts.length; i += 2) {
        let originalPath = parts[i].trim(); 
        let srtContent = parts[i + 1]; 

        if (!originalPath || !srtContent) continue;

        srtContent = srtContent.trim();

        // --- BAGIAN PENTING: HANYA AMBIL NAMA FILE ---
        // Kita buang path folder (..\Downloads\...), ambil ujungnya saja
        let baseName = path.basename(originalPath); 

        // Ganti akhiran .srt menjadi _id.srt
        let newFilename;
        if (baseName.endsWith('.srt')) {
            newFilename = baseName.replace('.srt', '_id.srt');
        } else {
            newFilename = baseName + '_id.srt';
        }

        // Simpan langsung di folder project ini (__dirname)
        let savePath = path.join(__dirname, newFilename);

        try {
            fs.writeFileSync(savePath, srtContent, 'utf8');
            console.log(`    [OK] Saved: ${newFilename}`);
            fileSuccessCount++;
            totalSuccess++;
        } catch (err) {
            console.error(`    [FAIL] Gagal menyimpan: ${newFilename}`);
            console.error(`           Penyebab: ${err.message}`);
        }
    }

    console.log(`    (Selesai: ${fileSuccessCount} subtitle dari file ini)\n`);
    
    // (Opsional) Kosongkan file input jika sukses
    // if (fileSuccessCount > 0) fs.writeFileSync(txtFile, '', 'utf8');
});

console.log(`=== TOTAL SELESAI: ${totalSuccess} file subtitle berhasil disimpan ===`);