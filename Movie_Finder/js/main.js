// ===== CONFIGURACIÓN DE LA API =====
const API_KEY = 'd8cb3d96';
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

// ===== ESTADO GLOBAL =====
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
let currentView = 'grid';

// ===== UTILIDADES =====
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function renderMovies(movies, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!movies || movies.length === 0) return;

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/160x240?text=Sin+Poster'}" 
           alt="${movie.Title}" class="movie-poster">
      <div class="movie-info">
        <div class="movie-title">${movie.Title}</div>
        <div class="movie-year">${movie.Year}</div>
      </div>
    `;
    card.addEventListener('click', () => {
    
      window.location.href = `detail.html?id=${movie.imdbID}`;
    });
    container.appendChild(card);
  });
}

function renderMovieList(movies, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!movies || movies.length === 0) return;

  movies.forEach(movie => {
    const item = document.createElement('li');
    item.className = 'movie-item';
    item.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/100x150?text=Sin+Poster'}" 
           alt="${movie.Title}" class="movie-poster">
      <div class="movie-item-info">
        <div class="movie-item-title">${movie.Title}</div>
        <div class="movie-item-year">${movie.Year}</div>
        <div class="movie-item-genre">${movie.Type?.charAt(0).toUpperCase() + movie.Type?.slice(1) || ''}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      window.location.href = `detail.html?id=${movie.imdbID}`;
    });
    container.appendChild(item);
  });
}

// ===== MODO OSCURO =====
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const switcher = document.getElementById('theme-switcher');
  if (switcher) {
    switcher.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const switcher = document.getElementById('theme-switcher');
  if (switcher) {
    switcher.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  }
}

// ===== BÚSQUEDA =====
async function performSearch(term, page = 1) {
  const resultsGrid = document.getElementById('results-grid');
  const resultsList = document.getElementById('results-list');
  const noResults = document.getElementById('no-results');

  try {
    const url = `${BASE_URL}&s=${encodeURIComponent(term)}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === 'True') {
      if (noResults) noResults.style.display = 'none';
      if (currentView === 'grid' && resultsGrid) {
        renderMovies(data.Search, resultsGrid);
        if (resultsList) resultsList.style.display = 'none';
        if (resultsGrid) resultsGrid.style.display = 'grid';
      } else if (resultsList) {
        renderMovieList(data.Search, resultsList);
        if (resultsGrid) resultsGrid.style.display = 'none';
        resultsList.style.display = 'block';
      }
    } else {
      if (noResults) {
        noResults.style.display = 'block';
        noResults.textContent = data.Error || 'No se encontraron resultados.';
      }
    }
  } catch (e) {
    console.error('Error en búsqueda:', e);
    if (noResults) {
      noResults.style.display = 'block';
      noResults.textContent = 'Error de conexión. Inténtalo más tarde.';
    }
  }
}

// ===== CARGA DE DETALLE DE PELÍCULA =====
async function loadMovieDetail(imdbID) {
  const poster = document.getElementById('detail-poster');
  const title = document.getElementById('detail-title');
  const synopsis = document.getElementById('detail-synopsis');
  const ratingEl = document.getElementById('detail-rating');
  const metaEl = document.getElementById('detail-meta');
  const castEl = document.getElementById('detail-cast');

  try {
    const res = await fetch(`${BASE_URL}&i=${imdbID}&plot=full`);
    const movie = await res.json();

    if (movie.Response === 'True') {
      if (poster) poster.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/220x330?text=Sin+Poster';
      if (title) title.textContent = movie.Title;
      if (synopsis) synopsis.textContent = movie.Plot || 'Sinopsis no disponible.';

      // Rating
      if (ratingEl) {
        ratingEl.innerHTML = '';
        if (movie.imdbRating && movie.imdbRating !== 'N/A') {
          const span = document.createElement('span');
          span.className = 'rating-item';
          span.textContent = `IMDb: ${movie.imdbRating}`;
          ratingEl.appendChild(span);
        }
        if (movie.Metascore && movie.Metascore !== 'N/A') {
          const span = document.createElement('span');
          span.className = 'rating-item';
          span.textContent = `Metascore: ${movie.Metascore}`;
          ratingEl.appendChild(span);
        }
      }

      // Meta info
      if (metaEl) {
        metaEl.innerHTML = '';
        const metaItems = [
          { label: 'Año', value: movie.Year },
          { label: 'Duración', value: movie.Runtime },
          { label: 'Género', value: movie.Genre },
          { label: 'Director', value: movie.Director },
          { label: 'Clasificación', value: movie.Rated }
        ];
        metaItems.forEach(item => {
          if (item.value && item.value !== 'N/A') {
            const span = document.createElement('span');
            span.className = 'meta-item';
            span.textContent = `${item.label}: ${item.value}`;
            metaEl.appendChild(span);
          }
        });
      }

      // Reparto
      if (castEl && movie.Actors && movie.Actors !== 'N/A') {
        castEl.innerHTML = '';
        movie.Actors.split(', ').forEach(actor => {
          const span = document.createElement('span');
          span.className = 'cast-item';
          span.textContent = actor;
          castEl.appendChild(span);
        });
      }
    }
  } catch (e) {
    console.error('Error cargando detalle:', e);
    if (synopsis) synopsis.textContent = 'Error al cargar los detalles.';
  }
}

// ===== FAVORITOS =====
function toggleFavorite(movie) {
  const exists = favorites.some(f => f.imdbID === movie.imdbID);
  if (exists) {
    favorites = favorites.filter(f => f.imdbID !== movie.imdbID);
  } else {
    favorites.push(movie);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert(exists ? 'Película eliminada de favoritos' : 'Película añadida a favoritos');
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Modo oscuro
  initTheme();
  const themeSwitcher = document.getElementById('theme-switcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', toggleTheme);
  }

  // Búsqueda desde input
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const term = searchInput.value.trim();
      if (term) {
        window.location.href = `./pages/results.html?q=${encodeURIComponent(term)}`;
      }
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchBtn.click();
    });
  }

  // En página de resultados
  if (window.location.pathname.includes('results.html')) {
    const q = getUrlParam('q');
    if (q) {
      if (searchInput) searchInput.value = q;
      performSearch(q);
    }

    // Cambiar vista
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        if (q) performSearch(q);
      });
    });
  }

  // En página de detalle
  if (window.location.pathname.includes('detail.html')) {
    const imdbID = getUrlParam('id');
    if (imdbID) {
      loadMovieDetail(imdbID);
    }
  }

  // Botones de favoritos (si existen en el DOM)
  const favoriteBtn = document.getElementById('favorite-btn');
  if (favoriteBtn) {
    const imdbID = getUrlParam('id');
    if (imdbID) {
      // Aquí necesitarías cargar la película para pasarla a toggleFavorite
      // Por simplicidad, asumimos que ya está disponible o se carga de nuevo
      favoriteBtn.addEventListener('click', async () => {
        const res = await fetch(`${BASE_URL}&i=${imdbID}`);
        const movie = await res.json();
        if (movie.Response === 'True') {
          toggleFavorite(movie);
        }
      });
    }
  }
});

// Hacer toggleFavorite global para botones inline (opcional)
window.toggleFavorite = toggleFavorite;