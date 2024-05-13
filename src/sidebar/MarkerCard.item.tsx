import { IconPlaneDeparture, IconTrash } from "@tabler/icons-react";
import markerIcon from "leaflet/dist/images/marker-icon-2x.png";

export function MarkerCard({ id, marker, onFlyTo, onRemove }
    : {
        id: number,
        marker: L.Marker,
        onFlyTo: () => void,
        onRemove: () => void
    }
) {

    return (
        <div className="flex gap-3 my-2 rounded-md px-2 py-2 shadow-sm bg-white hover:bg-slate-50">
            <div className="flex-none w-12 inline-flex justify-center flex-wrap content-center items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
                style={{ cursor: "pointer" }}
                onClick={() => onFlyTo()}
            >
                <img src={markerIcon}
                    style={{
                        height: "28px",
                        aspectRatio: "auto"
                    }}
                />
                <p className="mt-2">
                    # {id}
                </p>
            </div>

            <div className="flex-auto w-52 flex flex-col">
                <div>
                    <p className="text-sm">{marker.getPopup()?.getContent()?.toString()}</p>
                    <p className="text-xs">Enlem</p>
                    <p className="text-sm">
                        {marker.getLatLng().lat}
                    </p>
                    <p className="text-xs">Boylam</p>
                    <p className="text-sm">
                        {marker.getLatLng().lng}
                    </p>
                </div>
                <div className="mt-1 inline-flex justify-between items-end">
                    <button onClick={() => onFlyTo()} title="Yere uç">
                        <IconPlaneDeparture size={18} />
                    </button>
                    <button
                        onClick={() => onRemove()}
                        title="Sil"
                    >
                        <IconTrash size={18} stroke={1} />
                    </button>
                </div>
            </div>
        </div>
    )
}
