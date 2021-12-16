toastr.options.positionClass = 'toast-top-full-width';
toastr.options.timeOut = 5000;

const baseUrl = 'https://us.atlas.microsoft.com';
let count = 0;
let jsonStyles = {};

let mapPrimaryKey = '';
let datasetId = '';
let setBtn = '';

document.getElementById('json-editor').style.display = 'none';

document.addEventListener('input', function (event) {
  if (event.target.id !== 'types') return;
  removeAllRules();
  document.getElementById('statesetId').value = '';
  addRule(event.target.value);
}, false);

document.getElementById('upload-json').addEventListener('change', uploadJson, false);

function addRuleElement(ops, key = '', data = '') {
  const rulesParent = document.getElementById('rules');

  // field div
  const fieldDiv = document.createElement('div');
  fieldDiv.className = 'rule-field';
  fieldDiv.id = `field-${count}`;

  // label
  const labelDiv = document.createElement('div');
  labelDiv.className = 'label pt-5';
  const divContent = document.createTextNode('Style Rule ( 必填 )');
  labelDiv.appendChild(divContent);
  fieldDiv.appendChild(labelDiv);

  // input text
  if (ops != 'number' && data == '') {
    const inputText = document.createElement('input');
    inputText.type = 'text';
    if (ops == 'string') {
      inputText.value = '';
    } else if (ops == 'boolean' && count == 1) {
      inputText.value = 'true';
      inputText.disabled = true;
    } else if (ops == 'boolean' && count == 2) {
      inputText.value = 'false';
      inputText.disabled = true;
    }
    inputText.className = 'input-field';
    inputText.setAttribute('id', `input-${count}`);
    fieldDiv.appendChild(inputText);
  } else if (ops != 'number') {
    const inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.value = key;
    ops == 'boolean' ? inputText.disabled = true : '';
    inputText.className = 'input-field';
    inputText.setAttribute('id', `input-${count}`);
    fieldDiv.appendChild(inputText);
  }

  // input color
  const inputColor = document.createElement('input');
  inputColor.type = 'color';
  inputColor.value = '#ffffff';
  ops == 'number' && data != '' ? inputColor.value = `${data.color}` : inputColor.value = `${data}`;
  if (ops != 'number') {
    inputColor.className = 'set-style ml-10 mr-10';
  } else {
    inputColor.className = 'set-style mr-10';
  }
  inputColor.setAttribute('id', `color-${count}`);
  fieldDiv.appendChild(inputColor);

  // number
  if (ops == 'number') {
    // min label
    const minSpan = document.createElement('span');
    minSpan.className = 'min-max-label';
    minSpan.textContent = 'Min';
    fieldDiv.appendChild(minSpan);

    // min input
    const minInput = document.createElement('input');
    minInput.type = 'number';
    data != '' ? minInput.value = data.range.minimum : minInput.value = '0';
    minInput.setAttribute('id', `min-${count}`);
    minInput.className = 'min-max-input';
    fieldDiv.appendChild(minInput);

    // ~ label
    const tildeSpan = document.createElement('span');
    tildeSpan.className = 'min-max-label';
    tildeSpan.textContent = '~';
    fieldDiv.appendChild(tildeSpan);

    // max label
    const maxSpan = document.createElement('span');
    maxSpan.className = 'min-max-label';
    maxSpan.textContent = 'Max';
    fieldDiv.appendChild(maxSpan);

    // max input
    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    data != '' ? maxInput.value = data.range.exclusiveMaximum : maxInput.value = '100';
    maxInput.setAttribute('id', `max-${count}`);
    maxInput.className = 'input-field min-max-input';
    fieldDiv.appendChild(maxInput);
  }

  if (ops == 'string' || ops == 'number') {
    // Add plus button
    const plusBtn = document.createElement('i');
    plusBtn.className = 'fas fa-plus-circle pt-5 mr-5';
    plusBtn.setAttribute('onclick', `addRule("${ops}");`);
    plusBtn.setAttribute('id', `add-rule-btn-${count}`);
    fieldDiv.appendChild(plusBtn);

    if (count > 1) {
      // Add minus button
      const minusBtn = document.createElement('i');
      minusBtn.className = 'fas fa-minus-circle pt-5';
      minusBtn.setAttribute('onclick', 'removeRule();');
      minusBtn.setAttribute('id', `minus-rule-btn-${count}`);
      fieldDiv.appendChild(minusBtn);
    }
  }

  rulesParent.appendChild(fieldDiv);

  if (ops == 'boolean' && count == 1 && data == '') {
    addRule('boolean');
  }
}

