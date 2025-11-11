import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Restaurants.css';

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/restaurants`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      fetchRestaurants();
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Updated search route (searches by name, cuisine, or menu item)
      const response = await fetch(`${API_URL}/restaurants/search/${searchQuery}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading">🍕 Loading restaurants...</div>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error loading restaurants</h2>
          <p>{error}</p>
          <button onClick={fetchRestaurants}>Try Again</button>
        </div>
      </div>
    );

  return (
    <div className="restaurants-page">
      <div className="restaurants-header">
        <h1>Discover Delicious Spots 🍴</h1>
        <p>Explore top-rated restaurants and tasty dishes near you!</p>

        {/* 🔍 Search bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search restaurants, cuisines, or dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchRestaurants();
              }}
              className="clear-button"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="restaurants-container">
        {restaurants.length === 0 ? (
          <div className="no-restaurants">
            <p>No results found 🍽️</p>
            <p>Try a different search or browse all restaurants.</p>
          </div>
        ) : (
          <div className="restaurants-grid">
            {restaurants.map((restaurant) => (
              <Link
                to={`/restaurant/${restaurant._id}`}
                key={restaurant._id}
                className="restaurant-card"
              >
                <div className="restaurant-image">
                  {restaurant.image ? (
                    <img src={restaurant.image} alt={restaurant.name} />
                  ) : (
                    <div className="placeholder-image">
                      <span>🍴</span>
                    </div>
                  )}
                </div>

                <div className="restaurant-info">
                  <div className="restaurant-name-row">
                    <h3>{restaurant.name}</h3>
                    <span className="rating-badge">⭐ {restaurant.rating || 4.3}</span>
                  </div>

                  {restaurant.cuisine?.length > 0 && (
                    <p className="cuisine">{restaurant.cuisine.join(', ')}</p>
                  )}

                  <div className="restaurant-meta">
                    <span>🕒 {restaurant.deliveryTime || '30-45 min'}</span>
                    {restaurant.minOrder > 0 && (
                      <span>Min ₹{restaurant.minOrder}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Restaurants;
