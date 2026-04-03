const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: 'qa2024',
    pin: '1234'
};

const DEFAULT_DATA = {
    personalInfo: {
        name: 'Fahid P',
        title: 'Senior QA Tester',
        email: 'fahidp3@gmail.com',
        phone: '+91 9746997806',
        location: 'Malappuram, Kerala, India',
        summary: 'Results-driven QA professional with 3.5+ years of experience delivering quality across BFSI, ERP, AI Projects, and web applications.'
    },
    projects: [
        {
            id: '1',
            title: 'BFSI Application Testing',
            description: 'End-to-end QA for banking and financial systems ensuring 100% transaction accuracy through data reconciliation and SLA compliance monitoring.',
            tags: ['BFSI', 'Banking', 'JIRA'],
            features: ['Transaction validation and reconciliation', 'SLA compliance monitoring', 'Compliance standards adherence', 'Defect tracking in JIRA'],
            stats: ['100% Accuracy', '5 Team Members']
        },
        {
            id: '2',
            title: 'ERP System Testing',
            description: 'Comprehensive testing of HR, Finance, and Inventory modules ensuring data accuracy and operational quality across enterprise resource planning systems.',
            tags: ['ERP', 'SQL', 'Selenium'],
            features: ['HR, Finance, Inventory module validation', 'Data accuracy verification via SQL', 'End-to-end workflow testing', 'Regression and smoke testing'],
            stats: ['99% Data Accuracy', '3 Modules']
        },
        {
            id: '3',
            title: 'E-Commerce Platform Testing',
            description: 'End-to-end testing of search, cart, and payment flows for e-commerce and quick commerce platforms with cross-browser compatibility verification.',
            tags: ['E-Commerce', 'Katalon', 'API'],
            features: ['Search to checkout flow testing', 'Payment gateway validation', 'Cross-browser compatibility', 'Multi-device testing'],
            stats: ['80% Bug Reduction', '100+ Test Cases']
        },
        {
            id: '4',
            title: 'AI & Healthcare Systems',
            description: 'Testing of AI facility management systems and Hospital Management Systems (HMS) ensuring accuracy, reliability, and compliance standards.',
            tags: ['AI', 'Healthcare', 'Postman'],
            features: ['AI facility management testing', 'Hospital Management System validation', 'API and integration testing', 'Compliance monitoring'],
            stats: ['99.9% Uptime', '20% Team Efficiency']
        }
    ],
    skills: [
        { id: '1', title: 'Automation & API', items: ['Selenium WebDriver', 'Katalon Studio', 'Postman', 'REST Assured', 'JMeter'], progress: 92 },
        { id: '2', title: 'Testing Types', items: ['Functional Testing', 'Regression & SIT', 'UAT Testing', 'Smoke & Sanity', 'Exploratory Testing'], progress: 95 },
        { id: '3', title: 'Web & Mobile', items: ['Cross-Browser Testing', 'Multi-Device Testing', 'BrowserStack', 'Responsive Testing', 'Chrome, Edge, Safari'], progress: 88 },
        { id: '4', title: 'Tools & Platforms', items: ['JIRA / Testlink', 'Git / GitHub', 'Jenkins CI/CD', 'Microsoft Excel', 'DBeaver'], progress: 90 },
        { id: '5', title: 'Database & SQL', items: ['PostgreSQL', 'SQL Queries', 'Data Validation', 'DBeaver', 'Data Reconciliation'], progress: 85 },
        { id: '6', title: 'Domains', items: ['BFSI & Banking', 'ERP Systems', 'E-Commerce', 'Healthcare / HMS', 'AI & SaaS'], progress: 92 }
    ],
    certifications: [
        { id: '1', title: 'ISTQB Certified Tester - Foundation Level' },
        { id: '2', title: 'Certified Agile Tester' },
        { id: '3', title: 'Cybersecurity Fundamentals' },
        { id: '4', title: 'CTIGA - Certified Threat Intelligence & Governance Analyst' },
        { id: '5', title: 'CCEP - Certified Cybersecurity Educator Professional' },
        { id: '6', title: 'Data Structures & Algorithms (Coursera)' }
    ]
};

