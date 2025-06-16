// Story Reader JavaScript

let currentPage = 1;
let totalPages = 7;
let autoScrollInterval = null;
let currentFontSize = 16;
let currentTheme = 'dark';
let isBookmarked = false;

// Temporary settings (before apply)
let tempFontSize = 16;
let tempTheme = 'dark';

// Initialize story reader
document.addEventListener('DOMContentLoaded', function() {
    initializeStoryReader();
    loadUserPreferences();
    updateTotalPages();
    generatePageDots();
    updateProgress();
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
    
    // Click outside settings to close
    document.addEventListener('click', function(e) {
        const settings = document.getElementById('readerSettings');
        const settingsBtn = document.querySelector('.btn-settings');
        
        if (settings && !settings.contains(e.target) && !settingsBtn.contains(e.target)) {
            settings.classList.remove('active');
        }
    });
});

function initializeStoryReader() {
    // Check if user has bookmark for this story
    const storyId = getStoryId();
    const bookmarks = JSON.parse(localStorage.getItem('story-bookmarks')) || {};
    
    if (bookmarks[storyId]) {
        isBookmarked = true;
        document.getElementById('bookmarkBtn').classList.add('bookmarked');
        
        // Offer to resume from bookmark
        if (bookmarks[storyId].page > 1) {
            if (confirm(`You have a bookmark on page ${bookmarks[storyId].page}. Would you like to continue from there?`)) {
                currentPage = bookmarks[storyId].page;
            }
        }
    }
}

// Get story ID from URL or title
function getStoryId() {
    return window.location.pathname.split('/').pop().replace('.html', '') || 'dragons-ember';
}

// Start Reading
function startReading() {
    document.getElementById('bookCover').style.display = 'none';
    document.getElementById('bookContainer').style.display = 'block';
    
    showPage(currentPage);
    updateProgress();
    
    // Track reading start
    if (typeof userManager !== 'undefined') {
        userManager.trackUserActivity('story_reading_started', { 
            storyId: getStoryId(),
            page: currentPage 
        });
    }
}

// Page Navigation
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        showPage(currentPage);
        updateProgress();
        saveProgress();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        showPage(currentPage);
        updateProgress();
        saveProgress();
    }
}

function goToPage(pageNum) {
    if (pageNum >= 1 && pageNum <= totalPages) {
        currentPage = pageNum;
        showPage(currentPage);
        updateProgress();
        saveProgress();
        closeTOC();
    }
}

function showPage(pageNum) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show current page
    const currentPageElement = document.querySelector(`.page[data-page="${pageNum}"]`);
    if (currentPageElement) {
        currentPageElement.classList.add('active');
    }
    
    // Update page indicator
    document.getElementById('currentPage').textContent = pageNum;
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = pageNum === 1;
    document.getElementById('nextBtn').disabled = pageNum === totalPages;
    
    // Update page dots
    updatePageDots();
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Page Dots
function generatePageDots() {
    const dotsContainer = document.getElementById('pageDots');
    dotsContainer.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = 'page-dot';
        dot.addEventListener('click', () => goToPage(i));
        
        if (i === currentPage) {
            dot.classList.add('active');
        }
        
        dotsContainer.appendChild(dot);
    }
}

function updatePageDots() {
    document.querySelectorAll('.page-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === currentPage);
    });
}

// Progress Tracking
function updateProgress() {
    const progress = (currentPage / totalPages) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${Math.round(progress)}% completed`;
}

function updateTotalPages() {
    const pages = document.querySelectorAll('.page').length;
    totalPages = pages;
    document.getElementById('totalPages').textContent = totalPages;
}

// Reader Settings
function toggleReaderSettings() {
    const settings = document.getElementById('readerSettings');
    settings.classList.toggle('active');
}

function changeFontSize(change) {
    tempFontSize += change;
    tempFontSize = Math.max(12, Math.min(24, tempFontSize));
    
    document.getElementById('fontSize').textContent = `${tempFontSize}px`;
    
    // Preview font size change (temporary)
    document.querySelectorAll('.page-content').forEach(content => {
        content.style.fontSize = `${tempFontSize}px`;
    });
    
    document.querySelectorAll('.page-content p').forEach(p => {
        p.style.fontSize = `${tempFontSize}px`;
    });
    
    document.querySelectorAll('.page-content h2').forEach(h2 => {
        h2.style.fontSize = `${tempFontSize * 1.5}px`;
    });
}

function changeTheme(theme) {
    const reader = document.querySelector('.story-reader');
    
    // Remove existing theme classes
    reader.classList.remove('light', 'dark', 'sepia');
    
    // Add new theme (preview)
    if (theme !== 'dark') {
        reader.classList.add(theme);
    }
    
    tempTheme = theme;
    
    // Update theme button states
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.theme-btn.${theme}`).classList.add('active');
}

