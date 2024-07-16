import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import React, { useEffect, useState } from "react";

function ViewMapComponent() {
  const urlParams = new URLSearchParams(window.location.search);

  let long_ = urlParams.get("long");
  let lat_ = urlParams.get("lat");
  const [lat, setLat] = useState(lat_);
  const [long, setLong] = useState(long_);
  // useEffect(() => {
  //   setLoggedIn(true);

  // }, []);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={[lat, long]}
        style={{ height: "100vh", width: "100wh" }}
        zoom={50}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=f333de1406884ecf9cdbd7681651bb85"
        />
        <Marker position={[Number.parseFloat(lat), Number.parseFloat(long)]}>
          <Popup>
            <p> HouseholdID: {"I'm Here!"}</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default ViewMapComponent;
