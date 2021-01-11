$(document).ready(() => {
  let table = $("#tableList").DataTable({
    autoWidth: false,
  });
  table.columns.adjust().draw();
});

function purgeTable(tableName) {
  httpDelete(`/dynamo/${tableName}/items`, {}, () => {
    location.reload();
  });
}

function deleteTable(tableName) {
  httpDelete(`/dynamo/${tableName}`, {}, () => {
    location.reload();
  });
}

function createTable() {
  window.location = "/dynamo/create";
}
