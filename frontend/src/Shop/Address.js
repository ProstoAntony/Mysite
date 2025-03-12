import React, { useEffect, useState } from 'react';
import useAxios from '../utils/useAxios';

const Address = () => {
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false
    });
    const api = useAxios();

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/api/addresses/');
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/addresses/', newAddress);
            fetchAddresses();
            setNewAddress({
                street_address: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
                is_default: false
            });
        } catch (error) {
            console.error('Error adding address:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/addresses/${id}/`);
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    return (
        <div className="container" style={{ paddingTop: "100px" }}>
            <h2 className="mb-4">My Addresses</h2>
            
            <div className="row mb-4">
                <div className="col-md-6">
                    <h3>Add New Address</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Street Address"
                                value={newAddress.street_address}
                                onChange={(e) => setNewAddress({...newAddress, street_address: e.target.value})}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="City"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="State"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Postal Code"
                                value={newAddress.postal_code}
                                onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Country"
                                value={newAddress.country}
                                onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                                required
                            />
                        </div>
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="defaultAddress"
                                checked={newAddress.is_default}
                                onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                            />
                            <label className="form-check-label" htmlFor="defaultAddress">Set as default address</label>
                        </div>
                        <button type="submit" className="btn btn-primary">Add Address</button>
                    </form>
                </div>

                <div className="col-md-6">
                    <h3>Saved Addresses</h3>
                    {addresses.length === 0 ? (
                        <p>No addresses saved yet.</p>
                    ) : (
                        addresses.map((address) => (
                            <div key={address.id} className="card mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {address.is_default && <span className="badge bg-primary me-2">Default</span>}
                                        Address
                                    </h5>
                                    <p className="card-text">
                                        {address.street_address}<br />
                                        {address.city}, {address.state} {address.postal_code}<br />
                                        {address.country}
                                    </p>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(address.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Address;