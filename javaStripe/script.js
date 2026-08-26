// ============================================================
// API CONFIGURATION
// ============================================================
const API_URL = 'https://portfolio-api.programmerstayve.workers.dev/api/projects';
let currentPassword = '';
let editingProjectId = null;

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

const modalOverlay = document.getElementById('passwordModal');
const modalInput = document.getElementById('modalPasswordInput');
const modalSubmit = document.getElementById('modalSubmitBtn');
const modalCancel = document.getElementById('modalCancelBtn');
const modalAlert = document.getElementById('modalAlert');
const projectsTitle = document.getElementById('projectsTitle');

const adminModal = document.getElementById('adminModal');
const adminForm = document.getElementById('adminForm');
const adminCloseBtn = document.getElementById('adminCloseBtn');
const adminMessage = document.getElementById('adminMessage');
const adminSubmitBtn = document.getElementById('adminSubmitBtn');
const projectTitle = document.getElementById('projectTitle');
const projectDescription = document.getElementById('projectDescription');
const projectTech = document.getElementById('projectTech');
const projectLink = document.getElementById('projectLink');
const projectLiveDemo = document.getElementById('projectLiveDemo');
const projectImages = document.getElementById('projectImages');
const projectsGrid = document.querySelector('.projects-grid');

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...project, password }),
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function editProjectToAPI(id, project, password) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...project, password }),
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteProjectFromAPI(id, password) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// LOAD & RENDER PROJECTS
// ============================================================
async function loadProjects() {
    const projects = await fetchProjects();

    const cards = projectsGrid.querySelectorAll('.project-card');
    cards.forEach(card => card.remove());

    // Sort: live_demo first (1), then non-live (0)
    const sorted = [...projects].sort((a, b) => {
        if (a.live_demo === b.live_demo) return b.id - a.id;
        return b.live_demo - a.live_demo;
    });

    sorted.forEach(project => renderProject(project));
}

function renderProject(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = project.id;

    const techTags = project.tech.split(',').map(t => t.trim()).filter(t => t);
    const techHTML = techTags.map(t => `<span>${t}</span>`).join(' · ');

    const tag = project.live_demo === 1 ? '✅ Live Demo' : '🔒 No Demo';

    // Images button – only show if images exist
    const imagesList = project.images ? project.images.split(',').map(img => img.trim()).filter(img => img) : [];
    const hasImages = imagesList.length > 0;

    let imagesButtonHTML = '';
    if (hasImages) {
        imagesButtonHTML = `
            <button class="view-images-btn" data-id="${project.id}">
                <i class="fas fa-images"></i> View Screenshots
            </button>
        `;
    }

    card.innerHTML = `
        <div class="project-tag">${escapeHTML(tag)}</div>
        <h3>${escapeHTML(project.title)}</h3>
        <p>${escapeHTML(project.description)}</p>
        <div class="project-tech">${techHTML}</div>
        <div class="project-links">
            ${project.live_demo === 1 && project.link && project.link !== '#' ? 
                `<a href="${escapeHTML(project.link)}" target="_blank">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>` : 
                `<span style="color: var(--text-secondary); font-size:0.9rem;">No live demo available</span>`
            }
        </div>
        <div class="project-actions">
            ${imagesButtonHTML}
            <button class="edit-project" data-id="${project.id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-project" data-id="${project.id}">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        </div>
    `;

    projectsGrid.appendChild(card);

    // Add event listeners
    const deleteBtn = card.querySelector('.delete-project');
    deleteBtn.addEventListener('click', function() {
        const id = this.dataset.id;
        handleDeleteProject(id);
    });

    const editBtn = card.querySelector('.edit-project');
    editBtn.addEventListener('click', function() {
        const id = this.dataset.id;
        handleEditProject(id);
    });

    if (hasImages) {
        const imagesBtn = card.querySelector('.view-images-btn');
        imagesBtn.addEventListener('click', function() {
            const id = this.dataset.id;
            openImageGallery(id, imagesList);
        });
    }
}

// ============================================================
// IMAGE GALLERY (Slideshow Modal)
// ============================================================
let currentGalleryIndex = 0;
let currentGalleryImages = [];

