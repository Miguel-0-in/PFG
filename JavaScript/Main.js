window.onload = init();

let isCenter = false;
let activateDeactivateLocation = false;
let activateDeactivateTrack = false;
let geolocation = null;
let positionFeature = null;
let layer = null;
let arrayRute = new Array();
let feature = null;
let arrayFeatures = new Array();
let idFeature = 0;
const activatedColor = '#71a7d3';
const deactivatedColor = '#7A7A73';
const disabledColor = '#d5ddde';

let layerTrack = new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [],
    type: "FeatureCollection",
  }),
});

function init() {
  //constructors
  let view = new ol.View({
    center: [-665167.6272659146, 4493012.258874561],
    zoom: 8,
    maxZoom: 19,
    minZoom: 8,
  });



  map = new ol.Map({
    layers: [new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    ],
    target: "map",
    view: view,
  });

  el("locate").addEventListener("click", function () {
    actDeacLocation();
  });

  el("track").addEventListener("click", function () {
    actDeacTrack();
  });

  el("center").addEventListener("click", function () {
    centerView(map.getView());
  });

  el("save").addEventListener("click", function () {
    saveRoute();
  })
}

function actDeacLocation() {
  if (!activateDeactivateLocation) {
    activateDeactivateLocation = true;

    isCenter = true;

    el("locate").style.backgroundColor = activatedColor;

    locateMe(map);
  } else {
    activateDeactivateLocation = false;
    isCenter = false;

    if (activateDeactivateTrack) {
      actDeacTrack();
    }

    el("locate").style.backgroundColor = deactivatedColor;

    deactivate(map);
  }
}

function actDeacTrack() {
  if (!activateDeactivateTrack) {
    activateDeactivateTrack = true;
    el("track").style.backgroundColor = activatedColor;

    el('save').style.color = deactivatedColor;
    el('save').removeAttribute("disabled");

    if (arrayFeatures != null) {
      document.querySelector('#save').style.color = deactivatedColor;
      document.querySelector('#save').removeAttribute("disabled");
    }

    trackMe();

    if (!activateDeactivateLocation) {
      actDeacLocation();
    }
  } else {
    activateDeactivateTrack = false;
    el("track").style.backgroundColor = deactivatedColor;

    if (arrayFeatures == null) {
      document.querySelector('#save').style.color = deactivatedColor;
      document.querySelector('#save').removeAttribute("true");
    }
  }
}

function trackMe() {
  arrayRute = new Array();

  feature = new ol.Feature({
    type: "Feature",
    properties: {},
  });

  feature.setId(idFeature);
  idFeature++;

  arrayFeatures.push(feature);

  layerTrack.getSource().addFeatures(arrayFeatures);
}

function locateMe(map) {
  let lastPosition = null;
  let located = false;
  let view = map.getView();

  if (geolocation == null) {
    geolocation = new ol.Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });
  }

  geolocation.setTracking(true);

  positionFeature = new ol.Feature();
  positionFeature.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: "#3399CC",
        }),
        stroke: new ol.style.Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
    })
  );

  geolocation.on("change:position", function () {
    let coordinates = geolocation.getPosition();
    positionFeature.setGeometry(
      coordinates ? new ol.geom.Point(coordinates) : null
    );

    if (!located) {
      flyTo(coordinates, 17);//solo una vez

      isCenter = true;
      el("center").style.backgroundColor = activatedColor;
      el("center").setAttribute("disabled", "true");
    }

    if (isCenter && located) {
      let zoom = view.getZoom();
      if (zoom < 17) {
        zoom = 17;
      }
      view.setCenter(geolocation.getPosition());
      view.setZoom(zoom);
    }

    located = true;

    if (activateDeactivateTrack) {
      let sameLocation = true;
      if (lastPosition != null) {
        for (let index = 0; index < lastPosition.length; index++) {
          if (geolocation.getPosition()[index] != lastPosition[index]) {
            sameLocation = false;
          }
        }
      }

      if (!sameLocation || lastPosition == null) {
        let pointList = [coordinates[0], coordinates[1]];

        arrayRute.push(pointList);

        geom = new ol.geom.LineString(arrayRute);
        feature.setGeometry(geom);

        lastPosition = geolocation.getPosition();
      }
    }
  });

  layer = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
      features: [positionFeature],
    }),
  });

  map.on("moveend", function () {
    checkCenter(map.getView());
  });
}

