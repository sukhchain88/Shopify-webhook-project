import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

// Job attributes interface
export interface JobAttributes {
  id: number;
  queueName: string;
  jobId: string;
  jobName: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  priority: number;
  attempts: number;
  maxAttempts: number;
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

// Optional attributes for creation
export interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Job model class
export class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: number;
  public queueName!: string;
  public jobId!: string;
  public jobName!: string;
  public status!: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  public priority!: number;
  public attempts!: number;
  public maxAttempts!: number;
  public data!: any;
  public result?: any;
  public error?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public processedAt?: Date;
  public completedAt?: Date;
  public failedAt?: Date;

  // Instance methods
  public async markAsActive(): Promise<void> {
    this.status = 'active';
    this.processedAt = new Date();
    await this.save();
  }

  public async markAsCompleted(result?: any): Promise<void> {
    this.status = 'completed';
    this.result = result;
    this.completedAt = new Date();
    await this.save();
  }

  public async markAsFailed(error: string): Promise<void> {
    this.status = 'failed';
    this.error = error;
    this.failedAt = new Date();
    this.attempts += 1;
    await this.save();
  }
}

// Initialize the model
Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    queueName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'queue_name',
    },
    jobId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'job_id',
    },
    jobName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'job_name',
    },
    status: {
      type: DataTypes.ENUM('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
      allowNull: false,
      defaultValue: 'waiting',
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      field: 'max_attempts',
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    result: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'processed_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'failed_at',
    },
  },
  {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['queue_name'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['job_name'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
); 