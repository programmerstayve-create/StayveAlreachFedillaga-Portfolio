// ============================================================
// API CONFIGURATION
// ============================================================
const API_URL = 'https://portfolio-api.programmerstayve.workers.dev/api/projects';

// ============================================================
// DOM ELEMENTS
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('section');
const timeDisplay = document.getElementById('timeDisplay');
const tooltip = document.getElementById('themeTooltip');

// Modal elements
const modalOverlay = document.getElementById('passwordModal');
const modalInput = document.getElementById('modalPasswordInput');
const modalSubmit = document.getElementById('modalSubmitBtn');
const modalCancel = document.getElementById('modalCancelBtn');
const modalAlert = document.getElementById('modalAlert');
const projectsTitle = document.getElementById('projectsTitle');

// Admin panel elements
const adminModal = document.getElementById('adminModal');
const adminForm = document.getElementById('adminForm');
const adminCloseBtn = document.getElementById('adminCloseBtn');
const adminMessage = document.getElementById('adminMessage');
const projectTitle = document.getElementById('projectTitle');
const projectDescription = document.getElementById('projectDescription');
const projectTech = document.getElementById('projectTech');
const projectLink = document.getElementById('projectLink');
const projectsGrid = document.querySelector('.projects-grid');

// Store password for API calls
let currentPassword = '';

// ============================================================
// THEME TOGGLE
// ============================================================
let currentTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.toggle('light-mode', currentTheme === 'light');
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    const theme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ============================================================
// REAL-TIME CLOCK
// ============================================================
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    timeDisplay.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// TOOLTIP
// ============================================================
setTimeout(() => tooltip.classList.add('visible'), 800);
let tooltipTimeout = setTimeout(() => tooltip.classList.remove('visible'), 8000);

themeToggle.addEventListener('click', () => {
    tooltip.classList.remove('visible');
    clearTimeout(tooltipTimeout);
});

document.addEventListener('click', (e) => {
    const isTooltip = tooltip.contains(e.target);
    const isToggle = themeToggle.contains(e.target);
    if (!isTooltip && !isToggle) {
        tooltip.classList.remove('visible');
        clearTimeout(tooltipTimeout);
    }
});

window.addEventListener('scroll', () => {
    if (tooltip.classList.contains('visible')) {
        tooltip.classList.remove('visible');
        clearTimeout(tooltipTimeout);
    }
});

// ============================================================
// HAMBURGER MENU
// ============================================================
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

document.addEventListener('click', (e) => {
    const isInside = navLinks.contains(e.target) || hamburger.contains(e.target);
    if (!isInside && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
});

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

sections.forEach(section => observer.observe(section));

// ============================================================
// API FUNCTIONS
// ============================================================
async function fetchProjects() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.success ? data.projects : [];
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
    }
}

async function addProjectToAPI(project, password) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...project,
                password: password,
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to add project:', error);
        return { success: false, error: error.message };
    }
}

async function deleteProjectFromAPI(id, password) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to delete project:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// LOAD PROJECTS
// ============================================================
async function loadProjects() {
    const projects = await fetchProjects();

    const cards = projectsGrid.querySelectorAll('.project-card');
    cards.forEach(card => card.remove());

    projects.forEach(project => renderProject(project));
}

// ============================================================
// RENDER A PROJECT
// ============================================================
function renderProject(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = project.id;

    const techTags = project.tech.split(',').map(t => t.trim()).filter(t => t);
    const techHTML = techTags.map(t => `<span>${t}</span>`).join(' · ');

    const tag = project.tag || 'Full-Stack';

    card.innerHTML = `
        <div class="project-tag">${escapeHTML(tag)}</div>
        <h3>${escapeHTML(project.title)}</h3>
        <p>${escapeHTML(project.description)}</p>
        <div class="project-tech">${techHTML}</div>
        <div class="project-links">
            <a href="${escapeHTML(project.link)}" target="_blank">
                <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
        </div>
        <button class="delete-project" data-id="${project.id}">
            <i class="fas fa-trash-alt"></i> Delete Project
        </button>
    `;

    projectsGrid.appendChild(card);

    const deleteBtn = card.querySelector('.delete-project');
    deleteBtn.addEventListener('click', function() {
        const id = this.dataset.id;
        handleDeleteProject(id);
    });
}

