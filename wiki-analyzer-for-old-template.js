// Global state for the template analyzer
let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;

// Helper function to safely get DOM elements
function getElement(id) {
    return document.getElementById(id);
}

// Sample data for demonstration
const sampleData = [
    {title: "Singer1", singer_template: true, youtaite_infobox: false, character_infobox: false, is_admin_protected: true},
    {title: "Singer2", singer_template: true, youtaite_infobox: false, character_infobox: false, is_admin_protected: false},
    {title: "Character1", singer_template: false, youtaite_infobox: false, character_infobox: true, is_admin_protected: true},
    {title: "Character2", singer_template: false, youtaite_infobox: false, character_infobox: true, is_admin_protected: false},
    {title: "Youtaite1", singer_template: false, youtaite_infobox: true, character_infobox: false, is_admin_protected: true},
    {title: "Youtaite2", singer_template: false, youtaite_infobox: true, character_infobox: false, is_admin_protected: false},
    {title: "MultipleSinger", singer_template: true, youtaite_infobox: true, character_infobox: false, is_admin_protected: true},
    {title: "NoTemplate", singer_template: false, youtaite_infobox: false, character_infobox: false, is_admin_protected: false}
];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Data source selection
    const dataSourceEl = getElement('dataSource');
    if (dataSourceEl) {
        dataSourceEl.addEventListener('change', function() {
            const source = this.value;
            const fileUploadSection = getElement('fileUploadSection');
            
            if (fileUploadSection) {
                if (source === 'upload') {
                    fileUploadSection.classList.remove('hidden');
                } else {
                    fileUploadSection.classList.add('hidden');
                }
            }
        });
    }
    
    // Load data button
    const loadDataBtn = getElement('loadDataBtn');
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', function() {
            const dataSourceEl = getElement('dataSource');
            if (!dataSourceEl) return;
            
            const source = dataSourceEl.value;
            
            if (source === 'sample') {
                loadData(sampleData);
            } else if (source === 'upload') {
                const fileInput = getElement('csvFile');
                if (fileInput && fileInput.files.length > 0) {
                    handleFileUpload(fileInput.files[0]);
                } else {
                    alert('Please select a CSV file first.');
                }
            }
        });
    }
    
    // Export CSV button
    const exportBtn = getElement('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCsv);
    }
    
    // Search and filter inputs
    const tableSearch = getElement('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('input', filterTable);
    }
    
    // Template filter dropdown
    const templateFilter = getElement('templateFilter');
    if (templateFilter) {
        templateFilter.addEventListener('change', filterTable);
    }
    
    // Protection status filter
    const protectionFilter = getElement('protectionFilter');
    if (protectionFilter) {
        protectionFilter.addEventListener('change', filterTable);
    }
    
    // Pagination buttons
    const prevPageBtn = getElement('prevPageBtn');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayTablePage();
            }
        });
    }
    
    const nextPageBtn = getElement('nextPageBtn');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const maxPage = Math.ceil(filteredData.length / rowsPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                displayTablePage();
            }
        });
    }
}

function showLoading() {
    const loadingIndicator = getElement('loadingIndicator');
    const dataSummary = getElement('dataSummary');
    const chartsSection = getElement('chartsSection');
    const dataTableSection = getElement('dataTableSection');
    
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (dataSummary) dataSummary.classList.add('hidden');
    if (chartsSection) chartsSection.classList.add('hidden');
    if (dataTableSection) dataTableSection.classList.add('hidden');
}

function hideLoading() {
    const loadingIndicator = getElement('loadingIndicator');
    const dataSummary = getElement('dataSummary');
    const chartsSection = getElement('chartsSection');
    const dataTableSection = getElement('dataTableSection');
    
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    if (dataSummary) dataSummary.classList.remove('hidden');
    if (chartsSection) chartsSection.classList.remove('hidden');
    if (dataTableSection) dataTableSection.classList.remove('hidden');
}

