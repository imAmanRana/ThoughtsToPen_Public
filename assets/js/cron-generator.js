/**
 * Interactive Cron Expression Generator & Schedule Simulator
 * ThoughtsToPen - Client-side developer utilities
 */

var cronPresets = {
  everyMinute: { expr: '* * * * *', label: 'Every minute' },
  every5Min: { expr: '*/5 * * * *', label: 'Every 5 minutes' },
  every15Min: { expr: '*/15 * * * *', label: 'Every 15 minutes' },
  hourly: { expr: '0 * * * *', label: 'Every hour (:00)' },
  dailyMidnight: { expr: '0 0 * * *', label: 'Daily at midnight (00:00)' },
  weekday9am: { expr: '0 9 * * 1-5', label: 'Weekdays at 09:00 AM' },
  weeklySunday: { expr: '0 0 * * 0', label: 'Weekly on Sunday at midnight' },
  monthlyFirst: { expr: '0 0 1 * *', label: 'Monthly on the 1st at 00:00' }
};

function selectPreset(key) {
  var preset = cronPresets[key];
  if (!preset) return;

  var input = document.getElementById('cron-input');
  if (input) {
    input.value = preset.expr;
    updateCron();
  }
}

function parseCronHuman(expr, isSpring) {
  var parts = expr.trim().split(/\s+/);
  var expected = isSpring ? 6 : 5;

  if (parts.length !== expected) {
    return 'Invalid expression: expected ' + expected + ' space-separated fields.';
  }

  var sec = isSpring ? parts[0] : null;
  var min = isSpring ? parts[1] : parts[0];
  var hr = isSpring ? parts[2] : parts[1];
  var dom = isSpring ? parts[3] : parts[2];
  var mon = isSpring ? parts[4] : parts[3];
  var dow = isSpring ? parts[5] : parts[4];

  var desc = [];

  // Minute
  if (min === '*') desc.push('every minute');
  else if (min.indexOf('*/') === 0) desc.push('every ' + min.replace('*/', '') + ' minutes');
  else desc.push('at minute ' + min);

  // Hour
  if (hr === '*') {
    if (min !== '*') desc.push('of every hour');
  } else if (hr.indexOf('*/') === 0) {
    desc.push('every ' + hr.replace('*/', '') + ' hours');
  } else {
    var hNum = parseInt(hr, 10);
    var ampm = hNum >= 12 ? 'PM' : 'AM';
    var h12 = hNum % 12 === 0 ? 12 : hNum % 12;
    var mStr = min.length === 1 ? '0' + min : min;
    if (min !== '*' && min.indexOf('*/') === -1) {
      desc = ['at ' + (h12 < 10 ? '0' : '') + h12 + ':' + mStr + ' ' + ampm];
    } else {
      desc.push('past hour ' + hr);
    }
  }

  // Day of Month
  if (dom !== '*' && dom !== '?') {
    desc.push('on day ' + dom + ' of the month');
  }

  // Month
  if (mon !== '*') {
    var months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var monName = months[parseInt(mon, 10)] || ('month ' + mon);
    desc.push('in ' + monName);
  }

  // Day of Week
  if (dow !== '*' && dow !== '?') {
    var days = {
      '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
      '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '7': 'Sunday',
      '1-5': 'Monday through Friday', 'MON-FRI': 'Monday through Friday'
    };
    desc.push('on ' + (days[dow] || ('day ' + dow + ' of the week')));
  }

  return desc.join(', ') || 'Custom schedule';
}

