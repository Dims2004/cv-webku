// CV Builder Module - Handles form management and CV data structure
class CVBuilder {
    constructor() {
        this.sections = {
            personal: ['fullName', 'position', 'email', 'phone', 'linkedin', 'portfolio', 'domicile'],
            about: ['aboutMe', 'education'],
            experience: ['experiences'],
            projects: ['projects'],
            skills: ['skills', 'certifications']
        };
        this.data = this.getDefaultData();
    }

    getDefaultData() {
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
            },
            photo: null
        };
    }

    validateForm() {
        const required = ['fullName', 'email', 'phone'];
        const missing = [];
        
        required.forEach(field => {
            const value = document.getElementById(field)?.value;
            if (!value || value.trim() === '') {
                missing.push(field);
            }
        });
        
        if (missing.length > 0) {
            this.showValidationError(missing);
            return false;
        }
        
        // Validate email
        const email = document.getElementById('email')?.value;
        if (email && !this.isValidEmail(email)) {
            this.showToast('Format email tidak valid', 'error');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showValidationError(fields) {
        const fieldNames = {
            fullName: 'Nama Lengkap',
            email: 'Email',
            phone: 'Telepon'
        };
        
        const messages = fields.map(f => fieldNames[f] || f);
        this.showToast(`Harap isi: ${messages.join(', ')}`, 'error');
    }

    showToast(message, type) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        }
    }

    exportToJSON() {
        const data = this.collectData();
        return JSON.stringify(data, null, 2);
    }

    importFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.populateData(data);
            this.showToast('Data berhasil diimport', 'success');
            return true;
        } catch (error) {
            this.showToast('Format JSON tidak valid', 'error');
            return false;
        }
    }

    collectData() {
        const formData = {
            personal: {},
            about: {},
            experience: { experiences: [] },
            projects: { projects: [] },
            skills: {}
        };
        
        // Personal info
        this.sections.personal.forEach(field => {
            const element = document.getElementById(field);
            formData.personal[field] = element ? element.value : '';
        });
        
        // About
        this.sections.about.forEach(field => {
            const element = document.getElementById(field);
            formData.about[field] = element ? element.value : '';
        });
        
        // Experiences
        document.querySelectorAll('.experience-item').forEach(item => {
            formData.experience.experiences.push({
                company: item.querySelector('.exp-company').value,
                position: item.querySelector('.exp-position').value,
                period: item.querySelector('.exp-period').value,
                description: item.querySelector('.exp-description').value
            });
        });
        
        // Projects
        document.querySelectorAll('.project-item').forEach(item => {
            formData.projects.projects.push({
                name: item.querySelector('.project-name').value,
                description: item.querySelector('.project-description').value,
                tech: item.querySelector('.project-tech').value
            });
        });
        
        // Skills
        this.sections.skills.forEach(field => {
            const element = document.getElementById(field);
            formData.skills[field] = element ? element.value : '';
        });
        
        // Photo
        const photoElement = document.querySelector('#photoPreview img');
        formData.photo = photoElement ? photoElement.src : null;
        
        return formData;
    }

    populateData(data) {
        // Personal
        if (data.personal) {
            Object.keys(data.personal).forEach(field => {
                const element = document.getElementById(field);
                if (element) element.value = data.personal[field] || '';
            });
        }
        
        // About
        if (data.about) {
            Object.keys(data.about).forEach(field => {
                const element = document.getElementById(field);
                if (element) element.value = data.about[field] || '';
            });
        }
        
        // Experiences
        if (data.experience && data.experience.experiences) {
            const container = document.getElementById('experienceContainer');
            container.innerHTML = '';
            data.experience.experiences.forEach((exp, index) => {
                const item = window.app.createExperienceItem(exp);
                container.appendChild(item);
                if (index > 0) {
                    item.querySelector('.btn-remove-exp').classList.remove('hidden');
                }
            });
        }
        
        // Projects
        if (data.projects && data.projects.projects) {
            const container = document.getElementById('projectContainer');
            container.innerHTML = '';
            data.projects.projects.forEach((project, index) => {
                const item = window.app.createProjectItem(project);
                container.appendChild(item);
                if (index > 0) {
                    item.querySelector('.btn-remove-project').classList.remove('hidden');
                }
            });
        }
        
        // Skills
        if (data.skills) {
            Object.keys(data.skills).forEach(field => {
                const element = document.getElementById(field);
                if (element) element.value = data.skills[field] || '';
            });
        }
        
        // Photo
        if (data.photo) {
            const photoPreview = document.getElementById('photoPreview');
            photoPreview.innerHTML = `<img src="${data.photo}" alt="Profile Photo">`;
            document.getElementById('removePhotoBtn').classList.remove('hidden');
        }
        
        // Update preview
        if (window.app) {
            window.app.updatePreview();
        }
    }

    clearForm() {
        // Clear all inputs
        document.querySelectorAll('#cvForm input, #cvForm textarea').forEach(input => {
            input.value = '';
        });
        
        // Reset photo
        document.getElementById('photoPreview').innerHTML = '<i class="fas fa-user"></i>';
        document.getElementById('removePhotoBtn').classList.add('hidden');
        document.getElementById('photoInput').value = '';
        
        // Reset experiences
        const expContainer = document.getElementById('experienceContainer');
        expContainer.innerHTML = '';
        const defaultExp = window.app.createExperienceItem();
        expContainer.appendChild(defaultExp);
        
        // Reset projects
        const projectContainer = document.getElementById('projectContainer');
        projectContainer.innerHTML = '';
        const defaultProject = window.app.createProjectItem();
        projectContainer.appendChild(defaultProject);
        
        // Update preview
        if (window.app) {
            window.app.updatePreview();
        }
        
        this.showToast('Formulir telah dibersihkan', 'info');
    }
}

// Export for use in main app
window.CVBuilder = CVBuilder;