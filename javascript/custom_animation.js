import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {easeOut} from 'ol/easing.js';
import {fromLonLat} from 'ol/proj.js';
import {getVectorContext} from 'ol/render.js';
import {unByKey} from 'ol/Observable.js';


    
    
    
const API_URL = "http://localhost:4000/cities";
const xhr = new XMLHttpRequest();
// function onRequestHandler(){
//   if(this.readyState == 4 && this.status == 200){
//     console.log(this.response);
//     const data = JSON.parse(this.response);
//     data.map(city => addCityFeature(city.longitude,city.latitude));
//   }
// }
async function onRequestHandler(){
  if(this.readyState == 4 && this.status == 200){
    console.log(this.response);
    const data = JSON.parse(this.response);
    while(true){
      console.log('calling json map');
      data.map(city => addCityFeature(city.longitude,city.latitude));
      await sleep(4000);
    }
  }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

xhr.addEventListener("load", onRequestHandler);
xhr.open("GET",API_URL);
xhr.send();

function addCityFeature(longitude, latitude) {
  addFromLonLatFeature(longitude, latitude);
  window.setInterval(addFromLonLatFeature, 5000);
}
function addFromLonLatFeature(longitude, latitude) {
  const x = longitude;
  const y = latitude;
  const geom = new Point(fromLonLat([x, y]));
  const feature = new Feature(geom);
  source.addFeature(feature);
}

const tileLayer = new TileLayer({
  source: new OSM({
    wrapX: false,
  }),
});

const source = new VectorSource({
  wrapX: false,
});
const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [tileLayer,vector],
  target: 'map',
  view: new View({
    center:[0,0],
    zoom: 2,
    multiWorld: true
  })
})

function addRandomFeature() {
  const x = Math.random() * 360 - 180;
  const y = Math.random() * 170 - 85;
  const geom = new Point(fromLonLat([x, y]));
  const feature = new Feature(geom);
  source.addFeature(feature);
}

function addFixedFeature() {
  const x = -101.7135019;
  const y = 21.1523392;
  //const coordinates = [-11322443.92342625,2410065.884843269];
  const geom = new Point(fromLonLat([x,y] ));
  const feature = new Feature(geom);
  source.addFeature(feature);
}

const duration = 3000;
function flash(feature) {
  const start = Date.now();
  const flashGeom = feature.getGeometry().clone();
  const listenerKey = tileLayer.on('postrender', animate);

  function animate(event) {
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    if (elapsed >= duration) {
      unByKey(listenerKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    const elapsedRatio = elapsed / duration;
    // radius will be 5 at start and 30 at end.
    const radius = easeOut(elapsedRatio) * 25 + 5;
    const opacity = easeOut(1 - elapsedRatio);
    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.25 + opacity,
        }),
      }),
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    // tell OpenLayers to continue postrender animation
    map.render();
  }
}
source.on('addfeature', function (e) {
  flash(e.feature);
});
window.setInterval(addFixedFeature, 1000);
 