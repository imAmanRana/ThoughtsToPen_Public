/**
 * Interactive FIRE Calculator
 * ThoughtsToPen - Client-side financial independence calculations
 */

function setSWR(rate) {
  var input = document.getElementById('swr-rate');
  if (input) {
    input.value = rate;
    calculateFIRE();
  }
}

function toggleTable() {
  var wrapper = document.getElementById('fire-table-wrapper');
  var btn = document.getElementById('toggle-table-btn');
  if (!wrapper || !btn) return;

  if (wrapper.style.display === 'none' || wrapper.style.display === '') {
    wrapper.style.display = 'block';
    btn.textContent = 'Hide Projection Table';
  } else {
    wrapper.style.display = 'none';
    btn.textContent = '📊 Show Year-by-Year Projection Table';
  }
}

function formatMoney(num, currency) {
  return currency + Math.round(num).toLocaleString();
}

function calculateFIRE() {
  var currencyElem = document.getElementById('fire-currency');
  var currentAgeElem = document.getElementById('current-age');
  var currentSavingsElem = document.getElementById('current-savings');
  var monthlyContributionElem = document.getElementById('monthly-contribution');
  var annualExpensesElem = document.getElementById('annual-expenses');
  var expectedReturnElem = document.getElementById('expected-return');
  var swrRateElem = document.getElementById('swr-rate');

  if (!currencyElem || !annualExpensesElem || !swrRateElem) return;

  var currency = currencyElem.value;
  var currentAge = parseInt(currentAgeElem.value, 10) || 0;
  var currentSavings = parseFloat(currentSavingsElem.value) || 0;
  var monthlyContribution = parseFloat(monthlyContributionElem.value) || 0;
  var annualExpenses = parseFloat(annualExpensesElem.value) || 0;
  var expectedReturn = (parseFloat(expectedReturnElem.value) || 0) / 100;
  var swrRate = (parseFloat(swrRateElem.value) || 4.0) / 100;

  if (annualExpenses <= 0 || swrRate <= 0) return;

  var fireNumber = annualExpenses / swrRate;
  var multiplier = (1 / swrRate).toFixed(1);
  var currentYear = new Date().getFullYear();

  var resFireNumber = document.getElementById('res-fire-number');
  var resMultiplier = document.getElementById('res-multiplier');
  if (resFireNumber) resFireNumber.textContent = formatMoney(fireNumber, currency);
  if (resMultiplier) resMultiplier.textContent = '(' + multiplier + 'x Annual Expenses)';

  // Lean & Fat targets
  var leanFireNumber = (annualExpenses * 0.75) / swrRate;
  var fatFireNumber = (annualExpenses * 1.50) / swrRate;

  var resLeanFire = document.getElementById('res-lean-fire');
  var resStdFire = document.getElementById('res-std-fire');
  var resFatFire = document.getElementById('res-fat-fire');
  if (resLeanFire) resLeanFire.textContent = formatMoney(leanFireNumber, currency);
  if (resStdFire) resStdFire.textContent = formatMoney(fireNumber, currency);
  if (resFatFire) resFatFire.textContent = formatMoney(fatFireNumber, currency);

  // Calculate Years to Target using monthly compound loop
  var balance = currentSavings;
  var annualDeposit = monthlyContribution * 12;
  var monthlyRate = expectedReturn / 12;

  var monthsToStandard = -1;
  var monthsToLean = -1;
  var monthsToFat = -1;

  var maxMonths = 12 * 70; // 70 years cap
  var yearlyLogs = [];

  for (var m = 0; m <= maxMonths; m++) {
    if (monthsToLean === -1 && balance >= leanFireNumber) monthsToLean = m;
    if (monthsToStandard === -1 && balance >= fireNumber) monthsToStandard = m;
    if (monthsToFat === -1 && balance >= fatFireNumber) monthsToFat = m;

    if (m % 12 === 0) {
      var yr = m / 12;
      yearlyLogs.push({
        yearIndex: yr,
        calendarYear: currentYear + yr,
        age: currentAge + yr,
        balance: balance
      });
    }

    if (monthsToFat !== -1 && m % 12 === 0) break;

    // Monthly compounding
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }

  // Update Standard FIRE results
  var resYearsLeft = document.getElementById('res-years-left');
  var resFireYear = document.getElementById('res-fire-year');
  var resFireAge = document.getElementById('res-fire-age');
  var resStdYears = document.getElementById('res-std-years');

  if (monthsToStandard === -1) {
    if (resYearsLeft) resYearsLeft.textContent = '> 60 Years';
    if (resFireYear) resFireYear.textContent = 'Adjust inputs';
    if (resFireAge) resFireAge.textContent = 'N/A';
    if (resStdYears) resStdYears.textContent = '> 60 yrs';
  } else {
    var yrs = (monthsToStandard / 12).toFixed(1);
    var fireAge = Math.round(currentAge + (monthsToStandard / 12));
    var targetYear = Math.round(currentYear + (monthsToStandard / 12));
    if (resYearsLeft) resYearsLeft.textContent = yrs + ' Years';
    if (resFireYear) resFireYear.textContent = 'Target Year: ' + targetYear;
    if (resFireAge) resFireAge.textContent = 'Age ' + fireAge;
    if (resStdYears) resStdYears.textContent = '~' + yrs + ' yrs to reach';
  }

  // Lean / Fat years
  var resLeanYears = document.getElementById('res-lean-years');
  var resFatYears = document.getElementById('res-fat-years');
  if (resLeanYears) {
    resLeanYears.textContent = (monthsToLean !== -1) ? ('~' + (monthsToLean / 12).toFixed(1) + ' yrs to reach') : '> 50 yrs';
  }
  if (resFatYears) {
    resFatYears.textContent = (monthsToFat !== -1) ? ('~' + (monthsToFat / 12).toFixed(1) + ' yrs to reach') : '> 60 yrs';
  }

  // Progress Bar
  var progressPct = Math.min(100, Math.max(0, (currentSavings / fireNumber) * 100));
  var progressStr = progressPct.toFixed(1) + '%';
  var resProgressPct = document.getElementById('res-progress-pct');
  var progressBarLabel = document.getElementById('progress-bar-label');
  var fireProgressFill = document.getElementById('fire-progress-fill');

  if (resProgressPct) resProgressPct.textContent = 'Current: ' + progressStr + ' Funded';
  if (progressBarLabel) progressBarLabel.textContent = progressStr;
  if (fireProgressFill) fireProgressFill.style.width = progressStr;

  // Build Year-by-Year Table
  var tbody = document.getElementById('fire-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  var prevBalance = currentSavings;
  for (var i = 0; i < yearlyLogs.length; i++) {
    var item = yearlyLogs[i];
    var isReached = item.balance >= fireNumber;
    var growth = (i === 0) ? 0 : (item.balance - prevBalance - annualDeposit);
    prevBalance = item.balance;

    var row = document.createElement('tr');
    if (isReached) {
      row.style.background = 'rgba(16, 185, 129, 0.1)';
      row.style.fontWeight = '600';
    } else {
      row.style.background = (i % 2 === 0) ? 'transparent' : 'var(--bg-surface, #f8fafc)';
    }
    row.style.borderBottom = '1px solid var(--border-color-light, #e2e8f0)';

    row.innerHTML =
      '<td style="padding: 10px 14px; text-align: center;">' + item.calendarYear + '</td>' +
      '<td style="padding: 10px 14px; text-align: center;">' + item.age + '</td>' +
      '<td style="padding: 10px 14px;">' + (i === 0 ? '-' : formatMoney(annualDeposit, currency)) + '</td>' +
      '<td style="padding: 10px 14px; color: #10b981;">' + (i === 0 ? '-' : '+' + formatMoney(Math.max(0, growth), currency)) + '</td>' +
      '<td style="padding: 10px 14px; font-weight: 700;">' + formatMoney(item.balance, currency) + '</td>' +
      '<td style="padding: 10px 14px; text-align: center;">' + (isReached ? '<span style="color: #10b981; font-weight: 700;">🎯 FI Reached</span>' : '<span style="color: var(--text-color-muted, #94a3b8);">Accumulating</span>') + '</td>';

    tbody.appendChild(row);
    if (isReached && i > 3) break; // Display up to 1-2 years after FI is achieved
  }
}

// Attach listener and run initial calculation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', calculateFIRE);
} else {
  calculateFIRE();
}
