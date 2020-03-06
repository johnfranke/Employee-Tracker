const inquirer = require("inquirer");
var mysql = require("mysql");

//setting up sql server
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "johnfranke",
    database: "employee_db",
  });

//set max listeners so a node error won't show after a 11
require('events').EventEmitter.defaultMaxListeners = 9999;

//initial prompt. Moves user to a number of different actions.
var promptStart = function () {
    inquirer.prompt(
    [
        {
            type: "list",
            message: "What would you like to do?:",
            choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department', 'Add Role', 'Add Employee', 
            'Update Employee Role', 'Exit'],
            name: "nextSection"
        },
    ]
    ).then(
        function(answers) {
            if (answers.nextSection === "View Departments") {
                console.log("\n-----------------------------------");
                console.log("Current Departments:");
                connection.query(
                    "SELECT * FROM departments" , function(err, res) {
                        if (err) throw err;
                        for (var i = 0; i < res.length; i++) {
                            console.log(
                                res[i].id +
                                " | " +
                                res[i].dep_name
                            )
                        }
                    console.log("-----------------------------------\n");
                    promptStart();
                    }
                );
            };
            if (answers.nextSection === "View Roles") {
                console.log("\n-----------------------------------");
                console.log("Current Roles:");
                connection.query(
                    "SELECT * FROM roles" , function(err, res) {
                        if (err) throw err;
                        for (var i = 0; i < res.length; i++) {
                            console.log(
                                res[i].id +
                                " | " +
                                res[i].role_name +
                                " | Salary: $" +
                                res[i].role_salary 
                            )
                        }
                    console.log("-----------------------------------\n");
                    promptStart();
                    }
                );
            };
            if (answers.nextSection === "View Employees") {
                console.log("\n-----------------------------------");
                console.log("Current Employees:");
                connection.query(
                    "SELECT * FROM employees" , function(err, res) {
                        if (err) throw err;
                        for (var i = 0; i < res.length; i++) {
                            console.log(
                                res[i].id +
                                " | " +
                                res[i].first_name +
                                " " +
                                res[i].last_name 
                            )
                        }
                    console.log("-----------------------------------\n");
                    promptStart();
                    }
                );
            };
            if (answers.nextSection === "Add Department") {
                newDepartmentPrompt();
            }
            if (answers.nextSection === "Add Role") {
                newRolePrompt();
            }
            if (answers.nextSection === "Add Employee") {
                newEmployeePrompt();
            }
            if (answers.nextSection === "Update Employee Role") {
                updateRole();
            }
            if (answers.nextSection === "Exit") {
                connection.end();
            }
        }        
    );
}
promptStart();

//Adds new department information based on user prompts.
var newDepartmentPrompt = function () {
    inquirer.prompt(
    [
        {
            message: "Please enter new department name:",
            name: "departmentName"
        },
    ]
    ).then (
        function (answers) {
            newdep = answers.departmentName;
            console.log("\n-----------------------------------");
            console.log("Adding new department...");
            connection.query(
                "INSERT INTO departments SET ?",
                {dep_name: newdep},
            function(err) {
                if (err) throw err;
                console.log(newdep + " department added!");
                console.log("-----------------------------------\n");
                promptStart();
            })
        }
    )    
}

//Adds new roles to new department.
var newRolePrompt = function () {
    connection.query('SELECT * FROM departments', function (err, res) {
        if (err) throw err;
        inquirer.prompt(
            [
                {
                    message: 'Please enter new role name:',
                    name: 'newrole'
                },
                {
                    message: 'Please enter new role salary (annual number):',
                    name: 'salary'
                },
                {
                    type: "list",
                    choices: function() {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].dep_name);
                        }
                        return choiceArray;
                    },
                    message: "Please choose role department:",
                    name: "depid",
                },
            ]
        ).then(
            function (answers) {
                var newrl = answers.newrole;
                console.log("\n-----------------------------------");
                console.log("Adding new role...");
                connection.query(
                    `INSERT INTO roles (role_name, role_salary, dep_id)
                    VALUES ('${answers.newrole}', '${answers.salary}', (SELECT id FROM departments WHERE dep_name = '${answers.depid}'))`,
                    function(err) {
                        if (err) throw err;
                        console.log(newrl + " added!");
                        console.log("-----------------------------------\n");
                        promptStart();
                    })
                }
        )
    })
}

//Adds new employee information based on user prompts.
var newEmployeePrompt = function () {
    connection.query('SELECT * FROM roles', function (err, res) {
        if (err) throw err;
        inquirer.prompt(
            [
                {
                    message: "Please enter employee first name:",
                    name: 'employeeFirstName'
                },
                {
                    message: 'Please enter employee last name:',
                    name: 'employeeLastName'
                },
                {
                    type: "list",
                    choices: function() {
                      var choiceArray = [];
                      for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].role_name);
                      }
                      return choiceArray;
                    },
                    message: "Please choose employee role:",
                    name: "roleid",
                },
            ]
        ).then(
            function (answers) {
                newemp = answers.employeeFirstName;
                console.log("\n-----------------------------------");
                console.log("Adding new employee...");
                connection.query(
                    `INSERT INTO employees (first_name, last_name, role_id)
                    VALUES ('${answers.employeeFirstName}', '${answers.employeeLastName}', (SELECT id FROM roles WHERE role_name = '${answers.roleid}'))`,
                    function(err) {
                        if (err) throw err;
                        console.log(newemp + " has been added to current employees!");
                        console.log("-----------------------------------\n");
                        promptStart();
                    })
            }
        )
    })
}

//Updates chosen employee role
var updateRole = function () {
    connection.query('SELECT * FROM employees', function (err, res) {
        if (err) throw err;
        inquirer.prompt(
            [
                {
                    type: "list",
                    choices: function() {
                      var choiceArray = [];
                      for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].id + ". " + res[i].first_name + " " + res[i].last_name);
                      }
                      return choiceArray;
                    },
                    message: "Please choose employee to update:",
                    name: "employeeid",
                },
            ]
            ).then( 
                function (answer) {
                    var empstr = answer.employeeid;
                    connection.query("SELECT * FROM roles", function (err, res) {
                        if (err) throw err;
                        inquirer.prompt(
                            [
                                {
                                    type: "list",
                                    choices: function() {
                                      var choiceArray = [];
                                      for (var i = 0; i < res.length; i++) {
                                        choiceArray.push(res[i].id + ". " + res[i].role_name );
                                      }
                                      return choiceArray;
                                    },
                                    message: "Please choose role to update to:",
                                    name: "roleid",
                                },
                            ]
                        ).then(
                            function (answers) {
                                var rolestr = answers.roleid;
                                var rolenum = rolestr.charAt(0);
                                var empnum = empstr.charAt(0);
                                parseInt(rolenum);
                                parseInt(empnum);
                                console.log(empnum);
                                console.log("\n-----------------------------------");
                                console.log("Updating employee...");
                                connection.query(
                                    `UPDATE employees 
                                    SET role_id = ${rolenum}
                                    WHERE id = ${empnum}`,
                                    function(err) {
                                        if (err) throw err;
                                        console.log("Employee role updated!");
                                        console.log("-----------------------------------\n");
                                        promptStart();
                                    })
                            }
                        )
                    })
                }
            )
    })
}