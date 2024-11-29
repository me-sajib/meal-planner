import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";

import "./tailwind.css";
import { QueryClient, QueryClientProvider } from "react-query";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="overflow-x-hidden flex flex-col min-h-screen">
				<nav className="mb-4 flex w-full space-x-4 border-b border-slate-800 p-4">
					<Link to="/recipes" className="text-blue-500">
						Recipes
					</Link>
					<Link to="/pantry" className="mr-4 text-blue-500">
						Pantry
					</Link>
					<Link to="/explore" className="text-blue-500">
						Explore
					</Link>
					<Link to="/planner" className="mr-4 text-blue-500">
						Meal Planner
					</Link>
					<Link to="/meal" className="mr-4 text-blue-500">
						Planned Meals
					</Link>
				</nav>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
const queryClient = new QueryClient();
export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Outlet />
		</QueryClientProvider>
	);
}