function toggleAutoScroll() {
    const btn = document.getElementById('autoScrollBtn');
    
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
        btn.textContent = '📖 Off';
        btn.classList.remove('active');
        
        // Remove scroll indicator
        const indicator = document.querySelector('.auto-scroll-indicator');
        if (indicator) indicator.remove();
    } else {
        autoScrollInterval = setInterval(() => {
            if (currentPage < totalPages) {
                nextPage();
            } else {
                toggleAutoScroll(); // Stop when reaching end
            }
        }, 15000); // 15 seconds per page
        
        btn.textContent = '⚡ On';
        btn.classList.add('active');
        
        // Add scroll indicator
        const indicator = document.createElement('div');
        indicator.className = 'auto-scroll-indicator';
        indicator.textContent = '📖';
        indicator.title = 'Auto-scroll is active';
        document.body.appendChild(indicator);
    }
}

// Bookmark Management
function toggleBookmark() {
    const btn = document.getElementById('bookmarkBtn');
    const storyId = getStoryId();
    let bookmarks = JSON.parse(localStorage.getItem('story-bookmarks')) || {};
    
    if (isBookmarked) {
        // Remove bookmark
        delete bookmarks[storyId];
        isBookmarked = false;
        btn.classList.remove('bookmarked');
        showCartNotification('Bookmark removed', 'info');
    } else {
        // Add bookmark
        bookmarks[storyId] = {
            page: currentPage,
            timestamp: new Date().toISOString(),
            storyTitle: document.querySelector('.cover-info h1').textContent
        };
        isBookmarked = true;
        btn.classList.add('bookmarked');
        showCartNotification('Bookmark saved!', 'success');
    }
    
    localStorage.setItem('story-bookmarks', JSON.stringify(bookmarks));
}

// Save Reading Progress
function saveProgress() {
    const storyId = getStoryId();
    let progress = JSON.parse(localStorage.getItem('story-progress')) || {};
    
    progress[storyId] = {
        page: currentPage,
        lastRead: new Date().toISOString(),
        completed: currentPage === totalPages
    };
    
    localStorage.setItem('story-progress', JSON.stringify(progress));
    
    // Update bookmark if exists
    if (isBookmarked) {
        let bookmarks = JSON.parse(localStorage.getItem('story-bookmarks')) || {};
        if (bookmarks[storyId]) {
            bookmarks[storyId].page = currentPage;
            localStorage.setItem('story-bookmarks', JSON.stringify(bookmarks));
        }
    }
}

// User Preferences
function saveUserPreferences() {
    const preferences = {
        fontSize: currentFontSize,
        theme: currentTheme
    };
    
    localStorage.setItem('story-reader-preferences', JSON.stringify(preferences));
}

