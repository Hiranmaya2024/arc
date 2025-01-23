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
    customerLedger.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        customerLedgerTable.querySelector('tbody').appendChild(tr);
    });
    paginateTable(customerLedgerTable, paginationContainerCustomer, 10); // Apply pagination

//code to add searchbar in customer ledger

const customerSearchInput = document.getElementById('customerSearch');

customerSearchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const customerLedgerTable = document.getElementById('customerLedgerTable');
    const tableBody = customerLedgerTable.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
        const customerNameCell = rows[i].querySelector('td:nth-child(1)'); // Assuming customer name is in the first column
        const customerName = customerNameCell.textContent.toLowerCase();
        const isMatch = customerName.indexOf(searchTerm) !== -1;
        rows[i].style.display = isMatch ? '' : 'none';
    }
});
// Code to implement sort functionality in customer ledger

const customerLedgerTable = document.getElementById('customerLedgerTable');
const tableHeader = customerLedgerTable.querySelector('thead tr');

tableHeader.querySelectorAll('th').forEach(headerCell => {
    headerCell.addEventListener('click', function() {
        const columnIndex = this.cellIndex;
        const sortDirection = this.dataset.sortDirection || 'asc'; // Default sort direction

        sortCustomerLedger(columnIndex, sortDirection);

        // Update sort direction indicator (optional)
        this.dataset.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    });
});

function sortCustomerLedger(columnIndex, sortDirection) {
    const tableBody = customerLedgerTable.querySelector('tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const valueA = a.querySelectorAll('td')[columnIndex].textContent.toLowerCase();
        const valueB = b.querySelectorAll('td')[columnIndex].textContent.toLowerCase();

        if (valueA < valueB) {
            return sortDirection === 'asc' ? -1 : 1;
        } else if (valueA > valueB) {
            return sortDirection === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });

    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}


});
