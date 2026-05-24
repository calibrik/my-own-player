import type { FC, ReactNode } from "react";
import styles from '../css/baseButton.module.css';

export interface IBaseButtonProps {
    children?: ReactNode;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
    className?: string;
    type?: "submit" | "reset" | "button" | undefined;
    disabled?: boolean;
    icon?: ReactNode
    iconPos?: "start" | "end"
};

export const BaseButton: FC<IBaseButtonProps> = (props) => {
    let children: ReactNode;
    if (props.icon) {
        if (props.iconPos === 'start') {
            children = <>{props.icon}{props.children}</>;
        }
        else {
            children = <>{props.children}{props.icon}</>;
        }
    }
    else {
        children = props.children;
    }

    return (
        <button type={props.type} onClick={props.onClick} disabled={props.disabled} className={`${styles.button} ${props.className}`}>{children}</button>
    );
}
