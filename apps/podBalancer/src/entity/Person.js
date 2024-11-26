function fromIntegrationJson(o) {
  return Person.make({
    id: o["Assignee Email"],
    name: o["Assignee"],
    email: o["Assignee Email"],
    company: { id: "C3 AI" }, // TODO: don't hardcode this
    holidayCalendar: { id: "C3 AI US" }, // TODO: don't hardcode this
  });
}
