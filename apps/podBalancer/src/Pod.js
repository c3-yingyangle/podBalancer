function getHeaderStats() {
  let workstreams = Workstream.fetch(
    FetchSpec.make({
      include: "end, hoursCompleted, hoursRemaining",
    })
  ).objs;

  let totalHoursCompleted = 0;
  let totalHoursRemaining = 0;
  let nextDeliverable = null;

  _.map(workstreams, function (ws) {
    totalHoursCompleted += ws.hoursCompleted ?? 0;
    totalHoursRemaining += ws.hoursRemaining ?? 0;
    if (!nextDeliverable || nextDeliverable > ws.end) {
      nextDeliverable = ws.end;
    }
  });

  return {
    totalHoursCompleted: Math.round(totalHoursCompleted) + " hrs",
    totalHoursRemaining: Math.round(totalHoursRemaining) + " hrs",
    nextDeliverable: nextDeliverable
      ? nextDeliverable.format("yyyy-MM-dd")
      : "",
  };
}
