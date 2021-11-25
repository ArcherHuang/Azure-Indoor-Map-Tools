function displayMap() {
  const subscriptionKey = document.getElementById("key").value;
  const tilesetId = document.getElementById("tilesetId").value;
  const statesetId = document.getElementById("statesetId").value;
  const latitude = Number(document.getElementById("latitude").value);
  const longitude = Number(document.getElementById("longitude").value);
  console.log(`subscriptionKey: ${subscriptionKey}, tilesetID: ${tilesetId}, statesetId: ${statesetId}`);
  if (subscriptionKey == '' ||
    subscriptionKey == '' ||
    subscriptionKey == ''
  ) {
    alert('請輸入 Key、Tileset ID、Stateset ID');
  } else {
    document.getElementById("myMap").classList.remove('hidden');
    document.getElementById("container").classList.add('hidden');
    let map = new atlas.Map('myMap', {
      center: [longitude, latitude],
      style: 'grayscale_light',
      view: 'Auto',
      authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey,
      },
      zoom: 18,
    });
    map.events.add('ready', function () {

      // Add a map style selection control.
      map.controls.add(new atlas.control.StyleControl({ mapStyles: "all" }), { position: "top-right" });

      // Create an indoor maps manager.
      indoorManager = new atlas.indoor.IndoorManager(map, {
        tilesetId: tilesetId,
        statesetId: statesetId // Optional
      });

      // Add a level control to the indoor manager.
      indoorManager.setOptions({
        levelControl: new atlas.control.LevelControl({ position: 'top-right' })
      });

      if (statesetId.length > 0) {
        indoorManager.setDynamicStyling(true);
      }

      // Add event for when the focused facility level changes.
      map.events.add('levelchanged', indoorManager, (eventData) => {
        console.log('The level has changed:', eventData);
      });

      // Add event for when the focused facility changes.
      map.events.add('facilitychanged', indoorManager, (eventData) => {
        console.log('The facility has changed:', eventData);
      });
    });
  }
}