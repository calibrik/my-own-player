export interface SearchResult {
    id: number;
    media_type: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
}

export interface SearchResponse {
    page: number;
    results: SearchResult[];
    total_pages: number;
    total_results: number;
}

export async function searchMulti(query: string): Promise<SearchResponse> {
    // No API key here - it is injected server-side by the host proxy
    // (Vite dev middleware, Netlify function, or nginx).
    const params = new URLSearchParams({
        query,
        include_adult: "false",
        language: "en-US",
        page: "1",
    });

    const response = await fetch(`/api/tmdb/search/multi?${params.toString()}`);
    if (!response.ok)
        throw new Error(`TMDB search failed with status ${response.status}`);

    return response.json();
}

export interface TvSeason {
    season_number: number;
    episode_count: number;
    name?: string;
}

export interface TvDetails {
    id: number;
    name?: string;
    seasons: TvSeason[];
}

export async function getTvDetails(tvId: string): Promise<TvDetails> {
    // No API key here - it is injected server-side by the host proxy
    // (Vite dev middleware, Netlify function, or nginx).
    const params = new URLSearchParams({
        language: "en-US",
    });

    const response = await fetch(`/api/tmdb/tv/${tvId}?${params.toString()}`);
    if (!response.ok)
        throw new Error(`TMDB tv details failed with status ${response.status}`);

    return response.json();
}