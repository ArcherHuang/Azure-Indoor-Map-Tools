let datasetId = '';
let tilesetsOperationsUrl = '';

function runTileset() {
  datasetId = document.getElementById('datasetId').value;
  postTilesets();
}

// 8. 建立圖格集
function postTilesets() {
  try {
    document.getElementById('tilesetId').value = '取得中 ( 執行較久 )';
    const postTilesetsUrl = `${baseUrl}/tilesets?api-version=2.0&datasetID=${datasetId}&subscription-key=${mapPrimaryKey}`;
    axios({
      method: 'post',
      url: postTilesetsUrl,
      data: {},
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 202 && typeof response.headers['operation-location'] !== 'undefined') {
          tilesetsOperationsUrl = response.headers['operation-location'];
          const tilesetsOperationsUrlArray = tilesetsOperationsUrl.replace('https://', '').replace('?api-version=2.0', '').split('/');
          toastr.success('【 步驟 8 】建立圖格集成功 ~');
          getTilesetsOperations();
        } else {
          toastr.error('【 步驟 8 】無法成功執行「建立圖格集」，請稍後再試 ~');
          document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
          document.getElementById('package-btn').disabled = false;
        }
      })
      .catch((response) => {
        console.log(response);
        toastr.error('【 步驟 8 】無法成功執行「建立圖格集」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
        document.getElementById('package-btn').disabled = false;
      });
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 8 】無法成功執行「建立圖格集」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
    document.getElementById('package-btn').disabled = false;
  }
}

// 9. 檢查 tileset 建立狀態 ( 執行久 )
function getTilesetsOperations() {
  try {
    axios.get(`${tilesetsOperationsUrl}&subscription-key=${mapPrimaryKey}`)
      .then(async (response) => {
        if (response.status === 200 && typeof response.headers['resource-location'] !== 'undefined') {
        } else if (response.status === 200 && typeof response.data.error !== 'undefined') {
          console.log(`Step 9 error_message: ${response.data.error.message}`);
        }
        const resourceLocation = response.headers['resource-location'];
        if (typeof resourceLocation === 'undefined') {
          await sleep(60000);
          getTilesetsOperations();
        } else {
          const tilesetIdUrlArray = resourceLocation.replace('https://', '').replace('?api-version=2.0', '').split('/');
          document.getElementById('tilesetId').value = tilesetIdUrlArray[2];
          document.getElementById('loading').remove();
          document.getElementById('package-btn').disabled = false;
          toastr.success('【 步驟 9 】檢查 tileset 建立狀態成功 ~');
          document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
          document.getElementById('package-btn').disabled = false;
        }
      })
      .catch((error) => {
        console.error(error);
        toastr.error('【 步驟 9 】無法成功執行「檢查 tileset 建立狀態」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
        document.getElementById('package-btn').disabled = false;
      })
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 9 】無法成功執行「檢查 tileset 建立狀態」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
    document.getElementById('package-btn').disabled = false;
  }
}
