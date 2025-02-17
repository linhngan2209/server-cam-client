const { Sequelize, DataTypes } = require('sequelize'); // Import Sequelize và DataTypes
require('dotenv').config(); // Đảm bảo biến môi trường được load

// Sử dụng đối tượng cấu hình
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',         // Sử dụng biến môi trường hoặc giá trị mặc định
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '22092002',
  database: process.env.DB_NAME || 'camera',
  dialect: 'mysql',
  port: process.env.DB_PORT || 3306,
  logging: false, // Tắt log nếu cần
});

// Kiểm tra kết nối cơ sở dữ liệu
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully!');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Đồng bộ hóa cơ sở dữ liệu
sequelize
  .sync({ alter: false }) // Không thay đổi cấu trúc bảng nếu không cần thiết
  .then(() => {
    console.log('Database synchronized successfully!');
  })
  .catch((err) => {
    console.error('Database synchronization failed:', err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import các models
db.user = require('./user.js')(sequelize, DataTypes);
db.param = require('./param.js')(sequelize, DataTypes);
db.received_messages = require('./received_messages.js')(sequelize, DataTypes);
db.hardware_status = require('./hardware_status.js')(sequelize, DataTypes);
db.hardware = require('./hardware.js')(sequelize, DataTypes);
db.user_hardware = require('./user_hardware.js')(sequelize, DataTypes);
db.camera = require('./camera.js')(sequelize, DataTypes);

// Thiết lập quan hệ giữa các models
db.hardware.hasMany(db.hardware_status, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });
db.hardware_status.belongsTo(db.hardware, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });

db.hardware.hasMany(db.param, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });
db.param.belongsTo(db.hardware, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });

db.hardware.hasMany(db.received_messages, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });
db.received_messages.belongsTo(db.hardware, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });

db.user.hasMany(db.user_hardware, { foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade' });
db.user_hardware.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade' });

db.hardware.hasMany(db.user_hardware, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });
db.user_hardware.belongsTo(db.hardware, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });

db.hardware.hasMany(db.camera, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });
db.camera.belongsTo(db.hardware, { foreignKey: 'hardware_id', onUpdate: 'cascade', onDelete: 'cascade' });

db.user.hasMany(db.param, { foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade' });
db.param.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade' });

module.exports = db;
