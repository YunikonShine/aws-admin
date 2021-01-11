function save() {
  let container = $(".container");
  let bucket = {
    name: container.find("[name='bucket-name']").val(),
  };
  httpPost("/s3/bucket", bucket, () => {
    window.location = `/s3`;
  });
}
