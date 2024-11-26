function createWorkstream(spec) {
  return Workstream.make(spec).upsert();
}

function getDatesBetween(start, end) {
  var arr = [];
  for (
    var dt = new Date(start);
    dt <= new Date(end);
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(DateTime.fromMillis(dt.getTime()).withTime(0, 0, 0, 0).withoutZone());
    // arr.push(dt.toISOString());
  }
  return arr;
}

function getPersonAllocationPct(person, workstream, start, end) {
  var dates = getDatesBetween(start, end);

  // Initialize with 0 pct for every day in this date range
  var allocationPcts = {};
  dates.forEach((d) => (allocationPcts[d] = 0));

  // Set allocation pct for every day in this date range
  var allocationAssignments = PersonToWorkstreamAssignment.fetch({
    filter: Filter.eq("workstream.id", workstream.id)
      .and()
      .eq("person.id", person.id),
    limit: -1,
  }).objs;
  for (var i = 0; i < allocationAssignments.length; i++) {
    var a = allocationAssignments[i];
    var timeOverrideDates = getDatesBetween(a.start, a.end);

    // Set allocation pct for days in this allocation assignment
    timeOverrideDates.forEach((d) => {
      if (d in allocationPcts) {
        allocationPcts[d] = a.pctAllocation;
      }
    });
  }

  return allocationPcts;
}

function getPersonAllocationHours(person, workstream, start, end) {
  var dates = getDatesBetween(start, end);

  // Initialize with 0 hours for every day in this date range
  var allocationHours = {};
  dates.forEach((d) => (allocationHours[d] = 0));

  // Set allocation hours for every day in this date range
  var allocationAssignments = PersonToWorkstreamAssignment.fetch({
    filter: Filter.eq("workstream.id", workstream.id)
      .and()
      .eq("person.id", person.id),
    limit: -1,
  }).objs;
  for (var i = 0; i < allocationAssignments.length; i++) {
    var a = allocationAssignments[i];
    var timeOverrideDates = getDatesBetween(a.start, a.end);

    // Set hours to allocation pct for days in this allocation assignment
    timeOverrideDates.forEach((d) => {
      if (d in allocationHours) {
        allocationHours[d] = a.pctAllocation * workstream.hoursPerStoryPoint;
      }
    });
  }

  // Set hours to 0 on weekend days
  for (var i = 0; i < dates.length; i++) {
    var d = dates[i];
    // Check weekend
    if (d.dayOfWeek > 5) {
      allocationHours[d] = 0;
    }
  }

  // Set hours to 0 on PTO days
  var ptoDays = PtoDay.fetch({
    filter: Filter.eq("person.id", person.id),
    limit: -1,
  }).objs;
  for (var i = 0; i < ptoDays.length; i++) {
    var pto = ptoDays[i];
    var timeOverrideDates = getDatesBetween(pto.start, pto.end);

    // Set hours to 0 for days in this time override
    timeOverrideDates.forEach((d) => {
      if (d in allocationHours) {
        // Assuming 8-hour work day
        allocationHours[d] = 8 - (8 * pto.pctOfDay);
      }
    });
  }

  // Set hours to 0 on holidays
  var holidays = Holiday.fetch({
    filter: Filter.eq('calendar.company.id', person.company.id),
    limit: -1,
  }).objs;
  for (var i = 0; i < holidays.length; i++) {
    var hd = holidays[i].date.withTime(0, 0, 0, 0).withoutZone()

    // Set hours to 0 for this holiday
    if (hd in allocationHours) {
      allocationHours[hd] = 0;
    }
  }

  return allocationHours;
}

