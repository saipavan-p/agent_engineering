/**
 * CloudNext Horizon 2026 - Main Interactive Controller
 * Handles real-time search, multi-filter logic, modal views, and session bookmarking.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Data & DOM Element References
    // ----------------------------------------------------
    let talksData = [];
    const dataBridgeEl = document.getElementById('conference-data');
    if (dataBridgeEl) {
        try {
            talksData = JSON.parse(dataBridgeEl.textContent);
        } catch (e) {
            console.error('Failed to parse conference data bridge:', e);
        }
    }

    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const categoryPills = document.querySelectorAll('.category-pill');
    const speakerSelect = document.getElementById('speaker-select');
    const visibleCountEl = document.getElementById('visible-count');
    const btnResetFilters = document.getElementById('btn-reset-filters');
    const btnResetEmptyView = document.getElementById('btn-reset-empty-view');
    const noResultsMsg = document.getElementById('no-results-message');
    const talkCards = document.querySelectorAll('.talk-card');
    const timelineTalkItems = document.querySelectorAll('.timeline-item-talk');

    // Modal elements
    const talkModal = document.getElementById('talk-modal');
    const modalCloseBtn = document.getElementById('btn-close-modal');
    const modalCloseFooterBtn = document.getElementById('btn-modal-close-footer');
    const modalTitle = document.getElementById('modal-talk-title');
    const modalTime = document.getElementById('modal-time');
    const modalRoom = document.getElementById('modal-room');
    const modalDescription = document.getElementById('modal-description');
    const modalCategories = document.getElementById('modal-categories');
    const modalSpeakersList = document.getElementById('modal-speakers-list');
    const modalPermalink = document.getElementById('modal-permalink');

    // Current filter state
    const state = {
        query: (searchInput ? searchInput.value : '').trim().toLowerCase(),
        category: 'all',
        speaker: (speakerSelect ? speakerSelect.value : '').trim().toLowerCase(),
        favorites: JSON.parse(localStorage.getItem('cloudnext_favs') || '[]')
    };

    // ----------------------------------------------------
    // 2. Filter & Search Engine
    // ----------------------------------------------------
    function applyFilters() {
        let visibleCount = 0;
        const hasActiveFilters = state.query !== '' || state.category !== 'all' || state.speaker !== '';

        if (clearSearchBtn) {
            clearSearchBtn.style.display = state.query ? 'block' : 'none';
        }

        if (btnResetFilters) {
            btnResetFilters.style.display = hasActiveFilters ? 'inline-flex' : 'none';
        }

        talkCards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const categories = (card.getAttribute('data-categories') || '').split(',');
            const speakers = (card.getAttribute('data-speakers') || '').toLowerCase();
            const description = card.getAttribute('data-description') || '';
            const talkId = card.getAttribute('data-id') || '';

            // Query check (matches title, description, categories, speakers)
            let matchesQuery = true;
            if (state.query) {
                const combinedText = `${title} ${description} ${speakers} ${categories.join(' ')}`.toLowerCase();
                matchesQuery = combinedText.includes(state.query);
            }

            // Category check
            let matchesCategory = true;
            if (state.category !== 'all') {
                matchesCategory = categories.some(cat => cat.trim().toLowerCase() === state.category.toLowerCase());
            }

            // Speaker check
            let matchesSpeaker = true;
            if (state.speaker) {
                matchesSpeaker = speakers.includes(state.speaker.toLowerCase());
            }

            const isVisible = matchesQuery && matchesCategory && matchesSpeaker;
            card.style.display = isVisible ? 'flex' : 'none';

            if (isVisible) {
                visibleCount++;
            }
        });

        // Update count indicator
        if (visibleCountEl) {
            visibleCountEl.textContent = visibleCount;
        }

        // Show/hide empty state message
        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    function resetAllFilters() {
        state.query = '';
        state.category = 'all';
        state.speaker = '';

        if (searchInput) searchInput.value = '';
        if (speakerSelect) speakerSelect.value = '';

        categoryPills.forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-category') === 'all');
            pill.setAttribute('aria-selected', pill.getAttribute('data-category') === 'all');
        });

        applyFilters();
    }

    // ----------------------------------------------------
    // 3. Event Listeners for Filters
    // ----------------------------------------------------
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.query = e.target.value.trim().toLowerCase();
            applyFilters();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            state.query = '';
            applyFilters();
            searchInput.focus();
        });
    }

    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const selectedCat = pill.getAttribute('data-category');
            state.category = selectedCat;

            categoryPills.forEach(p => {
                const isActive = p === pill;
                p.classList.toggle('active', isActive);
                p.setAttribute('aria-selected', isActive);
            });

            applyFilters();
        });
    });

    if (speakerSelect) {
        speakerSelect.addEventListener('change', (e) => {
            state.speaker = e.target.value.trim().toLowerCase();
            applyFilters();
        });
    }

    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', resetAllFilters);
    }

    if (btnResetEmptyView) {
        btnResetEmptyView.addEventListener('click', resetAllFilters);
    }

    // Allow clicking category badges inside talk cards to filter
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-badge') && e.target.hasAttribute('data-category')) {
            const catName = e.target.getAttribute('data-category');
            state.category = catName;

            categoryPills.forEach(p => {
                const isMatch = p.getAttribute('data-category').toLowerCase() === catName.toLowerCase();
                p.classList.toggle('active', isMatch);
                p.setAttribute('aria-selected', isMatch);
            });

            applyFilters();
            const filterHub = document.getElementById('filter-hub');
            if (filterHub) {
                filterHub.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // ----------------------------------------------------
    // 4. Modal Dialog Controller
    // ----------------------------------------------------
    function openTalkModal(talkId) {
        const talk = talksData.find(t => t.id === talkId);
        if (!talk || !talkModal) return;

        modalTitle.textContent = talk.title;
        modalTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${talk.time}`;
        modalRoom.innerHTML = `<i class="fa-solid fa-location-dot"></i> Room: <strong>${talk.room || 'Main Auditorium'}</strong> &bull; Level: <strong>${talk.level || 'All Levels'}</strong>`;
        modalDescription.textContent = talk.description;

        // Categories
        modalCategories.innerHTML = '';
        (talk.categories || []).forEach(cat => {
            const badge = document.createElement('span');
            badge.className = 'category-badge';
            badge.textContent = cat;
            modalCategories.appendChild(badge);
        });

        // Speakers
        modalSpeakersList.innerHTML = '';
        (talk.speakers || []).forEach(sp => {
            const spCard = document.createElement('div');
            spCard.className = 'modal-speaker-card';
            spCard.innerHTML = `
                <div class="modal-speaker-avatar" style="background-color: ${sp.avatar_color || '#1a73e8'};">
                    ${sp.first_name[0]}${sp.last_name[0]}
                </div>
                <div class="modal-speaker-details">
                    <h4>${sp.first_name} ${sp.last_name}</h4>
                    <p class="modal-speaker-title"><strong>${sp.role}</strong> &bull; ${sp.company}</p>
                    <p class="modal-speaker-bio">${sp.bio || ''}</p>
                    <a href="${sp.linkedin_url}" target="_blank" rel="noopener noreferrer" class="btn btn-linkedin btn-sm">
                        <i class="fa-brands fa-linkedin"></i> LinkedIn Profile
                    </a>
                </div>
            `;
            modalSpeakersList.appendChild(spCard);
        });

        // Permalink
        if (modalPermalink) {
            modalPermalink.href = `/talk/${talk.id}`;
        }

        talkModal.showModal();
    }

    function closeTalkModal() {
        if (talkModal && talkModal.open) {
            talkModal.close();
        }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeTalkModal);
    if (modalCloseFooterBtn) modalCloseFooterBtn.addEventListener('click', closeTalkModal);

    if (talkModal) {
        talkModal.addEventListener('click', (e) => {
            const rect = talkModal.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
                && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                talkModal.close();
            }
        });
    }

    document.addEventListener('click', (e) => {
        const modalBtn = e.target.closest('.btn-open-modal, .open-modal-link');
        if (modalBtn) {
            const talkId = modalBtn.getAttribute('data-talk-id');
            if (talkId) {
                openTalkModal(talkId);
            }
        }
    });

    // ----------------------------------------------------
    // 5. Session Bookmarking ("My Schedule")
    // ----------------------------------------------------
    function updateFavoriteButtons() {
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            const talkId = btn.getAttribute('data-talk-id');
            const isFav = state.favorites.includes(talkId);
            btn.classList.toggle('active', isFav);
            btn.innerHTML = isFav 
                ? '<i class="fa-solid fa-bookmark"></i>' 
                : '<i class="fa-regular fa-bookmark"></i>';
            btn.title = isFav ? 'Remove from My Schedule' : 'Save to My Schedule';
        });
    }

    document.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.btn-favorite');
        if (favBtn) {
            const talkId = favBtn.getAttribute('data-talk-id');
            if (!talkId) return;

            const index = state.favorites.indexOf(talkId);
            if (index === -1) {
                state.favorites.push(talkId);
            } else {
                state.favorites.splice(index, 1);
            }

            localStorage.setItem('cloudnext_favs', JSON.stringify(state.favorites));
            updateFavoriteButtons();
        }
    });

    // Initial setup
    updateFavoriteButtons();
    applyFilters();
});
