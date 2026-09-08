/**
 * Indian Stock Brokerage & STT Tax Calculator
 * ThoughtsToPen - Client-side financial calculations
 */

var BROKER_DATA = {
  shoonya: {
    name: 'Finvasia Shoonya',
    delivery: { type: 'zero', label: '₹0 Free' },
    intraday: { type: 'zero', label: '₹0 Free' },
    futures: { type: 'zero', label: '₹0 Free' },
    options: { type: 'zero', label: '₹0 Free' }
  },
  zerodha: {
    name: 'Zerodha',
    delivery: { type: 'zero', label: '₹0 Free Delivery' },
    intraday: { type: 'pct_cap', pct: 0.0003, cap: 20, label: '0.03% or ₹20 max' },
    futures: { type: 'pct_cap', pct: 0.0003, cap: 20, label: '0.03% or ₹20 max' },
    options: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' }
  },
  groww: {
    name: 'Groww',
    delivery: { type: 'pct_cap', pct: 0.0005, cap: 20, label: '0.05% or ₹20 max' },
    intraday: { type: 'pct_cap', pct: 0.0005, cap: 20, label: '0.05% or ₹20 max' },
    futures: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' },
    options: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' }
  },
  angelone: {
    name: 'Angel One',
    delivery: { type: 'zero', label: '₹0 Free Delivery' },
    intraday: { type: 'pct_cap', pct: 0.0025, cap: 20, label: '0.25% or ₹20 max' },
    futures: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' },
    options: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' }
  },
  upstox: {
    name: 'Upstox',
    delivery: { type: 'pct_cap', pct: 0.025, cap: 20, label: '2.5% or ₹20 max' },
    intraday: { type: 'pct_cap', pct: 0.0005, cap: 20, label: '0.05% or ₹20 max' },
    futures: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' },
    options: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' }
  },
  dhan: {
    name: 'Dhan',
    delivery: { type: 'zero', label: '₹0 Free Delivery' },
    intraday: { type: 'pct_cap', pct: 0.0003, cap: 20, label: '0.03% or ₹20 max' },
    futures: { type: 'pct_cap', pct: 0.0003, cap: 20, label: '0.03% or ₹20 max' },
    options: { type: 'flat', flat: 20, label: 'Flat ₹20 / order' }
  }
};

