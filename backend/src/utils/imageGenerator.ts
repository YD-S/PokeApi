import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface StableDiffusionResponse {
    images: string[];
}

/**
 * Generates a Pokémon image from a text prompt using Stable Diffusion API.
 * Saves the image locally in /uploads and returns the file path.
 */
export async function generatePokemonImage(prompt: string): Promise<string> {
    try {
        const response = await axios.post<StableDiffusionResponse>(
            "http://stable-diffusion.42malaga.com:7860/sdapi/v1/txt2img",
            {
                prompt,
                steps: 20,
                width: 512,
                height: 512,
            }
        );

        const base64Image = response.data.images[0];
        const buffer = Buffer.from(base64Image, "base64");

        const fileName = `${uuidv4()}.png`;
        const uploadDir = path.join(__dirname, "../../uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        return `/uploads/${fileName}`;
    } catch (err: any) {
        console.error("❌ Error generating Pokémon image:", err.message);
        throw new Error("Image generation failed");
    }
}
