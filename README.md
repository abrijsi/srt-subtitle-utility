# 🎬 SRT AI-Translation Automation

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Node.js](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen) ![AI Powered](https://img.shields.io/badge/AI-Gemini_Powered-orange)

## 📖 About The Project

This project provides a robust automation workflow for translating and synchronizing subtitle (`.srt`) files using **Google Gemini AI**. 

It addresses the common "context limit" issue in AI translation by batching multiple subtitle files into a single context, allowing for consistent translation tone and format before reconstructing them back into valid Indonesian subtitles.

**Key Workflow:**
1.  **Batch Merge:** Aggregates every 4 source files into a single temporary file to optimize the AI prompt context.
2.  **AI Translation:** Leverages Google Gemini to translate the content while maintaining timestamp integrity.
3.  **Reconstruction:** Splits the AI output back into individual, correctly formatted `.srt` files.

## ⚡ Features
* **Smart Batching:** Automatically groups files to maximize AI token usage.
* **Format Preservation:** Ensures strict adherence to SRT timestamp structure `(00:00:00,000 --> 00:00:00,000)`.
* **Automated Splitting:** Parses translated text blocks back into separate files seamlessly.

## 🛠️ Prerequisites
* **Node.js** installed on your local machine.
* Access to **Google Gemini** (or any LLM of your choice).

## 🚀 Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/abrijsi/srt-subtitle-utility.git
    cd srt-subtitle-utility
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## 💻 Usage Guide

Follow these steps to translate your subtitles:

### Step 1: Prepare & Merge
Run the merge script to group files from your source folder. This script combines every 4 SRT files into a single text block.

```bash
node merge_batch.js
```
### Step 2: AI Translation with Gemini
Once the files are merged, proceed with the AI translation:

1.  Open the generated merged file.
2.  Copy the entire content.
3.  Paste it into **Google Gemini** with a prompt to translate it into Indonesian (maintaining the format).
4.  Copy the output from Gemini.
5.  Save the content into a new text file named `hasil_01.txt` (increment the number for subsequent batches, e.g., `hasil_02.txt`).

> **💡 Pro Tip:** Ensure the text file is saved with UTF-8 encoding to preserve special characters.

### Step 3: Reconstruct to Indonesian SRT
After saving the `hasil_xx.txt` files, run the batch splitter. This script reads the AI-translated text files and converts them back into individual, valid `.srt` files.

```bash
node split_batch.js