function loadUserPreferences() {
    const preferences = JSON.parse(localStorage.getItem('story-reader-preferences'));
    
    if (preferences) {
        if (preferences.fontSize) {
            currentFontSize = preferences.fontSize;
            tempFontSize = currentFontSize;
            
            const fontSizeElement = document.getElementById('fontSize');
            if (fontSizeElement) {
                fontSizeElement.textContent = `${currentFontSize}px`;
            }
            
            // Apply saved font size
            document.querySelectorAll('.page-content').forEach(content => {
                content.style.fontSize = `${currentFontSize}px`;
            });
            
            document.querySelectorAll('.page-content p').forEach(p => {
                p.style.fontSize = `${currentFontSize}px`;
            });
            
            document.querySelectorAll('.page-content h2').forEach(h2 => {
                h2.style.fontSize = `${currentFontSize * 1.5}px`;
            });
        }
        
        if (preferences.theme) {
            currentTheme = preferences.theme;
            tempTheme = currentTheme;
            
            const reader = document.querySelector('.story-reader');
            reader.classList.remove('light', 'dark', 'sepia');
            if (currentTheme !== 'dark') {
                reader.classList.add(currentTheme);
            }
            
            // Update theme button states
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.querySelector(`.theme-btn.${currentTheme}`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
    }
}

// Keyboard Navigation
function handleKeyboard(e) {
    // Only handle if not in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            previousPage();
            break;
            
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            nextPage();
            break;
            
        case 'Home':
            e.preventDefault();
            goToPage(1);
            break;
            
        case 'End':
            e.preventDefault();
            goToPage(totalPages);
            break;
            
        case 'Escape':
            const settings = document.getElementById('readerSettings');
            if (settings.classList.contains('active')) {
                settings.classList.remove('active');
            }
            break;
    }
}

// Table of Contents
function showTOC() {
    document.getElementById('tocModal').style.display = 'flex';
}

function closeTOC() {
    document.getElementById('tocModal').style.display = 'none';
}

// Story Complete
function showStoryComplete() {
    const storyId = getStoryId();
    
    // Mark as completed
    let progress = JSON.parse(localStorage.getItem('story-progress')) || {};
    progress[storyId] = {
        page: totalPages,
        lastRead: new Date().toISOString(),
        completed: true
    };
    localStorage.setItem('story-progress', JSON.stringify(progress));
    
    // Track completion
    if (typeof userManager !== 'undefined') {
        userManager.trackUserActivity('story_completed', { 
            storyId: getStoryId(),
            totalPages: totalPages 
        });
    }
    
    // Show completion modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🎉 Story Complete!</h2>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 2rem;">
                    <h3>Congratulations!</h3>
                    <p>You've completed "The Dragon's Ember"</p>
                    <div style="margin: 2rem 0;">
                        <button class="btn-primary" onclick="shareStory()" style="margin: 0.5rem;">Share Story</button>
                        <button class="btn-secondary" onclick="viewMoreStories()" style="margin: 0.5rem;">More Stories</button>
                    </div>
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 30000);
}

// Share Story
function shareStory() {
    if (navigator.share) {
        navigator.share({
            title: "The Dragon's Ember - Colp Town Stories",
            text: "I just read this amazing fantasy story! Check it out:",
            url: window.location.href
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showCartNotification('Story link copied to clipboard!', 'success');
        });
    }
}

// View More Stories
function viewMoreStories() {
    window.location.href = 'stories.html';
}

// Reading Statistics
function getReadingStats() {
    const progress = JSON.parse(localStorage.getItem('story-progress')) || {};
    const bookmarks = JSON.parse(localStorage.getItem('story-bookmarks')) || {};
    
    return {
        storiesRead: Object.keys(progress).length,
        storiesCompleted: Object.values(progress).filter(p => p.completed).length,
        bookmarksCount: Object.keys(bookmarks).length,
        lastRead: Math.max(...Object.values(progress).map(p => new Date(p.lastRead).getTime()))
    };
}

// Export reading data
function exportReadingData() {
    const data = {
        progress: JSON.parse(localStorage.getItem('story-progress')) || {},
        bookmarks: JSON.parse(localStorage.getItem('story-bookmarks')) || {},
        preferences: JSON.parse(localStorage.getItem('story-reader-preferences')) || {},
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `colp-stories-reading-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Apply settings function
function applySettings() {
    // Save temporary settings as current settings
    currentFontSize = tempFontSize;
    currentTheme = tempTheme;
    
    // Save to localStorage
    saveUserPreferences();
    
    if (typeof showCartNotification !== 'undefined') {
        showCartNotification('Settings saved successfully!', 'success');
    }
    
    // Close settings panel
    const settings = document.getElementById('readerSettings');
    if (settings) {
        settings.classList.remove('active');
    }
}

// Close settings function
function closeSettings() {
    // Revert to original settings (cancel changes)
    revertToCurrentSettings();
    
    const settings = document.getElementById('readerSettings');
    if (settings) {
        settings.classList.remove('active');
    }
}

// Revert to current settings (cancel preview)
function revertToCurrentSettings() {
    // Reset temp values
    tempFontSize = currentFontSize;
    tempTheme = currentTheme;
    
    // Apply current font size
    document.getElementById('fontSize').textContent = `${currentFontSize}px`;
    document.querySelectorAll('.page-content').forEach(content => {
        content.style.fontSize = `${currentFontSize}px`;
    });
    document.querySelectorAll('.page-content p').forEach(p => {
        p.style.fontSize = `${currentFontSize}px`;
    });
    document.querySelectorAll('.page-content h2').forEach(h2 => {
        h2.style.fontSize = `${currentFontSize * 1.5}px`;
    });
    
    // Apply current theme
    const reader = document.querySelector('.story-reader');
    reader.classList.remove('light', 'dark', 'sepia');
    if (currentTheme !== 'dark') {
        reader.classList.add(currentTheme);
    }
    
    // Update theme button states
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.theme-btn.${currentTheme}`).classList.add('active');
}