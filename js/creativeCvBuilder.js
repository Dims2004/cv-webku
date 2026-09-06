// Creative CV Builder Module - Handles the one-page "CV Creative" form,
// its live preview, and its PDF export. Kept separate from the ATS
// CVBuilderApp (main.js) so the two CV types don't interfere with each other.
class CreativeCvBuilder {
    constructor() {
        this.photoDataUrl = null;
        this.bindEvents();
        this.populateSampleData();
    }

    bindEvents() {
        const form = document.getElementById('creativeCvForm');
        if (!form) return; // Screen not present in this page, bail out safely.

        // Auto update preview on any input/textarea change inside the form
        // (except the photo file input, handled separately).
        form.addEventListener('input', (e) => {
            if (e.target.id === 'creativePhotoInput') return;
            this.updatePreview();
        });

        document.getElementById('addCreativeExperienceBtn').addEventListener('click', () => this.addExperience());
        document.getElementById('addCreativeEducationBtn').addEventListener('click', () => this.addEducation());
        document.getElementById('addCreativeSkillBtn').addEventListener('click', () => this.addSkillCategory());

        document.getElementById('previewBtnCreative').addEventListener('click', () => this.updatePreview());
        document.getElementById('downloadPDFBtnCreative').addEventListener('click', () => this.downloadPDF());

        // Checkbox "Masih berlangsung/Sekarang" pada Periode: pakai event
        // delegation di level container supaya berlaku baik untuk item
        // bawaan (statis) maupun item yang ditambah lewat tombol "Tambah...".
        this.setupOngoingCheckbox('creativeExperienceContainer', '.work-item', 'creative-exp-period-ongoing', 'creative-exp-period-end');
        this.setupOngoingCheckbox('creativeEducationContainer', '.education-item', 'creative-edu-period-ongoing', 'creative-edu-period-end');

        this.setupPhotoUpload();
    }

    // ============ SAMPLE DATA ============
    // Form Creative CV dimulai kosong, tanpa data contoh apa pun. Tiap
    // section multi-entry tetap diberi satu baris kosong (bukan dihapus
    // total) supaya user langsung tahu di mana harus mengisi.
    populateSampleData() {
        document.getElementById('creativeFullName').value = '';
        document.getElementById('creativePosition').value = '';
        document.getElementById('creativePhone').value = '';
        document.getElementById('creativeEmail').value = '';
        document.getElementById('creativeLinkedin').value = '';
        document.getElementById('creativeInstagram').value = '';
        document.getElementById('creativeAboutMe').value = '';

        const experiences = [
            { company: '', position: '', location: '', periodStart: '', periodEnd: '', ongoing: false, description: '' }
        ];

        const educations = [
            { major: '', institution: '', location: '', periodStart: '', periodEnd: '', ongoing: false }
        ];

        const skills = [
            { category: '', items: '' }
        ];

        const expContainer = document.getElementById('creativeExperienceContainer');
        expContainer.innerHTML = '';
        experiences.forEach((exp, index) => {
            const item = this.createExperienceItem(exp);
            expContainer.appendChild(item);
            if (index > 0) item.querySelector('.btn-remove-work').classList.remove('hidden');
        });

        const eduContainer = document.getElementById('creativeEducationContainer');
        eduContainer.innerHTML = '';
        educations.forEach((edu, index) => {
            const item = this.createEducationItem(edu);
            eduContainer.appendChild(item);
            if (index > 0) item.querySelector('.btn-remove-edu').classList.remove('hidden');
        });

        const skillContainer = document.getElementById('creativeSkillsContainer');
        skillContainer.innerHTML = '';
        skills.forEach((skill, index) => {
            const item = this.createSkillCategoryItem(skill);
            skillContainer.appendChild(item);
            if (index > 0) item.querySelector('.btn-remove-skill').classList.remove('hidden');
        });

        this.updatePreview();
    }

