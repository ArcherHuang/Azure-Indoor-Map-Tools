const axios = require('axios');

const subscriptionKey = 'IcOe4RJgoxYxw5oPT_HK-GdwDNOljsqC8jgQJd04hyU';

axios.get(`https://us.atlas.microsoft.com/tilesets?api-version=2.0&subscription-key=${subscriptionKey}`)
  .then((response) => {
    const tilesetsArray = response.data.tilesets;
    console.log(`tilesetsArray: ${JSON.stringify(tilesetsArray)}`);
    tilesetsArray.forEach((item, index) => {
      console.log(`tilesetsArray[${index}]: ${item.tilesetId}`);
    })
  })
  .catch((error) => {
    console.log(error);
  });