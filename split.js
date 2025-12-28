const fs = require('fs');
const path = require('path');

// Nama file hasil copy-paste dari Gemini
const INPUT_TRANSLATED_FILE = '01_OUTPUT_GEMINI.txt'; 

// Cek file
if (!fs.existsSync(path.join(__dirname, INPUT_TRANSLATED_FILE))) {
    console.error(`[ERROR] File '${INPUT_TRANSLATED_FILE}' tidak ditemukan!`);
    console.error('Pastikan kamu sudah membuat file ini dan mem-paste hasil dari Gemini.');
    process.exit(1);
}

const rawContent = fs.readFileSync(path.join(__dirname, INPUT_TRANSLATED_FILE), 'utf8');

// Regex sakti untuk memecah file berdasarkan delimiter yang kita buat di merge.js
// Pola: Mencari <<<<PATH::(lokasi)>>>> lalu mengambil isinya sampai ketemu delimiter berikutnya
const parts = rawContent.split(/<<<<PATH::(.*?)>>>>/g);

console.log('Memproses pemecahan file...');

let successCount = 0;

// Loop array hasil split. 
// Karena split, index 0 biasanya kosong/teks awal, index 1 adalah PATH, index 2 adalah KONTEN, dst.
for (let i = 1; i < parts.length; i += 2) {
    let originalPath = parts[i].trim(); // Ini path aslinya
    let content = parts[i + 1]; // Ini isi SRT terjemahan

    if (!originalPath || !content) continue;

    // Bersihkan whitespace berlebih di awal/akhir konten
    content = content.trim();

    // Buat nama file baru (nama_asli_id.srt)
    // Kita manipulasi string path-nya
    let newPath;
    if (originalPath.endsWith('.srt')) {
        newPath = originalPath.replace('.srt', '_id.srt');
    } else {
        // Jaga-jaga kalau path aneh
        newPath = originalPath + '_id.srt';
    }

    try {
        // Tulis file
        fs.writeFileSync(newPath, content, 'utf8');
        console.log(`[OK] Disimpan: ${path.basename(newPath)}`);
        successCount++;
    } catch (err) {
        console.error(`[GAGAL] Tidak bisa menulis ke: ${newPath}`);
        console.error(`Error: ${err.message}`);
    }
}

console.log(`\n=== SELESAI ===`);
console.log(`Berhasil memecah & menyimpan ${successCount} file subtitle Indonesia.`);