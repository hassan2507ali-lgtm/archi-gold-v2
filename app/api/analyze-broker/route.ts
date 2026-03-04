import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mengambil kunci rahasia dari file .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("image") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada gambar yang diupload." }, { status: 400 });
    }

    // Mengubah file gambar menjadi format yang bisa dibaca Gemini (Buffer/Base64)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Instruksi (Prompt) ketat untuk AI agar outputnya murni JSON untuk web kita
    const prompt = `
      Anda adalah analis saham profesional. Ini adalah screenshot aplikasi Stockbit bagian "Broker Action".
      Tugas Anda adalah mengekstrak data Top 3 Buyers dan Top 3 Sellers.
      
      Perhatikan bar indikator di atas (Big Dist, Neutral, Big Acc).
      Tentukan status akumulasi/distribusinya secara akurat.
      
      Keluarkan output MURNI dalam format JSON tanpa awalan \`\`\`json dan tanpa akhiran \`\`\`.
      Format yang diwajibkan:
      {
        "status": "Big Acc / Normal Acc / Neutral / Normal Dist / Big Dist",
        "buyers": [
          { "code": "AK", "vol": "187.1K", "avg": "1,742" }
        ],
        "sellers": [
           { "code": "XL", "vol": "74.2K", "avg": "1,741" }
        ]
      }
    `;

    // Kita pakai model gemini-1.5-flash karena sangat cepat dan cerdas baca gambar
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    
    // Membersihkan teks jaga-jaga kalau AI membandel memberi format markdown
    const cleanJson = responseText.replace(/```json\n|\n```|```/g, "").trim();
    
    return NextResponse.json({ success: true, data: JSON.parse(cleanJson) });

  } catch (error) {
    console.error("🔥 Error AI Vision:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses gambar Broker Action." }, { status: 500 });
  }
}