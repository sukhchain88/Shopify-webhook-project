import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface JobAttributes {
  id: number;
  type: string;
  payload: object;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'errorMessage'> {}

export class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: number;
  public type!: string;
  public payload!: object;
  public status!: 'pending' | 'processing' | 'completed' | 'failed';
  public attempts!: number;
  public maxAttempts!: number;
  public scheduledAt!: Date;
  public processedAt?: Date;
  public errorMessage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    indexes: [
      {
        fields: ['status', 'scheduledAt'],
      },
      {
        fields: ['type', 'status'],
      },
    ],
  }
); 