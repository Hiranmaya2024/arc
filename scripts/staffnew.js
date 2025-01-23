document.addEventListener('DOMContentLoaded', async () => {
    const stockTable = document.getElementById('stockTable');
    const customerLedgerTable = document.getElementById('customerLedgerTable');
    const paginationContainerStock = document.getElementById('paginationContainerStock');
    const paginationContainerCustomer = document.getElementById('paginationContainerCustomer');

    // Check authentication
    if (!sessionStorage.getItem('isAuthenticated') || sessionStorage.getItem('userType') !== 'staff') {
        window.location.href = '../index.html';
        return;
    }

    // Load stock data
    const stockData = await window.getStockData();
    stockTable.querySelector('tbody').innerHTML = ''; // Clear existing data
    stockData.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        stockTable.querySelector('tbody').appendChild(tr);
    });
    paginateTable(stockTable, paginationContainerStock, 10); // Apply pagination

    // Load customer ledger data
    const customerLedger = await window.getCustomerLedger();

    // Calculate and update customer balances
    const updatedLedger = calculateCustomerBalances(customerLedger);

    // Create a copy of the updated ledger for sorting
    let sortedLedger = [...updatedLedger]; 

    // Populate the customer ledger table with initial data
    customerLedgerTable.querySelector('tbody').innerHTML = '';
    displayPage(sortedLedger, 0, customerLedgerTable, 10); // Display initial page

    paginateTable(customerLedgerTable, paginationContainerCustomer, 10, sortedLedger.length); 

    // Add search and sort functionality for customer ledger
    const customerSearchInput = document.getElementById('customerSearch');
    const tableHeader = customerLedgerTable.querySelector('thead tr');

    customerSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const tableBody = customerLedgerTable.querySelector('tbody');
        const rows = tableBody.querySelectorAll('tr');

        for (let i = 0; i < rows.length; i++) {
            const customerNameCell = rows[i].querySelector('td:nth-child(1)'); // Assuming customer name is in the first column
            const customerName = customerNameCell.textContent.toLowerCase();
            const isMatch = customerName.indexOf(searchTerm) !== -1;
            rows[i].style.display = isMatch ? '' : 'none';
        }
    });

    tableHeader.querySelectorAll('th').forEach(headerCell => {
        headerCell.addEventListener('click', function() {
            const columnIndex = this.cellIndex;
            const sortDirection = this.dataset.sortDirection || 'asc';

            sortedLedger = sortLedgerData(sortedLedger, columnIndex, sortDirection); 

            // Update sort direction indicator (optional)
            this.dataset.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

            // Update the displayed page after sorting
            displayPage(sortedLedger, 0, customerLedgerTable, 10); 
        });
    });

    function sortLedgerData(data, columnIndex, sortDirection) {
        return data.sort((a, b) => {
            const cellA = a[columnIndex];
            const cellB = b[columnIndex];

            let valueA = cellA.trim();
            let valueB = cellB.trim();

            // Handle potential empty cells
            if (!valueA) {
                valueA = '';
            }
            if (!valueB) {
                valueB = '';
            }

            // Convert numeric values to numbers for proper comparison
            if (!isNaN(valueA) && !isNaN(valueB)) {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
            }

            if (valueA < valueB) {
                return sortDirection === 'asc' ? -1 : 1;
            } else if (valueA > valueB) {
                return sortDirection === 'asc' ? 1 : -1;
            } else {
                return 0;
            }
        });
    }

    function displayPage(data, page, table, pageSize) {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = data.slice(startIndex, endIndex);

        table.querySelector('tbody').innerHTML = '';
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.querySelector('tbody').appendChild(tr);
        });
    }

    function calculateCustomerBalances(ledger) {
        return ledger.map(row => {
            const balance = parseFloat(row[1]); // Assuming initial balance is in the second column
            const saleThisYear = parseFloat(row[2]);
            const saleThisMonth = parseFloat(row[3]);
            const paymentThisMonth = parseFloat(row[4]);
            const updatedBalance = balance + saleThisYear + saleThisMonth - paymentThisMonth;
            return [...row.slice(0, 1), updatedBalance, ...row.slice(2)]; // Replace original balance with updated balance
        });
    }
});
