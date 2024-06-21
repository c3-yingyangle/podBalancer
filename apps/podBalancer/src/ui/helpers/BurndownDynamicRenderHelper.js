function getChartConfig(workstreamId, interval) {
  if (!interval) interval = "DAY";

  if (workstreamId) {
    var workstream = Workstream.make(workstreamId).get();
    var chartConfig = generateChart(workstream, interval);
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

function generateChart(workstream, interval) {
  var chartStartDate = workstream.start;
  // TODO: set end date to the last datetime in all our timeseries
  var chartEndDate = workstream.end.plusDays(60);

  var workstreamDueDate = workstream.end;

  var metricFilter = Filter.eq("id", workstream.id);

  var chartConfig = {
    id: "PodBalancer.AnalysisBurndownChart_" + workstream.id + "_" + interval,
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
      noTimeZoneConversion: false,
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
        name: "Hours",
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
        dataType: "Workstream",
        yAxisFields: [
          {
            legendLabel: "Cumulative Total",
            metricName: "CumulativeHoursCreated",
            evaluateAction: "EVAL",
            entityId: workstream.id,
            color: "#0000ff",
            visualizationType: {
              type: "UiSdlTimeseriesLineBarChartLineVisualization",
              lineStyle: "Solid",
              smooth: false,
              showGradient: false,
            },
          },
          {
            legendLabel: "To Do",
            metricName: "TotalHoursToDo",
            evaluateAction: "EVAL",
            entityId: workstream.id,
            color: "#ff0000",
            visualizationType: {
              type: "UiSdlTimeseriesLineBarChartLineVisualization",
              lineStyle: "Solid",
              smooth: false,
              showGradient: false,
            },
          },
          {
            legendLabel: "Hours Completed",
            metricName: "HoursCompleted",
            evaluateAction: "EVAL",
            entityId: workstream.id,
            color: "#00ff00",
            visualizationType: {
              type: "UiSdlLineBarChartBarVisualization",
            },
          },
        ],
      },
    },
  };

  return chartConfig;
}
