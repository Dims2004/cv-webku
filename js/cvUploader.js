// CV Uploader Module - Handles file upload and parsing
class CVUploader {
    constructor() {
        this.supportedFormats = ['.pdf', '.doc', '.docx', '.txt', '.json'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }

    uploadCV(file) {
        return new Promise((resolve, reject) => {
            // Validate file
            if (!this.validateFile(file)) {
                reject(new Error('File tidak valid'));
                return;
            }

            const extension = this.getFileExtension(file.name);
            
            // Parse based on file type
            switch(extension) {
                case '.pdf':
                case '.doc':
                case '.docx':
                    this.parseDocument(file).then(resolve).catch(reject);
                    break;
                case '.txt':
                    this.parseTextFile(file).then(resolve).catch(reject);
                    break;
                case '.json':
                    this.parseJSONFile(file).then(resolve).catch(reject);
                    break;
                default:
                    reject(new Error('Format file tidak didukung'));
            }
        });
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            this.showToast('Ukuran file terlalu besar (maks 5MB)', 'error');
            return false;
        }
        
        // Check file type
        const ext = this.getFileExtension(file.name);
        if (!this.supportedFormats.includes(ext)) {
            this.showToast('Format file tidak didukung', 'error');
            return false;
        }
        
        return true;
    }

    getFileExtension(filename) {
        return '.' + filename.split('.').pop().toLowerCase();
    }

    parseDocument(file) {
        return new Promise((resolve) => {
            // Simulate document parsing
            this.showToast('Membaca dokumen...', 'info');
            
            setTimeout(() => {
                // For demo, return sample data
                const data = this.getSampleData();
                resolve(data);
            }, 1500);
        });
    }

    parseTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    // Simple text parsing - for demo, we'll use sample data
                    const data = this.parseText(text);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Gagal membaca file teks'));
                }
            };
            reader.onerror = () => reject(new Error('Gagal membaca file'));
            reader.readAsText(file);
        });
    }

    parseJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Format JSON tidak valid'));
                }
            };
            reader.onerror = () => reject(new Error('Gagal membaca file'));
            reader.readAsText(file);
        });
    }

    parseText(text) {
        // Simple text parsing - for demo
        const lines = text.split('\n').filter(line => line.trim());
        const data = {
            personal: {
                fullName: '',
                position: '',
                email: '',
                phone: '',
                linkedin: '',
                portfolio: '',
                domicile: ''
            },
            about: {
                aboutMe: '',
                education: ''
            },
            experience: {
                experiences: []
            },
            projects: {
                projects: []
            },
            skills: {
                skills: '',
                certifications: ''
            }
        };
        
        // Try to extract information from text
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (lower.includes('nama') || lower.includes('name')) {
                const parts = line.split(':');
                if (parts.length > 1) {
                    data.personal.fullName = parts[1].trim();
                }
            } else if (lower.includes('email')) {
                const email = line.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
                if (email) data.personal.email = email[0];
            } else if (lower.includes('telp') || lower.includes('phone')) {
                const phone = line.match(/\+?\d[\d\s\-()]{8,14}/);
                if (phone) data.personal.phone = phone[0];
            }
        });
        
        return data;
    }

    getSampleData() {
        // Tidak lagi mengembalikan data contoh berisi nama/kontak pribadi.
        // Struktur tetap dipertahankan supaya kode lain yang memanggil
        // fungsi ini tidak error, tapi semua nilainya kosong.
        return {
            personal: {
                fullName: '',
                position: '',
                email: '',
                phone: '',
                linkedin: '',
                portfolio: '',
                domicile: ''
            },
            about: {
                aboutMe: '',
                education: ''
            },
            experience: {
                experiences: []
            },
            projects: {
                projects: []
            },
            skills: {
                skills: '',
                certifications: ''
            }
        };
    }

    showToast(message, type) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        }
    }

    // Drag and drop support
    setupDragAndDrop(dropZone) {
        if (!dropZone) return;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.uploadCV(files[0]).then(data => {
                    if (window.app) {
                        window.app.populateFormWithData(data);
                        window.app.showCVBuilder();
                        this.showToast('CV berhasil diunggah!', 'success');
                    }
                }).catch(error => {
                    this.showToast(error.message, 'error');
                });
            }
        });
    }
}

// Export for use in main app
window.CVUploader = CVUploader;
