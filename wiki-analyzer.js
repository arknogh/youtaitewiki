// Update HTML table header to include the new column
function updateTableHeader() {
    const tableHeader = document.querySelector('thead tr');
    if (!tableHeader.querySelector('th:last-child')?.textContent.includes('Admin Protected')) {
        const protectedTh = document.createElement('th');
        protectedTh.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        protectedTh.textContent = 'Admin Protected';
        tableHeader.appendChild(protectedTh);
    }
}

// Add a new filter option for admin protected pages
function updateFilterOptions() {
    const filterSelect = document.getElementById('tableFilter');
    if (!Array.from(filterSelect.options).some(option => option.value === 'admin_protected')) {
        const protectedOption = document.createElement('option');
        protectedOption.value = 'admin_protected';
        protectedOption.textContent = 'Admin Protected';
        filterSelect.appendChild(protectedOption);
    }
}

// Update the summary section to include admin protection statistics
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
    
    // Add protected pages count if element exists, otherwise create it
    const summaryContainer = document.querySelector('#dataSummary .grid');
    let protectedElement = document.getElementById('totalProtected');
    
    if (!protectedElement) {
        const protectedDiv = document.createElement('div');
        protectedDiv.className = 'bg-yellow-50 p-4 rounded-lg border border-yellow-200';
        protectedDiv.innerHTML = `
            <h3 class="text-lg font-medium text-yellow-800">Admin Protected</h3>
            <p class="text-3xl font-bold text-yellow-600" id="totalProtected">${protectedCount}</p>
        `;
        summaryContainer.appendChild(protectedDiv);
    } else {
        protectedElement.textContent = protectedCount;
    }
}

// Enhanced createCharts function to include admin protection chart
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
    
    // Calculate protected vs non-protected counts
    const protectedCount = allData.filter(item => item.is_admin_protected).length;
    const nonProtectedCount = allData.length - protectedCount;
    
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
    
    // Create protection chart container if it doesn't exist
    let protectionChartContainer = document.getElementById('protectionChartContainer');
    if (!protectionChartContainer) {
        const chartsSection = document.getElementById('chartsSection');
        const chartGrid = chartsSection.querySelector('.grid');
        
        protectionChartContainer = document.createElement('div');
        protectionChartContainer.id = 'protectionChartContainer';
        protectionChartContainer.className = 'bg-white rounded-lg shadow p-6';
        protectionChartContainer.innerHTML = `
            <h2 class="text-xl font-semibold mb-4">Admin Protection Status</h2>
            <div class="h-64">
                <canvas id="protectionChart"></canvas>
            </div>
        `;
        
        // Make the grid a 3-column grid on large screens
        chartGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8';
        chartGrid.appendChild(protectionChartContainer);
    }
    
    // Create protection chart
    const protectionCtx = document.getElementById('protectionChart').getContext('2d');
    
    if (window.protectionChart instanceof Chart) {
        window.protectionChart.destroy();
    }
    
    window.protectionChart = new Chart(protectionCtx, {
        type: 'pie',
        data: {
            labels: ['Admin Protected', 'Not Protected'],
            datasets: [{
                data: [protectedCount, nonProtectedCount],
                backgroundColor: [
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgb(255, 193, 7)',
                    'rgb(108, 117, 125)'
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

// Add the protection status to the table display
function displayTablePage() {
    updateTableHeader();
    
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
        
        // Admin Protected
        const protectedCell = createStatusCell(item.is_admin_protected);
        row.appendChild(protectedCell);
        
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

// Update the filter function to include admin protection
function filterTable() {
    const searchTerm = document.getElementById('tableSearch').value.toLowerCase();
    const filterType = document.getElementById('tableFilter').value;
    
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
        } else if (filterType === 'admin_protected') {
            matchesType = item.is_admin_protected;
        }
        
        return matchesSearch && matchesType;
    });
    
    // Reset to first page
    currentPage = 1;
    displayTablePage();
}

// Update sample and mock data to include the is_admin_protected field
function updateSampleData() {
    // Update sample data
    sampleData.forEach(item => {
        if (!('is_admin_protected' in item)) {
            item.is_admin_protected = Math.random() < 0.2; // 20% of pages are protected
        }
    });
}

// Update the mock data generation to include protection status
function generateMockData(count = 50) {
    const characterNames = ["Aerie", "Kunji", "Dango", "Ashe", "Belphegor", "Nekon0", "KL", "Miku-tan", "Cherry", "Shadow", 
                        "Rion", "Yuuto", "Kimmy", "Len", "Akira", "Hikaru", "Sora", "Yuki", "Hana", "Tsubaki"];
    const data = [];
    
    for (let i = 0; i < count; i++) {
        let newItem;
        
        // For character pages (about 60% of pages), use character templates or classes
        if (Math.random() < 0.6) {
            const name = characterNames[Math.floor(Math.random() * characterNames.length)];
            const pageType = Math.random();
            if (pageType < 0.33) {
                // Use infobox_character template
                newItem = {
                    title: `${name}${Math.random() < 0.3 ? " (YT)" : ""}`,
                    has_infobox_character_template: true,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: Math.random() < 0.3 // 30% of character pages are protected
                };
            } else if (pageType < 0.66) {
                // Use infobox class
                newItem = {
                    title: `${name}${Math.random() < 0.3 ? " (NND)" : ""}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: true,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: Math.random() < 0.3
                };
            } else {
                // Use article-table class
                newItem = {
                    title: `${name}${Math.random() < 0.3 ? " (male)" : ""}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: true,
                    has_other_table: false,
                    is_admin_protected: Math.random() < 0.3
                };
            }
        } 
        // For other pages (about 40%), use other structures or no tables
        else {
            const pageTypes = ["Event", "Challenge", "Group", "Album", "Song", "Guide", "Category", "List"];
            const pageType = pageTypes[Math.floor(Math.random() * pageTypes.length)];
            const tableType = Math.random();
            
            if (tableType < 0.25) {
                // Use other infobox template
                newItem = {
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: true,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: Math.random() < 0.1 // 10% of non-character pages are protected
                };
            } else if (tableType < 0.5) {
                // Use article-table
                newItem = {
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: true,
                    has_other_table: false,
                    is_admin_protected: Math.random() < 0.1
                };
            } else if (tableType < 0.75) {
                // Use other table
                newItem = {
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: true,
                    is_admin_protected: Math.random() < 0.1
                };
            } else {
                // No tables
                newItem = {
                    title: `${pageType}:${Math.floor(Math.random() * 100)}`,
                    has_infobox_character_template: false,
                    has_infobox_template: false,
                    has_infobox_class: false,
                    has_article_table_class: false,
                    has_other_table: false,
                    is_admin_protected: Math.random() < 0.1
                };
            }
        }
        
        data.push(newItem);
    }
    
    return data;
}

// Update the export to CSV function to include the protection status
function exportToCsv() {
    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Page Title,Infobox Character,Other Infobox,Infobox Class,Article Table,Other Table,Admin Protected\n";
    
    // Add data rows
    filteredData.forEach(item => {
        csvContent += `"${item.title}",${item.has_infobox_character_template},${item.has_infobox_template},${item.has_infobox_class},${item.has_article_table_class},${item.has_other_table},${item.is_admin_protected}\n`;
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
