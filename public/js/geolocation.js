// let map, infoWindow;
const key = "AIzaSyBKlyom61CG0ql6QDh_wqzJ2Izy1RWX24M";
getlocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setLocation, errorHandler);
  } else {
    document.getElementById("map").innerHTML = "GeoLoc not supported";
  }
};

setLocation = (position) => {
  let latlon;
  let workLocation;
  latlon = `${position.coords.latitude},${position.coords.longitude}`;
  workLocation = "28.599446, 77.331477";
  const imgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latlon}&zoom=16.8&size=800x600&markers=color:red%7Clabel:W%7C${workLocation}&markers=color:blue%7Clabel:L%7C${latlon}&key=${key}`;
  console.log(imgUrl);
  document.getElementById("map").innerHTML = "<img src='" + imgUrl + "'>";

  $.post(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${workLocation}`)
    .done((data) => {
      console.log(data.results[0].formatted_address);
      document.getElementById("work").innerHTML = data.results[0].formatted_address;
    });

  $.post(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${latlon}`)
    .done((data) => {
      console.log(data.results[0].formatted_address);
      document.getElementById("location").innerHTML = data.results[0].formatted_address;
    });
};

errorHandler = (error) => {
  let mapdiv = document.getElementById("map");
  switch (error.code) {
  case error.PERMISSION_DENIED:
    mapdiv.innerHTML = "User denied the request for Geolocation.";
    break;
  case error.POSITION_UNAVAILABLE:
    mapdiv.innerHTML = "Location information is unavailable.";
    break;
  case error.TIMEOUT:
    mapdiv.innerHTML = "The request to get user location timed out.";
    break;
  case error.UNKNOWN_ERROR:
    mapdiv.innerHTML = "An unknown error occurred.";
    break;
  default:
    break;
  }
};

