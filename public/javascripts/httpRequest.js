function httpGet(url, success) {
  $.ajax({
    type: "GET",
    url,
    success,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function httpPost(url, data, success) {
  $.ajax({
    type: "POST",
    url,
    data: JSON.stringify(data),
    success,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function httpDelete(url, data, success) {
  $.ajax({
    type: "DELETE",
    url,
    data: JSON.stringify(data),
    success,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function httpPut(url, data, success) {
  $.ajax({
    type: "PUT",
    url,
    data: JSON.stringify(data),
    success,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