function computeNextRuns(expr, isSpring, count) {
  var runs = [];
  var parts = expr.trim().split(/\s+/);
  var expected = isSpring ? 6 : 5;
  if (parts.length !== expected) return runs;

  var now = new Date();
  var cursor = new Date(now.getTime() + 60000); // Start 1 min in future
  cursor.setSeconds(0, 0);

  // Simple simulator for standard interval / fixed patterns
  var attempts = 0;
  while (runs.length < count && attempts < 10000) {
    attempts++;
    var m = cursor.getMinutes();
    var h = cursor.getHours();
    var dom = cursor.getDate();
    var mon = cursor.getMonth() + 1;
    var dow = cursor.getDay(); // 0 is Sun

    var minPart = isSpring ? parts[1] : parts[0];
    var hrPart = isSpring ? parts[2] : parts[1];
    var domPart = isSpring ? parts[3] : parts[2];
    var dowPart = isSpring ? parts[5] : parts[4];

    var matchMin = (minPart === '*') || (minPart.indexOf('*/') === 0 && m % parseInt(minPart.slice(2), 10) === 0) || (parseInt(minPart, 10) === m);
    var matchHr = (hrPart === '*') || (hrPart.indexOf('*/') === 0 && h % parseInt(hrPart.slice(2), 10) === 0) || (parseInt(hrPart, 10) === h);
    var matchDom = (domPart === '*' || domPart === '?') || (parseInt(domPart, 10) === dom);
    var matchDow = (dowPart === '*' || dowPart === '?') || (dowPart === '1-5' && dow >= 1 && dow <= 5) || (parseInt(dowPart, 10) === dow);

    if (matchMin && matchHr && matchDom && matchDow) {
      runs.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return runs;
}

function updateCron() {
  var input = document.getElementById('cron-input');
  var dialectElem = document.getElementById('cron-dialect');
  var humanDescElem = document.getElementById('cron-human-desc');
  var nextRunsList = document.getElementById('cron-next-runs');
  var springAnnotationElem = document.getElementById('cron-spring-code');

  if (!input) return;

  var isSpring = dialectElem ? dialectElem.value === 'spring' : false;
  var expr = input.value.trim();

  // If dialect changed, adjust fields
  var parts = expr.split(/\s+/);
  if (isSpring && parts.length === 5) {
    expr = '0 ' + expr;
    input.value = expr;
  } else if (!isSpring && parts.length === 6) {
    parts.shift();
    expr = parts.join(' ');
    input.value = expr;
  }

  var human = parseCronHuman(expr, isSpring);
  if (humanDescElem) humanDescElem.textContent = '“' + human.charAt(0).toUpperCase() + human.slice(1) + '”';

  // Compute Next Runs
  var nextDates = computeNextRuns(expr, isSpring, 5);
  if (nextRunsList) {
    nextRunsList.innerHTML = '';
    if (nextDates.length === 0) {
      nextRunsList.innerHTML = '<li style="color: var(--text-muted, #94a3b8); padding: 4px 0;">No upcoming execution times could be projected. Check syntax.</li>';
    } else {
      for (var i = 0; i < nextDates.length; i++) {
        var d = nextDates[i];
        var li = document.createElement('li');
        li.style.padding = '6px 0';
        li.style.borderBottom = '1px solid var(--border-color-light, #f1f5f9)';
        li.style.fontFamily = 'monospace';
        li.style.fontSize = '0.92rem';
        li.innerHTML = '<span style="color: #10b981; font-weight: 700;">#' + (i + 1) + '</span> ' + d.toLocaleString('en-US', {
          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
        nextRunsList.appendChild(li);
      }
    }
  }

  // Spring Annotation Output
  if (springAnnotationElem) {
    var springExpr = isSpring ? expr : ('0 ' + expr);
    springAnnotationElem.textContent =
      '// Spring Boot @Scheduled Task\n' +
      '@Scheduled(cron = "' + springExpr + '", zone = "America/Toronto")\n' +
      'public void executeScheduledJob() {\n' +
      '    log.info("Cron job triggered successfully: {}");\n' +
      '}';
  }
}

function copyCronExpression() {
  var input = document.getElementById('cron-input');
  var btn = document.getElementById('btn-copy-cron');
  if (!input || !btn) return;

  navigator.clipboard.writeText(input.value).then(function() {
    var orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  });
}

function copySpringCode() {
  var codeElem = document.getElementById('cron-spring-code');
  var btn = document.getElementById('btn-copy-spring');
  if (!codeElem || !btn) return;

  navigator.clipboard.writeText(codeElem.textContent).then(function() {
    var orig = btn.textContent;
    btn.textContent = '✓ Copied Spring Code!';
    setTimeout(function() { btn.textContent = orig; }, 2000);
  });
}

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateCron);
} else {
  updateCron();
}
