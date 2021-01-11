function save() {
  let container = $(".container");
  let queue = {
    name: container.find("[name='queue-name']").val(),
    delay: container.find("[name='queue-delay']").val(),
    retention: container.find("[name='queue-retention']").val(),
  };
  httpPost("/sqs/queue", queue, () => {
    window.location = `/sqs`;
  });
}
