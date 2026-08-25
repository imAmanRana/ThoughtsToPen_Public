var activeTab = 'text';
var phoneMode = 'tel';
var qrcodeInstance = null;

function switchQrTab(tabName) {
  activeTab = tabName;
  
  var tabButtons = document.querySelectorAll('.qr-tab-btn');
  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].style.background = '#f8fafc';
    tabButtons[i].style.color = '#475569';
    tabButtons[i].style.border = '1px solid #cbd5e1';
  }

  var activeBtn = document.getElementById('tab-btn-' + tabName);
  if (activeBtn) {
    activeBtn.style.background = '#D24D57';
    activeBtn.style.color = '#ffffff';
    activeBtn.style.border = '1px solid #D24D57';
  }

  var tabPanes = document.querySelectorAll('.qr-tab-pane');
  for (var j = 0; j < tabPanes.length; j++) {
    tabPanes[j].style.display = 'none';
  }

  var activePane = document.getElementById('tab-content-' + tabName);
  if (activePane) {
    activePane.style.display = 'block';
  }

  if (tabName === 'text') {
    generateQrCode();
  } else if (tabName === 'wifi') {
    updateWifiQr();
  } else if (tabName === 'upi') {
    updateUpiQr();
  } else if (tabName === 'email') {
    updateEmailQr();
  } else if (tabName === 'phone') {
    updatePhoneQr();
  }
}

function setPhoneMode(mode) {
  phoneMode = mode;
  var btnTel = document.getElementById('phone-mode-tel');
  var btnSms = document.getElementById('phone-mode-sms');
  var smsBox = document.getElementById('sms-body-container');

  if (mode === 'tel') {
    if (btnTel) {
      btnTel.style.background = '#D24D57';
      btnTel.style.color = '#ffffff';
      btnTel.style.borderColor = '#D24D57';
    }
    if (btnSms) {
      btnSms.style.background = '#f8fafc';
      btnSms.style.color = '#475569';
      btnSms.style.borderColor = '#cbd5e1';
    }
    if (smsBox) smsBox.style.display = 'none';
  } else {
    if (btnSms) {
      btnSms.style.background = '#D24D57';
      btnSms.style.color = '#ffffff';
      btnSms.style.borderColor = '#D24D57';
    }
    if (btnTel) {
      btnTel.style.background = '#f8fafc';
      btnTel.style.color = '#475569';
      btnTel.style.borderColor = '#cbd5e1';
    }
    if (smsBox) smsBox.style.display = 'block';
  }
  updatePhoneQr();
}

function updateWifiQr() {
  var ssidInput = document.getElementById('wifi-ssid');
  var passInput = document.getElementById('wifi-password');
  var typeInput = document.getElementById('wifi-type');
  var hiddenInput = document.getElementById('wifi-hidden');

  var ssid = ssidInput ? ssidInput.value.trim() : '';
  var pass = passInput ? passInput.value : '';
  var type = typeInput ? typeInput.value : 'WPA';
  var hidden = (hiddenInput && hiddenInput.checked) ? 'true' : 'false';

  if (!ssid) {
    renderRawQr('WIFI:S:MyNetwork;T:WPA;P:;;');
    return;
  }
  var wifiString = 'WIFI:S:' + escapeWifi(ssid) + ';T:' + type + ';P:' + escapeWifi(pass) + ';H:' + hidden + ';;';
  renderRawQr(wifiString);
}

function escapeWifi(str) {
  return str.replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/:/g, '\\:');
}

function updateUpiQr() {
  var vpaInput = document.getElementById('upi-vpa');
  var nameInput = document.getElementById('upi-name');
  var amtInput = document.getElementById('upi-amount');

  var vpa = vpaInput ? vpaInput.value.trim() : '';
  var name = nameInput ? nameInput.value.trim() : '';
  var amount = amtInput ? amtInput.value.trim() : '';

  if (!vpa) {
    renderRawQr('upi://pay?pa=example@upi&pn=ThoughtsToPen&cu=INR');
    return;
  }

  var upiUrl = 'upi://pay?pa=' + encodeURIComponent(vpa);
  if (name) upiUrl += '&pn=' + encodeURIComponent(name);
  if (amount && parseFloat(amount) > 0) upiUrl += '&am=' + encodeURIComponent(amount);
  upiUrl += '&cu=INR';
  renderRawQr(upiUrl);
}

