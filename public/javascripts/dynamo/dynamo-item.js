let editor;

function setJson(json) {
  editor = ace.edit("editor", {
    mode: "ace/mode/json",
    selectionStyle: "text",
    theme: "ace/theme/monokai",
    value: JSON.stringify(json, null, 4),
  });
}

function hasJsonError() {
  let errors = editor.getSession().getAnnotations();
  if (errors.length > 0) {
    let rows = errors.map((i) => i.row + 1);
    $("#erro-message").html(`JSON has error at row - ${rows}`);
    return true;
  } else {
    $("#erro-message").html("");
    return false;
  }
}

function hasDynamoKey(data, keys) {
  let doesntHasKey = false;
  let doesntHasKeyList = [];
  keys.forEach((key) => {
    if (!data[key]) {
      doesntHasKey = true;
      doesntHasKeyList.push(key);
    }
  });
  if (doesntHasKey) {
    $("#erro-message").html(
      `JSON does't contains keys or values - ${doesntHasKeyList.join(", ")}`
    );
    return false;
  } else {
    $("#erro-message").html();
    return true;
  }
}

function saveItem(table) {
  if (!hasJsonError()) {
    let keyList = queryStringToJSON(
      window.location.search.slice(1, window.location.search.length)
    );

    let keys = keyList.keys
      ? keyList.keys.split(",")
      : Object.keys(keyList).filter((i) => i !== "");

    const jsonToSend = {
      data: JSON.parse(editor.getValue()),
      keys,
    };
    if (hasDynamoKey(jsonToSend.data, jsonToSend.keys)) {
      httpPut(`/dynamo/${table}`, jsonToSend, (res) => {
        window.location = `/dynamo/${table}/item?${res}`;
      });
    }
  }
}

function deleteItem(table) {
  let sendKey = queryStringToJSON(
    window.location.search.slice(1, window.location.search.length - 1)
  );
  httpDelete(`/dynamo/${table}/item`, sendKey, () => {
    window.location = `/dynamo/${table}`;
  });
}

function queryStringToJSON(qs) {
  qs = qs || location.search.slice(1);

  var pairs = qs.split("&");
  var result = {};
  pairs.forEach(function (p) {
    var pair = p.split("=");
    var key = pair[0];
    var value = decodeURIComponent(pair[1] || "");

    if (result[key]) {
      if (Object.prototype.toString.call(result[key]) === "[object Array]") {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });

  return JSON.parse(JSON.stringify(result));
}
