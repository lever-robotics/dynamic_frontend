query SearchMetadata($searchTerm: String!) {
    individualCollection(
        filter: {
            _or: [
                { first_name: { ilike: $searchTerm } }
                { last_name: { ilike: $searchTerm } }
                { phone_number: { ilike: $searchTerm } }
                { age: { ilike: $searchTerm } }
                { email: { ilike: $searchTerm } }
                { birth_day: { ilike: $searchTerm } }
                { address: { ilike: $searchTerm } }
                { gender: { ilike: $searchTerm } }
                { notes: { ilike: $searchTerm } }
                { prp_record: { ilike: $searchTerm } }
                { waiver_record: { ilike: $searchTerm } }
            ]
        }
    ) {
        edges {
            node {
                first_name
                last_name
                phone_number
                age
                email
                birth_day
                address
                gender
                notes
                prp_record
                waiver_record
            }
        }
    }
    volunteerCollection(
        filter: {
            _or: [
                { first_name: { ilike: $searchTerm } }
                { last_name: { ilike: $searchTerm } }
                { email: { ilike: $searchTerm } }
                { birth_day: { ilike: $searchTerm } }
                { address: { ilike: $searchTerm } }
                { phone_number: { ilike: $searchTerm } }
                { emergency_contact_name: { ilike: $searchTerm } }
                { experiance_asl: { ilike: $searchTerm } }
                { previous_experience: { ilike: $searchTerm } }
                { volunteer_form: { ilike: $searchTerm } }
            ]
        }
    ) {
        edges {
            node {
                first_name
                last_name
                email
                birth_day
                address
                phone_number
                emergency_contact_name
                experiance_asl
                previous_experience
                volunteer_form
            }
        }
    }
    staffCollection(
        filter: {
            _or: [
                { name: { ilike: $searchTerm } }
                { phone_number: { ilike: $searchTerm } }
                { email: { ilike: $searchTerm } }
                { staff_form: { ilike: $searchTerm } }
            ]
        }
    ) {
        edges {
            node {
                name
                phone_number
                email
                staff_form
            }
        }
    }
    groupsCollection(
        filter: {
            _or: [
                { name: { ilike: $searchTerm } }
                { purpose: { ilike: $searchTerm } }
            ]
        }
    ) {
        edges {
            node {
                name
                purpose
            }
        }
    }
}
