// Base URL for API requests
const baseURL = 'http://localhost:3000';

// Function to make GET requests
async function fetchData(url) {
  // Fetch data from the provided URL
  const response = await fetch(url);
  // Parse the response as JSON
  const data = await response.json();
  // Return the parsed JSON data
  return data;
}

// Function to make PATCH requests
async function patchData(url, body) {
  // Make a PATCH request to the provided URL with the given body
  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Function to make POST requests
async function postData(url, body) {
  // Make a POST request to the provided URL with the given body
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Function to delete a film
async function deleteFilm(id) {
  // Make a DELETE request to delete the film with the provided ID
  await fetch(`${baseURL}/films/${id}`, {
    method: 'DELETE',
  });
}

// Function to render films in the menu
async function renderFilms() {
  // Fetch the list of films from the API
  const films = await fetchData(`${baseURL}/films`);
  // Get the films list container element
  const filmsList = document.getElementById('films');

  // Iterate over each film and create a list item for it
  films.forEach((film) => {
    const li = document.createElement('li');
    li.classList.add('film', 'item');
    // Add a 'sold-out' class if the film is sold out
    if (film.tickets_sold >= film.capacity) {
      li.classList.add('sold-out');
    }
    li.textContent = film.title;
    filmsList.appendChild(li);
  });
}

// Function to render film details
async function renderFilmDetails() {
  // Fetch details of a specific film (here, film with ID 1)
  const film = await fetchData(`${baseURL}/films/1`);

  // Update HTML elements with film details
  const poster = document.getElementById('poster');
  poster.src = film.poster;

  const title = document.getElementById('title');
  title.textContent = film.title;

  const runtime = document.getElementById('runtime');
  runtime.textContent = `Runtime: ${film.runtime} minutes`;

  const showtime = document.getElementById('showtime');
  showtime.textContent = `Showtime: ${film.showtime}`;

  const description = document.getElementById('film-info');
  description.textContent = film.description;

  const availableTickets = document.getElementById('ticket-num');
  const ticketsSold = film.tickets_sold;
  const available = film.capacity - ticketsSold;
  availableTickets.textContent = `${available} remaining tickets`;

  // Update 'Buy Ticket' button based on availability
  const buyTicketButton = document.getElementById('buy-ticket');
  if (available === 0) {
    buyTicketButton.disabled = true;
    buyTicketButton.textContent = 'Sold Out';
  } else {
    buyTicketButton.disabled = false;
    buyTicketButton.textContent = 'Buy Ticket';
  }

  // Add event listener for 'Buy Ticket' button
  buyTicketButton.addEventListener('click', async () => {
    if (available > 0) {
      // Increment tickets sold and update database
      await patchData(`${baseURL}/films/${film.id}`, { tickets_sold: ticketsSold + 1 });
      // Add ticket to database
      await postData(`${baseURL}/tickets`, { film_id: film.id, number_of_tickets: 1 });
      // Re-render film details
      await renderFilmDetails();
    }
  });
}

// Event listener for film delete buttons
document.addEventListener('click', async (event) => {
  if (event.target.matches('.delete-button')) {
    // Get the film ID from the clicked delete button
    const filmId = event.target.dataset.filmId;
    // Delete the film with the given ID
    await deleteFilm(filmId);
    // Remove the film from the UI
    event.target.parentElement.remove();
  }
});

// Initial setup: Render films in the menu and details of the first film
renderFilms();
renderFilmDetails();
