import { createContext, useState } from "react";

export const LoadingContext = createContext();

export default function LoadingContextWrapper({ children }) {
    const [isLoading, setIsLoading] = useState(0);


    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }} >
            {children}
        </LoadingContext.Provider>

    )
}
