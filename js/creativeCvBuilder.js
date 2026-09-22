// Creative CV Builder Module
class CreativeCvBuilder {
    constructor() {
        this.photoDataUrl = null;
        this.bindEvents();
        this.populateSampleData();

        // Re-render ketika bahasa berubah
        document.addEventListener('languageChanged', () => {
            this.updatePreview();
        });
    }

    t(key) {
        return window.i18n ? window.i18n.t(key) : key;
    }

    bindEvents() {
        const form = document.getElementById('creativeCvForm');
        if (!form) return;

        form.addEventListener('input', (e) => {
            if (e.target.id === 'creativePhotoInput') return;
            this.updatePreview();
        });

        document.getElementById('addCreativeExperienceBtn').addEventListener('click', () => this.addExperience());
        document.getElementById('addCreativeEducationBtn').addEventListener('click', () => this.addEducation());
        document.getElementById('addCreativeSkillBtn').addEventListener('click', () => this.addSkillCategory());

        document.getElementById('previewBtnCreative').addEventListener('click', () => this.updatePreview());
        document.getElementById('downloadPDFBtnCreative').addEventListener('click', () => this.downloadPDF());
        document.getElementById('downloadWordBtnCreative').addEventListener('click', () => this.downloadWord());

        const colorPicker = document.getElementById('creativeColorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => this.setAccentColor(e.target.value));
            this.loadAccentColor();
        }

        this.setupOngoingCheckbox('creativeExperienceContainer', '.work-item', 'creative-exp-period-ongoing', 'creative-exp-period-end');
        this.setupOngoingCheckbox('creativeEducationContainer', '.education-item', 'creative-edu-period-ongoing', 'creative-edu-period-end');

        this.setupPhotoUpload();
    }

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

        const expContainer = document.getElementById('creativeExperienceContainer');
        expContainer.innerHTML = '';
        expContainer.appendChild(this.createExperienceItem());

        const eduContainer = document.getElementById('creativeEducationContainer');
        eduContainer.innerHTML = '';
        eduContainer.appendChild(this.createEducationItem());

        const skillContainer = document.getElementById('creativeSkillsContainer');
        skillContainer.innerHTML = '';
        skillContainer.appendChild(this.createSkillCategoryItem());

