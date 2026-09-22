// i18n Module — handles ID/EN language switching for form labels,
// section titles, placeholder texts, and preview section headings.
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('cvLang') || 'id';
        this.translations = {
            id: {
                // Loading & app
                loading: 'Memuat Aplikasi...',
                appTitle: 'CV Builder',

                // Welcome
                welcomeTitle: 'Buat CV Profesional',
                welcomeSubtitle: 'Pilih metode untuk memulai membuat CV Anda',
                createCV: 'Buat CV Baru',
                featureLiveEdit: 'Edit Real-time',
                featureDownload: 'Unduh PDF & Word',
                featureResponsive: 'Responsive',

                // Buttons & actions
                preview: 'Preview',
                downloadPDF: 'PDF',
                downloadWord: 'Word',
                delete: 'Hapus',
                deleteCategory: 'Hapus Kategori',
                deleteCert: 'Hapus Sertifikasi',
                optional: 'Opsional',
                livePreview: 'Live Preview',

                // Builder header
                editCV: 'Edit CV',
                editCVCreative: 'Edit CV Creative',
                previewCV: 'Preview CV',
                previewCVCreative: 'Preview CV Creative',

                // Sections
                photoSection: 'Foto Profil',
                profileHeader: 'Header Profil',
                aboutSection: 'Tentang Saya',
                educationSection: 'Pendidikan',
                internshipSection: 'Pengalaman Magang',
                workSection: 'Pengalaman Kerja',
                orgSection: 'Pengalaman Organisasi',
                projectSection: 'Proyek',
                skillsSection: 'Skills',
                certSection: 'Sertifikasi',
                photoProfile: 'Foto & Profil',
                shortProfile: 'Profil Singkat',
                experienceSection: 'Pengalaman',
                languageSection: 'Bahasa',
                trainingSection: 'Pelatihan',
                achievementSection: 'Pencapaian',

                // Labels
                labelFullName: 'Nama Lengkap',
                labelPosition: 'Posisi / Jabatan',
                labelEmail: 'Email',
                labelPhone: 'Telepon',
                labelLinkedin: 'LinkedIn',
                labelPortfolio: 'Portofolio',
                labelDomicile: 'Domisili',
                labelAboutMe: 'Deskripsi Diri',
                labelInstitution: 'Institusi',
                labelMajor: 'Jurusan / Program',
                labelLocation: 'Lokasi',
                labelPeriod: 'Periode',
                labelGpa: 'GPA / Prestasi (Opsional)',
                labelLinkIjazah: 'Link Ijazah (Opsional)',
                labelLinkTranscript: 'Link Transkrip Nilai (Opsional)',
                labelCompany: 'Perusahaan',
                labelCompanyOrg: 'Perusahaan / Organisasi',
                labelPosition: 'Posisi',
                labelDescription: 'Deskripsi',
                labelLinkInternship: 'Link Sertifikat/Referensi Magang (Opsional)',
                labelLinkWork: 'Link Referensi/Surat Kerja (Opsional)',
                labelOrganization: 'Organisasi',
                labelProjectName: 'Nama Proyek',
                labelTech: 'Teknologi / Tools',
                labelLinkProject: 'Link Proyek (Opsional)',
                labelSkillCategory: 'Kategori Skill',
                labelSkillItems: 'Daftar Skill',
                labelCertName: 'Nama Sertifikasi',
                labelIssuer: 'Penerbit',
                labelYear: 'Tahun',
                labelLinkCert: 'Link Sertifikat/Verifikasi (Opsional)',
                labelUploadCert: 'Upload Sertifikat (JPG, JPEG, PNG)',
                labelPhotoProfile: 'Foto Profil',
                labelInstagram: 'Instagram',
                labelAddress: 'Alamat',
                labelDescriptionPerLine: 'Deskripsi (satu poin per baris)',
                labelLanguagesPerLine: 'Daftar Bahasa (satu per baris)',
                labelTrainingPerLine: 'Daftar Pelatihan (satu per baris)',
                labelCertsPerLine: 'Daftar Sertifikasi (satu per baris)',
                labelAchievementPerLine: 'Daftar Pencapaian (satu per baris)',

                // Checkboxes
                ongoingStudy: 'Masih berkuliah (Sekarang)',
                ongoingInternship: 'Masih magang (Sekarang)',
                ongoingWork: 'Masih bekerja di sini (Sekarang)',
                ongoingOrg: 'Masih berlangsung (Sekarang)',
                ongoingNow: 'Masih berlangsung (Sekarang)',

                // Buttons add
                addEducation: 'Tambah Pendidikan',
                addInternship: 'Tambah Pengalaman Magang',
                addWork: 'Tambah Pengalaman Kerja',
                addOrg: 'Tambah Pengalaman Organisasi',
                addProject: 'Tambah Proyek',
                addSkill: 'Tambah Kategori Skill',
                addCert: 'Tambah Sertifikasi',
                addExperience: 'Tambah Pengalaman',

                // Photo options
                withoutPhoto: 'Tanpa Foto',
                withPhoto: 'Dengan Foto',
                choosePhoto: 'Pilih Foto',
                chooseImage: 'Pilih Gambar',
                noPhoto: 'Belum ada foto',
                noImage: 'Belum ada gambar',

                // Placeholders
                phFullName: 'nama',
                phPosition: 'Contoh: Mahasiswa Teknik Informatika',
                phPositionCreative: 'Contoh: Mahasiswa Teknik',
                phEmail: 'nama akun',
                phLinkTitle: 'Judul link',
                phLinkedin: 'akun linkedin',
                phOptional: 'opsional',
                phDomicile: 'Kota, provinsi',
                phAboutMe: 'Deskripsikan diri Anda...',
                phAboutMeCreative: 'Deskripsikan diri Anda secara singkat, padat, dan jelas...',
                phInstitution: 'Nama institusi',
                phMajor: 'Jurusan / Program studi',
                phLocation: 'Kota, Provinsi',
                phGpa: 'GPA: 3.58 atau prestasi lainnya',
                phLinkTitleCertificate: 'Judul link (contoh: Lihat Ijazah)',
                phLinkCertificate: 'Link Google Drive/Dropbox ke scan ijazah',
                phLinkTranscriptTitle: 'Judul link (contoh: Lihat Transkrip Nilai)',
                phLinkTranscript: 'Link Google Drive/Dropbox ke scan transkrip',
                phCompany: 'Nama perusahaan',
                phCompanyOrg: 'Nama perusahaan / organisasi',
                phPositionInternship: 'Posisi magang',
                phPositionJob: 'Posisi/jabatan',
                phDescription: 'Deskripsi pekerjaan...',
                phDescriptionActivity: 'Deskripsi kegiatan...',
                phLinkInternshipTitle: 'Judul link (contoh: Lihat Sertifikat Magang)',
                phLinkInternship: 'Link sertifikat/surat referensi magang',
                phLinkWorkTitle: 'Judul link (contoh: Lihat Surat Referensi)',
                phLinkWork: 'Link surat referensi/pengalaman kerja',
                phOrganization: 'Nama organisasi (maks. 60 karakter)',
                phProjectName: 'Nama proyek',
                phProjectDescription: 'Deskripsi proyek...',
                phTech: 'Teknologi yang digunakan',
                phLinkProjectTitle: 'Judul link (contoh: Lihat Demo / GitHub)',
                phLinkProject: 'Link demo/repository/live proyek',
                phSkillCategory: 'Contoh: Networking, Programming, IT Support, dll',
                phSkillCategoryCreative: 'Contoh: IoT, Pemrograman, dll (boleh dikosongkan)',
                phSkillItems: 'Pisahkan dengan koma\nContoh: Computer Networking, TCP/IP, Routing, Switching',
                phSkillItemsShort: 'Pisahkan dengan koma',
                phCertName: 'Nama sertifikasi',
                phIssuer: 'Lembaga penerbit',
                phLinkCertTitle: 'Judul link (contoh: Lihat Sertifikat)',
                phLinkCert: 'Link verifikasi/sertifikat online',
                phAddress: 'Contoh: Dsn. Bendungan Rt/Rw 04/02, Pesawahan, Porong',
                phDescriptionPerLine: 'Tuliskan tiap poin di baris baru...',
                phLanguages: 'Bahasa Indonesia\nBahasa Inggris',
                phTraining: 'Digital Talent Scholarship - 2026',
                phCerts: 'EPrT (English Proficiency Test) - 2025',
                phAchievements: 'Juara 2 Lomba Karya Tulis Ilmiah Tingkat Provinsi',

                // Hints
                photoHint: 'Gunakan foto formal berlatar polos. Beberapa perusahaan justru lebih menyukai CV ATS tanpa foto, jadi pilih sesuai kebutuhan lowongan yang dituju.',

                // Modals
                welcomeModalTitle: '🙏 Terima Kasih Sudah Mampir!',
                welcomeModalBody: 'Website ini bisa digunakan sepenuhnya <strong>gratis</strong>, semoga bermanfaat dan membawa keberkahan untuk perjalanan karier Anda.<br><br>Semua data CV Anda diproses langsung di browser sendiri — tidak disimpan maupun dikirim ke server atau repository mana pun, jadi privasi Anda sepenuhnya terjaga.',
                welcomeModalOk: 'Mengerti, Mulai Sekarang',
                cvTypeTitle: 'Pilih Jenis CV',
                cvTypeSubtitle: 'Mau bikin CV yang seperti apa hari ini?',
                cvTypeAtsTitle: 'CV ATS',
                cvTypeAtsDesc: 'Format standar tanpa desain berlebihan, ramah untuk sistem pelacakan lamaran (ATS) perusahaan.',
                cvTypeCreativeTitle: 'CV Creative',
                cvTypeCreativeDesc: 'Desain satu halaman lebih visual dengan foto profil, cocok untuk portofolio dan industri kreatif.',

                // Preview section headings (yang tampil di CV)
                pvAbout: 'Tentang Saya',
                pvEducation: 'Pendidikan',
                pvInternship: 'Pengalaman Magang',
                pvWork: 'Pengalaman Kerja',
                pvOrg: 'Organisasi',
                pvProject: 'Proyek',
                pvSkills: 'Kemampuan',
                pvCert: 'Sertifikat',
                pvContact: 'Kontak',
                pvLanguages: 'Bahasa',
                pvAchievements: 'Pencapaian',
                pvTraining: 'Pelatihan',
                pvCertifications: 'Sertifikasi',
                pvExperience: 'Pengalaman Kerja',
                pvAboutShort: 'Tentang Saya',

                // Contact labels in preview
                pvLabelAddress: 'Alamat',
                pvLabelPhone: 'Handphone',
                pvLabelEmail: 'Email',
                pvLabelLinkedin: 'LinkedIn',
                pvLabelPortfolio: 'Portofolio',

                // Period text
                now: 'Sekarang',

                // Month names
                months: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
            },
            en: {
                loading: 'Loading Application...',
                appTitle: 'CV Builder',

                welcomeTitle: 'Create a Professional CV',
                welcomeSubtitle: 'Choose a method to start creating your CV',
                createCV: 'Create New CV',
                featureLiveEdit: 'Real-time Edit',
                featureDownload: 'Download PDF & Word',
                featureResponsive: 'Responsive',

                preview: 'Preview',
                downloadPDF: 'PDF',
                downloadWord: 'Word',
                delete: 'Delete',
                deleteCategory: 'Delete Category',
                deleteCert: 'Delete Certification',
                optional: 'Optional',
                livePreview: 'Live Preview',

                editCV: 'Edit CV',
                editCVCreative: 'Edit Creative CV',
                previewCV: 'CV Preview',
                previewCVCreative: 'Creative CV Preview',

                photoSection: 'Profile Photo',
                profileHeader: 'Profile Header',
                aboutSection: 'About Me',
                educationSection: 'Education',
                internshipSection: 'Internship Experience',
                workSection: 'Work Experience',
                orgSection: 'Organizational Experience',
                projectSection: 'Projects',
                skillsSection: 'Skills',
                certSection: 'Certifications',
                photoProfile: 'Photo & Profile',
                shortProfile: 'Short Profile',
                experienceSection: 'Experience',
                languageSection: 'Languages',
                trainingSection: 'Training',
                achievementSection: 'Achievements',

                labelFullName: 'Full Name',
                labelPosition: 'Position / Title',
                labelEmail: 'Email',
                labelPhone: 'Phone',
                labelLinkedin: 'LinkedIn',
                labelPortfolio: 'Portfolio',
                labelDomicile: 'Domicile',
                labelAboutMe: 'Self Description',
                labelInstitution: 'Institution',
                labelMajor: 'Major / Program',
                labelLocation: 'Location',
                labelPeriod: 'Period',
                labelGpa: 'GPA / Achievement (Optional)',
                labelLinkIjazah: 'Diploma Link (Optional)',
                labelLinkTranscript: 'Transcript Link (Optional)',
                labelCompany: 'Company',
                labelCompanyOrg: 'Company / Organization',
                labelDescription: 'Description',
                labelLinkInternship: 'Internship Certificate/Reference Link (Optional)',
                labelLinkWork: 'Reference/Employment Letter Link (Optional)',
                labelOrganization: 'Organization',
                labelProjectName: 'Project Name',
                labelTech: 'Technology / Tools',
                labelLinkProject: 'Project Link (Optional)',
                labelSkillCategory: 'Skill Category',
                labelSkillItems: 'Skill List',
                labelCertName: 'Certification Name',
                labelIssuer: 'Issuer',
                labelYear: 'Year',
                labelLinkCert: 'Certificate/Verification Link (Optional)',
                labelUploadCert: 'Upload Certificate (JPG, JPEG, PNG)',
                labelPhotoProfile: 'Profile Photo',
                labelInstagram: 'Instagram',
                labelAddress: 'Address',
                labelDescriptionPerLine: 'Description (one point per line)',
                labelLanguagesPerLine: 'Language List (one per line)',
                labelTrainingPerLine: 'Training List (one per line)',
                labelCertsPerLine: 'Certification List (one per line)',
                labelAchievementPerLine: 'Achievement List (one per line)',

                ongoingStudy: 'Still studying (Present)',
                ongoingInternship: 'Still interning (Present)',
                ongoingWork: 'Still working here (Present)',
                ongoingOrg: 'Still ongoing (Present)',
                ongoingNow: 'Still ongoing (Present)',

                addEducation: 'Add Education',
                addInternship: 'Add Internship',
                addWork: 'Add Work Experience',
                addOrg: 'Add Organizational Experience',
                addProject: 'Add Project',
                addSkill: 'Add Skill Category',
                addCert: 'Add Certification',
                addExperience: 'Add Experience',

                withoutPhoto: 'Without Photo',
                withPhoto: 'With Photo',
                choosePhoto: 'Choose Photo',
                chooseImage: 'Choose Image',
                noPhoto: 'No photo yet',
                noImage: 'No image yet',

                phFullName: 'name',
                phPosition: 'e.g., Information Technology Student',
                phPositionCreative: 'e.g., Engineering Student',
                phEmail: 'username',
                phLinkTitle: 'Link title',
                phLinkedin: 'linkedin account',
                phOptional: 'optional',
                phDomicile: 'City, province',
                phAboutMe: 'Describe yourself...',
                phAboutMeCreative: 'Describe yourself briefly and clearly...',
                phInstitution: 'Institution name',
                phMajor: 'Major / Study program',
                phLocation: 'City, Province',
                phGpa: 'GPA: 3.58 or other achievement',
                phLinkTitleCertificate: 'Link title (e.g., View Diploma)',
                phLinkCertificate: 'Google Drive/Dropbox link to diploma scan',
                phLinkTranscriptTitle: 'Link title (e.g., View Transcript)',
                phLinkTranscript: 'Google Drive/Dropbox link to transcript scan',
                phCompany: 'Company name',
                phCompanyOrg: 'Company / organization name',
                phPositionInternship: 'Internship position',
                phPositionJob: 'Position/title',
                phDescription: 'Job description...',
                phDescriptionActivity: 'Activity description...',
                phLinkInternshipTitle: 'Link title (e.g., View Internship Certificate)',
                phLinkInternship: 'Internship certificate/reference letter link',
                phLinkWorkTitle: 'Link title (e.g., View Reference Letter)',
                phLinkWork: 'Work reference/employment letter link',
                phOrganization: 'Organization name (max 60 chars)',
                phProjectName: 'Project name',
                phProjectDescription: 'Project description...',
                phTech: 'Technologies used',
                phLinkProjectTitle: 'Link title (e.g., View Demo / GitHub)',
                phLinkProject: 'Demo/repository/live project link',
                phSkillCategory: 'e.g., Networking, Programming, IT Support, etc',
                phSkillCategoryCreative: 'e.g., IoT, Programming, etc (may be left empty)',
                phSkillItems: 'Separate by commas\nExample: Computer Networking, TCP/IP, Routing, Switching',
                phSkillItemsShort: 'Separate by commas',
                phCertName: 'Certification name',
                phIssuer: 'Issuing organization',
                phLinkCertTitle: 'Link title (e.g., View Certificate)',
                phLinkCert: 'Certificate/online verification link',
                phAddress: 'e.g., 123 Main St, Apt 4, City',
                phDescriptionPerLine: 'Write each point on a new line...',
                phLanguages: 'Indonesian\nEnglish',
                phTraining: 'Digital Talent Scholarship - 2026',
                phCerts: 'EPrT (English Proficiency Test) - 2025',
                phAchievements: '2nd Place Scientific Writing Competition, Provincial Level',

                photoHint: 'Use a formal photo with a plain background. Some companies actually prefer ATS-friendly CVs without photos, so choose based on the job you are applying for.',

                welcomeModalTitle: '🙏 Thanks for Stopping By!',
                welcomeModalBody: 'This website is completely <strong>free</strong> to use. We hope it benefits you and brings blessings to your career journey.<br><br>All your CV data is processed locally in your own browser — nothing is saved or sent to any server or repository, so your privacy is fully protected.',
                welcomeModalOk: 'Got it, Start Now',
                cvTypeTitle: 'Choose CV Type',
                cvTypeSubtitle: 'What kind of CV do you want to create today?',
                cvTypeAtsTitle: 'ATS CV',
                cvTypeAtsDesc: 'A standard format without excessive design, friendly to corporate applicant tracking systems (ATS).',
                cvTypeCreativeTitle: 'Creative CV',
                cvTypeCreativeDesc: 'A more visual one-page design with a profile photo, perfect for portfolios and creative industries.',

                pvAbout: 'About Me',
                pvEducation: 'Education',
                pvInternship: 'Internship Experience',
                pvWork: 'Work Experience',
                pvOrg: 'Organization',
                pvProject: 'Projects',
                pvSkills: 'Skills',
                pvCert: 'Certifications',
                pvContact: 'Contact',
                pvLanguages: 'Languages',
                pvAchievements: 'Achievements',
                pvTraining: 'Training',
                pvCertifications: 'Certifications',
                pvExperience: 'Work Experience',
                pvAboutShort: 'About Me',

                pvLabelAddress: 'Address',
                pvLabelPhone: 'Phone',
                pvLabelEmail: 'Email',
                pvLabelLinkedin: 'LinkedIn',
                pvLabelPortfolio: 'Portfolio',

                now: 'Present',

                months: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
            }
        };
        this.init();
    }

    init() {
        this.applyTranslations();
        this.bindLanguageSwitcher();

        // Set initial active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });

        // Set document lang attribute
        document.documentElement.lang = this.currentLang;
    }

    bindLanguageSwitcher() {
        const switcher = document.getElementById('langSwitch');
        if (!switcher) return;
        switcher.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (!btn) return;
            const lang = btn.dataset.lang;
            if (lang && lang !== this.currentLang) {
                this.setLanguage(lang);
            }
        });
    }

    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('cvLang', lang);
        document.documentElement.lang = lang;

        // Toggle active state on buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        this.applyTranslations();

        // Notify other modules to re-render preview
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    t(key) {
        const dict = this.translations[this.currentLang] || this.translations.id;
        return dict[key] !== undefined ? dict[key] : (this.translations.id[key] || key);
    }

    applyTranslations() {
        // data-i18n -> textContent
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const value = this.t(key);
            if (typeof value === 'string') {
                el.textContent = value;
            }
        });

        // data-i18n-html -> innerHTML (untuk konten dengan tag HTML)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.dataset.i18nHtml;
            const value = this.t(key);
            if (typeof value === 'string') {
                el.innerHTML = value;
            }
        });

        // data-i18n-placeholder -> placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            const value = this.t(key);
            if (typeof value === 'string') {
                el.placeholder = value;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});
