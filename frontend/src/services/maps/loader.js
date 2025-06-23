import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
  apiKey: "AIzaSyDAGaYhV489MILIGcJUD_lg-y8mMXdcii4",
  version: "weekly",
  libraries: ["places", "marker"], // UNIONE di tutte le librerie richieste
});

export default loader;
