function getDatesBetween(start, end) {
  var arr = [];
  for (
    var dt = new Date(start);
    dt <= new Date(end);
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(DateTime.fromMillis(dt.getTime()));
    // arr.push(dt.toISOString());
  }
  return arr;
}

function evalMetrics(spec) {
  var workstreamId = spec.ids[0];

  // Get allocated hours per day
  var allocationHours = Workstream.getWorkstreamAllocationHours(
    Workstream.forId(workstreamId),
    DateTime.fromString(spec.start),
    DateTime.fromString(spec.end)
  );

  // Get metric results
  var metricResult = Workstream.evalMetrics(spec);

  // Replace To Do future data with projected line
  var today = DateTime.now();
  var metricData = Js.toNativeObject(
    metricResult.result.get(workstreamId).get("TotalHoursToDo")._data
  );
  var dates = allocationHours.dates;
  var totalHoursToDo = metricData[metricData.length - 1];
  for (var i = 0; i < dates.length; i++) {
    var d = dates[i];
    if (d > today && i < metricData.length) {
      totalHoursToDo -= allocationHours.workstreamAllocationHours[i];
      metricData[i] = totalHoursToDo;
    }
  }

  // Update metricResult
  var tsInfo = TimeseriesInfo.make({
    start: spec.start,
    end: spec.end,
    interval: "DAY",
  });
  var ts = Timeseries.fromValues(tsInfo, metricData);
  return {
    result: metricResult.result.with(
      workstreamId,
      metricResult.result.get(workstreamId).with("TotalHoursToDo", ts)
    ),
    errors: metricResult.errors,
    translations: metricResult.translations,
  };
}
