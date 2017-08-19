function sendLatLng(lat, lng) {
	$.ajax({
		url: "/events/" + lat + "/" + lng,
		success: function(response) {
			console.log(response);
		},
		error: function(error) {
			console.log(error);
		}
	});
}