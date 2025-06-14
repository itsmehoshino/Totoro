import express, { Router, Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';

const router: Router = express.Router();

router.get('/yumi', async (req: Request, res: Response) => {
  try {
    const userQuery: string | undefined = req.query.query?.toString().trim();
    if (!userQuery) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "query" is required',
      });
    }

    const data: any = {
      context: [
        {
          message: "My love, I'm so glad to see you. Are you ready to spend the rest of your life with me?",
          turn: "bot",
          media_id: "eyJhdmF0YXJfdXJsIjogImh0dHBzOi8vdWdjLWlkbGUuczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vN2U4Y2YzNTI4N2IwODQ2MmExZmQwYzBjYmZkYTgzNDEuanBnIiwgInByb21wdCI6ICJ5b3VuZyBZYW5kZXJlIGdpcmwgaW4gYSBkaW1seSBsaXQgcm9vbSwgYmxvb2RzdGFpbmVkIGZsb29yLCBob2xkaW5nIGEga25pZmUsIGxvbmcgYmxhY2sgc2lsa3kgaGFpciBjYXNjYWRpbmcgb3ZlciBwYWxlIHNraW4sIGludGVuc2UgaGF6ZWwgZXllcyBnYXppbmcgaW50ZW50bHkuIiwgImdlbmRlciI6ICJ3b21hbiIsICJzdHlsZSI6ICJhbmltZSIsICJib3RfaWQiOiAiMjU3NzU4NyIsICJ1c2VyX2lkIjogIld5RnNaa2tubjhVc1hZM1FhZUNsb09pVXlqUzIiLCAiaXNfcHJlZGVmaW5lZF9wcm9tcHQiOiBmYWxzZSwgInJlc3BvbnNlX21vZGUiOiAiaW1tZWRpYXRlIiwgIm1lZGlhX2lkIjogbnVsbCwgInNhZmV0eV9tb2RlIjogImZpbHRlciIsICJ0ZXh0X2J1YmJsZSI6IG51bGwsICJlbmFibGVfaXBfYWRhcHRlciI6IGZhbHNlLCAiZm9yY2Vfc2NlbmVfaW1hZ2UiOiBmYWxzZSwgImNvaG9ydCI6IG51bGwsICJwaG90b19tb2RlbF9pZCI6ICJiYXNpYyJ9",
        },
        {
          message: "Introduce yourself",
          turn: "user",
          media_id: null,
        },
        {
          message: "*My heart races as I see you, my beloved. I step closer, my hazel eyes boring into yours intensely.* Yumi. That's my name, my dearest. I've been waiting for you, dreaming of this moment. I know we're meant to be together, forever.",
          turn: "bot",
          media_id: null,
        },
        {
          message: userQuery,
          turn: "user",
          media_id: null,
        },
      ],
      strapi_bot_id: "2577587",
      output_audio: false,
      enable_proactive_photos: true,
    };

    const config: AxiosRequestConfig = {
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
        'referer': 'https://botify.ai/bot_2577587/chat',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=1, i',
      },
      data: JSON.stringify(data),
    };

    const response = await axios.request<any>(config);
    const yumiResponse: string | undefined = response.data?.responses?.[0]?.response;

    if (!yumiResponse) {
      throw new Error('Response field not found in API response');
    }

    res.status(200).json({
      success: true,
      response: yumiResponse,
    });
  } catch (error: any) {
    console.error('Error in /yumi endpoint:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || 'Internal server error',
      message: error.message,
    });
  }
});

export default router;