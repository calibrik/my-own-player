import { useRef, type FC } from "react";
import { useNavigate, useSearchParams } from "react-router";
import styles from "../css/header.module.css";
import { InputField, type InputFieldHandle } from "./InputField";

export const Header: FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") ?? "";
    const navigate = useNavigate();
    const searchInputRef = useRef<InputFieldHandle>(null);

    function onSearchSubmit(event: React.FormEvent) {
        event.preventDefault();
        const rawQuery = searchInputRef.current?.getInput();
        const typedQuery = typeof rawQuery == "string" ? rawQuery.trim() : "";
        if (typedQuery)
            navigate(`/search?q=${encodeURIComponent(typedQuery)}`);
    }

    return (
        <header className={styles.header}>
            <form className={styles.searchForm} onSubmit={onSearchSubmit}>
                <div className={styles.searchBox}>
                    <InputField
                        key={query}
                        ref={searchInputRef}
                        isSearch
                        type="text"
                        defaultValue={query}
                        placeholder="Search movies & TV shows"
                        className={styles.searchInput} />
                </div>
            </form>
        </header>
    );
}