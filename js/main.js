// Main Application Controller
class CVBuilderApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.theme = 'light';
        this.certImageCounter = 0;
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

// Buat sertifikasi kosong dan pasang event upload
const certContainer = document.getElementById('certificationContainer');
if (certContainer) {
    certContainer.innerHTML = '';
    certContainer.appendChild(this.createCertificationItem());
}

// Jangan isi data contoh otomatis
// this.populateSampleData();

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
        document.querySelectorAll('#cvForm input:not(.cert-file-input), #cvForm textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
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
    }

    populateSampleData() {
        const sampleData = {
            fullName: 'Dimas Febrianto',
            position: 'INFORMATION TECHNOLOGY ENTHUSIASTS | INTERNET OF THINGS | DATA SCIENTIST | ARTIFICIAL INTELLIGENCE',
            email: 'febridimas905@gmail.com',
            phone: '(+62)85923164876',
            linkedin: 'linkedin.com/in/dimasfeb',
            portfolio: 'myportofolio-main1.netlify.app',
            domicile: 'Kota Sidoarjo, Jawa Timur',
            aboutMe: 'Fresh graduate Sarjana Informatika dengan latar belakang Teknik Jaringan Akses Telekomunikasi dan minat pada bidang telekomunikasi, networking, serta system integration. Memiliki pengalaman mengembangkan berbagai proyek teknologi selama pendidikan, termasuk sistem berbasis ESP32, MQTT, dan komunikasi data. Terbiasa melakukan troubleshooting, mengembangkan aplikasi berbasis web, serta mengolah data menggunakan Python. Memiliki kemampuan problem solving, komunikasi, kerja sama tim, dan mampu beradaptasi serta mempelajari teknologi baru dengan cepat.',
            education: [
                { institution: 'SMK Telkom Sidoarjo', major: 'Teknik Jaringan Akses Telekomunikasi', location: 'Sidoarjo, Jawa Timur', period: '2019-2022', gpa: '' },
                { institution: 'Universitas Telkom Surabaya', major: 'Sarjana Informatika', location: 'Surabaya, Jawa Timur', period: '2022-2026', gpa: 'GPA: 3.58' }
            ],
            internships: [
                { company: 'PT Digipreneur', position: 'Web Developer (Wordpress)', location: 'Surabaya, Jawa Timur', period: 'Juni 2021 – Desember 2021', description: '• Mengembangkan dan mengelola website berbasis WordPress sesuai kebutuhan konten dan tampilan.\n• Mengoptimalkan konten halaman website melalui penyusunan dan penyesuaian teks sesuai kebutuhan.\n• Melakukan web scraping untuk mengumpulkan dan mengolah data sesuai kebutuhan proyek.\n• Melakukan quality checking pada halaman website untuk memastikan fungsi tampilan dan konten berjalan sesuai.' }
            ],
            workExperiences: [],
            organizations: [],
            projects: [],
            skills: [
                { category: 'Networking', items: 'Computer Networking, TCP/IP, Routing, Switching, MikroTik, Network Troubleshooting' },
                { category: 'IT Support', items: 'Computer Troubleshooting, Hardware Troubleshooting, Software Troubleshooting, Operating Systems' },
                { category: 'Programming', items: 'Python, PHP, JavaScript, Flask' },
                { category: 'IoT', items: 'ESP32, MQTT, Firebase, Sensor Integration' },
                { category: 'Tools', items: 'Linux, Git, Docker, XAMPP' },
                { category: 'AI & Data', items: 'Machine Learning, KNN, OpenCV, MediaPipe' }
            ],
            certifications: [
                { name: 'MikroTik MTCNA', issuer: 'MikroTik Academy', year: '2023', image: null },
                { name: 'Cisco AI Fundamentals', issuer: 'Cisco Networking Academy', year: '2024', image: null },
                { name: 'Komdigi Network Administrator', issuer: 'Kominfo', year: '2024', image: null }
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
    createEducationItem(data = { institution: '', major: '', location: '', period: '', gpa: '' }) {
        const div = document.createElement('div');
        div.className = 'education-item';
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
                    <input type="text" class="form-input edu-period" value="${this.escapeHtml(data.period)}" placeholder="YYYY-YYYY">
                </div>
            </div>
            <div class="form-group">
                <label>GPA / Prestasi (Opsional)</label>
                <input type="text" class="form-input edu-gpa" value="${this.escapeHtml(data.gpa)}" placeholder="GPA: 3.58 atau prestasi lainnya">
            </div>
            <button type="button" class="btn-remove-edu hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;
        
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
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
    createInternshipItem(data = { company: '', position: '', location: '', period: '', description: '' }) {
        const div = document.createElement('div');
        div.className = 'internship-item';
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
                    <input type="text" class="form-input int-period" value="${this.escapeHtml(data.period)}" placeholder="Bulan YYYY – Bulan YYYY">
                </div>
            </div>
            <div class="form-group">
                <label>Deskripsi</label>
                <textarea class="form-textarea int-description" rows="3" placeholder="Deskripsi pekerjaan...">${this.escapeHtml(data.description)}</textarea>
            </div>
            <button type="button" class="btn-remove-int hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;
        
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
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
    createWorkItem(data = { company: '', position: '', location: '', period: '', description: '' }) {
        const div = document.createElement('div');
        div.className = 'work-item';
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
                    <input type="text" class="form-input work-period" value="${this.escapeHtml(data.period)}" placeholder="Bulan YYYY – Bulan YYYY">
                </div>
            </div>
            <div class="form-group">
                <label>Deskripsi</label>
                <textarea class="form-textarea work-description" rows="3" placeholder="Deskripsi pekerjaan...">${this.escapeHtml(data.description)}</textarea>
            </div>
            <button type="button" class="btn-remove-work hidden">
                <i class="fas fa-times"></i> Hapus
            </button>
        `;
        
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
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
    createOrganizationItem(data = { name: '', position: '', location: '', period: '', description: '' }) {
        const div = document.createElement('div');
        div.className = 'organization-item';
        div.innerHTML = `
            <div class="form-group">
                <label>Organisasi</label>
                <input type="text" class="form-input org-name" value="${this.escapeHtml(data.name)}" placeholder="Nama organisasi">
            </div>
            <div class="form-group">
                <label>Posisi</label>
                <input type="text" class="form-input org-position" value="${this.escapeHtml(data.position)}" placeholder="Posisi/jabatan">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" class="form-input org-location" value="${this.escapeHtml(data.location)}" placeholder="Kota, Provinsi">
                </div>
                <div class="form-group">
                    <label>Periode</label>
                    <input type="text" class="form-input org-period" value="${this.escapeHtml(data.period)}" placeholder="Bulan YYYY – Bulan YYYY">
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
    createProjectItem(data = { name: '', description: '', tech: '' }) {
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
    createCertificationItem(data = { name: '', issuer: '', year: '', image: null }) {
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
                <input type="text" class="form-input cert-year" value="${this.escapeHtml(data.year || '')}" placeholder="YYYY">
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
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    this.showToast('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG', 'error');
                    fileInput.value = '';
                    return;
                }
                
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    this.showToast('Ukuran file terlalu besar. Maksimal 2MB', 'error');
                    fileInput.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Sertifikat">`;
                    removeBtn.classList.remove('hidden');
                    this.updatePreview();
                    this.showToast('Gambar sertifikat berhasil diupload', 'success');
                };
                reader.readAsDataURL(file);
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
        div.querySelectorAll('input:not(.cert-file-input), textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
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

    // ============ HELPER METHODS ============
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    // ============ UPDATE PREVIEW ============
    updatePreview() {
        const preview = document.getElementById('cvPreview');
        const formData = this.collectFormData();
        
        // Build education HTML
        let educationHTML = '';
        formData.education.forEach(edu => {
            if (edu.institution || edu.major) {
                educationHTML += `
                    <div class="preview-education-item">
                        <div class="edu-header">
                            <span class="edu-institution">${this.escapeHtml(edu.institution || '')}</span>
                            <span class="edu-meta">${this.escapeHtml(edu.location || '')} • ${this.escapeHtml(edu.period || '')}</span>
                        </div>
                        <div class="edu-major">${this.escapeHtml(edu.major || '')}</div>
                        ${edu.gpa ? `<div class="edu-gpa">${this.escapeHtml(edu.gpa)}</div>` : ''}
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
                            <span class="exp-meta">${this.escapeHtml(int.location || '')} • ${this.escapeHtml(int.period || '')}</span>
                        </div>
                        <div class="exp-position">${this.escapeHtml(int.position || '')}</div>
                        ${int.description ? `<div class="exp-description">${this.escapeHtml(int.description).replace(/\n/g, '<br>')}</div>` : ''}
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
                            <span class="exp-meta">${this.escapeHtml(work.location || '')} • ${this.escapeHtml(work.period || '')}</span>
                        </div>
                        <div class="exp-position">${this.escapeHtml(work.position || '')}</div>
                        ${work.description ? `<div class="exp-description">${this.escapeHtml(work.description).replace(/\n/g, '<br>')}</div>` : ''}
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
                            <span class="exp-meta">${this.escapeHtml(org.location || '')} • ${this.escapeHtml(org.period || '')}</span>
                        </div>
                        <div class="exp-position">${this.escapeHtml(org.position || '')}</div>
                        ${org.description ? `<div class="exp-description">${this.escapeHtml(org.description).replace(/\n/g, '<br>')}</div>` : ''}
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
                    </div>
                `;
            }
        });

        // Build skills HTML: one bullet point per category,
        // e.g. "• Networking: TCP/IP, Routing, Switching, MikroTik"
        let skillsHTML = '';
        if (formData.skills && formData.skills.length > 0) {
            const hasValidSkills = formData.skills.some(s => s.category || s.items);
            if (hasValidSkills) {
                skillsHTML = `
                    <div class="preview-section preview-section-skills">
                        <div class="preview-section-title"><i class="fas fa-cogs"></i>Skills</div>
                        <ul class="preview-skills-bullet-list">
                `;

                formData.skills.forEach(skill => {
                    if (skill.category || skill.items) {
                        const itemsList = skill.items ? skill.items.split(',').map(s => s.trim()).filter(s => s) : [];
                        const categoryPart = skill.category ? `<strong>${this.escapeHtml(skill.category)}:</strong> ` : '';
                        const itemsPart = this.escapeHtml(itemsList.join(', '));
                        skillsHTML += `<li>${categoryPart}${itemsPart}</li>`;
                    }
                });

                skillsHTML += `
                        </ul>
                    </div>
                `;
            }
        }

        // Build certifications HTML with images
        let certHTML = '';
        formData.certifications.forEach(cert => {
            if (cert.name) {
                certHTML += `
                    <div class="preview-cert-item">
                        <div class="cert-info">
                            <span class="cert-name">${this.escapeHtml(cert.name)}</span>
                            ${cert.issuer ? `<span class="cert-issuer"> - ${this.escapeHtml(cert.issuer)}</span>` : ''}
                            ${cert.year ? `<span class="cert-year"> (${this.escapeHtml(cert.year)})</span>` : ''}
                        </div>
                        ${cert.image ? `
                            <div class="preview-cert-image" onclick="window.open('${cert.image}', '_blank')">
                                <img src="${cert.image}" alt="${this.escapeHtml(cert.name)}">
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        });

        // Build contact row
        const contactParts = [];
        if (formData.email) contactParts.push(`<span><i class="fas fa-envelope"></i> ${this.escapeHtml(formData.email)}</span>`);
        if (formData.phone) contactParts.push(`<span><i class="fas fa-phone"></i> ${this.escapeHtml(formData.phone)}</span>`);
        if (formData.linkedin) contactParts.push(`<a href="https://${this.escapeHtml(formData.linkedin)}" target="_blank"><i class="fab fa-linkedin"></i> ${this.escapeHtml(formData.linkedin)}</a>`);
        if (formData.portfolio) contactParts.push(`<a href="https://${this.escapeHtml(formData.portfolio)}" target="_blank"><i class="fas fa-link"></i> ${this.escapeHtml(formData.portfolio)}</a>`);
        if (formData.domicile) contactParts.push(`<span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(formData.domicile)}</span>`);

        let html = `
            <div class="cv-preview-content">
                <div class="preview-header-main">
                    <h1>${this.escapeHtml(formData.fullName || 'NAMA LENGKAP')}</h1>
                    <div class="preview-position">${this.escapeHtml(formData.position || 'POSISI / JABATAN')}</div>
                    <div class="preview-contact-row">
                        ${contactParts.join(' • ')}
                    </div>
                </div>

                ${formData.aboutMe ? `
                <div class="preview-section">
                    <div class="preview-section-title"><i class="fas fa-user-edit"></i>Tentang Saya</div>
                    <div class="preview-about">${this.escapeHtml(formData.aboutMe)}</div>
                </div>` : ''}

                ${educationHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title"><i class="fas fa-graduation-cap"></i>Pendidikan</div>
                    ${educationHTML}
                </div>` : ''}

                ${internshipHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title"><i class="fas fa-laptop"></i>Pengalaman Magang</div>
                    ${internshipHTML}
                </div>` : ''}

                ${workHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title"><i class="fas fa-briefcase"></i>Pengalaman Kerja</div>
                    ${workHTML}
                </div>` : ''}

                ${orgHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title"><i class="fas fa-users"></i>Pengalaman Organisasi</div>
                    ${orgHTML}
                </div>` : ''}

                ${projectHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title"><i class="fas fa-laptop-code"></i>Proyek</div>
                    ${projectHTML}
                </div>` : ''}

                ${skillsHTML}

                ${certHTML ? `
                <div class="preview-section">
                    <div class="preview-section-title"><i class="fas fa-certificate"></i>Sertifikasi</div>
                    ${certHTML}
                </div>` : ''}
            </div>
        `;

        preview.innerHTML = html;
    }

    // ============ COLLECT FORM DATA ============
    collectFormData() {
        const education = [];
        document.querySelectorAll('#cvForm .education-item').forEach(item => {
            education.push({
                institution: item.querySelector('.edu-institution').value,
                major: item.querySelector('.edu-major').value,
                location: item.querySelector('.edu-location').value,
                period: item.querySelector('.edu-period').value,
                gpa: item.querySelector('.edu-gpa').value
            });
        });

        const internships = [];
        document.querySelectorAll('#cvForm .internship-item').forEach(item => {
            internships.push({
                company: item.querySelector('.int-company').value,
                position: item.querySelector('.int-position').value,
                location: item.querySelector('.int-location').value,
                period: item.querySelector('.int-period').value,
                description: item.querySelector('.int-description').value
            });
        });

        const workExperiences = [];
        document.querySelectorAll('#cvForm .work-item').forEach(item => {
            workExperiences.push({
                company: item.querySelector('.work-company').value,
                position: item.querySelector('.work-position').value,
                location: item.querySelector('.work-location').value,
                period: item.querySelector('.work-period').value,
                description: item.querySelector('.work-description').value
            });
        });

        const organizations = [];
        document.querySelectorAll('#cvForm .organization-item').forEach(item => {
            organizations.push({
                name: item.querySelector('.org-name').value,
                position: item.querySelector('.org-position').value,
                location: item.querySelector('.org-location').value,
                period: item.querySelector('.org-period').value,
                description: item.querySelector('.org-description').value
            });
        });

        const projects = [];
        document.querySelectorAll('#cvForm .project-item').forEach(item => {
            projects.push({
                name: item.querySelector('.project-name').value,
                description: item.querySelector('.project-description').value,
                tech: item.querySelector('.project-tech').value
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
                image: img ? img.src : null
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
            certifications: certifications
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
