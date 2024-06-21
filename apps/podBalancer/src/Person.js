function fromIntegrationJson(o) {
  return Person.make({
    id: o["Assignee Email"],
    name: o["Assignee"],
    email: o["Assignee Email"],
    company: { id: "C3 AI" },
  });
}
