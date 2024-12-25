# Google Sheets Authentication App

A web application that uses Google Sheets as a backend for authentication and data storage.

## Structure
- `/scripts`: Contains all JavaScript files
- `/styles`: Contains CSS files
- `/pages`: Contains HTML files

## Setup
1. Get your Google Sheets API key:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sheets API for your project
   - Create credentials (API key) for your project
   - Copy your API key

2. Configure the application:
   - Open `scripts/config.js`
   - Paste your API key in the `API_KEY` field
   - Update the `SHEET_ID` if you're using a different Google Sheet

3. Set up your Google Sheet with the following sheets:
   - Login: For user credentials (columns: username, password, userType)
   - Stock: For inventory data (columns: item, quantity, rate)
   - CustomerLedger: For customer transactions (columns: customer, balance)
   - Offers: For current offers (column: offerText)

## Security Notes
- Never commit `config.js` with your actual API key
- For production, use environment variables or a secure key management service
- Implement proper API key restrictions in Google Cloud Console
- Consider implementing additional security measures for password storage