function addRule(ops, key = '', data = '') {
  count += 1;
  switch (ops) {
    case 'string':
      addRuleElement('string', key, data);
      if (count > 1) {
        document.getElementById(`add-rule-btn-${count - 1}`).style.display = 'none';
        count - 1 == 1 ? '' : document.getElementById(`minus-rule-btn-${count - 1}`).style.display = 'none';
      }
      break;
    case 'boolean':
      addRuleElement('boolean', key, data);
      break;
    case 'number':
      addRuleElement('number', key, data);
      if (count > 1) {
        document.getElementById(`add-rule-btn-${count - 1}`).style.display = 'none';
        count - 1 == 1 ? '' : document.getElementById(`minus-rule-btn-${count - 1}`).style.display = 'none';
      }
      break;
  }
}

function removeRule() {
  document.getElementById(`field-${count}`).remove();
  count -= 1;
  document.getElementById(`add-rule-btn-${count}`).style.display = 'block';
  count == 1 ? '' : document.getElementById(`minus-rule-btn-${count}`).style.display = 'block';
}

function toJson() {
  jsonStyles = {};
  const keyname = document.getElementById('keyname').value;
  const type = document.getElementById('types').value;
  let ruleJson = {};
  let emptyField = '';
  keyname == '' ? emptyField = true : '';
  type == 'Types of stateset' ? emptyField = true : '';

  if (type != 'number') {
    for (let index = 1; index <= count; index++) {
      const key = document.getElementById(`input-${index}`).value;
      key == '' ? emptyField = true : '';
    }

    switch (emptyField) {
      case true:
        toastr.error('請輸入 Style Keyname / Type / Rule key ~');
        break;
      default:
        if (checkKeyIsExists()) {
          toastr.error('Rule key 重複 ~');
        } else {
          for (let index = 1; index <= count; index++) {
            const key = document.getElementById(`input-${index}`).value;
            const color = document.getElementById(`color-${index}`).value;
            ruleJson[key] = color;
          }
          jsonStyles = {
            'styles': [
              {
                'keyname': keyname,
                'type': type,
                'rules': [
                  ruleJson
                ]
              }
            ]
          }
        }
    }
  } else {
    // is number
    let ruleJsonArray = [];

    for (let index = 1; index <= count; index++) {
      const min = document.getElementById(`min-${index}`).value;
      const max = document.getElementById(`max-${index}`).value;
      min == '' ? emptyField = true : '';
      max == '' ? emptyField = true : '';
    }

    switch (emptyField) {
      case true:
        toastr.error('請輸入 Style Keyname / Type / Rule key / Range Min / Range Max ~');
        break;
      default:
        if (!checkRangeMinValueGreaterThanMaxValue() && !isOverlapRanges()) {
          for (let index = 1; index <= count; index++) {
            const color = document.getElementById(`color-${index}`).value;
            const min = document.getElementById(`min-${index}`).value;
            const max = document.getElementById(`max-${index}`).value;
            ruleJsonArray.push({
              'range': {
                'minimum': min,
                'exclusiveMaximum': max,
              },
              'color': color,
            })
          }
          jsonStyles = {
            'styles': [
              {
                'keyname': keyname,
                'type': type,
                'rules': ruleJsonArray
              }
            ]
          }
        }
    }
  }
}

function downloadJson() {
  jsonStyles = {};
  if (document.getElementById('blockly-json').checked) {
    if (count > 0 && document.getElementById('keyname').value != '') {
      toJson();
    } else {
      document.getElementById('keyname').value == '' ? toastr.error('目前尚未設定 Style Keyname ~') : '';
    }
  } else {
    document.getElementById('style-rules').value == '' ? jsonStyles = {} : jsonStyles = JSON.parse(document.getElementById('style-rules').value);
  }
  if (JSON.stringify(jsonStyles) != '{}') {
    const blob = new Blob([JSON.stringify(jsonStyles, undefined, 4)], { type: 'text/plain' });
    const e = document.createEvent('MouseEvents');
    const a = document.createElement('a');
    a.download = 'Style-Rules.json';
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  } else {
    toastr.error('目前尚未設定 Style Rules ~');
  }
}

function removeAllRules() {
  for (let i = 1; i <= count; i++) {
    document.getElementById(`field-${i}`).remove();
  }
  count = 0;
}

function uploadJson() {
  removeAllRules();
  const selectedFile = document.getElementById('upload-json').files[0];
  const reader = new FileReader();
  reader.readAsText(selectedFile, 'UTF-8');
  reader.onload = (evt) => {
    try {
      const keyname = JSON.parse(evt.target.result).styles[0].keyname;
      document.getElementById('keyname').value = keyname;
      if (document.getElementById('blockly-json').checked) {
        const type = JSON.parse(evt.target.result).styles[0].type;
        document.getElementById('types').value = type;
        const jsonKeyObj = JSON.parse(evt.target.result).styles[0].rules;
        for (let rule in jsonKeyObj) {
          if (type != 'number') {
            for (let key in jsonKeyObj[rule]) {
              switch (type) {
                case 'boolean':
                  addRule('boolean', key, jsonKeyObj[rule][key]);
                  break;
                case 'string':
                  addRule('string', key, jsonKeyObj[rule][key]);
                  break;
              }
            }
          } else {
            addRule('number', '', jsonKeyObj[rule]);
          }
        }
      } else {
        document.getElementById('style-rules').value = JSON.stringify(JSON.parse(evt.target.result), undefined, 4);
      }
    } catch (e) {
      toastr.error(`Incorrect JSON file format: ${JSON.stringify(e.message)}`);
    }
  };
}

