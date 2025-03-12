import React, { createContext, useContext, useState } from 'react';
import useAxios from '../utils/useAxios';

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const api = useAxios();

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/api/addresses/');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const addAddress = async (addressData) => {
    try {
      await api.post('/api/addresses/', addressData);
      await fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  return (
    <AddressContext.Provider value={{ addresses, fetchAddresses, addAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);