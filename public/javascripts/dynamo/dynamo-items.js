let keysCreate = [];

$(document).ready(() => {
  $("#tableItems").DataTable({
    dom:
      "<'row'<'col-sm-3'l><'col-sm-3'i><'col-sm-6'p>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'>",
    filter: false,
  });
  $("#tableItems").parent().addClass("table-wrapper");
});

function setQuery(query) {
  if (query) {
    JSON.parse(query.filter).forEach((element) => {
      addFilter(element);
    });
  }
}

function purgeTable(tableName) {
  httpDelete(`/dynamo/${tableName}/items`, null, () => {
    location.reload();
  });
}

function deleteTable(tableName) {
  httpDelete(`/dynamo/${tableName}`, null, () => {
    location.reload();
  });
}

function setKeys(keys) {
  for (const [key, value] of Object.entries(keys)) {
    keysCreate.push(key);
  }
}

function setUrl(url) {
  window.location = `${url}?keys=${keysCreate}`;
}

function addFilter(obj) {
  let div = document.createElement("div");
  let filter =
    '<div class="d-flex ml-3 mt-3 mb-3 form-row">' +
    '<button class="btn btn-danger mr-2" onClick=$(this).parent().parent().remove()>Remove</button>' +
    '<div class="key-size mr-3 ml-2 m-0 form-group">' +
    '<input placeholder="Key" class="form-control filter-key">' +
    "</div>" +
    '<div class="query-size mr-3 m-0 form-group">' +
    '<select class="form-control filter-type">' +
    '<option value="S">String</option>' +
    '<option value="N">Number</option>' +
    "</select>" +
    "</div>" +
    '<div class="query-size mr-3 m-0 form-group">' +
    '<select class="form-control filter-condition">' +
    '<option value="=">=</option>' +
    '<option value="<>">≠</option>' +
    '<option value=">=">&gt;=</option>' +
    '<option value="<=">&lt;=</option>' +
    '<option value=">">&gt;</option>' +
    '<option value="<">&lt;</option>' +
    "</select>" +
    "</div>" +
    '<div class="value-size m-0 form-group">' +
    '<input placeholder="Value" class="form-control filter-value">' +
    "</div>" +
    "</div>";
  div.innerHTML = filter.trim();

  if (obj) {
    $(div).find(".filter-key").val(obj.key);
    $(div).find(".filter-type").val(obj.type);
    $(div).find(".filter-condition").val(obj.condition);
    $(div).find(".filter-value").val(obj.value);
  }

  $("#filter").append(div);
}

function filter(tableName) {
  let jsonFilter = [];
  let hasAllFields = true;
  $("#filter")
    .children()
    .each(function () {
      let key = $(this).find(".filter-key");
      let value = $(this).find(".filter-value");
      if (!key.val()) {
        $(key).addClass("is-invalid");
        hasAllFields = false;
      } else {
        $(key).removeClass("is-invalid");
      }
      if (!value.val()) {
        $(value).addClass("is-invalid");
        hasAllFields = false;
      } else {
        $(value).removeClass("is-invalid");
      }
    });
  if (!hasAllFields) {
    return;
  }
  $("#filter")
    .children()
    .each(function () {
      jsonFilter.push({
        key: $(this).find(".filter-key").val(),
        value: $(this).find(".filter-value").val(),
        type: $(this).find(".filter-type").val(),
        condition: $(this).find(".filter-condition").val(),
      });
    });
  if (jsonFilter.length > 0) {
    window.location.search = "filter=" + JSON.stringify(jsonFilter);
  } else {
    window.location = `/dynamo/${tableName}`;
  }
}