function getWorkstreamAllocationPct(workstream, start, end) {
  // Get all persons allocated to this workstream at some point
  var persons = Person.fetch({
    filter: Filter.intersects("assignments.workstream.id", workstream.id),
    limit: -1,
  }).objs;
  if (!persons) return;

  // For each person, get their allocation hours for this workstream in this time range
  var personAllocationPcts = {};
  persons.each((p) => {
    personAllocationPcts[p.id] = getPersonAllocationPct(
      p,
      workstream,
      start,
      end
    );
  });
  if (!personAllocationPcts) return;

  // Helper function to sum an array of arrays
  function sumArrays(arrays) {
    const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
    const result = Array.from({ length: n });
    return result.map((_, i) =>
      arrays.map((xs) => xs[i] || 0).reduce((sum, x) => sum + x, 0)
    );
  }

  // Add up pct across all persons
  var pctListPerPerson = Object.values(personAllocationPcts).map((x) =>
    Object.values(x)
  );
  var workstreamAllocationPct = sumArrays(pctListPerPerson);

  return {
    workstreamAllocationPct: workstreamAllocationPct,
    dates: Object.keys(personAllocationPcts[persons[0]]),
  };
}

function getWorkstreamAllocationHours(workstream, start, end) {
  // Get all persons allocated to this workstream at some point
  var persons = Person.fetch({
    filter: Filter.intersects("assignments.workstream.id", workstream.id),
    limit: -1,
  }).objs;
  if (!persons) return;

  // For each person, get their allocation hours for this workstream in this time range
  var personAllocationHours = {};
  persons.each((p) => {
    personAllocationHours[p.id] = getPersonAllocationHours(
      p,
      workstream,
      start,
      end
    );
  });
  if (!personAllocationHours) return;

  // Helper function to sum an array of arrays
  function sumArrays(arrays) {
    const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
    const result = Array.from({ length: n });
    return result.map((_, i) =>
      arrays.map((xs) => xs[i] || 0).reduce((sum, x) => sum + x, 0)
    );
  }

  // Add up hours across all persons
  var hoursListPerPerson = Object.values(personAllocationHours).map((x) =>
    Object.values(x)
  );
  var workstreamAllocationHours = sumArrays(hoursListPerPerson);

  return {
    workstreamAllocationHours: workstreamAllocationHours,
    dates: Object.keys(personAllocationHours[persons[0]]),
  };
}

/**
 * @this {Workstream}
 */
function refreshIssues(limit) {
  let _this = this.getMissing(GetMissingSpec.make({ include: "query" }));
  let issuesObjs = JiraIntegration.queryIssues(_this.query, limit);
  let issues = _.map(issuesObjs, function (o) {
    return Issue.fromIntegrationJson(_this.id, o);
  });

  // Also create people here.
  let person = _.chain(issuesObjs)
    .map((o) => {
      return {
        Assignee: o["Assignee"],
        "Assignee Email": o["Assignee Email"],
      };
    })
    .filter((o) => {
      return o["Assignee Email"] && o["Assignee"];
    })
    .uniq(undefined, (o) => {
      return JSON.stringify(o);
    })
    .map((o) => {
      return Person.fromIntegrationJson(o);
    })
    .value();
  Person.mergeBatch(person);

  // For now, remove all issues for this workstream.
  Issue.removeAll(
    RemoveAllSpec.make({ filter: Filter.eq("workstream.id", this.id) }),
    true
  );

  return Issue.upsertBatch(issues)?.count();
}

function getExpectedHoursCompleted(obj, spec, metric) {
  var workstream = Workstream.forId(obj.id)
  var allocationHours = getWorkstreamAllocationHours(workstream, spec.start, spec.end)

  return Timeseries.make({
    _kind: 'REGULAR',
    _data: allocationHours.workstreamAllocationHours,
    unit: {
      id: 'dimensionless'
    },
    tsInfo: {
      start: spec.start.withTime(0, 0, 0, 0),
      end: spec.end.withTime(0, 0, 0, 0),
      interval: 'DAY',
      _size: allocationHours.workstreamAllocationHours.length,
      timeZone: 'NONE',
      sourceInfo: {
        expr: metric.id,
        source: {
          id: obj.id
        }
      }
    }
  })
}

