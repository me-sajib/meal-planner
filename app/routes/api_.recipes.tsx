import fs from "fs";
import path from "path";
import { json } from "@remix-run/node";

const filePath = path.resolve("app/data/recipes.json");

const readData = (): any[] => {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading meals data:", error);
        return [];
    }
};

const writeData = (data: any) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing recipes data:", error);
    }
};

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    const recipes = readData();

    if (id) {
        const item = recipes.find((i: any) => i.id === id);
        if (!item) return json({ error: "Meal not found" }, { status: 404 });
        return json(item);
    }

    return json(recipes);
}


export async function action({ request }: { request: Request }) {
    const method = request.method;
    const recipes = readData();

    switch (method) {
        case "POST": {
            const body = await request.json();
            const newItem = { id: Date.now().toString(), ...body };
            const updatedRecipes = [...recipes, newItem];

            writeData(updatedRecipes);
            return json(newItem, { status: 201 });
        }

        case "PUT": {
            const body = await request.json();
            const { id, ...updates } = body;

            const itemIndex = recipes.findIndex((i: any) => i.id === id);
            if (itemIndex === -1)
                return json({ error: "Item not found" }, { status: 404 });
            recipes[itemIndex] = { ...recipes[itemIndex], ...updates };
            writeData(recipes);
            return json(recipes[itemIndex]);
        }

        case "DELETE": {
            const body = await request.json();
            const { id } = body;

            const updatedRecipes = recipes.filter((i: any) => i.id !== id);
            if (updatedRecipes.length === recipes.length)
                return json({ error: "Item not found" }, { status: 404 });

            writeData(updatedRecipes);
            return json({ message: "Item deleted" });
        }

        default:
            return json({ error: "Method not allowed" }, { status: 405 });
    }
}
