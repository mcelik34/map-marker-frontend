import { IconDownload } from "@tabler/icons-react";
import { MarkerCardType } from "../App.browserDB";
import { MarkerCard } from "./MarkerCard.item";

export interface MarkerJsonElemType { id: number, lat: number, lng: number, datetime: string }

export function MarkerCards({ markers, removeMarkerHandler, flyToMarkerHandler }
    : {
        markers: MarkerCardType[];
        removeMarkerHandler: (markerId: number) => void;
        flyToMarkerHandler: (markerId: number) => void;
    }
) {
    const downloadHandler = () => {
        const markersTransformed = markers.map<MarkerJsonElemType>(m => ({ id: m.id, lat: m.obj.getLatLng().lat, lng: m.obj.getLatLng().lng, datetime: m.datetime }))
        const markersJson = JSON.stringify(markersTransformed);

        const blob = new Blob([markersJson], { type: "application/json" });
        const jsonObjectUrl = URL.createObjectURL(blob);

        const filename = "markers.json";
        const anchorEl = document.createElement("a");
        anchorEl.href = jsonObjectUrl;
        anchorEl.download = filename;
        anchorEl.click();

        URL.revokeObjectURL(jsonObjectUrl);
    }

    return (
        <div>
            <div className="flex justify-between">
                <p className="font-sans text-md subpixel-antialiased font-medium">Yer işaretleri</p>
                <button className="" onClick={downloadHandler}><IconDownload size={16} /></button>
            </div>
            {
                markers
                    .sort((a, b) => b.id - a.id)
                    .map(marker =>
                        <MarkerCard
                            key={marker.id}
                            id={marker.id}
                            marker={marker.obj}
                            onRemove={() => removeMarkerHandler(marker.id)}
                            onFlyTo={() => flyToMarkerHandler(marker.id)}
                        />
                    )
            }
            {
                markers.length < 1 &&
                <p className="text-xs mt-2">Şuan işaretlediğiniz bir nokta yok. İşaretlemek için haritada bir noktaya tıklayın veya harita alanındaki orta noktayı işaretlemek için yukarıdaki butonu kullanın.</p>
            }
        </div>
    )
}