// PDF Generator Module - Handles PDF generation and download
class PDFGenerator {
    constructor() {
        this.isGenerating = false;
    }

    // Main PDF generation method.
    // Captures the CV preview and lays it out across as many A4 pages as needed,
    // instead of squeezing/cropping everything onto a single page.
    // options.previewElementId: which preview container to capture (default 'cvPreview', the ATS preview).
    // options.fileSuffix: appended to the downloaded filename (default 'CV').
    async generatePDF(formData, options = {}) {
        const previewElementId = options.previewElementId || 'cvPreview';
        const fileSuffix = options.fileSuffix || 'CV';

        if (this.isGenerating) {
            this.showToast('Sedang memproses PDF, harap tunggu...', 'info');
            return;
        }

        if (!this.checkLibraries()) {
            return;
        }

        const previewElement = document.getElementById(previewElementId);
        if (!previewElement) {
            this.showToast('Preview tidak ditemukan', 'error');
            return;
        }

        this.isGenerating = true;
        this.showToast('Mengenerate PDF...', 'info');

        try {
            // Make sure every image (certificate badges, etc.) is fully loaded
            // BEFORE we measure the preview's height.
            await this.waitForImages(previewElement);
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            // Read the color/font currently applied on screen so the PDF
            // matches exactly what the user picked.
            const titleColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--cv-title-color').trim() || '#a11d3d';
            const cvFont = getComputedStyle(document.documentElement)
                .getPropertyValue('--cv-font-family').trim();

            // Render at a higher-quality scale for crisp, HD text/images.
            const RENDER_SCALE = 3;

            // --- Fix for "PDF berantakan kalau download dari HP" ---
            const DESKTOP_VIEWPORT_WIDTH = 1400;
            const DESKTOP_VIEWPORT_HEIGHT = 1400;

            const canvas = await html2canvas(previewElement, {
                scale: RENDER_SCALE,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: DESKTOP_VIEWPORT_WIDTH,
                windowHeight: DESKTOP_VIEWPORT_HEIGHT,
                onclone: (clonedDoc) => {
                    // Pin the preview element to a fixed desktop-style width.
                    const clonedPreview = clonedDoc.getElementById(previewElementId);
                    if (clonedPreview) {
                        clonedPreview.style.width = '750px';
                        clonedPreview.style.maxWidth = '750px';
                    }

                    // --- CV Creative: samakan tinggi sidebar & konten utama ---
                    const clonedSidebar = clonedDoc.querySelector('.creative-sidebar');
                    const clonedMain = clonedDoc.querySelector('.creative-main');
                    if (clonedSidebar && clonedMain) {
                        clonedSidebar.style.minHeight = '';
                        clonedMain.style.minHeight = '';
                        const tallest = Math.max(clonedSidebar.scrollHeight, clonedMain.scrollHeight);
                        clonedSidebar.style.minHeight = tallest + 'px';
                        clonedMain.style.minHeight = tallest + 'px';
                    }

                    // --- Fix foto profil ATS: ukuran tetap saat capture ---
                    const clonedPhotoBox = clonedDoc.querySelector('.preview-photo-box');
                    if (clonedPhotoBox) {
                        clonedPhotoBox.style.width = '96px';
                        clonedPhotoBox.style.height = '120px';
                        clonedPhotoBox.style.flex = '0 0 96px';
                        clonedPhotoBox.style.overflow = 'hidden';
                        clonedPhotoBox.style.borderRadius = '2px';

                        const clonedPhotoImg = clonedPhotoBox.querySelector('img');
                        if (clonedPhotoImg) {
                            clonedPhotoImg.style.width = '100%';
                            clonedPhotoImg.style.height = '100%';
                            clonedPhotoImg.style.objectFit = 'cover';
                            clonedPhotoImg.style.objectPosition = 'center top';
                            clonedPhotoImg.style.display = 'block';
                        }
                    }

                    // Pastikan link tetap punya style underline & warna yang sama saat di-capture
                    clonedDoc.querySelectorAll(
                        '.preview-contact-row a, .preview-doc-links a, .preview-doc-link-inline, .creative-sidebar-link'
                    ).forEach(a => {
                        a.style.color = '#1a56db';
                        a.style.textDecoration = 'underline';
                    });

                    // Force heading colors explicitly on the clone.
                    const heading = clonedDoc.querySelector('.preview-header-main h1');
                    if (heading) heading.style.color = titleColor;
                    clonedDoc.querySelectorAll('.preview-section-title').forEach(el => {
                        el.style.color = titleColor;
                        el.style.borderBottomColor = titleColor;
                    });

                    // Same reasoning for the chosen font family.
                    if (cvFont) {
                        const content = clonedDoc.querySelector('.cv-preview-content');
                        if (content) content.style.fontFamily = cvFont;
                    }

                    const images = clonedDoc.querySelectorAll('img');
                    return Promise.all(Array.from(images).map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise(resolve => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    }));
                }
            });

            this.buildMultiPagePdf(canvas, formData, fileSuffix);
            this.showToast('PDF berhasil diunduh!', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            this.showToast('Gagal generate PDF: ' + error.message, 'error');
        } finally {
            this.isGenerating = false;
        }
    }

    // Resolves once every <img> inside el has either loaded or failed.
    waitForImages(el) {
        const images = Array.from(el.querySelectorAll('img'));
        return Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));
    }

    // Slices the captured canvas across multiple A4 pages (no cropping).
    buildMultiPagePdf(sourceCanvas, formData, fileSuffix = 'CV') {
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        const margin = 10; // mm

        const contentWidthMm = pdfWidth - margin * 2;
        const contentHeightAvailableMm = pdfHeight - margin * 2;

        const pxToMm = contentWidthMm / sourceCanvas.width;
        const pageHeightPx = Math.floor(contentHeightAvailableMm / pxToMm);

        let renderedHeightPx = 0;
        let isFirstPage = true;

        while (renderedHeightPx < sourceCanvas.height) {
            const sliceHeightPx = Math.min(pageHeightPx, sourceCanvas.height - renderedHeightPx);

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = sourceCanvas.width;
            pageCanvas.height = sliceHeightPx;

            const ctx = pageCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
                sourceCanvas,
                0, renderedHeightPx, sourceCanvas.width, sliceHeightPx,
                0, 0, pageCanvas.width, sliceHeightPx
            );

            const imgData = pageCanvas.toDataURL('image/png');
            const sliceHeightMm = sliceHeightPx * pxToMm;

            if (!isFirstPage) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', margin, margin, contentWidthMm, sliceHeightMm);

            renderedHeightPx += sliceHeightPx;
            isFirstPage = false;
        }

        const name = (formData && formData.fullName) ? formData.fullName : 'CV';
        pdf.save(`${name}_${fileSuffix}.pdf`);
    }

    showToast(message, type) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(message);
        }
    }

    checkLibraries() {
        const libraries = {
            'html2canvas': typeof html2canvas !== 'undefined',
            'jspdf': typeof jspdf !== 'undefined'
        };

        const missing = Object.keys(libraries).filter(key => !libraries[key]);

        if (missing.length > 0) {
            this.showToast(`Library berikut tidak ditemukan: ${missing.join(', ')}. Silakan refresh halaman.`, 'error');
            return false;
        }

        return true;
    }
}

// Export for use in main app
window.PDFGenerator = PDFGenerator;
