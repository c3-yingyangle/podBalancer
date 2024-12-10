const round = (num) => Math.round(num * 100) / 100

function getBurndownChartConfig(workstreamId, interval) {
  if (!interval) interval = "DAY";

  if (workstreamId) {
    var workstream = Workstream.make(workstreamId).get();
    var chartConfig = generateBurndownChart(workstream, interval);
  } else {
    chartConfig = generateEmptyState();
  }
  return { children: [chartConfig] };
}

function generateEmptyState() {
  var chartConfig = {
    id: "PodBalancer.AnalysisBurndownChart_EmptyState",
    type: "UiSdlConnected<UiSdlEmptyState>",
    component: {
      headerText: {
        dynamicValue: "Select a Workstream to analyze.",
      },
    },
  };

  return chartConfig;
}

function generateBurndownChart(workstream, interval) {
  var chartStartDate = workstream.start;
  // TODO: set end date to the last datetime in all our timeseries
  var chartEndDate = workstream.end.plusDays(30);

  var workstreamDueDate = workstream.end;

  var chartConfig = {
    id: "PodBalancer.AnalysisBurndownChart_" + workstream.id + '_' + DateTime.now().millis,
    type: "UiSdlConnected<UiSdlTimeseriesLineBarChart>",
    component: {
      wrapWithMetadataId: true,
      header: {
        title: "Burndown Chart",
      },
      dataZoom: false,
      yAxisDataZoom: false,
      zoomEnabled: false,
      dataSelection: false,
      tooltipEnabled: true,
      tooltipValuesDecimalPrecision: 2,
      noTimeZoneConversion: true,
      // hideMissingDataPoints: true,
      backgroundStyle: "FULL_GRID",
      xAxis: {
        type: "UiSdlTimeseriesLineBarChartXAxisStaticConfig",
        name: "Days",
        interval: interval,
        startDate: chartStartDate,
        endDate: chartEndDate,
      },
      yAxis: {
        name: "Story Points",
        nameGap: 20,
        min: 0,
      },
      legend: {
        legendLayout: "HORIZONTAL",
        legendPosition: "BELOW_CHART",
      },
      showNowLine: true,
      dateLines: [
        {
          type: "UiSdlTimeseriesLineBarChartDateLineConfig",
          color: "ORANGE",
          lineStyle: "dotted",
          legendLabel: "Due Date",
          lineWidth: "1",
          date: workstreamDueDate,
        },
      ],
      dataSpec: {
        dataType: "BurndownUiHelper",
        yAxisFields: [
          // {
          //   legendLabel: "Cumulative Total",
          //   metricName: "CumulativeHoursCreated",
          //   evaluateAction: "EVAL",
          //   entityId: workstream.id,
          //   color: "#0000ff",
          //   visualizationType: {
          //     type: "UiSdlTimeseriesLineBarChartLineVisualization",
          //     lineStyle: "Solid",
          //     smooth: false,
          //     showGradient: false,
          //   },
          // },
          {
            legendLabel: "Actual Points Remaining",
            metricName: "TotalActualPointsRemaining",
            evaluateAction: "EVAL",
            entityId: workstream.id,
            color: "#f2950a", // blue
            visualizationType: {
              type: "UiSdlTimeseriesLineBarChartLineVisualization",
              lineStyle: "Solid",
              smooth: false,
              showGradient: false,
            },
          },
          {
            legendLabel: "Expected Points Remaining",
            metricName: "TotalExpectedPointsRemaining",
            evaluateAction: "EVAL",
            entityId: workstream.id,
            color: "#228630", // green
            visualizationType: {
              type: "UiSdlTimeseriesLineBarChartLineVisualization",
              lineStyle: "Solid",
              smooth: false,
              showGradient: false,
            },
          },
          // {
          //   legendLabel: "Actual Points Completed",
          //   metricName: "ActualPointsCompleted",
          //   evaluateAction: "EVAL",
          //   entityId: workstream.id,
          //   color: "#00ff00",
          //   visualizationType: {
          //     type: "UiSdlLineBarChartBarVisualization",
          //   },
          // },
          // {
          //   legendLabel: "Expected Hours Completed",
          //   metricName: "ExpectedHoursCompleted",
          //   evaluateAction: "EVAL",
          //   entityId: workstream.id,
          //   color: "#0000ff",
          //   visualizationType: {
          //     type: "UiSdlLineBarChartBarVisualization",
          //   },
          // },
        ],
      },
    },
  };

  return chartConfig;
}

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
  var workstream = Workstream.forId(workstreamId)

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
    metricResult.result.get(workstreamId).get("TotalActualPointsRemaining")._data
  );
  var dates = allocationHours.dates;
  var totalPointsRemaining = metricData[metricData.length - 1];
  for (var i = 0; i < dates.length; i++) {
    var d = dates[i];
    if (d > today && i < metricData.length) {
    totalPointsRemaining -= allocationHours.workstreamAllocationHours[i] / workstream.hoursPerStoryPoint;
      metricData[i] = totalPointsRemaining;
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
      metricResult.result.get(workstreamId).with("TotalActualPointsRemaining", ts)
    ),
    errors: metricResult.errors,
    translations: metricResult.translations,
  };
}

