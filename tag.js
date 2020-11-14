const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize");
// const sequelize = new Sequelize('database', 'username', 'password', {
//   dialect: 'sqlite',
//   storage: 'db/tag.sqlite',
// });
const sequelize = new Sequelize("sqlite::memory:");
const sequelizeInstance = require("sequelize-instance")

const Tag = sequelize.define('tag', { name: {type:DataTypes.STRING, unique:true, }});
const Human = sequelize.define('human', { name: DataTypes.STRING });
const HumanTag = sequelize.define('humanTag');
Tag.Human = Human.belongsToMany(Tag, { through: HumanTag });
Human.Tag = Tag.belongsToMany(Human, { through: HumanTag });

Tag.addScope('human',{
  include:Human,
})
Human.addScope('tag',{
  include:Tag,
})

async function main(){
  await HumanTag.sync({force:true})
  await Tag.sync({force:true})
  await Human.sync({force:true})
  await Human.findOrCreate({
    where:{
      name:'설인',
    },
    defaults:{
      name:'설인',
    }
  })
  await Tag.findOrCreate({
    where:{
      name:'아침',
    },
    defaults:{
      name:'아침',
    }
  })
  const human = await Human.findOne({
    where:{
      name:'설인',
    },
  })
  const tag = await Tag.findOne({
    where:{
      name:'아침',
    },
  })
  await human.addTags(tag) // tagging
  // const h = await Tag.scope('human').findAll()
  // sequelizeInstance.view(h)
  return await Human.scope('tag').findAll()
}

main()
.then(sequelizeInstance.view)
.catch(e=>{
  console.error(e)
})
.finally(()=>{
  sequelize.close()
  .then(()=>{
    console.log('db disconnected')
  })
  .catch(e=>{
    console.error(e)
  });
});
