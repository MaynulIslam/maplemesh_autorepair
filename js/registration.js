const API_BASE_URL = 'http://localhost:8001'; // Update with your API base URL

// Handle Customer Registration
async function handleCustomerRegistration(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register/customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Customer registration successful!');
            // Redirect to sign-in page
            window.location.href = 'sign-in.html';
        } else {
            throw new Error(result.detail || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}

// Handle Technician Registration
async function handleTechnicianRegistration(formData) {
    try {
        const url = `${API_BASE_URL}/api/auth/register/technician`;
        console.log('Technician Registration URL:', url);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Technician registration successful! Your account will be reviewed for approval.');
            // Redirect to sign-in page
            window.location.href = 'sign-in.html';
        } else {
            throw new Error(result.detail || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}