    // ============ PENGALAMAN ============
    createExperienceItem(data = { company: '', position: '', location: '', periodStart: '', periodEnd: '', ongoing: false, description: '' }) {
        const div = document.createElement('div');
        div.className = 'work-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label>Perusahaan / Organisasi</label>
                <input type="text" class="form-input creative-exp-company" value="${this.escapeHtml(data.company)}" placeholder="Nama perusahaan / organisasi">
            </div>
            <div class="form-group">
                <label>Posisi</label>
                <input type="text" class="form-input creative-exp-position" value="${this.escapeHtml(data.position)}" placeholder="Posisi / jabatan">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" class="form-input creative-exp-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi">
                </div>
                <div class="form-group">
                    <label>Periode</label>
                    <div class="period-picker">
                        <input type="month" class="form-input creative-exp-period-start" value="${this.escapeHtml(data.periodStart || '')}">
                        <span class="period-sep">–</span>
                        <input type="month" class="form-input creative-exp-period-end" value="${this.escapeHtml(data.periodEnd || '')}" ${isOngoing ? 'disabled' : ''}>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="creative-exp-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        Masih berlangsung (Sekarang)
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Deskripsi (satu poin per baris)</label>
                <textarea class="form-textarea creative-exp-description" rows="3" placeholder="Tuliskan tiap poin di baris baru...">${this.escapeHtml(data.description)}</textarea>
            </div>
            <button type="button" class="btn-remove-work hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;

        div.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });

        div.querySelector('.btn-remove-work').addEventListener('click', () => {
            if (document.querySelectorAll('#creativeExperienceContainer .work-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Pengalaman dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu pengalaman', 'error');
            }
        });

        return div;
    }

    addExperience() {
        const container = document.getElementById('creativeExperienceContainer');
        container.appendChild(this.createExperienceItem());
        document.querySelectorAll('#creativeExperienceContainer .btn-remove-work').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Pengalaman ditambahkan', 'success');
    }

    // ============ PENDIDIKAN ============
    createEducationItem(data = { major: '', institution: '', location: '', periodStart: '', periodEnd: '', ongoing: false }) {
        const div = document.createElement('div');
        div.className = 'education-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label>Jurusan / Program</label>
                <input type="text" class="form-input creative-edu-major" value="${this.escapeHtml(data.major)}" placeholder="Jurusan / Program studi">
            </div>
            <div class="form-group">
                <label>Institusi</label>
                <input type="text" class="form-input creative-edu-institution" value="${this.escapeHtml(data.institution)}" placeholder="Nama institusi">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" class="form-input creative-edu-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi">
                </div>
                <div class="form-group">
                    <label>Periode</label>
                    <div class="period-picker">
                        <select class="form-input creative-edu-period-start">${this.buildYearOptions(data.periodStart)}</select>
                        <span class="period-sep">–</span>
                        <select class="form-input creative-edu-period-end" ${isOngoing ? 'disabled' : ''}>${this.buildYearOptions(data.periodEnd)}</select>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="creative-edu-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        Masih berkuliah (Sekarang)
                    </label>
                </div>
            </div>
            <button type="button" class="btn-remove-edu hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;

        div.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });

        div.querySelector('.btn-remove-edu').addEventListener('click', () => {
            if (document.querySelectorAll('#creativeEducationContainer .education-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Pendidikan dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu pendidikan', 'error');
            }
        });

        return div;
    }

    addEducation() {
        const container = document.getElementById('creativeEducationContainer');
        container.appendChild(this.createEducationItem());
        document.querySelectorAll('#creativeEducationContainer .btn-remove-edu').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Pendidikan ditambahkan', 'success');
    }

    // ============ KEAHLIAN ============
    createSkillCategoryItem(data = { category: '', items: '' }) {
        const div = document.createElement('div');
        div.className = 'skill-category-item';
        div.innerHTML = `
            <div class="form-group">
                <label>Kategori Skill</label>
                <input type="text" class="form-input creative-skill-category" value="${this.escapeHtml(data.category)}" placeholder="Contoh: IoT, Pemrograman, dll (boleh dikosongkan)">
            </div>
            <div class="form-group">
                <label>Daftar Skill</label>
                <textarea class="form-textarea creative-skill-items" rows="2" placeholder="Pisahkan dengan koma">${this.escapeHtml(data.items)}</textarea>
            </div>
            <button type="button" class="btn-remove-skill hidden">
                <i class="fas fa-times"></i> Hapus Kategori
            </button>
        `;

        div.querySelector('.btn-remove-skill').addEventListener('click', () => {
            if (document.querySelectorAll('#creativeSkillsContainer .skill-category-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Kategori skill dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu kategori skill', 'error');
            }
        });

        return div;
    }

    addSkillCategory() {
        const container = document.getElementById('creativeSkillsContainer');
        container.appendChild(this.createSkillCategoryItem());
        document.querySelectorAll('#creativeSkillsContainer .btn-remove-skill').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Kategori skill ditambahkan', 'success');
    }

    // ============ PHOTO UPLOAD ============
    setupPhotoUpload() {
        const fileInput = document.getElementById('creativePhotoInput');
        const preview = document.getElementById('creativePhotoPreview');
        const removeBtn = document.getElementById('removeCreativePhotoBtn');
        if (!fileInput || !preview || !removeBtn) return;

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                this.showToast('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG', 'error');
                fileInput.value = '';
                return;
            }

            // Batas ukuran file ASLI (sebelum dikompres) dinaikkan ke 15MB
            // karena foto dari kamera HP wajar berukuran beberapa MB.
            // Gambar tetap otomatis diperkecil di bawah supaya tetap ringan.
            if (file.size > 15 * 1024 * 1024) {
                this.showToast('Ukuran file terlalu besar. Maksimal 15MB', 'error');
                fileInput.value = '';
                return;
            }

            this.showToast('Memproses foto profil...', 'info');

            try {
                this.photoDataUrl = await this.compressImageFile(file, 800, 0.85);
                preview.innerHTML = `<img src="${this.photoDataUrl}" alt="Foto profil">`;
                removeBtn.classList.remove('hidden');
                this.updatePreview();
                this.showToast('Foto profil berhasil diupload', 'success');
            } catch (error) {
                console.error('Gagal memproses foto profil:', error);
                this.showToast('Gagal memproses foto. Coba gunakan foto lain', 'error');
                fileInput.value = '';
            }
        });

        removeBtn.addEventListener('click', () => {
            this.photoDataUrl = null;
            preview.innerHTML = `<i class="fas fa-user"></i><span>Belum ada foto</span>`;
            removeBtn.classList.add('hidden');
            fileInput.value = '';
            this.updatePreview();
            this.showToast('Foto profil dihapus', 'info');
        });
    }

    // ============ IMAGE COMPRESSION ============
    // Membaca sebuah File gambar, memperkecil sisi terpanjangnya ke maxWidth,
    // lalu mengekspornya sebagai JPEG dengan kualitas tertentu supaya foto
    // besar dari kamera HP tidak membuat halaman berat atau gagal diproses.
    compressImageFile(file, maxWidth = 800, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Gagal membaca file'));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error('Gagal memuat gambar'));
                img.onload = () => {
                    const scale = Math.min(1, maxWidth / img.width);
                    const targetWidth = Math.round(img.width * scale);
                    const targetHeight = Math.round(img.height * scale);

                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    try {
                        resolve(canvas.toDataURL('image/jpeg', quality));
                    } catch (err) {
                        reject(err);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ============ ONGOING CHECKBOX ("Masih berlangsung / Sekarang") ============
    // Event delegation di level container supaya berlaku baik untuk item
    // bawaan (statis di index.html) maupun item yang ditambah lewat tombol.
    setupOngoingCheckbox(containerId, itemSelector, ongoingClass, endClass) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.addEventListener('change', (e) => {
            if (!e.target.classList.contains(ongoingClass)) return;
            const item = e.target.closest(itemSelector);
            const endInput = item.querySelector('.' + endClass);
            endInput.disabled = e.target.checked;
            if (e.target.checked) endInput.value = '';
            this.updatePreview();
        });
    }

    // ============ YEAR DROPDOWN (untuk Periode Pendidikan) ============
    // Membuat daftar <option> tahun otomatis (dari tahun depan mundur ke
    // belakang) supaya user tinggal memilih, tidak perlu mengetik manual.
    buildYearOptions(selectedValue = '') {
        const currentYear = new Date().getFullYear();
        const fromYear = currentYear + 1;
        const toYear = 1970;
        let options = '<option value=""></option>';
        for (let year = fromYear; year >= toYear; year--) {
            const isSelected = String(year) === String(selectedValue) ? 'selected' : '';
            options += `<option value="${year}" ${isSelected}>${year}</option>`;
        }
        return options;
    }

    // ============ PERIOD FORMATTING (date picker -> teks "Bulan YYYY") ============
    // Input type="month" mengembalikan nilai format "YYYY-MM". Fungsi ini
    // mengubahnya jadi teks berbahasa Indonesia, misalnya "2023-08" -> "Agustus 2023".
    formatMonthID(value) {
        if (!value) return '';
        const bulanID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const [year, month] = value.split('-');
        const idx = parseInt(month, 10) - 1;
        if (isNaN(idx) || !bulanID[idx] || !year) return value;
        return `${bulanID[idx]} ${year}`;
    }

    // Menggabungkan tanggal mulai/selesai (atau "Sekarang" jika masih
    // berlangsung) jadi satu string periode, misalnya "Agustus 2023 - Sekarang".
    formatPeriodID(startValue, endValue, ongoing) {
        const start = this.formatMonthID(startValue);
        const end = ongoing ? 'Sekarang' : this.formatMonthID(endValue);
        if (start && end) return `${start} - ${end}`;
        return start || end || '';
    }

    // Menggabungkan tahun mulai/selesai (atau "Sekarang" jika masih
    // berlangsung) jadi satu string periode, misalnya "2020 - 2024".
    formatYearPeriodID(startYear, endYear, ongoing) {
        const end = ongoing ? 'Sekarang' : (endYear || '');
        if (startYear && end) return `${startYear} - ${end}`;
        return startYear || end || '';
    }

    // ============ HELPER ============
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============ COLLECT FORM DATA ============
    collectFormData() {
        const experiences = [];
        document.querySelectorAll('#creativeExperienceContainer .work-item').forEach(item => {
            const periodStart = item.querySelector('.creative-exp-period-start').value;
            const periodEnd = item.querySelector('.creative-exp-period-end').value;
            const ongoing = item.querySelector('.creative-exp-period-ongoing').checked;
            experiences.push({
                company: item.querySelector('.creative-exp-company').value,
                position: item.querySelector('.creative-exp-position').value,
                location: item.querySelector('.creative-exp-location').value,
                period: this.formatPeriodID(periodStart, periodEnd, ongoing),
                description: item.querySelector('.creative-exp-description').value
            });
        });

        const educations = [];
        document.querySelectorAll('#creativeEducationContainer .education-item').forEach(item => {
            const periodStart = item.querySelector('.creative-edu-period-start').value;
            const periodEnd = item.querySelector('.creative-edu-period-end').value;
            const ongoing = item.querySelector('.creative-edu-period-ongoing').checked;
            educations.push({
                major: item.querySelector('.creative-edu-major').value,
                institution: item.querySelector('.creative-edu-institution').value,
                location: item.querySelector('.creative-edu-location').value,
                period: this.formatYearPeriodID(periodStart, periodEnd, ongoing)
            });
        });

        const skills = [];
        document.querySelectorAll('#creativeSkillsContainer .skill-category-item').forEach(item => {
            const category = item.querySelector('.creative-skill-category').value;
            const items = item.querySelector('.creative-skill-items').value;
            if (category || items) {
                skills.push({ category, items });
            }
        });

        return {
            fullName: document.getElementById('creativeFullName').value,
            position: document.getElementById('creativePosition').value,
            phone: document.getElementById('creativePhone').value,
            email: document.getElementById('creativeEmail').value,
            linkedin: document.getElementById('creativeLinkedin').value,
            instagram: document.getElementById('creativeInstagram').value,
            aboutMe: document.getElementById('creativeAboutMe').value,
            photo: this.photoDataUrl,
            experiences,
            educations,
            skills
        };
    }

    // ============ UPDATE PREVIEW ============
    updatePreview() {
        const preview = document.getElementById('creativeCvPreview');
        if (!preview) return;
        const data = this.collectFormData();

        // Contact list (icons row)
        const contactParts = [];
        if (data.phone) contactParts.push(`<span><i class="fas fa-phone"></i> ${this.escapeHtml(data.phone)}</span>`);
        if (data.linkedin) contactParts.push(`<span><i class="fab fa-linkedin"></i> ${this.escapeHtml(data.linkedin)}</span>`);
        if (data.email) contactParts.push(`<span><i class="fas fa-envelope"></i> ${this.escapeHtml(data.email)}</span>`);
        if (data.instagram) contactParts.push(`<span><i class="fab fa-instagram"></i> ${this.escapeHtml(data.instagram)}</span>`);

        // Pengalaman
        let expHTML = '';
        data.experiences.forEach(exp => {
            if (!exp.company && !exp.position) return;
            const bullets = (exp.description || '')
                .split('\n')
                .map(l => l.trim())
                .filter(l => l)
                .map(l => `<li>${this.escapeHtml(l)}</li>`)
                .join('');
            expHTML += `
                <div class="creative-item">
                    <div class="creative-item-header">
                        <strong>${this.escapeHtml(exp.position || '')}</strong>
                        <span class="creative-item-period">${this.escapeHtml(exp.period || '')}</span>
                    </div>
                    <div class="creative-item-sub">${this.escapeHtml(exp.company || '')}${exp.location ? ' — ' + this.escapeHtml(exp.location) : ''}</div>
                    ${bullets ? `<ul class="creative-item-bullets">${bullets}</ul>` : ''}
                </div>
            `;
        });

        // Pendidikan
        let eduHTML = '';
        data.educations.forEach(edu => {
            if (!edu.major && !edu.institution) return;
            eduHTML += `
                <div class="creative-edu-entry">
                    <strong>${this.escapeHtml(edu.major || '')}</strong>
                    <div class="creative-item-sub">${this.escapeHtml(edu.institution || '')}${edu.location ? ' — ' + this.escapeHtml(edu.location) : ''}</div>
                    <div class="creative-item-period">${this.escapeHtml(edu.period || '')}</div>
                </div>
            `;
        });

        // Keahlian
        let skillsHTML = '';
        data.skills.forEach(skill => {
            if (!skill.category && !skill.items) return;
            const itemsList = skill.items ? skill.items.split(',').map(s => s.trim()).filter(s => s) : [];
            const categoryPart = skill.category ? `<strong>${this.escapeHtml(skill.category)}:</strong> ` : '';
            skillsHTML += `<li>${categoryPart}${this.escapeHtml(itemsList.join(', '))}</li>`;
        });

        const photoHTML = data.photo
            ? `<img src="${data.photo}" alt="Foto profil">`
            : `<i class="fas fa-user"></i>`;

        preview.innerHTML = `
            <div class="creative-preview-content">
                <div class="creative-header">
                    <div class="creative-photo">${photoHTML}</div>
                    <div class="creative-header-info">
                        <h1>${this.escapeHtml(data.fullName || 'NAMA LENGKAP')}</h1>
                        <div class="creative-position">${this.escapeHtml(data.position || 'Posisi / Jabatan')}</div>
                        <div class="creative-contact-list">${contactParts.join('')}</div>
                    </div>
                </div>
                <div class="creative-divider"></div>

                ${data.aboutMe ? `
                <div class="creative-section">
                    <h2 class="creative-section-title">Profil Singkat</h2>
                    <p class="creative-about-text">${this.escapeHtml(data.aboutMe)}</p>
                </div>` : ''}

                <div class="creative-columns">
                    <div class="creative-col-left">
                        ${expHTML ? `
                        <h2 class="creative-section-title">Pengalaman</h2>
                        ${expHTML}` : ''}
                    </div>
                    <div class="creative-col-right">
                        ${eduHTML ? `
                        <h2 class="creative-section-title">Pendidikan</h2>
                        ${eduHTML}` : ''}
                        ${skillsHTML ? `
                        <h2 class="creative-section-title">Keahlian</h2>
                        <ul class="creative-skills-list">${skillsHTML}</ul>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ============ DOWNLOAD PDF ============
    downloadPDF() {
        if (typeof PDFGenerator === 'undefined') {
            this.showToast('Fitur PDF tidak tersedia. Silakan refresh halaman.', 'error');
            return;
        }

        const pdfGenerator = new PDFGenerator();
        if (!pdfGenerator.checkLibraries()) return;

        const formData = this.collectFormData();
        const hasData = formData.fullName || formData.position || formData.aboutMe || formData.experiences.length > 0;

        if (!hasData) {
            this.showToast('Tidak ada data CV untuk diekspor. Silakan isi formulir terlebih dahulu.', 'error');
            return;
        }

        const downloadBtn = document.getElementById('downloadPDFBtnCreative');
        const originalText = downloadBtn.innerHTML;

        try {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            downloadBtn.disabled = true;

            pdfGenerator.generatePDF(formData, {
                previewElementId: 'creativeCvPreview',
                fileSuffix: 'CV_Creative'
            });

            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }, 5000);
        } catch (error) {
            console.error('PDF download error:', error);
            this.showToast('Gagal download PDF: ' + error.message, 'error');
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(message);
        }
    }
}

// Initialize alongside the main app.
document.addEventListener('DOMContentLoaded', () => {
    window.creativeCv = new CreativeCvBuilder();
});

window.CreativeCvBuilder = CreativeCvBuilder;
