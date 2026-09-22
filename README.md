# CV Builder Interactive

A modern, responsive, and mobile-friendly web application for building professional CVs interactively.

## Features

- 📝 **Interactive Form Builder**: Fill in your CV details with a structured form
- 📤 **CV Upload**: Upload existing CVs (PDF, DOC, TXT) to auto-populate the form
- 👁️ **Live Preview**: See your CV update in real-time as you type
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🌓 **Dark/Light Theme**: Toggle between themes for comfortable viewing
- 📄 **PDF Export**: Download your CV as a professional PDF
- 🎨 **Modern UI**: Clean and professional design with smooth animations

## Struktur Folder

```
cv-webku/
├── index.html                    # Halaman utama — form input + live preview untuk kedua template CV (ATS & Creative)
├── css/
│   ├── style.css                 # Style utama (layout dasar, komponen form, preview template ATS)
│   ├── responsive.css            # Breakpoint responsif untuk tablet & mobile
│   └── creative.css              # Style khusus template CV Creative (gaya majalah)
├── js/
│   ├── main.js                   # Logic utama app: kumpulkan data form, render preview ATS, download PDF, dsb
│   ├── cvBuilder.js              # Modul struktur data & pengelolaan section form CV
│   ├── cvUploader.js             # Fitur upload CV lama (PDF/DOC/TXT) untuk auto-isi form
│   ├── creativeCvBuilder.js      # Logic khusus untuk template CV Creative (sidebar, kontak, dsb)
│   └── pdfGenerator.js           # Generate & unduh CV sebagai PDF (html2canvas + jsPDF)
├── libs/
│   ├── html12canvas.min.js       # Salinan lokal library html2canvas
│   └── jspdf.umd.min.js          # Salinan lokal library jsPDF
├── docs/
│   └── user-guide.md             # Panduan penggunaan aplikasi
├── logoku.png                    # Aset logo
├── Dockerfile                    # Konfigurasi image Docker
├── docker-compose.yml            # Konfigurasi Docker Compose untuk menjalankan container
├── nginx.conf                    # Konfigurasi nginx (web server saat di-deploy via Docker)
├── CNAME                         # Domain kustom untuk GitHub Pages
└── README.md                     # Dokumentasi proyek ini
```

## Quick Start

### Using Docker

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cv-builder-app.git
cd cv-builder-app
