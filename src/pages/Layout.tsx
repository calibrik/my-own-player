import { type FC } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import styles from '../css/layout.module.css';
import { Header } from "../components/Header";

export const Layout: FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.containerFullWindow}>
                <Header />
                <div className={styles.containerMain}>
                    <Outlet />
                    <ScrollRestoration />
                </div>
            </div>
        </div>
    );
}