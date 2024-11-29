import { Link } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Dialog, Transition } from "@headlessui/react";
import { useRecipeMutation } from "~/hooks/recipes";
import { fetchRecipes } from "./recipes";

// Fetch search results from the backend
const fetchSearch = async (keyword: string) => {
	const response = await fetch(`/api/explore?keyword=${keyword}`);
	if (!response.ok) {
		throw new Error("Failed to fetch search results");
	}
	return response.json();
};

export const formatMealData = (data) => {
	const ingredients: any[] = [];
	for (let i = 1; i <= 20; i++) {
		const ingredient = data[`strIngredient${i}`]
			?.trim()
			.toLowerCase()
			.split(" ")
			.join("_")
			.replace("-", "_");
		const measure = data[`strMeasure${i}`]?.trim();
		if (ingredient) {
			ingredients.push({ ingredient, measure });
		}
	}

	const instructions = data.strInstructions
		.split("\r\n")
		.map((step) => step.trim())
		.filter((step) => step !== "" && !/^STEP\s\d+/.test(step)); // Remove "STEP X" lines

	return {
		id: data.idMeal,
		name: data.strMeal,
		category: data.strCategory,
		area: data.strArea,
		thumbnail: data.strMealThumb,
		tags: data.strTags?.split(",") || [],
		youtube: data.strYoutube,
		source: data.strSource,
		ingredients,
		instructions,
	};
};

export default function Index() {
	const [keyword, setKeyword] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const {
		data: results,
		error,
		isFetching,
	} = useQuery(["search", keyword], () => fetchSearch(keyword), {
		enabled: keyword.length > 3, // Fetch only if keyword length > 3
	});

	const {
		data: recipesData,
		isLoading: loadingRecipes,
		error: recipesError,
	} = useQuery(["recipes"], fetchRecipes);

	const { addOrUpdateMutation, pantryMutation } = useRecipeMutation();

	const handleAddRecipe = (recipe) => {
		const data = {
			name: recipe.name,
			ingredients: recipe?.ingredients,
			instructions: recipe?.instructions,
			active: true,
		};
		addOrUpdateMutation.mutate(data);
		pantryMutation.mutate(data);
		setIsOpen(false);
	};

	const recipes = Array.isArray(recipesData) ? recipesData : []; // Ensure 'recipes' is always an array

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && keyword.trim()) {
		}
	};

	if (error) return <div>Error: {(error as any).message}</div>;

	return (
		<div className="p-4">
			<h1 className="text-xl font-bold mb-4">Search Recipes</h1>
			<div className="flex flex-col">
				<input
					value={keyword}
					onKeyDown={handleKeyDown}
					onChange={(e) => setKeyword(e.target.value)}
					className="border px-2 py-1 rounded w-full mb-4"
					placeholder="Type a recipe and press Enter"
				/>

				<span>or</span>
				<Link to="/random" className="text-blue-500">
					Explore Random
				</Link>
			</div>
			{isFetching && <p>Loading...</p>}
			{error && <p className="text-red-500">Error: {(error as any).message}</p>}

			{results?.meals && (
				<ul className="grid grid-cols-4 gap-4">
					{results.meals.map((meal, i) => (
						<RecipeCard
							key={i}
							meal={meal}
							onAdd={handleAddRecipe}
							isOpen={isOpen}
							setIsOpen={setIsOpen}
						/>
					))}
				</ul>
			)}
		</div>
	);
}

function RecipeCard({ meal, onAdd, isOpen, setIsOpen }) {
	const formattedMeal = formatMealData(meal);

	return (
		<li
			onClick={() => setIsOpen(true)}
			className="cursor-pointer rounded-sm border overflow-hidden"
		>
			<img src={meal.strMealThumb} alt={meal.strMeal} />
			<h2 className="font-bold">{meal.strMeal}</h2>
			<RecipeModal
				item={formattedMeal}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				onSubmit={onAdd}
			/>
		</li>
	);
}

// Modal component to display detailed recipe info
function RecipeModal({ item, isOpen, onClose, onSubmit }) {
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-[100]" onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-75" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex items-center justify-center min-h-full p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-secondary-900 rounded-sm">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-white"
								>
									{item.name}
								</Dialog.Title>
								<div className="mt-2 text-white">
									<p>Category: {item.category}</p>
									<p>Area: {item.area}</p>
									<h4 className="font-bold mt-4">Ingredients:</h4>
									<ul>
										{item.ingredients.map((ing, idx) => (
											<li key={idx}>
												{ing.measure} {ing.ingredient}
											</li>
										))}
									</ul>
									<h4 className="font-bold mt-4">Instructions:</h4>
									<ol>
										{item.instructions.map((step, idx) => (
											<li key={idx}>{step}</li>
										))}
									</ol>
								</div>
								<div className="mt-4 flex space-x-2">
									<button
										onClick={() => onSubmit(item)}
										className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
									>
										Add New
									</button>
									<button
										type="button"
										className="bg-red-500 hover:bg-red-400 text-white py-2 px-4 rounded"
										onClick={onClose}
									>
										Close
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
