import { useEffect, useState, type FC, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { searchMulti, type SearchResult } from "../api/tmdb";
import { Spinner } from "../components/Icons";
import styles from "../css/searchPage.module.css";

interface SearchData {
    query: string;
    results: SearchResult[];
    error: string;
}

export const SearchPage: FC = () => {
    const [searchParams] = useSearchParams();
    const query = (searchParams.get("q") ?? "").trim();

    const [data, setData] = useState<SearchData>({ query: "", results: [], error: "" });

    useEffect(() => {
        if (!query)
            return;

        let cancelled = false;
        searchMulti(query)
            .then((response) => {
                if (cancelled) return;
                setData({
                    query,
                    results: response.results.filter((r) => r.media_type == "movie" || r.media_type == "tv"),
                    error: "",
                });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setData({
                    query,
                    results: [],
                    error: err instanceof Error ? err.message : "Something went wrong while searching.",
                });
            });

        return () => { cancelled = true; };
    }, [query]);

    const loading = query !== "" && data.query !== query;
    const hasError = !loading && query !== "" && data.query === query && data.error !== "";

    function getTitle(result: SearchResult) {
        return result.media_type == "movie" ? result.title : result.name;
    }

    function getYear(result: SearchResult) {
        const date = result.media_type == "movie" ? result.release_date : result.first_air_date;
        return date ? date.slice(0, 4) : "";
    }

    let content: ReactNode;
    if (!query)
        content = (
            <div className={styles.state}>
                <p>Type a title in the search bar above to find movies and TV shows.</p>
            </div>
        );
    else if (loading)
        content = (
            <div className={styles.state}>
                <Spinner spin className={styles.spinner} />
                <p>Searching...</p>
            </div>
        );
    else if (hasError)
        content = (
            <div className={styles.state}>
                <p className={styles.error}>{data.error}</p>
            </div>
        );
    else if (data.results.length == 0)
        content = (
            <div className={styles.state}>
                <p>No results found for "{query}".</p>
            </div>
        );
    else
        content = (
            <div className={styles.grid}>
                {data.results.map((result) => {
                    const title = getTitle(result);
                    const year = getYear(result);
                    const posterUrl = result.poster_path
                        ? `https://image.tmdb.org/t/p/w342${result.poster_path}`
                        : "";
                    return (
                        <Link
                            title={title}
                            key={`${result.media_type}-${result.id}`}
                            to={`/player?type=${result.media_type}&id=${result.id}`}
                            className={styles.card}>
                            {posterUrl ?
                                <img className={styles.poster} src={posterUrl} alt={title} loading="lazy" /> :
                                <div className={styles.noPoster}>{title}</div>}
                            <div className={styles.cardInfo}>
                                <p className={styles.title}>{title}</p>
                                <p className={styles.year}>{year}</p>
                                <span className={`${styles.badge} ${result.media_type == "movie" ? styles.movie : styles.tv}`}>
                                    {result.media_type == "movie" ? "Movie" : "TV"}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>{query ? `Search results for "${query}"` : "Search"}</h1>
            {content}
        </div>
    );
};