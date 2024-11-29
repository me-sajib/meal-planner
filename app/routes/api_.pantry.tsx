import fs from "fs";
import path from "path";
import { json } from "@remix-run/node";

const pantryFilePath = path.resolve("app/data/pantry.json");

const readPantryData = (): any[] => {
    try {
        const data = fs.readFileSync(pantryFilePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading pantry data:", error);
        return [];
    }
};

const writePantryData = (data: any) => {
    try {
        fs.writeFileSync(pantryFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing pantry data:", error);
    }
};

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    const pantry = readPantryData();

    // If an ID is provided, return the specific ingredient
    if (id) {
        const item = pantry.find((i: any) => i.id === id);
        if (!item) return json({ error: "Item not found" }, { status: 404 });
        return json(item);
    }

    // Otherwise, return the full pantry list
    return json(pantry);
}

export async function action({ request }: { request: Request }) {
    const method = request.method;
    const pantry = readPantryData();

    switch (method) {
        case "POST": {
            const body = await request.json();
            const newItem = { id: Date.now().toString(), ...body };
            const updatedPantry = [...pantry, newItem];
            writePantryData(updatedPantry);
            return json(newItem, { status: 201 });
        }

        case "PUT": {
            const body = await request.json();
            const { id, ...updates } = body;

            const itemIndex = pantry.findIndex((i: any) => i.id === id);
            if (itemIndex === -1)
                return json({ error: "Item not found" }, { status: 404 });

            pantry[itemIndex] = { ...pantry[itemIndex], ...updates };
            writePantryData(pantry);
            return json(pantry[itemIndex]);
        }

        case "DELETE": {
            const body = await request.json();
            const { id } = body;

            const updatedPantry = pantry.filter((i: any) => i.id !== id);
            if (updatedPantry.length === pantry.length)
                return json({ error: "Item not found" }, { status: 404 });

            writePantryData(updatedPantry);
            return json({ message: "Item deleted" });
        }

        default:
            return json({ error: "Method not allowed" }, { status: 405 });
    }
}
