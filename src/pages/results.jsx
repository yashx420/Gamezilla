"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSearchParams } from "next/navigation";
import StarRating from "@/components/StarRating";
import { useGames } from "@/components/useGames";
import { useLocalStorageState } from "@/components/useLocalStorageState";
import { useKey } from "@/components/useKey";

const average = (arr) => arr.reduce((acc, cur) => acc + cur, 0) / arr.length;
const KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [played, setPlayed] = useLocalStorageState([], "played");
  const [watchList, setWatchList] = useLocalStorageState([], "watchList");
  const [selectedId, setSelectedId] = useState(null);
  const [sortOption, setSortOption] = useState("year-desc");

  const [games, isLoading, error] = useGames(search);

  function onCloseGame() {
    setSelectedId(null);
  }

  function handleSelectGame(id) {
    setSelectedId((prev) => (id === prev ? null : id));
  }

  function handleAddPlayed(game) {
    setPlayed((prev) => (prev.some((g) => g.id === game.id) ? prev : [...prev, game]));
  }

  function handleAddWatchList(game) {
    setWatchList((prev) =>
      prev.some((g) => g.id === game.id) ? prev : [...prev, game]
    );
  }

  function handleDeletePlayed(id) {
    setPlayed((prev) => prev.filter((g) => g.id !== id));
  }

  function handleDeleteWatchList(id) {
    setWatchList((prev) => prev.filter((g) => g.id !== id));
  }

  useEffect(() => {
    document.title = "GameZilla 🎮";
  }, []);

  return (
    <Layout>
      <NumResults games={games} />

      <Main>
        <Box>
          <WatchList
            watchList={watchList}
            handleDeleteWatchList={handleDeleteWatchList}
          />
        </Box>

        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <GameList
              games={games}
              handleSelectGame={handleSelectGame}
              selectedId={selectedId}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          )}
          {error && <ErrorMsg message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <GameDetails
              played={played}
              selectedId={selectedId}
              onCloseGame={onCloseGame}
              onAddPlayed={handleAddPlayed}
              onAddWatchlist={handleAddWatchList}
              handleDeleteWatchList={handleDeleteWatchList}
            />
          ) : (
            <>
              <PlayedSummary played={played} />
              <PlayedGamesList
                played={played}
                handleDelete={handleDeletePlayed}
              />
            </>
          )}
        </Box>
      </Main>
    </Layout>
  );
}

/* ---------- Sub-components ---------- */

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Loader() {
  return (
    <div className="container">
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
    </div>
  );
}

function ErrorMsg({ message }) {
  return <p className="error">{message}</p>;
}

function NumResults({ games }) {
  return (
    <p className="num-results">
      Found <strong>{games.length}</strong> results
    </p>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div
      className="box"
      style={{ height: isOpen ? "100%" : "3rem", overflowY: "auto" }}
    >
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
    </div>
  );
}

function WatchList({ watchList, handleDeleteWatchList }) {
  return (
    <>
      <p className="text1">Want To Play:</p>
      <section className="watchList-summary">
        {watchList.length > 0 ? watchList.length : "No"} game
        {watchList.length !== 1 ? "s" : ""} left to play...
      </section>
      <ul className="list">
        {watchList.map((game) => (
          <WatchlistGame
            game={game}
            key={game.id}
            handleDelete={handleDeleteWatchList}
          />
        ))}
      </ul>
    </>
  );
}

function GameList({ games, handleSelectGame, sortOption, setSortOption }) {
  const sortedGames = [...games].sort((a, b) => {
    switch (sortOption) {
      case "year-asc":
        return (a.released?.split("-")[0] || 0) - (b.released?.split("-")[0] || 0);
      case "year-desc":
        return (b.released?.split("-")[0] || 0) - (a.released?.split("-")[0] || 0);
      case "rating-asc":
        return a.rating - b.rating;
      case "rating-desc":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <>
      <p className="text1">Search Results</p>
      {games.length > 0 && (
        <div className="sort-container">
          <label htmlFor="sort">Sort: </label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="year-desc">Year: New → Old</option>
            <option value="year-asc">Year: Old → New</option>
            <option value="rating-desc">Rating: High → Low</option>
            <option value="rating-asc">Rating: Low → High</option>
          </select>
        </div>
      )}
      <ul className="list list-games">
        {sortedGames.map((game) => (
          <Game
            game={game}
            key={game.id}
            handleSelectGame={handleSelectGame}
          />
        ))}
      </ul>
    </>
  );
}

/* ---------- Game Component ---------- */

function Game({ game, handleSelectGame }) {
  const safeImage = game.background_image || "";
  return (
    <li onClick={() => handleSelectGame(game.id)}>
      {safeImage && (
        <img
          className="search_logo"
          src={safeImage}
          alt={`${game.name} background`}
          onError={(e) => (e.target.style.display = "none")}
        />
      )}
      <h3>{game.name}</h3>
      <div>
        <p><span>{game.released?.split("-")[0] || "N/A"}</span></p>
        <p><span>⭐</span><span>{game.rating}</span></p>
      </div>
    </li>
  );
}

/* ---------- Played Summary ---------- */

function PlayedSummary({ played }) {
  const avgRating = played.length > 0 ? average(played.map((g) => g.rating)) : 0;
  const avgUserRating =
    played.length > 0 ? average(played.map((game) => game.userRating)) : 0;
  return (
    <div className="summary">
      <h2>Recently Played</h2>
      <div>
        <p><span>#️⃣</span><span>{played.length} games</span></p>
        <p><span>⭐️</span><span>{avgRating.toFixed(2)}</span></p>
        <p><span>🌟</span><span>{avgUserRating.toFixed(2)}</span></p>
      </div>
    </div>
  );
}

/* ---------- Played/Watchlist Game Components ---------- */

function PlayedGamesList({ played, handleDelete }) {
  return (
    <ul className="list">
      {played.map((game) => (
        <PlayedGame game={game} key={game.id} handleDelete={handleDelete} />
      ))}
    </ul>
  );
}

function WatchlistGame({ game, handleDelete }) {
  return (
    <li>
      <img src={game.background_image} alt={`${game.name} background_image`} />
      <h3>{game.name}</h3>
      <div>
        <p><span>⭐️</span><span>{game.rating}</span></p>
        <p><span>🌟</span><span>{game.userRating}</span></p>
      </div>
      <button className="btn-delete" onClick={() => handleDelete(game.id)}>
        ❌
      </button>
    </li>
  );
}

function PlayedGame({ game, handleDelete }) {
  return (
    <li>
      <img src={game.background_image} alt={`${game.name} background_image`} />
      <h3>{game.name}</h3>
      <div>
        <p><span>⭐️</span><span>{game.rating}</span></p>
        <p><span>🌟</span><span>{game.userRating}</span></p>
      </div>
      <button className="btn-delete" onClick={() => handleDelete(game.id)}>
        ❌
      </button>
    </li>
  );
}
