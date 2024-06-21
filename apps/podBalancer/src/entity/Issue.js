function fromIntegrationJson(workstreamId, o) {
  let issue = Issue.builder()
    .v("id", [workstreamId, o["Key"]].join("_"))
    .v("name", o["Summary"])
    .v("assignee", o["Assignee"])
    .v("project", o["Key"].split("-")[0])
    .v("storyPoints", o["Custom field (Story point estimate)"])
    .v("status", o["Status"])
    .v("statusCategory", o["Status Category"])
    .v("resolution", o["Resolution Date"])
    .v("workstream", workstreamId)
    .v("issue", o["__issue"])
    .build();
  return issue;
}
