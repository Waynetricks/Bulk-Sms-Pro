import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Message extends Model {
  public id!: string;
  public campaignId!: string;
  public phone!: string;
  public message!: string;
  public status!: 'queued' | 'sent' | 'delivered' | 'failed';
  public externalId?: string;
  public errorMessage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaignId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('queued', 'sent', 'delivered', 'failed'),
      defaultValue: 'queued',
    },
    externalId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    indexes: [
      { fields: ['campaignId'] },
      { fields: ['phone'] },
      { fields: ['status'] },
    ],
  }
);

export default Message;
