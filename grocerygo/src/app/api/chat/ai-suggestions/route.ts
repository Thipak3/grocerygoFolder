import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    let role = "user"
    try {
        await connectDb()
        const body = await req.json()
        role = body.role || "user"
        const message = body.message || ""
        const apiKey = process.env.GEMINI_API_KEY?.trim() || ""

        if (!apiKey) {
            const defaultSuggestions = role === "user" 
                ? ["Where is my order?", "Please call me on arrival", "Thank you!"]
                : ["I am on my way", "I have reached your location", "Please share OTP"]
            return NextResponse.json(defaultSuggestions, { status: 200 })
        }

        const prompt = `You are an AI-powered smart reply assistant for a grocery delivery application.
Return ONLY 3 short smart reply suggestions for role "${role}" responding to message "${message}".
Format: comma-separated list of 3 short phrases without numbers or quotes.`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        })
        const data = await response.json()
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        let suggestions = replyText
            .split(/,|\n/)
            .map((s: string) => s.replace(/^\d+[\.\)]\s*/, '').replace(/["']/g, '').trim())
            .filter((s: string) => s.length > 0)
            .slice(0, 3)

        if (!suggestions || suggestions.length === 0) {
            suggestions = role === "user" 
                ? ["Where is my order?", "Please call me on arrival", "Thank you!"]
                : ["I am on my way", "I have reached your location", "Please share OTP"]
        }

        return NextResponse.json(suggestions, { status: 200 })

    } catch (error) {
        console.error("AI suggestions error:", error)
        const fallback = role === "user" 
            ? ["Where is my order?", "Please call me on arrival", "Thank you!"]
            : ["I am on my way", "I have reached your location", "Please share OTP"]
        return NextResponse.json(fallback, { status: 200 })
    }
}
