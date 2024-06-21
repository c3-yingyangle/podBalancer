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
    arr.push(DateTime.fromMillis(dt.getTime()));
    // arr.push(dt.toISOString());
  }
  return arr;
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
        // Assuming an 8-hour work day
        allocationHours[d] = (a.allocation / 100) * 8;
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

  // Set hours to 0 on PTO/holiday days
  var timeOverrides = TimeOverride.fetch({
    filter: Filter.eq("person.id", person.id),
    limit: -1,
  }).objs;
  for (var i = 0; i < timeOverrides.length; i++) {
    var t = timeOverrides[i];
    var timeOverrideDates = getDatesBetween(t.start, t.end);

    // Set hours to 0 for days in this time override
    timeOverrideDates.forEach((d) => {
      if (d in allocationHours) {
        allocationHours[d] = 0;
      }
    });
  }

  return allocationHours;
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
