import { useEffect, useState, type FC } from "react";
import { useSearchParams } from "react-router";
import styles from "../css/playerPage.module.css";
import { BaseButton } from "../components/BaseButton";
import { getTvDetails, type TvSeason } from "../api/tmdb";

type MediaType = "movie" | "tv";

interface Media {
    type: MediaType;
    id: string;
}

interface LastOpened extends Media {
    season?: string;
    episode?: string;
}

interface TvState {
    seasons: TvSeason[];
    season: string;
    episode: string;
    episodeCount: number;
}

const LAST_OPENED_KEY = "playerLastOpened";
const TV_PROGRESS_KEY = "playerTvProgress";

function readJson<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function getTvProgress(tvId: string): { season?: string; episode?: string } | null {
    const map = readJson<Record<string, { season?: string; episode?: string }>>(TV_PROGRESS_KEY);
    if (!map) return null;
    return map[tvId] ?? null;
}

function saveTvProgress(tvId: string, season: string, episode: string) {
    const map = readJson<Record<string, { season?: string; episode?: string }>>(TV_PROGRESS_KEY) ?? {};
    map[tvId] = { season, episode };
    localStorage.setItem(TV_PROGRESS_KEY, JSON.stringify(map));
}

function saveLastOpened(media: Media, season?: string, episode?: string) {
    const value: LastOpened = media.type == "tv"
        ? { type: "tv", id: media.id, season, episode }
        : { type: "movie", id: media.id };
    localStorage.setItem(LAST_OPENED_KEY, JSON.stringify(value));
}

function getLastOpened(): Media | null {
    const saved = readJson<{ type?: string; id?: string }>(LAST_OPENED_KEY);
    if (saved && (saved.type == "movie" || saved.type == "tv") && saved.id)
        return { type: saved.type, id: saved.id };

    // One-time migration from the pre-remake localStorage keys.
    const isMovie = localStorage.getItem("isMovie") != "false";
    const id = isMovie ? localStorage.getItem("movieId") : localStorage.getItem("tvShowId");
    if (id) {
        if (isMovie) {
            saveLastOpened({ type: "movie", id });
            return { type: "movie", id };
        }
        const season = localStorage.getItem("season") ?? "1";
        const episode = localStorage.getItem("episode") ?? "1";
        saveTvProgress(id, season, episode);
        saveLastOpened({ type: "tv", id }, season, episode);
        return { type: "tv", id };
    }
    return null;
}

function resolveInitialMedia(urlType: string | null, urlId: string | null): Media {
    if ((urlType == "movie" || urlType == "tv") && urlId) {
        const media: Media = { type: urlType, id: urlId };
        saveLastOpened(media);
        return media;
    }
    return getLastOpened() ?? { type: "movie", id: "" };
}

function playerSrc(player: string, media: Media, season: string, episode: string): string {
    if (media.type == "movie") {
        switch (player) {
            case "VidFast": return `https://vidfast.pro/movie/${media.id}`;
            case "VidSrc": return `https://vidsrc-embed.ru/embed/movie/${media.id}`;
            case "VidKing": return `https://www.vidking.net/embed/movie/${media.id}`;
            case "VidEasy": return `https://player.videasy.net/movie/${media.id}`;
            case "111movies": return `https://111movies.net/movie/${media.id}`;
        }
    }
    else {
        switch (player) {
            case "VidFast": return `https://vidfast.pro/tv/${media.id}/${season}/${episode}`;
            case "VidSrc": return `https://vidsrc-embed.ru/embed/tv/${media.id}/${season}-${episode}`;
            case "VidKing": return `https://www.vidking.net/embed/tv/${media.id}/${season}/${episode}`;
            case "VidEasy": return `https://player.videasy.net/tv/${media.id}/${season}/${episode}`;
            case "111movies": return `https://111movies.net/tv/${media.id}/${season}/${episode}`;
        }
    }
    return "";
}

