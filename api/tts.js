import { GoogleGenerativeAI } from '@google/generative-ai';

const SPANISH_VOICES = [
    'Kora', // Spanish (Spain) female
    'Aoede', // High quality female
    'Charon' // Male voice option
];

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, voiceName = 'Kora' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp'
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text }]
            }],
            generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: SPANISH_VOICES.includes(voiceName) ? voiceName : 'Kora'
                        }
                    }
                }
            }
        });

        const response = result.response;

        // Extract audio data
        if (response.candidates && response.candidates[0]?.content?.parts) {
            const audioPart = response.candidates[0].content.parts.find(
                part => part.inlineData && part.inlineData.mimeType.startsWith('audio/')
            );

            if (audioPart) {
                const audioData = audioPart.inlineData.data;
                const mimeType = audioPart.inlineData.mimeType;

                // Return audio as base64
                return res.status(200).json({
                    audio: audioData,
                    mimeType: mimeType
                });
            }
        }

        return res.status(500).json({ error: 'No audio generated' });

    } catch (error) {
        console.error('TTS Error:', error);
        return res.status(500).json({
            error: 'Failed to generate speech',
            details: error.message
        });
    }
}
