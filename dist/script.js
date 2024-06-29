let map;
let markers = [];

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });
    loadCountries();
}


document.addEventListener('DOMContentLoaded', ()=>{
    initMap();
    setupEventListeners();
});

// Fetch and load countries
async function loadCountries() {
    try {
        const response = await fetch(`http://api.geonames.org/countryInfoJSON?username=hassan97`);
        const data = await response.json();
        const countryDropdown = document.getElementById('country');
        data.geonames.forEach(country => {
            const option = document.createElement('option');
            option.value = country.countryCode;
            option.textContent = country.countryName;
            countryDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching countries:', error);
    }
}

// Fetch and load districts (states)
async function loadDistricts(countryCode) {
    try {
        const response = await fetch(`http://api.geonames.org/searchJSON?country=${countryCode}&featureCode=ADM1&maxRows=1000&username=hassan97`);
        const data = await response.json();
        const districtDropdown = document.getElementById('district');
        districtDropdown.innerHTML = '<option>District</option>'; // Reset dropdown
        data.geonames.forEach(district => {
            const option = document.createElement('option');
            option.value = district.adminCode1;
            option.textContent = district.adminName1;
            districtDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
    }
}

// Fetch and load cities
async function loadCities(countryCode, districtCode) {
    try {
        const response = await fetch(`http://api.geonames.org/searchJSON?country=${countryCode}&adminCode1=${districtCode}&maxRows=1000&username=hassan97`);
        const data = await response.json();
        const cityDropdown = document.getElementById('city');
        cityDropdown.innerHTML = '<option>City</option>'; // Reset dropdown
        data.geonames.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = city.name;
            cityDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
    }
}

// Event listeners for dropdowns
document.getElementById('country').addEventListener('change', (event) => {
    const countryCode = event.target.value;
    if (countryCode) {
        loadDistricts(countryCode);
    } else {
        document.getElementById('district').innerHTML = '<option>District</option>';
        document.getElementById('city').innerHTML = '<option>City</option>';
    }
});

document.getElementById('district').addEventListener('change', (event) => {
    const countryCode = document.getElementById('country').value;
    const districtCode = event.target.value;
    if (districtCode) {
        loadCities(countryCode, districtCode);
    } else {
        document.getElementById('city').innerHTML = '<option>City</option>';
    }
});

// to listen to the dropdown's events:
// function setupEventListeners() {
//     document.getElementById('country').addEventListener('change', fetchEvents);
//     document.getElementById('city').addEventListener('change', fetchEvents);
//     document.getElementById('district').addEventListener('change', fetchEvents);
//     document.getElementById('time').addEventListener('change', fetchEvents);
// }


// to call the fetch events on the button
const searchButton = document.getElementById("search");
searchButton.onclick = ()=> fetchEvents;


async function fetchEvents() {
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const district = document.getElementById('district').value;
    const time = document.getElementById('time').value;
    console.log()

    try {
        const response = await fetch(`/api/events?country=${country}&city=${city}&district=${district}&time=${time}`);
        const events = await response.json();
        console.log(events);
        displayEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function displayEvents(events) {
    const carouselContainer = document.getElementById('carousel');
    carouselContainer.innerHTML = '';
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100';
        card.onclick = () => showLocationDetails(event.event_id);
        card.innerHTML = `
            <h3 class="text-lg font-semibold">${event.name}</h3>
            <p class="text-gray-600">${event.description}</p>`;
        carouselContainer.appendChild(card);
    });
}

async function showLocationDetails(id) {
    try {
        const response = await fetch(`/api/events/${id}`);
        const location = await response.json();
        const detailContainer = document.getElementById('carousel-detail');
        detailContainer.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow';
        card.innerHTML = `
            <h3 class="text-lg font-semibold">${location.name}</h3>
            <p class="text-gray-600">${location.description}</p>`;
        detailContainer.appendChild(card);

        loadReviews(id);
    } catch (error) {
        console.error('Error loading location details:', error);
    }
}

async function loadReviews(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}/reviews`);
        const reviews = await response.json();
        const reviewList = document.getElementById('review-list');
        reviewList.innerHTML = '';

        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'bg-gray-100 p-2 rounded-lg shadow';
            reviewItem.innerHTML = `
                <h4 class="text-md font-semibold">${review.user}</h4>
                <p>${review.comment}</p>`;
            reviewList.appendChild(reviewItem);
        });

        document.getElementById('submitReview').onclick = () => submitReview(eventId);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

async function submitReview(eventId) {
    const reviewText = document.getElementById('userReview').value;
    if (!reviewText) return;

    try {
        await fetch(`/api/events/${eventId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: reviewText })
        });

        document.getElementById('userReview').value = '';
        loadReviews(eventId);
    } catch (error) {
        console.error('Error submitting review:', error);
    }
}


































































// let map;
// let markers = [];

// function initMap() {
//     map = new google.maps.Map(document.getElementById('map'), {
//         center: { lat: -34.397, lng: 150.644 },
//         zoom: 8
//     });
//     loadCarousel();
// }

// function loadCarousel() {
//     const carouselData = [
//         { id: 1, name: "Location 01" },
//         { id: 2, name: "Location 02" },
//         { id: 3, name: "Location 03" },
//         { id: 4, name: "Location 04" },
//         { id: 5, name: "Location 05" },
//         { id: 6, name: "Location 06" }
//     ];

//     const carouselContainer = document.getElementById('carousel');
//     carouselData.forEach(location => {
//         const card = document.createElement('div');
//         card.className = 'bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100';
//         card.onclick = () => showLocationDetails(location.id);
//         card.innerHTML = `
//             <h3 class="text-lg font-semibold">${location.name}</h3>
//             <p class="text-gray-600">Description for ${location.name}</p>`;
//         carouselContainer.appendChild(card);
//     });
// }

// function showLocationDetails(id) {
//     const locationDetails = [
//         { id: 1, name: "Location 01", description: "Detailed description of Location 01" },
//         { id: 2, name: "Location 02", description: "Detailed description of Location 02" },
//         { id: 3, name: "Location 03", description: "Detailed description of Location 03" }
//     ];

//     const detailContainer = document.getElementById('carousel-detail');
//     detailContainer.innerHTML = '';

//     locationDetails.forEach(location => {
//         const card = document.createElement('div');
//         card.className = 'bg-white p-4 rounded-lg shadow';
//         card.innerHTML = `
//             <h3 class="text-lg font-semibold">${location.name}</h3>
//             <p class="text-gray-600">${location.description}</p>`;
//         detailContainer.appendChild(card);
//     });

//     loadReviews(id);
// }

// function loadReviews(locationId) {
//     const reviews = [
//         { username: "User1", rating: 5, comments: "Great place!" },
//         { username: "User2", rating: 4, comments: "Nice experience." }
//     ];

//     const reviewList = document.getElementById('review-list');
//     reviewList.innerHTML = '';

//     reviews.forEach(review => {
//         const reviewItem = document.createElement('div');
//         reviewItem.className = 'p-4 bg-white rounded-lg shadow';
//         reviewItem.innerHTML = `
//             <div class="flex justify-start">
//                 <strong>${review.username}</strong>
//                 <span class="text-yellow-500">${'★'.repeat(review.rating)}</span>
//             </div>
//             <p class="text-gray-600">${review.comments}</p>`;
//         reviewList.appendChild(reviewItem);
//     });
// }

// document.getElementById('submitReview').addEventListener('click', () => {
//     const reviewText = document.getElementById('userReview').value;
//     if (reviewText) {
//         alert('Review submitted: ' + reviewText);
//     }
// });

