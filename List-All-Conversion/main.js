toastr.options.positionClass = 'toast-top-full-width';
toastr.options.timeOut = 5000;

let mapPrimaryKey = '';
let conversionId = '';

function listConversion() {
  mapPrimaryKey = document.getElementById('map-primary-key').value;
  conversionId = document.getElementById('conversionId').value;

  if (mapPrimaryKey == '') {
    toastr.error('請輸入 Azure Map Primary Key ~');
  } else {
    const loading = document.createElement('i');
    loading.className = 'fa fa-spinner fa-spin mr-10';
    loading.id = 'loading';
    document.getElementById('listAllConversionBtn').prepend(loading);
    document.getElementById('listAllConversionBtn').disabled = true;
    list();
  }
}

function list() {
  document.getElementById('table') !== null ? document.getElementById('table').remove() : '';
  axios.get(`https://us.atlas.microsoft.com/conversions?api-version=2.0&subscription-key=${mapPrimaryKey}`)
    .then((response) => {
      // console.log(`response: ${JSON.stringify(response)}`);
      toastr.success('取得 Conversion 成功 ~');
      document.getElementById('listAllConversionBtn').disabled = false;
      document.getElementById('loading').remove();

      let table = document.createElement('table');
      table.id = 'table';
      let thead = document.createElement('thead');
      let tbody = document.createElement('tbody');
      table.appendChild(thead);
      table.appendChild(tbody);
      document.getElementById('listConversionData').appendChild(table);

      // Creating and adding data to first row of the table
      let headerRow = document.createElement('tr');
      let noHeader = document.createElement('th');
      noHeader.innerHTML = 'No';
      let udidHeader = document.createElement('th');
      udidHeader.innerHTML = 'UDID';
      let conversionIdHeader = document.createElement('th');
      conversionIdHeader.innerHTML = 'Conversion ID';
      let infoHeader = document.createElement('th');
      infoHeader.innerHTML = 'Info';
      let actionHeader = document.createElement('th');
      actionHeader.innerHTML = 'Action';

      headerRow.appendChild(noHeader);
      headerRow.appendChild(conversionIdHeader);
      headerRow.appendChild(udidHeader);
      headerRow.appendChild(infoHeader);
      headerRow.appendChild(actionHeader);
      thead.appendChild(headerRow);

      const conversionsList = response.data.conversions;
      // console.log(`conversionsList ${JSON.stringify(conversionsList)}`);

      let row = '';
      let noData = '';
      let conversionIdData = '';
      let udidData = '';
      let info = '';
      let count = 0;
      let action = '';

      conversionsList.forEach((item, index) => {
        if (conversionId !== '' && item.conversionId !== conversionId) {
          return;
        }

        conversionId === '' ? count = index + 1 : count += 1;

        // Creating and adding data to second row of the table
        row = document.createElement('tr');
        row.className = 'data-tr';
        noData = document.createElement('td');
        noData.innerHTML = count;

        conversionIdData = document.createElement('td');
        conversionIdData.innerHTML = item.conversionId;
        
        udidData = document.createElement('td');
        udidData.innerHTML = item.udid;

        info = document.createElement('td');
        info.innerHTML = `<div class="view-btn" onclick="openNewTab(JSON.parse('${JSON.stringify(item).replace(/'/g, '&apos;').replace(/"/g, '&quot;')}'))">View</div><div class="download-btn" onClick="downloadStyle(JSON.parse('${JSON.stringify(item).replace(/'/g, '&apos;').replace(/"/g, '&quot;')}'));">Download</div>`;

        action = document.createElement('td');
        action.id = `action-${item.conversionId}`;
        action.innerHTML = `<div class="view-btn" onclick="deleteConversionId(JSON.parse('${JSON.stringify(item.conversionId).replace(/'/g, '&apos;').replace(/"/g, '&quot;')}'))">Delete</div>`;

        row.appendChild(noData);
        row.appendChild(conversionIdData);
        row.appendChild(udidData);
        row.appendChild(info);
        row.appendChild(action);
        tbody.appendChild(row);
      })
    })
    .catch((error) => {
      console.error(error);
      toastr.error('取得 Conversion 失敗 ~');
      document.getElementById('listAllConversionBtn').disabled = false;
    });
}

function openNewTab(item) {
  let x = window.open();
  x.document.open();
  x.document.write('<html><body><pre>' + JSON.stringify(item, undefined, 4) + '</pre></body></html>');
  x.document.close();
}

function downloadStyle(item) {
  const blob = new Blob([JSON.stringify(item, undefined, 4)], { type: 'text/plain' });
  const e = document.createEvent('MouseEvents');
  const a = document.createElement('a');
  a.download = 'Conversion.json';
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  a.dispatchEvent(e);
}

function deleteConversionId(conversionId) {
  const loading = document.createElement('i');
  loading.className = 'fa fa-spinner fa-spin ml-10';
  loading.id = 'loading-label';
  document.getElementById(`action-${conversionId}`).appendChild(loading);
  Swal.fire({
    title: `是否確定刪除 Conversion ID 為 ${conversionId} 的紀錄 ?`,
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
      axios.delete(`https://us.atlas.microsoft.com/conversions/${conversionId}?api-version=2.0&subscription-key=${mapPrimaryKey}`)
        .then((response) => {
          console.log(response);
          Swal.fire(
            `已刪除 Conversion ID 為 ${conversionId} 的紀錄 !`,
            '',
            'success'
          ).then(() => {
            listConversion();
          })
        })
        .catch((error) => {
          console.log(error);
          toastr.error(`刪除 Conversion ID 為 ${conversionId} 失敗 ~`);
        });
    } else {
      document.getElementById('loading-label').remove();
    }
  })
}