function createWorkstream(spec) {
  return Workstream.make(spec).upsert();
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