let credentials;
let portfolioData;

function loadCredentials() {
    try {
        const stored = localStorage.getItem('portfolio_credentials');
        credentials = stored ? JSON.parse(stored) : DEFAULT_CREDENTIALS;
    } catch (e) {
        credentials = DEFAULT_CREDENTIALS;
    }
}

function loadPortfolioData() {
    try {
        const stored = localStorage.getItem('portfolio_data');
        portfolioData = stored ? JSON.parse(stored) : DEFAULT_DATA;
    } catch (e) {
        portfolioData = DEFAULT_DATA;
    }
}

loadCredentials();
loadPortfolioData();

function initAdmin() {
    loadPersonalInfo();
    renderAllItems();
    updateStats();
}

function checkLogin() {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isLoggedIn === 'true') {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        initAdmin();
    }
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const pin = document.getElementById('pin').value;

    console.log('Attempting login with:', username, password, pin);
    console.log('Credentials:', credentials);

    if (username === credentials.username && password === credentials.password && pin === credentials.pin) {
        sessionStorage.setItem('admin_logged_in', 'true');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        initAdmin();
    } else {
        document.getElementById('loginError').textContent = 'Invalid credentials. Please try again.';
    }
});

window.resetAdminData = function() {
    localStorage.removeItem('portfolio_credentials');
    localStorage.removeItem('portfolio_data');
    sessionStorage.removeItem('admin_logged_in');
    credentials = DEFAULT_CREDENTIALS;
    portfolioData = DEFAULT_DATA;
    alert('Credentials reset to defaults!\n\nUsername: admin\nPassword: qa2024\nPIN: 1234\n\nPlease refresh the page.');
    location.reload();
};

document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_logged_in');
    location.reload();
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        switchSection(section);
    });
});

function switchSection(section) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');

    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Manage your portfolio content' },
        projects: { title: 'Projects', subtitle: 'Add, edit, or remove projects' },
        skills: { title: 'Skills', subtitle: 'Manage your skill categories' },
        certifications: { title: 'Certifications', subtitle: 'Manage your certifications' },
        settings: { title: 'Settings', subtitle: 'Configure your admin account and personal info' }
    };

    document.getElementById('sectionTitle').textContent = titles[section].title;
    document.getElementById('sectionSubtitle').textContent = titles[section].subtitle;

    const addBtn = document.getElementById('addNewBtn');
    addBtn.style.display = section === 'dashboard' || section === 'settings' ? 'none' : 'flex';
}

document.getElementById('addNewBtn').addEventListener('click', () => {
    const activeSection = document.querySelector('.admin-section.active').id;
    const sectionName = activeSection.replace('Section', '');
    openModal(sectionName);
});

