import { useMutation, useQueryClient } from "react-query";

// API calls for adding/updating and deleting recipes
const addOrUpdateIngredient = async (ingredient) => {
	const res = await fetch("/api/recipes", {
		method: ingredient.id ? "PUT" : "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(ingredient),
	});
	if (!res.ok) throw new Error("Error saving ingredient");
	return res.json();
};

const deleteIngredient = async (id) => {
	const res = await fetch("/api/recipes", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id }),
	});
	if (!res.ok) throw new Error("Error deleting ingredient");
	return res.json();
};

// API calls for adding/updating and deleting pantry items
const addOrUpdatePantryItem = async (item) => {
	const res = await fetch("/api/pantry", {
		method: item.id ? "PUT" : "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(item),
	});
	if (!res.ok) throw new Error("Error saving pantry item");
	return res.json();
};

const deletePantryItem = async (id) => {
	const res = await fetch("/api/pantry", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id }),
	});
	if (!res.ok) throw new Error("Error deleting pantry item");
	return res.json();
};

const getMealItem = async (id) => {
	const res = await fetch("/api/meal", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id }),
	});
	if (!res.ok) throw new Error("Error deleting pantry item");
	return res.json();
};

// Extend the custom hook to handle pantry items

// Custom hook to handle add, update, and delete
export const useRecipeMutation = () => {
	const queryClient = useQueryClient();

	// Mutation for add/update
	const addOrUpdateMutation = useMutation(addOrUpdateIngredient, {
		onSuccess: () => queryClient.invalidateQueries(["recipes"]),
	});

	// Mutation for delete
	const deleteMutation = useMutation(deleteIngredient, {
		onSuccess: () => queryClient.invalidateQueries(["recipes"]),
	});

	const pantryMutation = useMutation(addOrUpdatePantryItem, {
		onSuccess: () => queryClient.invalidateQueries(["pantry"]),
	});

	const pantryDeleteMutation = useMutation(deletePantryItem, {
		onSuccess: () => queryClient.invalidateQueries(["pantry"]),
	});

	const getMealItemMutation = useMutation(getMealItem, {
		onSuccess: () => queryClient.invalidateQueries(["mealplans"]),
	});

	return {
		addOrUpdateMutation,
		deleteMutation,
		pantryMutation,
		pantryDeleteMutation,
		getMealItemMutation,
	};
};
