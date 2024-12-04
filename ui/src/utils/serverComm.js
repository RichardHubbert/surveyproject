import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Define base URL for API
const API_BASE_URL = 'http://localhost:5001'; // Make sure this matches your server port

// Get a fresh token
const getFreshToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error('No user signed in');
    }
    return user.getIdToken(true); // Force token refresh
};

const apiRequest = async (url, options) => {
    try {
        // Get a fresh token before making the request
        const token = await getFreshToken();
        localStorage.setItem('userToken', token); // Update stored token
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const fullUrl = `${API_BASE_URL}${url}`;
        console.log('Making request to:', fullUrl);

        const response = await fetch(fullUrl, { 
            ...options, 
            headers,
            mode: 'cors'
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Server error details:', {
                status: response.status,
                statusText: response.statusText,
                data
            });
            throw new Error(data.error || `Request failed: ${response.status} ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error('Request failed:', error);
        if (error.message.includes('id-token-expired')) {
            // If token expired, try to get a new one and retry the request
            await signInWithGoogle();
            return apiRequest(url, options); // Retry the request
        }
        throw error;
    }
};

export const post = (url, body) => {
    return apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(body),  // Ensure body is stringified
        headers: {
            'Accept': 'application/json'  // Explicitly request JSON response
        }
    });
};

export const get = (url) => {
    return apiRequest(url, {
        method: 'GET'
    });
};

export const saveSurvey = async (questions) => {
    const surveyData = {
        title: 'New Survey',
        questions: questions.map(q => ({
            ...q,
            id: q.id || Math.random().toString(36).substr(2, 9)
        }))
    };

    console.log('Saving survey data:', surveyData);
    return post('/api/surveys', surveyData);
};

export const signInWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const token = await result.user.getIdToken(true); // Force fresh token
        localStorage.setItem('userToken', token);
        return result.user;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
};

export const signOut = async () => {
    const auth = getAuth();
    try {
        await auth.signOut();
        localStorage.removeItem('userToken'); // Remove token on sign out
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

// Add a token refresh listener
export const initializeAuthListener = () => {
    const auth = getAuth();
    auth.onIdTokenChanged(async (user) => {
        if (user) {
            // Get and store new token when it's refreshed
            const token = await user.getIdToken();
            localStorage.setItem('userToken', token);
        } else {
            localStorage.removeItem('userToken');
        }
    });
}; 