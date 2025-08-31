/* add your code here */

document.addEventListener('DOMContentLoaded', () => {
  const stocksData = JSON.parse(stockContent);
  const userData = JSON.parse(userContent);

  let currentUser = null;
  const saveButton = document.querySelector('#btnSave');
  const deleteButton = document.querySelector('#btnDelete');
  const msg = document.querySelector('#message');
  const formFields = ['firstname', 'lastname', 'address', 'city', 'email'];

  // Initial render
  generateUserList(userData, stocksData);
  saveButton.disabled = true;

  // Enable Save only on form changes
  formFields.forEach(fieldId => {
    const input = document.querySelector(`#${fieldId}`);
    input.addEventListener('input', checkFormChanges);
  });

  // Save user
  saveButton.addEventListener('click', () => {
    if (!currentUser) return;
    const id = currentUser.id;
    let updated = false;

    for (let i = 0; i < userData.length; i++) {
      if (userData[i].id == id) {
        formFields.forEach(field => {
          userData[i].user[field] = document.querySelector(`#${field}`).value;
        });
        updated = true;
        currentUser = userData[i];
        populateForm(currentUser);
        renderPortfolio(currentUser, stocksData);
        generateUserList(userData, stocksData, id);
        saveButton.disabled = true;
        break;
      }
    }

    if (updated) showMessage("User updated successfully!", "green");
    else showMessage("Error: User not found!", "red");
  });

  // Delete user
  deleteButton.addEventListener('click', () => {
    if (!currentUser) return;
    const userId = currentUser.id;
    const index = userData.findIndex(u => u.id == userId);
    if (index > -1) {
      userData.splice(index, 1);
      clearForm();
      clearPortfolio();
      clearStockInfo();
      generateUserList(userData, stocksData);
      showMessage("User deleted successfully!", "red");
      currentUser = null;
      saveButton.disabled = true;
    }
  });

  // Show temporary message
  function showMessage(text, color) {
    msg.textContent = text;
    msg.style.color = color;
    msg.style.opacity = 1;
    msg.style.transition = "opacity 1s";
    setTimeout(() => { msg.style.opacity = 0; }, 2000);
  }

  // Enable Save button only if form changed
  function checkFormChanges() {
    if (!currentUser) {
      saveButton.disabled = true;
      return;
    }
    const changed = formFields.some(fieldId => document.querySelector(`#${fieldId}`).value !== currentUser.user[fieldId]);
    saveButton.disabled = !changed;
  }

  // Clear helpers
  function clearForm() {
    formFields.forEach(field => document.querySelector(`#${field}`).value = '');
    document.querySelector('#userID').value = '';
  }

  function clearPortfolio() {
    document.querySelector('.portfolio-list').innerHTML = '';
  }

  function clearStockInfo() {
    document.querySelector('#stockName').textContent = '';
    document.querySelector('#stockSector').textContent = '';
    document.querySelector('#stockIndustry').textContent = '';
    document.querySelector('#stockAddress').textContent = '';
    document.querySelector('#logo').src = '';
  }

  // Generate user list
  function generateUserList(users, stocks, highlightId = null) {
    const userList = document.querySelector('.user-list');
    userList.innerHTML = '';

    users.forEach(({ user, id }) => {
      const li = document.createElement('li');
      li.textContent = `${user.lastname}, ${user.firstname}`;
      li.setAttribute('id', id);

      if (highlightId && id == highlightId) {
        li.style.backgroundColor = '#d4edda';
        li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          li.style.transition = 'background 1s';
          li.style.backgroundColor = '';
        }, 1000);
      }

      userList.appendChild(li);
    });

    userList.onclick = (e) => {
      if (e.target.tagName === 'LI') {
        handleUserListClick(e.target.id, users, stocks);
      }
    };
  }

  // Handle user click
  function handleUserListClick(userId, users, stocks) {
    const user = users.find(u => u.id == userId);
    if (!user) return;
    currentUser = user;
    populateForm(user);
    renderPortfolio(user, stocks);
    clearStockInfo();
    checkFormChanges();
  }

  // Populate form
  function populateForm(data) {
    const { user, id } = data;
    document.querySelector('#userID').value = id;
    formFields.forEach(field => document.querySelector(`#${field}`).value = user[field]);
  }

  // Render portfolio
  function renderPortfolio(user, stocks) {
    const portfolioDetails = document.querySelector('.portfolio-list');
    portfolioDetails.innerHTML = '<h3>Symbol</h3><h3># Shares</h3><h3>Actions</h3>';

    user.portfolio.forEach(({ symbol, owned }) => {
      const container = document.createElement('div');
      container.className = 'portfolio-item';

      const symEl = document.createElement('p');
      symEl.textContent = symbol;

      const ownedEl = document.createElement('p');
      ownedEl.textContent = owned;

      const btn = document.createElement('button');
      btn.textContent = 'View';
      btn.id = symbol;
      btn.onclick = () => { viewStock(symbol, stocks); };

      container.appendChild(symEl);
      container.appendChild(ownedEl);
      container.appendChild(btn);
      portfolioDetails.appendChild(container);

      // Button animation
      btn.style.transform = 'scale(1.1)';
      setTimeout(() => btn.style.transform = '', 300);
    });
  }

  // Display stock info
  function viewStock(symbol, stocks) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;
    document.querySelector('#stockName').textContent = stock.name;
    document.querySelector('#stockSector').textContent = stock.sector;
    document.querySelector('#stockIndustry').textContent = stock.subIndustry;
    document.querySelector('#stockAddress').textContent = stock.address;
    document.querySelector('#logo').src = `logos/${symbol}.svg`;
  }
});