function openImageGallery(id, images) {
    currentGalleryImages = images;
    currentGalleryIndex = 0;

    // Create modal if it doesn't exist
    let galleryModal = document.getElementById('galleryModal');
    if (!galleryModal) {
        galleryModal = document.createElement('div');
        galleryModal.id = 'galleryModal';
        galleryModal.className = 'modal-overlay';
        galleryModal.innerHTML = `
            <div class="modal-box gallery-box">
                <div class="gallery-container">
                    <button class="gallery-close">&times;</button>
                    <div class="gallery-slide">
                        <img id="galleryImage" src="" alt="Screenshot">
                    </div>
                    <div class="gallery-nav">
                        <button class="gallery-prev">❮</button>
                        <span id="galleryCounter">1 / 1</span>
                        <button class="gallery-next">❯</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(galleryModal);

        // Close button
        galleryModal.querySelector('.gallery-close').addEventListener('click', closeGallery);
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) closeGallery();
        });

        // Navigation
        galleryModal.querySelector('.gallery-prev').addEventListener('click', () => {
            currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateGalleryImage();
        });
        galleryModal.querySelector('.gallery-next').addEventListener('click', () => {
            currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
            updateGalleryImage();
        });
        document.addEventListener('keydown', (e) => {
            if (!galleryModal.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') {
                currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                updateGalleryImage();
            }
            if (e.key === 'ArrowRight') {
                currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
                updateGalleryImage();
            }
            if (e.key === 'Escape') closeGallery();
        });
    }

    galleryModal.classList.add('active');
    updateGalleryImage();
}

function updateGalleryImage() {
    const img = document.getElementById('galleryImage');
    const counter = document.getElementById('galleryCounter');
    if (img && currentGalleryImages.length > 0) {
        img.src = currentGalleryImages[currentGalleryIndex];
        img.alt = `Screenshot ${currentGalleryIndex + 1}`;
        if (counter) {
            counter.textContent = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
        }
    }
}

function closeGallery() {
    const modal = document.getElementById('galleryModal');
    if (modal) modal.classList.remove('active');
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
// HANDLE EDIT PROJECT
// ============================================================
async function handleEditProject(id) {
    // Fetch the project details
    const projects = await fetchProjects();
    const project = projects.find(p => p.id == id);
    if (!project) {
        alert('⚠️ Project not found.');
        return;
    }

    // Fill the admin form with project data
    editingProjectId = id;
    projectTitle.value = project.title || '';
    projectDescription.value = project.description || '';
    projectTech.value = project.tech || '';
    projectLink.value = project.link || '';
    projectLiveDemo.checked = project.live_demo === 1;
    projectImages.value = project.images || '';

    adminSubmitBtn.textContent = '✏️ Update Project';
    adminForm.querySelector('h3')?.remove();
    document.querySelector('.admin-box h3').textContent = '✏️ Edit Project';

    // Open the admin panel
    adminModal.classList.add('active');
    hideAdminMessage();
    document.body.classList.add('admin-mode');
}

// ============================================================
// HELPERS
// ============================================================
function escapeHTML(str) {
    if (!str) return '';
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
    editingProjectId = null;
    adminSubmitBtn.textContent = '➕ Add Project';
    document.querySelector('.admin-box h3').textContent = '📂 Add New Project';
    adminForm.reset();
    projectLiveDemo.checked = true;
    hideAdminMessage();
    adminModal.classList.add('active');
    document.body.classList.add('admin-mode');
}

function closeAdminPanel() {
    adminModal.classList.remove('active');
    hideAdminMessage();
    currentPassword = '';
    editingProjectId = null;
    adminSubmitBtn.textContent = '➕ Add Project';
    document.querySelector('.admin-box h3').textContent = '📂 Add New Project';
}

adminCloseBtn.addEventListener('click', closeAdminPanel);

adminModal.addEventListener('click', function(e) {
    if (e.target === adminModal) {
        closeAdminPanel();
    }
});

// ============================================================
// ADMIN FORM – Add/Edit Project
// ============================================================
adminForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = projectTitle.value.trim();
    const description = projectDescription.value.trim();
    const tech = projectTech.value.trim();
    const link = projectLink.value.trim() || '#';
    const live_demo = projectLiveDemo.checked ? 1 : 0;
    const images = projectImages.value.trim() || '';

    if (!title || !description || !tech) {
        showAdminMessage('⚠️ Title, Description, and Frameworks are required.', 'error');
        return;
    }

    if (link !== '#' && !link.startsWith('http')) {
        showAdminMessage('⚠️ Please enter a valid URL (e.g. https://example.com)', 'error');
        return;
    }

    if (!currentPassword) {
        showAdminMessage('⚠️ Password session expired. Please re-enter.', 'error');
        setTimeout(() => closeAdminPanel(), 1500);
        return;
    }

    showAdminMessage('⏳ Processing...', 'success');

    const projectData = { title, description, tech, link, live_demo, images };
    let result;

    if (editingProjectId) {
        result = await editProjectToAPI(editingProjectId, projectData, currentPassword);
    } else {
        result = await addProjectToAPI(projectData, currentPassword);
    }

    if (result.success) {
        showAdminMessage(`✅ ${editingProjectId ? 'Project updated' : 'Project added'} successfully!`, 'success');
        adminForm.reset();
        projectLiveDemo.checked = true;
        editingProjectId = null;
        adminSubmitBtn.textContent = '➕ Add Project';
        document.querySelector('.admin-box h3').textContent = '📂 Add New Project';
        await loadProjects();
        setTimeout(() => hideAdminMessage(), 2500);
        closeAdminPanel();
    } else {
        if (result.error && result.error.includes('Unauthorized')) {
            showAdminMessage('⚠️ Incorrect password. Please try again.', 'error');
            setTimeout(() => closeAdminPanel(), 2000);
        } else {
            showAdminMessage('❌ ' + (result.error || 'Failed to save project'), 'error');
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
                headers: { 'Content-Type': 'application/json' },
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

// ============================================================
// CONTACT FLOATING NOTIFICATION
// ============================================================
const notification = document.getElementById('contactNotification');
const closeBtn = document.getElementById('closeNotification');

// Check if user has closed it before
const isNotificationClosed = localStorage.getItem('contactNotificationClosed') === 'true';

if (isNotificationClosed) {
    notification.classList.add('hidden');
}

// Close notification and remember preference
closeBtn.addEventListener('click', () => {
    notification.classList.add('hidden');
    localStorage.setItem('contactNotificationClosed', 'true');
});

// Optional: Show notification when user scrolls to contact section
// (It's already visible by default, but if you want to auto-show it)
// Uncomment this if you want it to appear when reaching contact section

const contactSection = document.getElementById('contact');
const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !localStorage.getItem('contactNotificationClosed')) {
            notification.classList.remove('hidden');
        }
    });
}, { threshold: 0.2 });

if (contactSection) {
    observer2.observe(contactSection);
}
