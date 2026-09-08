/**
 * Online URL / URI Encoder, Decoder & Query Parameter Analyzer
 * ThoughtsToPen - Client-side developer utilities
 */

var urlPresets = {
  oauth: 'https://auth.example.com/oauth2/authorize?client_id=client_98472&response_type=code&redirect_uri=https%3A%2F%2Fthoughtstopen.com%2Fcallback&scope=openid%20profile%20email&state=xyz123_sec',
  search: 'https://thoughtstopen.com/search?q=Spring Boot 3 + Virtual Threads & Low-Latency Java&category=computer-programming',
  utm: 'https://thoughtstopen.com/posts/?utm_source=linkedin&utm_medium=social&utm_campaign=java25_launch&ref=dev_newsletter#featured',
  symbols: 'Special Symbols: / ? : @ & = + $ , # " \'< > [ ] { } | \\ ^ % ` ~'
};

function loadUrlPreset(name) {
  var sample = urlPresets[name];
  if (!sample) return;

  var input = document.getElementById('url-input');
  if (input) {
    input.value = sample;
    processUrl();
  }
}

function clearUrl() {
  var input = document.getElementById('url-input');
  var output = document.getElementById('url-output');
  var breakdownSec = document.getElementById('url-breakdown-section');
  var paramsSec = document.getElementById('url-params-section');

  if (input) input.value = '';
  if (output) output.value = '';
  if (breakdownSec) breakdownSec.style.display = 'none';
  if (paramsSec) paramsSec.style.display = 'none';
}

function processUrl() {
  var input = document.getElementById('url-input');
  var output = document.getElementById('url-output');
  var modeElem = document.getElementById('url-mode-select');
  var errorLabel = document.getElementById('url-error-label');
  var breakdownSec = document.getElementById('url-breakdown-section');
  var paramsSec = document.getElementById('url-params-section');

  if (!input || !output) return;

  var text = input.value.trim();
  if (errorLabel) errorLabel.textContent = '';

  if (!text) {
    output.value = '';
    if (breakdownSec) breakdownSec.style.display = 'none';
    if (paramsSec) paramsSec.style.display = 'none';
    return;
  }

  var mode = modeElem ? modeElem.value : 'encode-component';
  var result = '';

  try {
    if (mode === 'encode-component') {
      result = encodeURIComponent(text);
    } else if (mode === 'encode-uri') {
      result = encodeURI(text);
    } else if (mode === 'decode') {
      // Replace plus with space if decoding query string
      var normalized = text.replace(/\+/g, ' ');
      result = decodeURIComponent(normalized);
    }
    output.value = result;
  } catch (err) {
    if (errorLabel) errorLabel.textContent = 'Encoding Error: ' + err.message;
    output.value = 'Error: ' + err.message;
  }

  // Parse URL Structure if it looks like a full URL or query string
  analyzeUrlStructure(text);
}

function analyzeUrlStructure(rawText) {
  var breakdownSec = document.getElementById('url-breakdown-section');
  var paramsSec = document.getElementById('url-params-section');
  var paramsTableBody = document.getElementById('url-params-table-body');

  var protocolElem = document.getElementById('url-part-protocol');
  var hostElem = document.getElementById('url-part-host');
  var pathElem = document.getElementById('url-part-path');
  var hashElem = document.getElementById('url-part-hash');

  var parsedUrl = null;
  try {
    parsedUrl = new URL(rawText);
  } catch (e) {
    // Check if it's a path or query string
    if (rawText.indexOf('?') !== -1) {
      try {
        parsedUrl = new URL(rawText, 'https://dummy-base.internal');
      } catch (e2) {
        parsedUrl = null;
      }
    }
  }

  if (parsedUrl && parsedUrl.hostname !== 'dummy-base.internal') {
    if (breakdownSec) breakdownSec.style.display = 'block';
    if (protocolElem) protocolElem.textContent = parsedUrl.protocol || '—';
    if (hostElem) hostElem.textContent = parsedUrl.host || '—';
    if (pathElem) pathElem.textContent = parsedUrl.pathname || '—';
    if (hashElem) hashElem.textContent = parsedUrl.hash || '—';
  } else {
    if (breakdownSec) breakdownSec.style.display = 'none';
  }

  // Extract query parameters
  var searchParams = null;
  if (parsedUrl) {
    searchParams = parsedUrl.searchParams;
  } else if (rawText.indexOf('=') !== -1) {
    try {
      var qs = rawText.indexOf('?') !== -1 ? rawText.slice(rawText.indexOf('?') + 1) : rawText;
      searchParams = new URLSearchParams(qs);
    } catch (e3) {
      searchParams = null;
    }
  }

  if (searchParams && Array.from(searchParams.keys()).length > 0) {
    if (paramsSec) paramsSec.style.display = 'block';
    if (paramsTableBody) {
      paramsTableBody.innerHTML = '';
      searchParams.forEach(function(value, key) {
        var tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-color-light, #f1f5f9)';

        var tdKey = document.createElement('td');
        tdKey.style.padding = '8px 12px';
        tdKey.style.fontFamily = 'monospace';
        tdKey.style.fontWeight = '600';
        tdKey.style.color = '#D24D57';
        tdKey.textContent = key;

        var tdVal = document.createElement('td');
        tdVal.style.padding = '8px 12px';
        tdVal.style.fontFamily = 'monospace';
        tdVal.style.wordBreak = 'break-all';
        tdVal.textContent = value;

        tr.appendChild(tdKey);
        tr.appendChild(tdVal);
        paramsTableBody.appendChild(tr);
      });
    }
  } else {
    if (paramsSec) paramsSec.style.display = 'none';
  }
}

function copyUrlOutput() {
  var output = document.getElementById('url-output');
  var btn = document.getElementById('btn-copy-url');
  if (!output || !btn) return;

  navigator.clipboard.writeText(output.value).then(function() {
    var orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  });
}

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { loadUrlPreset('oauth'); });
} else {
  loadUrlPreset('oauth');
}
