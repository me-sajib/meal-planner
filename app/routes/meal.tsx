import { useState } from "react";
import { useQuery } from "react-query";

export default function MealPlanView() {
	const [timeframe, setTimeframe] = useState("1yr");
	const startDate = new Date();
	const endDate = new Date();
	if (timeframe === "2-week") endDate.setDate(startDate.getDate() + 14);
	else if (timeframe === "1-week") endDate.setDate(startDate.getDate() + 7);
	else if (timeframe === "1-month") endDate.setMonth(startDate.getMonth() + 1);
	else if (timeframe === "1yr") endDate.setMonth(startDate.getMonth() + 12);

	const { data: mealPlans, isLoading } = useQuery(
		["mealplans", timeframe],
		() =>
			fetch(
				`/api/planner?userId=123&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
			).then((res) => res.json())
	);

	// const { data: mealPlans, isLoading } = useQuery(["mealplans"], () =>
	// 	fetch("/api/planner?userId=123").then((res) => res.json())
	// );

	if (isLoading) return <p>Loading...</p>;
	return (
		<div className="p-4">
			<h2 className="text-center pb-5">All Meal Plan</h2>
			<div className="flex items-start justify-center">
				<label>
					<select
						className="border border-gray-300 rounded-md px-2 py-1"
						value={timeframe}
						onChange={(e) => setTimeframe(e.target.value)}
					>
						<option value="1-week">1 Week</option>
						<option value="2-week">2 Weeks</option>
						<option value="1-month">1 Month</option>
					</select>
				</label>
			</div>

			<div className="flex items-center justify-center">
				<ul className="pl-4">
					{mealPlans &&
						mealPlans?.map((plan) => (
							<li key={plan?.id}>
								{plan?.date} - {plan?.mealTime} - {plan?.recipe?.name}
							</li>
						))}
				</ul>
			</div>
		</div>
	);
}
