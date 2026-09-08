/**
 * Online JSON Formatter, Beautifier, Minifier & Validator
 * ThoughtsToPen - Client-side developer utilities
 */

var sampleJsonData = {
  "name": "ThoughtsToPen API Gateway",
  "version": "2.4.0",
  "environment": "production",
  "features": [
    "virtual-threads",
    "zero-gc-ring-buffers",
    "client-side-tools"
  ],
  "security": {
    "rate_limiting": {
      "enabled": true,
      "max_requests_per_minute": 120,
      "burst_capacity": 200
    },
    "cors": {
      "allowed_origins": ["https://thoughtstopen.com"],
      "allow_credentials": true
    }
  },
  "database": {
    "driver": "org.postgresql.Driver",
    "pool_size": 30,
    "idle_timeout_ms": 10000
  },
  "status_code": 200,
  "active": true
};

function loadJsonSample() {
  var input = document.getElementById('json-input');
  if (input) {
    input.value = JSON.stringify(sampleJsonData, null, 2);
    formatJson();
  }
}

function clearJson() {
  var input = document.getElementById('json-input');
  var output = document.getElementById('json-output');
  var statusBadge = document.getElementById('json-status-badge');
  var statsLabel = document.getElementById('json-stats');
  var errorBox = document.getElementById('json-error-box');

  if (input) input.value = '';
  if (output) output.textContent = '// Formatted JSON will appear here...';
  if (statusBadge) {
    statusBadge.textContent = 'Awaiting Input';
    statusBadge.style.background = '#64748b';
  }
  if (statsLabel) statsLabel.textContent = '0 bytes';
  if (errorBox) {
    errorBox.textContent = '';
    errorBox.style.display = 'none';
  }
}

function getIndentOption() {
  var select = document.getElementById('json-indent-select');
  if (!select) return 2;
  var val = select.value;
  if (val === 'tab') return '\t';
  var num = parseInt(val, 10);
  return isNaN(num) ? 2 : num;
}

function formatJson() {
  var input = document.getElementById('json-input');
  var output = document.getElementById('json-output');
  var statusBadge = document.getElementById('json-status-badge');
  var statsLabel = document.getElementById('json-stats');
  var errorBox = document.getElementById('json-error-box');

  if (!input || !output) return;

  var text = input.value.trim();

  if (!text) {
    output.textContent = '// Formatted JSON will appear here...';
    if (statusBadge) {
      statusBadge.textContent = 'Ready';
      statusBadge.style.background = '#64748b';
    }
    if (statsLabel) statsLabel.textContent = '0 bytes';
    if (errorBox) {
      errorBox.textContent = '';
      errorBox.style.display = 'none';
    }
    return;
  }

  try {
    var parsed = JSON.parse(text);
    var indent = getIndentOption();
    var formatted = JSON.stringify(parsed, null, indent);

    output.textContent = formatted;

    if (statusBadge) {
      statusBadge.textContent = '✓ Valid JSON';
      statusBadge.style.background = '#10b981';
    }

    if (errorBox) {
      errorBox.textContent = '';
      errorBox.style.display = 'none';
    }

    if (statsLabel) {
      var inBytes = new Blob([text]).size;
      var outBytes = new Blob([formatted]).size;
      statsLabel.textContent = inBytes + ' bytes → ' + outBytes + ' bytes (Formatted)';
    }

  } catch (err) {
    if (statusBadge) {
      statusBadge.textContent = '✗ Invalid JSON';
      statusBadge.style.background = '#ef4444';
    }

    if (errorBox) {
      errorBox.textContent = 'JSON Syntax Error: ' + err.message;
      errorBox.style.display = 'block';
    }

    output.textContent = '// Invalid JSON Syntax:\n// ' + err.message;

    if (statsLabel) {
      statsLabel.textContent = 'Parse error';
    }
  }
}

function minifyJson() {
  var input = document.getElementById('json-input');
  var output = document.getElementById('json-output');
  var statusBadge = document.getElementById('json-status-badge');
  var statsLabel = document.getElementById('json-stats');
  var errorBox = document.getElementById('json-error-box');

  if (!input || !output) return;

  var text = input.value.trim();
  if (!text) return;

  try {
    var parsed = JSON.parse(text);
    var minified = JSON.stringify(parsed);

    output.textContent = minified;

    if (statusBadge) {
      statusBadge.textContent = '✓ Minified';
      statusBadge.style.background = '#10b981';
    }

    if (errorBox) {
      errorBox.textContent = '';
      errorBox.style.display = 'none';
    }

    if (statsLabel) {
      var inBytes = new Blob([text]).size;
      var outBytes = new Blob([minified]).size;
      var saved = inBytes > 0 ? Math.round(((inBytes - outBytes) / inBytes) * 100) : 0;
      statsLabel.textContent = inBytes + ' bytes → ' + outBytes + ' bytes (' + saved + '% smaller)';
    }

  } catch (err) {
    if (statusBadge) {
      statusBadge.textContent = '✗ Invalid JSON';
      statusBadge.style.background = '#ef4444';
    }

    if (errorBox) {
      errorBox.textContent = 'JSON Syntax Error: ' + err.message;
      errorBox.style.display = 'block';
    }
  }
}

function copyJsonOutput() {
  var output = document.getElementById('json-output');
  var btn = document.getElementById('btn-copy-json');
  if (!output || !btn) return;

  navigator.clipboard.writeText(output.textContent).then(function() {
    var orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  });
}

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadJsonSample);
} else {
  loadJsonSample();
}
