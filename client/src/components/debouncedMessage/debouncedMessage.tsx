import React from "react";
import {MessageInstance} from "antd/es/message/interface";
import {message} from "antd";

const DEFAULT_DEBOUNCE_DELAY = 300;

const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number): F => {
    let timer: NodeJS.Timeout | null;
    return ((...args: any[]) => {
        if (timer) clearTimeout(timer);
        let result: any;
        timer = setTimeout(() => {
            result = fn(...args);
        }, delay);
        return result;
    }) as F;
};

export const useDebouncedMessage = (): [MessageInstance, React.ReactElement] => {
    const [messageApi, contextHolder] = message.useMessage();

    const debouncedMessage: MessageInstance = {
        open: (...args: Parameters<typeof message.open>) => {
            const fn = debounce(messageApi.open, DEFAULT_DEBOUNCE_DELAY);
            return fn(...args);
        },
        success: (...args: Parameters<typeof message.success>) => {
            const fn = debounce(messageApi.success, DEFAULT_DEBOUNCE_DELAY);
            return fn(...args);
        },
        error: (...args: Parameters<typeof message.error>) => {
            const fn = debounce(messageApi.error, DEFAULT_DEBOUNCE_DELAY);
            return fn(...args);
        },
        info: (...args: Parameters<typeof message.info>) => {
            const fn = debounce(messageApi.info, DEFAULT_DEBOUNCE_DELAY);
            return fn(...args);
        },
        warning: (...args: Parameters<typeof message.warning>) => {
            const fn = debounce(messageApi.warning, DEFAULT_DEBOUNCE_DELAY);
            return fn(...args);
        },
        loading: (...args: Parameters<typeof message.loading>) => {
            const fn = debounce(messageApi.loading, DEFAULT_DEBOUNCE_DELAY);
            return fn(...args);
        },
        destroy: messageApi.destroy,
    };

    return [debouncedMessage, contextHolder];
};
