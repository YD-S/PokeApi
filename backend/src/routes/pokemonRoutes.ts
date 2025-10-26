import express, { Request, Response, NextFunction } from "express";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import Pokemon from "../models/pokemonModel";
import { generatePokemonImage } from "../utils/imageGenerator";
import userModel from "../models/userModel";
import { animals, abilities } from "../constants/pokemonOptions";

const router = express.Router();

const authWrapper = (req: Request, res: Response, next: NextFunction) =>
    authMiddleware(req as AuthRequest, res, next);

/**
 * @swagger
 * tags:
 *   name: Pokémon
 *   description: Endpoints for generating and managing Pokémon
 */

/**
 * @swagger
 * /pokemon/options:
 *   get:
 *     summary: Get available animals and abilities
 *     tags: [Pokémon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of animals and abilities
 */
router.get("/options", authWrapper, (_req: Request, res: Response) => {
    res.json({ animals, abilities });
});

/**
 * @swagger
 * /pokemon/prompt:
 *   post:
 *     summary: Create a Pokémon using a custom free-text prompt
 *     tags: [Pokémon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               prompt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pokémon created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/prompt", authWrapper, async (req: Request, res: Response) => {
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
            isPublic: false,
        });

        res.status(201).json(pokemon);
    } catch (err: any) {
        console.error("❌ Error generating Pokémon (prompt):", err.message);
        res.status(500).json({ message: "Failed to generate Pokémon from prompt." });
    }
});

/**
 * @swagger
 * /pokemon/compose:
 *   post:
 *     summary: Create a Pokémon from selected animals and abilities
 *     tags: [Pokémon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               animals:
 *                 type: array
 *                 items:
 *                   type: string
 *               abilities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Pokémon created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/compose", authWrapper, async (req: Request, res: Response) => {
    const { name, animals: selectedAnimals, abilities: selectedAbilities } = req.body;
    const user = (req as AuthRequest).user!;

    if (!name || !Array.isArray(selectedAnimals) || !Array.isArray(selectedAbilities)) {
        return res.status(400).json({
            message: "Name, animals[], and abilities[] are required.",
        });
    }

    const animalPart = selectedAnimals.join(", ");
    const abilityPart = selectedAbilities.join(", ");

    const composedPrompt = `A unique Pokémon hybrid that combines the traits of ${animalPart}, 
  with abilities such as ${abilityPart}. Highly detailed fantasy creature, vibrant art, 
  glowing eyes, and colorful background.`;

    try {
        const imageUrl = await generatePokemonImage(composedPrompt);
        const pokemon = await Pokemon.create({
            name,
            prompt: composedPrompt,
            imageUrl,
            createdBy: user.id,
            isPublic: false,
        });

        res.status(201).json(pokemon);
    } catch (err: any) {
        console.error("❌ Error generating Pokémon (compose):", err.message);
        res.status(500).json({ message: "Failed to generate Pokémon from combination." });
    }
});

/**
 * @swagger
 * /pokemon:
 *   get:
 *     summary: Get all Pokémon created by the logged-in user
 *     tags: [Pokémon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's Pokémon
 *       500:
 *         description: Server error
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
        console.error("❌ Error fetching pokemons:", err.message);
        res.status(500).json({ message: "Failed to fetch Pokémon." });
    }
});

/**
 * @swagger
 * /pokemon/{id}:
 *   get:
 *     summary: Get a Pokémon by ID (public or owned by the user)
 *     tags: [Pokémon]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pokémon details
 *       404:
 *         description: Pokémon not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authWrapper, async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user!;

    try {
        const pokemon = await Pokemon.findByPk(req.params.id, {
            include: [{ model: userModel, as: "creator", attributes: ["id", "name", "email"] }],
        });

        if (!pokemon) {
            return res.status(404).json({ message: "Pokémon not found." });
        }

        if (!pokemon.isPublic && pokemon.createdBy !== user.id) {
            return res.status(403).json({ message: "This Pokémon is private." });
        }

        res.json(pokemon);
    } catch (err: any) {
        console.error("❌ Error fetching Pokémon:", err.message);
        res.status(500).json({ message: "Failed to fetch Pokémon." });
    }
});

/**
 * @swagger
 * /pokemon/{id}/visibility:
 *   patch:
 *     summary: Toggle Pokémon visibility (public/private)
 *     tags: [Pokémon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Visibility updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Pokémon not found
 */
router.patch("/:id/visibility", authWrapper, async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user!;
    const { isPublic } = req.body;

    try {
        const pokemon = await Pokemon.findByPk(req.params.id);
        if (!pokemon) return res.status(404).json({ message: "Pokémon not found." });

        if (pokemon.createdBy !== user.id) {
            return res.status(403).json({ message: "You can only update your own Pokémon." });
        }

        await pokemon.update({ isPublic });
        res.json({ message: `Pokémon visibility set to ${isPublic ? "public" : "private"}` });
    } catch (err: any) {
        console.error("❌ Error updating visibility:", err.message);
        res.status(500).json({ message: "Failed to update visibility." });
    }
});

/**
 * @swagger
 * /pokemon/{id}:
 *   delete:
 *     summary: Delete a Pokémon created by the logged-in user
 *     tags: [Pokémon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pokémon deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Pokémon not found
 *       500:
 *         description: Server error
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
        console.error("❌ Error deleting Pokémon:", err.message);
        res.status(500).json({ message: "Failed to delete Pokémon." });
    }
});

export default router;