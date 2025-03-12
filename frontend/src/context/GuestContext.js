import { createContext, useState } from 'react';

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
    const [guestCart, setGuestCart] = useState([]);
    const [guestWishlist, setGuestWishlist] = useState([]);

    const addToGuestCart = (product) => {
        setGuestCart(prevCart => [...prevCart, product]);
    };

    const removeFromGuestCart = (productId) => {
        setGuestCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const contextData = {
        guestCart,
        guestWishlist,
        addToGuestCart,
        removeFromGuestCart
    };

    return (
        <GuestContext.Provider value={contextData}>
            {children}
        </GuestContext.Provider>
    );
};

export default GuestContext;