toastr.options.positionClass = 'toast-top-full-width';
toastr.options.timeOut = 5000;

let mapPrimaryKey = '';
let datasetId = '';

function listStateset() {
  mapPrimaryKey = document.getElementById('map-primary-key').value;
  datasetId = document.getElementById('datasetId').value;

  if (mapPrimaryKey == ''
    || datasetId == ''
  ) {
    toastr.error('請輸入 Azure Map Primary Key / Dataset ID ~');
  } else {
    const loading = document.createElement('i');
    loading.className = 'fa fa-spinner fa-spin mr-10';
    loading.id = 'loading';
    document.getElementById('listAllStatesetBtn').prepend(loading);
    document.getElementById('listAllStatesetBtn').disabled = true;
    list();
  }
}

function list() {
  document.getElementById('table') !== null ? document.getElementById('table').remove() : '';
  axios.get(`https://us.atlas.microsoft.com/featureStateSets?api-version=2.0&subscription-key=${mapPrimaryKey}`)
    .then((response) => {
      // console.log(`response: ${JSON.stringify(response)}`);
      toastr.success('取得 Feature Stateset 成功 ~');
      document.getElementById('listAllStatesetBtn').disabled = false;
      document.getElementById('loading').remove();

      let table = document.createElement('table');
      table.id = 'table';
      let thead = document.createElement('thead');
      let tbody = document.createElement('tbody');
      table.appendChild(thead);
      table.appendChild(tbody);
      document.getElementById('listStatesetData').appendChild(table);

      // Creating and adding data to first row of the table
      let headerRow = document.createElement('tr');
      let noHeader = document.createElement('th');
      noHeader.innerHTML = 'No';
      let statesetIdHeader = document.createElement('th');
      statesetIdHeader.innerHTML = 'Stateset ID';
      let datasetIdHeader = document.createElement('th');
      datasetIdHeader.innerHTML = 'Dataset ID';
      let sytleHeader = document.createElement('th');
      sytleHeader.innerHTML = 'Style';

      headerRow.appendChild(noHeader);
      headerRow.appendChild(datasetIdHeader);
      headerRow.appendChild(statesetIdHeader);
      headerRow.appendChild(sytleHeader);
      thead.appendChild(headerRow);

      const statesetsList = response.data.statesets;
      // console.log(`statesetsArray ${JSON.stringify(statesetsArray)}`);

      let row = '';
      let noData = '';
      let statesetIdData = '';
      let datasetIdData = '';
      let style = '';
      let count = 0;

      statesetsList.forEach((item, index) => {
        if (item.datasetIds[0] === datasetId) {
          count += 1;
          // console.log(`[${index}] Stateset ID: ${item.statesetId}, Dataset ID: ${item.datasetIds[0]}, Style: ${JSON.stringify(item.statesetStyle)}`);

          // Creating and adding data to second row of the table
          row = document.createElement('tr');
          row.className = 'data-tr';
          noData = document.createElement('td');
          noData.innerHTML = count;
          statesetIdData = document.createElement('td');
          statesetIdData.innerHTML = item.statesetId;
          datasetIdData = document.createElement('td');
          datasetIdData.innerHTML = item.datasetIds[0];
          style = document.createElement('td');

          style.innerHTML = `<div class="view-btn" onclick="openNewTab(JSON.parse('${JSON.stringify(item.statesetStyle).replace(/'/g, '&apos;').replace(/"/g, '&quot;')}'))">View</div><div class="download-btn" onClick="downloadStyle(JSON.parse('${JSON.stringify(item.statesetStyle).replace(/'/g, '&apos;').replace(/"/g, '&quot;')}'));">Download</div>`;

          row.appendChild(noData);
          row.appendChild(datasetIdData);
          row.appendChild(statesetIdData);
          row.appendChild(style);
          tbody.appendChild(row);
        }
      })
    })
    .catch((error) => {
      console.error(error);
      toastr.error('取得 Feature Stateset 失敗 ~');
      document.getElementById('listAllStatesetBtn').disabled = false;
    });
}

function openNewTab(style) {
  let x = window.open();
  x.document.open();
  x.document.write('<html><body><pre>' + JSON.stringify(style, undefined, 4) + '</pre></body></html>');
  x.document.close();
}

function downloadStyle(style) {
  const blob = new Blob([JSON.stringify(style, undefined, 4)], { type: 'text/plain' });
  const e = document.createEvent('MouseEvents');
  const a = document.createElement('a');
  a.download = 'Style-Rules.json';
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  a.dispatchEvent(e);
}