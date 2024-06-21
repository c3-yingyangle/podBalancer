function fromIntegrationJson(o) {
  return Person.make({
    id: o["Assignee Email"],
    name: o["Assignee"],
    email: o["Assignee Email"],
    company: { id: "C3 AI" },
  });
}


function createPerson(spec) {

  // let companyHolidayCalendar = HolidayCalendar.forId(spec.companyHolidayCalendar).get('company');
  // let company = companyHolidayCalendar.company;


  return Person.make(spec).upsert();
}