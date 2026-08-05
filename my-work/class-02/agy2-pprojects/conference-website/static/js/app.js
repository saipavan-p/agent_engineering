/**
 * Google Cloud Technical Summit 2026 - Client Application Script
 * Implements real-time search, category & speaker filters, view toggle, and detail modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let allScheduleItems = [];
    let bookmarks = JSON.parse(localStorage.getItem('gcloud_summit_bookmarks') || '[]');
    let currentCategory = '';
    let currentSpeaker = '';
    let currentSearchQuery = '';
    let currentView = 'timeline'; // 'timeline' or 'grid'

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const speakerFilter = document.getElementById('speaker-filter');
    const categoryPillsContainer = document.getElementById('category-pills');
    const scheduleContainer = document.getElementById('schedule-container');
    const noResultsCard = document.getElementById('no-results');
    const resultsNum = document.getElementById('results-num');
    const activeFilterTag = document.getElementById('active-filter-tag');
    const resetAllFiltersBtn = document.getElementById('reset-all-filters');
    const clearSearchEmptyBtn = document.getElementById('clear-search-empty-btn');
    const viewTimelineBtn = document.getElementById('view-timeline-btn');
    const viewGridBtn = document.getElementById('view-grid-btn');
    const clockElement = document.getElementById('current-time');

    // Modal DOM Elements
    const modalBackdrop = document.getElementById('talk-modal');
    const modalContentBody = document.getElementById('modal-content-body');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Initialize Application
    initClock();
    fetchScheduleData();
    setupEventListeners();
    updateBookmarkUI();

    /**
     * Live Clock in Header
     */
    function initClock() {
        function updateTime() {
            const now = new Date();
            if (clockElement) {
                clockElement.textContent = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
            }
        }
        updateTime();
        setInterval(updateTime, 1000);
    }

    /**
     * Fetch schedule dataset from backend API
     */
    async function fetchScheduleData() {
        try {
            const response = await fetch('/api/talks?include_breaks=true');
            const data = await response.json();
            if (data.status === 'success') {
                allScheduleItems = data.data;
            }
        } catch (err) {
            console.error('Error loading schedule from API:', err);
        }
    }

    /**
     * Attach Event Listeners
     */
    function setupEventListeners() {
        // Search Input Event
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchQuery = e.target.value.trim().toLowerCase();
                toggleElement(clearSearchBtn, currentSearchQuery.length > 0);
                filterSchedule();
            });
        }

        // Clear Search Button
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearchQuery = '';
                toggleElement(clearSearchBtn, false);
                filterSchedule();
            });
        }

        // Speaker Select Filter
        if (speakerFilter) {
            speakerFilter.addEventListener('change', (e) => {
                currentSpeaker = e.target.value;
                filterSchedule();
            });
        }

        // Category Pills Event Delegation
        if (categoryPillsContainer) {
            categoryPillsContainer.addEventListener('click', (e) => {
                const pill = e.target.closest('.category-pill');
                if (!pill) return;

                document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                currentCategory = pill.dataset.category || '';
                filterSchedule();
            });
        }

        // Reset Filters Button
        if (resetAllFiltersBtn) {
            resetAllFiltersBtn.addEventListener('click', resetFilters);
        }

        if (clearSearchEmptyBtn) {
            clearSearchEmptyBtn.addEventListener('click', resetFilters);
        }

        // View Toggle Switcher
        if (viewTimelineBtn && viewGridBtn) {
            viewTimelineBtn.addEventListener('click', () => setViewMode('timeline'));
            viewGridBtn.addEventListener('click', () => setViewMode('grid'));
        }

        // Bookmark Toggle & Details Modal Event Delegation on Schedule Container
        if (scheduleContainer) {
            scheduleContainer.addEventListener('click', (e) => {
                const bookmarkBtn = e.target.closest('.bookmark-btn');
                if (bookmarkBtn) {
                    const talkId = bookmarkBtn.dataset.talkId;
                    toggleBookmark(talkId, bookmarkBtn);
                    return;
                }

                const detailsBtn = e.target.closest('.view-details-btn');
                if (detailsBtn) {
                    const talkId = detailsBtn.dataset.talkId;
                    openTalkModal(talkId);
                }
            });
        }

        // Modal Close Events
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalBackdrop && !modalBackdrop.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    /**
     * Filter Schedule items based on active criteria
     */
    function filterSchedule() {
        const cards = scheduleContainer.querySelectorAll('.schedule-card');
        let visibleCount = 0;
        let activeFilterNames = [];

        if (currentCategory) activeFilterNames.push(`Category: ${currentCategory}`);
        if (currentSpeaker) {
            const selectedOpt = speakerFilter.options[speakerFilter.selectedIndex];
            activeFilterNames.push(`Speaker: ${selectedOpt ? selectedOpt.text.split('(')[0] : currentSpeaker}`);
        }
        if (currentSearchQuery) activeFilterNames.push(`Keyword: "${currentSearchQuery}"`);

        cards.forEach(card => {
            const talkId = card.dataset.id;
            const itemType = card.dataset.type;
            const item = allScheduleItems.find(i => i.id === talkId);

            if (!item) return;

            // Lunch break logic
            if (itemType === 'break') {
                const isSearching = currentCategory || currentSpeaker || currentSearchQuery;
                if (isSearching) {
                    card.classList.add('hidden');
                } else {
                    card.classList.remove('hidden');
                    visibleCount++;
                }
                return;
            }

            // Category match
            let matchesCategory = true;
            if (currentCategory && (!item.categories || !item.categories.includes(currentCategory))) {
                matchesCategory = false;
            }

            // Speaker match
            let matchesSpeaker = true;
            if (currentSpeaker) {
                matchesSpeaker = item.speakers && item.speakers.some(s => s.id === currentSpeaker);
            }

            // Search Query match
            let matchesQuery = true;
            if (currentSearchQuery) {
                const titleMatch = item.title && item.title.toLowerCase().includes(currentSearchQuery);
                const descMatch = item.description && item.description.toLowerCase().includes(currentSearchQuery);
                const speakerMatch = item.speakers && item.speakers.some(s => 
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes(currentSearchQuery) ||
                    (s.company && s.company.toLowerCase().includes(currentSearchQuery)) ||
                    (s.role && s.role.toLowerCase().includes(currentSearchQuery))
                );
                const categoryMatch = item.categories && item.categories.some(c => c.toLowerCase().includes(currentSearchQuery));
                
                matchesQuery = titleMatch || descMatch || speakerMatch || categoryMatch;
            }

            const shouldShow = matchesCategory && matchesSpeaker && matchesQuery;
            toggleElement(card, shouldShow);
            if (shouldShow) visibleCount++;
        });

        // Update Results Summary
        if (resultsNum) resultsNum.textContent = visibleCount;

        if (activeFilterTag) {
            if (activeFilterNames.length > 0) {
                activeFilterTag.textContent = activeFilterNames.join(' | ');
                activeFilterTag.classList.remove('hidden');
                resetAllFiltersBtn.classList.remove('hidden');
            } else {
                activeFilterTag.classList.add('hidden');
                resetAllFiltersBtn.classList.add('hidden');
            }
        }

        // Show/Hide No Results State
        toggleElement(noResultsCard, visibleCount === 0);
    }

    /**
     * Reset all active filters
     */
    function resetFilters() {
        currentSearchQuery = '';
        currentCategory = '';
        currentSpeaker = '';

        if (searchInput) searchInput.value = '';
        if (speakerFilter) speakerFilter.value = '';
        toggleElement(clearSearchBtn, false);

        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.category === '');
        });

        filterSchedule();
    }

    /**
     * Switch view between Timeline and Grid mode
     */
    function setViewMode(mode) {
        currentView = mode;
        if (mode === 'grid') {
            scheduleContainer.className = 'schedule-grid';
            viewGridBtn.classList.add('active');
            viewTimelineBtn.classList.remove('active');
        } else {
            scheduleContainer.className = 'schedule-timeline';
            viewTimelineBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
        }
    }

    /**
     * Toggle Talk Bookmark
     */
    function toggleBookmark(talkId, btn) {
        const index = bookmarks.indexOf(talkId);
        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(talkId);
        }
        localStorage.setItem('gcloud_summit_bookmarks', JSON.stringify(bookmarks));
        updateBookmarkUI();
    }

    /**
     * Update Bookmark Icon State across cards
     */
    function updateBookmarkUI() {
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const talkId = btn.dataset.talkId;
            const isBookmarked = bookmarks.includes(talkId);
            btn.classList.toggle('active', isBookmarked);
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isBookmarked ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
            }
        });
    }

    /**
     * Open Modal with Talk Details
     */
    async function openTalkModal(talkId) {
        let talk = allScheduleItems.find(i => i.id === talkId);
        if (!talk) {
            try {
                const res = await fetch(`/api/talks/${talkId}`);
                const data = await res.json();
                if (data.status === 'success') talk = data.data;
            } catch (e) {
                console.error('Failed to load talk detail:', e);
            }
        }

        if (!talk) return;

        const isBookmarked = bookmarks.includes(talk.id);
        const categoriesHtml = (talk.categories || [])
            .map(c => `<span class="category-badge">${c}</span>`)
            .join(' ');

        const speakersHtml = (talk.speakers || []).map(s => `
            <div class="modal-speaker-card">
                <img src="${s.avatar}" alt="${s.firstName} ${s.lastName}" class="modal-speaker-avatar">
                <div style="flex:1">
                    <h4 style="font-size:1.05rem; font-weight:700; color:#fff">${s.firstName} ${s.lastName}</h4>
                    <p style="font-size:0.85rem; color:#94a3b8">${s.role} at <strong style="color:#60a5fa">${s.company}</strong></p>
                </div>
                <a href="${s.linkedin}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                    <i class="fa-brands fa-linkedin"></i> LinkedIn
                </a>
            </div>
        `).join('');

        modalContentBody.innerHTML = `
            <div class="modal-header">
                <div class="modal-time-slot">
                    <i class="fa-regular fa-clock"></i> ${talk.time} (${talk.durationMinutes} Minutes)
                </div>
                <div style="margin-bottom: 0.75rem">${categoriesHtml}</div>
                <h2 class="modal-title">${talk.title}</h2>
            </div>
            
            <div style="margin-bottom: 1.5rem">
                <h4 style="font-size:0.825rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem">Session Overview</h4>
                <p style="font-size:0.975rem; color:#cbd5e1; line-height:1.7">${talk.description}</p>
            </div>

            <div style="margin-bottom: 1.5rem">
                <h4 style="font-size:0.825rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem">
                    Featured Speakers (${(talk.speakers || []).length}/2 max)
                </h4>
                ${speakersHtml}
            </div>

            <div style="display:flex; justify-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:1.25rem">
                <button class="btn btn-outline btn-sm modal-bookmark-toggle" data-talk-id="${talk.id}">
                    <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i> 
                    ${isBookmarked ? 'Bookmarked' : 'Add to My Schedule'}
                </button>
                <button class="btn btn-primary btn-sm" onclick="document.getElementById('talk-modal').classList.add('hidden')">
                    Done
                </button>
            </div>
        `;

        // Attach modal bookmark toggle
        const modalBookmarkBtn = modalContentBody.querySelector('.modal-bookmark-toggle');
        if (modalBookmarkBtn) {
            modalBookmarkBtn.addEventListener('click', () => {
                toggleBookmark(talk.id, modalBookmarkBtn);
                const activeNow = bookmarks.includes(talk.id);
                modalBookmarkBtn.querySelector('i').className = activeNow ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                modalBookmarkBtn.childNodes[2].textContent = activeNow ? ' Bookmarked' : ' Add to My Schedule';
            });
        }

        modalBackdrop.classList.remove('hidden');
        modalBackdrop.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close Modal
     */
    function closeModal() {
        if (modalBackdrop) {
            modalBackdrop.classList.add('hidden');
            modalBackdrop.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Utility function to show/hide element
     */
    function toggleElement(el, show) {
        if (!el) return;
        if (show) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }
});
