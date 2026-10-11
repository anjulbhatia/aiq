// AIQ agent tool policies for the Strands CedarAuthorization intervention.
// Loaded file-based: CedarAuthorization(policies="app/authz/agent.cedar", ...)
// per https://strandsagents.com/docs/user-guide/sdk/agents/interventions/cedar-authorization/
// Session (context_enricher): role, school_id, class, children (list of ids).
// Tool args arrive as context.input. Default-deny: no permit = blocked + told.

permit(
  principal,
  action == Action::"read_briefing",
  resource
) when {
  context.session.role == "principal" &&
  context.input.school_id == context.session.school_id
};

permit(
  principal,
  action == Action::"read_class_roster",
  resource
) when {
  (context.session.role == "teacher" &&
    context.input.class == context.session.class &&
    context.input.school_id == context.session.school_id) ||
  (context.session.role == "principal" &&
    context.input.school_id == context.session.school_id)
};

permit(
  principal,
  action == Action::"read_child",
  resource
) when {
  (context.session.role == "teacher" &&
    context.input.class == context.session.class) ||
  ((context.session.role == "parent" || context.session.role == "student") &&
    context.session.children.contains(context.input.student_id)) ||
  context.session.role == "principal" ||
  context.session.role == "authority"
};

permit(
  principal,
  action == Action::"write_daylog",
  resource
) when {
  (context.session.role == "teacher" &&
    context.input.class == context.session.class) ||
  (context.session.role == "parent" &&
    context.session.children.contains(context.input.student_id))
};

permit(
  principal,
  action == Action::"publish_protocol",
  resource
) when {
  context.session.role == "principal" &&
  context.input.school_id == context.session.school_id
};

permit(
  principal,
  action == Action::"ask_question",
  resource
) when {
  context.session.role == "principal" ||
  context.session.role == "teacher" ||
  context.session.role == "parent" ||
  context.session.role == "student" ||
  context.session.role == "authority"
};
