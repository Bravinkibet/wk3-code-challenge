$(document).ready(() => {
    // Function to fetch and display movie details
    const displayMovieDetails = (movie) => {
      $('#poster').attr('src', movie.poster);
      $('#title').text(movie.title);
      $('#runtime').text(`${movie.runtime} minutes`);
      $('#film-info').text(movie.description);
      $('#showtime').text(movie.showtime);
      const availableTickets = movie.capacity - movie.tickets_sold;
      $('#ticket-num').text(availableTickets);
      if (availableTickets === 0) {
        $('#buy-ticket').text('Sold Out').prop('disabled', true);
      } else {
        $('#buy-ticket').text('Buy Ticket').prop('disabled', false);
      }
    };
  
    // Function to fetch movie data and populate the film menu
    const fetchMoviesAndPopulateMenu = () => {
      $.get('/films', (movies) => {
        $('#films').empty(); // Clear existing list items
        movies.forEach((movie) => {
          const listItem = $('<li>').addClass('film item').text(movie.title);
          listItem.click(() => {
            displayMovieDetails(movie);
          });
          $('#films').append(listItem);
        });
        // Display details of the first movie by default
        if (movies.length > 0) {
          displayMovieDetails(movies[0]);
        }
      });
    };
  
    // Function to handle buying tickets
    $('#buy-ticket').click(() => {
      const movieId = $('.film.item').index() + 1; // Assuming movie IDs are sequential starting from 1
      let availableTickets = parseInt($('#ticket-num').text());
      if (availableTickets > 0) {
        // Decrement available tickets count
        availableTickets--;
        $('#ticket-num').text(availableTickets);
        // Send PATCH request to update tickets_sold count on the server
        $.ajax({
          url: `/films/${movieId}`,
          type: 'PATCH',
          contentType: 'application/json',
          data: JSON.stringify({ tickets_sold: movie.capacity - availableTickets }),
          success: (response) => {
            // Send POST request to add purchased tickets to the tickets endpoint
            $.post('/tickets', { film_id: movieId, number_of_tickets: 1 }, (ticket) => {
              console.log('Ticket purchased successfully:', ticket);
            });
          },
          error: (xhr, status, error) => {
            console.error('Error buying ticket:', error);
            // Revert ticket count on error
            $('#ticket-num').text(availableTickets + 1);
          }
        });
      } else {
        alert('Sorry, this showing is sold out!');
      }
    });
  
    // Function to handle deleting a film
    $('#films').on('click', '.film.item', function() {
      const movieId = $(this).index() + 1; // Assuming movie IDs are sequential starting from 1
      $.ajax({
        url: `/films/${movieId}`,
        type: 'DELETE',
        success: (response) => {
          // Remove film from the menu
          $(this).remove();
          // Display details of the next available movie
          fetchMoviesAndPopulateMenu();
        },
        error: (xhr, status, error) => {
          console.error('Error deleting movie:', error);
        }
      });
    });
  
    // Initialize by fetching movies and populating the film menu
    fetchMoviesAndPopulateMenu();
  });
  