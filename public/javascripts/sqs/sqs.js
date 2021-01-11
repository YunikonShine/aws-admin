$(document).ready(() => {
  let table = $("#tableList").DataTable({
    autoWidth: false,
  });
  table.columns.adjust().draw();
});

function purgeQueue(sqsName) {
  httpDelete(`/sqs/${sqsName}/message`, {}, () => {
    location.reload();
  });
}

function deleteQueue(sqsName) {
  httpDelete(`/sqs/${sqsName}`, {}, () => {
    location.reload();
  });
}