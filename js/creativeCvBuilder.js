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

        const colorPicker = document.getElementById('creativeColorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => this.setAccentColor(e.target.value));
            this.loadAccentColor();
        }

        // Checkbox "Masih berlangsung/Sekarang" pada Periode
        this.setupOngoingCheckbox('creativeExperienceContainer', '.work-item', 'creative-exp-period-ongoing', 'creative-exp-period-end');
        this.setupOngoingCheckbox('creativeEducationContainer', '.education-item', 'creative-edu-period-ongoing', 'creative-edu-period-end');

        this.setupPhotoUpload();
    }

    // ============ SAMPLE DATA ============
    populateSampleData() {
        document.getElementById('creativeFullName').value = '';
        document.getElementById('creativePosition').value = '';
        document.getElementById('creativePhone').value = '';
        document.getElementById('creativeEmail').value = '';
        document.getElementById('creativeLinkedin').value = '';
        document.getElementById('creativeInstagram').value = '';
        document.getElementById('creativeAddress').value = '';
        document.getElementById('creativeAboutMe').value = '';
        document.getElementById('creativeLanguages').value = '';
        document.getElementById('creativeTraining').value = '';
        document.getElementById('creativeCertifications').value = '';
        document.getElementById('creativeAchievements').value = '';

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

    // ============ ONGOING CHECKBOX ============
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

    // ============ YEAR DROPDOWN ============
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

    // ============ PERIOD FORMATTING ============
    formatMonthID(value) {
        if (!value) return '';
        const bulanID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const [year, month] = value.split('-');
        const idx = parseInt(month, 10) - 1;
        if (isNaN(idx) || !bulanID[idx] || !year) return value;
        return `${bulanID[idx]} ${year}`;
    }

    formatPeriodID(startValue, endValue, ongoing) {
        const start = this.formatMonthID(startValue);
        const end = ongoing ? 'Sekarang' : this.formatMonthID(endValue);
        if (start && end) return `${start} - ${end}`;
        return start || end || '';
    }

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

    // Normalisasi URL: pastikan selalu punya protokol supaya bisa diklik.
    formatLinkUrl(url) {
        if (url === null || url === undefined) return '';
        const trimmed = String(url).trim();
        if (!trimmed) return '';
        if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`;
        if (/^[+\d][\d\s\-()]{6,}$/.test(trimmed)) {
            return `tel:${trimmed.replace(/[^\d+]/g, '')}`;
        }
        return `https://${trimmed}`;
    }

    parseLines(text) {
        if (!text) return [];
        return text.split('\n').map(l => l.trim()).filter(l => l);
    }

    // ============ WARNA AKSEN ============
    setAccentColor(color) {
        document.documentElement.style.setProperty('--creative-accent-color', color);
        localStorage.setItem('creativeAccentColor', color);
    }

    loadAccentColor() {
        const savedColor = localStorage.getItem('creativeAccentColor');
        const picker = document.getElementById('creativeColorPicker');
        const color = savedColor || (picker ? picker.value : '#14b8a6');

        document.documentElement.style.setProperty('--creative-accent-color', color);
        if (picker) picker.value = color;
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
            address: document.getElementById('creativeAddress').value,
            languages: this.parseLines(document.getElementById('creativeLanguages').value),
            training: this.parseLines(document.getElementById('creativeTraining').value),
            certifications: this.parseLines(document.getElementById('creativeCertifications').value),
            achievements: this.parseLines(document.getElementById('creativeAchievements').value),
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

        // Kontak (sidebar) — LinkedIn & Instagram jadi link yang bisa diklik.
        // Email & telepon juga dijadikan link (mailto: / tel:) supaya konsisten.
        const contactParts = [];

        if (data.email) {
            const safe = this.escapeHtml(data.email);
            const mailHref = this.formatLinkUrl(data.email);
            contactParts.push(
                `<li><i class="fas fa-envelope"></i> ` +
                `<span><a href="${mailHref}" class="creative-sidebar-link">${safe}</a></span></li>`
            );
        }

        if (data.phone) {
            const safe = this.escapeHtml(data.phone);
            const tel = data.phone.replace(/[^\d+]/g, '');
            contactParts.push(
                `<li><i class="fas fa-phone"></i> ` +
                `<span><a href="tel:${tel}" class="creative-sidebar-link">${safe}</a></span></li>`
            );
        }

        if (data.address) {
            contactParts.push(
                `<li><i class="fas fa-map-marker-alt"></i> ` +
                `<span>${this.escapeHtml(data.address)}</span></li>`
            );
        }

        if (data.linkedin) {
            const href = this.formatLinkUrl(data.linkedin);
            const label = this.escapeHtml(data.linkedin);
            contactParts.push(
                `<li><i class="fab fa-linkedin"></i> ` +
                `<span><a href="${href}" target="_blank" rel="noopener noreferrer" class="creative-sidebar-link">${label}</a></span></li>`
            );
        }

        if (data.instagram) {
            const raw = data.instagram.trim().replace(/^@/, '');
            const href = `https://instagram.com/${encodeURIComponent(raw)}`;
            const label = this.escapeHtml(data.instagram);
            contactParts.push(
                `<li><i class="fab fa-instagram"></i> ` +
                `<span><a href="${href}" target="_blank" rel="noopener noreferrer" class="creative-sidebar-link">${label}</a></span></li>`
            );
        }

        // Keahlian (sidebar)
        let skillsHTML = '';
        data.skills.forEach(skill => {
            if (!skill.category && !skill.items) return;
            const itemsList = skill.items ? skill.items.split(',').map(s => s.trim()).filter(s => s) : [];
            if (skill.category) {
                skillsHTML += `<li><strong>${this.escapeHtml(skill.category)}:</strong> ${this.escapeHtml(itemsList.join(', '))}</li>`;
            } else {
                itemsList.forEach(it => { skillsHTML += `<li>${this.escapeHtml(it)}</li>`; });
            }
        });

        // Bahasa & Pencapaian (sidebar)
        const languagesHTML = data.languages.map(l => `<li>${this.escapeHtml(l)}</li>`).join('');
        const achievementsHTML = data.achievements.map(a => `<li>${this.escapeHtml(a)}</li>`).join('');

        // Pengalaman Kerja (konten utama)
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

        // Pendidikan (konten utama)
        let eduHTML = '';
        data.educations.forEach(edu => {
            if (!edu.major && !edu.institution) return;
            eduHTML += `
                <div class="creative-edu-entry">
                    <div>${this.escapeHtml(edu.major || '')}</div>
                    <strong>${this.escapeHtml(edu.institution || '')}${edu.location ? ' — ' + this.escapeHtml(edu.location) : ''}</strong>
                    <div class="creative-item-period">${this.escapeHtml(edu.period || '')}</div>
                </div>
            `;
        });

        // Pelatihan & Sertifikasi (konten utama)
        const trainingHTML = data.training.map(t => `<li>${this.escapeHtml(t)}</li>`).join('');
        const certificationsHTML = data.certifications.map(c => `<li>${this.escapeHtml(c)}</li>`).join('');

        const photoHTML = data.photo
            ? `<img src="${data.photo}" alt="Foto profil">`
            : `<i class="fas fa-user"></i>`;

        preview.innerHTML = `
            <div class="creative-preview-content creative-sidebar-layout">
                <aside class="creative-sidebar">
                    <div class="creative-sidebar-photo">${photoHTML}</div>

                    ${contactParts.length ? `
                    <div class="creative-sidebar-section">
                        <h3>Kontak</h3>
                        <ul class="creative-sidebar-list creative-contact-sidebar-list">${contactParts.join('')}</ul>
                    </div>` : ''}

                    ${skillsHTML ? `
                    <div class="creative-sidebar-section">
                        <h3>Skills</h3>
                        <ul class="creative-sidebar-list">${skillsHTML}</ul>
                    </div>` : ''}

                    ${languagesHTML ? `
                    <div class="creative-sidebar-section">
                        <h3>Bahasa</h3>
                        <ul class="creative-sidebar-list">${languagesHTML}</ul>
                    </div>` : ''}

                    ${achievementsHTML ? `
                    <div class="creative-sidebar-section">
                        <h3>Pencapaian</h3>
                        <ul class="creative-sidebar-list">${achievementsHTML}</ul>
                    </div>` : ''}
                </aside>

                <main class="creative-main">
                    <h1>${this.escapeHtml(data.fullName || 'Nama Lengkap')}</h1>
                    ${data.position ? `<div class="creative-position">${this.escapeHtml(data.position)}</div>` : ''}

                    ${data.aboutMe ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">Tentang Saya</h2>
                        <p class="creative-about-text">${this.escapeHtml(data.aboutMe)}</p>
                    </div>` : ''}

                    ${eduHTML ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">Pendidikan</h2>
                        ${eduHTML}
                    </div>` : ''}

                    <div class="creative-section">
                        <h2 class="creative-section-title">Pengalaman Kerja</h2>
                        ${expHTML}
                    </div>

                    ${trainingHTML ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">Pelatihan</h2>
                        <ul class="creative-main-list">${trainingHTML}</ul>
                    </div>` : ''}

                    ${certificationsHTML ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">Sertifikasi</h2>
                        <ul class="creative-main-list">${certificationsHTML}</ul>
                    </div>` : ''}
                </main>
            </div>
        `;

        this.syncSidebarHeight();
    }

    // ============ SAMAKAN TINGGI SIDEBAR & KONTEN UTAMA ============
    syncSidebarHeight() {
        requestAnimationFrame(() => {
            const sidebar = document.querySelector('#creativeCvPreview .creative-sidebar');
            const main = document.querySelector('#creativeCvPreview .creative-main');
            if (!sidebar || !main) return;

            sidebar.style.minHeight = '';
            main.style.minHeight = '';

            const tallest = Math.max(sidebar.scrollHeight, main.scrollHeight);
            sidebar.style.minHeight = tallest + 'px';
            main.style.minHeight = tallest + 'px';

            const photoImg = sidebar.querySelector('.creative-sidebar-photo img');
            if (photoImg && !photoImg.complete) {
                photoImg.addEventListener('load', () => this.syncSidebarHeight(), { once: true });
            }
        });
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
