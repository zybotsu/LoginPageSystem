
var express = require("express");
var gulp = require("gulp");
var app = express();
var path = require("path");
var data_service = require("./data-service.js");
var dataServiceAuth = require("./data-service-auth");
const chalk = require('chalk');
const dataServiceComments = require("./data-service-comments.js");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const clientSessions = require("client-sessions");

var HTTP_PORT = process.env.PORT || 8080;

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

const user = {
  username: ""
};

// Load CSS file
app.use(express.static('public'));

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "A7_web322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(HTTP_PORT, function onHttpStart() {
    console.log(chalk.yellow("==========    System is running   =========="));
    console.log(chalk.yellow("===                                      ==="));
    console.log(chalk.yellow("== Express http server listening on: " + HTTP_PORT + " =="));
    console.log(chalk.yellow("===                                      ==="));
    console.log(chalk.yellow("============================================"));
    return new Promise((res, req) => {
        //   console.log(chalk.yellow("++++++++++++++"+req.session.user));
        data_service.initialize().then(()=> {
            console.log("============================================");
            console.log("Now can connect to the dataService.js!!!!!!");
            console.log("============================================");
        }).catch((err) => {
            console.log(err);
        });
        dataServiceComments.initialize().then().then(() => {
                console.log("\n");
                console.log(chalk.green("====================================================================="));
                console.log(chalk.green(">>> Call initialize Suceess!!! where from data-service-comment.js <<<"));
                console.log(chalk.green("====================================================================="));
                console.log("\n");
           }).catch((err) => {
               console.log(err);
            });
        dataServiceAuth.initialize().then(() => {
            console.log("\n");
            console.log(chalk.green("====================================================================="));
            console.log(chalk.green(">>> Call initialize Suceess!!! where from data-service-auth.js    <<<"));
            console.log(chalk.green("====================================================================="));
            console.log("\n");
           }).catch((err) => {
               console.log(err);
            });
        }).catch(()=> {
            console.log("unable to start dataService");
    });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: 'layout',
    helpers: {
        equal: (lvalue, rvalue, options) => {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

/////////////////////////////////////Get Route //////////////////////////////////

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", (req, res) => {
    res.render("home", {user: req.session.user});
});

// setup another route to listen on /about
app.get("/about", (req, res) => {
    dataServiceComments.getAllComments().then((dataFromPromise) => {
        res.render("about", {data: dataFromPromise, user: req.session.user});
    }).catch(() => {
        res.render("about");
    });
});

app.get("/employees", ensureLogin,(req, res) => {
    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status).then((data) => {
            res.render("employeeList", { data: data, title: "Employees", user: req.session.user});
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees" });
        });
    } else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department).then((data) => {
            res.render("employeeList", { data: data, title: "Employees", user: req.session.user});
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees" });
        });
    } else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager).then((data) => {
            res.render("employeeList", { data: data, title: "Employees", user: req.session.user});
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees" });
        });
    } else {
        data_service.getAllEmployees().then((data) => {
            res.render("employeeList", { data: data, title: "Employees", user: req.session.user});
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees"});
        });
    }
});

app.get("/employee/:empNum", ensureLogin,(req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data_service.getEmployeeByNum(req.params.empNum).then((data) => {
        viewData.data = data; //store employee data in the "viewData" object as "data"
    }).catch(() => {
        viewData.data = null; // set employee to null if there was an error
    }).then(data_service.getDepartments).then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
                                     // loop through viewData.departments and once we have found the departmentId that matches
                                     // the employee's "department" value, add a "selected" property to the matching
                                     // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.data[0].department) {
                viewData.departments[i].selected = true;
            }
        }
        // if not add department set Selected to false and promto a message to user, message like "Please Choose Department" in html.
        if (viewData.departments[viewData.departments.length-1].departmentId != viewData.data[0].department) {
            viewData.departments.Selected = false;
        }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.data == null){ // if no employee - return an error
            res.status(404).send("Employee Not Found!!!");
        } else {
            res.render("employee", { viewData: viewData, user: req.session.user}); // render the "employee" view
        }
    });
});

app.get("/managers", ensureLogin,(req, res) => {
    data_service.getManagers().then((data) => {
        //res.render("dashboard", {user: req.session.user});
        res.render("employeeList", { data: data, title: "Employees (Managers)", user: req.session.user});
    }).catch((err) => {
        res.render("employeeList", { data: {}, title: "Employees (Managers)" });
    });
});

app.get("/departments",ensureLogin, (req, res) => {
    data_service.getDepartments().then((data) => {
        res.render("departmentList", { data: data, user: req.session.user, title: "Departments"});
    }).catch((err) => {
        res.render("departmentList", { data: {}, title: "Departments" });
    });
});

app.get("/employees/add",ensureLogin, (req, res) => {
    data_service.getDepartments().then((data) => {
        res.render("addEmployee",{departments: data, user: req.session.user});
    }).catch((err) => {
        res.render("addEmployee", {departments: []});
    });
});

app.get("/departments/add",ensureLogin, (req, res) => {
    res.render("addDepartment",{title: "Department", user: req.session.user});
});

app.get("/employee/delete/:empNum", ensureLogin,(req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/department/:departmentId",ensureLogin, (req, res) => {
    data_service.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department", {
           data: data, user: req.session.user
        });
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

/////////////////////////////////////Post Route /////////////////////////////////

app.post("/employees/add",ensureLogin, (req, res) => {
    data_service.addEmployee(req.body).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/employees/update",ensureLogin, (req, res) => {
    res.redirect("/employees");
});

app.post("/employee/update", ensureLogin,(req, res) => {
    data_service.updateEmployee(req.body).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/departments/add",ensureLogin, (req, res) => {
    data_service.addDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch(() => {
        console.log(err);
    });
});

app.post("/department/update",ensureLogin, (req,res) => {
    data_service.updateDepartment(req.body).then((data) => {
        res.redirect("/departments");
    });
});

app.post("/about/addComment", (req, res) => {
    dataServiceComments.addComment(req.body).then((data) => {
        res.redirect("/about");
    }).catch(() => {
        res.reject("error to the console");
        res.redirect("/about");
    });
});

app.post("/about/addReply", (req, res) => {
    dataServiceComments.addReply(req.body).then((data) => {
        res.redirect("/about");
    }).catch((err) => {
        reject("error to the console");
        redirect("/about");
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {
        res.render("register", {successMessage: "User created"});
    }).catch((err) => {
        res.render("register", {errorMessage: err, user: req.body.user});
    });
});

app.post("/login", (req, res) => {
    dataServiceAuth.checkUser(req.body).then(() => {
        const username = req.body.user;
        // console.log(chalk.bgGreen(JSON.stringify(req.body.user)));
        req.session.user = {
            username: username
        };
        console.log(chalk.bgGreen(JSON.stringify(req.session)));
        res.redirect("/employees");
    }).catch((err) => {
        // res.send(22222222222222222);
        res.render("login", {errorMessage: err, user: req.body.user});
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect('/');
});

// error 404 always put last
app.use((req, res) => {
    res.status(404).send("Sorry!!!!!!!>>>Page Not Found! <<<:(");
});

///////////////////////////////////////////////////////////////////