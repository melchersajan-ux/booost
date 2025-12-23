let portfolios = JSON.parse(localStorage.getItem('portfolios')) || { 'default': [] };
let currentPortfolio = localStorage.getItem('currentPortfolio') || 'default';

// Load existing portfolio items on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPortfolioList();
    displayPortfolio();
});

function loadPortfolioList() {
    const select = document.getElementById('portfolioSelect');
    select.innerHTML = '';
    
    Object.keys(portfolios).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name.charAt(0).toUpperCase() + name.slice(1) + ' Portfolio';
        if (name === currentPortfolio) option.selected = true;
        select.appendChild(option);
    });
}

function createPortfolio() {
    const nameInput = document.getElementById('newPortfolioName');
    const name = nameInput.value.trim().toLowerCase();
    
    if (!name) {
        alert('Please enter a portfolio name');
        return;
    }
    
    if (portfolios[name]) {
        alert('Portfolio already exists');
        return;
    }
    
    portfolios[name] = [];
    currentPortfolio = name;
    saveToLocalStorage();
    loadPortfolioList();
    displayPortfolio();
    nameInput.value = '';
}

function switchPortfolio() {
    const select = document.getElementById('portfolioSelect');
    currentPortfolio = select.value;
    localStorage.setItem('currentPortfolio', currentPortfolio);
    displayPortfolio();
}

function deletePortfolio() {
    if (currentPortfolio === 'default') {
        alert('Cannot delete the default portfolio');
        return;
    }
    
    if (confirm(`Delete "${currentPortfolio}" portfolio and all its items?`)) {
        delete portfolios[currentPortfolio];
        currentPortfolio = 'default';
        localStorage.setItem('currentPortfolio', currentPortfolio);
        saveToLocalStorage();
        loadPortfolioList();
        displayPortfolio();
    }
}

function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select files to upload');
        return;
    }
    
    for (let file of files) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const item = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                data: e.target.result,
                uploadDate: new Date().toLocaleDateString(),
                description: '',
                isLink: false
            };
            
            portfolios[currentPortfolio].push(item);
            saveToLocalStorage();
            displayPortfolio();
        };
        
        reader.readAsDataURL(file);
    }
    
    fileInput.value = '';
}

function displayPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    grid.innerHTML = '';
    
    const items = portfolios[currentPortfolio] || [];
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'portfolio-item';
        
        let content = '';
        
        if (item.type.startsWith('image/')) {
            content = `<img src="${item.data}" alt="${item.name}">`;
        } else {
            let icon = '📄';
            if (item.type.includes('pdf')) icon = '📋';
            else if (item.name.toLowerCase().includes('.rar')) icon = '🗜️';
            else if (item.name.toLowerCase().includes('.zip')) icon = '📦';
            else if (item.name.toLowerCase().includes('.7z')) icon = '🗜️';
            
            content = `<div style="height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 5px;">
                <span style="font-size: 48px;">${icon}</span>
            </div>`;
        }
        
        itemDiv.innerHTML = `
            ${content}
            <h3 id="name-${item.id}">${item.name}</h3>
            <p id="desc-${item.id}" class="item-description">${item.description || 'No description'}</p>
            <p>Uploaded: ${item.uploadDate}</p>
            <div class="item-actions">
                <button class="edit-btn" onclick="editItem('${item.id}')">Edit</button>
                ${item.isLink ? 
                    `<button class="download-btn" onclick="openLink('${item.data}')">Open Link</button>` : 
                    `<button class="download-btn" onclick="downloadItem('${item.id}')">Download</button>`
                }
                <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        `;
        
        grid.appendChild(itemDiv);
    });
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        portfolios[currentPortfolio] = portfolios[currentPortfolio].filter(item => item.id != id);
        saveToLocalStorage();
        displayPortfolio();
    }
}

function downloadItem(id) {
    const item = portfolios[currentPortfolio].find(item => item.id == id);
    if (!item) return;
    
    const link = document.createElement('a');
    link.href = item.data;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveToLocalStorage() {
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
}

function editItem(id) {
    const item = portfolios[currentPortfolio].find(item => item.id == id);
    if (!item) return;
    
    const newName = prompt('Edit name:', item.name);
    if (newName === null) return;
    
    const newDescription = prompt('Edit description:', item.description || '');
    if (newDescription === null) return;
    
    item.name = newName.trim() || item.name;
    item.description = newDescription.trim();
    
    saveToLocalStorage();
    displayPortfolio();
}

function openLink(url) {
    window.open(url, '_blank');
}

function downloadRarFile() {
    // Downloads the Requirement.rar file from the same folder
    const link = document.createElement('a');
    link.href = 'Requirement.rar';
    link.download = 'Requirement.rar';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});