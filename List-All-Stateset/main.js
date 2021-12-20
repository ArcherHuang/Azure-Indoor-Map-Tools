toastr.options.positionClass = 'toast-top-full-width';
toastr.options.timeOut = 5000;

let mapPrimaryKey = '';
let datasetId = '';

function listStateset() {
  mapPrimaryKey = document.getElementById('map-primary-key').value;
  datasetId = document.getElementById('datasetId').value;

  if (mapPrimaryKey == '') {
    toastr.error('請輸入 Azure Map Primary Key ~');
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
      let actionHeader = document.createElement('th');
      actionHeader.innerHTML = 'Action';

      headerRow.appendChild(noHeader);
      headerRow.appendChild(datasetIdHeader);
      headerRow.appendChild(statesetIdHeader);
      headerRow.appendChild(sytleHeader);
      headerRow.appendChild(actionHeader);
      thead.appendChild(headerRow);

      const statesetsList = response.data.statesets;
      // console.log(`statesetsArray ${JSON.stringify(statesetsArray)}`);

      let row = '';
      let noData = '';
      let statesetIdData = '';
      let datasetIdData = '';
      let style = '';
      let count = 0;
      let action = '';

      statesetsList.forEach((item, index) => {
        if (datasetId !== '' && item.datasetIds[0] !== datasetId) {
          return;
        }

        datasetId === '' ? count = index + 1 : count += 1;

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

        action = document.createElement('td');
        action.id = `action-${item.statesetId}`;
        action.innerHTML = `<div class="view-btn" onclick="deleteStatesetId(JSON.parse('${JSON.stringify(item.statesetId).replace(/'/g, '&apos;').replace(/"/g, '&quot;')}'))">Delete</div>`;

        row.appendChild(noData);
        row.appendChild(datasetIdData);
        row.appendChild(statesetIdData);
        row.appendChild(style);
        row.appendChild(action);
        tbody.appendChild(row);
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

function deleteStatesetId(statesetId) {
  const loading = document.createElement('i');
  loading.className = 'fa fa-spinner fa-spin ml-10';
  loading.id = 'loading-label';
  document.getElementById(`action-${statesetId}`).appendChild(loading);
  Swal.fire({
    title: `是否確定刪除 Stateset ID 為 ${statesetId} 的紀錄 ?`,
    footer: '刪除後無法復原',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '確定刪除',
    cancelButtonText: '取消刪除',
    customClass: {
      title: 'swal-title',
      footer: 'swal-content',
    }
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete(`https://us.atlas.microsoft.com/featureStateSets/${statesetId}?api-version=2.0&subscription-key=${mapPrimaryKey}`)
        .then((response) => {
          console.log(response);
          Swal.fire(
            `已刪除 Stateset ID 為 ${statesetId} 的紀錄 !`,
            '',
            'success'
          ).then(() => {
            listStateset();
          })
        })
        .catch((error) => {
          console.log(error);
          toastr.error(`刪除 Stateset ID 為 ${statesetId} 失敗 ~`);
        });
    } else {
      document.getElementById('loading-label').remove();
    }
  })
}