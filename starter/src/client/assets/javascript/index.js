// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	track_name: undefined,
	player_id: undefined,
	player_name: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

function onPageLoad() {
	//console.log("Getting form info for dropdowns!")
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event
		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
			store.track_id = target.id
			store.track_name = target.innerHTML
		}

		// Racer form field
		if (target.matches('.card.racer')) {
			handleSelectRacer(target)
			//console.log(target);
			store.player_id = target.id
			store.player_name = target.dataset.racer
			//console.log(store);
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

		//console.log("Store updated :: ", store)
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}

// ^ PROVIDED CODE ^ DO NOT REMOVE

// BELOW THIS LINE IS CODE WHERE STUDENT EDITS ARE NEEDED ----------------------------
// TIP: Do a full file search for TODO to find everything that needs to be done for the game to work

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	//console.log("in create race")

	// render starting UI
	renderAt('#race', renderRaceStartView(store.track_name));

	// TODO - Get player_id and track_id from the store
	const {player_id, track_id} = store;
	
	// const race = TODO - call the asynchronous method createRace, passing the correct parameters
	const race = await createRace(player_id, track_id);

	// TODO - update the store with the race id in the response	
	// TIP - console logging API responses can be really helpful to know what data shape you received
	//console.log("RACE: ", race)
	 
	store.race_id = race.ID;
	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown();
	// TODO - call the async function startRace
	// TIP - remember to always check if a function takes parameters before calling it!
	await startRace(race.ID);
	// TODO - call the async function runRace
	await runRace(race.ID);
}

function runRace(raceID) {
	return new Promise(resolve => {
		// TODO - use Javascript's built in setInterval method to get race info (getRace function) every 500ms
		const interval = setInterval(async () => {
			try {
				const race = await getRace(raceID);
				/* 
					TODO - if the race info status property is "in-progress", update the leaderboard by calling:
					renderAt('#leaderBoard', raceProgress(res.positions))
				*/
				if (race.status === "in-progress") {
					renderAt('#leaderBoard', raceProgress(race.positions))
				}
				/* 
					TODO - if the race info status property is "finished", run the following:

					clearInterval(raceInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(res.positions)) // to render the results view
					resolve(res) // resolve the promise
				*/
				if (race.status === "finished") {
					clearInterval(interval);
					renderAt('#race', resultsView(race.positions))
					resolve(race);
				}
			} catch (e) {
				console.error("runRace error:", e);
                clearInterval(interval);
                resolve();
			}
		}, 500);
	// remember to add error handling for the Promise				
	}).catch (e => {
		console.log(e);
	})
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const interval = setInterval(async () => {
				
				// run this DOM manipulation inside the set interval to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = timer

				// TODO - when the setInterval timer hits 0, clear the interval, resolve the promise, and return
				if (timer === 0) {
					clearInterval(interval);
					resolve();
				}
				timer--
			}, 1000);
		}).catch(e => {
			console.log("runCountdown error:", e);
		})
	} catch(e) {
		console.log("runCountdown error:", e);
	}
}

function handleSelectRacer(target) {
	//console.log("selected a racer", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')
}

function handleSelectTrack(target) {
	//console.log("selected track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')	
}

async function handleAccelerate() {
	//console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	try {
        await accelerate(store.race_id);
    } catch (e) {
        console.error("handleAccelerate error:", e);
    }
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	// OPTIONAL: There is more data given about the race cars than we use in the game, if you want to factor in top speed, acceleration, 
	// and handling to the various vehicles, it is already provided by the API!
	return `<h4 class="card racer" id="${id}" data-racer="${driver_name}">Name: ${driver_name}<br>Top-Speed: ${top_speed}<br>Acceleration: ${acceleration}<br>Handling: ${handling}</h4>`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `<h4 id="${id}" class="card track">${name}</h4>`
}

function renderCountdown(count) {
	return `
		<div class="leader-div">
			<h2>Race Starts In...</h2>
			<p id="big-numbers">${count}</p>
		</div>
		
	`
}

function renderRaceStartView(track) {
	//('Line 274: ',track);
	//<main id="two-columns">
	return `
		<header>
			<h1>Race: ${track}</h1>
		</header>
		<main>
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<div class="leader-div">
					<h2>Directions</h2>
					<p>Click the button as fast as you can to make your racer go faster!</p>
				</div>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	//console.log(positions);
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	
	userPlayer.driver_name += " (you)"
	
	let count = 1
  
	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<section id="leaderBoard">
				<div class="leader-div">
					<h3>Race Results</h3>
					<p>The race is done! Here are the final results:</p>
					<div class="resultsDiv">
						${results.join('')}
					</div>
				</div>
				<div class="button-div">
					<a class="button" href="/race">Start a new race</a>
				</div>
			</section>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<div class="leader-div">
			<div class="resultsDiv">
				<table>
					${results.join('')}
				</table>
			</div>
		</div>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:3001'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	//console.log(`calling server :: ${SERVER}/api/tracks`)
	// GET request to `${SERVER}/api/tracks`
	// TODO: Fetch tracks
	// TIP: Don't forget a catch statement!	
	try {			
		const response = await fetch(`${SERVER}/api/tracks`);
		return await response.json();
	} catch (e) {
		console.error("getTracks error:", e);
	}
}

async function getRacers() {
	//console.log(`calling server :: ${SERVER}/api/cars`)
	// GET request to `${SERVER}/api/cars`
	// TODO: Fetch racers
	// TIP: Do a file search for "TODO" to make sure you find all the things you need to do! There are even some vscode plugins that will highlight todos for you
	try {
		const response = await fetch(`${SERVER}/api/cars`);
		return await response.json();
	} catch (e) {
		console.error("getCars error:", e);
	}
}
	
async function createRace(player_id, track_id) {
	//console.log(`calling server :: ${SERVER}/api/races`)
	try {
		player_id = parseInt(player_id)
		track_id = parseInt(track_id)
		const body = { player_id, track_id };
		const response = await fetch(`${SERVER}/api/races`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
		return await response.json();
	} catch (err) {
		console.error("createRace error:", err);
	}
}

async function getRace(id) {
	//console.log(`calling server :: ${SERVER}/api/races/${id}`)
	// GET request to `${SERVER}/api/races/${id}`
	try {
		const response = await fetch(`${SERVER}/api/races/${id}`);
		return await response.json();
	} catch (e) {
		console.error("getRace error:", e);
	}
}

async function startRace(id) {
	//console.log(`calling server :: ${SERVER}/api/races/${id}/start`)
	try {
		await fetch(`${SERVER}/api/races/${id}/start`, {
			method: "POST"
		});
	} catch (e) {
		console.error("startRace error:", e);
	}
}

async function accelerate(id) {
	//console.log(`calling server :: ${SERVER}/api/races/${id}/accelerate`)
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request	
	try {
		await fetch(`${SERVER}/api/races/${id}/accelerate`, {
			method: "POST",
			...defaultFetchOpts(),
		});
	} catch (e) {
		console.error("accelerate error:", e);
	}
}