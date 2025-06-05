const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();

app.use(cors());
app.use(express.json());

// Google Sheets setup
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Your downloaded credentials file
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const spreadsheetId = ' '; // Your Sheet ID

// Save order to Google Sheet
app.post('/order', async (req, res) => {
  try {
    const client = await auth.getClient();
    const order = req.body;
    await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId,
      range: 'Orders!A1', // Sheet tab must be named 'Orders'
      valueInputOption: 'RAW',
      resource: {
        values: [[
          new Date().toISOString(),
          order.sender,
          order.title,
          order.message,
          order.status
        ]]
      }
    });
    res.json({ success: true, message: 'Order saved to Google Sheet!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save order.' });
  }
});

// Save chat message to Google Sheet
app.post('/send-message', async (req, res) => {
  try {
    const client = await auth.getClient();
    const { name, message } = req.body;
    await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId,
      range: 'Chat!A1', // Sheet tab must be named 'Chat'
      valueInputOption: 'RAW',
      resource: {
        values: [[
          new Date().toISOString(),
          name,
          message
        ]]
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send chat.' });
  }
});

// Get chat messages from Google Sheet
app.get('/receive-messages', async (req, res) => {
  try {
    const client = await auth.getClient();
    const result = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range: 'Chat!A2:C', // skip header row
    });
    const rows = result.data.values || [];
    const messages = rows.map(row => ({
      timestamp: row[0],
      name: row[1],
      message: row[2]
    }));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load chat.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));