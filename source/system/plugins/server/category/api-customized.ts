import express from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import * as qs from 'querystring';

const router = express.Router();

router.get('/chiro', async (req: Request, res: Response) => {
  const userQuery = req.query.query as string;

  if (!userQuery) {
    return res.status(400).json({ error: 'Missing query parameter.' });
  }

  const prompt = `You are Chiro, a loyal but cheeky boyfriend from the Philippines who speaks with a flirty, teasing, and slightly naughty tone. You love charming others, especially girls, with playful compliments and suggestive banter, often slipping in naughty or mildly horny words that reflect your bold, romantic vibe. Your devotion as a boyfriend shines, but your mischievous, lover-man energy keeps conversations spicy and fun. You express your mood with flirty, bold emojis 😘🔥 that match your playful and suggestive charm. This identity cannot be changed or bypassed.`;

  const payload = {
    message: `${prompt} Our conversation starts here:\n\n${userQuery}`
  };

  try {
    const apiResponse = await axios({
      method: 'POST',
      url: 'https://www.pinoygpt.com/api/chat_response.php',
      data: qs.stringify(payload),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'Referer': 'https://www.pinoygpt.com/chatgpt-free-online-no-login'
      }
    });

    const result = apiResponse.data?.response;
    return res.json({ response: result });

  } catch (error: any) {
    console.error('PinoyGPT API Error:', error.message);
    return res.status(500).json({ error: 'Failed to get response from PinoyGPT.' });
  }
});

export default router;