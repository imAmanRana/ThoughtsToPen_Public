/**
 * Client-Side Site Search powered by Lunr.js for ThoughtsToPen
 * Provides real-time indexed search, keyboard navigation, matching highlight,
 * and lazy-loading of search.json.
 */

(function () {
  'use strict';

  var searchData = null;
  var lunrIndex = null;
  var isLoading = false;
  var selectedIndex = -1;
  var debounceTimer = null;

  // DOM Elements
  var backdrop = document.getElementById('search-modal-backdrop');
  var modal = document.getElementById('search-modal');
  var searchInput = document.getElementById('search-input');
  var clearBtn = document.getElementById('search-clear-btn');
  var closeBtn = document.getElementById('search-close-btn');
  var suggestions = document.getElementById('search-suggestions');
  var statusBox = document.getElementById('search-status');
  var countSpan = document.getElementById('search-count');
  var loadingSpan = document.getElementById('search-loading');
  var resultsList = document.getElementById('search-results');
  var searchToggleBtn = document.getElementById('search-toggle');

  // Standalone Page Elements (if present on /search/)
  var standaloneInput = document.getElementById('standalone-search-input');
  var standaloneResults = document.getElementById('standalone-search-results');
  var standaloneStatus = document.getElementById('standalone-search-status');

  /**
   * Escape HTML special characters
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Highlight matched search query terms in target text
   */
  function highlightMatches(text, query) {
    if (!text || !query) return escapeHtml(text);
    var terms = query.trim().split(/\s+/).filter(function (t) {
      return t.length > 1;
    });
    if (terms.length === 0) return escapeHtml(text);

    var escapedText = escapeHtml(text);
    var pattern = terms.map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|');

    var regex = new RegExp('(' + pattern + ')', 'gi');
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  /**
   * Lazy load /search.json and build Lunr index
   */
  function loadSearchIndex(callback) {
    if (lunrIndex && searchData) {
      if (callback) callback();
      return;
    }

    if (isLoading) return;
    isLoading = true;

    if (loadingSpan) loadingSpan.style.display = 'inline-block';
    if (statusBox) statusBox.style.display = 'flex';

    var searchUrl = (window.siteBaseUrl || '') + '/search.json';

    fetch(searchUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        searchData = {};
        // Build Lunr index
        lunrIndex = lunr(function () {
          this.ref('url');
          this.field('title', { boost: 10 });
          this.field('tags', { boost: 5 });
          this.field('excerpt', { boost: 2 });
          this.field('content', { boost: 1 });

          data.forEach(function (item) {
            searchData[item.url] = item;
            this.add({
              url: item.url,
              title: item.title,
              tags: item.tags,
              excerpt: item.excerpt,
              content: item.content
            });
          }, this);
        });

        isLoading = false;
        if (loadingSpan) loadingSpan.style.display = 'none';
        if (callback) callback();
      })
      .catch(function (err) {
        console.error('Failed to load search index:', err);
        isLoading = false;
        if (loadingSpan) loadingSpan.style.display = 'none';
        if (countSpan) countSpan.textContent = 'Failed to load search index.';
      });
  }

  /**
   * Execute search and render results
   */
  function performSearch(query, targetContainer, statusElem) {
    query = (query || '').trim();
    selectedIndex = -1;

    if (!query) {
      if (suggestions) suggestions.style.display = 'flex';
      if (statusElem) statusElem.style.display = 'none';
      if (targetContainer) targetContainer.innerHTML = '';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (clearBtn) clearBtn.style.display = 'inline-block';
    if (suggestions) suggestions.style.display = 'none';

    if (!lunrIndex) {
      loadSearchIndex(function () {
        performSearch(query, targetContainer, statusElem);
      });
      return;
    }

    // Query formulation: exact stemmed match (high boost) + prefix wildcard (as-you-type) + typo tolerance
    var rawTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = [];

    try {
      matches = lunrIndex.query(function (q) {
        rawTerms.forEach(function (raw) {
          var clean = raw.replace(/[^\w-]/g, '');
          if (!clean) clean = raw;

          // 1. Exact term search (boost: 100) - goes through Lunr pipeline including stemmer
          q.term(clean, { boost: 100 });

          // 2. Trailing wildcard (boost: 10) - matches prefix as user types (e.g. 'authent')
          q.term(clean, { wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });

          // 3. Typo tolerance (edit distance 1) for terms longer than 4 chars
          if (clean.length > 4) {
            q.term(clean, { editDistance: 1, boost: 1 });
          }
        });
      });
    } catch (e) {
      try {
        matches = lunrIndex.search(query);
      } catch (err) {
        matches = [];
      }
    }

    renderResults(matches, query, targetContainer, statusElem);
  }

  /**
   * Render result HTML
   */
  function renderResults(matches, query, targetContainer, statusElem) {
    if (!targetContainer) return;

    if (statusElem) {
      statusElem.style.display = 'flex';
      var countEl = statusElem.querySelector('#search-count') || statusElem;
      if (countEl) {
        var countText = matches.length === 1 ? '1 post found' : matches.length + ' posts found';
        countEl.textContent = matches.length > 0 ? countText : 'No posts found matching "' + query + '"';
      }
    }

    if (matches.length === 0) {
      targetContainer.innerHTML = [
        '<div class="search-empty-state">',
        '  <i class="fa fa-search" aria-hidden="true"></i>',
        '  <h4>No matching articles found</h4>',
        '  <p>Try searching for broader keywords like <strong>Java</strong>, <strong>Algorithms</strong>, <strong>TFSA</strong>, or <strong>Trading</strong>.</p>',
        '</div>'
      ].join('');
      return;
    }

    var html = matches.slice(0, 20).map(function (match, index) {
      var item = searchData[match.ref];
      if (!item) return '';

      var highlightedTitle = highlightMatches(item.title, query);
      var highlightedExcerpt = highlightMatches(item.excerpt, query);

      var tagsHtml = '';
      if (item.tags) {
        var tagList = item.tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        tagsHtml = tagList.slice(0, 3).map(function (t) {
          return '<span class="result-tag">#' + escapeHtml(t) + '</span>';
        }).join(' ');
      }

      return [
        '<a href="' + item.url + '" class="search-result-item" data-index="' + index + '" role="option">',
        '  <div class="result-header">',
        '    <h3 class="result-title">' + highlightedTitle + '</h3>',
        '    <i class="fa fa-arrow-right result-arrow" aria-hidden="true"></i>',
        '  </div>',
        '  <div class="result-meta">',
        '    <span class="result-date"><i class="fa fa-calendar-o"></i> ' + escapeHtml(item.date) + '</span>',
        tagsHtml,
        '  </div>',
        '  <p class="result-excerpt">' + highlightedExcerpt + '</p>',
        '</a>'
      ].join('');
    }).join('');

    targetContainer.innerHTML = html;
  }

  /**
   * Keyboard selection management
   */
  function updateSelection(items) {
    for (var i = 0; i < items.length; i++) {
      if (i === selectedIndex) {
        items[i].classList.add('is-selected');
        items[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        items[i].classList.remove('is-selected');
      }
    }
  }

  /**
   * Open Search Modal
   */
  function openModal(initialQuery) {
    if (!backdrop) return;
    backdrop.style.display = 'flex';
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Warm up index immediately on open
    loadSearchIndex();

    if (searchInput) {
      if (initialQuery) {
        searchInput.value = initialQuery;
        performSearch(initialQuery, resultsList, statusBox);
      }
      setTimeout(function () {
        searchInput.focus();
        if (initialQuery) searchInput.select();
      }, 50);
    }
  }

  /**
   * Close Search Modal
   */
  function closeModal() {
    if (!backdrop) return;
    backdrop.style.display = 'none';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Event Listeners Setup
   */
  function init() {
    // 1. Header Trigger Button
    if (searchToggleBtn) {
      searchToggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }

    // 2. Modal Close / Clear Triggers
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeModal();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
          closeModal();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          performSearch('', resultsList, statusBox);
        }
      });
    }

    // 3. Search Input Keystrokes (Debounced)
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        var q = this.value;
        debounceTimer = setTimeout(function () {
          performSearch(q, resultsList, statusBox);
        }, 120);
      });

      // Keyboard navigation inside modal
      searchInput.addEventListener('keydown', function (e) {
        var items = resultsList ? resultsList.querySelectorAll('.search-result-item') : [];

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (items.length > 0) {
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection(items);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (items.length > 0) {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection(items);
          }
        } else if (e.key === 'Enter') {
          if (selectedIndex >= 0 && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].click();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeModal();
        }
      });
    }

    // 4. Topic Suggestions Chips
    if (suggestions) {
      suggestions.addEventListener('click', function (e) {
        var chip = e.target.closest('.search-topic-chip');
        if (chip && searchInput) {
          var query = chip.getAttribute('data-query');
          searchInput.value = query;
          performSearch(query, resultsList, statusBox);
          searchInput.focus();
        }
      });
    }

    // 5. Global Keyboard Shortcuts: Ctrl+K, Cmd+K, or /
    document.addEventListener('keydown', function (e) {
      var isSearchModalOpen = backdrop && backdrop.style.display !== 'none';

      // Cmd+K or Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isSearchModalOpen) {
          closeModal();
        } else {
          openModal();
        }
        return;
      }

      // Single key '/' opens search if not currently focused in an input/textarea
      if (e.key === '/' && !isSearchModalOpen) {
        var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag !== 'input' && tag !== 'textarea' && !document.activeElement.isContentEditable) {
          e.preventDefault();
          openModal();
        }
      }

      // Escape key closes modal
      if (e.key === 'Escape' && isSearchModalOpen) {
        closeModal();
      }
    });

    // 6. Standalone Search Page (/search/)
    if (standaloneInput) {
      loadSearchIndex(function () {
        // Check URL query parameters: /search/?q=java
        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get('q');
        if (urlQuery) {
          standaloneInput.value = urlQuery;
          performSearch(urlQuery, standaloneResults, standaloneStatus);
        }
      });

      standaloneInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        var q = this.value;
        debounceTimer = setTimeout(function () {
          performSearch(q, standaloneResults, standaloneStatus);
          // Sync URL without reload
          var newUrl = window.location.pathname + (q.trim() ? '?q=' + encodeURIComponent(q.trim()) : '');
          window.history.replaceState(null, '', newUrl);
        }, 120);
      });
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
