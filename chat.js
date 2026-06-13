// ===========================
// COACH ZI — SERVER-SIDE PROXY
// netlify/functions/chat.js
//
// This file runs on Netlify's servers, NOT in the browser.
// It safely holds your API key and forwards chat requests to Claude.
// The browser never sees your API key. 🔒
// ===========================

exports.handler = async function (event) {

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the messages sent from the browser (script.js)
    const { messages, system } = JSON.parse(event.body);

    // Call Claude using the secret API key stored in Netlify's settings
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,  // <-- stored securely in Netlify, not in code!
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    // Send Claude's reply back to the browser
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
