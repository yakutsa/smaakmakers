document.getElementById('submitBtn').addEventListener('click', function() {
    var email = document.getElementById('email').value;
    var submitBtn = document.getElementById('submitBtn');
    var inputDiv = document.querySelector('.input-div');
    var messageDiv = document.querySelector('.message-div');

    // Simple email validation check
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }

    // Disable the button and hide the input section
    submitBtn.disabled = true;
    inputDiv.style.display = 'none';

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
        if (data.authenticated && data.url) {
            messageDiv.innerHTML = `
                <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                  <p class="font-bold">Success</p>
                  <p>Click the below button to download the free ebook.</p>
                </div>
                <button class="download-btn bg-[#a1c539] text-white px-6 py-2 rounded shadow mt-4">Download ebook</button>
            `;
            messageDiv.style.display = 'block';

            document.querySelector('.download-btn').addEventListener('click', function() {
                window.location.href = data.url; // Use the pre-signed URL from the response
            });
        } else {
            messageDiv.innerHTML = `
                <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
                  <p class="font-bold">Be Warned</p>
                  <p>You are not authorized to download this book. If you have any questions, please contact test@test.com.</p>
                </div>
            `;
            messageDiv.style.display = 'block';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        messageDiv.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p class="font-bold">Error</p>
              <p>An error occurred while attempting to authenticate.</p>
            </div>
        `;
        messageDiv.style.display = 'block';
    });
});
