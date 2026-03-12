from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route("/renewable")
def renewable():

    area = request.args.get("area")

    panel_kw = float(request.args.get("panel_kw",0))
    wind_kw = float(request.args.get("wind_kw",0))
    mode = request.args.get("mode","daily")

    # STEP 1: Convert area → coordinates
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={area}"
        geo_res = requests.get(geo_url)
        geo_res.raise_for_status()
        geo_data = geo_res.json()

        if "results" not in geo_data or not geo_data["results"]:
            return jsonify({"error": f"Area '{area}' not found"}), 404

        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]
    except Exception as e:
        return jsonify({"error": f"Geocoding failed: {str(e)}"}), 500


    # STEP 2: Get weather forecast
    try:
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=shortwave_radiation,windspeed_10m"
        weather_res = requests.get(weather_url)
        weather_res.raise_for_status()
        weather = weather_res.json()
    except Exception as e:
        return jsonify({"error": f"Weather data fetch failed: {str(e)}"}), 500

    irradiance = weather["hourly"]["shortwave_radiation"]
    wind_speed = weather["hourly"]["windspeed_10m"]


    efficiency = 0.8
    rated_speed = 12

    # SOLAR
    hourly_solar = []
    for irr in irradiance:
        energy = panel_kw * (irr/1000) * efficiency
        hourly_solar.append(energy)

    # WIND
    hourly_wind = []
    for v in wind_speed:
        if v <= rated_speed:
            energy = wind_kw * (v/rated_speed)**3
        else:
            energy = wind_kw
        hourly_wind.append(energy)

    daily_solar = sum(hourly_solar)
    daily_wind = sum(hourly_wind)

    if mode == "hourly":
        solar_result = hourly_solar
        wind_result = hourly_wind
    elif mode == "monthly":
        solar_result = daily_solar * 30
        wind_result = daily_wind * 30
    else:
        solar_result = daily_solar
        wind_result = daily_wind

    return jsonify({
        "area": area,
        "solar_energy": solar_result,
        "wind_energy": wind_result
    })

if __name__ == "__main__":
    app.run(debug=True, port=5001)