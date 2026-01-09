"use client";

import { createContext, useContext } from "react";
import mapboxgl from "mapbox-gl";

type MapContextType = {
    map: mapboxgl.Map | null;
};

const MapContext = createContext<MapContextType>({ map: null });

export const useMap = () => useContext(MapContext);

export const MapProvider = MapContext.Provider;
