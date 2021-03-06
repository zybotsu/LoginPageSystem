const Sequelize = require('sequelize');

var sequelize = new Sequelize('danje1mhbk3hao', 'turqcqnvbfsayk', 'c4ec2c9da223231ab7b71e5a3d8de6f16dec88da77844e3e4d8ed952fa58057a', {
    host: 'ec2-184-73-199-72.compute-1.amazonaws.com', //host
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((err) => {
    console.log('Unable to connect to the database:', err);
});

// Creating Data Models
const Employee = sequelize.define('Employee',{
    employeeNum:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addresCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    matritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
    }, {
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
});

const Department = sequelize.define('Department',{
    departmentId:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
    }, {
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
});

module.exports.initialize = () => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("===  data-service initialize function    ===");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then((Employee) => {
            resolve();
        }).then((Department) => {
            resolve();
        }).catch((err) => {
            reject("unable to sync the database");
        });
        reject();
    });
};

module.exports.getAllEmployees = () => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("== data-service getAllEmployees function  ==");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll());
        }).catch((err) => {
            reject("no results returned.");
        });
    });
};

module.exports.getEmployeesByStatus = (status) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("  data-service getEmployeesByStatus function");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    status: status
                }}));
        }).catch((err) => {
            reject("no results returned.");
        });
    });
};

module.exports.getEmployeesByDepartment = (department) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("data-service getEmployeesByDepartment function");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    department: department
            }}));
        }).catch((err) => {
            reject("no results returned.");
        });
    });
};

module.exports.getEmployeesByManager = (manager) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("  data-service getEmployeesByStatus function");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    employeeManagerNum: manager
                }
            }));
            }).catch((err) => {
                reject("no results returned.");
        });
    });
};

module.exports.getEmployeeByNum = (num) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("=== data-service getEmployeeByNum function =");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    employeeNum: num
                }
            }));
            }).catch((err) => {
                reject("no results returned.");
        });
    });
}

module.exports.getManagers = () => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("=== data-service getManagers function    ===");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    isManager: true
                }})
            );
        }).catch((err) => {
            reject("no results returned.")
        });
    });
};

module.exports.getDepartments = () => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("=== data-service getDepartments function ===");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Department.findAll());
        }).catch((err) => {
            reject("no results returned.");
        });
    });
};

module.exports.addEmployee = (employeeData) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("=== data-service addEmployee function    ===");
    console.log("===                                      ===");
    console.log("============================================");
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for (let x in employeeData) {
                if(employeeData[x] == ""){
                    employeeData[x] = null;
                }
            }
            resolve(Employee.create({
                employeeNum: employeeData.employeeNum,
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                isManager: employeeData.isManager,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate}));
            }).catch(() => {
                reject("unable to create employee.");
            });
        }).catch(() => {
            reject("unable to create employee.");
    });
};

module.exports.updateEmployee = (employeeData) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("=== data-service updateEmployee function ===");
    console.log("===                                      ===");
    console.log("============================================");
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for (let x in employeeData) {
                if(employeeData[x] == ""){
                    employeeData[x] = null;
                }
            }
            resolve(Employee.update({
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                addressPostal: employeeData.addressPostal,
                addressState: employeeData.addressPostal,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department
            }, { where: {
                employeeNum: employeeData.employeeNum
            }}));
        }).catch(() => {
            reject("unable to create employee.");
        });
    });
};

module.exports.addDepartment = (departmentData) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("=== data-service addDepartment function  ===");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for(let x in departmentData){
                if(departmentData[x] == "") {
                    departmentData[x] = null;
                }
            }
            Department.create({
                departmentId: departmentData.departmentId,
                departmentName: departmentData.departmentName
            }).then(() => {
                resolve(Department);
            }).catch((err) => {
                reject("unable to create department.");
            });
        }).catch(() => {
            reject("unable to create department.");
        });
    });
};

module.exports.updateDepartment = (departmentData) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("=== data-service updateDepartment function =");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for(let x in departmentData){
                if(departmentData[x] == "") {
                    departmentData[x] = null;
                }
            }
            Department.update({
                departmentName: departmentData.departmentName
            }, { where: {
                departmentId: departmentData.departmentId
            }}).then(() =>{
                resolve(Department);
            }).catch((err) => {
                reject("unable to create department.");
            });
        }).catch(() => {
            reject("unable to create department.");
        });
    });
};

module.exports.getDepartmentById = (id) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("== data-service getDepartmentById function =");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Department.findAll({
                where:{
                    departmentId: id
                }}));
        }).catch((err) => {
            reject("unable to find department");
        });
    });
};

module.exports.deleteEmployeeByNum = (empNum) =>{
    console.log("============================================");
    console.log("===                                      ===");
    console.log(" data-service deleteEmployeeByNum function =");
    console.log("===                                      ===");
    console.log("============================================");
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.destroy({
                where:{
                    employeeNum: empNum
                }}));
        }).catch((err) => {
            reject();
        });
    });
};
