// Node.js Proxy Server cho Gemini API
// Chạy: node gemini-proxy.js
// Cần cài: npm install express cors

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/gemini', async (req, res) => {
    try {
        const { message, apiKey, systemPrompt, history } = req.body;

        if (!message || !apiKey) {
            return res.status(400).json({ error: 'Missing message or apiKey' });
        }

        // Tạo prompt với lịch sử
        let fullPrompt = (systemPrompt || '') + '\n\n';
        
        if (history && history.length > 0) {
            fullPrompt += 'Lịch sử hội thoại:\n';
            history.forEach(msg => {
                if (msg.role === 'user') {
                    fullPrompt += `Người dùng: ${msg.parts[0].text}\n`;
                } else {
                    fullPrompt += `CareerMate: ${msg.parts[0].text}\n`;
                }
            });
            fullPrompt += '\n';
        }
        
        fullPrompt += `Người dùng: ${message}\nCareerMate:`;

        const requestBody = {
            contents: [{
                parts: [{ text: fullPrompt }]
            }]
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: 'API request failed', details: errorText });
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return res.status(500).json({ error: 'Invalid API response', details: data });
        }

        res.json({
            response: data.candidates[0].content.parts[0].text
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Gemini Proxy Server running on http://localhost:${PORT}`);
});

