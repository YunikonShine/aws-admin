function addIndex() {
  let div = $("#secondaryIndex");
  let indexHTML =
    "<div>" +
    '<div class="row d-flex justify-content-between">' +
    '<label class="index-title">' +
    `Index - ${div.children().length + 1}` +
    "</label>" +
    '<button type="button" class="btn btn-danger mr-3" onClick="removeIndex(this)">Remove index</button>' +
    "</div>" +
    '<div class="row">' +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Index name</label>" +
    '<input name="index-name" class="form-control">' +
    "</div>" +
    "</div>" +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Index type</label>" +
    '<select name="index-type" class="form-control">' +
    '<option value="GSI">Global Secondary Index (GSI)</option>' +
    '<option value="LSI">Local Secondary Index (LSI)</option>' +
    "</select>" +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="row">' +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Hash attribute name</label>" +
    '<input name="hash-name" class="form-control">' +
    "</div>" +
    "</div>" +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Hash attribute type</label>" +
    '<select name="hash-type" class="form-control">' +
    "<option>" +
    "</option>" +
    '<option value="S">String</option>' +
    '<option value="N">Number</option>' +
    '<option value="B">Binary</option>' +
    "</select>" +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="row"><div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Range attribute name (Optional)</label>" +
    '<input name="range-name" class="form-control">' +
    "</div>" +
    "</div>" +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Range attribute type (Optional)</label>" +
    '<select name="range-type" class="form-control">' +
    "<option>" +
    "</option>" +
    '<option value="S">String</option>' +
    '<option value="N">Number</option>' +
    '<option value="B">Binary</option>' +
    "</select>" +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="row">' +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Read capacity units</label>" +
    '<input type="number" min="1" value="3" name="read-capacity" class="form-control">' +
    "</div>" +
    "</div>" +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    "<label>Write capacity units</label>" +
    '<input type="number" min="1" value="3" name="write-capacity" class="form-control">' +
    "</div>" +
    "</div>" +
    "</div>" +
    "<hr>" +
    "</div>";
  $("#secondaryIndex").append(indexHTML);
}

function removeIndex(item) {
  $(item).parent().parent().remove();
}

function getIndexObject() {
  let globalIndex = [];
  let localIndex = [];
  let div = $("#secondaryIndex");
  div.children().each((i, item) => {
    let index = $(item);
    let indexObject = {
      name: index.find("[name='index-name']").val(),
      hashName: index.find("[name='hash-name']").val(),
      hashType: index.find("[name='hash-type']").val(),
      rangeName: index.find("[name='range-name']").val(),
      rangeType: index.find("[name='range-type']").val(),
      read: index.find("[name='read-capacity']").val(),
      write: index.find("[name='write-capacity']").val(),
    };
    switch (index.find("[name='index-type']").val()) {
      case "GSI":
        globalIndex.push(indexObject);
        break;
      case "LSI":
        localIndex.push(indexObject);
        break;
      default:
        break;
    }
  });
  return { globalIndex, localIndex };
}

function save() {
  let container = $(".container");
  let table = {
    name: container.find("[name='table-name']").val(),
    hashName: container.find("[name='table-hash-name']").val(),
    hashType: container.find("[name='table-hash-type']").val(),
    rangeName: container.find("[name='table-range-name']").val(),
    rangeType: container.find("[name='table-range-type']").val(),
    read: container.find("[name='table-read']").val(),
    write: container.find("[name='table-write']").val(),
    indexes: getIndexObject(),
  };
  httpPost("/dynamo/table", table, () => {
    window.location = `/dynamo`;
  });
}
