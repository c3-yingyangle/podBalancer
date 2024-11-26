function createWorkstreamAssignment(person, workstream, start, end, pctAllocation) { 
  return PersonToWorkstreamAssignment.make({
    id: `${person.id}_${workstream.id}_${start}_${end}_${pctAllocation}`,
    person: { id: person.id },
    workstream: { id: workstream.id },
    start: start, 
    end: end, 
    pctAllocation: pctAllocation
  }).upsert()
}