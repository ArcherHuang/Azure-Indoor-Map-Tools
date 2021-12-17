toastr.options.positionClass = 'toast-top-full-width';
toastr.options.timeOut = 5000;

let mapPrimaryKey = '';
let statesetId = '';
let featureId = '';
let keyname = '';
let stateValue = '';

function updateState() {
  mapPrimaryKey = document.getElementById('map-primary-key').value;
  statesetId = document.getElementById('statesetId').value;
  featureId = document.getElementById('featureId').value;
  keyname = document.getElementById('keyname').value;
  stateValue = document.getElementById('stateValue').value;

  if (mapPrimaryKey == ''
    || statesetId == ''
    || featureId == ''
    || keyname == ''
    || stateValue == ''
  ) {
    toastr.error('請輸入 Azure Map Primary Key / Stateset ID / Feature ID / keyname / State Value ~');
  } else {
    const loading = document.createElement('i');
    loading.className = 'fa fa-spinner fa-spin mr-10';
    loading.id = 'loading';
    document.getElementById('updateStateBtn').prepend(loading);
    document.getElementById('updateStateBtn').disabled = true;
    set();
  }
}

function set() {
  const data = {
    states: [
      {
        keyName: keyname,
        value: stateValue,
        eventTimestamp: getLocalTime(),
      }
    ]
  };
  axios({
    method: 'put',
    url: `https://us.atlas.microsoft.com/featurestatesets/${statesetId}/featureStates/${featureId}?api-version=2.0&subscription-key=${mapPrimaryKey}`,
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log(`response: ${JSON.stringify(response)}`);
      toastr.success('更新 Feature Stateset 成功 ~');
      document.getElementById('updateStateBtn').disabled = false;
      document.getElementById('loading').remove();
    })
    .catch((error) => {
      console.error(error);
      toastr.error('更新 Feature Stateset 失敗 ~');
      document.getElementById('updateStateBtn').disabled = false;
    });
}

function getLocalTime() {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
  console.log(localISOTime);
  return localISOTime;
}