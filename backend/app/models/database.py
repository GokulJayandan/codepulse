import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String, Float, Integer, Boolean, Text, DateTime,
    ForeignKey, UniqueConstraint, Index, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class Developer(Base):
    __tablename__ = "developers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_username: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    cognitive_load: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0-100
    skills: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    burnout_risk: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    availability_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)  # 0-1

    # Relationships
    commits: Mapped[list["GitCommit"]] = relationship("GitCommit", back_populates="developer", cascade="all, delete-orphan")
    ownership_records: Mapped[list["CodeOwnership"]] = relationship("CodeOwnership", back_populates="developer", cascade="all, delete-orphan")
    assigned_features: Mapped[list["Feature"]] = relationship("Feature", back_populates="assigned_developer", foreign_keys="Feature.assigned_developer_id")
    suggested_interventions: Mapped[list["Intervention"]] = relationship("Intervention", back_populates="suggested_developer", foreign_keys="Intervention.suggested_developer_id")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    repo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("active", "archived", name="project_status_enum"),
        default="active",
        nullable=False
    )

    # Relationships
    features: Mapped[list["Feature"]] = relationship("Feature", back_populates="project", cascade="all, delete-orphan")


class Feature(Base):
    __tablename__ = "features"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    story_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("on_track", "at_risk", "critical", "failed", name="feature_status_enum"),
        default="on_track",
        nullable=False
    )
    current_risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0-1
    assigned_developer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("developers.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="features")
    assigned_developer: Mapped[Optional["Developer"]] = relationship("Developer", back_populates="assigned_features", foreign_keys=[assigned_developer_id])
    commits: Mapped[list["GitCommit"]] = relationship("GitCommit", back_populates="feature", cascade="all, delete-orphan")
    risk_snapshots: Mapped[list["RiskSnapshot"]] = relationship("RiskSnapshot", back_populates="feature", cascade="all, delete-orphan")
    interventions: Mapped[list["Intervention"]] = relationship("Intervention", back_populates="feature", cascade="all, delete-orphan")


class GitCommit(Base):
    __tablename__ = "git_commits"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("features.id", ondelete="CASCADE"), nullable=False, index=True)
    developer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    sha: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    files_changed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lines_added: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lines_removed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    complexity_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_overtime: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    hour_of_day: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    feature: Mapped["Feature"] = relationship("Feature", back_populates="commits")
    developer: Mapped["Developer"] = relationship("Developer", back_populates="commits")

    __table_args__ = (
        Index("ix_git_commits_feature_timestamp", "feature_id", "timestamp"),
    )


class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("features.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(
        SAEnum("low", "medium", "high", "critical", name="risk_level_enum"),
        nullable=False
    )
    factors: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    velocity_trend: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    complexity_trend: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    predicted_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Relationships
    feature: Mapped["Feature"] = relationship("Feature", back_populates="risk_snapshots")


class CodeOwnership(Base):
    __tablename__ = "code_ownership"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    developer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    expertise_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0-1
    last_commit_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    commit_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    developer: Mapped["Developer"] = relationship("Developer", back_populates="ownership_records")

    __table_args__ = (
        UniqueConstraint("developer_id", "file_path", name="uq_developer_file"),
        Index("ix_code_ownership_developer", "developer_id"),
        Index("ix_code_ownership_file_path", "file_path"),
    )


class Intervention(Base):
    __tablename__ = "interventions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("features.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(
        SAEnum("pair_programming", "scope_reduction", "reassign", "extend_timeline", "knowledge_transfer", name="intervention_type_enum"),
        nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-1
    status: Mapped[str] = mapped_column(
        SAEnum("suggested", "accepted", "rejected", "completed", name="intervention_status_enum"),
        default="suggested",
        nullable=False
    )
    suggested_developer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("developers.id", ondelete="SET NULL"), nullable=True)
    reasoning: Mapped[str] = mapped_column(Text, nullable=True)
    expected_impact: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    feature: Mapped["Feature"] = relationship("Feature", back_populates="interventions")
    suggested_developer: Mapped[Optional["Developer"]] = relationship("Developer", back_populates="suggested_interventions", foreign_keys=[suggested_developer_id])