function formatInr(num) {
  return '₹' + (Number(num) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateBrokerDropdownLabels(segment) {
  var brokerSelect = document.getElementById('calc-broker');
  if (!brokerSelect) return;

  var currentVal = brokerSelect.value;
  var options = brokerSelect.options;

  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    var bKey = opt.value;
    var bInfo = BROKER_DATA[bKey];
    if (bInfo && bInfo[segment]) {
      opt.textContent = bInfo.name + ' (' + bInfo[segment].label + ')';
    }
  }
}

function computeBrokerage(brokerKey, segment, buyTurnover, sellTurnover) {
  var bInfo = BROKER_DATA[brokerKey];
  if (!bInfo || !bInfo[segment]) return { buyB: 0, sellB: 0, total: 0, desc: '₹0.00' };

  var rule = bInfo[segment];
  var buyB = 0;
  var sellB = 0;
  var desc = '';

  if (rule.type === 'zero') {
    buyB = 0;
    sellB = 0;
    desc = (brokerKey === 'shoonya')
      ? '100% Zero Brokerage across all segments'
      : '₹0.00 (' + bInfo.name + ' offers zero brokerage on Equity Delivery)';
  } else if (rule.type === 'pct_cap') {
    buyB = Math.min(rule.cap, buyTurnover * rule.pct);
    sellB = Math.min(rule.cap, sellTurnover * rule.pct);
    var pctDisplay = (rule.pct * 100).toFixed(rule.pct < 0.001 ? 2 : 1) + '%';
    desc = 'Buy: ₹' + buyB.toFixed(2) + ' + Sell: ₹' + sellB.toFixed(2) + ' (' + pctDisplay + ' or ₹' + rule.cap + '/order max)';
  } else if (rule.type === 'flat') {
    buyB = rule.flat;
    sellB = rule.flat;
    desc = 'Buy: ₹' + buyB.toFixed(2) + ' + Sell: ₹' + sellB.toFixed(2) + ' (Flat ₹' + rule.flat + '/order on F&O)';
  }

  var total = Math.round((buyB + sellB + Number.EPSILON) * 100) / 100;
  return { buyB: buyB, sellB: sellB, total: total, desc: desc };
}

function computeStatutoryTaxes(segment, buyTurnover, sellTurnover, totalTurnover) {
  // 1. STT / CTT
  var stt = 0;
  if (segment === 'delivery') {
    stt = totalTurnover * 0.001; // 0.1% on buy & sell turnover
  } else if (segment === 'intraday') {
    stt = sellTurnover * 0.00025; // 0.025% on sell turnover only
  } else if (segment === 'futures') {
    stt = sellTurnover * 0.0002; // 0.02% on sell turnover (Budget 2024)
  } else if (segment === 'options') {
    stt = sellTurnover * 0.001; // 0.1% on sell premium turnover (Budget 2024)
  }
  stt = Math.round((stt + Number.EPSILON) * 100) / 100;

  // 2. Exchange Transaction Charges (NSE standard)
  var excRate = 0.0000297; // Cash ~0.00297%
  if (segment === 'futures') excRate = 0.0000173; // ~0.00173%
  if (segment === 'options') excRate = 0.0003503; // ~0.03503% on premium
  var excCharges = Math.round((totalTurnover * excRate + Number.EPSILON) * 100) / 100;

  // 3. SEBI Turnover Charges (₹10 per crore = 0.0001%)
  var sebiCharges = Math.round((totalTurnover * 0.000001 + Number.EPSILON) * 100) / 100;

  // 4. Stamp Duty (Buy side only)
  var stampRate = 0.00015; // 0.015% delivery
  if (segment === 'intraday' || segment === 'options') stampRate = 0.00003; // 0.003%
  if (segment === 'futures') stampRate = 0.00002; // 0.002%
  var stampDuty = Math.round((buyTurnover * stampRate + Number.EPSILON) * 100) / 100;

  return {
    stt: stt,
    excCharges: excCharges,
    sebiCharges: sebiCharges,
    stampDuty: stampDuty
  };
}

function calculateBrokerage() {
  var segmentElem = document.getElementById('calc-segment');
  var brokerElem = document.getElementById('calc-broker');
  var buyPriceElem = document.getElementById('calc-buy-price');
  var sellPriceElem = document.getElementById('calc-sell-price');
  var qtyElem = document.getElementById('calc-qty');

  if (!segmentElem || !brokerElem || !buyPriceElem || !sellPriceElem || !qtyElem) return;

  var segment = segmentElem.value;
  var broker = brokerElem.value;
  var buyPrice = parseFloat(buyPriceElem.value) || 0;
  var sellPrice = parseFloat(sellPriceElem.value) || 0;
  var qty = parseInt(qtyElem.value, 10) || 0;

  // Dynamically update dropdown labels so they reflect the selected segment's rate
  updateBrokerDropdownLabels(segment);

  if (buyPrice <= 0 || sellPrice <= 0 || qty <= 0) return;

  var buyTurnover = buyPrice * qty;
  var sellTurnover = sellPrice * qty;
  var totalTurnover = buyTurnover + sellTurnover;
  var grossPnl = sellTurnover - buyTurnover;

  // 1. Calculate Selected Broker Brokerage
  var brokerRes = computeBrokerage(broker, segment, buyTurnover, sellTurnover);
  var brokerage = brokerRes.total;
  var brokerageDesc = brokerRes.desc;

  // 2. Statutory Taxes
  var stat = computeStatutoryTaxes(segment, buyTurnover, sellTurnover, totalTurnover);

  // 3. GST: 18% on (Brokerage + Exchange Charges + SEBI Charges)
  var gst = Math.round(((brokerage + stat.excCharges + stat.sebiCharges) * 0.18 + Number.EPSILON) * 100) / 100;

  // 4. Totals & Net PnL
  var totalTax = Math.round((brokerage + stat.stt + stat.excCharges + stat.sebiCharges + stat.stampDuty + gst + Number.EPSILON) * 100) / 100;
  var netPnl = Math.round((grossPnl - totalTax + Number.EPSILON) * 100) / 100;
  var breakevenPerShare = qty > 0 ? (totalTax / qty) : 0;

  // Update UI Elements
  var elTurnover = document.getElementById('res-turnover');
  var elBrokerage = document.getElementById('res-brokerage');
  var elBrokerageDesc = document.getElementById('res-brokerage-desc');
  var elStt = document.getElementById('res-stt');
  var elExc = document.getElementById('res-exchange');
  var elGst = document.getElementById('res-gst');
  var elSebi = document.getElementById('res-sebi');
  var elStamp = document.getElementById('res-stamp');
  var elTableTotalTax = document.getElementById('res-table-total-tax');
  var elTotalTax = document.getElementById('res-total-tax');
  var elGrossPnl = document.getElementById('res-gross-pnl');
  var elNetPnl = document.getElementById('res-net-pnl');
  var elBreakeven = document.getElementById('res-breakeven');
  var elSavingsBox = document.getElementById('res-shoonya-savings');

  if (elTurnover) elTurnover.textContent = formatInr(totalTurnover);
  if (elBrokerage) elBrokerage.textContent = formatInr(brokerage);
  if (elBrokerageDesc) elBrokerageDesc.textContent = brokerageDesc;
  if (elStt) elStt.textContent = formatInr(stat.stt);
  if (elExc) elExc.textContent = formatInr(stat.excCharges);
  if (elGst) elGst.textContent = formatInr(gst);
  if (elSebi) elSebi.textContent = formatInr(stat.sebiCharges);
  if (elStamp) elStamp.textContent = formatInr(stat.stampDuty);
  if (elTableTotalTax) elTableTotalTax.textContent = formatInr(totalTax);
  if (elTotalTax) elTotalTax.textContent = formatInr(totalTax);

  if (elGrossPnl) {
    elGrossPnl.textContent = (grossPnl >= 0 ? '+' : '') + formatInr(grossPnl);
    elGrossPnl.style.color = grossPnl >= 0 ? '#10b981' : '#ef4444';
  }

  if (elNetPnl) {
    elNetPnl.textContent = (netPnl >= 0 ? '+' : '') + formatInr(netPnl);
    elNetPnl.style.color = netPnl >= 0 ? '#10b981' : '#ef4444';
  }

  if (elBreakeven) {
    elBreakeven.textContent = '₹' + breakevenPerShare.toFixed(2) + ' / share';
  }

  // Calculate Standard Comparison Brokerage (e.g. Zerodha/Groww ₹40 round trip or percentage)
  var stdCompRes = computeBrokerage('zerodha', segment, buyTurnover, sellTurnover);
  var stdBrokerage = (stdCompRes.total === 0 && segment === 'delivery') ? 40 : stdCompRes.total; // Groww/Upstox charge ₹40 on delivery
  var stdSavingsWithGst = Math.round((stdBrokerage * 1.18 + Number.EPSILON) * 100) / 100;

  var currentBrokerName = BROKER_DATA[broker] ? BROKER_DATA[broker].name : broker;

  if (elSavingsBox) {
    elSavingsBox.style.display = 'block';
    if (broker === 'shoonya') {
      elSavingsBox.innerHTML = '🎉 <strong>Shoonya Advantage:</strong> You paid <strong>₹0.00 brokerage</strong> on this trade! Standard discount brokers would have charged up to <strong>' + formatInr(stdSavingsWithGst) + '</strong> (' + formatInr(stdBrokerage) + ' brokerage + 18% GST).';
    } else if (brokerage > 0) {
      var savingsAmount = Math.round((brokerage * 1.18 + Number.EPSILON) * 100) / 100;
      elSavingsBox.innerHTML = '💡 <strong>Pro Tip:</strong> Switching to a ₹0 zero-brokerage broker like <strong>Finvasia Shoonya</strong> saves you <strong>' + formatInr(savingsAmount) + '</strong> (' + formatInr(brokerage) + ' brokerage + ₹' + (brokerage * 0.18).toFixed(2) + ' GST) on this trade!';
    } else {
      // Free delivery on this broker
      elSavingsBox.innerHTML = 'ℹ️ <strong>Delivery Notice:</strong> <strong>' + currentBrokerName + '</strong> offers ₹0 brokerage on Equity Delivery. However, on Intraday and F&O trades, switching to <strong>Finvasia Shoonya</strong> saves you up to <strong>₹47.20 (₹40.00 + GST)</strong> per round trip!';
    }
  }

  // Update Side-by-Side Comparison Table
  updateComparisonTable(segment, buyTurnover, sellTurnover, grossPnl, stat, broker);
}

function updateComparisonTable(segment, buyTurnover, sellTurnover, grossPnl, stat, activeBroker) {
  var tbody = document.getElementById('broker-comparison-tbody');
  if (!tbody) return;

  var brokerKeys = ['shoonya', 'zerodha', 'groww', 'angelone', 'upstox', 'dhan'];
  var html = '';

  brokerKeys.forEach(function (bKey) {
    var bInfo = BROKER_DATA[bKey];
    var bRes = computeBrokerage(bKey, segment, buyTurnover, sellTurnover);
    var bBrokerage = bRes.total;
    var bGst = Math.round(((bBrokerage + stat.excCharges + stat.sebiCharges) * 0.18 + Number.EPSILON) * 100) / 100;
    var bTotalTax = Math.round((bBrokerage + stat.stt + stat.excCharges + stat.sebiCharges + stat.stampDuty + bGst + Number.EPSILON) * 100) / 100;
    var bNetPnl = Math.round((grossPnl - bTotalTax + Number.EPSILON) * 100) / 100;

    var isActive = (bKey === activeBroker);
    var rowStyle = isActive
      ? 'background: rgba(16, 185, 129, 0.08); font-weight: 600;'
      : 'border-bottom: 1px solid var(--border-color-light, #f1f5f9);';

    html += '<tr style="' + rowStyle + '">';
    html += '<td style="padding: 9px 12px;">' + (isActive ? '👉 ' : '') + bInfo.name + (bKey === 'shoonya' ? ' <span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">₹0 BROKER</span>' : '') + '</td>';
    html += '<td style="padding: 9px 12px; text-align: right; color: ' + (bBrokerage === 0 ? '#10b981' : 'inherit') + ';">' + formatInr(bBrokerage) + '</td>';
    html += '<td style="padding: 9px 12px; text-align: right; color: #D24D57;">' + formatInr(bTotalTax) + '</td>';
    html += '<td style="padding: 9px 12px; text-align: right; font-weight: 700; color: ' + (bNetPnl >= 0 ? '#10b981' : '#ef4444') + ';">' + (bNetPnl >= 0 ? '+' : '') + formatInr(bNetPnl) + '</td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
}

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', calculateBrokerage);
} else {
  calculateBrokerage();
}