export const PlayerPage: FC = () => {
    const [searchParams] = useSearchParams();
    const urlType = searchParams.get("type");
    const urlId = searchParams.get("id");

    const [media] = useState<Media>(() => resolveInitialMedia(urlType, urlId));
    const isMovie = media.type == "movie";

    const [tv, setTv] = useState<TvState | null>(null);
    const [tvError, setTvError] = useState<string>("");
    const [player, setPlayer] = useState<string>("VidSrc");
    const currPlayers = ["VidFast", "VidSrc", "VidKing", "VidEasy", "111movies"]

    // Fetch TMDB season/episode data for TV shows and restore the saved
    // season/episode for this specific show (or default to season 1, episode 1).
    useEffect(() => {
        if (isMovie || !media.id)
            return;
        let cancelled = false;
        getTvDetails(media.id)
            .then((details) => {
                if (cancelled) return;
                const seasonList = details.seasons.filter((s) => s.season_number >= 1);
                const progress = getTvProgress(media.id);
                const chosenSeasonInfo = seasonList.find((s) => String(s.season_number) == progress?.season)
                    ?? seasonList[0];
                if (!chosenSeasonInfo) {
                    setTvError("No seasons found for this TV show.");
                    return;
                }
                const chosenSeason = String(chosenSeasonInfo.season_number);
                const episodeCount = chosenSeasonInfo.episode_count ?? 0;
                const savedEpisode = parseInt(progress?.episode ?? "1", 10);
                const chosenEpisode = episodeCount > 0 ? String(Math.min(Math.max(savedEpisode, 1), episodeCount)) : "1";

                setTv({ seasons: seasonList, season: chosenSeason, episode: chosenEpisode, episodeCount });
                saveTvProgress(media.id, chosenSeason, chosenEpisode);
                saveLastOpened({ type: "tv", id: media.id }, chosenSeason, chosenEpisode);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setTvError(err instanceof Error ? err.message : "Failed to load TV show details.");
            });
        return () => { cancelled = true; };
    }, [isMovie, media.id]);

    function onSeasonChange(value: string) {
        const info = tv?.seasons.find((s) => String(s.season_number) == value);
        const episodeCount = info?.episode_count ?? 0;
        setTv((prev) => prev ? { ...prev, season: value, episodeCount, episode: "1" } : prev);
        saveTvProgress(media.id, value, "1");
        saveLastOpened({ type: "tv", id: media.id }, value, "1");
    }

    function onEpisodeChange(value: string) {
        setTv((prev) => prev ? { ...prev, episode: value } : prev);
        saveTvProgress(media.id, tv?.season ?? "1", value);
        saveLastOpened({ type: "tv", id: media.id }, tv?.season ?? "1", value);
    }

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                {tv && (
                    <div className={styles.inputs}>
                        <div className={`${styles.inputDiv} ${styles.season}`}>
                            <label className={styles.selectLabel} htmlFor="season-select">Season</label>
                            <select id="season-select" className={styles.select} value={tv.season} onChange={(e) => onSeasonChange(e.target.value)}>
                                {tv.seasons.map((s) => (
                                    <option key={s.season_number} value={s.season_number}>{s.season_number}</option>
                                ))}
                            </select>
                        </div>
                        {tv.episodeCount > 0 && (
                            <div className={`${styles.inputDiv} ${styles.episode}`}>
                                <label className={styles.selectLabel} htmlFor="episode-select">Episode</label>
                                <select id="episode-select" className={styles.select} value={tv.episode} onChange={(e) => onEpisodeChange(e.target.value)}>
                                    {Array.from({ length: tv.episodeCount }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
                {tvError && <p className={styles.error}>{tvError}</p>}
                <div className={styles.switches}>
                    {currPlayers.map((v) => (
                        <BaseButton key={v} onClick={() => {
                            setPlayer(v);
                        }} className={`${styles.switch} ${player == v ? styles.active : ""}`}>{v}</BaseButton>
                    ))}
                </div>
            </div>
            <div className={styles.playerList}>
                {!media.id ? (
                    <p>Nothing selected yet — find a movie or TV show via the search bar above.</p>
                ) : isMovie || tv || tvError ? (
                    <div className={styles.playerDiv}>
                        <p className={styles.playerTitle}>{player}</p>
                        <iframe
                            className={styles.player}
                            src={playerSrc(player, media, tv?.season ?? "1", tv?.episode ?? "1")}
                            width="100%"
                            height="100%"
                            allowFullScreen
                            allow="encrypted-media" />
                    </div>
                ) : (
                    <p>Loading season data...</p>
                )}
            </div>
        </div>
    );
}