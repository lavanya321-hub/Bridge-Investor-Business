// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (document.querySelector('#dashboard')) {
            initDashboard();
        }
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showErrorToUser('Failed to initialize dashboard. Please refresh the page.');
    }
});

function initDashboard() {
    const user = auth.currentUser;
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    db.collection('users').doc(user.uid).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error('User document not found');
            }
            
            const userData = doc.data();
            
            // Update UI elements if they exist
            const userNameElement = document.querySelector('#user-name');
            const userTypeElement = document.querySelector('#user-type');
            
            if (userNameElement) userNameElement.textContent = userData.name || 'Unknown';
            if (userTypeElement) userTypeElement.textContent = userData.userType || 'Unknown';
            
            // Redirect based on user type
            const redirects = {
                'investor': 'investor.html',
                'entrepreneur': 'entrepreneur.html',
                'banker': 'banker.html',
                'advisor': 'advisor.html'
            };
            
            if (userData.userType && redirects[userData.userType]) {
                window.location.href = redirects[userData.userType];
            } else {
                logger.log(`Unknown user type: ${userData.userType}`, 'warning');
                // Optionally redirect to a default page or show error
            }
        })
        .catch(err => {
            logger.log(`Error fetching user data: ${err.message}`, 'error');
            showErrorToUser('Error loading user data. Please try again later.');
        });
}

// Load business categories with better error handling
function loadBusinessCategories() {
    const categoriesList = document.querySelector('#categories-list');
    if (!categoriesList) return;
    
    categoriesList.innerHTML = '<li class="list-group-item">Loading categories...</li>';
    
    db.collection('categories').get()
        .then(snapshot => {
            if (snapshot.empty) {
                categoriesList.innerHTML = '<li class="list-group-item">No categories found</li>';
                return;
            }
            
            categoriesList.innerHTML = '';
            
            snapshot.forEach(doc => {
                if (!doc.exists) return;
                
                const category = doc.data();
                const li = document.createElement('li');
                li.className = 'list-group-item clickable';
                li.textContent = category.name || 'Unnamed Category';
                li.addEventListener('click', () => {
                    loadBusinessIdeasByCategory(doc.id);
                });
                categoriesList.appendChild(li);
            });
        })
        .catch(err => {
            logger.log(`Error loading categories: ${err.message}`, 'error');
            categoriesList.innerHTML = '<li class="list-group-item text-danger">Failed to load categories</li>';
        });
}

function loadBusinessIdeasByCategory(categoryId) {
    const ideasList = document.querySelector('#ideas-list');
    if (!ideasList) return;
    
    ideasList.innerHTML = '<div class="card mb-3"><div class="card-body">Loading ideas...</div></div>';
    
    db.collection('businessIdeas').where('category', '==', categoryId).get()
        .then(snapshot => {
            if (snapshot.empty) {
                ideasList.innerHTML = '<div class="card mb-3"><div class="card-body">No ideas found in this category</div></div>';
                return;
            }
            
            ideasList.innerHTML = '';
            
            snapshot.forEach(doc => {
                if (!doc.exists) return;
                
                const idea = doc.data();
                try {
                    const card = createIdeaCard(doc.id, idea);
                    ideasList.appendChild(card);
                } catch (error) {
                    console.error('Error creating idea card:', error);
                }
            });
        })
        .catch(err => {
            logger.log(`Error loading business ideas: ${err.message}`, 'error');
            ideasList.innerHTML = '<div class="card mb-3"><div class="card-body text-danger">Failed to load ideas</div></div>';
        });
}

function createIdeaCard(id, idea) {
    if (!id || !idea) throw new Error('Invalid arguments for createIdeaCard');
    
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    // Title
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = idea.title || 'Untitled Idea';
    
    // Description
    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = idea.description || 'No description provided';
    
    // Details container
    const details = document.createElement('div');
    details.className = 'd-flex justify-content-between mt-3';
    
    // Author
    const author = document.createElement('small');
    author.className = 'text-muted';
    author.textContent = `Posted by: ${idea.authorName || 'Unknown'}`;
    
    // Date
    const date = document.createElement('small');
    date.className = 'text-muted';
    try {
        date.textContent = idea.createdAt ? 
            new Date(idea.createdAt.toDate()).toLocaleDateString() : 
            'Date unknown';
    } catch (error) {
        date.textContent = 'Date unknown';
    }
    
    details.appendChild(author);
    details.appendChild(date);
    
    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(details);
    
    card.appendChild(cardBody);
    
    return card;
}

// Helper function to show errors to users
function showErrorToUser(message) {
    const errorContainer = document.querySelector('#error-container') || document.body;
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    errorContainer.prepend(alertDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}