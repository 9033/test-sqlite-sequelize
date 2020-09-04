const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

class User extends Model {
  getFullname() {
    return [this.firstName, this.lastName].join(' ');
  }
  plain(){
    return this.get({plain:true})
  }
}

User.init({
  // Model attributes are defined here
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    defaultValue: '쿤'
    // allowNull defaults to true
  },
  age: {
    type: DataTypes.VIRTUAL,
    get() {
      return (new Date()).getFullYear() - this.birthyear
    },
    set(value) {
      // throw new Error('Do not try to set the `age` value!');
      this.setDataValue('birthyear', (new Date()).getFullYear() - value)
    }
  },
  cash: {
    type: DataTypes.INTEGER,
    defaultValue: 0
    // allowNull defaults to true
  },
  // password:{
  //   type: DataTypes.STRING,
  //   set(value){
  //     this.setDataValue('password', hash(value))
  //   }
  // }
  birthyear:{
    type: DataTypes.INTEGER,
    defaultValue: 2000,
    validate: {
      isInt:true,
      isNice(value){
        if(false){
          throw new Error(value)
        }
      }
    },
  }
}, {
  getterMethods:{
    fullName(){
      return `${this.firstName} ${this.lastName}`;
    }
  },
  setterMethods:{
    fullName(value){
      const names = value.split(' ')
      this.setDataValue('firstName', names[0])
      this.setDataValue('lastName', names[1])
    }
  },
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'User' // We need to choose the model name
});

const listUp = async(where = {})=>{
  const r = await User.findAll({
    where,
  })
  r.forEach(v=>{
    // console.log(v)
    // console.log(v.getFullname())
    console.log(v.fullName)
    // console.log(v.plain())
  })
  // console.log(JSON.stringify(r,null,2))
}

const main = async ()=>{
  await User.sync()
  const user_no1 = await User.create({
    firstName:'뜨엌',
  })
  await User.create({
    firstName:'두억',
    cash:100000,
  },{ fields:['firstName']})
  await User.bulkCreate([
    {
      firstName:'턱',
    },
    {
      firstName:'댕',
      lastName:'짱',
    },
  ])

  // create = build + save
  const jane = User.build({ firstName: "Jane" })
  console.log(jane.toJSON()) // then console.log(jane)
  // console.log(jane.fullName)

  jane.lastName = 'Star'
  console.log(jane.toJSON())

  await jane.save();// to db
  jane.lastName = 'Stars'
  console.log(jane.toJSON())

  await jane.reload();// from db
  console.log(jane.toJSON())

  jane.fullName = 'Try out'
  console.log(jane.toJSON())

  await listUp();

  console.info(' * 숫자 증가 감소')// 숫자 증가 감소
  console.log(user_no1.toJSON())
  // await user_no1.increment('age')
  user_no1.age = 50
  await user_no1.increment({
    cash: 100
  })
  await listUp({
    firstName: user_no1.firstName,
  });// age: 1
  console.log(user_no1.toJSON())// age: 0
  await user_no1.reload()
  console.log(user_no1.toJSON())// age: 1


  await listUp({
    [Op.or]:[
      { firstName:'두억'},
      { firstName:'뜨엌'},
    ]
  });
  await listUp({
    firstName:{
      [Op.or]: ['두억','뜨엌']
    }
  });

  // with functions
  await listUp(
    sequelize.where( sequelize.fn('length', sequelize.col('firstName')),1)
  );

  // Utility methods: count
  const cnt = await User.count({where:{}})
  console.log(cnt);
  // Utility methods: max, min
  const max_cash = await User.max('cash',{where:{}})
  console.log(max_cash)
  // Utility methods: sum  
  const sum_cash = await User.sum('cash',{where:{}})
  console.log(sum_cash)

  // close
  await sequelize.close();
}
main()
