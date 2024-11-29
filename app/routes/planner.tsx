import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { fetchRecipes } from "./recipes";

export default function MealPlanner() {
	const [selectedDate, setSelectedDate] = useState("");
	const [mealTime, setMealTime] = useState("Breakfast");
	const [selectedRecipe, setSelectedRecipe] = useState("");
	const { data: recipes } = useQuery(["recipes"], fetchRecipes);

	const { mutate: addMealPlan } = useMutation(
		(mealPlan: {
			userId: string;
			date: string;
			mealTime: string;
			recipeId: string;
			recipe: Array<any>;
		}) =>
			fetch("/api/planner", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(mealPlan),
			}),
		{ onSuccess: () => alert("Meal plan added successfully!") }
	);

	const handleSubmit = async () => {
		await addMealPlan({
			userId: "123", // Replace with dynamic user ID
			date: selectedDate,
			mealTime,
			recipeId: selectedRecipe,
			recipe: recipes.find((recipe) => recipe.id === selectedRecipe),
		});
	};

	return (
		<div className="">
			<div></div>

			<h2 className="text-center">Plan Your Meal</h2>
			<div className="flex flex-col gap-8 justify-center items-center">
				<label>
					Date:
					<input
						className="border border-gray-300 rounded-md px-2 py-1"
						type="date"
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
					/>
				</label>
				<label>
					Meal Time:
					<select
						className="border border-gray-300 rounded-md px-2 py-1"
						value={mealTime}
						onChange={(e) => setMealTime(e.target.value)}
					>
						<option value="Breakfast">Breakfast</option>
						<option value="Lunch">Lunch</option>
						<option value="Dinner">Dinner</option>
					</select>
				</label>
				<label>
					Recipe:
					<select
						className="border border-gray-300 rounded-md px-2 py-1"
						value={selectedRecipe}
						onChange={(e) => setSelectedRecipe(e.target.value)}
					>
						{recipes?.map((recipe) => (
							<option key={recipe.id} value={recipe.id}>
								{recipe.name}
							</option>
						))}
					</select>
				</label>
				<button
					className="bg-blue-500 text-white px-4 py-2 rounded-md"
					onClick={handleSubmit}
				>
					Add Meal Plan
				</button>
			</div>
		</div>
	);
}
