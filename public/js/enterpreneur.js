document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#entrepreneur-dashboard')) {
      initEntrepreneurDashboard();
    }
  });
  
  function initEntrepreneurDashboard() {
    const user = auth.currentUser;
    
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    
    // Load entrepreneur profile
    db.collection('entrepreneurs').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          const entrepreneurData = doc.data();
          document.querySelector('#entrepreneur-name').textContent = entrepreneurData.name;
          document.querySelector('#entrepreneur-bio').textContent = entrepreneurData.bio;
          document.querySelector('#entrepreneur-expertise').textContent = entrepreneurData.expertise.join(', ');
        } else {
          // Create empty profile if doesn't exist
          return db.collection('entrepreneurs').doc(user.uid).set({
            name: '',
            bio: '',
            expertise: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      })
      .then(() => {
        loadMyBusinessIdeas();
        loadInvestorInterests();
      })
      .catch(err => {
        logger.log(`Error loading entrepreneur data: ${err.message}`, 'error');
      });
  }
  
  function loadMyBusinessIdeas() {
    const user = auth.currentUser;
    
    db.collection('businessIdeas').where('authorId', '==', user.uid).get()
      .then(snapshot => {
        const ideasList = document.querySelector('#my-ideas-list');
        ideasList.innerHTML = '';
        
        snapshot.forEach(doc => {
          const idea = doc.data();
          const card = createMyIdeaCard(doc.id, idea);
          ideasList.appendChild(card);
        });
      })
      .catch(err => {
        logger.log(`Error loading business ideas: ${err.message}`, 'error');
      });
  }
  
  function createMyIdeaCard(id, idea) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = idea.title;
    
    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = idea.description;
    
    const status = document.createElement('p');
    status.className = 'card-text';
    status.innerHTML = `<strong>Status:</strong> ${idea.status}`;
    
    const funding = document.createElement('p');
    funding.className = 'card-text';
    funding.innerHTML = `<strong>Funding Needed:</strong> $${idea.fundingRequired}`;
    
    const roi = document.createElement('p');
    roi.className = 'card-text';
    roi.innerHTML = `<strong>Expected ROI:</strong> ${idea.expectedROI}%`;
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary mr-2';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      editIdea(id, idea);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      deleteIdea(id);
    });
    
    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(status);
    cardBody.appendChild(funding);
    cardBody.appendChild(roi);
    cardBody.appendChild(editBtn);
    cardBody.appendChild(deleteBtn);
    
    card.appendChild(cardBody);
    
    return card;
  }
  
  function loadInvestorInterests() {
    const user = auth.currentUser;
    
    db.collection('investmentInterests').where('entrepreneurId', '==', user.uid).get()
      .then(snapshot => {
        const interestsList = document.querySelector('#interests-list');
        interestsList.innerHTML = '';
        
        snapshot.forEach(doc => {
          const interest = doc.data();
          getInvestorDetails(interest.investorId)
            .then(investor => {
              const card = createInterestCard(doc.id, interest, investor);
              interestsList.appendChild(card);
            });
        });
      })
      .catch(err => {
        logger.log(`Error loading investor interests: ${err.message}`, 'error');
      });
  }
  
  function getInvestorDetails(investorId) {
    return db.collection('investors').doc(investorId).get()
      .then(doc => {
        return doc.data();
      });
  }
  
  function createInterestCard(id, interest, investor) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = investor.name;
    
    const bio = document.createElement('p');
    bio.className = 'card-text';
    bio.textContent = investor.bio;
    
    const range = document.createElement('p');
    range.className = 'card-text';
    range.innerHTML = `<strong>Investment Range:</strong> $${investor.investmentRange.min} - $${investor.investmentRange.max}`;
    
    const status = document.createElement('p');
    status.className = 'card-text';
    status.innerHTML = `<strong>Status:</strong> ${interest.status}`;
    
    const date = document.createElement('small');
    date.className = 'text-muted';
    date.textContent = new Date(interest.createdAt.toDate()).toLocaleDateString();
    
    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'btn btn-success mr-2';
    acceptBtn.textContent = 'Accept';
    acceptBtn.addEventListener('click', () => {
      updateInterestStatus(id, 'accepted');
    });
    
    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'btn btn-danger';
    rejectBtn.textContent = 'Reject';
    rejectBtn.addEventListener('click', () => {
      updateInterestStatus(id, 'rejected');
    });
    
    cardBody.appendChild(title);
    cardBody.appendChild(bio);
    cardBody.appendChild(range);
    cardBody.appendChild(status);
    cardBody.appendChild(date);
    
    if (interest.status === 'pending') {
      cardBody.appendChild(acceptBtn);
      cardBody.appendChild(rejectBtn);
    }
    
    card.appendChild(cardBody);
    
    return card;
  }
  
  function updateInterestStatus(interestId, status) {
    db.collection('investmentInterests').doc(interestId).update({
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      logger.log(`Updated interest status to ${status} for interest: ${interestId}`);
      loadInvestorInterests();
    })
    .catch(err => {
      logger.log(`Error updating interest status: ${err.message}`, 'error');
      alert('Error updating interest status');
    });
  }