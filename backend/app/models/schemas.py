import uuid
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from app.core.enums import (
    RiskLevel, FeatureStatus, ProjectStatus,
    InterventionType, InterventionStatus, ScenarioType
)


# ─── Developer Schemas ────────────────────────────────────────────────────────

class DeveloperBase(BaseModel):
    github_username: str
    email: str
    cognitive_load: float = Field(default=0.0, ge=0.0, le=100.0)
    skills: dict[str, Any] = Field(default_factory=dict)
    burnout_risk: float = Field(default=0.0, ge=0.0, le=1.0)
    availability_score: float = Field(default=1.0, ge=0.0, le=1.0)


class DeveloperCreate(DeveloperBase):
    pass


class DeveloperUpdate(BaseModel):
    cognitive_load: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    skills: Optional[dict[str, Any]] = None
    burnout_risk: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    availability_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)


class DeveloperRead(DeveloperBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID


# ─── Project Schemas ──────────────────────────────────────────────────────────

class ProjectBase(BaseModel):
    name: str
    repo_url: str
    deadline: datetime
    status: ProjectStatus = ProjectStatus.ACTIVE


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID


# ─── Feature Schemas ──────────────────────────────────────────────────────────

class FeatureBase(BaseModel):
    title: str
    description: Optional[str] = None
    story_points: int = Field(default=0, ge=0)
    deadline: datetime
    status: FeatureStatus = FeatureStatus.ON_TRACK
    assigned_developer_id: Optional[uuid.UUID] = None


class FeatureCreate(FeatureBase):
    project_id: uuid.UUID


class FeatureUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    story_points: Optional[int] = Field(default=None, ge=0)
    deadline: Optional[datetime] = None
    status: Optional[FeatureStatus] = None
    assigned_developer_id: Optional[uuid.UUID] = None


class FeatureStatusUpdate(BaseModel):
    status: FeatureStatus


class FeatureRead(FeatureBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    current_risk_score: float
    created_at: datetime


class FeatureDetail(FeatureRead):
    assigned_developer: Optional[DeveloperRead] = None
    latest_risk_snapshot: Optional["RiskSnapshotRead"] = None


# ─── GitCommit Schemas ────────────────────────────────────────────────────────

class GitCommitBase(BaseModel):
    feature_id: uuid.UUID
    developer_id: uuid.UUID
    sha: str
    message: str
    timestamp: datetime
    files_changed: int = Field(default=0, ge=0)
    lines_added: int = Field(default=0, ge=0)
    lines_removed: int = Field(default=0, ge=0)
    complexity_score: float = Field(default=0.0, ge=0.0)
    is_overtime: bool = False
    hour_of_day: int = Field(ge=0, le=23)


class GitCommitCreate(GitCommitBase):
    pass


class GitCommitRead(GitCommitBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID


class BatchCommitIngest(BaseModel):
    commits: list[GitCommitCreate]


# ─── RiskSnapshot Schemas ─────────────────────────────────────────────────────

class RiskSnapshotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    feature_id: uuid.UUID
    timestamp: datetime
    risk_score: float
    risk_level: RiskLevel
    factors: list[str]
    velocity_trend: float
    complexity_trend: float
    predicted_delivery_date: Optional[datetime]
    confidence_score: float


class RiskTrajectoryPoint(BaseModel):
    date: datetime
    risk_score: float
    velocity: float
    complexity: float


class RiskHistoryResponse(BaseModel):
    feature_id: uuid.UUID
    trajectory: list[RiskTrajectoryPoint]


# ─── CodeOwnership Schemas ────────────────────────────────────────────────────

class CodeOwnershipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    developer_id: uuid.UUID
    file_path: str
    expertise_score: float
    last_commit_at: datetime
    commit_count: int


# ─── Intervention Schemas ─────────────────────────────────────────────────────

class InterventionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    feature_id: uuid.UUID
    type: InterventionType
    description: str
    confidence_score: float
    status: InterventionStatus
    suggested_developer_id: Optional[uuid.UUID]
    reasoning: Optional[str]
    expected_impact: dict[str, Any]
    created_at: datetime


class InterventionRejectRequest(BaseModel):
    reason: str


# ─── Simulation Schemas ───────────────────────────────────────────────────────

class CrisisSimulationRequest(BaseModel):
    feature_id: uuid.UUID
    scenario_type: ScenarioType
    params: dict[str, Any] = Field(default_factory=dict)


class InterventionSimulationRequest(BaseModel):
    feature_id: uuid.UUID
    intervention_type: InterventionType


class AffectedFeature(BaseModel):
    feature_id: uuid.UUID
    title: str
    estimated_delay_days: int
    current_risk_score: float


class CrisisSimulationResult(BaseModel):
    impact_score: float
    new_probability: float
    predicted_delay_days: int
    affected_features: list[AffectedFeature]
    mitigation_options: list[InterventionRead]


class InterventionSimulationResult(BaseModel):
    intervention_type: InterventionType
    predicted_risk_reduction: float
    new_probability_on_time: float
    estimated_effort_days: int
    reasoning: str


# ─── Webhook Schemas ──────────────────────────────────────────────────────────

class GitHubCommitAuthor(BaseModel):
    name: str
    email: str
    username: Optional[str] = None


class GitHubCommitPayload(BaseModel):
    id: str
    message: str
    timestamp: str
    author: GitHubCommitAuthor
    added: list[str] = Field(default_factory=list)
    removed: list[str] = Field(default_factory=list)
    modified: list[str] = Field(default_factory=list)


class GitHubPushPayload(BaseModel):
    ref: str
    before: str
    after: str
    repository: dict[str, Any]
    commits: list[GitHubCommitPayload] = Field(default_factory=list)
    pusher: dict[str, Any] = Field(default_factory=dict)


class WebhookIngestResponse(BaseModel):
    accepted: bool
    commits_queued: int
    message: str


# ─── Bus Factor Schemas ───────────────────────────────────────────────────────

class BusFactorResponse(BaseModel):
    bus_factor: int
    critical_files: list[str]
    single_points: list[str]


# ─── Generic Response Schemas ─────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    redis: str


class ErrorDetail(BaseModel):
    resource_type: str
    id: str
    message: str


# Resolve forward references
FeatureDetail.model_rebuild()
