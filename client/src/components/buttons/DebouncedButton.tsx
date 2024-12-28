import React, {useRef} from "react";
import {Button, ButtonProps} from "antd";

const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
    let timer: NodeJS.Timeout | null = null;
    return ((...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    }) as T;
};

const DebouncedButton: React.FC<ButtonProps & { debounceDelay?: number }> = ({
                                                                                 onClick,
                                                                                 debounceDelay = 300,
                                                                                 ...props
                                                                             }) => {
    const debouncedOnClick = useRef(
        onClick ? debounce(onClick, debounceDelay) : undefined
    ).current;

    return <Button {...props} onClick={debouncedOnClick}/>;
};

export default DebouncedButton;
