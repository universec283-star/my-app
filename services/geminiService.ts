
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PlaceResult, UserLocation } from "../types";

export const fetchPlaces = async (
  query: string,
  location: UserLocation | null
): Promise<{ text: string; places: PlaceResult[] }> => {
  // Use the provided API KEY from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Default coordinates for Myitkyina (Clock Tower area) if GPS is unavailable
  const lat = location?.latitude || 25.3831;
  const lng = location?.longitude || 97.3955;

  const prompt = `You are a local expert guide for Myitkyina, Myanmar.
User is currently at latitude ${lat}, longitude ${lng}.
Search query: "${query}"

Please provide:
1. A brief helpful summary in Myanmar language about these places in Myitkyina.
2. A list of specific places with their names and locations.

Focus only on Myitkyina city and surrounding areas. Use Google Maps and Search to find the most accurate and up-to-date information.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const text = response.text || "အချက်အလက် ရှာမတွေ့ပါ။";
    const places: PlaceResult[] = [];

    // Extracting places from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          places.push({
            title: chunk.maps.title,
            uri: chunk.maps.uri,
            snippets: chunk.maps.placeAnswerSources?.map((s: any) => s.reviewSnippet).filter(Boolean)
          });
        } else if (chunk.web) {
          places.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
            description: "Web result"
          });
        }
      });
    }

    // Filter duplicates
    const uniquePlaces = Array.from(new Map(places.map(item => [item.title, item])).values());

    return { text, places: uniquePlaces };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("API ချိတ်ဆက်မှု အဆင်မပြေပါ။ ခဏနေမှ ပြန်ကြိုးစားပါ။");
  }
};
