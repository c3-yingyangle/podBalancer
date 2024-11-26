function createPtoDay(person, start, end, pctOfDay) { 
  return PtoDay.make({
    id: `${person.id}_${start}_${end}_${pctOfDay}`,
    person: { id: person.id },
    start: start, 
    end: end, 
    pctOfDay: pctOfDay
  }).upsert()
}