function checkKeyIsExists() {
  for (let index = 1; index <= count; index++) {
    const keyJson = {};
    const key = document.getElementById(`input-${index}`).value;
    for (let i = 1; i <= count; i++) {
      if (i != index) {
        keyJson[document.getElementById(`input-${i}`).value] = '';
      }
    }
    if (key in keyJson) {
      return true;
    }
  }
  return false;
}

function checkRangeMinValueGreaterThanMaxValue() {
  for (let index = 1; index <= count; index++) {
    const min = document.getElementById(`min-${index}`).value;
    const max = document.getElementById(`max-${index}`).value;
    if (Number(min) > Number(max)) {
      toastr.error('Range Min 不能大於 Range Max ~');
      return true;
    }
  }
  return false;
}

function isOverlapRanges() {
  let isOverlap = false;
  let array = [];
  Array.from({ length: count }, (_, index) => {
    array.push([
      Number(document.getElementById(`min-${index + 1}`).value),
      Number(document.getElementById(`max-${index + 1}`).value)
    ]);
  });
  array
    .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; })
    .reduce(function (r, a) {
      let last = r[r.length - 1] || [];
      if (a[0] < last[1]) {
        if (last[1] <= a[1]) {
          // overlapping range
          last[1] = a[1];
          isOverlap = true;
          toastr.error('Range 重疊 ~');
        }
        return r;
      }
      return [a];
    }, []);
  return isOverlap;
}

function clickUploadJson() {
  document.getElementById('statesetId').value = '';
  document.getElementById('upload-json').value = '';
  document.getElementById('upload-json').click();
}

function setStyle() {
  document.getElementById('statesetId').value = '';
  mapPrimaryKey = document.getElementById('mapPrimaryKey').value;
  datasetId = document.getElementById('datasetId').value;
  setBtn = document.getElementById('set-style-btn');
  if (document.getElementById('write-json').checked) {
    document.getElementById('style-rules').value == '' ? jsonStyles = {} : jsonStyles = JSON.parse(document.getElementById('style-rules').value);
  }
  if (mapPrimaryKey == '' ||
    datasetId == '' ||
    jsonStyles == {}
  ) {
    toastr.error('請輸入 Map Primary Key、Dataset ID、Style Rules ~');
    setBtn.disabled = false;
    setBtn.innerText = '設定 Style';
  } else {
    if (document.getElementById('blockly-json').checked) {
      toJson();
    }
    JSON.stringify(jsonStyles) === '{}' ? '' : postFeatureStatesets();
  }
}

function postFeatureStatesets() {
  const postStylesURL = `${baseUrl}/featurestatesets?api-version=2.0&datasetId=${datasetId}&subscription-key=${mapPrimaryKey}`;
  document.getElementById('statesetId').value = '取得中';
  const loading = document.createElement('i');
  loading.className = 'fa fa-spinner fa-spin ml-10';
  loading.id = 'loading-label';
  document.getElementById('statesetLbl').appendChild(loading);
  try {
    axios.post(postStylesURL, jsonStyles)
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          statesetId = response.data.statesetId;
          document.getElementById('statesetId').value = statesetId;
          document.getElementById('loading-label').remove();
          toastr.success('Feature Statesets 設定成功 ~');
          setBtn.disabled = false;
          setBtn.innerText = '設定 Style';
        }
      })
      .catch(function (error) {
        console.log(error);
        toastr.error('Feature Statesets 設定失敗 ~');
        setBtn.disabled = false;
        setBtn.innerText = '設定 Style';
      });
  } catch (e) {
    toastr.error('Feature Statesets 設定失敗 ~');
    setBtn.disabled = false;
    setBtn.innerText = '設定 Style';
  }
}

function jsonEditorType(type) {
  removeAllRules();
  document.getElementById('keyname').value = '';
  document.getElementById('style-rules').value = '';
  document.getElementById('types').value = 'Types of stateset';
  switch (type) {
    case 'blockly':
      document.getElementById('json-form').style.display = 'block';
      document.getElementById('json-editor').style.display = 'none';
      break;
    case 'write':
      document.getElementById('json-form').style.display = 'none';
      document.getElementById('json-editor').style.display = 'block';
      break;
  }
}