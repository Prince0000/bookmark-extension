document.addEventListener('DOMContentLoaded', function () {
    
    const token = localStorage.getItem('token');

    if (token) {
        const decodedToken = parseJwt(token);
        document.querySelector('#userId').value = decodedToken._id;

        document.querySelector('.login-container').style.display = 'none';
        document.querySelector('.bookmark-container').style.display = 'block';

        fetchCollections().catch(error => {
            console.error('Error fetching collections:', error);
        });
    } else {
        document.querySelector('.login-container').style.display = 'block';
        document.querySelector('.bookmark-container').style.display = 'none';
    }

    const loginBtn = document.getElementById('loginBtn');
    loginBtn.addEventListener('click', login);

    const bookmarkBtn = document.getElementById('bookmarkBtn');
    bookmarkBtn.addEventListener('click', addBookmark);
});

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://loud-liquid-production.up.railway.app/api/auth', {
            method: 'POST',
            body: JSON.stringify({ email: username, password: password }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();

        localStorage.setItem('token', data.data);

        document.querySelector('.login-container').style.display = 'none';
        document.querySelector('.bookmark-container').style.display = 'block';
        alert('Login successful!');

        await fetchCollections();
        location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed!');
    }
}

async function addBookmark() {
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    bookmarkBtn.innerHTML = "Loading";
    bookmarkBtn.disabled = true;

    try {
        const userId = document.getElementById('userId').value;
        const title = document.getElementById('title').value;
        const note = document.getElementById('note').value;
        const collectionData = document.getElementById('collection').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
        const url = document.getElementById('url').value;

        const payload = {
            userId,
            title,
            note,
            collectionData,
            tags,
            url
        };

        const response = await fetch('https://loud-liquid-production.up.railway.app/api/bookmark', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        bookmarkBtn.innerHTML = "Add Bookmark";
        bookmarkBtn.disabled = false;

        if (!response.ok) {
            throw new Error('Failed to add bookmark');
        }

        const data = await response.json();
        alert('Bookmark added successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add bookmark!');
    }
}

async function fetchCollections() {
    try {
        const response = await fetch('https://loud-liquid-production.up.railway.app/api/collections');

        if (!response.ok) {
            throw new Error('Failed to fetch collections');
        }

        const data = await response.json();

        const selectElement = document.getElementById('collection');

        selectElement.innerHTML = '';

        data.forEach(collection => {
            const option = document.createElement('option');
            option.value = collection.id;
            option.textContent = collection.name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
