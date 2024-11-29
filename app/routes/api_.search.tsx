import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get("offset") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const keyword = url.searchParams.get("keyword") || "";
    // const results = await eventfully.searchQuery({ keyword, limit, offset });
console.log("search for ", keyword)
    const results = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`
    );
    return json(results);
}