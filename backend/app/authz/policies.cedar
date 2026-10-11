// AIQ Cedar policies. Source of truth for Amazon Verified Permissions.
// app/authz/__init__.py is the local mirror — keep both in sync.
// Entity shape: User {id, role: principal|teacher|parent|student|authority,
// schoolId, children: [studentId], class}; Resource: School{id} | Student{id, schoolId, class}.

permit(
  principal is User when { principal.role == "authority" },
  action,
  resource
);

permit(
  principal is User when {
    principal.role == "principal" &&
    resource.schoolId == principal.schoolId
  },
  action in [Action::"view-briefing", Action::"publish-protocol"],
  resource is School
);

permit(
  principal is User when {
    principal.role == "teacher" &&
    resource.schoolId == principal.schoolId &&
    resource.class == principal.class
  },
  action == Action::"report-uneasy",
  resource is Student
);

// Parents/students: own children only. No school-level reads.
permit(
  principal is User when {
    (principal.role == "parent" || principal.role == "student") &&
    resource.id in principal.children
  },
  action == Action::"report-uneasy",
  resource is Student
);

forbid(
  principal is User when {
    principal.role == "teacher" ||
    principal.role == "parent" ||
    principal.role == "student"
  },
  action in [Action::"view-briefing", Action::"publish-protocol"],
  resource is School
);
