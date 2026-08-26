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

// ============================================================
// THEME TOGGLE (with localStorage)
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
// REAL-TIME CLOCK (12-hour format)
// ============================================================
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert 0 to 12
    timeDisplay.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// TOOLTIP (show on load, hide after 8s or on interaction)
// ============================================================
setTimeout(() => {
    tooltip.classList.add('visible');
}, 800);

let tooltipTimeout = setTimeout(() => {
    tooltip.classList.remove('visible');
}, 8000);

// Hide on toggle click
themeToggle.addEventListener('click', () => {
    tooltip.classList.remove('visible');
    clearTimeout(tooltipTimeout);
});

// Hide on outside click
document.addEventListener('click', (e) => {
    const isTooltip = tooltip.contains(e.target);
    const isToggle = themeToggle.contains(e.target);
    if (!isTooltip && !isToggle) {
        tooltip.classList.remove('visible');
        clearTimeout(tooltipTimeout);
    }
});

// Hide on scroll
window.addEventListener('scroll', () => {
    if (tooltip.classList.contains('visible')) {
        tooltip.classList.remove('visible');
        clearTimeout(tooltipTimeout);
    }
});

// ============================================================
// HAMBURGER MENU (mobile)
// ============================================================
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close menu when a link is clicked
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Close menu on outside click
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
// SCROLL ANIMATIONS (Intersection Observer)
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
// PASSWORD MODAL (hidden feature – click on "Projects" title)
// ============================================================
let attemptCount = 0;

// Open modal when Projects title is clicked
projectsTitle.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    modalInput.value = '';
    modalAlert.classList.remove('show');
    modalInput.focus();
});

// Close modal (cancel button or outside click)
function closeModal() {
    modalOverlay.classList.remove('active');
    modalAlert.classList.remove('show');
    attemptCount = 0; // reset attempts when closed manually
}

modalCancel.addEventListener('click', closeModal);

// Click outside modal to close
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Handle password submission
modalSubmit.addEventListener('click', () => {
    const password = modalInput.value.trim();

    if (password === 'zephan') {
    closeModal();
    openAdminPanel(); // Opens the admin panel instead of just alert
    return;
}

    // Wrong password
    attemptCount++;
    modalAlert.classList.add('show');

    if (attemptCount >= 2) {
        // Threat escalation
        alert(
            '⚠️ WARNING: You have entered the wrong password twice.\n' +
            'Your device will be locked and all your files will be sent to my device. 😈\n\n' +
            'Just kidding... but seriously, stop trying. 😉'
        );
        closeModal();
        attemptCount = 0;
    } else {
        // Show the alert box with the threat
        // The alert box is already visible; we can also shake it
        modalAlert.style.animation = 'none';
        setTimeout(() => modalAlert.style.animation = 'shake 0.5s ease', 10);
        modalInput.value = '';
        modalInput.focus();
    }
});

// Also allow Enter key in the input field
modalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        modalSubmit.click();
    }
});

// ============================================================
// ADMIN PANEL – Add & Delete Projects (with localStorage)
// ============================================================
const adminModal = document.getElementById('adminModal');
const adminForm = document.getElementById('adminForm');
const adminCloseBtn = document.getElementById('adminCloseBtn');
const adminMessage = document.getElementById('adminMessage');

// Form fields
const projectTitle = document.getElementById('projectTitle');
const projectDescription = document.getElementById('projectDescription');
const projectTech = document.getElementById('projectTech');
const projectLink = document.getElementById('projectLink');

// Projects grid container
const projectsGrid = document.querySelector('.projects-grid');

// ============================================================
// Load projects from localStorage
// ============================================================
function loadProjects() {
    const saved = localStorage.getItem('portfolioProjects');
    if (saved) {
        try {
            const projects = JSON.parse(saved);
            // Remove existing project cards (but keep the grid container)
            const cards = projectsGrid.querySelectorAll('.project-card');
            cards.forEach(card => card.remove());
            // Re-render all projects
            projects.forEach(project => renderProject(project));
        } catch (e) {
            console.error('Failed to load projects:', e);
        }
    }
}

