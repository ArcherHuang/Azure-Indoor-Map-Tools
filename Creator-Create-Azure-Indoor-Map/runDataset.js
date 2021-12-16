let conversionId = '';
let datasetsOperationsUrl = '';

function runDataset() {
  conversionId = document.getElementById('conversionId').value;
  postDatasets();
}

// 6. 建立資料集
function postDatasets() {
  try {
    const loading = document.createElement('i');
    loading.className = 'fa fa-spinner fa-spin ml-10';
    loading.id = 'loading-label';
    document.getElementById('datasetLbl').appendChild(loading);
    document.getElementById('datasetId').value = '取得中 ( 執行較久 )';
    const postDatasetsUrl = `${baseUrl}/datasets?api-version=2.0&conversionId=${conversionId}&subscription-key=${mapPrimaryKey}`;
    axios({
      method: 'post',
      url: postDatasetsUrl,
      data: {},
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 202 && typeof response.headers['operation-location'] !== 'undefined') {
          datasetsOperationsUrl = response.headers['operation-location'];
          toastr.success('【 步驟 6 】建立資料集成功 ~');
          datasetsOperations();
        } else {
          toastr.error('【 步驟 6 】無法成功執行「建立資料集」，請稍後再試 ~');
          document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
          document.getElementById('package-btn').disabled = false;
        }
      })
      .catch((response) => {
        console.log(response);
        toastr.error('【 步驟 6 】無法成功執行「建立資料集」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
        document.getElementById('package-btn').disabled = false;
      });
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 6 】無法成功執行「建立資料集」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
    document.getElementById('package-btn').disabled = false;
  }
}

// 7. 檢查資料集建立狀態 ( 執行久 )
function datasetsOperations() {
  try {
    axios.get(`${datasetsOperationsUrl}&subscription-key=${mapPrimaryKey}`)
      .then(async (response) => {
        if (response.data.status !== 'Running') {
          const resourceLocation = response.headers['resource-location'];
          if (response.status === 200 && typeof resourceLocation !== 'undefined') {
            const datasetIDUrlArray = resourceLocation.replace('https://', '').replace('?api-version=2.0', '').split('/');
            document.getElementById('datasetId').value = datasetIDUrlArray[2];
            document.getElementById('loading-label').remove();
            toastr.success('【 步驟 7 】檢查資料集建立狀態成功 ~');
            runTileset();
          }
        } else {
          await sleep(60000);
          datasetsOperations();
        }
      })
      .catch((error) => {
        console.error(error);
        toastr.error('【 步驟 7 】無法成功執行「檢查資料集建立狀態」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
        document.getElementById('package-btn').disabled = false;
      })
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 7 】無法成功執行「檢查資料集建立狀態」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行 ( 執行時間約 5 分鐘 )';
    document.getElementById('package-btn').disabled = false;
  }
}