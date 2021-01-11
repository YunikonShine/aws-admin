$(document).ready(() => {
  let table = $("#tableList").DataTable({
    autoWidth: false,
  });
  table.columns.adjust().draw();
});

function purgeBucket(bucketName) {
  httpDelete(`/s3/${bucketName}/items`, {}, () => {
    location.reload();
  });
}

function deleteBucket(bucketName) {
  httpDelete(`/s3/${bucketName}`, {}, () => {
    location.reload();
  });
}

function createBucket() {
  window.location = "/s3/create";
}