function getBurndownDataGrid(workstream) {
  workstream = Workstream.forId(workstream.id)
  var start = workstream.start
  var end = workstream.end
  var dates = getDatesBetween(start, end)

  var objs = []
  var i = 0

  // FTE allocation
  var ftes = Workstream.getWorkstreamAllocationPct(workstream, start, end).workstreamAllocationPct

  // Evaluate result
  var spec = EvalMetricsSpec.make({
    start: start,
    end: end,
    interval: "DAY",
    timeZone: "NONE",
    ids: [ workstream.id ],
    expressions: [
      "ActualPointsCompleted",
      "ExpectedPointsCompleted",
      "TotalActualPointsRemaining",
      "TotalExpectedPointsRemaining",
    ],
  })
  var metricResult = Workstream.evalMetrics(spec)

  var actualPointsCompleted = metricResult.result.get(workstream.id).get('ActualPointsCompleted')._data
  var expectedPointsCompleted = metricResult.result.get(workstream.id).get('ExpectedPointsCompleted')._data
  var totalActualPointsRemaining = metricResult.result.get(workstream.id).get('TotalActualPointsRemaining')._data
  var totalExpectedPointsRemaining = metricResult.result.get(workstream.id).get('TotalExpectedPointsRemaining')._data

  // By week
  var now = DateTime.now()
  var currentWeek = {}
  for (var i=0; i< dates.length; i++) {
    var d = dates[i]

    // If it's a Monday, start a new week
    if (d.dayOfWeek == 1 || i == dates.length - 1) {
      if (Object.keys(currentWeek).length) {
        // Add units and push previous week to objs array
        currentWeek.numEngineers = round(Math.max.apply(null, currentWeek.numEngineers)) + ' FTE'
        currentWeek.numPointsBehind = round(currentWeek.numPointsRemainingActual - currentWeek.numPointsRemainingExpected) + ' pts'
        currentWeek.numPointsBehindStatus = currentWeek.numPointsRemainingActual - currentWeek.numPointsRemainingExpected > 0 ? 'Red' : (currentWeek.numPointsRemainingActual - currentWeek.numPointsRemainingExpected < 0 ? 'Green' : 'Blue')
        currentWeek.numPointsCompletedActual = round(currentWeek.numPointsCompletedActual) + ' pts'
        currentWeek.numPointsCompletedExpected = round(currentWeek.numPointsCompletedExpected) + ' pts'
        currentWeek.numPointsRemainingActual = round(currentWeek.numPointsRemainingActual) + ' pts'
        currentWeek.numPointsRemainingExpected = round(currentWeek.numPointsRemainingExpected) + ' pts'
        objs.push(currentWeek)
      }

      // Start new week
      currentWeek = {
        id: objs.length + 1,
        date: d.format("MM/dd") + ' - ' + d.plusDays(6).format("MM/dd"),
        status: d > now ? 'Future' : (d < now && d.plusDays(6) > now ? 'Current' : 'Past'),
        numPointsCompletedActual: actualPointsCompleted[i],
        numPointsCompletedExpected: expectedPointsCompleted[i],
        numPointsRemainingActual: totalActualPointsRemaining[i],
        numPointsRemainingExpected: totalExpectedPointsRemaining[i],
        changeInScope: 0,
        numEngineers: [ftes[i]]
      }
    } else {
      currentWeek.numPointsCompletedActual += actualPointsCompleted[i]
      currentWeek.numPointsCompletedExpected += expectedPointsCompleted[i]
      // currentWeek.numPointsRemainingActual += totalActualPointsRemaining[i]
      // currentWeek.numPointsRemainingExpected += totalExpectedPointsRemaining[i]
      currentWeek.numEngineers.push(ftes[i])
    }
  }

  return {
    objs: objs,
    count: objs.length,
  }
}