function updateEmailQr() {
  var emailInput = document.getElementById('email-address');
  var subInput = document.getElementById('email-subject');
  var bodyInput = document.getElementById('email-body');

  var email = emailInput ? emailInput.value.trim() : '';
  var subject = subInput ? subInput.value.trim() : '';
  var body = bodyInput ? bodyInput.value.trim() : '';

  if (!email) {
    renderRawQr('mailto:contact@thoughtstopen.com');
    return;
  }

  var mailto = 'mailto:' + email;
  var params = [];
  if (subject) params.push('subject=' + encodeURIComponent(subject));
  if (body) params.push('body=' + encodeURIComponent(body));
  if (params.length > 0) mailto += '?' + params.join('&');

  renderRawQr(mailto);
}

function updatePhoneQr() {
  var phoneInput = document.getElementById('phone-number');
  var smsInput = document.getElementById('sms-body');

  var num = phoneInput ? phoneInput.value.trim() : '';
  var sms = smsInput ? smsInput.value.trim() : '';

  if (!num) {
    renderRawQr('tel:+15551234567');
    return;
  }

  if (phoneMode === 'tel') {
    renderRawQr('tel:' + num);
  } else {
    var smsStr = 'smsto:' + num;
    if (sms) smsStr += ':' + sms;
    renderRawQr(smsStr);
  }
}

function generateQrCode() {
  var textInput = document.getElementById('qr-input-text');
  var text = (textInput && textInput.value.trim()) ? textInput.value.trim() : 'https://thoughtstopen.com';
  renderRawQr(text);
}

function renderRawQr(textPayload) {
  var container = document.getElementById('qrcode-container');
  if (!container || typeof QRCode === 'undefined') return;

  container.innerHTML = '';

  var sizeSlider = document.getElementById('qr-size-slider');
  var colorDarkInput = document.getElementById('qr-color-dark');
  var colorLightInput = document.getElementById('qr-color-light');
  var errorLevelSelect = document.getElementById('qr-error-level');

  var size = sizeSlider ? (parseInt(sizeSlider.value, 10) || 300) : 300;
  var colorDark = colorDarkInput ? colorDarkInput.value : '#000000';
  var colorLight = colorLightInput ? colorLightInput.value : '#ffffff';
  var errorLevelStr = errorLevelSelect ? errorLevelSelect.value : 'M';

  var errorCorrection = QRCode.CorrectLevel.M;
  if (errorLevelStr === 'L') errorCorrection = QRCode.CorrectLevel.L;
  if (errorLevelStr === 'Q') errorCorrection = QRCode.CorrectLevel.Q;
  if (errorLevelStr === 'H') errorCorrection = QRCode.CorrectLevel.H;

  var previewSize = Math.min(size, 250);

  qrcodeInstance = new QRCode(container, {
    text: textPayload,
    width: size,
    height: size,
    colorDark: colorDark,
    colorLight: colorLight,
    correctLevel: errorCorrection
  });

  setTimeout(function() {
    var canvas = container.querySelector('canvas');
    var img = container.querySelector('img');
    if (canvas) {
      canvas.style.width = previewSize + 'px';
      canvas.style.height = previewSize + 'px';
    }
    if (img) {
      img.style.width = previewSize + 'px';
      img.style.height = previewSize + 'px';
      img.style.display = 'block';
      img.style.margin = '0 auto';
    }
  }, 60);
}

function updateSizeLabel() {
  var sizeSlider = document.getElementById('qr-size-slider');
  var sizeLabel = document.getElementById('qr-size-label');
  if (sizeSlider && sizeLabel) {
    sizeLabel.textContent = sizeSlider.value + 'px';
  }
}

