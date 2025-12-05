// utils.js - Funciones auxiliares reutilizables

// Configuración global
export const API_KEY = 'd8cb3d96';
export const BASE_URL = `https://www.omdbapi.com/?i=tt3896198&apikey=d8cb3d96`;

// Función para obtener parámetros de URL
export function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Renderizar películas en grid
export function renderMovies(movies, container) {
  container.innerHTML = '';
  if (!movies || movies.length === 0) return;

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=Sin+Poster'}" alt="${movie.Title}" class="movie-poster">
      <div class="movie-info">
        <div class="movie-title">${movie.Title}</div>
        <div class="movie-year">${movie.Year}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `pages/detail.html?id=${movie.imdbID}`;
    });
    container.appendChild(card);
  });
}

// Renderizar vista de lista
export function renderMovieList(movies, container) {
  container.innerHTML = '';
  if (!movies || movies.length === 0) return;

  movies.forEach(movie => {
    const item = document.createElement('li');
    item.className = 'movie-item';
    item.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/100x150?text=Sin+Poster'}" alt="${movie.Title}">
      <div class="movie-item-info">
        <div class="movie-item-title">${movie.Title}</div>
        <div class="movie-item-year">${movie.Year}</div>
        <div class="movie-item-genre">${movie.Type}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      window.location.href = `pages/detail.html?id=${movie.imdbID}`;
    });
    container.appendChild(item);
  });
}