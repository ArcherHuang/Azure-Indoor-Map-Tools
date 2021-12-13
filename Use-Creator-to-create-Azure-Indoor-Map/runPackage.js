toastr.options.positionClass = 'toast-top-full-width';
toastr.options.timeOut = 5000;

const baseUrl = 'https://us.atlas.microsoft.com';
let mapPrimaryKey = '';
let mapDataOperationsUrl = '';
let mapDataMetadataUrl = '';
let postConversionsUrl = '';
let getConversionsOperationsUrl = '';
let postDatasetsUrl = '';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runPackage() {
  mapPrimaryKey = document.getElementById('map-primary-key').value;
  document.getElementById('package-btn').innerText = '執行中 ( 執行時間約 5 分鐘 )';
  if (mapPrimaryKey == '') {
    toastr.error('【 步驟 1 】請輸入 Azure Map Primary Key ~');
  } else {
    document.getElementById('conversionId').value = '取得中 ( 執行較久 )';
    uploadDwg();
  }
}

// 1. 上傳繪圖套件
function uploadDwg() {
  axios({
    method: 'post',
    url: `https://atlas.microsoft.com/mapData/upload?api-version=1.0&dataFormat=zip&subscription-key=${mapPrimaryKey}`,
    data: document.getElementById('dwg-input').files[0],
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  })
    .then((response) => {
      mapDataOperationsUrl = response.headers.location;
      if (response.status === 202) {
        toastr.success('【 步驟 1 】上傳 dwg + manifest.json 檔成功 ~');
        mapdataOperations();
      } else {
        toastr.error('【 步驟 1 】上傳 dwg + manifest.json 檔失敗 ~');
        document.getElementById('package-btn').innerText = '開始執行';
      }
    })
    .catch((response) => {
      console.log(response);
      toastr.error('【 步驟 1 】上傳 dwg + manifest.json 檔失敗 ~');
      document.getElementById('package-btn').innerText = '開始執行';
    });
}

// 2. 檢查繪圖套件上傳狀態
function mapdataOperations() {
  try {
    axios.get(`${mapDataOperationsUrl}&subscription-key=${mapPrimaryKey}`)
      .then(async (response) => { 
        if (response.status === 201 && typeof response.data.resourceLocation !== 'undefined') {
          mapDataMetadataUrl = response.data.resourceLocation;
          toastr.success('【 步驟 2 】檢查繪圖套件上傳狀態成功 ~');
          mapDataMetadata();
        } else {
          await sleep(10000);
          mapdataOperations();
        }
      })
      .catch((error) => { 
        console.error(error);
        toastr.error('【 步驟 2 】無法成功執行「檢查繪圖套件上傳狀態」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行';
      })
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 2 】無法成功執行「檢查繪圖套件上傳狀態」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行';
  }
}

// 3. 取出繪圖套件中繼資料
function mapDataMetadata() {
  try {
    axios.get(`${mapDataMetadataUrl}&subscription-key=${mapPrimaryKey}`)
      .then((response) => {
        if (response.status === 200) {
          postConversionsUrl = `${baseUrl}/conversions?subscription-key=${mapPrimaryKey}&api-version=2.0&udid=${response.data.udid}&inputType=DWG&outputOntology=facility-2.0`;
          toastr.success('【 步驟 3 】取出繪圖套件中繼資料成功 ~');
          postConversion();
        } else {
          toastr.error('【 步驟 3 】無法成功執行「取出繪圖套件中繼資料」，請稍後再試 ~');
          document.getElementById('package-btn').innerText = '開始執行';
        }
      })
      .catch((error) => {
        console.error(error);
        toastr.error('【 步驟 3 】無法成功執行「取出繪圖套件中繼資料」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行';
      })
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 3 】無法成功執行「取出繪圖套件中繼資料」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行';
  }
}

// 4. 轉換繪圖套件
function postConversion() {
  try {
    axios({
      method: 'post',
      url: postConversionsUrl,
      data: {},
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 202) {
          getConversionsOperationsUrl = response.headers['operation-location'];
          toastr.success('【 步驟 4 】轉換繪圖套件成功 ~');
          getConversionsOperations();
        } else {
          toastr.error('【 步驟 4 】無法成功執行「轉換繪圖套件」，請稍後再試 ~');
          document.getElementById('package-btn').innerText = '開始執行';
        }
      })
      .catch((response) => {
        console.log(response);
        toastr.error('【 步驟 4 】無法成功執行「轉換繪圖套件」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行';
      });
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 4 】無法成功執行「轉換繪圖套件」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行';
  }
}

// 5. 檢查繪圖套件轉換狀態
function getConversionsOperations() {
  try {
    axios.get(`${getConversionsOperationsUrl}&subscription-key=${mapPrimaryKey}`)
      .then(async (response) => {
        const resourceLocation = response.headers['resource-location'];
        if (response.status === 200 && response.data.status === 'Failed') {
          toastr.error('【 步驟 5 】無法成功執行「檢查繪圖套件轉換狀態」，請稍後再試 ~');
          if (response.data.error !== 'undefined') {
            toastr.error('【 步驟 5 】無法成功執行「檢查繪圖套件轉換狀態」，請稍後再試 ~');
            document.getElementById('package-btn').innerText = '開始執行';
          }
        } else if (response.status === 200 && typeof resourceLocation !== 'undefined') {
          const conversionUrlArray = resourceLocation.replace('https://', '').replace('?api-version=2.0', '').split('/');
          postDatasetsUrl = `${baseUrl}/datasets?api-version=2.0&conversionId=${conversionUrlArray[2]}&subscription-key=${mapPrimaryKey}`;
          document.getElementById('conversionId').value = conversionUrlArray[2];
          toastr.success('【 步驟 5 】檢查繪圖套件轉換狀態成功 ~');
          runDataset();
        } else {
          await sleep(30000);
          getConversionsOperations();
        }
      })
      .catch((error) => {
        console.error(error);
        toastr.error('【 步驟 5 】無法成功執行「檢查繪圖套件轉換狀態」，請稍後再試 ~');
        document.getElementById('package-btn').innerText = '開始執行';
      })
  } catch (error) {
    console.log(error);
    toastr.error('【 步驟 5 】無法成功執行「檢查繪圖套件轉換狀態」，請稍後再試 ~');
    document.getElementById('package-btn').innerText = '開始執行';
  }
}