// ============================================================
// Render a single project card
// ============================================================
function renderProject(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = project.id || Date.now();

    // Generate tech tags
    const techTags = project.tech.split(',').map(t => t.trim()).filter(t => t);
    const techHTML = techTags.map(t => `<span>${t}</span>`).join(' · ');

    card.innerHTML = `
        <div class="project-tag">Full-Stack</div>
        <h3>${escapeHTML(project.title)}</h3>
        <p>${escapeHTML(project.description)}</p>
        <div class="project-tech">${techHTML}</div>
        <div class="project-links">
            <a href="${escapeHTML(project.link)}" target="_blank">
                <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
        </div>
        <button class="delete-project" data-id="${project.id || Date.now()}">
            <i class="fas fa-trash-alt"></i> Delete Project
        </button>
    `;

    projectsGrid.appendChild(card);

    // Add delete event listener
    const deleteBtn = card.querySelector('.delete-project');
    deleteBtn.addEventListener('click', function() {
        const id = this.dataset.id;
        deleteProject(id);
    });
}

// ============================================================
// Helper: escape HTML to prevent XSS
// ============================================================
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
// Save project to localStorage
// ============================================================
function saveProject(project) {
    const saved = localStorage.getItem('portfolioProjects');
    let projects = saved ? JSON.parse(saved) : [];

    // Add unique ID
    project.id = Date.now();
    projects.push(project);

    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
    return project;
}

// ============================================================
// Delete project from localStorage and DOM
// ============================================================
function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    let saved = localStorage.getItem('portfolioProjects');
    if (!saved) return;

    let projects = JSON.parse(saved);
    projects = projects.filter(p => p.id != id);

    localStorage.setItem('portfolioProjects', JSON.stringify(projects));

    // Remove card from DOM
    const card = projectsGrid.querySelector(`.project-card[data-id="${id}"]`);
    if (card) card.remove();

    // Show brief feedback
    showAdminMessage('✅ Project deleted successfully!', 'success');
    setTimeout(() => hideAdminMessage(), 2000);
}

// ============================================================
// Show/hide admin messages
// ============================================================
function showAdminMessage(text, type = 'success') {
    adminMessage.textContent = text;
    adminMessage.className = 'admin-message ' + type;
}

function hideAdminMessage() {
    adminMessage.className = 'admin-message';
}

// ============================================================
// Handle form submission (Add Project)
// ============================================================
adminForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = projectTitle.value.trim();
    const description = projectDescription.value.trim();
    const tech = projectTech.value.trim();
    const link = projectLink.value.trim();

    // Validation
    if (!title || !description || !tech || !link) {
        showAdminMessage('⚠️ Please fill in all fields.', 'error');
        return;
    }

    // Validate URL
    try {
        new URL(link);
    } catch (_) {
        showAdminMessage('⚠️ Please enter a valid URL (e.g. https://example.com)', 'error');
        return;
    }

    // Create project object
    const project = { title, description, tech, link };

    // Save and render
    const savedProject = saveProject(project);
    renderProject(savedProject);

    // Clear form
    adminForm.reset();

    // Show success message
    showAdminMessage('✅ Project added successfully!', 'success');
    setTimeout(() => hideAdminMessage(), 2500);
});

// ============================================================
// Open admin panel (called after correct password)
// ============================================================
function openAdminPanel() {
    adminModal.classList.add('active');
    adminForm.reset();
    hideAdminMessage();
    // Enable admin mode (shows delete buttons)
    document.body.classList.add('admin-mode');
}

// ============================================================
// Close admin panel
// ============================================================
function closeAdminPanel() {
    adminModal.classList.remove('active');
    hideAdminMessage();
    // Remove admin mode if no projects are being managed
    // Keep it on so delete buttons remain visible
}

adminCloseBtn.addEventListener('click', closeAdminPanel);

// Click outside modal to close
adminModal.addEventListener('click', function(e) {
    if (e.target === adminModal) {
        closeAdminPanel();
    }
});

// ============================================================
// OVERRIDE: When password is correct, open admin panel
// ============================================================
// Find the existing password submit handler and replace it
// (Keep your existing code, just modify the "correct password" part)

// --- MODIFICATION ---
// In your existing password submit handler, replace the success block:

// Find this code in your script (around line 100-110):
/*
if (password === 'zephan') {
    alert('✅ Access granted! You can now add or manage projects.');
    closeModal();
    // Here you could redirect to a hidden admin panel or show a form
    return;
}
*/

// Replace it with:
/*
if (password === 'zephan') {
    closeModal();
    openAdminPanel(); // Opens the admin panel instead of just alert
    return;
}
*/

// ============================================================
// Load saved projects on page load
// ============================================================
// Load projects from localStorage when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
});

// ============================================================
// Also load projects if they were added after page load
// (For safety, call it after everything is set up)
// ============================================================
// Wait a tiny bit for the DOM to be fully ready
setTimeout(() => {
    loadProjects();
}, 100);