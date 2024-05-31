function getVideoElement() {
    return document.querySelector('video');
}

// Buffer to store recent URLs
const urlBuffer = [];
const bufferSize = 15; // Adjust the buffer size as needed

let muteTimeout;
let unmuteTimeout;
const muteDelay = 5000; // Set delay before muting
const unmuteDelay = 3000; // Set delay before unmuting

// Function to handle network requests
function handleNetworkRequest(entry) {
    const url = entry.name;
    const video = getVideoElement();
    
    if (!video) {
        console.log("No video element found.");
        return;
    }

    // Add the current URL to the buffer
    urlBuffer.push(url);
    // Ensure the buffer does not exceed the specified size
    if (urlBuffer.length > bufferSize) {
        urlBuffer.shift();
    }

    // Check if the buffer contains "inbreak"
    const inBreak = urlBuffer.some(u => u.includes("inbreak"));

    clearTimeout(unmuteTimeout);

    //Mute video when the buffer contains "inbreak"
    if (inBreak) { 
        clearTimeout(muteTimeout);
        muteTimeout = setTimeout(() => {
            if (!video.muted) {
                video.muted = true;
                console.log("Ad break detected, muting video.");
            }
        }, muteDelay);
    //Unmute video once the buffer no longer contains "inbreak"
    } else { 
        clearTimeout(muteTimeout);
        unmuteTimeout = setTimeout(() => {
            if (video.muted) {
                video.muted = false;
                console.log("Ad break ended, unmuting video.");
            } 
        }, unmuteDelay);
    }    
}

// Setup PerformanceObserver to monitor network requests
const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
        if (entry.entryType === 'resource') {
            handleNetworkRequest(entry);
        }
    });
});

observer.observe({ entryTypes: ['resource'] });

console.log("Ad muting script initialized.");
