const fs = require('fs');
const path = require('path');
const glob = require('glob');
const readline = require('readline');

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

    // Cari semua srt, KECUALI yang sudah _id.srt (biar ga double)
    const files = glob.sync(`${targetFolder}/**/*.srt`, { ignore: '**/*_id.srt' });
    
    if (files.length === 0) {
        console.log('Tidak ada file SRT.');
        rl.close();
        return;
    }

    console.log(`\nMenggabungkan ${files.length} file...`);

    let combinedContent = "";

    // Header Instruksi untuk Gemini (Biar kamu ga capek ngetik prompt)
    combinedContent += "INSTRUKSI: Terjemahkan subtitle berikut ke Bahasa Indonesia. \n";
    combinedContent += "ATURAN WAJIB:\n";
    combinedContent += "1. JANGAN ubah baris yang diawali '<<<<PATH::'. Itu adalah penanda file.\n";
    combinedContent += "2. Pertahankan format waktu SRT (00:00:xx,xxx) persis seperti aslinya.\n";
    combinedContent += "3. Gunakan istilah teknis Cybersecurity yang formal (misal: jangan translate 'SQL Injection').\n";
    combinedContent += "4. Outputkan HANYA hasil terjemahan beserta penandanya.\n\n";
    combinedContent += "=== MULAI KONTEN ===\n\n";

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // Kita simpan FULL PATH di dalam delimiter agar nanti script split tau mau balikin kemana
        combinedContent += `<<<<PATH::${file}>>>>\n`; 
        combinedContent += content + "\n\n";
    });

    // Simpan ke satu file besar
    const outputPath = path.join(__dirname, '00_INPUT_GEMINI.txt');
    fs.writeFileSync(outputPath, combinedContent, 'utf8');

    console.log(`\n[SUKSES] File gabungan disimpan di:\n${outputPath}`);
    console.log(`\nSilakan buka file tersebut, copy isinya, dan paste ke Gemini Premium.`);
    rl.close();
});