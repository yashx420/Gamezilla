import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useGames } from "./useGames";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) => arr.reduce((acc, cur) => acc + cur, 0) / arr.length;
const KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;

export default function App() {
  const [played, setPlayed] = useLocalStorageState([], "played");
  const [watchList, setWatchList] = useLocalStorageState([], "watchList");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [sortOption, setSortOption] = useState("year-desc");

  useEffect(() => {
    document.title = "GameZilla 🎮";
  }, []);

  const [games, isLoading, error] = useGames(query);

  function onCloseGame() {
    setSelectedId(null);
  }

  function handleSelectGame(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleAddPlayed(game) {
    setPlayed((played) => {
      if (played.some((g) => g.id === game.id)) {
        return played;
      }
      return [...played, game];
    });
  }

  function handleAddWatchList(game) {
    setWatchList((watchList) => {
      if (watchList.some((g) => g.id === game.id)) {
        return watchList;
      }
      return [...watchList, game];
    });
  }

  function handleDeletePlayed(id) {
    setPlayed((played) => played.filter((game) => game.id !== id));
  }

  function handleDeleteWatchList(id) {
    setWatchList((watchList) => watchList.filter((game) => game.id !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults games={games} />
      </NavBar>
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
    </>
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

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function NumResults({ games }) {
  return (
    <p className="num-results">
      Found <strong>{games.length}</strong> results
    </p>
  );
}

function Logo() {
  function handleLogoClick() {
    window.location.reload();
  }
  return (
    <div className="logo" onClick={handleLogoClick}>
      <span role="img" aria-label="gamepad">
        🎮
      </span>
      <h1>GameZilla</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  function clearSearch() {
    setQuery("");
    inputEl.current.focus();
  }

  return (
    <div className="search-container">
      <input
        className="search"
        type="text"
        placeholder="Search games..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      {query && (
        <button className="search-clear" onClick={clearSearch}>
          ×
        </button>
      )}
    </div>
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

/* ---------- GameDetails + helpers ---------- */

export function GameDetails({
  selectedId,
  onCloseGame,
  onAddPlayed,
  played,
  onAddWatchlist,
  handleDeleteWatchList,
}) {
  const [game, setGame] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isPlayed = played.some((g) => g.id === selectedId);

  const {
    name,
    released,
    background_image,
    rating,
    description_raw: plot,
    genres = [],
    developers = [],
  } = game;

  function handleAdd() {
    if (!isPlayed) {
      const newPlayedGame = {
        id: selectedId,
        background_image,
        name,
        released,
        rating: Number(rating),
        userRating,
      };
      onAddPlayed(newPlayedGame);
      handleDeleteWatchList(newPlayedGame.id);
    }
    onCloseGame();
  }

  function handleWatchList() {
    if (!isPlayed) {
      const newWantToWatchGame = {
        id: selectedId,
        background_image,
        name,
        released,
        rating: Number(rating),
        userRating,
      };
      onAddWatchlist(newWantToWatchGame);
    }
  }

  useKey("Escape", onCloseGame);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();

    async function getGameDetails() {
      setIsLoading(true);
      try {
        const safeId = encodeURIComponent(selectedId.toString().trim());
        const res = await fetch(
          `https://api.rawg.io/api/games/${safeId}?key=${KEY}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch game details");
        const data = await res.json();
        setGame(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getGameDetails();
    return () => controller.abort();
  }, [selectedId]);

  useEffect(() => {
    if (!name) return;
    document.title = `${name} | GameZilla`;
    return () => {
      document.title = "GameZilla";
    };
  }, [name]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseGame}>
              X
            </button>
            {background_image && (
              <img
                src={background_image}
                alt={`${name} background`}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <div className="details-overview-container">
              <div className="details-info">
                <h2>{name}</h2>
                <p>{released || "Unknown release"} &bull;</p>
                <p>{genres.map((g) => g.name).join(", ") || "Unknown genre"}</p>
                <p>
                  Developed by {developers.map((d) => d.name).join(", ") || "Unknown"}
                </p>
              </div>
              <div className="rating-box">
                <h2>⭐ {rating || "N/A"} / 5</h2>
              </div>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isPlayed && <p>Your Rating: </p>}
              {isPlayed ? (
                <p>You have played this game</p>
              ) : (
                <StarRating onSetRating={setUserRating} rating={userRating} />
              )}
              <button
                className="btn-add"
                onClick={!isPlayed ? handleAdd : () => {}}
              >
                {isPlayed ? "Want to Play" : "Add to Played ✔️"}
              </button>
              {!isPlayed && (
                <button className="btn-add" onClick={handleWatchList}>
                  Want to Play 👁️‍🗨️
                </button>
              )}
            </div>
            <p>
              <em>{plot || "No description available."}</em>
            </p>
          </section>
        </>
      )}
    </div>
  );
}

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
