/**
 * JSON to Java Record / DTO Converter
 * ThoughtsToPen - Client-side developer utilities
 */

var sampleJsonPayload = {
  "id": 10492,
  "account_code": "FN84920",
  "symbol": "TCS-EQ",
  "quantity": 50,
  "average_price": 4215.75,
  "is_active": true,
  "created_at": "2026-09-08T10:15:30Z",
  "tags": ["bluechip", "it-sector", "portfolio"],
  "broker_details": {
    "broker_name": "Finvasia Shoonya",
    "broker_id": "SHOONYA_01",
    "is_zero_brokerage": true
  }
};

function loadSampleJson() {
  var area = document.getElementById('json-input');
  if (area) {
    area.value = JSON.stringify(sampleJsonPayload, null, 2);
    convertJsonToJava();
  }
}

function formatInputJson() {
  var area = document.getElementById('json-input');
  var errorLabel = document.getElementById('json-error-label');
  if (!area) return;

  if (errorLabel) errorLabel.textContent = '';
  try {
    var parsed = JSON.parse(area.value);
    area.value = JSON.stringify(parsed, null, 2);
    convertJsonToJava();
  } catch (err) {
    if (errorLabel) errorLabel.textContent = 'JSON Parse Error: ' + err.message;
  }
}

function toCamelCase(str) {
  return str
    .replace(/[-_]([a-z])/g, function(g) { return g[1].toUpperCase(); })
    .replace(/^[A-Z]/, function(g) { return g.toLowerCase(); });
}

function toPascalCase(str) {
  var camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function inferType(val, keyName, extraClasses, useRecords, useJackson) {
  if (val === null) return 'Object';
  if (typeof val === 'boolean') return 'Boolean';
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return (val > 2147483647 || val < -2147483648) ? 'Long' : 'Integer';
    }
    return 'Double';
  }
  if (typeof val === 'string') {
    // Check if ISO 8601 Date
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      return 'OffsetDateTime';
    }
    return 'String';
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return 'List<Object>';
    var elemType = inferType(val[0], keyName, extraClasses, useRecords, useJackson);
    return 'List<' + elemType + '>';
  }
  if (typeof val === 'object') {
    var className = toPascalCase(keyName) + (useRecords ? 'Record' : 'Dto');
    generateJavaStructure(className, val, extraClasses, useRecords, useJackson);
    return className;
  }
  return 'Object';
}

function generateJavaStructure(className, obj, extraClasses, useRecords, useJackson) {
  var fields = [];
  var imports = [];

  for (var key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    var fieldName = toCamelCase(key);
    var type = inferType(obj[key], key, extraClasses, useRecords, useJackson);

    if (type.indexOf('OffsetDateTime') !== -1 && imports.indexOf('import java.time.OffsetDateTime;') === -1) {
      imports.push('import java.time.OffsetDateTime;');
    }
    if (type.indexOf('List<') !== -1 && imports.indexOf('import java.util.List;') === -1) {
      imports.push('import java.util.List;');
    }

    fields.push({
      jsonKey: key,
      fieldName: fieldName,
      type: type
    });
  }

  var code = '';
  if (useRecords) {
    code += 'public record ' + className + '(\n';
    var recordLines = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var line = '';
      if (useJackson && f.jsonKey !== f.fieldName) {
        line += '        @JsonProperty("' + f.jsonKey + '") ';
      } else {
        line += '        ';
      }
      line += f.type + ' ' + f.fieldName;
      recordLines.push(line);
    }
    code += recordLines.join(',\n') + '\n) {}';
  } else {
    // Classic Lombok DTO
    code += '@Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor\npublic class ' + className + ' {\n';
    for (var j = 0; j < fields.length; j++) {
      var fl = fields[j];
      if (useJackson && fl.jsonKey !== fl.fieldName) {
        code += '    @JsonProperty("' + fl.jsonKey + '")\n';
      }
      code += '    private ' + fl.type + ' ' + fl.fieldName + ';\n';
    }
    code += '}';
  }

  extraClasses.push({
    className: className,
    code: code,
    imports: imports
  });
}

function convertJsonToJava() {
  var area = document.getElementById('json-input');
  var rootNameInput = document.getElementById('java-root-name');
  var modeSelect = document.getElementById('java-mode-select');
  var jacksonCheck = document.getElementById('opt-jackson');
  var outputElem = document.getElementById('java-output-code');
  var errorLabel = document.getElementById('json-error-label');

  if (!area || !outputElem) return;

  var jsonText = area.value.trim();
  if (errorLabel) errorLabel.textContent = '';

  if (!jsonText) {
    outputElem.textContent = '// Paste valid JSON on the left to generate Java source code...';
    return;
  }

  var parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    if (errorLabel) errorLabel.textContent = 'Invalid JSON: ' + e.message;
    outputElem.textContent = '// Cannot generate Java: Invalid JSON syntax\n// ' + e.message;
    return;
  }

  var rootName = (rootNameInput && rootNameInput.value.trim()) ? toPascalCase(rootNameInput.value.trim()) : 'TradePayload';
  var useRecords = modeSelect ? modeSelect.value === 'record' : true;
  var useJackson = jacksonCheck ? jacksonCheck.checked : true;

  var extraClasses = [];
  var targetObj = Array.isArray(parsed) ? (parsed[0] || {}) : parsed;

  generateJavaStructure(rootName, targetObj, extraClasses, useRecords, useJackson);

  // Aggregate imports
  var allImports = [];
  if (useJackson) {
    allImports.push('import com.fasterxml.jackson.annotation.JsonProperty;');
  }
  if (!useRecords) {
    allImports.push('import lombok.Data;');
    allImports.push('import lombok.Builder;');
    allImports.push('import lombok.NoArgsConstructor;');
    allImports.push('import lombok.AllArgsConstructor;');
  }

  for (var k = 0; k < extraClasses.length; k++) {
    for (var m = 0; m < extraClasses[k].imports.length; m++) {
      var imp = extraClasses[k].imports[m];
      if (allImports.indexOf(imp) === -1) allImports.push(imp);
    }
  }

  var finalSource = '';
  if (allImports.length > 0) {
    finalSource += allImports.join('\n') + '\n\n';
  }

  // Root class first (it was pushed first)
  for (var c = 0; c < extraClasses.length; c++) {
    finalSource += extraClasses[c].code + '\n\n';
  }

  outputElem.textContent = finalSource.trim();
}

function copyJavaOutputCode() {
  var codeElem = document.getElementById('java-output-code');
  var btn = document.getElementById('btn-copy-java-output');
  if (!codeElem || !btn) return;

  navigator.clipboard.writeText(codeElem.textContent).then(function() {
    var orig = btn.textContent;
    btn.textContent = '✓ Copied Java Code!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  });
}

// Auto-run sample on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSampleJson);
} else {
  loadSampleJson();
}
