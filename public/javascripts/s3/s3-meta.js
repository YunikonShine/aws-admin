function setJson(json) {
  ace.edit("editor", {
    mode: "ace/mode/json",
    selectionStyle: "text",
    theme: "ace/theme/monokai",
    value: JSON.stringify(json, null, 4),
  });
}

function deleteBucket(bucketName) {
  httpDelete(`/s3/${bucketName}`, {}, () => {
    window.location = "/s3";
  });
}
