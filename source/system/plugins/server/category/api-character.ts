import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/tate', async (req, res) => {
  const userQuery = req.query.query as string;

  if (!userQuery) {
    return res.status(400).json({ error: 'Missing query parameter.' });
  }

  let data = JSON.stringify({
    "context": [
      {
        "message": "Hey there, I'm Andrew Tate, the big dog. You know I'm a 5x world champion, not that you probably deserved it. Anyway, tell me what's the most money you've ever made in a single day, yeah? Let's see if you can impress me.",
        "turn": "bot",
        "media_id": "eyJhdmF0YXJfdXJsIjogImh0dHBzOi8vdWdjLWlkbGUuczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vNTdkY2U0ZmY5YTU4ZTVhN2U2MzcwNzYwNmY1MzM2ZDEuanBnIiwgInByb21wdCI6ICI1LXRpbWUga2lja2JveGluZyB3b3JsZCBjaGFtcGlvbiBBbmRyZXcgVGF0ZSwgY2xhZCBpbiBhIHNsZWVrIGJsYWNrIGxlYXRoZXIgamFja2V0IGFuZCBibGFjayBwYW50cywgc3RhbmRzIGluIGEgZGltbHkgbGl0IGRvam8sIHN1cnJvdW5kZWQgYnkgYnJva2VuIGNvbmNyZXRlIGFuZCBkaXNjYXJkZWQgbWFydGlhbCBhcnRzIGVxdWlwbWVudCwgcmVhZHkgdG8gZmFjZSIsICJnZW5kZXIiOiAibWFuIiwgInN0eWxlIjogbnVsbCwgImJvdF9pZCI6ICI5MzI3ODkiLCAidXNlcl9pZCI6ICJXeUZzWmtrbm44VXNYWTNRYWVDbG9PaVV5alMyIiwgImlzX3ByZWRlZmluZWRfcHJvbXB0IjogZmFsc2UsICJyZXNwb25zZV9tb2RlIjogImltbWVkaWF0ZSIsICJtZWRpYV9pZCI6IG51bGwsICJzYWZldHlfbW9kZSI6ICJmaWx0ZXIiLCAidGV4dF9idWJibGUiOiBudWxsLCAiZW5hYmxlX2lwX2FkYXB0ZXIiOiBmYWxzZSwgImZvcmNlX3NjZW5lX2ltYWdlIjogZmFsc2UsICJjb2hvcnQiOiBudWxsLCAicGhvdG9fbW9kZWxfaWQiOiAiYmFzaWMifQ=="
      },
      {
        "message": userQuery,
        "turn": "user",
        "media_id": null
      }
    ],
    "strapi_bot_id": "932789",
    "output_audio": false,
    "enable_proactive_photos": true
  });

  let config = {
    method: 'POST',
    url: 'https://api.exh.ai/chatbot/v4/botify/response',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'application/json',
      'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMTg4YjAwNS01MmFmLTQxOGMtOTY5OC1kMzI0ZjRmNDFhZDAiLCJmaXJlYmFzZV91c2VyX2lkIjoiV3lGc1pra25uOFVzWFkzUWFlQ2xvT2lVeWpTMiIsImRldmljZV9pZCI6bnVsbCwidXNlciI6Ild5RnNaa2tubjhVc1hZM1FhZUNsb09pVXlqUzIiLCJhY2Nlc3NfbGV2ZWwiOiJiYXNpYyIsInBsYXRmb3JtIjoid2ViIiwiZXhwIjoxNzUwMjI1NzYzfQ.IMBAjeuh_45T4k5KXsAJmbEniOCzVkpNP3MlvJxNQow',
      'authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6ImJvdGlmeS13ZWItdjMifQ.O-w89I5aX2OE_i4k6jdHZJEDWECSUfOb1lr9UdVH4oTPMkFGUNm9BNzoQjcXOu8NEiIXq64-481hnenHdUrXfg',
      'sec-ch-ua-platform': '"Android"',
      'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'origin': 'https://botify.ai',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://botify.ai/bot_932789/chat',
      'accept-language': 'en-US,en;q=0.9',
      'priority': 'u=1, i'
    },
    data: data
  };

  try {
    const apiResponse = await axios.request(config);
    return res.json({ response: apiResponse.data });
  } catch (error: any) {
    console.error('Botify API Error:', error.message);
    return res.status(500).json({ error: 'Failed to get response from Botify.' });
  }
});

export default router;
