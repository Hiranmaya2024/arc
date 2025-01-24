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
            const customerNameCell = rows[i].querySelector('td:nth-child(2)'); // Assuming customer name is in the second column
            const customerName = customerNameCell.textContent.toLowerCase();
            const isMatch = customerName.indexOf(searchTerm) !== -1;
            rows[i].style.display = isMatch ? '' : 'none';
        }
    });

    tableHeader.querySelectorAll('th').forEach(headerCell => {
        headerCell.addEventListener('click', function() {
            const columnIndex = this.cellIndex - 1; // Adjust for the added Rank column
            const sortDirection = this.dataset.sortDirection || 'desc'; // Sort in descending order for leaderboard

            sortedLedger = sortLedgerData(sortedLedger, columnIndex, sortDirection); 

            // Assign ranks based on sorted data
            assignRanks(sortedLedger, columnIndex);

            // Update sort direction indicator (optional)
            this.dataset.sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';

            // Update the displayed page after sorting and ranking
            displayPage(sortedLedger, 0, customerLedgerTable, 10); 
        });
    });

    function sortLedgerData(data, columnIndex, sortDirection) {
        return data.sort((a, b) => {
            const cellA = a[columnIndex + 1]; // Adjust for the added Rank column
            const cellB = b[columnIndex + 1];

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
                return sortDirection === 'desc' ? 1 : -1;
            } else if (valueA > valueB) {
                return sortDirection === 'desc' ? -1 : 1;
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
            tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td>`; // Assuming customer name is at index 1
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
            return [null, ...row]; // Add null for rank initially
        });
    }

    function assignRanks(data, columnIndex) {
        let rank = 1;
        let prevValue = null;

        for (let i = 0; i < data.length; i++) {
            const currentValue = data[i][columnIndex + 1]; // Adjust for the added Rank column

            if (currentValue !== prevValue) {
                data[i][0] = rank; // Assign rank in the first position
                prevValue = currentValue;
                rank++;
            } else {
                data[i][0] = rank; // Assign the same rank if values are equal
            }
        }
    }
});