function getExpectedPointsCompleted(obj, spec, metric) {
  var workstream = Workstream.forId(obj.id)
  var allocationHours = getWorkstreamAllocationHours(workstream, spec.start, spec.end)

  return Timeseries.make({
    _kind: 'REGULAR',
    _data: allocationHours.workstreamAllocationHours.map(x => x / 8),
    unit: {
      id: 'dimensionless'
    },
    tsInfo: {
      start: spec.start.withTime(0, 0, 0, 0),
      end: spec.end.withTime(0, 0, 0, 0),
      interval: 'DAY',
      _size: allocationHours.workstreamAllocationHours.length,
      timeZone: 'NONE',
      sourceInfo: {
        expr: metric.id,
        source: {
          id: obj.id
        }
      }
    }
  })
}

function getTotalHoursCreated(obj, spec, metric) {
  var workstream = Workstream.forId(obj.id)

  // Get start from Issue with earliest created date
  var start = Issue.fetch({
    filter: Filter.eq('workstream.id', obj.id), 
    order: 'ascending(dateCreated)',
    limit:1,
  }).objs[0].dateCreated

  // Evaluate
  var newSpec = EvalMetricSpec.make({
    expression: "rolling('SUM', HoursCreated)",
    id: obj.id,
    start: DateTime.fromString(start).withTime(0, 0, 0, 0).withoutZone(),
    end: spec.end.withTime(0, 0, 0, 0).withoutZone(),
    interval: "DAY",
    timeZone: 'NONE',
  })
  var metricResult = Workstream.evalMetric(newSpec)

  var deltaDays = DateTime.deltaSeconds(start, spec.start) / 86400
  var data = deltaDays > 0 ? metricResult._data.slice(deltaDays,) : metricResult._data

  return Timeseries.make({
    _kind: 'REGULAR',
    _data: data,
    unit: {
      id: 'dimensionless'
    },
    tsInfo: {
      start: spec.start.withTime(0, 0, 0, 0),
      end: spec.end.withTime(0, 0, 0, 0),
      interval: 'DAY',
      _size: data.length,
      timeZone: 'NONE',
      sourceInfo: {
        expr: metric.id,
        source: {
          id: obj.id
        }
      }
    }
  })
}

function getTotalHoursCompleted(obj, spec, metric) {
  // Get start from Issue with earliest completed date
  var start = Issue.fetch({
    filter: Filter.eq('workstream.id', obj.id), 
    order: 'ascending(dateCompleted)',
    limit:1,
  }).objs[0].dateCompleted

  // Evaluate
  var newSpec = EvalMetricSpec.make({
    expression: "rolling('SUM', ActualHoursCompleted)",
    id: obj.id,
    start: DateTime.fromString(start).withTime(0, 0, 0, 0).withoutZone(),
    end: spec.end.withTime(0, 0, 0, 0).withoutZone(),
    interval: "DAY",
    timeZone: 'NONE',
  })
  var metricResult = Workstream.evalMetric(newSpec)
  // return metricResult

  var deltaDays = DateTime.deltaSeconds(DateTime.fromString(start).withTime(0, 0, 0, 0).withoutZone(), spec.start.withTime(0, 0, 0, 0).withoutZone()) / 86400
  var data = deltaDays > 0 ? metricResult._data.slice(deltaDays,) : metricResult._data

  return Timeseries.make({
    _kind: 'REGULAR',
    _data: data,
    unit: {
      id: 'dimensionless'
    },
    tsInfo: {
      start: spec.start.withTime(0, 0, 0, 0).withoutZone(),
      end: spec.end.withTime(0, 0, 0, 0).withoutZone(),
      interval: 'DAY',
      _size: data.length,
      timeZone: 'NONE',
      sourceInfo: {
        expr: metric.id,
        source: {
          id: obj.id
        }
      }
    }
  })
}
