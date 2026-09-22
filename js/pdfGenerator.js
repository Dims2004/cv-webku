// PDF Generator Module - Handles PDF generation and download
class PDFGenerator {
    constructor() {
        this.isGenerating = false;
    }

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
            await this.waitForImages(previewElement);
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            const titleColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--cv-title-color').trim() || '#a11d3d';
            const cvFont = getComputedStyle(document.documentElement)
                .getPropertyValue('--cv-font-family').trim();

            const RENDER_SCALE = 3;
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

                    // --- Foto profil ATS: sejajar atas dengan nama ---
                    // align-self: flex-start supaya foto tidak melar dan tidak
                    // melebihi batas atas header. Ukuran 90x110px.
                    const clonedPhotoBox = clonedDoc.querySelector('.preview-photo-box');
                    if (clonedPhotoBox) {
                        clonedPhotoBox.style.width = '90px';
                        clonedPhotoBox.style.height = '110px';
                        clonedPhotoBox.style.flex = '0 0 90px';
                        clonedPhotoBox.style.alignSelf = 'flex-start';
                        clonedPhotoBox.style.marginTop = '0';
                        clonedPhotoBox.style.overflow = 'hidden';
                        clonedPhotoBox.style.borderRadius = '0';
                        clonedPhotoBox.style.border = '1px solid #1a1a2e';

                        const clonedPhotoImg = clonedPhotoBox.querySelector('img');
                        if (clonedPhotoImg) {
                            clonedPhotoImg.style.width = '100%';
                            clonedPhotoImg.style.height = '100%';
                            clonedPhotoImg.style.objectFit = 'cover';
                            clonedPhotoImg.style.objectPosition = 'center top';
                            clonedPhotoImg.style.display = 'block';
                        }
                    }

                    // --- Pastikan header ATS tetap flex row saat capture ---
                    const clonedHeader = clonedDoc.querySelector('.preview-header-main');
                    if (clonedHeader) {
                        clonedHeader.style.display = 'flex';
                        clonedHeader.style.flexDirection = 'row';
                        clonedHeader.style.alignItems = 'flex-start';
                        clonedHeader.style.gap = '16px';
                        clonedHeader.style.borderBottom = '1.5px solid #1a1a2e';
                        clonedHeader.style.paddingBottom = '12px';
                        clonedHeader.style.marginBottom = '14px';
                    }

                    const clonedHeaderText = clonedDoc.querySelector('.preview-header-text');
                    if (clonedHeaderText) {
                        clonedHeaderText.style.flex = '1';
                        clonedHeaderText.style.minWidth = '0';
                        clonedHeaderText.style.display = 'flex';
                        clonedHeaderText.style.flexDirection = 'column';
                        clonedHeaderText.style.paddingTop = '0';
                    }

                    // Pastikan link di kontak & dokumen punya style konsisten
                    clonedDoc.querySelectorAll(
                        '.preview-contact-row a, .preview-doc-links a, .preview-doc-link-inline, .creative-sidebar-link'
                    ).forEach(a => {
                        a.style.color = '#1a56db';
                        a.style.textDecoration = 'underline';
                    });

                    // Pastikan ikon di dalam link kontak benar-benar hilang
                    clonedDoc.querySelectorAll('.preview-contact-row a i').forEach(i => {
                        i.style.display = 'none';
                    });

                    // Force heading colors explicitly on the clone.
                    const heading = clonedDoc.querySelector('.preview-header-main h1');
                    if (heading) heading.style.color = titleColor;
                    clonedDoc.querySelectorAll('.preview-section-title').forEach(el => {
                        el.style.color = titleColor;
                        el.style.borderBottomColor = titleColor;
                    });

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

    buildMultiPagePdf(sourceCanvas, formData, fileSuffix = 'CV') {
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

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

window.PDFGenerator = PDFGenerator;
