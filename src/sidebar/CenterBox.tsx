import { IconMapPin } from "@tabler/icons-react";

export function CenterBox({ center, onAddMarker }
    : {
        center?: L.LatLng,
        onAddMarker: (lat: number, lng: number) => void
    }
) {
    const addCenterAsMarkerHandler = () => {
        if (!center) return;

        onAddMarker(center.lat, center.lng)
    }

    return (
        <div>
            <p className="font-sans text-md subpixel-antialiased font-medium">Orta nokta</p>
            <div className="flex">
                <div className="flex-auto w-64">
                    <p className="text-xs">Enlem</p>
                    <p className="text-sm">
                        {center?.lat}
                    </p>
                    <p className="text-xs">Boylam</p>
                    <p className="text-sm">
                        {center?.lng}
                    </p>
                </div>
                <div className="flex-none w-12">
                    <button
                        style={{ width: "100%", height: "100%" }}
                        className="inline-flex items-center justify-center rounded-lg bg-white hover:bg-yellow-50"
                        onClick={() => addCenterAsMarkerHandler()}
                    >
                        <IconMapPin size={24} />
                    </button>
                </div>
            </div>
        </div>)
}