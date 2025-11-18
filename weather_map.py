import sys
from pathlib import Path

import folium
import requests


def fetch_current_temperature(lat, lon):
    """Fetch current temperature for the given coordinates using Open-Meteo."""
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}&current_weather=true"
    )
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    return data.get("current_weather", {}).get("temperature")


def create_map(lat, lon, temperature, output_file):
    """Create an HTML map centered at the given coordinates with temperature marker."""
    m = folium.Map(location=[lat, lon], zoom_start=8)
    folium.Marker(
        location=[lat, lon],
        popup=f"Temperature: {temperature} °C",
    ).add_to(m)
    m.save(output_file)


def main():
    lat = float(sys.argv[1]) if len(sys.argv) > 1 else 59.91  # Default: Oslo
    lon = float(sys.argv[2]) if len(sys.argv) > 2 else 10.75
    output_file = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("weather_map.html")

    temperature = fetch_current_temperature(lat, lon)
    if temperature is None:
        print("Could not fetch temperature data.")
        sys.exit(1)

    create_map(lat, lon, temperature, output_file)
    print(f"Map saved to {output_file}")


if __name__ == "__main__":
    main()