function syncColorInput(type) {
  if (type === 'dark') {
    var darkPicker = document.getElementById('qr-color-dark');
    var darkHex = document.getElementById('qr-hex-dark');
    if (darkPicker && darkHex) darkHex.value = darkPicker.value;
  } else {
    var lightPicker = document.getElementById('qr-color-light');
    var lightHex = document.getElementById('qr-hex-light');
    if (lightPicker && lightHex) lightHex.value = lightPicker.value;
  }
}

function syncColorPicker(type) {
  if (type === 'dark') {
    var darkHex = document.getElementById('qr-hex-dark');
    var darkPicker = document.getElementById('qr-color-dark');
    if (darkHex && darkPicker && /^#[0-9A-F]{6}$/i.test(darkHex.value)) {
      darkPicker.value = darkHex.value;
    }
  } else {
    var lightHex = document.getElementById('qr-hex-light');
    var lightPicker = document.getElementById('qr-color-light');
    if (lightHex && lightPicker && /^#[0-9A-F]{6}$/i.test(lightHex.value)) {
      lightPicker.value = lightHex.value;
    }
  }
}

function getExportCanvas() {
  var container = document.getElementById('qrcode-container');
  if (!container) return null;

  var sourceCanvas = container.querySelector('canvas');
  var img = container.querySelector('img');

  if (!sourceCanvas && !img) return null;

  var colorLightInput = document.getElementById('qr-color-light');
  var colorLight = colorLightInput ? colorLightInput.value : '#ffffff';
  
  var marginSelect = document.getElementById('qr-margin-size');
  var marginModules = marginSelect ? parseInt(marginSelect.value, 10) : 4; /* default 4 modules standard quiet zone */

  var baseWidth = sourceCanvas ? sourceCanvas.width : (img.naturalWidth || 300);
  var baseHeight = sourceCanvas ? sourceCanvas.height : (img.naturalHeight || 300);

  /* Calculate clean proportional padding (e.g. 4 modules ~ 8% margin) */
  var marginPx = Math.round(baseWidth * (marginModules * 0.02));
  if (marginModules === 0) marginPx = 0;
  else if (marginPx < 18) marginPx = 18;

  var exportCanvas = document.createElement('canvas');
  exportCanvas.width = baseWidth + (marginPx * 2);
  exportCanvas.height = baseHeight + (marginPx * 2);

  var ctx = exportCanvas.getContext('2d');
  ctx.fillStyle = colorLight;
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  if (sourceCanvas) {
    ctx.drawImage(sourceCanvas, marginPx, marginPx);
  } else if (img) {
    ctx.drawImage(img, marginPx, marginPx);
  }

  return exportCanvas;
}

function downloadQrPng() {
  var exportCanvas = getExportCanvas();
  if (!exportCanvas) {
    showStatusMsg('Error preparing QR code for download', '#ef4444');
    return;
  }

  var dataUrl = exportCanvas.toDataURL('image/png');

  var a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'thoughtstopen-qrcode.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showStatusMsg('✓ Download started with border!', '#16a34a');
}

function copyQrToClipboard() {
  var exportCanvas = getExportCanvas();
  if (!exportCanvas) {
    showStatusMsg('Copy not supported on this browser', '#ef4444');
    return;
  }

  if (exportCanvas.toBlob && navigator.clipboard && navigator.clipboard.write) {
    exportCanvas.toBlob(function(blob) {
      if (!blob) {
        showStatusMsg('Failed to copy image', '#ef4444');
        return;
      }
      try {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]).then(function() {
          showStatusMsg('✓ QR Code copied to clipboard!', '#16a34a');
        }).catch(function() {
          showStatusMsg('Clipboard permission denied', '#ef4444');
        });
      } catch (err) {
        showStatusMsg('Clipboard copy failed', '#ef4444');
      }
    });
  } else {
    showStatusMsg('Clipboard API not available', '#ef4444');
  }
}

function showStatusMsg(msg, color) {
  var el = document.getElementById('qr-status-msg');
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
  setTimeout(function() {
    if (el.textContent === msg) el.textContent = '';
  }, 3500);
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    generateQrCode();
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(generateQrCode, 150);
  }
}
