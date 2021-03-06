(function() {
	'use strict';

	// Make sure the gravity forms web api is enabled in your settings
	var app = {
		url: 'https://appdev.local/gravityformsapi/forms/1/submissions',
		sendLater: false
	};

	app.init = function() {
		console.log('App started');

		/*
		 * attach event listener for when we go from offline back to online 
		 * http://github.hubspot.com/offline/
		*/
		Offline.on( 'up', app.reconnected );
	}

	app.submitForm = function(e) {

		e.preventDefault();

		var form = document.getElementById('sb_form');

		var data = {};
		data.input_values = {};

		// loop over form inputs and put them into the right data format
		for (var i = 0; i < form.length; i++) {

			if( form[i].classname = 'gf-input' && form[i].id ) {
				
				if( form[i].getAttribute("type") == "radio" && form[i].checked ) {
					data.input_values[form[i].name] = form[i].value;
				} else {
					data.input_values[form[i].id] = form[i].value;
				}
				
			} 
		}

		/*
		Data should look like this
		{
		    "input_values": {
		        "input_1_3": "Scott",
		        "input_1_6": "Bolinger",
		        "input_3": "This is my message!",
		        "input_2": "scott@app.com"
		    }
		}
		*/

		// if we are offline, save the form to send later
		if( Offline.state === 'down' ) {
			app.sendLater = true
			window.localStorage.setItem( 'gf_form', JSON.stringify( data) );
			alert('You are offline, but this form will send when you reconnect.');
		} else {
			// online, just send the form
			app.sendData( data ).then( app.gfResponse );
		}

		
	}

	// send our data to the server. Returns a promise.
	app.sendData = function( data ) {

		return new Promise( function(resolve, reject) {

			var req = new XMLHttpRequest();
			req.open("POST", app.url);

			req.onload = function () {
			    if (req.readyState === req.DONE) {
			        if (req.status === 200) {
			            console.log(req.response);
			            resolve(req.responseText);
			        }
			    }
			}

			req.send( JSON.stringify( data ) );

		});

		app.sendLater = false
		
	}

	// handle the response from the GF API
	app.gfResponse = function( response ) {

		var a = JSON.parse( response );

		if( a.response.validation_messages ) {
			document.getElementById('gf-message').innerHTML = JSON.stringify( a.response.validation_messages );
		} else if( a.response.confirmation_message ) {
			document.getElementById('gf-message').innerHTML = a.response.confirmation_message;
		}

		setTimeout( function() {
			document.getElementById('gf-message').innerHTML = '';
		}, 7000 );

	}

	/*
	 * Event listener called when we go from offline back to online 
	 * http://github.hubspot.com/offline/
	*/
	app.reconnected = function() {
		console.log('app.reconnected');

		// send the form we stored offline
		if( app.sendLater === true ) {

			var data = JSON.parse( window.localStorage.getItem( 'gf_form' ) );

			app.sendData( data ).then( app.gfResponse );

		}

	}

	window.sbOffline = app;

	app.init();

})();