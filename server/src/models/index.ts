import Contact from './Contact';
import Group from './Group';
import Campaign from './Campaign';
import Message from './Message';

// Define relationships
Group.hasMany(Contact, { foreignKey: 'groupId', as: 'contacts' });
Contact.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

Campaign.hasMany(Message, { foreignKey: 'campaignId', as: 'messages' });
Message.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });

export { Contact, Group, Campaign, Message };
