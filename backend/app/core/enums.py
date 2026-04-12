from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FeatureStatus(str, Enum):
    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    CRITICAL = "critical"
    FAILED = "failed"


class ProjectStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class InterventionType(str, Enum):
    PAIR_PROGRAMMING = "pair_programming"
    SCOPE_REDUCTION = "scope_reduction"
    REASSIGN = "reassign"
    EXTEND_TIMELINE = "extend_timeline"
    KNOWLEDGE_TRANSFER = "knowledge_transfer"


class InterventionStatus(str, Enum):
    SUGGESTED = "suggested"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ScenarioType(str, Enum):
    DEVELOPER_LEAVE = "developer_leave"
    SCOPE_CREEP = "scope_creep"
    DEADLINE_CHANGE = "deadline_change"
