import express, { Request, Response, NextFunction } from "express";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import Pokemon from "../models/pokemonModel";
import { generatePokemonImage } from "../utils/imageGenerator";
import userModel from "../models/userModel";

const router = express.Router();

const authWrapper = (req: Request, res: Response, next: NextFunction) =>
    authMiddleware(req as AuthRequest, res, next);

/**
 * POST /pokemon
 * Create a new Pokémon (generate image + save in DB)
 */
router.post("/", authWrapper, async (req: Request, res: Response) => {
    const { name, prompt } = req.body;
    const user = (req as AuthRequest).user!;

    if (!name || !prompt) {
        return res.status(400).json({ message: "Name and prompt are required." });
    }

    try {
        const imageUrl = await generatePokemonImage(prompt);
        const pokemon = await Pokemon.create({
            name,
            prompt,
            imageUrl,
            createdBy: user.id,
        });

        res.status(201).json(pokemon);
    } catch (err: any) {
        console.error("Error creating Pokémon:", err.message);
        res.status(500).json({ message: "Failed to generate Pokémon." });
    }
});

/**
 * GET /pokemon
 * Get all Pokémon for the logged-in user
 */
router.get("/", authWrapper, async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user!;

    try {
        const pokemons = await Pokemon.findAll({
            where: { createdBy: user.id },
            order: [["created_at", "DESC"]],
        });
        res.json(pokemons);
    } catch (err: any) {
        console.error("Error fetching pokemons:", err.message);
        res.status(500).json({ message: "Failed to fetch Pokémon." });
    }
});

/**
 * GET /pokemon/:id
 * Public route — get a specific Pokémon (with creator info)
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const pokemon = await Pokemon.findByPk(req.params.id, {
            include: [{ model: userModel, as: "creator", attributes: ["id", "name", "email"] }],
        });

        if (!pokemon) {
            return res.status(404).json({ message: "Pokémon not found." });
        }

        res.json(pokemon);
    } catch (err: any) {
        console.error("Error fetching Pokémon:", err.message);
        res.status(500).json({ message: "Failed to fetch Pokémon." });
    }
});

/**
 * DELETE /pokemon/:id
 * Delete a Pokémon (only if created by logged-in user)
 */
router.delete("/:id", authWrapper, async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user!;

    try {
        const pokemon = await Pokemon.findByPk(req.params.id);

        if (!pokemon) {
            return res.status(404).json({ message: "Pokémon not found." });
        }

        if (pokemon.createdBy !== user.id) {
            return res.status(403).json({ message: "You can only delete your own Pokémon." });
        }

        await pokemon.destroy();
        res.json({ message: "Pokémon deleted successfully." });
    } catch (err: any) {
        console.error("Error deleting Pokémon:", err.message);
        res.status(500).json({ message: "Failed to delete Pokémon." });
    }
});

export default router;
