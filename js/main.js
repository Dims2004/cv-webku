// Main Application Controller
class CVBuilderApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.theme = 'light';
        this.certImageCounter = 0;
        // ATS profile photo state: kept separately from the form fields
        // (like the certificate images) since it isn't a plain text input.
        this.atsPhotoDataUrl = null;
        this.atsPhotoOption = 'none';
        this.initializeApp();
    }

    initializeApp() {
        // Base history entry: without this, the browser's Back button has
        // nowhere inside the app to return to and just navigates away from
        // the site entirely once the user goes into the CV builder.
        history.replaceState({ screen: 'welcome' }, '', window.location.pathname + window.location.search);

        this.hideLoading();
        this.bindEvents();
        this.loadTheme();
        this.loadTitleColor();
        this.loadCvFont();
        this.setupFileUpload();
        this.setupATSPhotoUpload();
        // Initialize with sample data for demo
        this.populateSampleData();
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                app.classList.remove('hidden');
                app.style.opacity = '0';
                setTimeout(() => {
                    app.style.opacity = '1';
                    app.style.transition = 'opacity 0.5s ease';
                }, 50);
            }, 300);
        }, 1000);
    }

    bindEvents() {
        // --- Core ATS builder bindings (must always run, even if the new
        // CV-type modal / creative screen markup isn't present yet) ---
        document.getElementById('backToHomeBtn').addEventListener('click', () => this.showWelcomeScreen());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('previewBtn').addEventListener('click', () => this.updatePreview());
        document.getElementById('downloadPDFBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('titleColorPicker').addEventListener('input', (e) => this.setTitleColor(e.target.value));
        document.getElementById('fontPicker').addEventListener('change', (e) => this.setCvFont(e.target.value));

        // "Buat CV Baru" opens the CV type modal if it exists on the page,
        // otherwise falls back to going straight into the ATS builder so the
        // button never ends up doing nothing.
        const createCVBtn = document.getElementById('createCVBtn');
        if (createCVBtn) {
            createCVBtn.addEventListener('click', () => {
                if (document.getElementById('cvTypeModal')) {
                    this.openCvTypeModal();
                } else {
                    this.showCVBuilder();
                }
            });
        }

        // Handle the browser's Back/Forward buttons so they navigate
        // between the app's own screens instead of leaving the site.
        window.addEventListener('popstate', (e) => {
            const screen = e.state && e.state.screen ? e.state.screen : 'welcome';
            this.navigateToScreen(screen, false);
        });

        // Form inputs - auto update preview
        document.querySelectorAll('#cvForm input:not(.cert-file-input), #cvForm textarea, #cvForm select').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });

        // Add buttons
        document.getElementById('addEducationBtn').addEventListener('click', () => this.addEducation());
        document.getElementById('addInternshipBtn').addEventListener('click', () => this.addInternship());
        document.getElementById('addWorkBtn').addEventListener('click', () => this.addWork());
        document.getElementById('addOrganizationBtn').addEventListener('click', () => this.addOrganization());
        document.getElementById('addProjectBtn').addEventListener('click', () => this.addProject());
        document.getElementById('addCertificationBtn').addEventListener('click', () => this.addCertification());
        document.getElementById('addSkillBtn').addEventListener('click', () => this.addSkillCategory());

        // --- CV type selection modal (only wired up if present in the DOM) ---
        const closeCvTypeModalBtn = document.getElementById('closeCvTypeModal');
        if (closeCvTypeModalBtn) {
            closeCvTypeModalBtn.addEventListener('click', () => this.closeCvTypeModal());
        }
        const cvTypeModal = document.getElementById('cvTypeModal');
        if (cvTypeModal) {
            cvTypeModal.addEventListener('click', (e) => {
                if (e.target.id === 'cvTypeModal') this.closeCvTypeModal();
            });
        }
        document.querySelectorAll('.cv-type-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                this.closeCvTypeModal();
                if (type === 'creative') {
                    this.showCreativeBuilder();
                } else {
                    this.showCVBuilder();
                }
            });
        });

        // --- Creative CV builder screen back button (guarded: only exists
        // if the creative builder section has been added to the page) ---
        const backToHomeBtnCreative = document.getElementById('backToHomeBtnCreative');
        if (backToHomeBtnCreative) {
            backToHomeBtnCreative.addEventListener('click', () => this.showWelcomeScreen());
        }

        // Checkbox "Masih berlangsung/Sekarang" pada tiap section periode:
        // pakai event delegation di level container supaya berlaku baik
        // untuk item bawaan (statis di index.html) maupun item yang
        // ditambah lewat tombol "Tambah...".
        this.setupOngoingCheckbox('educationContainer', '.education-item', 'edu-period-ongoing', 'edu-period-end');
        this.setupOngoingCheckbox('internshipContainer', '.internship-item', 'int-period-ongoing', 'int-period-end');
        this.setupOngoingCheckbox('workContainer', '.work-item', 'work-period-ongoing', 'work-period-end');
        this.setupOngoingCheckbox('organizationContainer', '.organization-item', 'org-period-ongoing', 'org-period-end');

        // Klik gambar sertifikat di preview untuk membukanya di tab baru.
        // Pakai event delegation karena elemen ini di-render ulang tiap kali
        // updatePreview() dipanggil.
        const cvPreview = document.getElementById('cvPreview');
        if (cvPreview) {
            cvPreview.addEventListener('click', (e) => {
                const target = e.target.closest('[data-cert-image]');
                if (target) {
                    const win = window.open();
                    if (win) {
                        win.document.write(`<img src="${target.dataset.certImage}" style="max-width:100%;height:auto;">`);
                    }
                }
            });
        }

        // --- Welcome popup (muncul sekali per browser saat pertama kali buka) ---
        const welcomeModal = document.getElementById('welcomeModal');
        if (welcomeModal) {
            const WELCOME_KEY = 'cvbuilder_welcome_shown';
            if (!localStorage.getItem(WELCOME_KEY)) {
                setTimeout(() => {
                    welcomeModal.classList.remove('hidden');
                }, 1300); // muncul setelah loading screen selesai
            }

            const closeWelcome = () => {
                welcomeModal.classList.add('hidden');
                localStorage.setItem(WELCOME_KEY, '1');
            };

            document.getElementById('closeWelcomeModal').addEventListener('click', closeWelcome);
            document.getElementById('welcomeModalOkBtn').addEventListener('click', closeWelcome);
            welcomeModal.addEventListener('click', (e) => {
                if (e.target.id === 'welcomeModal') closeWelcome();
            });
        }
    }

    populateSampleData() {
        // Form dimulai kosong (tidak ada data contoh/dummy). Setiap section
        // multi-entry tetap diberi satu baris kosong supaya user langsung
        // tahu di mana harus mengetik, tapi tanpa isi apa pun di dalamnya.
        const sampleData = {
            fullName: '',
            position: '',
            email: '',
            phone: '',
            linkedin: '',
            portfolio: '',
            domicile: '',
            aboutMe: '',
            education: [
                { institution: '', major: '', location: '', periodStart: '', periodEnd: '', ongoing: false, gpa: '' }
            ],
            internships: [
                { company: '', position: '', location: '', periodStart: '', periodEnd: '', ongoing: false, description: '' }
            ],
            workExperiences: [],
            organizations: [],
            projects: [],
            skills: [
                { category: '', items: '' }
            ],
            certifications: [
                { name: '', issuer: '', year: '', image: null }
            ]
        };

        // Populate form
        document.getElementById('fullName').value = sampleData.fullName;
        document.getElementById('position').value = sampleData.position;
        document.getElementById('email').value = sampleData.email;
        document.getElementById('phone').value = sampleData.phone;
        document.getElementById('linkedin').value = sampleData.linkedin;
        document.getElementById('portfolio').value = sampleData.portfolio;
        document.getElementById('domicile').value = sampleData.domicile;
        document.getElementById('aboutMe').value = sampleData.aboutMe;

        // Add education
        const eduContainer = document.getElementById('educationContainer');
        eduContainer.innerHTML = '';
        sampleData.education.forEach((edu, index) => {
            const item = this.createEducationItem(edu);
            eduContainer.appendChild(item);
            if (index > 0) {
                item.querySelector('.btn-remove-edu').classList.remove('hidden');
            }
        });

        // Add internships
        const intContainer = document.getElementById('internshipContainer');
        intContainer.innerHTML = '';
        sampleData.internships.forEach((int, index) => {
            const item = this.createInternshipItem(int);
            intContainer.appendChild(item);
            if (index > 0) {
                item.querySelector('.btn-remove-int').classList.remove('hidden');
            }
        });

        // Add skills with categories
        const skillsContainer = document.getElementById('skillsContainer');
        skillsContainer.innerHTML = '';
        sampleData.skills.forEach((skill, index) => {
            const item = this.createSkillCategoryItem(skill);
            skillsContainer.appendChild(item);
            if (index > 0) {
                item.querySelector('.btn-remove-skill').classList.remove('hidden');
            }
        });

        // Add certifications with images
        const certContainer = document.getElementById('certificationContainer');
        certContainer.innerHTML = '';
        sampleData.certifications.forEach((cert, index) => {
            const item = this.createCertificationItem(cert);
            certContainer.appendChild(item);
            if (index > 0) {
                item.querySelector('.btn-remove-cert').classList.remove('hidden');
            }
        });

        this.updatePreview();
    }

    // ============ EDUCATION ============
    createEducationItem(data = { institution: '', major: '', location: '', periodStart: '', periodEnd: '', ongoing: false, gpa: '', linkIjazah: '', linkIjazahTitle: '', linkTranskrip: '', linkTranskripTitle: '' }) {
        const div = document.createElement('div');
        div.className = 'education-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label>Institusi</label>
                <input type="text" class="form-input edu-institution" value="${this.escapeHtml(data.institution)}" placeholder="Nama institusi">
            </div>
            <div class="form-group">
                <label>Jurusan / Program</label>
                <input type="text" class="form-input edu-major" value="${this.escapeHtml(data.major)}" placeholder="Jurusan / Program studi">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" class="form-input edu-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi">
                </div>
                <div class="form-group">
                    <label>Periode</label>
                    <div class="period-picker">
                        <select class="form-input edu-period-start">${this.buildYearOptions(data.periodStart)}</select>
                        <span class="period-sep">–</span>
                        <select class="form-input edu-period-end" ${isOngoing ? 'disabled' : ''}>${this.buildYearOptions(data.periodEnd)}</select>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="edu-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        Masih berkuliah (Sekarang)
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>GPA / Prestasi (Opsional)</label>
                <input type="text" class="form-input edu-gpa" value="${this.escapeHtml(data.gpa)}" placeholder="GPA: 3.58 atau prestasi lainnya">
            </div>
            <div class="form-group link-field-group">
                <label>Link Ijazah (Opsional)</label>
                <input type="text" class="form-input edu-link-ijazah-title" value="${this.escapeHtml(data.linkIjazahTitle)}" placeholder="Judul link (contoh: Lihat Ijazah)">
                <input type="url" class="form-input edu-link-ijazah" value="${this.escapeHtml(data.linkIjazah)}" placeholder="Link Google Drive/Dropbox ke scan ijazah">
            </div>
            <div class="form-group link-field-group">
                <label>Link Transkrip Nilai (Opsional)</label>
                <input type="text" class="form-input edu-link-transkrip-title" value="${this.escapeHtml(data.linkTranskripTitle)}" placeholder="Judul link (contoh: Lihat Transkrip Nilai)">
                <input type="url" class="form-input edu-link-transkrip" value="${this.escapeHtml(data.linkTranskrip)}" placeholder="Link Google Drive/Dropbox ke scan transkrip">
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
            if (document.querySelectorAll('#cvForm .education-item').length > 1) {
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
        const container = document.getElementById('educationContainer');
        const item = this.createEducationItem();
        container.appendChild(item);
        document.querySelectorAll('#cvForm .education-item .btn-remove-edu').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Pendidikan ditambahkan', 'success');
    }

    // ============ INTERNSHIP ============
    createInternshipItem(data = { company: '', position: '', location: '', periodStart: '', periodEnd: '', ongoing: false, description: '', link: '', linkTitle: '' }) {
        const div = document.createElement('div');
        div.className = 'internship-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label>Perusahaan</label>
                <input type="text" class="form-input int-company" value="${this.escapeHtml(data.company)}" placeholder="Nama perusahaan">
            </div>
            <div class="form-group">
                <label>Posisi</label>
                <input type="text" class="form-input int-position" value="${this.escapeHtml(data.position)}" placeholder="Posisi magang">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" class="form-input int-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi">
                </div>
                <div class="form-group">
                    <label>Periode</label>
                    <div class="period-picker">
                        <input type="month" class="form-input int-period-start" value="${this.escapeHtml(data.periodStart || '')}">
                        <span class="period-sep">–</span>
                        <input type="month" class="form-input int-period-end" value="${this.escapeHtml(data.periodEnd || '')}" ${isOngoing ? 'disabled' : ''}>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="int-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        Masih magang (Sekarang)
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Deskripsi</label>
                <textarea class="form-textarea int-description" rows="3" placeholder="Deskripsi pekerjaan...">${this.escapeHtml(data.description)}</textarea>
            </div>
            <div class="form-group link-field-group">
                <label>Link Sertifikat/Referensi Magang (Opsional)</label>
                <input type="text" class="form-input int-link-title" value="${this.escapeHtml(data.linkTitle)}" placeholder="Judul link (contoh: Lihat Sertifikat Magang)">
                <input type="url" class="form-input int-link" value="${this.escapeHtml(data.link)}" placeholder="Link sertifikat/surat referensi magang">
            </div>
            <button type="button" class="btn-remove-int hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;
        
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
        
        div.querySelector('.btn-remove-int').addEventListener('click', () => {
            if (document.querySelectorAll('#cvForm .internship-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Pengalaman magang dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu pengalaman magang', 'error');
            }
        });
        
        return div;
    }

    addInternship() {
        const container = document.getElementById('internshipContainer');
        const item = this.createInternshipItem();
        container.appendChild(item);
        document.querySelectorAll('#cvForm .internship-item .btn-remove-int').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Pengalaman magang ditambahkan', 'success');
    }

    // ============ WORK EXPERIENCE ============
    createWorkItem(data = { company: '', position: '', location: '', periodStart: '', periodEnd: '', ongoing: false, description: '', link: '', linkTitle: '' }) {
        const div = document.createElement('div');
        div.className = 'work-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label>Perusahaan</label>
                <input type="text" class="form-input work-company" value="${this.escapeHtml(data.company)}" placeholder="Nama perusahaan">
            </div>
            <div class="form-group">
                <label>Posisi</label>
                <input type="text" class="form-input work-position" value="${this.escapeHtml(data.position)}" placeholder="Posisi/jabatan">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" class="form-input work-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi">
                </div>
                <div class="form-group">
                    <label>Periode</label>
                    <div class="period-picker">
                        <input type="month" class="form-input work-period-start" value="${this.escapeHtml(data.periodStart || '')}">
                        <span class="period-sep">–</span>
                        <input type="month" class="form-input work-period-end" value="${this.escapeHtml(data.periodEnd || '')}" ${isOngoing ? 'disabled' : ''}>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="work-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        Masih bekerja di sini (Sekarang)
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Deskripsi</label>
                <textarea class="form-textarea work-description" rows="3" placeholder="Deskripsi pekerjaan...">${this.escapeHtml(data.description)}</textarea>
            </div>
            <div class="form-group link-field-group">
                <label>Link Referensi/Surat Kerja (Opsional)</label>
                <input type="text" class="form-input work-link-title" value="${this.escapeHtml(data.linkTitle)}" placeholder="Judul link (contoh: Lihat Surat Referensi)">
                <input type="url" class="form-input work-link" value="${this.escapeHtml(data.link)}" placeholder="Link surat referensi/pengalaman kerja">
            </div>
            <button type="button" class="btn-remove-work hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;
        
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
        
        div.querySelector('.btn-remove-work').addEventListener('click', () => {
            if (document.querySelectorAll('#cvForm .work-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Pengalaman kerja dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu pengalaman kerja', 'error');
            }
        });
        
        return div;
    }

    addWork() {
        const container = document.getElementById('workContainer');
        const item = this.createWorkItem();
        container.appendChild(item);
        document.querySelectorAll('#cvForm .work-item .btn-remove-work').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Pengalaman kerja ditambahkan', 'success');
    }

    // ============ ORGANIZATION ============
    createOrganizationItem(data = { name: '', position: '', location: '', periodStart: '', periodEnd: '', ongoing: false, description: '' }) {
        const div = document.createElement('div');
        div.className = 'organization-item';
        const isOngoing = !!data.ongoing;
        div.innerHTML = `
            <div class="form-group">
                <label>Organisasi</label>
                <input type="text" class="form-input org-name" maxlength="60" value="${this.escapeHtml(data.name)}" placeholder="Nama organisasi (maks. 60 karakter)">
            </div>
            <div class="form-group">
                <label>Posisi</label>
                <input type="text" class="form-input org-position" maxlength="60" value="${this.escapeHtml(data.position)}" placeholder="Posisi/jabatan">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" class="form-input org-location" maxlength="60" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi">
                </div>
                <div class="form-group">
                    <label>Periode</label>
                    <div class="period-picker">
                        <input type="month" class="form-input org-period-start" value="${this.escapeHtml(data.periodStart || '')}">
                        <span class="period-sep">–</span>
                        <input type="month" class="form-input org-period-end" value="${this.escapeHtml(data.periodEnd || '')}" ${isOngoing ? 'disabled' : ''}>
                    </div>
                    <label class="period-ongoing-label">
                        <input type="checkbox" class="org-period-ongoing" ${isOngoing ? 'checked' : ''}>
                        Masih berlangsung (Sekarang)
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Deskripsi</label>
                <textarea class="form-textarea org-description" rows="3" placeholder="Deskripsi kegiatan...">${this.escapeHtml(data.description)}</textarea>
            </div>
            <button type="button" class="btn-remove-org hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;

        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });

        div.querySelector('.btn-remove-org').addEventListener('click', () => {
            if (document.querySelectorAll('#cvForm .organization-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Pengalaman organisasi dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu pengalaman organisasi', 'error');
            }
        });

        return div;
    }

    addOrganization() {
        const container = document.getElementById('organizationContainer');
        const item = this.createOrganizationItem();
        container.appendChild(item);
        document.querySelectorAll('#cvForm .organization-item .btn-remove-org').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Pengalaman organisasi ditambahkan', 'success');
    }

    // ============ PROJECTS ============
    createProjectItem(data = { name: '', description: '', tech: '', link: '', linkTitle: '' }) {
        const div = document.createElement('div');
        div.className = 'project-item';
        div.innerHTML = `
            <div class="form-group">
                <label>Nama Proyek</label>
                <input type="text" class="form-input project-name" value="${this.escapeHtml(data.name)}" placeholder="Nama proyek">
            </div>
            <div class="form-group">
                <label>Deskripsi</label>
                <textarea class="form-textarea project-description" rows="3" placeholder="Deskripsi proyek...">${this.escapeHtml(data.description)}</textarea>
            </div>
            <div class="form-group">
                <label>Teknologi / Tools</label>
                <input type="text" class="form-input project-tech" value="${this.escapeHtml(data.tech)}" placeholder="Teknologi yang digunakan">
            </div>
            <div class="form-group link-field-group">
                <label>Link Proyek (Opsional)</label>
                <input type="text" class="form-input project-link-title" value="${this.escapeHtml(data.linkTitle)}" placeholder="Judul link (contoh: Lihat Demo / GitHub)">
                <input type="url" class="form-input project-link" value="${this.escapeHtml(data.link)}" placeholder="Link demo/repository/live proyek">
            </div>
            <button type="button" class="btn-remove-project hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;
        
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
        
        div.querySelector('.btn-remove-project').addEventListener('click', () => {
            if (document.querySelectorAll('#cvForm .project-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Proyek dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu proyek', 'error');
            }
        });
        
        return div;
    }

    addProject() {
        const container = document.getElementById('projectContainer');
        const item = this.createProjectItem();
        container.appendChild(item);
        document.querySelectorAll('#cvForm .project-item .btn-remove-project').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Proyek ditambahkan', 'success');
    }

    // ============ SKILLS WITH CATEGORIES ============
    createSkillCategoryItem(data = { category: '', items: '' }) {
        const div = document.createElement('div');
        div.className = 'skill-category-item';
        div.innerHTML = `
            <div class="form-group">
                <label>Kategori Skill</label>
                <input type="text" class="form-input skill-category" value="${this.escapeHtml(data.category)}" placeholder="Contoh: Networking, Programming, IT Support, dll">
            </div>
            <div class="form-group">
                <label>Daftar Skill</label>
                <textarea class="form-textarea skill-items" rows="2" placeholder="Pisahkan dengan koma&#10;Contoh: Computer Networking, TCP/IP, Routing, Switching">${this.escapeHtml(data.items)}</textarea>
            </div>
            <button type="button" class="btn-remove-skill hidden">
                <i class="fas fa-times"></i> Hapus Kategori
            </button>
        `;
        
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
        
        div.querySelector('.btn-remove-skill').addEventListener('click', () => {
            if (document.querySelectorAll('#cvForm .skill-category-item').length > 1) {
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
        const container = document.getElementById('skillsContainer');
        const item = this.createSkillCategoryItem();
        container.appendChild(item);
        document.querySelectorAll('#cvForm .skill-category-item .btn-remove-skill').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Kategori skill ditambahkan', 'success');
    }

    // ============ CERTIFICATIONS WITH IMAGE UPLOAD ============
    createCertificationItem(data = { name: '', issuer: '', year: '', image: null, link: '', linkTitle: '' }) {
        const index = this.certImageCounter++;
        const div = document.createElement('div');
        div.className = 'certification-item';
        div.dataset.index = index;
        
        const hasImage = data.image && data.image !== null;
        const imageSrc = hasImage ? data.image : '';
        
        div.innerHTML = `
            <div class="form-group">
                <label>Nama Sertifikasi</label>
                <input type="text" class="form-input cert-name" value="${this.escapeHtml(data.name || '')}" placeholder="Nama sertifikasi">
            </div>
            <div class="form-group">
                <label>Penerbit</label>
                <input type="text" class="form-input cert-issuer" value="${this.escapeHtml(data.issuer || '')}" placeholder="Lembaga penerbit">
            </div>
            <div class="form-group">
                <label>Tahun</label>
                <select class="form-input cert-year">${this.buildYearOptions(data.year)}</select>
            </div>
            <div class="form-group link-field-group">
                <label>Link Sertifikat/Verifikasi (Opsional)</label>
                <input type="text" class="form-input cert-link-title" value="${this.escapeHtml(data.linkTitle)}" placeholder="Judul link (contoh: Lihat Sertifikat)">
                <input type="url" class="form-input cert-link" value="${this.escapeHtml(data.link)}" placeholder="Link verifikasi/sertifikat online">
            </div>
            <div class="form-group">
                <label>Upload Sertifikat (JPG, JPEG, PNG)</label>
                <div class="cert-upload-area">
                    <div class="cert-preview" id="certPreview_${index}">
                        ${hasImage ? `<img src="${imageSrc}" alt="Sertifikat">` : `<i class="fas fa-file-image"></i><span>Belum ada gambar</span>`}
                    </div>
                    <div class="cert-upload-controls">
                        <label class="btn-upload-cert">
                            <i class="fas fa-upload"></i>
                            Pilih Gambar
                            <input type="file" class="cert-file-input" accept="image/jpeg,image/jpg,image/png" hidden>
                        </label>
                        <button type="button" class="btn-remove-cert-image ${hasImage ? '' : 'hidden'}">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
            <button type="button" class="btn-remove-cert hidden">
                <i class="fas fa-times"></i> Hapus Sertifikasi
            </button>
        `;
        
        // Handle image upload
        const fileInput = div.querySelector('.cert-file-input');
        const preview = div.querySelector('.cert-preview');
        const removeBtn = div.querySelector('.btn-remove-cert-image');
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                this.showToast('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG', 'error');
                fileInput.value = '';
                return;
            }

            // Batas ukuran file asli sebelum dikompres. Foto sertifikat dari
            // kamera HP biasanya 3-8MB, jadi batas dinaikkan ke 15MB. Gambar
            // tetap akan dikompres/diperkecil otomatis di bawah supaya ringan.
            if (file.size > 15 * 1024 * 1024) {
                this.showToast('Ukuran file terlalu besar. Maksimal 15MB', 'error');
                fileInput.value = '';
                return;
            }

            this.showToast('Memproses gambar sertifikat...', 'info');

            try {
                const compressedDataUrl = await this.compressImageFile(file, 1200, 0.82);
                preview.innerHTML = `<img src="${compressedDataUrl}" alt="Sertifikat">`;
                removeBtn.classList.remove('hidden');
                this.updatePreview();
                this.showToast('Gambar sertifikat berhasil diupload', 'success');
            } catch (error) {
                console.error('Gagal memproses gambar sertifikat:', error);
                this.showToast('Gagal memproses gambar. Coba gunakan foto lain', 'error');
                fileInput.value = '';
            }
        });
        
        // Handle remove image
        removeBtn.addEventListener('click', () => {
            preview.innerHTML = `<i class="fas fa-file-image"></i><span>Belum ada gambar</span>`;
            removeBtn.classList.add('hidden');
            fileInput.value = '';
            this.updatePreview();
            this.showToast('Gambar sertifikat dihapus', 'info');
        });
        
        // Handle remove certification item
        div.querySelector('.btn-remove-cert').addEventListener('click', () => {
            if (document.querySelectorAll('#cvForm .certification-item').length > 1) {
                div.remove();
                this.updatePreview();
                this.showToast('Sertifikasi dihapus', 'info');
            } else {
                this.showToast('Minimal harus ada satu sertifikasi', 'error');
            }
        });
        
        // Auto update preview on input
        div.querySelectorAll('input:not(.cert-file-input), textarea, select').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
        
        return div;
    }

    addCertification() {
        const container = document.getElementById('certificationContainer');
        const item = this.createCertificationItem();
        container.appendChild(item);
        document.querySelectorAll('#cvForm .certification-item .btn-remove-cert').forEach(btn => btn.classList.remove('hidden'));
        this.updatePreview();
        this.showToast('Sertifikasi ditambahkan', 'success');
    }

    // ============ ONGOING CHECKBOX ("Masih berlangsung / Sekarang") ============
    // Dipasang lewat event delegation di level container (bukan langsung di
    // tiap item) supaya tetap berfungsi untuk item bawaan yang statis di
    // index.html maupun item yang baru ditambahkan lewat tombol "Tambah...".
    // Saat dicentang: field tanggal akhir dinonaktifkan & dikosongkan.
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

    // ============ YEAR DROPDOWN (untuk Periode Pendidikan & Tahun Sertifikasi) ============
    // Membuat daftar <option> tahun secara otomatis (dari tahun depan mundur
    // ke belakang) supaya user tinggal memilih, tidak perlu mengetik manual.
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

    // Menggabungkan tahun mulai/selesai (atau "Sekarang" jika masih
    // berlangsung) jadi satu string periode, misalnya "2020 - 2024".
    formatYearPeriodID(startYear, endYear, ongoing) {
        const end = ongoing ? 'Sekarang' : (endYear || '');
        if (startYear && end) return `${startYear} - ${end}`;
        return startYear || end || '';
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

    // Menggabungkan tanggal mulai/selesai (atau "Sekarang" jika masih berlangsung)
    // jadi satu string periode, misalnya "Agustus 2023 - Sekarang".
    formatPeriodID(startValue, endValue, ongoing) {
        const start = this.formatMonthID(startValue);
        const end = ongoing ? 'Sekarang' : this.formatMonthID(endValue);
        if (start && end) return `${start} - ${end}`;
        return start || end || '';
    }

    // ============ IMAGE COMPRESSION ============
    // Membaca sebuah File gambar, memperkecil sisi terpanjangnya ke maxWidth,
    // lalu mengekspornya sebagai JPEG dengan kualitas tertentu. Ini mencegah
    // foto besar dari kamera HP (beberapa MB) membuat halaman berat atau
    // gagal diproses, tanpa harus menolak upload penggunanya.
    compressImageFile(file, maxWidth = 1200, quality = 0.82) {
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

    // ============ HELPER METHODS ============
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Normalisasi URL supaya link selalu bisa diklik dengan benar, baik user
    // mengetik "linkedin.com/in/nama" maupun "https://linkedin.com/in/nama"
    // (mencegah URL ganda seperti "https://https://...").
    formatLinkUrl(url) {
        if (!url) return '';
        const trimmed = url.trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `https://${trimmed}`;
    }

    // Turns a multi-line description textarea into a proper bullet list
    // (one <li> per non-empty line) instead of a single <br>-separated
    // paragraph, matching how job/organization duties are listed on a
    // classic ATS resume.
    buildDescriptionListHTML(description) {
        if (!description) return '';
        const lines = description.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return '';
        const items = lines.map(line => `<li>${this.escapeHtml(line)}</li>`).join('');
        return `<ul class="exp-description">${items}</ul>`;
    }

    // Joins location + period with " • " only when both are present, so a
    // lone "•" doesn't show up when one of the two fields is left empty.
    joinMeta(location, period) {
        const parts = [location, period].map(p => (p || '').trim()).filter(p => p.length > 0);
        return this.escapeHtml(parts.join(' • '));
    }

    showCVBuilder() {
        this.navigateToScreen('builder', true);
        this.updatePreview();
        this.showToast('Silakan isi formulir CV Anda', 'info');
    }

    showCreativeBuilder() {
        this.navigateToScreen('creative-builder', true);
        if (window.creativeCv) {
            window.creativeCv.updatePreview();
        }
        this.showToast('Silakan isi formulir CV Creative Anda', 'info');
    }

    showWelcomeScreen() {
        this.navigateToScreen('welcome', true);
    }

    // ============ CV TYPE MODAL ============
    openCvTypeModal() {
        document.getElementById('cvTypeModal').classList.remove('hidden');
    }

    closeCvTypeModal() {
        document.getElementById('cvTypeModal').classList.add('hidden');
    }

    // Switches the visible screen. pushHistory=true adds a new browser
    // history entry (normal navigation, e.g. clicking "Buat CV Baru").
    // pushHistory=false is used when responding to popstate (the user
    // pressed Back/Forward) so we don't push a duplicate entry.
    navigateToScreen(screen, pushHistory) {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const cvBuilderScreen = document.getElementById('cvBuilderScreen');
        const creativeBuilderScreen = document.getElementById('creativeBuilderScreen');

        welcomeScreen.classList.add('hidden');
        cvBuilderScreen.classList.add('hidden');
        creativeBuilderScreen.classList.add('hidden');

        let hash = window.location.pathname + window.location.search;
        if (screen === 'builder') {
            cvBuilderScreen.classList.remove('hidden');
            hash = '#buat-cv';
        } else if (screen === 'creative-builder') {
            creativeBuilderScreen.classList.remove('hidden');
            hash = '#buat-cv-creative';
        } else {
            welcomeScreen.classList.remove('hidden');
        }
        this.currentScreen = screen;

        if (pushHistory) {
            history.pushState({ screen }, '', hash);
        }
    }

    handleUploadCV() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.txt,.json';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadCVFile(file);
            }
        };
        fileInput.click();
    }

    uploadCVFile(file) {
        this.showToast('Memproses file CV...', 'info');
        setTimeout(() => {
            this.populateSampleData();
            this.showCVBuilder();
            this.showToast('CV berhasil diunggah! Silakan periksa dan edit.', 'success');
        }, 1500);
    }

    toggleTheme() {
        const body = document.body;
        const icon = document.querySelector('#themeToggle i');
        
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            icon.className = 'fas fa-moon';
            this.theme = 'light';
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            icon.className = 'fas fa-sun';
            this.theme = 'dark';
            localStorage.setItem('theme', 'dark');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('#themeToggle i').className = 'fas fa-sun';
            this.theme = 'dark';
        }
    }

    // ============ CV TITLE COLOR (name + section headings) ============
    setTitleColor(color) {
        document.documentElement.style.setProperty('--cv-title-color', color);
        localStorage.setItem('cvTitleColor', color);
    }

    loadTitleColor() {
        const savedColor = localStorage.getItem('cvTitleColor');
        const picker = document.getElementById('titleColorPicker');
        const color = savedColor || (picker ? picker.value : '#a11d3d');

        document.documentElement.style.setProperty('--cv-title-color', color);
        if (picker) picker.value = color;
    }

    // ============ CV FONT (Calibri, Arial, Georgia, dst) ============
    setCvFont(fontFamily) {
        document.documentElement.style.setProperty('--cv-font-family', fontFamily);
        localStorage.setItem('cvFontFamily', fontFamily);
    }

    loadCvFont() {
        const savedFont = localStorage.getItem('cvFontFamily');
        const picker = document.getElementById('fontPicker');
        const fontFamily = savedFont || (picker ? picker.value : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif");

        document.documentElement.style.setProperty('--cv-font-family', fontFamily);
        if (picker) picker.value = fontFamily;
    }

    setupFileUpload() {}

    // ============ ATS PHOTO (dengan foto / tanpa foto) ============
    setupATSPhotoUpload() {
        const radios = document.querySelectorAll('input[name="photoOption"]');
        const uploadArea = document.getElementById('atsPhotoUploadArea');
        const fileInput = document.getElementById('atsPhotoInput');
        const preview = document.getElementById('atsPhotoPreview');
        const removeBtn = document.getElementById('removeAtsPhotoBtn');
        if (!radios.length || !uploadArea || !fileInput || !preview || !removeBtn) return;

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.atsPhotoOption = e.target.value;
                uploadArea.classList.toggle('hidden', this.atsPhotoOption !== 'with');
                this.updatePreview();
            });
        });

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
                this.atsPhotoDataUrl = await this.compressImageFile(file, 800, 0.85);
                preview.innerHTML = `<img src="${this.atsPhotoDataUrl}" alt="Foto profil">`;
                removeBtn.classList.remove('hidden');
                this.updatePreview();
                this.showToast('Foto profil berhasil diupload', 'success');
            } catch (error) {
                console.error('Gagal memproses foto profil ATS:', error);
                this.showToast('Gagal memproses foto. Coba gunakan foto lain', 'error');
                fileInput.value = '';
            }
        });

        removeBtn.addEventListener('click', () => {
            this.atsPhotoDataUrl = null;
            preview.innerHTML = '<i class="fas fa-user"></i><span>Belum ada foto</span>';
            removeBtn.classList.add('hidden');
            fileInput.value = '';
            this.updatePreview();
            this.showToast('Foto profil dihapus', 'info');
        });
    }

    // ============ UPDATE PREVIEW ============
    updatePreview() {
        const preview = document.getElementById('cvPreview');
        const formData = this.collectFormData();
        
        // Build education HTML
        let educationHTML = '';
        formData.education.forEach(edu => {
            if (edu.institution || edu.major) {
                const eduLinks = [];
                if (edu.linkIjazah) eduLinks.push(`<a href="${this.formatLinkUrl(edu.linkIjazah)}" target="_blank" rel="noopener"><i class="fas fa-file-alt"></i> ${this.escapeHtml(edu.linkIjazahTitle) || 'Lihat Ijazah'}</a>`);
                if (edu.linkTranskrip) eduLinks.push(`<a href="${this.formatLinkUrl(edu.linkTranskrip)}" target="_blank" rel="noopener"><i class="fas fa-file-alt"></i> ${this.escapeHtml(edu.linkTranskripTitle) || 'Lihat Transkrip Nilai'}</a>`);
                educationHTML += `
                    <div class="preview-education-item">
                        <div class="edu-header">
                            <span class="edu-institution">${this.escapeHtml(edu.institution || '')}</span>
                            <span class="edu-meta">${this.joinMeta(edu.location, edu.period)}</span>
                        </div>
                        <div class="edu-major">${this.escapeHtml(edu.major || '')}</div>
                        ${edu.gpa ? `<div class="edu-gpa">${this.escapeHtml(edu.gpa)}</div>` : ''}
                        ${eduLinks.length ? `<div class="preview-doc-links">${eduLinks.join('')}</div>` : ''}
                    </div>
                `;
            }
        });

        // Build internships HTML
        let internshipHTML = '';
        formData.internships.forEach(int => {
            if (int.company || int.position) {
                internshipHTML += `
                    <div class="preview-exp-item">
                        <div class="exp-header">
                            <span class="exp-company">${this.escapeHtml(int.company || '')}</span>
                            <span class="exp-meta">${this.joinMeta(int.location, int.period)}</span>
                        </div>
                        <div class="exp-position">${this.escapeHtml(int.position || '')}</div>
                        ${this.buildDescriptionListHTML(int.description)}
                        ${int.link ? `<div class="preview-doc-links"><a href="${this.formatLinkUrl(int.link)}" target="_blank" rel="noopener"><i class="fas fa-link"></i> ${this.escapeHtml(int.linkTitle) || 'Lihat Sertifikat/Referensi'}</a></div>` : ''}
                    </div>
                `;
            }
        });

        // Build work experiences HTML
        let workHTML = '';
        formData.workExperiences.forEach(work => {
            if (work.company || work.position) {
                workHTML += `
                    <div class="preview-exp-item">
                        <div class="exp-header">
                            <span class="exp-company">${this.escapeHtml(work.company || '')}</span>
                            <span class="exp-meta">${this.joinMeta(work.location, work.period)}</span>
                        </div>
                        <div class="exp-position">${this.escapeHtml(work.position || '')}</div>
                        ${this.buildDescriptionListHTML(work.description)}
                        ${work.link ? `<div class="preview-doc-links"><a href="${this.formatLinkUrl(work.link)}" target="_blank" rel="noopener"><i class="fas fa-link"></i> ${this.escapeHtml(work.linkTitle) || 'Lihat Referensi/Surat Kerja'}</a></div>` : ''}
                    </div>
                `;
            }
        });

        // Build organizations HTML
        let orgHTML = '';
        formData.organizations.forEach(org => {
            if (org.name || org.position) {
                orgHTML += `
                    <div class="preview-exp-item">
                        <div class="exp-header">
                            <span class="exp-company">${this.escapeHtml(org.name || '')}</span>
                            <span class="exp-meta">${this.joinMeta(org.location, org.period)}</span>
                        </div>
                        <div class="exp-position">${this.escapeHtml(org.position || '')}</div>
                        ${this.buildDescriptionListHTML(org.description)}
                    </div>
                `;
            }
        });

        // Build projects HTML
        let projectHTML = '';
        formData.projects.forEach(project => {
            if (project.name) {
                projectHTML += `
                    <div class="preview-project-item">
                        <div class="project-name">${this.escapeHtml(project.name || '')}</div>
                        ${project.description ? `<div class="project-desc">${this.escapeHtml(project.description)}</div>` : ''}
                        ${project.tech ? `<div class="project-tech"><strong>Teknologi:</strong> ${this.escapeHtml(project.tech)}</div>` : ''}
                        ${project.link ? `<div class="preview-doc-links"><a href="${this.formatLinkUrl(project.link)}" target="_blank" rel="noopener"><i class="fas fa-link"></i> ${this.escapeHtml(project.linkTitle) || 'Lihat Proyek'}</a></div>` : ''}
                    </div>
                `;
            }
        });

        // Build skills HTML: one column per category (e.g. "Hard Skills" /
        // "Soft Skills"), each rendered as its own bullet list - mirrors the
        // classic two-column "KEMAMPUAN" layout on a printed ATS resume.
        let skillsHTML = '';
        if (formData.skills && formData.skills.length > 0) {
            const validSkills = formData.skills.filter(s => s.category || s.items);
            if (validSkills.length > 0) {
                const columns = validSkills.map(skill => {
                    const itemsList = skill.items ? skill.items.split(',').map(s => s.trim()).filter(s => s) : [];
                    const titleHTML = skill.category ? `<div class="skill-col-title">${this.escapeHtml(skill.category)}</div>` : '';
                    const itemsHTML = itemsList.length > 0
                        ? `<ul>${itemsList.map(item => `<li>${this.escapeHtml(item)}</li>`).join('')}</ul>`
                        : '';
                    return `<div class="preview-skill-col">${titleHTML}${itemsHTML}</div>`;
                }).join('');

                skillsHTML = `
                    <div class="preview-section preview-section-skills">
                        <div class="preview-section-title">Kemampuan</div>
                        <div class="preview-skills-columns">${columns}</div>
                    </div>
                `;
            }
        }

        // Build certifications HTML as a plain bullet list, e.g.
        // "• Microsoft Office" or "• Pelatihan Kurikulum Merdeka - Kemendikbud (2025)"
        let certHTML = '';
        formData.certifications.forEach(cert => {
            if (cert.name) {
                const issuerPart = cert.issuer ? ` - ${this.escapeHtml(cert.issuer)}` : '';
                const yearPart = cert.year ? ` (${this.escapeHtml(cert.year)})` : '';
                const linkPart = cert.link ? ` <a href="${this.formatLinkUrl(cert.link)}" target="_blank" rel="noopener" class="preview-doc-link-inline"><i class="fas fa-link"></i> ${this.escapeHtml(cert.linkTitle) || 'Lihat Sertifikat'}</a>` : '';
                certHTML += `
                    <li class="preview-cert-item">
                        <span class="cert-info">
                            <span class="cert-name">${this.escapeHtml(cert.name)}</span>${issuerPart}${yearPart}${linkPart}
                        </span>
                        ${cert.image ? `
                            <div class="preview-cert-image" data-cert-image="${this.escapeHtml(cert.image)}">
                                <img src="${cert.image}" alt="${this.escapeHtml(cert.name)}">
                            </div>
                        ` : ''}
                    </li>
                `;
            }
        });

        // Build contact lines - one labeled line per field, e.g.
        // "Alamat : Yogyakarta" / "Handphone : 08xxxxxxxxxx" / "Email : ..."
        // instead of an icon row, matching a classic single-column ATS resume.
        const contactLines = [];
        if (formData.domicile) contactLines.push(`<div class="contact-line"><span class="contact-label">Alamat</span><span>: ${this.escapeHtml(formData.domicile)}</span></div>`);
        if (formData.phone) contactLines.push(`<div class="contact-line"><span class="contact-label">Handphone</span><span>: ${this.escapeHtml(formData.phone)}</span></div>`);
        if (formData.email) contactLines.push(`<div class="contact-line"><span class="contact-label">Email</span><span>: ${this.escapeHtml(formData.email)}</span></div>`);
        if (formData.linkedin) contactLines.push(`<div class="contact-line"><span class="contact-label">LinkedIn</span><span>: <a href="${this.formatLinkUrl(formData.linkedin)}" target="_blank" rel="noopener">${this.escapeHtml(formData.linkedin)}</a></span></div>`);
        if (formData.portfolio) contactLines.push(`<div class="contact-line"><span class="contact-label">Portofolio</span><span>: <a href="${this.formatLinkUrl(formData.portfolio)}" target="_blank" rel="noopener">${this.escapeHtml(formData.portfolio)}</a></span></div>`);

        // Header photo box - only rendered when the user picked "Dengan Foto"
        // and actually uploaded one, so the layout stays a plain text header
        // (no empty box) whenever "Tanpa Foto" is selected.
        const photoHTML = (formData.photoOption === 'with' && formData.photo)
            ? `<div class="preview-photo-box"><img src="${formData.photo}" alt="Foto profil"></div>`
            : '';

        let html = `
            <div class="cv-preview-content">
                <div class="preview-header-main">
                    ${photoHTML}
                    <div class="preview-header-text">
                        <h1>${this.escapeHtml(formData.fullName || 'NAMA LENGKAP')}</h1>
                        ${formData.position ? `<div class="preview-position">${this.escapeHtml(formData.position)}</div>` : ''}
                        <div class="preview-contact-row">
                            ${contactLines.join('')}
                        </div>
                    </div>
                </div>

                ${formData.aboutMe ? `
                <div class="preview-section">
                    <div class="preview-section-title">Tentang Saya</div>
                    <div class="preview-about">${this.escapeHtml(formData.aboutMe)}</div>
                </div>` : ''}

                ${educationHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title">Pendidikan</div>
                    ${educationHTML}
                </div>` : ''}

                ${internshipHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title">Pengalaman Magang</div>
                    ${internshipHTML}
                </div>` : ''}

                ${workHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title">Pengalaman Kerja</div>
                    ${workHTML}
                </div>` : ''}

                ${orgHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title">Organisasi</div>
                    ${orgHTML}
                </div>` : ''}

                ${projectHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title">Proyek</div>
                    ${projectHTML}
                </div>` : ''}

                ${skillsHTML}

                ${certHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title">Sertifikat</div>
                    <ul class="preview-cert-list">${certHTML}</ul>
                </div>` : ''}
            </div>
        `;

        preview.innerHTML = html;
    }

    // ============ COLLECT FORM DATA ============
    collectFormData() {
        const education = [];
        document.querySelectorAll('#cvForm .education-item').forEach(item => {
            const periodStart = item.querySelector('.edu-period-start').value;
            const periodEnd = item.querySelector('.edu-period-end').value;
            const ongoing = item.querySelector('.edu-period-ongoing').checked;
            education.push({
                institution: item.querySelector('.edu-institution').value,
                major: item.querySelector('.edu-major').value,
                location: item.querySelector('.edu-location').value,
                period: this.formatYearPeriodID(periodStart, periodEnd, ongoing),
                gpa: item.querySelector('.edu-gpa').value,
                linkIjazah: item.querySelector('.edu-link-ijazah') ? item.querySelector('.edu-link-ijazah').value : '',
                linkIjazahTitle: item.querySelector('.edu-link-ijazah-title') ? item.querySelector('.edu-link-ijazah-title').value : '',
                linkTranskrip: item.querySelector('.edu-link-transkrip') ? item.querySelector('.edu-link-transkrip').value : '',
                linkTranskripTitle: item.querySelector('.edu-link-transkrip-title') ? item.querySelector('.edu-link-transkrip-title').value : ''
            });
        });

        const internships = [];
        document.querySelectorAll('#cvForm .internship-item').forEach(item => {
            const periodStart = item.querySelector('.int-period-start').value;
            const periodEnd = item.querySelector('.int-period-end').value;
            const ongoing = item.querySelector('.int-period-ongoing').checked;
            internships.push({
                company: item.querySelector('.int-company').value,
                position: item.querySelector('.int-position').value,
                location: item.querySelector('.int-location').value,
                period: this.formatPeriodID(periodStart, periodEnd, ongoing),
                description: item.querySelector('.int-description').value,
                link: item.querySelector('.int-link') ? item.querySelector('.int-link').value : '',
                linkTitle: item.querySelector('.int-link-title') ? item.querySelector('.int-link-title').value : ''
            });
        });

        const workExperiences = [];
        document.querySelectorAll('#cvForm .work-item').forEach(item => {
            const periodStart = item.querySelector('.work-period-start').value;
            const periodEnd = item.querySelector('.work-period-end').value;
            const ongoing = item.querySelector('.work-period-ongoing').checked;
            workExperiences.push({
                company: item.querySelector('.work-company').value,
                position: item.querySelector('.work-position').value,
                location: item.querySelector('.work-location').value,
                period: this.formatPeriodID(periodStart, periodEnd, ongoing),
                description: item.querySelector('.work-description').value,
                link: item.querySelector('.work-link') ? item.querySelector('.work-link').value : '',
                linkTitle: item.querySelector('.work-link-title') ? item.querySelector('.work-link-title').value : ''
            });
        });

        const organizations = [];
        document.querySelectorAll('#cvForm .organization-item').forEach(item => {
            const periodStart = item.querySelector('.org-period-start').value;
            const periodEnd = item.querySelector('.org-period-end').value;
            const ongoing = item.querySelector('.org-period-ongoing').checked;
            organizations.push({
                name: item.querySelector('.org-name').value,
                position: item.querySelector('.org-position').value,
                location: item.querySelector('.org-location').value,
                period: this.formatPeriodID(periodStart, periodEnd, ongoing),
                description: item.querySelector('.org-description').value
            });
        });

        const projects = [];
        document.querySelectorAll('#cvForm .project-item').forEach(item => {
            projects.push({
                name: item.querySelector('.project-name').value,
                description: item.querySelector('.project-description').value,
                tech: item.querySelector('.project-tech').value,
                link: item.querySelector('.project-link') ? item.querySelector('.project-link').value : '',
                linkTitle: item.querySelector('.project-link-title') ? item.querySelector('.project-link-title').value : ''
            });
        });

        const skills = [];
        document.querySelectorAll('#cvForm .skill-category-item').forEach(item => {
            const category = item.querySelector('.skill-category').value;
            const items = item.querySelector('.skill-items').value;
            if (category || items) {
                skills.push({
                    category: category,
                    items: items
                });
            }
        });

        const certifications = [];
        document.querySelectorAll('#cvForm .certification-item').forEach((item) => {
            const preview = item.querySelector('.cert-preview');
            const img = preview ? preview.querySelector('img') : null;
            certifications.push({
                name: item.querySelector('.cert-name').value,
                issuer: item.querySelector('.cert-issuer').value,
                year: item.querySelector('.cert-year').value,
                image: img ? img.src : null,
                link: item.querySelector('.cert-link') ? item.querySelector('.cert-link').value : '',
                linkTitle: item.querySelector('.cert-link-title') ? item.querySelector('.cert-link-title').value : ''
            });
        });

        return {
            fullName: document.getElementById('fullName').value,
            position: document.getElementById('position').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            linkedin: document.getElementById('linkedin').value,
            portfolio: document.getElementById('portfolio').value,
            domicile: document.getElementById('domicile').value,
            aboutMe: document.getElementById('aboutMe').value,
            education: education,
            internships: internships,
            workExperiences: workExperiences,
            organizations: organizations,
            projects: projects,
            skills: skills,
            certifications: certifications,
            photoOption: this.atsPhotoOption,
            photo: this.atsPhotoOption === 'with' ? this.atsPhotoDataUrl : null
        };
    }

