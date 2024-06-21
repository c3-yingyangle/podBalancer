/**
 * @this {Workstream}
 */
function refreshIssues(limit) {
  let _this = this.getMissing(GetMissingSpec.make({ include: "query" }));
  let issuesObjs = JiraIntegration.queryIssues(_this.query, limit);
  let issues = _.map(issuesObjs, function (o) {
    return Issue.fromIntegrationJson(_this.id, o);
  });

  return Issue.upsertBatch(issues)?.count();
}
