import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();

    const files = data.getAll("images") as File[];
    if (!files || files.length === 0)
      return NextResponse.json(
        { error: "Nenhuma imagem foi enviada" },
        { status: 400 },
      );

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "discord-clone" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls = uploadResults.map((result: any) => result.secure_url);

    return NextResponse.json({
      messages: "Uploads concluídos com sucesso!",
      urls: imageUrls,
    });
  } catch (err) {
    console.error("Erro durante o upload múltiplo:", err);
    return NextResponse.json(
      { error: "Erro durante o upload múltiplo" },
      { status: 500 },
    );
  }
}
