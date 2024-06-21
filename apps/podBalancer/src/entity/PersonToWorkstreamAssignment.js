function createPersonAllocation(spec) {
  // spec.workstream = spec.workstream ? Workstream.forId(spec.workstream).get() : null;
  // spec.withWorkstream(Workstream.forId(spec.workstream))

  

  let person = Person.make({
    id: spec.person.name,
    name: spec.person.name,
    email: spec.person.email,
    // company: companyHolidayCalendar,
  })

  let personAllocationSpec = PersonToWorkstreamAssignment.builder()
    .v("person", person)
    .v("workstream", { id: spec["workstream"] })
    .v("start", spec["start"])
    .v("end", spec["end"])
    .v("allocation", spec["allocation"])
    .build();

  return personAllocationSpec.create()
}