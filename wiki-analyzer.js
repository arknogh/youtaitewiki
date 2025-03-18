// Global state
let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Sample data for demonstration
const sampleData = [
    {title: "Character1", has_infobox_character_template: true, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: true},
    {title: "Character2", has_infobox_character_template: true, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: false},
    {title: "Character3", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: true, has_article_table_class: false, has_other_table: false, is_admin_protected: true},
    {title: "Character4", has_infobox_character_template: false, has_infobox_template: true, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: false},
    {title: "ChallengePage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: false, has_article_table_class: true, has_other_table: false, is_admin_protected: true},
    {title: "EventPage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: false, has_article_table_class: true, has_other_table: false, is_admin_protected: false},
    {title: "GroupPage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: true, is_admin_protected: true},
    {title: "InfoPage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: false},
    {title: "Tutorial", has_infobox_character_template: true, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: true},
    {title: "AboutPage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: false},
    {title: "AshePage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: true, has_article_table_class: false, has_other_table: false, is_admin_protected: false},
    {title: "BelphegorPage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: true, has_article_table_class: false, has_other_table: false, is_admin_protected: true},
    {title: "NekonPage", has_infobox_character_template: false, has_infobox_template: false, has_infobox_class: false, has_article_table_class: true, has_other_table: false, is_admin_protected: false},
    {title: "KunjiPage", has_infobox_character_template: true, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: true},
    {title: "DangoPage", has_infobox_character_template: true, has_infobox_template: false, has_infobox_class: false, has_article_table_class: false, has_other_table: false, is_admin_protected: false}
];

// Mock generation of random data (simulates what would be returned from pywikibot)
function generateMockData(count = 50) {
    const characterNames = ["Aerie", "Kunji", "Dango", "Ashe", "Belphegor", "Nekon0", "KL", "Miku-tan", "Cherry", "Shadow", 
                        "Rion", "Yuuto", "Kimmy", "Len", "Akira", "Hikaru", "Sora", "Yuki", "Hana", "Tsubaki"];
    const data = [];
    
    for (let i = 0; i < count; i++) {
        // For character pages (about 60% of pages), use character templates or classes
        if (Math.random() < 0.6) {
            const name = characterNames[Math.floor(Math.random() * characterNames.length)];
            const pageType = Math.random();
            const isProtected = Math.random() < 0.3; // 30% chance of being admin protected
            
            if (pageType < 0.33) {
                // Use infobox_character template
                data.push({
                    title: `${name}${Math.random() < 0.3 ? " (YT)" : ""}`,
                    has_infobox_character_template: true,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: isProtected
                });
            } else if (pageType < 0.66) {
                // Use infobox class
                data.push({
                    title: `${name}${Math.random() < 0.3 ? " (NND)" : ""}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: true,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: isProtected
                });
            } else {
                // Use article-table class
                data.push({
                    title: `${name}${Math.random() < 0.3 ? " (male)" : ""}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: true,
                    has_other_table: false,
                    is_admin_protected: isProtected
                });
            }
        } 
        // For other pages (about 40%), use other structures or no tables
        else {
            const pageTypes = ["Event", "Challenge", "Group", "Album", "Song", "Guide", "Category", "List"];
            const pageType = pageTypes[Math.floor(Math.random() * pageTypes.length)];
            const tableType = Math.random();
            const isProtected = Math.random() < 0.2; // 20% chance of being admin protected for non-character pages
            
            if (tableType < 0.25) {
                // Use other infobox template
                data.push({
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: true,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: isProtected
                });
            } else if (tableType < 0.5) {
                // Use article-table
                data.push({
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: true,
                    has_other_table: false,
                    is_admin_protected: isProtected
                });
            } else if (tableType < 0.75) {
                // Use other table
                data.push({
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: true,
                    is_admin_protected: isProtected
                });
            } else {
                // No tables
                data.push({
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: isProtected
                });
            }
        }
    }
    
    return data;
}

// Initialize elements
document.addEventListener('DOMContentLoaded', function() {
    // Setup data source change handler
    document.getElementById('dataSource').addEventListener('change', function() {
        const source = this.value;
        document.getElementById('fileUploadSection').classList.add('hidden');
        document.getElementById('scriptParamsSection').classList.add('hidden');
        
        if (source === 'upload') {
            document.getElementById('fileUploadSection').classList.remove('hidden');
        } else if (source === 'generate') {
            document.getElementById('scriptParamsSection').classList.remove('hidden');
        }
    });
    
    // Setup load data button
    document.getElementById('loadDataBtn').addEventListener('click', function() {
        const source = document.getElementById('dataSource').value;
        
        if (source === 'sample') {
            loadData(sampleData);
        } else if (source === 'upload') {
            const fileInput = document.getElementById('csvFile');
            if (fileInput.files.length > 0) {
                handleFileUpload(fileInput.files[0]);
            } else {
                alert('Please select a CSV file first.');
            }
        } else if (source === 'generate') {
            showLoading();
            // In a real application, this would call a server-side script
            // For this demo, we'll generate mock data after a delay
            setTimeout(() => {
                const count = parseInt(document.getElementById('limit').value) || 50;
                const data = generateMockData(count);
                loadData(data);
            }, 1500);
        }
    });
    
    // Setup generate data button
    document.getElementById('generateDataBtn').addEventListener('click', function() {
        showLoading();
        // In a real application, this would call a server-side script
        // For this demo, we'll generate mock data after a delay
        setTimeout(() => {
            const count = parseInt(document.getElementById('limit').value) || 50;
            const data = generateMockData(count);
            loadData(data);
        }, 1500);
    });
    
    // Setup export CSV button
    document.getElementById('exportCsvBtn').addEventListener('click', function() {
        exportToCsv();
    });
    
    // Setup table search
    document.getElementById('tableSearch').addEventListener('input', function() {
        filterTable();
    });
    
    // Setup table filter
    document.getElementById('tableFilter').addEventListener('change', function() {
        filterTable();
    });
    
    // Setup protection filter
    document.getElementById('protectionFilter').addEventListener('change', function() {
        filterTable();
    });
    
    // Setup pagination
    document.getElementById('prevPageBtn').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayTablePage();
        }
    });
    
    document.getElementById('nextPageBtn').addEventListener('click', function() {
        const maxPage = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            displayTablePage();
        }
    });
});

function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('dataSummary').classList.add('hidden');
    document.getElementById('chartsSection').classList.add('hidden');
    document.getElementById('dataTableSection').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
    document.getElementById('dataSummary').classList.remove('hidden');
    document.getElementById('chartsSection').classList.remove('hidden');
    document.getElementById('dataTableSection').classList.remove('hidden');
}

function handleFileUpload(file) {
    showLoading();
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            // Convert string boolean values to actual booleans if needed
            const processedData = results.data.map(row => {
                const processedRow = {...row};
                for (const key in processedRow) {
                    if (processedRow[key] === 'true') processedRow[key] = true;
                    if (processedRow[key] === 'false') processedRow[key] = false;
                    if (processedRow[key] === 'TRUE') processedRow[key] = true;
                    if (processedRow[key] === 'FALSE') processedRow[key] = false;
                }
                return processedRow;
            });
            
            loadData(processedData);
        },
        error: function(error) {
            hideLoading();
            alert('Error parsing CSV: ' + error);
        }
    });
}

