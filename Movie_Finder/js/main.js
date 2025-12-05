// ===== CONFIGURACIÓN DE LA API =====
const API_KEY = 'd8cb3d96';
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`; // ✅ Corregido: sin espacios

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
      window.location.href = `./detail.html?id=${movie.imdbID}`;
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
      window.location.href = `./pages/detail.html?id=${movie.imdbID}`;
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
        resultsGrid.style.display = 'grid';
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

// ===== FUNCIÓN AUXILIAR: COPIAR AL PORTAPAPELES =====
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Enlace copiado al portapapeles.');
    }).catch(() => {
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert('Enlace copiado al portapapeles.');
    } else {
      alert('No se pudo copiar. Selecciona y copia manualmente: ' + text);
    }
  } catch (err) {
    alert('No se pudo copiar. Selecciona y copia manualmente: ' + text);
  }
  document.body.removeChild(textArea);
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

      // ✅ BOTÓN DE FAVORITOS
      const favoriteBtn = document.getElementById('favorite-btn');
      if (favoriteBtn) {
        const isFav = favorites.some(f => f.imdbID === movie.imdbID);
        favoriteBtn.textContent = isFav ? '💔 Quitar de Favoritos' : '❤️ Agregar a Favoritos';
        favoriteBtn.onclick = () => {
          const index = favorites.findIndex(f => f.imdbID === movie.imdbID);
          if (index === -1) {
            favorites.push(movie);
            favoriteBtn.textContent = '💔 Quitar de Favoritos';
            alert(`¡${movie.Title} añadida a Favoritos!`);
          } else {
            favorites.splice(index, 1);
            favoriteBtn.textContent = '❤️ Agregar a Favoritos';
            alert(`¡${movie.Title} eliminada de Favoritos!`);
          }
          localStorage.setItem('favorites', JSON.stringify(favorites));
        };
      }

      // ✅ BOTÓN DE WATCHLIST
      const watchlistBtn = document.getElementById('watchlist-btn');
      if (watchlistBtn) {
        const isInWatchlist = watchlist.some(w => w.imdbID === movie.imdbID);
        watchlistBtn.textContent = isInWatchlist ? '➖ Eliminar de Watchlist' : '➕ Añadir a Watchlist';
        watchlistBtn.onclick = () => {
          const index = watchlist.findIndex(w => w.imdbID === movie.imdbID);
          if (index === -1) {
            watchlist.push(movie);
            watchlistBtn.textContent = '➖ Eliminar de Watchlist';
            alert(`¡${movie.Title} añadida a tu Watchlist!`);
          } else {
            watchlist.splice(index, 1);
            watchlistBtn.textContent = '➕ Añadir a Watchlist';
            alert(`¡${movie.Title} eliminada de tu Watchlist!`);
          }
          localStorage.setItem('watchlist', JSON.stringify(watchlist));
        };
      }

      // ✅ BOTÓN DE COMPARTIR
      const shareBtn = document.getElementById('share-btn');
      if (shareBtn) {
        shareBtn.onclick = () => {
          const shareUrl = `https://www.imdb.com/title/${imdbID}/`;
          const shareText = `¡Mira esta película: ${movie.Title} (${movie.Year}) en IMDb!`;

          if (navigator.share) {
            navigator.share({
              title: movie.Title,
              text: shareText,
              url: shareUrl
            }).catch(() => {
              copyToClipboard(shareUrl);
            });
          } else {
            copyToClipboard(shareUrl);
          }
        };
      }
    }
  } catch (e) {
    console.error('Error cargando detalle:', e);
    if (synopsis) synopsis.textContent = 'Error al cargar los detalles.';
  }
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

  // ===== FILTROS EN PÁGINA DE INICIO =====
  if (window.location.pathname === '/' || 
      window.location.pathname === '/index.html' || 
      window.location.pathname.includes('index.html')) {
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    const trendingMovies = document.getElementById('trending-movies');
    const popularSeries = document.getElementById('popular-series');

    const loadTrending = async () => {
      const res1 = await fetch(`${BASE_URL}&s=movie&type=movie&page=1`);
      const data1 = await res1.json();
      if (data1.Response === 'True') renderMovies(data1.Search.slice(0, 6), trendingMovies);

      const res2 = await fetch(`${BASE_URL}&s=series&type=series&page=1`);
      const data2 = await res2.json();
      if (data2.Response === 'True') renderMovies(data2.Search.slice(0, 6), popularSeries);
    };

    filterButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        if (filter === 'trending' || filter === 'all') {
          loadTrending();
        } else if (filter === 'movie') {
          const res = await fetch(`${BASE_URL}&s=movie&type=movie&page=1`);
          const data = await res.json();
          if (data.Response === 'True') {
            renderMovies(data.Search.slice(0, 6), trendingMovies);
            if (popularSeries) popularSeries.innerHTML = '';
          }
        } else if (filter === 'series') {
          const res = await fetch(`${BASE_URL}&s=series&type=series&page=1`);
          const data = await res.json();
          if (data.Response === 'True') {
            renderMovies(data.Search.slice(0, 6), popularSeries);
            if (trendingMovies) trendingMovies.innerHTML = '';
          }
        }
      });
    });

    if (trendingMovies || popularSeries) {
      setTimeout(() => {
        document.querySelector('.filter-btn[data-filter="trending"]')?.click();
      }, 100);
    }
  }

  // Render favoritos si estamos en esa página
  if (window.location.pathname.includes('favorites.html')) {
    const favoritesList = document.getElementById('favorites-list');
    const noFavorites = document.getElementById('no-favorites');
    if (favoritesList) {
      if (favorites.length === 0) {
        if (noFavorites) noFavorites.style.display = 'block';
      } else {
        if (noFavorites) noFavorites.style.display = 'none';
        renderMovies(favorites, favoritesList);
      }
    }
  }

  // ✅ Render watchlist si estamos en esa página
  if (window.location.pathname.includes('watchlist.html')) {
    const watchlistList = document.getElementById('watchlist-list');
    const noWatchlist = document.getElementById('no-watchlist');
    if (watchlistList) {
      if (watchlist.length === 0) {
        if (noWatchlist) noWatchlist.style.display = 'block';
      } else {
        if (noWatchlist) noWatchlist.style.display = 'none';
        renderMovies(watchlist, watchlistList);
      }
    }
  }
});