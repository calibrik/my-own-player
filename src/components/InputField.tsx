import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent } from "react";
import styles from "../css/inputField.module.css";
import { Eye, EyeSlash, Search } from "./Icons";

interface IInputFieldProps {
    type: string;
    name?: string;
    placeholder?: string;
    label?: string;
    className?: string;
    onChange?: (value: string) => void | Promise<void>
    isSearch?: boolean;
    min?: number;
    max?: number;
    step?: number;
    value?: string;
    defaultValue?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: (e:React.KeyboardEvent) => void
};
type InputFieldHandle = {
    setError: (msg: string) => void;
    getInput: () => string | File | undefined;
    getError: () => string;
    reset: () => void;
}

export const InputField = forwardRef<InputFieldHandle, IInputFieldProps>((props, ref) => {
    const [errMsg, setErrMsg] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(undefined);
    const [type, setType] = useState<string>(props.type);

    function onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        let value = event.target.value ?? "";
        setErrMsg("");
        if (props.onChange) {
            props.onChange(value);
        }
    }

    useImperativeHandle(ref, () => ({
        setError(msg: string) {
            setErrMsg(msg);
        },
        getInput() {
            return inputRef.current?.value.trim() ?? "";
        },
        getError() {
            return errMsg;
        },
        reset() {
            if (inputRef.current)
                inputRef.current.value = "";
        }
    }));

    function onPasswordEyeClick() {
        if (type == "password")
            setType("text");
        else
            setType("password");
    }

    const className = `${styles.inputWrapper} ${props.className} ${errMsg != "" ? styles.error : ""}`;
    const passwordEye = type == "password" ? <Eye interactive className={styles.passwordIcon} onClick={onPasswordEyeClick} /> : <EyeSlash interactive className={styles.passwordIcon} onClick={onPasswordEyeClick} />
    return (
        <div className={styles.container}>
            {props.label ? <label className={styles.label}>{props.label}</label> : ""}
            <div className={className}>
                {props.isSearch ? <Search className={styles.icon} /> : ""}
                {props.type == "textarea" ?
                    <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} defaultValue={props.defaultValue} value={props.value} onChange={onChange} name={props.name} placeholder={props.placeholder} className={styles.inputField} />
                    :
                    <input
                        ref={inputRef as React.Ref<HTMLInputElement>}
                        defaultValue={props.defaultValue}
                        value={props.value}
                        onFocus={props.onFocus}
                        onBlur={props.onBlur}
                        onKeyDown={props.onKeyDown}
                        onChange={onChange}
                        min={props.min}
                        max={props.max}
                        step={props.step}
                        type={type}
                        name={props.name}
                        placeholder={props.placeholder}
                        className={styles.inputField} />}
                {props.type == "password" ? passwordEye : ""}
            </div>
            {errMsg !== "" ? <span className={styles.errorMsg}>{errMsg}</span> : ""}
        </div>
    );
});

export type { InputFieldHandle };