function loadData(data) {
    allData = data;
    filteredData = [...data];
    currentPage = 1;
    
    updateSummary();
    createCharts();
    displayTablePage();
    
    hideLoading();
}

function updateSummary() {
    // Update total counts
    document.getElementById('totalPages').textContent = allData.length;
    
    const infoboxCharCount = allData.filter(item => item.has_infobox_character_template).length;
    const infoboxTemplateCount = allData.filter(item => item.has_infobox_template).length;
    const infoboxCount = infoboxCharCount + infoboxTemplateCount;
    
    const infoboxClassCount = allData.filter(item => item.has_infobox_class).length;
    const articleTableCount = allData.filter(item => item.has_article_table_class).length;
    const otherTableCount = allData.filter(item => item.has_other_table).length;
    const tableCount = infoboxClassCount + articleTableCount + otherTableCount;
    
    const protectedCount = allData.filter(item => item.is_admin_protected).length;
    
    document.getElementById('totalInfoboxes').textContent = infoboxCount;
    document.getElementById('totalTables').textContent = tableCount;
    document.getElementById('protectedPages').textContent = protectedCount;
}

function createCharts() {
    // Calculate data for charts
    const infoboxCharCount = allData.filter(item => item.has_infobox_character_template).length;
    const infoboxTemplateCount = allData.filter(item => item.has_infobox_template).length;
    const infoboxClassCount = allData.filter(item => item.has_infobox_class).length;
    const articleTableCount = allData.filter(item => item.has_article_table_class).length;
    const otherTableCount = allData.filter(item => item.has_other_table).length;
    
    // Calculate pages with no tables/infoboxes
    const noTableCount = allData.filter(item => 
        !item.has_infobox_character_template && 
        !item.has_infobox_template && 
        !item.has_infobox_class && 
        !item.has_article_table_class && 
        !item.has_other_table
    ).length;
    
    // Protection data
    const protectedCount = allData.filter(item => item.is_admin_protected).length;
    const unprotectedCount = allData.length - protectedCount;
    
    // Create or update infobox chart
    const infoboxCtx = document.getElementById('infoboxChart').getContext('2d');
    
    // Check if chart exists before trying to destroy it
    if (window.infoboxChart instanceof Chart) {
        window.infoboxChart.destroy();
    }
    
    window.infoboxChart = new Chart(infoboxCtx, {
        type: 'pie',
        data: {
            labels: ['Infobox Character', 'Other Infobox Templates', 'Infobox Class', 'No Infobox'],
            datasets: [{
                data: [infoboxCharCount, infoboxTemplateCount, infoboxClassCount, 
                        allData.length - (infoboxCharCount + infoboxTemplateCount + infoboxClassCount)],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(201, 203, 207, 0.7)'
                ],
                borderColor: [
                    'rgb(54, 162, 235)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
    
    // Create or update table chart
    const tableCtx = document.getElementById('tableChart').getContext('2d');
    
    // Check if chart exists before trying to destroy it
    if (window.tableChart instanceof Chart) {
        window.tableChart.destroy();
    }
    
    window.tableChart = new Chart(tableCtx, {
        type: 'pie',
        data: {
            labels: ['Infobox Class', 'Article Table', 'Other Tables', 'No Tables'],
            datasets: [{
                data: [infoboxClassCount, articleTableCount, otherTableCount, noTableCount],
                backgroundColor: [
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(201, 203, 207, 0.7)'
                ],
                borderColor: [
                    'rgb(153, 102, 255)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 99, 132)',
                    'rgb(201, 203, 207)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
    
    // Create or update protection chart
    const protectionCtx = document.getElementById('protectionChart').getContext('2d');
    
    // Check if chart exists before trying to destroy it
    if (window.protectionChart instanceof Chart) {
        window.protectionChart.destroy();
    }
    
    window.protectionChart = new Chart(protectionCtx, {
        type: 'pie',
        data: {
            labels: ['Admin Protected', 'Not Protected'],
            datasets: [{
                data: [protectedCount, unprotectedCount],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
    
    // Create protection by type chart
    const protectionByTypeCtx = document.getElementById('protectionByTypeChart').getContext('2d');
    
    // Check if chart exists before trying to destroy it
    if (window.protectionByTypeChart instanceof Chart) {
        window.protectionByTypeChart.destroy();
    }
    
    // Get protected count by page type
    const protectedCharCount = allData.filter(item => 
        item.is_admin_protected && item.has_infobox_character_template
    ).length;
    
    const protectedOtherInfoboxCount = allData.filter(item => 
        item.is_admin_protected && item.has_infobox_template
    ).length;
    
    const protectedInfoboxClassCount = allData.filter(item => 
        item.is_admin_protected && item.has_infobox_class
    ).length;
    
    const protectedArticleTableCount = allData.filter(item => 
        item.is_admin_protected && item.has_article_table_class
    ).length;
    
    const protectedOtherTableCount = allData.filter(item => 
        item.is_admin_protected && item.has_other_table
    ).length;
    
    const protectedNoTableCount = allData.filter(item => 
        item.is_admin_protected && 
        !item.has_infobox_character_template && 
        !item.has_infobox_template &&
        !item.has_infobox_class &&
        !item.has_article_table_class &&
        !item.has_other_table
    ).length;
    
    window.protectionByTypeChart = new Chart(protectionByTypeCtx, {
        type: 'bar',
        data: {
            labels: [
                'Character Infobox', 
                'Other Infobox', 
                'Infobox Class', 
                'Article Table', 
                'Other Table', 
                'No Table'
            ],
            datasets: [{
                label: 'Protected Pages by Type',
                data: [
                    protectedCharCount,
                    protectedOtherInfoboxCount,
                    protectedInfoboxClassCount,
                    protectedArticleTableCount,
                    protectedOtherTableCount,
                    protectedNoTableCount
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function filterTable() {
    const searchTerm = document.getElementById('tableSearch').value.toLowerCase();
    const filterType = document.getElementById('tableFilter').value;
    const protectionFilter = document.getElementById('protectionFilter').value;
    
    filteredData = allData.filter(item => {
        // Apply search filter
        const matchesSearch = searchTerm === '' || item.title.toLowerCase().includes(searchTerm);
        
        // Apply type filter
        let matchesType = true;
        if (filterType === 'infobox_character') {
            matchesType = item.has_infobox_character_template;
        } else if (filterType === 'infobox_template') {
            matchesType = item.has_infobox_template;
        } else if (filterType === 'infobox_class') {
            matchesType = item.has_infobox_class;
        } else if (filterType === 'article_table') {
            matchesType = item.has_article_table_class;
        } else if (filterType === 'other_table') {
            matchesType = item.has_other_table;
        } else if (filterType === 'no_table') {
            matchesType = !item.has_infobox_character_template && 
                         !item.has_infobox_template && 
                         !item.has_infobox_class && 
                         !item.has_article_table_class && 
                         !item.has_other_table;
        }
        
        // Apply protection filter
        let matchesProtection = true;
        if (protectionFilter === 'protected') {
            matchesProtection = item.is_admin_protected;
        } else if (protectionFilter === 'unprotected') {
            matchesProtection = !item.is_admin_protected;
        }
        
        return matchesSearch && matchesType && matchesProtection;
    });
    
    // Reset to first page
    currentPage = 1;
    displayTablePage();
}

function displayTablePage() {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = '';
    
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, filteredData.length);
    
    const pageData = filteredData.slice(startIdx, endIdx);
    
    pageData.forEach(item => {
        const row = document.createElement('tr');
        
        // Page title
        const titleCell = document.createElement('td');
        titleCell.className = 'px-6 py-4 whitespace-nowrap';
        titleCell.textContent = item.title;
        row.appendChild(titleCell);
        
        // Admin Protected
        const protectedCell = createStatusCell(item.is_admin_protected);
        protectedCell.className += item.is_admin_protected ? ' bg-red-50' : '';
        row.appendChild(protectedCell);
        
        // Infobox Character
        const infoboxCharCell = createStatusCell(item.has_infobox_character_template);
        row.appendChild(infoboxCharCell);
        
        // Other Infobox
        const infoboxCell = createStatusCell(item.has_infobox_template);
        row.appendChild(infoboxCell);
        
        // Infobox Class
        const infoboxClassCell = createStatusCell(item.has_infobox_class);
        row.appendChild(infoboxClassCell);
        
        // Article Table
        const articleTableCell = createStatusCell(item.has_article_table_class);
        row.appendChild(articleTableCell);
        
        // Other Table
        const otherTableCell = createStatusCell(item.has_other_table);
        row.appendChild(otherTableCell);
        
        tableBody.appendChild(row);
    });
    
    // Update pagination info
    document.getElementById('shownRows').textContent = pageData.length;
    document.getElementById('totalRows').textContent = filteredData.length;
    document.getElementById('paginationInfo').textContent = `Page ${currentPage} of ${Math.max(1, Math.ceil(filteredData.length / rowsPerPage))}`;
    
    // Update pagination buttons
    document.getElementById('prevPageBtn').disabled = currentPage <= 1;
    document.getElementById('nextPageBtn').disabled = currentPage >= Math.ceil(filteredData.length / rowsPerPage);
}

function createStatusCell(value) {
    const cell = document.createElement('td');
    cell.className = 'px-6 py-4 whitespace-nowrap text-center';
    
    if (value) {
        cell.innerHTML = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><i class="fas fa-check mr-1"></i>Yes</span>';
    } else {
        cell.innerHTML = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><i class="fas fa-times mr-1"></i>No</span>';
    }
    
    return cell;
}

function exportToCsv() {
    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Page Title,Admin Protected,Infobox Character,Other Infobox,Infobox Class,Article Table,Other Table\n";
    
    // Add data rows
    filteredData.forEach(item => {
        csvContent += `"${item.title}",${item.is_admin_protected},${item.has_infobox_character_template},${item.has_infobox_template},${item.has_infobox_class},${item.has_article_table_class},${item.has_other_table}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wiki_table_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Download the file
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}
