import "leaflet/dist/leaflet.css";

import { IconX } from "@tabler/icons-react";
import { IDBPDatabase } from "idb";
import L, { LatLng } from "leaflet";
import { useEffect, useRef, useState } from 'react';
import { CenterBox } from "./sidebar/CenterBox";
import { MarkerCards } from "./sidebar/MarkerCards.list";
import DB, { DB as DBConnection } from "./store/browserDB";
import './stylesheets/App.css';
import { debounceCall } from "./utils";

export type MarkerCardType = { id: number, obj: L.Marker, datetime: string }

function App() {
  const map = useRef<L.Map>();
  const mapContainerRef = useRef<any>();

  const [center, setCenter] = useState<LatLng>()
  const [markers, setMarkers] = useState<MarkerCardType[]>([])
  const [indexedDb, setIndexedDb] = useState<IDBPDatabase<unknown>>()

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

  useEffect(() => {
    DBConnection.then((res) => setIndexedDb(res))
  }, [])

  useEffect(() => {
    if (!indexedDb?.name) return;

    DB.read()
      .then((markers) => {
        if (!markers) return;

        const objs = markers.map(m => ({ id: m.id, obj: L.marker([m.lat, m.lng]).addTo(map.current as L.Map), datetime: m.datetime }))
        setMarkers(objs)

        return markers
      }).then((markers) => {
        if (!markers) return;

        // add marker of SAMM if not exist
        if (markers.findIndex(m => m.lat == 40.85859206777246 && m.lng == 29.422365699989758) === -1) {
          addMarkerHandler(40.85859206777246, 29.422365699989758)
        }
      })
  }, [indexedDb?.name])

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

    const marker = L.marker([lat, lng]);
    marker.addTo(map.current);

    setMarkers(prev => {
      const __new = { id: findNextId(prev), obj: marker, datetime: new Date().toISOString() };

      DB.add([{ id: __new.id, lat: __new.obj.getLatLng().lat, lng: __new.obj.getLatLng().lng, datetime: __new.datetime }])

      return [...prev, __new]
    })
  }

  const removeMarkerHandler = (markerId: number) => {
    if (!map.current) return;
    const marker = markers.find(m => m.id === markerId)
    if (!marker) return;

    marker.obj.removeFrom(map.current)
    setMarkers(prev => prev.filter(m => m.id !== markerId))
    DB.remove([markerId])
  }

  const flyToMarkerHandler = (markerId: number) => {
    const marker = markers.find(m => m.id === markerId)
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
        <MarkerCards markers={markers}
          flyToMarkerHandler={flyToMarkerHandler}
          removeMarkerHandler={removeMarkerHandler} />
      </div>
    </div>
  )
}

const findNextId = (prev: { id: number }[]) => prev.reduce((pre, curr) => curr.id >= pre ? curr.id : pre, prev?.[0]?.id || 0) + 1

export default App
