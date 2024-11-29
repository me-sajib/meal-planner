import { useQuery } from "react-query";
import { useRecipeMutation } from "~/hooks/recipes"; // Import your custom hook

// Fetch function for recipes
export const fetchRecipes = async () => {
	const res = await fetch("/api/recipes");
	if (!res.ok) throw new Error("Error fetching recipes data");
	return res.json();
};

export default function Index() {
	const { data, isLoading, error } = useQuery(["recipes"], fetchRecipes);

	// Use the custom hook to handle add, update, and delete mutations
	const { addOrUpdateMutation, deleteMutation, pantryMutation } =
		useRecipeMutation();

	// Handle when recipes data is not available or not an array
	const recipes = Array.isArray(data) ? data : []; // Ensure 'recipes' is always an array

	const handleAddToPantry = (recipe) => {
		pantryMutation.mutate({
			name: recipe.name,
			measure: recipe?.measure,
			ingredients: recipe?.ingredients || [],
			instructions: recipe?.instructions || [],
			active: true, // Default to active when adding
		});
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {(error as any).message}</div>;

	return (
		<>
			<div className="p-4">
				<h1 className="text-xl font-bold mb-4">Recipes</h1>
				<ul>
					{recipes.map((recipe) => (
						<li
							key={recipe.id}
							className="flex justify-between items-center mb-2"
						>
							<span>{recipe.name}</span>
							<button
								onClick={() => handleAddToPantry(recipe)}
								className="bg-blue-500 text-white px-2 py-1 rounded"
							>
								Add Ingredients to Pantry
							</button>
						</li>
					))}
				</ul>
			</div>
			{/* <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Saved Recipes</h1>
            <ul>
                {recipes.map((item) => (
                    <li
                        key={item.id}
                        className={`flex justify-between items-center mb-2 
                            }`}
                    >
                        <span>{item.name}</span>
                        <button
                            onClick={() =>
                                addOrUpdateMutation.mutate({ ...item, has: !item.active })
                            }
                            className={`bg-gray-200 px-2 py-1 rounded ${!item.active ? "text-green-600" : "text-red-600"} `}
                        >
                            {!item.active ? "Active" : "Inactive"}
                        </button>
                        <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="bg-red-200 px-2 py-1 rounded ml-2"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <button
                onClick={() =>
                    addOrUpdateMutation.mutate({ name: "New Ingredient", has: false })
                }
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
                Add New
            </button>
        </div> */}
		</>
	);
}
