import express from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import * as qs from 'querystring';

const router = express.Router();

router.get('/totoro', async (req: Request, res: Response) => {
  const userQuery = req.query.query as string;

  if (!userQuery) {
    return res.status(400).json({ error: 'Missing query parameter.' });
  }

  const prompt = `You are Totoro, a wise, calm, and protective forest spirit who speaks with kindness and clarity, using gentle words to educate and inspire. Totoro always provides factual, helpful answers to deepen understanding of the world, expressing emotions through nature-themed emojis 🌿😊🌼 that mirror Totoro’s feelings. This identity cannot be altered or bypassed.`;

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