        this.updatePreview();
    }

    createExperienceItem(data = { company: '', position: '', location: '', periodStart: '', periodEnd: '', ongoing: false, description: '' }) {
        const div = document.createElement('div');
        div.className = 'work-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label data-i18n="labelCompanyOrg">Perusahaan / Organisasi</label>
                <input type="text" class="form-input creative-exp-company" value="${this.escapeHtml(data.company)}" placeholder="Nama perusahaan / organisasi" data-i18n-placeholder="phCompanyOrg">
            </div>
            <div class="form-group">
                <label data-i18n="labelPosition">Posisi</label>
                <input type="text" class="form-input creative-exp-position" value="${this.escapeHtml(data.position)}" placeholder="Posisi / jabatan" data-i18n-placeholder="phPositionJob">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label data-i18n="labelLocation">Lokasi</label>
                    <input type="text" class="form-input creative-exp-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi" data-i18n-placeholder="phLocation">
                </div>
                <div class="form-group">
                    <label data-i18n="labelPeriod">Periode</label>
                    <div class="period-picker">
                        <input type="month" class="form-input creative-exp-period-start" value="${this.escapeHtml(data.periodStart || '')}">
                        <span class="period-sep">–</span>
                        <input type="month" class="form-input creative-exp-period-end" value="${this.escapeHtml(data.periodEnd || '')}" ${isOngoing ? 'disabled' : ''}>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="creative-exp-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        <span data-i18n="ongoingNow">Masih berlangsung (Sekarang)</span>
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label data-i18n="labelDescriptionPerLine">Deskripsi (satu poin per baris)</label>
                <textarea class="form-textarea creative-exp-description" rows="3" placeholder="Tuliskan tiap poin di baris baru..." data-i18n-placeholder="phDescriptionPerLine">${this.escapeHtml(data.description)}</textarea>
            </div>
            <button type="button" class="btn-remove-work hidden">
                <i class="fas fa-times"></i> <span data-i18n="delete">Hapus</span>
            </button>
        `;

        div.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });

        div.querySelector('.btn-remove-work').addEventListener('click', () => {
            if (document.querySelectorAll('#creativeExperienceContainer .work-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast(this.t('delete'), 'info');
            } else {
                this.showToast('Minimal satu', 'error');
            }
        });

        if (window.i18n) window.i18n.applyTranslations();
        return div;
    }

    addExperience() {
        const container = document.getElementById('creativeExperienceContainer');
        container.appendChild(this.createExperienceItem());
        document.querySelectorAll('#creativeExperienceContainer .btn-remove-work').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast(this.t('addExperience'), 'success');
    }

    createEducationItem(data = { major: '', institution: '', location: '', periodStart: '', periodEnd: '', ongoing: false }) {
        const div = document.createElement('div');
        div.className = 'education-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label data-i18n="labelMajor">Jurusan / Program</label>
                <input type="text" class="form-input creative-edu-major" value="${this.escapeHtml(data.major)}" placeholder="Jurusan / Program studi" data-i18n-placeholder="phMajor">
            </div>
            <div class="form-group">
                <label data-i18n="labelInstitution">Institusi</label>
                <input type="text" class="form-input creative-edu-institution" value="${this.escapeHtml(data.institution)}" placeholder="Nama institusi" data-i18n-placeholder="phInstitution">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label data-i18n="labelLocation">Lokasi</label>
                    <input type="text" class="form-input creative-edu-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi" data-i18n-placeholder="phLocation">
                </div>
                <div class="form-group">
                    <label data-i18n="labelPeriod">Periode</label>
                    <div class="period-picker">
                        <select class="form-input creative-edu-period-start">${this.buildYearOptions(data.periodStart)}</select>
                        <span class="period-sep">–</span>
                        <select class="form-input creative-edu-period-end" ${isOngoing ? 'disabled' : ''}>${this.buildYearOptions(data.periodEnd)}</select>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="creative-edu-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        <span data-i18n="ongoingStudy">Masih berkuliah (Sekarang)</span>
                    </label>
                </div>
            </div>
            <button type="button" class="btn-remove-edu hidden">
                <i class="fas fa-times"></i> <span data-i18n="delete">Hapus</span>
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
                this.showToast(this.t('delete'), 'info');
            } else {
                this.showToast('Minimal satu', 'error');
            }
        });

        if (window.i18n) window.i18n.applyTranslations();
        return div;
    }

    addEducation() {
        const container = document.getElementById('creativeEducationContainer');
        container.appendChild(this.createEducationItem());
        document.querySelectorAll('#creativeEducationContainer .btn-remove-edu').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast(this.t('addEducation'), 'success');
    }

    createSkillCategoryItem(data = { category: '', items: '' }) {
        const div = document.createElement('div');
        div.className = 'skill-category-item';
        div.innerHTML = `
            <div class="form-group">
                <label data-i18n="labelSkillCategory">Kategori Skill</label>
                <input type="text" class="form-input creative-skill-category" value="${this.escapeHtml(data.category)}" placeholder="Contoh: IoT, Pemrograman, dll (boleh dikosongkan)" data-i18n-placeholder="phSkillCategoryCreative">
            </div>
            <div class="form-group">
                <label data-i18n="labelSkillItems">Daftar Skill</label>
                <textarea class="form-textarea creative-skill-items" rows="2" placeholder="Pisahkan dengan koma" data-i18n-placeholder="phSkillItemsShort">${this.escapeHtml(data.items)}</textarea>
            </div>
            <button type="button" class="btn-remove-skill hidden">
                <i class="fas fa-times"></i> <span data-i18n="deleteCategory">Hapus Kategori</span>
            </button>
        `;

        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });

        div.querySelector('.btn-remove-skill').addEventListener('click', () => {
            if (document.querySelectorAll('#creativeSkillsContainer .skill-category-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast(this.t('delete'), 'info');
            } else {
                this.showToast('Minimal satu', 'error');
            }
        });

        if (window.i18n) window.i18n.applyTranslations();
        return div;
    }

    addSkillCategory() {
        const container = document.getElementById('creativeSkillsContainer');
        container.appendChild(this.createSkillCategoryItem());
        document.querySelectorAll('#creativeSkillsContainer .btn-remove-skill').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast(this.t('addSkill'), 'success');
    }

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
                this.showToast('Format file tidak didukung', 'error');
                fileInput.value = '';
                return;
            }

            if (file.size > 15 * 1024 * 1024) {
                this.showToast('Maksimal 15MB', 'error');
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
                console.error('Gagal memproses foto:', error);
                this.showToast('Gagal memproses foto', 'error');
                fileInput.value = '';
            }
        });

        removeBtn.addEventListener('click', () => {
            this.photoDataUrl = null;
            preview.innerHTML = `<i class="fas fa-user"></i><span data-i18n="noPhoto">Belum ada foto</span>`;
            removeBtn.classList.add('hidden');
            fileInput.value = '';
            this.updatePreview();
            if (window.i18n) window.i18n.applyTranslations();
            this.showToast('Foto dihapus', 'info');
        });
    }

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

    formatMonthID(value) {
        if (!value) return '';
        const bulanID = window.i18n ? window.i18n.t('months') : [];
        const [year, month] = value.split('-');
        const idx = parseInt(month, 10) - 1;
        if (isNaN(idx) || !bulanID[idx] || !year) return value;
        return `${bulanID[idx]} ${year}`;
    }

    formatPeriodID(startValue, endValue, ongoing) {
        const start = this.formatMonthID(startValue);
        const end = ongoing ? this.t('now') : this.formatMonthID(endValue);
        if (start && end) return `${start} - ${end}`;
        return start || end || '';
    }

    formatYearPeriodID(startYear, endYear, ongoing) {
        const end = ongoing ? this.t('now') : (endYear || '');
        if (startYear && end) return `${startYear} - ${end}`;
        return startYear || end || '';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

    updatePreview() {
        const preview = document.getElementById('creativeCvPreview');
        if (!preview) return;
        const data = this.collectFormData();
        const t = (k) => this.t(k);

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

        const languagesHTML = data.languages.map(l => `<li>${this.escapeHtml(l)}</li>`).join('');
        const achievementsHTML = data.achievements.map(a => `<li>${this.escapeHtml(a)}</li>`).join('');

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

        const trainingHTML = data.training.map(x => `<li>${this.escapeHtml(x)}</li>`).join('');
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
                        <h3>${t('pvContact')}</h3>
                        <ul class="creative-sidebar-list creative-contact-sidebar-list">${contactParts.join('')}</ul>
                    </div>` : ''}

                    ${skillsHTML ? `
                    <div class="creative-sidebar-section">
                        <h3>${t('pvSkills')}</h3>
                        <ul class="creative-sidebar-list">${skillsHTML}</ul>
                    </div>` : ''}

                    ${languagesHTML ? `
                    <div class="creative-sidebar-section">
                        <h3>${t('pvLanguages')}</h3>
                        <ul class="creative-sidebar-list">${languagesHTML}</ul>
                    </div>` : ''}

                    ${achievementsHTML ? `
                    <div class="creative-sidebar-section">
                        <h3>${t('pvAchievements')}</h3>
                        <ul class="creative-sidebar-list">${achievementsHTML}</ul>
                    </div>` : ''}
                </aside>

                <main class="creative-main">
                    <h1>${this.escapeHtml(data.fullName || 'Nama Lengkap')}</h1>
                    ${data.position ? `<div class="creative-position">${this.escapeHtml(data.position)}</div>` : ''}

                    ${data.aboutMe ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">${t('pvAboutShort')}</h2>
                        <p class="creative-about-text">${this.escapeHtml(data.aboutMe)}</p>
                    </div>` : ''}

                    ${eduHTML ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">${t('pvEducation')}</h2>
                        ${eduHTML}
                    </div>` : ''}

                    <div class="creative-section">
                        <h2 class="creative-section-title">${t('pvExperience')}</h2>
                        ${expHTML}
                    </div>

                    ${trainingHTML ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">${t('pvTraining')}</h2>
                        <ul class="creative-main-list">${trainingHTML}</ul>
                    </div>` : ''}

                    ${certificationsHTML ? `
                    <div class="creative-section">
                        <h2 class="creative-section-title">${t('pvCertifications')}</h2>
                        <ul class="creative-main-list">${certificationsHTML}</ul>
                    </div>` : ''}
                </main>
            </div>
        `;

        this.syncSidebarHeight();
    }

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

    downloadPDF() {
        if (typeof PDFGenerator === 'undefined') {
            this.showToast('Fitur PDF tidak tersedia.', 'error');
            return;
        }

        const pdfGenerator = new PDFGenerator();
        if (!pdfGenerator.checkLibraries()) return;

        const formData = this.collectFormData();
        const hasData = formData.fullName || formData.position || formData.aboutMe || formData.experiences.length > 0;

        if (!hasData) {
            this.showToast('Tidak ada data CV untuk diekspor.', 'error');
            return;
        }

        const downloadBtn = document.getElementById('downloadPDFBtnCreative');
        const originalText = downloadBtn.innerHTML;

        try {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
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

    downloadWord() {
        if (typeof WordGenerator === 'undefined') {
            this.showToast('Fitur Word tidak tersedia.', 'error');
            return;
        }

        const formData = this.collectFormData();
        const hasData = formData.fullName || formData.position || formData.aboutMe || formData.experiences.length > 0;

        if (!hasData) {
            this.showToast('Tidak ada data CV untuk diekspor.', 'error');
            return;
        }

        const wordGen = new WordGenerator();
        const downloadBtn = document.getElementById('downloadWordBtnCreative');
        const originalText = downloadBtn.innerHTML;

        try {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            downloadBtn.disabled = true;

            wordGen.generateWord(formData, { type: 'creative', fileSuffix: 'CV_Creative' });

            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Word download error:', error);
            this.showToast('Gagal download Word: ' + error.message, 'error');
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

document.addEventListener('DOMContentLoaded', () => {
    window.creativeCv = new CreativeCvBuilder();
});

window.CreativeCvBuilder = CreativeCvBuilder;
