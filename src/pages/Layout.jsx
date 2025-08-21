"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useKey } from "../components/useKey";

export default function Layout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/results?search=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} onSubmit={handleSearchSubmit} />
        <UserMenu />
      </NavBar>
      <main>{children}</main>
    </>
  );
}

export function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

export function Search({ query, setQuery, onSubmit }) {
  const inputEl = useRef(null);

  useKey("Enter", () => {
    if (document.activeElement !== inputEl.current) return;
    onSubmit(new Event("submit"));
  });

  function clearSearch() {
    setQuery("");
    inputEl.current.focus();
  }

  return (
    <form className="search-container" onSubmit={onSubmit}>
      <input
        className="search"
        type="text"
        placeholder="Search games..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      {query && (
        <button type="button" className="search-clear" onClick={clearSearch}>
          ×
        </button>
      )}
      <button type="submit" style={{ display: "none" }} />
    </form>
  );
}

function Logo() {
  const router = useRouter();
  return (
    <div className="logo" onClick={() => router.push("/")}>
      <span role="img" aria-label="gamepad">
        🎮
      </span>
      <h1>GameZilla</h1>
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="user-menu" ref={dropdownRef}>
      <Link href="/login"><button className="btn-login">Login</button></Link>
      <Link href="/signup"><button className="btn-signup">Sign-up</button></Link>
      <div className="dropdown">
        <button className="btn-dropdown" onClick={() => setOpen(!open)}>
          ☰
        </button>
        {open && (
          <ul className="dropdown-menu">
            <li onClick={() => router.push("/profile")}>Profile</li>
            <li onClick={() => router.push("/settings")}>Settings</li>
          </ul>
        )}
      </div>
    </div>
  );
}