function centerView(view) {
  if (geolocation.getPosition() != null) {
    let zoom = view.getZoom();
    if (zoom < 17) {
      zoom = 17;
    }
    isCenter = true;
    flyTo(geolocation.getPosition(), zoom);
    el("center").setAttribute("disabled", "true");
  }
}

function checkCenter(view) {
  let center = view.getCenter();
  let zoom = view.getZoom();

  if (activateDeactivateLocation) {
    let position = geolocation.getPosition();

    //track está activado
    if (position != null) {
      let samePoint = true;

      for (let index = 0; index < position.length; index++) {
        if (center[index] != position[index]) {
          samePoint = false;
        }
      }

      if (samePoint && zoom >= 17) {
        //está centrado
        el("center").style.backgroundColor = activatedColor;
        el("center").setAttribute("disabled", "true");
        isCenter = true;
      } else {
        //no está centrado
        el("center").style.backgroundColor = '#7A7A73';
        el("center").removeAttribute("disabled");
        isCenter = false;
      }
    }
  } else {
    //track no está activado
    el("center").style.backgroundColor = disabledColor;
    el("center").setAttribute("disabled", "true");
    isCenter = false;
  }
}

function deactivate(map) {
  el("center").style.backgroundColor = disabledColor;
  el("center").setAttribute("disabled", "true");
  removePositions(map);
  geolocation = null;
}

function removePositions(map) {
  if (positionFeature != null) {
    layer.getSource().removeFeature(positionFeature);
  }
  if (geolocation != null) {
    geolocation.setTracking(false);
  }
}

function el(id) {
  return document.getElementById(id);
}

function flyTo(coords, zoom) {
  var view = map.getView();
  var duration = 2000;
  view.animate({
    center: coords,
    duration: duration / 2,
    zoom: zoom
  });
}

function gpxGenerator(name) {
  const trackSegments = arrayFeatures;
  const destProj = 'EPSG:4326';

  const doc = document.implementation.createDocument("", "", null);
  const gpx = doc.createElement('gpx');

  // Add the trk element to GPX
  const trk = doc.createElement('trk');
  const nameEle = doc.createElement('name');
  nameEle.innerHTML = name;
  trk.appendChild(nameEle);

  // Add the trkseg element to GPX
  let index = 0;
  trackSegments.forEach(s => {
    const trkseg = doc.createElement('trkseg');
    const number = doc.createElement('number');
    number.innerHTML = index;
    trkseg.appendChild(number);
    index++;

    // Add the tkrt element to GPX
    const trackPoints = s.getGeometry().getCoordinates();
    trackPoints.forEach(t => {
      const position = ol.proj.transform(t, map.getView().getProjection().getCode(), destProj);
      const trkpt = doc.createElement('trkpt');
      trkpt.setAttribute('lat', position[1]);
      trkpt.setAttribute('lon', position[0]);
      trkseg.appendChild(trkpt);
    });
    trk.appendChild(trkseg);
  });
  gpx.appendChild(trk);

  doc.appendChild(gpx);

  return new XMLSerializer().serializeToString(doc);
}

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function normalize(name) {
  return name.replace(/[^a-zA-Z0-9.]+/g, '_');
}

function saveRoute() {
  const name = prompt('Name of the route:');
  const fileName = normalize(name);

  if (name != null) {
    download(fileName + ".gpx", gpxGenerator(name));
  }
}