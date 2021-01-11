let table;

$(document).ready(() => {
  table = $("#tableList").DataTable({
    autoWidth: false,
  });
  table.columns.adjust().draw();
});

function upload() {
  $("#file").click();
}

$("#file").change(() => {
  uploadFile();
});

function uploadFile() {
  if ($("#file").prop("files")[0]) {
    let bucket = window.location.toString().split("/").pop();
    let fileReader = new FileReader();
    fileReader.onload = function () {
      let name = $("#file").prop("files")[0].name;
      let data = fileReader.result;
      let uploadObject = {
        file: data,
        name: name,
      };

      let existingItems = [];
      table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        existingItems.push(data[0].split('">').pop().split("<")[0]);
      });
      if (existingItems.find((i) => i === name)) {
        if (
          confirm(
            "There is already a file with that name, do you want to overwrite it?"
          )
        ) {
          httpPut(`/s3/${bucket}/item`, uploadObject, () => {
            location.reload();
          });
        } else {
          $("#file").val("");
        }
      } else {
        httpPut(`/s3/${bucket}/item`, uploadObject, () => {
          location.reload();
        });
      }
    };
    fileReader.readAsDataURL($("#file").prop("files")[0]);
  }
}

function deleteItem(itemName) {
  let bucket = window.location.toString().split("/").pop();
  httpDelete(`/s3/${bucket}/item/${itemName}`, {}, () => {
    location.reload();
  });
}

function setUrl(url) {
  window.location = url;
}