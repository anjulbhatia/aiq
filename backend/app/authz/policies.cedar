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

// Morning briefing agents: principals own school; teachers own school with
// class-scoped context; parents/students own school with children-scoped
// context (builders enforce the scoping, never the model).
permit(
  principal is User when {
    principal.role == "teacher" && resource.id == principal.schoolId
  },
  action == Action::"run-briefing",
  resource is School
);
permit(
  principal is User when {
    (principal.role == "parent" || principal.role == "student") &&
    resource.id == principal.schoolId
  },
  action == Action::"run-briefing",
  resource is School
);

// Day log: teachers own class, parents own children, principals own school.
permit(
  principal is User when {
    principal.role == "teacher" &&
    resource.schoolId == principal.schoolId &&
    resource.class == principal.class
  },
  action in [Action::"log-day", Action::"read-daylog"],
  resource is Student
);
permit(
  principal is User when {
    principal.role == "principal" && resource.schoolId == principal.schoolId
  },
  action in [Action::"log-day", Action::"read-daylog"],
  resource is Student
);
permit(
  principal is User when {
    (principal.role == "parent" || principal.role == "student") &&
    resource.id in principal.children
  },
  action == Action::"read-daylog",
  resource is Student
);
permit(
  principal is User when {
    principal.role == "parent" && resource.id in principal.children
  },
  action == Action::"log-day",
  resource is Student
);

// General query: every authenticated role (answers use scoped data only).
permit(
  principal is User,
  action == Action::"query",
  resource
);
