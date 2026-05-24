import { useEffect, useState, type FC } from "react"
import styles from "../css/playerPage.module.css";
import { InputField } from "../components/InputField";
import { BaseButton } from "../components/BaseButton";

interface IPlayerPageProps { }

export const PlayerPage: FC<IPlayerPageProps> = () => {
    const [tvShowId, setTvShowId] = useState<string>("");
    const [season, setSeason] = useState<string>("");
    const [episode, setEpisode] = useState<string>("");
    const [isMovie, setIsMovie] = useState<boolean>(true);
    const [movieId, setMovieId] = useState<string>("")
    const [player, setPlayer] = useState<string>("VidSrc");
    const currPlayers = ["VidFast", "VidSrc", "VidKing", "VidEasy", "111movies"]

    useEffect(() => {
        setTvShowId(localStorage.getItem("tvShowId") ?? "")
        setSeason(localStorage.getItem("season") ?? "")
        setEpisode(localStorage.getItem("episode") ?? "")
        setMovieId(localStorage.getItem("movieId") ?? "");
        setIsMovie((localStorage.getItem("isMovie") ?? 'true') == 'true');
    }, [])

    let currPlayer;
    if (player == "VidFast")
        currPlayer = <div className={styles.playerDiv}>
            <p className={styles.playerTitle}>VidFast</p>
            <iframe
                className={styles.player}
                src={isMovie ? `https://vidfast.pro/movie/${movieId}` : `https://vidfast.pro/tv/${tvShowId}/${season}/${episode}`}
                width="100%"
                height="100%"
                allowFullScreen
                allow="encrypted-media" />
        </div>
    if (player == "VidSrc")
        currPlayer = <div className={styles.playerDiv}>
            <p className={styles.playerTitle}>VidSrc</p>
            <iframe
                className={styles.player}
                src={isMovie ? `https://vidsrc-embed.ru/embed/movie/${movieId}` : `https://vidsrc-embed.ru/embed/tv/${tvShowId}/${season}-${episode}`}
                width="100%"
                height="100%"
                allowFullScreen
                allow="encrypted-media" />
        </div>
    if (player == "VidKing")
        currPlayer = <div className={styles.playerDiv}>
            <p className={styles.playerTitle}>VidKing</p>
            <iframe
                className={styles.player}
                src={isMovie ? `https://www.vidking.net/embed/movie/${movieId}` : `https://www.vidking.net/embed/tv/${tvShowId}/${season}/${episode}`}
                width="100%"
                height="100%"
                allowFullScreen
                allow="encrypted-media" />
        </div>
    if (player == "VidEasy")
        currPlayer = <div className={styles.playerDiv}>
            <p className={styles.playerTitle}>VidEasy</p>
            <iframe
                className={styles.player}
                src={isMovie ? `https://player.videasy.net/movie/${movieId}` : `https://player.videasy.net/tv/${tvShowId}/${season}/${episode}`}
                width="100%"
                height="100%"
                allowFullScreen
                allow="encrypted-media" />
        </div>
    if (player == "111movies")
        currPlayer = <div className={styles.playerDiv}>
            <p className={styles.playerTitle}>111movies</p>
            <iframe
                className={styles.player}
                src={isMovie ? `https://111movies.net/movie/${movieId}` : `https://111movies.net/tv/${tvShowId}/${season}/${episode}`}
                width="100%"
                height="100%"
                allowFullScreen
                allow="encrypted-media" />
        </div>

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.switches}>
                    <BaseButton onClick={() => {
                        setIsMovie(true);
                        localStorage.setItem("isMovie", "true");
                    }} className={`${styles.switch} ${isMovie ? styles.active : ""}`}>Movie</BaseButton>
                    <BaseButton onClick={() => {
                        setIsMovie(false);
                        localStorage.setItem("isMovie", "false");
                    }} className={`${styles.switch} ${!isMovie ? styles.active : ""}`}>TV show</BaseButton>
                </div>
                <div className={styles.inputs}>
                    {isMovie ?
                        <div className={`${styles.inputDiv} ${styles.tvShowId}`}>
                            <InputField type="text" value={movieId} onChange={(v) => {
                                setMovieId(v.trim());
                                localStorage.setItem("movieId", v.trim());
                            }} placeholder="Movie ID" className={styles.input} />
                        </div> :
                        <>
                            <div className={`${styles.inputDiv} ${styles.tvShowId}`}>
                                <InputField type="text" value={tvShowId} onChange={(v) => {
                                    setTvShowId(v.trim());
                                    localStorage.setItem("tvShowId", v.trim());
                                }} placeholder="TV Show ID" className={styles.input} />
                            </div>
                            <div className={`${styles.inputDiv} ${styles.season}`}>
                                <InputField type="number" value={season} onChange={(v) => {
                                    setSeason(v.trim());
                                    localStorage.setItem("season", v.trim());
                                }} placeholder="Season" className={styles.input} />
                            </div>
                            <div className={`${styles.inputDiv} ${styles.episode}`}>
                                <InputField type="number" value={episode} onChange={(v) => {
                                    setEpisode(v.trim());
                                    localStorage.setItem("episode", v.trim());
                                }} placeholder="Episode" className={styles.input} />
                            </div>
                        </>
                    }
                </div>
                <p>Try either id from imdb or tmdb</p>
                <div className={styles.switches}>
                    {currPlayers.map((v) => (
                        <BaseButton onClick={() => {
                            setPlayer(v);
                        }} className={`${styles.switch} ${player == v ? styles.active : ""}`}>{v}</BaseButton>
                    ))}
                </div>
            </div>
            <div className={styles.playerList}>
                {currPlayer}
            </div>
        </div>
    )
}