export async function getCoordinatesFromAddress(address, city) {
  const fullAddress = `${address}, ${city}`;
  const apiKey = "AIzaSyCgm3ECbZXvQYxg3YdFVhqZN_insAqlEJ8";

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error("Error fetching geocode:", error);
    return null;
  }
}
