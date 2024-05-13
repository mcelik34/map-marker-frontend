import "leaflet/dist/leaflet.css";

import { IconX } from "@tabler/icons-react";
import L, { LatLng } from "leaflet";
import { useEffect, useRef, useState } from 'react';
import { CenterBox } from "./sidebar/CenterBox";
import { MarkerCards } from "./sidebar/MarkerCards.list";
import { useAddMarkerMutation, useDeleteMarkerMutation, useReadMarkersQuery } from "./store/externalDB";
import './stylesheets/App.css';
import { debounceCall } from "./utils";

export type MarkerCardType = { id: number, obj: L.Marker, datetime: string }

function App() {
  const map = useRef<L.Map>();
  const mapContainerRef = useRef<any>();

  const [center, setCenter] = useState<LatLng>()
  const [mapMarkers, setMapMarkers] = useState<MarkerCardType[]>([])

  const {
    data: extMarkers,
    isLoading: areMarkersLoading
  } = useReadMarkersQuery({})
  const [addMarker] = useAddMarkerMutation();
  const [deleteMarker] = useDeleteMarkerMutation()

  useEffect(() => {
    if (map.current) return;

    // initialize map with SAMM's coordinates
    map.current = new L.Map(mapContainerRef.current, {
      center: [40.85859206777246, 29.422365699989758],
      zoom: 16
    })

    // set map provider
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.current)

    // set initial center's state
    setCenter(map.current.getCenter())
  }, [])

  // add markers from external source
  useEffect(() => {
    if (!map.current) return;

    if (extMarkers && extMarkers.data.length > 0 && !areMarkersLoading) {
      const mapMarkers = extMarkers.data.map(m => ({ ...m, obj: L.marker([m.lat, m.lng]).addTo(map.current as L.Map) }))
      setMapMarkers(mapMarkers)
    }
  }, [areMarkersLoading])

  // register to map events
  useEffect(() => {
    if (!map.current) return;

    // to update center's state when map's center is changed
    map.current?.addEventListener("move", debounceCall(() => {
      if (!map.current) return;

      setCenter(map.current?.getCenter())
    }, 20))

    // to update center's state when map's pan has its last minor movement
    map.current?.addEventListener("moveend", () => {
      if (!map.current) return;

      setCenter(map.current?.getCenter())
    })

    // to add a marker once click on map and append it to markers' state
    map.current.on("click", e => {
      addMarkerHandler(e.latlng.lat, e.latlng.lng)
    })

    return () => {
      map.current?.removeEventListener("moveend")
      map.current?.removeEventListener("click")
    }
  }, [])

  const addMarkerHandler = (lat: number, lng: number) => {
    if (!map.current) return;

    addMarker({ lat, lng }).unwrap().then((marker) => {
      setMapMarkers(prev => [...prev, { ...marker, obj: L.marker([lat, lng]).addTo(map.current as L.Map) }])
    })
  }

  const removeMarkerHandler = (markerId: number) => {
    if (!map.current) return;

    deleteMarker(markerId).unwrap().then(() => {
      setMapMarkers(prev => {
        mapMarkers.find(m => m.id === markerId)?.obj.removeFrom(map.current as L.Map)

        return prev.filter(m => m.id !== markerId)
      })
    })
  }

  const flyToMarkerHandler = (markerId: number) => {
    const marker = mapMarkers.find(m => m.id === markerId)
    if (!marker) return;

    map.current?.flyTo(marker?.obj.getLatLng(), 17)
    marker?.obj.openPopup()
  }

  return (
    <div id="root">
      <div id="map">
        <div className="x">
          <IconX size={12} />
        </div>
        <div ref={mapContainerRef} className="container" />
      </div>
      <div id="side" className="flex flex-col gap-4 p-6">
        <CenterBox
          center={center}
          onAddMarker={addMarkerHandler} />
        <MarkerCards markers={mapMarkers}
          flyToMarkerHandler={flyToMarkerHandler}
          removeMarkerHandler={removeMarkerHandler} />
      </div>
    </div>
  )
}

export default App
