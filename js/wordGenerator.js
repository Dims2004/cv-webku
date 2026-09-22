// Word Generator Module — exports CV as .doc (HTML-based, opened by Word)
// This produces a Word file that preserves the CV layout using tables and
// inline styles. Word will open it natively and the user can edit freely.
class WordGenerator {
    constructor() {
        this.isGenerating = false;
    }

    async generateWord(formData, options = {}) {
        const type = options.type || 'ats'; // 'ats' | 'creative'
        const fileSuffix = options.fileSuffix || (type === 'creative' ? 'CV_Creative' : 'CV');

        if (this.isGenerating) {
            this.showToast('Sedang memproses Word, harap tunggu...', 'info');
            return;
        }

        this.isGenerating = true;
        this.showToast('Mengenerate Word...', 'info');

        try {
            const html = type === 'creative'
                ? this.buildCreativeDoc(formData)
                : this.buildAtsDoc(formData);

            this.downloadDoc(html, formData, fileSuffix);
            this.showToast('Word berhasil diunduh!', 'success');
        } catch (error) {
            console.error('Word generation error:', error);
            this.showToast('Gagal generate Word: ' + error.message, 'error');
        } finally {
            this.isGenerating = false;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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

    buildAtsDoc(d) {
        const i18n = window.i18n;
        const t = (k) => i18n ? i18n.t(k) : k;

        // Section title helper
        const sectionTitle = (text) => `
            <p style="margin:14pt 0 6pt 0;font-size:11pt;font-weight:bold;
                       text-transform:uppercase;letter-spacing:0.5pt;
                       border-bottom:1pt solid #1a1a2e;padding-bottom:2pt;">${this.escapeHtml(text)}</p>
        `;

        // Build contact lines
        const contactLines = [];
        if (d.domicile) contactLines.push(`<p style="margin:0;font-size:10pt;"><b>${t('pvLabelAddress')}</b> : ${this.escapeHtml(d.domicile)}</p>`);
        if (d.phone) contactLines.push(`<p style="margin:0;font-size:10pt;"><b>${t('pvLabelPhone')}</b> : ${this.escapeHtml(d.phone)}</p>`);
        if (d.email) {
            const href = this.formatLinkUrl(d.email);
            contactLines.push(`<p style="margin:0;font-size:10pt;"><b>${t('pvLabelEmail')}</b> : <a href="${href}" style="color:#1a56db;">${this.escapeHtml(d.email)}</a></p>`);
        }
        if (d.linkedin) {
            const href = this.formatLinkUrl(d.linkedin);
            const label = d.linkedinTitle || d.linkedin;
            contactLines.push(`<p style="margin:0;font-size:10pt;"><b>${t('pvLabelLinkedin')}</b> : <a href="${href}" style="color:#1a56db;">${this.escapeHtml(label)}</a></p>`);
        }
        if (d.portfolio) {
            const href = this.formatLinkUrl(d.portfolio);
            const label = d.portfolioTitle || d.portfolio;
            contactLines.push(`<p style="margin:0;font-size:10pt;"><b>${t('pvLabelPortfolio')}</b> : <a href="${href}" style="color:#1a56db;">${this.escapeHtml(label)}</a></p>`);
        }

        // Photo cell (optional)
        const photoCell = (d.photoOption === 'with' && d.photo)
            ? `<td width="90" valign="top" style="padding-right:12pt;">
                   <img src="${d.photo}" width="90" height="110" style="width:90pt;height:110pt;object-fit:cover;border:1pt solid #1a1a2e;" />
               </td>`
            : '';

        // About (no heading, per user request)
        const aboutHTML = d.aboutMe
            ? `<p style="margin:10pt 0 6pt 0;font-size:10pt;text-align:justify;line-height:1.5;">${this.escapeHtml(d.aboutMe).replace(/\n/g, '<br/>')}</p>`
            : '';

        // Education
        let eduHTML = '';
        if (d.education && d.education.length) {
            const items = d.education.filter(e => e.institution || e.major).map(e => {
                const meta = [e.location, e.period].filter(Boolean).join(' • ');
                return `
                    <p style="margin:0 0 2pt 0;font-size:10.5pt;"><b>${this.escapeHtml(e.institution || '')}</b>${meta ? ' <span style="float:right;">' + this.escapeHtml(meta) + '</span>' : ''}</p>
                    ${e.major ? `<p style="margin:0;font-size:10pt;">${this.escapeHtml(e.major)}</p>` : ''}
                    ${e.gpa ? `<p style="margin:0;font-size:10pt;">${this.escapeHtml(e.gpa)}</p>` : ''}
                    <p style="margin:6pt 0 0 0;"></p>
                `;
            }).join('');
            if (items) eduHTML = sectionTitle(t('pvEducation')) + items;
        }

        // Internships
        let intHTML = '';
        if (d.internships && d.internships.length) {
            const items = d.internships.filter(x => x.company || x.position).map(x => {
                const meta = [x.location, x.period].filter(Boolean).join(' • ');
                const bullets = (x.description || '').split('\n').map(l => l.trim()).filter(Boolean)
                    .map(l => `<li style="font-size:10pt;">${this.escapeHtml(l)}</li>`).join('');
                return `
                    <p style="margin:0;font-size:10.5pt;"><b>${this.escapeHtml(x.company || '')}</b>${meta ? ' <span style="float:right;">' + this.escapeHtml(meta) + '</span>' : ''}</p>
                    ${x.position ? `<p style="margin:0;font-size:10pt;">${this.escapeHtml(x.position)}</p>` : ''}
                    ${bullets ? `<ul style="margin:3pt 0 0 0;padding-left:18pt;">${bullets}</ul>` : ''}
                    <p style="margin:6pt 0 0 0;"></p>
                `;
            }).join('');
            if (items) intHTML = sectionTitle(t('pvInternship')) + items;
        }

        // Work
        let workHTML = '';
        if (d.workExperiences && d.workExperiences.length) {
            const items = d.workExperiences.filter(x => x.company || x.position).map(x => {
                const meta = [x.location, x.period].filter(Boolean).join(' • ');
                const bullets = (x.description || '').split('\n').map(l => l.trim()).filter(Boolean)
                    .map(l => `<li style="font-size:10pt;">${this.escapeHtml(l)}</li>`).join('');
                return `
                    <p style="margin:0;font-size:10.5pt;"><b>${this.escapeHtml(x.company || '')}</b>${meta ? ' <span style="float:right;">' + this.escapeHtml(meta) + '</span>' : ''}</p>
                    ${x.position ? `<p style="margin:0;font-size:10pt;">${this.escapeHtml(x.position)}</p>` : ''}
                    ${bullets ? `<ul style="margin:3pt 0 0 0;padding-left:18pt;">${bullets}</ul>` : ''}
                    <p style="margin:6pt 0 0 0;"></p>
                `;
            }).join('');
            if (items) workHTML = sectionTitle(t('pvWork')) + items;
        }

        // Organizations
        let orgHTML = '';
        if (d.organizations && d.organizations.length) {
            const items = d.organizations.filter(x => x.name || x.position).map(x => {
                const meta = [x.location, x.period].filter(Boolean).join(' • ');
                const bullets = (x.description || '').split('\n').map(l => l.trim()).filter(Boolean)
                    .map(l => `<li style="font-size:10pt;">${this.escapeHtml(l)}</li>`).join('');
                return `
                    <p style="margin:0;font-size:10.5pt;"><b>${this.escapeHtml(x.name || '')}</b>${meta ? ' <span style="float:right;">' + this.escapeHtml(meta) + '</span>' : ''}</p>
                    ${x.position ? `<p style="margin:0;font-size:10pt;">${this.escapeHtml(x.position)}</p>` : ''}
                    ${bullets ? `<ul style="margin:3pt 0 0 0;padding-left:18pt;">${bullets}</ul>` : ''}
                    <p style="margin:6pt 0 0 0;"></p>
                `;
            }).join('');
            if (items) orgHTML = sectionTitle(t('pvOrg')) + items;
        }

        // Projects
        let projHTML = '';
        if (d.projects && d.projects.length) {
            const items = d.projects.filter(x => x.name).map(x => {
                const tech = x.tech ? `<p style="margin:0;font-size:10pt;"><b>${t('labelTech')}:</b> ${this.escapeHtml(x.tech)}</p>` : '';
                const desc = x.description ? `<p style="margin:0;font-size:10pt;">${this.escapeHtml(x.description)}</p>` : '';
                return `
                    <p style="margin:0;font-size:10.5pt;"><b>${this.escapeHtml(x.name)}</b></p>
                    ${desc}
                    ${tech}
                    <p style="margin:6pt 0 0 0;"></p>
                `;
            }).join('');
            if (items) projHTML = sectionTitle(t('pvProject')) + items;
        }

        // Skills
        let skillsHTML = '';
        if (d.skills && d.skills.length) {
            const valid = d.skills.filter(s => s.category || s.items);
            if (valid.length) {
                const cols = valid.map(s => {
                    const items = (s.items || '').split(',').map(x => x.trim()).filter(Boolean)
                        .map(x => `<li style="font-size:10pt;">${this.escapeHtml(x)}</li>`).join('');
                    return `
                        <td width="50%" valign="top" style="padding-right:12pt;">
                            ${s.category ? `<p style="margin:0 0 3pt 0;font-size:10pt;"><b>${this.escapeHtml(s.category)}</b></p>` : ''}
                            ${items ? `<ul style="margin:0;padding-left:18pt;">${items}</ul>` : ''}
                        </td>
                    `;
                }).join('');
                skillsHTML = sectionTitle(t('pvSkills')) +
                    `<table width="100%" cellpadding="0" cellspacing="0"><tr>${cols}</tr></table>`;
            }
        }

        // Certifications
        let certHTML = '';
        if (d.certifications && d.certifications.length) {
            const items = d.certifications.filter(c => c.name).map(c => {
                const parts = [c.issuer, c.year].filter(Boolean).join(' - ');
                return `<li style="font-size:10pt;">${this.escapeHtml(c.name)}${parts ? ' - ' + this.escapeHtml(parts) : ''}</li>`;
            }).join('');
            if (items) certHTML = sectionTitle(t('pvCert')) + `<ul style="margin:0;padding-left:18pt;">${items}</ul>`;
        }

        return `
            <html xmlns:o='urn:schemas-microsoft-com:office:office'
                  xmlns:w='urn:schemas-microsoft-com:office:word'
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>CV</title>
                <!--[if gte mso 9]>
                <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
                <![endif]-->
                <style>
                    @page { size: A4; margin: 1.5cm 1.5cm 1.5cm 1.5cm; }
                    body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; color: #1a1a2e; line-height: 1.5; }
                    h1 { font-size: 22pt; font-weight: bold; margin: 0 0 6pt 0; text-transform: uppercase; letter-spacing: 0.5pt; }
                    .position { font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #4a5568; margin: 0 0 8pt 0; }
                    a { color: #1a56db; text-decoration: underline; }
                    ul { margin: 0; }
                    li { margin: 1pt 0; }
                </style>
            </head>
            <body>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1.5pt solid #1a1a2e;margin-bottom:10pt;">
                    <tr>
                        ${photoCell}
                        <td valign="top" style="padding-bottom:10pt;">
                            <h1>${this.escapeHtml(d.fullName || 'NAMA LENGKAP')}</h1>
                            ${d.position ? `<p class="position">${this.escapeHtml(d.position)}</p>` : ''}
                            ${contactLines.join('')}
                        </td>
                    </tr>
                </table>
                ${aboutHTML}
                ${eduHTML}
                ${intHTML}
                ${workHTML}
                ${orgHTML}
                ${projHTML}
                ${skillsHTML}
                ${certHTML}
            </body>
            </html>
        `;
    }

    buildCreativeDoc(d) {
        const i18n = window.i18n;
        const t = (k) => i18n ? i18n.t(k) : k;

        const contact = [];
        if (d.email) contact.push(`<p style="margin:0;font-size:10pt;">${this.escapeHtml(d.email)}</p>`);
        if (d.phone) contact.push(`<p style="margin:0;font-size:10pt;">${this.escapeHtml(d.phone)}</p>`);
        if (d.address) contact.push(`<p style="margin:0;font-size:10pt;">${this.escapeHtml(d.address)}</p>`);
        if (d.linkedin) contact.push(`<p style="margin:0;font-size:10pt;">${this.escapeHtml(d.linkedin)}</p>`);
        if (d.instagram) contact.push(`<p style="margin:0;font-size:10pt;">${this.escapeHtml(d.instagram)}</p>`);

        const sectionHeading = (text) =>
            `<p style="margin:10pt 0 4pt 0;font-size:11pt;font-weight:bold;text-transform:uppercase;border-bottom:1pt solid #14b8a6;padding-bottom:2pt;">${this.escapeHtml(text)}</p>`;

        const photoCell = d.photo
            ? `<p style="text-align:center;margin:0 0 10pt 0;"><img src="${d.photo}" width="120" style="width:120pt;height:120pt;border-radius:60pt;object-fit:cover;" /></p>`
            : '';

        let expHTML = '';
        if (d.experiences && d.experiences.length) {
            const items = d.experiences.filter(e => e.company || e.position).map(e => {
                const bullets = (e.description || '').split('\n').map(l => l.trim()).filter(Boolean)
                    .map(l => `<li style="font-size:10pt;">${this.escapeHtml(l)}</li>`).join('');
                return `
                    <p style="margin:0;font-size:10pt;"><b>${this.escapeHtml(e.position || '')}</b>${e.period ? ' <span style="float:right;">' + this.escapeHtml(e.period) + '</span>' : ''}</p>
                    <p style="margin:0;font-size:10pt;color:#4a5568;">${this.escapeHtml(e.company || '')}${e.location ? ' — ' + this.escapeHtml(e.location) : ''}</p>
                    ${bullets ? `<ul style="margin:2pt 0 0 0;padding-left:18pt;">${bullets}</ul>` : ''}
                    <p style="margin:6pt 0 0 0;"></p>
                `;
            }).join('');
            if (items) expHTML = sectionHeading(t('pvWork')) + items;
        }

        let eduHTML = '';
        if (d.educations && d.educations.length) {
            const items = d.educations.filter(x => x.major || x.institution).map(x => `
                <p style="margin:0;font-size:10pt;">${this.escapeHtml(x.major || '')}</p>
                <p style="margin:0;font-size:10pt;"><b>${this.escapeHtml(x.institution || '')}${x.location ? ' — ' + this.escapeHtml(x.location) : ''}</b>${x.period ? ' <span style="float:right;">' + this.escapeHtml(x.period) + '</span>' : ''}</p>
                <p style="margin:6pt 0 0 0;"></p>
            `).join('');
            if (items) eduHTML = sectionHeading(t('pvEducation')) + items;
        }

        let skillsHTML = '';
        if (d.skills && d.skills.length) {
            const valid = d.skills.filter(s => s.category || s.items);
            if (valid.length) {
                const list = valid.map(s => {
                    const items = (s.items || '').split(',').map(x => x.trim()).filter(Boolean).join(', ');
                    if (s.category) return `<li style="font-size:10pt;"><b>${this.escapeHtml(s.category)}:</b> ${this.escapeHtml(items)}</li>`;
                    return items.split(', ').map(x => `<li style="font-size:10pt;">${this.escapeHtml(x)}</li>`).join('');
                }).join('');
                skillsHTML = sectionHeading(t('pvSkills')) + `<ul style="margin:0;padding-left:18pt;">${list}</ul>`;
            }
        }

        const listSection = (title, arr) => {
            if (!arr || !arr.length) return '';
            return sectionHeading(title) + `<ul style="margin:0;padding-left:18pt;">${arr.map(x => `<li style="font-size:10pt;">${this.escapeHtml(x)}</li>`).join('')}</ul>`;
        };

        const about = d.aboutMe
            ? sectionHeading(t('pvAboutShort')) + `<p style="margin:0;font-size:10pt;text-align:justify;">${this.escapeHtml(d.aboutMe)}</p>`
            : '';

        return `
            <html xmlns:o='urn:schemas-microsoft-com:office:office'
                  xmlns:w='urn:schemas-microsoft-com:office:word'
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>Creative CV</title>
                <!--[if gte mso 9]>
                <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
                <![endif]-->
                <style>
                    @page { size: A4; margin: 1.5cm; }
                    body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; color: #1a1a2e; }
                    h1 { font-size: 22pt; font-weight: bold; margin: 0 0 4pt 0; }
                    .subtitle { font-size: 11pt; color: #14b8a6; text-transform: uppercase; letter-spacing: 0.5pt; margin: 0 0 8pt 0; }
                    a { color: #1a56db; text-decoration: underline; }
                </style>
            </head>
            <body>
                ${photoCell}
                <h1 style="text-align:center;">${this.escapeHtml(d.fullName || 'Nama Lengkap')}</h1>
                ${d.position ? `<p class="subtitle" style="text-align:center;">${this.escapeHtml(d.position)}</p>` : ''}
                <div style="text-align:center;margin-bottom:10pt;">${contact.join('')}</div>
                ${about}
                ${eduHTML}
                ${expHTML}
                ${skillsHTML}
                ${listSection(t('pvTraining'), d.training)}
                ${listSection(t('pvCertifications'), d.certifications)}
                ${listSection(t('pvLanguages'), d.languages)}
                ${listSection(t('pvAchievements'), d.achievements)}
            </body>
            </html>
        `;
    }

    downloadDoc(html, formData, suffix) {
        // Word reads this as HTML with UTF-8 encoding.
        // BOM ensures correct accent rendering in Word.
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const name = (formData && formData.fullName) ? formData.fullName.replace(/\s+/g, '_') : 'CV';
        a.href = url;
        a.download = `${name}_${suffix}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    showToast(message, type) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(message);
        }
    }
}

window.WordGenerator = WordGenerator;