// ============ DOWNLOAD PDF ============
downloadPDF() {
    // Check if PDFGenerator is available
    if (typeof PDFGenerator === 'undefined') {
        this.showToast('Fitur PDF tidak tersedia. Silakan refresh halaman.', 'error');
        return;
    }
    
    // Create PDFGenerator instance
    const pdfGenerator = new PDFGenerator();
    
    // Check if libraries are loaded
    if (!pdfGenerator.checkLibraries()) {
        return;
    }
    
    const formData = this.collectFormData();
    
    // Check if there is data to export
    const hasData = formData.fullName || formData.position || formData.aboutMe || 
                    formData.education.length > 0 || formData.skills.length > 0;
    
    if (!hasData) {
        this.showToast('Tidak ada data CV untuk diekspor. Silakan isi formulir terlebih dahulu.', 'error');
        return;
    }
    
    try {
        // Show loading state
        const downloadBtn = document.getElementById('downloadPDFBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        downloadBtn.disabled = true;
        
        pdfGenerator.generatePDF(formData);
        
        // Reset button after delay
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }, 5000);
    } catch (error) {
        console.error('PDF download error:', error);
        this.showToast('Gagal download PDF: ' + error.message, 'error');
        
        // Reset button
        const downloadBtn = document.getElementById('downloadPDFBtn');
        downloadBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
        downloadBtn.disabled = false;
    }
}

    // ============ TOAST NOTIFICATIONS ============
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CVBuilderApp();
});
