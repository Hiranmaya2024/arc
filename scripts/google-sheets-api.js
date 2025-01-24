// Use configuration from config.js (config object is loaded from config.js script)
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${config.SHEET_ID}/values`;

// Make functions available globally
window.getLoginCredentials = async function() {
    return await fetchSheetData('Login!A2:C');
};

window.getStockData = async function() {
    return await fetchSheetData('Stock!A2:F');
};

window.getCustomerLedger = async function() {
    return await fetchSheetData('CustomerLedger!A2:E');
};
window.getLedger = async function() {
    return await fetchSheetData('Ledger!A2:G');
};

window.getOffers = async function() {
    return await fetchSheetData('Offers!A2:A');
};

// Function to get API key from config
function getApiKey() {
    if (!config.API_KEY) {
        throw new Error('API key not configured. Please set it in config.js');
    }
    return config.API_KEY;
}

// Fetch data from a specific sheet range
async function fetchSheetData(range) {
    const API_KEY = getApiKey();
    const url = `${BASE_URL}/${range}?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        throw error;
    }
}
// Function to save dispatch data to Google Sheet
async function saveDispatchData(date, billNumber, shopName, transport, dispatchTime) {
    const data = [[date, billNumber, shopName, transport, dispatchTime]];
    const range = 'Dispatch!A:E'; // Adjust the range as needed

    try {
        const response = await appendDataToSheet(range, data);
        return response;
    } catch (error) {
        console.error('Error saving dispatch data:', error);
        throw error;
    }
}

// Function to append data to Google Sheet (modify google-sheets-api.js accordingly)
async function appendDataToSheet(range, data) {
    const API_KEY = getApiKey();
    const url = `${BASE_URL}/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${API_KEY}`;

    const requestBody = {
        values: data
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error appending data: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        console.error('Error appending data:', error);
        throw error;
    }
}