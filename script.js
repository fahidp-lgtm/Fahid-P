const DEFAULT_DATA = {
    personalInfo: {
        name: 'Fahid P',
        title: 'Senior QA Tester',
        email: 'fahidp3@gmail.com',
        phone: '+91 9746997806',
        location: 'Malappuram, Kerala, India',
        summary: 'Results-driven QA professional with 3.5+ years of experience delivering quality across BFSI, ERP, AI Projects, and web applications. Expert in end-to-end testing, automation, and team leadership. Passionate about vibe coding—rapidly prototyping and iterating on web applications, SaaS products, and developer tools with a focus on practical solutions.'
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
            title: 'Bug Tracker Pro',
            description: 'Built a comprehensive bug reporting and issue tracking tool featuring workflow automation, team collaboration, real-time status updates, and customizable project boards for streamlined QA processes.',
            tags: ['Vibe Coding', 'SaaS', 'React'],
            features: ['Issue creation and assignment', 'Custom workflow states', 'Priority and severity tracking', 'Team notifications and comments', 'Dashboard analytics'],
            stats: ['Built from Scratch', 'Active Workflows']
        },
        {
            id: '4',
            title: 'E-Commerce Platform Testing',
            description: 'End-to-end testing of search, cart, and payment flows for e-commerce and quick commerce platforms with cross-browser compatibility verification.',
            tags: ['E-Commerce', 'Katalon', 'API'],
            features: ['Search to checkout flow testing', 'Payment gateway validation', 'Cross-browser compatibility', 'Multi-device testing'],
            stats: ['80% Bug Reduction', '100+ Test Cases']
        },
        {
            id: '5',
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
        { id: '6', title: 'Vibe Coding & Dev', items: ['Rapid Prototyping', 'React / Next.js', 'Node.js', 'Vercel Deployment', 'Creative Development'], progress: 78 },
        { id: '7', title: 'Domains', items: ['BFSI & Banking', 'ERP Systems', 'E-Commerce', 'Healthcare / HMS', 'AI & SaaS'], progress: 92 }
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

let portfolioData = JSON.parse(localStorage.getItem('portfolio_data')) || DEFAULT_DATA;

function loadData() {
    portfolioData = JSON.parse(localStorage.getItem('portfolio_data')) || DEFAULT_DATA;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initNavigation();
    initScrollReveal();
    initTypewriter();
    initCounterAnimation();
    initSkillBars();
    initContactForm();
    init3DEffects();
    initNavbarScroll();
    renderDynamicContent();
});

function renderDynamicContent() {
    const info = portfolioData.personalInfo;
    
    document.querySelector('.hero-badge').innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        ${info.title}
    `;
    
    document.querySelector('.hero-title').innerHTML = `
        <span>Hi, I'm</span>
        <span class="gradient">${info.name}</span>
    `;
    
    document.querySelector('.hero-subtitle').textContent = info.summary;
    
    document.querySelectorAll('.contact-card')[0].querySelector('p').textContent = info.email;
    document.querySelectorAll('.contact-card')[1].querySelector('p').textContent = info.location;
    document.querySelectorAll('.contact-card')[2].querySelector('p').textContent = info.phone;
    
    renderSkills();
    renderProjects();
    renderCertifications();
}

function renderSkills() {
    const container = document.querySelector('.skills-grid');
    const icons = [
        '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>',
        '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
        '<path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path>',
        '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
        '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>',
        '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>'
    ];
    
    container.innerHTML = portfolioData.skills.map((skill, index) => `
        <div class="skill-card reveal">
            <div class="skill-icon-3d">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[index % icons.length]}
                </svg>
            </div>
            <h3 class="skill-title">${skill.title}</h3>
            <ul class="skill-list">
                ${skill.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <div class="skill-bar">
                <div class="skill-progress" data-progress="${skill.progress}"></div>
            </div>
        </div>
    `).join('');
    
    initSkillBars();
    initScrollReveal();
}

function renderProjects() {
    const container = document.querySelector('.projects-grid');
    const icons = [
        '<path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>',
        '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
        '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
        '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
        '<path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 0 1 4-4z"></path><path d="M12 8v4"></path><circle cx="12" cy="18" r="4"></circle><path d="M8 18l-2 2"></path><path d="M16 18l2 2"></path>'
    ];
    
    container.innerHTML = portfolioData.projects.map((project, index) => `
        <article class="project-card-3d reveal">
            <div class="project-image">
                <div class="project-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        ${icons[index % icons.length]}
                    </svg>
                </div>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
                <ul class="project-features">
                    ${project.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <div class="project-stats">
                    ${project.stats.map(s => {
                        const [value, label] = s.split(' ');
                        return `<span><strong>${value}</strong> ${label}</span>`;
                    }).join('')}
                </div>
            </div>
        </article>
    `).join('');
    
    initScrollReveal();
    init3DEffects();
}

function renderCertifications() {
    const container = document.querySelector('.cert-grid');
    
    container.innerHTML = portfolioData.certifications.map(cert => `
        <div class="cert-card-3d reveal">
            <div class="cert-icon-3d">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                </svg>
            </div>
            <h4>${cert.title}</h4>
        </div>
    `).join('');
    
    initScrollReveal();
}

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavigation() {
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);
    highlightNavigation();
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.revealed)');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                    entry.target.classList.add('revealed');
                }, index * 100);
            }
        });
    }, observerOptions);

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

function initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter');
    if (!typewriterElement) return;

    const texts = [
        'Quality Assurance Engineer',
        'Test Automation Expert',
        'QA Lead & Strategist',
        'API Testing Specialist',
        'Vibe Coder',
        'Bug Tracker Builder'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;

    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = 50;
        } else {
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingDelay = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingDelay = 500;
        }

        setTimeout(typeWriter, typingDelay);
    }

    typeWriter();
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    const progress = entry.target.getAttribute('data-progress');
                    entry.target.style.width = progress + '%';
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
            </svg>
            Sending...
        `;
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                submitBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Message Sent!
                `;
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                form.reset();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Error - Try Again
            `;
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }

        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }, 3000);
    });
}

function init3DEffects() {
    const cards3D = document.querySelectorAll('.skill-card, .project-card-3d, .cert-card-3d, .contact-card');
    
    cards3D.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.clientX) / 50;
            const y = (window.innerHeight / 2 - e.clientY) / 50;
            heroVisual.style.transform = `perspective(1500px) rotateY(${x}deg) rotateX(${y}deg)`;
        });
    }
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .spinner {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

window.addEventListener('storage', (e) => {
    if (e.key === 'portfolio_data') {
        loadData();
        renderDynamicContent();
    }
});
