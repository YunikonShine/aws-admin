function setJson(json) {
  editor = ace.edit("editor", {
    mode: "ace/mode/json",
    selectionStyle: "text",
    theme: "ace/theme/monokai",
    value: JSON.stringify(json, null, 4),
  });
}

function setUrl(url) {
  window.location = url;
}
