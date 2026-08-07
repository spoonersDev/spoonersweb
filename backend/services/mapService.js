const axios = require('axios');

const DEFAULT_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const LICENSE_META = {
  provider: 'OpenFreeMap',
  text: 'OpenFreeMap © OpenMapTiles · Data from OpenStreetMap',
  openMapTilesUrl: 'https://www.openmaptiles.org/',
  openStreetMapCopyrightUrl: 'https://www.openstreetmap.org/copyright',
  providerUrl: 'https://openfreemap.org/'
};

async function getMapInitConfig() {
  const styleUrl = process.env.MAP_STYLE_URL || DEFAULT_STYLE_URL;

  const response = await axios.get(styleUrl, {
    timeout: 8000,
    headers: { accept: 'application/json' }
  });

  return {
    styleUrl,
    center: [8.6821, 50.1109],
    zoom: 4,
    styleVersion: response.data?.version || null,
    attribution: LICENSE_META,
    license: {
      maplibre: 'BSD-3-Clause',
      openfreemapProject: 'MIT',
      mapData: 'OpenStreetMap contributors'
    }
  };
}

module.exports = { getMapInitConfig };