function renderProjects() {
    const container = document.getElementById('projectsList');
    if (portfolioData.projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3>No Projects Yet</h3>
                <p>Add your first project to showcase your work</p>
            </div>
        `;
        return;
    }

    container.innerHTML = portfolioData.projects.map(project => `
        <div class="item-card">
            <div class="item-info">
                <h4>${project.title}</h4>
                <p>${project.description.substring(0, 100)}...</p>
                <div class="item-tags">
                    ${project.tags.map(tag => `<span class="item-tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="item-actions">
                <button class="item-btn" onclick="editItem('projects', '${project.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="item-btn delete" onclick="deleteItem('projects', '${project.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function renderSkills() {
    const container = document.getElementById('skillsList');
    if (portfolioData.skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polygon points="16 18 22 12 16 6"></polygon>
                    <polygon points="8 6 2 12 8 18"></polygon>
                </svg>
                <h3>No Skills Yet</h3>
                <p>Add your skill categories to showcase your expertise</p>
            </div>
        `;
        return;
    }

    container.innerHTML = portfolioData.skills.map(skill => `
        <div class="item-card">
            <div class="item-info">
                <h4>${skill.title}</h4>
                <p>${skill.items.join(', ')}</p>
                <div class="skill-bar" style="margin-top: 12px;">
                    <div class="skill-progress" style="width: ${skill.progress}%;"></div>
                </div>
            </div>
            <div class="item-actions">
                <button class="item-btn" onclick="editItem('skills', '${skill.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="item-btn delete" onclick="deleteItem('skills', '${skill.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function renderCertifications() {
    const container = document.getElementById('certsList');
    if (portfolioData.certifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                </svg>
                <h3>No Certifications Yet</h3>
                <p>Add your professional certifications</p>
            </div>
        `;
        return;
    }

    container.innerHTML = portfolioData.certifications.map(cert => `
        <div class="item-card">
            <div class="item-info">
                <h4>${cert.title}</h4>
            </div>
            <div class="item-actions">
                <button class="item-btn" onclick="editItem('certifications', '${cert.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="item-btn delete" onclick="deleteItem('certifications', '${cert.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function renderAllItems() {
    renderProjects();
    renderSkills();
    renderCertifications();
}

function updateStats() {
    document.getElementById('projectsCount').textContent = portfolioData.projects.length;
    document.getElementById('skillsCount').textContent = portfolioData.skills.length;
    document.getElementById('certsCount').textContent = portfolioData.certifications.length;
}

function openModal(type, item = null) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('modalForm');
    const title = document.getElementById('modalTitle');

    if (type === 'projects') {
        title.textContent = item ? 'Edit Project' : 'Add New Project';
        form.innerHTML = `
            <div class="form-group">
                <label>Project Title</label>
                <input type="text" id="projectTitle" value="${item ? item.title : ''}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="projectDesc" rows="3" required>${item ? item.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" id="projectTags" value="${item ? item.tags.join(', ') : ''}" placeholder="BFSI, Banking, JIRA">
            </div>
            <div class="form-group">
                <label>Features (one per line)</label>
                <textarea id="projectFeatures" rows="4" placeholder="Feature 1&#10;Feature 2">${item ? item.features.join('\n') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Stats (one per line, format: value Label)</label>
                <textarea id="projectStats" rows="2" placeholder="100% Accuracy&#10;5 Team Members">${item ? item.stats.join('\n') : ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">${item ? 'Update Project' : 'Add Project'}</button>
        `;
    } else if (type === 'skills') {
        title.textContent = item ? 'Edit Skill Category' : 'Add New Skill Category';
        form.innerHTML = `
            <div class="form-group">
                <label>Category Title</label>
                <input type="text" id="skillTitle" value="${item ? item.title : ''}" required>
            </div>
            <div class="form-group">
                <label>Skills (one per line)</label>
                <textarea id="skillItems" rows="5" required>${item ? item.items.join('\n') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Proficiency Level (0-100)</label>
                <input type="number" id="skillProgress" value="${item ? item.progress : 80}" min="0" max="100" required>
            </div>
            <button type="submit" class="btn btn-primary">${item ? 'Update Skill' : 'Add Skill'}</button>
        `;
    } else if (type === 'certifications') {
        title.textContent = item ? 'Edit Certification' : 'Add New Certification';
        form.innerHTML = `
            <div class="form-group">
                <label>Certification Title</label>
                <input type="text" id="certTitle" value="${item ? item.title : ''}" required>
            </div>
            <button type="submit" class="btn btn-primary">${item ? 'Update Certification' : 'Add Certification'}</button>
        `;
    }

    form.dataset.editId = item ? item.id : '';
    form.dataset.type = type;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

document.getElementById('modalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const type = form.dataset.type;
    const editId = form.dataset.editId;

    if (type === 'projects') {
        const project = {
            id: editId || Date.now().toString(),
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDesc').value,
            tags: document.getElementById('projectTags').value.split(',').map(t => t.trim()).filter(t => t),
            features: document.getElementById('projectFeatures').value.split('\n').map(f => f.trim()).filter(f => f),
            stats: document.getElementById('projectStats').value.split('\n').map(s => s.trim()).filter(s => s)
        };

        if (editId) {
            const index = portfolioData.projects.findIndex(p => p.id === editId);
            portfolioData.projects[index] = project;
        } else {
            portfolioData.projects.push(project);
        }
    } else if (type === 'skills') {
        const skill = {
            id: editId || Date.now().toString(),
            title: document.getElementById('skillTitle').value,
            items: document.getElementById('skillItems').value.split('\n').map(i => i.trim()).filter(i => i),
            progress: parseInt(document.getElementById('skillProgress').value)
        };

        if (editId) {
            const index = portfolioData.skills.findIndex(s => s.id === editId);
            portfolioData.skills[index] = skill;
        } else {
            portfolioData.skills.push(skill);
        }
    } else if (type === 'certifications') {
        const cert = {
            id: editId || Date.now().toString(),
            title: document.getElementById('certTitle').value
        };

        if (editId) {
            const index = portfolioData.certifications.findIndex(c => c.id === editId);
            portfolioData.certifications[index] = cert;
        } else {
            portfolioData.certifications.push(cert);
        }
    }

    saveData();
    renderAllItems();
    updateStats();
    closeModal();
});

window.editItem = function(type, id) {
    let item;
    if (type === 'projects') item = portfolioData.projects.find(p => p.id === id);
    else if (type === 'skills') item = portfolioData.skills.find(s => s.id === id);
    else if (type === 'certifications') item = portfolioData.certifications.find(c => c.id === id);
    
    openModal(type, item);
};

window.deleteItem = function(type, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    if (type === 'projects') {
        portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
    } else if (type === 'skills') {
        portfolioData.skills = portfolioData.skills.filter(s => s.id !== id);
    } else if (type === 'certifications') {
        portfolioData.certifications = portfolioData.certifications.filter(c => c.id !== id);
    }

    saveData();
    renderAllItems();
    updateStats();
};

document.getElementById('credentialsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const newPin = document.getElementById('newPin').value;

    if (newUsername) credentials.username = newUsername;
    if (newPassword) credentials.password = newPassword;
    if (newPin && newPin.length === 4) credentials.pin = newPin;

    localStorage.setItem('portfolio_credentials', JSON.stringify(credentials));
    alert('Credentials updated successfully!');
    e.target.reset();
});

document.getElementById('personalInfoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    portfolioData.personalInfo = {
        name: document.getElementById('fullName').value || portfolioData.personalInfo.name,
        title: document.getElementById('title').value || portfolioData.personalInfo.title,
        email: document.getElementById('email').value || portfolioData.personalInfo.email,
        phone: document.getElementById('phone').value || portfolioData.personalInfo.phone,
        location: document.getElementById('location').value || portfolioData.personalInfo.location,
        summary: document.getElementById('summary').value || portfolioData.personalInfo.summary
    };

    saveData();
    alert('Personal information updated!');
});

function loadPersonalInfo() {
    const info = portfolioData.personalInfo;
    document.getElementById('fullName').value = info.name;
    document.getElementById('title').value = info.title;
    document.getElementById('email').value = info.email;
    document.getElementById('phone').value = info.phone;
    document.getElementById('location').value = info.location;
    document.getElementById('summary').value = info.summary;
}

window.resetToDefaults = function() {
    if (!confirm('This will reset all data to defaults. Continue?')) return;
    portfolioData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData();
    renderAllItems();
    updateStats();
    loadPersonalInfo();
    alert('Data reset to defaults!');
};

window.clearAllData = function() {
    if (!confirm('This will delete ALL your data. This cannot be undone! Continue?')) return;
    if (!confirm('Are you absolutely sure? Type "DELETE" in the next prompt to confirm.')) return;
    const confirmDelete = prompt('Type DELETE to confirm:');
    if (confirmDelete !== 'DELETE') return;
    
    localStorage.removeItem('portfolio_data');
    portfolioData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData();
    renderAllItems();
    updateStats();
    alert('All data cleared!');
};

window.exportData = function() {
    const dataStr = JSON.stringify(portfolioData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_data_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
};

window.importData = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (confirm('This will replace all current data. Continue?')) {
                portfolioData = importedData;
                saveData();
                renderAllItems();
                updateStats();
                loadPersonalInfo();
                alert('Data imported successfully!');
            }
        } catch (err) {
            alert('Invalid JSON file!');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

function saveData() {
    localStorage.setItem('portfolio_data', JSON.stringify(portfolioData));
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

checkLogin();
