/**
 * Main JavaScript file for the Percent Display application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add active class to current nav item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.parentElement.classList.add('active');
        }
    });
    
    // Animate section entries using IntersectionObserver if available
    if ('IntersectionObserver' in window) {
        const sections = document.querySelectorAll('main > div');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Once the animation is done, we can unobserve the element
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1, // Trigger when at least 10% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Slightly offset from bottom
        });
        
        sections.forEach(section => {
            section.classList.add('animate-section');
            sectionObserver.observe(section);
        });
    }
    
    // Add styling to the navigation buttons
    const navButtons = document.querySelectorAll('.navigation-buttons a');
    navButtons.forEach(button => {
        button.classList.add('animated-button');
    });
});

/**
 * Draw a circle segmented according to the given fraction
 * @param {HTMLElement} container - The DOM element to draw the circle in
 * @param {number} numerator - The numerator of the fraction
 * @param {number} denominator - The denominator of the fraction
 * @param {boolean} highlight - Whether to highlight the active segments
 */
function drawFractionCircle(container, numerator, denominator, highlight = true) {
    // Clear the container
    container.innerHTML = '';
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 5; // Slightly smaller than container
    
    // Draw the segments
    const segmentAngle = (Math.PI * 2) / denominator;
    
    for (let i = 0; i < denominator; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = (i + 1) * segmentAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Fill with appropriate color
        if (i < numerator && highlight) {
            ctx.fillStyle = '#fbbc05'; // Highlighted segments
        } else {
            ctx.fillStyle = '#4285f4'; // Regular segments
            ctx.globalAlpha = 0.7;
        }
        
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Draw segment borders
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    return canvas;
}
