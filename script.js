    // app id : 399515593191802 secrt :: 30ed2411cd9de4298ca77b6422f54b4a

// Global flag to check if Facebook SDK is ready
let fbSdkReady = false;

// Function to check if Facebook SDK is loaded
function checkFacebookSDKInitialization() {
    if (typeof FB !== 'undefined') {
        fbSdkReady = true;
        console.log("Facebook SDK is now initialized.");
    } else {
        console.log("Facebook SDK is not yet initialized. Retrying...");
        setTimeout(checkFacebookSDKInitialization, 100); // Retry every 100ms until SDK is loaded
    }
}

// Facebook SDK initialization
window.fbAsyncInit = function() {
    FB.init({
        appId      : '399515593191802', // Replace with your App ID
        cookie     : true,               // Enable cookies to allow the server to access the session
        xfbml      : true,               // Parse social plugins on this page
        version    : 'v16.0'             // Use a valid version like 'v16.0' or 'v15.0'
    });

    fbSdkReady = true; // Set the flag to true when SDK is initialized
    console.log("Facebook SDK initialized in fbAsyncInit.");

    // Check the current login status
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

// Load the Facebook SDK script asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Start checking if the SDK is initialized
checkFacebookSDKInitialization();

// Callback function to handle login status changes
function statusChangeCallback(response) {
    if (response.status === 'connected') {
        // User is logged in and authenticated
        const userId = response.authResponse.userID;
        const accessToken = response.authResponse.accessToken;
        console.log('User is logged in with ID:', userId);
        console.log('Access Token:', accessToken);
        
        // Store the access token in localStorage
        localStorage.setItem('fb_access_token', accessToken);
        displayConnectedAccounts();
    } else {
        // User is not logged in or authorized
        console.log('User is not authenticated.');
        displayConnectedAccounts();
    }
}

// Function to handle Facebook login
function fbLogin() {
    if (fbSdkReady) { // Check if SDK is initialized before calling login
        FB.login(function(response) {
            if (response.authResponse) {
                statusChangeCallback(response);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'email,public_profile,pages_manage_posts'}); // Request additional permissions as needed
    } else {
        console.log("Facebook SDK is not initialized yet. Please wait.");
    }
}

// Function to display connected accounts
function displayConnectedAccounts() {
    const connectedDiv = document.getElementById('connected-accounts');
    connectedDiv.innerHTML = `<h3>Connected Accounts:</h3>`;
    const fbAccessToken = localStorage.getItem('fb_access_token');
    
    if (fbAccessToken) {
        // Show Facebook as connected
        connectedDiv.innerHTML += `<p>Facebook Account Connected!</p>`;
    } else {
        connectedDiv.innerHTML += `<p>No accounts connected.</p>`;
    }
}

// Function to post a message to the user's Facebook feed
function postToFacebook(message) {
    const fbAccessToken = localStorage.getItem('fb_access_token');
    
    if (fbAccessToken) {
        FB.api(
            '/me/feed',
            'POST',
            { message: message, access_token: fbAccessToken },
            function(response) {
                if (!response || response.error) {
                    console.log('Error occurred:', response.error);
                    alert('Failed to publish post on Facebook.');
                } else {
                    console.log('Post ID: ' + response.id);
                    alert('Post successfully published on Facebook!');
                }
            }
        );
    } else {
        alert('Please connect your Facebook account first.');
    }
}

// Add event listener for the Facebook connect button only when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('connect-facebook').addEventListener('click', fbLogin);

    // Event listeners for post actions
    document.getElementById('publish-btn').addEventListener('click', function() {
        const postContent = document.getElementById('post-content').value;
        if (!postContent) {
            alert("Please enter some content to publish!");
            return;
        }
        postToFacebook(postContent);
    });

    document.getElementById('schedule-btn').addEventListener('click', function() {
        const postContent = document.getElementById('post-content').value;
        if (!postContent) {
            alert("Please enter some content to schedule!");
            return;
        }
        // Save scheduled post to localStorage (for now, we just save the content and date)
        let scheduledPosts = JSON.parse(localStorage.getItem('scheduledPosts')) || [];
        scheduledPosts.push({ content: postContent, date: new Date() });
        localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
        alert("Post scheduled! (Dummy schedule)");
    });

    // Initial call to display connected accounts
    displayConnectedAccounts();
});