function handleFileUpload(file) {
    showLoading();
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: function(results) {
            // Convert string boolean values to actual booleans
            const processedData = results.data.map(row => {
                const processedRow = {...row};
                for (const key in processedRow) {
                    // Skip title field
                    if (key === 'title') continue;
                    
                    // Convert boolean strings to actual booleans
                    if (typeof processedRow[key] === 'string') {
                        const lowerValue = processedRow[key].toLowerCase();
                        if (lowerValue === 'true') processedRow[key] = true;
                        else if (lowerValue === 'false') processedRow[key] = false;
                    }
                }
                return processedRow;
            });
            
            // Filter out any rows that don't have a title
            const validData = processedData.filter(row => row.title && row.title.trim() !== '');
            
            loadData(validData);
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
    const totalPagesEl = getElement('totalPages');
    if (totalPagesEl) totalPagesEl.textContent = allData.length;
    
    // Count pages with each template
    const singerTemplateCount = allData.filter(item => item.singer_template === true).length;
    const youtaiteInfoboxCount = allData.filter(item => item.youtaite_infobox === true).length;
    const characterInfoboxCount = allData.filter(item => item.character_infobox === true).length;
    
    // Count pages with any template
    const anyTemplateCount = allData.filter(item => 
        item.singer_template === true || 
        item.youtaite_infobox === true || 
        item.character_infobox === true
    ).length;
    
    // Count protected pages
    const protectedCount = allData.filter(item => item.is_admin_protected === true).length;
    
    // Update summary display
    const singerCountEl = getElement('singerTemplateCount');
    const youtaiteCountEl = getElement('youtaiteInfoboxCount');
    const characterCountEl = getElement('characterInfoboxCount');
    const totalTemplatesEl = getElement('totalTemplates');
    const protectedPagesEl = getElement('protectedPages');
    
    if (singerCountEl) singerCountEl.textContent = singerTemplateCount;
    if (youtaiteCountEl) youtaiteCountEl.textContent = youtaiteInfoboxCount;
    if (characterCountEl) characterCountEl.textContent = characterInfoboxCount;
    if (totalTemplatesEl) totalTemplatesEl.textContent = anyTemplateCount;
    if (protectedPagesEl) protectedPagesEl.textContent = protectedCount;
}

function createCharts() {
    // Calculate data for charts
    const singerTemplateCount = allData.filter(item => item.singer_template === true).length;
    const youtaiteInfoboxCount = allData.filter(item => item.youtaite_infobox === true).length;
    const characterInfoboxCount = allData.filter(item => item.character_infobox === true).length;
    
    // Count pages with multiple templates or no templates
    const noTemplateCount = allData.filter(item => 
        item.singer_template !== true && 
        item.youtaite_infobox !== true && 
        item.character_infobox !== true
    ).length;
    
    // Protection data
    const protectedCount = allData.filter(item => item.is_admin_protected === true).length;
    const unprotectedCount = allData.length - protectedCount;
    
    // Template Usage Chart
    createTemplateUsageChart(singerTemplateCount, youtaiteInfoboxCount, characterInfoboxCount, noTemplateCount);
    
    // Protection Status Chart
    createProtectionStatusChart(protectedCount, unprotectedCount);
    
    // Protected Templates Chart
    createProtectedTemplatesChart();
    
    // Template Overlap Chart
    createTemplateOverlapChart();
}

function createTemplateUsageChart(singerCount, youtaiteCount, characterCount, noTemplateCount) {
    const ctx = getElement('templateUsageChart')?.getContext('2d');
    if (!ctx) return;
    
    // Clear any existing chart
    if (window.templateUsageChart instanceof Chart) {
        window.templateUsageChart.destroy();
    }
    
    window.templateUsageChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Singer Template', 'Youtaite Infobox', 'Character Infobox', 'No Template'],
            datasets: [{
                data: [singerCount, youtaiteCount, characterCount, noTemplateCount],
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

function createProtectionStatusChart(protectedCount, unprotectedCount) {
    const ctx = getElement('protectionStatusChart')?.getContext('2d');
    if (!ctx) return;
    
    // Clear any existing chart
    if (window.protectionStatusChart instanceof Chart) {
        window.protectionStatusChart.destroy();
    }
    
    window.protectionStatusChart = new Chart(ctx, {
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

function createProtectedTemplatesChart() {
    const ctx = getElement('protectedTemplatesChart')?.getContext('2d');
    if (!ctx) return;
    
    // Count protected pages by template type
    const protectedSinger = allData.filter(item => 
        item.is_admin_protected === true && item.singer_template === true
    ).length;
    
    const protectedYoutaite = allData.filter(item => 
        item.is_admin_protected === true && item.youtaite_infobox === true
    ).length;
    
    const protectedCharacter = allData.filter(item => 
        item.is_admin_protected === true && item.character_infobox === true
    ).length;
    
    const protectedNoTemplate = allData.filter(item => 
        item.is_admin_protected === true && 
        item.singer_template !== true && 
        item.youtaite_infobox !== true && 
        item.character_infobox !== true
    ).length;
    
    // Clear any existing chart
    if (window.protectedTemplatesChart instanceof Chart) {
        window.protectedTemplatesChart.destroy();
    }
    
    window.protectedTemplatesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Singer Template', 'Youtaite Infobox', 'Character Infobox', 'No Template'],
            datasets: [{
                label: 'Protected Pages by Template',
                data: [protectedSinger, protectedYoutaite, protectedCharacter, protectedNoTemplate],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgb(255, 99, 132)',
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

function createTemplateOverlapChart() {
    const ctx = getElement('templateOverlapChart')?.getContext('2d');
    if (!ctx) return;
    
    // Calculate different combinations of templates
    const onlySinger = allData.filter(item => 
        item.singer_template === true && 
        item.youtaite_infobox !== true && 
        item.character_infobox !== true
    ).length;
    
    const onlyYoutaite = allData.filter(item => 
        item.singer_template !== true && 
        item.youtaite_infobox === true && 
        item.character_infobox !== true
    ).length;
    
    const onlyCharacter = allData.filter(item => 
        item.singer_template !== true && 
        item.youtaite_infobox !== true && 
        item.character_infobox === true
    ).length;
    
    const singerAndYoutaite = allData.filter(item => 
        item.singer_template === true && 
        item.youtaite_infobox === true && 
        item.character_infobox !== true
    ).length;
    
    const singerAndCharacter = allData.filter(item => 
        item.singer_template === true && 
        item.youtaite_infobox !== true && 
        item.character_infobox === true
    ).length;
    
    const youtaiteAndCharacter = allData.filter(item => 
        item.singer_template !== true && 
        item.youtaite_infobox === true && 
        item.character_infobox === true
    ).length;
    
    const allThree = allData.filter(item => 
        item.singer_template === true && 
        item.youtaite_infobox === true && 
        item.character_infobox === true
    ).length;
    
    // Clear any existing chart
    if (window.templateOverlapChart instanceof Chart) {
        window.templateOverlapChart.destroy();
    }
    
    window.templateOverlapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'Only Singer', 
                'Only Youtaite', 
                'Only Character', 
                'Singer + Youtaite', 
                'Singer + Character', 
                'Youtaite + Character', 
                'All Three'
            ],
            datasets: [{
                label: 'Template Combinations',
                data: [
                    onlySinger,
                    onlyYoutaite, 
                    onlyCharacter,
                    singerAndYoutaite,
                    singerAndCharacter,
                    youtaiteAndCharacter,
                    allThree
                ],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgb(153, 102, 255)',
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
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = Math.round((value / allData.length) * 100);
                            return `${value} pages (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

function filterTable() {
    const searchTerm = getElement('tableSearch')?.value.toLowerCase() || '';
    const templateFilter = getElement('templateFilter')?.value || 'all';
    const protectionFilter = getElement('protectionFilter')?.value || 'all';
    
    filteredData = allData.filter(item => {
        // Apply search filter
        const matchesSearch = searchTerm === '' || item.title.toLowerCase().includes(searchTerm);
        
        // Apply template filter
        let matchesTemplate = true;
        if (templateFilter === 'singer_template') {
            matchesTemplate = item.singer_template === true;
        } else if (templateFilter === 'youtaite_infobox') {
            matchesTemplate = item.youtaite_infobox === true;
        } else if (templateFilter === 'character_infobox') {
            matchesTemplate = item.character_infobox === true;
        } else if (templateFilter === 'any_template') {
            matchesTemplate = item.singer_template === true || 
                             item.youtaite_infobox === true || 
                             item.character_infobox === true;
        } else if (templateFilter === 'no_template') {
            matchesTemplate = item.singer_template !== true && 
                             item.youtaite_infobox !== true && 
                             item.character_infobox !== true;
        }
        
        // Apply protection filter
        let matchesProtection = true;
        if (protectionFilter === 'protected') {
            matchesProtection = item.is_admin_protected === true;
        } else if (protectionFilter === 'unprotected') {
            matchesProtection = item.is_admin_protected !== true;
        }
        
        return matchesSearch && matchesTemplate && matchesProtection;
    });
    
    // Reset to first page
    currentPage = 1;
    displayTablePage();
}

function displayTablePage() {
    const tableBody = getElement('dataTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, filteredData.length);
    
    const pageData = filteredData.slice(startIdx, endIdx);
    
    pageData.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        // Page title
        const titleCell = document.createElement('td');
        titleCell.className = 'px-6 py-4 whitespace-nowrap';
        titleCell.textContent = item.title;
        row.appendChild(titleCell);
        
        // Admin Protected status
        const protectedCell = createStatusCell(item.is_admin_protected);
        protectedCell.className += item.is_admin_protected === true ? ' bg-red-50' : '';
        row.appendChild(protectedCell);
        
        // Singer Template
        const singerCell = createStatusCell(item.singer_template);
        row.appendChild(singerCell);
        
        // Youtaite Infobox
        const youtaiteCell = createStatusCell(item.youtaite_infobox);
        row.appendChild(youtaiteCell);
        
        // Character Infobox
        const characterCell = createStatusCell(item.character_infobox);
        row.appendChild(characterCell);
        
        tableBody.appendChild(row);
    });
    
    // Update pagination info
    const shownRowsEl = getElement('shownRows');
    const totalRowsEl = getElement('totalRows');
    const paginationInfoEl = getElement('paginationInfo');
    
    if (shownRowsEl) shownRowsEl.textContent = pageData.length;
    if (totalRowsEl) totalRowsEl.textContent = filteredData.length;
    if (paginationInfoEl) {
        const maxPage = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
        paginationInfoEl.textContent = `Page ${currentPage} of ${maxPage}`;
    }
    
    // Update pagination buttons
    const prevPageBtn = getElement('prevPageBtn');
    const nextPageBtn = getElement('nextPageBtn');
    
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= Math.ceil(filteredData.length / rowsPerPage);
}

function createStatusCell(value) {
    const cell = document.createElement('td');
    cell.className = 'px-6 py-4 whitespace-nowrap text-center';
    
    if (value === true) {
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
    csvContent += "Page Title,Admin Protected,Singer Template,Youtaite Infobox,Character Infobox\n";
    
    // Add data rows
    filteredData.forEach(item => {
        csvContent += `"${item.title}",${item.is_admin_protected},${item.singer_template},${item.youtaite_infobox},${item.character_infobox}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `template_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Download the file
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}
