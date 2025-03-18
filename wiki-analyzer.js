// Global state
let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Helper function to safely get DOM elements
function safeGetElement(id) {
    return document.getElementById(id);
}

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
    const dataSourceEl = safeGetElement('dataSource');
    if (dataSourceEl) {
        dataSourceEl.addEventListener('change', function() {
            const source = this.value;
            const fileUpload = safeGetElement('fileUploadSection');
            const scriptParams = safeGetElement('scriptParamsSection');
            
            if (fileUpload) fileUpload.classList.add('hidden');
            if (scriptParams) scriptParams.classList.add('hidden');
            
            if (source === 'upload' && fileUpload) {
                fileUpload.classList.remove('hidden');
            } else if (source === 'generate' && scriptParams) {
                scriptParams.classList.remove('hidden');
            }
        });
    }
    
    // Setup load data button
    const loadDataBtn = safeGetElement('loadDataBtn');
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', function() {
            const dataSourceEl = safeGetElement('dataSource');
            if (!dataSourceEl) return;
            
            const source = dataSourceEl.value;
            
            if (source === 'sample') {
                loadData(sampleData);
            } else if (source === 'upload') {
                const fileInput = safeGetElement('csvFile');
                if (fileInput && fileInput.files.length > 0) {
                    handleFileUpload(fileInput.files[0]);
                } else {
                    alert('Please select a CSV file first.');
                }
            } else if (source === 'generate') {
                showLoading();
                // In a real application, this would call a server-side script
                // For this demo, we'll generate mock data after a delay
                setTimeout(() => {
                    const limitEl = safeGetElement('limit');
                    const count = limitEl ? (parseInt(limitEl.value) || 50) : 50;
                    const data = generateMockData(count);
                    loadData(data);
                }, 1500);
            }
        });
    }
    
    // Setup generate data button
    const generateBtn = safeGetElement('generateDataBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            showLoading();
            // In a real application, this would call a server-side script
            // For this demo, we'll generate mock data after a delay
            setTimeout(() => {
                const limitEl = safeGetElement('limit');
                const count = limitEl ? (parseInt(limitEl.value) || 50) : 50;
                const data = generateMockData(count);
                loadData(data);
            }, 1500);
        });
    }
    
    // Setup export CSV button
    const exportBtn = safeGetElement('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportToCsv();
        });
    }
    
    // Setup table search
    const tableSearch = safeGetElement('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('input', function() {
            filterTable();
        });
    }
    
    // Setup table filter
    const tableFilter = safeGetElement('tableFilter');
    if (tableFilter) {
        tableFilter.addEventListener('change', function() {
            filterTable();
        });
    }
    
    // Setup protection filter
    const protectionFilter = safeGetElement('protectionFilter');
    if (protectionFilter) {
        protectionFilter.addEventListener('change', function() {
            filterTable();
        });
    }
    
    // Setup pagination
    const prevPageBtn = safeGetElement('prevPageBtn');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayTablePage();
            }
        });
    }
    
    const nextPageBtn = safeGetElement('nextPageBtn');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const maxPage = Math.ceil(filteredData.length / rowsPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                displayTablePage();
            }
        });
    }
});

function showLoading() {
    const loadingEl = safeGetElement('loadingIndicator');
    const dataSummaryEl = safeGetElement('dataSummary');
    const chartsEl = safeGetElement('chartsSection');
    const dataTableEl = safeGetElement('dataTableSection');
    
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (dataSummaryEl) dataSummaryEl.classList.add('hidden');
    if (chartsEl) chartsEl.classList.add('hidden');
    if (dataTableEl) dataTableEl.classList.add('hidden');
}

