// dl-menu options
$(function() {
  $( '#dl-menu' ).dlmenu({
    animationClasses : { classin : 'dl-animate-in', classout : 'dl-animate-out' }
  });
});
// Need this to show animation when go back in browser
window.onunload = function() {};

// Add lightbox class to all image links
$("a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif']").addClass("image-popup");

// FitVids options
$(function() {
  $(".content").fitVids();
});

// All others
$(document).ready(function() {
    // zoom in/zoom out animations
    if ($(".container").hasClass('fadeOut')) {
        $(".container").removeClass("fadeOut").addClass("fadeIn");
    }
    if ($(".wrapper").hasClass('fadeOut')) {
        $(".wrapper").removeClass("fadeOut").addClass("fadeIn");
    }
    $(".zoombtn").click(function() {
        $(".container").removeClass("fadeIn").addClass("fadeOut");
        $(".wrapper").removeClass("fadeIn").addClass("fadeOut");
    });
    // go up button
    $.goup({
        trigger: 500,
        bottomOffset: 10,
        locationOffset: 20,
        containerRadius: 0,
        containerColor: '#fff',
        arrowColor: '#000',
        goupSpeed: 'normal'
    });
	$('.image-popup').magnificPopup({
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">Image #%curr%</a> could not be loaded.',
    },
    removalDelay: 300, // Delay in milliseconds before popup is removed
    // Class that is added to body when popup is open.
    // make it unique to apply your CSS animations just to this exact popup
    mainClass: 'mfp-fade'
  });
});

function calculateTFSA() {
    const yearInput = document.getElementById('eligibilityYear').value;
    const startYear = parseInt(yearInput);

    if (!startYear || startYear < 1900 || startYear > 2026) {
        alert("Please enter a valid year between 1900 and 2026.");
        return;
    }

    const limits = {
        2009: 5000, 2010: 5000, 2011: 5000, 2012: 5000,
        2013: 5500, 2014: 5500, 2015: 10000,
        2016: 5500, 2017: 5500, 2018: 5500,
        2019: 6000, 2020: 6000, 2021: 6000, 2022: 6000,
        2023: 6500, 2024: 7000, 2025: 7000, 2026: 7000
    };


    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('tfsaResult');
    const breakdownWrapper = document.getElementById('breakdownWrapper');
    const breakdownBody = document.getElementById('breakdownBody');

    // Clear previous results
    breakdownBody.innerHTML = "";
    
    let total = 0;
    const effectiveStart = Math.max(2009, startYear);
    let tableHtml = "";

    for (let year = effectiveStart; year <= 2026; year++) {
        if (limits[year]) {
            total += limits[year];
            
            // Add row to table
            tableHtml += `<tr>
                <td style="padding: 10px; border: 1px solid #eee; text-align: left;">${year}</td>
                <td style="padding: 10px; border: 1px solid #eee; text-align: right;">$${limits[year].toLocaleString()}</td>
                <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">$${total.toLocaleString()}</td>
            </tr>`;
        }
    }

    breakdownBody.innerHTML = tableHtml;

    // Update the result title dynamically
    const resultTitle = document.getElementById('resultTitle');
    if (resultTitle) {
        resultTitle.textContent = `Estimated Cumulative Room (from ${startYear}):`;
    }

    // Use textContent for everything but the span to avoid full re-parse
    resultText.innerHTML = "<span>&#36;</span> " + total.toLocaleString();

    // Show the boxes
    resultBox.style.display = "block";
    if (breakdownWrapper) breakdownWrapper.style.display = "block";
}
