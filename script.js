function getVideoElement() {
    return document.querySelector('video');
}

// Buffer to store recent URLs
const urlBuffer = [];
const bufferSize = 20; // Adjust the buffer size as needed

let inBreakDetectedAt = null; // Timestamp when "inbreak" was first detected
const muteDelay = 7000; // Set delay before muting in milliseconds

// Function to handle network requests
function handleNetworkRequest(entry) {
    const url = entry.name;
    const video = getVideoElement();
    console.log(video);
    
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

    //Mute and hide video when the buffer contains "inbreak"
    if (inBreak) { 
        if (!inBreakDetectedAt) {
            // Record the time when "inbreak" was first detected
            inBreakDetectedAt = Date.now();
            console.log("inbreak detected at", inBreakDetectedAt);
        }

        const elapsed = Date.now() - inBreakDetectedAt;

        if (elapsed >= muteDelay && !video.muted) {
            video.muted = true;
            video.hidden = true;
            console.log("Ad break detected, muting video after delay.");
        }
    }

    //Unmute and unhide video when buffer no longer contains "inbreak"
    else {
        console.log("NOT INBREAK");
        inBreakDetectedAt = null; // Reset the timestamp when "inbreak" is not detected
        if (video.muted) {
            video.muted = false;
            video.hidden = false;
            console.log("Ad break ended, unmuting video.");
        }
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
