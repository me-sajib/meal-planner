import fs from "fs";
import path from "path";
import { json } from "@remix-run/node";

const filePath = path.resolve("app/data/meal.json");

// Function to read data from the JSON file
const readData = (): any[] => {
	try {
		const data = fs.readFileSync(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error reading meal data:", error);
		return [];
	}
};

// Function to write data to the JSON file
const writeData = (data: any) => {
	try {
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
	} catch (error) {
		console.error("Error writing meal data:", error);
	}
};

// **Loader**: Handles GET requests
export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url);
	const userId = url.searchParams.get("userId");
	const startDate = url.searchParams.get("startDate");
	const endDate = url.searchParams.get("endDate");
	console.log("call loader", userId, startDate, endDate);
	const mealPlans = readData();

	// Filter by userId and date range if provided
	let filteredMealPlans = mealPlans;
	if (userId)
		filteredMealPlans = filteredMealPlans.filter((i) => i.userId === userId);
	if (startDate && endDate) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		filteredMealPlans = filteredMealPlans.filter(
			(i) => new Date(i.date) >= start && new Date(i.date) <= end
		);
	}

	return json(filteredMealPlans);
}

// **Action**: Handles POST, PUT, and DELETE requests
export async function action({ request }: { request: Request }) {
	const method = request.method;
	const mealPlans = readData();

	switch (method) {
		// Add a new meal plan
		case "POST": {
			const body = await request.json();
			const newMealPlan = {
				id: Date.now().toString(),
				...body, // Expect userId, date, mealTime, recipeId
			};

			mealPlans.push(newMealPlan);
			writeData(mealPlans);

			return json(newMealPlan, { status: 201 });
		}

		// Update an existing meal plan
		case "PUT": {
			const body = await request.json();
			const { id, ...updates } = body;

			const index = mealPlans.findIndex((i) => i.id === id);
			if (index === -1)
				return json({ error: "Meal plan not found" }, { status: 404 });

			mealPlans[index] = { ...mealPlans[index], ...updates };
			writeData(mealPlans);

			return json(mealPlans[index]);
		}

		// Delete a meal plan
		case "DELETE": {
			const body = await request.json();
			const { id } = body;

			const updatedMealPlans = mealPlans.filter((i) => i.id !== id);
			if (updatedMealPlans.length === mealPlans.length)
				return json({ error: "Meal plan not found" }, { status: 404 });

			writeData(updatedMealPlans);

			return json({ message: "Meal plan deleted" });
		}

		default:
			return json({ error: "Method not allowed" }, { status: 405 });
	}
}