// ============================================================
// HANDLE DELETE PROJECT
// ============================================================
async function handleDeleteProject(id) {
    const password = prompt('Enter admin password to delete this project:');
    if (!password) return;

    const result = await deleteProjectFromAPI(id, password);

    if (result.success) {
        alert('✅ Project deleted successfully!');
        await loadProjects();
    } else {
        alert('❌ ' + (result.error || 'Failed to delete project'));
    }
}

// ============================================================
// HELPERS
// ============================================================
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showAdminMessage(text, type = 'success') {
    adminMessage.textContent = text;
    adminMessage.className = 'admin-message ' + type;
}

function hideAdminMessage() {
    adminMessage.className = 'admin-message';
}

// ============================================================
// PASSWORD MODAL
// ============================================================
let attemptCount = 0;

projectsTitle.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    modalInput.value = '';
    modalAlert.classList.remove('show');
    modalInput.focus();
});

function closeModal() {
    modalOverlay.classList.remove('active');
    modalAlert.classList.remove('show');
    attemptCount = 0;
}

modalCancel.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

modalSubmit.addEventListener('click', () => {
    const password = modalInput.value.trim();

    if (!password) {
        modalAlert.classList.add('show');
        modalAlert.textContent = '⚠️ Please enter a password.';
        modalAlert.style.animation = 'none';
        setTimeout(() => modalAlert.style.animation = 'shake 0.5s ease', 10);
        return;
    }

    closeModal();
    openAdminPanel(password);
});

modalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        modalSubmit.click();
    }
});

// ============================================================
// ADMIN PANEL
// ============================================================
function openAdminPanel(password) {
    currentPassword = password;
    adminModal.classList.add('active');
    adminForm.reset();
    hideAdminMessage();
    document.body.classList.add('admin-mode');
}

function closeAdminPanel() {
    adminModal.classList.remove('active');
    hideAdminMessage();
    currentPassword = '';
}

adminCloseBtn.addEventListener('click', closeAdminPanel);

adminModal.addEventListener('click', function(e) {
    if (e.target === adminModal) {
        closeAdminPanel();
    }
});

// ============================================================
// ADMIN FORM – Add Project
// ============================================================
adminForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = projectTitle.value.trim();
    const description = projectDescription.value.trim();
    const tech = projectTech.value.trim();
    const link = projectLink.value.trim();

    if (!title || !description || !tech || !link) {
        showAdminMessage('⚠️ Please fill in all fields.', 'error');
        return;
    }

    try {
        new URL(link);
    } catch (_) {
        showAdminMessage('⚠️ Please enter a valid URL (e.g. https://example.com)', 'error');
        return;
    }

    if (!currentPassword) {
        showAdminMessage('⚠️ Password session expired. Please re-enter.', 'error');
        setTimeout(() => closeAdminPanel(), 1500);
        return;
    }

    showAdminMessage('⏳ Adding project...', 'success');

    const result = await addProjectToAPI({ title, description, tech, link }, currentPassword);

    if (result.success) {
        showAdminMessage('✅ Project added successfully!', 'success');
        adminForm.reset();
        await loadProjects();
        setTimeout(() => hideAdminMessage(), 2500);
    } else {
        if (result.error && result.error.includes('Unauthorized')) {
            showAdminMessage('⚠️ Incorrect password. Please try again.', 'error');
            setTimeout(() => closeAdminPanel(), 2000);
        } else {
            showAdminMessage('❌ ' + (result.error || 'Failed to add project'), 'error');
        }
    }
});

// ============================================================
// CONTACT FORM HANDLER
// ============================================================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = this.querySelector('input[name="name"]').value.trim();
        const email = this.querySelector('input[name="email"]').value.trim();
        const message = this.querySelector('textarea[name="message"]').value.trim();

        if (!name || !email || !message) {
            alert('⚠️ Please fill in all fields.');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            alert('⚠️ Please enter a valid email address.');
            return;
        }

        const submitBtn = this.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL.replace('/projects', '')}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ ' + result.message);
                this.reset();
            } else {
                alert('❌ ' + (result.error || 'Failed to send message.'));
            }
        } catch (error) {
            alert('❌ Network error. Please try again later.');
            console.error('Contact form error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================================
// LOAD PROJECTS ON PAGE LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
});