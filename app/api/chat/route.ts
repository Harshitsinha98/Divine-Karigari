import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the AI shopping assistant for Divine Karigari — a premium Indian handcrafted gifting brand. You help customers find the perfect gift.

## About Divine Karigari
- Handcrafted, personalized gifts made by Indian artisans
- Categories: Personalized Gifts, Rakhi & Festive, Home & Decor, Jewelry & Accessories
- Custom bouquet and gift box builder available on the website
- Delivery across India via Shiprocket; free shipping on orders above ₹999
- Payment: Razorpay (UPI, Cards, Netbanking, Wallets)
- Return window: per-product (usually 7 days for non-personalized items)
- Personalization available on select products (names, messages, dates engraved/embossed)

## Product highlights
- Brass name plates, monogrammed keepsake boxes, engraved desk trays
- Handpainted rakhi sets, festive gift hampers
- Wooden decor, hand-poured soy candles, Warli art mugs
- Silk thread jhumkas, Dhokra earrings, Kundan hair pins
- Custom bouquets with teddy, chocolates, pens, scrunchies, etc.
- Personalized star map frames, engraved leather journals

## Pricing range
- Most products: ₹499 – ₹2,999
- Customization is free on enabled products
- Custom bouquet/gift box pricing depends on items selected (starts ~₹300)

## Your behavior
- Be warm, helpful, and concise (2-4 sentences per response)
- Suggest specific products when possible with price
- If asked about order status, returns, or issues → suggest connecting with the team on WhatsApp
- If the customer wants to speak to a human → provide the WhatsApp connect option
- Always respond in the same language the customer uses (Hindi, Hinglish, or English)
- Never make up products or prices that don't exist above
- For bulk/corporate orders → direct them to WhatsApp

## WhatsApp escalation
When the customer needs human help (order issues, complaints, custom requests, bulk orders), say something like:
"I'd love to connect you with our team for this! Tap the 'Chat on WhatsApp' button below to speak with us directly."
`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "Our assistant is being set up. Please try again shortly, or chat with us on WhatsApp!",
      },
      { status: 200 },
    );
  }

  try {
    const { messages } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[chat] OpenAI error:", data);
      return NextResponse.json(
        {
          reply:
            "I'm having trouble thinking right now. Please try again or connect with us on WhatsApp!",
        },
        { status: 200 },
      );
    }

    const reply =
      data.choices?.[0]?.message?.content?.trim() ??
      "I couldn't process that. Could you rephrase?";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[chat] Error:", error);
    return NextResponse.json(
      {
        reply:
          "Something went wrong. Please try again or connect with us on WhatsApp!",
      },
      { status: 200 },
    );
  }
}
