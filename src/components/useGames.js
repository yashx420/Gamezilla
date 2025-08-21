import { useEffect, useState } from "react";

const KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;

export function useGames(query) {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchGames() {
      if (!query || query.length < 3) {
        setGames([]);
        setError("");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const safeQuery = encodeURIComponent(query.trim());
        const res = await fetch(
          `https://api.rawg.io/api/games?search=${safeQuery}&key=${KEY}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Something went wrong fetching games");

        const data = await res.json();

        if (!data.results || data.results.length === 0) {
          throw new Error("No games found");
        }

        setGames(data.results);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();

    return () => controller.abort();
  }, [query]);

  return [games, isLoading, error];
}