function hideLoading() {
    const loadingEl = safeGetElement('loadingIndicator');
    const dataSummaryEl = safeGetElement('dataSummary');
    const chartsEl = safeGetElement('chartsSection');
    const dataTableEl = safeGetElement('dataTableSection');
    
    if (loadingEl) loadingEl.classList.add('hidden');
    if (dataSummaryEl) dataSummaryEl.classList.remove('hidden');
    if (chartsEl) chartsEl.classList.remove('hidden');
    if (dataTableEl) dataTableEl.classList.remove('hidden');
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
    const totalPagesEl = safeGetElement('totalPages');
    if (totalPagesEl) totalPagesEl.textContent = allData.length;
    
    // Count only pages that have infobox templates (either character or other)
    const infoboxCount = allData.filter(item => 
        item.has_infobox_character_template || item.has_infobox_template
    ).length;
    
    // Count only pages that have any table structure
    const tableCount = allData.filter(item => 
        item.has_infobox_class || item.has_article_table_class || item.has_other_table
    ).length;
    
    const protectedCount = allData.filter(item => item.is_admin_protected).length;
    
    const totalInfoboxesEl = safeGetElement('totalInfoboxes');
    if (totalInfoboxesEl) totalInfoboxesEl.textContent = infoboxCount;
    
    const totalTablesEl = safeGetElement('totalTables');
    if (totalTablesEl) totalTablesEl.textContent = tableCount;
    
    const protectedPagesEl = safeGetElement('protectedPages');
    if (protectedPagesEl) protectedPagesEl.textContent = protectedCount;
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
    const infoboxCtx = safeGetElement('infoboxChart');
    if (infoboxCtx) {
        const ctx = infoboxCtx.getContext('2d');
        
        // Check if chart exists before trying to destroy it
        if (window.infoboxChart instanceof Chart) {
            window.infoboxChart.destroy();
        }
        
        window.infoboxChart = new Chart(ctx, {
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
    }
    
    // Create or update table chart
    const tableCtx = safeGetElement('tableChart');
    if (tableCtx) {
        const ctx = tableCtx.getContext('2d');
        
        // Check if chart exists before trying to destroy it
        if (window.tableChart instanceof Chart) {
            window.tableChart.destroy();
        }
        
        window.tableChart = new Chart(ctx, {
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
    }
    
    // Create or update protection chart
    const protectionCtx = safeGetElement('protectionChart');
    if (protectionCtx) {
        const ctx = protectionCtx.getContext('2d');
        
        // Check if chart exists before trying to destroy it
        if (window.protectionChart instanceof Chart) {
            window.protectionChart.destroy();
        }
        
        window.protectionChart = new Chart(ctx, {
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
    }
    
    // Create protection by type chart
    const protectionByTypeCtx = safeGetElement('protectionByTypeChart');
    if (protectionByTypeCtx) {
        const ctx = protectionByTypeCtx.getContext('2d');
        
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
        
        window.protectionByTypeChart = new Chart(ctx, {
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
}

function filterTable() {
    const searchTerm = safeGetElement('tableSearch') ? safeGetElement('tableSearch').value.toLowerCase() : '';
    const filterType = safeGetElement('tableFilter') ? safeGetElement('tableFilter').value : 'all';
    const protectionFilter = safeGetElement('protectionFilter') ? safeGetElement('protectionFilter').value : 'all';
    
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
    const tableBody = safeGetElement('dataTableBody');
    if (!tableBody) return;
    
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
        
        // Admin Protected (only add if we're using the updated HTML)
        if ('is_admin_protected' in item) {
            const protectedCell = createStatusCell(item.is_admin_protected);
            protectedCell.className += item.is_admin_protected ? ' bg-red-50' : '';
            row.appendChild(protectedCell);
        }
        
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
    const shownRowsEl = safeGetElement('shownRows');
    const totalRowsEl = safeGetElement('totalRows');
    const paginationInfoEl = safeGetElement('paginationInfo');
    
    if (shownRowsEl) shownRowsEl.textContent = pageData.length;
    if (totalRowsEl) totalRowsEl.textContent = filteredData.length;
    if (paginationInfoEl) paginationInfoEl.textContent = `Page ${currentPage} of ${Math.max(1, Math.ceil(filteredData.length / rowsPerPage))}`;
    
    // Update pagination buttons
    // Update pagination buttons
const prevPageBtn = safeGetElement('prevPageBtn');
const nextPageBtn = safeGetElement('nextPageBtn');

if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
if (nextPageBtn) nextPageBtn.disabled = currentPage >= Math.ceil(filteredData.length / rowsPerPage);
}

function createStatusCell(value) {
    const cell = document.createElement('td');
    cell.className = 'px-6 py-4 whitespace-nowrap text-center';
    
    // Make sure value is actually a boolean
    const isTrue = Boolean(value);
    
    if (isTrue) {
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
    let headers = "Page Title,";
    
    // Add is_admin_protected column if it exists
    if (filteredData.length > 0 && 'is_admin_protected' in filteredData[0]) {
        headers += "Admin Protected,";
    }
    
    headers += "Infobox Character,Other Infobox,Infobox Class,Article Table,Other Table\n";
    csvContent += headers;
    
    // Add data rows
    filteredData.forEach(item => {
        let row = `"${item.title}",`;
        
        // Add is_admin_protected value if it exists
        if ('is_admin_protected' in item) {
            row += `${item.is_admin_protected},`;
        }
        
        row += `${item.has_infobox_character_template},${item.has_infobox_template},${item.has_infobox_class},${item.has_article_table_class},${item.has_other_table}\n`;
        csvContent += row;
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
