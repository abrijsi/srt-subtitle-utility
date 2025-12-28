# 🎬 SRT Subtitle Automation Tool

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Node.js](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen)

## 📖 About The Project
This project provides a set of automation scripts to manipulate, split, and translate `.srt` subtitle files efficiently. It is built with **Node.js** and designed to handle batch processing of subtitle files.

**Key Features:**
* **Split Subtitles:** Break down large SRT files into smaller chunks.
* **Batch Processing:** Handle multiple files simultaneously.
* **Auto Translation:** Translate subtitle content programmatically.

## 🛠️ Prerequisites
Before running the scripts, ensure you have **Node.js** installed on your machine.

## 🚀 Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/abrijsi/NAMAREPO.git](https://github.com/abrijsi/NAMAREPO.git)
    cd NAMAREPO
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## 💻 Usage Guide

### 1. Splitting Subtitles
Use `split.js` to divide a subtitle file into smaller parts.
```bash
node split.js
# Or with arguments (example):
# node split.js --input movie.srt --parts 2
