import { json } from "@remix-run/node";
import axios from "axios";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword") || "";

  try {
    const response = await axios.get(
      `https://themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        keyword
      )}`
    );

    // Extract only the data property to avoid circular references
    return json(response.data);
  } catch (error) {
    console.error("Error fetching recipes:", error);

    return json(
      { error: "Failed to fetch recipes. Please try again later." },
      { status: 500 }
    );
  }
}
