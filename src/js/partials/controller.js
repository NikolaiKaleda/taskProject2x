var taskProjectApp = angular.module('taskProjectApp', ['ngCookies']);




taskProjectApp.controller('TaskProjectCtrl', ['$scope', '$http', '$cookies', function ($scope, $http,$cookies) {
    $scope.showBlockProjects = false;
    $scope.showBlockTask = false;
    var sessionCookies = $cookies.get('session');
    //$scope.userAvatar;
    //$scope.userName;
    
      $scope.activeClass = function (id) {
        return id === $scope.activeProject ? 'active' : '';
    };   
    

    
    getSession  = function () {
        var returnCookie;
        $http({
              method: 'POST',
              url: 'https://api-test-task.decodeapps.io/signup'
            }).then(function successCallback(response) {
                $cookies.put('session', response.data.session);
                returnCookie = response.data.session;
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        return returnCookie;
    };
    
    getUser  = function (sessionCookies) {
        $http({
              method: 'GET',
              url: 'https://api-test-task.decodeapps.io/account?session='+sessionCookies,
            }).then(function successCallback(response) {
                console.log(response);
            $scope.userAvatar = response.data.Account.image_url;
             $scope.name = response.data.Account.username;
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };
    
    getProjects = function (sessionCookies,activeProjectSelected) {
        $http ({
            method: 'GET',
            url: 'https://api-test-task.decodeapps.io/projects?session=' + sessionCookies,
            }).then(function successCallback(response) {
                $scope.projects = response.data.projects;
                if(!activeProjectSelected)
                    {
                    $scope.activeProject = response.data.projects[0].Project.id;
                        console.log('active project');
                        console.log($scope.activeProject);
                    }
                getTasks(sessionCookies, $scope.activeProject, 20, 20, null);
                //$scope.preloader = {display: 'none'};
             }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
    };
    
    getTasks = function (sessionCookies, projectId, pagingSize, pagingOffset, conditionKeywords) {
        var url='https://api-test-task.decodeapps.io/tasks?session='+sessionCookies+'&project_id='+projectId+'&paging_size='+pagingSize+'&paging_offset='+pagingOffset;
        if(conditionKeywords!=null)
            {
                url = url +"&condition_keywords="+conditionKeywords;
            }
        $http({
            method: 'GET',
            url: url,
            }).then(function successCallback(response) {
             console.log(response);
            $scope.tasks = response.data.tasks;
            $scope.tasksCount = response.data.tasks.length;
            $scope.preloader = {display: 'none'};
             }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
    };
    
    compliteTask = function (sessionCookies, taskId) {
        $http({
            method: 'POST',
            url: 'https://api-test-task.decodeapps.io/tasks/task/complite',
            data: {
                "session": sessionCookies,
                "Task": {
                    "id": taskId,
                }
            }
        }).then(function successCallback(response) {
        console.log('compliteTask');
        console.log(response);
        if(response.status=200)
            {
                getTasks(sessionCookies, $scope.activeProject, 20, 20, null)
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    
    createTask = function (sessionCookies, projectId, taskTitle, taskDescription) {
        $http({
             method: 'POST',
            url: 'https://api-test-task.decodeapps.io/tasks/task',
            data: {
                "session": sessionCookies,
                "Project": {
                    "id": projectId
                },
                "Task": {
                    "title": taskTitle,
                    "description": taskDescription
                }
            }
        }).then(function successCallback(response) {
            console.log(response);
            if(response.status=201) {
                //getProjects(sessionCookies, true);
                var task = {
                    "Task": {
                        "id": response.data.Task.id,
                        "title": taskTitle,
                        "description": taskDescription
                    }
                };
                $scope.tasks.push(task);
                $scope.tasksCount = $scope.tasks.length;
                console.log("tasks:");
                console.log($scope.tasks);
            }
            //$cookies.put('session', response.data.session);
            //returnCookie = response.data.session;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    
    
    
    
    updateTask = function (sessionCookies, projectId, projectTitle) {
        $http({
             method: 'POST',
            url: 'https://api-test-task.decodeapps.io/projects/project',
            data: {
                "session": sessionCookies,
                "Project": {
                    "id": projectId,
                    "title": taskTitle
                }
            }
        }).then(function successCallback(response) {
            console.log(response);
            if(response.statusText="OK") {
                getProjects (sessionCookies,activeProjectSelected)
            }
            //$cookies.put('session', response.data.session);
            //returnCookie = response.data.session;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    
    
    
    /*updateTask = function (sessionCookies, projectId, projectTitle) {
        $http({
             method: 'POST',
            url: 'https://api-test-task.decodeapps.io/projects/project',
            data: {
                "session": sessionCookies,
                "Project": {
                    "id": projectId,
                    "title": taskTitle
                }
            }
        }).then(function successCallback(response) {
            console.log("updateTask");
            console.log(response);
            if(response.status=200) {
                getProjects (sessionCookies,activeProjectSelected) {
            }
            //$cookies.put('session', response.data.session);
            //returnCookie = response.data.session;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        }};
    )};*/
    
    
    
    $scope.search = function () {
        console.log($scope.searchKeyword);
        if ($scope.searchKeyword != null) {
            getTasks(sessionCookies, $scope.activeProject, 20, 20, $scope.searchKeyword);
        }
    }

    
    
    
    $scope.init = function () {
        var sessionCookies = $cookies.get('session');
        if (sessionCookies == undefined) {
            getSession();
        } 
        $scope.preloader = {display: 'block'};
        $http({
              method: 'GET',
              url: 'https://api-test-task.decodeapps.io/session?session='+sessionCookies,
             // data: { session: sessionCookies }
        }).then(function successCallback(response) {
            console.log(response);
            if(response.statusText=="OK"){
                getUser(sessionCookies);
                getProjects(sessionCookies, false);
            }
            else{
                var newSessionCookies = getSession();
                getUser(newSessionCookies);
                getProjects(sessionCookies, false);
            }
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    }
    
    
    $scope.openTasks = function (elemId) {
        var sessionCookies = $cookies.get('session');
        $scope.activeProject = elemId;
        getTasks(sessionCookies, $scope.activeProject, 20, 20, null);
    }
    
    $scope.addTask = function () {
        createTask(sessionCookies, $scope.activeProject, $scope.taskNameAdd, $scope.taskDescriptionAdd);
    }
    
    $scope.compliteTask = function (taskId) {
        compliteTask(sessionCookies, taskId);
    }
    
    
    
    $scope.openProjectPage = function () {
        $scope.showBlockProjects = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeProjectPage = function () {
        $scope.showBlockProjects = false;
        $scope.bgStyle = {opacity: '1'};
    }
    
    $scope.openTaskPage = function () {
        $scope.showBlockTask = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeTaskPage = function () {
        $scope.showBlockTask = false;
        $scope.bgStyle = {opacity: '1'};
    }
    
    $scope.updateTask = function () {
      //  updateTask(sessionCookies, $scope.activeProject, projectTitle) {
    }
}]);

