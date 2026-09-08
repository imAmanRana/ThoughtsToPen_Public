/**
 * Live RegEx Visualizer, Tester & Java Escape Generator
 * ThoughtsToPen - Client-side developer utilities
 */

var regexPresets = {
  email: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: 'gm',
    sample: 'test.user+dev@example.com\nhello-world@sub.domain.co.in\ninvalid-email@.com'
  },
  url: {
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'g',
    sample: 'Check out https://thoughtstopen.com and https://github.com/imAmanRana for code.'
  },
  ipv4: {
    pattern: '\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Primary DNS is 8.8.8.8, secondary DNS is 1.1.1.1. Gateway: 192.168.1.1, Invalid: 999.1.2.3'
  },
  date: {
    pattern: '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    sample: 'Released on 2026-09-08 and scheduled for next review on 2026-10-15.'
  },
  phone: {
    pattern: '(\\+?\\d{1,3}[- ]?)?\\(?(\\d{3})\\)?[- ]?(\\d{3})[- ]?(\\d{4})',
    flags: 'g',
    sample: 'Call us at +1 (555) 234-5678 or direct dial 555-876-5432.'
  },
  jwt: {
    pattern: '[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*',
    flags: 'g',
    sample: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  }
};

function loadPreset(name) {
  var preset = regexPresets[name];
  if (!preset) return;

  var patternInput = document.getElementById('regex-pattern');
  var flagsInput = document.getElementById('regex-flags');
  var testTextInput = document.getElementById('regex-test-text');

  if (patternInput) patternInput.value = preset.pattern;
  if (flagsInput) flagsInput.value = preset.flags;
  if (testTextInput) testTextInput.value = preset.sample;

  runRegexTest();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function runRegexTest() {
  var patternInput = document.getElementById('regex-pattern');
  var flagsInput = document.getElementById('regex-flags');
  var testTextInput = document.getElementById('regex-test-text');
  var highlightArea = document.getElementById('regex-highlighted-output');
  var matchCountLabel = document.getElementById('regex-match-count');
  var javaSnippetCode = document.getElementById('regex-java-code');
  var errorMsg = document.getElementById('regex-error-msg');

  if (!patternInput || !testTextInput) return;

  var patternStr = patternInput.value;
  var flagsStr = flagsInput ? flagsInput.value.trim() : 'g';
  var testStr = testTextInput.value;

  if (errorMsg) errorMsg.textContent = '';

  if (!patternStr) {
    if (highlightArea) highlightArea.innerHTML = '<span style="color: var(--text-muted, #94a3b8);">Enter a regular expression above to see highlighted matches...</span>';
    if (matchCountLabel) matchCountLabel.textContent = '0 matches';
    if (javaSnippetCode) javaSnippetCode.textContent = '// Enter a pattern above to generate Java code snippet';
    return;
  }

  var regex;
  try {
    regex = new RegExp(patternStr, flagsStr);
  } catch (err) {
    if (errorMsg) errorMsg.textContent = 'Syntax Error: ' + err.message;
    if (highlightArea) highlightArea.innerHTML = '<span style="color: #ef4444;">Invalid regular expression: ' + escapeHtml(err.message) + '</span>';
    if (matchCountLabel) matchCountLabel.textContent = 'Invalid regex';
    return;
  }

  // Find matches and build highlighted HTML
  var matches = [];
  var match;
  var isGlobal = flagsStr.indexOf('g') !== -1;

  if (isGlobal) {
    while ((match = regex.exec(testStr)) !== null) {
      matches.push({
        text: match[0],
        index: match.index,
        groups: match.slice(1)
      });
      if (match.index === regex.lastIndex) regex.lastIndex++; // Avoid infinite loops on 0-width matches
    }
  } else {
    match = regex.exec(testStr);
    if (match) {
      matches.push({
        text: match[0],
        index: match.index,
        groups: match.slice(1)
      });
    }
  }

  if (matchCountLabel) {
    matchCountLabel.textContent = matches.length + (matches.length === 1 ? ' match found' : ' matches found');
  }

  // Build highlighted output text
  if (highlightArea) {
    if (matches.length === 0) {
      highlightArea.innerHTML = escapeHtml(testStr) || '<span style="color: var(--text-muted, #94a3b8);">No matches found in the input text.</span>';
    } else {
      var outputHtml = '';
      var lastIdx = 0;
      for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        outputHtml += escapeHtml(testStr.slice(lastIdx, m.index));
        outputHtml += '<mark style="background: rgba(210, 77, 87, 0.25); color: inherit; padding: 2px 4px; border-radius: 4px; font-weight: 600; border-bottom: 2px solid #D24D57;" title="Match ' + (i + 1) + '">' + escapeHtml(m.text) + '</mark>';
        lastIdx = m.index + m.text.length;
      }
      outputHtml += escapeHtml(testStr.slice(lastIdx));
      highlightArea.innerHTML = outputHtml.replace(/\n/g, '<br/>');
    }
  }

  // Generate Java 21+ Pattern Code Snippet
  if (javaSnippetCode) {
    var javaEscapedPattern = patternStr
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');

    var javaFlags = [];
    if (flagsStr.indexOf('i') !== -1) javaFlags.push('Pattern.CASE_INSENSITIVE');
    if (flagsStr.indexOf('m') !== -1) javaFlags.push('Pattern.MULTILINE');
    if (flagsStr.indexOf('s') !== -1) javaFlags.push('Pattern.DOTALL');

    var flagArg = javaFlags.length > 0 ? (', ' + javaFlags.join(' | ')) : '';

    var javaSnippet =
      'import java.util.regex.Pattern;\n' +
      'import java.util.regex.Matcher;\n\n' +
      'public class RegexRunner {\n' +
      '    // Pre-compiled Java Pattern (Thread-safe)\n' +
      '    private static final Pattern PATTERN = Pattern.compile(\n' +
      '            "' + javaEscapedPattern + '"' + flagArg + ');\n\n' +
      '    public static void main(String[] args) {\n' +
      '        String input = "' + escapeHtml(testStr.split('\n')[0] || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '";\n' +
      '        Matcher matcher = PATTERN.matcher(input);\n\n' +
      '        while (matcher.find()) {\n' +
      '            System.out.println("Match: " + matcher.group());\n' +
      '        }\n' +
      '    }\n' +
      '}';

    javaSnippetCode.textContent = javaSnippet;
  }
}

function copyJavaRegexCode() {
  var codeElem = document.getElementById('regex-java-code');
  var btn = document.getElementById('btn-copy-java-regex');
  if (!codeElem || !btn) return;

  navigator.clipboard.writeText(codeElem.textContent).then(function() {
    var orig = btn.textContent;
    btn.textContent = '✓ Copied to Clipboard!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  });
}

// Auto-run default preset on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { loadPreset('email'); });
} else {
  loadPreset('email');
}
