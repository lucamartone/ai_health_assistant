import { Loader } from "@googlemaps/js-api-loader";

const loader_map = new Loader({
  apiKey: import.meta.env.VITE_MAP_VIEW_KEY,
  version: "weekly",
  libraries: ["places", "marker"], // UNIONE di tutte le librerie richieste
});

export default loader_map;
