document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#investor-dashboard')) {
      initInvestorDashboard();
    }
  });
  
  function initInvestorDashboard() {
    const user = auth.currentUser;
    
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    
    // Load investor profile
    db.collection('investors').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          const investorData = doc.data();
          document.querySelector('#investor-name').textContent = investorData.name;
          document.querySelector('#investor-bio').textContent = investorData.bio;
          document.querySelector('#investor-interests').textContent = investorData.interests.join(', ');
          document.querySelector('#investor-amount').textContent = `$${investorData.investmentRange.min} - $${investorData.investmentRange.max}`;
        } else {
          // Create empty profile if doesn't exist
          return db.collection('investors').doc(user.uid).set({
            name: '',
            bio: '',
            interests: [],
            investmentRange: { min: 0, max: 0 },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      })
      .then(() => {
        loadInvestmentOpportunities();
      })
      .catch(err => {
        logger.log(`Error loading investor data: ${err.message}`, 'error');
      });
  }
  
  function loadInvestmentOpportunities() {
    db.collection('businessIdeas').where('status', '==', 'active').get()
      .then(snapshot => {
        const opportunitiesList = document.querySelector('#opportunities-list');
        opportunitiesList.innerHTML = '';
        
        snapshot.forEach(doc => {
          const idea = doc.data();
          const card = createOpportunityCard(doc.id, idea);
          opportunitiesList.appendChild(card);
        });
      })
      .catch(err => {
        logger.log(`Error loading investment opportunities: ${err.message}`, 'error');
      });
  }
  
  function createOpportunityCard(id, idea) {
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
    
    const funding = document.createElement('p');
    funding.className = 'card-text';
    funding.innerHTML = `<strong>Funding Needed:</strong> $${idea.fundingRequired}`;
    
    const roi = document.createElement('p');
    roi.className = 'card-text';
    roi.innerHTML = `<strong>Expected ROI:</strong> ${idea.expectedROI}%`;
    
    const details = document.createElement('div');
    details.className = 'd-flex justify-content-between';
    
    const author = document.createElement('small');
    author.className = 'text-muted';
    author.textContent = `Posted by: ${idea.authorName}`;
    
    const date = document.createElement('small');
    date.className = 'text-muted';
    date.textContent = new Date(idea.createdAt.toDate()).toLocaleDateString();
    
    const investBtn = document.createElement('button');
    investBtn.className = 'btn btn-primary';
    investBtn.textContent = 'Express Interest';
    investBtn.addEventListener('click', () => {
      expressInterest(id, idea.authorId);
    });
    
    details.appendChild(author);
    details.appendChild(date);
    
    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(funding);
    cardBody.appendChild(roi);
    cardBody.appendChild(details);
    cardBody.appendChild(investBtn);
    
    card.appendChild(cardBody);
    
    return card;
  }
  
  function expressInterest(ideaId, entrepreneurId) {
    const user = auth.currentUser;
    
    db.collection('investmentInterests').add({
      investorId: user.uid,
      entrepreneurId: entrepreneurId,
      ideaId: ideaId,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      logger.log(`Investor expressed interest in idea: ${ideaId}`);
      alert('Your interest has been recorded. The entrepreneur will contact you.');
    })
    .catch(err => {
      logger.log(`Error expressing interest: ${err.message}`, 'error');
      alert('Error expressing interest');
    });
  }