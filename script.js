document.getElementById('submitBtn').addEventListener('click', function() {
    var email = document.getElementById('email').value;
    var submitBtn = document.getElementById('submitBtn');
    var inputDiv = document.querySelector('.input-div');
    var messageDiv = document.querySelector('.message-div');
    var progressBar = document.querySelector('.progress-bar');
    var progressBarInner = document.getElementById('progress-bar-inner');

    // Simple email validation check
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }

    // Disable the button and hide the input section
    submitBtn.disabled = true;
    inputDiv.style.display = 'none';
    progressBar.style.display = 'block'; // Show the progress bar

    // API Endpoint - replace with your actual endpoint
    var apiEndpoint = 'https://gt6qtnb5di.execute-api.eu-north-1.amazonaws.com/dev/authenticate';

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if (data.authenticated) {
            // Start polling for PDF generation status
            pollForPDF(email, progressBarInner, messageDiv);
        } else {
            // Handle unauthenticated user
            displayMessage(messageDiv, "You are not authorized to download this book.", "warning");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        displayMessage(messageDiv, "An error occurred while attempting to authenticate.", "error");
    });
});

function pollForPDF(email, progressBarInner, messageDiv) {
    var progress = 0;
    var maxProgressTime = 240000; // Maximum amount of time to fill the progress bar (e.g., 2 minutes)
    var pollInterval = 5000; // Interval at which to poll for the PDF status (e.g., every 5 seconds)
    var increment = (pollInterval / maxProgressTime) * 100; // Increment percentage
    var intervalId = setInterval(function() {
        progress += increment;
        progress = progress > 100 ? 100 : progress;
        progressBarInner.style.width = progress + '%';
        progressBarInner.textContent = Math.round(progress) + '%';

        // Check the status of the PDF
        checkPDFStatus(email, function(isReady, downloadUrl) {
            if (isReady) {
                clearInterval(intervalId); // Stop polling
                progressBarInner.style.width = '100%';
                progressBarInner.textContent = '100%';
                displayDownloadButton(messageDiv, downloadUrl);
            } else if (progress >= 100) {
                // If progress bar is full but PDF is still not ready, stop polling and show a message
                clearInterval(intervalId);
                displayMessage(messageDiv, "PDF generation is taking longer than expected. Please try again later.", "warning");
            }
        });

    }, pollInterval); // Poll every pollInterval ms
}

function displayDownloadButton(messageDiv, downloadUrl) {
    messageDiv.innerHTML = `
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
          <p class="font-bold">Success</p>
          <p>Click the below button to download the free ebook.</p>
        </div>
        <a href="${downloadUrl}" target="_blank" class="download-btn bg-[#a1c539] text-white px-6 py-2 rounded shadow mt-4">Download ebook</a>
    `;
    messageDiv.style.display = 'block';
}

function displayMessage(messageDiv, message, type) {
    var bgColor = type === "warning" ? "bg-orange-100 border-orange-500 text-orange-700" :
                  "bg-red-100 border-red-500 text-red-700";
    messageDiv.innerHTML = `
        <div class="${bgColor} border-l-4 p-4" role="alert">
          <p class="font-bold">${type === "warning" ? "Be Warned" : "Error"}</p>
          <p>${message}</p>
        </div>
    `;
    messageDiv.style.display = 'block';
}

function checkPDFStatus(email, callback) {
    var statusCheckEndpoint = 'https://gt6qtnb5di.execute-api.eu-north-1.amazonaws.com/dev/check-status?email=' + encodeURIComponent(email);

    fetch(statusCheckEndpoint)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'completed') {
            callback(true, data.url);  // PDF is ready, and here's the download URL
        } else {
            callback(false, null);  // PDF is not ready yet
        }
    })
    .catch(error => {
        console.error('Error checking PDF status:', error);
        callback(false, null);
    });
}