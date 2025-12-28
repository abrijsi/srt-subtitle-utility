const fs = require('fs');
const path = require('path');
const glob = require('glob');
const readline = require('readline');

// KONFIGURASI: Berapa file maksimal per batch?
const FILES_PER_BATCH = 4;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Masukkan Path Folder Kursus: ', (inputPath) => {
    const targetFolder = inputPath.replace(/"/g, '').trim();

    if (!fs.existsSync(targetFolder)) {
        console.log('[ERROR] Folder tidak ditemukan!');
        rl.close();
        return;
    }

    // 1. Ambil semua file .srt
    const allSrtFiles = glob.sync(`${targetFolder}/**/*.srt`, { ignore: '**/*_id.srt' });
    
    if (allSrtFiles.length === 0) {
        console.log('Tidak ada file SRT di folder ini.');
        rl.close();
        return;
    }

    // 2. Filter: Hanya ambil file yang BELUM punya pasangan _id.srt
    console.log(`\nTotal file ditemukan: ${allSrtFiles.length}`);
    console.log('Mengecek file yang belum diterjemahkan...');

    const pendingFiles = allSrtFiles.filter(filePath => {
        const idPath = filePath.replace('.srt', '_id.srt');
        // Jika file _id.srt SUDAH ADA, berarti kita skip
        return !fs.existsSync(idPath);
    });

    if (pendingFiles.length === 0) {
        console.log('\n[INFO] Semua file di folder ini sepertinya SUDAH diterjemahkan (file _id.srt lengkap).');
        console.log('Tidak ada yang perlu diproses.');
        rl.close();
        return;
    }

    console.log(`Sisa file yang perlu diproses: ${pendingFiles.length} file.`);
    console.log(`Memecah menjadi beberapa batch (Maksimal ${FILES_PER_BATCH} file per batch)...\n`);

    // 3. Loop untuk membuat Batch Files
    let batchCounter = 1;

    for (let i = 0; i < pendingFiles.length; i += FILES_PER_BATCH) {
        // Ambil potongan array (misal 0-4, lalu 4-8, dst)
        const chunk = pendingFiles.slice(i, i + FILES_PER_BATCH);
        
        let batchContent = "";
        
        // Header Instruksi
        batchContent += "INSTRUKSI: Terjemahkan subtitle berikut ke Bahasa Indonesia.\n";
        batchContent += "ATURAN WAJIB:\n";
        batchContent += "1. JANGAN ubah baris yang diawali '<<<<PATH::'.\n";
        batchContent += "2. Pertahankan format waktu SRT (00:00:xx,xxx) persis aslinya.\n";
        batchContent += "3. Gunakan istilah teknis Cybersecurity formal.\n";
        batchContent += "4. Outputkan HANYA hasil terjemahan beserta penandanya.\n\n";
        batchContent += "=== MULAI BATCH ===\n\n";

        chunk.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            batchContent += `<<<<PATH::${file}>>>>\n`; 
            batchContent += content + "\n\n";
        });

        // Simpan Batch File
        const outputFilename = `BATCH_${String(batchCounter).padStart(2, '0')}_GEMINI.txt`;
        const outputPath = path.join(__dirname, outputFilename);
        
        fs.writeFileSync(outputPath, batchContent, 'utf8');
        console.log(`[CREATED] ${outputFilename} (Berisi ${chunk.length} file)`);
        
        batchCounter++;
    }

    console.log(`\n[SELESAI] Silakan copy isi file BATCH_XX.txt satu per satu ke Gemini.`);
    rl.close();
});