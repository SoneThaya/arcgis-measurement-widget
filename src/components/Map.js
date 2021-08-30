import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const Map = () => {
  const MapEl = useRef(null);

  useEffect(() => {
    loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/views/SceneView",
      "esri/layers/TileLayer",
      "esri/layers/FeatureLayer",
      "esri/widgets/Measurement",
      "esri/widgets/Legend",
    ]).then(
      ([
        Map,
        MapView,
        SceneView,
        TileLayer,
        FeatureLayer,
        Measurement,
        Legend,
      ]) => {
        // World Ocean Base Basemap
        const tileLayer = new TileLayer({
          url: "https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer",
        });

        // Capital cities in Europe FeatureLayer
        const featureLayer = new FeatureLayer({
          url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/europe_country_capitals/FeatureServer/0",
        });

        // Create new Map with TileLayer and FeatureLayer
        const map = new Map({
          layers: [tileLayer, featureLayer],
        });

        // Create MapView with defined zoom and center
        const mapView = new MapView({
          zoom: 6,
          center: [26.1025, 44.4268],
          map: map,
        });

        // Create SceneView with similar extent to MapView
        const sceneView = new SceneView({
          scale: 123456789,
          center: [26.1025, 44.4268],
          map: map,
        });

        // Set the activeView to the 2D MapView
        let activeView = mapView;

        // Create new instance of the Measurement widget
        const measurement = new Measurement();

        // Create new instance of the Legend widget
        const legend = new Legend({
          layerInfos: [
            {
              layer: featureLayer,
              title: "European Capital Cities",
            },
          ],
        });

        // Set-up event handlers for buttons and click events
        const switchButton = document.getElementById("switch-btn");
        const distanceButton = document.getElementById("distance");
        const areaButton = document.getElementById("area");
        const clearButton = document.getElementById("clear");

        switchButton.addEventListener("click", function () {
          switchView();
        });
        distanceButton.addEventListener("click", function () {
          distanceMeasurement();
        });
        areaButton.addEventListener("click", function () {
          areaMeasurement();
        });
        clearButton.addEventListener("click", function () {
          clearMeasurements();
        });

        // Call the loadView() function for the initial view
        loadView();

        // The loadView() function to define the view for the widgets and div
        function loadView() {
          activeView.set({
            container: "viewDiv",
          });
          // Add the appropriate measurement UI to the bottom-right when activated
          activeView.ui.add(measurement, "bottom-right");
          // Add the legend to the bottom left
          activeView.ui.add(legend, "bottom-left");
          // Set the views for the widgets
          measurement.view = activeView;
          legend.view = activeView;
        }

        // When the 2D or 3D button is activated, the switchView() function is called
        function switchView() {
          // Clone the viewpoint for the MapView or SceneView
          const viewpoint = activeView.viewpoint.clone();
          // Get the view type, either 2d or 3d
          const type = activeView.type;

          // Clear any measurements that had been drawn
          clearMeasurements();

          // Reset the measurement tools in the div
          activeView.container = null;
          activeView = null;
          // Set the view based on whether it switched to 2D MapView or 3D SceneView
          activeView = type.toUpperCase() === "2D" ? sceneView : mapView;
          activeView.set({
            container: "viewDiv",
            viewpoint: viewpoint,
          });
          // Add the appropriate measurement UI to the bottom-right when activated
          activeView.ui.add(measurement, "bottom-right");
          // Add the legend to the bottom left
          activeView.ui.add(legend, "bottom-left");

          // Set the views for the widgets
          measurement.view = activeView;
          legend.view = activeView;
          // Reset the value of the 2D or 3D switching button
          switchButton.value = type.toUpperCase();
        }

        // Call the appropriate DistanceMeasurement2D or DirectLineMeasurement3D
        function distanceMeasurement() {
          const type = activeView.type;
          measurement.activeTool =
            type.toUpperCase() === "2D" ? "distance" : "direct-line";
          distanceButton.classList.add("active");
          areaButton.classList.remove("active");
        }

        // Call the appropriate AreaMeasurement2D or AreaMeasurement3D
        function areaMeasurement() {
          measurement.activeTool = "area";
          distanceButton.classList.remove("active");
          areaButton.classList.add("active");
        }

        // Clears all measurements
        function clearMeasurements() {
          distanceButton.classList.remove("active");
          areaButton.classList.remove("active");
          measurement.clear();
        }
      }
    );
  }, []);

  return (
    <>
      <div
        id="viewDiv"
        style={{ height: "100vh", width: "100vw" }}
        ref={MapEl}
      ></div>
      <div id="infoDiv">
        <input
          class="esri-component esri-widget--button esri-widget esri-interactive"
          type="button"
          id="switch-btn"
          value="3D"
        />
      </div>
      <div id="toolbarDiv" class="esri-component esri-widget">
        <button
          id="distance"
          class="esri-widget--button esri-interactive esri-icon-measure-line"
          title="Distance Measurement Tool"
        ></button>
        <button
          id="area"
          class="esri-widget--button esri-interactive esri-icon-measure-area"
          title="Area Measurement Tool"
        ></button>
        <button
          id="clear"
          class="esri-widget--button esri-interactive esri-icon-trash"
          title="Clear Measurements"
        ></button>
      </div>
    </>
  );
};

export default Map;
