import React, { useState, useEffect } from 'react';

const BreweryApp = () => {
  const [breweries, setBreweries] = useState([]);
  const [filteredBreweries, setFilteredBreweries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    type: ''
  });
  const [mostCommonLocation, setMostCommonLocation] = useState('');
  const [longestName, setLongestName] = useState('');
  const [availableStates, setAvailableStates] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.openbrewerydb.org/breweries');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBreweries(data);
        // Extract available states
        const states = data.reduce((acc, brewery) => {
          if (!acc.includes(brewery.state)) {
            acc.push(brewery.state);
          }
          return acc;
        }, []);
        setAvailableStates(states);
        // Extract available types
        const types = data.reduce((acc, brewery) => {
          if (!acc.includes(brewery.brewery_type)) {
            acc.push(brewery.brewery_type);
          }
          return acc;
        }, []);
        setAvailableTypes(types);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter breweries based on search term and filters
    const filtered = breweries.filter(brewery => {
      const nameMatches = brewery.name.toLowerCase().includes(searchTerm.toLowerCase());
      const stateMatches = filters.state ? brewery.state === filters.state : true;
      const typeMatches = filters.type ? brewery.brewery_type === filters.type : true;
      return nameMatches && stateMatches && typeMatches;
    });

    setFilteredBreweries(filtered);
  }, [breweries, searchTerm, filters]);

  useEffect(() => {
    // Calculate the frequency of each location
    const locationCount = filteredBreweries.reduce((acc, brewery) => {
      const location = `${brewery.city}, ${brewery.state}`;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    // Find the most common location
    const locations = Object.keys(locationCount);
    let mostCommon = '';
    let maxCount = 0;
    locations.forEach(location => {
      if (locationCount[location] > maxCount) {
        mostCommon = location;
        maxCount = locationCount[location];
      }
    });

    setMostCommonLocation(mostCommon);
  }, [filteredBreweries]);

  useEffect(() => {
    // Find the longest brewery name
    const longest = filteredBreweries.reduce((acc, brewery) => {
      if (brewery.name.length > acc.length) {
        return brewery.name;
      } else {
        return acc;
      }
    }, '');

    setLongestName(longest);
  }, [filteredBreweries]);

  // Event handlers
  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  return (
    <div>
      <h1>Brewery Explorer</h1>
      <div>
        <input type="text" placeholder="Search by name" value={searchTerm} onChange={handleSearchChange} />
      </div>
      <div>
        <select name="state" value={filters.state} onChange={handleFilterChange}>
          <option value="">All States</option>
          {availableStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          {availableTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <h2>Summary Statistics</h2>
      <p>Total Breweries: {filteredBreweries.length}</p>
      <p>Most Common Location: {mostCommonLocation}</p>
      <p>Longest Name: {longestName}</p>
      <h2>Brewery List</h2>
      <ul>
        {filteredBreweries.map(brewery => (
          <li key={brewery.id}>{brewery.name} - {brewery.city}, {brewery.state}</li>
        ))}
      </ul>
    </div>
  );
};

export default BreweryApp;
