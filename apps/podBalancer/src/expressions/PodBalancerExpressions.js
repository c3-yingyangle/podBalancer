function calcWorkstreamHoursRemaining(workstreamId) {
  let ws = Workstream.make({ id: workstreamId }).get("this, hoursRemaining");

  if (!ws.end) return undefined;

  try {
    var allocationHours = Workstream.getWorkstreamAllocationHours(
      ws,
      DateTime.now(),
      ws.end
    );
  } catch (e) {
    return undefined;
  }
  let sum = _.reduce(
    allocationHours.workstreamAllocationHours,
    (acc, v) => {
      return acc + v;
    },
    0
  );
  return Math.round((ws.hoursRemaining ?? 0) - (sum ?? 0));
}

function getDateAsString(dt) {
  if (dt) return dt.format("MM/dd/yyyy");
  return "";
}

function deltaDays(dt1, dt2) {
  if (dt1 && dt2) return DateTime.deltaMillis(dt1, dt2) / 86400000;
}
