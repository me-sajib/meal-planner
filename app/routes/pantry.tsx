import { useQuery, useMutation, useQueryClient } from "react-query";
import { useRecipeMutation } from "~/hooks/recipes";

const fetchPantry = async () => {
	const res = await fetch("/api/pantry");
	if (!res.ok) throw new Error("Error fetching pantry data");
	return res.json();
};

const addOrUpdateIngredient = async (ingredient) => {
	const res = await fetch("/api/pantry", {
		method: ingredient.id ? "PUT" : "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(ingredient),
	});
	if (!res.ok) throw new Error("Error saving ingredient");
	return res.json();
};

const deleteIngredient = async (id) => {
	const res = await fetch("/api/pantry", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id }),
	});
	if (!res.ok) throw new Error("Error deleting ingredient");
	return res.json();
};

export default function Pantry() {
	const queryClient = useQueryClient();
	const { pantryMutation } = useRecipeMutation();
	// Fetch pantry data
	const {
		data: ingredients = [],
		isLoading,
		error,
	} = useQuery(["pantry"], fetchPantry);

	// Mutations for add/update and delete
	const addOrUpdateMutation = useMutation(addOrUpdateIngredient, {
		onSuccess: () => queryClient.invalidateQueries(["pantry"]),
	});

	const deleteMutation = useMutation(deleteIngredient, {
		onSuccess: () => queryClient.invalidateQueries(["pantry"]),
	});

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {(error as any).message}</div>;

	return (
		<div className="p-4">
			<h1 className="text-xl font-bold mb-4">Pantry</h1>
			<ul>
				{ingredients &&
					ingredients?.map((item) => (
						<li
							key={item.id}
							className="flex justify-between items-center mb-2"
						>
							<span>
								{item.name} {item?.measure && `(${item.measure})`}
							</span>
							<button
								onClick={() =>
									pantryMutation.mutate({ ...item, active: !item.active })
								}
								className={`px-2 py-1 rounded ${
									item.active
										? "bg-green-500 text-white"
										: "bg-gray-500 text-white"
								}`}
							>
								{item.active ? "Active" : "Inactive"}
							</button>
							<button
								onClick={() => deleteMutation.mutate(item.id)}
								className="bg-red-500 text-white px-2 py-1 rounded ml-2"
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
				Add New Ingredient
			</button>
		</div>
	);
}
