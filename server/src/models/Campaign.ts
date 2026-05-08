import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Campaign extends Model {
  public id!: string;
  public name!: string;
  public message!: string;
  public status!: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  public totalRecipients!: number;
  public sentCount!: number;
  public deliveredCount!: number;
  public failedCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'completed', 'failed'),
      defaultValue: 'draft',
    },
    totalRecipients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    deliveredCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Campaign',
    tableName: 'campaigns',
  }
);

export default Campaign;
